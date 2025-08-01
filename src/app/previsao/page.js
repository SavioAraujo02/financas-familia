'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts'
import Sidebar from '@/components/layout/Sidebar'

export default function PrevisaoRevolucionaria() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Estados principais
  const [previsao12Meses, setPrevisao12Meses] = useState([])
  const [alertas, setAlertas] = useState([])
  const [padroes, setPadroes] = useState(null)
  const [previsoes, setPrevisoes] = useState([])
  const [alertasPreventivos, setAlertasPreventivos] = useState([])
  
  // Estados de visualização
  const [viewMode, setViewMode] = useState('previsao') // 'previsao', 'simulador', 'analise', 'estrategias'
  const [periodoView, setPeriodoView] = useState('12') // '6', '12', '24'
  const [mesDetalhado, setMesDetalhado] = useState(null)
  
  // Estados do simulador
  const [simulador, setSimulador] = useState({
    valor: '',
    parcelas: 1,
    cartaoId: '',
    dataCompra: new Date().toISOString().split('T')[0],
    resultados: null
  })
  
  // Estados de estratégias
  const [estrategias, setEstrategias] = useState([])
  const [estrategiasAplicadas, setEstrategiasAplicadas] = useState([])
  
  // Dados da família
  const rendaFamiliar = 10600
  const percentualSaudavel = 40
  
  const finBotDica = "Setembro será 67% da renda! Sugestão: antecipe R$ 500 da reserva de emergência para equilibrar o mês! 🎯"

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { auth, previsaoFaturas, analisePreditiva } = await import('@/lib/supabase')
      
      const { user: currentUser } = await auth.getUser()
      if (!currentUser) {
        window.location.href = '/auth/login'
        return
      }
      
      setUser(currentUser)
      setProfile({ name: currentUser.email?.split('@')[0] || 'Usuário' })
      
      // Carregar previsão de 12 meses
      const { data: previsaoData } = await previsaoFaturas.calcularPrevisao12Meses(currentUser.id)
      setPrevisao12Meses(previsaoData || [])
      
            // Gerar alertas
            if (previsaoData && previsaoData.length > 0) {
                const alertasGerados = await previsaoFaturas.gerarAlertas(previsaoData, rendaFamiliar)
                setAlertas(alertasGerados)
                
                // Detectar padrões
                const { data: padroesData } = await analisePreditiva.detectarPadroes(currentUser.id)
                setPadroes(padroesData)
                
                // Gerar previsões baseadas em IA
                const previsoesIA = await analisePreditiva.gerarPrevisoes(padroesData, previsaoData)
                setPrevisoes(previsoesIA)
                
                // Gerar alertas preventivos
                const alertasPrev = await analisePreditiva.gerarAlertasPreventivos(previsaoData, padroesData)
                setAlertasPreventivos(alertasPrev)
                
                // Se há mês crítico, definir como detalhado por padrão
                const mesCritico = previsaoData.find(m => m.status === 'critico')
                if (mesCritico) {
                  setMesDetalhado(mesCritico)
                  
                  // Gerar estratégias para o mês crítico
                  const { data: estrategiasData } = await previsaoFaturas.gerarEstrategias(mesCritico)
                  setEstrategias(estrategiasData || [])
                }
              }
              
            } catch (error) {
              console.error('Erro ao carregar dados:', error)
            } finally {
              setLoading(false)
            }
          }
        
          const handleSimularCompra = async () => {
            if (!simulador.valor || !simulador.cartaoId) {
              alert('Preencha valor e cartão para simular')
              return
            }
            
            try {
              const { previsaoFaturas } = await import('@/lib/supabase')
              
              const resultados = await previsaoFaturas.simularCompra(
                previsao12Meses,
                parseFloat(simulador.valor),
                parseInt(simulador.parcelas),
                simulador.cartaoId,
                simulador.dataCompra
              )
              
              setSimulador({
                ...simulador,
                resultados
              })
              
            } catch (error) {
              console.error('Erro ao simular compra:', error)
              alert('Erro ao simular compra. Tente novamente.')
            }
          }
        
          const handleAplicarEstrategia = (estrategia) => {
            // Simular aplicação da estratégia
            if (mesDetalhado) {
              const novoTotal = mesDetalhado.total + estrategia.impacto
              const novoPercentual = (novoTotal / rendaFamiliar) * 100
              
              let novoStatus = 'normal'
              if (novoPercentual > 60) novoStatus = 'critico'
              else if (novoPercentual > 45) novoStatus = 'alto'
              else if (novoPercentual > 30) novoStatus = 'moderado'
              
              const mesAtualizado = {
                ...mesDetalhado,
                total: novoTotal,
                percentualRenda: Math.round(novoPercentual * 10) / 10,
                status: novoStatus
              }
              
              setMesDetalhado(mesAtualizado)
              setEstrategiasAplicadas([...estrategiasAplicadas, estrategia])
              
              alert(`Estratégia aplicada! Novo comprometimento: ${Math.round(novoPercentual)}%`)
            }
          }
        
          const formatCurrency = (value) => {
            return new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(value)
          }
        
          const getStatusIcon = (status) => {
            switch (status) {
              case 'critico': return '🔴'
              case 'alto': return '🟡'
              case 'moderado': return '🔵'
              case 'normal': return '🟢'
              default: return '⚪'
            }
          }
        
          const getStatusText = (status) => {
            switch (status) {
              case 'critico': return 'CRÍTICO'
              case 'alto': return 'ALTO'
              case 'moderado': return 'MODERADO'
              case 'normal': return 'NORMAL'
              default: return 'INDEFINIDO'
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
                    🔮 Carregando previsões inteligentes...
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
                currentPage="previsao"
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
                          🔮 PREVISÃO DE FATURAS
                          <span style={{ fontSize: '18px', opacity: 0.9 }}>
                            | Próximos {periodoView} meses | Análise Preditiva
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
                          FinBot - Crystal Ball Financeiro
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
                  {/* Linha Superior - Visão Geral + Controles */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '24px',
                    marginBottom: '24px'
                  }}>
                    {/* Visão Geral */}
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
                        📊 VISÃO GERAL
                      </h2>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ color: '#64748b' }}>💰 Renda Familiar:</span>
                          <span style={{ fontWeight: '600', fontSize: '18px' }}>{formatCurrency(rendaFamiliar)}</span>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ color: '#64748b' }}>📊 Comprometimento Atual:</span>
                          <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                            {previsao12Meses[0]?.percentualRenda?.toFixed(1) || 0}%
                          </span>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ color: '#64748b' }}>⚠️ Pico Máximo:</span>
                          <span style={{ 
                            fontWeight: '600', 
                            color: previsao12Meses.find(m => m.status === 'critico')?.cor || '#10b981'
                          }}>
                            {(() => {
                              const pico = previsao12Meses.reduce((max, m) => 
                                m.percentualRenda > max.percentualRenda ? m : max, 
                                { percentualRenda: 0, mesAno: 'N/A' }
                              )
                              return `${pico.mesAno} (${pico.percentualRenda?.toFixed(1) || 0}%)`
                            })()}
                          </span>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ color: '#64748b' }}>🎯 Situação:</span>
                          <span style={{ 
                            fontWeight: '600', 
                            color: alertas.some(a => a.tipo === 'critico') ? '#ef4444' : 
                                   alertas.some(a => a.tipo === 'atencao') ? '#f59e0b' : '#10b981',
                            textTransform: 'uppercase'
                          }}>
                            {alertas.some(a => a.tipo === 'critico') ? 'ATENÇÃO' : 
                             alertas.some(a => a.tipo === 'atencao') ? 'MODERADO' : 'SAUDÁVEL'}
                          </span>
                        </div>
        
                        {/* Crystal Ball */}
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
                            🔮 CRYSTAL BALL FINANCEIRO:
                          </h3>
                          
                          <div style={{
                            backgroundColor: '#f0f9ff',
                            borderRadius: '8px',
                            padding: '16px',
                            border: '1px solid #7dd3fc'
                          }}>
                            <p style={{
                              margin: 0,
                              fontSize: '14px',
                              color: '#0369a1',
                              fontStyle: 'italic'
                            }}>
                              "Baseado no padrão atual, vocês voltarão ao equilíbrio em Novembro/25. 
                              {previsoes.find(p => p.tipo === 'sustentabilidade') ? 
                                ' O padrão atual é financeiramente sustentável.' : 
                                ' Ajustes pontuais resolverão a situação.'}
                              "
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
        
                    {/* Controles */}
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
                        🎛️ CONTROLES
                      </h2>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Período */}
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px'
                          }}>
                            📅 Período:
                          </label>
                          <select
                            value={periodoView}
                            onChange={(e) => setPeriodoView(e.target.value)}
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
                              <option value="6">📅 6 meses</option>
                              <option value="12">📅 12 meses</option>
                              <option value="24">📈 24 meses</option>
                            </select>
                            
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                              <button
                                onClick={() => setPeriodoView('6')}
                                style={{
                                  flex: 1,
                                  padding: '8px',
                                  backgroundColor: periodoView === '6' ? '#8b5cf6' : '#f1f5f9',
                                  color: periodoView === '6' ? 'white' : '#64748b',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer'
                                }}
                              >
                                📊 6 meses
                              </button>
                              <button
                                onClick={() => setPeriodoView('24')}
                                style={{
                                  flex: 1,
                                  padding: '8px',
                                  backgroundColor: periodoView === '24' ? '#8b5cf6' : '#f1f5f9',
                                  color: periodoView === '24' ? 'white' : '#64748b',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer'
                                }}
                              >
                                📈 24 meses
                              </button>
                            </div>
                          </div>
          
                          {/* Visualização */}
                          <div>
                            <label style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#374151',
                              marginBottom: '8px'
                            }}>
                              🎯 Visualização:
                            </label>
                            <select
                              value={viewMode}
                              onChange={(e) => setViewMode(e.target.value)}
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
                              <option value="previsao">📊 Gráfico</option>
                              <option value="simulador">🧮 Simulador</option>
                              <option value="analise">🧠 Análise IA</option>
                              <option value="estrategias">🎯 Estratégias</option>
                            </select>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                              <button
                                onClick={() => setViewMode('previsao')}
                                style={{
                                  padding: '8px 12px',
                                  backgroundColor: viewMode === 'previsao' ? '#8b5cf6' : '#f1f5f9',
                                  color: viewMode === 'previsao' ? 'white' : '#64748b',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                📋 Tabela
                              </button>
                              <button
                                onClick={() => setViewMode('simulador')}
                                style={{
                                  padding: '8px 12px',
                                  backgroundColor: viewMode === 'simulador' ? '#8b5cf6' : '#f1f5f9',
                                  color: viewMode === 'simulador' ? 'white' : '#64748b',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                📅 Timeline
                              </button>
                            </div>
                          </div>
          
                          {/* Alertas Rápidos */}
                          <div style={{
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px solid #e2e8f0'
                          }}>
                            <h3 style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              margin: '0 0 12px 0',
                              color: '#374151'
                            }}>
                              🚨 ALERTAS RÁPIDOS:
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {alertas.slice(0, 3).map((alerta, index) => (
                                <div key={index} style={{
                                  padding: '8px 12px',
                                  backgroundColor: alerta.cor + '15',
                                  borderRadius: '6px',
                                  border: `1px solid ${alerta.cor}33`
                                }}>
                                  <div style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: alerta.cor,
                                    marginBottom: '2px'
                                  }}>
                                    {alerta.icone} {alerta.titulo.split(' - ')[0]}
                                  </div>
                                  <div style={{
                                    fontSize: '11px',
                                    color: alerta.cor,
                                    opacity: 0.8
                                  }}>
                                    {alerta.descricao.substring(0, 40)}...
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
          
                    {/* Gráfico de Comprometimento Futuro */}
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: '1px solid #e2e8f0',
                      marginBottom: '24px'
                    }}>
                      <h2 style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        margin: '0 0 20px 0',
                        color: '#1a202c'
                      }}>
                        📊 GRÁFICO DE COMPROMETIMENTO FUTURO
                      </h2>
          
                      {viewMode === 'previsao' && (
                        <div style={{ height: '400px', marginBottom: '20px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={previsao12Meses.slice(0, parseInt(periodoView))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="mes" />
                              <YAxis domain={[0, 100]} />
                              <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "⚠️ LINHA DE PERIGO", position: "topRight" }} />
                              <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "LIMITE SAUDÁVEL", position: "topRight" }} />
                              <Bar 
                                dataKey="percentualRenda" 
                                fill={(entry) => entry?.cor || '#8b5cf6'}
                                name="% da Renda"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
          
                      {viewMode === 'simulador' && (
                        <div style={{ padding: '20px 0' }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            margin: '0 0 20px 0',
                            color: '#1a202c'
                          }}>
                            🧮 SIMULADOR DE CENÁRIOS
                          </h3>
                          
                          <div style={{
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '20px'
                          }}>
                            <h4 style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              margin: '0 0 16px 0',
                              color: '#374151'
                            }}>
                              🎯 "E SE...?" - TESTE SUAS ESTRATÉGIAS:
                            </h4>
                            
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, 1fr)',
                              gap: '16px',
                              marginBottom: '16px'
                            }}>
                              <div>
                                <label style={{
                                  display: 'block',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#374151',
                                  marginBottom: '6px'
                                }}>
                                  💰 Valor da Compra:
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={simulador.valor}
                                  onChange={(e) => setSimulador({...simulador, valor: e.target.value})}
                                  placeholder="4000.00"
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
                                  🔢 Parcelas:
                                </label>
                                <select
                                  value={simulador.parcelas}
                                  onChange={(e) => setSimulador({...simulador, parcelas: e.target.value})}
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
                                  {[1,2,3,4,5,6,7,8,9,10,11,12,15,18,24].map(num => (
                                    <option key={num} value={num}>{num}x</option>
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
                                  📅 Data da Compra:
                                </label>
                                <input
                                  type="date"
                                  value={simulador.dataCompra}
                                  onChange={(e) => setSimulador({...simulador, dataCompra: e.target.value})}
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
                                  💳 Cartão:
                                </label>
                                <select
                                  value={simulador.cartaoId}
                                  onChange={(e) => setSimulador({...simulador, cartaoId: e.target.value})}
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
                                  <option value="">Selecione o cartão...</option>
                                  <option value="nubank">💳 Nubank</option>
                                  <option value="santander">💳 Santander</option>
                                  <option value="inter">💳 Inter</option>
                                  <option value="c6">💳 C6 Bank</option>
                                </select>
                              </div>
                            </div>
          
                            <button
                              onClick={handleSimularCompra}
                              style={{
                                backgroundColor: '#8b5cf6',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                width: '100%'
                              }}
                            >
                              🧮 SIMULAR IMPACTO
                            </button>
                          </div>
          
                          {/* Resultados da Simulação */}
                          {simulador.resultados && (
                            <div style={{
                              backgroundColor: '#f0f9ff',
                              borderRadius: '12px',
                              padding: '20px',
                              border: '1px solid #7dd3fc'
                            }}>
                              <h4 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                margin: '0 0 16px 0',
                                color: '#0c4a6e'
                              }}>
                                📈 RESULTADO SIMULADO:
                              </h4>
                              
                              <div style={{
                                backgroundColor: simulador.resultados.corRecomendacao + '15',
                                borderRadius: '8px',
                                padding: '16px',
                                border: `1px solid ${simulador.resultados.corRecomendacao}33`,
                                marginBottom: '16px'
                              }}>
                                <div style={{
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  color: simulador.resultados.corRecomendacao,
                                  marginBottom: '8px'
                                }}>
                                  {simulador.resultados.iconeRecomendacao} RECOMENDAÇÃO: {simulador.resultados.recomendacao.toUpperCase()}
                                </div>
                                <div style={{
                                  fontSize: '14px',
                                  color: simulador.resultados.corRecomendacao
                                }}>
                                  {simulador.resultados.mensagem}
                                </div>
                              </div>
          
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                      {simulador.resultados.previsaoComImpacto
                        .filter(m => m.impacto > 0)
                        .slice(0, 4)
                        .map((mes, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}>
                          <span style={{ color: '#64748b' }}>
                            {mes.mesAno}:
                          </span>
                          <span style={{
                            color: mes.piorou ? '#ef4444' : '#64748b'
                          }}>
                            {mes.percentualRenda.toFixed(1)}% → {mes.novoPercentual}% 
                            {mes.mudouStatus && (
                              <span style={{ 
                                marginLeft: '8px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: mes.novaCor
                              }}>
                                ({mes.novoStatus.toUpperCase()})
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}>
                      <strong>Impacto:</strong> +{formatCurrency(simulador.resultados.valorParcela)}/mês por {simulador.resultados.mesesAfetados} meses
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'analise' && (
              <div style={{ padding: '20px 0' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  margin: '0 0 20px 0',
                  color: '#1a202c'
                }}>
                  🧠 ANÁLISE DE PADRÕES
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  {/* Tendências Detectadas */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 16px 0',
                      color: '#374151'
                    }}>
                      📈 TENDÊNCIAS DETECTADAS:
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        ├─ Gastos crescem {padroes?.crescimentoMedio?.toFixed(1) || '3.2'}% ao mês (acima da inflação)
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        ├─ Parcelamentos aumentaram {padroes?.crescimentoParcelamentos?.toFixed(0) || '45'}% nos últimos 6 meses
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        ├─ Padrão sazonal: Dezembro sempre +20%
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        └─ Vocês gastam 15% mais em meses com feriados
                      </div>
                    </div>
                  </div>

                  {/* Previsões Baseadas em IA */}
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #7dd3fc'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 16px 0',
                      color: '#0c4a6e'
                    }}>
                      🔮 PREVISÕES BASEADAS EM IA:
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {previsoes.map((previsao, index) => (
                        <div key={index} style={{ fontSize: '14px', color: '#0369a1' }}>
                          ├─ {previsao.probabilidade}% chance: {previsao.descricao}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alertas Preventivos */}
                  <div style={{
                    backgroundColor: '#fef3c7',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #fcd34d'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 16px 0',
                      color: '#92400e'
                    }}>
                      💡 ALERTAS PREVENTIVOS:
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {alertasPreventivos.map((alerta, index) => (
                        <div key={index} style={{ fontSize: '14px', color: '#92400e' }}>
                          ├─ {alerta.icone} {alerta.descricao}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'estrategias' && mesDetalhado && (
              <div style={{ padding: '20px 0' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  margin: '0 0 20px 0',
                  color: '#1a202c'
                }}>
                  🎯 ESTRATÉGIAS E SUGESTÕES
                </h3>
                
                <div style={{
                  backgroundColor: '#fef2f2',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #fecaca',
                  marginBottom: '20px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 16px 0',
                    color: '#dc2626'
                  }}>
                    🎯 PARA REDUZIR {mesDetalhado.mesCompleto.toUpperCase()}:
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {estrategias.map((estrategia, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #f3f4f6'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '4px'
                          }}>
                            {estrategia.icone} {estrategia.titulo}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#64748b'
                          }}>
                            {estrategia.descricao}
                          </div>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: estrategia.impacto < 0 ? '#10b981' : '#ef4444'
                          }}>
                            {formatCurrency(estrategia.impacto)}
                          </span>
                          
                          <button
                            onClick={() => handleAplicarEstrategia(estrategia)}
                            disabled={estrategiasAplicadas.includes(estrategia)}
                            style={{
                              backgroundColor: estrategiasAplicadas.includes(estrategia) ? '#6b7280' : '#3b82f6',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: estrategiasAplicadas.includes(estrategia) ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {estrategiasAplicadas.includes(estrategia) ? '✅ Aplicada' : '🎯 Aplicar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#dcfce7',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#166534'
                    }}>
                      💡 RESULTADO: {Math.round(mesDetalhado.percentualRenda)}% comprometimento 
                      {mesDetalhado.percentualRenda < 50 ? ' (ACEITÁVEL)' : ' (AINDA ALTO)'}
                    </div>
                  </div>
                </div>

                {/* Previsões Inteligentes */}
                <div style={{
                  backgroundColor: '#f0f9ff',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #7dd3fc'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 16px 0',
                    color: '#0c4a6e'
                  }}>
                    🔮 PREVISÕES INTELIGENTES:
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#0369a1' }}>
                      ├─ Padrão volta ao normal em Nov/25
                    </div>
                    <div style={{ fontSize: '14px', color: '#0369a1' }}>
                      ├─ Dezembro: melhor mês (35% comprometimento)
                    </div>
                    <div style={{ fontSize: '14px', color: '#0369a1' }}>
                      ├─ 13º salário melhora situação
                    </div>
                    <div style={{ fontSize: '14px', color: '#0369a1' }}>
                      └─ Meta casa própria não será afetada
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '16px'
                  }}>
                    <button
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      🎯 APLICAR SUGESTÕES
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
                      💾 SALVAR CENÁRIO
                    </button>
                    <button
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      📊 SIMULAR
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Insight do Gráfico */}
            <div style={{
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #7dd3fc'
            }}>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#0369a1',
                fontWeight: '500'
              }}>
                💡 INSIGHT: {(() => {
                  const mesCritico = previsao12Meses.find(m => m.status === 'critico')
                  if (mesCritico) {
                    return `${mesCritico.mesCompleto} é o mês crítico (${mesCritico.percentualRenda.toFixed(1)}% comprometido)`
                  }
                  const mesAlto = previsao12Meses.find(m => m.status === 'alto')
                  if (mesAlto) {
                    return `${mesAlto.mesCompleto} requer atenção (${mesAlto.percentualRenda.toFixed(1)}% comprometido)`
                  }
                  return 'Situação financeira estável nos próximos 12 meses'
                })()}
              </p>
            </div>
          </div>

          {/* Detalhamento por Mês */}
          {mesDetalhado && (
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
                                    📅 DETALHAMENTO POR MÊS
                </h2>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {previsao12Meses.slice(0, 6).map((mes, index) => (
                    <button
                      key={index}
                      onClick={() => setMesDetalhado(mes)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: mesDetalhado.mesAno === mes.mesAno ? mes.cor : '#f1f5f9',
                        color: mesDetalhado.mesAno === mes.mesAno ? 'white' : '#64748b',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      {mes.icone} {mes.mes}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                backgroundColor: mesDetalhado.status === 'critico' ? '#fef2f2' : 
                               mesDetalhado.status === 'alto' ? '#fef3c7' : '#f0fdf4',
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${mesDetalhado.status === 'critico' ? '#fecaca' : 
                                    mesDetalhado.status === 'alto' ? '#fcd34d' : '#bbf7d0'}`
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  margin: '0 0 16px 0',
                  color: mesDetalhado.status === 'critico' ? '#dc2626' : 
                         mesDetalhado.status === 'alto' ? '#92400e' : '#166534'
                }}>
                  📅 {mesDetalhado.mesCompleto.toUpperCase()} - {mesDetalhado.icone} MÊS {getStatusText(mesDetalhado.status)}
                </h3>
                
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: mesDetalhado.cor,
                  marginBottom: '20px'
                }}>
                  💰 Total Previsto: {formatCurrency(mesDetalhado.total)} ({mesDetalhado.percentualRenda.toFixed(1)}% da renda) {mesDetalhado.icone}
                </div>

                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 16px 0',
                  color: '#374151'
                }}>
                  📊 COMPOSIÇÃO DETALHADA:
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {mesDetalhado.faturasPorCartao.map((cartao, index) => (
                    <div key={index} style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <h5 style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          margin: 0,
                          color: '#1a202c'
                        }}>
                          {cartao.nome === 'DESPESAS FIXAS' ? '📅 DESPESAS FIXAS' : 
                           `💳 ${cartao.nome} (Vence ${cartao.vencimento}/${mesDetalhado.mesAno.split('/')[0]})`}
                        </h5>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: cartao.nome === 'DESPESAS FIXAS' ? '#6b7280' : '#ef4444'
                        }}>
                          {formatCurrency(cartao.total)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {cartao.parcelas.map((parcela, pIndex) => (
                          <div key={pIndex} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '13px',
                            color: '#64748b'
                          }}>
                            <span>
                              ├─ {parcela.descricao} {parcela.parcela !== 'Fixo' && `(${parcela.parcela})`}:
                            </span>
                            <span style={{ fontWeight: '600' }}>
                              {formatCurrency(parcela.valor)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      💡 SOBRA PREVISTA:
                    </span>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: mesDetalhado.disponivel > 2000 ? '#10b981' : 
                             mesDetalhado.disponivel > 1000 ? '#f59e0b' : '#ef4444'
                    }}>
                      {formatCurrency(mesDetalhado.disponivel)} ({((mesDetalhado.disponivel / rendaFamiliar) * 100).toFixed(1)}% da renda)
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      🎯 STATUS:
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: mesDetalhado.cor,
                      textTransform: 'uppercase'
                    }}>
                      {mesDetalhado.icone} COMPROMETIMENTO {getStatusText(mesDetalhado.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabela de Meses */}
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
              color: '#1a202c'
            }}>
              📋 RESUMO DOS PRÓXIMOS {periodoView} MESES
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Mês</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Total</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>% Renda</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Disponível</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {previsao12Meses.slice(0, parseInt(periodoView)).map((mes, index) => (
                    <tr key={index} style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: mes.isCurrentMonth ? '#f0f9ff' : 'transparent',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = mes.isCurrentMonth ? '#f0f9ff' : 'transparent'}
                    >
                      <td style={{ padding: '12px', fontWeight: '500' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {mes.icone}
                          <span>{mes.mesCompleto}</span>
                          {mes.isCurrentMonth && (
                            <span style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}>
                              ATUAL
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'right', 
                        fontWeight: '600',
                        color: mes.cor
                      }}>
                        {formatCurrency(mes.total)}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'center',
                        fontWeight: '600',
                        color: mes.cor
                      }}>
                        {mes.percentualRenda.toFixed(1)}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          backgroundColor: mes.cor + '15',
                          color: mes.cor,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {getStatusText(mes.status)}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'right',
                        fontWeight: '600',
                        color: mes.disponivel > 2000 ? '#10b981' : 
                               mes.disponivel > 1000 ? '#f59e0b' : '#ef4444'
                      }}>
                        {formatCurrency(mes.disponivel)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => setMesDetalhado(mes)}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          👁️ Detalhar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumo da Tabela */}
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    MÉDIA MENSAL
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>
                    {formatCurrency(previsao12Meses.reduce((sum, m) => sum + m.total, 0) / previsao12Meses.length)}
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    MESES CRÍTICOS
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>
                    {previsao12Meses.filter(m => m.status === 'critico').length}
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    MELHOR MÊS
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                    {previsao12Meses.reduce((min, m) => 
                      m.percentualRenda < min.percentualRenda ? m : min, 
                      { percentualRenda: 100, mes: 'N/A' }
                    ).mes}
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    PIOR MÊS
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>
                    {previsao12Meses.reduce((max, m) => 
                      m.percentualRenda > max.percentualRenda ? m : max, 
                      { percentualRenda: 0, mes: 'N/A' }
                    ).mes}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
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
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}