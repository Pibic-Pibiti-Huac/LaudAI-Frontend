import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { auth, onAuthStateChanged, type User } from '../firebase'

type AuthState = 'loading' | 'unauthenticated' | 'authenticated'

interface AuthContextValue {
  authState: AuthState
  user: User | null
  getToken: () => Promise<string>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        setAuthState('authenticated')
      } else {
        setUser(null)
        setAuthState('unauthenticated')
      }
    })
    return unsub
  }, [])

  const getToken = async (): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado')
    return user.getIdToken()
  }

  return (
    <AuthContext.Provider value={{ authState, user, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
