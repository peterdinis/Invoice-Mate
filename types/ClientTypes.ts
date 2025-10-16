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