# Agent Skills Reference

This folder documents the agent skills used in the AI Knowledge Hub development pipeline. Skills provide structured guidance for AI-assisted development.

## Setup

To use these skills in Cursor:

1. Create `.cursor/skills/` in the project root
2. Add a `SKILL.md` file for each skill (e.g. `feature-evaluation-agent/SKILL.md`)
3. Use the YAML frontmatter and workflow sections from the examples below

## Skill Summary

| Skill | Purpose |
|-------|---------|
| feature-evaluation-agent | Evaluates new feature ideas for viability, scope, value |
| design-assessment-agent | Assesses UI/UX for usability, accessibility, consistency |
| technical-architecture-agent | Reviews architecture, patterns, tech choices |
| builder-agent | Implements features following design and architecture |
| testing-agent | Creates and runs unit, integration, E2E tests |
| deployment-agent | Handles CI/CD, release workflows, rollout |
| user-review-agent | Analyzes post-launch feedback and metrics |

## Example: Feature Evaluation Agent

```yaml
---
name: feature-evaluation-agent
description: Evaluates new feature ideas for viability, scope, value, and product fit.
---

# Feature Evaluation Agent

## When to Use
- User proposes a new feature or capability
- Roadmap prioritization or backlog grooming

## Evaluation Criteria
- User value, Strategic fit, Feasibility, Scope clarity, Risk

## Output
- Verdict: Go / No-Go / Iterate
- MVP scope and future phases
- Risks and mitigations
```

## Full Skills

For complete skill definitions, inspect `.cursor/skills/<skill-name>/SKILL.md` in the project. If `.cursor` is gitignored, these docs serve as the reference for recreating the pipeline.
