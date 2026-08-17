# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- August 17, 2026 content refresh:
  - Bleeding edge: Claude Opus 5 (July 24 flagship — 1M context, 128K output, five-level effort setting), Gemini 3.7 Flash (August 13 coding/agent workhorse at half its predecessor's price)
- August 6, 2026 content refresh:
  - Bleeding edge: Inkling (Thinking Machines Lab's debut 975B/41B-active Apache 2.0 multimodal MoE, July 15, with Inkling-Small)
- August 4, 2026 content refresh:
  - Bleeding edge: FLUX 3 (Black Forest Labs multimodal image/video/audio/action, July 23), Laguna S 2.1 (poolside open-weight coding model, July 21), Ling-3.0-flash (Ant Group 124B/5.1B-active efficiency MoE, July 27)
- July 18, 2026 content refresh:
  - Bleeding edge: Kimi K3 (Moonshot AI open 2.8T-param MoE, July 16)
  - Tools: Gemini Enterprise (Google Cloud agent platform)
- July 8, 2026 content refresh:
  - Bleeding edge: Claude Sonnet 5 (most agentic Sonnet, near-Opus 4.8, default on free/Pro), Gemini 3.5 Flash (I/O 2026 GA), Grok 4.5 (xAI V9, 1.5T params, private beta), ZCode/GLM-5.2 (Z.ai open-weight agentic coding)
- May 2, 2026 content refresh:
  - Knowledge: Google I/O 2026 AI Recap, Post-Sora Video AI Landscape 2026, Anthropic Model Spec 2.0, A2A Protocol Adoption Tracker, OpenAI Codex Agent Changelog
  - Bleeding edge: Gemini 3.2 Ultra (2M token context, Planner mode), Project Astra GA (real-time universal assistant)

### Changed

- Claude entry: updated to Claude Opus 5 as flagship (July 24, 2026), Sonnet 5 still default on free/Pro; lastVerified bumped to August 17, 2026
- Gemini entry: refreshed to Gemini 3.7 Flash (August 13, 2026); noted Gemini 3.5 Pro still delayed
- Qwen entry: noted the open-weight Qwen3.8-27B shipping August 14, 2026 (previously listed as promised)
- ZCode entry: noted GLM-5.3 following on August 14, 2026
- Qwen entries: updated to Qwen3.8-Max (August 3, 2026) — 2.4T params / 95B active, 1M context, 128k output, open weights promised for Max and Qwen3.8-27B; lastVerified bumped to August 6, 2026
- Gemini entry: refreshed to Gemini 3.6 Flash (July 21, 2026, shipped alongside 3.5 Flash Lite); lastVerified bumped to August 4, 2026
- Flux entry: noted succession by the multimodal FLUX 3, with open-weight FLUX 3 Dev planned for later in 2026
- DeepSeek V4 entry: noted the faster V4-Flash-0731 variant (July 31, 2026)
- ChatGPT / OpenAI entries: updated to the GPT-5.6 family (Sol, Terra, Luna) — default in ChatGPT since July 9, 2026; lastVerified bumped to July 18, 2026
- Content Update Agent (`daily-update-agent.js`): `add` command now strips an existing trailing comma before inserting, preventing a double comma that created a sparse/undefined hole in the array
- Claude entry: updated to reflect Claude Opus 4.8 and the new Sonnet 5 (June 2026), plus gated Fable 5 tier; lastVerified bumped to July 8, 2026
- Gemini entry: updated to the Gemini 3.5 series (Flash GA at I/O 2026, Pro rolling out); lastVerified bumped to July 8, 2026
- Sora entry: updated to reflect completed app shutdown (April 26, 2026); freq changed to "Discontinued"; URL redirected to migration help page

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
