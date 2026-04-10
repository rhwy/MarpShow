# ADR-002: Docker-First Development with Hot Reload

## Status
Accepted

## Date
2026-04-10

## Context
The project requires all build, run, and test operations to execute inside Docker containers with no host dependencies beyond Docker itself. Hot reload is needed for developer productivity.

## Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| **Docker Compose dev target (chosen)** | Consistent env, host-independent, hot reload via bind mounts | Slightly slower file watching on macOS |
| Local Node.js + Docker for prod only | Faster dev, simpler setup | Host dependency, env drift |
| Devcontainers | IDE integration | Ties to VS Code, heavier |

## Decision
Use Docker Compose with a multi-stage Dockerfile. The `dev` target mounts source code as a bind volume for hot reload. All scripts (`dev.sh`, `test.sh`, `build.sh`) execute commands inside the container.

Environment variables flow via `.env` → `docker-compose.yml` → container.

## Consequences
- Zero host dependencies (only Docker required)
- Consistent environments across developers and CI
- `WATCHPACK_POLLING=true` needed for reliable file watching in Docker
- Scripts abstract away Docker commands for simplicity
