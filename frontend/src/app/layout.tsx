import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Panamerican Aerobic Gymnastics Championship",
  description: "Registration system for the Panamerican Aerobic Gymnastics Championship. Register choreographies and manage gymnast participation.",
  keywords: ["gymnastics", "aerobic", "panamerican", "championship", "registration", "choreography"],
  authors: [{ name: "Tournament Organization" }],
  robots: "noindex, nofollow", // Since this is a private tournament system
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#667eea",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
} 