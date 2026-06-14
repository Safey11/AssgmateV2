import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";
import { Resend } from "resend";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiptUrl, amount } = await req.json();
    if (!receiptUrl) {
      return NextResponse.json({ error: "Receipt is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    user.pendingPayment = {
      receiptUrl,
      amount,
      submittedAt: new Date(),
      status: "pending",
    };
    await user.save();

    // Send email notification to admin
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "AssignMate <onboarding@resend.dev>",
        to: "safeysafo@gmail.com",
        subject: "🔔 New Pro Payment Request",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a0a; color: white; padding: 24px; border-radius: 12px;">
            <h2 style="color: #7c3aed;">AssignMate Admin</h2>
            <h3 style="color: white;">New Pro Payment Request 🔔</h3>
            
            <div style="background: #111; border: 1px solid #333; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="color: #aaa; margin: 4px 0;"><strong style="color: white;">👤 Name:</strong> ${user.name}</p>
              <p style="color: #aaa; margin: 4px 0;"><strong style="color: white;">📧 Email:</strong> ${user.email}</p>
              <p style="color: #aaa; margin: 4px 0;"><strong style="color: white;">💰 Amount:</strong> Rs ${amount}</p>
              <p style="color: #aaa; margin: 4px 0;"><strong style="color: white;">⏰ Time:</strong> ${new Date().toLocaleString("en-PK")}</p>
            </div>

            <div style="margin: 16px 0;">
              <p style="color: #aaa;"><strong style="color: white;">🧾 Receipt:</strong></p>
              <img src="${receiptUrl}" style="width: 100%; border-radius: 8px; margin-top: 8px;" />
            </div>

            <a href="https://assgmate-v2.vercel.app/admin" 
               style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
              ✅ Go to Admin Panel
            </a>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email error:", emailError.message);
    }

    return NextResponse.json({ message: "Payment submitted successfully" });
  } catch (error) {
    console.error("Payment notify error:", error);
    return NextResponse.json({ error: "Failed to submit payment" }, { status: 500 });
  }
}