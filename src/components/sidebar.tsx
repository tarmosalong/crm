"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  CheckSquare,
  BarChart3,
  Calendar,
  Settings,
  LogOut,
} from "lucide-react";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/global-search";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Deals", href: "/deals", icon: Handshake },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-700">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Handshake className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">CRM</span>
        </Link>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <GlobalSearch />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/settings" className="flex-1">
            <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <form action={logout}>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

