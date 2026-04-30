type ResendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
};

export function getResendApiKey(): string {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY env var');
  }
  return apiKey;
}

export function getResendFromEmail(): string {
  // Keep a safe default; in production you should set RESEND_FROM_EMAIL to your verified sender.
  return process.env.RESEND_FROM_EMAIL || 'Divij <onboarding@resend.dev>';
}

export async function sendResendEmail(input: ResendEmailInput): Promise<{ id?: string }> {
  const apiKey = getResendApiKey();
  const from = input.from || getResendFromEmail();
  const to = Array.isArray(input.to) ? input.to : [input.to];

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!emailRes.ok) {
    const errText = await emailRes.text();
    throw new Error(errText || `Resend failed with status ${emailRes.status}`);
  }

  const respJson = (await emailRes.json().catch(() => null)) as any;
  return { id: respJson?.id };
}
