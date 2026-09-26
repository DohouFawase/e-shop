import type { Metadata } from "next";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardTopbar from "@/components/dashboard-topbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Naya Admin" },
};

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <Toaster position="top-right" richColors closeButton duration={4000} />
      <DashboardSidebar />

      <div className="ml-65 min-h-screen min-w-0">
        <DashboardTopbar title="Dashboard" />
        <main className="site-container min-h-screen pb-6 pt-31">{children}</main>
      </div>
    </div>
  );
}