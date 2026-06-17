import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

function generateReferralCode(name) {
  const cleanName = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}${randomNum}`;
}

export async function POST(req) {
  try {
    const { name, email, password, referredBy } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const referralCode = generateReferralCode(name);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      referralCode,
      referredBy: referredBy || null,
      bonusGenerations: referredBy ? 2 : 0, // New user gets 2 bonus if referred
    });

    // Give referrer 2 bonus generations too
    if (referredBy) {
      const referrer = await User.findOne({ referralCode: referredBy });
      if (referrer) {
        referrer.bonusGenerations += 2;
        referrer.referralCount += 1;
        await referrer.save();
      }
    }

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}