import { WeekView } from "@/components/calendar/WeekView";
import { AppActions } from "@/components/layout/AppActions";

export default function Home() {
  return <WeekView toolbarActions={<AppActions />} />;
}
