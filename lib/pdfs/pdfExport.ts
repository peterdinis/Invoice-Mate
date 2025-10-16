import jsPDF from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";

// Typy pre faktúru
export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceClient {
  name: string;
  email: string;
  address?: string;
}

export interface Invoice {
  id: string;
  date: string;
  dueDate: string;
  client: InvoiceClient;
  items: InvoiceItem[];
  total: number;
  notes?: string;
}

// Typy pre dashboard
export interface DashboardInvoice {
  id: string;
  client: string;
  amount: number;
  status: string;
  date: string;
}

export interface DashboardData {
  totalRevenue: number;
  pending: number;
  paidThisMonth: number;
  totalInvoices: number;
  recentInvoices: DashboardInvoice[];
}

// Rozšírenie typu jsPDF o lastAutoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY?: number;
  };
}

// Export faktúry do PDF
export const exportInvoiceToPDF = (invoice: Invoice): void => {
  const doc = new jsPDF() as jsPDFWithAutoTable;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(79, 70, 229);
  doc.text("FAKTÚRA", 20, 20);

  // Invoice details
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Číslo faktúry: ${invoice.id}`, 20, 35);
  doc.text(`Dátum: ${invoice.date}`, 20, 42);
  doc.text(`Splatnosť: ${invoice.dueDate}`, 20, 49);

  // Client info
  doc.setFontSize(12);
  doc.text("Klient:", 20, 65);
  doc.setFontSize(10);
  doc.text(invoice.client.name, 20, 72);
  doc.text(invoice.client.email, 20, 79);
  if (invoice.client.address) {
    doc.text(invoice.client.address, 20, 86);
  }

  // Items table
  autoTable(doc, {
    startY: 100,
    head: [["Popis", "Množstvo", "Cena", "Suma"]],
    body: invoice.items.map((item) => [
      item.description,
      item.quantity,
      `€${item.rate.toFixed(2)}`,
      `€${item.amount.toFixed(2)}`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229] },
  } as UserOptions);

  // Total
  const finalY = doc.lastAutoTable?.finalY ?? 100;
  doc.setFontSize(14);
  doc.text(`Celkom: €${invoice.total.toFixed(2)}`, 20, finalY + 15);

  // Notes
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.text("Poznámky:", 20, finalY + 30);
    doc.text(invoice.notes, 20, finalY + 37);
  }

  doc.save(`faktura-${invoice.id}.pdf`);
};

// Export dashboard do PDF
export const exportDashboardToPDF = (data: DashboardData): void => {
  const doc = new jsPDF() as jsPDFWithAutoTable;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229);
  doc.text("Dashboard Report", 20, 20);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Vygenerované: ${new Date().toLocaleDateString("sk-SK")}`, 20, 30);

  // Stats
  doc.setFontSize(12);
  doc.text("Štatistiky:", 20, 45);
  doc.setFontSize(10);
  doc.text(`Celkový príjem: ${data.totalRevenue}`, 20, 52);
  doc.text(`Čakajúce platby: ${data.pending}`, 20, 59);
  doc.text(`Zaplatené tento mesiac: ${data.paidThisMonth}`, 20, 66);
  doc.text(`Počet faktúr: ${data.totalInvoices}`, 20, 73);

  // Recent invoices table
  autoTable(doc, {
    startY: 85,
    head: [["Číslo", "Klient", "Suma", "Stav", "Dátum"]],
    body: data.recentInvoices.map((inv) => [
      inv.id,
      inv.client,
      inv.amount,
      inv.status,
      inv.date,
    ]),
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229] },
  } as UserOptions);

  doc.save(`dashboard-report-${new Date().toISOString().split("T")[0]}.pdf`);
};
