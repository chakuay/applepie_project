# Applepie

Applepie is a responsive AI and programming article discovery SPA. It uses the public DEV Community (Forem) REST API for live articles and provides a local discussion area on each post.

## Run locally

1. Install Node.js 20 or newer.
2. Open this project folder in a terminal.
3. Run `npm install` (in PowerShell on Windows, `npm.cmd install` avoids the PowerShell script policy issue).
4. Run `npm run dev` (or `npm.cmd run dev`) and open the local URL printed by Vite.
5. Run `npm run build` to create a production build.

## Project scope

- Home: search, topic filters, latest/popular sort; aggregates five DEV.to tag feeds, deduplicates them, and displays the 30 newest matching articles.
- Post Detail: dynamic `/posts/:id` route, article metadata and sanitized full article body, save action, and a comment form rendered in Applepie. A link to the original DEV.to article remains for source attribution.
- My Collection: save/unsave articles and persist only article IDs in browser storage.
- Topics: custom topic discovery page for AI, React, JavaScript, Web Development, and Python.
- About: project description, team placeholders, stack, and API attribution.
- Loading, retryable error, and empty states; responsive layout.

## Architecture

- React 19 + Vite + TypeScript
- React Router v7: `createBrowserRouter`, layout `Outlet`, `NavLink`, and dynamic `useParams`
- TanStack Query v5: API requests, caching, and explicit `staleTime`
- Zustand with `persist`: client state stores saved article IDs and locally written comments; API article records stay in TanStack Query
- Tailwind CSS + DaisyUI (alongside the existing Figma-inspired stylesheet)
- DEV Community API: `https://dev.to/api/articles?per_page=30&tag={ai|react|javascript|webdev|python}` and `https://dev.to/api/articles/{id}`

API source and attribution: [Forem API documentation](https://developers.forem.com/api/v0). This project reads public articles and sanitizes their HTML before rendering. Comments are saved to the current browser's local storage, so they are visible only in that browser and are not sent to DEV.to or shared with other users/devices.

## Before submission

Replace the About page placeholders with each member's full name, student ID, university, and actual role. Capture screenshots of each required page in a `screenshots/` folder and follow the instructor's required ZIP naming convention. Do not include `node_modules` in the submitted ZIP.

## Figma reference

https://www.figma.com/design/K9JkLuow1a3Un16HYuLEBd/Untitled?node-id=0-1
