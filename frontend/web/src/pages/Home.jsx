import { useEffect, useState } from 'react'
import { getOverview, listMatches, getMatchVerdict } from '../lib/api'
import { extractMvp, impactColor, matchScoreStr } from '../lib/format'
import { PlayersIcon, TeamsIcon, MatchesIcon, FlameIcon, VersusIcon } from '../components/icons'
import { Panel, SectionHeader, StatCard, EmptyState } from '../components/ui'
import TeamBadge from '../components/TeamBadge'
import PlayerPortrait from '../components/PlayerPortrait'
import MapImage from '../components/MapImage'

export default function Home({ onOpenMatch, onOpenTeam }) {
  const [stats, setStats] = useState(null)
  const [highlights, setHighlights] = useState(null)

  useEffect(() => {
    let cancelled = false
    getOverview().then((data) => {
      if (!cancelled) setStats(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { matches } = await listMatches({ limit: 30 })
      const pool = matches.slice(0, 5)
      const verdicts = (
        await Promise.all(
          pool.map(async (m) => {
            const { verdict } = await getMatchVerdict(m.match_id)
            return verdict
          })
        )
      ).filter(Boolean)
      if (!cancelled) setHighlights(verdicts)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const spotlight = highlights && highlights.length
    ? highlights.slice().sort((a, b) => b.ranked_factors[0].impact - a.ranked_factors[0].impact)[0]
    : null

  const notable = (highlights || [])
    .map((m) => {
      if (m.primary_factor.category !== 'Player Impact') return null
      const mvp = extractMvp(m.primary_factor.summary)
      if (!mvp) return null
      const roster = m.roster ? [...(m.roster.team_a || []), ...(m.roster.team_b || [])] : []
      const found = roster.find((p) => p.name === mvp.name)
      const color = mvp.team === m.team_a ? 'var(--color-brand)' : 'var(--color-team-b)'
      return {
        name: mvp.name,
        rating: found ? found.rating : null,
        agent: found ? found.best_agent : null,
        color,
        matchId: m.match_id,
        team: mvp.team,
      }
    })
    .filter(Boolean)

  return (
    <div className="fade-up">
      <div className="relative overflow-hidden cut-corner border border-line bg-panel px-7 py-8 mb-6">
        <svg
          className="absolute -right-16 -top-20 opacity-[0.08] pointer-events-none"
          width="480"
          height="480"
          viewBox="0 0 480 480"
        >
          <circle cx="240" cy="240" r="220" stroke="var(--color-brand)" strokeWidth="1" fill="none" />
          <circle cx="240" cy="240" r="150" stroke="var(--color-brand)" strokeWidth="1" fill="none" />
          <circle cx="240" cy="240" r="80" stroke="var(--color-brand)" strokeWidth="1" fill="none" />
          <line x1="240" y1="0" x2="240" y2="480" stroke="var(--color-brand)" strokeWidth="1" />
          <line x1="0" y1="240" x2="480" y2="240" stroke="var(--color-brand)" strokeWidth="1" />
        </svg>
        <div className="relative font-mono text-[11px] tracking-[0.2em] text-brand mb-3">VCT 2021–2026 · ALL SEASONS LOADED</div>
        <h1 className="relative font-display text-3xl md:text-4xl font-bold leading-tight mb-2 max-w-xl">
          Every verdict, <span className="text-brand">backed by evidence.</span>
        </h1>
        <p className="relative text-ink-dim text-sm max-w-lg">
          Real pro-scene data, transparent statistical analysis — no black-box ML, no fabricated
          predictions. Every ranked factor links back to the round-by-round evidence that produced it.
        </p>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<PlayersIcon size={18} />} label="PLAYERS" value={stats.counts.players.toLocaleString()} />
          <StatCard icon={<TeamsIcon size={18} />} label="TEAMS" value={stats.counts.teams.toLocaleString()} />
          <StatCard icon={<MatchesIcon size={18} />} label="MATCHES" value={stats.counts.matches.toLocaleString()} />
          <StatCard icon={<FlameIcon size={18} />} label="EVENTS" value={stats.counts.events.toLocaleString()} />
        </div>
      ) : null}

      {stats && stats.season_journey?.length ? (
        <Panel className="p-6 mb-6">
          <SectionHeader>VCT journey — 2025</SectionHeader>
          <p className="text-xs text-ink-faint -mt-1 mb-5">Real match counts per phase, in season order.</p>
          <div className="relative">
            <div className="absolute left-0 right-0 top-[7px] h-px bg-line" />
            <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar">
              {stats.season_journey.map((p) => (
                <div key={p.phase} className="flex flex-col items-center gap-2.5 shrink-0 min-w-[92px]">
                  <span className="w-3.5 h-3.5 rotate-45 bg-brand shrink-0" style={{ boxShadow: '0 0 8px var(--color-brand-line)' }} />
                  <div className="text-center">
                    <div className="text-[13px] font-semibold">{p.phase}</div>
                    <div className="text-[11px] text-ink-faint">{p.matches} matches</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      ) : null}

      {spotlight && (
        <Panel
          accent="var(--color-brand)"
          className="p-6 mb-6 cursor-pointer hover:border-brand/60 transition-colors"
          onClick={() => onOpenMatch(spotlight.match_id)}
        >
          <div className="font-mono text-[11px] text-ink-faint mb-2.5 flex items-center gap-1.5">
            <FlameIcon size={11} style={{ color: 'var(--color-brand)' }} />
            SPOTLIGHT MATCH
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="font-display text-lg font-bold flex items-center gap-1">
              {spotlight.team_a} <VersusIcon className="text-ink-faint" /> {spotlight.team_b}
            </div>
            <div className="font-mono text-xl font-semibold">{matchScoreStr(spotlight)}</div>
          </div>
          <p className="text-[13px] text-ink-dim mt-2.5 max-w-2xl leading-relaxed">{spotlight.primary_factor.summary}</p>
          <div
            className="mt-2.5 text-[11px] font-mono"
            style={{ color: impactColor(spotlight.primary_factor.winner || spotlight.winner, spotlight.team_a) }}
          >
            {spotlight.primary_factor.category} — {spotlight.primary_factor.impact_label.toLowerCase()}
          </div>
        </Panel>
      )}

      {notable.length > 0 && (
        <div className="mb-6">
          <div className="font-mono text-[11px] text-ink-faint mb-3">NOTABLE PERFORMANCES</div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            {notable.map((n) => (
              <button
                key={n.matchId}
                onClick={() => onOpenMatch(n.matchId)}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <PlayerPortrait agent={n.agent} color={n.color} size={56} />
                <div className="text-[11px] font-mono">{n.name}</div>
                {n.rating != null && <div className="text-[10px] font-mono text-ink-faint">{n.rating.toFixed(2)} rtg</div>}
                <div className="text-[10px] text-ink-faint max-w-[70px] truncate">{n.team}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {stats && (
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          <Panel className="p-5">
            <SectionHeader>Top players</SectionHeader>
            {stats.top_players.length === 0 && <EmptyState>No data loaded.</EmptyState>}
            <div className="flex flex-col gap-1">
              {stats.top_players.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3 py-2 border-t border-line-soft first:border-t-0">
                  <span className="font-mono text-xs text-ink-faint w-5">#{i + 1}</span>
                  <PlayerPortrait agent={p.best_agent} color="var(--color-brand)" size={38} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold truncate">{p.name}</div>
                    <div className="text-[11px] text-ink-faint">{p.team}</div>
                  </div>
                  <span className="font-mono text-[13px] text-brand">{p.acs}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel className="p-5">
            <SectionHeader>Team performance</SectionHeader>
            {stats.team_performance.length === 0 && <EmptyState>No data loaded.</EmptyState>}
            <div className="flex flex-col gap-1">
              {stats.team_performance.map((t, i) => (
                <button
                  key={t.team_id}
                  onClick={() => onOpenTeam(t.team_id)}
                  className="flex items-center gap-3 py-2 border-t border-line-soft first:border-t-0 text-left"
                >
                  <span className="font-mono text-xs text-ink-faint w-5">#{i + 1}</span>
                  <TeamBadge name={t.name} accent="team-b" size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold truncate">{t.name}</div>
                    <div className="text-[11px] text-ink-faint">
                      {t.wins}W – {t.matches - t.wins}L
                    </div>
                  </div>
                  <span className="font-mono text-[13px] text-team-b">{(t.win_rate * 100).toFixed(0)}%</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {stats && stats.map_stats?.length > 0 && (
        <div>
          <SectionHeader>Map pick counts</SectionHeader>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {stats.map_stats.slice(0, 6).map((m) => (
              <div key={m.map} className="cut-corner-sm bg-panel border border-line overflow-hidden text-center">
                <MapImage map={m.map} className="w-full h-20" />
                <div className="p-2.5">
                  <div className="text-xs font-semibold">{m.map}</div>
                  <div className="font-mono text-[11px] text-ink-faint mt-0.5">{m.played} played</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
