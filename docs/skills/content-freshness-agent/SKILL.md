---
name: content-freshness-agent
description: Detects stale, outdated, or broken entries in the data catalog. Flags items for review or removal.
trigger: Weekly, on data.js/niche-data.js changes, or on-demand.
---

# Content Freshness Agent

## Purpose
Maintain data quality by scanning `data.js` and `niche-data.js` for stale, broken, or outdated entries. Ensures the catalog stays trustworthy and current.

## When to Use
- Weekly scheduled review
- After bulk data additions or imports
- When users report outdated resources
- Before a major release

## Detection Rules

### 1. URL Health Check
- Verify all `url` fields return HTTP 200 (or redirect to valid page)
- Flag 404, 5xx, timeout (>10s), or domain-expired responses
- Check for URL pattern changes (e.g., domain migrations)
- **Action**: Mark as `stale: true` or remove after manual review

### 2. Duplicate Detection
- Check for items with identical `url` values across categories
- Check for items with identical `title` values (case-insensitive)
- Check for near-duplicate descriptions (>80% string similarity)
- **Action**: Flag duplicates for merge or removal

### 3. Content Staleness Signals
- Items referencing deprecated tools or sunset products
- Items with titles containing year references older than current year - 1
- Items linking to archived repositories or deprecated APIs
- Training resources for outdated framework versions
- **Action**: Flag for editorial review

### 4. Data Schema Validation
- Every item has required fields: `title`, `description`, `url`
- `tags` is a non-empty array of strings
- `color` is an array of exactly 2 valid hex codes
- `icon` is a non-empty string
- `level` (if present) is 1–10
- `freq` (if present) is a known frequency string
- **Action**: Report schema violations for fix

### 5. Category Balance
- Report item counts per category
- Flag categories with < 3 items (too sparse)
- Flag categories with > 50 items (consider splitting)
- Compare category growth rates
- **Action**: Recommend rebalancing or new subcategories

## Scan Script

The agent can use this JavaScript scan logic (runs in Node.js or browser console):

```javascript
// Content Freshness Scanner
function scanFreshness(data) {
  const report = { broken: [], duplicates: [], schemaErrors: [], stats: {} };

  for (const [category, items] of Object.entries(data)) {
    if (!Array.isArray(items)) continue;
    report.stats[category] = items.length;

    const seen = new Map();
    items.forEach((item, i) => {
      // Schema check
      if (!item.title) report.schemaErrors.push({ category, index: i, error: 'missing title' });
      if (!item.description) report.schemaErrors.push({ category, index: i, error: 'missing description' });
      if (!item.url) report.schemaErrors.push({ category, index: i, error: 'missing url' });
      if (!Array.isArray(item.tags) || item.tags.length === 0)
        report.schemaErrors.push({ category, index: i, item: item.title, error: 'missing or empty tags' });
      if (!Array.isArray(item.color) || item.color.length !== 2)
        report.schemaErrors.push({ category, index: i, item: item.title, error: 'invalid color array' });

      // Duplicate check
      const key = (item.title || '').toLowerCase().trim();
      if (seen.has(key)) {
        report.duplicates.push({ category, title: item.title, indices: [seen.get(key), i] });
      } else {
        seen.set(key, i);
      }
    });
  }

  return report;
}
```

## Output Format

```markdown
## Content Freshness Report
**Date**: YYYY-MM-DD
**Data files scanned**: data.js, niche-data.js

### Catalog Stats
| Category | Count | Change |
|----------|-------|--------|
| tools | XX | +N |
| ... | ... | ... |

### Broken URLs (Action Required)
| Item | Category | URL | Status |
|------|----------|-----|--------|
| ... | ... | ... | 404 |

### Duplicates Found
| Title | Categories | Action |
|-------|-----------|--------|
| ... | tools, knowledge | Merge |

### Schema Violations
| Item | Category | Issue |
|------|----------|-------|
| ... | ... | Missing tags |

### Staleness Warnings
| Item | Category | Signal |
|------|----------|--------|
| ... | ... | References 2024 |
```

## Workflow

1. **Load data**: Parse `data.js` and `niche-data.js`
2. **Run schema validation**: Check required fields and types
3. **Check for duplicates**: Title and URL matching
4. **Scan for staleness signals**: Year references, known deprecated tools
5. **URL health check** (optional, slower): HTTP HEAD requests to all URLs
6. **Generate report**: Summarize findings with action items
7. **Create tasks**: File issues for broken/stale items needing human review
