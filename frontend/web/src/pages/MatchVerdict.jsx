import { useEffect, useState } from 'react'
import { getMatchVerdict, getTimeline } from '../lib/api'
import { extractMvp, impactColor } from '../lib/format'
import { CategoryIcon, MapGlyph, TrophyIcon } from '../components/icons'
import { Panel, Label, SectionHeader, ImpactBar, ExpandableRow, Pips, MapScoreLine, Tag, LoadingState, EmptyState } from '../components/ui'
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
          <span className="font-mono text-xs text-ink-faint w-5 tabular-nums">{f.rank}</span>
          <span style={{ color }} className="inline-flex shrink-0"><CategoryIcon category={f.category} /></span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display font-semibold text-sm">{f.category}</span>
              <span className="font-mono text-xs shrink-0" style={{ color }}>{f.impact_label}</span>
            </div>
            <div className="mt-2"><ImpactBar pct={pct} color={color} /></div>
          </div>
        </>
      }
    >
      <p className="text-sm text-ink-dim leading-relaxed mb-2">{f.summary}</p>
      {f.evidence.map((ev, i) => (
        <EvidenceRow key={i} ev={ev} />
      ))}
    </ExpandableRow>
  )
}

function Lineup({ team, players, color }) {
  return (
    <Panel className="p-5 min-w-0">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-2 h-2 shrink-0" style={{ background: color }} aria-hidden="true" />
        <span className="font-display text-base font-semibold truncate">{team}</span>
      </div>
      <div className="flex flex-col">
        {players.map((p) => (
          <PlayerStatRow key={p.name} pl={p} color={color} />
        ))}
      </div>
    </Panel>
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

  if (m === null) return <LoadingState>Loading verdict</LoadingState>
  if (!m) {
    return (
      <EmptyState>
        Could not load this match. The backend is unreachable and no bundled data exists for match {matchId}. Start the
        API with <code className="text-ink">uvicorn app.main:app --reload</code> and try again.
      </EmptyState>
    )
  }

  const primaryColor = impactColor(m.primary_factor.winner || m.winner, m.team_a)
  const mvp = m.primary_factor.category === 'Player Impact' ? extractMvp(m.primary_factor.summary) : null
  const mvpColor = mvp ? (mvp.team === m.team_a ? 'var(--color-brand)' : 'var(--color-team-b)') : null
  const mvpAgent = mvp
    ? [...(m.roster?.team_a || []), ...(m.roster?.team_b || [])].find((p) => p.name === mvp.name)?.best_agent
    : null
  const [scoreA, scoreB] = m.score.split('-')

  return (
    <div className="fade-up">
      <Panel accent={primaryColor} className="relative overflow-hidden p-6 md:p-8 mb-6">
        <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand" aria-hidden="true" />
        <Label className="mb-5">Match verdict{m.tournament ? `, ${m.tournament}` : ''}</Label>
        <div className="grid md:grid-cols-[1fr_auto_1fr] items-center gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <TeamBadge name={m.team_a} accent="brand" size={68} />
            <div className="min-w-0">
              <h1 className="font-display text-2xl md:text-3xl font-bold truncate flex items-center gap-2">
                {m.winner === m.team_a && <TrophyIcon color="var(--color-brand)" size={20} />}
                {m.team_a}
              </h1>
              <Label className="mt-1">Team A</Label>
            </div>
          </div>
          <div className="font-mono text-4xl md:text-5xl font-semibold tabular-nums text-center" style={{ textShadow: '0 0 26px var(--color-brand-line)' }}>
            {scoreA} <span className="text-ink-faint">:</span> {scoreB}
          </div>
          <div className="flex items-center gap-4 min-w-0 md:flex-row-reverse md:text-right">
            <TeamBadge name={m.team_b} accent="team-b" size={68} />
            <div className="min-w-0">
              <div className="font-display text-2xl md:text-3xl font-bold truncate flex items-center gap-2 md:flex-row-reverse">
                {m.winner === m.team_b && <TrophyIcon color="var(--color-brand)" size={20} />}
                {m.team_b}
              </div>
              <Label className="mt-1">Team B</Label>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {m.map_scores.map((s, i) => (
            <div key={i} className="border-t border-line-soft pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-center gap-3 mb-2.5">
                <span className="w-4 flex justify-center shrink-0 text-ink-faint">{m.maps && <MapGlyph map={m.maps[i]} />}</span>
                {m.maps && <span className="text-sm font-semibold text-ink shrink-0">{m.maps[i]}</span>}
                <span className="flex-1 h-px bg-line-soft" />
                <MapScoreLine scoreStr={s} />
              </div>
              <div className="pl-7"><Pips scoreStr={s} /></div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5 mb-6">
        <Panel className="p-6 flex gap-5 items-start self-start" accent={primaryColor}>
          {mvp && <PlayerPortrait agent={mvpAgent} color={mvpColor} size={64} className="shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Tag tone="mvp">Primary factor</Tag>
              <span className="font-mono text-xs" style={{ color: primaryColor }}>{m.primary_factor.impact_label}</span>
            </div>
            <div className="font-display text-xl font-bold mb-2">{m.primary_factor.category}</div>
            <p className="text-sm text-ink-dim leading-relaxed">{m.primary_factor.summary}</p>
          </div>
        </Panel>
        <Panel className="p-6">
          <SectionHeader>Ranked factors</SectionHeader>
          <Label className="mb-4">Ordered by measured impact</Label>
          {m.ranked_factors.map((f) => (
            <RankedFactorRow key={f.rank} f={f} teamA={m.team_a} />
          ))}
          {m.skipped_analyzers?.length > 0 && (
            <div className="mt-3 flex flex-col gap-1">
              {m.skipped_analyzers.map((s) => (
                <p key={s.analyzer} className="text-xs text-ink-faint">
                  {s.analyzer.replace(/^app\.analyzers\./, '').replace(/_/g, ' ')}: no usable data for this series.
                </p>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {m.roster?.team_a && m.roster?.team_b && (
        <section className="mb-6">
          <SectionHeader>Lineups</SectionHeader>
          <Label className="mb-4">Select a player for full stats</Label>
          <div className="grid lg:grid-cols-2 gap-5">
            <Lineup team={m.team_a} players={m.roster.team_a} color="var(--color-brand)" />
            <Lineup team={m.team_b} players={m.roster.team_b} color="var(--color-team-b)" />
          </div>
        </section>
      )}

      {timeline && (
        <div className="flex flex-col gap-5">
          <RoundTimeline games={timeline.round_timeline} teamA={m.team_a} teamB={m.team_b} />
          <EconomyChart games={timeline.economy_timeline} teamA={m.team_a} teamB={m.team_b} />
        </div>
      )}
    </div>
  )
}
