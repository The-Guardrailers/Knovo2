"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Crown,
  User,
  CreditCard,
  HelpCircle,
  BookOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName?: string;
}

export default function DashboardSidebar({
  activeTab,
  onTabChange,
  userName,
}: DashboardSidebarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/sign-in");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "premium", label: "Premium", icon: Crown },
  ];

  const profileItems = [
    { label: "My Account", icon: User, action: () => {} },
    { label: "Buy Premium", icon: CreditCard, action: () => {} },
    { label: "Troubleshooting", icon: HelpCircle, action: () => {} },
    { label: "Guidelines", icon: BookOpen, action: () => {} },
  ];

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo + Theme Toggle */}
      <div className="flex items-center justify-between px-5 pt-6 pb-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Logo" width={34} height={34} />
          <span className="bg-gradient-to-r from-purple-700 via-pink-500 to-yellow-600 bg-clip-text text-transparent text-3xl font-bold">
            KNOVO
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-1.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-900/10"
                  : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-200 border border-transparent"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? "text-purple-400" : ""}`}
              />
              {item.label}
              {item.id === "premium" && (
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/20">
                  Pro
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="px-3 pb-5 mt-auto">
        <div className="border-t border-white/[0.06] pt-4 space-y-1">
          {/* User info */}
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              {userName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span
              className="text-sm font-medium truncate"
              style={{ color: "var(--foreground)" }}
            >
              {userName || "User"}
            </span>
          </div>

          {profileItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.action();
                setMobileOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/[0.05] hover:text-gray-200 transition-all duration-200"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 mt-1"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-purple-900/80 backdrop-blur-md border border-purple-500/20 text-gray-300"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop: static, mobile: slide-over */}
      <aside
        className={`dashboard-sidebar fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto w-[260px] shrink-0 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ background: "var(--sidebar-bg, var(--background))" }}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        {SidebarContent}
      </aside>
    </>
  );
}
