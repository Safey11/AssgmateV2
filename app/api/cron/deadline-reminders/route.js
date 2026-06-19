import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import User from "@/models/User";
import { Resend } from "resend";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Find assignments due tomorrow that haven't been reminded
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const assignments = await Assignment.find({
      dueDate: { $gte: tomorrow, $lt: dayAfter },
      reminderSent: false,
    });

    let sent = 0;

    for (const assignment of assignments) {
      try {
        const user = await User.findById(assignment.userId);
        if (!user) continue;

        await resend.emails.send({
          from: "AssignMate <onboarding@resend.dev>",
          to: user.email,
          subject: `⏰ Reminder: "${assignment.title}" is due tomorrow!`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a0a; color: white; padding: 24px; border-radius: 12px;">
              <h2 style="color: #7c3aed;">AssignMate</h2>
              <h3 style="color: white;">⏰ Assignment due tomorrow!</h3>
              <p style="color: #888;">Hey ${user.name.split(" ")[0]}, don't forget!</p>

              <div style="background: #111; border: 1px solid #ef4444; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="color: white; font-weight: bold; font-size: 18px; margin: 0;">${assignment.title}</p>
                <p style="color: #888; font-size: 13px; margin: 8px 0 0;">Due: ${new Date(assignment.dueDate).toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                <p style="color: #888; font-size: 13px; margin: 4px 0 0;">Format: ${assignment.format.toUpperCase()}</p>
              </div>

              <a href="https://assgmate-v2.vercel.app/history"
                style="display: block; background: #7c3aed; color: white; padding: 14px 24px; border-radius: 10px; text-decoration: none; text-align: center; font-weight: bold; margin-top: 20px;">
                View Assignment →
              </a>

              <p style="color: #555; font-size: 12px; text-align: center; margin-top: 20px;">
                AssignMate · Built for students, by a student
              </p>
            </div>
          `,
        });

        // Mark reminder as sent
        assignment.reminderSent = true;
        await assignment.save();
        sent++;
      } catch (err) {
        console.error(`Failed reminder for ${assignment._id}:`, err.message);
      }
    }

    return NextResponse.json({ message: `Sent ${sent} deadline reminders` });
  } catch (error) {
    console.error("Deadline reminder error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}