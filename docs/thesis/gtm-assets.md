# GTM Messaging Assets and Governance Process

## Synchronized asset pack

All assets must derive from `/tmp/workspace/MARKASCHARAN/agent-runtime-platform/docs/thesis/company-product-thesis.md`.

### Asset list
- 30-second script (executive intro)
- 2-minute script (buyer conversation)
- 10-minute narrative (technical + strategic walkthrough)
- Investor memo version
- Technical architecture brief
- Security team one-pager

## Messaging integrity review (PR/release gate)

### Required checks
1. No new external claim is added without a truth-matrix status.
2. No roadmap claim is moved to "available" without code and docs evidence.
3. README and landing page category labels remain aligned with canonical thesis.

### Operating cadence
- Quarterly review with product, engineering, and security stakeholders.
- Review outcomes:
  - Retain claim
  - Reclassify claim status (Implemented/Partial Prototype/Roadmap)
  - Deprecate stale claim

## Documentation ownership

- Canonical thesis owner: product/security leadership
- Truth matrix owner: engineering lead + product manager
- README owner: repository maintainers
