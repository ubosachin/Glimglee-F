import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { verifyToken } from "@/lib/auth/jwt";
import { UserProfile, UserRole } from "@/lib/types";

// Helper: Ensure requester is an authenticated Admin
async function getAdminUser(req: NextRequest): Promise<UserProfile | null> {
  const token = req.cookies.get("glimglee_token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || !decoded.email) return null;

  if (isMongoConfigured) {
    try {
      const db = await getDb();
      const dbUser = await db.collection("users").findOne({
        email: { $regex: new RegExp(`^${decoded.email.trim()}$`, "i") },
      });
      if (dbUser) {
        const rawRole = String(dbUser.role || "").toUpperCase().trim();
        if (rawRole === "ADMIN" || rawRole === "SUPER_ADMIN") {
          return {
            uid: dbUser.uid || decoded.uid,
            email: dbUser.email,
            displayName: dbUser.displayName || decoded.displayName,
            role: "ADMIN",
            totalOrders: dbUser.totalOrders || 0,
            totalSpend: dbUser.totalSpend || 0,
            status: dbUser.status || "active",
            createdAt: dbUser.createdAt || new Date().toISOString(),
          };
        }
      }
    } catch (e) {
      console.warn("getAdminUser check error:", e);
    }
  }

  if (decoded.role === "ADMIN") return decoded;
  return null;
}

// 1. GET /api/admin/users - List all users & buyers
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    if (!isMongoConfigured) {
      return NextResponse.json({ users: [] });
    }

    const db = await getDb();
    const usersCol = db.collection("users");
    const ordersCol = db.collection("orders");

    // Fetch registered users
    const registeredUsers = await usersCol.find({}).sort({ createdAt: -1 }).toArray();

    // Fetch all orders to aggregate customer spending & order count
    const orders = await ordersCol.find({}).project({
      customerEmail: 1,
      customerName: 1,
      customerPhone: 1,
      shippingAddress: 1,
      total: 1,
      createdAt: 1,
      userId: 1,
    }).toArray();

    // Map email -> order aggregation
    const orderAgg = new Map<string, {
      count: number;
      totalSpend: number;
      lastOrder: string;
      latestAddress?: any;
      name?: string;
      phone?: string;
    }>();

    for (const o of orders) {
      const emailKey = String(o.customerEmail || "").toLowerCase().trim();
      if (!emailKey) continue;

      const existing = orderAgg.get(emailKey) || {
        count: 0,
        totalSpend: 0,
        lastOrder: o.createdAt,
        latestAddress: o.shippingAddress,
        name: o.customerName,
        phone: o.customerPhone,
      };

      existing.count += 1;
      existing.totalSpend += Number(o.total || 0);
      if (new Date(o.createdAt) > new Date(existing.lastOrder || 0)) {
        existing.lastOrder = o.createdAt;
        existing.latestAddress = o.shippingAddress;
      }
      orderAgg.set(emailKey, existing);
    }

    // Merge registered users with order aggregates
    const seenEmails = new Set<string>();
    const unifiedUsers: UserProfile[] = [];

    for (const u of registeredUsers) {
      const emailKey = String(u.email || "").toLowerCase().trim();
      seenEmails.add(emailKey);

      const agg = orderAgg.get(emailKey);
      const rawRole = String(u.role || "").toUpperCase().trim();
      const role: UserRole = rawRole === "ADMIN" || rawRole === "SUPER_ADMIN" ? "ADMIN" : "CUSTOMER";

      unifiedUsers.push({
        uid: u.uid || `usr_${u._id}`,
        email: u.email,
        displayName: u.displayName || agg?.name || "Customer",
        phoneNumber: u.phoneNumber || agg?.phone || "",
        photoURL: u.photoURL,
        role,
        addresses: u.addresses || (agg?.latestAddress ? [agg.latestAddress] : []),
        totalOrders: agg ? agg.count : (u.totalOrders || 0),
        totalSpend: agg ? Math.round(agg.totalSpend) : (u.totalSpend || 0),
        status: u.status === "disabled" ? "disabled" : "active",
        notes: u.notes || "",
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt || agg?.lastOrder || new Date().toISOString(),
      });
    }

    // Include buyers from orders who haven't logged in with Google/registered
    for (const [email, agg] of orderAgg.entries()) {
      if (!seenEmails.has(email)) {
        unifiedUsers.push({
          uid: `guest_${email.replace(/[^a-z0-9]/gi, "_")}`,
          email,
          displayName: agg.name || email.split("@")[0],
          phoneNumber: agg.phone || "",
          role: "CUSTOMER",
          addresses: agg.latestAddress ? [agg.latestAddress] : [],
          totalOrders: agg.count,
          totalSpend: Math.round(agg.totalSpend),
          status: "active",
          notes: "Storefront buyer account",
          createdAt: agg.lastOrder || new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ users: unifiedUsers });
  } catch (err: any) {
    console.error("GET /api/admin/users error:", err);
    return NextResponse.json({ error: err?.message || "Failed to fetch users" }, { status: 500 });
  }
}

// 2. POST /api/admin/users - Manually create or register user from Admin
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    if (!isMongoConfigured) {
      return NextResponse.json({ error: "Database not configured." }, { status: 500 });
    }

    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const db = await getDb();
    const usersCol = db.collection("users");

    const existing = await usersCol.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (existing) {
      return NextResponse.json({ error: `User with email "${email}" already exists.` }, { status: 409 });
    }

    const role: UserRole = body.role === "ADMIN" ? "ADMIN" : "CUSTOMER";
    const newUser: UserProfile = {
      uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email,
      displayName: body.displayName?.trim() || email.split("@")[0],
      phoneNumber: body.phoneNumber?.trim() || "",
      role,
      addresses: body.addresses || [],
      totalOrders: 0,
      totalSpend: 0,
      status: body.status === "disabled" ? "disabled" : "active",
      notes: body.notes?.trim() || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await usersCol.insertOne(newUser);

    // Audit log
    await db.collection("auditLogs").insertOne({
      id: `log_${Date.now()}`,
      adminEmail: admin.email,
      action: "CREATE_USER",
      resource: "user",
      resourceId: newUser.uid,
      timestamp: new Date().toISOString(),
      details: { email, role, createdBy: admin.email },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    console.error("POST /api/admin/users error:", err);
    return NextResponse.json({ error: err?.message || "Failed to create user" }, { status: 500 });
  }
}

// 3. PUT /api/admin/users - Update any user's profile, role, status, addresses, and details
export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    if (!isMongoConfigured) {
      return NextResponse.json({ error: "Database not configured." }, { status: 500 });
    }

    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const uid = body.uid;

    if (!email && !uid) {
      return NextResponse.json({ error: "User email or UID is required." }, { status: 400 });
    }

    const db = await getDb();
    const usersCol = db.collection("users");

    // Target query
    const filter = uid && !uid.startsWith("guest_")
      ? { uid }
      : { email: { $regex: new RegExp(`^${email}$`, "i") } };

    const updateFields: Record<string, any> = {
      updatedAt: new Date().toISOString(),
      updatedBy: admin.email,
    };

    if (body.displayName !== undefined) updateFields.displayName = body.displayName.trim();
    if (body.phoneNumber !== undefined) updateFields.phoneNumber = body.phoneNumber.trim();
    if (body.role !== undefined) {
      updateFields.role = body.role === "ADMIN" ? "ADMIN" : "CUSTOMER";
    }
    if (body.status !== undefined) {
      updateFields.status = body.status === "disabled" ? "disabled" : "active";
    }
    if (body.addresses !== undefined) {
      updateFields.addresses = body.addresses;
    }
    if (body.notes !== undefined) {
      updateFields.notes = body.notes.trim();
    }

    // Upsert so if this was an order customer who didn't register yet, they get a full MongoDB user record!
    const result = await usersCol.updateOne(
      filter,
      {
        $set: updateFields,
        $setOnInsert: {
          uid: uid || `usr_${Date.now()}`,
          email,
          createdAt: new Date().toISOString(),
          totalOrders: Number(body.totalOrders || 0),
          totalSpend: Number(body.totalSpend || 0),
        },
      },
      { upsert: true }
    );

    // Audit log
    await db.collection("auditLogs").insertOne({
      id: `log_${Date.now()}`,
      adminEmail: admin.email,
      action: "UPDATE_USER_PROFILE",
      resource: "user",
      resourceId: uid || email,
      timestamp: new Date().toISOString(),
      details: { email, changes: updateFields },
    });

    return NextResponse.json({
      success: true,
      message: "User profile updated successfully!",
      modifiedCount: result.modifiedCount || (result.upsertedCount ? 1 : 0),
    });
  } catch (err: any) {
    console.error("PUT /api/admin/users error:", err);
    return NextResponse.json({ error: err?.message || "Failed to update user" }, { status: 500 });
  }
}

// 4. DELETE /api/admin/users - Delete or disable a user
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    if (!isMongoConfigured) {
      return NextResponse.json({ error: "Database not configured." }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.toLowerCase().trim();
    const uid = searchParams.get("uid");

    if (!email && !uid) {
      return NextResponse.json({ error: "Email or UID is required." }, { status: 400 });
    }

    // Safety guard: cannot delete yourself!
    if (email && email === admin.email.toLowerCase().trim()) {
      return NextResponse.json({ error: "Security protection: You cannot delete your own admin account!" }, { status: 400 });
    }

    const db = await getDb();
    const filter = uid && !uid.startsWith("guest_") ? { uid } : { email };

    await db.collection("users").deleteOne(filter);

    // Audit log
    await db.collection("auditLogs").insertOne({
      id: `log_${Date.now()}`,
      adminEmail: admin.email,
      action: "DELETE_USER",
      resource: "user",
      resourceId: uid || email || "",
      timestamp: new Date().toISOString(),
      details: { deletedEmail: email, deletedBy: admin.email },
    });

    return NextResponse.json({ success: true, message: `User ${email || uid} removed successfully.` });
  } catch (err: any) {
    console.error("DELETE /api/admin/users error:", err);
    return NextResponse.json({ error: err?.message || "Failed to delete user" }, { status: 500 });
  }
}
