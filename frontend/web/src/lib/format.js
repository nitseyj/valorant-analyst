export function formatEvidenceValue(metric, val) {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'string') return val
  if (/Rate|%/.test(metric) && Math.abs(val) <= 1) return `${(val * 100).toFixed(0)}%`
  if (Number.isInteger(val)) return val
  return val.toFixed(2)
}

// player_impact.py's summary always starts "NAME (TEAM) was the top performer..."
export function extractMvp(summary) {
  if (!summary) return null
  const m = summary.match(/^([^(]+?)\s*\(([^)]+)\)\s+was the top performer/)
  if (!m) return null
  return { name: m[1].trim(), team: m[2].trim() }
}

export function impactColor(winnerName, teamA) {
  if (!winnerName) return 'var(--color-ink-faint)'
  return winnerName === teamA ? 'var(--color-brand)' : 'var(--color-team-b)'
}

export function slugifyTeam(name) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'unknown'
  )
}

export function teamInitials(name) {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) return words.map((w) => w[0]).join('').slice(0, 3).toUpperCase()
  return words[0].replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase()
}

export function matchScoreStr(m) {
  return m.score || `${m.team_a_score}-${m.team_b_score}`
}
