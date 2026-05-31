# Company + Product Thesis

## Scope and audience decisions (locked)

This repository implements the thesis package for these first-use channels, in order:
1. Repository README (source of truth for contributors and technical evaluators)
2. Product landing page messaging alignment
3. Investor/sales/security collateral generated from this thesis

Primary category label: **The Runtime IAM Layer for AI Agents**  
Secondary descriptor (audience-specific): **Identity & Runtime Security Infrastructure for Autonomous Systems**

Tone variants included now:
- 30-second version
- 2-minute version
- 10-minute narrative
- Investor narrative

## Category

**Agent Identity & Access Management (IAM) + Runtime Security**

## One-line statement

We provide Okta-style identity, Just-In-Time access, and real-time governance for autonomous AI agents before dangerous actions execute.

## Core problem

AI systems are moving from passive chat interfaces to autonomous runtimes that execute tools, call APIs, and trigger external effects. This has created the **Agent Identity Crisis**: agents are being deployed with hardcoded, permanent API keys (`STRIPE_SECRET_KEY`) and over-permissioned access, completely bypassing traditional enterprise IAM and zero-trust principles.

## Why now

- Agents are rapidly gaining real permissions in enterprise environments.
- Traditional prompt/jailbreak defenses do not provide action-level control or identity management.
- Security and compliance teams require auditable evidence of agent identities, decisions, and interventions.

## Product pillars

### 1) Agent Identity & JIT Credentials
Solve the "Agent Identity Crisis" by forcing agents to dynamically request ephemeral, time-bound (e.g., 5-minute) tokens scoped to strict Role-Based Access Control (RBAC), eliminating hardcoded secrets.

### 2) Runtime Policy Engine
Intercept action intents pre-execution and return allow/deny/warn/require-approval outcomes under global zero-trust policy.

### 3) Human-in-the-Loop Approvals
Automatically pause high-risk execution paths (like massive wire transfers) and route them to a central SOC dashboard for manual human authorization.

### 4) MCP Security Engine
Establish trust around external tools via cryptographic identity verification, schema hash validation, and risk scoring before tool execution.

### 5) Threat Intel & Data Loss Prevention (DLP)
Protect against prompt injections (jailbreaks), track memory entropy, and scrub sensitive PII (credit cards, AWS secrets) from context windows before data hits the LLM.

### 6) Attack Replay & Tracing
Provide replayable execution timelines across multi-agent swarms (using OpenTelemetry-style linking) for incident response and SOC2 auditability.

## ICP/personas and use cases

### AI-native startups
Need runtime controls and evidence to safely ship autonomous workflows to enterprise customers.

### Enterprise Security & IAM teams
Need governance, ephemeral credentials, and policy guardrails to bring non-human AI agents into compliance with existing Okta/SailPoint architectures.

### Regulated industries (e.g., banking/finserv)
Need approval gates, restricted action scopes, and replay evidence for compliance and investigations.

## What we are not

- Not a chatbot product
- Not a prompt-only defense layer
- Not a generic LLM wrapper
- Not generic observability without enforcement

## What we are

- The foundational IAM and security infrastructure for autonomous AI systems
- A Zero-Trust runtime control plane for agent identities, actions, tools, and memory

## Long-term vision and category map

Today most teams combine cloud, identity, and API security controls around human systems.  
Future state adds a dedicated control layer for **Non-Human Agent IAM + Runtime Security**:

- Cloud security
- Human Identity security (Okta)
- API security
- **Agent Identity & Access Management (JIT)**
- **Agent Runtime Security & Forensics**

## Messaging variants

### 30-second version
We’re building the Runtime IAM Layer for autonomous AI agents. Today, agents are deployed with hardcoded API keys and over-permissioned access. We fix the "Agent Identity Crisis" by dispensing Just-In-Time (JIT) ephemeral credentials to agents, enforcing real-time zero-trust policies before they execute tools, and pausing high-risk actions for human approval. We provide the complete identity and security firewall for the AI era.

### 2-minute version
Autonomous agents now execute actions across enterprise systems, creating a massive new vulnerability: non-human identities operating outside of traditional IAM. Companies are hardcoding Stripe and AWS keys into agent environments. Our platform acts as Okta and a Zero-Trust Firewall for AI. We force agents to dynamically request ephemeral access tokens based on strict roles. Before an agent uses that token, we intercept the action, enforce policy in real time, scrub PII, verify the tool's trust hash (MCP workflows), and provide replayable evidence for incident response. This lets teams deploy agentic systems faster while satisfying CISO requirements for identity and governance.

### 10-minute narrative
The market is entering a rapid transition from assistant-style AI to autonomous execution systems. In that shift, the highest-risk surface is not generated text, but runtime effects: shell commands, database writes, and API calls. Crucially, the industry has stumbled into an "Agent Identity Crisis," bypassing decades of security best practices by granting agents static, long-lived credentials. Our thesis is that enterprises will require a dedicated Agent IAM and Runtime Security layer analogous to how workforce IAM required Okta. We are building that layer with six integrated capabilities: JIT Identity Issuance, Policy Enforcement on actions, Human-in-the-Loop workflows, MCP tool trust controls, Threat/DLP protections, and replayable attack forensics. The product is consumed as developer-facing SDK instrumentation plus backend policy/analysis services and a security dashboard. The strategic outcome is to make autonomous AI deployable under strict enterprise governance.

### Investor narrative
We are building the definitive Identity and Runtime Security platform for autonomous AI systems. As agents get access to tools, memory, and APIs, traditional AI safeguards break because they do not govern real-world execution or non-human identity. We solve the emerging "Agent Identity Crisis" by providing Okta-style ephemeral credentials, real-time zero-trust policy enforcement, MCP tool trust controls, and human approval workflows. We are creating the foundational IAM infrastructure that enables organizations to scale autonomous AI while satisfying strict security and compliance constraints.

## References and claim-to-source mapping

| Claim ID | Claim | Source |
|---|---|---|
| C1 | Runtime protection is emerging as a key requirement for agentic AI | https://www.akto.io/blog/ai-agent-security-solutions |
| C2 | The "Agent Identity Crisis": Over-permissioned agents with static credentials | https://www.strata.io/blog/agentic-identity/the-ai-agent-identity-crisis-new-research-reveals-a-governance-gap/ |
| C3 | Action execution layer is a critical security boundary | https://arxiv.org/abs/2602.09433 |
| C4 | Enterprise demand for "OAuth for AI Agents" and JIT access | https://www.forbes.com/councils/forbestechcouncil/2026/04/30/ai-agents-are-becoming-enterprise-identities-and-a-new-major-attack-vector/ |
| C5 | MCP/tool trust is an emerging attack path | https://obot.ai/blog/mcp-security-trust-crisis-autonomous-agents/ |
| C6 | Replayable evidence is increasingly expected in enterprise AI security tooling | https://generalanalysis.com/guides/best-ai-security-platforms |
| C7 | Agent governance controls are becoming differentiated enterprise requirements | https://www.itpro.com/technology/artificial-intelligence/one-size-fits-all-agent-governance-sets-enterprises-up-to-fail |
