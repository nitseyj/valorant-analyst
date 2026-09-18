import { useEffect, useState } from 'react'
import { getMatchVerdict, getTimeline } from '../lib/api'
import { extractMvp, impactColor } from '../lib/format'
import { CategoryIcon, MapGlyph, TrophyIcon, DividerDeco } from '../components/icons'
import { Panel, SectionHeader, ImpactBar, ExpandableRow, Pips, MapScoreLine, LoadingState, EmptyState } from '../components/ui'
import EvidenceRow from '../components/EvidenceRow'
import PlayerStatRow from '../components/PlayerStatRow'
import TeamBadge from '../components/TeamBadge'
import PlayerPortrait from '../components/PlayerPortrait'
import RoundTimeline from '../components/RoundTimeline'
import EconomyChart from '../components/EconomyChart'

function RankedFactorRow({ f, teamA }) {
  const color = impactColor(f.winner, teamA)
  const pct = Math.min(100, f.impact * 100)
  return (
    <ExpandableRow
      header={
        <>
          <span className="font-mono text-xs text-ink-faint w-4">{f.rank}</span>
          <span style={{ color }} className="inline-flex"><CategoryIcon category={f.category} /></span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2.5">
              <span className="font-display font-semibold text-sm">{f.category}</span>
              <span className="font-mono text-[11px]" style={{ color }}>{f.impact_label}</span>
            </div>
            <div className="mt-1.5"><ImpactBar pct={pct} color={color} /></div>
          </div>
        </>
      }
    >
      <p className="text-[13px] text-ink-dim leading-relaxed mb-1">{f.summary}</p>
      {f.evidence.map((ev, i) => (
        <EvidenceRow key={i} ev={ev} />
      ))}
    </ExpandableRow>
  )
}

export default function MatchVerdict({ matchId }) {
  const [m, setM] = useState(null)
  const [timeline, setTimeline] = useState(null)

  useEffect(() => {
    let cancelled = false
    setM(null)
    setTimeline(null)
    getMatchVerdict(matchId).then(({ verdict }) => {
      if (!cancelled) setM(verdict)
    })
    getTimeline(matchId).then((t) => {
      if (!cancelled) setTimeline(t)
    })
    return () => {
      cancelled = true
    }
  }, [matchId])

  if (m === null) return <LoadingState>loading verdict…</LoadingState>
  if (!m) {
    return (
      <EmptyState>
        Couldn't load this match. The backend isn't reachable and no demo data exists for match {matchId}. Start
        the API (<code className="text-ink">uvicorn app.main:app --reload</code>) and try again.
      </EmptyState>
    )
  }

  const primaryColor = impactColor(m.primary_factor.winner || m.winner, m.team_a)
  const mvp = m.primary_factor.category === 'Player Impact' ? extractMvp(m.primary_factor.summary) : null
  const mvpColor = mvp ? (mvp.team === m.team_a ? 'var(--color-brand)' : 'var(--color-team-b)') : null
  const mvpAgent = mvp
    ? [...(m.roster?.team_a || []), ...(m.roster?.team_b || [])].find((p) => p.name === mvp.name)?.best_agent
    : null

  return (
    <div className="fade-up">
      <Panel accent={primaryColor !== 'var(--color-ink-faint)' ? primaryColor : undefined} className="p-7 mb-5 relative overflow-hidden">
        <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none" width="340" height="340" viewBox="0 0 340 340">
          <circle cx="170" cy="170" r="160" stroke="var(--color-ink)" strokeWidth="1" fill="none" />
          <circle cx="170" cy="170" r="112" stroke="var(--color-ink)" strokeWidth="1" fill="none" />
          <circle cx="170" cy="170" r="64" stroke="var(--color-ink)" strokeWidth="1" fill="none" />
          <line x1="10" y1="170" x2="330" y2="170" stroke="var(--color-ink)" strokeWidth="1" />
          <line x1="170" y1="10" x2="170" y2="330" stroke="var(--color-ink)" strokeWidth="1" />
        </svg>

        <div className="relative flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 min-w-0">
            <TeamBadge name={m.team_a} accent="brand" size={52} />
            <div className="min-w-0">
              <div className="font-display text-xl sm:text-2xl font-bold truncate flex items-center gap-1.5">
                {m.winner === m.team_a && <TrophyIcon color="var(--color-brand)" size={18} />}
                {m.team_a}
              </div>
            </div>
          </div>
          <div className="font-mono text-3xl sm:text-4xl font-semibold shrink-0" style={{ textShadow: '0 0 26px var(--color-brand-line)' }}>
            {m.score.replace('-', ' — ')}
          </div>
          <div className="flex items-center gap-3 min-w-0 flex-row-reverse text-right">
            <TeamBadge name={m.team_b} accent="team-b" size={52} />
            <div className="min-w-0">
              <div className="font-display text-xl sm:text-2xl font-bold truncate flex items-center gap-1.5 flex-row-reverse">
                {m.winner === m.team_b && <TrophyIcon color="var(--color-brand)" size={18} />}
                {m.team_b}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex flex-col gap-4">
          {m.map_scores.map((s, i) => (
            <div key={i}>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-4 flex justify-center shrink-0 text-ink-faint">{m.maps && <MapGlyph map={m.maps[i]} />}</span>
                {m.maps && <span className="text-sm text-ink-dim shrink-0">{m.maps[i]}</span>}
                <span className="flex-1 h-px bg-line-soft" />
                <MapScoreLine scoreStr={s} />
              </div>
              <div className="pl-[26px]"><Pips scoreStr={s} /></div>
            </div>
          ))}
        </div>
      </Panel>

      {m.roster?.team_a && m.roster?.team_b && (
        <Panel className="p-5 mb-5">
          <div className="font-mono text-[11px] text-ink-faint mb-3">LINEUPS — click a player for full stats</div>
          <div className="font-mono text-[11px] text-brand mb-2 mt-2.5">{m.team_a}</div>
          {m.roster.team_a.map((p) => (
            <PlayerStatRow key={p.name} pl={p} color="var(--color-brand)" />
          ))}
          <div className="font-mono text-[11px] text-team-b mb-2 mt-3.5">{m.team_b}</div>
          {m.roster.team_b.map((p) => (
            <PlayerStatRow key={p.name} pl={p} color="var(--color-team-b)" />
          ))}
        </Panel>
      )}

      <Panel className="p-6 mb-7 flex gap-4 items-start" style={{ borderColor: `${primaryColor}55` }}>
        {mvp && (
          <div className="text-center shrink-0">
            <PlayerPortrait agent={mvpAgent} color={mvpColor} size={60} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[11px] text-ink-faint mb-2">PRIMARY FACTOR</div>
          <div className="flex items-baseline gap-2.5 mb-2">
            <span className="font-display text-lg font-bold">{m.primary_factor.category}</span>
            <span className="font-mono text-xs" style={{ color: primaryColor }}>{m.primary_factor.impact_label}</span>
          </div>
          <p className="text-sm text-ink-dim leading-relaxed">{m.primary_factor.summary}</p>
        </div>
      </Panel>

      <div className="my-4"><DividerDeco /></div>

      <SectionHeader>Ranked factors</SectionHeader>
      {m.ranked_factors.map((f) => (
        <RankedFactorRow key={f.rank} f={f} teamA={m.team_a} />
      ))}
      {m.skipped_analyzers?.length > 0 && (
        <div className="mt-2.5 text-xs text-ink-faint">
          {m.skipped_analyzers.map((s) => (
            <div key={s.analyzer}>· {s.analyzer.replace(/^app\.analyzers\./, '').replace(/_/g, ' ')} — no usable data for this series</div>
          ))}
        </div>
      )}

      {timeline && (
        <div className="mt-6 flex flex-col gap-5">
          <RoundTimeline games={timeline.round_timeline} teamA={m.team_a} teamB={m.team_b} />
          <EconomyChart games={timeline.economy_timeline} teamA={m.team_a} teamB={m.team_b} />
        </div>
      )}
    </div>
  )
}
