# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-31

### Added
- **Identity IAM Layer**: Introduced `requestAccess()` for dispensing Just-In-Time (JIT) ephemeral credentials to agents, removing the need for static `.env` keys.
- **Runtime Authorization**: Introduced `evaluateAction()` to act as a zero-trust firewall for agent intents.
- **Human-in-the-Loop**: Introduced `requestApproval()` to pause execution and stream WebSocket alerts to the SOC Dashboard.
- **Threat Intel**: Added `verifyPrompt()` to block LLM jailbreak attempts before they reach the model.
- **Context Firewall**: Added `ContextManager.filter()` and `compress()` to redact PII and prevent massive telemetry payloads from crashing databases.
- **Distributed Tracing**: Added `startDistributedTrace()` to link Parent/Child agent interactions.
- **Admin Dashboard APIs**: Full support for `suspendAgent()`, `getAgents()`, and `registerMcpTool()`.
