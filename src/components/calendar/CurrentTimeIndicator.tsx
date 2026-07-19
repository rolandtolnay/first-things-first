"use client";

import { useState, useEffect } from "react";
import { timeToPixels, weekDayBounds } from "@/lib/time-model";
import { useWeekStore } from "@/stores/weekStore";

export function CurrentTimeIndicator() {
  const dayBounds = useWeekStore((state) => weekDayBounds(state.currentWeek));
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Only render inside the week's planning-day window
  if (hours < dayBounds.startHour || hours >= dayBounds.endHour) return null;

  const top = timeToPixels(hours, minutes, dayBounds);

  return (
    <div
      className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
      style={{ top: `${top}px` }}
    >
      <span
        className="flex-shrink-0 rounded-full"
        style={{
          width: 7,
          height: 7,
          marginLeft: -3,
          background: "var(--ds-accent)",
          boxShadow: "0 0 8px var(--ds-accent)",
        }}
      />
      <span
        className="flex-1"
        style={{ height: 1, background: "var(--ds-accent)", opacity: 0.7 }}
      />
    </div>
  );
}
