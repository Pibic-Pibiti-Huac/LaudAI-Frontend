export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Conversation {
  id: string
  title: string
  fileName?: string
  laudoText: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}
