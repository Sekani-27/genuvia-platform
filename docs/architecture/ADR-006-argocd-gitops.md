# ADR-006: Use ArgoCD for GitOps Continuous Delivery

**Date:** 2026-06-27  
**Status:** Accepted  
**Author:** Ntando Miya

---

## Context

Genuvia Platform Phase 2 required a continuous delivery layer for the Kubernetes cluster. Previously, deployments were applied manually using `kubectl apply`. This is not sustainable — it requires manual intervention for every change, leaves no audit trail of who deployed what and when, and creates drift between what's in the repository and what's running in the cluster.

A GitOps approach was chosen: the cluster state is declared in Git, and a controller ensures the cluster always matches that declaration.

---

## Decision

**We chose ArgoCD as the GitOps continuous delivery tool.**

---

## Reasons

**Git as the single source of truth.** With ArgoCD, Kubernetes manifests live in `k8s/` in the `genuvia-platform` repository. The cluster state is always a reflection of what's in GitHub. Anyone can see what's deployed by reading the repository — no need to query the cluster.

**Automatic sync.** ArgoCD watches the repository and automatically applies changes when a commit is pushed. Scaling genuvia-edge from 1 to 2 replicas required only a git commit — ArgoCD detected the change and updated the cluster within 60 seconds, with no manual intervention.

**Visual deployment graph.** ArgoCD's UI shows the full resource tree for each application — Application → Service → Deployment → ReplicaSet → Pod — with health status on every node. This makes it immediately clear what's running and whether it's healthy.

**Audit trail.** Every sync in ArgoCD is linked to the git commit that triggered it, including the author and commit message. The genuvia-edge deployment shows: "feat: add Kubernetes manifests for ArgoCD GitOps — Ntando Miya". This is the audit trail that production teams require.

**Rollback via git.** Rolling back a bad deployment is a `git revert` — ArgoCD detects the revert and restores the previous state automatically. No manual rollback procedures.

**Industry standard.** ArgoCD is a CNCF graduated project and the most widely adopted GitOps tool. Demonstrated ArgoCD proficiency is directly transferable to production platform engineering roles.

**Backstage integration path.** The Backstage ArgoCD plugin can surface deployment status and history directly on catalog entity pages. This will be added in a future session.

---

## How It Works in Genuvia Platform

```
Developer pushes manifest change to GitHub
            │
            ▼
ArgoCD detects change (polling every 3 minutes or webhook)
            │
            ▼
ArgoCD compares desired state (GitHub) vs actual state (cluster)
            │
            ▼
ArgoCD applies the diff using kubectl
            │
            ▼
Cluster reaches desired state
            │
            ▼
Backstage Kubernetes tab reflects new state
```

**Repository structure:**

```
genuvia-platform/
└── k8s/
    └── genuvia-edge/
        └── deployment.yaml    ← Deployment + Service manifests
```

**ArgoCD Application config:**

```
Name:        genuvia-edge
Project:     default
Repo:        https://github.com/Sekani-27/genuvia-platform
Path:        k8s/genuvia-edge
Branch:      main
Destination: in-cluster / default namespace
Sync Policy: Automatic
```

---

## Trade-offs Accepted

**Another tool to run.** ArgoCD adds 7 pods to the `argocd` namespace, consuming approximately 200-300MB RAM. On an 8GB machine this is acceptable but adds to the overall resource pressure.

**Local-only for now.** The ArgoCD instance runs in the local k3d cluster. It is not accessible from outside the machine. For a production setup, ArgoCD would run in a shared cluster with proper ingress and SSO. This is a local development trade-off.

**No webhook configured.** ArgoCD polls GitHub every 3 minutes by default. Webhooks would trigger immediate syncs on push. Webhook configuration was deferred — polling is sufficient for local development.

---

## Demonstrated Outcome

After applying the initial manifests via ArgoCD:

1. `genuvia-edge` deployment created with 1 replica
2. Manifest updated to 2 replicas via git commit
3. ArgoCD detected the change and scaled the deployment within 60 seconds
4. Pod count confirmed: 2/2 running
5. Full resource graph visible in ArgoCD UI with commit attribution

---

## Alternatives Considered and Rejected

**Manual kubectl apply** — Rejected. No audit trail, no drift detection, requires cluster access for every deployment. Not sustainable.

**Flux CD** — A valid GitOps alternative to ArgoCD. Rejected because ArgoCD has a superior UI for portfolio demonstration and is more widely recognized in job descriptions. Both implement the same GitOps principles.

**GitHub Actions + kubectl** — Possible but pushes deployment logic into CI rather than keeping it in a dedicated GitOps controller. Rejected because it couples deployment to CI pipeline success rather than desired state reconciliation.

**Helm + manual releases** — Helm manages installation of third-party tools (ADR-005) but is not suitable as a continuous delivery mechanism for application deployments. Rejected for this use case.
