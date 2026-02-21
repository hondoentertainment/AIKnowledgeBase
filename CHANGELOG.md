# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `docs/AGENTS.md` — Shareable agent pipeline documentation
- `docs/skills/README.md` — Agent skills reference
- `CONTRIBUTING.md` — Contribution guidelines
- `ARCHITECTURE.md` — Architecture overview
- `data.example.js` — Example data schema for contributors
- GitHub issue and PR templates

### Changed

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
