"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import { DashboardProvider, useDashboardTab } from "@/lib/DashboardContext";

interface DashboardClientProps {
  children: ReactNode;
  userName: string;
}

function DashboardInner({ children, userName }: DashboardClientProps) {
  const { activeTab, setActiveTab } = useDashboardTab();
  const pathname = usePathname();
  const isDashboard = pathname === "/";

  if (!isDashboard) {
    return <div className="root-layout-nosidebar">{children}</div>;
  }

  return (
    <div className="root-layout">
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={userName}
      />
      <main className="root-layout-content">{children}</main>
    </div>
  );
}

export default function DashboardClient({
  children,
  userName,
}: DashboardClientProps) {
  return (
    <DashboardProvider>
      <DashboardInner userName={userName}>{children}</DashboardInner>
    </DashboardProvider>
  );
}
