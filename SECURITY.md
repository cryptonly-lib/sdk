# Security

## Reporting a vulnerability

If you discover a security issue in `@cryptonly/sdk`, please report it privately to
[security@cryptonly.net](mailto:security@cryptonly.net). Do not open a public GitHub issue
for security-sensitive findings.

## SDK usage

- Use this package **only on the server**. Never embed your Cryptonly API key or webhook
  signing secret in browser or mobile client code.
- Store API keys and webhook secrets in environment variables or a secrets manager.
- Rotate webhook signing secrets if you suspect compromise.
