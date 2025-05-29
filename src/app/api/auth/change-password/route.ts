// /app/api/auth/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { changePassword } from "@/actions/changePassword";

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword, confirmPassword, userId } = await req.json();

    if (!currentPassword || !newPassword || !confirmPassword || !userId) {
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

    const result = await changePassword(
      { currentPassword, newPassword, confirmPassword },
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
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
