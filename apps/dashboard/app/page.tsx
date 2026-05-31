"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [policies, setPolicies] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [compliance, setCompliance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock correlation ID for demo purposes
  const DEMO_CORRELATION_ID = "trace-12345";

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Policies
        const res = await fetch("http://localhost:3000/policy/sets?projectId=default");
        if (res.ok) {
          const data = await res.json();
          setPolicies(data);
          
          if (data.length > 0) {
            const approvalRes = await fetch(`http://localhost:3000/policy/sets/${data[0].id}/approvals`);
            if (approvalRes.ok) {
              setApprovals(await approvalRes.json());
            }
          }
        }

        // Fetch Compliance Report
        const compRes = await fetch("http://localhost:3000/compliance/report/default");
        if (compRes.ok) {
          setCompliance(await compRes.json());
        }

      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleResolve = async (id: string, resolution: 'ALLOW' | 'DENY') => {
    try {
      const res = await fetch(`http://localhost:3000/policy/decisions/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution })
      });
      if (res.ok) {
        setApprovals(approvals.filter((a: any) => a.id !== id));
      }
    } catch (e) {
      console.error("Failed to resolve approval", e);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`http://localhost:3000/replay/export/${DEMO_CORRELATION_ID}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `evidence-${DEMO_CORRELATION_ID}.json`;
        a.click();
      }
    } catch (e) {
      console.error("Failed to export evidence", e);
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
            <p className="text-gray-500">No policies found for this project. The backend is connected but empty.</p>
          ) : (
            <ul className="space-y-4">
              {policies.map((p: any) => (
                <li key={p.id} className="p-4 border rounded bg-gray-50">
                  <h3 className="font-bold">{p.name}</h3>
                  <p className="text-sm text-gray-600">Version: {p.version}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Phase 4: Enterprise Governance - Approvals */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-orange-200">
          <h2 className="text-2xl font-semibold mb-4 text-orange-700">Governance: Pending Approvals</h2>
          {approvals.length === 0 ? (
            <p className="text-gray-500">No high-risk actions pending approval.</p>
          ) : (
            <ul className="space-y-4">
              {approvals.map((a: any) => (
                <li key={a.id} className="p-4 border border-orange-300 rounded bg-orange-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">Intent: {a.actionIntent}</h3>
                    <p className="text-sm text-gray-700">Context: {JSON.stringify(a.context)}</p>
                  </div>
                  <div className="space-x-3">
                    <button onClick={() => handleResolve(a.id, 'ALLOW')} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                    <button onClick={() => handleResolve(a.id, 'DENY')} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Deny</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Phase 4: Enterprise Governance - Replay & Export */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Attack Replay Engine</h2>
            <button onClick={handleExport} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-2">
              <span>Export Evidence Bundle</span>
            </button>
          </div>
          <p className="text-gray-500">Waiting for live execution events for trace: {DEMO_CORRELATION_ID}...</p>
        </section>

        {/* Phase 4: Enterprise Governance - Compliance Report */}
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
                <p className={`text-2xl font-bold ${compliance.status === 'COMPLIANT' ? 'text-green-600' : 'text-orange-600'}`}>
                  {compliance.status}
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
