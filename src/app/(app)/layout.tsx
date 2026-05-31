import type { ReactNode } from "react";

import { DndProvider } from "@/components/dnd";
import { AppWindow } from "@/components/layout/AppWindow";
import { MainLayout } from "@/components/layout/MainLayout";
import { StoreErrorBanner } from "@/components/layout/StoreErrorBanner";
import { WindowChrome } from "@/components/layout/WindowChrome";
import { Rail } from "@/components/rail/Rail";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { AuthProvider } from "@/providers/AuthProvider";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <DndProvider>
      <AuthProvider>
        <AppWindow>
          <WindowChrome />
          <StoreErrorBanner />
          <MainLayout sidebar={<Sidebar />} rail={<Rail />}>
            {children}
          </MainLayout>
        </AppWindow>
      </AuthProvider>
    </DndProvider>
  );
}
