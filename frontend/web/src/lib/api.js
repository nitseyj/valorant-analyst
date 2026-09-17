// Every call here follows the same shape as the original single-file
// prototype: try the live FastAPI backend with a short timeout, and if it's
// not reachable, fall back to a small set of real (not fabricated) demo
// payloads captured from an actual loaded season — see src/lib/demo/*.json.
// Nothing here invents a statistic; a failed live fetch either returns real
// bundled demo data or an explicit "not available" state, never a guess.

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

export async function listMatches({ team, limit = 30 } = {}) {
  try {
    const params = new URLSearchParams({ limit: String(limit) })
    if (team) params.set('team', team)
    const json = await getJSON(`/matches?${params}`, { timeout: 1500 })
    return { matches: json.matches, live: true }
  } catch {
    let matches = Object.values(demoMatches)
    if (team) {
      const q = team.toLowerCase()
      matches = matches.filter((m) => m.team_a.toLowerCase().includes(q) || m.team_b.toLowerCase().includes(q))
    }
    return { matches, live: false }
  }
}

export async function getMatchVerdict(id) {
  try {
    return { verdict: await getJSON(`/matches/${id}/verdict`, { timeout: 2500 }), live: true }
  } catch {
    const demo = demoMatches[id]
    return { verdict: demo || null, live: false }
  }
}

export async function getTimeline(id) {
  try {
    return await getJSON(`/matches/${id}/timeline`, { timeout: 2500 })
  } catch {
    return demoTimelines[id] || { round_timeline: [], economy_timeline: [] }
  }
}

export async function listTeams() {
  try {
    const json = await getJSON('/teams', { timeout: 1500 })
    return { teams: json.teams, live: true }
  } catch {
    const teams = Object.entries(demoTeamProfiles).map(([team_id, p]) => ({ team_id, name: p.name }))
    return { teams, live: false }
  }
}

export async function getTeamProfile(teamId) {
  try {
    return { profile: await getJSON(`/teams/${teamId}/profile`, { timeout: 2500 }), live: true }
  } catch {
    return { profile: demoTeamProfiles[teamId] || null, live: false }
  }
}

export async function getOverview() {
  try {
    return await getJSON('/stats/overview', { timeout: 2000 })
  } catch {
    return demoOverview
  }
}

export async function getMeta() {
  try {
    return await getJSON('/stats/meta', { timeout: 2000 })
  } catch {
    return demoMeta
  }
}

export async function searchPlayers(query) {
  try {
    const json = await getJSON(`/players/search?q=${encodeURIComponent(query)}`, { timeout: 1500 })
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
  const res = await fetch(`${API_BASE}/roster-builder/simulate?${params}`, { signal: AbortSignal.timeout(4000) })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'request failed' }))
    throw new Error(err.detail || 'request failed')
  }
  return res.json()
}
