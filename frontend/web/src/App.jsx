import { useEffect, useState, Suspense, lazy } from 'react'
import { flushSync } from 'react-dom'
import Sidebar from './components/Sidebar'
import ErrorBoundary from './components/ErrorBoundary'
import { LoadingState } from './components/ui'
import { prefersReducedMotion } from './lib/hooks'
import Home from './pages/Home'

// Crossfades the whole page between views using the browser's native View
// Transitions API, not a hand-rolled double-mount: the browser snapshots the
// old and new DOM itself, so there is no risk of a kept-around old page
// re-fetching its data or firing stale effects. flushSync forces the state
// update (and therefore the DOM change) to happen synchronously inside the
// callback, which the API needs to capture the "after" state correctly.
// Unsupported browsers (and prefers-reduced-motion) just get the plain,
// instant update underneath, since the whole thing is feature-detected.
function withViewTransition(update) {
  if (prefersReducedMotion() || typeof document.startViewTransition !== 'function') {
    update()
    return
  }
  document.startViewTransition(() => flushSync(update))
}

// Lazy: every page but Home (the landing page, loaded eagerly so the first
// paint has no extra network round trip) and the command palette (not shown
// until Ctrl+K). Splits one 474KB bundle into a per-page chunk instead of
// shipping all eight pages' code to someone who only ever opens Home.
const Teams = lazy(() => import('./pages/Teams'))
const TeamProfile = lazy(() => import('./pages/TeamProfile'))
const Matches = lazy(() => import('./pages/Matches'))
const MatchVerdict = lazy(() => import('./pages/MatchVerdict'))
const Players = lazy(() => import('./pages/Players'))
const Analytics = lazy(() => import('./pages/Analytics'))
const LegacyBuilder = lazy(() => import('./pages/LegacyBuilder'))
const CommandPalette = lazy(() => import('./components/CommandPalette'))
const ShortcutsOverlay = lazy(() => import('./components/ShortcutsOverlay'))

export default function App() {
  const [view, setView] = useState('home')
  const [history, setHistory] = useState([])
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [selectedMatchId, setSelectedMatchId] = useState(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  // Ctrl+K (or Cmd+K on Mac) opens the palette from anywhere, and "?" opens
  // the shortcuts reference. "/" is left to individual pages, which use it
  // to focus their own search box. "?" is guarded against firing while
  // typing (a search box or any text field can legitimately contain one).
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((open) => !open)
        return
      }
      if (e.key === '?') {
        const tag = e.target?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return
        e.preventDefault()
        setShortcutsOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Back walks the navigation history one step at a time, so Home > Team >
  // Match > Back lands on Team, and a second Back returns to Home.
  function openTeam(teamId) {
    withViewTransition(() => {
      setHistory((h) => [...h, view])
      setSelectedTeamId(teamId)
      setView('team')
    })
  }
  function openMatch(matchId) {
    withViewTransition(() => {
      setHistory((h) => [...h, view])
      setSelectedMatchId(matchId)
      setView('verdict')
    })
  }
  function navigate(next) {
    withViewTransition(() => {
      setHistory([])
      setView(next)
    })
  }
  function goBack() {
    const previous = history[history.length - 1] || 'home'
    withViewTransition(() => {
      setHistory((h) => h.slice(0, -1))
      setView(previous)
    })
  }

  return (
    <div className="min-h-screen bg-grid flex flex-col md:flex-row">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-brand focus:text-[#14060a] focus:px-4 focus:py-2 focus:font-mono focus:text-sm"
      >
        Skip to content
      </a>
      <Sidebar view={view} onNavigate={navigate} onBack={goBack} onShowShortcuts={() => setShortcutsOpen(true)} />
      <main id="main" tabIndex={-1} className="flex-1 min-w-0 px-5 py-7 md:px-10 md:py-9 max-w-[1360px] mx-auto w-full">
        <ErrorBoundary key={view}>
          <Suspense fallback={<LoadingState>Loading page…</LoadingState>}>
            {view === 'home' && (
              <Home
                onOpenMatch={openMatch}
                onOpenTeam={openTeam}
                onNavigate={navigate}
                onOpenPalette={() => setPaletteOpen(true)}
              />
            )}
            {view === 'teams' && <Teams onOpenTeam={openTeam} />}
            {view === 'team' && <TeamProfile teamId={selectedTeamId} onOpenMatch={openMatch} />}
            {view === 'matches' && <Matches onOpenMatch={openMatch} />}
            {view === 'verdict' && <MatchVerdict matchId={selectedMatchId} />}
            {view === 'players' && <Players />}
            {view === 'analytics' && <Analytics />}
            {view === 'legacy' && <LegacyBuilder />}
          </Suspense>
        </ErrorBoundary>
      </main>
      {paletteOpen && (
        <Suspense fallback={null}>
          <CommandPalette
            onClose={() => setPaletteOpen(false)}
            onNavigate={navigate}
            onOpenTeam={openTeam}
            onOpenMatch={openMatch}
          />
        </Suspense>
      )}
      {shortcutsOpen && (
        <Suspense fallback={null}>
          <ShortcutsOverlay onClose={() => setShortcutsOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}
