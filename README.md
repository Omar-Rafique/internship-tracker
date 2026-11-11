# Internship Tracker 🎯

![CI](https://github.com/Omar-Rafique/internship-tracker/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)

A **Next.js** app for tracking internship and job applications from *wishlist* to *offer*.
Made for students organising an internship search.

**Live demo:** https://omar-rafique.github.io/internship-tracker/

## Features

- **Kanban board** with Wishlist → Applied → Interview → Offer / Rejected columns
- Add applications with company, role, location, deadline, job link and notes
- **Form validation** (required fields, real calendar dates, http(s) links only)
- **Deadline alerts** for wishlist roles closing within the next 7 days
- **Search** across company, role, location and notes
- **Stats page**: applications sent, response rate, interview rate, pipeline chart
- Data persisted in `localStorage`, loaded after mount to avoid hydration mismatches
- Accessible: labelled controls, `aria-current` navigation, visible focus styles

## Tech stack

| Area     | Choice |
| -------- | ------ |
| Framework | Next.js 15 (App Router, static export) |
| UI       | React 19, TypeScript (strict), plain CSS |
| Testing  | Vitest unit tests for all business logic |
| CI / CD  | GitHub Actions: test → build → type-check → deploy to GitHub Pages |

## Getting started

```bash
git clone https://github.com/Omar-Rafique/internship-tracker.git
cd internship-tracker
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests
npm run build      # static site in out/
```

## Project structure

```text
src/
  app/
    layout.tsx          # root layout + navigation (server component)
    page.tsx            # board page
    stats/page.tsx      # stats page
    globals.css
  components/
    Board.tsx           # kanban board, search, deadline banner (client)
    ApplicationForm.tsx # controlled form with validation
    StatsView.tsx       # stat tiles + pipeline chart
    Nav.tsx             # active-link navigation
  lib/
    applications.ts       # pure logic: validation, grouping, search, stats
    applications.test.ts  # unit tests
    useApplications.ts    # React hook: state + localStorage persistence
```

### Design decisions

- **Logic separate from UI.** Everything in `lib/applications.ts` is a pure function,
  so it can be unit tested without a browser and reused if a backend is added later.
- **Server components by default.** Pages and the layout are server components; only
  the interactive parts (`"use client"`) ship JavaScript.
- **Static export.** `output: "export"` produces plain HTML/JS that can be hosted on
  GitHub Pages for free. The base path is set at build time with `NEXT_PUBLIC_BASE_PATH`.

## Roadmap

- [ ] Drag and drop between columns
- [ ] Edit an existing application
- [ ] Export / import as CSV
- [ ] Backend with authentication (Next.js route handlers + database)

## License

MIT
