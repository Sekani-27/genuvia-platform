# Genuvia Platform

**An Internal Developer Platform built on Backstage that combines service catalog, Kubernetes, observability, and organizational intelligence into a single engineering platform. Built to explore modern Platform Engineering and DevOps practices.**

---

## What It Does

Genuvia Platform is the operational layer for the Genuvia engineering organization. It gives engineers a single place to understand what exists, who owns it, where it runs, and why decisions were made.

| Capability | Description |
|---|---|
| **Service Catalog** | Every service registered with ownership, lifecycle, and metadata |
| **Kubernetes** | Live cluster visibility — pods, deployments, services per catalog entity |
| **Observability** | Prometheus metrics + Grafana dashboards for the full cluster |
| **Decision Memory** | Organizational decisions, commitments, and lessons surfaced per service |
| **Knowledge Graph** | Visual relationship map of services, teams, and systems |

---

## Architecture

```
Genuvia Platform (Backstage)
├── Frontend — React + Rspack
├── Backend — Node.js plugin host
├── Catalog — Service registry (GitHub-backed)
├── Kubernetes Plugin — k3d cluster integration
├── Prometheus + Grafana — kube-prometheus-stack via Helm
└── Decisions Plugin — Custom plugin → Genuvia Core REST API

Genuvia Core (FastAPI)
├── REST API — /api/memories
├── SQLite — Local decision storage
└── Contradiction Detection — Keyword overlap (Phase 1)

Infrastructure
├── k3d — Local Kubernetes (2-node cluster)
├── Helm — Cluster tooling installation
└── Docker Engine — WSL2 Ubuntu
```

---

## Services Registered

| Service | Repo | Type | Lifecycle |
|---|---|---|---|
| genuvia-edge | Sekani-27/Nexara | service | production |
| genuvia-core | Sekani-27/genuvia-core | service | beta |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Developer Portal | Backstage |
| Frontend | React, TypeScript, Rspack |
| Backend | Node.js |
| Kubernetes | k3d (k3s in Docker) |
| Metrics | Prometheus (kube-prometheus-stack) |
| Dashboards | Grafana |
| Package Manager | Helm |
| Decision Intelligence | Genuvia Core (FastAPI + SQLite) |
| Container Runtime | Docker Engine (WSL2) |
| CI/CD | GitHub Actions |

---

## Local Setup

### Prerequisites

- Windows 11 with WSL2 enabled
- Ubuntu 26.04 in WSL2
- Docker Engine installed in WSL2
- Node.js 20 via nvm
- 6GB RAM allocated to WSL2 (set in `.wslconfig`)

### Install

```bash
git clone https://github.com/Sekani-27/genuvia-platform.git
cd genuvia-platform
yarn install
```

### Start

```bash
# Start Docker
sudo service docker start

# Start Kubernetes cluster
k3d cluster start genuvia-local

# Set Kubernetes token
export K8S_TOKEN=<your-backstage-service-account-token>

# Start Backstage
yarn start
```

Open http://localhost:3000

### Start Genuvia Core (for Decision Memory)

```bash
cd ~/genuvia-core
uvicorn app.main:app --reload --port 8001
```

### Start Grafana

```bash
kubectl port-forward -n monitoring svc/prometheus-grafana 9090:80 &
```

Open http://127.0.0.1:9090 (admin / genuvia123) in Chrome.

---

## Decision Memory Plugin

The `genuvia-decisions` plugin is a custom Backstage frontend plugin that surfaces organizational memory directly on catalog entity pages.

It fetches decisions, commitments, and lessons from the Genuvia Core REST API and displays them on the service's Overview page.

**Adding a decision:**

```bash
curl -X POST http://localhost:8001/api/memories \
  -H "Content-Type: application/json" \
  -d '{
    "service": "genuvia-edge",
    "type": "decision",
    "content": "We chose FastAPI over Django for async support",
    "owner": "ntando-miya"
  }'
```

Types: `decision` | `commitment` | `lesson`

---

## Architecture Decision Records

All major design decisions are documented in [`docs/architecture/`](docs/architecture/):

| ADR | Decision |
|---|---|
| ADR-001 | Backstage over custom portal |
| ADR-002 | Docker Engine over Docker Desktop |
| ADR-003 | k3d over Minikube |
| ADR-004 | Prometheus + Grafana for observability |
| ADR-005 | Helm for Kubernetes tooling |

---

## Roadmap

```
Foundation     ✓  Backstage, catalog, branding, GitHub integration
Platform       ✓  Kubernetes, Prometheus, Grafana
Intelligence   ⚡  Decision Memory plugin (built), Telegram capture (in progress)
Automation        Scaffolder, repo creation, golden paths
AI                Agent registry, briefings, pattern detection
```

---

## Documentation

- [`docs/VISION.md`](docs/VISION.md) — Product vision and knowledge capture strategy
- [`docs/architecture/`](docs/architecture/) — Architecture Decision Records
- [`docs/genuvia-platform-docs.md`](docs/genuvia-platform-docs.md) — Full technical documentation

---

## Built By

**Ntando Miya** — Founder & CEO, Genuvia (Pty) Ltd  
Johannesburg, South Africa  
[github.com/Sekani-27](https://github.com/Sekani-27)
