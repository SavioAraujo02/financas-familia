// src/components/ui/StatCard.jsx
// Componente padronizado para cards de estatísticas

import { CARD_FINANCEIRO_STYLES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

export function StatCard({ 
  tipo, 
  titulo, 
  valor, 
  emoji, 
  status, 
  subtitulo, 
  onClick,
  loading = false 
}) {
  const cardStyle = CARD_FINANCEIRO_STYLES[tipo] || CARD_FINANCEIRO_STYLES.saldo

  if (loading) {
    return (
      <div style={{
        ...cardStyle,
        color: 'white',
        padding: '24px',
        borderRadius: '16px',
        minHeight: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  return (
    <div 
      style={{
        ...cardStyle,
        color: 'white',
        padding: '24px',
        borderRadius: '16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease'
      }}
      onClick={onClick}
      onMouseOver={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = cardStyle.boxShadow.replace('0.3)', '0.4)')
        }
      }}
      onMouseOut={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = cardStyle.boxShadow
        }
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '12px' 
      }}>
        <span style={{ fontSize: '32px' }}>{emoji}</span>
        <div>
          <h3 style={{ 
            fontSize: '14px', 
            opacity: 0.9, 
            margin: 0, 
            fontWeight: '500' 
          }}>
            {titulo}
          </h3>
          <p style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            margin: '4px 0 0 0' 
          }}>
            {typeof valor === 'number' ? formatCurrency(valor) : valor}
          </p>
          {subtitulo && (
            <p style={{ 
              fontSize: '12px', 
              opacity: 0.9, 
              margin: 0 
            }}>
              {subtitulo}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}