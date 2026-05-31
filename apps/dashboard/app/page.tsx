"use client";

import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

type PolicySet = {
  id: string;
  name: string;
  version: number;
};

type ApprovalDecision = {
  id: string;
  actionIntent: string;
  context: Record<string, unknown>;
};

type ComplianceReport = {
  status: string;
  summary: {
    totalDecisions: number;
    deniedActions: number;
    highRiskMemoryAnomalies: number;
  };
};

type RuntimeEvent = {
  event: string;
  payload: Record<string, unknown>;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID ?? "default";
const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "dev-api-key";

function authHeaders(role: "viewer" | "approver" | "admin" = "viewer") {
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "x-project-id": projectId,
    "x-user-role": role,
  };
}

export default function Home() {
  const [policies, setPolicies] = useState<PolicySet[]>([]);
  const [approvals, setApprovals] = useState<ApprovalDecision[]>([]);
  const [compliance, setCompliance] = useState<ComplianceReport | null>(null);
  const [liveEvents, setLiveEvents] = useState<RuntimeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [correlationId, setCorrelationId] = useState("trace-12345");

  const firstPolicyId = useMemo(() => policies[0]?.id, [policies]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${apiBase}/policy/sets?projectId=${projectId}`, {
          headers: authHeaders(),
        });

        if (res.ok) {
          const data = (await res.json()) as PolicySet[];
          setPolicies(data);

          if (data.length > 0) {
            const approvalRes = await fetch(`${apiBase}/policy/sets/${data[0].id}/approvals`, {
              headers: authHeaders("approver"),
            });
            if (approvalRes.ok) {
              setApprovals((await approvalRes.json()) as ApprovalDecision[]);
            }
          }
        }

        const compRes = await fetch(`${apiBase}/compliance/report/${projectId}`, {
          headers: authHeaders(),
        });
        if (compRes.ok) {
          setCompliance((await compRes.json()) as ComplianceReport);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const socket: Socket = io(apiBase, {
      transports: ["websocket"],
      extraHeaders: {
        "x-api-key": apiKey,
        "x-project-id": projectId,
        "x-user-role": "viewer",
      },
    });

    const onApprovalRequired = (payload: Record<string, unknown>) => {
      setLiveEvents((current) => [{ event: "approval.required", payload }, ...current].slice(0, 20));
    };

    const onIntervention = (payload: Record<string, unknown>) => {
      setLiveEvents((current) => [{ event: "policy.intervention", payload }, ...current].slice(0, 20));
    };

    const onMemoryAnomaly = (payload: Record<string, unknown>) => {
      setLiveEvents((current) => [{ event: "memory.anomaly", payload }, ...current].slice(0, 20));
    };

    socket.on("approval.required", onApprovalRequired);
    socket.on("policy.intervention", onIntervention);
    socket.on("memory.anomaly", onMemoryAnomaly);

    return () => {
      socket.off("approval.required", onApprovalRequired);
      socket.off("policy.intervention", onIntervention);
      socket.off("memory.anomaly", onMemoryAnomaly);
      socket.disconnect();
    };
  }, []);

  const handleResolve = async (id: string, resolution: "ALLOW" | "DENY") => {
    try {
      const res = await fetch(`${apiBase}/policy/decisions/${id}/resolve`, {
        method: "POST",
        headers: authHeaders("approver"),
        body: JSON.stringify({ resolution }),
      });
      if (res.ok) {
        setApprovals((current) => current.filter((approval) => approval.id !== id));
      }
    } catch (error) {
      console.error("Failed to resolve approval", error);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${apiBase}/replay/export/${correlationId}`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `evidence-${correlationId}.json`;
        a.click();
      }
    } catch (error) {
      console.error("Failed to export evidence", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-10">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-blue-900">Agent Runtime Security Platform</h1>
        <p className="mt-2 text-lg text-gray-600">Realtime Security Dashboard</p>
      </header>

      <main className="space-y-10">
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Runtime Policy Engine</h2>
          {loading ? (
            <p>Loading policies...</p>
          ) : policies.length === 0 ? (
            <p className="text-gray-500">No policies found for this project.</p>
          ) : (
            <ul className="space-y-4">
              {policies.map((policy) => (
                <li key={policy.id} className="p-4 border rounded bg-gray-50">
                  <h3 className="font-bold">{policy.name}</h3>
                  <p className="text-sm text-gray-600">Version: {policy.version}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-orange-200">
          <h2 className="text-2xl font-semibold mb-4 text-orange-700">Governance: Pending Approvals</h2>
          {approvals.length === 0 ? (
            <p className="text-gray-500">No high-risk actions pending approval.</p>
          ) : (
            <ul className="space-y-4">
              {approvals.map((approval) => (
                <li
                  key={approval.id}
                  className="p-4 border border-orange-300 rounded bg-orange-50 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold">Intent: {approval.actionIntent}</h3>
                    <p className="text-sm text-gray-700">Context: {JSON.stringify(approval.context)}</p>
                  </div>
                  <div className="space-x-3">
                    <button
                      onClick={() => handleResolve(approval.id, "ALLOW")}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleResolve(approval.id, "DENY")}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Deny
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <div className="flex justify-between items-center gap-3">
            <h2 className="text-2xl font-semibold">Attack Replay Engine</h2>
            <div className="flex items-center gap-2">
              <input
                value={correlationId}
                onChange={(event) => setCorrelationId(event.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
                placeholder="Correlation ID"
              />
              <button
                onClick={handleExport}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Export Evidence Bundle
              </button>
            </div>
          </div>
          <p className="text-gray-500">Active policy set: {firstPolicyId ?? "none"}</p>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
          <h2 className="text-2xl font-semibold mb-4 text-blue-900">Governance: Compliance Report</h2>
          {!compliance ? (
            <p className="text-gray-500">Loading compliance data...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded bg-blue-50">
                <p className="text-sm text-gray-600">Total Decisions</p>
                <p className="text-2xl font-bold">{compliance.summary.totalDecisions}</p>
              </div>
              <div className="p-4 border rounded bg-blue-50">
                <p className="text-sm text-gray-600">Denied Actions</p>
                <p className="text-2xl font-bold">{compliance.summary.deniedActions}</p>
              </div>
              <div className="p-4 border rounded bg-blue-50">
                <p className="text-sm text-gray-600">Memory Anomalies</p>
                <p className="text-2xl font-bold">{compliance.summary.highRiskMemoryAnomalies}</p>
              </div>
              <div className="p-4 border rounded bg-blue-50">
                <p className="text-sm text-gray-600">Compliance Status</p>
                <p
                  className={`text-2xl font-bold ${
                    compliance.status === "COMPLIANT" ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {compliance.status}
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Live Runtime Events</h2>
          {liveEvents.length === 0 ? (
            <p className="text-gray-500">Waiting for websocket events...</p>
          ) : (
            <ul className="space-y-3">
              {liveEvents.map((event, index) => (
                <li key={`${event.event}-${index}`} className="border rounded p-3 bg-gray-50">
                  <p className="font-semibold">{event.event}</p>
                  <pre className="text-xs overflow-auto">{JSON.stringify(event.payload, null, 2)}</pre>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
