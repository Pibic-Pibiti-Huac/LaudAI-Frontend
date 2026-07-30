import { useState, useEffect } from 'react'
import { signOutUser, type User } from '../firebase'
import type { Conversation, Message } from '../types'
import { analyzeText, handleModelAnalyze, formatAnalyzeMessage } from '@/routes/model_routes'
import { theme } from '../theme/theme'
import { genId, titleFromText } from '../utils/helpers'
import { Ico, ICONS } from '../components/ui/Icons'
import { Sidebar } from '../components/layout/Sidebar'
import { Onboarding } from '../components/onboarding/Onboarding'
import { ChatView } from '../components/chat/ChatView'

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
  const [isAnalyzingLaudo, setIsAnalyzingLaudo] = useState(false)
  const [token, setToken] = useState('')

  useEffect(() => {
    user.getIdToken().then(setToken)
  }, [user])

  const saveConvs = (convs: Conversation[]) => {
    setConversations(convs)
    localStorage.setItem(storageKey, JSON.stringify(convs))
  }

  const handleStart = async (laudoText: string, fileName?: string) => {
    const convId = genId()
    const baseConv: Conversation = {
      id: convId,
      title: titleFromText(laudoText, fileName),
      fileName,
      laudoText,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    saveConvs([baseConv, ...conversations])
    setActiveId(convId)
    setShowOnboarding(false)
    setIsAnalyzingLaudo(true)

    try {
      const token = await user.getIdToken()
      const response = await analyzeText({
        role: 'assistant',
        report: laudoText,
      }, token)

      const result = handleModelAnalyze(response)
      const finalContent = formatAnalyzeMessage(result)

      const finalMsg: Message = {
        id: genId(),
        role: 'assistant',
        content: finalContent,
        timestamp: Date.now(),
      }

      const finalConv = { ...baseConv, messages: [finalMsg], updatedAt: Date.now() }
      setConversations(prev => {
        const updated = [finalConv, ...prev.filter(c => c.id !== convId)]
        localStorage.setItem(storageKey, JSON.stringify(updated))
        return updated
      })
    } catch {
      const errorMsg: Message = {
        id: genId(),
        role: 'assistant',
        content: 'Não foi possível analisar o laudo agora. Tente novamente em instantes.',
        timestamp: Date.now(),
      }
      const errorConv = { ...baseConv, messages: [errorMsg], updatedAt: Date.now() }
      setConversations(prev => {
        const updated = [errorConv, ...prev.filter(c => c.id !== convId)]
        localStorage.setItem(storageKey, JSON.stringify(updated))
        return updated
      })
    } finally {
      setIsAnalyzingLaudo(false)
    }
  }

  const handleUpdateConv = (conv: Conversation) => {
    saveConvs(conversations.map(c => c.id === conv.id ? conv : c))
  }

  const handleDelete = (id: string) => {
    const updated = conversations.filter(c => c.id !== id)
    saveConvs(updated)
    if (activeId === id) {
      if (updated.length > 0) setActiveId(updated[0].id)
      else { setActiveId(null); setShowOnboarding(true) }
    }
  }

  const handleNew = () => { setActiveId(null); setShowOnboarding(true) }
  const handleSelect = (id: string) => { setActiveId(id); setShowOnboarding(false) }

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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
          <ChatView conv={activeConv} t={t} laudoText={activeConv.laudoText} token={token} onUpdateConv={handleUpdateConv} isAnalyzingLaudo={isAnalyzingLaudo} />
        )}
      </div>
    </div>
  )
}
