import { MainLayout } from "@/components/layout/MainLayout";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { WeekView } from "@/components/calendar/WeekView";

export default function Home() {
  return (
    <MainLayout sidebar={<Sidebar />}>
      <WeekView />
    </MainLayout>
  );
}
