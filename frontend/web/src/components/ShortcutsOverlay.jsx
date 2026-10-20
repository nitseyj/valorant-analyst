import { useEffect } from 'react'
import { Label, SectionHeader } from './ui'

// Kept in sync with the "Keyboard shortcuts" table in the root README by
// hand; both exist because a reader of the repo and a user of the live app
// are two different audiences who shouldn't have to find the other one.
const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], where: 'Everywhere', action: 'Open or close the command palette' },
  { keys: ['?'], where: 'Everywhere', action: 'Open or close this list' },
  { keys: ['Esc'], where: 'Palette, search dropdowns', action: 'Close the open list' },
  { keys: ['/'], where: 'Teams, Matches, Analytics', action: 'Focus the search box (not while typing)' },
  { keys: ['↑', '↓'], where: 'Matches list', action: 'Move between match cards' },
  { keys: ['←', '→'], where: 'Team profile roster timeline', action: 'Step through roster years' },
  { keys: ['↑', '↓', 'Enter'], where: 'Player search dropdowns', action: 'Move through results and pick one' },
  { keys: ['Ctrl', 'Z'], where: 'Legacy Roster Builder', action: 'Undo the last lineup change' },
]

function Key({ children }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[26px] px-1.5 py-1 font-mono text-[11px] font-semibold border border-line bg-panel-raised cut-corner-tag">
      {children}
    </kbd>
  )
}

export default function ShortcutsOverlay({ onClose }) {
  // Escape closes it from wherever focus happens to be, same as the command
  // palette. The global "?" listener in App.jsx only ever opens this; it
  // does not also need to track Escape itself.
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-sm" aria-hidden="true" onMouseDown={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="relative w-full max-w-lg cut-corner bg-panel border border-line shadow-2xl rise-in p-6"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <Label tone="brand" className="mb-1.5">Reference</Label>
            <SectionHeader as="h2" className="mb-0" id="shortcuts-title">
              Keyboard shortcuts
            </SectionHeader>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="min-h-[36px] min-w-[36px] font-mono text-sm text-ink-dim hover:text-ink border border-line cut-corner-tag"
          >
            Esc
          </button>
        </div>
        <ul className="flex flex-col divide-y divide-line-soft">
          {SHORTCUTS.map((s, i) => (
            <li key={i} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <div className="text-sm text-ink">{s.action}</div>
                <div className="font-mono text-[11px] text-ink-faint mt-0.5">{s.where}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {s.keys.map((k, j) => (
                  <span key={j} className="flex items-center gap-1">
                    {j > 0 && <span className="text-ink-faint text-xs">+</span>}
                    <Key>{k}</Key>
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
