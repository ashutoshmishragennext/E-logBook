// loginUser.ts
"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import * as z from "zod";
import { findUserByEmail } from "./user";
import { sendEmail } from "@/lib/mailer";
import { LoginSchema } from "@/validaton-schema";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { generateEmailVerificationToken } from "@/lib/token";

export async function loginUser(values: z.infer<typeof LoginSchema>) {
  const validation = LoginSchema.safeParse(values);

  if (!validation.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validation.data;
  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateEmailVerificationToken(existingUser.email);

    if (verificationToken) {
      const emailVerificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_ENDPOINT}`;
      const url = `${emailVerificationUrl}?token=${verificationToken.token}`;

      await sendEmail(
        "Elog Book",
        verificationToken.email,
        "Verify Your Elog Book Account",
        `<p>Hello,</p>
     <p>Welcome to <strong>Elog Book</strong>!</p>
     <p>To complete your registration, please verify your email address by clicking the button below:</p>
     <p><a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
     <p>If you didn’t sign up for Elog Book, please ignore this email.</p>
     <p>Best regards,<br>The Elog Book Team</p>`
      );

      return { success: "Email sent for email verification!" };
    }
  }

  try {
    // Don't include redirectTo in signIn call
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false // Important: disable automatic redirect
    });

    if (result?.error) {
      return { error: "Invalid credentials!" };
    }

    return { success: "Logged in successfully!", redirectTo: DEFAULT_LOGIN_REDIRECT };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    return { error: "An unexpected error occurred." };
  }
}

