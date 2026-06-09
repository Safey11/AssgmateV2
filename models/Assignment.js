import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  question: { type: String, required: true },
  format: { type: String, enum: ["word", "excel", "pptx", "pdf"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema);