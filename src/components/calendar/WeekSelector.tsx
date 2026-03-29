"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn, formatWeekId, getWeekNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import type { WeekId } from "@/types";

interface WeekSelectorProps {
  value: WeekId;
  onChange: (weekId: WeekId) => void;
  options: WeekId[];
  existingWeekIds: WeekId[];
}

export function WeekSelector({
  value,
  onChange,
  options,
  existingWeekIds,
}: WeekSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleSelect(weekId: WeekId) {
    onChange(weekId);
    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal"
        >
          <span>
            W{getWeekNumber(value)} &mdash; {formatWeekId(value)}
          </span>
          <ChevronDown
            className={cn("size-4 shrink-0 ml-2 transition-transform", isOpen && "rotate-180")}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 max-h-56 overflow-y-auto" align="start">
        {options.map((weekId) => {
          const isSelected = weekId === value;
          const isPlanned = existingWeekIds.includes(weekId);

          return (
            <button
              key={weekId}
              type="button"
              onClick={() => handleSelect(weekId)}
              className={cn(
                "w-full flex items-center gap-2 text-left text-sm px-3 py-2 cursor-pointer transition-colors",
                "hover:bg-muted",
                isSelected && "bg-muted"
              )}
            >
              <span className="font-medium shrink-0">W{getWeekNumber(weekId)}</span>
              <span className="text-muted-foreground">{formatWeekId(weekId)}</span>
              {isPlanned && (
                <Badge variant="secondary" className="ml-auto">Planned</Badge>
              )}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
