import { useState } from 'react'
import { signInWithGoogle } from '../firebase'

interface Props {
  isDark: boolean
  onToggleDark: () => void
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

const HuacLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#0066CC" />
    <path d="M14 24h20M24 14v20" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="24" cy="24" r="8" stroke="white" strokeWidth="2" opacity="0.5" />
  </svg>
)

export default function LoginPage({ isDark, onToggleDark }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('REPLACE_ME') || msg.includes('invalid-api-key') || msg.includes('api-key')) {
        setError('Configure as credenciais do Firebase no arquivo .env para ativar o login.')
      } else {
        setError('Não foi possível fazer login. Tente novamente.')
      }
      setLoading(false)
    }
  }

  const c = isDark
    ? {
        bg: '#0a1628',
        card: '#0d1f3c',
        border: '#1a3358',
        text: '#f0f6ff',
        sub: '#7a99bb',
        inputBg: '#0a1628',
      }
    : {
        bg: '#f0f7ff',
        card: '#ffffff',
        border: '#c8dff7',
        text: '#0d2a4a',
        sub: '#4a7099',
        inputBg: '#f8fbff',
      }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(145deg, #0a1628 0%, #0d2040 50%, #091525 100%)'
          : 'linear-gradient(145deg, #e8f4fd 0%, #f0f7ff 40%, #dbeeff 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(0,102,204,0.07)' : 'rgba(0,102,204,0.05)'} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }}
      />

      {/* Dark mode toggle */}
      <button
        onClick={onToggleDark}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: c.card,
          border: `1px solid ${c.border}`,
          borderRadius: 10,
          padding: '8px 12px',
          cursor: 'pointer',
          color: c.sub,
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
        }}
        title="Alternar tema"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: c.card,
          border: `1px solid ${c.border}`,
          borderRadius: 24,
          padding: '44px 40px',
          boxShadow: isDark
            ? '0 32px 64px rgba(0,0,0,0.5)'
            : '0 16px 48px rgba(0,102,204,0.12)',
          position: 'relative',
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <HuacLogo />
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: c.text,
              fontFamily: 'system-ui, sans-serif',
              lineHeight: 1,
              marginBottom: 6,
            }}
          >
            Laud<span style={{ color: '#0066CC' }}>AI</span>
          </div>
          <p style={{ margin: '8px 0 0', color: c.sub, fontSize: 13, lineHeight: 1.5 }}>
            Assistente de Laudos de Radiografia de Tórax<br />
            <span style={{ fontWeight: 600, color: isDark ? '#4d8fd1' : '#0055aa' }}>
              HUAC · Hospital Universitário Alcides Carneiro
            </span>
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${c.border}`, marginBottom: 28 }} />

        <h2
          style={{
            margin: '0 0 6px',
            fontSize: 18,
            fontWeight: 700,
            color: c.text,
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          Acesse sua conta
        </h2>
        <p style={{ margin: '0 0 28px', color: c.sub, fontSize: 13, textAlign: 'center' }}>
          Use seu e-mail institucional para continuar
        </p>

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '14px 20px',
            background: loading ? c.border : isDark ? '#1a3358' : '#ffffff',
            border: `1.5px solid ${isDark ? '#2a4a7a' : '#c8dff7'}`,
            borderRadius: 12,
            color: c.text,
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,102,204,0.08)',
            fontFamily: 'system-ui, sans-serif',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.borderColor = '#0066CC'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,102,204,0.2)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isDark ? '#2a4a7a' : '#c8dff7'
            e.currentTarget.style.boxShadow = isDark ? 'none' : '0 2px 8px rgba(0,102,204,0.08)'
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: c.sub }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                  <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.8s" repeatCount="indefinite" />
                </path>
              </svg>
              Entrando...
            </span>
          ) : (
            <>
              <GoogleIcon />
              Continuar com Google
            </>
          )}
        </button>

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: '12px 14px',
              background: isDark ? '#1a0a0a' : '#fff5f5',
              border: '1px solid #fca5a5',
              borderRadius: 10,
              color: '#ef4444',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        <p
          style={{
            margin: '28px 0 0',
            color: c.sub,
            fontSize: 11.5,
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          Ao entrar, você concorda com os termos de uso do HUAC.<br />
          Os dados do laudo não são armazenados externamente.
        </p>
      </div>
    </div>
  )
}
