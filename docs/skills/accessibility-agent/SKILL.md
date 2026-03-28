---
name: accessibility-agent
description: Checks WCAG 2.1 AA compliance, ARIA usage, keyboard navigation, and contrast ratios across all pages.
trigger: Per-PR, before release, or on-demand.
---

# Accessibility Agent

## Purpose
Ensure AI Knowledge Hub meets WCAG 2.1 AA standards across all pages. Catches accessibility regressions and guides remediation.

## When to Use
- Before merging PRs that change UI
- Before each release
- After adding new interactive components
- When expanding to new pages or features

## Audit Areas

### 1. Semantic HTML & Document Structure
- [ ] Each page has exactly one `<h1>`
- [ ] Heading levels don't skip (h1 → h2 → h3, never h1 → h3)
- [ ] Landmark regions used: `<header>`, `<nav>`, `<main>`, `<footer>`
- [ ] `<main>` has `id="main-content"` and skip link targets it
- [ ] Lists use `<ul>`/`<ol>`, not styled divs
- [ ] Tables (if any) have `<caption>` and `<th>` with `scope`

### 2. ARIA & Live Regions
- [ ] `aria-live="polite"` on dynamic content (search results, toasts, stats)
- [ ] `aria-expanded` on toggleable controls (search bar, hamburger menu, dropdowns)
- [ ] `aria-pressed` on toggle buttons (theme, stack, "I Use This")
- [ ] `aria-label` on icon-only buttons
- [ ] `role="status"` on loading/progress indicators
- [ ] No redundant ARIA (don't add `role="button"` to `<button>`)

### 3. Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Tab order follows visual reading order
- [ ] Escape closes modals, dropdowns, and overlays
- [ ] Enter/Space activates buttons and links
- [ ] Arrow keys navigate within card grids and rating controls
- [ ] Focus is trapped inside open modals
- [ ] Focus is returned to trigger element when modal/overlay closes
- [ ] Visible focus indicator on all interactive elements (both themes)

### 4. Color & Contrast
- [ ] Text contrast ratio ≥ 4.5:1 (normal text) and ≥ 3:1 (large text)
- [ ] `--text-muted` color passes contrast against both `--bg` and `--bg-elevated`
- [ ] Trust badges and tag chips are readable in both light and dark mode
- [ ] Star ratings are distinguishable without color alone (filled vs outline shape)
- [ ] Error states use icon + text, not just red color
- [ ] Focus indicators visible against both light and dark backgrounds

### 5. Images & Media
- [ ] All `<img>` have meaningful `alt` text (or `alt=""` if decorative)
- [ ] SVG icons use `aria-hidden="true"` when paired with text labels
- [ ] No information conveyed solely through images
- [ ] Gradient card backgrounds don't reduce text legibility

### 6. Forms & Inputs
- [ ] All inputs have associated `<label>` (visible or `aria-label`)
- [ ] Error messages are linked via `aria-describedby`
- [ ] Required fields indicated with both visual and programmatic cues
- [ ] Search input has `type="search"` and `aria-label`
- [ ] Form submission errors don't clear user input

### 7. Motion & Animation
- [ ] `prefers-reduced-motion` media query respected
- [ ] No auto-playing animations that can't be paused
- [ ] Transitions are brief (< 300ms) and non-disorienting
- [ ] Toast notifications persist long enough to read (≥ 4s)

## Automated Checks

Run these via Playwright or browser DevTools:

```javascript
// Quick a11y checks for any page
function checkAccessibility(document) {
  const issues = [];

  // Check for skip link
  if (!document.querySelector('.skip-link'))
    issues.push({ severity: 'high', issue: 'Missing skip link' });

  // Check heading hierarchy
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  let lastLevel = 0;
  headings.forEach(h => {
    const level = parseInt(h.tagName[1]);
    if (level > lastLevel + 1)
      issues.push({ severity: 'medium', issue: `Heading skip: h${lastLevel} → h${level}`, element: h.textContent.slice(0, 50) });
    lastLevel = level;
  });

  // Check images for alt text
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('alt'))
      issues.push({ severity: 'high', issue: 'Image missing alt attribute', element: img.src });
  });

  // Check buttons for accessible names
  document.querySelectorAll('button').forEach(btn => {
    const name = btn.textContent.trim() || btn.getAttribute('aria-label') || '';
    if (!name)
      issues.push({ severity: 'high', issue: 'Button without accessible name', element: btn.outerHTML.slice(0, 80) });
  });

  // Check for aria-expanded on toggles
  document.querySelectorAll('[id*="toggle"], .nav-toggle').forEach(el => {
    if (!el.hasAttribute('aria-expanded'))
      issues.push({ severity: 'medium', issue: 'Toggle missing aria-expanded', element: el.id || el.className });
  });

  return issues;
}
```

## Output Format

```markdown
## Accessibility Audit Report
**Date**: YYYY-MM-DD
**Pages tested**: [list]
**Standard**: WCAG 2.1 AA

### Summary
- Critical issues: X
- Warnings: Y
- Passes: Z

### Critical Issues (Must Fix)
| Page | Issue | WCAG Criterion | Fix |
|------|-------|---------------|-----|
| ... | ... | 1.3.1 Info & Relationships | ... |

### Warnings (Should Fix)
| Page | Issue | WCAG Criterion | Fix |
|------|-------|---------------|-----|
| ... | ... | ... | ... |

### Passes
- [x] Skip link present on all pages
- [x] Heading hierarchy correct
- ...
```

## Workflow

1. **Select scope**: Full site or specific pages/components
2. **Run automated checks**: Playwright a11y test suite + manual checks
3. **Test keyboard navigation**: Tab through every page, test all shortcuts
4. **Test screen reader**: Verify announcements for dynamic content
5. **Check contrast**: Use DevTools or axe-core for color ratios
6. **Test both themes**: Run all checks in light and dark mode
7. **Generate report**: Categorize by severity, map to WCAG criteria
8. **File issues**: Create tasks for Critical and Warning items
