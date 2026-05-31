# Architecture

The Agent Runtime Platform is designed to intercept, authorize, and audit every critical action taken by an autonomous agent.

## High-Level Data Flow

```mermaid
sequenceDiagram
    participant Agent as Autonomous Agent
    participant SDK as TS/Python SDK
    participant API as IAM Gateway (NestJS)
    participant Engine as Policy Engine
    participant DB as PostgreSQL DB
    participant SOC as SOC Dashboard

    Note over Agent,SDK: Identity Phase
    Agent->>SDK: requestAccess('stripe', 'refunds')
    SDK->>API: POST /identity/access
    API->>DB: Verify Agent & Role
    API-->>SDK: Return JIT Token (Expires 5m)
    SDK-->>Agent: Token Granted

    Note over Agent,SDK: Execution Phase
    Agent->>SDK: executeTool('stripe:refund', payload)
    SDK->>SDK: ContextManager.filter(payload)
    SDK->>API: POST /policy/evaluate
    API->>Engine: evaluateAction(payload)
    
    alt is safe
        Engine-->>API: ALLOW
        API-->>SDK: 200 OK
        SDK->>SDK: Run Tool
        SDK->>API: POST /replay/ingest (compress telemetry)
    else is risky
        Engine-->>API: REQUIRE_APPROVAL
        API-->>SOC: WebSocket Alert
        SOC-->>API: Admin Approves
        API-->>SDK: 200 OK
    else is malicious
        Engine-->>API: DENY
        API-->>SDK: 403 Forbidden
    end
```

## Core Modules

1. **Identity Module (`/identity`)**: Handles the distribution of Just-In-Time (JIT) ephemeral credentials based on strict Role-Based Access Control (RBAC).
2. **Policy Engine (`/policy`)**: Evaluates incoming agent intents against global security rules. Triggers Human-in-the-Loop workflows.
3. **Threat Intel (`/threat-intel`)**: Heuristically scans prompts for jailbreaks and monitors memory mutations for anomalous entropy spikes.
4. **Replay Engine (`/replay`)**: Serves as the "Chrome DevTools for Agents". Compresses and stores telemetry using OpenTelemetry principles (`parentTraceId`) to link distributed multi-agent swarms.
5. **Trust Registry (`/mcp-trust`)**: Validates the cryptographic hashes of external MCP tools to prevent supply chain poisoning.
