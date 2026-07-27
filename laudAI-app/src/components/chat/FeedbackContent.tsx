import type { Theme } from '../../theme/theme'

export const FeedbackContent = ({ content, t }: { content: string; t: Theme }) => {
  const blocks = content.split(/\n\n+/).filter(Boolean)

  const notaMatch = blocks[0]?.match(/^\*\*Nota:\s*(\d+)\/(\d+)\*\*\s*(.*)$/)

  if (!notaMatch) {
    return <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
  }

  const [, sumStr, totalStr, stars] = notaMatch
  const sum = Number(sumStr)
  const total = Number(totalStr)
  const isFull = sum === total
  const isZero = sum === 0

  const notaColor = isFull ? '#16a34a' : isZero ? '#dc2626' : t.primary

  const rest = blocks.slice(1)
  const conclusao = rest[rest.length - 1]?.startsWith('•') ? null : rest[rest.length - 1]
  const criterionBlocks = conclusao ? rest.slice(0, -1) : rest
  const intro = criterionBlocks[0]?.startsWith('•') ? null : criterionBlocks[0]
  const criteria = intro ? criterionBlocks.slice(1) : criterionBlocks

  return (
    <div>
      <div
        style={{
          display: 'flex', alignItems: 'baseline', gap: 10,
          marginBottom: 14, paddingBottom: 12,
          borderBottom: `1px solid ${t.aiBubbleBorder}`,
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 800, color: notaColor }}>
          {sum}/{total}
        </span>
        <span style={{ fontSize: 20, letterSpacing: 1 }}>{stars}</span>
      </div>

      {intro && (
        <div style={{ marginBottom: 14, color: t.textMuted, fontSize: 13.5 }}>
          {intro}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {criteria.map((block, i) => {
          const lines = block.split('\n').map((l) => l.trim())
          const header = lines[0] ?? ''
          const trecho = lines.find((l) => l.startsWith('Trecho identificado:'))
          const avaliacao = lines.find((l) => l.startsWith('Avaliação:'))

          const headerMatch = header.match(/^•\s*(.+?)\s*\((✅|❌)\s*(.+?)\)$/)
          const label = headerMatch?.[1] ?? header.replace(/^•\s*/, '')
          const icon = headerMatch?.[2] ?? ''
          const status = headerMatch?.[3] ?? ''
          const atendido = icon === '✅'

          return (
            <div
              key={i}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: atendido ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.06)',
                borderLeft: `3px solid ${atendido ? '#16a34a' : '#dc2626'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: atendido ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                  {icon} {status}
                </span>
              </div>
              {trecho && (
                <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 3 }}>
                  {trecho}
                </div>
              )}
              {avaliacao && (
                <div style={{ fontSize: 13, color: t.text }}>
                  {avaliacao}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {conclusao && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${t.aiBubbleBorder}`, fontSize: 13.5, color: t.textMuted }}>
          {conclusao}
        </div>
      )}
    </div>
  )
}
