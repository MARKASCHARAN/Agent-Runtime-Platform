"use client";

import { Activity, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    activeAgents: 0,
    threatEvents: 0,
    activePolicies: 0,
    quarantinedAgents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = {
          "x-api-key": "dev-api-key",
          "x-project-id": "proj_123",
          "x-user-role": "admin",
        };

        const [agentsRes, threatsRes, policiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/inventory/agents`, { headers }),
          fetch(`${API_BASE_URL}/threat-intel/leaderboard`, { headers }),
          fetch(`${API_BASE_URL}/policy/sets`, { headers }),
        ]);

        const agents = await agentsRes.json();
        const threats = await threatsRes.json();
        const policies = await policiesRes.json();

        const agentArray = Array.isArray(agents) ? agents : [];
        const threatArray = Array.isArray(threats) ? threats : [];
        const policyArray = Array.isArray(policies) ? policies : [];

        let activeCount = 0;
        let quarantinedCount = 0;
        agentArray.forEach((a: any) => {
          if (a.status === "ACTIVE") activeCount++;
          if (a.status === "SUSPENDED") quarantinedCount++;
        });

        let threatCount = 0;
        threatArray.forEach((a: any) => {
          threatCount += (a.threatEvents?.length || 0);
        });

        setStats({
          activeAgents: activeCount,
          quarantinedAgents: quarantinedCount,
          threatEvents: threatCount,
          activePolicies: policyArray.length,
        });
      } catch (err) {
        console.error("Failed to fetch overview stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">SOC Overview</h1>
          <p className="text-slate-400 mt-2">Real-time pulse of your autonomous agent fleet.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Agents", value: loading ? "-" : stats.activeAgents, icon: Activity, color: "text-blue-500" },
          { label: "Quarantined Agents", value: loading ? "-" : stats.quarantinedAgents, icon: XCircle, color: "text-rose-500" },
          { label: "Threat Events", value: loading ? "-" : stats.threatEvents, icon: ShieldAlert, color: "text-orange-500" },
          { label: "Active Policies", value: loading ? "-" : stats.activePolicies, icon: CheckCircle2, color: "text-emerald-500" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            </div>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </motion.div>
        ))}
      </div>

      <div className="h-96 rounded-2xl bg-slate-900/30 border border-slate-800/60 flex items-center justify-center overflow-hidden relative">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000')] bg-cover bg-center opacity-10 mix-blend-luminosity grayscale"></div>
        <div className="z-10 text-center">
           <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-4" />
           <p className="text-slate-500">Live Global Heatmap Coming Soon...</p>
        </div>
      </div>
    </div>
  );
}
