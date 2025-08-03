export function SimuladorImpacto({
    formData,
    simuladorData,
    orcamentoMensal,
    formatCurrency
  }) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '0 0 20px 0',
          color: '#1a202c'
        }}>
          🧮 SIMULADOR DE IMPACTO
        </h3>
  
        {formData.amount && parseFloat(formData.amount) > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              border: '1px solid #fcd34d'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                💰 IMPACTO NO ORÇAMENTO:
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
                +{simuladorData.impactoOrcamento}%
              </div>
              <div style={{ fontSize: '12px', color: '#92400e' }}>
                {formatCurrency(parseFloat(formData.amount))} de {formatCurrency(orcamentoMensal)}
              </div>
            </div>
  
            {simuladorData.faturaDestino && (
              <div style={{
                padding: '16px',
                backgroundColor: '#e0f2fe',
                borderRadius: '8px',
                border: '1px solid #7dd3fc'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>
                  💳 ANÁLISE DE FATURA:
                </div>
                <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '8px' }}>
                  📅 Fatura destino: {simuladorData.faturaDestino}
                </div>
                <div style={{ fontSize: '14px', color: '#0369a1' }}>
                  🔄 {simuladorData.sugestao}
                </div>
              </div>
            )}
  
            {simuladorData.alertas.length > 0 && (
              <div style={{
                padding: '16px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                border: '1px solid #7dd3fc'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>
                  💡 SUGESTÕES:
                </div>
                {simuladorData.alertas.map((alerta, index) => (
                  <div key={index} style={{ fontSize: '14px', color: '#0369a1', marginBottom: '4px' }}>
                    {alerta}
                  </div>
                ))}
              </div>
            )}
  
            <div style={{
              padding: '16px',
              backgroundColor: simuladorData.impactoOrcamento > 10 ? '#fef2f2' : '#f0fdf4',
              borderRadius: '8px',
              border: `1px solid ${simuladorData.impactoOrcamento > 10 ? '#fecaca' : '#bbf7d0'}`
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: simuladorData.impactoOrcamento > 10 ? '#dc2626' : '#166534',
                marginBottom: '8px' 
              }}>
                📊 SITUAÇÃO:
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: simuladorData.impactoOrcamento > 10 ? '#dc2626' : '#166534'
              }}>
                {simuladorData.impactoOrcamento > 10 
                  ? '⚠️ Impacto alto no orçamento' 
                  : '✅ Dentro do planejado'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🧮</div>
            <p style={{ margin: 0 }}>
              Digite um valor para ver o impacto no orçamento
            </p>
          </div>
        )}
      </div>
    )
  }