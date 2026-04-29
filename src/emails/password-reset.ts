type Locale = "en" | "hu";

interface PasswordResetProps {
  name: string;
  resetUrl: string;
  locale: Locale;
}

const content = {
  en: {
    subject: "Reset your password — BerAuto",
    greeting: (name: string) => `Hi ${name},`,
    body: "We received a request to reset the password for your BerAuto account. Click the button below to choose a new password.",
    cta: "Reset password",
    expiry: "This link expires in 1 hour.",
    ignore:
      "If you didn't request a password reset, you can safely ignore this email. Your password will not change.",
    footer: "BerAuto Car Rental",
  },
  hu: {
    subject: "Jelszó visszaállítása — BerAuto",
    greeting: (name: string) => `Kedves ${name}!`,
    body: "Jelszó-visszaállítási kérést kaptunk a BerAuto-fiókodhoz. Kattints az alábbi gombra az új jelszó megadásához.",
    cta: "Jelszó visszaállítása",
    expiry: "Ez a link 1 óra múlva lejár.",
    ignore:
      "Ha nem te kértél jelszó-visszaállítást, nyugodtan hagyd figyelmen kívül ezt az e-mailt. A jelszavad nem változik.",
    footer: "BerAuto Autókölcsönző",
  },
};

export function passwordResetSubject(locale: Locale): string {
  return content[locale]?.subject ?? content.en.subject;
}

export function renderPasswordReset({
  name,
  resetUrl,
  locale,
}: PasswordResetProps): string {
  const t = content[locale] ?? content.en;

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
          <tr>
            <td style="background:#1a1a1a;padding:20px 40px;">
              <span style="display:inline-flex;align-items:center;"><span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;vertical-align:middle;">BerAuto</span></span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;font-size:15px;color:#374151;">${t.greeting(name)}</p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#374151;">${t.body}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="border-radius:6px;background:#1a1a1a;">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">${t.cta}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">${t.expiry}</p>
              <p style="margin:0;font-size:13px;color:#6b7280;">${t.ignore}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${t.footer}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
