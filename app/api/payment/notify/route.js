import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";
import twilio from "twilio";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId, amount } = await req.json();
    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Save payment request
    user.pendingPayment = {
      transactionId,
      amount,
      submittedAt: new Date(),
      status: "pending",
    };
    await user.save();

    // Send WhatsApp notification to admin
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.ADMIN_WHATSAPP,
      body: `🔔 *New Pro Payment Request*\n\n👤 Name: ${user.name}\n📧 Email: ${user.email}\n💳 Transaction ID: ${transactionId}\n💰 Amount: Rs ${amount}\n⏰ Time: ${new Date().toLocaleString("en-PK")}\n\n✅ Go to admin panel to upgrade:\nhttps://assgmate-v2.vercel.app/admin`,
    });

    return NextResponse.json({ message: "Payment submitted successfully" });
  } catch (error) {
    console.error("Payment notify error:", error);
    return NextResponse.json({ error: "Failed to submit payment" }, { status: 500 });
  }
}