import type { Metadata } from "next";

import { ThemeProvider } from "@/providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DatabaseProvider } from "@/providers/DatabaseProvider";
import { DndProvider } from "@/components/dnd";
import "./globals.css";
import { cn } from "@/lib/utils";


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
      <body className="font-sans antialiased">
        <ThemeProvider>
          <TooltipProvider>
            <DndProvider>
              <DatabaseProvider>{children}</DatabaseProvider>
            </DndProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
