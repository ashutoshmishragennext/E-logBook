/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { registerUser } from "@/actions/registerUser";
import MainButton from "@/components/common/MainButton";
import { PhoneInput } from "@/components/otp-verify/input-phone";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { RegisterUserSchema, Role } from "@/validaton-schema";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";

// Update the schema to include confirmPassword
const FormSchema = RegisterUserSchema.extend({
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormProps = {
  text: string;
  role: Role;
};

const RegisterForm = ({ text, role }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT",
    },
  });

  const passwordValue = form.watch("password");

  // Password validation checks
  const hasUpperCase = /[A-Z]/.test(passwordValue);
  const hasLowerCase = /[a-z]/.test(passwordValue);
  const hasNumber = /\d/.test(passwordValue);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
    passwordValue
  );
  const hasMinLength = passwordValue.length >= 8;

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (role) {
      data.role = role;
    }

    setError(undefined);
    setSuccess(undefined);
    console.log("Form data", data);

    startTransition(() => {
      registerUser(data)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
          }
          if (data?.success) {
            form.reset();
            setSuccess(data.success);
            toast({
              title: "🎉 Registration success",
              description: data.success,
            });
            setTimeout(() => {
              window.location.href = "/auth/login";
            }, 1000);
          }
        })
        .catch(() => setError("Something went wrong!"));
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center  py-4 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md overflow-hidden border-0 shadow-xl">
        <div className="h-2 bg-gradient-to-r from-dark-blue to-custom-purple"></div>
        <CardHeader className="pb-0">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-dark-blue">Hello!</h2>
            <p className="mt-2 text-sm text-custom-slate">{text}</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left font-medium text-custom-slate">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-slate h-5 w-5 group-hover:text-dark-blue transition-colors duration-200" />
                        <Input
                          {...field}
                          onChange={(e) => {
                            let value = e.target.value;

                            // Capitalize first letter
                            value =
                              value.charAt(0).toUpperCase() + value.slice(1);

                            field.onChange(value);
                          }}
                          value={field.value}
                          className="h-12 w-full rounded-xl border-custom-slate/30 focus:border-dark-blue focus:ring-1 focus:ring-dark-blue transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left font-medium text-custom-slate">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-slate h-5 w-5 group-hover:text-dark-blue transition-colors duration-200" />
                        <Input
                          {...field}
                          className="h-12  w-full rounded-xl border-custom-slate/30 focus:border-dark-blue focus:ring-1 focus:ring-dark-blue transition-all duration-200"
                          placeholder="Enter your email address"
                          type="email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left block font-medium text-custom-slate">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        placeholder="Enter your phone number"
                        defaultCountry="IN"
                        value={field.value}
                        onChange={(value) => {
                          if (!value) {
                            field.onChange("");
                            return;
                          }

                          // Extract only digits
                          const digitsOnly = value.replace(/\D/g, "");

                          // Remove country code "91" if present
                          const localNumber = digitsOnly.startsWith("91")
                            ? digitsOnly.slice(2)
                            : digitsOnly;

                          // Prevent more than 10 digits
                          if (localNumber.length > 10) {
                            return;
                          }

                          // Update with proper formatting
                          if (localNumber.length > 0) {
                            field.onChange(`+91${localNumber}`);
                          } else {
                            field.onChange("");
                          }
                        }}
                        onKeyDown={(e) => {
                          // Additional prevention: block typing if we already have 10 digits
                          const currentValue = field.value || "";
                          const digitsOnly = currentValue.replace(/\D/g, "");
                          const localNumber = digitsOnly.startsWith("91")
                            ? digitsOnly.slice(2)
                            : digitsOnly;

                          // Allow backspace, delete, arrow keys, tab, etc.
                          if (
                            [
                              "Backspace",
                              "Delete",
                              "ArrowLeft",
                              "ArrowRight",
                              "ArrowUp",
                              "ArrowDown",
                              "Tab",
                              "Escape",
                              "Enter",
                            ].includes(e.key)
                          ) {
                            return;
                          }

                          // If we already have 10 digits and user is trying to type a number
                          if (localNumber.length >= 10 && /[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className="h-11  w-full rounded-xl border-custom-slate/30 focus:border-dark-blue focus:ring-1 focus:ring-dark-blue transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => {
                  // Calculate password strength score (0-4)
                  const strengthScore = [
                    hasUpperCase,
                    hasLowerCase,
                    hasNumber,
                    hasSpecialChar,
                  ].filter(Boolean).length;

                  // Add point for minimum length
                  const totalScore = strengthScore + (hasMinLength ? 1 : 0);

                  // Determine strength level and color
                  let strengthLevel = "Very Weak";
                  let strengthColor = "bg-red-500";

                  if (totalScore >= 4) {
                    strengthLevel = "Strong";
                    strengthColor = "bg-green-500";
                  } else if (totalScore >= 3) {
                    strengthLevel = "Medium";
                    strengthColor = "bg-yellow-500";
                  } else if (totalScore >= 2) {
                    strengthLevel = "Weak";
                    strengthColor = "bg-orange-500";
                  }

                  return (
                    <FormItem>
                      <FormLabel className="text-left font-medium text-custom-slate">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-slate h-5 w-5 group-hover:text-dark-blue transition-colors duration-200" />
                          <Input
                            {...field}
                            className="h-12 pr-10 w-full rounded-xl border-custom-slate/30 focus:border-dark-blue focus:ring-1 focus:ring-dark-blue transition-all duration-200"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-custom-slate hover:text-dark-blue transition-colors duration-200"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>

                      {/* Password strength indicator */}
                      {passwordValue && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-custom-slate">
                              Password strength
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                totalScore >= 4
                                  ? "text-green-600"
                                  : totalScore >= 3
                                  ? "text-yellow-600"
                                  : totalScore >= 2
                                  ? "text-orange-600"
                                  : "text-red-600"
                              }`}
                            >
                              {strengthLevel}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                            <div
                              className={`h-1.5 rounded-xl ${strengthColor} transition-all duration-300`}
                              style={{ width: `${(totalScore / 5) * 100}%` }}
                            ></div>
                          </div>

                          {/* Brief requirements hint */}
                          <p className="text-xs text-custom-slate/70">
                            Include uppercase, lowercase, number, special
                            character, and at least 8 characters
                          </p>
                        </div>
                      )}

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left font-medium text-custom-slate">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-slate h-5 w-5 group-hover:text-dark-blue transition-colors duration-200" />
                        <Input
                          {...field}
                          className="h-12  pr-10 w-full rounded-xl border-custom-slate/30 focus:border-dark-blue focus:ring-1 focus:ring-dark-blue transition-all duration-200"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-custom-slate hover:text-dark-blue transition-colors duration-200"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormError message={error} />
              <FormSuccess message={success} />

              <MainButton
                text="Create Account"
                classes="h-12 rounded-lg shadow-lg hover:shadow-xl bg-gradient-to-r from-dark-blue to-custom-purple hover:from-custom-purple hover:to-dark-blue transition-all duration-500"
                width="full_width"
                isSubmitable
                isLoading={isPending}
              />

              <div className="text-center mt-5">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-custom-slate hover:text-dark-blue transition-colors duration-200 underline-offset-4 "
                >
                  Already have an account?{" "}
                  <span className="text-dark-blue hover:underline">
                    Login Instead
                  </span>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;
