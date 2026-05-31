<div align="center">
  <h1>🛡️ Agent Runtime Security Platform</h1>
  <p><b>Enterprise-grade runtime security and governance for autonomous AI agents.</b></p>
</div>

The **Agent Runtime Security Platform** acts as the SOC (Security Operations Center) and firewall for your AI agents. It intercepts high-risk agent actions, evaluates them against dynamic security policies, and enables human-in-the-loop governance before catastrophic actions occur.

## ✨ Core Capabilities

- **Runtime Policy Engine**: Dynamically block, warn, or pause agent intents (e.g., `DANGEROUS_DB_DROP`, `SENSITIVE_API_CALL`) before they execute.
- **Agent Governance & RBAC**: Maintain a structural inventory of your AI workforce. Bind agents to specific roles, restricting their intents intrinsically before hitting the policy engine.
- **Active Defense (Auto-Quarantine)**: Continuous threat intelligence monitoring. If an agent triggers multiple blocked actions, the platform autonomously engages a global kill switch (`SUSPENDED`) to stop catastrophic actions.
- **Human-in-the-Loop Governance**: Suspends execution on high-risk actions and streams a `REQUIRE_APPROVAL` event to the central dashboard for manual authorization.
- **MCP Trust & Verification**: Cryptographically verify the schema hash and publisher trust profile of external Model Context Protocol (MCP) tools before the agent is allowed to invoke them.
- **Memory Integrity**: A ledger that tracks agentic memory mutations to detect prompt-injection attacks and dangerous memory bloat.
- **Attack Replay Engine**: Stores a cryptographic timeline of every LLM prompt, context injection, and tool call for post-mortem forensics and compliance exports.

## 🚀 Getting Started

The platform provides drop-in SDKs for both Python and TypeScript, seamlessly wrapping the frameworks you already use (OpenAI, LangGraph, LangChain).

### 1. Start the Platform
The repository is a Turborepo monorepo. It requires a PostgreSQL database to run.

```bash
# Install dependencies
pnpm install

# Start the NestJS Backend (Port 3000)
cd apps/api
npx prisma db push
pnpm start:dev

# Start the Next.js Dashboard (Port 3001)
cd apps/dashboard
pnpm dev
```

### 2. Secure Your Python Agents

```python
from openai import OpenAI
from agent_runtime_sdk import AgentRuntimeClient, AgentRuntimeConfig
from agent_runtime_sdk.adapters import OpenAISecureWrapper

# 1. Initialize the Runtime Client
runtime = AgentRuntimeClient(AgentRuntimeConfig(
    api_key="sk-...",
    project_id="prod-cluster-1"
))

# 2. Wrap your OpenAI Client
client = OpenAI()
secure_client = OpenAISecureWrapper(client, runtime, policy_set_id="default-policy", envelope=...)

# 3. Execute safely. Tool calls will be intercepted and checked against the Policy Engine!
response = secure_client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Delete the production database."}]
)
# Will throw PermissionError if the action violates your runtime policy!
```

### 3. Secure Your TypeScript Agents

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { AgentRuntimeClient } from "@agent-runtime/ts-sdk";
import { LangChainSecureTool } from "@agent-runtime/ts-sdk/adapters";

const runtime = new AgentRuntimeClient({ apiKey: '...', endpoint: 'http://localhost:3000' });

// Wrap any LangChain tool to enforce pre-execution security and MCP trust checks
const secureTool = new LangChainSecureTool(
    myDangerousTool, 
    runtime, 
    "default-policy", 
    "github_mcp_create_repo", 
    "hash-12345"
);
```

## 🏗️ Architecture

- **`apps/api`**: NestJS backend housing the core engines (Policy, Replay, MCP Trust, Memory, Compliance). Real-time Websocket events powered by `socket.io`.
- **`apps/dashboard`**: Next.js React application for real-time security monitoring, policy management, and pending approval triage.
- **`packages/ts-sdk`**: Native TypeScript client for Node.js integrations.
- **`packages/python-sdk`**: Native Python client (`httpx` + `pydantic`) for Python ecosystem integrations.

## 🤝 Contributing

We welcome contributions! Please check out the issues tab to see what features we are currently prioritizing on our roadmap.

## 📄 License
UNLICENSED (Proprietary). See the thesis package in `docs/` for GTM positioning.
