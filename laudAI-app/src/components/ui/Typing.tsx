import type { Theme } from '../../theme/theme'

export const Typing = ({ t }: { t: Theme }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 20 }}>
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: t.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <circle cx="12" cy="12" r="3" fill="white" />
      </svg>
    </div>
    <div
      style={{
        padding: '10px 16px',
        background: t.aiBubble,
        border: `1px solid ${t.aiBubbleBorder}`,
        borderRadius: '4px 14px 14px 14px',
      }}
    >
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 18 }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: t.primary,
              display: 'inline-block',
              animation: `laudai-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  </div>
)
