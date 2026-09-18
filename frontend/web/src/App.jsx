import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Teams from './pages/Teams'
import TeamProfile from './pages/TeamProfile'
import Matches from './pages/Matches'
import MatchVerdict from './pages/MatchVerdict'
import Players from './pages/Players'
import Analytics from './pages/Analytics'
import LegacyBuilder from './pages/LegacyBuilder'

export default function App() {
  const [view, setView] = useState('home')
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [selectedMatchId, setSelectedMatchId] = useState(null)

  function openTeam(teamId) {
    setSelectedTeamId(teamId)
    setView('team')
  }
  function openMatch(matchId) {
    setSelectedMatchId(matchId)
    setView('verdict')
  }
  function navigate(next) {
    setView(next)
  }
  function goBack() {
    setView(view === 'verdict' ? 'matches' : view === 'team' ? 'teams' : 'home')
  }

  return (
    <div className="min-h-screen bg-grid flex flex-col md:flex-row">
      <Sidebar view={view} onNavigate={navigate} onBack={goBack} />
      <main className="flex-1 min-w-0 p-5 md:p-10 max-w-[1360px] mx-auto w-full">
        {view === 'home' && <Home onOpenMatch={openMatch} onOpenTeam={openTeam} />}
        {view === 'teams' && <Teams onOpenTeam={openTeam} />}
        {view === 'team' && <TeamProfile teamId={selectedTeamId} onOpenMatch={openMatch} />}
        {view === 'matches' && <Matches onOpenMatch={openMatch} />}
        {view === 'verdict' && <MatchVerdict matchId={selectedMatchId} />}
        {view === 'players' && <Players />}
        {view === 'analytics' && <Analytics />}
        {view === 'legacy' && <LegacyBuilder />}
      </main>
    </div>
  )
}
