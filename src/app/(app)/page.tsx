import { WeekView } from "@/components/calendar/WeekView";
import { AppActions } from "@/components/layout/AppActions";
import { TodayView } from "@/components/today/TodayView";

export default function Home() {
  // Phone widths get the single-day companion; the seven-Day workspace stays
  // the planning surface everywhere else. CSS-only swap keeps hydration stable.
  return (
    <>
      <div className="hidden h-full min-[769px]:block">
        <WeekView toolbarActions={<AppActions />} />
      </div>
      <div className="h-full min-[769px]:hidden">
        <TodayView />
      </div>
    </>
  );
}
