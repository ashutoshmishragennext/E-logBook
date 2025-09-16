// src/app/layout.tsx
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "E-Logbook",
  description: "We're here to Increase your Productivity",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider>
            {children} 
            <Toaster position="top-right" richColors  className=""/>
          </ThemeProvider>
        </body>
      </html>
    </SessionProvider>
  );
}