// src/components/dashboard/ResumoInteligente.jsx
// Resumo inteligente com saúde financeira e economômetro

import { CONTAINER_PADRAO } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

export function ResumoInteligente({ 
  dadosFamilia, 
  animatedValues, 
  loading = false 
}) {
  const getCorSaude = (percentual) => {
    if (percentual >= 70) return '#10B981' // Verde
    if (percentual >= 50) return '#F59E0B' // Amarelo
    return '#EF4444' // Vermelho
  }

  if (loading) {
    return (
      <div style={{
        ...CONTAINER_PADRAO,
        height: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  return (
    <div style={CONTAINER_PADRAO}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* Saúde Financeira */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
            🎯 SAÚDE FINANCEIRA
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: getCorSaude(dadosFamilia.saudeFinanceira),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {dadosFamilia.saudeFinanceira}% 
            <span style={{ fontSize: '20px' }}>
              {dadosFamilia.saudeFinanceira >= 70 ? '🟢' : 
               dadosFamilia.saudeFinanceira >= 50 ? '🟡' : '🔴'}
            </span>
          </div>
        </div>
        
        {/* Renda Comprometida */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
            💳 RENDA COMPROMETIDA
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#f59e0b'
          }}>
            {dadosFamilia.rendaComprometida}%
          </div>
        </div>
        
        {/* Renda Livre */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
            💰 RENDA LIVRE
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#10b981'
          }}>
            {dadosFamilia.rendaLivre}%
          </div>
        </div>
        
        {/* Economômetro */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
            💰 ECONOMIZADO HOJE
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#10b981'
          }}>
            {formatCurrency(animatedValues.economia)}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            🔥 Streak: {dadosFamilia.diasAtivos} dias!
          </div>
        </div>
      </div>
    </div>
  )
}