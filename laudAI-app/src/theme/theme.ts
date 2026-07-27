export interface Theme {
  bg: string
  surface: string
  sidebar: string
  border: string
  borderLight: string
  text: string
  textSub: string
  textMuted: string
  primary: string
  primaryHover: string
  primaryLight: string
  primaryBorder: string
  accent: string
  userBubble: string
  userBubbleBorder: string
  aiBubble: string
  aiBubbleBorder: string
  inputBg: string
  shadow: string
}

export function theme(dark: boolean): Theme {
  return {
    bg: dark ? '#0a1628' : '#f0f7ff',
    surface: dark ? '#0d1f3c' : '#ffffff',
    sidebar: dark ? '#091525' : '#e8f4fd',
    border: dark ? '#1a3358' : '#c8dff7',
    borderLight: dark ? '#142844' : '#dbeeff',
    text: dark ? '#f0f6ff' : '#0d2a4a',
    textSub: dark ? '#6b8aad' : '#4a7099',
    textMuted: dark ? '#3a5070' : '#94b8d4',
    primary: '#0066CC',
    primaryHover: '#0055aa',
    primaryLight: dark ? 'rgba(0,102,204,0.15)' : '#e0effe',
    primaryBorder: dark ? 'rgba(0,102,204,0.3)' : '#b3d4f5',
    accent: '#0099dd',
    userBubble: dark ? '#0a2a4a' : '#e0effe',
    userBubbleBorder: dark ? '#1a4a7a' : '#b3d4f5',
    aiBubble: dark ? '#0d1f3c' : '#ffffff',
    aiBubbleBorder: dark ? '#1a3358' : '#dbeeff',
    inputBg: dark ? '#0d1f3c' : '#ffffff',
    shadow: dark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,102,204,0.1)',
  }
}
