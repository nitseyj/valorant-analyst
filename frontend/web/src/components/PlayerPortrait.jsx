import { useState } from 'react'

// A player's profile icon shows their historically best-performing agent
// (highest average rating on a well-sampled agent — see
// backend/app/analyzers/agent_analysis.py's best_agents_for_players) as a
// circular portrait, ringed in whatever team/context color is passed in.
// This is original stylized agent art, not a real player photo (see
// README.md — no reproduced likenesses, this dataset doesn't ship any).
// Falls back to the original abstract silhouette when no agent is known
// yet, or the image fails to load (e.g. an agent added after this asset
// pack was made).
export default function PlayerPortrait({ agent = null, color = 'var(--color-ink-faint)', size = 40, className = '' }) {
  const [failed, setFailed] = useState(false)
  const [trackedAgent, setTrackedAgent] = useState(agent)
  if (agent !== trackedAgent) {
    setTrackedAgent(agent)
    setFailed(false)
  }

  if (agent && !failed) {
    return (
      <span
        style={{ width: size, height: size, borderColor: color }}
        className={`inline-block shrink-0 rounded-full border-2 overflow-hidden bg-panel-raised ${className}`}
      >
        <img
          src={`/assets/agents/profiles/${agent.toLowerCase()}.jpg`}
          alt={agent}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      </span>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={`shrink-0 ${className}`}>
      <polygon points="22,1 41,11.5 41,32.5 22,43 3,32.5 3,11.5" fill="var(--color-panel-raised)" stroke={color} strokeWidth="1.2" />
      <circle cx="22" cy="17" r="7" fill={color} opacity="0.85" />
      <path d="M9 38c2-8 8-11 13-11s11 3 13 11" fill={color} opacity="0.85" />
    </svg>
  )
}
