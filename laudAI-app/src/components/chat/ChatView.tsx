import { useState, useRef, useEffect, useCallback } from 'react'
import type { Conversation, Message } from '../../types'
import type { Theme } from '../../theme/theme'
import { genId } from '../../utils/helpers'
import { Ico, ICONS } from '../ui/Icons'
import { Typing } from '../ui/Typing'
import { Bubble } from './Bubble'

const MOCK_RESPONSES = [
  "Com base no laudo fornecido, as estruturas anatômicas descritas estão dentro dos parâmetros esperados. Gostaria que eu elaborasse algum achado específico ou sugerisse uma padronização da linguagem utilizada?",
  "A terminologia radiológica está adequada. Para aprimorar, recomendo incluir a escala de densidade Hounsfield nos achados tomográficos e detalhar a extensão das alterações por segmento anatômico.",
  "Nota-se uma oportunidade de estruturar melhor a conclusão diagnóstica. Sugiro separar os achados principais dos incidentais e usar linguagem direta na impressão diagnóstica.",
  "Com relação ao parênquima pulmonar, seria recomendável especificar a distribuição — focal, multifocal ou difusa — e correlacionar com o contexto clínico. Posso redigir uma sugestão de parágrafo se desejar.",
  "O laudo está bem estruturado. Há um detalhe na lateralidade que merece atenção — verifique se a referência anatômica está consistente com a orientação padrão de imagem.",
  "Identifico que a descrição do contraste poderia ser mais detalhada. O padrão de realce (homogêneo, heterogêneo, periférico) é informação clinicamente relevante e deve constar no laudo.",
  "A conclusão está objetiva. Considere adicionar uma correlação clinico-radiológica breve, especialmente se há achados incidentais que requerem seguimento.",
]

let mockIdx = 0
const getMock = () => MOCK_RESPONSES[mockIdx++ % MOCK_RESPONSES.length]

const SUGGESTED = ['Revise a conclusão do laudo', 'Sugira terminologia mais precisa', 'O laudo está completo?', 'Reescreva em linguagem padronizada']

interface ChatViewProps {
  conv: Conversation
  t: Theme
  onUpdateConv: (conv: Conversation) => void
}

export const ChatView = ({ conv, t, onUpdateConv }: ChatViewProps) => {
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [conv.messages, typing])

  const send = useCallback((text: string) => {
    if (!text.trim() || typing) return
    const userMsg: Message = { id: genId(), role: 'user', content: text.trim(), timestamp: Date.now() }
    const updated = { ...conv, messages: [...conv.messages, userMsg], updatedAt: Date.now() }
    onUpdateConv(updated)
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      const aiMsg: Message = { id: genId(), role: 'assistant', content: getMock(), timestamp: Date.now() }
      onUpdateConv({ ...updated, messages: [...updated.messages, aiMsg], updatedAt: Date.now() })
    }, 1200 + Math.random() * 800)
  }, [conv, typing, onUpdateConv])

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
        {conv.messages.map(msg => <Bubble key={msg.id} msg={msg} t={t} />)}
        {typing && <Typing t={t} />}
        <div ref={endRef} />
      </div>

      {conv.messages.length <= 1 && (
        <div style={{ padding: '0 24px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUGGESTED.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              style={{
                padding: '6px 12px', borderRadius: 20, border: `1px solid ${t.primaryBorder}`,
                background: t.primaryLight, color: t.primary, fontSize: 12.5,
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
              resize: 'none', color: t.text, fontSize: 14, lineHeight: 1.6,
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
            disabled={!input.trim() || typing}
            style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              background: input.trim() && !typing ? t.primary : t.border,
              color: input.trim() && !typing ? '#fff' : t.textMuted,
              cursor: input.trim() && !typing ? 'pointer' : 'default',
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
