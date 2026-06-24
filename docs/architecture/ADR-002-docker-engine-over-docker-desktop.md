# ADR-002: Use Docker Engine in WSL2 instead of Docker Desktop

**Date:** 2026-06-24  
**Status:** Accepted  
**Author:** Ntando Miya

---

## Context

Genuvia Platform requires Docker to run containerized services locally. The development machine is an HP ProDesk 600 G3 SFF running Windows 11 with 8GB RAM. Two options were available for running Docker on this machine:

**Option A — Docker Desktop**  
The official Docker GUI application for Windows, which manages a WSL2 backend automatically.

**Option B — Docker Engine directly in WSL2**  
Installing Docker's Linux daemon (`dockerd`) directly inside an Ubuntu WSL2 distribution, bypassing Docker Desktop entirely.

---

## Decision

**We chose Docker Engine in WSL2 (Option B).**

---

## Reasons

**Docker Desktop failed in practice.** After enabling WSL2 and installing Docker Desktop, the engine remained in "starting" state for over 2 hours without becoming ready. The error `npipe:////./pipe/dockerDesktopLinuxEngine` indicated the Linux engine was not initializing. Multiple restart attempts, service restarts, and WSL updates did not resolve the issue.

**Resource efficiency.** Docker Desktop runs its own management layer on top of WSL2, consuming additional RAM and CPU. On an 8GB machine already running Backstage (Node.js frontend + backend), PostgreSQL, and eventually Kubernetes (k3d), every megabyte matters. Docker Engine in WSL2 has no GUI overhead.

**Direct control.** Docker Engine in WSL2 gives direct access to `dockerd` configuration, daemon logs, and networking without going through Docker Desktop's abstraction layer. This is closer to how Docker runs in production Linux environments.

**Industry alignment.** Production Kubernetes clusters and CI/CD pipelines use Docker Engine on Linux directly, not Docker Desktop. Operating Docker Engine in WSL2 builds the same mental model as production operations.

---

## Trade-offs Accepted

**No GUI.** Docker Desktop provides a dashboard for container management. Without it, all container management is via CLI (`docker ps`, `docker logs`, `docker stats`). This is not a meaningful trade-off for a developer comfortable with terminal workflows.

**Manual daemon start.** Docker Engine does not start automatically when WSL2 launches. Requires `sudo service docker start` on each new session, or configuring `/etc/wsl.conf` to start it automatically.

**No Docker Desktop features.** Docker Desktop includes Dev Environments, Docker Extensions, and simplified Kubernetes integration. None of these are needed for Genuvia Platform's use case.

---

## Consequences

- All Docker commands run inside Ubuntu WSL2, not from Windows PowerShell
- Docker daemon must be started manually: `sudo service docker start`
- Container data persists in the WSL2 filesystem at `~/.docker/` and named volumes
- Docker Compose is available via the `docker-compose-plugin` package
- k3d (Phase 2 Kubernetes) runs inside WSL2 using this Docker Engine

---

## Alternatives Considered and Rejected

**Docker Desktop (Windows)** — Attempted and failed. Engine would not start after 2+ hours on the target hardware. Even if resolved, the additional resource overhead is not justified on an 8GB machine.

**Podman** — A Docker-compatible daemonless container engine. Rejected because Backstage's documentation and community examples reference Docker specifically, and k3d requires Docker. Switching to Podman would introduce compatibility unknowns.

**Remote Docker host** — Running Docker on a cloud VM and connecting remotely. Rejected because it adds network latency, cost, and complexity that is not warranted for local development.
