// src/components/ui/LoadingSpinner.jsx
// Componente padronizado para loading

import { LOADING_SPINNER_STYLE } from '@/lib/constants'

export function LoadingSpinner({ 
  message = "Carregando...", 
  color = "white",
  gradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  emoji = "💰"
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: gradient
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          ...LOADING_SPINNER_STYLE,
          borderColor: color === 'white' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
          borderTopColor: color
        }} />
        <p style={{ 
          color: color, 
          fontSize: '18px', 
          fontWeight: '500' 
        }}>
          {emoji} {message}
        </p>
      </div>
    </div>
  )
}