import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { createElement } from "react";
import type { ReactElement } from "react";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getInvoicePDFData } from "@/lib/data/invoices";
import { InvoicePDFDocument } from "@/components/invoices/invoice-pdf";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ rentalId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { rentalId } = await params;

  const data = await getInvoicePDFData(rentalId);
  if (!data) {
    return new NextResponse("Invoice not found", { status: 404 });
  }

  // Regular users may only download invoices for their own rentals
  if (session.user.role === "user" && data.rentalId !== rentalId) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // For user role, we verify ownership via a rental lookup in getInvoicePDFData
  // (the query already filters by rentalId; if the rental belonged to another user
  //  the data would still be returned, so we do an explicit ownership check here)
  if (session.user.role === "user") {
    const { db } = await import("@/db");
    const { rentals } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const [rental] = await db
      .select({ userId: rentals.userId })
      .from(rentals)
      .where(eq(rentals.id, rentalId))
      .limit(1);

    if (!rental || rental.userId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const buffer = await renderToBuffer(
    createElement(InvoicePDFDocument, { data }) as ReactElement<DocumentProps>
  );

  const filename = `invoice-${data.invoiceNumber}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
