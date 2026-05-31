"use client";

import { useEffect, useState } from "react";
import { BookOpen, Shield, Code, ArrowRight } from "lucide-react";

type PolicyRule = {
  id: string;
  intent: string;
  action: "ALLOW" | "DENY" | "REQUIRE_APPROVAL";
  conditions: string; // JSON string
};

type PolicySet = {
  id: string;
  name: string;
  targetRole: string;
  priority: number;
  rules: PolicyRule[];
  createdAt: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicySet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/policy/sets`, {
        headers: {
          "x-api-key": "dev-api-key",
          "x-project-id": "proj_123",
          "x-user-role": "admin",
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPolicies(data);
      } else {
        setPolicies([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-400">Loading Policy Engine...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-500" /> Runtime Policies
          </h1>
          <p className="text-slate-400 mt-2">
            Define structural rules for your AI agents. Control what tools they can use and when to trigger human-in-the-loop approvals.
          </p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-[0_0_15px_rgba(37,99,235,0.3)]">
          + Create Policy Set
        </button>
      </div>
      
      <div className="space-y-6">
        {policies.length === 0 ? (
          <div className="p-12 border border-slate-800 rounded-xl bg-slate-900/30 flex flex-col items-center justify-center text-center">
            <Shield className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Policies Configured</h3>
            <p className="text-slate-400 max-w-md">Agents currently have no active restrictions. Create a policy set to enforce Zero Trust access controls.</p>
          </div>
        ) : (
          policies.map((policy) => (
            <div key={policy.id} className="border border-slate-800 rounded-xl overflow-hidden bg-[#0A0A0A]">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-900/30 border border-blue-500/20 flex items-center justify-center">
                    <Code className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{policy.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Target Role: <span className="font-mono text-blue-300">{policy.targetRole}</span> • Priority: {policy.priority}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(policy.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Rule Chain</h4>
                <div className="space-y-3">
                  {policy.rules.map((rule, idx) => (
                    <div key={rule.id} className="flex items-center gap-4 text-sm bg-slate-900/30 p-3 rounded border border-slate-800">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 font-mono text-blue-300 bg-black/50 px-2 py-1 rounded border border-slate-800">
                        {rule.intent}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                      <div className="flex-1 text-slate-400 text-xs truncate max-w-xs" title={rule.conditions}>
                        {rule.conditions !== "{}" ? rule.conditions : "No conditions"}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                      <div className={`px-3 py-1 rounded text-xs font-bold border ${
                        rule.action === "ALLOW" ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/50" :
                        rule.action === "DENY" ? "bg-red-900/30 text-red-400 border-red-800/50" :
                        "bg-orange-900/30 text-orange-400 border-orange-800/50"
                      }`}>
                        {rule.action}
                      </div>
                    </div>
                  ))}
                  {policy.rules.length === 0 && (
                    <p className="text-sm text-slate-500 italic">No rules defined in this chain.</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
