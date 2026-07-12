# EcoSphere — ESG Management Platform (Frontend)

A modern, fully responsive ESG (Environmental, Social, Governance) management dashboard built with React + Vite, using only mock JSON data — no backend required.

## Tech Stack
- React 19 + Vite
- React Router DOM (client-side routing)
- Plain CSS with a design-token system (no Tailwind/MUI)
- react-icons (Lucide set)
- Chart.js + react-chartjs-2

## Getting Started
```bash
npm install
npm run dev
```
Then open the printed local URL (default http://localhost:5173). The app opens on `/login` — enter any email & password (mock auth, no backend) to reach the dashboard.

## Build
```bash
npm run build
npm run preview
```

## Folder Structure
```
src/
  components/     Navbar, Sidebar, Layout, Card, Button, Table, Charts, Footer, ScoreGauge
  pages/
    Login/
    Dashboard/
    Environmental/
    Social/
    Governance/
    Reports/
    Leaderboard/
    Settings/
  data/           Mock JSON-like data modules (carbonData, csrData, esgData, governanceData, employees)
  App.jsx         Route definitions
  main.jsx        App entry point
  index.css       Design tokens (colors, type, spacing) + layout helpers
```

## Connecting a Real Backend Later
All data currently lives in `src/data/*.js` as plain exported arrays/objects shaped like typical API responses. To integrate a backend:
1. Replace the static imports (e.g. `import { esgOverview } from "../../data/esgData"`) with a fetch/axios call in a `useEffect`, keeping the same shape.
2. The Login page's `handleSubmit` in `src/pages/Login/Login.jsx` currently just navigates to `/dashboard` — swap in your real auth call there.
3. Table/Chart/Card components are already prop-driven and backend-agnostic.

## Theme
- Primary Green: `#16a34a`
- Secondary Green: `#22c55e`
- Background: `#f5f7fa`
- Cards: White, 12px radius
- Fonts: Sora (display), Inter (body), IBM Plex Mono (data/metrics)
