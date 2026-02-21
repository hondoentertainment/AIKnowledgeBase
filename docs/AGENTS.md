# Feature Development Agent Pipeline

A structured pipeline of specialized agents for evaluating, designing, building, testing, deploying, and reviewing new features.

## Pipeline Overview

```
┌─────────────────────┐
│ Feature Evaluation  │  ← Assess viability, scope, value
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Design Assessment   │  ← UX, UI, accessibility
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Technical Arch      │  ← Architecture, patterns, tech choices
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Builder Agent       │  ← Implement the feature
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Testing Agent       │  ← Unit, integration, E2E
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Deployment Agent    │  ← CI/CD, release, rollout
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ User Review Agent   │  ← Post-launch feedback, metrics
└─────────────────────┘
```

## When to Use Which Agent

| Agent | Trigger | Example Prompt |
|-------|---------|----------------|
| **Feature Evaluation** | New feature idea, prioritization | "Evaluate this feature idea…" |
| **Design Assessment** | Wireframes, mockups, UI review | "Assess the design for…" |
| **Technical Architecture** | Before build, tech decisions | "Review architecture for…" |
| **Builder** | Implementation phase | "Build the [feature]…" |
| **Testing Agent** | Pre-release, quality gates | "Add tests for…" / "Run test suite" |
| **Deployment Agent** | Release, CI/CD setup | "Deploy to…" / "Set up deployment" |
| **User Review Agent** | Post-launch analysis | "Analyze user feedback for…" |

## Agent Skills

Skills live in `.cursor/skills/`. To set up this pipeline in your environment:

1. Copy or symlink the `.cursor/skills/` folder from this repo (or recreate from `docs/skills/`)
2. Ensure `.cursor` is **not** in `.gitignore` if you want to version skills, or maintain a `docs/skills/` copy as reference

### Available Skills

- `feature-evaluation-agent` — Evaluates viability, scope, value
- `design-assessment-agent` — UX, UI, accessibility review
- `technical-architecture-agent` — Architecture and tech choices
- `builder-agent` — Implements features per spec
- `testing-agent` — Unit, integration, E2E tests
- `deployment-agent` — CI/CD, release workflows
- `user-review-agent` — Post-launch analysis

---

*For root reference, see [AGENTS.md](../AGENTS.md) in the project root.*
