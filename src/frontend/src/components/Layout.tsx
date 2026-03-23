import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck,
  Car,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { UserProfile } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { AudiRings } from "./AudiLogo";

export type AppPage =
  | "dashboard"
  | "test-drives"
  | "car-models"
  | "dealer-locations"
  | "users"
  | "settings";

type NavItem = {
  id: AppPage;
  label: string;
  icon: React.ReactNode;
  roles: ("superadmin" | "admin" | "user")[];
};

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    roles: ["superadmin", "admin", "user"],
  },
  {
    id: "test-drives",
    label: "Test Drives",
    icon: <CalendarCheck size={18} />,
    roles: ["superadmin", "admin", "user"],
  },
  {
    id: "car-models",
    label: "Car Models",
    icon: <Car size={18} />,
    roles: ["superadmin", "admin"],
  },
  {
    id: "dealer-locations",
    label: "Dealer Locations",
    icon: <MapPin size={18} />,
    roles: ["superadmin", "admin"],
  },
  {
    id: "users",
    label: "Users",
    icon: <Users size={18} />,
    roles: ["superadmin", "admin"],
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings size={18} />,
    roles: ["superadmin", "admin", "user"],
  },
];

interface LayoutProps {
  children: React.ReactNode;
  currentPage: AppPage;
  onPageChange: (page: AppPage) => void;
  userRole: "superadmin" | "admin" | "user";
  profile: UserProfile | null;
}

export function Layout({
  children,
  currentPage,
  onPageChange,
  userRole,
  profile,
}: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { clear } = useInternetIdentity();
  const qc = useQueryClient();

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  const visibleNav = navItems.filter((n) => n.roles.includes(userRole));

  const roleLabel =
    userRole === "superadmin"
      ? "Super Admin"
      : userRole === "admin"
        ? "Admin"
        : "User";
  const roleBadgeColor =
    userRole === "superadmin"
      ? "bg-[#BB0A21]/20 text-[#BB0A21]"
      : userRole === "admin"
        ? "bg-blue-500/15 text-blue-400"
        : "bg-zinc-500/15 text-zinc-300";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#2E2E2E]">
        <div className="flex items-center gap-3">
          <AudiRings size={36} />
        </div>
        <p className="text-[11px] text-zinc-500 mt-2 uppercase tracking-widest font-medium">
          Test Drive Dashboard
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleNav.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => {
                onPageChange(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-[#BB0A21] text-white"
                  : "text-zinc-400 hover:text-white hover:bg-[#2E2E2E]"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-3 pb-4 border-t border-[#2E2E2E] pt-4">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-[#BB0A21]/20 flex items-center justify-center text-[#BB0A21] text-xs font-bold">
            {profile?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">
              {profile?.name ?? "User"}
            </p>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleBadgeColor}`}
            >
              {roleLabel}
            </span>
          </div>
        </div>
        <button
          type="button"
          data-ocid="nav.logout.button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-[#2E2E2E] transition-colors mt-1"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#1C1C1C] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-[#141414] border-r border-[#2E2E2E] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-56 bg-[#141414] border-r border-[#2E2E2E] z-50 lg:hidden flex flex-col"
            >
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[#2E2E2E] bg-[#1C1C1C] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 text-zinc-400 hover:text-white"
              onClick={() => setMobileOpen(true)}
              data-ocid="nav.menu.button"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-white">
                {navItems.find((n) => n.id === currentPage)?.label}
              </h1>
              <p className="text-xs text-zinc-500 hidden sm:block">
                Welcome back, {profile?.name ?? "User"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#BB0A21]/20 flex items-center justify-center text-[#BB0A21] text-xs font-bold">
                {profile?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="text-sm text-zinc-300 font-medium">
                {profile?.name ?? "User"}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
