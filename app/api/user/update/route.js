import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();

    // Update name
    if (body.name) {
      user.name = body.name;
    }

    // Update password
    if (body.currentPassword && body.newPassword) {
      const isValid = await bcrypt.compare(body.currentPassword, user.password);
      if (!isValid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      user.password = await bcrypt.hash(body.newPassword, 10);
    }

    await user.save();
    return NextResponse.json({ message: "Updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}