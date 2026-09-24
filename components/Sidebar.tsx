"use client";

import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Network,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Radio,
  BarChart3,
  MapPin,
} from "lucide-react";
import type { ActiveTab } from "@/lib/types";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  collapsed: boolean;
  badge?: string;
  badgeColor?: string;
  onClick: () => void;
}

function NavItem({
  icon: Icon,
  label,
  active,
  collapsed,
  badge,
  badgeColor = "var(--color-accent)",
  onClick,
}: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`nav-item ${active ? "active" : ""}`}
      title={collapsed ? label : undefined}
      style={{
        width: "100%",
        justifyContent: collapsed ? "center" : "flex-start",
        background: active ? "var(--color-accent-subtle)" : "transparent",
        color: active ? "var(--color-accent)" : "var(--color-muted)",
        border: active ? "1px solid rgba(59, 130, 246, 0.25)" : "1px solid transparent",
      }}
    >
      <Icon size={20} style={{ flexShrink: 0 }} />
      {!collapsed && (
        <span
          style={{
            flex: 1,
            textAlign: "left",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{label}</span>
          {badge && (
            <span
              style={{
                fontSize: 10,
                padding: "2px 6px",
                borderRadius: 10,
                background: badgeColor,
                color: "#fff",
                fontWeight: 600,
              }}
            >
              {badge}
            </span>
          )}
        </span>
      )}
    </button>
  );
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  activeTab,
  onSelectTab,
}: SidebarProps) {
  const handleSelect = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      {/* Topo / Logo */}
      <div className="sidebar-header">
        <div className="brand-logo">
          <div className="brand-icon">
            <TrendingUp size={20} />
          </div>
          {!collapsed && (
            <div>
              <div style={{ lineHeight: 1.1 }}>Trade Vendas</div>
              <div style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 400 }}>
                Portal Executivo
              </div>
            </div>
          )}
        </div>

        {/* Botão de colapsar no Desktop */}
        <button
          onClick={onToggleCollapse}
          className="icon-button"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          style={{ width: 28, height: 28, display: mobileOpen ? "none" : undefined }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navegação por Abas */}
      <div className="sidebar-nav">
        {!collapsed && <div className="nav-category">Dashboards</div>}

        <NavItem
          icon={LayoutDashboard}
          label="Visão Geral"
          active={activeTab === "visao-geral"}
          collapsed={collapsed}
          onClick={() => handleSelect("visao-geral")}
        />

        <NavItem
          icon={ShoppingCart}
          label="Vendas"
          active={activeTab === "vendas"}
          collapsed={collapsed}
          badge="Tipos"
          onClick={() => handleSelect("vendas")}
        />

        <NavItem
          icon={Users}
          label="Clientes"
          active={activeTab === "clientes"}
          collapsed={collapsed}
          badge="Cobertura"
          badgeColor="var(--color-success)"
          onClick={() => handleSelect("clientes")}
        />

        <NavItem
          icon={Package}
          label="Produtos"
          active={activeTab === "produtos"}
          collapsed={collapsed}
          badge="Curva ABC"
          badgeColor="#f59e0b"
          onClick={() => handleSelect("produtos")}
        />

        <NavItem
          icon={BarChart3}
          label="Gerencial"
          active={activeTab === "gerencial"}
          collapsed={collapsed}
          onClick={() => handleSelect("gerencial")}
        />

        <NavItem
          icon={MapPin}
          label="Roteiro"
          active={activeTab === "roteiro"}
          collapsed={collapsed}
          onClick={() => handleSelect("roteiro")}
        />

        {!collapsed && <div className="nav-category" style={{ marginTop: 12 }}>Redes & Estrutura</div>}

        <NavItem
          icon={Network}
          label="Redes (dim_bd_Redes)"
          active={activeTab === "redes"}
          collapsed={collapsed}
          badge="466 lojas"
          badgeColor="#8b5cf6"
          onClick={() => handleSelect("redes")}
        />

        <NavItem
          icon={Settings}
          label="Configurações"
          active={false}
          collapsed={collapsed}
          onClick={() => {}}
        />
      </div>

      {/* Rodapé / Status */}
      <div className="sidebar-footer">
        {!collapsed ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--color-muted)" }}>
            <Radio size={14} color="var(--color-success)" />
            <span>Supabase Conectado</span>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }} title="Supabase Conectado">
            <Radio size={16} color="var(--color-success)" />
          </div>
        )}
      </div>
    </aside>
  );
}
