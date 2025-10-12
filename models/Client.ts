import mongoose, { Schema, Document, Types } from "mongoose";

export interface IClient extends Document {
  name: string;
  email: string;
  address?: string;
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
  }
);

ClientSchema.virtual("invoices", {
  ref: "Invoice",
  localField: "_id",
  foreignField: "client",
});

export default mongoose.models.Client ||
  mongoose.model<IClient>("Client", ClientSchema);
