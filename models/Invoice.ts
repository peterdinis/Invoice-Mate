import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IInvoice extends Document {
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  lineItems: ILineItem[];
  notes?: string;
  total: number;
  folder: Types.ObjectId; // 🔗 referencia na Folder
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
  },
  { timestamps: true },
);

export default mongoose.models.Invoice ||
  mongoose.model<IInvoice>("Invoice", InvoiceSchema);