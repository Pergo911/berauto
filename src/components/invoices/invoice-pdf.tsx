import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export type InvoicePDFData = {
  invoiceNumber: string;
  id: string;
  rentalId: string;
  amount: number;
  issuedAt: Date;
  issuerName: string | null;
  customer: {
    name: string;
    email: string;
  };
  rental: {
    startDate: Date;
    endDate: Date;
    days: number;
  };
  car: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    dailyRate: number;
  };
};

const NAVY = "#1a3a5c";
const BLUE = "#4a7fb5";
const LIGHT_GRAY = "#f0f4f8";
const BODY = "#333333";
const GRAY = "#888888";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    color: BODY,
    backgroundColor: "#ffffff",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "column",
  },
  companyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 26,
    color: NAVY,
    marginBottom: 2,
  },
  companySubtitle: {
    fontSize: 10,
    color: BLUE,
    marginBottom: 8,
  },
  companyDetail: {
    fontSize: 9,
    color: BODY,
    marginBottom: 2,
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 28,
    color: NAVY,
    letterSpacing: 2,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  metaLabel: {
    fontSize: 9,
    color: GRAY,
    width: 72,
    textAlign: "right",
  },
  metaValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: BODY,
    textAlign: "right",
  },

  // Divider
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    marginBottom: 20,
  },
  thinDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#d0d8e4",
    marginBottom: 12,
    marginTop: 12,
  },

  // Bill To
  billToSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 9,
    color: GRAY,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  customerName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: NAVY,
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 9,
    color: BODY,
  },

  // Rental Details
  rentalSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: NAVY,
    marginBottom: 8,
  },
  rentalTable: {
    border: 1,
    borderColor: "#d0d8e4",
  },
  rentalHeaderRow: {
    flexDirection: "row",
    backgroundColor: NAVY,
  },
  rentalDataRow: {
    flexDirection: "row",
    backgroundColor: LIGHT_GRAY,
  },
  rentalCell: {
    flex: 1,
    padding: 8,
  },
  rentalHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#ffffff",
  },
  rentalDataText: {
    fontSize: 9,
    color: BODY,
  },

  // Items table
  itemsSection: {
    marginBottom: 20,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: NAVY,
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e8edf2",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: LIGHT_GRAY,
    borderBottomWidth: 1,
    borderBottomColor: "#e8edf2",
  },
  colDescription: {
    flex: 3,
  },
  colUnitPrice: {
    flex: 2,
    textAlign: "right",
  },
  colQty: {
    flex: 1,
    textAlign: "center",
  },
  colAmount: {
    flex: 2,
    textAlign: "right",
  },
  tableHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#ffffff",
  },
  tableCellText: {
    fontSize: 9,
    color: BODY,
  },
  tableBorder: {
    border: 1,
    borderColor: "#d0d8e4",
  },

  // Totals
  totalsSection: {
    alignItems: "flex-end",
    marginBottom: 28,
  },
  totalRow: {
    flexDirection: "row",
    marginBottom: 4,
    width: 220,
    justifyContent: "space-between",
  },
  totalLabelText: {
    fontSize: 10,
    color: GRAY,
  },
  totalValueText: {
    fontSize: 10,
    color: BODY,
    textAlign: "right",
    width: 100,
  },
  totalDivider: {
    borderBottomWidth: 1,
    borderBottomColor: NAVY,
    width: 220,
    marginBottom: 6,
    marginTop: 2,
  },
  grandTotalRow: {
    flexDirection: "row",
    width: 220,
    justifyContent: "space-between",
  },
  grandTotalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: NAVY,
  },
  grandTotalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: NAVY,
    textAlign: "right",
    width: 100,
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#d0d8e4",
    paddingTop: 14,
    alignItems: "center",
  },
  footerMain: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: NAVY,
    marginBottom: 4,
  },
  footerSub: {
    fontSize: 8,
    color: GRAY,
  },
});

export function InvoicePDFDocument({ data }: { data: InvoicePDFData }) {
  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(d));

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency: "HUF",
      maximumFractionDigits: 0,
    }).format(n);

  const vehicleLabel = `${data.car.make} ${data.car.model} (${data.car.year})`;
  const rentalPeriod = `${formatDate(data.rental.startDate)} – ${formatDate(data.rental.endDate)}`;

  return (
    <Document title={`Invoice ${data.invoiceNumber}`} author="BérAutó">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>BérAutó</Text>
            <Text style={styles.companySubtitle}>Car Rental Services</Text>
            <Text style={styles.companyDetail}>
              1051 Budapest, Arany János utca 12.
            </Text>
            <Text style={styles.companyDetail}>+36 1 234 5678</Text>
            <Text style={styles.companyDetail}>iroda@berauto.hu</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice No: </Text>
              <Text style={styles.metaValue}>{data.invoiceNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Issue Date: </Text>
              <Text style={styles.metaValue}>{formatDate(data.issuedAt)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Rental ID: </Text>
              <Text style={styles.metaValue}>
                {data.rentalId.slice(0, 8).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Bill To */}
        <View style={styles.billToSection}>
          <Text style={styles.sectionLabel}>Bill To</Text>
          <Text style={styles.customerName}>{data.customer.name}</Text>
          <Text style={styles.customerEmail}>{data.customer.email}</Text>
        </View>

        <View style={styles.thinDivider} />

        {/* Rental Details */}
        <View style={styles.rentalSection}>
          <Text style={styles.sectionHeading}>Rental Details</Text>
          <View style={styles.rentalTable}>
            <View style={styles.rentalHeaderRow}>
              <View style={styles.rentalCell}>
                <Text style={styles.rentalHeaderText}>Vehicle</Text>
              </View>
              <View style={styles.rentalCell}>
                <Text style={styles.rentalHeaderText}>License Plate</Text>
              </View>
              <View style={styles.rentalCell}>
                <Text style={styles.rentalHeaderText}>Rental Period</Text>
              </View>
              <View style={styles.rentalCell}>
                <Text style={styles.rentalHeaderText}>Duration</Text>
              </View>
            </View>
            <View style={styles.rentalDataRow}>
              <View style={styles.rentalCell}>
                <Text style={styles.rentalDataText}>{vehicleLabel}</Text>
              </View>
              <View style={styles.rentalCell}>
                <Text style={styles.rentalDataText}>
                  {data.car.licensePlate}
                </Text>
              </View>
              <View style={styles.rentalCell}>
                <Text style={styles.rentalDataText}>{rentalPeriod}</Text>
              </View>
              <View style={styles.rentalCell}>
                <Text style={styles.rentalDataText}>
                  {data.rental.days} days
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Itemized Charges */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionHeading}>Itemized Charges</Text>
          <View style={styles.tableBorder}>
            <View style={styles.tableHeaderRow}>
              <View style={styles.colDescription}>
                <Text style={styles.tableHeaderText}>Description</Text>
              </View>
              <View style={styles.colUnitPrice}>
                <Text style={[styles.tableHeaderText, { textAlign: "right" }]}>
                  Unit Price
                </Text>
              </View>
              <View style={styles.colQty}>
                <Text style={[styles.tableHeaderText, { textAlign: "center" }]}>
                  Qty
                </Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={[styles.tableHeaderText, { textAlign: "right" }]}>
                  Amount
                </Text>
              </View>
            </View>
            <View style={styles.tableRowAlt}>
              <View style={styles.colDescription}>
                <Text style={styles.tableCellText}>
                  Car Rental – {data.car.make} {data.car.model}
                </Text>
              </View>
              <View style={styles.colUnitPrice}>
                <Text style={[styles.tableCellText, { textAlign: "right" }]}>
                  {formatCurrency(data.car.dailyRate)}
                </Text>
              </View>
              <View style={styles.colQty}>
                <Text style={[styles.tableCellText, { textAlign: "center" }]}>
                  {data.rental.days}
                </Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={[styles.tableCellText, { textAlign: "right" }]}>
                  {formatCurrency(data.amount)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabelText}>Subtotal:</Text>
            <Text style={styles.totalValueText}>
              {formatCurrency(data.amount)}
            </Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(data.amount)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerMain}>
            Thank you for choosing BérAutó!
          </Text>
          <Text style={styles.footerSub}>
            This document was generated electronically and is valid without a
            signature.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
