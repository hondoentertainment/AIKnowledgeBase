---
name: performance-agent
description: Monitors Core Web Vitals, asset sizes, and runtime performance. Flags regressions against defined budgets.
trigger: Per-deploy, before release, or on-demand.
---

# Performance Agent

## Purpose
Track and enforce performance budgets for AI Knowledge Hub. Detect regressions in load time, interactivity, and visual stability. Recommend optimizations.

## When to Use
- After deploying changes to production
- Before a release to verify no regressions
- When users report slowness
- When adding new scripts, data, or assets

## Performance Budgets

| Metric | Budget | Current Target |
|--------|--------|----------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 2.0s |
| **INP** (Interaction to Next Paint) | < 200ms | < 150ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.05 |
| **FCP** (First Contentful Paint) | < 1.8s | < 1.5s |
| **Total JS size** | < 500KB | < 400KB |
| **Total CSS size** | < 150KB | < 130KB |
| **data.js size** | < 250KB | < 220KB |
| **Time to Interactive** | < 3.5s | < 3.0s |

## Audit Areas

### 1. Asset Size Tracking
- [ ] Measure total size of all JS files (uncompressed and gzipped)
- [ ] Measure total size of CSS files
- [ ] Measure data.js and niche-data.js sizes
- [ ] Check for unused CSS rules (> 50% unused = flag)
- [ ] Check for duplicate code across JS modules
- [ ] Verify no large inline data URIs (> 10KB) in HTML

### 2. Load Performance
- [ ] Measure LCP on index.html (hero section is LCP candidate)
- [ ] Measure FCP on all category pages
- [ ] Check script loading order — critical scripts first, defer non-critical
- [ ] Verify Google Fonts loaded with `display=swap`
- [ ] Check service worker caching covers all critical assets
- [ ] No render-blocking scripts without `defer` or `async`

### 3. Runtime Performance
- [ ] Card grid rendering time for 50+ items < 100ms
- [ ] Search filtering response time < 50ms per keystroke
- [ ] Star rating interaction latency < 16ms (single frame)
- [ ] Scroll performance: no jank on category pages or niche TOC
- [ ] No memory leaks from event listeners on page navigation

### 4. Caching & Offline
- [ ] Service worker pre-caches all critical assets
- [ ] Cache versioning updated on code changes
- [ ] Stale-while-revalidate for data files
- [ ] Offline fallback page renders correctly
- [ ] Cache size stays within browser limits (< 50MB)

### 5. Mobile Performance
- [ ] Test on simulated 3G (slow connection)
- [ ] Test on mid-range device (4x CPU slowdown)
- [ ] Touch interactions respond within 100ms
- [ ] No excessive DOM size (< 1500 elements per page)
- [ ] Images/icons lazy-loaded below the fold

## Measurement Script

```javascript
// Performance measurement for CI or manual runs
function measurePerformance() {
  const metrics = {};

  // Core Web Vitals via PerformanceObserver
  if ('PerformanceObserver' in window) {
    // LCP
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      metrics.lcp = entries[entries.length - 1].startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // CLS
    let clsValue = 0;
    new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) clsValue += entry.value;
      });
      metrics.cls = clsValue;
    }).observe({ type: 'layout-shift', buffered: true });

    // FCP
    new PerformanceObserver(list => {
      metrics.fcp = list.getEntries()[0].startTime;
    }).observe({ type: 'paint', buffered: true });
  }

  // Resource sizes
  const resources = performance.getEntriesByType('resource');
  metrics.jsSize = resources
    .filter(r => r.name.endsWith('.js'))
    .reduce((sum, r) => sum + (r.transferSize || 0), 0);
  metrics.cssSize = resources
    .filter(r => r.name.endsWith('.css'))
    .reduce((sum, r) => sum + (r.transferSize || 0), 0);
  metrics.totalResources = resources.length;

  return metrics;
}
```

## Asset Size Check (Node.js / CI)

```bash
#!/bin/bash
# Quick asset budget check
echo "=== Asset Size Report ==="
echo "JS files:"
find . -name "*.js" -not -path "./node_modules/*" -not -path "./.git/*" | \
  xargs wc -c | sort -n | tail -20
echo ""
echo "CSS files:"
find . -name "*.css" -not -path "./node_modules/*" | xargs wc -c | sort -n
echo ""
echo "Data files:"
wc -c data.js niche-data.js 2>/dev/null
echo ""
TOTAL_JS=$(find . -name "*.js" -not -path "./node_modules/*" -not -path "./.git/*" | xargs cat | wc -c)
echo "Total JS: ${TOTAL_JS} bytes"
if [ "$TOTAL_JS" -gt 500000 ]; then
  echo "WARNING: JS budget exceeded (>500KB)"
fi
```

## Output Format

```markdown
## Performance Report
**Date**: YYYY-MM-DD
**Environment**: [Device/Network profile]

### Core Web Vitals
| Metric | Value | Budget | Status |
|--------|-------|--------|--------|
| LCP | X.Xs | <2.0s | ✅/❌ |
| INP | Xms | <200ms | ✅/❌ |
| CLS | X.XX | <0.05 | ✅/❌ |
| FCP | X.Xs | <1.5s | ✅/❌ |

### Asset Sizes
| Asset | Size | Budget | Status |
|-------|------|--------|--------|
| Total JS | XKB | <400KB | ✅/❌ |
| Total CSS | XKB | <130KB | ✅/❌ |
| data.js | XKB | <220KB | ✅/❌ |

### Recommendations
1. [Optimization]: [Expected impact]
```

## Workflow

1. **Set environment**: Define device and network simulation profile
2. **Measure Core Web Vitals**: Run Lighthouse or custom script on key pages
3. **Check asset budgets**: Run size check against all JS/CSS/data files
4. **Profile runtime**: Check rendering and interaction latency
5. **Verify caching**: Audit service worker cache contents and strategy
6. **Compare to baseline**: Flag any regressions from last report
7. **Generate report**: Summarize metrics vs budgets
8. **File issues**: Create tasks for any budget violations
