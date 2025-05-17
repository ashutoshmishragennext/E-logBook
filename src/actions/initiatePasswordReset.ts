"use server";


import { sendEmail } from "@/lib/mailer";
import { generatePasswordResetToken } from "@/lib/token";
import { z } from "zod";
import { findUserByEmail } from "./user";
import { ForgotPasswordSchema } from "@/validaton-schema";

export async function initiatePasswordReset(
  values: z.infer<typeof ForgotPasswordSchema>
) {
  const validation = ForgotPasswordSchema.safeParse(values);
  if (!validation.success) {
    return { error: "Invalid email!" } as const;
  }

  const { email } = validation.data;

  const existingUser = await findUserByEmail(email);
  if (!existingUser) {
    return { error: "Email not found!" } as const;
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  if (passwordResetToken) {
    const resetPasswordUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_RESET_PASSWORD_ENDPOINT}`;
    const url = `${resetPasswordUrl}?token=${passwordResetToken.token}`;

    await sendEmail(
      "Elog Book ",
      passwordResetToken.email,
      "Verify Your Elog Book Account",
      `<p>Hello,</p>
     <p>Welcome to <strong>Elog Book</strong>!</p>
     <p><a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Please reset Your password</a></p>
     <p>If you didn’t sign up for Elog Book, please ignore this email.</p>
     <p>Best regards,<br>The Elog Book Team</p>`
    );



    return { success: "Reset email sent!" } as const;
  }

  return { error: "Email not sent!" } as const;
}
