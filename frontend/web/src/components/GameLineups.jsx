import { useEffect, useState } from 'react'
import { getMatchGames, getGameLineups } from '../lib/api'
import AgentImage from './AgentImage'
import TeamBadge from './TeamBadge'
import { Label, Skeleton } from './ui'

const SIDES = {
  a: { accent: 'brand', color: 'var(--color-brand)', label: 'Team A' },
  b: { accent: 'team-b', color: 'var(--color-team-b)', label: 'Team B' },
}

// One player: the agent art fills the card, the name sits at the bottom over a
// dark fade, and the agent name shows under it. A player with no agent record
// gets a plain panel rather than a broken image.
function PlayerCard({ player, color, delay }) {
  return (
    <figure
      className="rise-in lift relative m-0 aspect-[3/4] overflow-hidden cut-corner-tag bg-panel-raised border border-line"
      style={{ animationDelay: `${delay}ms` }}
    >
      {player.agent ? (
        <AgentImage agent={player.agent} className="absolute inset-0 w-full h-full" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-ink-faint">No agent</div>
      )}
      <span className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color }} aria-hidden="true" />
      <figcaption
        className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 pt-12"
        style={{ backgroundImage: 'linear-gradient(to top, #0a0a0d 0%, rgba(10,10,13,0.75) 55%, transparent 100%)' }}
      >
        <span className="block font-display text-sm font-semibold truncate">{player.name}</span>
        {player.agent && (
          <span className="block font-mono text-[11px] capitalize truncate" style={{ color }}>{player.agent}</span>
        )}
      </figcaption>
    </figure>
  )
}

function TeamSide({ side, which }) {
  const { accent, color, label } = SIDES[which]
  const players = side?.players ?? []
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3 mb-4 min-w-0">
        <TeamBadge name={side.name} accent={accent} size={36} />
        <div className="min-w-0">
          <Label>{label}</Label>
          <div className="font-display font-semibold truncate">{side.name}</div>
        </div>
      </div>
      {players.length === 0 ? (
        <p className="text-sm text-ink-faint">No player records for this side on this map.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {players.map((p, i) => (
            <PlayerCard key={p.name} player={p} color={color} delay={i * 70} />
          ))}
        </div>
      )}
      {players.length > 0 && players.length !== 5 && (
        <p className="text-xs text-ink-faint mt-3">Only {players.length} players are recorded for this side on this map.</p>
      )}
    </div>
  )
}

// The map picker and the two sides. The parent gives this component a key of
// the match id, so switching matches starts from a clean state.
export default function GameLineups({ matchId, mapName }) {
  const [games, setGames] = useState(undefined) // undefined = loading, null = unavailable
  const [index, setIndex] = useState(0)
  const [lineup, setLineup] = useState(undefined) // undefined = loading, null = unavailable
  const gameId = games?.[index]?.game_id

  // A map picked elsewhere on the page (for example a verdict map tile) opens
  // that map here. The picker still changes maps freely afterwards.
  useEffect(() => {
    if (!games || !mapName) return
    const i = games.findIndex((g) => g.map_name === mapName)
    if (i >= 0) setIndex(i)
  }, [games, mapName])

  useEffect(() => {
    let cancelled = false
    getMatchGames(matchId).then((data) => {
      if (!cancelled) setGames(data?.games ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [matchId])

  useEffect(() => {
    if (gameId == null) return undefined
    let cancelled = false
    setLineup(undefined)
    getGameLineups(gameId).then((data) => {
      if (!cancelled) setLineup(data)
    })
    return () => {
      cancelled = true
    }
  }, [gameId])

  if (games === undefined) return <Skeleton className="h-[320px]" />
  if (games === null) {
    return <p className="text-sm text-ink-faint">Map lineups need the live backend. Start the API to see who played which agent.</p>
  }
  if (games.length === 0) return <p className="text-sm text-ink-faint">No maps are recorded for this match.</p>

  return (
    <div className="flex flex-col gap-6">
      <div role="group" aria-label="Choose a map" className="flex flex-wrap gap-1 p-1 w-fit bg-panel border border-line cut-corner-tag">
        {games.map((g, i) => (
          <button
            key={g.game_id}
            type="button"
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
            className={`min-h-[40px] px-3.5 font-mono text-xs cut-corner-tag transition-colors ${
              index === i ? 'bg-brand text-[#14060a] font-semibold' : 'text-ink-dim hover:text-ink'
            }`}
          >
            {i + 1}. {g.map_name}
            <span className="ml-2 tabular-nums opacity-75">{g.team_a_score}-{g.team_b_score}</span>
          </button>
        ))}
      </div>

      {lineup === undefined && (
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="h-[260px]" />
          <Skeleton className="h-[260px]" />
        </div>
      )}
      {lineup === null && (
        <p className="text-sm text-ink-faint">Could not load the lineups for this map. The backend may be slow to respond.</p>
      )}
      {lineup && (
        <div className="grid lg:grid-cols-2 gap-8 fade-up">
          <TeamSide side={lineup.team_a} which="a" />
          <TeamSide side={lineup.team_b} which="b" />
        </div>
      )}
    </div>
  )
}
