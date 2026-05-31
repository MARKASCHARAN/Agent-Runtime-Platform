"use client";

import { useEffect, useState } from "react";

type DlpViolation = {
  id: string;
  agentRecordId: string | null;
  intentName: string;
  violationType: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  createdAt: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function DlpDashboardPage() {
  const [violations, setViolations] = useState<DlpViolation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchViolations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/privacy/dlp/violations`, {
        headers: {
          "x-api-key": "dev-api-key",
          "x-project-id": "proj_123",
          "x-user-role": "admin",
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setViolations(data);
      } else {
        console.error("API returned non-array:", data);
        setViolations([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchViolations();
    const interval = setInterval(fetchViolations, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-400">Loading DLP Engine telemetry...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4 border-gray-700">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Data Exfiltration Prevention</h1>
          <p className="text-gray-400 mt-2">
            Real-time monitoring of sensitive data exfiltration attempts. High-severity violations automatically trigger the Agent Kill Switch.
          </p>
        </div>
      </div>

      <div className="border border-gray-700 rounded-md overflow-hidden bg-gray-900 shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-4 font-medium">Time</th>
              <th className="p-4 font-medium">Severity</th>
              <th className="p-4 font-medium">Violation Type</th>
              <th className="p-4 font-medium">Target Intent</th>
              <th className="p-4 font-medium">Agent ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 text-gray-300">
            {violations.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No data exfiltration attempts detected. Zero active threats.
                </td>
              </tr>
            ) : (
              violations.map((v) => (
                <tr key={v.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 text-gray-400 whitespace-nowrap">
                    {new Date(v.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-bold border ${
                        v.severity === "HIGH"
                          ? "bg-red-900/50 text-red-500 border-red-800/50"
                          : v.severity === "MEDIUM"
                          ? "bg-orange-900/50 text-orange-400 border-orange-800/50"
                          : "bg-blue-900/50 text-blue-400 border-blue-800/50"
                      }`}
                    >
                      {v.severity}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-white">
                    {v.violationType}
                  </td>
                  <td className="p-4 text-blue-400 font-medium">
                    {v.intentName}
                  </td>
                  <td className="p-4 text-gray-500 font-mono text-xs truncate max-w-[150px]">
                    {v.agentRecordId || "Unknown"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
