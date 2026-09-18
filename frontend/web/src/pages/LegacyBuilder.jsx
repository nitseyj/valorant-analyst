import { useEffect, useRef, useState } from 'react'
import { searchPlayers, simulateRoster } from '../lib/api'
import { ROLE_COLOR } from '../lib/roles'
import { CrosshairDeco, DotsDeco, RoleGlyph, VersusIcon } from '../components/icons'
import { Panel } from '../components/ui'
import TeamBadge from '../components/TeamBadge'
import PlayerPortrait from '../components/PlayerPortrait'

const DEFAULTS_A = ['aspas', 'Jinggg', 'f0rsakeN', 'Chronicle', 'Boaster']
const DEFAULTS_B = ['zekken', 'Derke', 'yay', 'johnqt', 'Sayf']

// Each slot debounces its OWN search independently (a ref map keyed by
// "prefix-index", not one shared timer) — a single shared timer would
// cancel slot 1's pending search the instant the user tabs to slot 2 and
// types there, which is the normal workflow when filling 5 lineup slots in
// a row. Only one dropdown is ever shown open at a time (via `openSlot` in
// the parent) since the dropdown floats over whatever's below it and two
// open at once would visually overlap.
function PlayerSlot({ slotKey, value, placeholder, accent, onChange, onSelect, openSlot, setOpenSlot, results }) {
  const timers = useRef({})
  const isOpen = openSlot === slotKey
  const color = accent === 'brand' ? 'var(--color-brand)' : 'var(--color-team-b)'

  function handleInput(e) {
    const val = e.target.value
    onChange(val)
    clearTimeout(timers.current[slotKey])
    if (!val || val.length < 2) {
      if (isOpen) setOpenSlot(null, [])
      return
    }
    timers.current[slotKey] = setTimeout(async () => {
      const players = await searchPlayers(val)
      setOpenSlot(slotKey, players)
    }, 250)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={handleInput}
        onFocus={() => results.length > 0 && setOpenSlot(slotKey, results)}
        className="w-full bg-panel-raised border border-line text-ink text-base rounded-sm py-3.5 px-4 font-mono focus:outline-none transition-colors"
        style={{ borderColor: isOpen ? `${color}80` : undefined }}
      />
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 bg-panel-raised border border-line shadow-2xl max-h-64 overflow-y-auto rounded-sm">
          {results.map((p) => (
            <div
              key={p.name}
              onMouseDown={(e) => {
                e.preventDefault()
                onSelect(p.name)
                setOpenSlot(null, [])
              }}
              className="flex items-center gap-3 px-3.5 py-2.5 border-b border-line-soft last:border-none hover:bg-panel cursor-pointer"
            >
              <TeamBadge name={p.team || 'Unknown'} accent={accent} size={30} />
              <PlayerPortrait agent={p.best_agent} color={color} size={38} />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{p.name}</div>
                <div className="text-xs text-ink-faint truncate">{p.team || 'Unknown team'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LineupColumn({ label, accent, names, setNames, placeholders, openSlot, setOpenSlot, results }) {
  const color = accent === 'brand' ? 'var(--color-brand)' : 'var(--color-team-b)'
  return (
    <Panel accent={color} className="p-6 relative overflow-hidden">
      <svg className="absolute -right-8 -top-10 opacity-[0.06] pointer-events-none" width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r="80" stroke={color} strokeWidth="1" fill="none" />
        <circle cx="90" cy="90" r="50" stroke={color} strokeWidth="1" fill="none" />
      </svg>
      <div className="relative flex items-center gap-2 font-mono text-sm font-semibold mb-4 tracking-wide" style={{ color }}>
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        {label}
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
              onSelect={(name) => setNames((prev) => prev.map((n, idx) => (idx === i ? name : n)))}
              openSlot={openSlot}
              setOpenSlot={setOpenSlot}
              results={openSlot === key ? results : []}
            />
          )
        })}
      </div>
    </Panel>
  )
}

function LineupResult({ lineup, accent, label }) {
  const color = accent === 'brand' ? 'var(--color-brand)' : 'var(--color-team-b)'
  return (
    <Panel accent={color} className="p-6">
      <div className="font-mono text-sm font-semibold mb-4 flex items-baseline gap-2" style={{ color }}>
        {label}
        <span className="text-xs text-ink-faint font-normal">AVG RATING {lineup.avg_rating ?? '—'}</span>
      </div>
      {lineup.players.map((p) => (
        <div key={p.name} className="flex items-center gap-3.5 py-2.5 border-t border-line-soft first:border-t-0">
          <PlayerPortrait agent={p.best_agent} color={color} size={50} />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold truncate">
              {p.name}
              {p.low_sample && <span className="text-[10px] ml-1.5" style={{ color: 'var(--color-brand)' }}>low sample</span>}
            </div>
            <div className="text-xs text-ink-faint truncate mt-0.5">{p.team || '—'}</div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs shrink-0"
            style={{ color: ROLE_COLOR[p.primary_role] || 'var(--color-ink-faint)', borderColor: `${ROLE_COLOR[p.primary_role] || 'var(--color-ink-faint)'}33` }}
          >
            <RoleGlyph role={p.primary_role} style={{ color: ROLE_COLOR[p.primary_role] || 'var(--color-ink-faint)' }} />
            {p.primary_agent || '?'}
          </span>
          <span className="font-mono text-sm w-11 text-right shrink-0 font-semibold" style={{ color }}>
            {p.rating ?? '—'}
          </span>
        </div>
      ))}
      {lineup.missing_roles.length > 0 && (
        <div className="text-xs text-ink-faint mt-3">No dedicated {lineup.missing_roles.join('/')}</div>
      )}
    </Panel>
  )
}

export default function LegacyBuilder() {
  const [namesA, setNamesA] = useState(['', '', '', '', ''])
  const [namesB, setNamesB] = useState(['', '', '', '', ''])
  const [openSlot, setOpenSlotKey] = useState(null)
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)

  function setOpenSlot(key, list = []) {
    setOpenSlotKey(key)
    setResults(list)
  }

  // Close the open dropdown when clicking anywhere outside a slot.
  useEffect(() => {
    function onDocClick(e) {
      if (!e.target.closest('[data-player-slot]')) setOpenSlot(null, [])
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

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
          ? 'Backend not reachable — the roster builder needs a live connection (player combinations are too numerous to bundle as demo data). Start the API and try again.'
          : `Backend error: ${e.message}`
      )
    }
  }

  return (
    <div className="fade-up" data-player-slot>
      <Panel className="p-7 mb-7 relative overflow-hidden">
        <svg className="absolute -right-16 -top-16 opacity-[0.06] pointer-events-none" width="260" height="260" viewBox="0 0 260 260">
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
          projection of the matchup. This is not a prediction of a real result — see the caveats below every
          projection for exactly what is and isn't accounted for.
        </p>
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
        />
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-bg border border-line items-center justify-center pointer-events-none z-10">
          <VersusIcon className="text-ink-faint" size={20} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 mb-8">
        <button
          onClick={onSimulate}
          className="font-mono text-brand border border-brand-line bg-brand-dim px-8 py-3.5 text-base font-semibold rounded-sm hover:brightness-110 hover:scale-[1.02] transition-all"
        >
          Simulate matchup
        </button>
        <div className="font-mono text-xs text-ink-faint min-h-[1.2em]">{status}</div>
      </div>

      {result && (
        <>
          <Panel accent="var(--color-brand)" className="p-6 mb-6">
            <div className="font-mono text-sm text-brand mb-3.5 font-semibold">{result.label}</div>
            <div className="h-11 rounded-sm flex overflow-hidden">
              <div
                className="flex items-center justify-center font-mono text-sm font-bold transition-[width] duration-500"
                style={{ width: `${result.win_probability_a * 100}%`, background: 'var(--color-brand)', color: '#1a1108' }}
              >
                {(result.win_probability_a * 100).toFixed(0)}%
              </div>
              <div
                className="flex items-center justify-center font-mono text-sm font-bold transition-[width] duration-500"
                style={{ width: `${result.win_probability_b * 100}%`, background: 'var(--color-team-b)', color: '#062024' }}
              >
                {(result.win_probability_b * 100).toFixed(0)}%
              </div>
            </div>
          </Panel>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <LineupResult lineup={result.lineup_a} accent="brand" label="LINEUP A" />
            <LineupResult lineup={result.lineup_b} accent="team-b" label="LINEUP B" />
          </div>
          <Panel className="p-5">
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
