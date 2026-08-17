export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface LaudoEvaluation {
  extracao: Record<string, string>
  avaliacao: Record<string, string>
  notas: Record<string, number>
}

export interface Conversation {
  id: string
  title: string
  fileName?: string
  laudoText: string
  messages: Message[]
  evaluation?: LaudoEvaluation | null
  createdAt: number
  updatedAt: number
}