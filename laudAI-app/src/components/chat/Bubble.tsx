import type { Message } from '../../types'
import type { Theme } from '../../theme/theme'
import { FeedbackContent } from './FeedbackContent'

export const Bubble = ({ msg, t }: { msg: Message; t: Theme }) => {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', gap: 8, flexDirection: isUser ? 'row-reverse' : 'row', marginBottom: 20 }}>
      <div
        style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: isUser ? t.primaryLight : t.primary,
          border: `1px solid ${isUser ? t.primaryBorder : 'transparent'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isUser ? t.primary : '#fff',
          fontSize: 12, fontWeight: 700, marginTop: 2,
        }}
      >
        {isUser ? 'Dr' : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" opacity="0.5" />
            <circle cx="12" cy="12" r="3" fill="white" />
          </svg>
        )}
      </div>
      <div
        style={{
          maxWidth: '72%',
          padding: '11px 15px',
          borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          background: isUser ? t.userBubble : t.aiBubble,
          border: `1px solid ${isUser ? t.userBubbleBorder : t.aiBubbleBorder}`,
          color: t.text,
          fontSize: 14,
          lineHeight: 1.65,
        }}
      >
        {isUser ? msg.content : <FeedbackContent content={msg.content} t={t} />}
        <div style={{ marginTop: 5, fontSize: 11, color: t.textMuted, textAlign: isUser ? 'right' : 'left' }}>
          {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}
