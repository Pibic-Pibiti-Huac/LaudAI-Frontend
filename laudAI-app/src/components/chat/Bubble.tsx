import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import type { Message } from '../../types'
import type { Theme } from '../../theme/theme'
import { FeedbackContent } from './FeedbackContent'

const isLaudoMessage = (content: string) => {
  const firstBlock = content.split(/\n\n+/).filter(Boolean)[0] ?? ''
  return /^\*\*Nota:\s*\d+\/\d+\*\*/.test(firstBlock)
}

const headingClasses = {
  1: { fontSize: 22, fontWeight: 700, margin: '16px 0 8px', lineHeight: 1.3 },
  2: { fontSize: 19, fontWeight: 700, margin: '14px 0 6px', lineHeight: 1.35 },
  3: { fontSize: 17, fontWeight: 600, margin: '12px 0 6px', lineHeight: 1.4 },
  4: { fontSize: 15, fontWeight: 600, margin: '10px 0 4px', lineHeight: 1.4 },
  5: { fontSize: 15, fontWeight: 600, margin: '8px 0 4px', lineHeight: 1.4 },
  6: { fontSize: 15, fontWeight: 600, margin: '8px 0 4px', lineHeight: 1.4, color: '#656d76' },
}

const MarkdownContent = ({ content, t }: { content: string; t: Theme }) => {
  const components: Components = {
    h1: ({ children, ...props }) => {
      const h1 = headingClasses[1]
      return <h1 style={{ ...h1, color: t.text }} {...props}>{children}</h1>
    },
    h2: ({ children, ...props }) => {
      const h2 = headingClasses[2]
      return <h2 style={{ ...h2, color: t.text }} {...props}>{children}</h2>
    },
    h3: ({ children, ...props }) => {
      const h3 = headingClasses[3]
      return <h3 style={{ ...h3, color: t.text }} {...props}>{children}</h3>
    },
    h4: ({ children, ...props }) => {
      const h4 = headingClasses[4]
      return <h4 style={{ ...h4, color: t.text }} {...props}>{children}</h4>
    },
    h5: ({ children, ...props }) => {
      const h5 = headingClasses[5]
      return <h5 style={{ ...h5, color: t.text }} {...props}>{children}</h5>
    },
    h6: ({ children, ...props }) => {
      const h6 = headingClasses[6]
      return <h6 style={{ ...h6 }} {...props}>{children}</h6>
    },
    p: ({ children, ...props }) => (
      <p style={{ margin: '0 0 10px', lineHeight: 1.65 }} {...props}>{children}</p>
    ),
    strong: ({ children, ...props }) => (
      <strong style={{ fontWeight: 700 }} {...props}>{children}</strong>
    ),
    em: ({ children, ...props }) => (
      <em style={{ fontStyle: 'italic' }} {...props}>{children}</em>
    ),
    ul: ({ children, ...props }) => (
      <ul style={{ paddingLeft: 22, margin: '0 0 10px', listStyleType: 'disc' }} {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }) => (
      <ol style={{ paddingLeft: 22, margin: '0 0 10px', listStyleType: 'decimal' }} {...props}>{children}</ol>
    ),
    li: ({ children, ...props }) => (
      <li style={{ marginBottom: 4, lineHeight: 1.6 }} {...props}>{children}</li>
    ),
    code: ({ children, ...props }) => (
      <code
        style={{
          background: t.border, padding: '2px 5px', borderRadius: 4,
          fontSize: 15, fontFamily: 'ui-monospace, monospace',
        }}
        {...props}
      >{children}</code>
    ),
    pre: ({ children, ...props }) => (
      <pre
        style={{
          background: t.border, padding: 12, borderRadius: 8,
          overflowX: 'auto', fontSize: 15, lineHeight: 1.5,
          margin: '0 0 10px', fontFamily: 'ui-monospace, monospace',
        }}
        {...props}
      >{children}</pre>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        style={{
          borderLeft: `4px solid ${t.primary}`,
          padding: '4px 12px', margin: '0 0 10px',
          color: t.textSub, background: t.primaryLight,
          borderRadius: '0 6px 6px 0',
        }}
        {...props}
      >{children}</blockquote>
    ),
    hr: ({ ...props }) => (
      <hr style={{ border: 'none', borderTop: `1px solid ${t.border}`, margin: '16px 0' }} {...props} />
    ),
    a: ({ children, href, ...props }) => (
      <a href={href} style={{ color: t.primary, textDecoration: 'underline' }} {...props}>{children}</a>
    ),
    table: ({ children, ...props }) => (
      <div style={{ overflowX: 'auto', marginBottom: 10 }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 14, width: '100%' }} {...props}>{children}</table>
      </div>
    ),
    th: ({ children, ...props }) => (
      <th style={{ border: `1px solid ${t.border}`, padding: '6px 10px', fontWeight: 600, background: t.surface, textAlign: 'left' }} {...props}>{children}</th>
    ),
    td: ({ children, ...props }) => (
      <td style={{ border: `1px solid ${t.border}`, padding: '6px 10px' }} {...props}>{children}</td>
    ),
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}

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
          fontSize: 16,
          lineHeight: 1.65,
        }}
      >
        {isUser ? (
          msg.content
        ) : isLaudoMessage(msg.content) ? (
          <FeedbackContent content={msg.content} t={t} />
        ) : (
          <MarkdownContent content={msg.content} t={t} />
        )}
        <div style={{ marginTop: 5, fontSize: 12, color: t.textMuted, textAlign: isUser ? 'right' : 'left' }}>
          {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}