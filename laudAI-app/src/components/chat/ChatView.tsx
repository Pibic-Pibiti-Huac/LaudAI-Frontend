import { useState, useRef, useEffect, useCallback } from 'react'
import type { Conversation, Message } from '../../types'
import type { Theme } from '../../theme/theme'
import { genId } from '../../utils/helpers'
import { Ico, ICONS } from '../ui/Icons'
import { Typing } from '../ui/Typing'
import { Bubble } from './Bubble'
import { sendChatMessageStream, sendCorrectReportStream } from '../../routes/model_routes'

const CORRECT_SUGGESTION = 'Gere o laudo corrigido'
const SUGGESTED = [CORRECT_SUGGESTION, 'Revise a conclusão do laudo', 'Sugira terminologia mais precisa', 'O laudo está completo?', 'Reescreva em linguagem padronizada']

interface ChatViewProps {
  conv: Conversation
  t: Theme
  laudoText: string
  token: string
  onUpdateConv: (conv: Conversation) => void
  isAnalyzingLaudo?: boolean
}

export const ChatView = ({ conv, t, laudoText, token, onUpdateConv, isAnalyzingLaudo }: ChatViewProps) => {
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [streamingContent, setStreamingContent] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [conv.messages, typing, streamingContent])

  const send = useCallback(async (text: string) => {
    if (!text.trim() || typing || streamingContent !== null) return
    const userMsg: Message = { id: genId(), role: 'user', content: text.trim(), timestamp: Date.now() }
    const updated = { ...conv, messages: [...conv.messages, userMsg], updatedAt: Date.now() }
    onUpdateConv(updated)
    setInput('')
    setTyping(true)

    try {
      const history = conv.messages.map(m => ({ role: m.role, content: m.content }))
      let accumulated = ''

      const stream = text.trim() === CORRECT_SUGGESTION
        ? sendCorrectReportStream(
            { role: 'assistant', laudo_text: laudoText, evaluation: conv.evaluation ?? null },
            token,
          )
        : sendChatMessageStream(
            { role: 'assistant', prompt: text.trim(), history, laudo_text: laudoText },
            token,
          )

      for await (const tok of stream) {
        if (typing) setTyping(false)
        accumulated += tok
        setStreamingContent(accumulated)
      }

      const aiMsg: Message = {
        id: genId(),
        role: 'assistant',
        content: accumulated,
        timestamp: Date.now(),
      }
      onUpdateConv({ ...updated, messages: [...updated.messages, aiMsg], updatedAt: Date.now() })
    } catch {
      const errorMsg: Message = {
        id: genId(),
        role: 'assistant',
        content: 'Não foi possível obter resposta agora. Tente novamente.',
        timestamp: Date.now(),
      }
      onUpdateConv({ ...updated, messages: [...updated.messages, errorMsg], updatedAt: Date.now() })
    } finally {
      setTyping(false)
      setStreamingContent(null)
    }
  }, [conv, typing, streamingContent, laudoText, token, onUpdateConv])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div
        style={{
          padding: '10px 24px', borderBottom: `1px solid ${t.border}`,
          background: t.surface, flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <span style={{ color: t.primary }}><Ico d={ICONS.file} size={16} /></span>
        <span style={{ color: t.textSub, fontSize: 13, fontWeight: 500 }}>{conv.fileName ?? 'Texto colado'}</span>
        <span style={{ marginLeft: 'auto', color: t.textMuted, fontSize: 11 }}>
          {conv.messages.length} mensagen{conv.messages.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 24px 8px' }}>
        {isAnalyzingLaudo && conv.messages.length === 0 ? (
          <Typing t={t} />
        ) : (
          conv.messages.map(msg => <Bubble key={msg.id} msg={msg} t={t} />)
        )}
        {streamingContent !== null && (
          <Bubble msg={{ id: 'streaming', role: 'assistant', content: streamingContent, timestamp: Date.now() }} t={t} />
        )}
        {typing && streamingContent === null && <Typing t={t} />}
        <div ref={endRef} />
      </div>

      {!isAnalyzingLaudo && conv.messages.length <= 1 && (
        <div style={{ padding: '0 24px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUGGESTED.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              style={{
                padding: '6px 12px', borderRadius: 20, border: `1px solid ${t.primaryBorder}`,
                background: t.primaryLight, color: t.primary, fontSize: 13,
                cursor: 'pointer', transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: '12px 20px 20px', borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
        <div
          style={{
            display: 'flex', gap: 10, alignItems: 'flex-end',
            background: t.inputBg, border: `1px solid ${t.border}`,
            borderRadius: 16, padding: '10px 12px',
            transition: 'border-color 0.2s',
          }}
          onFocusCapture={(e) => { e.currentTarget.style.borderColor = t.primary }}
          onBlurCapture={(e) => { e.currentTarget.style.borderColor = t.border }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Pergunte sobre o laudo, peça revisão ou sugestões..."
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              resize: 'none', color: t.text, fontSize: 16, lineHeight: 1.6,
              fontFamily: 'system-ui, sans-serif', maxHeight: 120, overflowY: 'auto',
            }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || typing || streamingContent !== null}
            style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              background: input.trim() && !typing && streamingContent === null ? t.primary : t.border,
              color: input.trim() && !typing && streamingContent === null ? '#fff' : t.textMuted,
              cursor: input.trim() && !typing && streamingContent === null ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.2s',
            }}
          >
            <Ico d={ICONS.send} size={16} />
          </button>
        </div>
        <p style={{ color: t.textMuted, fontSize: 11, textAlign: 'center', marginTop: 8, marginBottom: 0 }}>
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  )
}