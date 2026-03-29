"use client";

import { useState, useEffect } from "react";
import { SLOT_HEIGHT } from "@/lib/constants";

export function CurrentTimeIndicator() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Only render between 8:00 and 20:00
  if (hours < 8 || hours >= 20) return null;

  const top = ((hours - 8) * 60 + minutes) / 30 * SLOT_HEIGHT;

  return (
    <div
      className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
      style={{ top: `${top}px` }}
    >
      <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 flex-shrink-0" />
      <div className="flex-1 h-[2px] bg-red-500" />
    </div>
  );
}
