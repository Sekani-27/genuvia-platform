# Genuvia Platform — Vision

## The Problem with Knowledge Management

Engineers don't maintain wikis. They don't fill in forms. They don't write ADRs consistently. Every knowledge management system fails for the same reason: it asks people to do extra work on top of the work they're already doing.

Genuvia Platform takes a different approach.

**Don't ask engineers to document. Capture knowledge as a byproduct of work they're already doing.**

---

## How Knowledge Gets Captured

### Method 1 — Explicit Decisions (Highest Quality)

Sometimes a decision deserves to be logged deliberately. A simple form in Backstage:

```
+ New Decision

Title:                 Move from SQLite to PostgreSQL
Reason:                Need concurrent writes
Alternatives:          SQLite, MongoDB
Affected Services:     genuvia-core
Expected Outcome:      Scales better in production
```

That becomes a permanent engineering record — structured, attributed, timestamped.

---

### Method 2 — Pull Requests (Automatic)

A PR is merged:

```
PR #42: Replace SQLite with PostgreSQL
```

Genuvia detects it touches the database layer, updates deployment config, modifies migrations. It asks once:

```
This looks like an architectural decision. Would you like to save it?
[Yes] [No]
```

One click. No typing. Decision captured.

---

### Method 3 — ADR Detection (Already Partially Built)

Someone adds `docs/architecture/ADR-007.md`. Genuvia automatically parses:

```
Title, Context, Decision, Consequences
```

Decision Memory updates itself. No plugin UI required. The ADRs you're already writing become the source of truth.

---

### Method 4 — Incident Resolution

Production breaks. After the incident closes, the postmortem becomes Incident Memory — linked to the deployment, service, owner, database, and Kubernetes event. Not a PDF. A structured memory connected to the engineering graph.

---

### Method 5 — Git History Pattern Detection

Commits like:

```
feat(database): move to postgres
fix(redis): prevent connection leak
refactor(auth): jwt middleware
```

After enough commits, Genuvia surfaces patterns:

```
Database Architecture: Changed 12 times
Redis has caused 4 production fixes
```

Nobody entered those manually. The git history told the story.

---

### Method 6 — Meetings

Upload `meeting.mp3` or `meeting.md`. AI extracts decisions, owners, deadlines, alternatives, open questions — and adds them to memory.

---

### Method 7 — Chat (Telegram / Slack)

```
Engineer: Let's use Qdrant. FAISS won't scale for our use case.

Genuvia: This sounds like an engineering decision. Save it?
[Yes] [No]
```

Capture happens in the flow of conversation. Already partially implemented via Telegram.

---

### Method 8 — Deployments

Every successful deployment is recorded:

```
Version, Cluster, Namespace, Author, Related PR
```

Decisions get linked to the deployments that implemented them automatically.

---

## What a Decision Looks Like

Today, Decision Memory shows:

```
Decision
We chose FastAPI over Django
ntando-miya · 6/25/2026
```

The full vision:

```
Decision: Use FastAPI over Django
Status: Active
Reason: Async support required for real-time trading signals
Alternatives: Django, Flask
Affected Services: genuvia-edge, genuvia-core
Author: Ntando Miya
Date: June 2026

Connected to:
  Commits: 18
  Deployments: 42
  Incidents: 0
  Still Valid: Yes
```

One decision. Full context. Connected to everything that implements or tests it.

---

## Contradiction Detection

Six months later, someone proposes:

```
/remember We should migrate to Django for better ORM support
```

Genuvia responds:

```
Potential contradiction detected.

In June 2026, FastAPI was chosen because:
• Async performance for trading latency
• Lower memory overhead
• Real-time signal delivery requirements

What's changed?
• Performance requirements
• Team skills
• Business needs
• Other
```

It isn't blocking the decision. It's asking the organization to explain why it's changing direction. That explanation becomes part of the memory too.

---

## The Long-Term Vision

Eventually, engineers should rarely have to click "New Decision."

Genuvia infers decisions from normal engineering work:

| Signal | What Genuvia Captures |
|---|---|
| Git commits | Architecture patterns, recurring fixes |
| Pull requests | Architectural decisions, dependency changes |
| ADR files | Formal decisions with full context |
| Kubernetes deployments | Infrastructure decisions, version history |
| Incident postmortems | Lessons learned, root causes |
| Meeting notes / transcripts | Verbal decisions, open questions |
| Chat messages | Informal decisions, rationale |
| Code reviews | Standards, trade-offs |

Each signal is evidence that the organization has learned something or made a decision. Genuvia's job is to connect those signals into a living memory, then surface the right context when someone needs it.

---

## The Shift

This moves the platform from:

> "A place where you store knowledge"

To:

> "A system that continuously discovers and maintains organizational knowledge"

Engineers work normally. Genuvia watches, connects, and surfaces. The knowledge graph builds itself.

---

## Current State vs Vision

| Capability | Status |
|---|---|
| Explicit decision capture (Backstage form) | Planned |
| Telegram command capture (/remember) | In progress |
| ADR file parsing | Planned — ADRs already exist |
| Backstage Decision Memory card | ✓ Built |
| Basic contradiction detection | ✓ Built (keyword overlap) |
| Vector similarity contradiction detection | Planned (Phase 4) |
| PR-triggered capture | Planned |
| Git pattern detection | Planned |
| Incident memory | Planned |
| Meeting transcript parsing | Future |
| Slack integration | Future |
| Deployment event capture | Planned |

---

## Why This Is Defensible

Every tool that asks engineers to do extra work fails. Confluence, Notion, internal wikis — all abandoned within months because the maintenance burden falls on people who have other priorities.

Genuvia wins by making capture effortless and making retrieval valuable enough that engineers want to use it. The contradiction detection is the hook. The knowledge graph is the value that compounds. The automatic capture methods are what make it sustainable.

---

*Built by Ntando Miya — Genuvia (Pty) Ltd, Johannesburg*
