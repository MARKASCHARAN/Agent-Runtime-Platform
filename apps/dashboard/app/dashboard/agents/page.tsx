"use client";

import { useEffect, useState } from "react";

type AgentRole = {
  id: string;
  name: string;
  allowedIntents: string;
};

type AgentRecord = {
  id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "SUSPENDED" | "RETIRED";
  role?: AgentRole;
  createdAt: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/agents`, {
        headers: {
          "x-api-key": "dev-api-key",
          "x-project-id": "proj_123",
          "x-user-role": "admin",
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAgents(data);
      } else {
        console.error("API returned non-array:", data);
        setAgents([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAgents();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const endpoint = currentStatus === "ACTIVE" ? "suspend" : "activate";
    await fetch(`${API_BASE_URL}/inventory/agents/${id}/${endpoint}`, {
      method: "PATCH",
      headers: {
        "x-api-key": "dev-api-key",
        "x-project-id": "proj_123",
        "x-user-role": "admin",
      },
    });
    fetchAgents();
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading Agents...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4 border-gray-700">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Agent Workforce</h1>
          <p className="text-gray-400 mt-2">
            Manage your autonomous AI agents, their roles, and global kill switches.
          </p>
        </div>
      </div>

      <div className="border border-gray-700 rounded-md overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-4 font-medium">Agent Name</th>
              <th className="p-4 font-medium">Role / RBAC</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Registered</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-900 text-gray-300">
            {agents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No agents found in inventory.
                </td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-800/50">
                  <td className="p-4 font-medium text-white">
                    {agent.name}
                    {agent.description && (
                      <p className="text-xs text-gray-500 font-normal">
                        {agent.description}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    {agent.role ? (
                      <div className="space-y-1">
                        <span className="px-2 py-1 bg-blue-900/50 text-blue-400 text-xs rounded-full border border-blue-800/50">
                          {agent.role.name}
                        </span>
                        <p className="text-[10px] text-gray-500 mt-1">
                          Intents: {agent.role.allowedIntents}
                        </p>
                      </div>
                    ) : (
                      <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        agent.status === "ACTIVE"
                          ? "bg-green-900/50 text-green-400 border border-green-800/50"
                          : agent.status === "SUSPENDED"
                          ? "bg-red-900/50 text-red-400 border border-red-800/50"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    {agent.status === "ACTIVE" ? (
                      <button
                        onClick={() => toggleStatus(agent.id, agent.status)}
                        className="px-3 py-1.5 bg-red-950 text-red-400 border border-red-900 hover:bg-red-900 rounded-md text-xs font-medium transition-colors"
                      >
                        Kill Switch
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleStatus(agent.id, agent.status)}
                        className="px-3 py-1.5 bg-green-950 text-green-400 border border-green-900 hover:bg-green-900 rounded-md text-xs font-medium transition-colors"
                      >
                        Reactivate
                      </button>
                    )}
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
