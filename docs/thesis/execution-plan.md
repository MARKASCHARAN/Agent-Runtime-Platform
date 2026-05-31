# Productization, Architecture, SDK, and Execution Plan

## Productization plan by pillar

### Runtime Policy Engine
- Replace static/UX-only policy claims with executable, project-scoped policy model.
- Add persisted policy rules, versioning, and decision logs.
- Add approval workflow hooks and escalation paths.
- Add policy simulation mode for safe rollout.

### MCP Security Engine
- Add tool identity and trust model (publisher, signatures, provenance metadata).
- Add schema fingerprinting and tamper detection.
- Add pre-execution risk checks with deny/warn/approve outcomes.
- Add trust posture views per tool/server.

### Memory Integrity Engine
- Add memory mutation ledger with actor/source metadata.
- Add anomaly detection signals for suspicious memory writes.
- Add rollback primitives and policy-controlled restores.
- Add trust-weighted memory read strategy.

### Attack Replay Engine
- Build replay graph linking prompt, memory, tool, action, policy, and output nodes.
- Add causal-link metadata and event correlation IDs.
- Add exportable evidence bundles for incident response/compliance.
- Add timeline diffing across sessions/traces.

### Realtime Security Dashboard
- Move from static cards to backend-driven metrics.
- Add tenant/project segmentation and role-aware views.
- Add live policy intervention feed and alert triage workflows.
- Add replay launch from high-risk events.

## Architecture and data-model deltas

### Event schema extensions
- `action_intent`
- `tool_identity`
- `tool_schema_hash`
- `policy_context`
- `approval_state`
- `memory_mutation`
- `replay_correlation_id`

### Required backend capabilities (future modules)
- Ingestion and normalization service
- Policy evaluation and approval orchestration
- Tool trust scoring and schema verification
- Memory integrity analysis service
- Replay graph builder and query API
- Alerting/websocket gateway

### Storage additions
- Policy versions and rule sets
- Tool trust profiles and verification history
- Memory mutation ledger
- Replay artifacts and evidence exports

### Realtime channels
- `runtime.alert`
- `policy.intervention`
- `approval.required`
- `memory.anomaly`
- `replay.ready`

## SDK evolution plan (Python + TypeScript)

- Add action interception APIs (pre/post execution hooks).
- Add tool verification metadata fields in envelope contracts.
- Add standardized memory mutation event types.
- Add policy decision callback interfaces.
- Add versioned envelope schema and compatibility guarantees.
- Add adapters roadmap for LangGraph, OpenAI Agents, AutoGen, and MCP-heavy stacks.

## Execution phases and acceptance criteria

### Phase 1 — Messaging foundation
**Deliverables**
- Canonical thesis docs merged
- Truth matrix merged
- README aligned

**Done criteria**
- No top-level claim without status in truth matrix
- README links canonical docs

### Phase 2 — Policy and replay hardening
**Deliverables**
- Runtime policy backend baseline
- Replay ingestion + timeline API baseline
- Dashboard connected to real backend data

**Done criteria**
- Policy decisions are persisted and auditable
- Replay endpoint returns ordered evidence timeline

### Phase 3 — MCP trust + memory integrity baseline
**Deliverables**
- MCP/tool trust verification pipeline
- Memory mutation ledger + anomaly detection baseline

**Done criteria**
- Tool calls receive trust/risk outcome pre-execution
- Suspicious memory mutations generate actionable alerts

### Phase 4 — Enterprise governance
**Deliverables**
- Approval workflows
- Audit/evidence exports
- Compliance reporting primitives

**Done criteria**
- High-risk actions can be blocked or approval-gated
- Replay evidence export supports audit workflows
