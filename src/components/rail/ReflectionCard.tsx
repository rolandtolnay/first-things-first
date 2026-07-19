"use client";

import { useEffect, useState } from "react";
import { NotebookPen } from "lucide-react";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { Textarea } from "@/components/ui/textarea";
import { useWeekStore } from "@/stores/weekStore";

/**
 * The viewed Week's closing reflection (written during Weekly Handoff). Renders
 * nothing when the week has none — the resting Rail stays quiet — and stays
 * editable in place afterwards (saved on blur).
 */
export function ReflectionCard() {
  const weekId = useWeekStore((state) => state.currentWeek?.id);
  const reflection = useWeekStore((state) => state.currentWeek?.reflection);
  const saveReflection = useWeekStore((state) => state.saveReflection);
  const [draft, setDraft] = useState(reflection ?? "");

  // Re-sync when navigating between weeks or after an external update.
  useEffect(() => {
    setDraft(reflection ?? "");
  }, [weekId, reflection]);

  if (!reflection) return null;

  return (
    <>
      <hr className="border-border" />
      <div className="flex flex-col gap-2">
        <SectionLabel icon={<NotebookPen strokeWidth={1.4} />}>Reflection</SectionLabel>
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void saveReflection(draft)}
          rows={5}
          className="resize-none border-transparent bg-transparent px-1 text-[12px] leading-[1.5] text-secondary-foreground shadow-none hover:border-[var(--ds-line-soft)] focus-visible:border-[var(--ds-line)]"
          aria-label="Weekly reflection"
        />
      </div>
    </>
  );
}
