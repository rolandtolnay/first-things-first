import { MainLayout } from "@/components/layout/MainLayout";
import { Sidebar } from "@/components/sidebar/Sidebar";

export default function Home() {
  return (
    <MainLayout sidebar={<Sidebar />}>
      <div className="p-4">
        <p className="text-muted-foreground">Calendar will appear here</p>
      </div>
    </MainLayout>
  );
}
