import { NextRequest, NextResponse } from "next/server";
import { verifyToken, signToken } from "@/lib/auth/jwt";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { UserProfile, UserRole } from "@/lib/types";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("glimglee_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const tokenUser = verifyToken(token);
  if (!tokenUser || !tokenUser.email) {
    return NextResponse.json({ user: null });
  }

  let finalUser: UserProfile = tokenUser;

  // Always sync with latest MongoDB record if configured
  if (isMongoConfigured) {
    try {
      const db = await getDb();
      const dbUser = await db.collection("users").findOne({
        email: { $regex: new RegExp(`^${tokenUser.email.trim()}$`, "i") },
      });

      if (dbUser) {
        finalUser = {
          uid: dbUser.uid || tokenUser.uid,
          email: dbUser.email,
          displayName: dbUser.displayName || tokenUser.displayName,
          role: (dbUser.role as UserRole) || "CUSTOMER",
          totalOrders: dbUser.totalOrders || 0,
          totalSpend: dbUser.totalSpend || 0,
          status: dbUser.status || "active",
          createdAt: dbUser.createdAt || new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn("Could not sync user from MongoDB in /api/auth/me:", e);
    }
  }

  const response = NextResponse.json({ user: finalUser });

  // If the role in MongoDB changed from what was stored in the JWT cookie, refresh the token cookie
  if (finalUser.role !== tokenUser.role) {
    const refreshedToken = signToken(finalUser);
    response.cookies.set("glimglee_token", refreshedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  return response;
}
