# Development guide

This guide covers setting up a working environment, the checks available
before a change is committed, the steps for common kinds of change, and
solutions to the problems most often met during development.

For the system design, read [`ARCHITECTURE.md`](ARCHITECTURE.md). For the
endpoint contract, read [`API.md`](API.md).

## Requirements

- **Python 3** with `pip`. The backend uses FastAPI, Uvicorn, and pandas.
- **Node.js**, current LTS release, with `npm`. The frontend uses Vite 8,
  React 19, and Tailwind CSS v4.
- **The database.** `backend/data/valorant.db` is built locally from the
  Kaggle dataset. The root [`README.md`](../README.md#quickstart) describes
  the build. Without a database the backend cannot serve live data, and the
  frontend falls back to its bundled demo payloads.

## First-time setup

```bash
# Backend
cd backend
pip install fastapi "uvicorn[standard]" pandas

# Frontend
cd frontend/web
npm install
```

## Running locally

Start the backend and the frontend in two terminals.

```bash
# Terminal 1: API on http://127.0.0.1:8000 (interactive docs at /docs)
cd backend
python -m uvicorn app.main:app --reload

# Terminal 2: interface on http://localhost:5173
cd frontend/web
npm run dev
```

Run the backend from the `backend/` directory. The import path
`app.main` is relative to it, so starting Uvicorn from the repository root
fails.

To point the interface at another API address:

```bash
VITE_API_BASE=http://127.0.0.1:9000 npm run dev
```

To use a database outside the default location:

```bash
VALORANT_DB_PATH=/path/to/valorant.db python -m uvicorn app.main:app --reload
```

## Checks before committing

There is no automated test suite in the repository yet (see
[Testing](#testing)). These checks are the minimum before a commit.

| Check | Command | Expected result |
|---|---|---|
| Lint | `npm run lint` in `frontend/web` | No errors. Twelve `react(set-state-in-effect)` warnings are known; see [Known warnings](#known-warnings) |
| Production build | `npm run build` in `frontend/web` | `built in` with no errors |
| Endpoints respond | `curl http://127.0.0.1:8000/health` | `database_reachable: true` |
| Pages render | Open each page in a browser | No console errors, headings present |

Build and dev runs both execute `scripts/sync-team-logos.mjs` first. It copies
team logos into `public/` the first time, and does nothing afterwards.

## Testing

**Frontend unit tests:** `npm test` in `frontend/web` runs Vitest against
`src/**/*.test.jsx`. These are for component logic in isolation (for example
`components/ErrorBoundary.test.jsx`), not for anything that needs a browser
or the backend.

**Frontend smoke tests:** `npm run test:e2e` in `frontend/web` runs the
Playwright suite in `tests/smoke.spec.js` against the dev server, at a
desktop and a phone-sized viewport. It opens each top-level page and checks
for console errors, horizontal overflow, and buttons under 36px, then checks
that navigating away from a match verdict page mid-load (which aborts its
in-flight requests, see `lib/api.js`) does not throw. The first run needs
`npx playwright install chromium` once. These run against the demo data
fallback, so the backend does not need to be running.

Pages reached through a list, such as Team Profile and Match Verdict, need
their own steps when extending this suite: open a team or match from its
list, then check the same things.

**Backend tests:** `pytest` in `backend` (after `pip install -r
requirements.txt`, which includes `pytest` and `httpx`) runs
`backend/tests/`. Pure
functions (`_parse_k`, `_impact_label`) are tested directly; anything that
reads `match_verdict.build_verdict` or hits a FastAPI route uses the real
`backend/data/valorant.db`, consistent with this project's rule against
fabricating data for a test. Those tests skip (not fail) when that database
is not present locally, since it is gitignored and must be rebuilt per the
root README.

## Adding a page

1. Create `frontend/web/src/pages/<Name>.jsx`. Use the header block and
   section conventions in [`frontend/web/README.md`](../frontend/web/README.md#interface-conventions).
2. Add the view to `App.jsx`. Render the component in the `main` block, and
   pass `onOpenTeam`, `onOpenMatch`, or `onNavigate` if the page needs them.
3. Add a navigation entry in `components/Sidebar.jsx`.
4. Add the page to the command palette list in `components/CommandPalette.jsx`
   if it should be reachable from search.
5. Add any new data calls to `lib/api.js`. Do not call `fetch` from a page.
6. Verify with the checks above, then update the README, the frontend README,
   and `CHANGELOG.md`.

## Adding an endpoint

1. Put the logic in an analyzer module under `backend/app/analyzers/`, or in
   an existing one. The module takes a `sqlite3.Connection` and returns plain
   dictionaries.
2. Add the route in `backend/app/main.py`. Declare parameters with `Query`,
   so FastAPI validates types and ranges. Open the connection, call the
   analyzer, and close the connection in a `finally` block.
3. Map analyzer errors to HTTP responses: 404 for an unknown identifier, 400
   for an invalid argument the handler checks.
4. Decide whether the handler needs `functools.lru_cache`. Use it for work
   that reads many rows. Record the decision in a comment, as the existing
   handlers do.
5. Add a function to `frontend/web/src/lib/api.js`, with a timeout that suits
   the endpoint's cost.
6. Document the endpoint in [`API.md`](API.md), and add it to the table in
   `backend/README.md`.

## Adding an analyzer to the verdict

Add the module to the imports in `backend/app/analyzers/match_verdict.py`,
then add it to `ANALYZERS`. Each analyzer returns an `impact` between 0 and 1,
its `category`, a `summary`, and its `evidence`. The verdict sorts the results
and labels them using `IMPACT_HIGH` and `IMPACT_MODERATE`. Analyzers without
usable data should raise `ValueError` with a reason, as the existing analyzers
do. The handlers list each such reason under `skipped_analyzers`.

## Adding images

Follow the naming rules in the root README's Assets section. Agent and map
art names must match the database exactly, in lowercase. Agent art is
displayed uncropped on showcase pages, so use the full illustration. Profile
icons are square crops.

## Conventions

- **Imports.** Use the existing component and library paths. Shared UI comes
  from `components/ui.jsx`.
- **Motion.** Use the `rise-in`, `grow-x`, and `lift` classes. For numbers,
  use `useCountUp`. Do not write animation loops by hand.
- **Requests.** Cancel stale requests in the effect cleanup with a
  `cancelled` flag. Debounce search input by about 250 milliseconds.
- **Input that changes continuously.** Pointer effects write to the DOM
  directly, not to React state.
- **Visible text.** Use plain hyphens and colons, not en or em dashes.
- **Comments.** Explain why a decision was made. Do not restate what the code
  does.
- **Commits.** Use an imperative subject line, for example "Add map lineups to
  the verdict page". Explain the reason in the body when it is not obvious.
  Keep unrelated changes in separate commits. Update `CHANGELOG.md` in the
  same commit as the change it records.
- **Local tooling.** Do not commit the database, the raw dataset, or local
  tool folders such as `.claude/`. The gitignore covers the first two.

## Known warnings

`npm run lint` reports twelve `react(set-state-in-effect)` warnings. Each one
is a `setState` call made synchronously in an effect, most often to reset
state when a selection changes. The code behaves correctly, and the warning
is a style concern. The usual fix is to derive the value during render, or to
reset state with a `key` on the component. Treat any new occurrence as a
prompt to choose one of those approaches.

## Troubleshooting

**The interface shows demo data, not live data.** The backend is not
reachable. Start it, then reload. Check
`http://127.0.0.1:8000/health`. Most pages fall back silently. The Matches
page is the exception, and its status line says when the backend is not
reachable.

**The backend reports that the database is not found.** Build the database
with the loader, or set `VALORANT_DB_PATH` to its location. The root README
describes the loader.

**Numbers look out of date after rebuilding the database.** Responses are
cached in the server process. Restart Uvicorn.

**The dev server stopped.** If `npm run dev` has exited, start it again.

**`Address already in use`.** Another process holds port 8000 or 5173. Stop
it, or pick another port (`--port` for Uvicorn, `npm run dev -- --port`
for Vite).

**The browser blocks requests to the API.** CORS is open in development. If
you have changed `allow_origins`, add the frontend's origin to it.

**A team badge shows initials instead of a logo.** The logo file is missing,
or its name does not match the slug the app derives from the team name. Some
teams use a shorter file name, such as `gambit.png` for "Gambit Esports".
The app has no alias table, so rename the file to match the slug, for example
`gambit-esports.png`.

**A player's icon is a silhouette.** The player's best agent has no profile
image, or the image failed to load. Check the file under
`public/assets/agents/profiles/`.

**The Legacy Roster Builder reports that a player was not found.** The name
must match a player in the loaded data exactly. Use the dropdown to pick the
player rather than typing the name.
