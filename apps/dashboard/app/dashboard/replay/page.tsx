"use client";

import { useState } from "react";
import { Clock, Search, Server, Cpu, AlertTriangle } from "lucide-react";

type TraceEvent = {
  id: string;
  correlationId: string;
  eventType: "PROMPT" | "INTENT" | "TOOL_EVAL" | "POLICY_DECISION" | "OUTPUT";
  timestamp: string;
  payload: string; // JSON string
  metadata?: string; // JSON string
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function ReplayPage() {
  const [correlationId, setCorrelationId] = useState("");
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correlationId.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`${API_BASE_URL}/replay/timeline/${correlationId.trim()}`, {
        headers: {
          "x-api-key": "dev-api-key",
          "x-project-id": "proj_123",
          "x-user-role": "admin",
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setEvents(data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "PROMPT": return <Server className="w-5 h-5 text-blue-400" />;
      case "INTENT": return <Cpu className="w-5 h-5 text-purple-400" />;
      case "TOOL_EVAL": return <Clock className="w-5 h-5 text-orange-400" />;
      case "POLICY_DECISION": return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default: return <Server className="w-5 h-5 text-emerald-400" />;
    }
  };

  const formatJSON = (str: string) => {
    try {
      return JSON.stringify(JSON.parse(str), null, 2);
    } catch {
      return str;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-6 gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-500" /> Audit Replay
          </h1>
          <p className="text-slate-400 mt-2 max-w-xl">
            Forensic timeline of agent execution traces. Enter an Execution ID to reconstruct exactly what the LLM saw, evaluated, and executed.
          </p>
        </div>

        <form onSubmit={fetchTimeline} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Correlation ID..."
              value={correlationId}
              onChange={(e) => setCorrelationId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Searching..." : "Trace"}
          </button>
        </form>
      </div>

      <div className="py-6">
        {!searched ? (
           <div className="text-center py-20 border border-slate-800 border-dashed rounded-xl bg-slate-900/10">
             <Clock className="w-10 h-10 text-slate-700 mx-auto mb-4" />
             <p className="text-slate-500">Enter a Correlation ID above to fetch the execution trace.</p>
           </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 border border-slate-800 rounded-xl bg-slate-900/30">
             <p className="text-slate-400">No telemetry found for ID <span className="font-mono text-white">{correlationId}</span>.</p>
          </div>
        ) : (
          <div className="relative pl-8 md:pl-0">
            {/* Vertical Line */}
            <div className="absolute left-12 md:left-1/2 top-4 bottom-4 w-px bg-slate-800 -translate-x-1/2"></div>
            
            <div className="space-y-12">
              {events.map((event, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                  <div key={event.id} className="relative flex flex-col md:flex-row items-center justify-between w-full">
                    {/* Icon Dot */}
                    <div className="absolute left-12 md:left-1/2 top-0 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center -translate-x-1/2 -translate-y-2 z-10">
                      {getEventIcon(event.eventType)}
                    </div>
                    
                    {/* Left Side (Empty on mobile or if isRight) */}
                    <div className={`w-full md:w-5/12 pl-24 md:pl-0 ${isLeft ? 'md:pr-12 md:text-right' : 'md:opacity-0'}`}>
                      {isLeft && (
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl text-left shadow-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{event.eventType}</span>
                            <span className="text-xs text-slate-500 font-mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <pre className="text-xs text-blue-300 font-mono overflow-x-auto whitespace-pre-wrap mt-2">
                            {formatJSON(event.payload)}
                          </pre>
                        </div>
                      )}
                    </div>
                    
                    {/* Right Side (Empty on mobile or if isLeft) */}
                    <div className={`w-full md:w-5/12 pl-24 md:pl-0 ${!isLeft ? 'md:pl-12 text-left' : 'md:opacity-0 hidden md:block'}`}>
                      {!isLeft && (
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl text-left shadow-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{event.eventType}</span>
                            <span className="text-xs text-slate-500 font-mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <pre className="text-xs text-blue-300 font-mono overflow-x-auto whitespace-pre-wrap mt-2">
                            {formatJSON(event.payload)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
