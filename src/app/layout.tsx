import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { DatabaseProvider } from "@/providers/DatabaseProvider";
import { DndProvider } from "@/components/dnd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "First Things First",
  description:
    "A weekly planning tool implementing Stephen Covey's Habit 3. Organize your life into roles, set weekly goals, and schedule your priorities.",
  keywords: [
    "weekly planner",
    "time management",
    "Stephen Covey",
    "7 Habits",
    "productivity",
    "goal setting",
    "role-based planning",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <DndProvider>
            <DatabaseProvider>{children}</DatabaseProvider>
          </DndProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
