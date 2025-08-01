'use client'
import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import Sidebar from '@/components/layout/Sidebar'

export default function MetasESonhos() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Estados das abas
  const [abaAtiva, setAbaAtiva] = useState('familiares') // familiares, suas, dela, todas, grafico
  
  // Estados dos modais
  const [modalNovaMeta, setModalNovaMeta] = useState(false)
  const [modalGerenciar, setModalGerenciar] = useState(null)
  const [modalConquistas, setModalConquistas] = useState(false)
  const [modalCalculadora, setModalCalculadora] = useState(false)
  
  // Estados dos dados
  const [resumoConquistas, setResumoConquistas] = useState({
    metasConcluidas: 3,
    metasAtivas: 5,
    totalPoupado: 52550,
    taxaSucesso: 85,
    streakDias: 127,
    proximaConquista: 7,
    economiaMedia: 2845
  })
  
  const [metasFamiliares, setMetasFamiliares] = useState([
    {
      id: 1,
      nome: "CASA PRÓPRIA - ENTRADA",
      emoji: "🏠",
      objetivo: 50000,
      poupado: 32500,
      progresso: 65,
      prazo: "Dez/2026",
      mesesRestantes: 17,
      mensal: 1030,
      contribuicaoVoce: 620,
      contribuicaoEla: 410,
      status: "ADIANTADA",
      statusEmoji: "🔥",
      mesesAdiantada: 2,
      cor: "#10b981"
    },
    {
      id: 2,
      nome: "VIAGEM EUROPA - FAMÍLIA",
      emoji: "✈️",
      objetivo: 15000,
      poupado: 5250,
      progresso: 35,
      prazo: "Jul/2025",
      mesesRestantes: 12,
      mensal: 815,
      contribuicaoVoce: 407.50,
      contribuicaoEla: 407.50,
      status: "NO PRAZO",
      statusEmoji: "🎯",
      cor: "#3b82f6"
    },
    {
      id: 3,
      nome: "CARRO NOVO - TROCA",
      emoji: "🚗",
      objetivo: 25000,
      poupado: 12800,
      progresso: 51,
      prazo: "Mar/2026",
      mesesRestantes: 20,
      mensal: 610,
      contribuicaoVoce: 610,
      contribuicaoEla: 0,
      status: "EXCELENTE",
      statusEmoji: "💪",
      cor: "#8b5cf6"
    }
  ])
  
  const [metasIndividuais, setMetasIndividuais] = useState({
    suas: [
      {
        id: 4,
        nome: "Setup Gamer Completo",
        emoji: "🎮",
        objetivo: 8000,
        poupado: 6400,
        progresso: 80,
        faltam: 1600,
        mesesRestantes: 3,
        cor: "#f59e0b"
      },
      {
        id: 5,
        nome: "MBA em Gestão",
        emoji: "📚",
        objetivo: 12000,
        poupado: 5040,
        progresso: 42,
        faltam: 6960,
        mesesRestantes: 12,
        cor: "#6366f1"
      }
    ],
    dela: [
      {
        id: 6,
        nome: "Harmonização Facial",
        emoji: "💄",
        objetivo: 5000,
        poupado: 3000,
        progresso: 60,
        faltam: 2000,
        mesesRestantes: 5,
        cor: "#ec4899"
      },
      {
        id: 7,
        nome: "Renovar Guarda-Roupa",
        emoji: "👗",
        objetivo: 3000,
        poupado: 1000,
        progresso: 33,
        faltam: 2000,
        mesesRestantes: 8,
        cor: "#14b8a6"
      }
    ]
  })
  
  const [analiseInteligente, setAnaliseInteligente] = useState({
    performance: {
      mediaDeposito: 5,
      consistencia: 92,
      mesesNoPrazo: 8,
      taxaSucesso: 85
    },
    insights: [
      "Casa Própria pode ser antecipada!",
      "Viagem Europa está dentro do objetivo",
      "Carro à frente do cronograma!"
    ],
    otimizacoes: [
      "Redistribuir R$ 200/mês da Casa p/ Viagem acelera 3 meses",
      "Usar 13º salário na Casa Própria antecipa 4 meses",
      "Pausar MBA por 2 meses acelera Setup Gamer"
    ]
  })
  
  const [conquistasDesbloqueadas, setConquistasDesbloqueadas] = useState([
    { nome: "Primeiro Depósito", data: "15/Jan/2025", emoji: "🎯" },
    { nome: "Meta de R$ 10.000", data: "22/Mar/2025", emoji: "💰" },
    { nome: "3 Meses Consistente", data: "08/Abr/2025", emoji: "🔥" },
    { nome: "Meta Batida no Prazo", data: "15/Mai/2025", emoji: "✅" },
    { nome: "R$ 30.000 Acumulados", data: "12/Jul/2025", emoji: "🏆" }
  ])
  
  const [proximasConquistas, setProximasConquistas] = useState([
    { nome: "Streak de 150 dias", restante: "23 dias restantes", emoji: "🔒" },
    { nome: "R$ 50.000 Acumulados", restante: "R$ 17.500 restantes", emoji: "🔒" },
    { nome: "5 Metas Simultâneas", restante: "já tem!", emoji: "🔒" },
    { nome: "Meta Antecipada", restante: "quase lá!", emoji: "🔒" }
  ])

  // Carregar dados reais
  useEffect(() => {
    loadMetasData()
  }, [])

  const loadMetasData = async () => {
    try {
      const { auth, goals, supabase } = await import('@/lib/supabase')
      
      const { user: currentUser } = await auth.getUser()
      if (!currentUser) {
        window.location.href = '/auth/login'
        return
      }
      
      setUser(currentUser)
      
      // Carregar metas reais do Supabase
      const { data: metasReais } = await goals.getAll(currentUser.id)
      
      if (metasReais && metasReais.length > 0) {
        // Processar metas reais e atualizar estados
        // Por enquanto mantemos os dados fictícios para demonstração
      }
      
    } catch (error) {
      console.error('Erro ao carregar metas:', error)
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

  const calcularProgressoGeral = () => {
    const todasMetas = [...metasFamiliares, ...metasIndividuais.suas, ...metasIndividuais.dela]
    const totalObjetivo = todasMetas.reduce((sum, meta) => sum + meta.objetivo, 0)
    const totalPoupado = todasMetas.reduce((sum, meta) => sum + meta.poupado, 0)
    return Math.round((totalPoupado / totalObjetivo) * 100)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="metas" />
        <main style={{ flex: 1, marginLeft: sidebarOpen ? '300px' : '80px' }}>
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <h2 style={{ fontSize: '24px', color: '#64748b' }}>Carregando suas metas...</h2>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="metas" />

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
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  🎯 METAS E SONHOS
                  <span style={{ fontSize: '16px', opacity: 0.9 }}>
                    | {resumoConquistas.metasAtivas} ativas | {formatCurrency(115000)} em objetivos
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
                  FinBot - Assistente de Metas
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.95 }}>
                  Meta 'Casa Própria' pode ser antecipada em 2 meses! Quer ver como acelerar?
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Primeira linha: Resumo + Nova Meta */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Resumo das Conquistas */}
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
                color: '#1a202c',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🏆 RESUMO DAS CONQUISTAS
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                    {resumoConquistas.metasConcluidas}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    🏆 metas concluídas
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {resumoConquistas.metasAtivas}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    🎯 metas ativas
                  </div>
                </div>
                        
                        <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
                            {formatCurrency(resumoConquistas.totalPoupado)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            💰 poupados
                        </div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                            {resumoConquistas.taxaSucesso}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            📈 taxa sucesso
                        </div>
                        </div>
                    </div>
                    
                    <div style={{
                        backgroundColor: '#f0f9ff',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '16px'
                    }}>
                        <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                        }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
                            🔥 Streak: {resumoConquistas.streakDias} dias
                        </span>
                        <span style={{ fontSize: '14px', color: '#3b82f6' }}>
                            🎊 Próxima conquista: {resumoConquistas.proximaConquista} dias
                        </span>
                        </div>
                        
                        <div style={{
                        backgroundColor: '#e0e7ff',
                        borderRadius: '6px',
                        height: '8px',
                        overflow: 'hidden'
                        }}>
                        <div style={{
                            backgroundColor: '#3b82f6',
                            height: '100%',
                            width: '85%',
                            transition: 'width 0.5s ease'
                        }} />
                        </div>
                    </div>
                    
                    <div style={{
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#059669',
                        fontWeight: '600'
                    }}>
                        💡 Economia média: {formatCurrency(resumoConquistas.economiaMedia)}/mês
                    </div>
                    </div>

                    {/* Nova Meta */}
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
                        🎯 NOVA META
                    </h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                            📝 Nome da Meta:
                        </label>
                        <select style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                        }}>
                            <option>Casa Própria</option>
                            <option>Viagem</option>
                            <option>Carro</option>
                            <option>Investimento</option>
                            <option>Curso</option>
                            <option>Personalizada...</option>
                        </select>
                        </div>
                        
                        <div>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                            💰 Valor Objetivo:
                        </label>
                        <input
                            type="text"
                            placeholder="R$ 50.000,00"
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
                            📅 Data Desejada:
                        </label>
                        <input
                            type="date"
                            defaultValue="2026-12-31"
                            style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                            }}
                        />
                        </div>
                        
                        <button
                        onClick={() => setModalNovaMeta(true)}
                        style={{
                            width: '100%',
                            backgroundColor: '#8b5cf6',
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
                        🎯 CRIAR META
                        </button>
                    </div>
                    </div>
                </div>

                {/* Metas Familiares */}
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
                        🏠 METAS FAMILIARES
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
                        { key: 'familiares', label: '🏠 Familiares' },
                        { key: 'suas', label: '👨 Suas' },
                        { key: 'dela', label: '👩 Dela' },
                        { key: 'todas', label: '🎯 Todas' },
                        { key: 'grafico', label: '📊 Gráfico' }
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
                            backgroundColor: abaAtiva === aba.key ? '#8b5cf6' : 'transparent',
                            color: abaAtiva === aba.key ? 'white' : '#64748b'
                            }}
                        >
                            {aba.label}
                        </button>
                        ))}
                    </div>
                    </div>
                    
                    {/* Conteúdo das Abas */}
                    {abaAtiva === 'familiares' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {metasFamiliares.map((meta, index) => (
                        <div key={meta.id} style={{
                            padding: '20px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '16px'
                            }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#1a202c',
                                margin: '0 0 8px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                                }}>
                                {meta.emoji} {meta.nome}
                                </h3>
                                
                                <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '12px',
                                fontSize: '14px',
                                color: '#374151'
                                }}>
                                <div>🎯 Objetivo: {formatCurrency(meta.objetivo)}</div>
                                <div>💰 Poupado: {formatCurrency(meta.poupado)} ({meta.progresso}%) {meta.statusEmoji}</div>
                                <div>📅 Prazo: {meta.prazo} ({meta.mesesRestantes} meses)</div>
                                <div>📈 Mensal: {formatCurrency(meta.mensal)} (👨{formatCurrency(meta.contribuicaoVoce)} + 👩{formatCurrency(meta.contribuicaoEla)})</div>
                                <div>🎊 Status: {meta.status} {meta.mesesAdiantada && `(+${meta.mesesAdiantada} meses!)`}</div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                onClick={() => setModalGerenciar(meta)}
                                style={{
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}
                                >
                                ⚙️ Gerenciar
                                </button>
                                <button style={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '12px',
                                cursor: 'pointer'
                                }}>
                                📊
                                </button>
                            </div>
                            </div>
                            
                            {/* Barra de Progresso */}
                            <div style={{
                            backgroundColor: '#e2e8f0',
                            borderRadius: '8px',
                            height: '12px',
                            marginBottom: '16px',
                            overflow: 'hidden'
                            }}>
                            <div style={{
                                backgroundColor: meta.cor,
                                height: '100%',
                                width: `${meta.progresso}%`,
                                transition: 'width 0.5s ease',
                                borderRadius: '8px'
                            }} />
                            </div>
                            
                            {/* Ações */}
                            <div style={{
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap'
                            }}>
                            <button style={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}>
                                💰 DEPOSITAR
                            </button>
                            
                            {meta.nome.includes('CASA') && (
                                <button style={{
                                backgroundColor: '#8b5cf6',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                                }}>
                                🎯 ACELERAR
                                </button>
                            )}
                            
                            {meta.nome.includes('VIAGEM') && (
                                <>
                                <button style={{
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}>
                                    🗺️ PLANEJAR
                                </button>
                                <button style={{
                                    backgroundColor: '#ec4899',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}>
                                    📱 INSPIRAÇÃO
                                </button>
                                </>
                            )}
                            
                            {meta.nome.includes('CARRO') && (
                                <>
                                <button style={{
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}>
                                    🚗 PESQUISAR
                                </button>
                                <button style={{
                                    backgroundColor: '#6366f1',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}>
                                    💡 DICAS
                                </button>
                                </>
                            )}
                            
                            <button style={{
                                backgroundColor: '#64748b',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}>
                                📊 HISTÓRICO
                            </button>
                            </div>
                        </div>
                    ))}
                    </div>
                  )}
                  
                  {abaAtiva === 'grafico' && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '24px'
                    }}>
                      {/* Gráfico de Pizza */}
                      <div style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '20px'
                      }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#1a202c',
                          margin: '0 0 16px 0'
                        }}>
                          📊 Distribuição por Meta
                        </h3>
                        
                        <div style={{ height: '200px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={metasFamiliares.map(meta => ({
                                  name: meta.nome.split(' - ')[0],
                                  value: meta.poupado,
                                  fill: meta.cor
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
                      
                      {/* Evolução Mensal */}
                      <div style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '20px'
                      }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#1a202c',
                          margin: '0 0 16px 0'
                        }}>
                          📈 Evolução dos Últimos 6 Meses
                        </h3>
                        
                        <div style={{ height: '200px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[
                              { mes: 'Jan', valor: 15000 },
                              { mes: 'Fev', valor: 18500 },
                              { mes: 'Mar', valor: 22000 },
                              { mes: 'Abr', valor: 26800 },
                              { mes: 'Mai', valor: 31200 },
                              { mes: 'Jun', valor: 35600 },
                              { mes: 'Jul', valor: 40100 }
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="mes" />
                              <YAxis />
                              <Line 
                                type="monotone" 
                                dataKey="valor" 
                                stroke="#8b5cf6" 
                                strokeWidth={3}
                                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
      
                {/* Metas Individuais */}
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
                    👥 METAS INDIVIDUAIS
                  </h2>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px'
                  }}>
                    {/* Suas Metas */}
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#3b82f6',
                        margin: '0 0 16px 0'
                      }}>
                        👨 SUAS METAS:
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {metasIndividuais.suas.map((meta, index) => (
                          <div key={meta.id} style={{
                            padding: '16px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '8px'
                            }}>
                              <h4 style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#1a202c',
                                margin: 0
                              }}>
                                {meta.emoji} {meta.nome}
                              </h4>
                              <span style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: meta.cor
                              }}>
                                {meta.progresso}%
                              </span>
                            </div>
                            
                            <div style={{
                              backgroundColor: '#e2e8f0',
                              borderRadius: '6px',
                              height: '8px',
                              marginBottom: '8px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                backgroundColor: meta.cor,
                                height: '100%',
                                width: `${meta.progresso}%`,
                                transition: 'width 0.5s ease'
                              }} />
                            </div>
                            
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                              color: '#64748b',
                              marginBottom: '8px'
                            }}>
                              <span>{formatCurrency(meta.poupado)} / {formatCurrency(meta.objetivo)}</span>
                            </div>
                            
                            <div style={{
                              fontSize: '12px',
                              color: '#374151',
                              marginBottom: '8px'
                            }}>
                              Faltam: {formatCurrency(meta.faltam)} | {meta.mesesRestantes} meses restantes
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '16px'
                      }}>
                        <button style={{
                          flex: 1,
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}>
                          💰 DEPOSITAR
                        </button>
                        <button style={{
                          flex: 1,
                          backgroundColor: '#64748b',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}>
                          ⚙️ GERENCIAR
                        </button>
                      </div>
                    </div>
      
                    {/* Metas da Esposa */}
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#ec4899',
                        margin: '0 0 16px 0'
                      }}>
                        👩 METAS DA ESPOSA:
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {metasIndividuais.dela.map((meta, index) => (
                          <div key={meta.id} style={{
                            padding: '16px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '8px'
                            }}>
                              <h4 style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#1a202c',
                                margin: 0
                              }}>
                                {meta.emoji} {meta.nome}
                              </h4>
                              <span style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: meta.cor
                              }}>
                                {meta.progresso}%
                              </span>
                            </div>
                            
                            <div style={{
                              backgroundColor: '#e2e8f0',
                              borderRadius: '6px',
                              height: '8px',
                              marginBottom: '8px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                backgroundColor: meta.cor,
                                height: '100%',
                                width: `${meta.progresso}%`,
                                transition: 'width 0.5s ease'
                              }} />
                            </div>
                            
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                              color: '#64748b',
                              marginBottom: '8px'
                            }}>
                              <span>{formatCurrency(meta.poupado)} / {formatCurrency(meta.objetivo)}</span>
                            </div>
                            
                            <div style={{
                              fontSize: '12px',
                              color: '#374151',
                              marginBottom: '8px'
                            }}>
                              Faltam: {formatCurrency(meta.faltam)} | {meta.mesesRestantes} meses restantes
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '16px'
                      }}>
                        <button style={{
                          flex: 1,
                          backgroundColor: '#ec4899',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}>
                          💰 DEPOSITAR
                        </button>
                        <button style={{
                          flex: 1,
                          backgroundColor: '#64748b',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}>
                          ⚙️ GERENCIAR
                        </button>
                      </div>
                    </div>
                  </div>
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
                    🧠 ANÁLISE INTELIGENTE DE METAS
                  </h2>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '24px'
                  }}>
                    {/* Performance */}
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
                        📊 PERFORMANCE:
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                        <div>Média depósito: +{analiseInteligente.performance.mediaDeposito}%</div>
                        <div>Consistência: {analiseInteligente.performance.consistencia}%</div>
                        <div>Meses no prazo: {analiseInteligente.performance.mesesNoPrazo}/12</div>
                        <div>Taxa sucesso: {analiseInteligente.performance.taxaSucesso}%</div>
                      </div>
                    </div>
      
                    {/* Insights */}
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
                        💡 INSIGHTS:
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                        {analiseInteligente.insights.map((insight, index) => (
                          <div key={index}>{insight}</div>
                        ))}
                      </div>
                    </div>
      
                    {/* Otimizações */}
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
                        🎯 OTIMIZAÇÕES:
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                        {analiseInteligente.otimizacoes.map((otimizacao, index) => (
                          <div key={index}>{otimizacao}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
      
                {/* Dashboard Visual das Metas */}
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
                    📊 VISÃO GERAL INSPIRADORA
                  </h2>
                  
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#1e40af',
                        margin: 0
                      }}>
                        🎯 PROGRESSO GERAL: {calcularProgressoGeral()}% de todas as metas
                      </h3>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#e0e7ff',
                      borderRadius: '12px',
                      height: '16px',
                      marginBottom: '16px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        backgroundColor: '#3b82f6',
                        height: '100%',
                        width: `${calcularProgressoGeral()}%`,
                        transition: 'width 1s ease',
                        borderRadius: '12px'
                      }} />
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '16px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                          {formatCurrency(resumoConquistas.totalPoupado)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          💰 TOTAL POUPADO
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                          {formatCurrency(115000)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          🎯 TOTAL OBJETIVOS
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                          +{formatCurrency(resumoConquistas.economiaMedia)}/mês
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          📈 VELOCIDADE (ACELERANDO!)
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '16px'
                    }}>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#1e40af',
                        margin: '0 0 12px 0'
                      }}>
                        🏆 METAS POR STATUS:
                      </h4>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '8px',
                        fontSize: '12px'
                      }}>
                        <div>✅ Concluídas: 3 (60% taxa sucesso)</div>
                        <div>🔥 Adiantadas: 2 (Casa + Carro)</div>
                        <div>🎯 No prazo: 2 (Viagem + Setup)</div>
                        <div>⚠️ Atrasadas: 1 (MBA - recuperável)</div>
                        <div>💤 Pausadas: 0</div>
                      </div>
                    </div>
                    
                    <div style={{
                      textAlign: 'center',
                      marginTop: '16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#059669'
                    }}>
                      🔮 PREVISÃO: Todas concluídas até Mar/2027
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center'
                  }}>
                    <button
                      onClick={() => setModalConquistas(true)}
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
                      🎊 CELEBRAR
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
                      📈 ACELERAR
                    </button>
                    <button
                      onClick={() => setModalNovaMeta(true)}
                      style={{
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      🎯 NOVA META
                    </button>
                    <button
                      onClick={() => setModalCalculadora(true)}
                      style={{
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      🧮 CALCULADORA
                    </button>
                  </div>
                </div>
              </div>
      
              {/* Modal: Gerenciar Meta */}
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
                        color: '#1a202c'
                      }}>
                        🏠 GERENCIAR: {modalGerenciar.nome}
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
      
                    {/* Status Atual */}
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
                        <div>💰 Poupado: {formatCurrency(modalGerenciar.poupado)} / {formatCurrency(modalGerenciar.objetivo)}</div>
                        <div>📈 Progresso: {modalGerenciar.progresso}% ({modalGerenciar.status}!)</div>
                        <div>📅 Prazo Original: {modalGerenciar.prazo}</div>
                        <div>🎯 Previsão Atual: Out/2026 (+2 meses!)</div>
                        <div>👥 Contribuição: 👨 60% | 👩 40%</div>
                      </div>
                    </div>
      
                    {/* Depósito Rápido */}
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '24px'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#166534',
                        margin: '0 0 16px 0'
                      }}>
                        💰 DEPÓSITO RÁPIDO:
                      </h3>
                      
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '16px',
                        flexWrap: 'wrap'
                      }}>
                        <input
                          type="text"
                          placeholder="R$ 500,00"
                          style={{
                            flex: 1,
                            minWidth: '120px',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                        />
                        <button style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}>
                          💰 R$ 1.000
                        </button>
                        <button style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}>
                          🎯 Sugerido: R$ {modalGerenciar.mensal}
                        </button>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <button style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}>
                          💾 DEPOSITAR
                        </button>
                        <button style={{
                          backgroundColor: '#8b5cf6',
                          color: 'white',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}>
                          📅 AGENDAR
                        </button>
                        <button style={{
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}>
                          🔄 RECORRENTE
                        </button>
                      </div>
                    </div>
      
                    {/* Simulador */}
                    <div style={{
                      backgroundColor: '#fefce8',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '24px'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#a16207',
                        margin: '0 0 16px 0'
                      }}>
                        📈 SIMULADOR:
                      </h3>
                      
                      <div style={{
                        fontSize: '14px',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        "E se depositarmos +R$ 200/mês?"
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#059669'
                      }}>
                        └─ Resultado: Concluída em Ago/2026 (4 meses antes!)
                      </div>
                    </div>
      
                    {/* Histórico Recente */}
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
                        📊 HISTÓRICO RECENTE:
                      </h3>
                      
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#374151'
                      }}>
                        <div>├─ 20/Jul: +{formatCurrency(1030)} (Depósito mensal)</div>
                        <div>├─ 15/Jul: +{formatCurrency(500)} (Extra - freelance)</div>
                        <div>├─ 01/Jul: +{formatCurrency(1030)} (Depósito mensal)</div>
                        <div>└─ 25/Jun: +{formatCurrency(800)} (Vendeu bicicleta)</div>
                      </div>
                    </div>
      
                    {/* Estratégias Sugeridas */}
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
                       🎯 ESTRATÉGIAS SUGERIDAS:
                       </h3>
                       
                       <div style={{
                       display: 'flex',
                       flexDirection: 'column',
                       gap: '8px',
                       fontSize: '14px',
                       color: '#374151'
                       }}>
                       <div>├─ Acelerar com R$ 200/mês dos próximos 2 meses</div>
                       <div>├─ Usar parte do 13º salário</div>
                       <div>├─ Transferir R$ 300/mês da meta "Carro"</div>
                       <div>└─ Aproveitar economia de Setembro</div>
                       </div>
                   </div>
       
                   {/* Ações */}
                   <div style={{
                       display: 'flex',
                       gap: '12px',
                       justifyContent: 'center'
                   }}>
                       <button style={{
                       backgroundColor: '#8b5cf6',
                       color: 'white',
                       padding: '12px 24px',
                       borderRadius: '8px',
                       border: 'none',
                       fontSize: '14px',
                       fontWeight: '600',
                       cursor: 'pointer'
                       }}>
                       🎯 APLICAR ESTRATÉGIA
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
                       📊 RELATÓRIO
                       </button>
                       <button style={{
                       backgroundColor: '#64748b',
                       color: 'white',
                       padding: '12px 24px',
                       borderRadius: '8px',
                       border: 'none',
                       fontSize: '14px',
                       fontWeight: '600',
                       cursor: 'pointer'
                       }}>
                       ⚙️ CONFIG
                       </button>
                   </div>
                   </div>
               </div>
               )}
       
               {/* Modal: Conquistas */}
               {modalConquistas && (
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
                       🏆 SISTEMA DE CONQUISTAS
                       </h2>
                       <button
                       onClick={() => setModalConquistas(false)}
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
       
                   {/* Streak Atual */}
                   <div style={{
                       backgroundColor: '#f0f9ff',
                       borderRadius: '12px',
                       padding: '20px',
                       marginBottom: '24px',
                       textAlign: 'center'
                   }}>
                       <h3 style={{
                       fontSize: '20px',
                       fontWeight: 'bold',
                       color: '#1e40af',
                       margin: '0 0 16px 0'
                       }}>
                       🔥 STREAK ATUAL: {resumoConquistas.streakDias} dias consecutivos poupando!
                       </h3>
                       
                       <div style={{
                       backgroundColor: '#e0e7ff',
                       borderRadius: '12px',
                       height: '12px',
                       marginBottom: '8px',
                       overflow: 'hidden'
                       }}>
                       <div style={{
                           backgroundColor: '#3b82f6',
                           height: '100%',
                           width: '92%',
                           transition: 'width 0.5s ease',
                           borderRadius: '12px'
                       }} />
                       </div>
                       
                       <div style={{
                       fontSize: '14px',
                       color: '#3b82f6',
                       fontWeight: '600'
                       }}>
                       92% para próximo nível
                       </div>
                   </div>
       
                   {/* Conquistas Desbloqueadas */}
                   <div style={{
                       backgroundColor: '#f0fdf4',
                       borderRadius: '12px',
                       padding: '20px',
                       marginBottom: '24px'
                   }}>
                       <h3 style={{
                       fontSize: '18px',
                       fontWeight: 'bold',
                       color: '#166534',
                       margin: '0 0 16px 0'
                       }}>
                       🏅 CONQUISTAS DESBLOQUEADAS:
                       </h3>
                       
                       <div style={{
                       display: 'flex',
                       flexDirection: 'column',
                       gap: '12px'
                       }}>
                       {conquistasDesbloqueadas.map((conquista, index) => (
                           <div key={index} style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',
                           padding: '12px',
                           backgroundColor: 'white',
                           borderRadius: '8px',
                           border: '1px solid #d1fae5'
                           }}>
                           <div style={{
                               display: 'flex',
                               alignItems: 'center',
                               gap: '12px'
                           }}>
                               <span style={{ fontSize: '20px' }}>{conquista.emoji}</span>
                               <span style={{ fontWeight: '600', color: '#1a202c' }}>
                               ✅ {conquista.nome}
                               </span>
                           </div>
                           <span style={{ fontSize: '12px', color: '#64748b' }}>
                               🗓️ {conquista.data}
                           </span>
                           </div>
                       ))}
                       </div>
                   </div>
       
                   {/* Próximas Conquistas */}
                   <div style={{
                       backgroundColor: '#fefce8',
                       borderRadius: '12px',
                       padding: '20px',
                       marginBottom: '24px'
                   }}>
                       <h3 style={{
                       fontSize: '18px',
                       fontWeight: 'bold',
                       color: '#a16207',
                       margin: '0 0 16px 0'
                       }}>
                       🎯 PRÓXIMAS CONQUISTAS:
                       </h3>
                       
                       <div style={{
                       display: 'flex',
                       flexDirection: 'column',
                       gap: '12px'
                       }}>
                       {proximasConquistas.map((conquista, index) => (
                           <div key={index} style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',
                           padding: '12px',
                           backgroundColor: 'white',
                           borderRadius: '8px',
                           border: '1px solid #fef3c7'
                           }}>
                           <div style={{
                               display: 'flex',
                               alignItems: 'center',
                               gap: '12px'
                           }}>
                               <span style={{ fontSize: '20px' }}>{conquista.emoji}</span>
                               <span style={{ fontWeight: '600', color: '#1a202c' }}>
                               {conquista.nome}
                               </span>
                           </div>
                           <span style={{ fontSize: '12px', color: '#a16207' }}>
                               ({conquista.restante})
                           </span>
                           </div>
                       ))}
                       </div>
                   </div>
       
                   {/* Rankings Familiares */}
                   <div style={{
                       backgroundColor: '#f3f4f6',
                       borderRadius: '12px',
                       padding: '20px',
                       marginBottom: '24px'
                   }}>
                       <h3 style={{
                       fontSize: '18px',
                       fontWeight: 'bold',
                       color: '#374151',
                       margin: '0 0 16px 0'
                       }}>
                       🎮 RANKINGS FAMILIARES:
                       </h3>
                       
                       <div style={{
                       display: 'flex',
                       flexDirection: 'column',
                       gap: '12px'
                       }}>
                       <div style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',
                           padding: '12px',
                           backgroundColor: '#dbeafe',
                           borderRadius: '8px',
                           border: '1px solid #93c5fd'
                       }}>
                           <span style={{ fontWeight: '600', color: '#1e40af' }}>
                           👨 Você: Nível 12 - "POUPADOR MASTER"
                           </span>
                           <span style={{ fontSize: '20px' }}>🥇</span>
                       </div>
                       
                       <div style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',
                           padding: '12px',
                           backgroundColor: '#fce7f3',
                           borderRadius: '8px',
                           border: '1px solid #f9a8d4'
                       }}>
                           <span style={{ fontWeight: '600', color: '#be185d' }}>
                           👩 Esposa: Nível 10 - "PLANEJADORA PRO"
                           </span>
                           <span style={{ fontSize: '20px' }}>🥈</span>
                       </div>
                       </div>
                   </div>
       
                   {/* Ações */}
                   <div style={{
                       display: 'flex',
                       gap: '12px',
                       justifyContent: 'center'
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
                       🎊 VER TODAS
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
                       📊 ESTATÍSTICAS
                       </button>
                       <button style={{
                       backgroundColor: '#8b5cf6',
                       color: 'white',
                       padding: '12px 24px',
                       borderRadius: '8px',
                       border: 'none',
                       fontSize: '14px',
                       fontWeight: '600',
                       cursor: 'pointer'
                       }}>
                       🎮 DESAFIOS
                       </button>
                   </div>
                   </div>
               </div>
               )}
       
               {/* Modal: Calculadora de Metas */}
               {modalCalculadora && (
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
                   maxWidth: '800px',
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
                       🧮 CALCULADORA DE METAS
                       </h2>
                       <button
                       onClick={() => setModalCalculadora(false)}
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
       
                   {/* Modo da Calculadora */}
                   <div style={{
                       display: 'flex',
                       gap: '8px',
                       marginBottom: '24px',
                       backgroundColor: '#f1f5f9',
                       borderRadius: '8px',
                       padding: '4px'
                   }}>
                       <button style={{
                       flex: 1,
                       padding: '12px',
                       borderRadius: '6px',
                       border: 'none',
                       fontSize: '14px',
                       fontWeight: '600',
                       cursor: 'pointer',
                       backgroundColor: '#3b82f6',
                       color: 'white'
                       }}>
                       💰 Valor→Prazo
                       </button>
                       <button style={{
                       flex: 1,
                       padding: '12px',
                       borderRadius: '6px',
                       border: 'none',
                       fontSize: '14px',
                       fontWeight: '600',
                       cursor: 'pointer',
                       backgroundColor: 'transparent',
                       color: '#64748b'
                       }}>
                       📅 Prazo→Valor
                       </button>
                       <button style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        backgroundColor: 'transparent',
                        color: '#64748b'
                    }}>
                        📊 Ambos
                    </button>
                    </div>
    
                    {/* Cenário 1: Quanto Poupar */}
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
                        ┌─ CENÁRIO 1: "QUANTO POUPAR?" ─────────────────────┐
                    </h3>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '16px',
                        marginBottom: '20px'
                    }}>
                        <div>
                        <label style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px',
                            display: 'block'
                        }}>
                            🎯 Meta:
                        </label>
                        <input
                            type="text"
                            defaultValue="R$ 20.000,00"
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
                        <label style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px',
                            display: 'block'
                        }}>
                            📅 Prazo:
                        </label>
                        <input
                            type="text"
                            defaultValue="18 meses"
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
                        <label style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px',
                            display: 'block'
                        }}>
                            💰 Já tenho:
                        </label>
                        <input
                            type="text"
                            defaultValue="R$ 3.000,00"
                            style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                            }}
                        />
                        </div>
                    </div>
                    
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '16px',
                        border: '1px solid #bfdbfe'
                    }}>
                        <h4 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#1e40af',
                        margin: '0 0 12px 0'
                        }}>
                        📊 RESULTADO:
                        </h4>
                        
                        <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        fontSize: '14px',
                        color: '#374151'
                        }}>
                        <div>├─ Valor mensal: R$ 944,44</div>
                        <div>├─ Valor diário: R$ 31,48</div>
                        <div>├─ % da renda: 8.9% (VIÁVEL!)</div>
                        <div>└─ Data final: Jan/2027</div>
                        </div>
                    </div>
                    </div>
    
                    {/* Cenário 2: Em Quanto Tempo */}
                    <div style={{
                    backgroundColor: '#f0fdf4',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px'
                    }}>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#166534',
                        margin: '0 0 16px 0'
                    }}>
                        ┌─ CENÁRIO 2: "EM QUANTO TEMPO?" ────────────────────┐
                    </h3>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '16px',
                        marginBottom: '20px'
                    }}>
                        <div>
                        <label style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px',
                            display: 'block'
                        }}>
                            🎯 Meta:
                        </label>
                        <input
                            type="text"
                            defaultValue="R$ 15.000,00"
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
                        <label style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px',
                            display: 'block'
                        }}>
                            💰 Posso poupar:
                        </label>
                        <input
                            type="text"
                            defaultValue="R$ 800/mês"
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
                        <label style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px',
                            display: 'block'
                        }}>
                            💰 Já tenho:
                        </label>
                        <input
                            type="text"
                            defaultValue="R$ 2.000,00"
                            style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                            }}
                        />
                        </div>
                    </div>
                    
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '16px',
                        border: '1px solid #bbf7d0'
                    }}>
                        <h4 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#166534',
                        margin: '0 0 12px 0'
                        }}>
                        📊 RESULTADO:
                        </h4>
                        
                        <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        fontSize: '14px',
                        color: '#374151'
                        }}>
                        <div>├─ Tempo necessário: 16,25 meses</div>
                        <div>├─ Data conclusão: Nov/2026</div>
                        <div>├─ Economia diária: R$ 26,67</div>
                        <div>└─ Viabilidade: 95% (ÓTIMA!)</div>
                        </div>
                    </div>
                    </div>
    
                    {/* Ações */}
                    <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center'
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
                        💾 CRIAR META
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
                        📊 COMPARAR
                    </button>
                    <button style={{
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        🔄 NOVO CÁLCULO
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
                0% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
                100% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.8); }
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