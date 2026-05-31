# Security Policy

## Supported Versions

We apply security patches to the latest major version of `@agent-runtime-ts`. Since we are currently in `v1.x`, all patches are applied to the `main` branch and released immediately.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Security is the core function of the Agent Governance Platform. We take all vulnerabilities with the utmost seriousness.

If you discover a security vulnerability within the platform (such as a bypass in the Policy Engine, a failure in the MCP Trust Registry, or a flaw in our Just-In-Time Credential issuance), please **DO NOT open a public issue.**

Instead, please send an email to **security@agent-runtime.com**.

### Response Timeline
- You will receive an acknowledgment of your report within **24 hours**.
- A preliminary assessment and timeline for a patch will be provided within **48 hours**.
- High-severity vulnerabilities (e.g., Policy Engine bypasses) are patched and disclosed within **7 days**.

## Scope of Threat Model
Please refer to our [THREAT_MODEL.md](./THREAT_MODEL.md) for a detailed breakdown of what is considered in-scope for security bug bounties and what is considered an accepted architectural risk.
