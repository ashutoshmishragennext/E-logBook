"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { findUserById } from "./user";
import { UsersTable } from "@/db/schema";
import { db } from "@/db";

// Schema for password change
const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Schema for first-time password change (no current password needed)
const FirstTimePasswordChangeSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function changePassword(
  values: z.infer<typeof ChangePasswordSchema>,
  userId: string
) {
  const validation = ChangePasswordSchema.safeParse(values);
  if (!validation.success) {
    return { error: "Invalid fields!" };
  }

  const existingUser = await findUserById(userId);
  if (!existingUser) {
    return { error: "User not found!" };
  }

  const { currentPassword, newPassword } = validation.data;

  // Check if current password is correct
  const passwordMatch = await bcrypt.compare(currentPassword, existingUser.password);
  if (!passwordMatch) {
    return { error: "Current password is incorrect!" };
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and clear default password
  await db
    .update(UsersTable)
    .set({
      password: hashedPassword,
      defaultpassword: null, // Clear default password
      updatedAt: new Date(),
    })
    .where(eq(UsersTable.id, userId));

  return { success: "Password updated successfully!" };
}

export async function firstTimePasswordChange(
  values: z.infer<typeof FirstTimePasswordChangeSchema>,
  userId: string
) {
  const validation = FirstTimePasswordChangeSchema.safeParse(values);
  if (!validation.success) {
    return { error: "Invalid fields!" };
  }

  const existingUser = await findUserById(userId);
  if (!existingUser) {
    return { error: "User not found!" };
  }

  // Check if user actually has a default password
  if (!existingUser.defaultpassword) {
    return { error: "Invalid request!" };
  }

  const { newPassword } = validation.data;

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and clear default password
  await db
    .update(UsersTable)
    .set({
      password: hashedPassword,
      defaultpassword: null, // Clear default password
      updatedAt: new Date(),
    })
    .where(eq(UsersTable.id, userId));

  return { success: "Password updated successfully!" };
}
