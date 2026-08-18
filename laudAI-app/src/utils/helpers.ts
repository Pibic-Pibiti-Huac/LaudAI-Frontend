export const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export const formatDate = (ts: number) => {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString('pt-BR', { weekday: 'short' })
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export const titleFromText = (text: string, fileName?: string) => {
  if (fileName) return fileName.replace(/\.[^/.]+$/, '')
  const first = text.slice(0, 60).replace(/\n/g, ' ').trim()
  return first.length > 50 ? first.slice(0, 50) + '…' : first || 'Laudo sem título'
}
