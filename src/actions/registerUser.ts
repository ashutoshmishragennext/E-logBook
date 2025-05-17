"use server";

import { sendEmail } from "@/lib/mailer";
import { generateEmailVerificationToken } from "@/lib/token";
import { RegisterUserSchema } from "@/validaton-schema";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createUser, findUserByEmail } from "./user";

export async function registerUser(values: z.infer<typeof RegisterUserSchema>) {
  const validation = RegisterUserSchema.safeParse(values);
  if (!validation.success) {
    return { error: "Invalid fields!" } as const;
  }

  const { email, name, password, phone, role } = validation.data;

  const existingUser = await findUserByEmail(email!);
  if (existingUser) {
    return { error: "User with this email already exists!" } as const;
  }

  const hashedPassword = await bcrypt.hash(password!, 10);
  await createUser({
    name,
    email,
    password: hashedPassword,
    phone,
    role: role || "STUDENT",
    updatedAt: new Date(),
  });

  const verificationToken = await generateEmailVerificationToken(email);

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



    return {
      success: "User created successfully and confirmation email sent!",
    } as const;
  } else {
    return { error: "Some error occurred!" } as const;
  }
}
