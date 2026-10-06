import { useEffect, useState } from 'react'
import { getMatchVerdict, getTimeline, getMatchGames } from '../lib/api'
import { extractMvp, impactColor } from '../lib/format'
import { useCountUp } from '../lib/hooks'
import { CategoryIcon, TrophyIcon } from '../components/icons'
import { Panel, Label, SectionHeader, ImpactBar, ExpandableRow, Pips, MapScoreLine, Tag, LoadingState, EmptyState } from '../components/ui'
import EvidenceRow from '../components/EvidenceRow'
import PlayerStatRow from '../components/PlayerStatRow'
import TeamBadge from '../components/TeamBadge'
import PlayerPortrait from '../components/PlayerPortrait'
import RoundTimeline from '../components/RoundTimeline'
import EconomyChart from '../components/EconomyChart'
import GameLineups from '../components/GameLineups'
import MapImage from '../components/MapImage'

const TEAM_A_COLOR = 'var(--color-brand)'
const TEAM_B_COLOR = 'var(--color-team-b)'

function RankedFactorRow({ f, teamA, highlighted }) {
  const color = impactColor(f.winner, teamA)
  const pct = Math.min(100, f.impact * 100)
  return (
    <div
      id={`factor-${f.rank}`}
      className={`scroll-mt-28 rounded-[inherit] transition-shadow duration-500 ${highlighted ? 'shadow-[0_0_0_1px_var(--color-brand-line)]' : ''}`}
    >
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
    </div>
  )
}

// One bar per ranked factor, drawn from the centre toward the team that won
// it, with length set by measured impact. Clicking a bar jumps to its card.
function ImpactDivergence({ factors, teamA, teamB, onSelect }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.14em]">
        <span style={{ color: TEAM_A_COLOR }}>{teamA}</span>
        <span style={{ color: TEAM_B_COLOR }}>{teamB}</span>
      </div>
      {factors.map((f, i) => {
        const pct = Math.min(100, f.impact * 100)
        const toA = f.winner === teamA
        const toB = !toA && f.winner === teamB
        const delay = `${i * 90}ms`
        return (
          <button
            key={f.rank}
            type="button"
            onClick={() => onSelect(f.rank)}
            aria-label={`${f.category}, ${f.impact_label}. Show details`}
            className="group flex flex-col gap-1.5 text-left min-h-[40px] justify-center"
          >
            <div className="flex justify-between gap-3 text-xs">
              <span className="truncate text-ink-dim group-hover:text-ink transition-colors">{f.category}</span>
              <span className="font-mono text-ink-faint shrink-0">{f.impact_label}</span>
            </div>
            <div className="flex h-2" aria-hidden="true">
              <div className="flex-1 flex justify-end bg-line-soft">
                {toA && (
                  <span
                    className="grow-x h-full"
                    style={{ width: `${pct}%`, background: TEAM_A_COLOR, transformOrigin: 'right', animationDelay: delay }}
                  />
                )}
              </div>
              <div className="w-px bg-ink-faint" />
              <div className="flex-1 bg-line-soft">
                {toB && (
                  <span
                    className="grow-x h-full block"
                    style={{ width: `${pct}%`, background: TEAM_B_COLOR, animationDelay: delay }}
                  />
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// Both teams' players on one rating scale, each team ranked by rating. The
// bars start at zero, so the gaps are shown at their true size.
function RatingDuel({ teamA, teamB, playersA, playersB }) {
  const rated = (players) => players.filter((p) => typeof p.rating === 'number').sort((x, y) => y.rating - x.rating)
  const listA = rated(playersA || [])
  const listB = rated(playersB || [])
  const max = Math.max(0, ...listA.map((p) => p.rating), ...listB.map((p) => p.rating))
  if (max <= 0) return null
  const side = (team, list, color) => (
    <div className="min-w-0 flex flex-col gap-3">
      <div className="font-mono text-xs" style={{ color }}>{team}</div>
      {list.map((p, i) => (
        <div key={p.name} className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-ink-dim w-24 truncate shrink-0">{p.name}</span>
          <div className="flex-1 h-2 bg-line-soft overflow-hidden" aria-hidden="true">
            <div className="grow-x h-full" style={{ width: `${(p.rating / max) * 100}%`, background: color, animationDelay: `${i * 70}ms` }} />
          </div>
          <span className="font-mono text-xs tabular-nums w-11 text-right shrink-0" style={{ color }}>{Number(p.rating).toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
  return (
    <Panel className="p-6 mb-5 rise-in">
      <SectionHeader>Rating duel</SectionHeader>
      <Label className="mb-5">Both teams on one scale, ranked by rating</Label>
      <div className="grid md:grid-cols-2 gap-6">
        {side(teamA, listA, TEAM_A_COLOR)}
        {side(teamB, listB, TEAM_B_COLOR)}
      </div>
    </Panel>
  )
}

function Lineup({ team, players, color }) {
  return (
    <Panel className="p-5 min-w-0 rise-in">
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
  const [focusRank, setFocusRank] = useState(null)
  const [activeSection, setActiveSection] = useState('factors')
  const [mapPick, setMapPick] = useState(null)
  // Map names come from the match endpoint, which always lists every game.
  const [games, setGames] = useState(null)

  useEffect(() => {
    let cancelled = false
    setM(null)
    setTimeline(null)
    setGames(null)
    getMatchVerdict(matchId).then(({ verdict }) => {
      if (!cancelled) setM(verdict)
    })
    getMatchGames(matchId).then((data) => {
      if (!cancelled) setGames(data?.games ?? null)
    })
    getTimeline(matchId).then((t) => {
      if (!cancelled) setTimeline(t)
    })
    return () => {
      cancelled = true
    }
  }, [matchId])

  // The highlight on a factor card fades after a moment.
  useEffect(() => {
    if (focusRank == null) return undefined
    const t = setTimeout(() => setFocusRank(null), 2200)
    return () => clearTimeout(t)
  }, [focusRank])

  // Track which section is in the middle of the viewport for the sticky nav.
  useEffect(() => {
    if (!m) return undefined
    const sections = document.querySelectorAll('[data-section]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-35% 0px -55% 0px' }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [m, timeline])

  const scoreParts = m ? m.score.split('-').map(Number) : [null, null]
  const animatedA = useCountUp(scoreParts[0], 900)
  const animatedB = useCountUp(scoreParts[1], 900)

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
  const mvpColor = mvp ? (mvp.team === m.team_a ? TEAM_A_COLOR : TEAM_B_COLOR) : null
  const mvpAgent = mvp
    ? [...(m.roster?.team_a || []), ...(m.roster?.team_b || [])].find((p) => p.name === mvp.name)?.best_agent
    : null
  const [scoreA, scoreB] = m.score.split('-')
  const hasLineups = Boolean(m.roster?.team_a && m.roster?.team_b)
  const sections = [
    { id: 'factors', label: 'Factors' },
    ...(hasLineups ? [{ id: 'lineups', label: 'Lineups' }] : []),
    { id: 'maps', label: 'Maps' },
    ...(timeline ? [{ id: 'rounds', label: 'Rounds' }, { id: 'economy', label: 'Economy' }] : []),
  ]

  function jumpTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function focusFactor(rank) {
    setFocusRank(rank)
    document.getElementById(`factor-${rank}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="fade-up">
      <Panel accent={primaryColor} className="relative overflow-hidden p-6 md:p-8 mb-6 rise-in">
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
          <div className="font-mono text-4xl md:text-5xl font-semibold tabular-nums text-center" style={{ textShadow: '0 0 26px var(--color-brand-line)' }} aria-label={`${scoreA} to ${scoreB}`}>
            <span aria-hidden="true">
              {Math.round(animatedA)} <span className="text-ink-faint">:</span> {Math.round(animatedB)}
            </span>
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

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
          {m.map_scores.map((s, i) => {
            const map = games?.[i]?.map_name ?? m.maps?.[i] ?? null
            return (
              <button
                key={i}
                type="button"
                disabled={!map}
                onClick={() => {
                  setMapPick(map)
                  jumpTo('maps')
                }}
                aria-label={`${map ?? `Map ${i + 1}`}, ${s}. Open its lineups`}
                className="rise-in group relative overflow-hidden cut-corner-tag border border-line hover:border-brand/40 min-h-[132px] text-left disabled:cursor-default"
                style={{ animationDelay: `${200 + i * 90}ms` }}
              >
                {map && <MapImage map={map} className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105" />}
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to top, rgba(10,10,13,0.95), rgba(10,10,13,0.3) 65%, transparent)' }} aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-display text-sm font-semibold truncate">{map ?? `Map ${i + 1}`}</div>
                      <div className="font-mono text-[11px] text-ink-dim">Map {i + 1} of {m.map_scores.length}</div>
                    </div>
                    <MapScoreLine scoreStr={s} />
                  </div>
                  <div className="mt-2"><Pips scoreStr={s} /></div>
                </div>
              </button>
            )
          })}
        </div>
      </Panel>

      <nav aria-label="Verdict sections" className="sticky top-3 z-30 mb-6 flex flex-wrap gap-1 p-1 w-fit bg-panel border border-line cut-corner-tag shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => jumpTo(s.id)}
            aria-current={activeSection === s.id ? 'true' : undefined}
            className={`min-h-[36px] px-3.5 font-mono text-[11px] uppercase tracking-[0.12em] cut-corner-tag transition-colors ${
              activeSection === s.id ? 'bg-brand text-[#14060a] font-semibold' : 'text-ink-dim hover:text-ink'
            }`}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div id="factors" data-section className="scroll-mt-28 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5 mb-6">
        <Panel className="p-6 flex gap-5 items-start self-start rise-in" accent={primaryColor}>
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

        <Panel className="p-6 rise-in lg:row-span-2" style={{ animationDelay: '120ms' }}>
          <SectionHeader>Impact at a glance</SectionHeader>
          <Label className="mb-5">Bar length is measured impact, drawn toward the winning side</Label>
          <ImpactDivergence factors={m.ranked_factors} teamA={m.team_a} teamB={m.team_b} onSelect={focusFactor} />
        </Panel>

        <Panel className="p-6 rise-in lg:col-span-1" style={{ animationDelay: '180ms' }}>
          <SectionHeader>Ranked factors</SectionHeader>
          <Label className="mb-4">Ordered by measured impact</Label>
          {m.ranked_factors.map((f) => (
            <RankedFactorRow key={f.rank} f={f} teamA={m.team_a} highlighted={focusRank === f.rank} />
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

      {hasLineups && (
        <section id="lineups" data-section className="scroll-mt-28 mb-6">
          <SectionHeader>Lineups</SectionHeader>
          <Label className="mb-4">Select a player for full stats</Label>
          <RatingDuel teamA={m.team_a} teamB={m.team_b} playersA={m.roster.team_a} playersB={m.roster.team_b} />
          <div className="grid lg:grid-cols-2 gap-5">
            <Lineup team={m.team_a} players={m.roster.team_a} color={TEAM_A_COLOR} />
            <Lineup team={m.team_b} players={m.roster.team_b} color={TEAM_B_COLOR} />
          </div>
        </section>
      )}

      <section id="maps" data-section className="scroll-mt-28 mb-6">
        <SectionHeader>Map lineups</SectionHeader>
        <Label className="mb-5">Each player's agent on the map you pick</Label>
        <GameLineups key={matchId} matchId={matchId} mapName={mapPick} />
      </section>

      {timeline && (
        <div className="flex flex-col gap-5">
          <div id="rounds" data-section className="scroll-mt-28">
            <RoundTimeline games={timeline.round_timeline} teamA={m.team_a} teamB={m.team_b} />
          </div>
          <div id="economy" data-section className="scroll-mt-28">
            <EconomyChart games={timeline.economy_timeline} teamA={m.team_a} teamB={m.team_b} />
          </div>
        </div>
      )}
    </div>
  )
}
