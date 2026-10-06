import { useState } from 'react'
import { RoleGlyph } from './icons'
import { roleOf, ROLE_COLOR } from '../lib/roles'

// Original stylized agent art (not real Riot character art — see
// frontend/web/README.md) at public/assets/agents/<agent>.jpg. Falls back
// to the role-colored RoleGlyph icon if a file is missing (e.g. an agent
// added to the game after this asset pack was made).
// `fit` is 'cover' (crops to fill, the default) or 'contain' (the whole
// image, letterboxed inside the box).
export default function AgentImage({ agent, className = '', fit = 'cover' }) {
  const [failed, setFailed] = useState(false)
  const [trackedAgent, setTrackedAgent] = useState(agent)
  if (agent !== trackedAgent) {
    setTrackedAgent(agent)
    setFailed(false)
  }

  const role = roleOf(agent)
  const color = ROLE_COLOR[role] || ROLE_COLOR.Unknown

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-panel-raised ${className}`} style={{ color }}>
        <RoleGlyph role={role} size={16} />
      </div>
    )
  }

  return (
    <img
      src={`/assets/agents/${agent.toLowerCase()}.jpg`}
      alt={agent}
      loading="lazy"
      className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
      onError={() => setFailed(true)}
    />
  )
}
