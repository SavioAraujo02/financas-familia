'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Sidebar from '@/components/layout/Sidebar'

export default function DesafiosRevolucionarios() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Estados principais
  const [desafiosAtivos, setDesafiosAtivos] = useState([])
  const [desafiosConcluidos, setDesafiosConcluidos] = useState([])
  const [proximosDesafios, setProximosDesafios] = useState([])
  const [historicoDesafios, setHistoricoDesafios] = useState([])

  // Estados para sistema de recompensas
  const [saldoRecompensas, setSaldoRecompensas] = useState({
    disponivel: 850.00,
    pendente: 200.00,
    totalGanho: 2340.00
  })

  // Estados para estatísticas
  const [estatisticasDesafios, setEstatisticasDesafios] = useState({
    aceitos: 15,
    concluidos: 12,
    desistencias: 2,
    pausados: 1,
    taxaSucesso: 80,
    economiaGerada: 5240.00,
    diasDisciplina: 347,
    metasAceleradas: 3,
    habitosCriados: 8
  })

  // Estados para modais
  const [showDesafioModal, setShowDesafioModal] = useState(false)
  const [desafioSelecionado, setDesafioSelecionado] = useState(null)
  const [showRecompensasModal, setShowRecompensasModal] = useState(false)
  const [showEstatisticasModal, setShowEstatisticasModal] = useState(false)
  const [showNovoDesafioModal, setShowNovoDesafioModal] = useState(false)

  // Estados para filtros
  const [filtroDesafios, setFiltroDesafios] = useState('ativos') // 'ativos', 'concluidos', 'proximos', 'historico'
  const [dificuldadeFiltro, setDificuldadeFiltro] = useState('todas') // 'todas', 'facil', 'medio', 'dificil', 'muito_dificil'

  // Estados para dados calculados
  const [evolucaoRecompensas, setEvolucaoRecompensas] = useState([])
  const [desafiosPorCategoria, setDesafiosPorCategoria] = useState([])
  const [finBotDica, setFinBotDica] = useState("Carregando análise de desafios...")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { auth, profiles, transactions, goals } = await import('@/lib/supabase')
      
      const { user: currentUser } = await auth.getUser()
      if (!currentUser) {
        window.location.href = '/auth/login'
        return
      }
      
      setUser(currentUser)
      setProfile({ name: currentUser.email?.split('@')[0] || 'Usuário' })

      // 1. CARREGAR DADOS REAIS DO USUÁRIO
      const { data: profileData } = await profiles.get(currentUser.id)
      const { data: transactionsData } = await transactions.getAll(currentUser.id)
      const { data: goalsData } = await goals.getAll(currentUser.id)

      // 2. GERAR DESAFIOS BASEADOS EM DADOS REAIS
      const desafiosReais = await gerarDesafiosReais(currentUser.id, {
        transacoes: transactionsData || [],
        metas: goalsData || [],
        rendaMensal: profileData?.monthly_income || 10600
      })

      // 3. ATUALIZAR ESTADOS COM DADOS REAIS
      setDesafiosAtivos(desafiosReais.ativos)
      setDesafiosConcluidos(desafiosReais.concluidos)
      setProximosDesafios(desafiosReais.proximos)
      setHistoricoDesafios(desafiosReais.historico)

      // 4. CALCULAR ESTATÍSTICAS REAIS
      const estatisticasReais = calcularEstatisticasReais(desafiosReais)
      setEstatisticasDesafios(estatisticasReais)

      // 5. GERAR EVOLUÇÃO DE RECOMPENSAS
      const evolucao = gerarEvolucaoRecompensas()
      setEvolucaoRecompensas(evolucao)

      // 6. CALCULAR DESAFIOS POR CATEGORIA
      const porCategoria = calcularDesafiosPorCategoria(desafiosReais.concluidos)
      setDesafiosPorCategoria(porCategoria)

      // 7. GERAR DICA DO FINBOT
      const dica = gerarFinBotDica(desafiosReais, estatisticasReais)
      setFinBotDica(dica)

    } catch (error) {
      console.error('Erro ao carregar desafios:', error)
      setFinBotDica("Erro ao carregar dados. Verifique sua conexão.")
    } finally {
      setLoading(false)
    }
  }

  const gerarDesafiosReais = async (userId, dados) => {
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

    // DESAFIOS ATIVOS (baseados em dados reais)
    const ativos = []

    // 1. Desafio Semana Zero Delivery
    const gastosDelivery = dados.transacoes.filter(t => {
      const desc = t.description.toLowerCase()
      const dataTransacao = new Date(t.date)
      return t.type === 'despesa' && 
             dataTransacao >= inicioMes && 
             dataTransacao <= fimMes &&
             (desc.includes('delivery') || desc.includes('ifood') || desc.includes('uber'))
    })

    const valorGastoDelivery = gastosDelivery.reduce((sum, t) => sum + t.amount, 0)
    const diasSemDelivery = 7 - new Set(gastosDelivery.map(t => new Date(t.date).getDay())).size
    
    ativos.push({
      id: 'semana_zero_delivery',
      titulo: '🍕 SEMANA ZERO DELIVERY',
      objetivo: '7 dias sem pedir delivery',
      prazo: '25/Jul - 31/Jul',
      diaAtual: 4,
      totalDias: 7,
      premio: 180.00,
      progresso: Math.round((diasSemDelivery / 7) * 100),
      dificuldade: 'medio',
      categoria: 'economia',
      status: 'ativo',
      participantes: [
        { nome: 'João', progresso: [true, true, true, true, false, false, false] },
        { nome: 'Maria', progresso: [true, true, false, true, false, false, false] }
      ],
      economiaAtual: Math.max(127.40, valorGastoDelivery * 0.8),
      descricao: 'Evite pedidos de delivery por uma semana inteira',
      dicas: [
        'Planeje as refeições com antecedência',
        'Cozinhe em maior quantidade no fim de semana',
        'Tenha sempre ingredientes básicos em casa'
      ]
    })

    // 2. Desafio Mês Sem Parcelamento
    const comprasParceladas = dados.transacoes.filter(t => 
      t.type === 'despesa' && 
      t.installments > 1 &&
      new Date(t.date) >= inicioMes
    )

    ativos.push({
      id: 'mes_sem_parcelamento',
      titulo: '💰 MÊS SEM PARCELAMENTO',
      objetivo: 'Agosto inteiro só à vista ou débito',
      prazo: '01/Ago - 31/Ago',
      diaAtual: 0,
      totalDias: 31,
      premio: 300.00,
      progresso: 0,
      dificuldade: 'dificil',
      categoria: 'controle',
      status: 'proximo',
      conquistaExtra: 'Sem medo do à vista',
      impacto: 'Melhora score + reduz comprometimento',
      descricao: 'Compre apenas à vista ou no débito durante todo o mês',
      dicas: [
        'Use a reserva de emergência para compras grandes',
        'Planeje compras com antecedência',
        'Evite impulsos de consumo'
      ]
    })

    // 3. Desafio Acelera Casa Própria
    const metaCasa = dados.metas.find(m => 
      m.name.toLowerCase().includes('casa') && m.is_active
    )

    if (metaCasa) {
      ativos.push({
        id: 'acelera_casa_propria',
        titulo: '🎯 ACELERA CASA PRÓPRIA',
        objetivo: '+R$ 500/mês por 3 meses na meta casa',
        prazo: 'Jul/Ago/Set 2025',
        mesAtual: 1,
        totalMeses: 3,
        premio: 'Antecipa meta em 2 meses + Badge especial',
        progresso: 33,
        dificuldade: 'medio',
        categoria: 'metas',
        status: 'ativo',
        valorExtra: 500.00,
        participacao: {
          joao: 300.00,
          maria: 200.00
        },
        impacto: 'Casa própria Out/26 → Ago/26',
        descricao: 'Acelere sua meta de casa própria com depósitos extras',
        dicas: [
          'Corte gastos supérfluos temporariamente',
          'Use dinheiro de freelances extras',
          'Redirecione parte do lazer para a meta'
        ]
      })
    }

    // DESAFIOS CONCLUÍDOS
    const concluidos = [
      {
        id: 'especialista_relatorios',
        titulo: '📊 ESPECIALISTA EM RELATÓRIOS',
        objetivo: 'Gerar 5 relatórios personalizados',
        dataConclusao: '20/Jul/2025',
        premio: 150.00,
        resultado: '7 relatórios gerados (140% da meta!)',
        status: 'superado',
        dificuldade: 'facil',
        categoria: 'analise',
        tempoGasto: '12 dias',
        bonusExtra: 'Templates premium desbloqueados'
      },
      {
        id: 'cartao_verde',
        titulo: '💳 CARTÃO VERDE',
        objetivo: 'Todos cartões abaixo 40% por 15 dias',
        dataConclusao: '15/Jul/2025',
        premio: 100.00,
        resultado: '18 dias consecutivos (120% da meta!)',
        status: 'superado',
        dificuldade: 'medio',
        categoria: 'cartoes',
        tempoGasto: '18 dias',
        bonusExtra: 'Score de crédito subiu 23 pontos!'
      }
    ]

    // PRÓXIMOS DESAFIOS
    const proximos = [
      {
        id: 'caca_gastos_esquecidos',
        titulo: '🎯 CAÇA AOS GASTOS ESQUECIDOS',
        objetivo: 'Encontre e cancele 3 assinaturas não usadas',
        prazo: '7 dias para completar',
        premio: 200.00,
        economiaExtra: 'Economia mensal permanente',
        dificuldade: 'medio',
        categoria: 'economia',
        descricao: 'Identifique assinaturas que você não usa mais',
        dicas: [
          'Revise extratos dos últimos 3 meses',
          'Verifique apps instalados no celular',
          'Analise débitos automáticos'
        ]
      },
      {
        id: 'guerreiro_poupanca',
        titulo: '💪 GUERREIRO DA POUPANÇA',
        objetivo: 'Poupe R$ 3.000 em 30 dias',
        prazo: '1 mês de disciplina total',
        premio: 300.00,
        tituloExtra: 'Título especial',
        dificuldade: 'muito_dificil',
        categoria: 'poupanca',
        descricao: 'Desafio extremo de economia em 30 dias',
        dicas: [
          'Corte todos os gastos não essenciais',
          'Busque renda extra temporária',
          'Use técnicas de economia extrema'
        ]
      },
      {
        id: 'mestre_orcamento',
        titulo: '🏠 MESTRE DO ORÇAMENTO',
        objetivo: 'Fique dentro de cada categoria por 2 meses',
        prazo: 'Agosto e Setembro 2025',
        premio: 400.00,
        dashboardExtra: 'Dashboard personalizado',
        dificuldade: 'dificil',
        categoria: 'controle',
        descricao: 'Controle perfeito de todas as categorias de gastos',
        dicas: [
          'Defina limites realistas por categoria',
          'Monitore gastos diariamente',
          'Use alertas automáticos'
        ]
      }
    ]

    return {
      ativos,
      concluidos,
      proximos,
      historico: [...concluidos] // Por enquanto, histórico = concluídos
    }
  }

  const calcularEstatisticasReais = (desafios) => {
    const totalAceitos = desafios.ativos.length + desafios.concluidos.length + 1 // +1 pausado
    const totalConcluidos = desafios.concluidos.length
    const totalDesistencias = 2 // Simulado
    const totalPausados = 1 // Simulado

    const taxaSucesso = Math.round((totalConcluidos / totalAceitos) * 100)
    
    const economiaGerada = desafios.concluidos.reduce((sum, d) => {
      return sum + (d.premio || 0)
    }, 0) + 3000 // Economia adicional estimada

    return {
      aceitos: totalAceitos,
      concluidos: totalConcluidos,
      desistencias: totalDesistencias,
      pausados: totalPausados,
      taxaSucesso,
      economiaGerada,
      diasDisciplina: 347,
      metasAceleradas: 3,
      habitosCriados: 8
    }
  }

  const gerarEvolucaoRecompensas = () => {
    const evolucao = []
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul']
    
    const valores = [0, 150, 320, 580, 890, 1240, 1650, 2340]
    
    mesesNomes.forEach((mes, index) => {
      evolucao.push({
        mes,
        valor: valores[index + 1] || 0
      })
    })

    return evolucao
  }

  const calcularDesafiosPorCategoria = (desafiosConcluidos) => {
    const categorias = {}
    
    desafiosConcluidos.forEach(desafio => {
      const cat = desafio.categoria
      if (!categorias[cat]) {
        categorias[cat] = { 
          name: cat, 
          value: 0, 
          color: getCategoriaColor(cat) 
        }
      }
      categorias[cat].value += 1
    })

    return Object.values(categorias)
  }

  const getCategoriaColor = (categoria) => {
    const cores = {
      economia: '#10b981',
      controle: '#3b82f6', 
      metas: '#8b5cf6',
      analise: '#f59e0b',
      cartoes: '#ef4444',
      poupanca: '#06b6d4'
    }
    return cores[categoria] || '#6b7280'
  }

  const gerarFinBotDica = (desafios, estatisticas) => {
    const ativosCount = desafios.ativos.length
    const proximosCriticos = desafios.ativos.filter(d => d.dificuldade === 'dificil' || d.dificuldade === 'muito_dificil')
    
    if (proximosCriticos.length > 0) {
      return `⚠️ Você tem ${proximosCriticos.length} desafio(s) difícil(is) ativo(s). Foque em um por vez para maximizar suas chances!`
    }

    if (estatisticas.taxaSucesso >= 80) {
      return `🔥 Incrível! ${estatisticas.taxaSucesso}% de taxa de sucesso! Você está dominando os desafios como um verdadeiro campeão!`
    }

    if (ativosCount >= 3) {
      return `🎯 ${ativosCount} desafios ativos! Cuidado para não se sobrecarregar. Qualidade é melhor que quantidade!`
    }

    return `💪 Continue evoluindo! Cada desafio concluído te aproxima de seus objetivos financeiros!`
  }

  const getDificuldadeColor = (dificuldade) => {
    switch (dificuldade) {
      case 'facil': return '#10b981'
      case 'medio': return '#f59e0b'
      case 'dificil': return '#ef4444'
      case 'muito_dificil': return '#7c2d12'
      default: return '#6b7280'
    }
  }

  const getDificuldadeIcon = (dificuldade) => {
    switch (dificuldade) {
      case 'facil': return '🔥'
      case 'medio': return '🔥🔥'
      case 'dificil': return '🔥🔥🔥'
      case 'muito_dificil': return '🔥🔥🔥🔥'
      default: return '🔥'
    }
  }

  const handleDesafioClick = (desafio) => {
    setDesafioSelecionado(desafio)
    setShowDesafioModal(true)
  }

  const handleAceitarDesafio = async (desafioId) => {
    try {
      // Aqui integraria com o backend para aceitar o desafio
      const desafio = proximosDesafios.find(d => d.id === desafioId)
      if (desafio) {
        // Mover para ativos
        setDesafiosAtivos(prev => [...prev, { ...desafio, status: 'ativo', dataInicio: new Date().toISOString() }])
        setProximosDesafios(prev => prev.filter(d => d.id !== desafioId))
        
        alert(`🎯 Desafio "${desafio.titulo}" aceito com sucesso! Boa sorte!`)
        setShowDesafioModal(false)
      }
    } catch (error) {
      console.error('Erro ao aceitar desafio:', error)
      alert('Erro ao aceitar desafio. Tente novamente.')
    }
  }

  const handlePausarDesafio = async (desafioId) => {
    try {
      const desafio = desafiosAtivos.find(d => d.id === desafioId)
      if (desafio && confirm(`Tem certeza que deseja pausar "${desafio.titulo}"?`)) {
        setDesafiosAtivos(prev => prev.map(d => 
          d.id === desafioId ? { ...d, status: 'pausado' } : d
        ))
        alert('⏸️ Desafio pausado. Você pode retomar quando quiser!')
        setShowDesafioModal(false)
      }
    } catch (error) {
      console.error('Erro ao pausar desafio:', error)
    }
  }

  const handleDesistirDesafio = async (desafioId) => {
    try {
      const desafio = desafiosAtivos.find(d => d.id === desafioId)
      if (desafio && confirm(`Tem certeza que deseja desistir de "${desafio.titulo}"? Esta ação não pode ser desfeita.`)) {
        setDesafiosAtivos(prev => prev.filter(d => d.id !== desafioId))
        setEstatisticasDesafios(prev => ({
          ...prev,
          desistencias: prev.desistencias + 1
        }))
        alert('❌ Desafio cancelado. Não desista! Tente novamente quando se sentir preparado.')
        setShowDesafioModal(false)
      }
    } catch (error) {
      console.error('Erro ao desistir do desafio:', error)
    }
  }

  const filtrarDesafios = () => {
    let desafios = []

    if (filtroDesafios === 'ativos') {
      desafios = desafiosAtivos
    } else if (filtroDesafios === 'concluidos') {
      desafios = desafiosConcluidos
    } else if (filtroDesafios === 'proximos') {
      desafios = proximosDesafios
    } else if (filtroDesafios === 'historico') {
      desafios = historicoDesafios
    }

    if (dificuldadeFiltro !== 'todas') {
      desafios = desafios.filter(d => d.dificuldade === dificuldadeFiltro)
    }

    return desafios
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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
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
            🎮 Carregando sistema de desafios...
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
        currentPage="desafios"
      />

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '300px' : '80px',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header Especializado */}
        <header style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
                  🎮 DESAFIOS
                  <span style={{ fontSize: '18px', opacity: 0.9 }}>
                    | {desafiosAtivos.length} ativos | {desafiosConcluidos.length} concluídos | Próximo prêmio: {formatCurrency(200)}
                  </span>
                </h1>
              </div>
            </div>

            {/* Saldo de Recompensas */}
            <div style={{ 
              minWidth: '200px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '8px 12px',
              cursor: 'pointer'
            }}
            onClick={() => setShowRecompensasModal(true)}
            >
              <div style={{ fontSize: '12px', marginBottom: '4px', textAlign: 'center' }}>
                💰 Saldo Disponível
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>
                {formatCurrency(saldoRecompensas.disponivel)}
              </div>
              <div style={{ fontSize: '10px', marginTop: '2px', textAlign: 'center', opacity: 0.8 }}>
                Clique para resgatar
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
                  FinBot - Assistente de Desafios
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
          {/* Linha Superior - Resumo + Sistema de Recompensas */}
          <div style={{
            display: 'grid',
             gridTemplateColumns: '2fr 1fr',
             gap: '24px',
             marginBottom: '24px'
           }}>
             {/* Resumo de Performance */}
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
                 📊 SUA PERFORMANCE
               </h2>
 
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                 gap: '16px',
                 marginBottom: '24px'
               }}>
                 <div style={{
                   textAlign: 'center',
                   padding: '16px',
                   backgroundColor: '#f0f9ff',
                   borderRadius: '12px',
                   border: '1px solid #7dd3fc'
                 }}>
                   <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0369a1' }}>
                     {estatisticasDesafios.aceitos}
                   </div>
                   <div style={{ fontSize: '12px', color: '#0369a1' }}>
                     Aceitos
                   </div>
                 </div>
                 <div style={{
                   textAlign: 'center',
                   padding: '16px',
                   backgroundColor: '#f0fdf4',
                   borderRadius: '12px',
                   border: '1px solid #bbf7d0'
                 }}>
                   <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
                     {estatisticasDesafios.concluidos}
                   </div>
                   <div style={{ fontSize: '12px', color: '#166534' }}>
                     Concluídos
                     </div>
 
                     <div style={{
                     textAlign: 'center',
                     padding: '16px',
                     backgroundColor: '#fef2f2',
                     borderRadius: '12px',
                     border: '1px solid #fecaca'
                     }}>
                     <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                         {estatisticasDesafios.desistencias}
                     </div>
                     <div style={{ fontSize: '12px', color: '#dc2626' }}>
                         Desistências
                     </div>
                     </div>
 
                     <div style={{
                     textAlign: 'center',
                     padding: '16px',
                     backgroundColor: '#fef3c7',
                     borderRadius: '12px',
                     border: '1px solid #fcd34d'
                     }}>
                     <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
                         {estatisticasDesafios.taxaSucesso}%
                     </div>
                     <div style={{ fontSize: '12px', color: '#92400e' }}>
                         Taxa Sucesso
                     </div>
                     </div>
                     </div>
 
                     {/* Gráfico de Evolução */}
                     <div style={{ marginBottom: '20px' }}>
                     <h3 style={{
                     fontSize: '16px',
                     fontWeight: '600',
                     margin: '0 0 12px 0',
                     color: '#374151'
                     }}>
                     📈 EVOLUÇÃO DAS RECOMPENSAS (2025)
                     </h3>
                     <div style={{ height: '120px' }}>
                     <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={evolucaoRecompensas}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="mes" />
                         <YAxis />
                         <Line 
                             type="monotone" 
                             dataKey="valor" 
                             stroke="#f59e0b" 
                             strokeWidth={3}
                             dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                         />
                         </LineChart>
                     </ResponsiveContainer>
                     </div>
                     </div>
 
                     {/* Impacto Real */}
                     <div style={{
                     backgroundColor: '#f8fafc',
                     borderRadius: '8px',
                     padding: '16px'
                     }}>
                     <h4 style={{
                     fontSize: '14px',
                     fontWeight: '600',
                     margin: '0 0 12px 0',
                     color: '#374151'
                     }}>
                     🎯 IMPACTO REAL:
                     </h4>
                     <div style={{
                     display: 'grid',
                     gridTemplateColumns: '1fr 1fr',
                     gap: '12px',
                     fontSize: '13px'
                     }}>
                     <div>
                         <span style={{ color: '#64748b' }}>💰 Economia gerada:</span>
                         <span style={{ fontWeight: '600', marginLeft: '8px' }}>
                         {formatCurrency(estatisticasDesafios.economiaGerada)}
                         </span>
                     </div>
                     <div>
                         <span style={{ color: '#64748b' }}>📅 Dias disciplina:</span>
                         <span style={{ fontWeight: '600', marginLeft: '8px' }}>
                         {estatisticasDesafios.diasDisciplina}
                         </span>
                     </div>
                     <div>
                         <span style={{ color: '#64748b' }}>🎯 Metas aceleradas:</span>
                         <span style={{ fontWeight: '600', marginLeft: '8px' }}>
                         {estatisticasDesafios.metasAceleradas}
                         </span>
                     </div>
                     <div>
                         <span style={{ color: '#64748b' }}>🔄 Hábitos criados:</span>
                         <span style={{ fontWeight: '600', marginLeft: '8px' }}>
                         {estatisticasDesafios.habitosCriados} permanentes
                         </span>
                     </div>
                     </div>
                     </div>
                     </div>
 
                     {/* Sistema de Recompensas */}
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
                     fontSize: '20px',
                     fontWeight: 'bold',
                     margin: 0,
                     color: '#1a202c'
                     }}>
                     💰 RECOMPENSAS
                     </h2>
                     <button
                     onClick={() => setShowRecompensasModal(true)}
                     style={{
                         backgroundColor: '#f59e0b',
                         color: 'white',
                         border: 'none',
                         borderRadius: '6px',
                         padding: '6px 12px',
                         fontSize: '12px',
                         fontWeight: '500',
                         cursor: 'pointer'
                     }}
                     >
                     Ver Detalhes
                     </button>
                     </div>
 
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                     <div style={{
                     padding: '16px',
                     backgroundColor: '#f0fdf4',
                     borderRadius: '12px',
                     border: '1px solid #bbf7d0'
                     }}>
                     <div style={{
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                         marginBottom: '8px'
                     }}>
                         <span style={{ fontWeight: '600', color: '#166534' }}>
                         💎 Disponível para saque
                         </span>
                         <span style={{ fontWeight: 'bold', color: '#166534', fontSize: '18px' }}>
                         {formatCurrency(saldoRecompensas.disponivel)}
                         </span>
                     </div>
                     </div>
 
                     <div style={{
                     padding: '16px',
                     backgroundColor: '#fef3c7',
                     borderRadius: '12px',
                     border: '1px solid #fcd34d'
                     }}>
                     <div style={{
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                         marginBottom: '8px'
                     }}>
                         <span style={{ fontWeight: '600', color: '#92400e' }}>
                         ⏳ Pendente (desafios ativos)
                         </span>
                         <span style={{ fontWeight: 'bold', color: '#92400e' }}>
                         {formatCurrency(saldoRecompensas.pendente)}
                         </span>
                     </div>
                     </div>
 
                     <div style={{
                     padding: '16px',
                     backgroundColor: '#e0f2fe',
                     borderRadius: '12px',
                     border: '1px solid #7dd3fc'
                     }}>
                     <div style={{
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                         marginBottom: '8px'
                     }}>
                         <span style={{ fontWeight: '600', color: '#0369a1' }}>
                         🎁 Total ganho histórico
                         </span>
                         <span style={{ fontWeight: 'bold', color: '#0369a1' }}>
                         {formatCurrency(saldoRecompensas.totalGanho)}
                         </span>
                     </div>
                     </div>
                     </div>
 
                     {/* Formas de Resgate */}
                     <div style={{
                     marginTop: '20px',
                     padding: '16px',
                     backgroundColor: '#f8fafc',
                     borderRadius: '8px'
                     }}>
                     <h4 style={{
                     fontSize: '14px',
                     fontWeight: '600',
                     margin: '0 0 12px 0',
                     color: '#374151'
                     }}>
                     🏦 FORMAS DE RESGATE:
                     </h4>
                     <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>
                     ├─ 💳 Crédito para metas: +15% bonus<br/>
                     ├─ 💰 PIX para conta corrente: sem bonus<br/>
                     ├─ 🛒 Cupons de desconto: +10% valor<br/>
                     └─ 🎁 Itens premium do app: preços especiais
                     </div>
                     </div>
 
                     <button
                     onClick={() => setShowRecompensasModal(true)}
                     style={{
                     width: '100%',
                     marginTop: '16px',
                     padding: '12px',
                     backgroundColor: '#f59e0b',
                     color: 'white',
                     border: 'none',
                     borderRadius: '8px',
                     fontSize: '14px',
                     fontWeight: '600',
                     cursor: 'pointer'
                     }}
                     >
                     💰 RESGATAR RECOMPENSAS
                     </button>
                     </div>
                     </div>
 
                     {/* Filtros de Desafios */}
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
                     🎯 SEUS DESAFIOS
                     </h2>
 
                     <div style={{ display: 'flex', gap: '8px' }}>
                     <button
                     onClick={() => setShowEstatisticasModal(true)}
                     style={{
                         backgroundColor: '#3b82f6',
                         color: 'white',
                         border: 'none',
                         borderRadius: '6px',
                         padding: '8px 16px',
                         fontSize: '12px',
                         fontWeight: '500',
                         cursor: 'pointer'
                     }}
                     >
                     📊 Estatísticas
                     </button>
                     <button
                     onClick={() => setShowNovoDesafioModal(true)}
                     style={{
                         backgroundColor: '#10b981',
                         color: 'white',
                         border: 'none',
                         borderRadius: '6px',
                         padding: '8px 16px',
                         fontSize: '12px',
                         fontWeight: '500',
                         cursor: 'pointer'
                     }}
                     >
                     ➕ Novo Desafio
                     </button>
                     </div>
                     </div>
 
                     {/* Filtros por Status */}
                     <div style={{
                     display: 'flex',
                     gap: '12px',
                     marginBottom: '20px',
                     flexWrap: 'wrap'
                     }}>
                     {[
                     { id: 'ativos', label: '🔥 Ativos', count: desafiosAtivos.length },
                     { id: 'concluidos', label: '✅ Concluídos', count: desafiosConcluidos.length },
                     { id: 'proximos', label: '⏳ Próximos', count: proximosDesafios.length },
                     { id: 'historico', label: '🏆 Histórico', count: historicoDesafios.length }
                     ].map(filtro => (
                     <button
                     key={filtro.id}
                     onClick={() => setFiltroDesafios(filtro.id)}
                     style={{
                         padding: '8px 16px',
                         backgroundColor: filtroDesafios === filtro.id ? '#f59e0b' : '#f1f5f9',
                         color: filtroDesafios === filtro.id ? 'white' : '#64748b',
                         border: 'none',
                         borderRadius: '8px',
                         fontSize: '14px',
                         fontWeight: '500',
                         cursor: 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '6px'
                     }}
                     >
                     {filtro.label}
                     <span style={{
                         backgroundColor: filtroDesafios === filtro.id ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                         borderRadius: '12px',
                         padding: '2px 6px',
                         fontSize: '10px',
                         fontWeight: '600'
                     }}>
                         {filtro.count}
                     </span>
                     </button>
                     ))}
                     </div>
 
                     {/* Filtros por Dificuldade */}
                     <div style={{
                     display: 'flex',
                     gap: '8px',
                     marginBottom: '24px',
                     flexWrap: 'wrap'
                     }}>
                     {[
                     { id: 'todas', label: '📋 Todas', icon: '📋' },
                     { id: 'facil', label: '🔥 Fácil', icon: '🔥' },
                     { id: 'medio', label: '🔥🔥 Médio', icon: '🔥🔥' },
                     { id: 'dificil', label: '🔥🔥🔥 Difícil', icon: '🔥🔥🔥' },
                     { id: 'muito_dificil', label: '🔥🔥🔥🔥 Extremo', icon: '🔥🔥🔥🔥' }
                     ].map(dificuldade => (
                     <button
                     key={dificuldade.id}
                     onClick={() => setDificuldadeFiltro(dificuldade.id)}
                     style={{
                         padding: '6px 12px',
                         backgroundColor: dificuldadeFiltro === dificuldade.id ? '#3b82f6' : '#f8fafc',
                         color: dificuldadeFiltro === dificuldade.id ? 'white' : '#64748b',
                         border: '1px solid #e2e8f0',
                         borderRadius: '6px',
                         fontSize: '12px',
                         fontWeight: '500',
                         cursor: 'pointer'
                     }}
                     >
                     {dificuldade.label}
                     </button>
                     ))}
                     </div>
 
                     {/* Lista de Desafios */}
                     <div style={{
                     display: 'grid',
                     gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                     gap: '20px'
                 }}>
                     {filtrarDesafios().map((desafio, index) => (
                     <div
                         key={desafio.id}
                         onClick={() => handleDesafioClick(desafio)}
                         style={{
                         padding: '24px',
                         backgroundColor: desafio.status === 'ativo' ? '#f0fdf4' : 
                                         desafio.status === 'concluido' ? '#e0f2fe' : '#f8fafc',
                         borderRadius: '16px',
                         border: `2px solid ${desafio.status === 'ativo' ? '#bbf7d0' : 
                                             desafio.status === 'concluido' ? '#7dd3fc' : '#e2e8f0'}`,
                         cursor: 'pointer',
                         transition: 'all 0.3s ease',
                         position: 'relative'
                         }}
                         onMouseOver={(e) => {
                         e.currentTarget.style.transform = 'translateY(-4px)'
                         e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)'
                         }}
                         onMouseOut={(e) => {
                         e.currentTarget.style.transform = 'translateY(0)'
                         e.currentTarget.style.boxShadow = 'none'
                         }}
                     >
                         {/* Badge de Status */}
                         <div style={{
                         position: 'absolute',
                         top: '12px',
                         right: '12px',
                         backgroundColor: desafio.status === 'ativo' ? '#10b981' : 
                                         desafio.status === 'concluido' ? '#3b82f6' : '#6b7280',
                         color: 'white',
                         padding: '4px 8px',
                         borderRadius: '12px',
                         fontSize: '10px',
                         fontWeight: '600'
                         }}>
                         {desafio.status === 'ativo' ? '🔥 ATIVO' : 
                             desafio.status === 'concluido' ? '✅ CONCLUÍDO' : 
                             desafio.status === 'proximo' ? '⏳ PRÓXIMO' : '📋 DISPONÍVEL'}
                         </div>
     
                         {/* Badge de Dificuldade */}
                         <div style={{
                         position: 'absolute',
                         top: '12px',
                         left: '12px',
                         backgroundColor: getDificuldadeColor(desafio.dificuldade),
                         color: 'white',
                         padding: '4px 8px',
                         borderRadius: '12px',
                         fontSize: '10px',
                         fontWeight: '600',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '4px'
                         }}>
                         {getDificuldadeIcon(desafio.dificuldade)}
                         {desafio.dificuldade.toUpperCase().replace('_', ' ')}
                         </div>
     
                         {/* Conteúdo Principal */}
                         <div style={{ marginTop: '40px' }}>
                         <h3 style={{
                             fontSize: '18px',
                             fontWeight: 'bold',
                             margin: '0 0 8px 0',
                             color: '#1a202c'
                         }}>
                             {desafio.titulo}
                         </h3>
                         
                         <p style={{
                             fontSize: '14px',
                             color: '#64748b',
                             margin: '0 0 16px 0',
                             lineHeight: '1.5'
                         }}>
                             {desafio.objetivo}
                         </p>
     
                         {/* Progresso para Desafios Ativos */}
                         {desafio.status === 'ativo' && desafio.progresso !== undefined && (
                             <div style={{ marginBottom: '16px' }}>
                             <div style={{
                                 display: 'flex',
                                 justifyContent: 'space-between',
                                 alignItems: 'center',
                                 marginBottom: '6px'
                             }}>
                                 <span style={{ fontSize: '12px', color: '#64748b' }}>
                                 Progresso
                                 </span>
                                 <span style={{ fontSize: '12px', fontWeight: '600', color: '#10b981' }}>
                                 {desafio.progresso}%
                                 </span>
                             </div>
                             <div style={{
                                 backgroundColor: '#e2e8f0',
                                 borderRadius: '8px',
                                 height: '8px',
                                 overflow: 'hidden'
                             }}>
                                 <div style={{
                                 backgroundColor: '#10b981',
                                 height: '100%',
                                 width: `${desafio.progresso}%`,
                                 transition: 'width 0.5s ease'
                                 }} />
                             </div>
                             
                             {/* Progresso Individual para Desafios Familiares */}
                             {desafio.participantes && (
                                 <div style={{
                                 display: 'grid',
                                 gridTemplateColumns: '1fr 1fr',
                                 gap: '12px',
                                 marginTop: '12px'
                                 }}>
                                 {desafio.participantes.map((participante, pIndex) => (
                                     <div key={pIndex} style={{ textAlign: 'center' }}>
                                     <div style={{
                                         fontSize: '12px',
                                         color: '#64748b',
                                         marginBottom: '4px'
                                     }}>
                                         {pIndex === 0 ? '👨' : '👩'} {participante.nome}
                                     </div>
                                     <div style={{
                                         display: 'flex',
                                         gap: '2px',
                                         justifyContent: 'center'
                                     }}>
                                         {participante.progresso.map((completo, i) => (
                                         <span key={i} style={{
                                             fontSize: '12px',
                                             opacity: completo ? 1 : 0.3
                                         }}>
                                             {completo ? '✅' : '❌'}
                                         </span>
                                         ))}
                                     </div>
                                     </div>
                                 ))}
                                 </div>
                             )}
                             </div>
                         )}
     
                         {/* Informações do Desafio */}
                         <div style={{
                             display: 'flex',
                             flexDirection: 'column',
                             gap: '8px',
                             fontSize: '13px'
                         }}>
                             <div style={{
                             display: 'flex',
                             justifyContent: 'space-between'
                             }}>
                             <span style={{ color: '#64748b' }}>⏰ Prazo:</span>
                             <span style={{ fontWeight: '600' }}>{desafio.prazo}</span>
                             </div>
                             
                             <div style={{
                             display: 'flex',
                             justifyContent: 'space-between'
                             }}>
                             <span style={{ color: '#64748b' }}>🏆 Prêmio:</span>
                             <span style={{ fontWeight: '600', color: '#f59e0b' }}>
                                 {typeof desafio.premio === 'number' ? formatCurrency(desafio.premio) : desafio.premio}
                             </span>
                             </div>
     
                             {desafio.economiaAtual && (
                             <div style={{
                                 display: 'flex',
                                 justifyContent: 'space-between'
                             }}>
                                 <span style={{ color: '#64748b' }}>💰 Economia atual:</span>
                                 <span style={{ fontWeight: '600', color: '#10b981' }}>
                                 {formatCurrency(desafio.economiaAtual)}
                                 </span>
                             </div>
                             )}
     
                             {desafio.dataConclusao && (
                             <div style={{
                                 display: 'flex',
                                 justifyContent: 'space-between'
                             }}>
                                 <span style={{ color: '#64748b' }}>📅 Concluído em:</span>
                                 <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                                 {desafio.dataConclusao}
                                 </span>
                             </div>
                             )}
     
                             {desafio.resultado && (
                             <div style={{
                                 marginTop: '8px',
                                 padding: '8px',
                                 backgroundColor: '#e0f2fe',
                                 borderRadius: '6px',
                                 fontSize: '12px',
                                 color: '#0369a1',
                                 fontWeight: '500'
                             }}>
                                 🎯 {desafio.resultado}
                             </div>
                             )}
                         </div>
     
                         {/* Botões de Ação */}
                         {desafio.status === 'ativo' && (
                             <div style={{
                             display: 'flex',
                             gap: '8px',
                             marginTop: '16px'
                             }}>
                             <button
                                 onClick={(e) => {
                                 e.stopPropagation()
                                 handlePausarDesafio(desafio.id)
                                 }}
                                 style={{
                                 flex: 1,
                                 padding: '8px',
                                 backgroundColor: '#f59e0b',
                                 color: 'white',
                                 border: 'none',
                                 borderRadius: '6px',
                                 fontSize: '12px',
                                 fontWeight: '500',
                                 cursor: 'pointer'
                                 }}
                             >
                                 ⏸️ Pausar
                             </button>
                             <button
                                 onClick={(e) => {
                                 e.stopPropagation()
                                 handleDesistirDesafio(desafio.id)
                                 }}
                                 style={{
                                 flex: 1,
                                 padding: '8px',
                                 backgroundColor: '#ef4444',
                                 color: 'white',
                                 border: 'none',
                                 borderRadius: '6px',
                                 fontSize: '12px',
                                 fontWeight: '500',
                                 cursor: 'pointer'
                                 }}
                             >
                                 ❌ Desistir
                             </button>
                             </div>
                         )}
     
                         {(desafio.status === 'proximo' || !desafio.status) && (
                             <button
                             onClick={(e) => {
                                 e.stopPropagation()
                                 handleAceitarDesafio(desafio.id)
                             }}
                             style={{
                                 width: '100%',
                                 marginTop: '16px',
                                 padding: '12px',
                                 backgroundColor: '#10b981',
                                 color: 'white',
                                 border: 'none',
                                 borderRadius: '8px',
                                 fontSize: '14px',
                                 fontWeight: '600',
                                 cursor: 'pointer'
                             }}
                             >
                             🎯 ACEITAR DESAFIO
                             </button>
                         )}
                         </div>
                     </div>
                     ))}
                 </div>
     
                 {/* Mensagem quando não há desafios */}
                 {filtrarDesafios().length === 0 && (
                     <div style={{
                     textAlign: 'center',
                     padding: '60px',
                     color: '#64748b'
                     }}>
                     <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>🎮</div>
                     <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                         Nenhum desafio encontrado
                     </h3>
                     <p style={{ margin: 0 }}>
                         Ajuste os filtros ou aceite novos desafios para começar!
                     </p>
                     </div>
                 )}
                 </div>
                </div>
                </div>
            </main>
     
             {/* Modal de Detalhes do Desafio */}
             {showDesafioModal && desafioSelecionado && (
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
                     🎯 DETALHES DO DESAFIO
                     </h2>
                     <button
                     onClick={() => setShowDesafioModal(false)}
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
     
                 {/* Cabeçalho do Desafio */}
                 <div style={{
                     textAlign: 'center',
                     marginBottom: '24px',
                     padding: '20px',
                     backgroundColor: '#f8fafc',
                     borderRadius: '12px'
                 }}>
                     <h3 style={{
                     fontSize: '20px',
                     fontWeight: 'bold',
                     margin: '0 0 8px 0',
                     color: '#1a202c'
                     }}>
                     {desafioSelecionado.titulo}
                     </h3>
                     
                     <p style={{
                     fontSize: '16px',
                     color: '#64748b',
                     margin: '0 0 16px 0'
                     }}>
                     {desafioSelecionado.objetivo}
                     </p>
     
                     <div style={{
                     display: 'flex',
                     justifyContent: 'center',
                     gap: '12px'
                     }}>
                     <div style={{
                         backgroundColor: getDificuldadeColor(desafioSelecionado.dificuldade),
                         color: 'white',
                         padding: '6px 12px',
                         borderRadius: '12px',
                         fontSize: '12px',
                         fontWeight: '600'
                     }}>
                        {getDificuldadeIcon(desafioSelecionado.dificuldade)} {desafioSelecionado.dificuldade.toUpperCase().replace('_', ' ')}
                    </div>
                    
                    <div style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                    }}>
                    📂 {desafioSelecionado.categoria.toUpperCase()}
                    </div>
                </div>
                </div>

                {/* Informações Detalhadas */}
                <div style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #7dd3fc',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
                }}>
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 16px 0',
                    color: '#0c4a6e'
                }}>
                    📊 INFORMAÇÕES DO DESAFIO
                </h4>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    fontSize: '14px'
                }}>
                    <div>
                    <span style={{ color: '#0369a1' }}>⏰ Prazo:</span>
                    <div style={{ fontWeight: '600', color: '#0c4a6e' }}>
                        {desafioSelecionado.prazo}
                    </div>
                    </div>
                    
                    <div>
                    <span style={{ color: '#0369a1' }}>🏆 Prêmio:</span>
                    <div style={{ fontWeight: '600', color: '#0c4a6e' }}>
                        {typeof desafioSelecionado.premio === 'number' ? 
                        formatCurrency(desafioSelecionado.premio) : 
                        desafioSelecionado.premio}
                    </div>
                    </div>

                    {desafioSelecionado.progresso !== undefined && (
                    <div>
                        <span style={{ color: '#0369a1' }}>📈 Progresso:</span>
                        <div style={{ fontWeight: '600', color: '#0c4a6e' }}>
                        {desafioSelecionado.progresso}%
                        </div>
                    </div>
                    )}

                    {desafioSelecionado.economiaAtual && (
                    <div>
                        <span style={{ color: '#0369a1' }}>💰 Economia:</span>
                        <div style={{ fontWeight: '600', color: '#0c4a6e' }}>
                        {formatCurrency(desafioSelecionado.economiaAtual)}
                        </div>
                    </div>
                    )}
                </div>

                {/* Progresso Visual */}
                {desafioSelecionado.progresso !== undefined && (
                    <div style={{ marginTop: '16px' }}>
                    <div style={{
                        backgroundColor: '#e0f2fe',
                        borderRadius: '8px',
                        height: '12px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                        backgroundColor: '#0ea5e9',
                        height: '100%',
                        width: `${desafioSelecionado.progresso}%`,
                        transition: 'width 0.5s ease'
                        }} />
                    </div>
                    </div>
                )}
                </div>

                {/* Descrição e Dicas */}
                <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
                }}>
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 12px 0',
                    color: '#92400e'
                }}>
                    📝 DESCRIÇÃO E DICAS
                </h4>
                
                <p style={{
                    fontSize: '14px',
                    color: '#92400e',
                    margin: '0 0 16px 0',
                    lineHeight: '1.6'
                }}>
                    {desafioSelecionado.descricao}
                </p>

                {desafioSelecionado.dicas && (
                    <div>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#92400e',
                        marginBottom: '8px'
                    }}>
                        💡 DICAS PARA SUCESSO:
                    </div>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '20px',
                        fontSize: '13px',
                        color: '#92400e'
                    }}>
                        {desafioSelecionado.dicas.map((dica, index) => (
                        <li key={index} style={{ marginBottom: '4px' }}>{dica}</li>
                        ))}
                    </ul>
                    </div>
                )}
                </div>

                {/* Recompensas Extras */}
                {(desafioSelecionado.conquistaExtra || desafioSelecionado.bonusExtra || desafioSelecionado.impacto) && (
                <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px'
                }}>
                    <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 12px 0',
                    color: '#166534'
                    }}>
                    🎁 RECOMPENSAS EXTRAS
                    </h4>
                    
                    <div style={{ fontSize: '14px', color: '#166534', lineHeight: '1.6' }}>
                    {desafioSelecionado.conquistaExtra && (
                        <div>🏆 Conquista: {desafioSelecionado.conquistaExtra}</div>
                    )}
                    {desafioSelecionado.bonusExtra && (
                        <div>⭐ Bônus: {desafioSelecionado.bonusExtra}</div>
                    )}
                    {desafioSelecionado.impacto && (
                        <div>🎯 Impacto: {desafioSelecionado.impacto}</div>
                    )}
                    </div>
                </div>
                )}

                {/* Botões de Ação */}
                <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
                }}>
                {desafioSelecionado.status === 'ativo' && (
                    <>
                    <button
                        onClick={() => handlePausarDesafio(desafioSelecionado.id)}
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
                        ⏸️ Pausar Desafio
                    </button>
                    <button
                        onClick={() => handleDesistirDesafio(desafioSelecionado.id)}
                        style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                        }}
                    >
                        ❌ Desistir
                    </button>
                    </>
                )}

                {(desafioSelecionado.status === 'proximo' || !desafioSelecionado.status) && (
                    <button
                    onClick={() => handleAceitarDesafio(desafioSelecionado.id)}
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
                    🎯 ACEITAR DESAFIO
                    </button>
                )}

                <button
                    onClick={() => setShowDesafioModal(false)}
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

        {/* Modal de Recompensas */}
        {showRecompensasModal && (
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
                    💰 SISTEMA DE RECOMPENSAS
                </h2>
                <button
                    onClick={() => setShowRecompensasModal(false)}
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

                {/* Saldo Atual */}
                <div style={{
                backgroundColor: '#f0fdf4',
                border: '2px solid #bbf7d0',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                textAlign: 'center'
                }}>
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0 0 8px 0',
                    color: '#166534'
                }}>
                    💎 SALDO ATUAL DE PRÊMIOS
                </h3>
                <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#166534',
                    marginBottom: '8px'
                }}>
                    {formatCurrency(saldoRecompensas.disponivel)}
                </div>
                <div style={{
                    fontSize: '14px',
                    color: '#166534'
                }}>
                    Disponível para resgate imediato
                </div>
                </div>

                {/* Breakdown do Saldo */}
                <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px'
                }}>
                <div style={{
                    padding: '16px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '12px',
                    border: '1px solid #fcd34d',
                    textAlign: 'center'
                }}>
                    <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#92400e',
                    marginBottom: '4px'
                    }}>
                    {formatCurrency(saldoRecompensas.pendente)}
                    </div>
                    <div style={{
                    fontSize: '12px',
                    color: '#92400e'
                    }}>
                    ⏳ Pendente (desafios ativos)
                    </div>
                </div>

                <div style={{
                    padding: '16px',
                    backgroundColor: '#e0f2fe',
                    borderRadius: '12px',
                    border: '1px solid #7dd3fc',
                    textAlign: 'center'
                }}>
                    <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#0369a1',
                    marginBottom: '4px'
                    }}>
                    {formatCurrency(saldoRecompensas.totalGanho)}
                    </div>
                    <div style={{
                    fontSize: '12px',
                    color: '#0369a1'
                    }}>
                    🎁 Total ganho histórico
                    </div>
                </div>
                </div>

                {/* Formas de Resgate */}
                <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
                }}>
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 16px 0',
                    color: '#374151'
                }}>
                    🏦 FORMAS DE RESGATE
                </h4>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                }}>
                    {[
                    { 
                        tipo: '💳 Crédito para metas', 
                        bonus: '+15% bonus', 
                        cor: '#10b981',
                        descricao: 'Melhor opção!'
                    },
                    { 
                        tipo: '💰 PIX para conta', 
                        bonus: 'sem bonus', 
                        cor: '#3b82f6',
                        descricao: 'Dinheiro direto'
                    },
                    { 
                        tipo: '🛒 Cupons desconto', 
                        bonus: '+10% valor', 
                        cor: '#f59e0b',
                        descricao: 'Para compras'
                    },
                    { 
                        tipo: '🎁 Itens premium', 
                        bonus: 'preços especiais', 
                        cor: '#8b5cf6',
                        descricao: 'Recursos exclusivos'
                    }
                    ].map((opcao, index) => (
                    <button
                        key={index}
                        style={{
                        padding: '16px',
                        backgroundColor: 'white',
                        border: `2px solid ${opcao.cor}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                        e.target.style.backgroundColor = opcao.cor
                        e.target.style.color = 'white'
                        }}
                        onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'white'
                        e.target.style.color = 'inherit'
                        }}
                        onClick={() => {
                        alert(`Resgate via ${opcao.tipo} será implementado em breve!`)
                        }}
                    >
                        <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '4px'
                        }}>
                        {opcao.tipo}
                        </div>
                        <div style={{
                        fontSize: '12px',
                        opacity: 0.8,
                        marginBottom: '2px'
                        }}>
                        {opcao.bonus}
                        </div>
                        <div style={{
                        fontSize: '11px',
                        opacity: 0.7
                        }}>
                        {opcao.descricao}
                        </div>
                    </button>
                    ))}
                </div>
                </div>
    
                {/* Histórico de Resgates */}
                <div style={{
                backgroundColor: '#e0f2fe',
                border: '1px solid #7dd3fc',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
                }}>
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 16px 0',
                    color: '#0c4a6e'
                }}>
                    📊 HISTÓRICO DE RESGATES
                </h4>
                
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    {[
                    { data: '20/Jul/2025', tipo: 'PIX', valor: 150.00, status: 'Processado' },
                    { data: '15/Jul/2025', tipo: 'Meta Casa', valor: 100.00, status: 'Concluído' },
                    { data: '10/Jul/2025', tipo: 'Cupom', valor: 50.00, status: 'Usado' }
                    ].map((resgate, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        fontSize: '13px'
                    }}>
                        <div>
                        <div style={{ fontWeight: '600', color: '#0c4a6e' }}>
                            {resgate.data}
                        </div>
                        <div style={{ color: '#0369a1' }}>
                            {resgate.tipo}
                        </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', color: '#0c4a6e' }}>
                            {formatCurrency(resgate.valor)}
                        </div>
                        <div style={{ color: '#0369a1', fontSize: '11px' }}>
                            {resgate.status}
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
    
                {/* Botões de Ação */}
                <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
                }}>
                <button
                    onClick={() => {
                    alert('Funcionalidade de resgate será implementada em breve!')
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
                    💰 RESGATAR AGORA
                </button>
                <button
                    onClick={() => setShowRecompensasModal(false)}
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
    
        {/* Modal de Estatísticas Detalhadas */}
        {showEstatisticasModal && (
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
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                maxHeight: '90vh',
                overflowY: 'auto'
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
                    📊 ESTATÍSTICAS DE DESAFIOS
                </h2>
                <button
                    onClick={() => setShowEstatisticasModal(false)}
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
    
                {/* Performance Geral */}
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
                    📊 PERFORMANCE GERAL
                </h3>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px'
                }}>
                    <div>
                    <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '12px', fontWeight: '600' }}>
                        🎯 DESAFIOS:
                    </div>
                    <div style={{ fontSize: '13px', color: '#0369a1', lineHeight: '1.6' }}>
                        ├─ Aceitos: {estatisticasDesafios.aceitos}<br/>
                        ├─ Concluídos: {estatisticasDesafios.concluidos} ({estatisticasDesafios.taxaSucesso}%)<br/>
                        ├─ Desistências: {estatisticasDesafios.desistencias} ({Math.round((estatisticasDesafios.desistencias / estatisticasDesafios.aceitos) * 100)}%)<br/>
                        └─ Pausados: {estatisticasDesafios.pausados}
                    </div>
                    </div>
                    
                    <div>
                    <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '12px', fontWeight: '600' }}>
                        💰 RECOMPENSAS:
                    </div>
                    <div style={{ fontSize: '13px', color: '#0369a1', lineHeight: '1.6' }}>
                        ├─ Total ganho: {formatCurrency(saldoRecompensas.totalGanho)}<br/>
                        ├─ Disponível: {formatCurrency(saldoRecompensas.disponivel)}<br/>
                        ├─ Pendente: {formatCurrency(saldoRecompensas.pendente)}<br/>
                        └─ Média/desafio: {formatCurrency(saldoRecompensas.totalGanho / estatisticasDesafios.concluidos)}
                    </div>
                    </div>
                </div>
                </div>
    
                {/* Impacto Real */}
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
                    🎯 IMPACTO REAL
                </h3>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    fontSize: '14px',
                    color: '#166534'
                }}>
                    <div>
                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>💰 FINANCEIRO:</div>
                    <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                        ├─ Economia total: {formatCurrency(estatisticasDesafios.economiaGerada)}<br/>
                        ├─ Metas aceleradas: {estatisticasDesafios.metasAceleradas}<br/>
                        ├─ Hábitos criados: {estatisticasDesafios.habitosCriados}<br/>
                        └─ ROI médio: 340%
                    </div>
                    </div>
                    
                    <div>
                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>🎯 COMPORTAMENTAL:</div>
                    <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                        ├─ Dias disciplina: {estatisticasDesafios.diasDisciplina}<br/>
                        ├─ Autocontrole: +67%<br/>
                        ├─ Motivação: +89%<br/>
                        └─ Consistência: Nível máximo
                    </div>
                    </div>
                </div>
                </div>
    
                {/* Desafios por Categoria */}
                {desafiosPorCategoria.length > 0 && (
                <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px'
                }}>
                    <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0 0 16px 0',
                    color: '#92400e'
                    }}>
                    📂 POR CATEGORIA
                    </h3>
                    
                    <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                    gap: '12px'
                    }}>
                    {desafiosPorCategoria.map((categoria, index) => (
                        <div key={index} style={{
                        textAlign: 'center',
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                        }}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: categoria.color,
                            marginBottom: '4px'
                        }}>
                            {categoria.value}
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: '#64748b',
                            textTransform: 'capitalize'
                        }}>
                            {categoria.name}
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
                )}
    
                {/* Recordes Pessoais */}
                <div style={{
                backgroundColor: '#e0f2fe',
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
                    🏆 RECORDES PESSOAIS
                </h3>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                }}>
                    <div>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '16px',
                        fontSize: '13px',
                        color: '#0369a1',
                        lineHeight: '1.6'
                    }}>
                        <li>🔥 Maior streak: 28 dias</li>
                        <li>💰 Maior economia: {formatCurrency(890)}</li>
                        <li>🎯 Meta mais rápida: 8 dias</li>
                        <li>⭐ Maior prêmio: {formatCurrency(500)}</li>
                    </ul>
                    </div>
                    <div>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '16px',
                        fontSize: '13px',
                        color: '#0369a1',
                        lineHeight: '1.6'
                    }}>
                        <li>🎮 Desafios simultâneos: 4</li>
                        <li>📅 Mês perfeito: Junho/2025</li>
                        <li>🏆 Sequência vitórias: 7</li>
                        <li>💎 Categoria favorita: Economia</li>
                    </ul>
                    </div>
                </div>
                </div>
    
                {/* Botão Fechar */}
                <div style={{ textAlign: 'center' }}>
                <button
                    onClick={() => setShowEstatisticasModal(false)}
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
                  ✅ Fechar
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* Modal de Novo Desafio */}
        {showNovoDesafioModal && (
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
              maxWidth: '500px',
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
                  ➕ CRIAR DESAFIO PERSONALIZADO
                </h2>
                <button
                  onClick={() => setShowNovoDesafioModal(false)}
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
  
              {/* Formulário de Novo Desafio */}
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
                  🎯 FUNCIONALIDADE EM DESENVOLVIMENTO
                </h3>
                
                <p style={{
                  fontSize: '14px',
                  color: '#0369a1',
                  margin: '0 0 16px 0',
                  lineHeight: '1.6'
                }}>
                  Em breve você poderá criar seus próprios desafios personalizados com:
                </p>
  
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '13px',
                  color: '#0369a1',
                  lineHeight: '1.6'
                }}>
                  <li>🎯 Objetivos customizados</li>
                  <li>⏰ Prazos flexíveis</li>
                  <li>🏆 Recompensas personalizadas</li>
                  <li>👥 Desafios familiares</li>
                  <li>📊 Métricas específicas</li>
                  <li>🎮 Gamificação avançada</li>
                </ul>
              </div>
  
              {/* Sugestões de Desafios */}
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 12px 0',
                  color: '#92400e'
                }}>
                  💡 SUGESTÕES PARA SEUS DESAFIOS:
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '12px',
                  color: '#92400e'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>💰 ECONOMIA:</div>
                    <div>• 30 dias sem gastos supérfluos</div>
                    <div>• Economizar R$ X em Y dias</div>
                    <div>• Usar só cupons de desconto</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>🎯 METAS:</div>
                    <div>• Acelerar meta específica</div>
                    <div>• Criar nova meta em 7 dias</div>
                    <div>• Bater 3 metas no mês</div>
                  </div>
                </div>
              </div>
  
              {/* Botões */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => {
                    alert('Funcionalidade será implementada na próxima versão!')
                    setShowNovoDesafioModal(false)
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
                  🔔 Me Avisar Quando Estiver Pronto
                </button>
                <button
                  onClick={() => setShowNovoDesafioModal(false)}
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
  
        {/* CSS Animations */}
        <style jsx>{`
          @keyframes spin {
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
          
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.5); }
            50% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.8); }
          }
          
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
            40%, 43% { transform: translate3d(0,-8px,0); }
            70% { transform: translate3d(0,-4px,0); }
            90% { transform: translate3d(0,-2px,0); }
          }
        `}</style>
      </div>
    )
  }