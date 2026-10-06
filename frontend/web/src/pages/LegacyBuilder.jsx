import { useEffect, useRef, useState } from 'react'
import { searchPlayers, simulateRoster } from '../lib/api'
import { ROLE_COLOR } from '../lib/roles'
import { useCountUp } from '../lib/hooks'
import { CrosshairDeco, DotsDeco, RoleGlyph, VersusIcon } from '../components/icons'
import { Panel, Button, Label, SectionHeader } from '../components/ui'
import TeamBadge from '../components/TeamBadge'
import PlayerPortrait from '../components/PlayerPortrait'

const DEFAULTS_A = ['aspas', 'Jinggg', 'f0rsakeN', 'Chronicle', 'Boaster']
const DEFAULTS_B = ['zekken', 'Derke', 'yay', 'johnqt', 'Sayf']
const EMPTY = ['', '', '', '', '']

function accentColor(accent) {
  return accent === 'brand' ? 'var(--color-brand)' : 'var(--color-team-b)'
}

// Each slot debounces its OWN search independently (a ref map keyed by
// "prefix-index", not one shared timer) — a single shared timer would
// cancel slot 1's pending search the instant the user tabs to slot 2 and
// types there, which is the normal workflow when filling 5 lineup slots in
// a row. Only one dropdown is ever shown open at a time (via `openSlot` in
// the parent) since the dropdown floats over whatever's below it and two
// open at once would visually overlap.
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
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      choose(results[activeIndex])
    }
  }

  return (
    <div className="relative">
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
        className="w-full bg-panel-raised border border-line text-ink text-base rounded-sm py-3.5 px-4 font-mono transition-colors focus-visible:border-brand"
        style={{ borderColor: isOpen ? `color-mix(in srgb, ${color} 50%, transparent)` : undefined }}
      />
      {picked && !isOpen && (
        <div className="rise-in flex items-center gap-2 mt-1.5 text-xs text-ink-faint min-w-0" aria-hidden="true">
          <PlayerPortrait agent={picked.best_agent} color={color} size={22} />
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

function LineupColumn({ label, accent, names, setNames, placeholders, openSlot, setOpenSlot, results, known, remember }) {
  const color = accentColor(accent)
  return (
    <Panel accent={color} className="p-6 relative overflow-hidden">
      <svg className="absolute -right-8 -top-10 opacity-[0.06] pointer-events-none" width="180" height="180" viewBox="0 0 180 180" aria-hidden="true">
        <circle cx="90" cy="90" r="80" stroke={color} strokeWidth="1" fill="none" />
        <circle cx="90" cy="90" r="50" stroke={color} strokeWidth="1" fill="none" />
      </svg>
      <div className="relative flex items-center gap-2 font-mono text-sm font-semibold mb-4 tracking-wide" style={{ color }}>
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        {label}
        <span className="ml-auto font-normal text-xs text-ink-faint tabular-nums">
          {names.filter((n) => n.trim()).length}/5
        </span>
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
              onChange={(v) => setNames((prev) => prev.map((n, idx) => (idx === i ? v : n)))}
              onSelect={(p) => {
                remember(p)
                setNames((prev) => prev.map((n, idx) => (idx === i ? p.name : n)))
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
    <div className="h-11 rounded-sm flex overflow-hidden" role="img" aria-label={`Lineup A ${(a * 100).toFixed(0)} percent, Lineup B ${(b * 100).toFixed(0)} percent`}>
      <div className="flex items-center justify-center font-mono text-sm font-bold" style={{ width: `${pa}%`, background: 'var(--color-brand)', color: '#1a1108' }}>
        {Math.round(pa)}%
      </div>
      <div className="flex items-center justify-center font-mono text-sm font-bold" style={{ width: `${pb}%`, background: 'var(--color-team-b)', color: '#062024' }}>
        {Math.round(pb)}%
      </div>
    </div>
  )
}

function LineupResult({ lineup, accent, label }) {
  const color = accentColor(accent)
  return (
    <Panel accent={color} className="p-6 rise-in">
      <div className="font-mono text-sm font-semibold mb-4 flex items-baseline gap-2" style={{ color }}>
        {label}
        <span className="text-xs text-ink-faint font-normal">AVG RATING {lineup.avg_rating ?? '-'}</span>
      </div>
      {lineup.players.map((p, i) => (
        <div key={p.name} className="rise-in flex items-center gap-3.5 py-2.5 border-t border-line-soft first:border-t-0" style={{ animationDelay: `${i * 60}ms` }}>
          <PlayerPortrait agent={p.best_agent} color={color} size={50} />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold truncate">
              {p.name}
              {p.low_sample && <span className="text-[10px] ml-1.5" style={{ color: 'var(--color-brand)' }}>low sample</span>}
            </div>
            <div className="text-xs text-ink-faint truncate mt-0.5">{p.team || '-'}</div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs shrink-0"
            style={{ color: ROLE_COLOR[p.primary_role] || 'var(--color-ink-faint)', borderColor: `${ROLE_COLOR[p.primary_role] || 'var(--color-ink-faint)'}33` }}
          >
            <RoleGlyph role={p.primary_role} style={{ color: ROLE_COLOR[p.primary_role] || 'var(--color-ink-faint)' }} />
            {p.primary_agent || '?'}
          </span>
          <span className="font-mono text-sm w-11 text-right shrink-0 font-semibold" style={{ color }}>
            {p.rating ?? '-'}
          </span>
        </div>
      ))}
      {lineup.missing_roles.length > 0 && (
        <div className="text-xs text-ink-faint mt-3">No dedicated {lineup.missing_roles.join('/')}</div>
      )}
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
  const [namesA, setNamesA] = useState(EMPTY)
  const [namesB, setNamesB] = useState(EMPTY)
  const [openSlot, setOpenSlotKey] = useState(null)
  const [results, setResults] = useState([])
  const [known, setKnown] = useState({})
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)

  function setOpenSlot(key, list = []) {
    setOpenSlotKey(key)
    setResults(list)
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

  function swapSides() {
    setNamesA(namesB)
    setNamesB(namesA)
  }

  async function onSimulate() {
    const resolvedA = namesA.map((v, i) => (v.trim() ? v.trim() : DEFAULTS_A[i]))
    const resolvedB = namesB.map((v, i) => (v.trim() ? v.trim() : DEFAULTS_B[i]))
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
        <div className="relative flex items-center gap-3 font-display text-2xl sm:text-3xl font-bold mb-3">
          Legacy Roster Builder
          <CrosshairDeco size={32} className="text-team-b opacity-50" />
        </div>
        <p className="relative text-sm text-ink-dim max-w-2xl leading-relaxed">
          Build two hypothetical 5-player lineups from any players in the loaded data and see a model
          projection of the matchup. This is not a prediction of a real result. Each projection lists the
          caveats below it, so you can see exactly what is and is not accounted for.
        </p>
        <div className="relative flex flex-wrap gap-2 mt-5">
          <Button variant="secondary" className="min-h-[40px] text-xs" onClick={() => { setNamesA(DEFAULTS_A); setNamesB(DEFAULTS_B) }}>
            Load sample lineups
          </Button>
          <Button variant="ghost" className="min-h-[40px] text-xs" onClick={() => { setNamesA(EMPTY); setNamesB(EMPTY) }}>
            Clear both
          </Button>
          <Button variant="ghost" className="min-h-[40px] text-xs" onClick={swapSides}>
            Swap sides
          </Button>
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 gap-6 mb-7 relative">
        <LineupColumn
          label="LINEUP A"
          accent="brand"
          names={namesA}
          setNames={setNamesA}
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
          names={namesB}
          setNames={setNamesB}
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
