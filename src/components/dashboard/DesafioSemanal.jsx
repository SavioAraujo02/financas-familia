// src/components/dashboard/DesafioSemanal.jsx
// Widget do desafio semanal gamificado

import { CONTAINER_PADRAO } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

export function DesafioSemanal({ 
  desafioSemanal, 
  loading = false 
}) {
  if (loading) {
    return (
      <div style={CONTAINER_PADRAO}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '0 0 16px 0',
          color: '#1a202c'
        }}>
          🎯 DESAFIO DA SEMANA
        </h2>
        
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #7dd3fc',
          borderRadius: '12px',
          padding: '16px',
          height: '200px',
          animation: 'pulse 1.5s infinite'
        }} />
      </div>
    )
  }

  return (
    <div style={CONTAINER_PADRAO}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        margin: '0 0 16px 0',
        color: '#1a202c'
      }}>
        🎯 DESAFIO DA SEMANA
      </h2>
      
      <div style={{
        backgroundColor: '#f0f9ff',
        border: '1px solid #7dd3fc',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          margin: '0 0 8px 0',
          color: '#0c4a6e'
        }}>
          {desafioSemanal.titulo}
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#0369a1',
          margin: '0 0 12px 0'
        }}>
          {desafioSemanal.meta}
        </p>
        
        {/* Barra de Progresso */}
        <div style={{
          backgroundColor: '#e0e7ff',
          borderRadius: '8px',
          height: '8px',
          marginBottom: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            backgroundColor: '#3b82f6',
            height: '100%',
            width: `${desafioSemanal.progresso}%`,
            transition: 'width 0.5s ease',
            animation: desafioSemanal.progresso > 0 ? 'progressGlow 2s ease-in-out infinite alternate' : 'none'
          }} />
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e' }}>
            {desafioSemanal.progresso}% ({desafioSemanal.diasCompletos}/{desafioSemanal.totalDias} dias)
          </span>
        </div>
        
        {/* Progresso Individual */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
              👨 Você
            </div>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
              {desafioSemanal.progressoVoce?.map((completo, i) => (
                <span key={i} style={{
                  fontSize: '16px',
                  opacity: completo ? 1 : 0.3,
                  transition: 'all 0.3s ease'
                }}>
                  {completo ? '✅' : '❌'}
                </span>
              )) || Array(7).fill(0).map((_, i) => (
                <span key={i} style={{ fontSize: '16px', opacity: 0.3 }}>❌</span>
              ))}
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
              👩 Esposa
            </div>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
              {desafioSemanal.progressoEsposa?.map((completo, i) => (
                <span key={i} style={{
                  fontSize: '16px',
                  opacity: completo ? 1 : 0.3,
                  transition: 'all 0.3s ease'
                }}>
                  {completo ? '✅' : '❌'}
                </span>
              )) || Array(7).fill(0).map((_, i) => (
                <span key={i} style={{ fontSize: '16px', opacity: 0.3 }}>❌</span>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#059669',
          textAlign: 'center',
          backgroundColor: '#dcfce7',
          padding: '8px',
          borderRadius: '6px'
        }}>
          {desafioSemanal.premio}
        </div>
      </div>

      {/* Botões de Ação */}
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <button style={{
          flex: 1,
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#059669'
          e.target.style.transform = 'translateY(-1px)'
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#10b981'
          e.target.style.transform = 'translateY(0)'
        }}
        onClick={() => window.location.href = '/desafios'}
        >
          🎯 Ver Desafios
        </button>
        
        <button style={{
          flex: 1,
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#2563eb'
          e.target.style.transform = 'translateY(-1px)'
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#3b82f6'
          e.target.style.transform = 'translateY(0)'
        }}
        >
          📊 Histórico
        </button>
      </div>
    </div>
  )
}