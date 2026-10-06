import { useEffect, useMemo, useRef, useState } from 'react'
import { listTeams, listMatches } from '../lib/api'
import { matchScoreStr } from '../lib/format'
import { SearchIcon } from './icons'

const PAGES = [
  { view: 'home', label: 'Home' },
  { view: 'teams', label: 'Teams' },
  { view: 'players', label: 'Players' },
  { view: 'matches', label: 'Matches' },
  { view: 'analytics', label: 'Analytics' },
  { view: 'legacy', label: 'Legacy Builder' },
]

const KIND_LABEL = { page: 'Page', team: 'Team', match: 'Match' }

// Mounted only while open, so every opening starts with an empty query and
// the first item highlighted. Teams and matches are searched as you type,
// after two characters.
export default function CommandPalette({ onClose, onNavigate, onOpenTeam, onOpenMatch }) {
  const [query, setQuery] = useState('')
  const [remote, setRemote] = useState({ teams: [], matches: [] })
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const q = query.trim().toLowerCase()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Escape closes the palette whichever element has focus.
  useEffect(() => {
    function onEscape(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [onClose])

  useEffect(() => {
    if (q.length < 2) return undefined
    let cancelled = false
    const t = setTimeout(async () => {
      const [{ teams }, { matches }] = await Promise.all([
        listTeams({ q }),
        listMatches({ team: query.trim(), limit: 6 }),
      ])
      if (!cancelled) setRemote({ teams: (teams || []).slice(0, 6), matches: matches || [] })
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [q, query])

  const items = useMemo(() => {
    const pages = PAGES.filter((p) => !q || p.label.toLowerCase().includes(q)).map((p) => ({
      kind: 'page',
      key: `page-${p.view}`,
      label: p.label,
      view: p.view,
    }))
    if (q.length < 2) return pages
    const teams = remote.teams.map((t) => ({ kind: 'team', key: `team-${t.team_id}`, label: t.name, id: t.team_id }))
    const matches = remote.matches.map((m) => ({
      kind: 'match',
      key: `match-${m.match_id}`,
      label: `${m.team_a} ${matchScoreStr(m)} ${m.team_b}`,
      id: m.match_id,
    }))
    return [...pages, ...teams, ...matches]
  }, [q, remote])

  const current = Math.min(active, Math.max(items.length - 1, 0))

  function run(item) {
    if (item.kind === 'page') onNavigate(item.view)
    if (item.kind === 'team') onOpenTeam(item.id)
    if (item.kind === 'match') onOpenMatch(item.id)
    onClose()
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(Math.min(current + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(Math.max(current - 1, 0))
    } else if (e.key === 'Enter' && items[current]) {
      e.preventDefault()
      run(items[current])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-sm" aria-hidden="true" onMouseDown={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Search and navigate" className="relative w-full max-w-xl cut-corner bg-panel border border-line shadow-2xl rise-in">
        <div className="flex items-center gap-3 px-4 border-b border-line-soft">
          <span className="text-ink-faint shrink-0"><SearchIcon size={16} /></span>
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={items.length > 0}
            aria-controls="palette-list"
            aria-autocomplete="list"
            aria-activedescendant={items.length ? `palette-opt-${current}` : undefined}
            aria-label="Search teams, matches and pages"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Search teams, matches, pages…"
            className="flex-1 min-w-0 bg-transparent py-4 text-sm font-mono text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <kbd className="hidden sm:inline font-mono text-[11px] text-ink-faint border border-line px-1.5 py-0.5">Esc</kbd>
        </div>
        <ul id="palette-list" role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto py-2">
          {items.map((item, i) => (
            <li
              key={item.key}
              id={`palette-opt-${i}`}
              role="option"
              aria-selected={i === current}
              onMouseDown={(e) => {
                e.preventDefault()
                run(item)
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                i === current ? 'bg-panel-raised text-ink' : 'text-ink-dim'
              }`}
            >
              <span className="truncate">{item.label}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint shrink-0">{KIND_LABEL[item.kind]}</span>
            </li>
          ))}
          {items.length === 0 && <li className="px-4 py-6 text-sm text-ink-faint">Nothing matches that yet.</li>}
        </ul>
      </div>
    </div>
  )
}
