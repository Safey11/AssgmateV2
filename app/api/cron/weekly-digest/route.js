import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Assignment from "@/models/Assignment";
import { Resend } from "resend";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get all users
    const users = await User.find({});

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let emailsSent = 0;

    for (const user of users) {
      try {
        // Get this week's assignments
        const weeklyAssignments = await Assignment.countDocuments({
          userId: user._id,
          createdAt: { $gte: oneWeekAgo },
        });

        // Only email users who have generated at least once
        if (weeklyAssignments === 0 && user.currentStreak === 0) continue;

        const hoursSaved = weeklyAssignments * 0.5;

        await resend.emails.send({
          from: "AssignMate <onboarding@resend.dev>",
          to: user.email,
          subject: `📊 Your weekly AssignMate recap, ${user.name.split(" ")[0]}!`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a0a; color: white; padding: 24px; border-radius: 12px;">
              
              <h2 style="color: #7c3aed; margin-bottom: 4px;">AssignMate</h2>
              <h3 style="color: white; margin-top: 0;">Your weekly recap 📊</h3>
              <p style="color: #888;">Here's what you accomplished this week, ${user.name.split(" ")[0]}!</p>

              <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                  <div style="text-align: center;">
                    <p style="color: #7c3aed; font-size: 32px; font-weight: bold; margin: 0;">${weeklyAssignments}</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0;">Assignments generated</p>
                  </div>
                  <div style="text-align: center;">
                    <p style="color: #f97316; font-size: 32px; font-weight: bold; margin: 0;">${user.currentStreak || 0}🔥</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0;">Day streak</p>
                  </div>
                  <div style="text-align: center;">
                    <p style="color: #22c55e; font-size: 32px; font-weight: bold; margin: 0;">${hoursSaved}h</p>
                    <p style="color: #888; font-size: 12px; margin: 4px 0 0;">Hours saved</p>
                  </div>
                </div>
              </div>

              ${user.currentStreak > 0 ? `
              <div style="background: linear-gradient(to right, rgba(249,115,22,0.1), rgba(239,68,68,0.1)); border: 1px solid rgba(249,115,22,0.2); border-radius: 12px; padding: 16px; margin: 16px 0;">
                <p style="color: #f97316; margin: 0; font-weight: bold;">🔥 ${user.currentStreak} day streak — keep it going!</p>
                <p style="color: #888; font-size: 13px; margin: 4px 0 0;">Come back today to maintain your streak.</p>
              </div>
              ` : `
              <div style="background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2); border-radius: 12px; padding: 16px; margin: 16px 0;">
                <p style="color: #a78bfa; margin: 0; font-weight: bold;">🎯 Start a streak today!</p>
                <p style="color: #888; font-size: 13px; margin: 4px 0 0;">Generate an assignment every day to build your streak.</p>
              </div>
              `}

              ${user.plan === "free" ? `
              <div style="background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2); border-radius: 12px; padding: 16px; margin: 16px 0;">
                <p style="color: #a78bfa; margin: 0; font-weight: bold;">⚡ Invite friends, get bonus generations!</p>
                <p style="color: #888; font-size: 13px; margin: 4px 0 0;">Share your referral link and both of you get 2 free generations.</p>
              </div>
              ` : ""}

              <a href="https://assgmate-v2.vercel.app/generate"
                style="display: block; background: #7c3aed; color: white; padding: 14px 24px; border-radius: 10px; text-decoration: none; text-align: center; font-weight: bold; margin-top: 20px;">
                Generate Assignment ✨
              </a>

              <p style="color: #555; font-size: 12px; text-align: center; margin-top: 20px;">
                AssignMate · Built for students, by a student<br/>
                <a href="https://assgmate-v2.vercel.app" style="color: #7c3aed;">assgmate-v2.vercel.app</a>
              </p>
            </div>
          `,
        });

        emailsSent++;
      } catch (emailError) {
        console.error(`Failed to send to ${user.email}:`, emailError.message);
      }
    }

    return NextResponse.json({ message: `Sent ${emailsSent} weekly digest emails` });
  } catch (error) {
    console.error("Weekly digest error:", error);
    return NextResponse.json({ error: "Failed to send digests" }, { status: 500 });
  }
}