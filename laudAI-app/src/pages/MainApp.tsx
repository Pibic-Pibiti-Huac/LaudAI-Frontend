import { useState, useRef, useCallback, useEffect } from 'react'
import { signOutUser, type User } from '../firebase'
import type { Conversation, Message } from '../types'

// ─── Mock AI ──────────────────────────────────────────────────────────────────

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

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (ts: number) => {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString('pt-BR', { weekday: 'short' })
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

const titleFromText = (text: string, fileName?: string) => {
  if (fileName) return fileName.replace(/\.[^/.]+$/, '')
  const first = text.slice(0, 60).replace(/\n/g, ' ').trim()
  return first.length > 50 ? first.slice(0, 50) + '…' : first || 'Laudo sem título'
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const Ico = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const ICONS = {
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  plus: 'M12 5v14M5 12h14',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  menu: 'M3 12h18M3 6h18M3 18h18',
  x: 'M18 6L6 18M6 6l12 12',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  sun: 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
}

// ─── Theme ────────────────────────────────────────────────────────────────────

const theme = (dark: boolean) => ({
  bg: dark ? '#0a1628' : '#f0f7ff',
  surface: dark ? '#0d1f3c' : '#ffffff',
  sidebar: dark ? '#091525' : '#e8f4fd',
  border: dark ? '#1a3358' : '#c8dff7',
  borderLight: dark ? '#142844' : '#dbeeff',
  text: dark ? '#f0f6ff' : '#0d2a4a',
  textSub: dark ? '#6b8aad' : '#4a7099',
  textMuted: dark ? '#3a5070' : '#94b8d4',
  primary: '#0066CC',
  primaryHover: '#0055aa',
  primaryLight: dark ? 'rgba(0,102,204,0.15)' : '#e0effe',
  primaryBorder: dark ? 'rgba(0,102,204,0.3)' : '#b3d4f5',
  accent: '#0099dd',
  userBubble: dark ? '#0a2a4a' : '#e0effe',
  userBubbleBorder: dark ? '#1a4a7a' : '#b3d4f5',
  aiBubble: dark ? '#0d1f3c' : '#ffffff',
  aiBubbleBorder: dark ? '#1a3358' : '#dbeeff',
  inputBg: dark ? '#0d1f3c' : '#ffffff',
  shadow: dark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,102,204,0.1)',
})

// ─── Typing indicator ─────────────────────────────────────────────────────────

const Typing = ({ t }: { t: ReturnType<typeof theme> }) => (
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

// ─── Chat bubble ──────────────────────────────────────────────────────────────

const Bubble = ({ msg, t }: { msg: Message; t: ReturnType<typeof theme> }) => {
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
        {msg.content}
        <div style={{ marginTop: 5, fontSize: 11, color: t.textMuted, textAlign: isUser ? 'right' : 'left' }}>
          {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

// ─── Onboarding / New Consultation ───────────────────────────────────────────

const SUGGESTED = ['Revise a conclusão do laudo', 'Sugira terminologia mais precisa', 'O laudo está completo?', 'Reescreva em linguagem padronizada']

interface OnboardingProps {
  t: ReturnType<typeof theme>
  isDark: boolean
  onStart: (text: string, fileName?: string) => void
}

const Onboarding = ({ t, onStart }: OnboardingProps) => {
  const [tab, setTab] = useState<'file' | 'text'>('file')
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setError('')
    setFile(f)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const handleStart = () => {
    if (tab === 'file') {
      if (!file) { setError('Adicione um arquivo para continuar.'); return }
      if (file.type === 'text/plain') {
        const reader = new FileReader()
        reader.onload = (e) => onStart(e.target?.result as string ?? '', file.name)
        reader.readAsText(file)
      } else {
        onStart(`[Arquivo PDF: ${file.name}]\n\nConteúdo disponível para análise.`, file.name)
      }
    } else {
      if (pastedText.trim().length < 20) { setError('Insira o texto do laudo (mínimo 20 caracteres).'); return }
      onStart(pastedText.trim())
    }
  }

  return (
    <div
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
        background: t.bg,
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 560,
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 20,
          padding: '36px 36px 32px',
          boxShadow: t.shadow,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: t.primaryLight,
            border: `1px solid ${t.primaryBorder}`,
            borderRadius: 8,
            padding: '4px 12px',
            marginBottom: 20,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8" stroke="#0066CC" strokeWidth="1.8" opacity="0.5" />
            <circle cx="12" cy="12" r="3" fill="#0066CC" />
          </svg>
          <span style={{ color: t.primary, fontSize: 12, fontWeight: 600 }}>Nova Consulta</span>
        </div>

        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: t.text, fontFamily: 'system-ui, sans-serif' }}>
          Carregar laudo radiológico
        </h2>
        <p style={{ margin: '0 0 28px', color: t.textSub, fontSize: 14 }}>
          Adicione o laudo para iniciar a análise com o LaudAI.
        </p>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            background: t.bg,
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            padding: 4,
            marginBottom: 22,
          }}
        >
          {(['file', 'text'] as const).map(tb => (
            <button
              key={tb}
              onClick={() => { setTab(tb); setError('') }}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
                background: tab === tb ? t.primary : 'transparent',
                color: tab === tb ? '#fff' : t.textSub,
              }}
            >
              {tb === 'file' ? '📄 Carregar arquivo' : '✏️ Colar texto'}
            </button>
          ))}
        </div>

        {tab === 'file' ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? t.primary : file ? t.accent : t.border}`,
              borderRadius: 14, padding: '36px 24px', textAlign: 'center',
              cursor: 'pointer',
              background: dragging ? t.primaryLight : file ? t.primaryLight : 'transparent',
              transition: 'all 0.2s', marginBottom: 8,
            }}
          >
            <input ref={fileRef} type="file" accept=".pdf,.txt,.rtf" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            {file ? (
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: t.surface, border: `1px solid ${t.border}`,
                  borderRadius: 10, padding: '10px 16px', marginBottom: 8,
                }}>
                  <span style={{ color: t.primary }}><Ico d={ICONS.file} size={18} /></span>
                  <span style={{ color: t.text, fontSize: 14, fontWeight: 500 }}>{file.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textSub, display: 'flex', padding: 2 }}>
                    <Ico d={ICONS.x} size={14} />
                  </button>
                </div>
                <p style={{ color: t.textSub, fontSize: 12, margin: 0 }}>
                  {(file.size / 1024).toFixed(1)} KB · clique para trocar
                </p>
              </div>
            ) : (
              <>
                <div style={{ color: t.primary, marginBottom: 12 }}><Ico d={ICONS.upload} size={28} /></div>
                <p style={{ color: t.text, fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>
                  Arraste o arquivo ou clique para selecionar
                </p>
                <p style={{ color: t.textSub, fontSize: 12, margin: 0 }}>PDF, TXT, RTF · até 20 MB</p>
              </>
            )}
          </div>
        ) : (
          <textarea
            value={pastedText}
            onChange={(e) => { setPastedText(e.target.value); setError('') }}
            placeholder="Cole aqui o texto do laudo radiológico..."
            style={{
              width: '100%', height: 180, background: t.bg,
              border: `1px solid ${t.border}`, borderRadius: 12, padding: 16,
              color: t.text, fontSize: 13.5, lineHeight: 1.7,
              fontFamily: 'system-ui, sans-serif', resize: 'vertical',
              outline: 'none', boxSizing: 'border-box', marginBottom: 8,
            }}
            onFocus={(e) => { e.target.style.borderColor = t.primary }}
            onBlur={(e) => { e.target.style.borderColor = t.border }}
          />
        )}

        {error && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 12px' }}>{error}</p>}

        <button
          onClick={handleStart}
          style={{
            width: '100%', marginTop: 8, padding: '14px 0',
            background: `linear-gradient(135deg, ${t.primaryHover} 0%, ${t.primary} 100%)`,
            border: 'none', borderRadius: 12, color: '#fff',
            fontSize: 15, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.01em',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          Iniciar análise →
        </button>

        <div style={{ marginTop: 24 }}>
          <p style={{ color: t.textMuted, fontSize: 11.5, marginBottom: 10 }}>Perguntas frequentes:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SUGGESTED.map(s => (
              <span key={s}
                style={{
                  padding: '5px 11px', borderRadius: 20,
                  background: t.primaryLight, border: `1px solid ${t.primaryBorder}`,
                  color: t.primary, fontSize: 12, cursor: 'default',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Chat view ────────────────────────────────────────────────────────────────

interface ChatViewProps {
  conv: Conversation
  t: ReturnType<typeof theme>
  onUpdateConv: (conv: Conversation) => void
}

const ChatView = ({ conv, t, onUpdateConv }: ChatViewProps) => {
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
      {/* Doc info bar */}
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

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 24px 8px' }}>
        {conv.messages.map(msg => <Bubble key={msg.id} msg={msg} t={t} />)}
        {typing && <Typing t={t} />}
        <div ref={endRef} />
      </div>

      {/* Suggested prompts (show if fresh chat) */}
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

      {/* Input */}
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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  user: User
  isDark: boolean
  onToggleDark: () => void
  onLogout: () => void
  t: ReturnType<typeof theme>
  collapsed: boolean
  onToggleCollapse: () => void
}

const Sidebar = ({
  conversations, activeId, onSelect, onNew, onDelete,
  user, isDark, onToggleDark, onLogout, t, collapsed, onToggleCollapse,
}: SidebarProps) => {
  const [deleteHover, setDeleteHover] = useState<string | null>(null)

  return (
    <div
      style={{
        width: collapsed ? 0 : 272,
        minWidth: collapsed ? 0 : 272,
        transition: 'width 0.3s ease, min-width 0.3s ease',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        background: t.sidebar,
        borderRight: `1px solid ${t.border}`,
      }}
    >
      {/* Top: brand + new */}
      <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${t.borderLight}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="#0066CC" />
            <path d="M9 14h10M14 9v10" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="14" cy="14" r="5" stroke="white" strokeWidth="1.2" opacity="0.4" />
          </svg>
          <span style={{ fontSize: 18, fontWeight: 800, color: t.text, letterSpacing: '-0.02em', fontFamily: 'system-ui, sans-serif' }}>
            Laud<span style={{ color: '#0066CC' }}>AI</span>
          </span>
        </div>
        <button
          onClick={onNew}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '9px 0', borderRadius: 10, border: `1px solid ${t.primaryBorder}`,
            background: t.primaryLight, color: t.primary, fontSize: 13,
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = t.primary; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = t.primaryLight; e.currentTarget.style.color = t.primary }}
        >
          <Ico d={ICONS.plus} size={14} />
          Nova Consulta
        </button>
      </div>

      {/* Chat list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 8px' }}>
        {conversations.length === 0 ? (
          <div style={{ padding: '20px 12px', textAlign: 'center', color: t.textMuted, fontSize: 13 }}>
            Nenhuma consulta ainda.
          </div>
        ) : (
          <>
            <p style={{ color: t.textMuted, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>
              Consultas
            </p>
            {conversations.map(conv => (
              <div
                key={conv.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  marginBottom: 2, borderRadius: 10,
                  background: activeId === conv.id ? t.primaryLight : 'transparent',
                  border: `1px solid ${activeId === conv.id ? t.primaryBorder : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (activeId !== conv.id) e.currentTarget.style.background = t.borderLight }}
                onMouseLeave={(e) => { if (activeId !== conv.id) e.currentTarget.style.background = 'transparent' }}
              >
                <button
                  onClick={() => onSelect(conv.id)}
                  style={{
                    flex: 1, textAlign: 'left', background: 'none', border: 'none',
                    padding: '9px 10px', cursor: 'pointer', minWidth: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                    <span style={{ color: activeId === conv.id ? t.primary : t.textSub, flexShrink: 0 }}>
                      <Ico d={ICONS.chat} size={13} />
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: activeId === conv.id ? 600 : 400,
                      color: activeId === conv.id ? t.primary : t.text,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {conv.title}
                    </span>
                  </div>
                  <div style={{ paddingLeft: 20, color: t.textMuted, fontSize: 11 }}>
                    {formatDate(conv.updatedAt)} · {conv.messages.length} msg
                  </div>
                </button>
                <button
                  onClick={() => onDelete(conv.id)}
                  onMouseEnter={() => setDeleteHover(conv.id)}
                  onMouseLeave={() => setDeleteHover(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '6px 8px', color: deleteHover === conv.id ? '#ef4444' : t.textMuted,
                    opacity: deleteHover === conv.id ? 1 : 0.4,
                    transition: 'all 0.15s', flexShrink: 0,
                  }}
                  title="Excluir consulta"
                >
                  <Ico d={ICONS.trash} size={13} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* User footer */}
      <div style={{ borderTop: `1px solid ${t.border}`, padding: '12px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName ?? ''} width={32} height={32}
              style={{ borderRadius: '50%', border: `1.5px solid ${t.primaryBorder}` }} />
          ) : (
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: t.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, fontWeight: 700,
            }}>
              {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: t.text, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.displayName ?? 'Usuário'}
            </div>
            <div style={{ color: t.textMuted, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onToggleDark}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '7px 0', borderRadius: 8, border: `1px solid ${t.border}`,
              background: 'transparent', color: t.textSub, fontSize: 12, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.primary; e.currentTarget.style.color = t.primary }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSub }}
          >
            <Ico d={isDark ? ICONS.sun : ICONS.moon} size={13} />
            {isDark ? 'Claro' : 'Escuro'}
          </button>
          <button
            onClick={onLogout}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '7px 0', borderRadius: 8, border: `1px solid ${t.border}`,
              background: 'transparent', color: t.textSub, fontSize: 12, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSub }}
          >
            <Ico d={ICONS.logout} size={13} />
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

interface Props {
  user: User
  isDark: boolean
  onToggleDark: () => void
}

export default function MainApp({ user, isDark, onToggleDark }: Props) {
  const t = theme(isDark)
  const storageKey = `laudai-convs-${user.uid}`

  const loadConvs = (): Conversation[] => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? '[]') } catch { return [] }
  }

  const [conversations, setConversations] = useState<Conversation[]>(loadConvs)
  const [activeId, setActiveId] = useState<string | null>(() => {
    const convs = loadConvs()
    return convs.length > 0 ? convs[0].id : null
  })
  const [showOnboarding, setShowOnboarding] = useState(() => loadConvs().length === 0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const saveConvs = (convs: Conversation[]) => {
    setConversations(convs)
    localStorage.setItem(storageKey, JSON.stringify(convs))
  }

  const handleStart = (laudoText: string, fileName?: string) => {
    const conv: Conversation = {
      id: genId(),
      title: titleFromText(laudoText, fileName),
      fileName,
      laudoText,
      messages: [{
        id: genId(),
        role: 'assistant',
        content: `Olá! O laudo${fileName ? ` "${fileName}"` : ''} foi carregado. Estou pronto para auxiliar na análise e aprimoramento do texto radiológico. Como posso ajudar?`,
        timestamp: Date.now(),
      }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const updated = [conv, ...conversations]
    saveConvs(updated)
    setActiveId(conv.id)
    setShowOnboarding(false)
  }

  const handleUpdateConv = (conv: Conversation) => {
    const updated = conversations.map(c => c.id === conv.id ? conv : c)
    saveConvs(updated)
  }

  const handleDelete = (id: string) => {
    const updated = conversations.filter(c => c.id !== id)
    saveConvs(updated)
    if (activeId === id) {
      if (updated.length > 0) setActiveId(updated[0].id)
      else { setActiveId(null); setShowOnboarding(true) }
    }
  }

  const handleNew = () => {
    setActiveId(null)
    setShowOnboarding(true)
  }

  const handleSelect = (id: string) => {
    setActiveId(id)
    setShowOnboarding(false)
  }

  const activeConv = conversations.find(c => c.id === activeId) ?? null

  return (
    <div style={{ display: 'flex', height: '100vh', background: t.bg, overflow: 'hidden' }}>
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        user={user}
        isDark={isDark}
        onToggleDark={onToggleDark}
        onLogout={signOutUser}
        t={t}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '13px 20px',
            borderBottom: `1px solid ${t.border}`,
            background: t.surface,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            style={{
              background: 'none', border: `1px solid ${t.border}`, borderRadius: 8,
              padding: '6px 8px', color: t.textSub, cursor: 'pointer', display: 'flex',
            }}
            title={sidebarCollapsed ? 'Mostrar painel' : 'Ocultar painel'}
          >
            <Ico d={ICONS.menu} size={16} />
          </button>

          {!showOnboarding && activeConv && (
            <>
              <span style={{ color: t.textSub, fontSize: 14, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeConv.title}
              </span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20,
                background: t.primaryLight, border: `1px solid ${t.primaryBorder}`,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0066CC', display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: t.primary, fontWeight: 600 }}>LaudAI Ativo</span>
              </div>
            </>
          )}

          {showOnboarding && (
            <span style={{ color: t.textSub, fontSize: 14, fontWeight: 600 }}>
              Nova Consulta
            </span>
          )}
        </div>

        {showOnboarding || !activeConv ? (
          <Onboarding t={t} isDark={isDark} onStart={handleStart} />
        ) : (
          <ChatView conv={activeConv} t={t} onUpdateConv={handleUpdateConv} />
        )}
      </div>
    </div>
  )
}
