# ADR-001: Use Backstage as the portal framework instead of building from scratch

**Date:** 2026-06-24  
**Status:** Accepted  
**Author:** Ntando Miya

---

## Context

Genuvia Platform requires an internal developer portal to surface service ownership, catalog entries, knowledge graphs, and organizational intelligence. The question was whether to build this portal from scratch using FastAPI + React, or adopt an existing open-source framework.

Two options were evaluated:

**Option A — Build from scratch**  
A custom React frontend with a FastAPI backend, designed specifically for Genuvia's needs.

**Option B — Backstage**  
Spotify's open-source internal developer portal framework, adopted by 3,400+ organizations and a CNCF incubating project.

---

## Decision

**We chose Backstage (Option B).**

---

## Reasons

**Ecosystem leverage.** Backstage ships with a software catalog, TechDocs, software templates, a plugin marketplace with 140+ community plugins, and integrations for GitHub, Kubernetes, Prometheus, ArgoCD, PagerDuty, and more. Building equivalent functionality from scratch would take months. Backstage provides it on day one.

**Plugin architecture.** Backstage is designed for extension. Custom intelligence features (Decision Memory, Knowledge Graph, Engineering Briefings) can be built as isolated plugins without modifying the core. This matches Genuvia's architecture: standard portal functionality via community plugins, proprietary intelligence via custom plugins.

**Recruiter signal.** Backstage is the industry standard for internal developer portals. Demonstrated Backstage experience is directly transferable to platform engineering roles at companies that run it. A custom portal, however well-built, does not carry that signal.

**Catalog as foundation.** Backstage's software catalog provides the entity model (Component, System, User, Group, API, Resource) that underpins everything else. Rather than designing an entity model from scratch, we inherit a well-tested one used in production by Spotify, Netflix, Airbnb, and others.

---

## Trade-offs Accepted

**Complexity.** Backstage is a TypeScript monorepo with a steep initial setup curve. The first session required resolving native module build failures (`isolated-vm`), backend plugin conflicts, and WSL2 environment issues before the portal was usable.

**Maintenance overhead.** Backstage releases frequently. Plugin compatibility across versions requires active maintenance. This is a real cost for a small team.

**Opinionated structure.** Backstage enforces a specific frontend/backend split and plugin architecture. Custom features must conform to this structure rather than being built freely.

---

## Consequences

- All service metadata lives in `catalog-info.yaml` files in each service repository
- Custom Genuvia intelligence features will be built as Backstage plugins under `plugins/`
- The platform's entity model follows Backstage's specification (Component, System, User, Group)
- Upgrades require testing against the full plugin surface

---

## Alternatives Considered and Rejected

**Port.io / Cortex / OpsLevel** — Commercial IDPs with faster setup but vendor lock-in and cost. Rejected because Genuvia needs full control over the intelligence layer.

**Custom React + FastAPI portal** — Maximum flexibility but minimum leverage. Rejected because the catalog, graph, search, and template infrastructure alone would consume months of development time better spent on the intelligence layer.
