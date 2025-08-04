// src/components/dashboard/ProximosEventos.jsx
// Widget dos próximos 7 dias com eventos financeiros

import { CONTAINER_PADRAO } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

export function ProximosEventos({ 
  proximosEventos = [], 
  setCalendarioOpen,
  loading = false 
}) {
  if (loading) {
    return (
      <div style={CONTAINER_PADRAO}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '0 0 20px 0',
          color: '#1a202c',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📅 PRÓXIMOS 7 DIAS
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array(4).fill(0).map((_, index) => (
            <div key={index} style={{
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              height: '60px',
              animation: 'pulse 1.5s infinite'
            }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={CONTAINER_PADRAO}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        margin: '0 0 20px 0',
        color: '#1a202c',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        📅 PRÓXIMOS 7 DIAS
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {proximosEventos.length > 0 ? proximosEventos.map((evento, index) => (
          <div key={index} style={{
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9'
            e.currentTarget.style.transform = 'translateX(2px)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc'
            e.currentTarget.style.transform = 'translateX(0)'
          }}
          >
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
              {evento.data}
            </div>
            <div style={{ fontWeight: '600', color: '#1a202c', marginBottom: '2px' }}>
              {evento.descricao}: {formatCurrency(evento.valor)}
            </div>
            {evento.extra && (
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {evento.extra}
              </div>
            )}
          </div>
        )) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>
              📅
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
              Nenhum evento próximo
            </div>
            <div style={{ fontSize: '12px' }}>
              Seus próximos vencimentos aparecerão aqui
            </div>
          </div>
        )}
      </div>
      
      <button 
        onClick={() => setCalendarioOpen && setCalendarioOpen(true)}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          marginTop: '16px',
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
        📅 Ver Calendário Completo
      </button>
    </div>
  )
}