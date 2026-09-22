"use client";

import { Menu, Sun, Moon, Bell, RefreshCw } from "lucide-react";
import { useTheme } from "@/lib/hooks/useTheme";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onRefreshData?: () => void;
  refreshing?: boolean;
}

export function Header({
  onOpenMobileSidebar,
  onRefreshData,
  refreshing = false,
}: HeaderProps) {
  const { isDark, toggleTheme, mounted } = useTheme();

  return (
    <header className="app-header">
      {/* Esquerda: Botão Mobile e Breadcrumbs */}
      <div className="header-left">
        <button
          onClick={onOpenMobileSidebar}
          className="icon-button"
          title="Abrir menu"
          style={{ display: "none" }}
          id="mobile-menu-trigger"
        >
          <Menu size={20} />
        </button>

        <div className="breadcrumbs">
          <span>Portal</span>
          <span>/</span>
          <span className="current">Dashboard de Vendas</span>
        </div>
      </div>

      {/* Direita: Ações e Perfil */}
      <div className="header-right">
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            disabled={refreshing}
            className="icon-button"
            title="Atualizar dados"
          >
            <RefreshCw
              size={18}
              style={{
                animation: refreshing ? "spin 1s linear infinite" : undefined,
              }}
            />
          </button>
        )}

        {/* Alternador de Tema */}
        <button
          onClick={toggleTheme}
          className="icon-button"
          title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
          {mounted && isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notificações */}
        <button className="icon-button" title="Notificações" style={{ position: "relative" }}>
          <Bell size={18} />
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "var(--color-accent)",
            }}
          />
        </button>

        {/* Perfil */}
        <div className="user-badge">
          <div className="user-avatar">AS</div>
          <span className="user-name">Alessandro Silva</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 1024px) {
          #mobile-menu-trigger {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
