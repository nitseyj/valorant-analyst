# Frontend (legacy prototype)

A dependency-free, single-file HTML/CSS/JS build of the UI — no build step,
no `npm install`, just open `index.html` directly in a browser. Kept
alongside the real [`frontend/web/`](../web) app as a zero-install fallback
and reference.

## Usage

Open `index.html` in a browser. It connects to the FastAPI backend
automatically if it's running at `http://127.0.0.1:8000`, and falls back to
embedded demo data otherwise.

## Notes

- All icons, backgrounds, and decorative graphics are hand-written inline
  SVG/CSS — no external image files, no icon font. The only real image
  assets loaded are team logos (`assets/valorant/teams/<slug>.<ext>`), which
  fall back to a generated initials badge if missing.
- Player portraits are an original geometric silhouette, not a photo — see
  the root `README.md` for why (Riot IP / no sourced likenesses).
- `frontend/web/` is where active development happens now; this file is
  kept in sync only loosely and may lag behind new features.
