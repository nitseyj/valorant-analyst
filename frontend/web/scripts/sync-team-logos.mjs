// Copies team logo images from the original prototype's assets folder into
// this app's public/ dir so Vite can serve them. Not committed twice (see
// .gitignore) — the prototype's copy is the single tracked source. Safe to
// run repeatedly; only copies files that don't already exist locally.
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, '..', '..', 'prototype', 'assets', 'valorant', 'teams')
const dest = join(here, '..', 'public', 'assets', 'valorant', 'teams')

if (!existsSync(src)) {
  console.warn(`[sync-team-logos] source not found at ${src} — skipping (team badges will fall back to initials)`)
  process.exit(0)
}

mkdirSync(dest, { recursive: true })
const already = existsSync(dest) ? readdirSync(dest).length : 0
if (already > 0) {
  console.log(`[sync-team-logos] ${already} logo file(s) already present, skipping copy`)
  process.exit(0)
}

cpSync(src, dest, { recursive: true })
console.log(`[sync-team-logos] copied team logos from ${src} -> ${dest}`)
