import { useEffect, useState } from 'react'
import { listTeams } from '../lib/api'
import { SectionHeader, EmptyState, LoadingState } from '../components/ui'
import TeamBadge from '../components/TeamBadge'

export default function Teams({ onOpenTeam }) {
  const [teams, setTeams] = useState(null)

  useEffect(() => {
    listTeams().then(({ teams }) => setTeams(teams))
  }, [])

  return (
    <div className="fade-up">
      <SectionHeader className="text-xl">Browse teams</SectionHeader>
      <p className="text-[13px] text-ink-dim mb-5">Every team with loaded match data. Click one for its full season profile.</p>
      {teams === null && <LoadingState>loading teams…</LoadingState>}
      {teams && teams.length === 0 && <EmptyState>No teams loaded.</EmptyState>}
      {teams && teams.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
          {teams.map((t) => (
            <button
              key={t.team_id}
              onClick={() => onOpenTeam(t.team_id)}
              title={t.name}
              className="flex flex-col items-center gap-1.5 group"
            >
              <span className="group-hover:-translate-y-0.5 transition-transform">
                <TeamBadge name={t.name} accent="team-b" size={56} />
              </span>
              <div className="font-mono text-[10px] text-ink-dim text-center truncate max-w-full">{t.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
