// Original geometric silhouette — deliberately not a real photo (see
// README.md: no reproduced likenesses without a legally-checked
// source, and this dataset doesn't ship any). Every player gets the same
// shape, colored by which team/side they're on.
export default function PlayerPortrait({ color = 'var(--color-ink-faint)', size = 40, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={`shrink-0 ${className}`}>
      <polygon points="22,1 41,11.5 41,32.5 22,43 3,32.5 3,11.5" fill="var(--color-panel-raised)" stroke={color} strokeWidth="1.2" />
      <circle cx="22" cy="17" r="7" fill={color} opacity="0.85" />
      <path d="M9 38c2-8 8-11 13-11s11 3 13 11" fill={color} opacity="0.85" />
    </svg>
  )
}
