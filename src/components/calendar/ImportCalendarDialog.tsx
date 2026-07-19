"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CalendarPlus, Link2, MapPin } from "lucide-react";
import { useWeekStore } from "@/stores/weekStore";
import {
  buildImportPayload,
  buildImportReview,
  type ImportCandidate,
  type ImportReview,
} from "@/lib/ics-import";
import { DAY_NAMES, getWeekDates } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TextActionButton } from "@/components/ui/TextActionButton";
import type { Week } from "@/types";

interface ImportCalendarDialogProps {
  open: boolean;
  onClose: () => void;
  week: Week | null;
}

interface ReviewState {
  review: ImportReview;
  filename: string;
}

export function ImportCalendarDialog({ open, onClose, week }: ImportCalendarDialogProps) {
  const importWeekItems = useWeekStore((s) => s.importWeekItems);

  const [reviewState, setReviewState] = useState<ReviewState | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dayDates = useMemo(
    () => (week ? getWeekDates(week.id) : null),
    [week]
  );

  const resetAndClose = useCallback(() => {
    if (isSubmitting) return;
    setReviewState(null);
    setSelectedKeys(new Set());
    setFileError(null);
    setIsDragActive(false);
    onClose();
  }, [isSubmitting, onClose]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!week) return;
      setFileError(null);

      if (!file.name.toLowerCase().endsWith(".ics")) {
        setFileError("That doesn't look like a calendar file. Choose a single .ics file.");
        return;
      }

      let review: ImportReview;
      try {
        const text = await file.text();
        review = buildImportReview({ icsText: text, filename: file.name, week });
      } catch {
        setFileError("Couldn't read that calendar file. Try exporting it again from your calendar app.");
        return;
      }

      setReviewState({ review, filename: file.name });
      setSelectedKeys(
        new Set(
          review.candidates
            .filter((candidate) => candidate.status === "importable")
            .map((candidate) => candidate.key)
        )
      );
    },
    [week]
  );

  const toggleCandidate = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  async function submit() {
    if (!reviewState || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = buildImportPayload(reviewState.review.candidates, selectedKeys);
      await importWeekItems(payload);
      setIsSubmitting(false);
      resetAndClose();
    } catch {
      setFileError("Couldn't add the selected items. Please try again.");
      setIsSubmitting(false);
    }
  }

  const review = reviewState?.review;
  const importableSelected = review
    ? review.candidates.filter(
        (candidate) => candidate.status === "importable" && selectedKeys.has(candidate.key)
      ).length
    : 0;

  const candidatesByDay = useMemo(() => {
    if (!review) return [];
    const groups = new Map<number, ImportCandidate[]>();
    for (const candidate of review.candidates) {
      const list = groups.get(candidate.dayIndex) ?? [];
      list.push(candidate);
      groups.set(candidate.dayIndex, list);
    }
    return [...groups.entries()].sort(([left], [right]) => left - right);
  }, [review]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetAndClose();
      }}
    >
      <DialogContent
        showCloseButton={!isSubmitting}
        className="flex max-h-[min(90vh,720px)] max-w-[calc(100%-1rem)] flex-col gap-5 overflow-hidden bg-[var(--ds-overlay)] p-5 sm:max-w-[640px]"
      >
        <DialogHeader className="shrink-0 gap-2 pr-8">
          <DialogTitle className="text-[length:var(--text-h5)]">Import calendar</DialogTitle>
          <DialogDescription>
            Add events from a .ics calendar file to this week. Timed events land on the
            calendar; all-day events become day priorities. Nothing is added until you confirm.
          </DialogDescription>
        </DialogHeader>

        {!review ? (
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragActive(false);
                const file = event.dataTransfer.files?.[0];
                if (file) void handleFile(file);
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-12 text-sm transition-colors",
                isDragActive
                  ? "border-primary bg-primary-soft"
                  : "border-[var(--ds-line)] bg-[var(--ds-panel)] hover:border-border-emphasis hover:bg-card-hover"
              )}
            >
              <CalendarPlus className="size-6 text-muted-foreground" strokeWidth={1.4} />
              <span className="font-medium text-foreground">Choose a .ics file</span>
              <span className="text-caption text-muted-foreground">
                or drop it here — exported from Google Calendar, Apple Calendar, or Outlook
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ics,text/calendar"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
                event.target.value = "";
              }}
            />
            {fileError && (
              <p
                role="alert"
                className="rounded-md border border-[var(--ds-line-soft)] bg-[var(--ds-panel)] px-3 py-2 text-caption text-secondary-foreground"
              >
                {fileError}
              </p>
            )}
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 gap-3 overflow-hidden">
            <SectionLabel
              action={
                <TextActionButton onClick={() => setReviewState(null)} disabled={isSubmitting}>
                  Choose another file
                </TextActionButton>
              }
            >
              {reviewState.filename}
            </SectionLabel>

            <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-1 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-muted-foreground">
              <span>{review.counts.total} this week</span>
              <span className="text-foreground">{importableSelected} selected</span>
              {review.counts.conflicts > 0 && <span>{review.counts.conflicts} conflicts</span>}
              {review.counts.duplicates > 0 && <span>{review.counts.duplicates} duplicates</span>}
              {review.counts.unsupported > 0 && <span>{review.counts.unsupported} skipped</span>}
            </div>

            {review.counts.total === 0 ? (
              <div className="rounded-lg border border-[var(--ds-line-soft)] bg-[var(--ds-panel)] p-5 text-sm text-secondary-foreground">
                <div className="mb-1 font-medium text-foreground">No events found for this week.</div>
                This file has no events between{" "}
                {dayDates
                  ? `${DAY_NAMES[0]} and ${DAY_NAMES[6]} of the week you're viewing`
                  : "the days of the week you're viewing"}
                . Check that you exported the right calendar, or switch to the week the events are in.
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-[var(--ds-line-soft)] bg-[var(--ds-panel)]">
                {candidatesByDay.map(([dayIndex, candidates]) => (
                  <div key={dayIndex} className="border-b border-[var(--ds-line-soft)] last:border-b-0">
                    <div className="px-4 py-2.5 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-muted-foreground">
                      {DAY_NAMES[dayIndex]}
                      {dayDates ? ` ${dayDates[dayIndex].getDate()}` : ""}
                    </div>
                    <div className="border-t border-[var(--ds-line-soft)]">
                      {candidates.map((candidate) => (
                        <CandidateRow
                          key={candidate.key}
                          candidate={candidate}
                          checked={selectedKeys.has(candidate.key)}
                          disabled={isSubmitting}
                          onToggle={() => toggleCandidate(candidate.key)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {fileError && (
              <p
                role="alert"
                className="shrink-0 rounded-md border border-[var(--ds-line-soft)] bg-[var(--ds-panel)] px-3 py-2 text-caption text-secondary-foreground"
              >
                {fileError}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={resetAndClose} disabled={isSubmitting}>
            Cancel
          </Button>
          {review && review.counts.total > 0 && (
            <Button onClick={submit} disabled={isSubmitting || importableSelected === 0}>
              {isSubmitting
                ? "Adding…"
                : importableSelected === 1
                  ? "Add 1 event to this week"
                  : `Add ${importableSelected} events to this week`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CandidateRowProps {
  candidate: ImportCandidate;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}

function CandidateRow({ candidate, checked, disabled, onToggle }: CandidateRowProps) {
  const selectable = candidate.status === "importable";
  const detailParts: React.ReactNode[] = [];

  if (candidate.details.location) {
    detailParts.push(
      <span key="location" className="inline-flex min-w-0 items-center gap-1">
        <MapPin className="size-3 shrink-0" strokeWidth={1.6} aria-hidden={true} />
        <span className="truncate">{candidate.details.location}</span>
      </span>
    );
  }
  const link = candidate.details.meetingLink ?? candidate.details.url;
  if (link) {
    detailParts.push(
      <span key="link" className="inline-flex min-w-0 items-center gap-1">
        <Link2 className="size-3 shrink-0" strokeWidth={1.6} aria-hidden={true} />
        <span className="truncate">{link}</span>
      </span>
    );
  }

  return (
    <label
      className={cn(
        "flex items-start gap-3 border-b border-[var(--ds-line-soft)] px-4 py-3 text-sm last:border-b-0",
        selectable ? "cursor-pointer hover:bg-[var(--ds-hover-tint)]" : "opacity-60"
      )}
    >
      <Checkbox
        checked={selectable ? checked : false}
        onCheckedChange={onToggle}
        disabled={disabled || !selectable}
        className="mt-0.5"
        aria-label={`Import ${candidate.title}`}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate font-medium text-foreground">{candidate.title}</span>
          <span className="shrink-0 font-mono text-[length:var(--text-label)] tabular-nums text-muted-foreground">
            {candidate.timeLabel}
          </span>
        </span>
        {detailParts.length > 0 && (
          <span className="mt-1 flex min-w-0 flex-wrap gap-x-3 gap-y-0.5 text-caption text-muted-foreground">
            {detailParts}
          </span>
        )}
        {candidate.details.notes && (
          <span className="mt-1 block truncate text-caption text-muted-foreground">
            {candidate.details.notes}
          </span>
        )}
        {candidate.reason && (
          <span className="mt-1 block text-caption text-secondary-foreground">
            {candidate.reason}
          </span>
        )}
      </span>
    </label>
  );
}
