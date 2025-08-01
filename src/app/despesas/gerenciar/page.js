'use client'
import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts'
import Sidebar from '@/components/layout/Sidebar'

export default function VisualizarDespesas() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [despesas, setDespesas] = useState([])
  const [categories, setCategories] = useState([])
  const [cartoes, setCartoes] = useState([])
  
  // Estados de visualização
  const [viewMode, setViewMode] = useState('lista') // 'lista', 'cards', 'timeline', 'grafico'
  const [selectedItems, setSelectedItems] = useState([])
  const [showActionMenu, setShowActionMenu] = useState(null)
  
  // Estados de filtros avançados
  const [filtros, setFiltros] = useState({
    periodo: 'este_mes',
    dataInicio: '',
    dataFim: '',
    categorias: [],
    cartoes: [],
    responsavel: 'todos',
    status: 'todas',
    valorMin: '',
    valorMax: '',
    busca: '',
    tipo: 'todas' // 'avista', 'parceladas', 'fixas', 'variaveis'
  })
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Estados de análise
  const [insights, setInsights] = useState([])
  const [resumoFiltrado, setResumoFiltrado] = useState({
    total: 0,
    quantidade: 0,
    variacao: 0
  })

  const finBotDica = "3 contas vencem amanhã. Quer que eu as marque como lembretes?"

  // Carregar dados
  useEffect(() => {
    loadData()
  }, [])

  // Aplicar filtros quando mudarem
  useEffect(() => {
    applyFilters()
  }, [filtros, despesas])

  // Gerar insights quando dados mudarem
  useEffect(() => {
    if (despesasFiltradas.length > 0) {
      generateInsights()
    }
  }, [despesas])

  const loadData = async () => {
    try {
      const { auth, transactions, categories: categoriesAPI, cards } = await import('@/lib/supabase')
      
      const { user: currentUser } = await auth.getUser()
      if (!currentUser) {
        window.location.href = '/auth/login'
        return
      }
      
      setUser(currentUser)
      setProfile({ name: currentUser.email?.split('@')[0] || 'Usuário' })
      
      // Carregar despesas
      const { data: transactionsData } = await transactions.getAll(currentUser.id)
      const despesasData = (transactionsData || []).filter(t => t.type === 'despesa')
      setDespesas(despesasData)
      
      // Carregar categorias
      const { data: categoriesData } = await categoriesAPI.getAll(currentUser.id)
      const despesaCategories = (categoriesData || []).filter(c => c.type === 'despesa')
      setCategories(despesaCategories)
      
      // Carregar cartões
      const { data: cartoesData } = await cards.getAll(currentUser.id)
      setCartoes(cartoesData || [])
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar despesas baseado nos filtros ativos
  const despesasFiltradas = useMemo(() => {
    let filtered = [...despesas]
    
    // Filtro por período
    if (filtros.periodo === 'este_mes') {
      const hoje = new Date()
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
      filtered = filtered.filter(d => {
        const data = new Date(d.date)
        return data >= inicioMes && data <= fimMes
      })
    }
    
    // Filtro por categorias
    if (filtros.categorias.length > 0) {
      filtered = filtered.filter(d => filtros.categorias.includes(d.category_id))
    }
    
    // Filtro por responsável
    if (filtros.responsavel !== 'todos') {
      filtered = filtered.filter(d => d.responsible === filtros.responsavel)
    }
    
    // Filtro por status
    if (filtros.status !== 'todas') {
      filtered = filtered.filter(d => d.status === filtros.status)
    }
    
    // Filtro por valor
    if (filtros.valorMin) {
      filtered = filtered.filter(d => d.amount >= parseFloat(filtros.valorMin))
    }
    if (filtros.valorMax) {
      filtered = filtered.filter(d => d.amount <= parseFloat(filtros.valorMax))
    }
    
    // Filtro por busca
    if (filtros.busca) {
      filtered = filtered.filter(d => 
        d.description.toLowerCase().includes(filtros.busca.toLowerCase())
      )
    }
    
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [despesas, filtros])

  // Paginação
  const totalPages = Math.ceil(despesasFiltradas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const despesasPaginadas = despesasFiltradas.slice(startIndex, startIndex + itemsPerPage)

  const applyFilters = () => {
    const total = despesasFiltradas.reduce((sum, d) => sum + d.amount, 0)
    const quantidade = despesasFiltradas.length
    
    setResumoFiltrado({
      total,
      quantidade,
      variacao: 12 // Simulado - seria calculado vs período anterior
    })
  }

  const generateInsights = () => {
    const novosInsights = [
      "🧠 Vocês gastam 23% mais nos fins de semana",
      "📈 Delivery aumentou 45% este mês",
      "⛽ Gasolina: padrão de R$ 180 a cada 8 dias",
      "🛒 Mercado: sempre entre R$ 300-400 por semana"
    ]
    setInsights(novosInsights.slice(0, 3))
  }

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === despesasPaginadas.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(despesasPaginadas.map(d => d.id))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      alert('Selecione pelo menos um item')
      return
    }

    try {
      const { transactions } = await import('@/lib/supabase')
      
      switch (action) {
        case 'marcar_pagas':
          for (const id of selectedItems) {
            await transactions.update(id, { status: 'confirmado' })
          }
          break
        case 'excluir':
          if (confirm(`Excluir ${selectedItems.length} despesas?`)) {
            for (const id of selectedItems) {
              await transactions.delete(id)
            }
          }
          break
        case 'recategorizar':
          const novaCategoria = prompt('ID da nova categoria:')
          if (novaCategoria) {
            for (const id of selectedItems) {
              await transactions.update(id, { category_id: novaCategoria })
            }
          }
          break
      }
      
      await loadData()
      setSelectedItems([])
      
    } catch (error) {
      console.error('Erro na ação em massa:', error)
      alert('Erro ao executar ação. Tente novamente.')
    }
  }

  const handleItemAction = async (itemId, action) => {
    try {
      const { transactions } = await import('@/lib/supabase')
      
      switch (action) {
        case 'marcar_paga':
          await transactions.update(itemId, { status: 'confirmado' })
          break
        case 'editar':
          // Implementar modal de edição
          alert('Modal de edição em desenvolvimento')
          break
        case 'duplicar':
          const item = despesas.find(d => d.id === itemId)
          if (item) {
            const { id, ...itemData } = item
            await transactions.create({
              ...itemData,
              description: `${item.description} (cópia)`,
              date: new Date().toISOString().split('T')[0]
            })
          }
          break
        case 'excluir':
          if (confirm('Excluir esta despesa?')) {
            await transactions.delete(itemId)
          }
          break
      }
      
      await loadData()
      setShowActionMenu(null)
      
    } catch (error) {
      console.error('Erro na ação do item:', error)
      alert('Erro ao executar ação. Tente novamente.')
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Data', 'Descrição', 'Valor', 'Categoria', 'Status', 'Responsável'],
      ...despesasFiltradas.map(d => [
        new Date(d.date).toLocaleDateString('pt-BR'),
        d.description,
        d.amount.toFixed(2),
        categories.find(c => c.id === d.category_id)?.name || '',
        d.status,
        d.responsible
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `despesas_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmado': return '✅'
      case 'pendente': return '⏳'
      case 'atrasado': return '❌'
      default: return '⏳'
    }
  }

  const getResponsavelIcon = (responsavel) => {
    switch (responsavel) {
      case 'voce': return '👨'
      case 'esposa': return '👩'
      case 'compartilhado': return '👨👩'
      default: return '👨'
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: 'white', fontSize: '18px', fontWeight: '500' }}>
            👁️ Carregando visualização de despesas...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        currentPage="gerenciar"
      />

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '300px' : '80px',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header */}
        <header style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
          padding: '20px 32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ☰
              </button>
              
              <div>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  👁️ GERENCIAR DESPESAS
                  <span style={{ fontSize: '18px', opacity: 0.9 }}>
                    | Total: {formatCurrency(resumoFiltrado.total)} | {resumoFiltrado.quantidade} registros
                  </span>
                </h1>
              </div>
            </div>
          </div>
          
          {/* FinBot */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                padding: '8px',
                fontSize: '20px'
              }}>
                🤖
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '14px' }}>
                  FinBot - Assistente de Análise
                </p>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', opacity: 0.95 }}>
                  {finBotDica}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Filtros Avançados */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 0 20px 0',
              color: '#1a202c'
            }}>
              🔍 FILTROS AVANÇADOS
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>
                  📅 Período
                </label>
                <select
                  value={filtros.periodo}
                  onChange={(e) => setFiltros({...filtros, periodo: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="este_mes">Este Mês</option>
                  <option value="ultimos_3m">Últimos 3 Meses</option>
                  <option value="este_ano">Este Ano</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>
                  👤 Responsável
                </label>
                <select
                  value={filtros.responsavel}
                  onChange={(e) => setFiltros({...filtros, responsavel: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="todos">Ambos</option>
                  <option value="voce">👨 Você</option>
                  <option value="esposa">👩 Esposa</option>
                  <option value="compartilhado">👨👩 Compartilhado</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>
                  📊 Status
                </label>
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros({...filtros, status: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="todas">Todas</option>
                  <option value="confirmado">✅ Pagas</option>
                  <option value="pendente">⏳ Pendentes</option>
                  <option value="atrasado">❌ Atrasadas</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>
                  💰 Valor Mínimo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={filtros.valorMin}
                  onChange={(e) => setFiltros({...filtros, valorMin: e.target.value})}
                  placeholder="R$ 0,00"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>
                  🔍 Buscar
                </label>
                <input
                  type="text"
                  value={filtros.busca}
                  onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
                  placeholder="Netflix, Mercado, etc..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <button
                onClick={() => setFiltros({
                  periodo: 'este_mes',
                  dataInicio: '',
                  dataFim: '',
                  categorias: [],
                  cartoes: [],
                  responsavel: 'todos',
                  status: 'todas',
                  valorMin: '',
                  valorMax: '',
                  busca: '',
                  tipo: 'todas'
                })}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                🔄 Limpar
              </button>
            </div>
          </div>

          {/* Resumo + Ações em Massa */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Resumo Filtrado */}
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
                📊 RESUMO FILTRADO
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#64748b' }}>Selecionadas:</span>
                  <span style={{ fontWeight: '600' }}>{selectedItems.length} itens</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#64748b' }}>Total:</span>
                  <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{formatCurrency(resumoFiltrado.total)}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#64748b' }}>Vs mês passado:</span>
                  <span style={{ fontWeight: '600', color: resumoFiltrado.variacao > 0 ? '#ef4444' : '#10b981' }}>
                    {resumoFiltrado.variacao > 0 ? '+' : ''}{resumoFiltrado.variacao}%
                  </span>
                </div>
              </div>
            </div>

            {/* Ações em Massa */}
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
                ⚡ AÇÕES EM MASSA
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <button
                  onClick={() => handleBulkAction('marcar_pagas')}
                  disabled={selectedItems.length === 0}
                  style={{
                    backgroundColor: selectedItems.length > 0 ? '#10b981' : '#e5e7eb',
                    color: selectedItems.length > 0 ? 'white' : '#9ca3af',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: selectedItems.length > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  ✅ Marcar Pagas
                </button>
                
                <button
                  onClick={() => handleBulkAction('excluir')}
                  disabled={selectedItems.length === 0}
                  style={{
                    backgroundColor: selectedItems.length > 0 ? '#ef4444' : '#e5e7eb',
                    color: selectedItems.length > 0 ? 'white' : '#9ca3af',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: selectedItems.length > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  ❌ Excluir
                </button>
                
                <button
                  onClick={() => handleBulkAction('recategorizar')}
                  disabled={selectedItems.length === 0}
                  style={{
                    backgroundColor: selectedItems.length > 0 ? '#3b82f6' : '#e5e7eb',
                    color: selectedItems.length > 0 ? 'white' : '#9ca3af',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: selectedItems.length > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  🏷️ Recategorizar
                </button>
                
                <button
                  onClick={exportData}
                  style={{
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  📤 Exportar
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Despesas */}
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
                📋 LISTA INTELIGENTE DE DESPESAS
              </h2>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'lista', label: '📋 Lista', icon: '📋' },
                  { id: 'cards', label: '📊 Cards', icon: '📊' },
                  { id: 'timeline', label: '📅 Timeline', icon: '📅' },
                  { id: 'grafico', label: '📈 Gráfico', icon: '📈' }
                ].map(view => (
                  <button
                    key={view.id}
                    onClick={() => setViewMode(view.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: viewMode === view.id ? '#8b5cf6' : '#f1f5f9',
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
              </div>
            </div>

            {/* Visualização Lista */}
            {viewMode === 'lista' && (
              <div>
                {despesasPaginadas.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <th style={{ padding: '12px', textAlign: 'left' }}>
                            <input
                              type="checkbox"
                              checked={selectedItems.length === despesasPaginadas.length && despesasPaginadas.length > 0}
                              onChange={handleSelectAll}
                              style={{ cursor: 'pointer' }}
                            />
                          </th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Descrição</th>
                          <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Valor</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Pagamento</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Data</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Status</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Responsável</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {despesasPaginadas.map((despesa, index) => (
                          <tr key={despesa.id} style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <td style={{ padding: '12px' }}>
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(despesa.id)}
                                onChange={() => handleSelectItem(despesa.id)}
                                style={{ cursor: 'pointer' }}
                              />
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
                                {despesa.recurring_id && (
                                  <span style={{
                                    backgroundColor: '#e0f2fe',
                                    color: '#0369a1',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '600'
                                  }}>
                                    🔄 RECORRENTE
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
                              {getStatusIcon(despesa.status)}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '16px' }}>
                              {getResponsavelIcon(despesa.responsible)}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', position: 'relative' }}>
                              <button
                                onClick={() => setShowActionMenu(showActionMenu === despesa.id ? null : despesa.id)}
                                style={{
                                  backgroundColor: '#f1f5f9',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '6px 8px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                ⚙️
                              </button>
                              
                              {/* Menu de Ações */}
                              {showActionMenu === despesa.id && (
                                <div style={{
                                  position: 'absolute',
                                  top: '100%',
                                  right: '0',
                                  backgroundColor: 'white',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                  zIndex: 10,
                                  minWidth: '180px',
                                  padding: '8px'
                                }}>
                                  <button
                                    onClick={() => handleItemAction(despesa.id, 'marcar_paga')}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      borderRadius: '4px'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f8fafc'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                  >
                                    ✅ Marcar como Paga
                                  </button>
                                  <button
                                    onClick={() => handleItemAction(despesa.id, 'editar')}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      borderRadius: '4px'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f8fafc'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                  >
                                    ✏️ Editar
                                  </button>
                                  <button
                                    onClick={() => handleItemAction(despesa.id, 'duplicar')}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      borderRadius: '4px'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f8fafc'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                  >
                                    📋 Duplicar
                                  </button>
                                  <button
                                    onClick={() => handleItemAction(despesa.id, 'excluir')}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      borderRadius: '4px',
                                      color: '#ef4444'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                  >
                                    ❌ Excluir
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>🔍</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                      Nenhuma despesa encontrada
                    </h3>
                    <p style={{ margin: 0 }}>
                      Ajuste os filtros para ver mais resultados
                    </p>
                  </div>
                )}

                {/* Paginação */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                      Página {currentPage} de {totalPages} | {despesasFiltradas.length} registros
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: currentPage === 1 ? '#f1f5f9' : '#8b5cf6',
                          color: currentPage === 1 ? '#9ca3af' : 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ◀️
                      </button>
                      
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const page = i + 1
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: currentPage === page ? '#8b5cf6' : '#f1f5f9',
                              color: currentPage === page ? 'white' : '#64748b',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            {page}
                          </button>
                        )
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#8b5cf6',
                          color: currentPage === totalPages ? '#9ca3af' : 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ▶️
                      </button>
                      
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(parseInt(e.target.value))
                          setCurrentPage(1)
                        }}
                        style={{
                          padding: '8px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '14px',
                          marginLeft: '16px'
                        }}
                      >
                        <option value="10">10 por página</option>
                        <option value="25">25 por página</option>
                        <option value="50">50 por página</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Visualização Cards */}
            {viewMode === 'cards' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '16px'
              }}>
                {despesasPaginadas.map((despesa) => (
                  <div key={despesa.id} style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          margin: '0 0 4px 0',
                          color: '#1a202c'
                        }}>
                          {despesa.description}
                        </h3>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>
                          {formatCurrency(despesa.amount)}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(despesa.id)}
                        onChange={() => handleSelectItem(despesa.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '14px',
                      color: '#64748b',
                      marginBottom: '12px'
                    }}>
                      <span>
                        {despesa.payment_method === 'dinheiro' ? '💵 Dinheiro' :
                         despesa.payment_method === 'debito' ? '💳 Débito' :
                         '💳 Crédito'}
                      </span>
                      <span>{new Date(despesa.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{getStatusIcon(despesa.status)}</span>
                        <span style={{ fontSize: '16px' }}>{getResponsavelIcon(despesa.responsible)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleItemAction(despesa.id, 'marcar_paga')}
                          style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => handleItemAction(despesa.id, 'editar')}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleItemAction(despesa.id, 'excluir')}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Visualização Timeline */}
            {viewMode === 'timeline' && (
              <div style={{ padding: '20px 0' }}>
                {despesasPaginadas.map((despesa, index) => (
                  <div key={despesa.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 0',
                    borderBottom: index < despesasPaginadas.length - 1 ? '1px solid #f1f5f9' : 'none'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(despesa.id)}
                      onChange={() => handleSelectItem(despesa.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#64748b',
                      minWidth: '80px'
                    }}>
                      {new Date(despesa.date).toLocaleDateString('pt-BR')}
                    </div>
                    
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: despesa.status === 'confirmado' ? '#10b981' : '#f59e0b'
                    }} />
                    
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontWeight: '600', color: '#1a202c' }}>
                          {despesa.description}
                        </span>
                        <span style={{ marginLeft: '8px', color: '#ef4444', fontWeight: '600' }}>
                          {formatCurrency(despesa.amount)}
                        </span>
                        <span style={{ marginLeft: '8px', fontSize: '14px' }}>
                          ({getResponsavelIcon(despesa.responsible)})
                        </span>
                        {despesa.status === 'pendente' && (
                          <span style={{ marginLeft: '8px', fontSize: '14px', color: '#f59e0b' }}>
                            ⏳
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Visualização Gráfico */}
            {viewMode === 'grafico' && (
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={
                    categories.map(cat => ({
                      name: cat.name,
                      valor: despesasFiltradas
                        .filter(d => d.category_id === cat.id)
                        .reduce((sum, d) => sum + d.amount, 0)
                    })).filter(item => item.valor > 0)
                  }>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="valor" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Análise Rápida */}
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
              📊 ANÁLISE RÁPIDA
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '24px'
            }}>
              {/* Por Categoria */}
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
                  {categories.slice(0, 5).map((cat) => {
                    const valor = despesasFiltradas
                      .filter(d => d.category_id === cat.id)
                      .reduce((sum, d) => sum + d.amount, 0)
                    
                    if (valor === 0) return null
                    
                    return (
                      <div key={cat.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '14px'
                      }}>
                        <span style={{ color: '#64748b' }}>{cat.icon} {cat.name}:</span>
                        <span style={{ fontWeight: '600', color: '#ef4444' }}>{formatCurrency(valor)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Tendências */}
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 16px 0',
                  color: '#374151'
                }}>
                  📈 TENDÊNCIAS
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>↗️ Alimentação:</span>
                    <span style={{ fontWeight: '600', color: '#ef4444' }}>+15%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>↘️ Transporte:</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>-8%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>↗️ Lazer:</span>
                    <span style={{ fontWeight: '600', color: '#ef4444' }}>+23%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>📊 Saúde:</span>
                    <span style={{ fontWeight: '600', color: '#64748b' }}>estável</span>
                  </div>
                </div>
              </div>

              {/* Alertas */}
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 16px 0',
                  color: '#374151'
                }}>
                  🎯 ALERTAS
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    border: '1px solid #fcd34d'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                      ⚠️ 3 contas vencem amanhã
                    </div>
                    <div style={{ fontSize: '12px', color: '#92400e' }}>
                      Preparar R$ 565
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#e0f2fe',
                    borderRadius: '8px',
                    border: '1px solid #7dd3fc'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e', marginBottom: '4px' }}>
                      ⏰ Lembrete
                    </div>
                    <div style={{ fontSize: '12px', color: '#0369a1' }}>
                      IPTU vence 30/Jul
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '4px' }}>
                      ✅ Dentro do orçamento
                    </div>
                    <div style={{ fontSize: '12px', color: '#065f46' }}>
                      8% abaixo da meta
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights Inteligentes */}
            {insights.length > 0 && (
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
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {insights.map((insight, index) => (
                    <div key={index} style={{
                      fontSize: '14px',
                      color: '#0369a1',
                      padding: '8px 0',
                      borderBottom: index < insights.length - 1 ? '1px solid rgba(125, 211, 252, 0.3)' : 'none'
                    }}>
                      {insight}
                    </div>
                  ))}
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '16px'
                }}>
                  <button
                    style={{
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    🎯 Aplicar Sugestões
                  </button>
                  <button
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    📊 Ver Detalhes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}