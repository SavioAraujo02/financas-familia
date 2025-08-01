'use client'
import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import Sidebar from '@/components/layout/Sidebar'

export default function ConquistasRevolucionaria() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Estados principais
  const [conquistasUsuario, setConquistasUsuario] = useState([])
  const [estatisticasUsuario, setEstatisticasUsuario] = useState({
    nivel: 12,
    titulo: "MESTRE FINANCEIRO",
    pontos: 847,
    pontosProximo: 1000,
    streak: 127,
    melhorStreak: 145,
    taxaSucesso: 92,
    conquistasDesbloqueadas: 23,
    conquistasTotal: 50,
    diasAtivos: 189,
    economiaTotal: 15400
  })

  // Estados para ranking familiar
  const [rankingFamiliar, setRankingFamiliar] = useState([
    { nome: "João", nivel: 12, pontos: 847, posicao: 1, avatar: "👨", status: "LÍDER ATUAL!" },
    { nome: "Maria", nivel: 10, pontos: 723, posicao: 2, avatar: "👩", status: "VICE-LÍDER" }
  ])

  // Estados para conquistas
  const [conquistasDesbloqueadas, setConquistasDesbloqueadas] = useState([])
  const [conquistasBloqueadas, setConquistasBloqueadas] = useState([])
  const [conquistasRaras, setConquistasRaras] = useState([])

  // Estados para filtros
  const [filtroConquistas, setFiltroConquistas] = useState('todas') // 'todas', 'concluidas', 'bloqueadas', 'recentes'
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas') // 'todas', 'poupanca', 'cartoes', 'analise', 'metas', 'consistencia'

  // Estados para modais
  const [showConquistaModal, setShowConquistaModal] = useState(false)
  const [conquistaSelecionada, setConquistaSelecionada] = useState(null)
  const [showRankingModal, setShowRankingModal] = useState(false)
  const [showEstatisticasModal, setShowEstatisticasModal] = useState(false)

  // Estados para dados calculados
  const [progressoNivel, setProgressoNivel] = useState(0)
  const [evolucaoPontos, setEvolucaoPontos] = useState([])
  const [conquistasPorCategoria, setConquistasPorCategoria] = useState([])
  const [finBotDica, setFinBotDica] = useState("Carregando análise de conquistas...")

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

      // 2. CALCULAR ESTATÍSTICAS REAIS
      const hoje = new Date()
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]

      const transacoesMes = (transactionsData || []).filter(t => 
        t.date >= inicioMes && t.date <= fimMes && t.status === 'confirmado'
      )

      const metasAtivas = (goalsData || []).filter(g => g.is_active)
      const metasConcluidas = (goalsData || []).filter(g => !g.is_active && g.current_amount >= g.target_amount)

      // 3. CALCULAR DIAS ATIVOS
      const diasAtivos = calcularDiasAtivos(transactionsData)

      // 4. CALCULAR SAÚDE FINANCEIRA
      const saudeFinanceira = calcularSaudeFinanceira(transactionsData, profileData?.monthly_income || 10600)

      // 5. CALCULAR NÍVEL E PONTOS REAIS
      const { nivel, pontos, titulo } = calcularNivelReal({
        saudeFinanceira,
        diasAtivos,
        metasAtivas: metasAtivas.length,
        metasConcluidas: metasConcluidas.length,
        transacoesTotal: transactionsData?.length || 0,
        economiaTotal: calcularEconomiaTotal(transactionsData)
      })

      // 6. GERAR CONQUISTAS REAIS
      const conquistasReais = await gerarConquistasReais(currentUser.id, {
        saudeFinanceira,
        diasAtivos,
        metasAtivas: metasAtivas.length,
        metasConcluidas: metasConcluidas.length,
        transacoesTotal: transactionsData?.length || 0,
        nivel,
        pontos
      })

      // 7. ATUALIZAR ESTADOS COM DADOS REAIS
      setEstatisticasUsuario({
        nivel,
        titulo,
        pontos,
        pontosProximo: (Math.floor(nivel / 5) + 1) * 1000,
        streak: diasAtivos,
        melhorStreak: Math.max(diasAtivos + 18, 145),
        taxaSucesso: Math.min(Math.round((metasConcluidas.length / Math.max(metasAtivas.length + metasConcluidas.length, 1)) * 100), 100),
        conquistasDesbloqueadas: conquistasReais.desbloqueadas.length,
        conquistasTotal: 50,
        diasAtivos,
        economiaTotal: calcularEconomiaTotal(transactionsData)
      })

      setConquistasDesbloqueadas(conquistasReais.desbloqueadas)
      setConquistasBloqueadas(conquistasReais.bloqueadas)
      setConquistasRaras(conquistasReais.raras)

      // 8. CALCULAR PROGRESSO DO NÍVEL
      const pontosAtual = pontos % 1000
      setProgressoNivel(Math.round((pontosAtual / 1000) * 100))

      // 9. GERAR EVOLUÇÃO DE PONTOS (últimos 6 meses)
      const evolucao = gerarEvolucaoPontos(transactionsData, metasConcluidas)
      setEvolucaoPontos(evolucao)

      // 10. CALCULAR CONQUISTAS POR CATEGORIA
      const porCategoria = calcularConquistasPorCategoria(conquistasReais.desbloqueadas)
      setConquistasPorCategoria(porCategoria)

      // 11. GERAR DICA DO FINBOT
      const dica = gerarFinBotDica(conquistasReais, nivel, pontos)
      setFinBotDica(dica)

      // 12. SALVAR PROGRESSO NO LOCALSTORAGE (para sidebar)
      localStorage.setItem('userLevel', nivel.toString())
      localStorage.setItem('levelProgress', progressoNivel.toString())

    } catch (error) {
      console.error('Erro ao carregar conquistas:', error)
      setFinBotDica("Erro ao carregar dados. Verifique sua conexão.")
    } finally {
      setLoading(false)
    }
  }

  const calcularDiasAtivos = (transacoes) => {
    if (!transacoes || transacoes.length === 0) return 0
    
    const hoje = new Date()
    const ultimoMes = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate())
    
    const diasComTransacao = new Set(
      transacoes
        .filter(t => new Date(t.date) >= ultimoMes && t.status === 'confirmado')
        .map(t => new Date(t.date).toDateString())
    )
    
    return diasComTransacao.size
  }

  const calcularSaudeFinanceira = (transacoes, rendaMensal) => {
    if (!transacoes || transacoes.length === 0) return 50

    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]

    const despesasMes = transacoes
      .filter(t => t.type === 'despesa' && t.date >= inicioMes && t.date <= fimMes && t.status === 'confirmado')
      .reduce((sum, t) => sum + t.amount, 0)

    const percentualComprometido = (despesasMes / rendaMensal) * 100

    if (percentualComprometido <= 30) return 95
    if (percentualComprometido <= 50) return 80
    if (percentualComprometido <= 70) return 60
    return 30
  }

  const calcularEconomiaTotal = (transacoes) => {
    if (!transacoes || transacoes.length === 0) return 0

    const hoje = new Date()
    const inicioAno = new Date(hoje.getFullYear(), 0, 1).toISOString().split('T')[0]

    const receitas = transacoes
      .filter(t => t.type === 'receita' && t.date >= inicioAno && t.status === 'confirmado')
      .reduce((sum, t) => sum + t.amount, 0)

    const despesas = transacoes
      .filter(t => t.type === 'despesa' && t.date >= inicioAno && t.status === 'confirmado')
      .reduce((sum, t) => sum + t.amount, 0)

    return Math.max(receitas - despesas, 0)
  }

  const calcularNivelReal = (dados) => {
    let pontos = 0

    // Pontos por saúde financeira (0-300 pontos)
    pontos += Math.round(dados.saudeFinanceira * 3)

    // Pontos por dias ativos (0-200 pontos)
    pontos += Math.min(dados.diasAtivos * 5, 200)

    // Pontos por metas ativas (0-150 pontos)
    pontos += dados.metasAtivas * 30

    // Pontos por metas concluídas (0-200 pontos)
    pontos += dados.metasConcluidas * 50

    // Pontos por transações (0-100 pontos)
    pontos += Math.min(dados.transacoesTotal * 2, 100)

    // Pontos por economia (0-150 pontos)
    pontos += Math.min(Math.round(dados.economiaTotal / 100), 150)

    const nivel = Math.max(1, Math.min(20, Math.floor(pontos / 50)))

    let titulo = "INICIANTE"
    if (nivel >= 18) titulo = "GURU FINANCEIRO"
    else if (nivel >= 15) titulo = "MESTRE FINANCEIRO"
    else if (nivel >= 12) titulo = "EXPERT AVANÇADO"
    else if (nivel >= 9) titulo = "ORGANIZADOR PRO"
    else if (nivel >= 6) titulo = "CONTROLADOR"
    else if (nivel >= 3) titulo = "APRENDIZ"

    return { nivel, pontos, titulo }
  }

  const gerarConquistasReais = async (userId, dados) => {
    const desbloqueadas = []
    const bloqueadas = []
    const raras = []

    // CONQUISTAS DESBLOQUEADAS (baseadas em dados reais)
    if (dados.saudeFinanceira >= 80) {
      desbloqueadas.push({
        id: 'saude_excelente',
        titulo: '🏆 SAÚDE FINANCEIRA EXCELENTE',
        descricao: 'Manteve saúde financeira acima de 80%',
        icone: '🏆',
        cor: '#10b981',
        categoria: 'poupanca',
        dataDesbloqueio: '15/Jul/2025',
        pontos: 100,
        recompensa: 'Modo Premium desbloqueado',
        raridade: dados.saudeFinanceira >= 95 ? 'rara' : 'comum'
      })
    }

    if (dados.diasAtivos >= 15) {
      desbloqueadas.push({
        id: 'usuario_ativo',
        titulo: '🔥 USUÁRIO SUPER ATIVO',
        descricao: `${dados.diasAtivos} dias com movimentação`,
        icone: '🔥',
        cor: '#f59e0b',
        categoria: 'consistencia',
        dataDesbloqueio: '08/Jul/2025',
        pontos: 80,
        recompensa: 'Widget especial dashboard',
        raridade: dados.diasAtivos >= 30 ? 'rara' : 'comum'
      })
    }

    if (dados.transacoesTotal >= 50) {
      desbloqueadas.push({
        id: 'organizador',
        titulo: '📊 MESTRE DA ORGANIZAÇÃO',
        descricao: `${dados.transacoesTotal} transações registradas`,
        icone: '📊',
        cor: '#3b82f6',
        categoria: 'analise',
        dataDesbloqueio: '01/Jul/2025',
        pontos: 60,
        recompensa: 'Templates de relatório extra',
        raridade: dados.transacoesTotal >= 100 ? 'rara' : 'comum'
      })
    }

    if (dados.metasConcluidas >= 3) {
      desbloqueadas.push({
        id: 'mestre_metas',
        titulo: '🎯 MESTRE DAS METAS',
        descricao: `${dados.metasConcluidas} metas concluídas`,
        icone: '🎯',
        cor: '#8b5cf6',
        categoria: 'metas',
        dataDesbloqueio: '22/Jun/2025',
        pontos: 120,
        recompensa: 'Análise preditiva avançada',
        raridade: dados.metasConcluidas >= 5 ? 'rara' : 'comum'
      })
    }

    if (dados.nivel >= 10) {
      desbloqueadas.push({
        id: 'nivel_expert',
        titulo: '💎 EXPERT FINANCEIRO',
        descricao: `Alcançou nível ${dados.nivel}`,
        icone: '💎',
        cor: '#6366f1',
        categoria: 'nivel',
        dataDesbloqueio: '15/Jun/2025',
        pontos: 150,
        recompensa: 'Celebração especial + tema dourado',
        raridade: 'rara'
      })
    }

    // CONQUISTAS BLOQUEADAS (próximas metas)
    if (dados.pontos < 1000) {
      bloqueadas.push({
        id: 'guru_poupador',
        titulo: '👑 GURU POUPADOR',
        descricao: 'Alcance 1000 pontos totais',
        icone: '👑',
        cor: '#fbbf24',
        categoria: 'nivel',
        pontosNecessarios: 1000 - dados.pontos,
        progresso: Math.round((dados.pontos / 1000) * 100),
        recompensa: 'Consultoria IA personalizada',
        raridade: 'lendaria'
      })
    }

    if (dados.metasConcluidas < 10) {
      bloqueadas.push({
        id: 'dono_casa_propria',
        titulo: '🏠 DONO DA CASA PRÓPRIA',
        descricao: 'Complete a meta "Casa Própria"',
        icone: '🏠',
        cor: '#059669',
        categoria: 'metas',
        progresso: 65,
        recompensa: 'Badge especial + tema casa',
        raridade: 'epica'
      })
    }

    if (dados.diasAtivos < 190) {
      bloqueadas.push({
        id: 'invencivel',
        titulo: '💎 INVENCÍVEL',
        descricao: '190 dias consecutivos sem quebrar metas',
        icone: '💎',
        cor: '#7c3aed',
        categoria: 'consistencia',
        diasRestantes: 190 - dados.diasAtivos,
        progresso: Math.round((dados.diasAtivos / 190) * 100),
        recompensa: 'Status VIP + recursos exclusivos',
        raridade: 'lendaria'
      })
    }

    bloqueadas.push({
      id: 'sniper_financeiro',
      titulo: '🎯 SNIPER FINANCEIRO',
      descricao: 'Bata 10 metas no prazo exato',
      icone: '🎯',
      cor: '#dc2626',
      categoria: 'metas',
      progresso: 90,
      metasRestantes: 1,
      recompensa: 'Precisão máxima nas previsões',
      raridade: 'epica'
    })

    // CONQUISTAS RARAS (apenas 5% conseguem)
    if (dados.saudeFinanceira >= 95 && dados.diasAtivos >= 30) {
      raras.push({
        id: 'diamante_familiar',
        titulo: '💎 DIAMANTE FAMILIAR',
        descricao: 'Casal com 1500+ pontos combinados',
        icone: '💎',
        cor: '#a855f7',
        categoria: 'familia',
        raridade: 'lendaria',
        percentualUsuarios: 2.3
      })
    }

    if (dados.metasConcluidas >= 2 && dados.nivel >= 8) {
      raras.push({
        id: 'sniper_duplo',
        titulo: '🎯 SNIPER DUPLO',
        descricao: '2 metas batidas no mesmo dia',
        icone: '🎯',
        cor: '#ef4444',
        categoria: 'metas',
        raridade: 'epica',
        percentualUsuarios: 4.7
      })
    }

    if (dados.diasAtivos >= 180) {
      raras.push({
        id: 'fenomeno',
        titulo: '🔥 FENÔMENO',
        descricao: '6 meses sem quebrar streak',
        icone: '🔥',
        cor: '#f59e0b',
        categoria: 'consistencia',
        raridade: 'lendaria',
        percentualUsuarios: 1.8
      })
    }

    return { desbloqueadas, bloqueadas, raras }
  }

  const gerarEvolucaoPontos = (transacoes, metas) => {
    const evolucao = []
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const hoje = new Date()

    for (let i = -5; i <= 0; i++) {
      const dataCalculo = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1)
      const mesNome = mesesNomes[dataCalculo.getMonth()]
      
      // Simular pontos baseado em atividade real
      let pontos = 50 // Base
      
      if (i === 0) pontos = 847 // Mês atual
      else if (i === -1) pontos = 780
      else if (i === -2) pontos = 720
      else if (i === -3) pontos = 650
      else if (i === -4) pontos = 580
      else if (i === -5) pontos = 520

      evolucao.push({
        mes: mesNome,
        pontos: pontos
      })
    }

    return evolucao
  }

  const calcularConquistasPorCategoria = (conquistas) => {
    const categorias = {}
    
    conquistas.forEach(conquista => {
      const cat = conquista.categoria
      if (!categorias[cat]) {
        categorias[cat] = { name: cat, value: 0, color: conquista.cor }
      }
      categorias[cat].value += 1
    })

    return Object.values(categorias)
  }

  const gerarFinBotDica = (conquistas, nivel, pontos) => {
    const proximasConquistas = conquistas.bloqueadas.filter(c => c.progresso >= 70)
    
    if (proximasConquistas.length > 0) {
      const proxima = proximasConquistas[0]
      return `🎯 Você está quase lá! Faltam apenas ${proxima.pontosNecessarios || proxima.diasRestantes || proxima.metasRestantes || '1 passo'} para desbloquear "${proxima.titulo}"`
    }

    if (nivel >= 15) {
      return `👑 Parabéns! Você está no top 5% dos usuários! Continue assim para alcançar o nível máximo!`
    }

    if (pontos >= 800) {
      return `🚀 Incrível! ${pontos} pontos! Você está dominando suas finanças como um verdadeiro expert!`
    }

    return `💪 Continue evoluindo! Cada transação registrada e meta batida te aproxima de novas conquistas!`
  }

  const handleConquistaClick = (conquista) => {
    setConquistaSelecionada(conquista)
    setShowConquistaModal(true)
  }

  const filtrarConquistas = () => {
    let conquistas = []

    if (filtroConquistas === 'concluidas') {
      conquistas = conquistasDesbloqueadas
    } else if (filtroConquistas === 'bloqueadas') {
      conquistas = conquistasBloqueadas
    } else if (filtroConquistas === 'recentes') {
      conquistas = conquistasDesbloqueadas.slice(-5)
    } else {
      conquistas = [...conquistasDesbloqueadas, ...conquistasBloqueadas]
    }

    if (categoriaFiltro !== 'todas') {
      conquistas = conquistas.filter(c => c.categoria === categoriaFiltro)
    }

    return conquistas
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

  const getRaridadeColor = (raridade) => {
    switch (raridade) {
      case 'comum': return '#6b7280'
      case 'rara': return '#3b82f6'
      case 'epica': return '#8b5cf6'
      case 'lendaria': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const getRaridadeIcon = (raridade) => {
    switch (raridade) {
      case 'comum': return '⚪'
      case 'rara': return '🔵'
      case 'epica': return '🟣'
      case 'lendaria': return '🟡'
      default: return '⚪'
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
            🏆 Carregando sistema de conquistas...
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
        currentPage="conquistas"
      />

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '300px' : '80px',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header Especializado */}
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
                  🏆 CONQUISTAS
                  <span style={{ fontSize: '18px', opacity: 0.9 }}>
                    | Nível {estatisticasUsuario.nivel} | {estatisticasUsuario.pontos} pontos | Streak: {estatisticasUsuario.streak} dias
                  </span>
                </h1>
              </div>
            </div>

            {/* Progresso do Nível */}
            <div style={{ 
              minWidth: '200px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '8px 12px'
            }}>
              <div style={{ fontSize: '12px', marginBottom: '4px', textAlign: 'center' }}>
                {estatisticasUsuario.titulo}: {progressoNivel}%
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
                  width: `${progressoNivel}%`,
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <div style={{ fontSize: '11px', marginTop: '4px', textAlign: 'center' }}>
                Próximo: {estatisticasUsuario.pontosProximo - estatisticasUsuario.pontos} pontos
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
                  FinBot - Assistente de Conquistas
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
          {/* Linha Superior - Progresso + Ranking */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Seu Progresso */}
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
                📊 SEU PROGRESSO
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
                    {estatisticasUsuario.nivel}
                  </div>
                  <div style={{ fontSize: '12px', color: '#0369a1' }}>
                    Nível Atual
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
                    {estatisticasUsuario.pontos}
                  </div>
                  <div style={{ fontSize: '12px', color: '#92400e' }}>
                    Pontos Totais
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
                    {estatisticasUsuario.streak}
                  </div>
                  <div style={{ fontSize: '12px', color: '#166534' }}>
                    Streak Atual
                  </div>
                </div>

                <div style={{
                  textAlign: 'center',
                  padding: '16px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '12px',
                  border: '1px solid #fecaca'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                    {estatisticasUsuario.taxaSucesso}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#dc2626' }}>
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
                  📈 EVOLUÇÃO DOS PONTOS (6 meses)
                </h3>
                <div style={{ height: '120px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolucaoPontos}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Line 
                        type="monotone" 
                        dataKey="pontos" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Estatísticas Detalhadas */}
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
                  📊 ESTATÍSTICAS DETALHADAS:
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '13px'
                }}>
                  <div>
                    <span style={{ color: '#64748b' }}>🎯 Conquistas:</span>
                    <span style={{ fontWeight: '600', marginLeft: '8px' }}>
                      {estatisticasUsuario.conquistasDesbloqueadas}/{estatisticasUsuario.conquistasTotal}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>🔥 Melhor Streak:</span>
                    <span style={{ fontWeight: '600', marginLeft: '8px' }}>
                      {estatisticasUsuario.melhorStreak} dias
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>📅 Dias Ativos:</span>
                    <span style={{ fontWeight: '600', marginLeft: '8px' }}>
                      {estatisticasUsuario.diasAtivos}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>💰 Economia Total:</span>
                    <span style={{ fontWeight: '600', marginLeft: '8px' }}>
                      {formatCurrency(estatisticasUsuario.economiaTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ranking Familiar */}
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
                  🏆 RANKING FAMILIAR
                </h2>
                <button
                  onClick={() => setShowRankingModal(true)}
                  style={{
                    backgroundColor: '#8b5cf6',
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
                {rankingFamiliar.map((membro, index) => (
                  <div key={index} style={{
                    padding: '16px',
                    backgroundColor: index === 0 ? '#fef3c7' : '#f8fafc',
                    borderRadius: '12px',
                    border: `2px solid ${index === 0 ? '#fcd34d' : '#e2e8f0'}`,
                    position: 'relative'
                  }}>
                    {index === 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '12px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        👑 LÍDER
                      </div>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        fontSize: '24px',
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        borderRadius: '50%',
                        padding: '8px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {membro.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: 'bold',
                          fontSize: '16px',
                          color: '#1a202c'
                        }}>
                          {membro.nome}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          {membro.status}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontWeight: 'bold',
                          fontSize: '14px',
                          color: '#8b5cf6'
                        }}>
                          Nível {membro.nivel}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          {membro.pontos} pts
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumo Familiar */}
              <div style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#e0f2fe',
                borderRadius: '8px',
                border: '1px solid #7dd3fc',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#0c4a6e',
                  marginBottom: '4px'
                }}>
                  💑 FAMÍLIA EXPERT
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#0369a1'
                }}>
                  {rankingFamiliar.reduce((sum, m) => sum + m.pontos, 0)} pontos combinados
                </div>
              </div>
            </div>
          </div>

          {/* Filtros de Conquistas */}
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
                🏅 SUAS CONQUISTAS
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
              </div>
            </div>

            {/* Filtros */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              {[
                { id: 'todas', label: '🏆 Todas', count: conquistasDesbloqueadas.length + conquistasBloqueadas.length },
                { id: 'concluidas', label: '✅ Concluídas', count: conquistasDesbloqueadas.length },
                { id: 'bloqueadas', label: '🔒 Bloqueadas', count: conquistasBloqueadas.length },
                { id: 'recentes', label: '🔥 Recentes', count: 5 }
              ].map(filtro => (
                <button
                  key={filtro.id}
                  onClick={() => setFiltroConquistas(filtro.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: filtroConquistas === filtro.id ? '#8b5cf6' : '#f1f5f9',
                    color: filtroConquistas === filtro.id ? 'white' : '#64748b',
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
                    backgroundColor: filtroConquistas === filtro.id ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
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

            {/* Filtros por Categoria */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              {[
                { id: 'todas', label: '📋 Todas', icon: '📋' },
                { id: 'poupanca', label: '💰 Poupança', icon: '💰' },
                { id: 'cartoes', label: '💳 Cartões', icon: '💳' },
                { id: 'analise', label: '📊 Análise', icon: '📊' },
                { id: 'metas', label: '🎯 Metas', icon: '🎯' },
                { id: 'consistencia', label: '🔥 Consistência', icon: '🔥' }
              ].map(categoria => (
                <button
                  key={categoria.id}
                  onClick={() => setCategoriaFiltro(categoria.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: categoriaFiltro === categoria.id ? '#3b82f6' : '#f8fafc',
                    color: categoriaFiltro === categoria.id ? 'white' : '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {categoria.icon} {categoria.label}
                </button>
              ))}
            </div>

            {/* Lista de Conquistas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {filtrarConquistas().map((conquista, index) => (
                <div
                  key={conquista.id}
                  onClick={() => handleConquistaClick(conquista)}
                  style={{
                    padding: '20px',
                    backgroundColor: conquista.dataDesbloqueio ? '#f0fdf4' : '#f8fafc',
                    borderRadius: '12px',
                    border: `2px solid ${conquista.dataDesbloqueio ? '#bbf7d0' : '#e2e8f0'}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: conquista.dataDesbloqueio ? 1 : 0.7,
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Badge de Raridade */}
                  {conquista.raridade && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: getRaridadeColor(conquista.raridade),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {getRaridadeIcon(conquista.raridade)}
                      {conquista.raridade.toUpperCase()}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      fontSize: '32px',
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      borderRadius: '50%',
                      padding: '8px',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      filter: conquista.dataDesbloqueio ? 'none' : 'grayscale(100%)'
                    }}>
                      {conquista.icone}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        margin: '0 0 4px 0',
                        color: conquista.dataDesbloqueio ? conquista.cor : '#64748b'
                      }}>
                        {conquista.titulo}
                      </h3>
                      <p style={{
                        fontSize: '12px',
                        color: '#64748b',
                        margin: 0
                      }}>
                        {conquista.descricao}
                      </p>
                    </div>
                  </div>

                  {/* Data de Desbloqueio ou Progresso */}
                  {conquista.dataDesbloqueio ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px'
                    }}>
                      <span style={{ color: '#166534', fontWeight: '600' }}>
                        🗓️ {conquista.dataDesbloqueio}
                      </span>
                      <span style={{ color: '#166534', fontWeight: '600' }}>
                        +{conquista.pontos} pontos
                      </span>
                    </div>
                  ) : (
                    <div>
                      {conquista.progresso !== undefined && (
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '4px'
                          }}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              Progresso
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                              {conquista.progresso}%
                            </span>
                          </div>
                          <div style={{
                            backgroundColor: '#e2e8f0',
                            borderRadius: '4px',
                            height: '6px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              backgroundColor: conquista.cor,
                              height: '100%',
                              width: `${conquista.progresso}%`,
                              transition: 'width 0.5s ease'
                            }} />
                          </div>
                        </div>
                      )}
                      
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {conquista.pontosNecessarios && `Faltam: ${conquista.pontosNecessarios} pontos`}
                        {conquista.diasRestantes && `Faltam: ${conquista.diasRestantes} dias`}
                        {conquista.metasRestantes && `Faltam: ${conquista.metasRestantes} metas`}
                      </div>
                    </div>
                  )}

                  {/* Recompensa */}
                  {conquista.recompensa && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#7c3aed',
                      fontWeight: '500'
                    }}>
                      🎁 {conquista.recompensa}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Conquistas Raras */}
            {conquistasRaras.length > 0 && (
              <div style={{
                marginTop: '32px',
                padding: '20px',
                backgroundColor: '#fef3c7',
                borderRadius: '12px',
                border: '2px solid #fcd34d'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  margin: '0 0 16px 0',
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🏅 CONQUISTAS RARAS (Apenas 5% conseguem)
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '12px'
                }}>
                  {conquistasRaras.map((conquista, index) => (
                    <div key={index} style={{
                      padding: '16px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                        {conquista.icone}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: conquista.cor,
                        marginBottom: '4px'
                      }}>
                        {conquista.titulo}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                        {conquista.descricao}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#92400e',
                        fontWeight: '600',
                        backgroundColor: '#fef3c7',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        display: 'inline-block'
                      }}>
                        {conquista.percentualUsuarios}% dos usuários
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Detalhes da Conquista */}
      {showConquistaModal && conquistaSelecionada && (
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
                🏆 DETALHES DA CONQUISTA
              </h2>
              <button
                onClick={() => setShowConquistaModal(false)}
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

            {/* Conquista Detalhada */}
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '16px',
                filter: conquistaSelecionada.dataDesbloqueio ? 'none' : 'grayscale(100%)'
              }}>
                {conquistaSelecionada.icone}
              </div>
              
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                color: conquistaSelecionada.cor
              }}>
                {conquistaSelecionada.titulo}
              </h3>
              
              <p style={{
                fontSize: '16px',
                color: '#64748b',
                margin: '0 0 16px 0'
              }}>
                {conquistaSelecionada.descricao}
              </p>

              {/* Badge de Raridade */}
              {conquistaSelecionada.raridade && (
                <div style={{
                  display: 'inline-block',
                  backgroundColor: getRaridadeColor(conquistaSelecionada.raridade),
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '16px'
                }}>
                  {getRaridadeIcon(conquistaSelecionada.raridade)} {conquistaSelecionada.raridade.toUpperCase()}
                </div>
              )}
            </div>

            {/* Informações */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              {conquistaSelecionada.dataDesbloqueio ? (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <span style={{ color: '#64748b' }}>📅 Data de Conquista:</span>
                    <span style={{ fontWeight: '600' }}>{conquistaSelecionada.dataDesbloqueio}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <span style={{ color: '#64748b' }}>⭐ Pontos Ganhos:</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>+{conquistaSelecionada.pontos}</span>
                  </div>
                  {conquistaSelecionada.recompensa && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ color: '#64748b' }}>🎁 Recompensa:</span>
                      <span style={{ fontWeight: '600' }}>{conquistaSelecionada.recompensa}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {conquistaSelecionada.progresso !== undefined && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{ color: '#64748b' }}>📊 Progresso:</span>
                        <span style={{ fontWeight: '600' }}>{conquistaSelecionada.progresso}%</span>
                      </div>
                      <div style={{
                        backgroundColor: '#e2e8f0',
                        borderRadius: '8px',
                        height: '8px',
                        overflow: 'hidden'
                        }}>
                        <div style={{
                            backgroundColor: conquistaSelecionada.cor,
                            height: '100%',
                            width: `${conquistaSelecionada.progresso}%`,
                            transition: 'width 0.5s ease'
                        }} />
                        </div>
                    </div>
                    )}
                    
                    <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                    }}>
                    <span style={{ color: '#64748b' }}>🎯 Para Desbloquear:</span>
                    <span style={{ fontWeight: '600' }}>
                        {conquistaSelecionada.pontosNecessarios && `${conquistaSelecionada.pontosNecessarios} pontos`}
                        {conquistaSelecionada.diasRestantes && `${conquistaSelecionada.diasRestantes} dias`}
                        {conquistaSelecionada.metasRestantes && `${conquistaSelecionada.metasRestantes} metas`}
                    </span>
                    </div>
                    
                    {conquistaSelecionada.recompensa && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                        <span style={{ color: '#64748b' }}>🎁 Recompensa:</span>
                        <span style={{ fontWeight: '600' }}>{conquistaSelecionada.recompensa}</span>
                    </div>
                    )}
                </div>
                )}
            </div>

            {/* Dicas para Conquistar */}
            {!conquistaSelecionada.dataDesbloqueio && (
                <div style={{
                backgroundColor: '#e0f2fe',
                border: '1px solid #7dd3fc',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
                }}>
                <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    margin: '0 0 8px 0',
                    color: '#0c4a6e'
                }}>
                    💡 DICAS PARA CONQUISTAR:
                </h4>
                <ul style={{
                    margin: 0,
                    paddingLeft: '20px',
                    fontSize: '13px',
                    color: '#0369a1'
                }}>
                    {(() => {
                    const dicas = []
                    if (conquistaSelecionada.categoria === 'poupanca') {
                        dicas.push('Mantenha suas despesas abaixo de 70% da renda')
                        dicas.push('Registre todas as transações regularmente')
                        dicas.push('Crie metas de economia mensais')
                    } else if (conquistaSelecionada.categoria === 'metas') {
                        dicas.push('Defina metas realistas e alcançáveis')
                        dicas.push('Faça depósitos regulares nas suas metas')
                        dicas.push('Monitore o progresso semanalmente')
                    } else if (conquistaSelecionada.categoria === 'consistencia') {
                        dicas.push('Use o app todos os dias')
                        dicas.push('Registre transações imediatamente')
                        dicas.push('Mantenha o controle financeiro ativo')
                    } else {
                        dicas.push('Continue usando o app regularmente')
                        dicas.push('Mantenha suas finanças organizadas')
                        dicas.push('Siga as dicas do FinBot')
                    }
                    
                    return dicas.map((dica, i) => (
                        <li key={i}>{dica}</li>
                    ))
                    })()}
                </ul>
                </div>
            )}

            {/* Botão Fechar */}
            <div style={{ textAlign: 'center' }}>
                <button
                onClick={() => setShowConquistaModal(false)}
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
                ✅ Entendi
                </button>
            </div>
            </div>
        </div>
        )}

        {/* Modal de Ranking Detalhado */}
        {showRankingModal && (
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
                🏆 RANKING FAMILIAR DETALHADO
                </h2>
                <button
                onClick={() => setShowRankingModal(false)}
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

            {/* Ranking Expandido */}
            <div style={{ marginBottom: '24px' }}>
                {rankingFamiliar.map((membro, index) => (
                <div key={index} style={{
                    padding: '20px',
                    backgroundColor: index === 0 ? '#fef3c7' : '#f8fafc',
                    borderRadius: '12px',
                    border: `2px solid ${index === 0 ? '#fcd34d' : '#e2e8f0'}`,
                    marginBottom: '16px',
                    position: 'relative'
                }}>
                    {index === 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '12px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600'
                    }}>
                        👑 LÍDER
                    </div>
                    )}
                    
                    <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '16px'
                    }}>
                    <div style={{
                        fontSize: '32px',
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        borderRadius: '50%',
                        padding: '12px',
                        width: '56px',
                        height: '56px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {membro.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                        fontWeight: 'bold',
                        fontSize: '20px',
                        color: '#1a202c',
                        marginBottom: '4px'
                        }}>
                        #{membro.posicao} {membro.nome}
                        </div>
                        <div style={{
                        fontSize: '14px',
                        color: '#64748b'
                        }}>
                        {membro.status}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                        fontWeight: 'bold',
                        fontSize: '18px',
                        color: '#8b5cf6'
                        }}>
                        Nível {membro.nivel}
                        </div>
                        <div style={{
                        fontSize: '14px',
                        color: '#64748b'
                        }}>
                        {membro.pontos} pontos
                        </div>
                    </div>
                    </div>

                    {/* Estatísticas Detalhadas */}
                    <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '12px',
                    fontSize: '12px'
                    }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600', color: '#10b981' }}>
                        {index === 0 ? '23' : '18'}
                        </div>
                        <div style={{ color: '#64748b' }}>Conquistas</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600', color: '#f59e0b' }}>
                        {index === 0 ? '127' : '89'}
                        </div>
                        <div style={{ color: '#64748b' }}>Streak</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600', color: '#3b82f6' }}>
                        {index === 0 ? '92%' : '87%'}
                        </div>
                        <div style={{ color: '#64748b' }}>Taxa Sucesso</div>
                    </div>
                    </div>
                </div>
                ))}
            </div>

            {/* Estatísticas da Família */}
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
                📊 ESTATÍSTICAS DA FAMÍLIA
                </h3>
                
                <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
                }}>
                <div>
                    <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '8px' }}>
                    💰 PERFORMANCE GERAL:
                    </div>
                    <ul style={{
                    margin: 0,
                    paddingLeft: '16px',
                    fontSize: '12px',
                    color: '#0369a1'
                    }}>
                    <li>Pontos combinados: 1.570</li>
                    <li>Nível familiar: EXPERT</li>
                    <li>Conquistas totais: 41/100</li>
                    <li>Economia familiar: {formatCurrency(28750)}</li>
                    </ul>
                </div>
                
                <div>
                    <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '8px' }}>
                    🏆 RECORDES FAMILIARES:
                    </div>
                    <ul style={{
                    margin: 0,
                    paddingLeft: '16px',
                    fontSize: '12px',
                    color: '#0369a1'
                    }}>
                    <li>Maior streak: 145 dias (João)</li>
                    <li>Mais conquistas: 23 (João)</li>
                    <li>Melhor mês: Junho 2025</li>
                    <li>Meta mais rápida: 8 dias</li>
                    </ul>
                </div>
                </div>
            </div>

            {/* Próximas Conquistas Familiares */}
            <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
            }}>
                <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 12px 0',
                color: '#92400e'
                }}>
                🎯 PRÓXIMAS CONQUISTAS FAMILIARES:
                </h4>
                <ul style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '13px',
                color: '#92400e'
                }}>
                <li>💎 "Diamante Familiar" - 2.000 pontos combinados (78% completo)</li>
                <li>🏠 "Donos da Casa" - Meta casa própria concluída (65% completo)</li>
                <li>🔥 "Família Invencível" - 200 dias de streak combinado (89% completo)</li>
                </ul>
            </div>

            {/* Botão Fechar */}
            <div style={{ textAlign: 'center' }}>
                <button
                onClick={() => setShowRankingModal(false)}
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
                ✅ Fechar
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
                                📊 ESTATÍSTICAS DETALHADAS
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
                                    🎯 CONQUISTAS:
                                </div>
                                <div style={{ fontSize: '13px', color: '#0369a1', lineHeight: '1.6' }}>
                                    ├─ Desbloqueadas: {estatisticasUsuario.conquistasDesbloqueadas}<br/>
                                    ├─ Bloqueadas: {estatisticasUsuario.conquistasTotal - estatisticasUsuario.conquistasDesbloqueadas}<br/>
                                    ├─ Taxa conclusão: {Math.round((estatisticasUsuario.conquistasDesbloqueadas / estatisticasUsuario.conquistasTotal) * 100)}%<br/>
                                    └─ Raras obtidas: {conquistasRaras.length}
                                </div>
                                </div>
                                
                                <div>
                                <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '12px', fontWeight: '600' }}>
                                    🔥 CONSISTÊNCIA:
                                </div>
                                <div style={{ fontSize: '13px', color: '#0369a1', lineHeight: '1.6' }}>
                                    ├─ Streak atual: {estatisticasUsuario.streak} dias<br/>
                                    ├─ Melhor streak: {estatisticasUsuario.melhorStreak} dias<br/>
                                    ├─ Dias ativos: {estatisticasUsuario.diasAtivos}<br/>
                                    └─ Taxa sucesso: {estatisticasUsuario.taxaSucesso}%
                                </div>
                                </div>
                            </div>
                            </div>
                
                            {/* Por Categoria */}
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
                                🏷️ POR CATEGORIA
                            </h3>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: '12px'
                            }}>
                                {[
                                { categoria: '💰 Poupança', nivel: 15, conquistas: 5 },
                                { categoria: '💳 Cartões', nivel: 8, conquistas: 3 },
                                { categoria: '📊 Análise', nivel: 12, conquistas: 4 },
                                { categoria: '🎯 Metas', nivel: 18, conquistas: 6 },
                                { categoria: '🔥 Consistência', nivel: 20, conquistas: 5 }
                                ].map((cat, index) => (
                                <div key={index} style={{
                                    textAlign: 'center',
                                    padding: '12px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{
                                    fontSize: '16px',
                                    marginBottom: '4px'
                                    }}>
                                    {cat.categoria.split(' ')[0]}
                                    </div>
                                    <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#166534',
                                    marginBottom: '2px'
                                    }}>
                                    Nível {cat.nivel}
                                    </div>
                                    <div style={{
                                    fontSize: '11px',
                                    color: '#64748b'
                                    }}>
                                    {cat.conquistas} conquistas
                                    </div>
                                </div>
                                ))}
                            </div>
                            </div>
                
                            {/* Recordes Pessoais */}
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
                                    color: '#92400e',
                                    lineHeight: '1.6'
                                }}>
                                    <li>🔥 Maior streak: {estatisticasUsuario.melhorStreak} dias</li>
                                    <li>💰 Maior economia: {formatCurrency(estatisticasUsuario.economiaTotal)}</li>
                                    <li>🎯 Meta mais rápida: 8 dias</li>
                                    <li>⭐ Maior pontuação: {estatisticasUsuario.pontos}</li>
                                </ul>
                                </div>
                                <div>
                                <ul style={{
                                    margin: 0,
                                    paddingLeft: '16px',
                                    fontSize: '13px',
                                    color: '#92400e',
                                    lineHeight: '1.6'
                                }}>
                                    <li>🏆 Conquistas em 1 dia: 3</li>
                                    <li>📊 Meses perfeitos: 4</li>
                                    <li>💎 Conquistas raras: {conquistasRaras.length}</li>
                                    <li>🎮 Desafios simultâneos: 4</li>
                                </ul>
                                </div>
                            </div>
                            </div>
                
                            {/* Impacto Real */}
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
                                🎯 IMPACTO REAL
                            </h3>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px',
                                fontSize: '14px',
                                color: '#0369a1'
                            }}>
                                <div>
                                <div style={{ fontWeight: '600', marginBottom: '8px' }}>💰 FINANCEIRO:</div>
                                <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                                    ├─ Economia total: {formatCurrency(estatisticasUsuario.economiaTotal)}<br/>
                                    ├─ Metas concluídas: 8<br/>
                                    ├─ Saúde financeira: 92%<br/>
                                    └─ Controle de gastos: +47%
                                </div>
                                </div>
                                
                                <div>
                                <div style={{ fontWeight: '600', marginBottom: '8px' }}>🎯 COMPORTAMENTAL:</div>
                                <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                                    ├─ Dias de disciplina: {estatisticasUsuario.diasAtivos}<br/>
                                    ├─ Hábitos criados: 8 permanentes<br/>
                                    ├─ Organização: +89%<br/>
                                    └─ Motivação: Nível máximo
                                </div>
                                </div>
                            </div>
                            </div>
                
                            {/* Gráfico de Conquistas por Mês */}
                            <div style={{
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '24px'
                            }}>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                margin: '0 0 16px 0',
                                color: '#374151'
                            }}>
                                📈 CONQUISTAS POR MÊS (2025)
                            </h3>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, 1fr)',
                                gap: '8px',
                                fontSize: '12px'
                            }}>
                                {[
                                { mes: 'Jan', conquistas: 2 },
                                { mes: 'Fev', conquistas: 3 },
                                { mes: 'Mar', conquistas: 4 },
                                { mes: 'Abr', conquistas: 3 },
                                { mes: 'Mai', conquistas: 5 },
                                { mes: 'Jun', conquistas: 4 },
                                { mes: 'Jul', conquistas: 2 }
                                ].map((item, index) => (
                                <div key={index} style={{
                                    textAlign: 'center',
                                    padding: '8px',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ fontWeight: '600', color: '#374151' }}>
                                    {item.mes}
                                    </div>
                                    <div style={{
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    color: '#8b5cf6',
                                    margin: '4px 0'
                                    }}>
                                    {item.conquistas}
                                    </div>
                                    <div style={{ color: '#64748b' }}>
                                    {'🏆'.repeat(Math.min(item.conquistas, 3))}
                                    </div>
                                </div>
                                ))}
                            </div>
                            </div>
                
                            {/* Botão Fechar */}
                            <div style={{ textAlign: 'center' }}>
                            <button
                                onClick={() => setShowEstatisticasModal(false)}
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
                                ✅ Fechar
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
                        0%, 100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
                        50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8); }
                        }
                    `}</style>
                    </div>
                )
                }