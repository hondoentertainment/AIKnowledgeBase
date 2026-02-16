# AI Knowledge Hub

A personal knowledge website for your AI tools, knowledge articles, and podcasts.

## Quick start

Open `index.html` in a browser to view the site. No build step required.

## Adding content

Edit `data.js` to add your items:

- **tools** — AI tools (apps, APIs, services)
- **knowledge** — Articles, guides, reference materials
- **podcasts** — AI-focused podcasts

Each item needs:

- `title` — Name
- `description` — Short summary
- `url` — Link (use `#` if none)
- `tags` — Array of tags (optional) for search and filtering

## Features

- **Search** — Instant filter across tools, knowledge, and podcasts
- **Dark mode** — Toggle in the top-right; preference is saved
- **Responsive** — Works on desktop and mobile

## GitHub Pages deployment

The repo includes a GitHub Actions workflow that deploys on every push to `main`.

**Setup:**

1. Create a new repo on GitHub (e.g. `ai-knowledge-hub`).
2. Push this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. Go to **Settings → Pages** in the repo.
4. Under "Build and deployment", set **Source** to **GitHub Actions**.
5. After the workflow runs, your site will be at `https://YOUR_USERNAME.github.io/YOUR_REPO/`.

## Other hosting

- **Vercel / Netlify** — Drag-and-drop the folder or connect a repo
- **Any static host** — Upload the files
