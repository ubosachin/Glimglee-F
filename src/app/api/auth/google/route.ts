import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { signToken } from "@/lib/auth/jwt";
import { UserProfile, UserRole } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json(
        { error: "Google credential token is required" },
        { status: 400 }
      );
    }

    // Verify token with Google's tokeninfo API
    let payload: {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
      email_verified?: boolean | string;
    };

    try {
      const googleRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );

      if (!googleRes.ok) {
        throw new Error("Failed to verify Google ID token");
      }

      payload = await googleRes.json();
    } catch (e: any) {
      console.error("Google token verification failed:", e);
      return NextResponse.json(
        { error: "Invalid Google credential" },
        { status: 401 }
      );
    }

    const email = (payload.email || "").toLowerCase().trim();
    if (!email) {
      return NextResponse.json(
        { error: "No email associated with this Google account" },
        { status: 400 }
      );
    }

    let role: UserRole = "CUSTOMER";
    let existingUser = null;

    // Connect to MongoDB if configured
    if (isMongoConfigured) {
      try {
        const db = await getDb();
        const usersCol = db.collection("users");

        existingUser = await usersCol.findOne({
          email: { $regex: new RegExp(`^${email.trim()}$`, "i") },
        });

        if (existingUser) {
          // DATABASE IS SINGLE SOURCE OF TRUTH:
          // Use whatever role is assigned to this user in MongoDB Atlas (ADMIN or CUSTOMER)
          const rawRole = String(existingUser.role || "").toUpperCase().trim();
          role = rawRole === "ADMIN" || rawRole === "SUPER_ADMIN" ? "ADMIN" : "CUSTOMER";

          await usersCol.updateOne(
            { _id: existingUser._id },
            {
              $set: {
                displayName: payload.name || existingUser.displayName,
                photoURL: payload.picture || existingUser.photoURL,
                lastLoginAt: new Date().toISOString(),
              },
            }
          );
        } else {
          // New user defaults to CUSTOMER
          role = "CUSTOMER";
          // Create new user in MongoDB
          await usersCol.insertOne({
            uid: payload.sub,
            email,
            displayName: payload.name || email.split("@")[0],
            photoURL: payload.picture,
            role,
            totalOrders: 0,
            totalSpend: 0,
            status: "active",
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          });
        }
      } catch (dbErr) {
        console.warn("MongoDB connection warning during Google auth:", dbErr);
      }
    }

    const userProfile: UserProfile = {
      uid: payload.sub,
      email,
      displayName: payload.name || email.split("@")[0],
      role,
      totalOrders: existingUser?.totalOrders || 0,
      totalSpend: existingUser?.totalSpend || 0,
      status: "active",
      createdAt: existingUser?.createdAt || new Date().toISOString(),
    };

    // Sign session token
    const token = signToken(userProfile);

    const response = NextResponse.json({
      success: true,
      user: userProfile,
    });

    // Set secure HTTP-only cookie
    response.cookies.set("glimglee_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Google Auth API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal authentication error" },
      { status: 500 }
    );
  }
}
