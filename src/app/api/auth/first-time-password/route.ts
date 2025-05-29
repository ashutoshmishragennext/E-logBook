import { NextRequest, NextResponse } from "next/server";
import { firstTimePasswordChange } from "@/actions/changePassword";

export async function POST(req: NextRequest) {
  try {
    const { newPassword, confirmPassword, userId } = await req.json();

    if (!newPassword || !confirmPassword || !userId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords don't match" },
        { status: 400 }
      );
    }

    const result = await firstTimePasswordChange(
      { newPassword, confirmPassword },
      userId
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: result.success });
  } catch (error) {
    console.error("First-time password change error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}