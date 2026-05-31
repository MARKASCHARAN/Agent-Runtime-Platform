"use client";

import { useEffect, useState } from "react";

type ThreatEvent = {
  id: string;
  reason: string;
  riskDelta: number;
  createdAt: string;
};

type AgentRole = {
  name: string;
  maxRiskScore: number;
};

type AgentRecord = {
  id: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED" | "RETIRED";
  currentRiskScore: number;
  role?: AgentRole;
  threatEvents: ThreatEvent[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function ThreatsPage() {
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/threat-intel/leaderboard`, {
        headers: {
          "x-api-key": "dev-api-key",
          "x-project-id": "proj_123",
          "x-user-role": "admin",
        },
      });
      const data = await res.json();
      setAgents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-400">Loading Threat Intelligence...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4 border-gray-700">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-red-500">Threat Intelligence Leaderboard</h1>
          <p className="text-gray-400 mt-2">
            Active defense monitoring. Agents exceeding their max risk score are auto-quarantined.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent, idx) => {
          const maxRisk = agent.role?.maxRiskScore || 100;
          const riskPercentage = Math.min((agent.currentRiskScore / maxRisk) * 100, 100);
          const isQuarantined = agent.status === "SUSPENDED";

          return (
            <div key={agent.id} className="border border-gray-700 bg-gray-900 rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <span className="text-gray-500 text-sm">#{idx + 1}</span>
                      <span>{agent.name}</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{agent.role?.name || "Unassigned Role"}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-bold border ${
                      isQuarantined
                        ? "bg-red-900/50 text-red-500 border-red-800/50"
                        : "bg-orange-900/50 text-orange-400 border-orange-800/50"
                    }`}
                  >
                    {isQuarantined ? "AUTO-QUARANTINED" : "ACTIVE"}
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Current Risk Score</span>
                    <span className={`font-bold ${isQuarantined ? 'text-red-500' : 'text-white'}`}>
                      {agent.currentRiskScore} <span className="text-gray-500 font-normal">/ {maxRisk}</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${isQuarantined ? 'bg-red-500' : 'bg-orange-500'}`}
                      style={{ width: `${riskPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Threat Events</h4>
                  {agent.threatEvents.length === 0 ? (
                    <p className="text-sm text-gray-600 italic">No threat events recorded.</p>
                  ) : (
                    agent.threatEvents.map((evt) => (
                      <div key={evt.id} className="text-sm bg-gray-800/50 p-2 rounded border border-gray-800">
                        <div className="flex justify-between text-red-400 font-medium mb-1">
                          <span>+{evt.riskDelta} Risk</span>
                          <span className="text-xs text-gray-500">{new Date(evt.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-gray-300 text-xs">{evt.reason}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {agents.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 border border-gray-700 rounded-lg">
            No agents found.
          </div>
        )}
      </div>
    </div>
  );
}
