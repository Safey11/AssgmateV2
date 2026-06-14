import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    // Security check
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Reset all pro users to free
    const result = await User.updateMany(
      { plan: "pro" },
      { plan: "free", generationsUsed: 0 }
    );

    console.log(`Reset ${result.modifiedCount} pro users to free`);

    return NextResponse.json({
      message: `Reset ${result.modifiedCount} users to free plan`,
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}