import mongoose, { Schema, type Document, type Model } from "mongoose";
import bcrypt from "bcryptjs";

/**
 * Address subdocument interface
 */
export interface IAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

/**
 * User document interface
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional for cases where password isn't selected
  role: "user" | "admin";
  avatar?: string;
  phone?: string;
  addresses: IAddress[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 1. Embedded Address Schema
const addressSchema = new Schema<IAddress>(
  {
    name: { type: String, required: [true, "Recipient name is required."], trim: true },
    street: { type: String, required: [true, "Street address is required."], trim: true },
    city: { type: String, required: [true, "City is required."], trim: true },
    state: { type: String, required: [true, "State is required."], trim: true },
    postalCode: { type: String, required: [true, "Postal code/ZIP is required."], trim: true },
    phone: { type: String, required: [true, "Contact number is required."], trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

// 2. User Schema
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "User full name is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 characters."],
    },
    email: {
      type: String,
      required: [true, "Email address is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters."],
      select: false, // Don't return password string by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "Role must be either 'user' or 'admin'.",
      },
      default: "user",
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    addresses: [addressSchema],
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Mongoose Indexes
userSchema.index({ email: 1 });
userSchema.index({ passwordResetToken: 1 });

// Mongoose Pre-save hook: Hash password before writing to DB
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Mongoose Instance Method: Verify client password comparison
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Export model
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
