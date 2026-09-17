// Every call here follows the same shape as the original single-file
// prototype: try the live FastAPI backend with a timeout, and if it's not
// reachable, fall back to a small set of real (not fabricated) demo
// payloads captured from an actual loaded season — see src/lib/demo/*.json.
// Nothing here invents a statistic; a failed live fetch either returns real
// bundled demo data or an explicit "not available" state, never a guess.
//
// Timeouts are deliberately generous (4-6s), not the 1.5-2s this started
// with. The Home page fires several of these concurrently on load (a match
// list, an overview, and up to 5 match verdicts), and each verdict runs 6
// analyzers' worth of CPU-bound Python over the full loaded dataset — with
// the combined 2021-2026 database (~813k player_game_stats rows vs ~30k for
// a single season), concurrent verdict computations contend for the GIL and
// individually measured ~1.4-1.6s, with /stats/overview over 2s, under that
// same concurrent load. A too-tight timeout here doesn't fail loudly, it
// silently swaps in stale single-season demo data while the real (correct,
// multi-year) answer was still on its way — worse than just being slow.

import demoMatches from './demo/matches.json'
import demoTeamProfiles from './demo/teamProfiles.json'
import demoOverview from './demo/overview.json'
import demoTimelines from './demo/timelines.json'
import demoMeta from './demo/meta.json'

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

async function getJSON(path, { timeout = 2000 } = {}) {
  const res = await fetch(`${API_BASE}${path}`, { signal: AbortSignal.timeout(timeout) })
  if (!res.ok) throw new Error(`${path} -> ${res.status}`)
  return res.json()
}

export async function listMatches({ team, tournament, year, limit = 30 } = {}) {
  try {
    const params = new URLSearchParams({ limit: String(limit) })
    if (team) params.set('team', team)
    if (tournament) params.set('tournament', tournament)
    if (year) params.set('year', String(year))
    const json = await getJSON(`/matches?${params}`, { timeout: 4000 })
    return { matches: json.matches, total: json.total, live: true }
  } catch {
    let matches = Object.values(demoMatches)
    if (team) {
      const q = team.toLowerCase()
      matches = matches.filter((m) => m.team_a.toLowerCase().includes(q) || m.team_b.toLowerCase().includes(q))
    }
    // Demo payloads don't carry a structured year field, only a tournament
    // string like "VCT 2025: ..." — best-effort substring match rather than
    // silently ignoring the filter in offline mode.
    if (year) {
      matches = matches.filter((m) => (m.tournament || '').includes(String(year)))
    }
    return { matches, total: matches.length, live: false }
  }
}

export async function getMatchVerdict(id) {
  try {
    return { verdict: await getJSON(`/matches/${id}/verdict`, { timeout: 6000 }), live: true }
  } catch {
    const demo = demoMatches[id]
    return { verdict: demo || null, live: false }
  }
}

export async function getTimeline(id) {
  try {
    return await getJSON(`/matches/${id}/timeline`, { timeout: 5000 })
  } catch {
    return demoTimelines[id] || { round_timeline: [], economy_timeline: [] }
  }
}

export async function listTeams({ q } = {}) {
  try {
    const params = q ? `?${new URLSearchParams({ q })}` : ''
    const json = await getJSON(`/teams${params}`, { timeout: 4000 })
    return { teams: json.teams, live: true }
  } catch {
    let teams = Object.entries(demoTeamProfiles).map(([team_id, p]) => ({
      team_id, name: p.name, matches: p.record?.matches, wins: p.record?.wins, win_rate: p.win_rate, ranked: true,
    }))
    if (q) {
      const needle = q.toLowerCase()
      teams = teams.filter((t) => t.name.toLowerCase().includes(needle))
    }
    teams.sort((a, b) => (b.win_rate ?? 0) - (a.win_rate ?? 0))
    return { teams, live: false }
  }
}

export async function getTeamProfile(teamId) {
  try {
    return { profile: await getJSON(`/teams/${teamId}/profile`, { timeout: 5000 }), live: true }
  } catch {
    return { profile: demoTeamProfiles[teamId] || null, live: false }
  }
}

export async function getOverview() {
  try {
    return await getJSON('/stats/overview', { timeout: 5000 })
  } catch {
    return demoOverview
  }
}

export async function getMeta({ year, map } = {}) {
  try {
    const params = new URLSearchParams()
    if (year) params.set('year', String(year))
    if (map) params.set('map', map)
    const qs = params.toString() ? `?${params}` : ''
    return await getJSON(`/stats/meta${qs}`, { timeout: 4000 })
  } catch {
    return demoMeta
  }
}

export async function getPlayersLeaderboard({ metric = 'acs', limit = 20, minMaps = 10 } = {}) {
  try {
    const params = new URLSearchParams({ metric, limit: String(limit), min_maps: String(minMaps) })
    const json = await getJSON(`/players/leaderboard?${params}`, { timeout: 4000 })
    return { players: json.players, live: true }
  } catch {
    // Bundled demo data only has ACS/rating for a handful of players — no
    // per-metric breakdown to fall back to honestly, so every metric shows
    // the same small real list rather than fabricating KAST/ADR/HS numbers
    // that were never actually loaded.
    const players = (demoOverview.top_players || []).map((p) => ({
      name: p.name, team: p.team, value: metric === 'rating' ? p.rating : p.acs, rating: p.rating, maps: p.maps,
    }))
    return { players, live: false }
  }
}

export async function searchPlayers(query) {
  try {
    const json = await getJSON(`/players/search?q=${encodeURIComponent(query)}`, { timeout: 3000 })
    return json.players
  } catch {
    // offline fallback — search across names we already have bundled locally
    const pool = new Map()
    ;(demoOverview.top_players || []).forEach((p) => pool.set(p.name, p.team))
    Object.values(demoTeamProfiles).forEach((tp) => (tp.top_players || []).forEach((p) => {
      if (!pool.has(p.name)) pool.set(p.name, tp.name)
    }))
    const q = query.toLowerCase()
    return [...pool.entries()]
      .filter(([name]) => name.toLowerCase().includes(q))
      .slice(0, 8)
      .map(([name, team]) => ({ name, team }))
  }
}

export async function simulateRoster(namesA, namesB) {
  const params = new URLSearchParams({ team_a: namesA.join(','), team_b: namesB.join(',') })
  const res = await fetch(`${API_BASE}/roster-builder/simulate?${params}`, { signal: AbortSignal.timeout(6000) })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'request failed' }))
    throw new Error(err.detail || 'request failed')
  }
  return res.json()
}
