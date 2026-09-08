# Security Policy

## Reporting a vulnerability

**Do not** open public issues for security problems.

Email security reports to the maintainers listed on the npm package page for [@rnsk/toolkits](https://www.npmjs.com/package/@rnsk/toolkits), or use GitHub's private vulnerability reporting if enabled on the repository.

Include:

- Description of the issue
- Steps to reproduce
- Impact assessment (especially token or data exposure)

We aim to acknowledge reports within **5 business days**.

## Scope

This package runs **server-side** with credentials supplied by the host application. Toolkit `execute` functions receive OAuth tokens or API keys injected by the runtime. Malicious or careless tool code could exfiltrate those tokens.

Maintainers review all toolkit PRs for:

- Outbound requests to undeclared hosts
- User-controlled fetch URLs (SSRF)
- Logging or returning secrets in tool results

Consumers should pin exact package versions and run their own smoke tests before upgrading.

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.0.2   | Yes       |
