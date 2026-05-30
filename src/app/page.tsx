import { AppWindow } from "@/components/layout/AppWindow";
import { WindowChrome } from "@/components/layout/WindowChrome";
import { MainLayout } from "@/components/layout/MainLayout";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { WeekView } from "@/components/calendar/WeekView";
import { Rail } from "@/components/rail/Rail";

export default function Home() {
  return (
    <AppWindow>
      <WindowChrome />
      <MainLayout sidebar={<Sidebar />} rail={<Rail />}>
        <WeekView />
      </MainLayout>
    </AppWindow>
  );
}
