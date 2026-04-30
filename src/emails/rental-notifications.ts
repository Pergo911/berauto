type Locale = "en" | "hu";

export type RentalNotificationType =
  | "REQUEST"
  | "APPROVE"
  | "REJECT"
  | "HANDOVER"
  | "RETURN"
  | "INVOICE";

export interface RentalEmailData {
  customerName: string;
  rentalId: string;
  car: {
    year: number;
    make: string;
    model: string;
    licensePlate: string;
    dailyRate: number;
  };
  startDate: Date;
  endDate: Date;
  locale: Locale;
  // Event-specific extras
  notes?: string | null;
  mileageKm?: number | null;
  amount?: number | null;
  isRegisteredUser?: boolean;
  appUrl?: string;
}

// ── Utilities ─────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale === "hu" ? "hu-HU" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(amount: number, locale: Locale): string {
  return amount.toLocaleString(locale === "hu" ? "hu-HU" : "en-GB", {
    style: "currency",
    currency: "HUF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function rentalDays(startDate: Date, endDate: Date): number {
  return Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function renderShell(
  innerHtml: string,
  locale: Locale,
  subject: string
): string {
  const footerText =
    locale === "hu" ? "BerAuto Autókölcsönző" : "BerAuto Car Rental";
  return `<!DOCTYPE html>
<html lang="${escapeHtml(locale)}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
          <tr>
            <td style="background:#1a1a1a;padding:20px 40px;">
              <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">BerAuto</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              ${innerHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${footerText}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
    <tr>
      <td style="border-radius:6px;background:#1a1a1a;">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function rentalInfoTable(data: RentalEmailData): string {
  const { locale, car, startDate, endDate, rentalId } = data;
  const days = rentalDays(startDate, endDate);
  const estimatedTotal = days * car.dailyRate;
  const isHu = locale === "hu";

  const labels = isHu
    ? {
        ref: "Foglalási szám",
        car: "Jármű",
        period: "Bérlési időszak",
        days: "Napok száma",
        dailyRate: "Napi díj",
        total: "Becsült összeg",
      }
    : {
        ref: "Booking ref.",
        car: "Vehicle",
        period: "Rental period",
        days: "Duration",
        dailyRate: "Daily rate",
        total: "Estimated total",
      };

  const shortId = rentalId.split("-")[0].toUpperCase();

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;font-size:14px;">
    <tr style="background:#f9fafb;">
      <td style="padding:10px 16px;color:#6b7280;font-weight:500;width:40%;">${escapeHtml(labels.ref)}</td>
      <td style="padding:10px 16px;color:#111827;font-weight:600;">${escapeHtml(shortId)}</td>
    </tr>
    <tr>
      <td style="padding:10px 16px;color:#6b7280;font-weight:500;border-top:1px solid #f3f4f6;">${escapeHtml(labels.car)}</td>
      <td style="padding:10px 16px;color:#111827;border-top:1px solid #f3f4f6;">${escapeHtml(`${car.year} ${car.make} ${car.model}`)} &middot; ${escapeHtml(car.licensePlate)}</td>
    </tr>
    <tr style="background:#f9fafb;">
      <td style="padding:10px 16px;color:#6b7280;font-weight:500;border-top:1px solid #f3f4f6;">${escapeHtml(labels.period)}</td>
      <td style="padding:10px 16px;color:#111827;border-top:1px solid #f3f4f6;">${escapeHtml(formatDate(startDate, locale))} &ndash; ${escapeHtml(formatDate(endDate, locale))}</td>
    </tr>
    <tr>
      <td style="padding:10px 16px;color:#6b7280;font-weight:500;border-top:1px solid #f3f4f6;">${escapeHtml(labels.days)}</td>
      <td style="padding:10px 16px;color:#111827;border-top:1px solid #f3f4f6;">${days} ${isHu ? "nap" : "days"}</td>
    </tr>
    <tr style="background:#f9fafb;">
      <td style="padding:10px 16px;color:#6b7280;font-weight:500;border-top:1px solid #f3f4f6;">${escapeHtml(labels.dailyRate)}</td>
      <td style="padding:10px 16px;color:#111827;border-top:1px solid #f3f4f6;">${escapeHtml(formatCurrency(car.dailyRate, locale))}</td>
    </tr>
    <tr>
      <td style="padding:10px 16px;color:#6b7280;font-weight:500;border-top:1px solid #f3f4f6;">${escapeHtml(labels.total)}</td>
      <td style="padding:10px 16px;color:#111827;font-weight:600;border-top:1px solid #f3f4f6;">${escapeHtml(formatCurrency(estimatedTotal, locale))}</td>
    </tr>
  </table>`;
}

// ── Content maps ──────────────────────────────────────

const subjects: Record<RentalNotificationType, Record<Locale, string>> = {
  REQUEST: {
    en: "Your rental request has been received — BerAuto",
    hu: "Foglalási kérelmed megérkezett — BerAuto",
  },
  APPROVE: {
    en: "Your rental has been approved! — BerAuto",
    hu: "Foglalásod jóváhagyták! — BerAuto",
  },
  REJECT: {
    en: "Update on your rental request — BerAuto",
    hu: "Frissítés a foglalási kérelmeddel kapcsolatban — BerAuto",
  },
  HANDOVER: {
    en: "Your rental has started — BerAuto",
    hu: "A bérlésed elkezdődött — BerAuto",
  },
  RETURN: {
    en: "Your rental has ended — BerAuto",
    hu: "A bérlésed véget ért — BerAuto",
  },
  INVOICE: {
    en: "Your invoice is ready — BerAuto",
    hu: "A számlád elkészült — BerAuto",
  },
};

// ── Render functions ──────────────────────────────────

function renderRequest(data: RentalEmailData): string {
  const { locale, customerName, notes } = data;
  const isHu = locale === "hu";
  const subject = subjects.REQUEST[locale];

  const greeting = isHu
    ? `Kedves ${escapeHtml(customerName)}!`
    : `Hi ${escapeHtml(customerName)},`;
  const intro = isHu
    ? "Foglalási kérelmed megérkezett, és csapatunk hamarosan felülvizsgálja."
    : "Your rental request has been received and is pending review by our team.";
  const notesLabel = isHu ? "Megjegyzés:" : "Your notes:";
  const nextSteps = isHu
    ? "Mi történik ezután? Csapatunk átnézi a kérelmedet, és e-mailben értesítünk, amint a státusz megváltozik."
    : "What happens next? Our team will review your request and notify you by email when your status changes.";

  const notesHtml =
    notes && notes.trim()
      ? `<p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:500;">${isHu ? notesLabel : notesLabel}</p>
         <p style="margin:0 0 24px;font-size:14px;color:#374151;background:#f9fafb;border-radius:4px;padding:12px 16px;">${escapeHtml(notes.trim())}</p>`
      : "";

  const inner = `<p style="margin:0 0 20px;font-size:15px;color:#374151;">${greeting}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">${intro}</p>
${rentalInfoTable(data)}
${notesHtml}
<p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">${nextSteps}</p>`;

  return renderShell(inner, locale, subject);
}

function renderApprove(data: RentalEmailData): string {
  const { locale, customerName, notes, isRegisteredUser, appUrl } = data;
  const isHu = locale === "hu";
  const subject = subjects.APPROVE[locale];

  const greeting = isHu
    ? `Kedves ${escapeHtml(customerName)}!`
    : `Hi ${escapeHtml(customerName)},`;
  const intro = isHu
    ? "Örömmel értesítünk, hogy foglalási kérelmedet jóváhagytuk."
    : "Great news! Your rental request has been approved.";
  const agentNotesLabel = isHu
    ? "Üzenet az ügynöktől:"
    : "Note from our agent:";
  const arriveMsg = isHu
    ? "Kérjük, érkezz pontosan a megbeszélt időpontban."
    : "Please arrive as scheduled for your pickup.";
  const ctaLabel = isHu ? "Foglalásaid megtekintése" : "View your rentals";

  const notesHtml =
    notes && notes.trim()
      ? `<p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:500;">${agentNotesLabel}</p>
         <p style="margin:0 0 24px;font-size:14px;color:#374151;background:#f9fafb;border-radius:4px;padding:12px 16px;">${escapeHtml(notes.trim())}</p>`
      : "";

  const ctaHtml =
    isRegisteredUser && appUrl
      ? ctaButton(`${appUrl}/${locale}/dashboard/rentals`, ctaLabel)
      : "";

  const inner = `<p style="margin:0 0 20px;font-size:15px;color:#374151;">${greeting}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">${intro}</p>
${rentalInfoTable(data)}
${notesHtml}
${ctaHtml}
<p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">${arriveMsg}</p>`;

  return renderShell(inner, locale, subject);
}

function renderReject(data: RentalEmailData): string {
  const { locale, customerName, notes, appUrl } = data;
  const isHu = locale === "hu";
  const subject = subjects.REJECT[locale];

  const greeting = isHu
    ? `Kedves ${escapeHtml(customerName)}!`
    : `Hi ${escapeHtml(customerName)},`;
  const intro = isHu
    ? "Sajnálattal értesítünk, hogy foglalási kérelmedet nem tudtuk jóváhagyni."
    : "Unfortunately, we were unable to approve your rental request.";
  const reasonLabel = isHu ? "Indoklás:" : "Reason:";
  const browseLabel = isHu
    ? "Elérhető autók böngészése"
    : "Browse available cars";
  const closing = isHu
    ? "Köszönjük megértésedet. Reméljük, hogy a jövőben újra találkozunk!"
    : "Thank you for your understanding. We hope to see you again!";

  const reasonHtml =
    notes && notes.trim()
      ? `<p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:500;">${reasonLabel}</p>
         <p style="margin:0 0 24px;font-size:14px;color:#374151;background:#f9fafb;border-radius:4px;padding:12px 16px;">${escapeHtml(notes.trim())}</p>`
      : "";

  const ctaHtml = appUrl ? ctaButton(`${appUrl}/${locale}`, browseLabel) : "";

  const inner = `<p style="margin:0 0 20px;font-size:15px;color:#374151;">${greeting}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">${intro}</p>
${rentalInfoTable(data)}
${reasonHtml}
${ctaHtml}
<p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">${closing}</p>`;

  return renderShell(inner, locale, subject);
}

function renderHandover(data: RentalEmailData): string {
  const { locale, customerName, notes, mileageKm, endDate } = data;
  const isHu = locale === "hu";
  const subject = subjects.HANDOVER[locale];

  const greeting = isHu
    ? `Kedves ${escapeHtml(customerName)}!`
    : `Hi ${escapeHtml(customerName)},`;
  const intro = isHu
    ? "Az autódat átadtuk — kellemes utat kívánunk!"
    : "Your car has been handed over — enjoy your rental!";
  const mileageLabel = isHu
    ? "Kilométer-állás az átadáskor:"
    : "Mileage at handover:";
  const returnMsg = isHu
    ? `Kérjük, add vissza az autót legkésőbb <strong>${escapeHtml(formatDate(endDate, locale))}</strong>-ig.`
    : `Please return the car by <strong>${escapeHtml(formatDate(endDate, locale))}</strong>.`;
  const agentNotesLabel = isHu
    ? "Megjegyzés az ügynöktől:"
    : "Note from our agent:";

  const mileageHtml =
    mileageKm != null
      ? `<p style="margin:0 0 24px;font-size:14px;color:#374151;"><strong>${mileageLabel}</strong> ${mileageKm.toLocaleString()} km</p>`
      : "";

  const notesHtml =
    notes && notes.trim()
      ? `<p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:500;">${agentNotesLabel}</p>
         <p style="margin:0 0 24px;font-size:14px;color:#374151;background:#f9fafb;border-radius:4px;padding:12px 16px;">${escapeHtml(notes.trim())}</p>`
      : "";

  const inner = `<p style="margin:0 0 20px;font-size:15px;color:#374151;">${greeting}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">${intro}</p>
${rentalInfoTable(data)}
${mileageHtml}
${notesHtml}
<p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">${returnMsg}</p>`;

  return renderShell(inner, locale, subject);
}

function renderReturn(data: RentalEmailData): string {
  const { locale, customerName, notes, mileageKm } = data;
  const isHu = locale === "hu";
  const subject = subjects.RETURN[locale];

  const greeting = isHu
    ? `Kedves ${escapeHtml(customerName)}!`
    : `Hi ${escapeHtml(customerName)},`;
  const intro = isHu
    ? "Köszönjük, hogy a BerAuto-t választottad! Az autódat sikeresen visszavettük."
    : "Thank you for choosing BerAuto! Your car has been successfully returned.";
  const mileageLabel = isHu
    ? "Kilométer-állás a visszaadáskor:"
    : "Mileage at return:";
  const invoiceMsg = isHu
    ? "Hamarosan kiállítjuk a számlát és értesítünk e-mailben."
    : "An invoice will be issued shortly and you will be notified by email.";
  const agentNotesLabel = isHu
    ? "Megjegyzés az ügynöktől:"
    : "Note from our agent:";

  const mileageHtml =
    mileageKm != null
      ? `<p style="margin:0 0 24px;font-size:14px;color:#374151;"><strong>${mileageLabel}</strong> ${mileageKm.toLocaleString()} km</p>`
      : "";

  const notesHtml =
    notes && notes.trim()
      ? `<p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:500;">${agentNotesLabel}</p>
         <p style="margin:0 0 24px;font-size:14px;color:#374151;background:#f9fafb;border-radius:4px;padding:12px 16px;">${escapeHtml(notes.trim())}</p>`
      : "";

  const inner = `<p style="margin:0 0 20px;font-size:15px;color:#374151;">${greeting}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">${intro}</p>
${rentalInfoTable(data)}
${mileageHtml}
${notesHtml}
<p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">${invoiceMsg}</p>`;

  return renderShell(inner, locale, subject);
}

function renderInvoice(data: RentalEmailData): string {
  const { locale, customerName, amount, isRegisteredUser, appUrl, rentalId } =
    data;
  const isHu = locale === "hu";
  const subject = subjects.INVOICE[locale];

  const greeting = isHu
    ? `Kedves ${escapeHtml(customerName)}!`
    : `Hi ${escapeHtml(customerName)},`;
  const intro = isHu
    ? "A bérlésedhez kiállítottuk a számlát."
    : "Your invoice for the rental has been issued.";
  const amountLabel = isHu ? "Számla összege:" : "Invoice amount:";
  const downloadLabel = isHu ? "Számla letöltése" : "Download invoice";
  const guestMsg = isHu
    ? "A számlád másolatát az ügyfélszolgálatunktól igényelheted."
    : "Please contact us to receive a copy of your invoice.";

  const amountHtml =
    amount != null
      ? `<p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#111827;">${amountLabel} ${escapeHtml(formatCurrency(amount, locale))}</p>`
      : "";

  const ctaHtml =
    isRegisteredUser && appUrl
      ? ctaButton(
          `${appUrl}/api/invoices/${encodeURIComponent(rentalId)}/pdf`,
          downloadLabel
        )
      : `<p style="margin:0 0 24px;font-size:14px;color:#6b7280;">${guestMsg}</p>`;

  const inner = `<p style="margin:0 0 20px;font-size:15px;color:#374151;">${greeting}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">${intro}</p>
${rentalInfoTable(data)}
${amountHtml}
${ctaHtml}`;

  return renderShell(inner, locale, subject);
}

// ── Public exports ────────────────────────────────────

export function rentalEmailSubject(
  type: RentalNotificationType,
  locale: Locale
): string {
  return subjects[type][locale] ?? subjects[type].en;
}

export function renderRentalEmail(
  type: RentalNotificationType,
  data: RentalEmailData
): string {
  const locale = (data.locale as Locale) ?? "hu";
  const safeData = { ...data, locale };

  switch (type) {
    case "REQUEST":
      return renderRequest(safeData);
    case "APPROVE":
      return renderApprove(safeData);
    case "REJECT":
      return renderReject(safeData);
    case "HANDOVER":
      return renderHandover(safeData);
    case "RETURN":
      return renderReturn(safeData);
    case "INVOICE":
      return renderInvoice(safeData);
  }
}
