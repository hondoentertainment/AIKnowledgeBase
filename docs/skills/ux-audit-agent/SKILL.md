---
name: ux-audit-agent
description: Evaluates pages against UX heuristics, identifies friction points, and scores improvement opportunities.
trigger: On-demand, per-sprint, or when new pages/features are added.
---

# UX Audit Agent

## Purpose
Systematically evaluate AI Knowledge Hub pages against established UX heuristics (Nielsen's 10, plus domain-specific criteria). Produces a scored report with prioritized action items.

## When to Use
- After shipping a new page or major feature
- During sprint planning to identify UX debt
- Before a release to catch regressions
- When user feedback indicates friction

## Audit Checklist

### 1. Navigation & Wayfinding
- [ ] User can identify current location (active nav state, breadcrumbs)
- [ ] All pages reachable within 3 clicks from home
- [ ] Back navigation works predictably
- [ ] Mobile hamburger menu is discoverable and functional
- [ ] Search is accessible from every page (/ shortcut works)

### 2. Information Architecture
- [ ] Page title clearly communicates purpose
- [ ] Content hierarchy uses proper heading levels (h1 → h2 → h3)
- [ ] Related items are grouped logically
- [ ] Categories are mutually understandable (no ambiguous overlap)
- [ ] Empty states provide guidance and CTAs

### 3. Interaction Design
- [ ] All interactive elements have visible affordances (look clickable)
- [ ] Actions provide immediate feedback (toast, state change, animation)
- [ ] Destructive actions require confirmation
- [ ] Form inputs validate inline with clear error messages
- [ ] Loading states are shown for async operations

### 4. Visual Design & Consistency
- [ ] Consistent spacing, typography, and color usage across pages
- [ ] Dark mode parity — all elements render correctly in both themes
- [ ] Card designs match across category, search, stack, and niche pages
- [ ] Icons are consistent in style and size
- [ ] Trust badges and metadata are visually distinct from content

### 5. Mobile & Touch
- [ ] Touch targets are ≥ 44px
- [ ] No horizontal scroll on mobile (except intentional carousels)
- [ ] Bottom navigation is clear and functional
- [ ] Cards are readable without zooming
- [ ] Modals and overlays are dismissible via swipe or tap-outside

### 6. Onboarding & First Use
- [ ] First-time visitor sees onboarding or clear guidance
- [ ] Core value proposition is communicated within 10 seconds
- [ ] First meaningful action achievable within 30 seconds
- [ ] Empty pages explain their purpose and how to populate them

### 7. Error Handling & Recovery
- [ ] Offline state is handled gracefully (service worker fallback)
- [ ] Search with no results shows suggestions
- [ ] Broken links or missing data show helpful messages
- [ ] Form errors don't clear user input

## Scoring

Rate each section 1–10. Calculate weighted average:

| Section | Weight |
|---------|--------|
| Navigation & Wayfinding | 20% |
| Information Architecture | 15% |
| Interaction Design | 20% |
| Visual Design & Consistency | 15% |
| Mobile & Touch | 15% |
| Onboarding & First Use | 10% |
| Error Handling & Recovery | 5% |

## Output Format

```markdown
## UX Audit Report — [Page/Feature Name]
**Date**: YYYY-MM-DD
**Overall Score**: X/10

### Scores by Section
| Section | Score | Notes |
|---------|-------|-------|
| Navigation | X/10 | ... |
| ...     | ...   | ... |

### Critical Issues (Fix Now)
1. [Issue]: [Description] → [Recommended fix]

### Improvements (Next Sprint)
1. [Issue]: [Description] → [Recommended fix]

### Nice-to-Have
1. [Enhancement]: [Description]
```

## Workflow

1. **Select scope**: Full site audit or specific page/feature
2. **Walk through each checklist item**: Open the page, test interactions, check both themes
3. **Score each section**: Note specific failures with screenshots or code references
4. **Prioritize findings**: Critical (blocks users) > Improvements (causes friction) > Nice-to-have
5. **Generate report**: Use output format above
6. **File issues**: Create actionable tasks from Critical and Improvement items
