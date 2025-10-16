import mongoose, { Schema, Document, Types } from "mongoose";
import { IInvoice } from "./Invoice";

export interface IClient extends Document {
  name: string;
  email: string;
  address?: string;
  invoices?: Types.Array<IInvoice>;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    address: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

ClientSchema.virtual("invoices", {
  ref: "Invoice",
  localField: "_id",
  foreignField: "client",
});

export default mongoose.models.Client ||
  mongoose.model<IClient>("Client", ClientSchema);
