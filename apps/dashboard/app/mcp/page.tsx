"use client";

import { useEffect, useState } from "react";

type McpRegistry = {
  id: string;
  name: string;
  publisher: string;
  schemaHash: string;
  status: "APPROVED" | "REVOKED";
  createdAt: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function McpRegistryPage() {
  const [tools, setTools] = useState<McpRegistry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistry = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/mcp/registry`, {
        headers: {
          "x-api-key": "dev-api-key",
          "x-project-id": "proj_123",
          "x-user-role": "admin",
        },
      });
      const data = await res.json();
      setTools(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistry();
  }, []);

  const revokeTool = async (id: string) => {
    await fetch(`${API_BASE_URL}/mcp/registry/${id}/revoke`, {
      method: "PATCH",
      headers: {
        "x-api-key": "dev-api-key",
        "x-project-id": "proj_123",
        "x-user-role": "admin",
      },
    });
    fetchRegistry();
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading Enterprise Tool Registry...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4 border-gray-700">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Zero Trust Tool Registry</h1>
          <p className="text-gray-400 mt-2">
            Manage the enterprise allowlist of Model Context Protocol (MCP) tools. Agents attempting to use tools with untrusted schema hashes are automatically blocked.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-colors shadow-sm">
          Register Tool
        </button>
      </div>

      <div className="border border-gray-700 rounded-md overflow-hidden bg-gray-900 shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-4 font-medium">Intent / Tool Name</th>
              <th className="p-4 font-medium">Publisher</th>
              <th className="p-4 font-medium">Schema SHA256 Hash</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 text-gray-300">
            {tools.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No tools found in registry. Agents have zero trust and cannot execute any actions.
                </td>
              </tr>
            ) : (
              tools.map((tool) => (
                <tr key={tool.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 font-medium text-white flex items-center space-x-2">
                    <span className="font-mono text-xs bg-gray-800 px-2 py-1 rounded text-blue-400 border border-gray-700">{tool.name}</span>
                  </td>
                  <td className="p-4">
                    {tool.publisher}
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-xs text-gray-500 truncate w-48 bg-black/30 px-2 py-1 rounded border border-gray-800" title={tool.schemaHash}>
                      {tool.schemaHash.substring(0, 32)}...
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-bold border ${
                        tool.status === "APPROVED"
                          ? "bg-green-900/50 text-green-400 border-green-800/50"
                          : "bg-red-900/50 text-red-500 border-red-800/50"
                      }`}
                    >
                      {tool.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {tool.status === "APPROVED" && (
                      <button
                        onClick={() => revokeTool(tool.id)}
                        className="px-3 py-1 bg-red-950/50 text-red-400 border border-red-900/50 hover:bg-red-900 rounded text-xs transition-colors"
                      >
                        Revoke Trust
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
