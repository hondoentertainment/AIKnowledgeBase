---
name: content-update-agent
description: Researches, validates, and adds new AI tools, resources, and content to the knowledge base. Handles the full daily update cycle.
trigger: Daily scheduled, on-demand, or when user says "update content" / "add new tools" / "refresh data"
---

# Content Update Agent

## Purpose
Keep the AI Knowledge Hub catalog fresh by discovering new tools, resources, and content, then validating and inserting them into the data files with proper metadata.

## When to Use
- Daily scheduled update cycle
- When the user asks to add new content or refresh data
- When the freshness scan shows stale or missing entries
- After major AI announcements or product launches

## Workflow

### Phase 1: Scan & Assess
```bash
node daily-update-agent.js scan
```
- Review category counts and freshness metrics
- Identify underfilled categories (< 20 items)
- Check for missing dateAdded/lastVerified metadata
- Detect duplicate URLs across categories

### Phase 2: Research New Content
```bash
node daily-update-agent.js prompts
```
- Use generated prompts with web search to find new tools and resources
- Check the sources listed in `update-sources.json`
- Focus on items launched or updated in the past 7 days
- Prioritize: dailyWatch, bleedingEdge, tools (highest churn categories)

### Phase 3: Prepare New Entries
Create a JSON file (e.g., `new-entries.json`) with discovered items:
```json
{
  "tools": [
    {
      "title": "New AI Tool",
      "description": "One-sentence description of what it does.",
      "url": "https://newtool.ai",
      "tags": ["Category", "Type", "Use Case"],
      "icon": "🔹",
      "color": ["#hex1", "#hex2"],
      "level": 3,
      "freq": "Continuous",
      "dateAdded": "2026-03-28"
    }
  ],
  "bleedingEdge": [...],
  "dailyWatch": [...]
}
```

### Phase 4: Validate & Insert
```bash
node daily-update-agent.js add new-entries.json
```
- Automatic deduplication (by URL and title)
- Schema validation (required fields, types)
- Freshness metadata injection (dateAdded, lastVerified)
- Safe insertion at end of category arrays

### Phase 5: Freshen Existing Metadata
```bash
node daily-update-agent.js freshen
```
- Backfill dateAdded/lastVerified on entries missing them
- Ensures all items have tracking metadata

### Phase 6: Verify (Optional, Slow)
```bash
node daily-update-agent.js verify
```
- HTTP HEAD check on all URLs
- Reports broken links (404, timeout, domain expired)
- Saves report to `update-reports/verify-YYYY-MM-DD.json`

## Entry Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Tool/resource name |
| description | string | Yes | One clear sentence |
| url | string | Yes | Primary URL |
| tags | string[] | Yes | 2-4 descriptive tags |
| icon | string | Yes | Single emoji |
| color | string[2] | Yes | Gradient hex pair ["#from", "#to"] |
| level | number | Yes | Difficulty 1-10 |
| freq | string | Yes | Daily, Weekly, Monthly, Continuous, Self-Paced, Reference |
| dateAdded | string | Auto | ISO date YYYY-MM-DD |
| lastVerified | string | Auto | ISO date YYYY-MM-DD |

## Quality Criteria for New Entries

1. **Real and active** — URL returns 200, product is not sunset
2. **Distinct** — Not a duplicate or minor variant of existing entry
3. **Useful** — Provides clear value for AI practitioners
4. **Well-described** — Description is factual, one sentence, no marketing fluff
5. **Correctly categorized** — In the right category with relevant tags
6. **Recent** — Launched or significantly updated within past 90 days (for new additions)

## Update Priority by Category

| Category | Churn Rate | Update Frequency | Target Coverage |
|----------|-----------|-------------------|-----------------|
| dailyWatch | High | Check daily | All major AI newsletters and feeds |
| bleedingEdge | High | Check 2-3x/week | New agent frameworks, models, research |
| tools | Medium | Check weekly | All notable AI tools and platforms |
| knowledge | Low | Check biweekly | Key articles, guides, documentation |
| training | Low | Check monthly | New courses from top platforms |
| podcasts | Low | Check monthly | Active AI podcasts |
| youtube | Low | Check monthly | Active AI channels |
| niche | Low | Check monthly | 4-8 tools per niche category |

## Automated Pipeline (CI/CD)

The daily update can run via GitHub Actions (`.github/workflows/daily-update.yml`):
1. Triggered on schedule (cron) or manual dispatch
2. Runs `scan` to assess current state
3. Uses Claude Code to research and generate new entries
4. Runs `add` to validate and insert
5. Commits and creates a PR for review

## Files
- `daily-update-agent.js` — Main update script (scan, add, verify, freshen)
- `update-sources.json` — Source URLs and search queries per category
- `update-reports/` — Generated verification reports
- `data.js` — Primary data file (modified by add/freshen commands)
- `niche-data.js` — Niche data file (modified by freshen command)
