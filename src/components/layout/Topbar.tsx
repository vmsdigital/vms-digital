"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Menu, Search, UserPlus, FileCheck, CreditCard, Globe } from "lucide-react";

interface TopbarProps {
  title: string;
  onMenuToggle: () => void;
}

interface Notification {
  id: number;
  icon: React.ReactNode;
  text: string;
  time: string;
  unread: boolean;
}

const mockNotifications: Notification[] = [
  { id: 1, icon: <UserPlus size={16} />, text: "Novo cliente cadastrado: FitMax Academia", time: "5 min atrás", unread: true },
  { id: 2, icon: <FileCheck size={16} />, text: "Proposta aceita: NetFibra Mauá", time: "1h atrás", unread: true },
  { id: 3, icon: <CreditCard size={16} />, text: "Pagamento recebido: R$ 147,00", time: "3h atrás", unread: true },
  { id: 4, icon: <Globe size={16} />, text: "Site publicado: Dra. Ana Carla", time: "1 dia atrás", unread: false },
];

export default function Topbar({ title, onMenuToggle }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  return (
    <header className="flex h-[54px] shrink-0 items-center border-b border-vms-borda bg-vms-sidebar px-4">
      <button
        onClick={onMenuToggle}
        className="mr-3 text-vms-muted hover:text-vms-texto lg:hidden"
      >
        <Menu size={20} />
      </button>

      <h1 className="mr-4 text-base font-semibold text-vms-texto whitespace-nowrap">
        {title}
      </h1>

      <div className="mx-auto hidden max-w-md flex-1 sm:block">
        <div className="relative">
          <Search
            size={15}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-vms-muted"
          />
          <input
            type="text"
            placeholder="Buscar site ou cliente..."
            className="w-full rounded-xl border border-vms-glass-border glass py-1.5 pr-3 pl-9 text-sm text-vms-texto placeholder-vms-muted outline-none transition-colors focus:border-vms-primaria"
          />
        </div>
      </div>

      <div className="ml-4 flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-vms-muted transition-colors hover:text-vms-texto"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-vms-erro" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-vms-borda bg-vms-card p-0 shadow-xl max-h-80 overflow-y-auto z-50">
              <div className="flex items-center justify-between border-b border-vms-borda px-4 py-3">
                <span className="text-sm font-medium text-vms-texto">Notificações</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-vms-muted">{unreadCount} não lidas</span>
                )}
              </div>

              <div className="divide-y divide-vms-borda">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-vms-glass-hover"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-vms-primaria-20 text-vms-primaria">
                      {n.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-vms-texto-2 leading-snug">{n.text}</p>
                      <span className="text-xs text-vms-muted">{n.time}</span>
                    </div>
                    {n.unread && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-vms-primaria" />
                    )}
                  </div>
                ))}
              </div>

              {unreadCount > 0 && (
                <div className="border-t border-vms-borda px-4 py-2.5">
                  <button
                    onClick={handleMarkAllRead}
                    className="w-full text-center text-xs font-medium text-vms-primaria transition-colors hover:text-vms-primaria-hover"
                  >
                    Marcar todas como lidas
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vms-primaria text-xs font-bold text-vms-sidebar">
          VM
        </div>
      </div>
    </header>
  );
}
