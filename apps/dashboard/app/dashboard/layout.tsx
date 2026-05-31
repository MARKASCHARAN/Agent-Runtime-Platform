"use client";

import { Shield, Home, ShieldAlert, Key, Users, BookOpen, Clock, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "Runtime Policies", href: "/dashboard/policies", icon: BookOpen },
    { name: "Approvals", href: "/dashboard/approvals", icon: ShieldAlert },
    { name: "Agent Inventory", href: "/dashboard/agents", icon: Users },
    { name: "Threat Intel", href: "/dashboard/threats", icon: Shield },
    { name: "MCP Trust", href: "/dashboard/mcp", icon: Settings },
    { name: "DLP Configuration", href: "/dashboard/dlp", icon: Key },
    { name: "Audit Replay", href: "/dashboard/replay", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-300 font-sans selection:bg-blue-500/30">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800/60 bg-slate-950/50 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800/60">
          <Link href="/" className="flex items-center gap-2 font-bold text-white hover:text-blue-400 transition-colors">
            <Shield className="w-5 h-5 text-blue-500" />
            <span>SOC Console</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Operations
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                    : "hover:bg-slate-800/50 hover:text-slate-100 border border-transparent"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/60">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-300">AM</span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-slate-200">Admin User</p>
              <p className="text-xs text-slate-500">Global Policy Root</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Global Header */}
        <header className="h-16 border-b border-slate-800/60 bg-slate-950/50 flex items-center justify-between px-8 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">System Secure</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Search Placeholder */}
            <div className="w-64 h-9 bg-slate-900 border border-slate-800 rounded-lg flex items-center px-3 text-sm text-slate-500">
              ⌘K to Search...
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
          {children}
        </div>
      </main>
    </div>
  );
}
