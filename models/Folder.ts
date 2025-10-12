import mongoose, { Schema, Document } from "mongoose";

export interface IFolder extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  invoices?: mongoose.Types.ObjectId[];
}

const FolderSchema = new Schema<IFolder>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

FolderSchema.virtual("invoices", {
  ref: "Invoice",
  localField: "_id",
  foreignField: "folder",
});

export default mongoose.models.Folder ||
  mongoose.model<IFolder>("Folder", FolderSchema);
