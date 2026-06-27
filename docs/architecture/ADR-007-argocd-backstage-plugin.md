# ADR-007: Integrate ArgoCD Plugin into Backstage Catalog

**Date:** 2026-06-27  
**Status:** Accepted  
**Author:** Ntando Miya

---

## Context

ArgoCD was installed and managing genuvia-edge deployments (ADR-006). However, to view deployment status, an engineer had to navigate to a separate ArgoCD UI at `https://localhost:8085`. This breaks the "single pane of glass" principle of an internal developer portal — engineers should be able to see everything about a service from its catalog page without switching tools.

The decision was whether to surface ArgoCD deployment data directly in Backstage.

---

## Decision

**We chose to install the Roadie ArgoCD Backstage plugin (`@roadiehq/backstage-plugin-argo-cd`) and wire it into the catalog entity pages.**

---

## Reasons

**Single pane of glass.** The genuvia-edge catalog page now shows ownership, Kubernetes health, Decision Memory, ArgoCD sync status, and deployment history — all in one place. An engineer no longer needs to context-switch between Backstage, ArgoCD UI, and Grafana to understand the state of a service.

**Deployment traceability.** The ArgoCD history card shows each deployment with author, commit message, timestamp, and git revision. The "scale: increase genuvia-edge to 2 replicas" commit by Ntando Miya is directly visible in the catalog. This connects git activity to running infrastructure.

**Health at a glance.** The ArgoCD overview card shows sync status (Synced/OutOfSync) and health status (Healthy/Degraded/Progressing) for each ArgoCD application linked to the catalog entity. Platform engineers can see at a glance whether a service's deployed state matches its git state.

**Roadie plugin quality.** The Roadie ArgoCD plugin is the most widely used ArgoCD integration for Backstage. It supports both the legacy and new declarative frontend system, has an active maintainer, and is used in production by many engineering organizations.

---

## Implementation

**Packages installed:**
- `@roadiehq/backstage-plugin-argo-cd` — Frontend plugin (overview and history cards)
- `@roadiehq/backstage-plugin-argo-cd-backend` — Backend plugin (proxies requests to ArgoCD API)

**Backend configuration (`app-config.yaml`):**

```yaml
argocd:
  username: admin
  password: <admin-password>
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: argocd
          url: https://127.0.0.1:8085
          token: <argocd-jwt-token>
          insecure: true
```

**Catalog annotation required** (`catalog-info.yaml`):

```yaml
annotations:
  argocd/app-name: genuvia-edge
```

**Environment variable required:**

```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

Required because the local ArgoCD instance uses a self-signed TLS certificate. Node.js rejects self-signed certificates by default.

**Extension registered** (`app-config.yaml`):

```yaml
app:
  extensions:
    - entity-card:genuvia-decisions/genuvia-decisions
    - entity-content:kubernetes/entity
```

---

## Result

The genuvia-edge Overview page now shows in sequence:

1. Relations graph (ownership)
2. Decision Memory card (4 entries from Genuvia Core)
3. ArgoCD overview (sync status: Synced, health: Healthy)
4. ArgoCD history (deployment record with author and commit message)

This is the portfolio differentiator — a single service page that shows organizational memory, infrastructure state, and deployment history together.

---

## Trade-offs Accepted

**Self-signed certificate bypass.** `NODE_TLS_REJECT_UNAUTHORIZED=0` disables TLS verification globally for the Node.js process. This is acceptable for local development but must never be used in production. Production ArgoCD would have a proper TLS certificate.

**Token expiry.** The ArgoCD JWT token expires after 24 hours. In the local dev setup, the token must be regenerated daily:

```bash
ARGOCD_TOKEN=$(curl -sk -X POST https://127.0.0.1:8085/api/v1/session \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<password>"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
```

**Port-forward dependency.** ArgoCD is only accessible via `kubectl port-forward`. If the port-forward dies, the ArgoCD cards in Backstage show errors. This is added to the startup script.

---

## Alternatives Considered and Rejected

**Direct ArgoCD UI link** — Could have added a link to the ArgoCD UI in the catalog entity's Links section. Rejected because it requires context-switching and doesn't surface deployment data inline.

**Custom ArgoCD card** — Could have built a custom plugin that calls the ArgoCD API directly. Rejected because the Roadie plugin already does this well and maintaining a custom plugin adds unnecessary overhead.

**No ArgoCD integration** — Rejected because the ArgoCD UI and Backstage catalog would be disconnected tools, undermining the "single pane of glass" value proposition of the platform.
