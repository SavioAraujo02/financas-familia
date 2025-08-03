export function FiltrosDespesas({
    filtros,
    setFiltros,
    categories,
    despesas,
    despesasFiltradas
  }) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '0 0 16px 0',
          color: '#1a202c'
        }}>
          🔍 FILTROS INTELIGENTES
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '16px'
        }}>
          {/* Período */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              📅 Período:
            </label>
            <select
              value={filtros.periodo}
              onChange={(e) => setFiltros({...filtros, periodo: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="este_mes">📅 Este Mês</option>
              <option value="ultimos_30">📊 Últimos 30 dias</option>
              <option value="todos">🗓️ Todos</option>
            </select>
          </div>
  
          {/* Categoria */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              🏷️ Categoria:
            </label>
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="todas">Todas</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
  
          {/* Responsável */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              👤 Responsável:
            </label>
            <select
              value={filtros.responsavel}
              onChange={(e) => setFiltros({...filtros, responsavel: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="todos">Todos</option>
              <option value="voce">👨 Você</option>
              <option value="esposa">👩 Esposa</option>
              <option value="compartilhado">👨👩 Compartilhado</option>
            </select>
          </div>
  
          {/* Tipo */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              💳 Tipo:
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="todas">Todas</option>
              <option value="avista">💵 À Vista</option>
              <option value="parcelada">💳 Parcelada</option>
              <option value="fixa">📅 Fixa</option>
            </select>
          </div>
        </div>
  
        {/* Busca */}
        <input
          type="text"
          placeholder="🔍 Buscar despesa..."
          value={filtros.busca}
          onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
  
        {/* Resumo dos Filtros */}
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#64748b'
        }}>
          📊 Mostrando {despesasFiltradas.length} de {despesas.length} despesas
        </div>
      </div>
    )
  }