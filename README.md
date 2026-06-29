# Genuvia Platform

**An Internal Developer Platform built on Backstage that combines service catalog, Kubernetes, observability, GitOps, and organizational intelligence into a single engineering portal.**

> Built to demonstrate modern Platform Engineering and DevOps practices — service scaffolding, GitOps deployments, cluster observability, and decision memory, all surfaced through a single developer portal.

---

## Demo

> 📹 [Watch the full platform demo on YouTube](https://youtu.be/8kmGtT4-uE4)

---

## What It Does

Genuvia Platform is the operational layer for the Genuvia engineering organization. An engineer opens one page and sees everything about a service — who owns it, whether it's running, when it was last deployed, and why it was built the way it was.

| Capability | Description |
|---|---|
| **Service Catalog** | Every service registered with ownership, lifecycle, and metadata |
| **Software Templates** | One-click scaffolding — creates a GitHub repo, FastAPI skeleton, Kubernetes manifests, and catalog entry automatically |
| **Kubernetes** | Live cluster visibility — pods, deployments, and services per catalog entity |
| **GitOps (ArgoCD)** | Deployment status and history per service, triggered by git commits |
| **Observability** | Prometheus metrics and Grafana dashboards for the full cluster |
| **Decision Memory** | Organizational decisions, commitments, and lessons surfaced per service — powered by Genuvia Core |

---

## Architecture

```
Engineer opens Backstage → finds a service

┌─────────────────────────────────────────────────────┐
│              Service Catalog Page                   │
│                                                     │
│  Knowledge Graph  │  ArgoCD Status  │  Decisions   │
│  Kubernetes Tab   │  Grafana Links  │  Commitments  │
└─────────────────────────────────────────────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
     GitHub             ArgoCD          Genuvia Core
        │                  │              FastAPI
        └──────────────────┘              SQLite
     Git push → auto deploy
     
     Prometheus + Grafana watching the cluster
```

**Stack:**

| Layer | Technology |
|---|---|
| Developer Portal | Backstage |
| Frontend | React, TypeScript, Rspack |
| Kubernetes | k3d (k3s in Docker) |
| GitOps | ArgoCD |
| Metrics | Prometheus (kube-prometheus-stack) |
| Dashboards | Grafana |
| Package Manager | Helm |
| Decision Intelligence | Genuvia Core (FastAPI + SQLite) |
| Container Runtime | Docker Engine (WSL2) |

---

## Services in the Catalog

| Service | Type | Lifecycle | Description |
|---|---|---|---|
| genuvia-edge | service | production | Trading intelligence backend with SMC/ICT signal pipeline |
| genuvia-core | service | beta | Organisational decision memory and contradiction detection |
| genuvia-alerts | service | experimental | Scaffolded via Software Templates — notification service |

---

## Software Templates

Click **Create** in the sidebar to scaffold a new service. The template:

1. Generates a FastAPI service skeleton with health endpoint
2. Creates Kubernetes deployment and service manifests
3. Creates a `catalog-info.yaml` with correct annotations
4. Publishes a new GitHub repository under your account
5. Registers the service in the Backstage catalog automatically

The entire process takes under 10 seconds.

```
Engineer fills form → clicks Create
         ↓
Backstage scaffolds files from template
         ↓
GitHub repo created with FastAPI skeleton + k8s manifests
         ↓
Service appears in catalog immediately
         ↓
ArgoCD can pick up the k8s/ folder and deploy automatically
```

---

## Decision Memory

Every service page shows a **Decision Memory** card powered by Genuvia Core — a custom Backstage plugin built for this project.

```
Decision Memory (4)

LESSON
Running Backstage and Kubernetes simultaneously on 8GB RAM
requires WSL2 memory limits set to 6GB minimum in .wslconfig
ntando-miya · 6/25/2026

COMMITMENT
All trading signals must pass the Risk Guard gate before
delivery to Telegram. No exceptions for any pair or session.
ntando-miya · 6/25/2026

DECISION
We chose SQLite for local development and PostgreSQL for
production to keep local setup simple
ntando-miya · 6/25/2026

DECISION
We chose FastAPI over Django because we need async support
and lightweight API performance for real-time trading signals
ntando-miya · 6/25/2026
```

Decisions are captured via the Genuvia Core REST API and surfaced automatically in the catalog. The long-term vision is automatic capture from git commits, PRs, ADRs, Telegram, and deployment events — see [`docs/VISION.md`](docs/VISION.md).

---

## GitOps

genuvia-edge is managed via ArgoCD. Manifests live in [`k8s/genuvia-edge/`](k8s/genuvia-edge/). Any git push to that folder triggers an automatic cluster sync.

The ArgoCD history card in the catalog shows each deployment with author, commit message, timestamp, and git revision — full traceability from code to running pod.

---

## Local Setup

### Prerequisites

- Windows 11 with WSL2 (Ubuntu 22.04+)
- Docker Engine installed in WSL2
- Node.js 18 via nvm
- 6GB RAM allocated to WSL2 in `.wslconfig`

### Environment variables required

```bash
export GITHUB_TOKEN=<your-github-pat>
export K8S_TOKEN=<backstage-service-account-token>
export NODE_TLS_REJECT_UNAUTHORIZED=0
export NODE_OPTIONS=--no-node-snapshot
```

### Install

```bash
git clone https://github.com/Sekani-27/genuvia-platform.git
cd genuvia-platform
nvm use 18
yarn install
npm rebuild better-sqlite3
```

### Start the full stack

```bash
# Start Docker
sudo service docker start

# Start Kubernetes cluster
k3d cluster start genuvia-local

# Port-forward monitoring and ArgoCD
kubectl port-forward -n monitoring svc/prometheus-grafana 9090:80 &
kubectl port-forward svc/argocd-server -n argocd 8085:80 &

# Start Genuvia Core (decision memory API)
cd ~/genuvia-core && uvicorn app.main:app --port 8001 &

# Start Backstage
cd ~/genuvia-platform
NODE_OPTIONS=--no-node-snapshot NODE_TLS_REJECT_UNAUTHORIZED=0 yarn start
```

Open `http://localhost:3000`

### Access other services

| Service | URL | Credentials |
|---|---|---|
| Backstage | http://localhost:3000 | Guest auth |
| Grafana | http://127.0.0.1:9090 (Chrome only) | admin / genuvia123 |
| ArgoCD | https://localhost:8085 | admin / xC8n58NQKIUczVlc |
| Genuvia Core API | http://localhost:8001 | None |
| Core API Docs | http://localhost:8001/docs | None |

---

## Architecture Decision Records

Every major design decision is documented in [`docs/architecture/`](docs/architecture/):

| ADR | Decision |
|---|---|
| ADR-001 | Why Backstage over a custom portal |
| ADR-002 | Why Docker Engine over Docker Desktop |
| ADR-003 | Why k3d over Minikube |
| ADR-004 | Why Prometheus + Grafana for observability |
| ADR-005 | Why Helm for Kubernetes tooling |
| ADR-006 | Why ArgoCD for GitOps |
| ADR-007 | Why the Roadie ArgoCD Backstage plugin |

---

## Roadmap

```
Foundation   ✓  Backstage, catalog, dark theme, GitHub integration
Platform     ✓  Kubernetes, Prometheus, Grafana, ArgoCD GitOps
Intelligence ✓  Decision Memory plugin, Genuvia Core REST API
Automation   ✓  Software Templates — one-click service scaffolding
Next         →  Telegram bot for automatic decision capture
             →  ADR file parsing → auto-populate decision memory
             →  Deploy genuine genuvia-edge Docker image via GHCR
             →  TechDocs for all catalog entities
```

---

## Project Structure

```
genuvia-platform/
├── packages/
│   ├── app/              # Backstage frontend
│   └── backend/          # Backstage backend
├── plugins/
│   └── genuvia-decisions/ # Custom Decision Memory plugin
├── templates/
│   └── new-service/      # Software Template for new FastAPI services
│       └── skeleton/     # Generated file templates
├── k8s/
│   └── genuvia-edge/     # Kubernetes manifests (ArgoCD managed)
├── docs/
│   ├── architecture/     # ADR-001 through ADR-007
│   ├── VISION.md         # Product vision and knowledge capture strategy
│   └── session-summaries/ # Daily build logs
└── app-config.yaml       # Backstage configuration
```

---

## Related Repositories

| Repo | Description |
|---|---|
| [Sekani-27/genuvia-platform](https://github.com/Sekani-27/genuvia-platform) | This repo — Backstage IDP |
| [Sekani-27/genuvia-core](https://github.com/Sekani-27/genuvia-core) | Decision memory REST API |
| [Sekani-27/Nexara](https://github.com/Sekani-27/Nexara) | genuvia-edge — trading intelligence backend |

---

## Built By

**Ntando Miya** — Founder & CEO, Genuvia (Pty) Ltd
Johannesburg, South Africa
[github.com/Sekani-27](https://github.com/Sekani-27)
