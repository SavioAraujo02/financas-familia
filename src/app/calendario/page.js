'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'

export default function CalendarioFinanceiro() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Estados do calendário
  const [mesAtual, setMesAtual] = useState(new Date(2025, 6, 25)) // Julho 2025, dia 25
  const [diaSelecionado, setDiaSelecionado] = useState(25)
  const [filtrosAtivos, setFiltrosAtivos] = useState({
    receitas: true,
    despesas: true,
    faturas: true,
    metas: true,
    seus: true,
    dela: true,
    todos: true
  })
  
  // Estados dos modais
  const [modalEvento, setModalEvento] = useState(false)
  const [modalResumoMes, setModalResumoMes] = useState(false)
  
  // Dados dos eventos do calendário
  const [eventosCalendario, setEventosCalendario] = useState({
    1: [{ tipo: 'receita', descricao: 'Salário João', valor: 6400, emoji: '💰' }],
    2: [{ tipo: 'despesa', descricao: 'Conta Luz', valor: 120, emoji: '⚡' }],
    3: [{ tipo: 'meta', descricao: 'Depósito Casa', valor: 500, emoji: '🎯' }],
    4: [{ tipo: 'despesa', descricao: 'Celular', valor: 46, emoji: '📱' }],
    5: [{ tipo: 'despesa', descricao: 'Supermercado', valor: 340, emoji: '🛒' }],
    6: [{ tipo: 'despesa', descricao: 'Aluguel', valor: 1800, emoji: '🏠' }],
    8: [{ tipo: 'despesa', descricao: 'Farmácia', valor: 89, emoji: '💊' }],
    10: [{ tipo: 'fatura', descricao: 'Fatura Nubank', valor: 847, emoji: '💳' }],
    12: [{ tipo: 'despesa', descricao: 'Spotify', valor: 30, emoji: '🎵' }],
    15: [{ tipo: 'receita', descricao: 'Salário Maria', valor: 4200, emoji: '💰' }],
    16: [{ tipo: 'despesa', descricao: 'Energia', valor: 380, emoji: '🔌' }],
    18: [{ tipo: 'meta', descricao: 'Meta Viagem', valor: 1000, emoji: '🎯' }],
    19: [{ tipo: 'fatura', descricao: 'Fatura Santander', valor: 523, emoji: '💳' }],
    22: [{ tipo: 'despesa', descricao: 'Livros', valor: 199, emoji: '📚' }],
    24: [{ tipo: 'despesa', descricao: 'Combustível', valor: 180, emoji: '⛽' }],
    28: [
      { tipo: 'fatura', descricao: 'Fatura Nubank', valor: 847, emoji: '💳' },
      { tipo: 'fatura', descricao: 'Fatura Santander', valor: 1247, emoji: '💳' },
      { tipo: 'meta', descricao: 'Depósito Meta Casa', valor: 1030, emoji: '🎯' }
    ],
    30: [{ tipo: 'receita', descricao: 'Salário João', valor: 6400, emoji: '💰' }]
  })
  
  // Dados do resumo mensal
  const [resumoMensal, setResumoMensal] = useState({
    receitas: 10600,
    despesas: 8795.79,
    faturas: 4094,
    metas: 2845,
    sobra: 1804.21,
    totalEventos: 23,
    diaMaisPesado: { dia: 28, valor: 3124 },
    maiorReceita: { dia: 30, valor: 6400, descricao: 'Salário João' },
    maisDepositos: { dia: 15, quantidade: 3 },
    diasSemEventos: 18
  })
  
  // Próximos eventos (7 dias)
  const [proximosEventos, setProximosEventos] = useState([
    { data: '26/Jul', descricao: '(Nenhum evento)', valor: 0, tipo: 'vazio' },
    { data: '27/Jul', descricao: '(Nenhum evento)', valor: 0, tipo: 'vazio' },
    { data: '28/Jul', descricao: 'DIA PESADO', valor: 3124, tipo: 'critico', eventos: [
      { descricao: 'Fatura Nubank', valor: 847 },
      { descricao: 'Fatura Santander', valor: 1247 },
      { descricao: 'Depósito Meta Casa', valor: 1030 }
    ]},
    { data: '29/Jul', descricao: '(Nenhum evento)', valor: 0, tipo: 'vazio' },
    { data: '30/Jul', descricao: 'Salário João', valor: 6400, tipo: 'receita' },
    { data: '31/Jul', descricao: '(Nenhum evento)', valor: 0, tipo: 'vazio' },
    { data: '01/Ago', descricao: 'Conta Luz CEMIG', valor: 120, tipo: 'despesa' }
  ])
  
  // Comparativo com mês anterior
  const [comparativo, setComparativo] = useState({
    receitas: { valor: 200, percentual: 2, tendencia: 'up' },
    despesas: { valor: -156, percentual: -2, tendencia: 'down' },
    faturas: { valor: 234, percentual: 6, tendencia: 'up' },
    metas: { valor: 145, percentual: 5, tendencia: 'up' },
    sobra: { valor: 356, percentual: 25, tendencia: 'up' }
  })

  // Carregar dados reais
  useEffect(() => {
    loadCalendarioData()
  }, [])

  const loadCalendarioData = async () => {
    try {
      const { auth, transactions } = await import('@/lib/supabase')
      
      const { user: currentUser } = await auth.getUser()
      if (!currentUser) {
        window.location.href = '/auth/login'
        return
      }
      
      setUser(currentUser)
      
      // Carregar eventos reais do calendário
      // Por enquanto mantemos os dados fictícios para demonstração
      
    } catch (error) {
      console.error('Erro ao carregar calendário:', error)
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

  const getTendenciaIcon = (tendencia) => {
    switch (tendencia) {
      case 'up': return '↗️'
      case 'down': return '↘️'
      case 'stable': return '➡️'
      default: return '➡️'
    }
  }

  const getCorPorTipo = (tipo) => {
    switch (tipo) {
      case 'receita': return '#10b981'
      case 'despesa': return '#ef4444'
      case 'fatura': return '#f59e0b'
      case 'meta': return '#8b5cf6'
      default: return '#64748b'
    }
  }

  const gerarCalendario = () => {
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()
    const primeiroDia = new Date(ano, mes, 1).getDay()
    const ultimoDia = new Date(ano, mes + 1, 0).getDate()
    
    const dias = []
    
    // Dias vazios do início
    for (let i = 0; i < primeiroDia; i++) {
      dias.push(null)
    }
    
    // Dias do mês
    for (let dia = 1; dia <= ultimoDia; dia++) {
      dias.push(dia)
    }
    
    return dias
  }

  const obterEventosDoDia = (dia) => {
    return eventosCalendario[dia] || []
  }

  const calcularTotalDia = (dia) => {
    const eventos = obterEventosDoDia(dia)
    return eventos.reduce((total, evento) => total + evento.valor, 0)
  }

  const navegarMes = (direcao) => {
    const novoMes = new Date(mesAtual)
    novoMes.setMonth(mesAtual.getMonth() + direcao)
    setMesAtual(novoMes)
    setDiaSelecionado(1)
  }

  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="calendario" />
        <main style={{ flex: 1, marginLeft: sidebarOpen ? '300px' : '80px' }}>
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <h2 style={{ fontSize: '24px', color: '#64748b' }}>Carregando calendário financeiro...</h2>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="calendario" />

      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '300px' : '80px',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header */}
        <header style={{
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
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
                  📅 CALENDÁRIO
                  <span style={{ fontSize: '16px', opacity: 0.9 }}>
                    | {mesesNomes[mesAtual.getMonth()]} {mesAtual.getFullYear()} | {resumoMensal.totalEventos} eventos | Próximo: Luz (R$ 120)
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
                  FinBot - Planejador Temporal
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.95 }}>
                  28/Jul vai ser pesado: 3 faturas no mesmo dia! Prepare {formatCurrency(3124)} para não apertar.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Navegação e Filtros */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Navegação */}
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
                marginBottom: '16px'
              }}>
                <button
                  onClick={() => navegarMes(-1)}
                  style={{
                    backgroundColor: '#06b6d4',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  ◀️ Jun
                </button>
                
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1a202c',
                  margin: 0
                }}>
                  {mesesNomes[mesAtual.getMonth()].toUpperCase()} {mesAtual.getFullYear()}
                </h2>
                
                <button
                  onClick={() => navegarMes(1)}
                  style={{
                    backgroundColor: '#06b6d4',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  Ago ▶️
                </button>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                fontSize: '14px',
                color: '#64748b'
              }}>
                <div>Hoje: {diaSelecionado}/{mesAtual.getMonth() + 1}</div>
                <div>Semana: {Math.ceil(diaSelecionado / 7)}</div>
              </div>
            </div>

            {/* Filtros */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '0 0 16px 0',
                color: '#1a202c'
              }}>
                🔍 FILTROS
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '12px'
              }}>
                {[
                  { key: 'receitas', label: '💰 Receitas', cor: '#10b981' },
                  { key: 'despesas', label: '💸 Despesas', cor: '#ef4444' },
                  { key: 'faturas', label: '💳 Faturas', cor: '#f59e0b' },
                  { key: 'metas', label: '🎯 Metas', cor: '#8b5cf6' },
                  { key: 'seus', label: '👨 Seus', cor: '#3b82f6' },
                  { key: 'dela', label: '👩 Dela', cor: '#ec4899' }
                ].map(filtro => (
                  <label key={filtro.key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    backgroundColor: filtrosAtivos[filtro.key] ? `${filtro.cor}20` : 'transparent'
                  }}>
                    <input
                      type="checkbox"
                      checked={filtrosAtivos[filtro.key]}
                      onChange={(e) => setFiltrosAtivos({
                        ...filtrosAtivos,
                        [filtro.key]: e.target.checked
                      })}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ color: filtro.cor, fontWeight: '600' }}>
                      {filtro.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Calendário Principal */}
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
              color: '#1a202c',
              textAlign: 'center'
            }}>
              📅 CALENDÁRIO {mesesNomes[mesAtual.getMonth()].toUpperCase()} {mesAtual.getFullYear()}
            </h2>
            
            {/* Cabeçalho dos dias da semana */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
              marginBottom: '8px'
            }}>
              {diasSemana.map(dia => (
                <div key={dia} style={{
                  padding: '12px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#64748b',
                  backgroundColor: '#f8fafc'
                }}>
                  {dia}
                </div>
              ))}
            </div>
            
            {/* Grid do calendário */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px'
            }}>
              {gerarCalendario().map((dia, index) => {
                if (!dia) {
                  return <div key={index} style={{ height: '80px' }} />
                }
                
                const eventos = obterEventosDoDia(dia)
                const totalDia = calcularTotalDia(dia)
                const isHoje = dia === 25 // Simulando que hoje é dia 25
                const isSelecionado = dia === diaSelecionado
                
                return (
                  <div
                    key={dia}
                    onClick={() => setDiaSelecionado(dia)}
                    style={{
                      minHeight: '80px',
                      padding: '8px',
                      backgroundColor: isHoje ? '#fef3c7' : 
                                     isSelecionado ? '#dbeafe' : 
                                     eventos.length > 0 ? '#f8fafc' : 'white',
                      border: isHoje ? '2px solid #f59e0b' : 
                             isSelecionado ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      if (!isHoje && !isSelecionado) {
                        e.target.style.backgroundColor = '#f1f5f9'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isHoje && !isSelecionado) {
                        e.target.style.backgroundColor = eventos.length > 0 ? '#f8fafc' : 'white'
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: isHoje ? '#92400e' : '#1a202c'
                      }}>
                        {dia}
                      </span>
                      {isHoje && (
                        <span style={{
                          fontSize: '10px',
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 'bold'
                        }}>
                          HOJE
                        </span>
                      )}
                    </div>
                    
                    {eventos.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}>
                        {eventos.slice(0, 2).map((evento, eventIndex) => (
                          <div key={eventIndex} style={{
                            fontSize: '10px',
                            padding: '2px 4px',
                            borderRadius: '3px',
                            backgroundColor: getCorPorTipo(evento.tipo),
                            color: 'white',
                            fontWeight: '600',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {evento.emoji} {formatCurrency(evento.valor)}
                          </div>
                        ))}
                        
                        {eventos.length > 2 && (
                          <div style={{
                            fontSize: '9px',
                            color: '#64748b',
                            fontWeight: '600',
                            textAlign: 'center'
                          }}>
                            +{eventos.length - 2} mais
                          </div>
                        )}
                        
                        {eventos.length > 1 && (
                          <div style={{
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#1a202c',
                            textAlign: 'center',
                            marginTop: '2px',
                            padding: '2px',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            borderRadius: '3px'
                          }}>
                            {formatCurrency(totalDia)}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Indicadores especiais */}
                    {dia === 28 && (
                      <div style={{
                        fontSize: '8px',
                        color: '#ef4444',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginTop: '2px'
                      }}>
                        ⚠️PESADO
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detalhes do Dia + Próximos Eventos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Detalhes do Dia Selecionado */}
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
                📊 DETALHES DO DIA: {diaSelecionado}/{mesAtual.getMonth() + 1} {diaSelecionado === 25 ? '(HOJE)' : ''}
              </h2>
              
              {obterEventosDoDia(diaSelecionado).length > 0 ? (
                <div>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#1a202c',
                      margin: '0 0 12px 0'
                    }}>
                      📊 RESUMO DO DIA:
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#374151'
                    }}>
                      <div>Total de eventos: {obterEventosDoDia(diaSelecionado).length}</div>
                      <div>Total do dia: {formatCurrency(calcularTotalDia(diaSelecionado))}</div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {obterEventosDoDia(diaSelecionado).map((evento, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '20px' }}>{evento.emoji}</span>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1a202c'
                          }}>
                            {evento.descricao}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: getCorPorTipo(evento.tipo)
                        }}>
                          {formatCurrency(evento.valor)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#64748b'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                  <p style={{ fontSize: '16px', margin: 0 }}>
                    Nenhum evento neste dia
                  </p>
                </div>
              )}
            </div>

            {/* Próximos Eventos */}
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
                ⏰ PRÓXIMOS EVENTOS (7 dias)
              </h2>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {proximosEventos.map((evento, index) => (
                                    <div key={index} style={{
                                        padding: '12px',
                                        backgroundColor: evento.tipo === 'critico' ? '#fef2f2' : 
                                                       evento.tipo === 'receita' ? '#f0fdf4' :
                                                       evento.tipo === 'despesa' ? '#fef3c7' : '#f8fafc',
                                        borderRadius: '8px',
                                        border: `1px solid ${evento.tipo === 'critico' ? '#fecaca' : 
                                                            evento.tipo === 'receita' ? '#bbf7d0' :
                                                            evento.tipo === 'despesa' ? '#fef3c7' : '#e2e8f0'}`
                                      }}>
                                        <div style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          marginBottom: evento.eventos ? '8px' : '0'
                                        }}>
                                          <div style={{
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            color: '#1a202c'
                                          }}>
                                            📅 {evento.data} {evento.data.includes('28') ? '⚠️' : ''}
                                          </div>
                                          {evento.valor > 0 && (
                                            <div style={{
                                              fontSize: '14px',
                                              fontWeight: 'bold',
                                              color: evento.tipo === 'critico' ? '#ef4444' :
                                                     evento.tipo === 'receita' ? '#10b981' : '#f59e0b'
                                            }}>
                                              {formatCurrency(evento.valor)}
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div style={{
                                          fontSize: '13px',
                                          color: '#374151'
                                        }}>
                                          {evento.descricao}
                                        </div>
                                        
                                        {evento.eventos && (
                                          <div style={{
                                            marginTop: '8px',
                                            fontSize: '12px',
                                            color: '#64748b'
                                          }}>
                                            {evento.eventos.map((subEvento, subIndex) => (
                                              <div key={subIndex} style={{ marginBottom: '2px' }}>
                                                ├─ {subEvento.descricao}: {formatCurrency(subEvento.valor)}
                                              </div>
                                            ))}
                                            <div style={{
                                              marginTop: '4px',
                                              fontSize: '11px',
                                              color: '#ef4444',
                                              fontWeight: '600'
                                            }}>
                                              📊 Total do dia: {formatCurrency(evento.valor)} (29% da renda!)
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                    
                              {/* Análise Mensal */}
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
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    margin: 0,
                                    color: '#1a202c'
                                  }}>
                                    📊 ANÁLISE MENSAL
                                  </h2>
                                  
                                  <button
                                    onClick={() => setModalResumoMes(true)}
                                    style={{
                                      backgroundColor: '#06b6d4',
                                      color: 'white',
                                      padding: '8px 16px',
                                      borderRadius: '8px',
                                      border: 'none',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    📊 RELATÓRIO COMPLETO
                                  </button>
                                </div>
                                
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr 1fr',
                                  gap: '24px'
                                }}>
                                  {/* Resumo Julho */}
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
                                      📊 JULHO 2025 - RESUMO:
                                    </h3>
                                    
                                    <div style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '8px',
                                      fontSize: '14px',
                                      color: '#374151'
                                    }}>
                                      <div>├─ 💰 Receitas: {formatCurrency(resumoMensal.receitas)}</div>
                                      <div>├─ 💸 Despesas: {formatCurrency(resumoMensal.despesas)}</div>
                                      <div>├─ 💳 Faturas: {formatCurrency(resumoMensal.faturas)}</div>
                                      <div>├─ 🎯 Metas: {formatCurrency(resumoMensal.metas)}</div>
                                      <div>└─ ✅ Sobra: {formatCurrency(resumoMensal.sobra)}</div>
                                    </div>
                                  </div>
                    
                                  {/* Comparativo */}
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
                                      📈 COMPARATIVO:
                                    </h3>
                                    
                                    <div style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '8px',
                                      fontSize: '14px',
                                      color: '#374151'
                                    }}>
                                      <div>├─ vs Jun: +{formatCurrency(comparativo.receitas.valor)} ({getTendenciaIcon(comparativo.receitas.tendencia)}{comparativo.receitas.percentual}%)</div>
                                      <div>├─ vs Jun: {formatCurrency(comparativo.despesas.valor)} ({getTendenciaIcon(comparativo.despesas.tendencia)}{comparativo.despesas.percentual}%)</div>
                                      <div>├─ vs Jun: +{formatCurrency(comparativo.faturas.valor)} ({getTendenciaIcon(comparativo.faturas.tendencia)}{comparativo.faturas.percentual}%)</div>
                                      <div>├─ vs Jun: +{formatCurrency(comparativo.metas.valor)} ({getTendenciaIcon(comparativo.metas.tendencia)}{comparativo.metas.percentual}%)</div>
                                      <div>└─ vs Jun: +{formatCurrency(comparativo.sobra.valor)} ({getTendenciaIcon(comparativo.sobra.tendencia)}{comparativo.sobra.percentual}%)</div>
                                    </div>
                                  </div>
                    
                                  {/* Dias Importantes */}
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
                                      🗓️ DIAS IMPORTANTES:
                                    </h3>
                                    
                                    <div style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '8px',
                                      fontSize: '14px',
                                      color: '#374151'
                                    }}>
                                      <div>├─ 🔥 Dia mais pesado: {resumoMensal.diaMaisPesado.dia}/Jul ({formatCurrency(resumoMensal.diaMaisPesado.valor)})</div>
                                      <div>├─ 💰 Maior receita: {resumoMensal.maiorReceita.dia}/Jul ({resumoMensal.maiorReceita.descricao} {formatCurrency(resumoMensal.maiorReceita.valor)})</div>
                                      <div>├─ 🎯 Mais depósitos: {resumoMensal.maisDepositos.dia}/Jul ({resumoMensal.maisDepositos.quantidade} metas)</div>
                                      <div>└─ 📅 Dias sem eventos: {resumoMensal.diasSemEventos} dias</div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Dicas para Agosto */}
                                <div style={{
                                  marginTop: '20px',
                                  backgroundColor: '#f0f9ff',
                                  borderRadius: '12px',
                                  padding: '20px',
                                  border: '1px solid #bfdbfe'
                                }}>
                                  <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    color: '#1e40af',
                                    margin: '0 0 12px 0'
                                  }}>
                                    💡 DICAS PARA AGOSTO:
                                  </h3>
                                  
                                  <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '12px',
                                    fontSize: '14px',
                                    color: '#374151'
                                  }}>
                                    <div>├─ Evitar gastos grandes dias 8-15 (muitas faturas)</div>
                                    <div>├─ Aproveitar início do mês para metas</div>
                                    <div>├─ Preparar {formatCurrency(4500)} para faturas até dia 20</div>
                                    <div>└─ Planejar 13º salário para acelerar casa própria</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                    
                            {/* Modal: Resumo Completo do Mês */}
                            {modalResumoMes && (
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
                                      📊 RELATÓRIO COMPLETO - JULHO 2025
                                    </h2>
                                    <button
                                      onClick={() => setModalResumoMes(false)}
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
                    
                                  {/* Resumo Executivo */}
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
                                      📈 RESUMO EXECUTIVO:
                                    </h3>
                                    
                                    <div style={{
                                      display: 'grid',
                                      gridTemplateColumns: '1fr 1fr 1fr',
                                      gap: '16px',
                                      marginBottom: '16px'
                                    }}>
                                      <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                                          {formatCurrency(resumoMensal.receitas)}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                          💰 RECEITAS
                                        </div>
                                      </div>
                                      
                                      <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>
                                          {formatCurrency(resumoMensal.despesas)}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                          💸 DESPESAS
                                        </div>
                                      </div>
                                      
                                      <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                                          {formatCurrency(resumoMensal.sobra)}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                          ✅ SOBRA
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div style={{
                                      textAlign: 'center',
                                      fontSize: '16px',
                                      fontWeight: 'bold',
                                      color: '#166534',
                                      backgroundColor: 'white',
                                      padding: '12px',
                                      borderRadius: '8px'
                                    }}>
                                      🎯 Taxa de Poupança: {Math.round((resumoMensal.sobra / resumoMensal.receitas) * 100)}% - EXCELENTE!
                                    </div>
                                  </div>
                    
                                  {/* Análise Detalhada */}
                                  <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '20px',
                                    marginBottom: '24px'
                                  }}>
                                    <div style={{
                                      backgroundColor: '#f8fafc',
                                      borderRadius: '12px',
                                      padding: '16px'
                                    }}>
                                      <h4 style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: '#1a202c',
                                        margin: '0 0 12px 0'
                                      }}>
                                        📊 DISTRIBUIÇÃO:
                                      </h4>
                                      <div style={{ fontSize: '14px', color: '#374151' }}>
                                      <div>• Faturas: {Math.round((resumoMensal.faturas / resumoMensal.receitas) * 100)}%</div>
                    <div>• Metas: {Math.round((resumoMensal.metas / resumoMensal.receitas) * 100)}%</div>
                    <div>• Despesas: {Math.round((resumoMensal.despesas / resumoMensal.receitas) * 100)}%</div>
                    <div>• Sobra: {Math.round((resumoMensal.sobra / resumoMensal.receitas) * 100)}%</div>
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1a202c',
                    margin: '0 0 12px 0'
                  }}>
                    🎯 PERFORMANCE:
                  </h4>
                  <div style={{ fontSize: '14px', color: '#374151' }}>
                    <div>• Eventos totais: {resumoMensal.totalEventos}</div>
                    <div>• Dias ativos: {31 - resumoMensal.diasSemEventos}</div>
                    <div>• Maior dia: {formatCurrency(resumoMensal.diaMaisPesado.valor)}</div>
                    <div>• Consistência: 95% ✅</div>
                  </div>
                </div>
              </div>

              {/* Previsões para Agosto */}
              <div style={{
                backgroundColor: '#fefce8',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#a16207',
                  margin: '0 0 16px 0'
                }}>
                  🔮 PREVISÕES PARA AGOSTO:
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div>
                    <strong>Receitas esperadas:</strong><br/>
                    {formatCurrency(10800)} (+2%)
                  </div>
                  <div>
                    <strong>Despesas estimadas:</strong><br/>
                    {formatCurrency(9200)} (+5%)
                  </div>
                  <div>
                    <strong>Sobra projetada:</strong><br/>
                    {formatCurrency(1600)} (-11%)
                  </div>
                  <div>
                    <strong>Situação:</strong><br/>
                    🟢 NORMAL (dentro do esperado)
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
                  backgroundColor: '#06b6d4',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  📄 EXPORTAR PDF
                </button>
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
                  📊 GERAR RELATÓRIO
                </button>
                <button
                  onClick={() => setModalResumoMes(false)}
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
                  ❌ FECHAR
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
          0% { box-shadow: 0 0 5px rgba(6, 182, 212, 0.5); }
          100% { box-shadow: 0 0 15px rgba(6, 182, 212, 0.8); }
        }
        
        .calendar-day {
          transition: all 0.2s ease;
        }
        
        .calendar-day:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .event-item {
          animation: slideInUp 0.3s ease;
        }
      `}</style>
    </div>
  )
}