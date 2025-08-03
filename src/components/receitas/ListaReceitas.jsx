import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

export function ListaReceitas({ 
  receitas,
  receitasFiltradas,
  viewMode,
  setViewMode,
  editingId,
  setEditingId,
  editData,
  setEditData,
  handleSaveEdit,
  handleOpenSeriesModal,
  handleExport,
  formatCurrency,
  formatDate,
  getStatusIcon,
  getResponsavelIcon,
  evolucaoCalculada,
  insights,
  categoriasPieCalculadas,
  totalMes
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      marginBottom: '24px'
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
          📋 RECEITAS CADASTRADAS
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'tabela', label: '📊 Tabela', icon: '📊' },
            { id: 'grafico', label: '📈 Gráfico', icon: '📈' },
            { id: 'calendario', label: '📅 Calendário', icon: '📅' }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setViewMode(view.id)}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === view.id ? '#10b981' : '#f1f5f9',
                color: viewMode === view.id ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {view.icon} {view.label}
            </button>
          ))}
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

      {/* Visualização Tabela */}
      {viewMode === 'tabela' && (
        <TabelaReceitas 
          receitas={receitas}
          receitasFiltradas={receitasFiltradas}
          editingId={editingId}
          setEditingId={setEditingId}
          editData={editData}
          setEditData={setEditData}
          handleSaveEdit={handleSaveEdit}
          handleOpenSeriesModal={handleOpenSeriesModal}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getStatusIcon={getStatusIcon}
          getResponsavelIcon={getResponsavelIcon}
        />
      )}

      {/* Visualização Gráfico */}
      {viewMode === 'grafico' && (
        <GraficoReceitas 
          evolucaoCalculada={evolucaoCalculada}
          receitas={receitas}
        />
      )}

      {/* Visualização Calendário */}
      {viewMode === 'calendario' && (
        <CalendarioReceitas 
          receitas={receitas}
          receitasFiltradas={receitasFiltradas}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Insights */}
      <InsightsReceitas 
        insights={insights}
      />
    </div>
  )
}

// Componente da Tabela
function TabelaReceitas({ 
  receitas, 
  receitasFiltradas, 
  editingId, 
  setEditingId, 
  editData, 
  setEditData, 
  handleSaveEdit, 
  handleOpenSeriesModal,
  formatCurrency,
  formatDate,
  getStatusIcon,
  getResponsavelIcon
}) {
  const receitasParaExibir = receitasFiltradas.length > 0 ? receitasFiltradas : receitas

  if (receitasParaExibir.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px',
        color: '#64748b'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>💰</div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
          Nenhuma receita cadastrada
        </h3>
        <p style={{ margin: 0 }}>
          Comece adicionando suas fontes de renda acima
        </p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Descrição</th>
            <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Valor</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Data</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Responsável</th>
          </tr>
        </thead>
        <tbody>
          {receitasParaExibir.map((receita, index) => (
            <tr key={receita.id} style={{
              borderBottom: '1px solid #f1f5f9',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <td style={{ padding: '12px' }}>
                <span style={{ fontSize: '16px' }}>
                  {getStatusIcon(receita.status)}
                </span>
              </td>
              <td style={{ padding: '12px', fontWeight: '500' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {receita.recurring_id && (
                    <span style={{
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      🔄 SÉRIE
                    </span>
                  )}
                  
                  {/* EDIÇÃO IN-LINE */}
                  {editingId === receita.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="text"
                        value={editData.description || receita.description}
                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(receita.id)
                          if (e.key === 'Escape') {
                            setEditingId(null)
                            setEditData({})
                          }
                        }}
                        autoFocus
                        style={{
                          border: '2px solid #10b981',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '14px',
                          width: '200px',
                          outline: 'none'
                        }}
                      />
                      <button
                        onClick={() => handleSaveEdit(receita.id)}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        title="Salvar (Enter)"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditData({})
                        }}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        title="Cancelar (Esc)"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span 
                      onClick={() => {
                        setEditingId(receita.id)
                        setEditData(receita)
                      }}
                      style={{ 
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#f0f9ff'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                      title="Clique para editar"
                    >
                      {receita.description}
                    </span>
                  )}
                  {receita.recurring_id && (
                    <button
                      onClick={() => handleOpenSeriesModal(receita.recurring_id)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#3b82f6',
                        padding: '2px 4px'
                      }}
                      title="Gerenciar série"
                    >
                      ⚙️
                    </button>
                  )}
                </div>
              </td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>
                {formatCurrency(receita.amount)}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                {formatDate(receita.date)}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '16px' }}>
                {getResponsavelIcon(receita.responsible || 'voce')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Componente do Gráfico
function GraficoReceitas({ evolucaoCalculada, receitas }) {
  if (evolucaoCalculada.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        color: '#64748b',
        fontSize: '16px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>
          📊
        </div>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
          Carregando dados de evolução...
        </div>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>
          Dados disponíveis: {evolucaoCalculada.length} meses
        </div>
        {receitas.length === 0 && (
          <div style={{ 
            fontSize: '12px', 
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: '#fef3c7',
            borderRadius: '6px',
            color: '#92400e'
          }}>
            💡 Adicione algumas receitas para ver a evolução
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={evolucaoCalculada}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Line 
            type="monotone" 
            dataKey="valor" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Componente do Calendário
function CalendarioReceitas({ receitas, receitasFiltradas, formatCurrency }) {
  const hoje = new Date()
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
  const diasDoMes = []
  
  // Dias vazios do início
  for (let i = 0; i < primeiroDia.getDay(); i++) {
    diasDoMes.push(
      <div key={`empty-${i}`} style={{
        backgroundColor: '#f8fafc',
        minHeight: '80px'
      }} />
    )
  }
  
  // Dias do mês
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    const dataAtual = new Date(hoje.getFullYear(), hoje.getMonth(), dia).toISOString().split('T')[0]
    const receitasParaUsar = receitasFiltradas.length > 0 ? receitasFiltradas : receitas
    const receitasDoDia = receitasParaUsar.filter(r => r.date === dataAtual)
    const totalDoDia = receitasDoDia.reduce((sum, r) => sum + r.amount, 0)
    
    diasDoMes.push(
      <div key={dia} style={{
        backgroundColor: 'white',
        minHeight: '80px',
        padding: '8px',
        position: 'relative',
        cursor: 'pointer',
        border: dia === hoje.getDate() ? '2px solid #10b981' : 'none'
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#1a202c',
        marginBottom: '4px'
      }}>
        {dia}
      </div>
      {receitasDoDia.length > 0 && (
        <>
          <div style={{
            fontSize: '10px',
            color: '#10b981',
            fontWeight: '600'
          }}>
            {formatCurrency(totalDoDia)}
          </div>
          <div style={{
            fontSize: '8px',
            color: '#64748b'
          }}>
            {receitasDoDia.length} receita{receitasDoDia.length > 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  )
}

return (
  <div style={{ padding: '20px 0' }}>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1px',
      backgroundColor: '#e2e8f0',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '20px'
    }}>
      {/* Cabeçalho dos dias da semana */}
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
        <div key={dia} style={{
          backgroundColor: '#1a202c',
          color: 'white',
          padding: '12px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {dia}
        </div>
      ))}
      
      {/* Dias do mês */}
      {diasDoMes}
    </div>
    
    {/* Legenda */}
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      fontSize: '12px',
      color: '#64748b'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#10b981',
          borderRadius: '2px'
        }} />
        Dia com receitas
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{
          width: '12px',
          height: '12px',
          border: '2px solid #10b981',
          borderRadius: '2px'
        }} />
        Hoje
      </div>
    </div>
  </div>
)
}

// Componente dos Insights
function InsightsReceitas({ insights }) {
if (insights.length === 0) {
  return null
}

return (
  <div style={{
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    border: '1px solid #7dd3fc'
  }}>
    {insights.map((insight, index) => (
      <p key={index} style={{
        margin: index === 0 ? '0 0 8px 0' : 0,
        fontSize: '14px',
        color: '#0369a1',
        fontWeight: '500'
      }}>
        {insight}
      </p>
    ))}
  </div>
)
}