export function ResumoRapido({ 
    totalMes, 
    dadosFamiliaCalculado, 
    metaMensal, 
    formatCurrency, 
    corrigirResponsavelReceitas 
  }) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          margin: '0 0 16px 0',
          color: '#1a202c'
        }}>
          📊 RESUMO RÁPIDO
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
          }}>
            <span style={{ fontWeight: '600', color: '#166534' }}>📊 Total:</span>
            <span style={{ fontWeight: 'bold', color: '#166534' }}>{formatCurrency(totalMes)}</span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            fontSize: '14px'
          }}>
            <span style={{ color: '#64748b' }}>👨 Você:</span>
            <span style={{ fontWeight: '600' }}>{formatCurrency(dadosFamiliaCalculado.voce.total)} ({dadosFamiliaCalculado.voce.percentual}%)</span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            fontSize: '14px'
          }}>
            <span style={{ color: '#64748b' }}>👩 Esposa:</span>
            <span style={{ fontWeight: '600' }}>{formatCurrency(dadosFamiliaCalculado.esposa.total)} ({dadosFamiliaCalculado.esposa.percentual}%)</span>
          </div>
          
          {(() => {
            const diferenca = totalMes - metaMensal
            const metaAtingida = diferenca >= 0
            
            return (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: metaAtingida ? '#f0fdf4' : '#fef3c7',
                borderRadius: '8px',
                border: metaAtingida ? '1px solid #bbf7d0' : '1px solid #fcd34d'
              }}>
                <span style={{ 
                  fontWeight: '600', 
                  color: metaAtingida ? '#166534' : '#92400e' 
                }}>
                  {metaAtingida ? '🎉 Meta atingida!' : '🎯 Faltam:'}
                </span>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: metaAtingida ? '#166534' : '#92400e' 
                }}>
                  {metaAtingida ? `+${formatCurrency(diferenca)}` : formatCurrency(-diferenca)}
                </span>
              </div>
            )
          })()}
          
          {(dadosFamiliaCalculado.voce.total === 0 && dadosFamiliaCalculado.esposa.total === 0 && totalMes > 0) && (
            <button
              onClick={corrigirResponsavelReceitas}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              🔧 Corrigir Responsáveis
            </button>
          )}
        </div>
      </div>
    )
  }