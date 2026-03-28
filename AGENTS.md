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
| **Content Update Agent** | Daily/weekly content refresh | "Update content" / "Add new tools" / "Refresh data" |

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

### 8. Content Update Agent
**Skill**: `content-update-agent`

Researches, validates, and adds new AI tools, resources, and content to the knowledge base. Handles the full daily update cycle: scan data for gaps, generate research prompts, validate new entries, deduplicate, inject freshness metadata, and produce commit-ready changes.

**Commands:**
```bash
node daily-update-agent.js scan      # Analyze current data, report gaps
node daily-update-agent.js prompts   # Generate research prompts for new content
node daily-update-agent.js add FILE  # Merge validated entries from JSON
node daily-update-agent.js verify    # Check all URLs for broken links
node daily-update-agent.js freshen   # Add dateAdded/lastVerified metadata
node daily-update-agent.js report    # Full daily report (scan + prompts)
```

**Automated via:** `.github/workflows/daily-update.yml` (runs daily at 08:00 UTC)

---

## UX Maintenance Agents (Ongoing)

These agents handle continuous UX quality monitoring and can be run on-demand or automated via CI.

```
┌─────────────────────┐     ┌─────────────────────┐
│  UX Audit Agent     │     │ Content Freshness   │
│  (Heuristic review) │     │ (Data quality scan) │
└──────────┬──────────┘     └──────────┬──────────┘
           │                            │
           ▼                            ▼
┌─────────────────────┐     ┌─────────────────────┐
│ Accessibility Agent │     │ Performance Agent   │
│  (WCAG compliance)  │     │ (Budget monitoring) │
└─────────────────────┘     └─────────────────────┘
```

### 8. UX Audit Agent
**Skill**: `ux-audit-agent`

Evaluates pages against UX heuristics (navigation, information architecture, interaction design, visual consistency, mobile, onboarding, error handling). Produces scored reports with prioritized action items.

### 9. Content Freshness Agent
**Skill**: `content-freshness-agent`

Scans `data.js` and `niche-data.js` for schema violations, duplicate entries, stale content, and broken URLs. Run weekly or after data changes.

### 10. Accessibility Agent
**Skill**: `accessibility-agent`

Checks WCAG 2.1 AA compliance: semantic HTML, ARIA usage, keyboard navigation, color contrast, form labels, and motion sensitivity. Run before each release.

### 11. Performance Agent
**Skill**: `performance-agent`

Monitors asset sizes against budgets (JS < 500KB, CSS < 150KB, LCP < 2.0s) and flags render-blocking scripts. Run per-deploy.

### Running UX Agents Locally

```bash
# Run all UX agents
node ux-agents.js all

# Run a specific agent
node ux-agents.js freshness
node ux-agents.js a11y
node ux-agents.js performance

# Verbose output
node ux-agents.js all --verbose
```

### Running in CI

Add to `.github/workflows/deploy.yml`:

```yaml
- name: Run UX agents
  run: node ux-agents.js all
```

| Agent | Trigger | Schedule |
|-------|---------|----------|
| **UX Audit** | New page/feature, sprint review | Per-sprint |
| **Content Freshness** | Data changes, weekly | Weekly |
| **Accessibility** | UI changes, pre-release | Per-PR |
| **Performance** | Any deploy, asset changes | Per-deploy |

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
