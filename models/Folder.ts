import mongoose, { Schema, Document } from "mongoose";

export interface IFolder extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<IFolder>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Folder ||
  mongoose.model<IFolder>("Folder", FolderSchema);
