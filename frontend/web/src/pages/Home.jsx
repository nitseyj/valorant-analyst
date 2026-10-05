import { useEffect, useState } from 'react'
import { getOverview, listMatches, getMatchVerdict } from '../lib/api'
import { extractMvp, impactColor, matchScoreStr } from '../lib/format'
import { PlayersIcon, TeamsIcon, MatchesIcon, FlameIcon, VersusIcon } from '../components/icons'
import { Panel, Label, SectionHeader, StatCard, Tag, EmptyState, Skeleton } from '../components/ui'
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
      <section className="relative overflow-hidden cut-corner border border-line bg-panel px-6 md:px-9 py-9 mb-6">
        <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand" aria-hidden="true" />
        <span
          className="absolute -right-24 -top-24 w-72 h-72 border border-brand-line rotate-45 pointer-events-none opacity-40"
          aria-hidden="true"
        />
        <Label tone="brand" className="relative mb-4">VCT 2021 to 2026, all seasons loaded</Label>
        <h1 className="relative font-display text-3xl md:text-5xl font-bold leading-[1.08] mb-4 max-w-2xl">
          Every verdict, <span className="text-brand">backed by evidence.</span>
        </h1>
        <p className="relative text-ink-dim text-sm md:text-base max-w-xl leading-relaxed">
          Real pro-scene data and transparent statistics. No black-box model and no invented predictions.
          Every ranked factor links back to the round-by-round evidence behind it.
        </p>
      </section>

      {stats ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<PlayersIcon size={18} />} label="Players" value={stats.counts.players.toLocaleString()} />
          <StatCard icon={<TeamsIcon size={18} />} label="Teams" value={stats.counts.teams.toLocaleString()} />
          <StatCard icon={<MatchesIcon size={18} />} label="Matches" value={stats.counts.matches.toLocaleString()} />
          <StatCard icon={<FlameIcon size={18} />} label="Events" value={stats.counts.events.toLocaleString()} />
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[92px] cut-corner-sm" />
          ))}
        </div>
      )}

      {stats && stats.season_journey?.length ? (
        <Panel className="p-6 mb-6">
          <SectionHeader>Season journey, 2025</SectionHeader>
          <p className="text-xs text-ink-faint mb-6">Match counts per phase, in season order.</p>
          <ol className="relative grid gap-x-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
            {stats.season_journey.map((p) => (
              <li key={p.phase} className="flex items-start gap-3 min-w-0">
                <span className="mt-1 w-3 h-3 rotate-45 bg-brand shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{p.phase}</div>
                  <div className="font-mono text-xs text-ink-faint">{p.matches} matches</div>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      ) : null}

      {spotlight && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => onOpenMatch(spotlight.match_id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onOpenMatch(spotlight.match_id)
            }
          }}
          className="block mb-6 group cursor-pointer"
        >
          <Panel accent="var(--color-brand)" className="p-6 transition-colors group-hover:bg-panel-raised">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <Tag tone="brand"><FlameIcon size={11} /> Spotlight match</Tag>
              <span className="font-mono text-xs text-ink-faint">Open verdict</span>
            </div>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="font-display text-xl font-bold flex items-center gap-2 min-w-0">
                <span className="truncate">{spotlight.team_a}</span>
                <VersusIcon className="text-ink-faint shrink-0" />
                <span className="truncate">{spotlight.team_b}</span>
              </div>
              <div className="font-mono text-2xl font-semibold tabular-nums">{matchScoreStr(spotlight)}</div>
            </div>
            <p className="text-sm text-ink-dim mt-3 max-w-2xl leading-relaxed">{spotlight.primary_factor.summary}</p>
            <div
              className="mt-3 text-xs font-mono"
              style={{ color: impactColor(spotlight.primary_factor.winner || spotlight.winner, spotlight.team_a) }}
            >
              {spotlight.primary_factor.category}: {spotlight.primary_factor.impact_label.toLowerCase()}
            </div>
          </Panel>
        </div>
      )}

      {notable.length > 0 && (
        <section className="mb-6">
          <Label className="mb-3">Notable performances</Label>
          <div className="flex gap-5 overflow-x-auto no-scrollbar pb-1">
            {notable.map((n) => (
              <button
                key={n.matchId}
                onClick={() => onOpenMatch(n.matchId)}
                className="flex flex-col items-center gap-2 shrink-0 w-24 text-center"
              >
                <PlayerPortrait agent={n.agent} color={n.color} size={60} />
                <div className="text-xs font-semibold truncate w-full">{n.name}</div>
                {n.rating != null && <div className="font-mono text-[11px] text-ink-dim">{n.rating.toFixed(2)} rtg</div>}
                <div className="text-[11px] text-ink-faint truncate w-full">{n.team}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {stats && (
        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          <Panel className="p-6">
            <SectionHeader>Top players</SectionHeader>
            <Label className="mb-3">Ranked by average ACS</Label>
            {stats.top_players.length === 0 && <EmptyState>No data loaded.</EmptyState>}
            <ol className="flex flex-col">
              {stats.top_players.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3.5 py-2.5 border-t border-line-soft first:border-t-0">
                  <span className="font-mono text-xs text-ink-faint w-6 tabular-nums">{i + 1}</span>
                  <PlayerPortrait agent={p.best_agent} color="var(--color-brand)" size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-ink-faint truncate">{p.team}</div>
                  </div>
                  <span className="font-mono text-sm text-brand tabular-nums">{p.acs}</span>
                </li>
              ))}
            </ol>
          </Panel>
          <Panel className="p-6">
            <SectionHeader>Team performance</SectionHeader>
            <Label className="mb-3">Ranked by all-time win rate</Label>
            {stats.team_performance.length === 0 && <EmptyState>No data loaded.</EmptyState>}
            <ol className="flex flex-col">
              {stats.team_performance.map((t, i) => (
                <li key={t.team_id}>
                  <button
                    type="button"
                    onClick={() => onOpenTeam(t.team_id)}
                    className="w-full flex items-center gap-3.5 py-2.5 border-t border-line-soft first:border-t-0 text-left hover:bg-panel-raised transition-colors"
                  >
                    <span className="font-mono text-xs text-ink-faint w-6 tabular-nums">{i + 1}</span>
                    <TeamBadge name={t.name} accent="team-b" size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{t.name}</div>
                      <div className="font-mono text-xs text-ink-faint">
                        {t.wins}W / {t.matches - t.wins}L
                      </div>
                    </div>
                    <span className="font-mono text-sm text-win tabular-nums">{(t.win_rate * 100).toFixed(0)}%</span>
                  </button>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      )}

      {stats && stats.map_stats?.length > 0 && (
        <section>
          <SectionHeader>Map pick counts</SectionHeader>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {stats.map_stats.slice(0, 6).map((m) => (
              <div key={m.map} className="cut-corner-sm bg-panel border border-line overflow-hidden">
                <MapImage map={m.map} className="w-full h-24" />
                <div className="p-3">
                  <div className="text-sm font-semibold">{m.map}</div>
                  <div className="font-mono text-xs text-ink-faint mt-0.5">{m.played} played</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
