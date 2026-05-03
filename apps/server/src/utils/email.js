/**
 * Mock Email Service
 * Logs emails to the console for development/testing.
 * In production, replace with SendGrid, Resend, or AWS SES.
 */
export async function sendMail({ to, subject, text, html }) {
  console.log('---------------------------------------------------------');
  console.log(`[EMAIL SENT] To: ${to}`);
  console.log(`[EMAIL SENT] Subject: ${subject}`);
  console.log(`[EMAIL SENT] Body: ${text}`);
  console.log('---------------------------------------------------------');

  // Simulate network delay
  return new Promise((resolve) => setTimeout(resolve, 500));
}

export async function sendInviteEmail(email, workspaceName, inviteToken) {
  const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/invite/${inviteToken}`;

  return sendMail({
    to: email,
    subject: `You've been invited to join ${workspaceName} on FredoFlow`,
    text: `Join ${workspaceName} on FredoFlow: ${inviteUrl}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Join ${workspaceName}</h2>
        <p>You've been invited to collaborate on <strong>FredoFlow</strong>.</p>
        <div style="margin: 24px 0;">
          <a href="${inviteUrl}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Accept Invitation</a>
        </div>
        <p style="font-size: 12px; color: #666;">If the button above doesn't work, copy and paste this link: ${inviteUrl}</p>
      </div>
    `,
  });
}
