import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  plan: { type: String, enum: ["free", "pro"], default: "free" },
  generationsUsed: { type: Number, default: 0 },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  pendingPayment: {
    receiptUrl: { type: String },
    transactionId: { type: String },
    amount: { type: String },
    submittedAt: { type: Date },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);