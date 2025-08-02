'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts'
import Sidebar from '@/components/layout/Sidebar'

export default function CartoesRevolucionario() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cartoes, setCartoes] = useState([])
  const [showAddCard, setShowAddCard] = useState(false)
  const [showManageCard, setShowManageCard] = useState(null)
  const [viewMode, setViewMode] = useState('lista')
  
  // Estados do formulário de novo cartão
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    credit_limit: '',
    closing_day: '',
    due_day: '',
    holder: 'voce',
    color: 'blue',
    nickname: ''
  })

  // Estados de análise
  const [resumoGeral, setResumoGeral] = useState({
    totalCartoes: 0,
    limiteTotal: 0,
    totalUsado: 0,
    percentualUsado: 0,
    status: 'safe'
  })

  const [proximasFaturas, setProximasFaturas] = useState([])
  const [recomendacoes, setRecomendacoes] = useState([])

  const [finBotDica, setFinBotDica] = useState("Carregando análise inteligente...")

  const bancos = [
    'Nubank', 'Santander', 'Inter', 'C6 Bank', 'Itaú', 'Bradesco', 
    'Banco do Brasil', 'Caixa', 'BTG Pactual', 'XP', 'Outros'
  ]

  const cores = [
    { value: 'blue', label: '🔵 Azul', color: '#3b82f6' },
    { value: 'red', label: '🔴 Vermelho', color: '#ef4444' },
    { value: 'green', label: '🟢 Verde', color: '#10b981' },
    { value: 'purple', label: '🟣 Roxo', color: '#8b5cf6' },
    { value: 'orange', label: '🟠 Laranja', color: '#f59e0b' },
    { value: 'pink', label: '🩷 Rosa', color: '#ec4899' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  // ADICIONAR ESTA FUNÇÃO ANTES DO loadData:
  const gerarFinBotDica = (cartoes, resumo) => {
    if (!cartoes || cartoes.length === 0) {
      return "Adicione seus cartões para receber dicas inteligentes!"
    }
    
    // Encontrar cartão com maior uso
    const cartaoMaisUsado = cartoes.reduce((max, cartao) => 
      (cartao.usage?.usage_percentage || 0) > (max.usage?.usage_percentage || 0) ? cartao : max
    )
    
    // Gerar dica baseada na situação real
    if (cartaoMaisUsado.usage?.usage_percentage > 80) {
      return `${cartaoMaisUsado.name} está ${cartaoMaisUsado.usage.usage_percentage}% usado. Cuidado com novas compras!`
    } else if (cartaoMaisUsado.usage?.usage_percentage > 60) {
      return `${cartaoMaisUsado.name} está ${cartaoMaisUsado.usage.usage_percentage}% usado. Monitore os gastos.`
    } else if (resumo.percentualUsado < 30) {
      return `Excelente controle! Apenas ${resumo.percentualUsado}% dos limites utilizados.`
    } else {
      return `Situação estável. ${resumo.totalCartoes} cartões com ${resumo.percentualUsado}% de uso médio.`
    }
  }

  // ADICIONAR ESTA FUNÇÃO ANTES DO loadData:
  const handleSaveConfig = async (cartaoId, config) => {
    try {
      const { cards } = await import('@/lib/supabase')
      
      await cards.update(cartaoId, {
        alert_percentage: config.alertPercentage,
        alert_days_before: config.alertDays,
        alert_amount_limit: config.alertAmount
      })
      
      alert('Configurações salvas com sucesso!')
      await loadData() // Recarregar dados
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações. Tente novamente.')
    }
  }

  const loadData = async () => {
    try {
      const { auth, cards, transactions } = await import('@/lib/supabase')
      
      const { user: currentUser } = await auth.getUser()
      if (!currentUser) {
        window.location.href = '/auth/login'
        return
      }
      
      setUser(currentUser)
      setProfile({ name: currentUser.email?.split('@')[0] || 'Usuário' })
      
      // Carregar cartões reais do Supabase
      const { data: cartoesData } = await cards.getAll(currentUser.id)
      
      if (cartoesData && cartoesData.length > 0) {
        // Buscar transações para calcular uso real
        const { data: todasTransacoes } = await transactions.getAll(currentUser.id)

        // Calcular uso real para cada cartão baseado em transações
        const cartoesComUso = cartoesData.map(cartao => {
          // Filtrar transações deste cartão
          const transacoesCartao = (todasTransacoes || []).filter(t => 
            t.card_id === cartao.id && 
            t.type === 'despesa' && 
            t.status === 'confirmado'
          )
          
          // Calcular valor usado real
          const usedAmount = transacoesCartao.reduce((sum, t) => {
            if (t.installments > 1) {
              // Para parceladas, considerar parcelas restantes
              const parcelasRestantes = t.installments - (t.installment_number || 1) + 1
              return sum + ((t.amount / t.installments) * parcelasRestantes)
            }
            return sum + t.amount
          }, 0)
          
          const usagePercentage = cartao.credit_limit > 0 ? 
            Math.round((usedAmount / cartao.credit_limit) * 100) : 0
          
          let status = 'safe'
          if (usagePercentage > 80) status = 'danger'
          else if (usagePercentage > 60) status = 'warning'
          
          return {
            ...cartao,
            usage: {
              used_amount: usedAmount,
              available_amount: cartao.credit_limit - usedAmount,
              usage_percentage: usagePercentage,
              status
            }
          }
        })
        
        setCartoes(cartoesComUso)
        
        // Calcular resumo geral
        const limiteTotal = cartoesComUso.reduce((sum, c) => sum + (c.credit_limit || 0), 0)
        const totalUsado = cartoesComUso.reduce((sum, c) => sum + (c.used_amount || 0), 0)
        const percentualUsado = limiteTotal > 0 ? Math.round((totalUsado / limiteTotal) * 100) : 0
        
        let status = 'safe'
        if (percentualUsado > 70) status = 'danger'
        else if (percentualUsado > 50) status = 'warning'
        
        setResumoGeral({
          totalCartoes: cartoesComUso.length,
          limiteTotal,
          totalUsado,
          percentualUsado,
          status
        })

        // ADICIONAR AQUI ⬇️
        const dica = gerarFinBotDica(cartoesComUso, {
          totalCartoes: cartoesComUso.length,
          limiteTotal,
          totalUsado,
          percentualUsado,
          status
        })
        setFinBotDica(dica)

      } else {
        // Se não tem cartões, manter dados simulados para demonstração
        setCartoes([])
        setResumoGeral({
          totalCartoes: 0,
          limiteTotal: 0,
          totalUsado: 0,
          percentualUsado: 0,
          status: 'safe'
        })
      }
      
      // Calcular próximas faturas REAIS
      const proximasFaturasReais = cartoesComUso.map(cartao => {
        // Filtrar transações do mês atual
        const hoje = new Date()
        const transacoesMesAtual = (todasTransacoes || []).filter(t => 
          t.card_id === cartao.id && 
          t.type === 'despesa' && 
          t.status === 'confirmado' &&
          new Date(t.date).getMonth() === hoje.getMonth() &&
          new Date(t.date).getFullYear() === hoje.getFullYear()
        )
        
        // Calcular valor da fatura
        const valorFatura = transacoesMesAtual.reduce((sum, t) => {
          if (t.installments > 1) {
            return sum + (t.amount / t.installments)
          }
          return sum + t.amount
        }, 0)
        
        // Calcular próxima data de vencimento
        const proximoVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), cartao.due_day)
        if (proximoVencimento < hoje) {
          proximoVencimento.setMonth(proximoVencimento.getMonth() + 1)
        }
        
        return {
          data: proximoVencimento.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          cartao: cartao.name,
          valor: valorFatura,
          cor: cartao.color || '#6b7280'
        }
      })

      setProximasFaturas(proximasFaturasReais.sort((a, b) => new Date(a.data) - new Date(b.data)))
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      // ADICIONAR ANTES DO } finally {:
      const dica = gerarFinBotDica(cartoesComUso, {
        totalCartoes: cartoesComUso.length,
        limiteTotal,
        totalUsado,
        percentualUsado,
        status
      })
      setFinBotDica(dica)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.credit_limit || !formData.closing_day || !formData.due_day) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }
  
    try {
      const { cards } = await import('@/lib/supabase')
      
      const cardData = {
        user_id: user.id,
        name: formData.name,
        bank: formData.bank || formData.name,
        credit_limit: parseFloat(formData.credit_limit),
        used_amount: 0, // Iniciar com 0
        closing_day: parseInt(formData.closing_day),
        due_day: parseInt(formData.due_day),
        holder: formData.holder,
        color: formData.color,
        nickname: formData.nickname || formData.name,
        is_active: true
      }
  
      await cards.create(cardData)
      await loadData() // Recarregar dados
      
      // Limpar formulário
      setFormData({
        name: '',
        bank: '',
        credit_limit: '',
        closing_day: '',
        due_day: '',
        holder: 'voce',
        color: 'blue',
        nickname: ''
      })
      
      setShowAddCard(false)
      alert('Cartão adicionado com sucesso!')
      
    } catch (error) {
      console.error('Erro ao salvar cartão:', error)
      alert('Erro ao salvar cartão. Tente novamente.')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe': return '#10b981'
      case 'warning': return '#f59e0b'
      case 'danger': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (percentage) => {
    if (percentage > 80) return '🔴'
    if (percentage > 60) return '🟡'
    return '🟢'
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
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
            💳 Carregando sistema de cartões...
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
        currentPage="cartoes"
      />

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '300px' : '80px',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header */}
        <header style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
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
                  💳 CARTÕES
                  <span style={{ fontSize: '18px', opacity: 0.9 }}>
                    | Total Usado: {formatCurrency(resumoGeral.totalUsado)} | Limite: {formatCurrency(resumoGeral.limiteTotal)} ({resumoGeral.percentualUsado}%)
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
                  FinBot - Assistente de Cartões
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
          {/* Linha Superior - Resumo + Novo Cartão */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Resumo Geral */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '0 0 20px 0',
                color: '#1a202c'
              }}>
                📊 RESUMO GERAL
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#64748b' }}>💳 {resumoGeral.totalCartoes} cartões ativos</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#64748b' }}>💰 Limite total:</span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(resumoGeral.limiteTotal)}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#64748b' }}>📊 Usado:</span>
                  <span style={{ fontWeight: '600', color: getStatusColor(resumoGeral.status) }}>
                    {formatCurrency(resumoGeral.totalUsado)} ({resumoGeral.percentualUsado}%)
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#64748b' }}>🟢 Status:</span>
                  <span style={{ 
                    fontWeight: '600', 
                    color: getStatusColor(resumoGeral.status),
                    textTransform: 'uppercase'
                  }}>
                    {resumoGeral.status === 'safe' ? 'SAUDÁVEL' : 
                     resumoGeral.status === 'warning' ? 'ATENÇÃO' : 'PERIGO'}
                  </span>
                </div>

                {/* Próximas Faturas */}
                <div style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 12px 0',
                    color: '#374151'
                  }}>
                    🔮 PRÓXIMAS FATURAS:
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {proximasFaturas.slice(0, 4).map((fatura, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '14px'
                      }}>
                        <span style={{ color: '#64748b' }}>
                          {fatura.data}: {fatura.cartao}
                        </span>
                        <span style={{ 
                          fontWeight: '600', 
                          color: fatura.valor > 0 ? '#ef4444' : '#10b981' 
                        }}>
                          {formatCurrency(fatura.valor)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Novo Cartão */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '0 0 20px 0',
                color: '#1a202c'
              }}>
                💳 NOVO CARTÃO
              </h2>

              {!showAddCard ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
                  <p style={{ color: '#64748b', marginBottom: '20px' }}>
                    Adicione um novo cartão de crédito para melhor controle
                  </p>
                  <button
                    onClick={() => setShowAddCard(true)}
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
                    ➕ ADICIONAR CARTÃO
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        🏦 Banco *
                      </label>
                      <select
                        value={formData.bank}
                        onChange={(e) => setFormData({...formData, bank: e.target.value, name: e.target.value})}
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
                        <option value="">Selecione o banco...</option>
                        {bancos.map(banco => (
                          <option key={banco} value={banco}>{banco}</option>
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
                        📛 Apelido
                      </label>
                      <input
                        type="text"
                        value={formData.nickname}
                        onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                        placeholder="Ex: Cartão Principal, Raimundo..."
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
                        💰 Limite (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.credit_limit}
                        onChange={(e) => setFormData({...formData, credit_limit: e.target.value})}
                        placeholder="5000.00"
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '6px'
                        }}>
                          📅 Fecha dia *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={formData.closing_day}
                          onChange={(e) => setFormData({...formData, closing_day: e.target.value})}
                          placeholder="15"
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
                          📅 Vence dia *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={formData.due_day}
                          onChange={(e) => setFormData({...formData, due_day: e.target.value})}
                          placeholder="08"
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '6px'
                        }}>
                          👤 Titular
                        </label>
                        <select
                          value={formData.holder}
                          onChange={(e) => setFormData({...formData, holder: e.target.value})}
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

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '6px'
                        }}>
                          🎨 Cor
                        </label>
                        <select
                          value={formData.color}
                          onChange={(e) => setFormData({...formData, color: e.target.value})}
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
                          {cores.map(cor => (
                            <option key={cor.value} value={cor.value}>{cor.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '12px 20px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          flex: 1
                        }}
                      >
                        💾 ADICIONAR CARTÃO
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCard(false)}
                        style={{
                          backgroundColor: '#6b7280',
                          color: 'white',
                          padding: '12px 20px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Cartões Ativos */}
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
                💳 CARTÕES ATIVOS
              </h2>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'lista', label: '📋 Lista', icon: '📋' },
                  { id: 'grafico', label: '📊 Gráfico', icon: '📊' },
                  { id: 'timeline', label: '📅 Timeline', icon: '📅' },
                  { id: 'config', label: '⚙️ Configurar', icon: '⚙️' }
                ].map(view => (
                  <button
                    key={view.id}
                    onClick={() => setViewMode(view.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: viewMode === view.id ? '#3b82f6' : '#f1f5f9',
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
                {cartoes.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {cartoes.map((cartao, index) => (
                      <div key={cartao.id} style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '20px',
                        backgroundColor: '#f8fafc',
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
                          marginBottom: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: cores.find(c => c.value === cartao.color)?.color || '#3b82f6'
                            }} />
                            <h3 style={{
                              fontSize: '18px',
                              fontWeight: 'bold',
                              margin: 0,
                              color: '#1a202c'
                            }}>
                              💳 {cartao.nickname || cartao.name}
                              {cartao.bank !== cartao.name && (
                                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>
                                  {' '}({cartao.bank})
                                </span>
                              )}
                            </h3>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => setShowManageCard(cartao.id)}
                              style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              🔧 Gerenciar
                            </button>
                            <button
                              style={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              📊
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {/* Uso do Cartão */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b', minWidth: '120px' }}>
                              💰 Usado:
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '4px'
                              }}>
                                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                                  {formatCurrency(cartao.usage?.used_amount || 0)} / {formatCurrency(cartao.credit_limit)}
                                </span>
                                <span style={{
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  color: getStatusColor(cartao.usage?.status || 'safe')
                                }}>
                                  ({cartao.usage?.usage_percentage || 0}%) {getStatusIcon(cartao.usage?.usage_percentage || 0)}
                                </span>
                              </div>
                              <div style={{
                                backgroundColor: '#e2e8f0',
                                borderRadius: '6px',
                                height: '8px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  backgroundColor: getStatusColor(cartao.usage?.status || 'safe'),
                                  height: '100%',
                                  width: `${cartao.usage?.usage_percentage || 0}%`,
                                  transition: 'width 0.5s ease'
                                }} />
                              </div>
                            </div>
                          </div>

                          {/* Datas */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b', minWidth: '120px' }}>
                              📅 Fecha | Vence:
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>
                              dia {cartao.closing_day} | dia {cartao.due_day}
                              <span style={{ color: '#64748b', fontWeight: 'normal' }}>
                                {' '}(+{Math.abs(cartao.due_day - new Date().getDate())} dias)
                              </span>
                            </span>
                          </div>

                          {/* Fatura Atual */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b', minWidth: '120px' }}>
                              📈 Fatura Jul:
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>
                              {formatCurrency(proximasFaturas.find(f => f.cartao.toLowerCase().includes(cartao.name.toLowerCase()))?.valor || 0)}
                              <span style={{ color: '#64748b', fontWeight: 'normal' }}>
                                {' '}({Math.round(((proximasFaturas.find(f => f.cartao.toLowerCase().includes(cartao.name.toLowerCase()))?.valor || 0) / cartao.credit_limit) * 100)}% do limite)
                              </span>
                            </span>
                          </div>

                          {/* Status */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b', minWidth: '120px' }}>
                              {cartao.usage?.status === 'danger' ? '⚠️' : cartao.usage?.status === 'warning' ? '⏳' : '✅'} Status:
                            </span>
                            <span style={{ 
                              fontSize: '14px', 
                              fontWeight: '600',
                              color: getStatusColor(cartao.usage?.status || 'safe')
                            }}>
                              {cartao.usage?.status === 'danger' ? 'Uso alto! Evitar novas compras' :
                               cartao.usage?.status === 'warning' ? 'Moderado - Cuidado com gastos' :
                               'Ótimo para novas compras'}
                            </span>
                          </div>

                          {/* Previsão */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b', minWidth: '120px' }}>
                              🎯 Previsão Ago:
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#8b5cf6' }}>
                              {formatCurrency((proximasFaturas.find(f => f.cartao.toLowerCase().includes(cartao.name.toLowerCase()))?.valor || 0) * 0.8)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>💳</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                      Nenhum cartão cadastrado
                    </h3>
                    <p style={{ margin: 0 }}>
                      Adicione seus cartões de crédito para melhor controle
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Visualização Gráfico */}
            {viewMode === 'grafico' && (
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cartoes.map(c => ({
                    name: c.nickname || c.name,
                    usado: c.usage?.used_amount || 0,
                    limite: c.credit_limit,
                    percentual: c.usage?.usage_percentage || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="usado" fill="#ef4444" name="Usado" />
                    <Bar dataKey="limite" fill="#e2e8f0" name="Limite" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Visualização Timeline */}
            {viewMode === 'timeline' && (
              <div style={{ padding: '20px 0' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 20px 0',
                  color: '#374151'
                }}>
                  📅 CALENDÁRIO DE VENCIMENTOS
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {proximasFaturas.map((fatura, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#64748b',
                        minWidth: '80px'
                      }}>
                                                {fatura.data}
                      </div>
                      
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: fatura.cor
                      }} />
                      
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontWeight: '600', color: '#1a202c' }}>
                            💳 {fatura.cartao}
                          </span>
                          <span style={{ 
                            fontWeight: 'bold', 
                            color: fatura.valor > 0 ? '#ef4444' : '#10b981',
                            fontSize: '16px'
                          }}>
                            {formatCurrency(fatura.valor)}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                          Status: {fatura.valor > 1000 ? '⚠️ Valor alto' : 
                                  fatura.valor === 0 ? '✅ Sem gastos' : '🟡 Moderado'}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#e0f2fe',
                    borderRadius: '8px',
                    border: '1px solid #7dd3fc',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0c4a6e' }}>
                      💰 TOTAL PRÓXIMOS 30 DIAS: {formatCurrency(proximasFaturas.reduce((sum, f) => sum + f.valor, 0))}
                    </div>
                    <div style={{ fontSize: '14px', color: '#0369a1', marginTop: '4px' }}>
                    🎯 {(() => {
                      const totalFaturas = proximasFaturas.reduce((sum, f) => sum + f.valor, 0)
                      return profile?.monthly_income > 0 ? 
                        Math.round((totalFaturas / profile.monthly_income) * 100) : 0
                    })()}% da renda familiar
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Visualização Configurações */}
            {viewMode === 'config' && (
              <div style={{ padding: '20px 0' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 20px 0',
                  color: '#374151'
                }}>
                  ⚙️ CONFIGURAÇÕES AVANÇADAS
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  {cartoes.map((cartao) => (
                    <div key={cartao.id} style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        margin: '0 0 16px 0',
                        color: '#1a202c',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: cores.find(c => c.value === cartao.color)?.color || '#3b82f6'
                        }} />
                        💳 {cartao.nickname || cartao.name}
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                            🔔 Avisar quando usar mais que:
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="range"
                              min="30"
                              max="90"
                              defaultValue="60"
                              style={{ flex: 1 }}
                            />
                            <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '40px' }}>60%</span>
                          </div>
                        </div>
                        
                        <div>
                          <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                            📅 Lembrar fatura:
                          </label>
                          <select style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}>
                            <option value="3">3 dias antes</option>
                            <option value="5">5 dias antes</option>
                            <option value="7">7 dias antes</option>
                          </select>
                        </div>
                        
                        <div>
                          <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                            💰 Alertar se fatura maior que:
                          </label>
                          <input
                            type="number"
                            defaultValue="1000"
                            placeholder="1000.00"
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input type="checkbox" id={`block-${cartao.id}`} />
                          <label htmlFor={`block-${cartao.id}`} style={{ fontSize: '14px', color: '#64748b' }}>
                            🚫 Bloquear novas compras se {'>'}80%
                          </label>
                        </div>
                        
                        <button
                          onClick={() => {
                            // Coletar valores dos inputs
                            const alertPercentage = document.querySelector(`#alert-${cartao.id}`).value
                            const alertDays = document.querySelector(`#days-${cartao.id}`).value
                            const alertAmount = document.querySelector(`#amount-${cartao.id}`).value
                            
                            handleSaveConfig(cartao.id, {
                              alertPercentage: parseInt(alertPercentage),
                              alertDays: parseInt(alertDays),
                              alertAmount: parseFloat(alertAmount)
                            })
                          }}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            marginTop: '8px'
                          }}
                        >
                          💾 Salvar Configurações
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              {/* Uso por Cartão */}
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 16px 0',
                  color: '#374151'
                }}>
                  📊 USO POR CARTÃO:
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cartoes.map((cartao) => (
                    <div key={cartao.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: '#64748b' }}>
                        {cartao.nickname || cartao.name}:
                      </span>
                      <span style={{ 
                        fontWeight: '600', 
                        color: getStatusColor(cartao.usage?.status || 'safe')
                      }}>
                        {cartao.usage?.usage_percentage || 0}% {getStatusIcon(cartao.usage?.usage_percentage || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recomendações */}
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 16px 0',
                  color: '#374151'
                }}>
                  🎯 RECOMENDAÇÕES:
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  {(() => {
                    if (cartoes.length === 0) {
                      return <div style={{ color: '#64748b' }}>• Adicione cartões para ver recomendações</div>
                    }
                    
                    const recomendacoes = []
                    
                    // Cartão com menor uso
                    const cartaoMenorUso = cartoes.reduce((min, cartao) => 
                      (cartao.usage?.usage_percentage || 0) < (min.usage?.usage_percentage || 0) ? cartao : min
                    )
                    
                    // Cartão com maior uso
                    const cartaoMaiorUso = cartoes.reduce((max, cartao) => 
                      (cartao.usage?.usage_percentage || 0) > (max.usage?.usage_percentage || 0) ? cartao : max
                    )
                    
                    // Cartão com maior limite
                    const cartaoMaiorLimite = cartoes.reduce((max, cartao) => 
                      (cartao.credit_limit || 0) > (max.credit_limit || 0) ? cartao : max
                    )
                    
                    if (cartaoMenorUso.usage?.usage_percentage < 30) {
                      recomendacoes.push(`• Use o ${cartaoMenorUso.nickname || cartaoMenorUso.name} para compras à vista`)
                    }
                    
                    if (cartaoMaiorUso.usage?.usage_percentage > 70) {
                      recomendacoes.push(`• Evite ${cartaoMaiorUso.nickname || cartaoMaiorUso.name} até baixar de 60%`)
                    }
                    
                    if (cartaoMaiorLimite.credit_limit > 3000) {
                      recomendacoes.push(`• ${cartaoMaiorLimite.nickname || cartaoMaiorLimite.name} ideal para parcelamentos`)
                    }
                    
                    if (recomendacoes.length === 0) {
                      recomendacoes.push('• Situação equilibrada em todos os cartões')
                    }
                    
                    return recomendacoes.map((rec, index) => (
                      <div key={index} style={{ color: '#64748b' }}>{rec}</div>
                    ))
                  })()}
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
                  📈 TENDÊNCIAS:
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  {(() => {
                    if (cartoes.length === 0) {
                      return <div style={{ color: '#64748b' }}>Adicione cartões para ver tendências</div>
                    }
                    
                    const tendencias = []
                    
                    // Análise baseada nos dados reais
                    const usoMedio = cartoes.reduce((sum, c) => sum + (c.usage?.usage_percentage || 0), 0) / cartoes.length
                    
                    // Uso geral
                    if (usoMedio > 50) {
                      tendencias.push({ label: 'Uso Geral:', valor: 'Alto', cor: '#ef4444' })
                    } else if (usoMedio > 30) {
                      tendencias.push({ label: 'Uso Geral:', valor: 'Moderado', cor: '#f59e0b' })
                    } else {
                      tendencias.push({ label: 'Uso Geral:', valor: 'Baixo', cor: '#10b981' })
                    }
                    
                    // Situação dos limites
                    const limiteTotal = cartoes.reduce((sum, c) => sum + (c.credit_limit || 0), 0)
                    if (limiteTotal > 15000) {
                      tendencias.push({ label: 'Limites:', valor: 'Altos', cor: '#10b981' })
                    } else if (limiteTotal > 8000) {
                      tendencias.push({ label: 'Limites:', valor: 'Moderados', cor: '#f59e0b' })
                    } else {
                      tendencias.push({ label: 'Limites:', valor: 'Baixos', cor: '#ef4444' })
                    }
                    
                    // Diversificação
                    if (cartoes.length >= 4) {
                      tendencias.push({ label: 'Diversificação:', valor: 'Excelente', cor: '#10b981' })
                    } else if (cartoes.length >= 2) {
                      tendencias.push({ label: 'Diversificação:', valor: 'Boa', cor: '#f59e0b' })
                    } else {
                      tendencias.push({ label: 'Diversificação:', valor: 'Limitada', cor: '#ef4444' })
                    }
                    
                    // Situação geral
                    const cartoesPerigosos = cartoes.filter(c => (c.usage?.usage_percentage || 0) > 80).length
                    if (cartoesPerigosos === 0) {
                      tendencias.push({ label: 'Situação:', valor: 'Controlada', cor: '#10b981' })
                    } else {
                      tendencias.push({ label: 'Situação:', valor: 'Atenção', cor: '#ef4444' })
                    }
                    
                    return tendencias.map((tend, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>{tend.label}</span>
                        <span style={{ fontWeight: '600', color: tend.cor }}>{tend.valor}</span>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Gerenciar Cartão */}
      {showManageCard && (
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
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {(() => {
              const cartao = cartoes.find(c => c.id === showManageCard)
              if (!cartao) return null
              
              return (
                <>
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
                      🔧 GERENCIAR: {cartao.nickname || cartao.name}
                    </h2>
                    <button
                      onClick={() => setShowManageCard(null)}
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

                  {/* Informações Básicas */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      margin: '0 0 16px 0',
                      color: '#1a202c'
                    }}>
                      💳 INFORMAÇÕES BÁSICAS:
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b' }}>🏦 Banco:</span>
                        <span style={{ fontWeight: '600' }}>{cartao.bank}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>📛 Apelido:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600' }}>{cartao.nickname || cartao.name}</span>
                          <button style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}>
                            ✏️ Editar
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>💰 Limite:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600' }}>{formatCurrency(cartao.credit_limit)}</span>
                          <button style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}>
                            ✏️ Alterar
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>📅 Fechamento:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600' }}>dia {cartao.closing_day}</span>
                          <button style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}>
                            ✏️ Alterar
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>📅 Vencimento:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600' }}>dia {cartao.due_day}</span>
                          <button style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}>
                            ✏️ Alterar
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>👤 Titular:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600' }}>
                            {cartao.holder === 'voce' ? '👨 Você' : 
                             cartao.holder === 'esposa' ? '👩 Esposa' : '👨👩 Compartilhado'}
                          </span>
                          <button style={{
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}>
                            👩 Transferir
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>🎨 Cor:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: cores.find(c => c.value === cartao.color)?.color || '#3b82f6'
                            }} />
                            <span style={{ fontWeight: '600' }}>
                              {cores.find(c => c.value === cartao.color)?.label || '🔵 Azul'}
                            </span>
                          </div>
                          <button style={{
                            backgroundColor: '#ec4899',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}>
                            🎨 Mudar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Atual */}
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid #7dd3fc'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      margin: '0 0 16px 0',
                      color: '#0c4a6e'
                    }}>
                      📊 STATUS ATUAL:
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#0369a1' }}>💰 Disponível:</span>
                        <span style={{ fontWeight: '600', color: '#10b981' }}>
                          {formatCurrency(cartao.usage?.available_amount || cartao.credit_limit)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#0369a1' }}>🔒 Usado:</span>
                        <span style={{ fontWeight: '600', color: '#ef4444' }}>
                          {formatCurrency(cartao.usage?.used_amount || 0)} ({cartao.usage?.usage_percentage || 0}%)
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#0369a1' }}>⚠️ Situação:</span>
                        <span style={{ 
                          fontWeight: '600', 
                          color: getStatusColor(cartao.usage?.status || 'safe'),
                          textTransform: 'uppercase'
                        }}>
                          {cartao.usage?.status === 'danger' ? 'ATENÇÃO - Uso alto' :
                           cartao.usage?.status === 'warning' ? 'MODERADO' : 'NORMAL'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#0369a1' }}>📈 Tendência:</span>
                        <span style={{ fontWeight: '600', color: '#f59e0b' }}>
                          Crescendo 12%/mês
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Previsões */}
                  <div style={{
                    backgroundColor: '#fef3c7',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid #fcd34d'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      margin: '0 0 16px 0',
                      color: '#92400e'
                    }}>
                      🔮 PREVISÕES:
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#92400e' }}>Ago/25:</span>
                        <span style={{ fontWeight: '600' }}>
                          {formatCurrency((proximasFaturas.find(f => f.cartao.toLowerCase().includes(cartao.name.toLowerCase()))?.valor || 0) * 0.8)} (42% limite)
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#92400e' }}>Set/25:</span>
                        <span style={{ fontWeight: '600' }}>
                          {formatCurrency((proximasFaturas.find(f => f.cartao.toLowerCase().includes(cartao.name.toLowerCase()))?.valor || 0) * 0.7)} (39% limite)
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#92400e' }}>Out/25:</span>
                        <span style={{ fontWeight: '600' }}>
                          {formatCurrency((proximasFaturas.find(f => f.cartao.toLowerCase().includes(cartao.name.toLowerCase()))?.valor || 0) * 0.6)} (36% limite)
                        </span>
                      </div>
                      <div style={{ 
                        marginTop: '8px', 
                        paddingTop: '8px', 
                        borderTop: '1px solid rgba(252, 211, 77, 0.5)',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#059669'
                      }}>
                        💡 Volta ao normal em 3 meses
                      </div>
                    </div>
                  </div>

                  {/* Ações Rápidas */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px'
                  }}>
                    <button
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      📊 Ver Faturas
                    </button>
                    <button
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      💰 Histórico
                    </button>
                    <button
                      style={{
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      🔄 Parcelas Ativas
                    </button>
                    <button
                      style={{
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      📈 Gráficos
                    </button>
                    <button
                      style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      ⚙️ Configurar
                    </button>
                    <button
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ Desativar
                    </button>
                  </div>
                </>
              )
            })()}
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