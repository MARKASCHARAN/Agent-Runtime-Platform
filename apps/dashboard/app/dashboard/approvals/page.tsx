"use client";

import { useEffect, useState } from "react";
import { ListChecks, User, Terminal, CheckCircle, XCircle } from "lucide-react";

type PolicyDecision = {
  id: string;
  policySetId: string;
  agentRecordId: string;
  intent: string;
  payload: string; // JSON string
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<PolicyDecision[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      const headers = {
        "x-api-key": "dev-api-key",
        "x-project-id": "proj_123",
        "x-user-role": "admin",
      };

      // 1. Fetch all policy sets
      const setsRes = await fetch(`${API_BASE_URL}/policy/sets`, { headers });
      const sets = await setsRes.json();
      
      if (!Array.isArray(sets)) {
        setApprovals([]);
        return;
      }

      // 2. Fetch pending approvals for each set
      const allApprovals: PolicyDecision[] = [];
      for (const set of sets) {
        const appRes = await fetch(`${API_BASE_URL}/policy/sets/${set.id}/approvals`, { headers });
        const appData = await appRes.json();
        if (Array.isArray(appData)) {
          allApprovals.push(...appData);
        }
      }

      setApprovals(allApprovals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      await fetch(`${API_BASE_URL}/policy/decisions/${id}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "dev-api-key",
          "x-project-id": "proj_123",
          "x-user-role": "admin",
        },
        body: JSON.stringify({ action }),
      });
      // Refresh UI optimistically
      setApprovals((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to resolve approval", err);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Loading Governance Queue...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <ListChecks className="w-8 h-8 text-orange-500" /> Human-in-the-Loop Approvals
          </h1>
          <p className="text-slate-400 mt-2">
            Review and resolve pending execution requests that require explicit administrative consent.
          </p>
        </div>
        <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-lg text-sm font-semibold">
          {approvals.length} Pending Requests
        </div>
      </div>
      
      <div className="space-y-4">
        {approvals.length === 0 ? (
          <div className="p-16 border border-slate-800 rounded-xl bg-slate-900/30 flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Queue Empty</h3>
            <p className="text-slate-400">All agent intents have been evaluated or are running securely within bounds.</p>
          </div>
        ) : (
          approvals.map((approval) => (
            <div key={approval.id} className="border border-slate-700 bg-slate-900 rounded-xl overflow-hidden shadow-lg flex flex-col md:flex-row">
              <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-mono">Agent ID</div>
                    <div className="text-sm text-slate-300 font-medium truncate max-w-[200px]" title={approval.agentRecordId}>
                      {approval.agentRecordId}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mb-1">Requested Action</div>
                <div className="text-base text-blue-400 font-mono font-medium">{approval.intent}</div>
                <div className="text-xs text-slate-600 mt-4">
                  {new Date(approval.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="p-6 md:w-2/3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <Terminal className="w-4 h-4" /> Payload Data
                  </div>
                  <pre className="p-4 bg-black rounded-lg border border-slate-800 text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-32">
                    {approval.payload}
                  </pre>
                </div>
                <div className="flex items-center gap-4 mt-6 justify-end">
                  <button 
                    onClick={() => handleResolve(approval.id, "REJECT")}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-800 transition-colors rounded-lg text-sm font-medium"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button 
                    onClick={() => handleResolve(approval.id, "APPROVE")}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white transition-colors rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve Execution
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
