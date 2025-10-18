import jsPDF from "jspdf";

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

export interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY?: number;
  };
}