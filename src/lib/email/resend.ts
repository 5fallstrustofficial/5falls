export interface EmailDispatchResult {
  status: "sent" | "preview" | "failed";
  sentCount: number;
  message: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildAnnouncementHtml(title: string, description: string, authorName: string): string {
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(description).replace(/\n/g, "<br />");
  const safeAuthor = escapeHtml(authorName);

  return `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f9fafb; padding:32px 16px; color:#000000;">
      <div style="max-width:580px; margin:0 auto; background:#ffffff; border:1px solid #dce2ea; border-radius:16px; overflow:hidden;">
        <div style="background:#006aff; color:#ffffff; padding:20px 28px;">
          <div style="font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; opacity:0.9;">
            Five Falls Women's Welfare Trust · Announcement
          </div>
          <h1 style="margin:8px 0 0; font-size:22px; line-height:1.3; font-weight:700; color:#ffffff;">
            ${safeTitle}
          </h1>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 18px; font-size:15px; line-height:1.65; color:#405168;">
            ${safeBody}
          </p>
          <div style="padding-top:16px; border-top:1px solid #dce2ea; font-size:13px; color:#667b99;">
            Posted by <strong style="color:#000000;">${safeAuthor}</strong> · Five Falls Trust Portal
          </div>
          <div style="margin-top:22px;">
            <a href="https://5falls.5fallstrustofficial.workers.dev/dashboard"
               style="display:inline-block; background:#006aff; color:#ffffff; text-decoration:none; font-weight:600; font-size:14px; padding:10px 22px; border-radius:999px;">
              View &amp; Comment in Portal
            </a>
          </div>
        </div>
        <div style="background:#f9fafb; border-top:1px solid #dce2ea; padding:14px 28px; font-size:11px; color:#8798b0;">
          Five Falls Women's Welfare Trust (Regd. No. 87/2018) · Selaiyur, East Tambaram, Chennai
        </div>
      </div>
    </div>
  `;
}

/**
 * Sends individual announcement notification emails via Resend Batch REST API
 * (`POST /emails/batch`, max 100 emails per request) so member email addresses remain private.
 * Edge/Cloudflare Worker compatible (uses standard `fetch` only).
 */
export async function sendAnnouncementEmailBatch({
  recipients,
  title,
  description,
  authorName,
}: {
  recipients: string[];
  title: string;
  description: string;
  authorName: string;
}): Promise<EmailDispatchResult> {
  const uniqueRecipients = Array.from(
    new Set(
      recipients
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.includes("@"))
    )
  );

  if (uniqueRecipients.length === 0) {
    return {
      status: "preview",
      sentCount: 0,
      message: "No registered user email addresses found yet.",
    };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Five Falls Trust <onboarding@resend.dev>";

  if (!apiKey) {
    console.info(
      `[5Falls Email Preview] RESEND_API_KEY not set. Announcement "${title}" prepared for ${uniqueRecipients.length} registered users.`
    );
    return {
      status: "preview",
      sentCount: uniqueRecipients.length,
      message: `RESEND_API_KEY is not configured yet — preview logged for ${uniqueRecipients.length} registered user(s).`,
    };
  }

  const html = buildAnnouncementHtml(title, description, authorName);
  const subject = `[5Falls Announcement] ${title}`;
  let totalSent = 0;

  try {
    // Resend /emails/batch supports up to 100 individual messages per request
    for (let i = 0; i < uniqueRecipients.length; i += 100) {
      const chunk = uniqueRecipients.slice(i, i + 100);
      const payload = chunk.map((email) => ({
        from: fromEmail,
        to: [email],
        subject,
        html,
        text: `${title}\n\n${description}\n\n— ${authorName}\nFive Falls Women's Welfare Trust`,
      }));

      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        return {
          status: "failed",
          sentCount: totalSent,
          message: `Resend API error (${res.status}): ${errText.slice(0, 200)}`,
        };
      }

      totalSent += chunk.length;
    }

    return {
      status: "sent",
      sentCount: totalSent,
      message: `Announcement email sent to ${totalSent} registered user(s).`,
    };
  } catch (err) {
    return {
      status: "failed",
      sentCount: totalSent,
      message: err instanceof Error ? err.message : "Failed to dispatch emails via Resend.",
    };
  }
}

function buildInviteHtml(registerUrl: string, recipientName?: string): string {
  const greeting = recipientName ? `Hello ${escapeHtml(recipientName)},` : "Hello,";
  return `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f9fafb; padding:32px 16px; color:#000000;">
      <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #dce2ea; border-radius:16px; overflow:hidden;">
        <div style="background:#006aff; color:#ffffff; padding:22px 28px;">
          <div style="font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; opacity:0.9;">
            Five Falls Women's Welfare Trust
          </div>
          <h1 style="margin:8px 0 0; font-size:21px; line-height:1.3; font-weight:700; color:#ffffff;">
            You're Invited to Join the 5Falls Portal
          </h1>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 14px; font-size:15px; line-height:1.6; color:#405168;">
            ${greeting}
          </p>
          <p style="margin:0 0 20px; font-size:15px; line-height:1.6; color:#405168;">
            An administrator at Five Falls Women's Welfare Trust has invited you to create your member/volunteer account to receive lake restoration dispatches and community announcements.
          </p>
          <div>
            <a href="${registerUrl}"
               style="display:inline-block; background:#006aff; color:#ffffff; text-decoration:none; font-weight:600; font-size:14px; padding:11px 24px; border-radius:999px;">
              Create Your Account
            </a>
          </div>
        </div>
        <div style="background:#f9fafb; border-top:1px solid #dce2ea; padding:14px 28px; font-size:11px; color:#8798b0;">
          Five Falls Women's Welfare Trust (Regd. No. 87/2018) · Selaiyur, East Tambaram, Chennai
        </div>
      </div>
    </div>
  `;
}

export async function sendInviteEmailBatch({
  invites,
  baseUrl,
}: {
  invites: { email: string; name?: string }[];
  baseUrl: string;
}): Promise<EmailDispatchResult> {
  const uniqueMap = new Map<string, { email: string; name?: string }>();
  for (const item of invites) {
    const email = item.email.trim().toLowerCase();
    if (email.includes("@") && !uniqueMap.has(email)) {
      uniqueMap.set(email, { email, name: item.name?.trim() || undefined });
    }
  }

  const list = Array.from(uniqueMap.values());
  if (list.length === 0) {
    return { status: "failed", sentCount: 0, message: "No valid email addresses provided." };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() || "Five Falls Trust <onboarding@resend.dev>";

  if (!apiKey) {
    console.info(
      `[5Falls Invite Preview] RESEND_API_KEY not set. Prepared invite emails for ${list.length} recipient(s).`
    );
    return {
      status: "preview",
      sentCount: list.length,
      message: `RESEND_API_KEY not set — invite preview logged for ${list.length} email(s).`,
    };
  }

  let totalSent = 0;
  try {
    for (let i = 0; i < list.length; i += 100) {
      const chunk = list.slice(i, i + 100);
      const payload = chunk.map((entry) => {
        const registerUrl = `${baseUrl}/register?email=${encodeURIComponent(entry.email)}`;
        return {
          from: fromEmail,
          to: [entry.email],
          subject: "You're invited to join Five Falls Women's Welfare Trust Portal",
          html: buildInviteHtml(registerUrl, entry.name),
          text: `You have been invited to join Five Falls Women's Welfare Trust. Create your account here: ${registerUrl}`,
        };
      });

      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        return {
          status: "failed",
          sentCount: totalSent,
          message: `Resend API error (${res.status}): ${errText.slice(0, 200)}`,
        };
      }

      totalSent += chunk.length;
    }

    return {
      status: "sent",
      sentCount: totalSent,
      message: `Invitation email sent to ${totalSent} user(s).`,
    };
  } catch (err) {
    return {
      status: "failed",
      sentCount: totalSent,
      message: err instanceof Error ? err.message : "Failed to send invite emails.",
    };
  }
}
