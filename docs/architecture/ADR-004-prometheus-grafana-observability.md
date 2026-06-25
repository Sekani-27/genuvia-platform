# ADR-004: Use Prometheus and Grafana for cluster observability

**Date:** 2026-06-25  
**Status:** Accepted  
**Author:** Ntando Miya

---

## Context

Genuvia Platform Phase 2 required an observability layer for the local Kubernetes cluster. The goal was to surface real cluster metrics — CPU utilisation, memory usage, pod health, namespace breakdown — both in Grafana dashboards and eventually in the Backstage catalog via the Kubernetes plugin. Several options were evaluated.

---

## Decision

**We chose Prometheus + Grafana via the kube-prometheus-stack Helm chart.**

---

## Reasons

**Industry standard.** Prometheus is the de facto metrics standard for Kubernetes. Every production Kubernetes cluster uses it. The CNCF graduated Prometheus in 2018. Demonstrating Prometheus proficiency is a direct signal for platform engineering and DevOps roles.

**Pre-built Kubernetes dashboards.** The kube-prometheus-stack ships with 20+ pre-configured Grafana dashboards covering cluster compute resources, namespace breakdowns, pod metrics, node exporter, networking, and persistent volumes. These are production-quality dashboards used by real engineering teams — not demo data.

**Single Helm chart.** The kube-prometheus-stack installs Prometheus, Grafana, Alertmanager, kube-state-metrics, and node-exporter in a single `helm install` command. Building equivalent monitoring infrastructure manually would take days.

**Backstage integration path.** The Backstage Grafana plugin can embed Grafana dashboards directly into catalog entity pages. By running the standard kube-prometheus-stack, future integration with Backstage requires only configuration, not custom dashboard creation.

**Real metrics from day one.** Because kube-prometheus-stack automatically discovers and scrapes Kubernetes system components, the dashboards show real data immediately — CPU at 18.9%, memory at 61.8%, three namespaces with live workload counts — without any manual scrape configuration.

---

## Trade-offs Accepted

**RAM consumption.** The monitoring stack (Prometheus, Grafana, Alertmanager, kube-state-metrics, node-exporter) consumes approximately 850MB RAM in the monitoring namespace. On an 8GB machine already running WSL2, Docker, Backstage, and k3d, this is significant. Accepted because the observability value justifies the cost.

**Port-forward required for local access.** Grafana runs inside the cluster without an external ingress. Accessing it locally requires `kubectl port-forward` each session. A permanent ingress configuration was deferred to avoid complexity — the port-forward approach is sufficient for local development and portfolio demonstration.

**No persistent storage.** Prometheus data is stored in-memory with no persistent volume claim configured. Metrics history is lost when the cluster restarts. For a local development environment this is acceptable; production deployments would require persistent volumes.

---

## Cluster State After Installation

```
Namespace:  monitoring
Components: prometheus-kube-prometheus-prometheus-0      (Running)
            prometheus-grafana                           (Running)
            alertmanager-prometheus-kube-prometheus-0    (Running)
            prometheus-kube-state-metrics                (Running)
            prometheus-prometheus-node-exporter (x2)    (Running)

Access:     kubectl port-forward -n monitoring svc/prometheus-grafana 9090:80
            http://127.0.0.1:9090 (admin / genuvia123)
```

---

## Alternatives Considered and Rejected

**Datadog** — Excellent observability platform but requires a paid agent for full Kubernetes metrics. No local deployment option. Rejected for cost and cloud-dependency reasons.

**New Relic** — Similar to Datadog. Free tier exists but requires sending metrics to New Relic's cloud. Rejected to keep the stack fully local and self-contained.

**Elastic Stack (ELK)** — Powerful for log aggregation but RAM-intensive (3-4GB minimum). On an 8GB machine this would make the full stack unrunnable. Rejected due to resource constraints.

**Manual Prometheus install (without Helm)** — Possible but requires writing ServiceMonitor CRDs, scrape configs, and dashboard JSON manually. The kube-prometheus-stack provides all of this already tested and configured. No benefit to manual installation.

**Victoria Metrics** — A lighter Prometheus-compatible alternative. Rejected because Prometheus is the portfolio signal, not Victoria Metrics. The goal is demonstrating industry-standard tooling.
