export function FiltrosInteligentes({ 
    filtros, 
    setFiltros, 
    applyFilters, 
    applyAdvancedFilters,
    showFiltroAvancado,
    setShowFiltroAvancado 
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
          🔍 FILTROS INTELIGENTES
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'este_mes', label: '📅 Este Mês' },
              { id: 'fixas', label: '💰 Fixas' },
              { id: 'variaveis', label: '🔄 Variáveis' }
            ].map(filtro => (
              <button
                key={filtro.id}
                onClick={() => {
                  setFiltros({...filtros, periodo: filtro.id})
                  applyFilters(filtro.id, filtros.responsavel, filtros.busca)
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: filtros.periodo === filtro.id ? '#10b981' : '#f1f5f9',
                  color: filtros.periodo === filtro.id ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {filtro.label}
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'voce', label: '👨 Seus' },
              { id: 'esposa', label: '👩 Esposa' }
            ].map(resp => (
              <button
                key={resp.id}
                onClick={() => {
                  setFiltros({...filtros, responsavel: resp.id})
                  applyFilters(filtros.periodo, resp.id, filtros.busca)
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: filtros.responsavel === resp.id ? '#3b82f6' : '#f1f5f9',
                  color: filtros.responsavel === resp.id ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {resp.label}
              </button>
            ))}
          </div>
          
          <input
            type="text"
            placeholder="🔍 Buscar receita..."
            value={filtros.busca}
            onChange={(e) => {
              const novaBusca = e.target.value
              setFiltros({...filtros, busca: novaBusca})
              applyFilters(filtros.periodo, filtros.responsavel, novaBusca)
            }}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                applyFilters(filtros.periodo, filtros.responsavel, e.target.value)
              }
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          
          <button
            onClick={() => setShowFiltroAvancado(!showFiltroAvancado)}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            ⚙️ Filtros Avançados
          </button>
  
          {/* Painel de Filtros Avançados */}
          {showFiltroAvancado && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '8px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  📅 Período Customizado:
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="date"
                    value={filtros.dataInicio || ''}
                    onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                    style={{
                      flex: 1,
                      padding: '6px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}
                  />
                  <input
                    type="date"
                    value={filtros.dataFim || ''}
                    onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                    style={{
                      flex: 1,
                      padding: '6px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}
                  />
                </div>
              </div>
  
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  💰 Valor Mínimo:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={filtros.valorMinimo || ''}
                  onChange={(e) => setFiltros({...filtros, valorMinimo: e.target.value})}
                  placeholder="0,00"
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                />
              </div>
  
              <button
                onClick={() => applyAdvancedFilters()}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                🔍 Aplicar Filtros
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }