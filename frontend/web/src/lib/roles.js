// Role classification is general public VALORANT knowledge (not derived from
// the dataset, which has no role field) — mirrors
// backend/app/analyzers/agent_analysis.py's AGENT_ROLES exactly, so the
// frontend and the analyzer never quietly disagree about a role.
export const AGENT_ROLES = {
  jett: 'Duelist', raze: 'Duelist', reyna: 'Duelist', phoenix: 'Duelist', waylay: 'Duelist',
  yoru: 'Duelist', neon: 'Duelist', iso: 'Duelist',
  brimstone: 'Controller', omen: 'Controller', viper: 'Controller',
  astra: 'Controller', harbor: 'Controller', clove: 'Controller',
  sova: 'Initiator', breach: 'Initiator', skye: 'Initiator', kayo: 'Initiator',
  fade: 'Initiator', gekko: 'Initiator', tejo: 'Initiator',
  killjoy: 'Sentinel', cypher: 'Sentinel', sage: 'Sentinel',
  chamber: 'Sentinel', deadlock: 'Sentinel', vyse: 'Sentinel',
}

export const ROLE_COLOR = {
  Duelist: 'var(--color-brand)',
  Controller: 'var(--color-team-b)',
  Initiator: '#b79cf2',
  Sentinel: '#f2c14e',
  Unknown: 'var(--color-ink-faint)',
}

export function roleOf(agent) {
  return AGENT_ROLES[agent] || 'Unknown'
}
