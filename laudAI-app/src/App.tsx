import { useState, useRef, useCallback, useEffect } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = 'onboarding' | 'chat'
type InputTab = 'file' | 'text'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ─── Mock AI response ─────────────────────────────────────────────────────────

// criar aqui a logica de rota para o backend.

const MOCK_RESPONSES = [
  "Com base no laudo fornecido, posso observar que as estruturas anatômicas descritas estão dentro dos parâmetros esperados. Gostaria que eu elaborasse algum achado específico ou sugerisse uma padronização da linguagem utilizada?",
  "A terminologia radiológica utilizada está adequada. Para aprimorar o laudo, recomendo incluir a escala de densidade Hounsfield nos achados tomográficos e detalhar a extensão das alterações por segmento anatômico.",
  "Nota-se no texto uma oportunidade de estruturar melhor a conclusão diagnóstica. Sugiro separar os achados principais dos incidentais e usar linguagem direta na impressão diagnóstica, facilitando a interpretação clínica.",
  "Com relação à descrição do parênquima pulmonar, seria recomendável especificar a distribuição — focal, multifocal ou difusa — e correlacionar com o contexto clínico mencionado. Posso redigir uma sugestão de parágrafo se desejar.",
  "O laudo está bem estruturado. Há um detalhe na lateralidade descrita que merece atenção — verifique se a referência anatômica está consistente com a orientação padrão de imagem (esquerda do paciente × direita da imagem).",
]

let mockIndex = 0
const getMockResponse = () => {
  const r = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length]
  mockIndex++
  return r
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconUpload = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const IconFile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const IconRadiology = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" stroke="#00b4d8" strokeWidth="1.5" opacity="0.4" />
    <circle cx="16" cy="16" r="9" stroke="#00b4d8" strokeWidth="1.5" opacity="0.7" />
    <circle cx="16" cy="16" r="4" fill="#00b4d8" />
    <line x1="16" y1="2" x2="16" y2="8" stroke="#00b4d8" strokeWidth="1.5" />
    <line x1="16" y1="24" x2="16" y2="30" stroke="#00b4d8" strokeWidth="1.5" />
    <line x1="2" y1="16" x2="8" y2="16" stroke="#00b4d8" strokeWidth="1.5" />
    <line x1="24" y1="16" x2="30" y2="16" stroke="#00b4d8" strokeWidth="1.5" />
  </svg>
)

// ─── Typing indicator ─────────────────────────────────────────────────────────

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map(i => (
      <span
        key={i}
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#00b4d8',
          display: 'inline-block',
          animation: `typing-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }}
      />
    ))}
  </div>
)

// ─── Chat bubble ──────────────────────────────────────────────────────────────

const ChatBubble = ({ msg }: { msg: Message }) => {
  const isUser = msg.role === 'user'
  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ marginBottom: 20 }}
    >
      {!isUser && (
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #003d5b 0%, #006d8f 100%)',
            border: '1px solid #00b4d840',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#00b4d8" strokeWidth="1.5" opacity="0.6" />
            <circle cx="12" cy="12" r="4" fill="#00b4d8" />
          </svg>
        </div>
      )}
      <div
        style={{
          maxWidth: '72%',
          padding: '12px 16px',
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          background: isUser
            ? 'linear-gradient(135deg, #003d5b 0%, #005f8a 100%)'
            : '#111926',
          border: isUser ? '1px solid #00b4d830' : '1px solid #1e2d45',
          color: '#e2e8f0',
          fontSize: 14,
          lineHeight: 1.65,
          letterSpacing: '0.01em',
        }}
      >
        {msg.content}
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: '#4a6278',
            textAlign: isUser ? 'right' : 'left',
          }}
        >
          {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isUser && (
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: '#1a2535',
            border: '1px solid #1e2d45',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 2,
            color: '#64748b',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Dr
        </div>
      )}
    </div>
  )
}

// ─── Onboarding screen ────────────────────────────────────────────────────────

interface OnboardingProps {
  onStart: (laudoText: string, fileName?: string) => void
}

const Onboarding = ({ onStart }: OnboardingProps) => {
  const [tab, setTab] = useState<InputTab>('file')
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    const allowed = ['application/pdf', 'text/plain', 'text/rtf']
    if (!allowed.includes(f.type) && !f.name.endsWith('.pdf') && !f.name.endsWith('.txt')) {
      setError('Formato não suportado. Use PDF ou TXT.')
      return
    }
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
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string ?? `[Conteúdo do arquivo: ${file.name}]`
        onStart(text, file.name)
      }
      if (file.type === 'text/plain') {
        reader.readAsText(file)
      } else {
        // For PDF, simulate reading (frontend only — no real PDF parsing)
        onStart(`[Laudo carregado: ${file.name}]\n\nConteúdo do arquivo PDF disponível para análise.`, file.name)
      }
    } else {
      if (pastedText.trim().length < 20) { setError('Insira o texto do laudo (mínimo 20 caracteres).'); return }
      onStart(pastedText.trim())
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080c14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,180,216,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,180,216,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />
      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,119,182,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 56, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 14 }}>
          <IconRadiology />
          <span
            style={{
              fontSize: 34,
              fontWeight: 700,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '-0.03em',
              color: '#e2e8f0',
            }}
          >
            Laud<span style={{ color: '#00b4d8' }}>AI</span>
          </span>
        </div>
        <p style={{ color: '#4a6278', fontSize: 15, margin: 0, letterSpacing: '0.02em' }}>
          Assistente inteligente para laudos de Radiologia
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 580,
          background: '#0f1623',
          border: '1px solid #1e2d45',
          borderRadius: 20,
          padding: 36,
          position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,180,216,0.05)',
        }}
      >
        <h2
          style={{
            margin: '0 0 6px',
            fontSize: 20,
            fontWeight: 600,
            color: '#e2e8f0',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Nova consulta
        </h2>
        <p style={{ margin: '0 0 28px', color: '#4a6278', fontSize: 14 }}>
          Adicione o laudo para iniciar a análise com o LaudAI.
        </p>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#080c14',
            borderRadius: 10,
            padding: 4,
            marginBottom: 24,
            border: '1px solid #1e2d45',
          }}
        >
          {(['file', 'text'] as InputTab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.2s',
                background: tab === t ? '#00b4d8' : 'transparent',
                color: tab === t ? '#050a10' : '#4a6278',
                letterSpacing: '0.01em',
              }}
            >
              {t === 'file' ? 'Carregar arquivo' : 'Colar texto'}
            </button>
          ))}
        </div>

        {/* File drop zone */}
        {tab === 'file' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? '#00b4d8' : file ? '#0077b6' : '#1e2d45'}`,
              borderRadius: 14,
              padding: '40px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragging ? 'rgba(0,180,216,0.04)' : file ? 'rgba(0,119,182,0.06)' : 'transparent',
              transition: 'all 0.2s',
              marginBottom: 8,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.rtf"
              style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            {file ? (
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    background: '#0d1a2a',
                    border: '1px solid #1e2d45',
                    borderRadius: 10,
                    padding: '10px 16px',
                    marginBottom: 12,
                  }}
                >
                  <span style={{ color: '#00b4d8' }}><IconFile /></span>
                  <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 500 }}>{file.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null) }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#4a6278',
                      padding: 2,
                      display: 'flex',
                    }}
                  >
                    <IconX />
                  </button>
                </div>
                <p style={{ color: '#4a6278', fontSize: 13, margin: 0 }}>
                  {(file.size / 1024).toFixed(1)} KB · clique para trocar
                </p>
              </div>
            ) : (
              <>
                <div style={{ color: '#00b4d8', marginBottom: 14, opacity: 0.8 }}>
                  <IconUpload />
                </div>
                <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 500, margin: '0 0 6px' }}>
                  Arraste o arquivo ou clique para selecionar
                </p>
                <p style={{ color: '#4a6278', fontSize: 12, margin: 0 }}>
                  PDF, TXT, RTF · até 20 MB
                </p>
              </>
            )}
          </div>
        )}

        {/* Text paste area */}
        {tab === 'text' && (
          <textarea
            value={pastedText}
            onChange={(e) => { setPastedText(e.target.value); setError('') }}
            placeholder="Cole aqui o texto do laudo radiológico..."
            style={{
              width: '100%',
              height: 200,
              background: '#080c14',
              border: '1px solid #1e2d45',
              borderRadius: 12,
              padding: 16,
              color: '#e2e8f0',
              fontSize: 13.5,
              lineHeight: 1.7,
              fontFamily: 'system-ui, sans-serif',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 8,
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#00b4d840' }}
            onBlur={(e) => { e.target.style.borderColor = '#1e2d45' }}
          />
        )}

        {error && (
          <p style={{ color: '#f87171', fontSize: 12, margin: '0 0 16px', paddingLeft: 4 }}>
            {error}
          </p>
        )}

        <button
          onClick={handleStart}
          style={{
            width: '100%',
            padding: '14px 0',
            marginTop: 8,
            background: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)',
            border: 'none',
            borderRadius: 12,
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.01em',
            transition: 'opacity 0.2s, transform 0.1s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.99)' }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          Iniciar análise →
        </button>
      </div>

      <p style={{ color: '#283040', fontSize: 12, marginTop: 32, textAlign: 'center' }}>
        Os dados do laudo são processados localmente e não são armazenados.
      </p>
    </div>
  )
}

// ─── Chat screen ──────────────────────────────────────────────────────────────

interface ChatProps {
  laudoText: string
  fileName?: string
  onNewSession: () => void
}

const SUGGESTED_PROMPTS = [
  'Revise a conclusão do laudo',
  'Sugira terminologia mais precisa',
  'O laudo está completo?',
  'Reescreva em linguagem padronizada',
]

const Chat = ({ laudoText, fileName, onNewSession }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Olá! O laudo${fileName ? ` "${fileName}"` : ''} foi carregado com sucesso. Estou pronto para auxiliá-lo na análise e aprimoramento do texto radiológico. Como posso ajudar?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const send = useCallback((text: string) => {
    if (!text.trim() || isTyping) return
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    setTimeout(
      () => {
        setIsTyping(false)
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: getMockResponse(),
            timestamp: new Date(),
          },
        ])
      },
      1200 + Math.random() * 800,
    )
  }, [isTyping])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080c14', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <div
        style={{
          width: sidebarOpen ? 300 : 0,
          minWidth: sidebarOpen ? 300 : 0,
          transition: 'width 0.3s ease, min-width 0.3s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: '#0a101c',
          borderRight: '1px solid #1e2d45',
        }}
      >
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1e2d45', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <IconRadiology />
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#e2e8f0',
                letterSpacing: '-0.02em',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              Laud<span style={{ color: '#00b4d8' }}>AI</span>
            </span>
          </div>
          <button
            onClick={onNewSession}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '9px 0',
              background: 'linear-gradient(135deg, #003d5b 0%, #005f8a 100%)',
              border: '1px solid #00b4d830',
              borderRadius: 10,
              color: '#00b4d8',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            <IconPlus /> Nova consulta
          </button>
        </div>

        {/* Document preview */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <p style={{ color: '#4a6278', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              Laudo carregado
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                background: '#111926',
                border: '1px solid #1e2d45',
                borderRadius: 10,
                marginBottom: 16,
              }}
            >
              <span style={{ color: '#00b4d8', flexShrink: 0 }}><IconFile /></span>
              <span style={{ color: '#94a3b8', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fileName ?? 'Texto colado'}
              </span>
            </div>
          </div>

          <p style={{ color: '#4a6278', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>
            Prévia
          </p>
          <div
            style={{
              background: '#111926',
              border: '1px solid #1e2d45',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 12,
              color: '#4a6278',
              lineHeight: 1.7,
              maxHeight: 340,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {laudoText.slice(0, 600)}{laudoText.length > 600 ? '...' : ''}
          </div>

          {/* Suggested prompts */}
          <p style={{ color: '#4a6278', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '24px 0 10px' }}>
            Sugestões
          </p>
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => send(prompt)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: '1px solid #1e2d45',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#64748b',
                fontSize: 12.5,
                cursor: 'pointer',
                marginBottom: 6,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00b4d830'
                e.currentTarget.style.color = '#94a3b8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e2d45'
                e.currentTarget.style.color = '#64748b'
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 24px',
            borderBottom: '1px solid #1e2d45',
            background: '#080c14',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: 'none',
              border: '1px solid #1e2d45',
              borderRadius: 8,
              padding: '6px 8px',
              color: '#4a6278',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s',
              transform: sidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            title={sidebarOpen ? 'Fechar painel' : 'Abrir painel'}
          >
            <IconChevron />
          </button>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
              {fileName ?? 'Laudo sem título'}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#4a6278' }}>
              {messages.length - 1} mensagen{messages.length !== 2 ? 's' : ''}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              background: 'rgba(0,180,216,0.08)',
              border: '1px solid rgba(0,180,216,0.2)',
              borderRadius: 20,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00b4d8', display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: '#00b4d8', fontWeight: 500 }}>Ativo</span>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '28px 28px 8px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
          {isTyping && (
            <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #003d5b 0%, #006d8f 100%)',
                  border: '1px solid #00b4d840',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#00b4d8" strokeWidth="1.5" opacity="0.6" />
                  <circle cx="12" cy="12" r="4" fill="#00b4d8" />
                </svg>
              </div>
              <div
                style={{
                  background: '#111926',
                  border: '1px solid #1e2d45',
                  borderRadius: '4px 16px 16px 16px',
                }}
              >
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px 24px 24px', borderTop: '1px solid #1e2d45', flexShrink: 0 }}>
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-end',
              background: '#0f1623',
              border: '1px solid #1e2d45',
              borderRadius: 16,
              padding: '12px 14px',
              transition: 'border-color 0.2s',
            }}
            onFocusCapture={(e) => { e.currentTarget.style.borderColor = '#00b4d840' }}
            onBlurCapture={(e) => { e.currentTarget.style.borderColor = '#1e2d45' }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Pergunte sobre o laudo, peça revisão ou sugestões..."
              rows={1}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                resize: 'none',
                color: '#e2e8f0',
                fontSize: 14,
                lineHeight: 1.6,
                fontFamily: 'system-ui, sans-serif',
                maxHeight: 140,
                overflowY: 'auto',
              }}
              onInput={(e) => {
                const t = e.currentTarget
                t.style.height = 'auto'
                t.style.height = Math.min(t.scrollHeight, 140) + 'px'
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isTyping}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background:
                  input.trim() && !isTyping
                    ? 'linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)'
                    : '#1e2d45',
                border: 'none',
                color: input.trim() && !isTyping ? '#fff' : '#364a60',
                cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              <IconSend />
            </button>
          </div>
          <p style={{ color: '#283040', fontSize: 11, textAlign: 'center', marginTop: 10, marginBottom: 0 }}>
            Enter para enviar · Shift+Enter para nova linha
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding')
  const [laudoText, setLaudoText] = useState('')
  const [fileName, setFileName] = useState<string | undefined>()

  const handleStart = (text: string, name?: string) => {
    setLaudoText(text)
    setFileName(name)
    setScreen('chat')
  }

  const handleNewSession = () => {
    setLaudoText('')
    setFileName(undefined)
    setScreen('onboarding')
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2d45; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #2a3f5a; }
      `}</style>
      {screen === 'onboarding' ? (
        <Onboarding onStart={handleStart} />
      ) : (
        <Chat laudoText={laudoText} fileName={fileName} onNewSession={handleNewSession} />
      )}
    </>
  )
}
