import { useEffect, useRef, useState } from 'react'
import { searchPlayers, simulateRoster } from '../lib/api'
import { ROLE_COLOR } from '../lib/roles'
import { CrosshairDeco, RoleGlyph } from '../components/icons'
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
        className="w-full bg-panel-raised border border-line text-ink text-sm rounded-sm py-2.5 px-3 font-mono focus:outline-none focus:border-brand/50"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+3px)] z-30 bg-panel-raised border border-line shadow-2xl max-h-56 overflow-y-auto">
          {results.map((p) => (
            <div
              key={p.name}
              onMouseDown={(e) => {
                e.preventDefault()
                onSelect(p.name)
                setOpenSlot(null, [])
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 border-b border-line-soft last:border-none hover:bg-panel cursor-pointer"
            >
              <TeamBadge name={p.team || 'Unknown'} accent={accent} size={24} />
              <PlayerPortrait color={color} size={22} />
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">{p.name}</div>
                <div className="text-[10px] text-ink-faint truncate">{p.team || 'Unknown team'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LineupColumn({ label, accent, names, setNames, placeholders, openSlot, setOpenSlot, results }) {
  return (
    <Panel className="p-4 relative">
      <div className="font-mono text-[11px] mb-3" style={{ color: accent === 'brand' ? 'var(--color-brand)' : 'var(--color-team-b)' }}>
        {label}
      </div>
      <div className="flex flex-col gap-2">
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
    <Panel className="p-4">
      <div className="font-mono text-[11px] mb-2.5" style={{ color }}>
        {label} — AVG RATING {lineup.avg_rating ?? '—'}
      </div>
      {lineup.players.map((p) => (
        <div key={p.name} className="flex items-center gap-2.5 py-1.5 border-t border-line-soft first:border-t-0">
          <PlayerPortrait color={color} size={28} />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold truncate">
              {p.name}
              {p.low_sample && <span className="text-[10px] ml-1.5" style={{ color: 'var(--color-brand)' }}>low sample</span>}
            </div>
            <div className="text-[11px] text-ink-faint truncate">{p.team || '—'}</div>
          </div>
          <span
            className="inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] shrink-0"
            style={{ color: ROLE_COLOR[p.primary_role] || 'var(--color-ink-faint)', borderColor: `${ROLE_COLOR[p.primary_role] || 'var(--color-ink-faint)'}33` }}
          >
            <RoleGlyph role={p.primary_role} style={{ color: ROLE_COLOR[p.primary_role] || 'var(--color-ink-faint)' }} />
            {p.primary_agent || '?'}
          </span>
          <span className="font-mono text-xs w-9 text-right shrink-0" style={{ color }}>
            {p.rating ?? '—'}
          </span>
        </div>
      ))}
      {lineup.missing_roles.length > 0 && (
        <div className="text-[11px] text-ink-faint mt-2.5">No dedicated {lineup.missing_roles.join('/')}</div>
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
      <div className="flex items-center gap-2 font-display text-xl font-semibold mb-3">
        Legacy Roster Builder
        <CrosshairDeco className="text-team-b opacity-45" />
      </div>
      <p className="text-[13px] text-ink-dim mb-5 max-w-2xl">
        Build two hypothetical 5-player lineups from any players in the loaded data and see a model
        projection of the matchup. This is not a prediction of a real result — see the caveats below every
        projection for exactly what is and isn't accounted for.
      </p>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
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
      </div>

      <button
        onClick={onSimulate}
        className="font-mono text-brand border border-brand-line bg-brand-dim px-5 py-2.5 text-sm rounded-sm mb-2 hover:brightness-110 transition"
      >
        Simulate matchup
      </button>
      <div className="font-mono text-[11px] text-ink-faint mb-4 min-h-[1.2em]">{status}</div>

      {result && (
        <>
          <Panel accent="var(--color-brand)" className="p-5 mb-4">
            <div className="font-mono text-[11px] text-brand mb-2.5">{result.label}</div>
            <div className="h-7 rounded-sm flex overflow-hidden">
              <div
                className="flex items-center justify-center font-mono text-xs font-semibold transition-[width] duration-500"
                style={{ width: `${result.win_probability_a * 100}%`, background: 'var(--color-brand)', color: '#1a1108' }}
              >
                {(result.win_probability_a * 100).toFixed(0)}%
              </div>
              <div
                className="flex items-center justify-center font-mono text-xs font-semibold transition-[width] duration-500"
                style={{ width: `${result.win_probability_b * 100}%`, background: 'var(--color-team-b)', color: '#062024' }}
              >
                {(result.win_probability_b * 100).toFixed(0)}%
              </div>
            </div>
          </Panel>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <LineupResult lineup={result.lineup_a} accent="brand" label="LINEUP A" />
            <LineupResult lineup={result.lineup_b} accent="team-b" label="LINEUP B" />
          </div>
          <Panel className="p-4">
            <div className="font-mono text-[10px] text-ink-faint mb-2">WHAT THIS DOESN'T ACCOUNT FOR</div>
            {result.caveats.map((c, i) => (
              <p key={i} className="text-xs text-ink-dim mb-1.5 leading-relaxed">· {c}</p>
            ))}
          </Panel>
        </>
      )}
    </div>
  )
}
