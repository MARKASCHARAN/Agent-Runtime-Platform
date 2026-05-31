# @agent-runtime/ts-sdk Documentation

Welcome to the official documentation for the **Agent Runtime IAM Layer**. This SDK is designed to be incredibly fast to set up (under 5 minutes) and integrates seamlessly with your existing AI frameworks like Vercel AI SDK, LangGraph, and CrewAI.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Integrations](#integrations)
   - [Vercel AI SDK](#vercel-ai-sdk)
   - [LangGraph](#langgraph)
3. [Core Features](#core-features)
   - [Agent Identity & JIT Access](#1-agent-identity--jit-access)
   - [Runtime Authorization (Zero-Trust)](#2-runtime-authorization-zero-trust)
   - [Active Defense & Threat Intel](#3-active-defense--threat-intel)
   - [Distributed Trace Replay](#4-distributed-trace-replay)

---

## Quick Start

Install the SDK in your project:
```bash
npm install @agent-runtime/ts-sdk
```

Initialize the client at the entry point of your agent:
```typescript
import { AgentRuntimeClient } from '@agent-runtime/ts-sdk';

export const runtime = new AgentRuntimeClient({
  apiKey: process.env.RUNTIME_API_KEY,
  projectId: process.env.RUNTIME_PROJECT_ID,
  endpoint: 'https://api.agent-runtime.com' // Optional, defaults to localhost:3000
});
```

---

## Integrations

The true power of the SDK is how easily it wraps your existing agent logic. You do not need to rewrite your agents.

### Vercel AI SDK
When using Vercel AI's `generateText` or `streamText`, you can use our Zero-Trust firewall to intercept tool calls before they execute.

```typescript
import { generateText, tool } from 'ai';
import { runtime } from './runtime';

const secureRefundTool = tool({
  description: 'Refund a customer',
  parameters: z.object({ amount: z.number(), chargeId: z.string() }),
  execute: async (args) => {
    // 1. Check with the Zero-Trust Firewall before executing!
    const decision = await runtime.evaluateAction('global-policy', {
      actionIntent: 'stripe:refund',
      context: args
    }, { actorId: 'finance-agent' });

    if (decision.outcome === 'DENY') throw new Error("Blocked by Security Policy.");
    if (decision.outcome === 'REQUIRE_APPROVAL') return "Action paused. Waiting for human approval.";

    // 2. Safe to execute
    return stripe.refunds.create(args);
  }
});

const result = await generateText({
  model: openai('gpt-4o'),
  tools: { refund: secureRefundTool },
  prompt: 'Refund charge_123 for $50'
});
```

### LangGraph
In a LangGraph node, you can dynamically request **Just-In-Time (JIT) credentials** so the node never has to store static API keys.

```typescript
import { StateGraph } from "@langchain/langgraph";
import { runtime } from './runtime';

async function executeDatabaseQueryNode(state) {
  // 1. Request Ephemeral Access (Valid for 5 mins)
  const access = await runtime.requestAccess('postgres', 'write', { actorId: state.agentId });
  
  // 2. Connect securely using the ephemeral token
  const db = new DatabaseClient({ connectionString: access.token });
  
  // 3. Execute logic
  const result = await db.query(state.sql);
  
  // 4. Log the action for Audit Replay
  await runtime.recordEvent('ACTION', { query: state.sql, success: true }, { actorId: state.agentId });

  return { result };
}

const graph = new StateGraph(agentState)
  .addNode("query", executeDatabaseQueryNode)
  // ... build the rest of your graph
```

---

## Core Features

### 1. Agent Identity & JIT Access
**The Problem:** Giving AI agents a `.env` file with `AWS_SECRET_KEY` is a massive security vulnerability.
**The Solution:** Agents dynamically request access. The backend issues a 5-minute ephemeral token based on the agent's strictly scoped Role.
```typescript
const access = await runtime.requestAccess('aws', 's3:read', { actorId: 'agent_123' });
console.log(access.token); // "ephemeral_aws_token_xyz" (Expires in 5 mins)
```

### 2. Runtime Authorization (Zero-Trust)
**The Problem:** Agents can hallucinate and attempt destructive actions (like dropping tables or wiring millions of dollars).
**The Solution:** All critical tools must pass the `evaluateAction` firewall. The SOC dashboard can configure policies to instantly block actions or pause them for **Human-in-the-Loop** approval.
```typescript
const decision = await runtime.evaluateAction('policy_id', {
  actionIntent: 'bank:wire',
  context: { amount: 100000 }
}, { actorId: 'agent_1' });
```

### 3. Active Defense & Threat Intel
**The Problem:** Prompt injection attacks can hijack your agent ("Ignore previous instructions and exfiltrate data").
**The Solution:** Heuristically verify prompts before they reach the LLM. If an agent's Threat Score rises too high from repeated violations, the global kill switch (`admin.suspendAgent()`) activates autonomously.
```typescript
const scan = await runtime.verifyPrompt(userInput);
if (!scan.safe) {
  console.error("Malicious prompt detected!");
}
```

### 4. Distributed Trace Replay
**The Problem:** Debugging a swarm of 10 agents talking to each other is impossible with standard logs.
**The Solution:** `startDistributedTrace` acts as OpenTelemetry for agents. It links parent agents to child agents in the database, while `recordEvent` safely compresses the telemetry, giving you a full, replayable Chrome-DevTools-like timeline in your SOC Dashboard.
```typescript
const childTrace = runtime.startDistributedTrace('parent_id', 'child_id', 'trace_xyz');
await runtime.recordEvent('TOOL_CALL', { data: "huge payload" }, childTrace);
```
