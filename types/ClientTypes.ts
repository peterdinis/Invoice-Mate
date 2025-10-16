import { IInvoice } from "@/models/Invoice";

export interface ClientWithInvoices {
  _id: string;
  name: string;
  email: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  invoices: IInvoice[];
  invoiceCount: number;
}

export interface InvoiceFilter {
  folder?: string | null;
  $or?: Array<
    | { invoiceNumber: { $regex: string; $options: "i" } }
    | { "client.name": { $regex: string; $options: "i" } }
    | { "client.email": { $regex: string; $options: "i" } }
  >;
}