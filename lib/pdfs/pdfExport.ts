import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportInvoiceToPDF = (invoice: any) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(24);
  doc.setTextColor(79, 70, 229); // primary color
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
  doc.text(invoice.client.address, 20, 86);

  // Items table
  autoTable(doc, {
    startY: 100,
    head: [["Popis", "Množstvo", "Cena", "Suma"]],
    body: invoice.items.map((item: any) => [
      item.description,
      item.quantity,
      `€${item.rate.toFixed(2)}`,
      `€${item.amount.toFixed(2)}`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229] },
  });

  // Total
  const finalY = (doc as any).lastAutoTable.finalY || 100;
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

export const exportDashboardToPDF = (data: any) => {
  const doc = new jsPDF();

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
    body: data.recentInvoices.map((inv: any) => [
      inv.id,
      inv.client,
      inv.amount,
      inv.status,
      inv.date,
    ]),
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229] },
  });

  doc.save(`dashboard-report-${new Date().toISOString().split("T")[0]}.pdf`);
};
