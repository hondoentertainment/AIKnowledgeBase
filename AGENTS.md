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

## Agent Details

### 1. Feature Evaluation Agent
**Skill**: `feature-evaluation-agent`

Evaluates new feature ideas for viability, scope, value, and fit. Produces go/no-go, scope boundaries, and prioritization.

### 2. Design Assessment Agent
**Skill**: `design-assessment-agent`

Assesses UI/UX design for usability, accessibility, consistency, and alignment with best practices.

### 3. Technical Architecture Agent
**Skill**: `technical-architecture-agent`

Reviews and recommends technical architecture: patterns, components, data flow, and integration points.

### 4. Builder Agent
**Skill**: `builder-agent`

Implements features following approved design and architecture. Focuses on clean, maintainable code.

### 5. Testing Agent
**Skill**: `testing-agent`

Creates and runs tests (unit, integration, E2E). Ensures quality gates before release.

### 6. Deployment Agent
**Skill**: `deployment-agent`

Handles CI/CD, release workflows, environment config, and rollout strategies.

### 7. User Review Agent
**Skill**: `user-review-agent`

Analyzes post-launch feedback, usage metrics, and recommends iterations based on real usage.

---

## Quick Start

Invoke agents by name or by describing the phase:

- *"Run the feature evaluation on [idea]"* → Feature Evaluation Agent
- *"Design assessment for the new checkout flow"* → Design Assessment Agent
- *"Architecture review for the real-time sync feature"* → Technical Architecture Agent
- *"Build the export feature per the spec"* → Builder Agent
- *"Add tests for the auth module"* or *"Run full test suite"* → Testing Agent
- *"Deploy to staging"* or *"Set up Vercel deployment"* → Deployment Agent
- *"Analyze user feedback for the new dashboard"* → User Review Agent

## Skills Location

All agent skills live in `.cursor/skills/` and are available when working in this project.
