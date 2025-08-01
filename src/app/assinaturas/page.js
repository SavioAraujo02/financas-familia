'use client'
import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import Sidebar from '@/components/layout/Sidebar'

export default function AssinaturasControle() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Estados das abas
  const [abaAtiva, setAbaAtiva] = useState('lista') // lista, categorias, timeline, custos
  
  // Estados dos modais
  const [modalNovaAssinatura, setModalNovaAssinatura] = useState(false)
  const [modalGerenciar, setModalGerenciar] = useState(null)
  const [modalOtimizacao, setModalOtimizacao] = useState(false)
  
  // Estados dos dados
  const [resumoGeral, setResumoGeral] = useState({
    gastoMensal: 387.90,
    percentualRenda: 3.7,
    maisCara: { nome: 'Adobe Creative', valor: 89.00 },
    naoUsadas: 3,
    renovamHoje: 2,
    totalAssinaturas: 12
  })
  
  const [proximasCobranças, setProximasCobranças] = useState([
    { nome: 'Netflix', valor: 45.90, data: 'Hoje', cor: '#e50914' },
    { nome: 'Spotify', valor: 29.90, data: '15/Ago', cor: '#1db954' },
    { nome: 'Amazon Prime', valor: 19.90, data: '20/Ago', cor: '#ff9900' },
    { nome: 'Adobe Creative', valor: 89.00, data: '28/Ago', cor: '#ff0000' }
  ])
  
  const [assinaturas, setAssinaturas] = useState([
    // Streaming & Entretenimento
    {
      id: 1,
      nome: 'Netflix',
      categoria: 'streaming',
      valor: 45.90,
      cartao: 'Nubank',
      dataCobranca: 'Hoje',
      usuarios: ['voce', 'esposa'],
      uso: 95,
      status: 'ativa',
      cor: '#e50914',
      emoji: '🎬'
    },
    {
      id: 2,
      nome: 'Spotify Premium',
      categoria: 'streaming',
      valor: 29.90,
      cartao: 'Inter',
      dataCobranca: '15/Ago',
      usuarios: ['voce', 'esposa'],
      uso: 87,
      status: 'ativa',
      cor: '#1db954',
      emoji: '🎵'
    },
    {
      id: 3,
      nome: 'Amazon Prime',
      categoria: 'streaming',
      valor: 19.90,
      cartao: 'C6',
      dataCobranca: '20/Ago',
      usuarios: ['voce'],
      uso: 65,
      status: 'ativa',
      cor: '#ff9900',
      emoji: '📺'
    },
    {
      id: 4,
      nome: 'PlayStation Plus',
      categoria: 'streaming',
      valor: 39.90,
      cartao: 'Nubank',
      dataCobranca: '05/Ago',
      usuarios: ['voce'],
      uso: 45,
      status: 'ativa',
      cor: '#003087',
      emoji: '🎮'
    },
    {
      id: 5,
      nome: 'YouTube Premium',
      categoria: 'streaming',
      valor: 25.90,
      cartao: 'Inter',
      dataCobranca: '12/Ago',
      usuarios: ['esposa'],
      uso: 78,
      status: 'ativa',
      cor: '#ff0000',
      emoji: '📱'
    },
    
    // Produtividade & Trabalho
    {
      id: 6,
      nome: 'Adobe Creative',
      categoria: 'produtividade',
      valor: 89.00,
      cartao: 'Santander',
      dataCobranca: '28/Ago',
      usuarios: ['voce'],
      uso: 23,
      status: 'ativa',
      cor: '#ff0000',
      emoji: '🎨'
    },
    {
      id: 7,
      nome: 'Google One 2TB',
      categoria: 'produtividade',
      valor: 21.90,
      cartao: 'Nubank',
      dataCobranca: '01/Set',
      usuarios: ['voce', 'esposa'],
      uso: 89,
      status: 'ativa',
      cor: '#4285f4',
      emoji: '☁️'
    },
    {
      id: 8,
      nome: 'Canva Pro',
      categoria: 'produtividade',
      valor: 16.90,
      cartao: 'Inter',
      dataCobranca: '10/Set',
      usuarios: ['esposa'],
      uso: 56,
      status: 'ativa',
      cor: '#00c4cc',
      emoji: '📊'
    },
    
    // Saúde & Fitness
    {
      id: 9,
      nome: 'Nike Run Club',
      categoria: 'saude',
      valor: 19.90,
      cartao: 'C6',
      dataCobranca: '22/Ago',
      usuarios: ['voce'],
      uso: 0,
      status: 'inativa',
      cor: '#ff6900',
      emoji: '🏃'
    },
    {
      id: 10,
      nome: 'Headspace',
      categoria: 'saude',
      valor: 29.90,
      cartao: 'Nubank',
      dataCobranca: '18/Ago',
      usuarios: ['esposa'],
      uso: 12,
      status: 'ativa',
      cor: '#ff6b35',
      emoji: '🧘'
    },
    {
      id: 11,
      nome: 'MyFitnessPal',
      categoria: 'saude',
      valor: 17.60,
      cartao: 'Inter',
      dataCobranca: '25/Ago',
      usuarios: ['voce', 'esposa'],
      uso: 34,
      status: 'ativa',
      cor: '#0072ce',
      emoji: '💪'
    },
    
    // Delivery & Compras
    {
      id: 12,
      nome: 'iFood Pro',
      categoria: 'delivery',
      valor: 23.90,
      cartao: 'Santander',
      dataCobranca: '30/Ago',
      usuarios: ['voce', 'esposa'],
      uso: 67,
      status: 'ativa',
      cor: '#ea1d2c',
      emoji: '🍕'
    },
    {
      id: 13,
      nome: 'Shopee Premium',
      categoria: 'delivery',
      valor: 23.10,
      cartao: 'C6',
      dataCobranca: '15/Set',
      usuarios: ['esposa'],
      uso: 45,
      status: 'ativa',
      cor: '#ee4d2d',
      emoji: '📦'
    }
  ])
  
  const [analiseInteligente, setAnaliseInteligente] = useState({
    usoVsCusto: [
      { nome: 'Netflix', uso: 95, status: 'excelente' },
      { nome: 'Spotify', uso: 87, status: 'bom' },
      { nome: 'Adobe', uso: 23, status: 'ruim' },
      { nome: 'Nike', uso: 0, status: 'cancelar' },
      { nome: 'Headspace', uso: 12, status: 'ruim' }
    ],
    otimizacoes: [
      'Cancelar Nike (0% uso em 2 meses)',
      'Downgrade Canva para versão gratuita',
      'Considerar Disney+ para família',
      'Avaliar uso do Adobe vs custo'
    ],
    tendencias: [
      { mes: 'Jul', variacao: 45 },
      { mes: 'Ago', variacao: 23 },
      { mes: 'Set', variacao: 0 },
      { mes: 'Out', variacao: -19 }
    ],
    economiaPotencial: 67.40
  })

  // Carregar dados reais
  useEffect(() => {
    loadAssinaturasData()
  }, [])

  const loadAssinaturasData = async () => {
    try {
      const { auth, supabase } = await import('@/lib/supabase')
      
      const { user: currentUser } = await auth.getUser()
      if (!currentUser) {
        window.location.href = '/auth/login'
        return
      }
      
      setUser(currentUser)
      
      // Carregar assinaturas reais do Supabase
      // Por enquanto mantemos os dados fictícios para demonstração
      
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusColor = (uso) => {
    if (uso >= 80) return '#10b981'
    if (uso >= 50) return '#f59e0b'
    if (uso >= 20) return '#ef4444'
    return '#dc2626'
  }

  const getStatusIcon = (uso) => {
    if (uso >= 80) return '🟢'
    if (uso >= 50) return '🟡'
    if (uso >= 20) return '🔴'
    return '🔴'
  }

  const agruparPorCategoria = () => {
    const categorias = {
      streaming: { nome: 'STREAMING & ENTRETENIMENTO', total: 0, assinaturas: [] },
      produtividade: { nome: 'PRODUTIVIDADE & TRABALHO', total: 0, assinaturas: [] },
      saude: { nome: 'SAÚDE & FITNESS', total: 0, assinaturas: [] },
      delivery: { nome: 'DELIVERY & COMPRAS', total: 0, assinaturas: [] }
    }
    
    assinaturas.forEach(assinatura => {
      const categoria = assinatura.categoria
      categorias[categoria].assinaturas.push(assinatura)
      categorias[categoria].total += assinatura.valor
    })
    
    return categorias
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="assinaturas" />
        <main style={{ flex: 1, marginLeft: sidebarOpen ? '300px' : '80px' }}>
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <h2 style={{ fontSize: '24px', color: '#64748b' }}>Carregando suas assinaturas...</h2>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="assinaturas" />

      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '300px' : '80px',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header */}
        <header style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
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
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  👥 ASSINATURAS
                  <span style={{ fontSize: '16px', opacity: 0.9 }}>
                    | {resumoGeral.totalAssinaturas} ativas | {formatCurrency(resumoGeral.gastoMensal)}/mês | Próximo: Netflix
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                padding: '8px',
                fontSize: '20px'
              }}>
                🤖
              </div>
              <div>
                <p style={{ margin: '0', fontWeight: '600', fontSize: '14px' }}>
                  FinBot - Otimizador de Assinaturas
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.95 }}>
                {resumoGeral.naoUsadas} assinaturas não usadas este mês. Cancelar pode economizar {formatCurrency(analiseInteligente.economiaPotencial)}/mês!
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Primeira linha: Resumo + Nova Assinatura */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
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
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ec4899' }}>
                    {formatCurrency(resumoGeral.gastoMensal)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    💰 Gasto mensal
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                    {resumoGeral.percentualRenda}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    📊 % da renda
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
                    {formatCurrency(resumoGeral.maisCara.valor)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    🎯 Mais cara: {resumoGeral.maisCara.nome}
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                    {resumoGeral.naoUsadas}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    💡 Não usadas
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                    {resumoGeral.renovamHoje}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    ⚠️ Renovam hoje
                  </div>
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#1a202c',
                  margin: '0 0 12px 0'
                }}>
                  🔄 PRÓXIMAS COBRANÇAS:
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {proximasCobranças.map((cobranca, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: '#374151' }}>
                        {cobranca.data}: {cobranca.nome}
                      </span>
                      <span style={{ 
                        fontWeight: 'bold', 
                        color: cobranca.cor 
                      }}>
                        {formatCurrency(cobranca.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nova Assinatura */}
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
                ➕ NOVA ASSINATURA
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                    📝 Nome:
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}>
                    <option>Spotify</option>
                    <option>Disney+</option>
                    <option>HBO Max</option>
                    <option>Paramount+</option>
                    <option>Apple Music</option>
                    <option>Personalizada...</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                    💰 Valor:
                  </label>
                  <input
                    type="text"
                    placeholder="R$ 29,90"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                    📅 Cobrança:
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}>
                    <option>Todo dia 15</option>
                    <option>Todo dia 1º</option>
                    <option>Todo dia 30</option>
                    <option>Personalizar...</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                    💳 Cartão:
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}>
                    <option>Nubank</option>
                    <option>Inter</option>
                    <option>Santander</option>
                    <option>C6 Bank</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                    🏷️ Categoria:
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}>
                    <option>🎵 Streaming</option>
                    <option>💼 Produtividade</option>
                    <option>🏋️ Saúde & Fitness</option>
                    <option>🛒 Delivery & Compras</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                    👤 Usuário:
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}>
                    <option>👨 Você</option>
                    <option>👩 Esposa</option>
                    <option>👨‍👩‍👧‍👦 Família</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                    📱 Notificar:
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}>
                    <option>3 dias antes</option>
                    <option>1 dia antes</option>
                    <option>No dia</option>
                    <option>Não notificar</option>
                  </select>
                </div>
                
                <button
                  onClick={() => setModalNovaAssinatura(true)}
                  style={{
                    width: '100%',
                    backgroundColor: '#ec4899',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  💾 ADICIONAR
                </button>
              </div>
            </div>
          </div>

          {/* Assinaturas Ativas */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
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
                fontSize: '18px',
                fontWeight: 'bold',
                margin: 0,
                color: '#1a202c'
              }}>
                👥 ASSINATURAS ATIVAS
              </h2>
              
              {/* Abas */}
              <div style={{
                display: 'flex',
                gap: '8px',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
                padding: '4px'
              }}>
                {[
                  { key: 'lista', label: '📋 Lista' },
                  { key: 'categorias', label: '📊 Categorias' },
                  { key: 'timeline', label: '📅 Timeline' },
                  { key: 'custos', label: '💰 Custos' }
                ].map(aba => (
                  <button
                    key={aba.key}
                    onClick={() => setAbaAtiva(aba.key)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      backgroundColor: abaAtiva === aba.key ? '#ec4899' : 'transparent',
                      color: abaAtiva === aba.key ? 'white' : '#64748b'
                    }}
                  >
                    {aba.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Conteúdo das Abas */}
            {abaAtiva === 'categorias' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.entries(agruparPorCategoria()).map(([key, categoria]) => (
                  <div key={key}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#1a202c',
                        margin: 0
                      }}>
                        {categoria.nome}
                      </h3>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#ec4899'
                      }}>
                        Total: {formatCurrency(categoria.total)}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '12px'
                    }}>
                      {categoria.assinaturas.map((assinatura, index) => (
                        <div key={assinatura.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flex: 1
                          }}>
                            <span style={{ fontSize: '20px' }}>{assinatura.emoji}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#1a202c',
                                marginBottom: '4px'
                              }}>
                                {assinatura.nome}
                              </div>
                              <div style={{
                                fontSize: '12px',
                                color: '#64748b',
                                display: 'flex',
                                gap: '8px'
                              }}>
                                <span>{formatCurrency(assinatura.valor)}</span>
                                <span>💳{assinatura.cartao}</span>
                                <span>📅{assinatura.dataCobranca}</span>
                                <span>{assinatura.usuarios.includes('voce') && assinatura.usuarios.includes('esposa') ? '👨👩' : assinatura.usuarios.includes('voce') ? '👨' : '👩'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <div style={{
                              fontSize: '12px',
                              fontWeight: 'bold',
                              color: getStatusColor(assinatura.uso),
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {getStatusIcon(assinatura.uso)} {assinatura.uso}%
                            </div>
                            <button
                              onClick={() => setModalGerenciar(assinatura)}
                              style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              ⚙️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Insights */}
                <div style={{
                  backgroundColor: '#fef3c7',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #fcd34d'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#92400e',
                    marginBottom: '8px'
                  }}>
                    💡 <strong>INSIGHT:</strong> {resumoGeral.naoUsadas} assinaturas sem uso nos últimos 30 dias
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#92400e'
                  }}>
                    🎯 <strong>ECONOMIA POTENCIAL:</strong> {formatCurrency(analiseInteligente.economiaPotencial)}/mês se cancelar não usadas
                  </div>
                </div>
              </div>
            )}
            
            {abaAtiva === 'lista' && (
              <div style={{
                overflowX: 'auto'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Serviço</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Valor</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Cartão</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Cobrança</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Usuários</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Uso</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assinaturas.map((assinatura, index) => (
                      <tr key={assinatura.id}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{assinatura.emoji}</span>
                            <span style={{ fontWeight: '600' }}>{assinatura.nome}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>
                          {formatCurrency(assinatura.valor)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                          💳 {assinatura.cartao}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                          📅 {assinatura.dataCobranca}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                          {assinatura.usuarios.includes('voce') && assinatura.usuarios.includes('esposa') ? '👨👩' : 
                           assinatura.usuarios.includes('voce') ? '👨' : '👩'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                          <span style={{
                            color: getStatusColor(assinatura.uso),
                            fontWeight: 'bold'
                          }}>
                            {getStatusIcon(assinatura.uso)} {assinatura.uso}%
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                          <button
                            onClick={() => setModalGerenciar(assinatura)}
                            style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            ⚙️ Gerenciar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {abaAtiva === 'custos' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px'
              }}>
                {/* Gráfico de Pizza */}
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1a202c',
                    margin: '0 0 16px 0'
                  }}>
                    📊 Distribuição por Categoria
                  </h3>
                  
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(agruparPorCategoria()).map(([key, categoria]) => ({
                            name: categoria.nome.split(' ')[0],
                            value: categoria.total,
                            fill: key === 'streaming' ? '#ec4899' : 
                                  key === 'produtividade' ? '#3b82f6' :
                                  key === 'saude' ? '#10b981' : '#f59e0b'
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Ranking de Custos */}
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1a202c',
                    margin: '0 0 16px 0'
                  }}>
                    💰 Ranking de Custos
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {assinaturas
                      .sort((a, b) => b.valor - a.valor)
                      .slice(0, 8)
                      .map((assinatura, index) => (
                        <div key={assinatura.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px',
                          backgroundColor: index < 3 ? '#fef2f2' : '#f8fafc',
                          borderRadius: '8px',
                          border: `1px solid ${index < 3 ? '#fecaca' : '#e2e8f0'}`
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{
                              backgroundColor: index < 3 ? '#ef4444' : '#64748b',
                              color: 'white',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {index + 1}
                            </span>
                            <span>{assinatura.emoji}</span>
                            <span style={{ fontWeight: '600' }}>{assinatura.nome}</span>
                          </div>
                          <span style={{
                            fontWeight: 'bold',
                            color: index < 3 ? '#ef4444' : '#374151'
                          }}>
                            {formatCurrency(assinatura.valor)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Análise Inteligente */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 0 20px 0',
              color: '#1a202c'
            }}>
              🧠 ANÁLISE INTELIGENTE
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '24px'
            }}>
              {/* Uso vs Custo */}
              <div style={{
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  margin: '0 0 16px 0'
                }}>
                  📊 USO vs CUSTO:
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '14px'
                }}>
                  {analiseInteligente.usoVsCusto.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{item.nome}: {item.uso}% uso</span>
                      <span style={{
                        color: item.status === 'excelente' ? '#10b981' :
                               item.status === 'bom' ? '#f59e0b' :
                               item.status === 'ruim' ? '#ef4444' : '#dc2626'
                      }}>
                        {item.status === 'excelente' ? '🟢' :
                         item.status === 'bom' ? '🟡' :
                         item.status === 'ruim' ? '🔴' : '🔴'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Otimizações */}
              <div style={{
                backgroundColor: '#f0fdf4',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#166534',
                  margin: '0 0 16px 0'
                }}>
                  💡 OTIMIZAÇÕES:
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  {analiseInteligente.otimizacoes.map((otimizacao, index) => (
                    <div key={index}>• {otimizacao}</div>
                  ))}
                </div>
                
                <button
                  onClick={() => setModalOtimizacao(true)}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🎯 APLICAR OTIMIZAÇÕES
                </button>
              </div>

              {/* Tendências */}
              <div style={{
                backgroundColor: '#fefce8',
                borderRadius: '12px',
                padding: '20px'
              }}>
                                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#a16207',
                  margin: '0 0 16px 0'
                }}>
                  📈 TENDÊNCIAS:
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  {analiseInteligente.tendencias.map((tendencia, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{tendencia.mes}:</span>
                      <span style={{
                        color: tendencia.variacao > 0 ? '#ef4444' : 
                               tendencia.variacao < 0 ? '#10b981' : '#64748b',
                        fontWeight: 'bold'
                      }}>
                        {tendencia.variacao > 0 ? '+' : ''}{formatCurrency(tendencia.variacao)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#a16207'
                }}>
                  💰 Economia potencial: {formatCurrency(analiseInteligente.economiaPotencial)}/mês
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Gerenciar Assinatura */}
        {modalGerenciar && (
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
              maxHeight: '80vh',
              overflowY: 'auto',
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
                  color: '#1a202c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {modalGerenciar.emoji} GERENCIAR: {modalGerenciar.nome}
                </h2>
                <button
                  onClick={() => setModalGerenciar(null)}
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

              {/* Status da Assinatura */}
              <div style={{
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  margin: '0 0 16px 0'
                }}>
                  📊 STATUS ATUAL:
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div>💰 Valor mensal: {formatCurrency(modalGerenciar.valor)}</div>
                  <div>📊 Uso atual: {modalGerenciar.uso}% {getStatusIcon(modalGerenciar.uso)}</div>
                  <div>💳 Cartão: {modalGerenciar.cartao}</div>
                  <div>📅 Próxima cobrança: {modalGerenciar.dataCobranca}</div>
                  <div>👥 Usuários: {modalGerenciar.usuarios.join(', ')}</div>
                  <div>🏷️ Categoria: {modalGerenciar.categoria}</div>
                </div>
              </div>

              {/* Análise de Uso */}
              <div style={{
                backgroundColor: modalGerenciar.uso >= 50 ? '#f0fdf4' : '#fef2f2',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: modalGerenciar.uso >= 50 ? '#166534' : '#dc2626',
                  margin: '0 0 16px 0'
                }}>
                  📈 ANÁLISE DE USO:
                </h3>
                
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>
                      Uso nos últimos 30 dias:
                    </span>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: getStatusColor(modalGerenciar.uso)
                    }}>
                      {modalGerenciar.uso}%
                    </span>
                  </div>
                  
                  <div style={{
                    backgroundColor: '#e2e8f0',
                    borderRadius: '8px',
                    height: '12px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      backgroundColor: getStatusColor(modalGerenciar.uso),
                      height: '100%',
                      width: `${modalGerenciar.uso}%`,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
                
                <div style={{
                  fontSize: '14px',
                  color: modalGerenciar.uso >= 50 ? '#166534' : '#dc2626'
                }}>
                  {modalGerenciar.uso >= 80 ? '✅ Excelente uso! Vale muito a pena manter.' :
                   modalGerenciar.uso >= 50 ? '🟡 Uso moderado. Monitore nos próximos meses.' :
                   modalGerenciar.uso >= 20 ? '⚠️ Baixo uso. Considere cancelar ou reduzir plano.' :
                   '🔴 Sem uso! Recomendamos cancelamento imediato.'}
                </div>
              </div>

              {/* Ações Rápidas */}
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1a202c',
                  margin: '0 0 16px 0'
                }}>
                  ⚡ AÇÕES RÁPIDAS:
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  <button style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    ✏️ Editar Dados
                  </button>
                  
                  <button style={{
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    💳 Trocar Cartão
                  </button>
                  
                  <button style={{
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    ⏸️ Pausar
                  </button>
                  
                  <button style={{
                    backgroundColor: modalGerenciar.uso < 20 ? '#ef4444' : '#64748b',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    {modalGerenciar.uso < 20 ? '❌ Cancelar' : '❌ Cancelar'}
                  </button>
                </div>
              </div>

              {/* Histórico de Uso */}
              <div style={{
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  margin: '0 0 16px 0'
                }}>
                  📊 HISTÓRICO DE USO:
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div>├─ Julho: {modalGerenciar.uso}% (atual)</div>
                  <div>├─ Junho: {Math.max(0, modalGerenciar.uso - 15)}%</div>
                  <div>├─ Maio: {Math.max(0, modalGerenciar.uso - 8)}%</div>
                  <div>└─ Abril: {Math.max(0, modalGerenciar.uso + 12)}%</div>
                </div>
                
                <div style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: '#1e40af',
                  fontWeight: '600'
                }}>
                  💡 Tendência: {modalGerenciar.uso > 50 ? 'Uso estável' : 'Uso em declínio'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Otimização */}
        {modalOtimizacao && (
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
              maxHeight: '80vh',
              overflowY: 'auto',
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
                  🎯 OTIMIZAÇÃO DE ASSINATURAS
                </h2>
                <button
                  onClick={() => setModalOtimizacao(false)}
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

              {/* Economia Potencial */}
              <div style={{
                backgroundColor: '#f0fdf4',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#166534',
                  margin: '0 0 8px 0'
                }}>
                  💰 ECONOMIA POTENCIAL TOTAL
                </h3>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#10b981',
                  marginBottom: '8px'
                }}>
                  {formatCurrency(analiseInteligente.economiaPotencial)}/mês
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#166534'
                }}>
                  = {formatCurrency(analiseInteligente.economiaPotencial * 12)}/ano economizados!
                </div>
              </div>

              {/* Ações Recomendadas */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1a202c',
                  margin: 0
                }}>
                  🎯 AÇÕES RECOMENDADAS:
                </h3>
                
                {[
                  {
                    acao: 'Cancelar Nike Run Club',
                    motivo: '0% de uso nos últimos 2 meses',
                    economia: 19.90,
                    prioridade: 'alta',
                    cor: '#ef4444'
                  },
                  {
                    acao: 'Cancelar Headspace',
                    motivo: 'Apenas 12% de uso mensal',
                    economia: 29.90,
                    prioridade: 'alta',
                    cor: '#ef4444'
                  },
                  {
                    acao: 'Downgrade Canva Pro',
                    motivo: 'Uso moderado, versão gratuita pode atender',
                    economia: 16.90,
                    prioridade: 'media',
                    cor: '#f59e0b'
                  },
                  {
                    acao: 'Considerar Disney+ Família',
                    motivo: 'Substituir Netflix + Amazon por plano família',
                    economia: -15.00,
                    prioridade: 'baixa',
                    cor: '#3b82f6'
                  }
                ].map((item, index) => (
                  <div key={index} style={{
                    padding: '16px',
                    backgroundColor: item.prioridade === 'alta' ? '#fef2f2' : 
                                   item.prioridade === 'media' ? '#fefce8' : '#f0f9ff',
                    borderRadius: '12px',
                    border: `1px solid ${item.prioridade === 'alta' ? '#fecaca' : 
                                        item.prioridade === 'media' ? '#fef3c7' : '#bfdbfe'}`
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#1a202c',
                          margin: '0 0 4px 0'
                        }}>
                          {item.acao}
                        </h4>
                        <p style={{
                          fontSize: '14px',
                          color: '#64748b',
                          margin: '0 0 8px 0'
                        }}>
                          {item.motivo}
                        </p>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '8px'
                      }}>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: item.economia > 0 ? '#10b981' : '#ef4444'
                        }}>
                          {item.economia > 0 ? '+' : ''}{formatCurrency(Math.abs(item.economia))}
                        </span>
                        
                        <button style={{
                          backgroundColor: item.cor,
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}>
                          {item.prioridade === 'alta' ? '🔥 Aplicar' : 
                           item.prioridade === 'media' ? '⚡ Considerar' : '💡 Avaliar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Plano de Ação */}
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1a202c',
                  margin: '0 0 16px 0'
                }}>
                  📋 PLANO DE AÇÃO SUGERIDO:
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div>1️⃣ <strong>Hoje:</strong> Cancelar Nike Run Club (sem uso)</div>
                  <div>2️⃣ <strong>Esta semana:</strong> Avaliar uso do Headspace</div>
                  <div>3️⃣ <strong>Próximo mês:</strong> Testar Canva gratuito</div>
                  <div>4️⃣ <strong>Em 3 meses:</strong> Revisar todas as assinaturas</div>
                </div>
                
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#166534'
                  }}>
                    🎯 Resultado: {formatCurrency(66.70)}/mês economizados
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#166534'
                  }}>
                    Pode acelerar meta "Casa Própria" em 1 mês!
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginTop: '24px'
              }}>
                <button style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  🎯 APLICAR TODAS
                </button>
                <button style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  📊 SIMULAR
                </button>
                <button
                  onClick={() => setModalOtimizacao(false)}
                  style={{
                    backgroundColor: '#64748b',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ❌ CANCELAR
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes progressGlow {
          0% { box-shadow: 0 0 5px rgba(236, 72, 153, 0.5); }
          100% { box-shadow: 0 0 15px rgba(236, 72, 153, 0.8); }
        }
        
        .progress-bar {
          animation: progressGlow 2s ease-in-out infinite alternate;
        }
        
        .card-hover {
          transition: all 0.3s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  )
}
                