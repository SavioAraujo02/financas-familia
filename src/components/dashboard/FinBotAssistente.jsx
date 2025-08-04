// src/components/dashboard/FinBotAssistente.jsx
// Assistente FinBot com dicas inteligentes

import { FINBOT_STYLE } from '@/lib/constants'

export function FinBotAssistente({ 
  finBotDica, 
  alertasInteligentes = [],
  loading = false 
}) {
  if (loading) {
    return (
      <div style={FINBOT_STYLE}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            padding: '8px',
            fontSize: '20px'
          }}>
            🤖
          </div>
          <div style={{
            width: '200px',
            height: '20px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
            animation: 'pulse 1.5s infinite'
          }} />
        </div>
      </div>
    )
  }

  return (
    <div style={FINBOT_STYLE}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          padding: '8px',
          fontSize: '20px',
          animation: 'pulse 2s infinite'
        }}>
          🤖
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '14px' }}>
            FinBot - Assistente Inteligente
          </p>
          
          {/* Dica Principal */}
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.5', opacity: 0.95 }}>
            {finBotDica}
          </p>
          
          {/* Alertas Inteligentes */}
          {alertasInteligentes.length > 0 && (
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '8px',
              marginTop: '8px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', opacity: 0.9 }}>
                💡 Insights Adicionais:
              </div>
              {alertasInteligentes.slice(0, 2).map((alerta, i) => (
                <div key={i} style={{
                  fontSize: '11px',
                  opacity: 0.85,
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>{alerta.icone}</span>
                  <span>{alerta.sugestao || alerta.descricao}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Botões de Ação */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '8px'
          }}>
            <button style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              color: 'white',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              💡 Mais Dicas
            </button>
            <button style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              color: 'white',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              🎯 Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}