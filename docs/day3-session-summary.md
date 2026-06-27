# Genuvia Platform — Day 3 Session Summary
**Date:** 2026-06-27

---

## What We Accomplished Today

### Morning — Environment Recovery

The WSL2 filesystem became corrupted after a WSL shutdown, requiring a full Ubuntu reinstall.

**Recovery steps (45 minutes):**
- Unregistered and reinstalled Ubuntu WSL2
- Reinstalled Docker Engine, Node.js 20 via nvm, k3d, kubectl, yarn
- Cloned all repos from GitHub: genuvia-platform, genuvia-core, genuvia-edge
- Reinstalled Backstage dependencies
- Rebuilt better-sqlite3 against Node 20
- Stubbed isolated-vm
- Set WSL2 memory limit to 6GB via `.wslconfig`

**Lesson:** Fresh WSL2 reinstall + GitHub restore takes ~45 minutes. All work is preserved in Git — the only thing lost is the local environment, which is now scripted.

**Root cause of corruption:** WSL2 filesystem overlay (overlayfs) was damaged, likely from the `wsl --shutdown` command being run while Docker containers were active. Future mitigation: always stop Docker containers before shutting down WSL2.

---

### Genuvia Core — REST API Built

Rebuilt Core's application layer from scratch using SQLite instead of PostgreSQL.

**Changes made:**

`app/storage.py` — Replaced asyncpg with aiosqlite:
- `init_schema()` — Creates SQLite memories table
- `save_memory(service, type, content, owner)` — Stores a decision/commitment/lesson
- `get_memories(service, type)` — Retrieves memories with optional filters

`app/main.py` — Added REST API endpoints:
- `GET /health` — Health check
- `GET /api/memories?service={name}&type={type}` — List memories
- `POST /api/memories` — Create a memory
- `GET /api/memories/contradictions` — Basic contradiction detection (keyword overlap)

**CORS configured** for localhost:3000 and localhost:7007.

**Seeded with real decisions:**
- genuvia-edge: FastAPI over Django, SQLite/PostgreSQL strategy, Risk Guard commitment, WSL2 lesson
- genuvia-core: aiosqlite over asyncpg, contradiction detection approach

**Running:** `uvicorn app.main:app --reload --port 8001`

---

### Genuvia Decisions Plugin — Built and Working

Created the first custom Backstage plugin: `genuvia-plugin-decisions`.

**Plugin structure:**
```
plugins/genuvia-decisions/
├── src/
│   ├── plugin.tsx          ← EntityCardBlueprint extension
│   ├── index.ts            ← Plugin exports
│   └── components/
│       └── DecisionsCard/
│           ├── DecisionsCard.tsx   ← React component
│           └── index.ts
```

**How it works:**
- Uses `EntityCardBlueprint` from `@backstage/plugin-catalog-react/alpha`
- Fetches decisions from Core REST API: `GET /api/memories?service={entity.metadata.name}`
- Renders decision cards with type badge, content, owner, and timestamp
- Styled with Genuvia teal accents on dark background

**Registered in App.tsx** alongside catalog and kubernetes plugins.

**Result:** Decision Memory card appears on every Component entity page in the catalog, showing real decisions from Genuvia Core.

---

### Genuvia Dark Theme

Applied custom CSS theme to Backstage:
- Deep navy background (`#0d0d1a`)
- Dark paper/cards (`#13132a`)
- Teal accents (`#7df3e1`) for links and sidebar text
- Subtle card borders

Method: CSS override in `packages/app/public/custom-theme.css` + injected into `index.html`.

Note: The Backstage new declarative frontend system's ThemeBlueprint approach was explored but the CSS override was more reliable for immediate results.

---

### VISION.md

Written and committed to both repos — describes 8 methods for automatic knowledge capture without manual entry. Key insight: decisions should be captured as a byproduct of work, not as extra work.

---

### ArgoCD — GitOps Layer

**Installed ArgoCD** into the k3d cluster:
```
Namespace: argocd
Pods: 7 (all Running)
Version: v3.4.4
Access: kubectl port-forward svc/argocd-server -n argocd 8085:80
Credentials: admin / xC8n58NQKIUczVlc
```

**Created k8s/ manifests folder** in genuvia-platform repo:
```
k8s/
└── genuvia-edge/
    └── deployment.yaml   ← Deployment (nginx:alpine) + Service
```

**Created ArgoCD Application:**
- Watching: `github.com/Sekani-27/genuvia-platform` → `k8s/genuvia-edge`
- Auto-sync enabled
- Deployed to: `default` namespace

**Proved GitOps works:**
1. Changed replicas from 1 → 2 via git commit
2. ArgoCD detected change within 60 seconds
3. Cluster scaled automatically
4. Pod count: 2/2 running
5. Full resource graph visible: App → Service → Deployment → ReplicaSet → Pod

---

## Current Platform State

| Layer | Component | Status |
|---|---|---|
| Foundation | Backstage | ✓ Running |
| Foundation | Service Catalog | ✓ genuvia-edge + genuvia-core |
| Foundation | Dark Theme | ✓ Navy + teal |
| Platform | k3d Kubernetes | ✓ 2-node cluster |
| Platform | Kubernetes Plugin | ✓ Tab on entity pages |
| Platform | Prometheus + Grafana | ✓ kube-prometheus-stack |
| Platform | ArgoCD GitOps | ✓ genuvia-edge managed |
| Intelligence | Decision Memory Plugin | ✓ Live on entity pages |
| Intelligence | Genuvia Core REST API | ✓ Running on port 8001 |

---

## ADRs Written Today

- **ADR-006:** Why ArgoCD for GitOps continuous delivery

---

## Known Issues

- **WSL2 filesystem fragility** — overlayfs can corrupt. Always stop Docker before `wsl --shutdown`
- **Core data is ephemeral** — SQLite database is local, lost on reinstall. Persistence requires either Railway (no budget) or a persistent volume in k8s
- **ArgoCD password** — stored in `argocd-initial-admin-secret`, should be changed: `argocd account update-password`
- **Theme** — CSS override approach; a proper ThemeBlueprint extension would be more maintainable

---

## Tomorrow — Options

**Option A — Telegram bot for Core**
Wire up `/remember` command → decisions appear in Backstage automatically. Makes Core a real product.

**Option B — Automation layer (Software Templates)**
Build the "Create New Service" template in Backstage — scaffolds a repo, CI/CD, catalog entry, and k8s manifests automatically.

**Option C — ArgoCD Backstage plugin**
Surface ArgoCD deployment status on catalog entity pages. Completes the Platform layer integration.

**Option D — Deploy genuvia-edge to k8s properly**
Replace nginx:alpine placeholder with actual genuvia-edge Docker image. Requires building and pushing the Docker image to GHCR.
