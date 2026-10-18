# Applepie continuation prompt

Continue the student Mini Project 2 named **Applepie**, a small AI and code community/discovery SPA. Work from this project folder and preserve the current warm, Figma-inspired visual direction. The UI source design is at https://www.figma.com/design/K9JkLuow1a3Un16HYuLEBd/Untitled?node-id=0-1.

## Current implementation

- React 19 + Vite + TypeScript.
- React Router v7 with `createBrowserRouter`, shared `<Outlet/>` layout, `NavLink`, and dynamic `/posts/:id` route.
- TanStack Query v5 owns API/server data and cache with `staleTime`.
- Zustand persist owns client state: saved DEV article IDs and comments written locally by the user. It must not store duplicate article records.
- Tailwind CSS + DaisyUI are configured; existing Figma-oriented CSS and exported SVG assets remain.
- Five views: Home, Post Detail, My Collection, About, Topics (custom extended page).
- Public DEV Community/Forem REST API provides articles, currently aggregating tag-filtered `ai`, `react`, `javascript`, `webdev`, and `python` feeds via `/api/articles?tag=...` (up to 150 raw results, deduplicated); Topics fetches the selected tag directly.
- Post Detail renders the API's article body after sanitizing its HTML with DOMPurify. Comments can be written and read in Applepie and persist in this browser's local storage. They are local to this browser and are not shared with other users/devices. The external link is retained only to view the original source article.
- Loading, retryable error, and empty states are included. `vercel.json` rewrites SPA paths to `index.html`.
- Build command: `npm.cmd run build` on Windows PowerShell; regular `npm run build` elsewhere.

## Important remaining work

1. Replace About page placeholders with the real team members' full names, student IDs, university, and agreed project roles.
2. Review the fetched DEV.to articles for relevance; refine the feed or add pagination if needed.
3. Capture screenshots of each required working page in a `screenshots/` folder before submission.
4. Check deployment configuration on the team's Vercel account if deployment is required.
5. Create the final assignment ZIP using the instructor's naming format and exclude `node_modules`.

## Constraints from assignment

- Team size 2–3 students.
- At least 20 records; include Home, dynamic Detail, persistent Collection, About with source attribution, and one extended page.
- Use React 19, Vite, TypeScript, React Router v7, Zustand persist, TanStack Query v5, a UI stack such as Tailwind/DaisyUI.
- Separate Client State (saved IDs in Zustand) from Server State (API data/cache in TanStack Query); no duplicated API records in Zustand.
- Include loading/error retry handling, responsive UI, typed records, and no `any`.
- Instructor requires source plus page screenshots in the final ZIP, without `node_modules`.

Keep changes small enough for a class project, explain them in Thai to the user, and update this handoff note if architecture changes. Do not claim comments are persisted on a backend: article data comes from the public API, while saved IDs and comments are persisted in the current browser only.
