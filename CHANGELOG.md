# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- April 21, 2026 content refresh:
  - Knowledge: Sora Wind-down Migration Resources (5 days to shutdown), Claude Code Hooks Documentation, DeepSeek V4 Model Card, Qwen 3 Documentation
  - Bleeding edge: DeepSeek V4 (Live) — 1T param MoE, native multimodal, Apache 2.0
- April 16, 2026 content refresh:
  - Tools: MiniMax MMX-CLI (multimodal CLI for agents)
  - Bleeding edge: Cursor 3 agent-first interface, Claude Mythos Preview, Project Glasswing, MMX-CLI
  - Knowledge: Project Glasswing announcement, Schneier analysis, Sora discontinuation notice, Cursor 3 release notes, MMX-CLI docs
  - Daily watch: Anthropic Red Team blog, The Decoder
- `docs/AGENTS.md` — Shareable agent pipeline documentation
- `docs/skills/README.md` — Agent skills reference
- `CONTRIBUTING.md` — Contribution guidelines
- `ARCHITECTURE.md` — Architecture overview
- `data.example.js` — Example data schema for contributors
- GitHub issue and PR templates

### Changed

- Sora entry: updated description to note 5-day countdown to shutdown with export instructions and alternative recommendations
- Sora entry: marked as sunsetting (app closes April 26, 2026; API September 24, 2026)
- Cursor entry: updated to describe the Cursor 3 agent-first interface
- Claude entry: noted the $30B revenue run rate and Mythos gating
- `vercel.json` — Removed SPA rewrite so static HTML routes (tools.html, search.html, etc.) resolve correctly on Vercel

### Fixed

- Vercel deployment: All routes no longer redirect to index.html; static pages now serve correctly

## [1.1.0] - 2026-02-17

### Added

- Niche AI page with 19 categories
- Star ratings with half-stars, keyboard support, ARIA announcements
- My Stack, I Use This, Want to Try
- Multiple profiles with export/import
- Admin: full CRUD for custom tools, export to data.js
- Auth: login, register, reset password; Google OAuth (client ID config in Admin)
- Session expiry notice when &lt; 2 days remaining
- PWA: service worker, manifest, offline fallback, install banner
- Card builder shared module for category and search pages
- Search page with interactive cards (ratings, stack, share)

### Changed

- Design system: Crimson Pro + DM Sans, warm palette, dark mode
- Responsive layout with bottom nav and hamburger menu

## [1.0.0] - Initial

- Tools, Knowledge, Podcasts categories
- Search, dark mode, responsive design
- GitHub Pages and Vercel deployment
