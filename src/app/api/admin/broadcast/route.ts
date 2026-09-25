import { NextRequest, NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { verifyToken } from "@/lib/auth/jwt";
import {
  verifyGmailConnection,
  sendTestBroadcastEmail,
  sendBroadcastBatch,
  generateBroadcastHtml,
  SmtpConfig,
} from "@/lib/services/emailBroadcast";

// Verify admin permissions
async function getAdminUser(req: NextRequest) {
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
        if (rawRole === "ADMIN" || rawRole === "SUPER_ADMIN") return dbUser;
      }
    } catch (e) {
      console.warn("getAdminUser check error:", e);
    }
  }

  if (decoded.role === "ADMIN") return decoded;
  return null;
}

// 1. GET /api/admin/broadcast
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    if (!isMongoConfigured) {
      return NextResponse.json({
        totalRecipients: 0,
        recipientsList: [],
        settings: { gmailUser: "", gmailSenderName: "Glimglee Gifting", hasGoogleAppPassword: false },
        history: [],
      });
    }

    const db = await getDb();

    // 1. Gather all unique customer emails from users & orders
    const [userEmails, orderEmails, savedSettingsDoc, broadcastLogs] = await Promise.all([
      db.collection("users").distinct("email"),
      db.collection("orders").distinct("customerEmail"),
      db.collection("settings").findOne({ type: "gmail_smtp_broadcast" }),
      db.collection("broadcasts").find({}).sort({ sentAt: -1 }).limit(20).toArray(),
    ]);

    const allEmails = Array.from(
      new Set(
        [...userEmails, ...orderEmails]
          .map((e) => String(e || "").toLowerCase().trim())
          .filter((e) => e && e.includes("@"))
      )
    );

    const gmailUser = savedSettingsDoc?.gmailUser || process.env.GMAIL_USER || "";
    const hasGoogleAppPassword = Boolean(savedSettingsDoc?.gmailAppPassword || process.env.GMAIL_APP_PASSWORD);
    const gmailSenderName = savedSettingsDoc?.gmailSenderName || "Glimglee Gifting";

    return NextResponse.json({
      totalRecipients: allEmails.length,
      recipientsList: allEmails,
      settings: {
        gmailUser,
        gmailSenderName,
        hasGoogleAppPassword,
      },
      history: broadcastLogs,
    });
  } catch (err: any) {
    console.error("GET /api/admin/broadcast error:", err);
    return NextResponse.json({ error: err?.message || "Failed to load broadcast info" }, { status: 500 });
  }
}

// 2. POST /api/admin/broadcast
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
    const action = body.action;
    const db = await getDb();

    // ACTION: SAVE SMTP SETTINGS
    if (action === "save_settings") {
      const { gmailUser, gmailAppPassword, gmailSenderName } = body;
      if (!gmailUser || !gmailUser.includes("@")) {
        return NextResponse.json({ error: "A valid Gmail address is required." }, { status: 400 });
      }

      const updateData: Record<string, any> = {
        type: "gmail_smtp_broadcast",
        gmailUser: gmailUser.trim(),
        gmailSenderName: (gmailSenderName || "Glimglee Gifting").trim(),
        updatedAt: new Date().toISOString(),
        updatedBy: admin.email,
      };

      if (gmailAppPassword && gmailAppPassword.trim()) {
        updateData.gmailAppPassword = gmailAppPassword.trim();
      }

      await db.collection("settings").updateOne(
        { type: "gmail_smtp_broadcast" },
        { $set: updateData },
        { upsert: true }
      );

      return NextResponse.json({
        success: true,
        message: "Google App Password settings saved successfully!",
      });
    }

    // Resolve credentials (from payload or stored settings)
    const saved = await db.collection("settings").findOne({ type: "gmail_smtp_broadcast" });
    const user = body.gmailUser?.trim() || saved?.gmailUser || process.env.GMAIL_USER || "";
    const pass = body.gmailAppPassword?.trim() || saved?.gmailAppPassword || process.env.GMAIL_APP_PASSWORD || "";
    const senderName = body.gmailSenderName?.trim() || saved?.gmailSenderName || "Glimglee Gifting";

    if (!user || !pass) {
      return NextResponse.json(
        { error: "Gmail address and Google App Password are required. Please configure them in Broadcast Settings." },
        { status: 400 }
      );
    }

    const smtpConfig: SmtpConfig = { user, pass, senderName };

    // ACTION: TEST SMTP CONNECTION
    if (action === "test_connection") {
      const result = await verifyGmailConnection(smtpConfig);
      return NextResponse.json(result);
    }

    // ACTION: PREVIEW HTML
    if (action === "preview_html") {
      const html = generateBroadcastHtml(body);
      return NextResponse.json({ html });
    }

    // ACTION: SEND TEST EMAIL
    if (action === "send_test") {
      const testEmail = (body.testEmail || admin.email || "").trim();
      if (!testEmail || !testEmail.includes("@")) {
        return NextResponse.json({ error: "Please enter a valid destination email for the test." }, { status: 400 });
      }

      await sendTestBroadcastEmail(smtpConfig, testEmail, {
        subject: body.subject || "Glimglee Exclusive Announcement",
        preheader: body.preheader,
        badge: body.badge,
        heading: body.heading || "Special Announcement from Glimglee",
        bodyText: body.bodyText || "We have something special for you today.",
        heroImageUrl: body.heroImageUrl,
        featuredProducts: body.featuredProducts || [],
        promoCouponCode: body.promoCouponCode,
        couponDiscountText: body.couponDiscountText,
        ctaText: body.ctaText,
        ctaLink: body.ctaLink,
      });

      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${testEmail}! Check your inbox.`,
      });
    }

    // ACTION: SEND FULL BROADCAST BLAST
    if (action === "send_broadcast") {
      if (!body.subject || !body.heading || !body.bodyText) {
        return NextResponse.json(
          { error: "Campaign subject, heading, and announcement body are required." },
          { status: 400 }
        );
      }

      // Gather all recipient emails
      const [userEmails, orderEmails] = await Promise.all([
        db.collection("users").distinct("email"),
        db.collection("orders").distinct("customerEmail"),
      ]);

      const allEmails = Array.from(
        new Set(
          [...userEmails, ...orderEmails]
            .map((e) => String(e || "").toLowerCase().trim())
            .filter((e) => e && e.includes("@"))
        )
      );

      if (allEmails.length === 0) {
        return NextResponse.json({ error: "No customer email addresses found in database." }, { status: 400 });
      }

      const broadcastRecord = {
        id: `bc_${Date.now()}`,
        subject: body.subject,
        heading: body.heading,
        badge: body.badge || "",
        senderEmail: user,
        senderName,
        recipientCount: allEmails.length,
        featuredProducts: body.featuredProducts || [],
        promoCouponCode: body.promoCouponCode || "",
        status: "processing",
        sentBy: admin.email,
        sentAt: new Date().toISOString(),
      };

      // Send in batch
      const result = await sendBroadcastBatch(smtpConfig, allEmails, {
        subject: body.subject,
        preheader: body.preheader,
        badge: body.badge,
        heading: body.heading,
        bodyText: body.bodyText,
        heroImageUrl: body.heroImageUrl,
        featuredProducts: body.featuredProducts || [],
        promoCouponCode: body.promoCouponCode,
        couponDiscountText: body.couponDiscountText,
        ctaText: body.ctaText,
        ctaLink: body.ctaLink,
      });

      // Update broadcast record in MongoDB
      await db.collection("broadcasts").insertOne({
        ...broadcastRecord,
        successCount: result.successCount,
        failureCount: result.failureCount,
        status: result.failureCount === 0 ? "sent" : result.successCount > 0 ? "partial" : "failed",
        errors: result.errors.slice(0, 10),
      });

      // Audit log
      await db.collection("auditLogs").insertOne({
        id: `log_${Date.now()}`,
        adminEmail: admin.email,
        action: "SEND_EMAIL_BROADCAST",
        resource: "cms",
        resourceId: broadcastRecord.id,
        timestamp: new Date().toISOString(),
        details: {
          subject: body.subject,
          recipients: allEmails.length,
          success: result.successCount,
          failed: result.failureCount,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Broadcast finished! Delivered to ${result.successCount} of ${allEmails.length} recipients.`,
        successCount: result.successCount,
        failureCount: result.failureCount,
      });
    }

    return NextResponse.json({ error: "Unknown action specified." }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/admin/broadcast error:", err);
    return NextResponse.json({ error: err?.message || "Failed to process broadcast request" }, { status: 500 });
  }
}
