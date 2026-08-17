# Inventory Management System — Frontend (Part 1: Foundation + Auth)

Covers steps 12–13 of the build plan for the parts of the system that exist so far: React + Vite scaffold, Apollo Client integration, and a full UI for every auth flow the backend supports (register, login, logout, forgot/reset password, profile, admin user management), plus the dashboard shell.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your backend isn't at http://localhost:4000/graphql
npm run dev
```

Runs at `http://localhost:5173`. Requires the backend (Part 1) running against a real MongoDB instance — register the first account there and it'll route straight into the dashboard.

## What's built

- **Apollo Client** (`src/apollo/client.js`) — auth header link + an error link that automatically refreshes an expired access token and retries the failed request once, queuing concurrent requests behind a single in-flight refresh call.
- **Auth** (`src/context/AuthContext.jsx`, `src/pages/Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`) — wired to every mutation the backend exposes.
- **Route protection** — `ProtectedRoute` redirects unauthenticated users to `/login`; `RoleRoute` restricts a route subtree to specific roles (Settings is Admin-only).
- **Profile page** — update name/phone and change password, both hitting real mutations.
- **Settings page** — Admin-only team management: list users, change role, activate/deactivate, delete. Fully wired to the backend's `users`/`updateUserStatus`/`deleteUser` operations.
- **Dashboard** — stat cards and two Recharts charts. **This page currently shows sample data** (clearly labeled in the UI) because the `dashboardSummary` query doesn't exist on the backend yet — it'll be wired up when the Dashboard backend module is built.
- **Dark mode**, responsive layout, sidebar/topbar shell with the rest of the nav items visible but marked "Soon" until their modules exist.

## Design notes

This uses a distinct token system rather than default Tailwind styling:
- **Type**: Space Grotesk (display/headings), Inter (body/UI), IBM Plex Mono (all quantities, prices, and SKUs — the "ledger tape" signature, since this is ultimately a system built around receipts and barcodes).
- **Color**: a confident indigo-blue primary (`brand`) rather than a generic default blue, plus dedicated `stock.ok` / `stock.low` / `stock.out` colors used consistently for stock-status signaling across cards and badges.
- Tokens live in `tailwind.config.js` and `src/index.css` — extend them there rather than hard-coding new colors in components.

## What's tested

- `npm install` completes cleanly.
- `npm run build` succeeds (Vite production build, no errors).
- I could not run this against a live backend in this sandbox (no outbound access to a real MongoDB-backed API here), so the actual login/register network flow is unverified end-to-end. Please run `npm run dev` against the Part 1 backend and confirm the register → login → dashboard flow before building further pages on top of this.

## Known gaps / next steps

- `react-router-dom` was bumped to v7 and `recharts` to v3 (their current majors) since v6/v2 are behind; if you're used to v6 route APIs, the `<Routes>/<Route>` usage here is unchanged, so nothing to migrate.
- The bundle is a single ~900KB JS chunk (fine for local dev; consider route-based code-splitting via `React.lazy` once more modules/pages exist).
- No file upload UI yet (arrives with the Product module's image/barcode/QR features).
"# Inventory_Client" 
