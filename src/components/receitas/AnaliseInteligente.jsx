import { LineChart, Line, ResponsiveContainer } from 'recharts'

export function AnaliseInteligente({ 
  evolucaoCalculada,
  categoriasPieCalculadas,
  totalMes,
  recurringSeries,
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
      <h2 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        margin: '0 0 24px 0',
        color: '#1a202c'
      }}>
        🧠 ANÁLISE INTELIGENTE
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '24px'
      }}>
        {/* Evolução */}
        <EvolucaoGrafico evolucaoCalculada={evolucaoCalculada} />

        {/* Por Categoria */}
        <PorCategoria 
          categoriasPieCalculadas={categoriasPieCalculadas}
          totalMes={totalMes}
          formatCurrency={formatCurrency}
        />

        {/* Projeção */}
        <ProjecaoInteligente 
          recurringSeries={recurringSeries}
          totalMes={totalMes}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  )
}

// Componente da Evolução
function EvolucaoGrafico({ evolucaoCalculada }) {
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
        {evolucaoCalculada.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolucaoCalculada}>
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#9ca3af',
            fontSize: '14px'
          }}>
            📊 Carregando dados...
          </div>
        )}
      </div>
    </div>
  )
}

// Componente Por Categoria
function PorCategoria({ categoriasPieCalculadas, totalMes, formatCurrency }) {
  return (
    <div>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        margin: '0 0 16px 0',
        color: '#374151'
      }}>
        📊 POR CATEGORIA
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {categoriasPieCalculadas.length > 0 ? (
          categoriasPieCalculadas.map((cat, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '14px'
            }}>
              <span style={{ color: '#64748b' }}>💼 {cat.name}:</span>
              <span style={{ fontWeight: '600', color: cat.color }}>{cat.value}%</span>
            </div>
          ))
        ) : (
          <div style={{ color: '#9ca3af', fontSize: '14px' }}>
            📊 Sem dados de categoria
          </div>
        )}
        <div style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #e2e8f0',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          Total: {formatCurrency(totalMes)}
        </div>
      </div>
    </div>
  )
}

// Componente de Projeção
function ProjecaoInteligente({ recurringSeries, totalMes, formatCurrency }) {
  // Gerar projeções inteligentes
  // Gerar projeções inteligentes REAIS
const gerarProjecoes = () => {
    const hoje = new Date()
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const projecoes = []
    
    // Calcular próximos 4 meses
    for (let i = 1; i <= 4; i++) {
      const dataProjecao = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1)
      const mesNome = mesesNomes[dataProjecao.getMonth()]
      
      // Calcular APENAS receitas recorrentes confirmadas
      const receitasRecorrentes = (recurringSeries || [])
        .filter(s => s.is_active)
        .reduce((sum, s) => sum + s.amount, 0)
      
      let status = 'Normal'
      let cor = '#64748b'
      
      // APENAS previsões baseadas em dados reais
      if (dataProjecao.getMonth() === 11) {
        // Dezembro = 13º salário (baseado na renda atual)
        status = '+13º Salário'
        cor = '#f59e0b'
      } else if (receitasRecorrentes > 0) {
        status = formatCurrency(receitasRecorrentes)
        cor = '#10b981'
      }
      
      projecoes.push({
        mes: mesNome,
        status,
        cor
      })
    }
    
    return projecoes
  }

  const projecoes = gerarProjecoes()

  return (
    <div>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        margin: '0 0 16px 0',
        color: '#374151'
      }}>
        🔮 PROJEÇÃO INTELIGENTE
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
        {projecoes.map((proj, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>{proj.mes}:</span>
            <span style={{ fontWeight: '600', color: proj.cor }}>{proj.status}</span>
          </div>
        ))}
        
        {/* Resumo das receitas recorrentes */}
        {recurringSeries && recurringSeries.length > 0 && (
          <div style={{
            marginTop: '12px',
            paddingTop: '8px',
            borderTop: '1px solid #e2e8f0',
            fontSize: '12px',
            color: '#64748b'
          }}>
            💡 {recurringSeries.filter(s => s.is_active).length} receitas automáticas ativas
          </div>
        )}
      </div>
    </div>
  )
}