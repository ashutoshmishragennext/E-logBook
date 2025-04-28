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
      "Nextjs Auth",
      verificationToken.email,
      "Activate Your Account",
      `<p>Hello,</p>
       <p>Thank you for registering with us!</p>
       <p>Please verify your email address by clicking the link below:</p>
       <p><a href="${url}">Activate Account</a></p>
       <p>If you did not request this, you can safely ignore this email.</p>
       <p>Thank you,<br>The [Your Company Name] Team</p>`
    );
    

    return {
      success: "User created successfully and confirmation email sent!",
    } as const;
  } else {
    return { error: "Some error occurred!" } as const;
  }
}
