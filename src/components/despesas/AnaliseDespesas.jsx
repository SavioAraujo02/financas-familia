import { LineChart, Line, ResponsiveContainer } from 'recharts'

export function AnaliseDespesas({
  despesas,
  totalMes,
  orcamentoMensal,
  progressoOrcamento,
  formatCurrency,
  gerarDadosEvolucao
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      marginTop: '24px'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        margin: '0 0 24px 0',
        color: '#1a202c'
      }}>
        📊 ANÁLISE POR CATEGORIA
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr 1fr',
        gap: '24px'
      }}>
        {/* Evolução 6 Meses */}
        <EvolucaoMeses 
          gerarDadosEvolucao={gerarDadosEvolucao}
        />

        {/* Por Categoria */}
        <PorCategoria 
          despesas={despesas}
          totalMes={totalMes}
        />

        {/* Meta vs Real */}
        <MetaVsReal 
          orcamentoMensal={orcamentoMensal}
          totalMes={totalMes}
          progressoOrcamento={progressoOrcamento}
          formatCurrency={formatCurrency}
        />
      </div>
      {/* Insights Inteligentes */}
      <div style={{
        marginTop: '24px',
        padding: '20px',
        backgroundColor: '#f0f9ff',
        borderRadius: '12px',
        border: '1px solid #7dd3fc'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          margin: '0 0 16px 0',
          color: '#0c4a6e'
        }}>
          🧠 INSIGHTS INTELIGENTES
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
          gap: '16px'
        }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0369a1', margin: '0 0 8px 0' }}>
              📊 COMPARAÇÃO COM MÊS ANTERIOR:
            </h4>
            <div style={{ fontSize: '14px', color: '#0369a1' }}>
              {(() => {
                const mesAnterior = gerarDadosEvolucao().slice(-2, -1)[0]?.valor || 0
                const atual = totalMes
                const diferenca = atual - mesAnterior
                const percentual = mesAnterior > 0 ? ((diferenca / mesAnterior) * 100).toFixed(1) : 0
                
                if (diferenca > 0) {
                  return `📈 Aumento de ${formatCurrency(diferenca)} (${percentual}%)`
                } else if (diferenca < 0) {
                  return `📉 Redução de ${formatCurrency(Math.abs(diferenca))} (${Math.abs(percentual)}%)`
                } else {
                  return `➡️ Manteve o mesmo valor`
                }
              })()}
            </div>
          </div>
          
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0369a1', margin: '0 0 8px 0' }}>
              🎯 RECOMENDAÇÃO:
            </h4>
            <div style={{ fontSize: '14px', color: '#0369a1' }}>
              {progressoOrcamento > 100 
                ? '🚨 Revisar gastos e cortar supérfluos'
                : progressoOrcamento > 80 
                ? '⚠️ Monitorar gastos até fim do mês'
                : '✅ Controle excelente, continue assim!'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente da Evolução
function EvolucaoMeses({ gerarDadosEvolucao }) {
  return (
    <div>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        margin: '0 0 16px 0',
        color: '#374151'
      }}>
        📈 EVOLUÇÃO (6 meses)
      </h3>
      <div style={{ height: '120px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={gerarDadosEvolucao()}>
            <Line 
              type="monotone" 
              dataKey="valor" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Componente Por Categoria
function PorCategoria({ despesas, totalMes }) {
  // Calcular gastos por categoria
  const calcularCategorias = () => {
    const categoriasGastos = {}
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
    
    const despesasMes = despesas.filter(d => 
      d.date >= inicioMes && d.date <= fimMes && d.status === 'confirmado'
    )
    
    despesasMes.forEach(despesa => {
      const categoriaNome = despesa.categories?.name || 'Outros'
      const categoriaIcon = despesa.categories?.icon || '📦'
      
      if (!categoriasGastos[categoriaNome]) {
        categoriasGastos[categoriaNome] = {
          nome: categoriaNome,
          icon: categoriaIcon,
          valor: 0
        }
      }
      categoriasGastos[categoriaNome].valor += despesa.amount
    })
    
    return Object.values(categoriasGastos)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 4)
  }

  const categorias = calcularCategorias()

  return (
    <div>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        margin: '0 0 16px 0',
        color: '#374151'
      }}>
        🏷️ POR CATEGORIA
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {categorias.length > 0 ? (
          categorias.map((cat, index) => {
            const percentual = totalMes > 0 ? ((cat.valor / totalMes) * 100).toFixed(1) : 0
            return (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '14px'
              }}>
                <span style={{ color: '#64748b' }}>{cat.icon} {cat.nome}:</span>
                <span style={{ fontWeight: '600', color: '#ef4444' }}>{percentual}%</span>
              </div>
            )
          })
        ) : (
          <div style={{ color: '#9ca3af', fontSize: '14px' }}>
            📊 Sem dados de categoria
          </div>
        )}
      </div>
    </div>
  )
}

// Componente Meta vs Real
function MetaVsReal({ orcamentoMensal, totalMes, progressoOrcamento, formatCurrency }) {
  return (
    <div>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        margin: '0 0 16px 0',
        color: '#374151'
      }}>
        🎯 META VS REAL
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{
          padding: '12px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
            Meta Orçamento:
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>
            {formatCurrency(orcamentoMensal)}
          </div>
        </div>
        
        <div style={{
          padding: '12px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
            Gasto Real:
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>
            {formatCurrency(totalMes)}
          </div>
        </div>
        
        <div style={{
          padding: '12px',
          backgroundColor: progressoOrcamento > 100 ? '#fef2f2' : '#f0fdf4',
          borderRadius: '8px',
          border: `1px solid ${progressoOrcamento > 100 ? '#fecaca' : '#bbf7d0'}`
        }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
            Situação:
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: progressoOrcamento > 100 ? '#dc2626' : '#166534'
          }}>
            {progressoOrcamento > 100 ? '🚨 Acima' : '✅ Dentro'} do orçamento
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {progressoOrcamento > 100 
              ? `Excesso: ${formatCurrency(totalMes - orcamentoMensal)}`
              : `Restam: ${formatCurrency(orcamentoMensal - totalMes)}`
            }
          </div>
        </div>
      </div>
    </div>
  )
}