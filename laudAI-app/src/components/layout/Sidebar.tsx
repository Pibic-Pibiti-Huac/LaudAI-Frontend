import { useState } from 'react'
import type { User } from '../../firebase'
import type { Conversation } from '../../types'
import type { Theme } from '../../theme/theme'
import { formatDate } from '../../utils/helpers'
import { Ico, ICONS } from '../ui/Icons'

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
  t: Theme
  collapsed: boolean
  onToggleCollapse: () => void
}

export const Sidebar = ({
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
