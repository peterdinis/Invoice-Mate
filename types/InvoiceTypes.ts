export interface Invoice {
  _id: string;
  invoiceNumber: string;
  client:
    | {
        _id: string;
        name: string;
        email: string;
      }
    | string;
  total: number;
  status: "paid" | "pending" | "overdue" | "draft";
  invoiceDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  items?: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface RecentInvoice {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  amount: string | number;
  status: "paid" | "pending" | "overdue" | string;
  createdAt: string;
}
