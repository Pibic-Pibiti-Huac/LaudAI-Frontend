import { useEffect, useRef, useState } from 'react'
import './App.css'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  laudo?: { name: string; size: number }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Olá! Sou o assistente de análise de laudos. Envie sua mensagem ou anexe um laudo clicando em "Enviar Laudo".',
    },
  ])
  const [input, setInput] = useState('')
  const [pendingLaudo, setPendingLaudo] = useState<File | null>(null)
  const [isThinking, setIsThinking] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isThinking])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed && !pendingLaudo) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed || (pendingLaudo ? 'Segue laudo em anexo.' : ''),
      laudo: pendingLaudo
        ? { name: pendingLaudo.name, size: pendingLaudo.size }
        : undefined,
    }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setPendingLaudo(null)
    setIsThinking(true)

    // Aqui vamos criar o enpoint de envio do laudo para o modelo.
    setTimeout(() => {
      const reply: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: userMsg.laudo
          ? `Recebi o laudo "${userMsg.laudo.name}". Estou analisando as principais informações e retorno em instantes.`
          : 'Entendido. Posso ajudar com dúvidas sobre laudos, exames e resultados — envie um laudo quando quiser uma análise detalhada.',
      }
      setMessages((m) => [...m, reply])
      setIsThinking(false)
      textareaRef.current?.focus()
    }, 900)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPendingLaudo(file)
    e.target.value = ''
  }

  return (
    <div className="chat-app">
      <header className="chat-header">
        <div className="chat-avatar">🩺</div>
        <div>
          <h1>LaudAI - seu assistente seguro na análise de laudos</h1>
          <p>Online · pronto para analisar seus exames</p>
        </div>
      </header>

      <main ref={scrollRef} className="chat-main">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`msg-row ${msg.role}`}>
              <div className="msg-stack">
                {msg.laudo && (
                  <div className="laudo-card">
                    <div className="laudo-icon">📄</div>
                    <div className="laudo-info">
                      <p className="laudo-name">{msg.laudo.name}</p>
                      <p className="laudo-meta">
                        Laudo · {formatSize(msg.laudo.size)}
                      </p>
                    </div>
                  </div>
                )}
                {msg.content && <div className="bubble">{msg.content}</div>}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="msg-row assistant">
              <div className="typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="chat-footer">
        {pendingLaudo && (
          <div className="pending-laudo">
            <div className="laudo-icon">📄</div>
            <div className="laudo-info">
              <p className="laudo-name">{pendingLaudo.name}</p>
              <p className="laudo-meta">
                Laudo pronto para envio · {formatSize(pendingLaudo.size)}
              </p>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setPendingLaudo(null)}
              aria-label="Remover laudo"
            >
              ✕
            </button>
          </div>
        )}

        <div className="composer">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden-file"
            onChange={onFileChange}
          />
          <button
            type="button"
            className="laudo-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            📄 Enviar Laudo
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva sua mensagem..."
            rows={1}
            className="composer-input"
          />

          <button
            type="button"
            className="send-btn"
            onClick={handleSend}
            disabled={!input.trim() && !pendingLaudo}
            aria-label="Enviar"
          >
            ➤
          </button>
        </div>
        <p className="disclaimer">
          As respostas são geradas por IA local e não substituem avaliação médica.
        </p>
      </footer>
    </div>
  )
}

export default App
