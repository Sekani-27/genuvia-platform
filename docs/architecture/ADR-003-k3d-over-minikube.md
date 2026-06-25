# ADR-003: Use k3d instead of Minikube for local Kubernetes

**Date:** 2026-06-25  
**Status:** Accepted  
**Author:** Ntando Miya

---

## Context

Genuvia Platform requires a local Kubernetes cluster for Phase 2 — connecting services to the Backstage catalog, running Prometheus and Grafana, and demonstrating real cluster observability. The development machine is an HP ProDesk 600 G3 SFF running Windows 11 with 8GB RAM and WSL2 Ubuntu.

Two primary options were evaluated:

**Option A — Minikube**  
The most widely documented local Kubernetes tool. Runs a single-node cluster inside a VM or container.

**Option B — k3d**  
A lightweight wrapper that runs k3s (a minimal Kubernetes distribution) inside Docker containers. No separate VM required.

---

## Decision

**We chose k3d (Option B).**

---

## Reasons

**RAM constraint.** The development machine has 8GB RAM, already partially consumed by WSL2, Docker Engine, and Backstage (Node.js frontend + backend). Minikube typically requires 2GB RAM allocated to its VM by default. k3d runs k3s inside Docker containers, which are significantly lighter — the entire cluster uses approximately 500MB RAM.

**Docker-native.** Since Docker Engine is already running inside WSL2 (per ADR-002), k3d has zero additional infrastructure requirements. It creates Kubernetes nodes as Docker containers using the existing Docker daemon. Minikube would require either a separate VM driver or its own Docker configuration.

**Multi-node support.** k3d supports multi-node clusters (server + agent nodes) with a single command. The genuvia-local cluster was created with 1 server and 1 agent node, matching a realistic production topology. Minikube is single-node by default and multi-node support is more complex.

**Speed.** k3d cluster creation takes under 3 minutes on this hardware. Minikube with a VM driver takes significantly longer and is more sensitive to hardware constraints.

**Load balancer support.** k3d includes a built-in load balancer (k3d-proxy) that maps host ports to cluster services. This enables `localhost:8080` to route to cluster ingress without additional configuration. This is essential for demonstrating real service routing in the portfolio.

---

## Trade-offs Accepted

**Less documentation.** Minikube has significantly more community tutorials, Stack Overflow answers, and official documentation. k3d has good documentation but a smaller community. Edge cases require more independent problem-solving.

**k3s vs full Kubernetes.** k3d runs k3s, which is a certified but lightweight Kubernetes distribution. It excludes some rarely-used features of full Kubernetes (certain alpha features, some cloud-provider integrations). For Genuvia Platform's use case — running catalog services, Prometheus, Grafana, and ArgoCD — k3s covers everything needed.

**Not production-equivalent.** k3d is a development tool only. Production Kubernetes for Genuvia will run on a managed cloud provider (GKE, EKS, or Civo). The local k3d cluster demonstrates concepts and integrations, not production architecture.

---

## Consequences

- Kubernetes cluster runs as Docker containers: `k3d-genuvia-local-server-0` and `k3d-genuvia-local-agent-0`
- Cluster is managed via `k3d cluster start/stop/delete`
- kubectl connects via kubeconfig automatically written to `~/.kube/config` by k3d
- Port 8080 on localhost routes to cluster HTTP ingress
- Port 8443 on localhost routes to cluster HTTPS ingress
- Cluster must be restarted after WSL2 restarts: `k3d cluster start genuvia-local`

---

## Cluster Spec

```
Name:    genuvia-local
Nodes:   k3d-genuvia-local-server-0 (control-plane)
         k3d-genuvia-local-agent-0 (worker)
Version: k3s v1.30.4+k3s1
Ports:   8080 → cluster HTTP
         8443 → cluster HTTPS
```

---

## Alternatives Considered and Rejected

**Minikube** — Rejected due to RAM overhead and VM driver complexity on WSL2. Minikube's VM-based drivers (VirtualBox, Hyper-V) do not work well inside WSL2. The Docker driver works but adds complexity given our existing Docker Engine setup.

**kind (Kubernetes in Docker)** — A valid alternative to k3d, also Docker-based and lightweight. Rejected because k3d has better built-in load balancer support and a more intuitive multi-node cluster creation CLI. Both would have been acceptable choices.

**MicroK8s** — Ubuntu's snap-based Kubernetes. Shown as a suggestion by Ubuntu's MOTD. Rejected because snap packages have known compatibility issues inside WSL2, and MicroK8s adds its own networking layer that conflicts with Docker's networking.

**Cloud-based cluster (GKE/Civo free tier)** — Running Kubernetes on a cloud provider instead of locally. Rejected for Phase 2 because local development requires fast iteration without network latency or cost. A cloud cluster will be added in a later phase for production demonstration.
