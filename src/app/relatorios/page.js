'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts'
import Sidebar from '@/components/layout/Sidebar'

export default function RelatoriosAnalise() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Estados dos filtros
  const [periodoSelecionado, setPeriodoSelecionado] = useState('Jul/2025')
  const [escopoSelecionado, setEscopoSelecionado] = useState('familia')
  const [tipoRelatorio, setTipoRelatorio] = useState('executivo')
  const [abaAtiva, setAbaAtiva] = useState('grafico') // grafico, tabela, tendencia, insights
  
  // Estados dos modais
  const [modalExportacao, setModalExportacao] = useState(false)
  const [modalPersonalizar, setModalPersonalizar] = useState(false)
  
  // Estados dos dados
  const [resumoExecutivo, setResumoExecutivo] = useState({
    scoreGeral: 847,
    statusGeral: 'EXCELENTE',
    receitas: 10600,
    despesas: 8795.79,
    sobra: 1804.21,
    taxaPoupanca: 17,
    comparativoAnterior: {
      receitas: { valor: 200, percentual: 2, tendencia: 'up' },
      despesas: { valor: -156, percentual: -2, tendencia: 'down' },
      sobra: { valor: 356, percentual: 25, tendencia: 'up' },
      eficiencia: 12
    },
    saudeCartoes: {
      usoMedio: 31,
      maiorRisco: { nome: 'Santander', percentual: 77 },
      faturasPagas: 100,
      atrasos: 0
    },
    metas: {
      depositos: 2845,
      performance: 5,
      noPrazo: { atual: 4, total: 5 },
      adiantadas: 1
    }
  })
  
  const [categorias, setCategorias] = useState([
    { nome: 'Moradia', valor: 3240, percentual: 37, cor: '#ef4444', emoji: '🏠' },
    { nome: 'Alimentação', valor: 2130, percentual: 24, cor: '#f59e0b', emoji: '🍔' },
    { nome: 'Transporte', valor: 1320, percentual: 15, cor: '#3b82f6', emoji: '🚗' },
    { nome: 'Saúde', valor: 890, percentual: 10, cor: '#10b981', emoji: '💊' },
    { nome: 'Lazer', valor: 670, percentual: 8, cor: '#8b5cf6', emoji: '🎮' },
    { nome: 'Educação', valor: 345, percentual: 4, cor: '#6366f1', emoji: '📚' },
    { nome: 'Outros', valor: 201, percentual: 2, cor: '#64748b', emoji: '🛍️' }
  ])
  
  const [evolucaoTemporal, setEvolucaoTemporal] = useState([
    { mes: 'Fev', receitas: 10400, despesas: 8900, sobra: 1500 },
    { mes: 'Mar', receitas: 10400, despesas: 8750, sobra: 1650 },
    { mes: 'Abr', receitas: 10400, despesas: 8600, sobra: 1800 },
    { mes: 'Mai', receitas: 10400, despesas: 8850, sobra: 1550 },
    { mes: 'Jun', receitas: 10400, despesas: 8952, sobra: 1448 },
    { mes: 'Jul', receitas: 10600, despesas: 8796, sobra: 1804 }
  ])
  
  const [previsoesPreditivas, setPrevisoesPreditivas] = useState({
    agosto: {
      receitas: { valor: 10800, variacao: 2 },
      despesas: { valor: 9200, variacao: 5, motivo: 'compras previstas' },
      sobra: { valor: 1600, variacao: -11 },
      situacao: 'NORMAL'
    },
    recomendacoes: [
      { tipo: 'meta', icone: '🎯', texto: 'Acelerar meta "Casa Própria" com sobra de julho' },
      { tipo: 'cartao', icone: '💳', texto: 'Reorganizar uso dos cartões (reduzir Santander)' },
      { tipo: 'planejamento', icone: '🛒', texto: 'Planejar compras de agosto para evitar Setembro' },
      { tipo: 'limite', icone: '📊', texto: 'Considerar aumentar limite do Inter' },
      { tipo: 'disciplina', icone: '🎮', texto: 'Manter disciplina atual (está funcionando!)' }
    ],
    pontosFortes: [
      'Consistência nos depósitos de metas',
      'Controle exemplar das despesas variáveis',
      'Uso inteligente dos cartões de crédito',
      'Capacidade de adaptação às mudanças'
    ]
  })
  
  const [analiseIA, setAnaliseIA] = useState({
    perfilDetectado: 'CASAL PLANEJADOR DISCIPLINADO',
    padroes: [
      'Gastos maiores às sextas (dia do pagamento)',
      'Supermercado sempre entre R$ 300-400',
      'Metas nunca ficam sem depósito',
      'Preferem parcelar em cartões com menor uso',
      'Planejam compras grandes com 1 mês antecedência'
    ],
    previsoes: [
      { mes: 'Agosto', previsao: 'sobra menor por compras planejadas' },
      { mes: 'Setembro', previsao: 'mês mais desafiador do ano' },
      { mes: 'Outubro', previsao: 'volta ao equilíbrio' },
      { mes: 'Dezembro', previsao: 'melhor performance com 13º' }
    ],
    recomendacoesPersonalizadas: [
      'Criar alerta para gastos > R$ 500 às sextas',
      'Automatizar depósito das metas dia 1º',
      'Reservar R$ 1.000 para emergência de Set/25',
      'Considerar investimento conservador em Nov/25'
    ],
    probabilidadeSucesso: 92
  })

  // Carregar dados reais
  useEffect(() => {
    loadRelatoriosData()
  }, [])

  const loadRelatoriosData = async () => {
    try {
      const { auth, transactions, analytics } = await import('@/lib/supabase')
      
      const { user: currentUser } = await auth.getUser()
      if (!currentUser) {
        window.location.href = '/auth/login'
        return
      }
      
      setUser(currentUser)
      
      // Carregar dados reais dos relatórios
      // Por enquanto mantemos os dados fictícios para demonstração
      
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'EXCELENTE': return '#10b981'
      case 'BOM': return '#3b82f6'
      case 'REGULAR': return '#f59e0b'
      case 'RUIM': return '#ef4444'
      default: return '#64748b'
    }
  }

  const getTendenciaIcon = (tendencia) => {
    switch (tendencia) {
      case 'up': return '↗️'
      case 'down': return '↘️'
      case 'stable': return '➡️'
      default: return '➡️'
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="relatorios" />
        <main style={{ flex: 1, marginLeft: sidebarOpen ? '300px' : '80px' }}>
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h2 style={{ fontSize: '24px', color: '#64748b' }}>Gerando relatórios analíticos...</h2>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="relatorios" />

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
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  📊 RELATÓRIOS
                  <span style={{ fontSize: '16px', opacity: 0.9 }}>
                    | {periodoSelecionado} | Análise Completa Disponível
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
                  FinBot - Analista de Relatórios
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.95 }}>
                  Relatório mensal pronto! Performance melhorou 12% - seus melhores resultados!
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Filtros e Ações */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Filtros de Relatório */}
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
                📅 FILTROS DE RELATÓRIO
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    📅 Período:
                  </label>
                  <select
                    value={periodoSelecionado}
                    onChange={(e) => setPeriodoSelecionado(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      marginBottom: '12px'
                    }}
                  >
                    <option value="Jul/2025">Jul/2025</option>
                    <option value="Jun/2025">Jun/2025</option>
                    <option value="Mai/2025">Mai/2025</option>
                  </select>
                  
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    {['Este mês', 'Últimos 3m', 'Últimos 6m', 'Este ano'].map(periodo => (
                      <button
                      key={periodo}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        backgroundColor: 'white',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: '#374151'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      {periodo}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  🎯 Escopo:
                </label>
                <select
                  value={escopoSelecionado}
                  onChange={(e) => setEscopoSelecionado(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    marginBottom: '12px'
                  }}
                >
                  <option value="familia">👥 Família</option>
                  <option value="voce">👨 Você</option>
                  <option value="esposa">👩 Esposa</option>
                </select>
                
                <button
                  style={{
                    width: '100%',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🎯 GERAR RELATÓRIO
                </button>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
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
              ⚡ AÇÕES RÁPIDAS
            </h2>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => setModalExportacao(true)}
                  style={{
                    flex: 1,
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📄 PDF
                </button>
                <button style={{
                  flex: 1,
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  📊 Excel
                </button>
                <button style={{
                  flex: 1,
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  📧 Email
                </button>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button style={{
                  flex: 1,
                  backgroundColor: '#64748b',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  🖨️ Imprimir
                </button>
                <button style={{
                  flex: 1,
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  💾 Salvar
                </button>
                <button style={{
                  flex: 1,
                  backgroundColor: '#06b6d4',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  📱 Compartilhar
                </button>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  📊 Tipo de Relatório:
                </label>
                <select
                  value={tipoRelatorio}
                  onChange={(e) => setTipoRelatorio(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    marginBottom: '12px'
                  }}
                >
                  <option value="executivo">📈 Executivo</option>
                  <option value="detalhado">📋 Detalhado</option>
                  <option value="metas">🎯 Metas</option>
                  <option value="cartoes">💳 Cartões</option>
                  <option value="tendencias">📊 Tendências</option>
                </select>
                
                <button
                  onClick={() => setModalPersonalizar(true)}
                  style={{
                    width: '100%',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ⚙️ PERSONALIZAR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo Executivo */}
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
              📊 RESUMO EXECUTIVO - JULHO 2025
            </h2>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#f0fdf4',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #bbf7d0'
            }}>
              <span style={{ fontSize: '20px' }}>🟢</span>
              <span style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#166534'
              }}>
                {resumoExecutivo.statusGeral} (Score: {resumoExecutivo.scoreGeral}/1000)
              </span>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
          }}>
            {/* Fluxo Financeiro */}
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#1a202c',
                margin: '0 0 16px 0'
              }}>
                💰 FLUXO FINANCEIRO:
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '14px',
                color: '#374151'
              }}>
                <div>├─ Receitas: {formatCurrency(resumoExecutivo.receitas)}</div>
                <div>├─ Despesas: {formatCurrency(resumoExecutivo.despesas)}</div>
                <div>├─ Sobra: {formatCurrency(resumoExecutivo.sobra)}</div>
                <div>└─ Taxa poupança: {resumoExecutivo.taxaPoupanca}%</div>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#1a202c',
                  margin: '0 0 8px 0'
                }}>
                  💳 SAÚDE DOS CARTÕES:
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: '12px',
                  color: '#374151'
                }}>
                  <div>├─ Uso médio: {resumoExecutivo.saudeCartoes.usoMedio}% (SAUDÁVEL)</div>
                  <div>├─ Maior risco: {resumoExecutivo.saudeCartoes.maiorRisco.nome} {resumoExecutivo.saudeCartoes.maiorRisco.percentual}%</div>
                  <div>├─ Faturas pagas: {resumoExecutivo.saudeCartoes.faturasPagas}%</div>
                  <div>└─ Sem atrasos</div>
                </div>
              </div>
            </div>

            {/* Comparativo */}
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#1a202c',
                margin: '0 0 16px 0'
              }}>
                📊 COMPARATIVO MÊS ANTERIOR:
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '14px',
                color: '#374151'
              }}>
                <div>├─ Receitas: +{formatCurrency(resumoExecutivo.comparativoAnterior.receitas.valor)} ({getTendenciaIcon(resumoExecutivo.comparativoAnterior.receitas.tendencia)}{resumoExecutivo.comparativoAnterior.receitas.percentual}%)</div>
                <div>├─ Despesas: {formatCurrency(resumoExecutivo.comparativoAnterior.despesas.valor)} ({getTendenciaIcon(resumoExecutivo.comparativoAnterior.despesas.tendencia)}{resumoExecutivo.comparativoAnterior.despesas.percentual}%)</div>
                <div>├─ Sobra: +{formatCurrency(resumoExecutivo.comparativoAnterior.sobra.valor)} ({getTendenciaIcon(resumoExecutivo.comparativoAnterior.sobra.tendencia)}{resumoExecutivo.comparativoAnterior.sobra.percentual}%)</div>
                <div>└─ Eficiência: +{resumoExecutivo.comparativoAnterior.eficiencia}%</div>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#1a202c',
                  margin: '0 0 8px 0'
                }}>
                  🎯 METAS:
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: '12px',
                  color: '#374151'
                }}>
                  <div>├─ Depósitos: {formatCurrency(resumoExecutivo.metas.depositos)}</div>
                  <div>├─ Performance: +{resumoExecutivo.metas.performance}%</div>
                  <div>├─ Metas no prazo: {resumoExecutivo.metas.noPrazo.atual}/{resumoExecutivo.metas.noPrazo.total}</div>
                  <div>└─ {resumoExecutivo.metas.adiantadas} meta adiantada</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Análise por Categorias */}
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
              📊 ANÁLISE POR CATEGORIAS
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
                { key: 'grafico', label: '📊 Gráfico' },
                { key: 'grafico', label: '📊 Gráfico' },
                { key: 'tabela', label: '📋 Tabela' },
                { key: 'tendencia', label: '📈 Tendência' },
                { key: 'insights', label: '💡 Insights' }
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
                    backgroundColor: abaAtiva === aba.key ? '#3b82f6' : 'transparent',
                    color: abaAtiva === aba.key ? 'white' : '#64748b'
                  }}
                >
                  {aba.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Conteúdo das Abas */}
          {abaAtiva === 'grafico' && (
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#1a202c',
                margin: '0 0 20px 0',
                textAlign: 'center'
              }}>
                GASTOS JULHO 2025
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {categorias.map((categoria, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      minWidth: '120px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1a202c'
                    }}>
                      {categoria.emoji} {categoria.nome}
                    </div>
                    
                    <div style={{
                      flex: 1,
                      backgroundColor: '#f1f5f9',
                      borderRadius: '8px',
                      height: '24px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        backgroundColor: categoria.cor,
                        height: '100%',
                        width: `${categoria.percentual}%`,
                        transition: 'width 1s ease',
                        borderRadius: '8px'
                      }} />
                    </div>
                    
                    <div style={{
                      minWidth: '120px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: categoria.cor,
                      textAlign: 'right'
                    }}>
                      {formatCurrency(categoria.valor)} ({categoria.percentual}%)
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                border: '1px solid #fcd34d'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  💡 <strong>INSIGHT:</strong> Moradia cresceu 5%, mas dentro do esperado
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#92400e'
                }}>
                  🎯 <strong>AÇÃO:</strong> Alimentação pode ser otimizada em 15%
                </div>
              </div>
            </div>
          )}
          
          {abaAtiva === 'tabela' && (
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
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Categoria</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Valor</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>%</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>vs Junho</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((categoria, index) => (
                    <tr key={index}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                        {categoria.emoji} {categoria.nome}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                        {formatCurrency(categoria.valor)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                        {categoria.percentual}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                        {index % 2 === 0 ? '+5%' : '-2%'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        {categoria.percentual > 30 ? '🔴' : categoria.percentual > 15 ? '🟡' : '🟢'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {abaAtiva === 'insights' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              <div style={{
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  margin: '0 0 12px 0'
                }}>
                  📈 TENDÊNCIAS POSITIVAS:
                </h4>
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <li>Transporte reduziu 8% com otimização</li>
                  <li>Saúde manteve-se estável</li>
                  <li>Educação dentro do orçado</li>
                </ul>
              </div>
              
              <div style={{
                backgroundColor: '#fef2f2',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#dc2626',
                  margin: '0 0 12px 0'
                }}>
                  ⚠️ PONTOS DE ATENÇÃO:
                </h4>
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <li>Moradia cresceu acima da inflação</li>
                  <li>Lazer pode ser otimizado</li>
                  <li>Outros gastos precisam categorização</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Evolução Temporal */}
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
            📈 EVOLUÇÃO TEMPORAL (6 MESES)
          </h2>
          
          <div style={{ height: '300px', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucaoTemporal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="receitas" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Receitas"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Despesas"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sobra" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Sobra"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#1a202c',
              margin: '0 0 12px 0'
            }}>
              📈 TENDÊNCIAS:
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontSize: '14px',
              color: '#374151'
            }}>
              <div>├─ Receitas: Crescimento estável 2%/mês</div>
              <div>├─ Despesas: Controladas, -1%/mês</div>
              <div>└─ Sobra: Melhorando consistentemente</div>
            </div>
          </div>
        </div>

        {/* Análise Preditiva */}
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
            🔮 ANÁLISE PREDITIVA E RECOMENDAÇÕES
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Previsões */}
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
                🔮 PREVISÕES PARA AGOSTO:
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '14px',
                color: '#374151'
              }}>
                <div>├─ Receitas esperadas: {formatCurrency(previsoesPreditivas.agosto.receitas.valor)} (+{previsoesPreditivas.agosto.receitas.variacao}%)</div>
                <div>├─ Despesas estimadas: {formatCurrency(previsoesPreditivas.agosto.despesas.valor)} (+{previsoesPreditivas.agosto.despesas.variacao}% por {previsoesPreditivas.agosto.despesas.motivo})</div>
                <div>├─ Sobra projetada: {formatCurrency(previsoesPreditivas.agosto.sobra.valor)} ({previsoesPreditivas.agosto.sobra.variacao}% vs julho)</div>
                <div>└─ Situação: {previsoesPreditivas.agosto.situacao} (dentro do esperado)</div>
              </div>
            </div>

            {/* Pontos Fortes */}
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
                🏆 PONTOS FORTES:
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '14px',
                color: '#374151'
              }}>
                {previsoesPreditivas.pontosFortes.map((ponto, index) => (
                  <div key={index}>├─ {ponto}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Recomendações */}
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
              💡 RECOMENDAÇÕES ESTRATÉGICAS:
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '14px',
              color: '#374151'
            }}>
              {previsoesPreditivas.recomendacoes.map((rec, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{rec.icone}</span>
                  <span>├─ {rec.texto}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Análise com IA */}
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
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🧠 ANÁLISE COMPORTAMENTAL IA
            <span style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              95% precisão
            </span>
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
          }}>
            {/* Perfil e Padrões */}
            <div>
              <div style={{
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#374151',
                  margin: '0 0 12px 0'
                }}>
                  🎯 PERFIL FINANCEIRO DETECTADO:
                </h3>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#8b5cf6',
                  textAlign: 'center',
                  padding: '8px',
                  backgroundColor: 'white',
                  borderRadius: '8px'
                }}>
                  "{analiseIA.perfilDetectado}"
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  margin: '0 0 12px 0'
                }}>
                  📊 PADRÕES IDENTIFICADOS:
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#374151'
                }}>
                  {analiseIA.padroes.map((padrao, index) => (
                    <div key={index}>├─ {padrao}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Previsões e Recomendações IA */}
            <div>
              <div style={{
                backgroundColor: '#fef3c7',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#a16207',
                  margin: '0 0 12px 0'
                }}>
                  🔮 PREVISÕES IA:
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#374151'
                }}>
                  {analiseIA.previsoes.map((prev, index) => (
                    <div key={index}>├─ {prev.mes}: {prev.previsao}</div>
                  ))}
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#f0fdf4',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#166534',
                  margin: '0 0 12px 0'
                }}>
                  💡 RECOMENDAÇÕES PERSONALIZADAS:
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#374151'
                }}>
                  {analiseIA.recomendacoesPersonalizadas.map((rec, index) => (
                    <div key={index}>├─ {rec}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Probabilidade de Sucesso */}
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            padding: '16px',
            border: '2px solid #bbf7d0'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#166534',
              marginBottom: '8px'
            }}>
              🎯 PROBABILIDADE DE SUCESSO DAS METAS: {analiseIA.probabilidadeSucesso}%
            </div>
            <div style={{
              backgroundColor: '#e0e7ff',
              borderRadius: '8px',
              height: '12px',
              overflow: 'hidden'
            }}>
              <div style={{
                backgroundColor: '#10b981',
                height: '100%',
                width: `${analiseIA.probabilidadeSucesso}%`,
                transition: 'width 1s ease'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Configurar Exportação */}
      {modalExportacao && (
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
                📄 CONFIGURAR EXPORTAÇÃO
              </h2>
              <button
                onClick={() => setModalExportacao(false)}
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

            {/* Formato de Saída */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#1a202c',
                margin: '0 0 12px 0'
              }}>
                📊 FORMATO DE SAÍDA:
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                {[
                  { key: 'pdf', label: '📄 PDF Executivo', cor: '#ef4444' },
                  { key: 'excel', label: '📊 Excel Completo', cor: '#10b981' },
                  { key: 'csv', label: '📋 CSV Dados', cor: '#64748b' }
                ].map(formato => (
                  <button
                    key={formato.key}
                    style={{
                      flex: 1,
                      backgroundColor: formato.cor,
                      color: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {formato.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Seções a Incluir */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#1a202c',
                margin: '0 0 12px 0'
              }}>
                📋 SEÇÕES A INCLUIR:
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}>
                {[
                  'Resumo executivo',
                  'Gráficos de categorias',
                  'Evolução temporal',
                  'Análise de cartões',
                  'Status das metas',
                  'Previsões e recomendações',
                  'Transações detalhadas',
                  'Dados brutos (apenas Excel)'
                ].map((secao, index) => (
                  <label key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      defaultChecked={index < 7}
                      style={{ cursor: 'pointer' }}
                    />
                    {index < 7 ? '☑️' : '☐'} {secao}
                  </label>
                ))}
              </div>
            </div>

            {/* Personalização */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#1a202c',
                margin: '0 0 12px 0'
              }}>
                🎨 PERSONALIZAÇÃO:
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                fontSize: '14px'
              }}>
                <div>├─ Logo: ✅ Incluir [Personalizar...]</div>
                <div>├─ Cores: 🔵 Tema atual [🎨 Personalizar]</div>
                <div>├─ Idioma: 🇧🇷 Português [🇺🇸 English]</div>
                <div>└─ Moeda: R$ Real [$ Dólar] [€ Euro]</div>
              </div>
            </div>

            {/* Envio Automático */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#1a202c',
                margin: '0 0 12px 0'
              }}>
                📧 ENVIO AUTOMÁTICO:
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '14px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                  ☑️ Email para vocês dois
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ cursor: 'pointer' }} />
                  ☐ WhatsApp (resumo)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ cursor: 'pointer' }} />
                  ☐ Google Drive (backup)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ cursor: 'pointer' }} />
                  ☐ Agendamento mensal
                </label>
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
                📤 GERAR E ENVIAR
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
                👁️ PREVIEW
              </button>
              <button
                onClick={() => setModalExportacao(false)}
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

      {/* Modal: Personalizar Relatório */}
      {modalPersonalizar && (
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
                ⚙️ PERSONALIZAR RELATÓRIO
              </h2>
              <button
                onClick={() => setModalPersonalizar(false)}
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

            {/* Relatórios Especializados */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1a202c',
                margin: '0 0 16px 0'
              }}>
                📊 RELATÓRIOS ESPECIALIZADOS:
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                {/* Relatório de Cartões */}
                <div style={{
                  backgroundColor: '#f0f9ff',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #bfdbfe'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1e40af',
                    margin: '0 0 12px 0'
                  }}>
                    💳 ANÁLISE COMPLETA DOS CARTÕES
                  </h4>
                  <div style={{
                    fontSize: '14px',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    📊 RESUMO CONSOLIDADO - JULHO 2025:
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    marginBottom: '12px'
                  }}>
                    ├─ Total de cartões: 4 ativos<br/>
                    ├─ Limite total: R$ 17.000,00<br/>
                    ├─ Utilização: R$ 4.094,00 (24%)<br/>
                    └─ Status geral: 🟢 SAUDÁVEL
                  </div>
                  <button style={{
                    width: '100%',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    📄 GERAR RELATÓRIO DE CARTÕES
                  </button>
                </div>

                {/* Relatório de Metas */}
                <div style={{
                  backgroundColor: '#f0fdf4',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #bbf7d0'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#166534',
                    margin: '0 0 12px 0'
                  }}>
                    🎯 PERFORMANCE DAS METAS
                  </h4>
                  <div style={{
                    fontSize: '14px',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    🏆 CONQUISTAS DO MÊS:
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    marginBottom: '12px'
                  }}>
                    ├─ Total depositado: R$ 2.845,00<br/>
                    ├─ 127 dias consecutivos poupando!<br/>
                    ├─ Meta "Casa" ultrapassou 65%<br/>
                    └─ Todas as metas receberam depósito
                  </div>
                  <button style={{
                    width: '100%',
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    🎯 GERAR RELATÓRIO DE METAS
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard Mobile */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1a202c',
                margin: '0 0 16px 0'
              }}>
                📱 RESUMO MOBILE:
              </h3>
              
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1a202c',
                  marginBottom: '12px',
                  textAlign: 'center'
                }}>
                  📊 JULHO 2025 - RESUMO
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#10b981' }}>💰 RECEITAS</div>
                    <div>{formatCurrency(10600)}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#ef4444' }}>💸 DESPESAS</div>
                    <div>{formatCurrency(8796)}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>✅ SOBRA</div>
                    <div>{formatCurrency(1804)} (17%)</div>
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '12px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🔥 HIGHLIGHTS:</div>
                  <div>• Melhor mês do ano</div>
                  <div>• Casa própria acelerou</div>
                  <div>• Santander precisa atenção</div>
                  <div>• Setup gamer quase pronto</div>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '12px'
                }}>
                  <button style={{
                    flex: 1,
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    📄 Ver Completo
                  </button>
                  <button style={{
                    flex: 1,
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    📤 Compartilhar
                  </button>
                  <button style={{
                    flex: 1,
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    📊 Gráficos
                  </button>
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
                backgroundColor: '#8b5cf6',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                💾 SALVAR CONFIGURAÇÕES
              </button>
              <button
                onClick={() => setModalPersonalizar(false)}
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
        0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
        100% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); }
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
                        