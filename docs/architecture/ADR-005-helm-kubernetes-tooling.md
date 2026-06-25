# ADR-005: Use Helm for Kubernetes tooling installation

**Date:** 2026-06-25  
**Status:** Accepted  
**Author:** Ntando Miya

---

## Context

Genuvia Platform requires several third-party tools to be deployed into the Kubernetes cluster — starting with the kube-prometheus-stack (Prometheus, Grafana, Alertmanager) and eventually ArgoCD, ingress controllers, and cert-manager. A decision was needed on how to manage these installations consistently.

---

## Decision

**We chose Helm as the package manager for all Kubernetes tooling installations.**

---

## Reasons

**Industry standard for Kubernetes package management.** Helm is the most widely adopted Kubernetes package manager with 10,000+ charts in the official Artifact Hub. It is the expected tool for installing complex multi-component applications like monitoring stacks, ingress controllers, and CI/CD tools.

**Complexity management.** Tools like kube-prometheus-stack involve dozens of Kubernetes resources — Deployments, Services, ConfigMaps, CRDs, ServiceMonitors, ClusterRoles, and more. Helm manages all of these as a single release, tracks versions, and allows atomic upgrades and rollbacks. Managing these resources with raw YAML would require maintaining hundreds of files.

**Configuration via values.** Helm charts expose configuration through a `values.yaml` interface. Installing Prometheus with a custom Grafana admin password, specific scrape settings, and storage configuration required only three `--set` flags. The equivalent in raw YAML would require editing multiple resource definitions across multiple files.

**Release management.** `helm list` shows all installed tools with their versions, revision history, and status. `helm upgrade` applies changes without downtime. `helm uninstall` cleanly removes all associated resources. This mirrors how production platform teams manage cluster tooling.

**Portfolio signal.** Helm proficiency is explicitly listed in platform engineering and DevOps job descriptions. Demonstrating real Helm usage — adding repos, installing charts, managing namespaces, setting values — is directly transferable to production environments.

---

## Trade-offs Accepted

**Abstraction layer.** Helm abstracts the underlying Kubernetes resources. A developer new to the stack may not understand what's running without inspecting `helm get manifest`. Accepted because the abstraction is the point — Helm manages complexity so engineers can focus on configuration rather than resource management.

**Chart dependency on upstream maintainers.** Helm charts are maintained by third parties. Breaking changes in a chart upgrade require attention. The kube-prometheus-stack in particular has had breaking changes between major versions. Accepted because the alternative (maintaining custom YAML) has higher maintenance overhead.

---

## Helm Usage in Genuvia Platform

```bash
# Add a chart repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install a chart into a namespace
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.adminPassword=genuvia123 \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

# List installed releases
helm list -n monitoring

# Inspect what was installed
helm get manifest prometheus -n monitoring
```

---

## Planned Helm Installations

| Tool | Chart | Namespace | Phase |
|---|---|---|---|
| kube-prometheus-stack | prometheus-community/kube-prometheus-stack | monitoring | Phase 2 ✓ |
| ArgoCD | argo/argo-cd | argocd | Phase 2 |
| ingress-nginx | ingress-nginx/ingress-nginx | ingress-nginx | Phase 2 |

---

## Alternatives Considered and Rejected

**Raw YAML manifests** — Maximum control but high maintenance overhead. A tool like kube-prometheus-stack requires 50+ YAML files. Managing upgrades manually is error-prone. Rejected for all third-party tooling installations.

**Kustomize** — A Kubernetes-native configuration management tool built into kubectl. Better for managing environment-specific overlays of your own applications than for installing third-party tools. Rejected for third-party tooling because Helm charts are the primary distribution format for these tools. Kustomize will be used for Genuvia's own service manifests.

**Operator Framework** — Some tools (Prometheus, ArgoCD) have Kubernetes operators for lifecycle management. Rejected for initial setup because operators add complexity. Helm charts for these same tools are simpler to install and sufficient for local development.

**Terraform + Helm provider** — Using Terraform to manage Helm releases adds an additional tool to the stack. Rejected for local development; may be adopted for cloud infrastructure in a later phase.
