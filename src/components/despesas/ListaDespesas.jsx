import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

export function ListaDespesas({
  despesas,
  despesasFiltradas,
  viewMode,
  setViewMode,
  handleExport,
  gerarDadosEvolucao
}) {
  const [error, setError] = useState(null)

  const handleError = (error, action) => {
    console.error(`Erro ao ${action}:`, error)
    setError(`Erro ao ${action}. Tente novamente.`)
    setTimeout(() => setError(null), 5000)
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '16px',
        color: '#dc2626',
        textAlign: 'center'
      }}>
        ❌ {error}
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          margin: 0,
          color: '#1a202c'
        }}>
          📋 DESPESAS RECENTES
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setViewMode('lista')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'lista' ? '#ef4444' : '#f1f5f9',
              color: viewMode === 'lista' ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📊 Lista
          </button>
          <button
            onClick={() => setViewMode('grafico')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'grafico' ? '#ef4444' : '#f1f5f9',
              color: viewMode === 'grafico' ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📈 Gráfico
          </button>
          <button
            onClick={handleExport}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📤 Exportar
          </button>
        </div>
      </div>

      {despesas.length > 0 ? (
        viewMode === 'lista' ? (
          <TabelaDespesas 
            despesas={despesas}
            despesasFiltradas={despesasFiltradas}
          />
        ) : (
          <GraficoDespesas 
            gerarDadosEvolucao={gerarDadosEvolucao}
          />
        )
      ) : (
        <EstadoVazio />
      )}
    </div>
  )
}

// Componente da Tabela
function TabelaDespesas({ despesas, despesasFiltradas }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Descrição</th>
            <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Valor</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Pagamento</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Data</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Responsável</th>
          </tr>
        </thead>
        <tbody>
          {(despesasFiltradas.length > 0 ? despesasFiltradas : despesas).slice(0, 10).map((despesa, index) => (
            <tr key={despesa.id} style={{
              borderBottom: '1px solid #f1f5f9',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <td style={{ padding: '12px' }}>
                <span style={{ fontSize: '16px' }}>
                  {despesa.status === 'confirmado' ? '✅' : '⏳'}
                </span>
              </td>
              <td style={{ padding: '12px', fontWeight: '500' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {despesa.installments > 1 && (
                    <span style={{
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      💳 {despesa.installment_number || 1}/{despesa.installments}
                    </span>
                  )}
                  <span>{despesa.description}</span>
                </div>
              </td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#ef4444' }}>
                {formatCurrency(despesa.amount)}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                {despesa.payment_method === 'dinheiro' ? '💵' :
                 despesa.payment_method === 'debito' ? '💳' :
                 despesa.payment_method === 'credito' ? '💳' : '💰'}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                {new Date(despesa.date).toLocaleDateString('pt-BR')}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '16px' }}>
                {despesa.responsible === 'voce' ? '👨' :
                 despesa.responsible === 'esposa' ? '👩' : '👨👩'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Componente do Gráfico
function GraficoDespesas({ gerarDadosEvolucao }) {
  return (
    <div style={{ height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={gerarDadosEvolucao()}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Line 
            type="monotone" 
            dataKey="valor" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Componente de Estado Vazio
function EstadoVazio() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px',
      color: '#64748b'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>💸</div>
      <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
        Nenhuma despesa cadastrada
      </h3>
      <p style={{ margin: 0 }}>
        Comece adicionando seus gastos acima
      </p>
    </div>
  )
}