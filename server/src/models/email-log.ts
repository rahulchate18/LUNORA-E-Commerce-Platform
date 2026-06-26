import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IEmailLog extends Document {
  recipient: string;
  subject: string;
  template: string;
  status: "sent" | "failed" | "pending";
  provider: string;
  attempts: number;
  error?: string;
  variables: Record<string, any>;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const emailLogSchema = new Schema<IEmailLog>(
  {
    recipient: {
      type: String,
      required: [true, "Recipient email is required."],
      trim: true,
      lowercase: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required."],
      trim: true,
    },
    template: {
      type: String,
      required: [true, "Email template identifier is required."],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "pending",
      index: true,
    },
    provider: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 1,
      min: 1,
    },
    error: {
      type: String,
    },
    variables: {
      type: Schema.Types.Mixed,
      default: {},
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for admin dashboard log queries
emailLogSchema.index({ status: 1, createdAt: -1 });
emailLogSchema.index({ recipient: 1, createdAt: -1 });

export const EmailLog: Model<IEmailLog> = mongoose.models.EmailLog || mongoose.model<IEmailLog>("EmailLog", emailLogSchema);
