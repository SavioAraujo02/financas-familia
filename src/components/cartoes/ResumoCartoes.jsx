export function ResumoCartoes({
    resumoGeral,
    proximasFaturas,
    formatCurrency,
    getStatusColor
  }) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '0 0 20px 0',
          color: '#1a202c'
        }}>
          📊 RESUMO GERAL
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#64748b' }}>💳 {resumoGeral.totalCartoes} cartões ativos</span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#64748b' }}>💰 Limite total:</span>
            <span style={{ fontWeight: '600' }}>{formatCurrency(resumoGeral.limiteTotal)}</span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#64748b' }}>📊 Usado:</span>
            <span style={{ fontWeight: '600', color: getStatusColor(resumoGeral.status) }}>
              {formatCurrency(resumoGeral.totalUsado)} ({resumoGeral.percentualUsado}%)
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#64748b' }}>🟢 Status:</span>
            <span style={{ 
              fontWeight: '600', 
              color: getStatusColor(resumoGeral.status),
              textTransform: 'uppercase'
            }}>
              {resumoGeral.status === 'safe' ? 'SAUDÁVEL' : 
               resumoGeral.status === 'warning' ? 'ATENÇÃO' : 'PERIGO'}
            </span>
          </div>
  
          {/* Próximas Faturas */}
          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 12px 0',
              color: '#374151'
            }}>
              🔮 PRÓXIMAS FATURAS:
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {proximasFaturas.slice(0, 4).map((fatura, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '14px'
                }}>
                  <span style={{ color: '#64748b' }}>
                    {fatura.data}: {fatura.cartao}
                  </span>
                  <span style={{ 
                    fontWeight: '600', 
                    color: fatura.valor > 0 ? '#ef4444' : '#10b981' 
                  }}>
                    {formatCurrency(fatura.valor)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }