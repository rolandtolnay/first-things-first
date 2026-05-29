"use client";

import { useState, useEffect } from "react";
import { DAY_START_HOUR, DAY_END_HOUR, timeToPixels } from "@/lib/time-model";

export function CurrentTimeIndicator() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Only render between 8:00 and 20:00
  if (hours < DAY_START_HOUR || hours >= DAY_END_HOUR) return null;

  const top = timeToPixels(hours, minutes);

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
