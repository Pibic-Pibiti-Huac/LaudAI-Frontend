import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import MainApp from './pages/MainApp'

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

function AppContent() {
  const { authState, user } = useAuth()
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('laudai-theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const toggleDark = () => {
    setIsDark(d => {
      const next = !d
      localStorage.setItem('laudai-theme', next ? 'dark' : 'light')
      return next
    })
  }

  if (authState === 'loading') {
    const bg = isDark ? '#0a1628' : '#f0f7ff'
    return (
      <div
        style={{
          height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: bg, flexDirection: 'column', gap: 16,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="7" fill="#0066CC" />
          <path d="M9 14h10M14 9v10" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="14" cy="14" r="5" stroke="white" strokeWidth="1.2" opacity="0.4" />
        </svg>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: 7, height: 7, borderRadius: '50%', background: '#0066CC', display: 'inline-block',
              animation: `laudai-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return <LoginPage isDark={isDark} onToggleDark={toggleDark} />
  }

  return <MainApp user={user!} isDark={isDark} onToggleDark={toggleDark} />
}
