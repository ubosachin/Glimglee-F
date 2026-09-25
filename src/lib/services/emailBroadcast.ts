import nodemailer from "nodemailer";
import { getDb, isMongoConfigured } from "@/lib/mongodb/client";
import { EmailBroadcast, BroadcastProductItem } from "@/lib/types";

export interface SmtpConfig {
  user: string;
  pass: string;
  senderName?: string;
}

/**
 * Creates a Nodemailer SMTP transporter for Gmail
 */
export function createGmailTransporter(config: SmtpConfig) {
  const cleanPass = config.pass.replace(/\s+/g, ""); // Remove spaces often copied in app passwords
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: {
      user: config.user.trim(),
      pass: cleanPass,
    },
  });
}

/**
 * Verifies SMTP connection credentials
 */
export async function verifyGmailConnection(config: SmtpConfig): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = createGmailTransporter(config);
    await transporter.verify();
    return { success: true, message: "Google SMTP connection verified successfully!" };
  } catch (error: any) {
    console.error("SMTP verification error:", error);
    return {
      success: false,
      message: error?.message || "Failed to authenticate with Google. Check Gmail & 16-character App Password.",
    };
  }
}

/**
 * Generates high-end luxury responsive HTML email for Glimglee
 */
export function generateBroadcastHtml(data: {
  subject: string;
  preheader?: string;
  badge?: string;
  heading: string;
  bodyText: string;
  heroImageUrl?: string;
  featuredProducts?: BroadcastProductItem[];
  promoCouponCode?: string;
  couponDiscountText?: string;
  ctaText?: string;
  ctaLink?: string;
  storeUrl?: string;
}) {
  const storeUrl = data.storeUrl || "https://www.glimglee.com";
  const ctaLink = data.ctaLink ? (data.ctaLink.startsWith("http") ? data.ctaLink : `${storeUrl}${data.ctaLink}`) : `${storeUrl}/shop`;
  const ctaText = data.ctaText || "Explore Glimglee Collection";

  // Format paragraphs from bodyText
  const paragraphs = data.bodyText
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #44403c;">${p.replace(
          /\n/g,
          "<br/>"
        )}</p>`
    )
    .join("");

  // Product cards HTML
  let productsHtml = "";
  if (data.featuredProducts && data.featuredProducts.length > 0) {
    const productItems = data.featuredProducts
      .map((p) => {
        const prodLink = `${storeUrl}/products/${p.slug}`;
        return `
        <td style="width: 50%; vertical-align: top; padding: 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 16px; overflow: hidden; text-align: center;">
            <tr>
              <td style="padding: 0; background: #fafaf9;">
                <a href="${prodLink}" target="_blank" style="text-decoration: none;">
                  <img src="${p.image || "https://www.glimglee.com/icon.png"}" alt="${p.name}" style="width: 100%; height: 180px; object-fit: cover; display: block; border: 0;" />
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 12px; text-align: left;">
                <a href="${prodLink}" target="_blank" style="text-decoration: none; color: #1c1917; font-weight: 700; font-size: 13px; line-height: 1.3; display: block; max-height: 34px; overflow: hidden;">
                  ${p.name}
                </a>
                <div style="margin-top: 8px;">
                  <span style="color: #e11d48; font-weight: 800; font-size: 14px;">₹${p.price.toLocaleString("en-IN")}</span>
                  ${p.compareAtPrice && p.compareAtPrice > p.price ? `<span style="color: #a8a29e; text-decoration: line-through; font-size: 11px; margin-left: 6px;">₹${p.compareAtPrice.toLocaleString("en-IN")}</span>` : ""}
                </div>
                <div style="margin-top: 10px;">
                  <a href="${prodLink}" target="_blank" style="display: block; background: #1c1917; color: #ffffff; font-size: 11px; font-weight: 700; text-align: center; padding: 7px 10px; border-radius: 8px; text-decoration: none;">
                    View Gift →
                  </a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      `;
      })
      .join("");

    productsHtml = `
      <div style="margin: 28px 0 20px 0;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #e11d48; margin-bottom: 12px; text-align: center;">
          Curated Spotlight Selection
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
          <tr>
            ${productItems}
          </tr>
        </table>
      </div>
    `;
  }

  // Promo coupon box HTML
  let couponHtml = "";
  if (data.promoCouponCode) {
    couponHtml = `
      <div style="margin: 24px 0; padding: 20px; background: #fff1f2; border: 2px dashed #f43f5e; border-radius: 16px; text-align: center;">
        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #e11d48; display: block; margin-bottom: 4px;">
          Exclusive VIP Promo Voucher
        </span>
        <div style="font-size: 20px; font-weight: 900; font-family: monospace; color: #881337; letter-spacing: 2px; margin: 4px 0;">
          ${data.promoCouponCode.toUpperCase()}
        </div>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #9f1239; font-weight: 600;">
          ${data.couponDiscountText || "Use this code at checkout to claim your celebratory discount!"}
        </p>
      </div>
    `;
  }

  // Hero image banner HTML
  let heroImageHtml = "";
  if (data.heroImageUrl) {
    heroImageHtml = `
      <tr>
        <td style="padding: 0; background: #1c1917;">
          <img src="${data.heroImageUrl}" alt="Announcement" style="width: 100%; max-height: 280px; object-fit: cover; display: block;" />
        </td>
      </tr>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    table { border-collapse: collapse; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  ${data.preheader ? `<div style="display: none; max-height: 0px; overflow: hidden;">${data.preheader}</div>` : ""}
  
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #f2ede4;">
    
    <!-- Top Brand Header -->
    <tr>
      <td style="padding: 28px 24px; background: linear-gradient(135deg, #1c1917 0%, #0c0a09 100%); text-align: center;">
        <a href="${storeUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
          <div style="font-size: 26px; font-weight: 900; letter-spacing: 0.15em; color: #ffffff;">
            GLIMGLEE<span style="color: #f43f5e; font-size: 28px;">.</span>
          </div>
          <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em; color: #fbbf24; margin-top: 3px;">
            Modern Gifting & Bespoke Surprises
          </div>
        </a>
      </td>
    </tr>

    <!-- Hero Image Banner (if provided) -->
    ${heroImageHtml}

    <!-- Main Content Container -->
    <tr>
      <td style="padding: 36px 32px;">
        
        <!-- Announcement Badge -->
        ${data.badge ? `
          <div style="text-align: center; margin-bottom: 16px;">
            <span style="display: inline-block; background: #fff1f2; color: #e11d48; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; padding: 4px 14px; border-radius: 20px; border: 1px solid #fecdd3;">
              ★ ${data.badge}
            </span>
          </div>
        ` : ""}

        <!-- Heading -->
        <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 900; line-height: 1.25; color: #1c1917; text-align: center; letter-spacing: -0.02em;">
          ${data.heading}
        </h1>

        <!-- Body Paragraphs -->
        <div style="margin: 20px 0;">
          ${paragraphs}
        </div>

        <!-- Embedded Products Grid (if selected) -->
        ${productsHtml}

        <!-- Embedded Promo Coupon (if selected) -->
        ${couponHtml}

        <!-- Primary CTA Button -->
        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${ctaLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 36px; border-radius: 14px; box-shadow: 0 6px 20px rgba(225, 29, 72, 0.35); letter-spacing: 0.02em;">
            ${ctaText} →
          </a>
        </div>

      </td>
    </tr>

    <!-- Trust Badges Bar -->
    <tr>
      <td style="background: #fafaf9; padding: 20px 24px; border-top: 1px solid #f5f5f4; text-align: center;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
          <tr>
            <td style="text-align: center; padding: 4px 8px;">
              <span style="font-size: 11px; font-weight: 700; color: #57534e;">✨ 100% Handcrafted</span>
            </td>
            <td style="text-align: center; padding: 4px 8px;">
              <span style="font-size: 11px; font-weight: 700; color: #57534e;">📦 Luxury Packaging</span>
            </td>
            <td style="text-align: center; padding: 4px 8px;">
              <span style="font-size: 11px; font-weight: 700; color: #57534e;">🚀 Express Pan-India</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 28px 24px; background: #1c1917; text-align: center; color: #a8a29e; font-size: 11px; line-height: 1.6;">
        <div style="font-weight: 700; color: #ffffff; font-size: 12px; margin-bottom: 6px;">
          Glimglee Studio & Celebrations
        </div>
        <div>
          Official Store: <a href="${storeUrl}" target="_blank" style="color: #fbbf24; text-decoration: none;">glimglee.com</a> | Support: <a href="mailto:support@glimglee.com" style="color: #e7e5e4; text-decoration: none;">support@glimglee.com</a>
        </div>
        <p style="margin: 12px 0 0 0; color: #78716c; font-size: 10px;">
          You are receiving this communication because you are a valued customer of Glimglee.
          <br/>© ${new Date().getFullYear()} Glimglee. All rights reserved.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
  `;
}

/**
 * Sends a single test email
 */
export async function sendTestBroadcastEmail(
  config: SmtpConfig,
  recipientEmail: string,
  payload: {
    subject: string;
    preheader?: string;
    badge?: string;
    heading: string;
    bodyText: string;
    heroImageUrl?: string;
    featuredProducts?: BroadcastProductItem[];
    promoCouponCode?: string;
    couponDiscountText?: string;
    ctaText?: string;
    ctaLink?: string;
  }
) {
  const transporter = createGmailTransporter(config);
  const html = generateBroadcastHtml(payload);
  const senderDisplay = config.senderName ? `"${config.senderName}" <${config.user.trim()}>` : config.user.trim();

  const info = await transporter.sendMail({
    from: senderDisplay,
    to: recipientEmail.trim(),
    subject: payload.subject,
    text: `${payload.heading}\n\n${payload.bodyText}\n\nVisit: https://www.glimglee.com`,
    html,
  });

  return info;
}

/**
 * Sends broadcast email in batch to all recipients
 */
export async function sendBroadcastBatch(
  config: SmtpConfig,
  recipients: string[],
  payload: {
    subject: string;
    preheader?: string;
    badge?: string;
    heading: string;
    bodyText: string;
    heroImageUrl?: string;
    featuredProducts?: BroadcastProductItem[];
    promoCouponCode?: string;
    couponDiscountText?: string;
    ctaText?: string;
    ctaLink?: string;
  }
): Promise<{ successCount: number; failureCount: number; errors: string[] }> {
  const transporter = createGmailTransporter(config);
  const html = generateBroadcastHtml(payload);
  const senderDisplay = config.senderName ? `"${config.senderName}" <${config.user.trim()}>` : config.user.trim();

  let successCount = 0;
  let failureCount = 0;
  const errors: string[] = [];

  // Filter unique valid emails
  const cleanRecipients = Array.from(
    new Set(
      recipients
        .map((e) => (e || "").toLowerCase().trim())
        .filter((e) => e && e.includes("@"))
    )
  );

  for (const email of cleanRecipients) {
    try {
      await transporter.sendMail({
        from: senderDisplay,
        to: email,
        subject: payload.subject,
        text: `${payload.heading}\n\n${payload.bodyText}\n\nVisit: https://www.glimglee.com`,
        html,
      });
      successCount++;
    } catch (err: any) {
      failureCount++;
      errors.push(`Failed for ${email}: ${err?.message || "Unknown error"}`);
    }

    // Small throttle between sends to prevent Gmail rate limits
    await new Promise((resolve) => setTimeout(resolve, 80));
  }

  return { successCount, failureCount, errors };
}
