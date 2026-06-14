import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { email, adminKey, plan, resetOnly, clearPayment, rejectPayment } = await req.json();
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();

    let update = {};

    if (resetOnly) {
      update = { generationsUsed: 0 };
    } else if (rejectPayment) {
      update = { "pendingPayment.status": "rejected" };
    } else if (clearPayment) {
      update = { plan: "pro", generationsUsed: 0, "pendingPayment.status": "approved" };
    } else {
      update = { plan, generationsUsed: 0 };
    }

    const user = await User.findOneAndUpdate({ email }, update, { new: true });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ message: "Updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}