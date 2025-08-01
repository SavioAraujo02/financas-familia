'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function ReceitasRevolucionaria() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [receitas, setReceitas] = useState([])
  const [categories, setCategories] = useState([])
  
  // Estados do formulário
  const [formMode, setFormMode] = useState('manual') // 'manual', 'contracheque', 'automatica'
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false)
  const [showContrachequeModal, setShowContrachequeModal] = useState(false)
  const [viewMode, setViewMode] = useState('tabela') // 'tabela', 'grafico', 'calendario'
  
  // Estados dos filtros
  const [filtros, setFiltros] = useState({
    periodo: 'este_mes',
    tipo: 'todas', // 'fixas', 'variaveis', 'todas'
    responsavel: 'todos', // 'voce', 'esposa', 'todos'
    busca: ''
  })

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    status: 'confirmado',
    responsavel: 'voce',
    frequencia: 'unica',
    recorrencia: {
      tipo: 'mensal',
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: '',
      indefinido: true,
      ocorrencias: 12
    }
  })

  // Dados simulados para demonstração
  const metaMensal = 11000
  const totalMes = 10600
  const progressoMeta = Math.round((totalMes / metaMensal) * 100)

  const dadosFamilia = {
    voce: { nome: "Você", total: 6400, percentual: 60.4 },
    esposa: { nome: "Esposa", total: 4200, percentual: 39.6 }
  }

  const proximosRecebimentos = [
    { data: "30/Jul", descricao: "Salário - Você", valor: 6400, responsavel: "voce" },
    { data: "05/Ago", descricao: "Freelance - Design", valor: 800, responsavel: "voce" },
    { data: "15/Ago", descricao: "Salário - Esposa", valor: 4200, responsavel: "esposa" },
    { data: "20/Ago", descricao: "Aluguel Imóvel", valor: 1200, responsavel: "compartilhado" }
  ]

  const evolucaoData = [
    { mes: 'Jan', valor: 9800 },
    { mes: 'Fev', valor: 10200 },
    { mes: 'Mar', valor: 10100 },
    { mes: 'Abr', valor: 10600 },
    { mes: 'Mai', valor: 10800 },
    { mes: 'Jun', valor: 10600 }
  ]

  const categoriasPieData = [
    { name: 'Trabalho', value: 89, color: '#3b82f6' },
    { name: 'Investimentos', value: 8, color: '#10b981' },
    { name: 'Extras', value: 3, color: '#f59e0b' }
  ]

  const finBotDica = "Que tal cadastrar aquele freelance de R$ 800? Vi que você costuma receber no dia 5 de cada mês. Posso criar uma receita recorrente para automatizar! 🤖"

  const insights = [
    "💡 INSIGHT: Receitas extras aumentaram 23% este mês!",
    "🎯 SUGESTÃO: Que tal criar uma meta com esse dinheiro extra de R$ 800?"
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { auth, transactions, categories: categoriesAPI } = await import('@/lib/supabase')
      
      const { user: currentUser } = await auth.getUser()
      if (!currentUser) {
        window.location.href = '/auth/login'
        return
      }
      
      setUser(currentUser)
      setProfile({ name: currentUser.email?.split('@')[0] || 'Usuário' })
      
      // Carregar receitas
      const { data: transactionsData } = await transactions.getAll(currentUser.id)
      const receitasData = (transactionsData || []).filter(t => t.type === 'receita')
      setReceitas(receitasData)
      
      // Carregar categorias de receita
      const { data: categoriesData } = await categoriesAPI.getAll(currentUser.id)
      let receitaCategories = (categoriesData || []).filter(c => c.type === 'receita')
      
      // Se não tem categorias, criar algumas padrões
      if (receitaCategories.length === 0) {
        await createDefaultCategories(currentUser.id, categoriesAPI)
        const { data: newCategoriesData } = await categoriesAPI.getAll(currentUser.id)
        receitaCategories = (newCategoriesData || []).filter(c => c.type === 'receita')
      }
      
      setCategories(receitaCategories)
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultCategories = async (userId, categoriesAPI) => {
    const defaultReceitas = [
      { name: 'Salário Principal', icon: '💼', color: '#3b82f6' },
      { name: 'Freelance', icon: '💻', color: '#10b981' },
      { name: 'Investimentos', icon: '📈', color: '#8b5cf6' },
      { name: 'Vendas Online', icon: '🛒', color: '#f59e0b' },
      { name: 'Aluguéis', icon: '🏠', color: '#059669' },
      { name: 'Outras Receitas', icon: '💰', color: '#06b6d4' }
    ]

    for (const cat of defaultReceitas) {
      await categoriesAPI.create({
        user_id: userId,
        name: cat.name,
        type: 'receita',
        icon: cat.icon,
        color: cat.color
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.description || !formData.amount || !formData.category_id) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    try {
      const { transactions } = await import('@/lib/supabase')
      
      if (formData.frequencia === 'recorrente') {
        // Por enquanto, criar apenas uma receita
        // TODO: Implementar sistema de recorrência com novas tabelas
        setShowRecurrenceModal(true)
        return
      }
      
      const transactionData = {
        user_id: user.id,
        type: 'receita',
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category_id: formData.category_id,
        status: formData.status
      }

      await transactions.create(transactionData)
      await loadData()
      
      // Limpar formulário
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category_id: '',
        status: 'confirmado',
        responsavel: 'voce',
        frequencia: 'unica'
      })
      
    } catch (error) {
      console.error('Erro ao salvar receita:', error)
      alert('Erro ao salvar receita. Tente novamente.')
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmado': return '✅'
      case 'pendente': return '⏳'
      case 'recorrente': return '🔄'
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
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
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
            💰 Carregando sistema de receitas...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '300px' : '80px',
        backgroundColor: '#1a202c',
        transition: 'width 0.3s ease',
        position: 'fixed',
        height: '100vh',
        zIndex: 50,
        borderRight: '1px solid #2d3748',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '24px' }}>
          {/* Logo */}
          <div style={{ marginBottom: '32px', textAlign: sidebarOpen ? 'left' : 'center' }}>
            <h1 style={{ 
              color: 'white', 
              fontSize: sidebarOpen ? '20px' : '24px', 
              fontWeight: 'bold',
              margin: 0,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {sidebarOpen ? '💰 FinançasFamília' : '💰'}
            </h1>
          </div>

          {/* Menu Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { icon: '🏠', label: 'Dashboard', active: false, path: '/dashboard' },
              { icon: '💰', label: 'Receitas', active: true },
              { icon: '📄', label: 'Contracheques', active: false },
              { icon: '💸', label: 'Despesas', active: false },
              { icon: '💳', label: 'Cartões', active: false },
              { icon: '🔮', label: 'Previsão', active: false },
              { icon: '🎯', label: 'Metas', active: false },
              { icon: '📊', label: 'Relatórios', active: false },
              { icon: '📅', label: 'Calendário', active: false },
              { icon: '👥', label: 'Assinaturas', active: false },
              { icon: '🏆', label: 'Conquistas', active: false },
              { icon: '🎮', label: 'Desafios', active: false },
              { icon: '⚙️', label: 'Config', active: false },
              { icon: '🎨', label: 'Tema', active: false }
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (item.path) window.location.href = item.path
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: item.active ? '#10b981' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'left',
                  width: '100%',
                  cursor: 'pointer',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  if (!item.active) e.target.style.backgroundColor = '#2d3748'
                }}
                onMouseOut={(e) => {
                  if (!item.active) e.target.style.backgroundColor = 'transparent'
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {sidebarOpen && item.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          {sidebarOpen && (
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #2d3748' }}>
              <button
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                🚪 Sair
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '300px' : '80px',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header Especializado */}
        <header style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                  💰 RECEITAS
                  <span style={{ fontSize: '18px', opacity: 0.9 }}>
                    | Mês Atual: {formatCurrency(totalMes)}
                    | Meta: {formatCurrency(metaMensal)} ({progressoMeta}%)
                  </span>
                </h1>
              </div>
            </div>

            {/* Barra de Progresso da Meta */}
            <div style={{ 
              minWidth: '200px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '8px 12px'
            }}>
              <div style={{ fontSize: '12px', marginBottom: '4px', textAlign: 'center' }}>
                Meta Mensal: {progressoMeta}%
              </div>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: '8px',
                height: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: 'white',
                  height: '100%',
                  width: `${Math.min(progressoMeta, 100)}%`,
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <div style={{ fontSize: '11px', marginTop: '4px', textAlign: 'center' }}>
                Faltam: {formatCurrency(metaMensal - totalMes)}
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
                  FinBot - Assistente de Receitas
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
          {/* Linha Superior - Formulário + Filtros */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Nova Receita */}
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
                margin: '0 0 20px 0',
                color: '#1a202c',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                💰 NOVA RECEITA
              </h2>

              {/* Abas do Formulário */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '12px'
              }}>
                {[
                  { id: 'manual', label: '📝 Manual', desc: 'Entrada manual' },
                  { id: 'contracheque', label: '📄 Contracheque', desc: 'Upload/OCR' },
                  { id: 'automatica', label: '📊 Automática', desc: 'Recorrente' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFormMode(tab.id)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: formMode === tab.id ? '#10b981' : '#f8fafc',
                      color: formMode === tab.id ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>{tab.label}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>{tab.desc}</div>
                  </button>
                ))}
              </div>

              {/* Formulário Manual */}
              {formMode === 'manual' && (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        📝 Descrição *
                      </label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Salário, Freelance, Aluguel..."
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        💵 Valor (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0,00"
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        🏷️ Categoria *
                      </label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="">Selecione...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        📅 Data
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        👤 Responsável
                      </label>
                      <select
                        value={formData.responsavel}
                        onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="voce">👨 Você</option>
                        <option value="esposa">👩 Esposa</option>
                        <option value="compartilhado">👨👩 Compartilhado</option>
                      </select>
                    </div>
                  </div>

                  {/* Frequência */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      🔄 Frequência
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="frequencia"
                          value="unica"
                          checked={formData.frequencia === 'unica'}
                          onChange={(e) => setFormData({...formData, frequencia: e.target.value})}
                        />
                        ⚡ Única
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="frequencia"
                          value="recorrente"
                          checked={formData.frequencia === 'recorrente'}
                          onChange={(e) => setFormData({...formData, frequencia: e.target.value})}
                        />
                        🔄 Recorrente
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '14px 28px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      💾 SALVAR RECEITA
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        description: '',
                        amount: '',
                        date: new Date().toISOString().split('T')[0],
                        category_id: '',
                        status: 'confirmado',
                        responsavel: 'voce',
                        frequencia: 'unica'
                      })}
                      style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        padding: '14px 28px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      🔄 LIMPAR
                    </button>
                  </div>
                </form>
              )}

              {/* Formulário Contracheque */}
              {formMode === 'contracheque' && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '2px dashed #cbd5e0'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', color: '#1a202c' }}>
                    Upload do Contracheque
                  </h3>
                  <p style={{ color: '#64748b', marginBottom: '20px' }}>
                    Tire uma foto ou faça upload do PDF do seu contracheque
                  </p>
                  
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
                    <button
                      onClick={() => setShowContrachequeModal(true)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      📱 Tirar Foto
                    </button>
                    <button
                      onClick={() => setShowContrachequeModal(true)}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      📄 Upload PDF
                    </button>
                    <button
                      onClick={() => setShowContrachequeModal(true)}
                      style={{
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      🔗 Conectar RH
                    </button>
                  </div>
                  
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Nossa IA extrai automaticamente: salário bruto, descontos (INSS, IR, plano de saúde) e valor líquido
                  </p>
                </div>
              )}

              {/* Formulário Automática */}
              {formMode === 'automatica' && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '12px',
                  border: '2px solid #7dd3fc'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', color: '#0c4a6e' }}>
                    Receita Recorrente
                  </h3>
                  <p style={{ color: '#0369a1', marginBottom: '20px' }}>
                    Configure uma receita que se repete automaticamente
                  </p>
                  
                  <button
                    onClick={() => setShowRecurrenceModal(true)}
                    style={{
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      padding: '16px 32px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ⚙️ CONFIGURAR RECORRÊNCIA
                  </button>
                  
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '16px' }}>
                    Salários, aluguéis, freelances mensais, etc.
                  </p>
                </div>
              )}
            </div>

            {/* Filtros + Resumo */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Filtros Inteligentes */}
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
                        onClick={() => setFiltros({...filtros, periodo: filtro.id})}
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
                        onClick={() => setFiltros({...filtros, responsavel: resp.id})}
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
                    onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Resumo Rápido */}
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
                    <span style={{ fontWeight: '600' }}>{formatCurrency(dadosFamilia.voce.total)} ({dadosFamilia.voce.percentual}%)</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    fontSize: '14px'
                  }}>
                    <span style={{ color: '#64748b' }}>👩 Esposa:</span>
                    <span style={{ fontWeight: '600' }}>{formatCurrency(dadosFamilia.esposa.total)} ({dadosFamilia.esposa.percentual}%)</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    border: '1px solid #fcd34d'
                  }}>
                    <span style={{ fontWeight: '600', color: '#92400e' }}>🎯 Faltam:</span>
                    <span style={{ fontWeight: 'bold', color: '#92400e' }}>{formatCurrency(metaMensal - totalMes)}</span>
                  </div>
                </div>
              </div>

              {/* Previsão Próximos */}
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
                  🔮 PREVISÃO PRÓXIMOS
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {proximosRecebimentos.map((recebimento, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1a202c' }}>
                          {recebimento.data}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '12px' }}>
                          {recebimento.descricao}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', color: '#10b981' }}>
                          {formatCurrency(recebimento.valor)}
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          {getResponsavelIcon(recebimento.responsavel)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#e0f2fe',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#0369a1',
                    fontSize: '14px'
                  }}>
                    Total Agosto: {formatCurrency(11400)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Receitas Cadastradas */}
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
              <div>
                {receitas.length > 0 ? (
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
                        {receitas.map((receita, index) => (
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
                              {receita.description}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>
                              {formatCurrency(receita.amount)}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                              {formatDate(receita.date)}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '16px' }}>
                              👨
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
                    <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>💰</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                      Nenhuma receita cadastrada
                    </h3>
                    <p style={{ margin: 0 }}>
                      Comece adicionando suas fontes de renda acima
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Visualização Gráfico */}
            {viewMode === 'grafico' && (
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolucaoData}>
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
            )}

            {/* Visualização Calendário */}
            {viewMode === 'calendario' && (
              <div style={{
                textAlign: 'center',
                padding: '60px',
                color: '#64748b'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📅</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                  Calendário de Receitas
                </h3>
                <p style={{ margin: 0 }}>
                  Em desenvolvimento - Visualização em calendário com datas de recebimento
                </p>
              </div>
            )}

            {/* Insights */}
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
          </div>

          {/* Análise Inteligente */}
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
                    <LineChart data={evolucaoData}>
                      <Line 
                        type="monotone" 
                        dataKey="valor" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

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
                  {categoriasPieData.map((cat, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: '#64748b' }}>💼 {cat.name}:</span>
                      <span style={{ fontWeight: '600', color: cat.color }}>{cat.value}%</span>
                    </div>
                  ))}
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

              {/* Projeção */}
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 16px 0',
                  color: '#374151'
                }}>
                  🔮 PROJEÇÃO
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Set:</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>+R$ 200</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Out:</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>+R$ 400</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Nov:</span>
                    <span style={{ fontWeight: '600', color: '#64748b' }}>Normal</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Dez:</span>
                    <span style={{ fontWeight: '600', color: '#f59e0b' }}>+13º</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Recorrência */}
      {showRecurrenceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '90%',
            maxWidth: '600px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: 0,
                color: '#1a202c'
              }}>
                🔄 CONFIGURAR RECORRÊNCIA
              </h2>
              <button
                onClick={() => setShowRecurrenceModal(false)}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #7dd3fc',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '0 0 16px 0',
                color: '#0c4a6e'
              }}>
                🎯 SISTEMA DE RECORRÊNCIA
              </h3>
              
              <div style={{ fontSize: '14px', color: '#0369a1', lineHeight: '1.6' }}>
                <p style={{ margin: '0 0 12px 0' }}>
                  <strong>📅 Frequências disponíveis:</strong> Semanal, Quinzenal, Mensal, Trimestral, Anual
                </p>
                <p style={{ margin: '0 0 12px 0' }}>
                  <strong>⚙️ Configurações:</strong> Data início/fim, número de ocorrências, valor variável
                </p>
                <p style={{ margin: 0 }}>
                  <strong>🧠 Inteligente:</strong> Cria automaticamente as receitas futuras e gerencia alterações
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#92400e',
                fontWeight: '500'
              }}>
                ⚠️ Funcionalidade em desenvolvimento! Por enquanto, você pode criar receitas individuais.
                <br />
                Em breve: sistema completo de recorrência com todas as funcionalidades especificadas.
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setShowRecurrenceModal(false)}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Contracheque */}
      {showContrachequeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '90%',
            maxWidth: '700px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: 0,
                color: '#1a202c'
              }}>
                📄 IMPORT CONTRACHEQUE COM IA
              </h2>
              <button
                onClick={() => setShowContrachequeModal(false)}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Simulação de IA */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '0 0 16px 0',
                color: '#166534'
              }}>
                🤖 IA DETECTOU AUTOMATICAMENTE:
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div>
                  <h4 style={{ fontSize: '14px', color: '#166534', margin: '0 0 8px 0' }}>💰 RECEITAS:</h4>
                  <div style={{ fontSize: '13px', color: '#065f46' }}>
                    ├─ Salário Bruto: <strong>R$ 8.500,00</strong><br/>
                    ├─ Horas Extras: <strong>R$ 250,00</strong><br/>
                    ├─ Adicional Noturno: <strong>R$ 180,00</strong><br/>
                    └─ <strong>Total Bruto: R$ 8.930,00</strong>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ fontSize: '14px', color: '#dc2626', margin: '0 0 8px 0' }}>💸 DESCONTOS:</h4>
                  <div style={{ fontSize: '13px', color: '#991b1b' }}>
                    ├─ INSS: <strong>R$ 682,66</strong><br/>
                    ├─ IRRF: <strong>R$ 845,12</strong><br/>
                    ├─ Plano Saúde: <strong>R$ 280,00</strong><br/>
                    ├─ Vale Transporte: <strong>R$ 192,00</strong><br/>
                    └─ <strong>Total Descontos: R$ 1.999,78</strong>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  margin: '0 0 8px 0',
                  color: '#166534'
                }}>
                  ✅ VALOR LÍQUIDO DETECTADO: R$ 6.930,22
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#065f46'
                }}>
                  🎯 Pronto para criar a receita automaticamente!
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#e0f2fe',
              border: '1px solid #7dd3fc',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 12px 0',
                color: '#0c4a6e'
              }}>
                📊 ANÁLISE AUTOMÁTICA:
              </h4>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '14px',
                color: '#0369a1'
              }}>
                <li>Aumento de 3,2% em relação ao mês anterior</li>
                <li>Horas extras aumentaram 15% (boa performance!)</li>
                <li>IRRF está alto - considere investir em previdência</li>
                <li>Desconto do plano de saúde estável</li>
              </ul>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  setShowContrachequeModal(false)
                  // Aqui preencheria o formulário automaticamente
                  setFormData({
                    ...formData,
                    description: 'Salário Julho 2025',
                    amount: '6930.22',
                    category_id: categories.find(c => c.name.includes('Salário'))?.id || ''
                  })
                  setFormMode('manual')
                }}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ✅ Confirmar e Criar Receita
              </button>
              <button
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ✏️ Editar Valores
              </button>
              <button
                onClick={() => setShowContrachequeModal(false)}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ❌ Cancelar
              </button>
            </div>

            <div style={{
              marginTop: '20px',
              fontSize: '12px',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              🤖 Demonstração da IA - Em produção, faria OCR real do documento enviado
            </div>
          </div>
        </div>
      )}

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