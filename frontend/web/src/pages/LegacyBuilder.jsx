import { useEffect, useRef, useState } from 'react'
import { searchPlayers, simulateRoster } from '../lib/api'
import { ROLE_COLOR, roleOf } from '../lib/roles'
import { useCountUp } from '../lib/hooks'
import { CrosshairDeco, DotsDeco, RoleGlyph, VersusIcon } from '../components/icons'
import { Panel, Button, Label, SectionHeader } from '../components/ui'
import TeamBadge from '../components/TeamBadge'
import PlayerPortrait from '../components/PlayerPortrait'
import AgentImage from '../components/AgentImage'

const DEFAULTS_A = ['aspas', 'Jinggg', 'f0rsakeN', 'Chronicle', 'Boaster']
const DEFAULTS_B = ['zekken', 'Derke', 'yay', 'johnqt', 'Sayf']
const EMPTY = ['', '', '', '', '']
const ROLES = ['Duelist', 'Initiator', 'Controller', 'Sentinel']
const HISTORY_LIMIT = 20

function accentColor(accent) {
  return accent === 'brand' ? 'var(--color-brand)' : 'var(--color-team-b)'
}

// The whole agent image, never cropped: the art at its true proportions with a
// blurred copy filling the frame around it.
function FramedAgent({ agent, className = '' }) {
  if (!agent) return null
  return (
    <div className={`relative overflow-hidden bg-panel-raised ${className}`}>
      <AgentImage agent={agent} className="absolute inset-0 w-full h-full scale-110 blur-xl opacity-40" />
      <AgentImage agent={agent} fit="contain" className="absolute inset-0 w-full h-full" />
    </div>
  )
}

// Each slot debounces its OWN search independently (a ref map keyed by
// "prefix-index", not one shared timer), so typing in one slot never cancels
// a search pending in another. Only one dropdown is open at a time.
//
// The dropdown is a listbox: arrow keys move through matches, Enter picks
// the highlighted one, and Escape closes it without losing the typed text.
function PlayerSlot({ slotKey, value, placeholder, accent, onChange, onSelect, openSlot, setOpenSlot, results, known }) {
  const timers = useRef({})
  const [active, setActive] = useState(-1)
  const isOpen = openSlot === slotKey && results.length > 0
  const color = accentColor(accent)
  const listId = `${slotKey}-list`
  const picked = known[value]
  const activeIndex = isOpen && active < results.length ? active : -1

  function handleInput(e) {
    const val = e.target.value
    onChange(val)
    setActive(-1)
    clearTimeout(timers.current[slotKey])
    if (!val || val.length < 2) {
      if (openSlot === slotKey) setOpenSlot(null, [])
      return
    }
    timers.current[slotKey] = setTimeout(async () => {
      const players = await searchPlayers(val)
      setOpenSlot(slotKey, players)
    }, 250)
  }

  function choose(p) {
    onSelect(p)
    setActive(-1)
    setOpenSlot(null, [])
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault()
        setOpenSlot(null, [])
      }
      return
    }
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(Math.min(activeIndex + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(Math.max(activeIndex - 1, 0))
    } else if (e.key === 'Enter') {
      // With nothing highlighted, Enter only picks a name typed exactly, so a
      // partial search never picks a different player by accident.
      const exact = results.find((p) => p.name.toLowerCase() === value.trim().toLowerCase())
      const target = activeIndex >= 0 ? results[activeIndex] : exact
      if (target) {
        e.preventDefault()
        choose(target)
      }
    }
  }

  return (
    <div className="relative">
      <div className="flex items-stretch gap-3">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${slotKey}-opt-${activeIndex}` : undefined}
          aria-label={`${accent === 'brand' ? 'Lineup A' : 'Lineup B'} player, ${placeholder}`}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpenSlot(slotKey, results)}
          className="min-w-0 flex-1 bg-panel-raised border border-line text-ink text-base rounded-sm py-3.5 px-4 font-mono transition-colors focus-visible:border-brand"
          style={{ borderColor: isOpen ? `color-mix(in srgb, ${color} 50%, transparent)` : undefined }}
        />
        {picked?.best_agent && !isOpen && (
          <FramedAgent agent={picked.best_agent} className="w-11 shrink-0 cut-corner-tag border border-line rise-in" />
        )}
      </div>
      {picked && !isOpen && (
        <div className="rise-in flex items-center gap-2 mt-1.5 text-xs text-ink-faint min-w-0" aria-hidden="true">
          <span className="truncate">{picked.team || 'Unknown team'}</span>
          {picked.best_agent && <span className="font-mono capitalize shrink-0">{picked.best_agent}</span>}
        </div>
      )}
      {isOpen && (
        <ul
          id={listId}
          role="listbox"
          aria-label={`Matches for ${value}`}
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 bg-panel-raised border border-line shadow-2xl max-h-64 overflow-y-auto rounded-sm"
        >
          {results.map((p, i) => (
            <li
              key={p.name}
              id={`${slotKey}-opt-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault()
                choose(p)
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex items-center gap-3 px-3.5 py-2.5 border-b border-line-soft last:border-none cursor-pointer transition-colors ${
                i === activeIndex ? 'bg-panel' : 'hover:bg-panel'
              }`}
            >
              <TeamBadge name={p.team || 'Unknown'} accent={accent} size={30} />
              <PlayerPortrait agent={p.best_agent} color={color} size={38} />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{p.name}</div>
                <div className="text-xs text-ink-faint truncate">{p.team || 'Unknown team'}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// How many of the four roles a lineup fills. Before a simulation this comes
// from each player's best agent; after one, from the model's primary roles.
function RoleCoverage({ counts, color }) {
  return (
    <div className="grid grid-cols-4 gap-2 mb-5" role="list" aria-label="Role coverage">
      {ROLES.map((role) => {
        const n = counts[role] || 0
        const roleColor = ROLE_COLOR[role]
        return (
          <div
            key={role}
            role="listitem"
            className={`rise-in flex flex-col items-center gap-1 py-2 border cut-corner-tag ${n ? '' : 'border-dashed border-line'}`}
            style={n ? { borderColor: `color-mix(in srgb, ${roleColor} 45%, transparent)`, background: `color-mix(in srgb, ${roleColor} 10%, transparent)` } : undefined}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] truncate max-w-full" style={{ color: n ? roleColor : 'var(--color-ink-faint)' }}>
              {role}
            </span>
            <span className="font-display text-lg font-bold tabular-nums" style={{ color: n ? color : 'var(--color-ink-faint)' }}>{n}</span>
          </div>
        )
      })}
    </div>
  )
}

function countRoles(roles) {
  return roles.reduce((acc, r) => {
    if (r) acc[r] = (acc[r] || 0) + 1
    return acc
  }, {})
}

function LineupColumn({ label, accent, side, names, setNames, onPick, placeholders, openSlot, setOpenSlot, results, known, remember }) {
  const color = accentColor(accent)
  const roles = names.map((n) => (known[n]?.best_agent ? roleOf(known[n].best_agent) : null))
  return (
    <Panel accent={color} className="p-6 relative overflow-hidden">
      <svg className="absolute -right-8 -top-10 opacity-[0.06] pointer-events-none" width="180" height="180" viewBox="0 0 180 180" aria-hidden="true">
        <circle cx="90" cy="90" r="80" stroke={color} strokeWidth="1" fill="none" />
        <circle cx="90" cy="90" r="50" stroke={color} strokeWidth="1" fill="none" />
      </svg>
      <div className="relative flex items-center gap-2 font-mono text-sm font-semibold mb-4 tracking-wide" style={{ color }}>
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        {label}
        <span className="ml-auto font-normal text-xs text-ink-faint tabular-nums">{names.filter((n) => n.trim()).length}/5</span>
      </div>
      <div className="relative mb-5">
        <RoleCoverage counts={countRoles(roles)} color={color} />
      </div>
      <div className="relative flex flex-col gap-3">
        {names.map((val, i) => {
          const key = `${label}-${i}`
          return (
            <PlayerSlot
              key={key}
              slotKey={key}
              value={val}
              placeholder={placeholders[i]}
              accent={accent}
              onChange={(v) => setNames(i, v)}
              onSelect={(p) => {
                remember(p)
                onPick(side, i, p.name)
              }}
              openSlot={openSlot}
              setOpenSlot={setOpenSlot}
              results={openSlot === key ? results : []}
              known={known}
            />
          )
        })}
      </div>
    </Panel>
  )
}

// Win probability as one split bar. Both numbers count up from zero, so the
// split visibly settles on the model's result.
function ProbabilityBar({ a, b }) {
  const pa = useCountUp(a * 100, 1000)
  const pb = useCountUp(b * 100, 1000)
  return (
    <div className="h-14 rounded-sm flex overflow-hidden" role="img" aria-label={`Lineup A ${(a * 100).toFixed(0)} percent, Lineup B ${(b * 100).toFixed(0)} percent`}>
      <div className="flex items-center justify-center font-mono text-base font-bold" style={{ width: `${pa}%`, background: 'var(--color-brand)', color: '#1a1108' }}>
        {Math.round(pa)}%
      </div>
      <div className="flex items-center justify-center font-mono text-base font-bold" style={{ width: `${pb}%`, background: 'var(--color-team-b)', color: '#062024' }}>
        {Math.round(pb)}%
      </div>
    </div>
  )
}

// Each player as a framed agent card. The art is shown whole, and the name,
// role and rating sit over a dark fade at the bottom.
function LineupResult({ lineup, accent, label }) {
  const color = accentColor(accent)
  return (
    <Panel accent={color} className="p-6 rise-in">
      <div className="font-mono text-sm font-semibold mb-4 flex items-baseline gap-2" style={{ color }}>
        {label}
        <span className="text-xs text-ink-faint font-normal">AVG RATING {lineup.avg_rating ?? '-'}</span>
      </div>
      <RoleCoverage counts={countRoles(lineup.players.map((p) => p.primary_role))} color={color} />
      <ol className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {lineup.players.map((p, i) => {
          const roleColor = ROLE_COLOR[p.primary_role] || 'var(--color-ink-faint)'
          return (
            <li key={p.name} className="rise-in relative aspect-[3/4] overflow-hidden cut-corner-tag border border-line bg-panel-raised" style={{ animationDelay: `${i * 70}ms` }}>
              {p.best_agent ? (
                <>
                  <AgentImage agent={p.best_agent} className="absolute inset-0 w-full h-full scale-110 blur-xl opacity-40" />
                  <AgentImage agent={p.best_agent} fit="contain" className="absolute inset-0 w-full h-full" />
                </>
              ) : null}
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to top, rgba(10,10,13,0.95) 0%, rgba(10,10,13,0.2) 45%, transparent)' }} aria-hidden="true" />
              <span className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color }} aria-hidden="true" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-semibold truncate">{p.name}</span>
                  <span className="font-mono text-xs font-semibold tabular-nums shrink-0" style={{ color }}>{p.rating ?? '-'}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-mono" style={{ color: roleColor }}>
                  <RoleGlyph role={p.primary_role} style={{ color: roleColor }} />
                  <span className="truncate capitalize">{p.primary_agent || p.best_agent || '?'}</span>
                  {p.low_sample && <span className="ml-auto shrink-0 text-[10px] uppercase" style={{ color: 'var(--color-brand)' }}>low sample</span>}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
      {lineup.missing_roles.length > 0 && <div className="text-xs text-ink-faint mt-3">No dedicated {lineup.missing_roles.join('/')}</div>}
    </Panel>
  )
}

// Every player's rating on one shared scale, so the two lineups can be read
// against each other without the scale changing between them.
function RatingProfile({ resultA, resultB }) {
  const all = [...resultA.players, ...resultB.players].map((p) => p.rating).filter((r) => typeof r === 'number')
  const max = all.length ? Math.max(...all) : 0
  const columns = [
    { label: 'Lineup A', lineup: resultA, color: 'var(--color-brand)' },
    { label: 'Lineup B', lineup: resultB, color: 'var(--color-team-b)' },
  ]
  return (
    <Panel className="p-6 rise-in" style={{ animationDelay: '160ms' }}>
      <SectionHeader>Rating profile</SectionHeader>
      <Label className="mb-5">Both lineups share one scale</Label>
      <div className="grid md:grid-cols-2 gap-6">
        {columns.map(({ label, lineup, color }) => (
          <div key={label} className="flex flex-col gap-3 min-w-0">
            <div className="font-mono text-xs" style={{ color }}>{label}</div>
            {lineup.players.map((p, i) => {
              const share = max && typeof p.rating === 'number' ? (p.rating / max) * 100 : 0
              return (
                <div key={p.name} className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-ink-dim w-24 truncate shrink-0">{p.name}</span>
                  <div className="flex-1 h-2 bg-line-soft overflow-hidden" aria-hidden="true">
                    <div className="grow-x h-full" style={{ width: `${share}%`, background: color, animationDelay: `${200 + i * 70}ms` }} />
                  </div>
                  <span className="font-mono text-xs tabular-nums w-10 text-right shrink-0" style={{ color }}>{p.rating ?? '-'}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </Panel>
  )
}

export default function LegacyBuilder() {
  // Both lineups and their undo history live in one state object, so a pick,
  // a swap or a sample is one step that can be undone.
  const [board, setBoard] = useState({ a: EMPTY, b: EMPTY, past: [] })
  const [openSlot, setOpenSlotKey] = useState(null)
  const [results, setResults] = useState([])
  const [known, setKnown] = useState({})
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)

  function setOpenSlot(key, list = []) {
    setOpenSlotKey(key)
    setResults(list)
  }

  // Typing edits a slot without an undo step, so each keystroke is not a
  // separate entry in the history.
  function setName(side, index, value) {
    setBoard((prev) => ({ ...prev, [side]: prev[side].map((n, i) => (i === index ? value : n)) }))
  }

  // A pick, sample, clear or swap is one undoable step.
  function commit(next) {
    setBoard((prev) => ({
      a: next.a ?? prev.a,
      b: next.b ?? prev.b,
      past: [...prev.past.slice(-(HISTORY_LIMIT - 1)), { a: prev.a, b: prev.b }],
    }))
  }

  function pick(side, index, name) {
    setBoard((prev) => ({
      ...prev,
      [side]: prev[side].map((n, i) => (i === index ? name : n)),
      past: [...prev.past.slice(-(HISTORY_LIMIT - 1)), { a: prev.a, b: prev.b }],
    }))
  }

  function undo() {
    setBoard((prev) => {
      const last = prev.past[prev.past.length - 1]
      if (!last) return prev
      return { a: last.a, b: last.b, past: prev.past.slice(0, -1) }
    })
  }

  // Remember what a picked player looks like, so the slot can keep showing
  // their team and best agent after the dropdown closes.
  function remember(p) {
    setKnown((prev) => ({ ...prev, [p.name]: { team: p.team, best_agent: p.best_agent } }))
  }

  // Close the open dropdown when clicking anywhere outside a slot.
  useEffect(() => {
    function onDocClick(e) {
      if (!e.target.closest('[data-player-slot]')) setOpenSlot(null, [])
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  // Ctrl+Z undoes the last lineup change, unless the user is typing in a slot.
  useEffect(() => {
    function onKey(e) {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      e.preventDefault()
      undo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function onSimulate() {
    const resolvedA = board.a.map((v, i) => (v.trim() ? v.trim() : DEFAULTS_A[i]))
    const resolvedB = board.b.map((v, i) => (v.trim() ? v.trim() : DEFAULTS_B[i]))
    setStatus('simulating…')
    setResult(null)
    try {
      const data = await simulateRoster(resolvedA, resolvedB)
      setStatus('live projection')
      setResult(data)
    } catch (e) {
      // Network failure (server not running) throws a TypeError; a timed-out
      // AbortSignal throws a DOMException named 'TimeoutError'/'AbortError'
      // with an unhelpful technical message — both mean "couldn't reach a
      // live backend," not "the backend rejected this request" (that case
      // is a real Error with a meaningful .message, thrown in api.js from
      // the response body's `detail`, e.g. "player(s) not found...").
      const unreachable = e instanceof TypeError || e.name === 'TimeoutError' || e.name === 'AbortError'
      setStatus(
        unreachable
          ? 'Backend not reachable. The roster builder needs a live connection, because player combinations are too numerous to bundle as demo data. Start the API and try again.'
          : `Backend error: ${e.message}`
      )
    }
  }

  return (
    <div className="fade-up" data-player-slot>
      <Panel className="p-7 mb-7 relative overflow-hidden rise-in">
        <svg className="absolute -right-16 -top-16 opacity-[0.06] pointer-events-none" width="260" height="260" viewBox="0 0 260 260" aria-hidden="true">
          <circle cx="130" cy="130" r="120" stroke="var(--color-brand)" strokeWidth="1" fill="none" />
          <circle cx="130" cy="130" r="80" stroke="var(--color-brand)" strokeWidth="1" fill="none" />
          <circle cx="130" cy="130" r="40" stroke="var(--color-brand)" strokeWidth="1" fill="none" />
        </svg>
        <DotsDeco className="absolute left-6 bottom-5 text-ink-faint opacity-30 pointer-events-none" />
        <Label tone="brand" className="relative mb-3">Legacy builder</Label>
        <h1 className="relative flex items-center gap-3 font-display text-3xl md:text-4xl font-bold mb-3">
          Legacy Roster Builder
          <CrosshairDeco size={32} className="text-team-b opacity-50" />
        </h1>
        <p className="relative text-sm text-ink-dim max-w-2xl leading-relaxed">
          Build two hypothetical 5-player lineups from any players in the loaded data and see a model projection of the
          matchup. This is not a prediction of a real result. Each projection lists the caveats below it, so you can see
          exactly what is and is not accounted for.
        </p>
        <div className="relative flex flex-wrap gap-2 mt-5">
          <Button variant="secondary" className="min-h-[40px] text-xs" onClick={() => commit({ a: DEFAULTS_A, b: DEFAULTS_B })}>
            Load sample lineups
          </Button>
          <Button variant="ghost" className="min-h-[40px] text-xs" onClick={() => commit({ a: EMPTY, b: EMPTY })}>
            Clear both
          </Button>
          <Button variant="ghost" className="min-h-[40px] text-xs" onClick={() => commit({ a: board.b, b: board.a })}>
            Swap sides
          </Button>
          <Button variant="ghost" className="min-h-[40px] text-xs" onClick={undo} disabled={board.past.length === 0}>
            Undo{board.past.length ? ` (${board.past.length})` : ''}
          </Button>
          <span className="hidden sm:inline-flex items-center font-mono text-[11px] text-ink-faint ml-auto">Ctrl Z to undo</span>
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 gap-6 mb-7 relative">
        <LineupColumn
          label="LINEUP A"
          accent="brand"
          side="a"
          names={board.a}
          setNames={(i, v) => setName('a', i, v)}
          onPick={pick}
          placeholders={DEFAULTS_A}
          openSlot={openSlot}
          setOpenSlot={setOpenSlot}
          results={results}
          known={known}
          remember={remember}
        />
        <LineupColumn
          label="LINEUP B"
          accent="team-b"
          side="b"
          names={board.b}
          setNames={(i, v) => setName('b', i, v)}
          onPick={pick}
          placeholders={DEFAULTS_B}
          openSlot={openSlot}
          setOpenSlot={setOpenSlot}
          results={results}
          known={known}
          remember={remember}
        />
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-bg border border-line items-center justify-center pointer-events-none z-10">
          <VersusIcon className="text-ink-faint" size={20} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 mb-8">
        <Button variant="primary" onClick={onSimulate} className="px-8 py-3.5 text-base">
          Simulate matchup
        </Button>
        <div className="font-mono text-xs text-ink-faint min-h-[1.2em]" aria-live="polite">{status}</div>
      </div>

      {result && (
        <>
          <Panel accent="var(--color-brand)" className="p-6 mb-6 rise-in">
            <div className="font-mono text-sm text-brand mb-3.5 font-semibold">{result.label}</div>
            <ProbabilityBar a={result.win_probability_a} b={result.win_probability_b} />
          </Panel>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <LineupResult lineup={result.lineup_a} accent="brand" label="LINEUP A" />
            <LineupResult lineup={result.lineup_b} accent="team-b" label="LINEUP B" />
          </div>
          <RatingProfile resultA={result.lineup_a} resultB={result.lineup_b} />
          <Panel className="p-5 mt-6 rise-in" style={{ animationDelay: '220ms' }}>
            <div className="font-mono text-xs text-ink-faint mb-2.5 font-semibold">WHAT THIS DOESN'T ACCOUNT FOR</div>
            {result.caveats.map((c, i) => (
              <p key={i} className="text-sm text-ink-dim mb-2 leading-relaxed">· {c}</p>
            ))}
          </Panel>
        </>
      )}
    </div>
  )
}
