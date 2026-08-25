# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| `main` (latest deploy) | ✅ |

## Reporting a vulnerability

This is a static, client-side site with no server, database, or user
accounts — the attack surface is small. Still, if you find a real security
issue (for example, XSS via any of the client-side tools, or a service-worker
caching flaw), please report it responsibly:

1. **Do not open a public issue** for vulnerabilities.
2. Use [GitHub's private vulnerability reporting](https://github.com/riteshkumarmaurya42-bit/Ritesh/security/advisories)
   for this repository.
3. Include steps to reproduce and, if possible, a proof of concept.

You can expect a response within a few days. Please avoid automated
scanners/fuzzers without a human-verified finding.

## Scope notes

- The dev tools in `features/tools.html` run **entirely in your browser** —
  no data is sent anywhere. Passwords, text, and QR codes never leave the page.
- Third-party CDNs used by the Visual Playground (Chart.js) are the only
  external network requests; treat them as trusted-but-external.
