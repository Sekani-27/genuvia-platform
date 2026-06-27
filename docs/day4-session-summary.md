# Genuvia Platform — Day 4 Session Summary
**Date:** 2026-06-27

---

## What We Accomplished Today

### ArgoCD Backstage Plugin — Complete

Installed and wired the Roadie ArgoCD plugin into the Backstage catalog.

**Packages:**
- `@roadiehq/backstage-plugin-argo-cd` (frontend)
- `@roadiehq/backstage-plugin-argo-cd-backend` (backend)

**Problems solved:**
- Duplicate `app:` YAML keys — cleaned up app-config.yaml
- ArgoCD self-signed TLS — required `NODE_TLS_REJECT_UNAUTHORIZED=0`
- ArgoCD backend not finding apps — needed JWT token in config instead of username/password
- Backend plugin not loading — was missing from index.ts
- Decision Memory card disappearing — Core wasn't running

**Result:** genuvia-edge Overview page now shows:
1. Knowledge graph (ownership relations)
2. Decision Memory (4 entries — LESSON, COMMITMENT, DECISION x2)
3. ArgoCD overview (Synced, Healthy)
4. ArgoCD history (deployment record with author + commit message)

---

### Catalog Auto-Loading from GitHub

Added GitHub URL locations to `app-config.yaml` so catalog entities load automatically on startup:

```yaml
catalog:
  locations:
    - type: url
      target: https://github.com/Sekani-27/Nexara/blob/main/catalog-info.yaml
    - type: url
      target: https://github.com/Sekani-27/genuvia-core/blob/main/catalog-info.yaml
```

Requires `GITHUB_TOKEN` environment variable to be set.

---

### Startup Script Updated

`~/start-genuvia.sh` now starts all services:

```bash
sudo service docker start
k3d cluster start genuvia-local
export K8S_TOKEN=...
export NODE_TLS_REJECT_UNAUTHORIZED=0
kubectl port-forward -n monitoring svc/prometheus-grafana 9090:80 &
kubectl port-forward svc/argocd-server -n argocd 8085:80 &
cd ~/genuvia-core && uvicorn app.main:app --port 8001 &
cd ~/genuvia-platform && yarn start
```

---

## Platform Layer — Now Complete

```
Foundation  ✓  Backstage + catalog + GitHub integration
            ✓  GENUVIA dark theme
            ✓  genuvia-edge + genuvia-core registered

Platform    ✓  k3d Kubernetes cluster (2 nodes)
            ✓  Kubernetes plugin (tab on entity pages)
            ✓  Prometheus + Grafana (20+ dashboards)
            ✓  ArgoCD GitOps (genuvia-edge managed)
            ✓  ArgoCD Backstage plugin (overview + history in catalog)

Intelligence ✓  Genuvia Core REST API (FastAPI + SQLite)
             ✓  Decision Memory plugin (custom Backstage plugin)
             ✓  4 decisions seeded for genuvia-edge
```

---

## ADRs Written Today

- **ADR-007:** ArgoCD Backstage plugin integration

---

## Environment Notes

**Required environment variables each session:**
```bash
export GITHUB_TOKEN=<pat>
export K8S_TOKEN=<kubectl token>
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

**ArgoCD JWT token expires every 24 hours.** Regenerate:
```bash
ARGOCD_TOKEN=$(curl -sk -X POST https://127.0.0.1:8085/api/v1/session \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"xC8n58NQKIUczVlc"}' | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
# Update app-config.yaml token field
```

**Kubernetes cluster URL changes on restart.** Update app-config.yaml:
```bash
NEW_URL=$(kubectl cluster-info | grep "control plane" | awk '{print $NF}')
sed -i "s|https://0.0.0.0:[0-9]*|$NEW_URL|" app-config.yaml
```

---

## Known Issues

- **ArgoCD token** expires daily — needs manual regeneration
- **Kubernetes URL** changes on cluster restart — needs manual update
- **Core data is local** — SQLite resets on WSL2 reinstall
- **NODE_TLS_REJECT_UNAUTHORIZED=0** is a dev-only workaround

---

## Tomorrow — Options

**Option A — Telegram bot for Core**
Wire up `/remember` in Core so decisions flow automatically from Telegram to Backstage. Makes the Intelligence layer real.

**Option B — Software Templates (Automation layer)**
Build the "Create New Service" scaffolder template. Biggest wow factor for platform engineering interviews.

**Option C — Deploy real genuvia-edge Docker image**
Replace nginx:alpine with actual genuvia-edge image via GHCR. Shows full CI/CD → ArgoCD pipeline.

**Option D — TechDocs**
Add real documentation to catalog entities. Shows the docs-as-code concept.

Recommended: **Option A** then **Option B**.
