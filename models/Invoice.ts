import mongoose, { Schema, Document, Types } from "mongoose";
import "./Client";

export interface ILineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export enum InvoiceStatus {
  PAID = "paid",
  PENDING = "pending",
  OVERDUE = "overdue",
  DRAFT = "draft",
}

export interface IInvoice extends Document {
  client: Types.ObjectId;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  lineItems: ILineItem[];
  notes?: string;
  total: number;
  folder: Types.ObjectId;
  status: InvoiceStatus;
  paidAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const LineItemSchema = new Schema<ILineItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 },
});

const InvoiceSchema = new Schema<IInvoice>(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    clientAddress: { type: String },
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    lineItems: { type: [LineItemSchema], default: [] },
    notes: { type: String },
    total: { type: Number, required: true, default: 0 },
    folder: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.PENDING,
    },
    paidAmount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.Invoice ||
  mongoose.model<IInvoice>("Invoice", InvoiceSchema);
