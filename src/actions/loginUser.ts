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
import bcrypt from "bcryptjs";

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
        `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Elog Book Account</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Elog Book!</h1>
      <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Your digital learning companion</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
      <p style="font-size: 18px; margin-bottom: 20px;">Hello,</p>
      
      <p style="margin-bottom: 20px;">Thank you for signing up for <strong>Elog Book</strong>! We're excited to have you join our community.</p>
      
      <div style="background: #f8f9fa; border-left: 4px solid #4f46e5; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #4f46e5; margin: 0 0 15px 0; font-size: 18px;">📧 Email Verification Required</h3>
        <p style="margin: 0; color: #495057;">To complete your registration and secure your account, please verify your email address by clicking the button below.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; transition: transform 0.2s;">
          ✉️ Verify Email Address
        </a>
      </div>
      
      <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h4 style="color: #0c5460; margin: 0 0 10px 0; display: flex; align-items: center;">
          <span style="font-size: 20px; margin-right: 8px;">ℹ️</span>
          Important Note
        </h4>
        <p style="color: #0c5460; margin: 0; font-weight: 500;">
          If you didn't sign up for Elog Book, please ignore this email. Your email address will not be added to our system.
        </p>
      </div>
      
      <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 25px 0; font-size: 14px; color: #6c757d;">
        <p style="margin: 0;"><strong>Having trouble with the button?</strong></p>
        <p style="margin: 5px 0 0 0;">Copy and paste this link into your browser: <br>
        <span style="word-break: break-all; color: #4f46e5;">${url}</span></p>
      </div>
      
      <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; text-align: center; color: #666;">
        <p style="margin: 0;">Need help? Contact our support team</p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">Best regards, <strong>The Elog Book Team</strong></p>
      </div>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
      <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
    </div>
  </body>
  </html>`
      );

      return { success: "Email sent for email verification!" };
    }
  }

  // Check if user is using default password (first-time login)
  const isUsingDefaultPassword = existingUser.defaultpassword &&
    await bcrypt.compare(password, existingUser.password) &&
    password === existingUser.defaultpassword;

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

    // If user is logging in with default password, redirect to password change
    if (isUsingDefaultPassword) {
      return {
        success: "First-time login detected!",
        redirectTo: `/auth/change-password?userId=${existingUser.id}&firstTime=true`,
        requirePasswordChange: true,
        userId: existingUser.id
      };
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