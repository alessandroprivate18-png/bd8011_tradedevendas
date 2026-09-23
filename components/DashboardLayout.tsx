"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import type { ActiveTab } from "@/lib/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onRefreshData?: () => void;
  refreshing?: boolean;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  usuarioNome: string;
  onSair: () => void;
}

export function DashboardLayout({
  children,
  onRefreshData,
  refreshing,
  activeTab,
  onSelectTab,
  usuarioNome,
  onSair,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Overlay para Mobile */}
      <div
        className={`mobile-overlay ${mobileOpen ? "active" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Barra Lateral */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
      />

      {/* Conteúdo Principal com Cabeçalho */}
      <div className={`main-wrapper ${collapsed ? "collapsed" : ""}`}>
        <Header
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onRefreshData={onRefreshData}
          refreshing={refreshing}
          usuarioNome={usuarioNome}
          onSair={onSair}
        />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
