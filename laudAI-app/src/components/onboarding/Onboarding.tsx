import { useState, useRef, useCallback } from 'react'
import type { Theme } from '../../theme/theme'
import { Ico, ICONS } from '../ui/Icons'

const SUGGESTED = ['Revise a conclusão do laudo']

interface OnboardingProps {
  t: Theme
  isDark: boolean
  onStart: (text: string, fileName?: string) => void
}

export const Onboarding = ({ t, onStart }: OnboardingProps) => {
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
