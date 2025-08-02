'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine } from 'recharts'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardRevolucionario() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modoCosal, setModoCosal] = useState(false)
  const [animatedValues, setAnimatedValues] = useState({
    receita: 0,
    despesas: 0,
    faturas: 0,
    saldo: 0,
    economia: 0
  })

  // Estados para dados da família
  const [dadosFamilia, setDadosFamilia] = useState({
    nome: "",
    rendaTotal: 0,
    nivel: 1,
    tituloNivel: "CARREGANDO...",
    familia: null, // Nova estrutura para família
    membros: [], // Array de membros da família
    saudeFinanceira: 0,
    rendaComprometida: 0,
    rendaLivre: 100,
    economiaMedia: 0,
    diasAtivos: 0
  })

  const [cardsData, setCardsData] = useState({
    receita: { valor: 0, status: "⏳ Carregando...", emoji: "💰" },
    despesas: { valor: 0, percentualOrcado: 0, emoji: "💸" },
    faturas: { valor: 0, percentualRenda: 0, emoji: "💳", alerta: "" },
    saldo: { valor: 0, situacao: "⏳ Calculando...", emoji: "🔮" }
  })

  const [proximosEventos, setProximosEventos] = useState([])

  const [finBotDica, setFinBotDica] = useState("Carregando análise inteligente...")

  const [desafioSemanal, setDesafioSemanal] = useState({
    titulo: "🍕 SEMANA SEM DELIVERY",
    meta: "Carregando...",
    progresso: 0,
    diasCompletos: 0,
    totalDias: 7,
    progressoVoce: [],
    progressoEsposa: [],
    premio: "Carregando..."
  })

  const [fluxoCaixaData, setFluxoCaixaData] = useState([])

  const [cartoes, setCartoes] = useState([])

  const [categorias, setCategorias] = useState([])

  const [previsao12Meses, setPrevisao12Meses] = useState([])
  const [alertasInteligentes, setAlertasInteligentes] = useState([])
  const [conquistasUsuario, setConquistasUsuario] = useState([])
  const [calendarioOpen, setCalendarioOpen] = useState(false)

  const [notificacoesPermitidas, setNotificacoesPermitidas] = useState(false)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)

  // Carregar dados do usuário
  useEffect(() => {
    loadUserData()
  }, [])

  // Animação dos valores
useEffect(() => {
  const animateValues = () => {
    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setAnimatedValues({
        receita: Math.round(cardsData.receita.valor * progress),
        despesas: Math.round(cardsData.despesas.valor * progress),
        faturas: Math.round(cardsData.faturas.valor * progress),
        saldo: Math.round(cardsData.saldo.valor * progress),
        economia: Math.round(dadosFamilia.economiaMedia * progress * 100) / 100  // ✅ CORRIGIDO
      })

      if (currentStep >= steps) {
        clearInterval(interval)
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }

  // SÓ ANIMAR QUANDO OS DADOS REAIS ESTIVEREM CARREGADOS
  if (!loading && cardsData.receita.valor > 0) {
    setTimeout(animateValues, 500)
  }
}, [loading, cardsData, dadosFamilia])

// Verificar permissões de notificação e enviar alertas
useEffect(() => {
  // Verificar se já tem permissão
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      setNotificacoesPermitidas(true)
    } else if (Notification.permission === 'default') {
      // Mostrar prompt após 5 segundos
      setTimeout(() => {
        setShowNotificationPrompt(true)
      }, 5000)
    }
  }
  
  // Enviar notificações baseadas em dados reais
  if (!loading && dadosFamilia.rendaComprometida > 0) {
    setTimeout(() => {
      if (dadosFamilia.rendaComprometida > 70) {
        enviarNotificacaoInteligente(
          'alerta',
          'Situação Crítica!',
          `${dadosFamilia.rendaComprometida}% da renda comprometida. Evite novas compras.`
        )
      } else if (dadosFamilia.saudeFinanceira >= 80) {
        enviarNotificacaoInteligente(
          'sucesso',
          'Parabéns!',
          `Saúde financeira excelente: ${dadosFamilia.saudeFinanceira}%`
        )
      }
    }, 3000)
  }
}, [loading, dadosFamilia, notificacoesPermitidas])

const calcularDiasAtivos = async (userId, transacoes) => {
  if (!transacoes || transacoes.length === 0) return 0
  
  const hoje = new Date()  // ✅ ADICIONAR esta linha
  const ultimoMes = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate())
  
  // Contar dias únicos com transações no último mês
  const diasComTransacao = new Set(
    transacoes
      .filter(t => new Date(t.date) >= ultimoMes && t.status === 'confirmado')
      .map(t => new Date(t.date).toDateString())
  )
  
  return diasComTransacao.size
}

const solicitarPermissaoNotificacao = async () => {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      setNotificacoesPermitidas(true)
      setShowNotificationPrompt(false)
      
      // Enviar notificação de boas-vindas
      new Notification('🎉 FinançasFamília', {
        body: 'Notificações ativadas! Você receberá alertas importantes.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'welcome'
      })
      
      // Salvar preferência
      localStorage.setItem('notificationsEnabled', 'true')
    } else {
      setShowNotificationPrompt(false)
    }
  }
}

const enviarNotificacaoInteligente = (tipo, titulo, mensagem) => {
  if (notificacoesPermitidas && 'Notification' in window) {
    const icones = {
      alerta: '⚠️',
      sucesso: '✅',
      meta: '🎯',
      fatura: '💳'
    }
    
    new Notification(`${icones[tipo]} ${titulo}`, {
      body: mensagem,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: tipo,
      requireInteraction: tipo === 'alerta'
    })
  }
}

const loadUserData = async () => {
  try {
    const { auth, profiles, transactions, cards, goals, payrolls, previsaoFaturas, supabase } = await import('@/lib/supabase')
    
    const { user: currentUser } = await auth.getUser()
    if (!currentUser) {
      window.location.href = '/auth/login'
      return
    }
    
    setUser(currentUser)
    
    // 1. CARREGAR PERFIL REAL
    const { data: profileData } = await profiles.get(currentUser.id)
    if (profileData) {
      setProfile(profileData)
    } else {
      setProfile({ 
        name: currentUser.email?.split('@')[0] || 'Usuário',
        monthly_income: 0
      })
    }

    // 2. CARREGAR DADOS DA FAMÍLIA
    let familiaData = null
    let membrosData = []
    let rendaFamiliarTotal = profileData?.monthly_income || 0

    // Verificar se usuário pertence a uma família
    const { data: membroFamilia } = await supabase
      .from('family_members')
      .select(`
        *,
        families (
          id,
          name,
          created_at
        )
      `)
      .eq('user_id', currentUser.id)
      .single()

    if (membroFamilia?.families) {
      familiaData = membroFamilia.families
      
      // Buscar todos os membros da família
      const { data: todosMembros } = await supabase
        .from('family_members')
        .select(`
          *,
          profiles (
            id,
            name,
            email,
            monthly_income
          )
        `)
        .eq('family_id', familiaData.id)
      
      if (todosMembros) {
        membrosData = todosMembros
        rendaFamiliarTotal = todosMembros.reduce((total, membro) => {
          return total + (membro.profiles?.monthly_income || 0)
        }, 0)
      }
    }
    
    // 2. CALCULAR DATAS DO MÊS ATUAL
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
    
    // 3. CARREGAR TODAS AS TRANSAÇÕES
    const { data: todasTransacoes } = await transactions.getAll(currentUser.id)
    
    // 4. CALCULAR RECEITAS DO MÊS
    const receitasMes = (todasTransacoes || []).filter(t => 
      t.type === 'receita' && 
      t.date >= inicioMes && 
      t.date <= fimMes &&
      t.status === 'confirmado'
    )
    const totalReceitas = receitasMes.reduce((sum, r) => sum + (r.amount || 0), 0)
    
    // 5. CALCULAR DESPESAS DO MÊS
    const despesasMes = (todasTransacoes || []).filter(t => 
      t.type === 'despesa' && 
      t.date >= inicioMes && 
      t.date <= fimMes &&
      t.status === 'confirmado'
    )
    const totalDespesas = despesasMes.reduce((sum, d) => sum + (d.amount || 0), 0)
    
    // 6. CARREGAR CARTÕES REAIS
    const { data: cartoesData } = await cards.getAll(currentUser.id)
    
    // 7. CALCULAR FATURAS REAIS
    let totalFaturas = 0
    const cartoesComUso = []
    
    if (cartoesData && cartoesData.length > 0) {
      cartoesData.forEach(cartao => {
        // Calcular uso real do cartão
        const transacoesCartao = (todasTransacoes || []).filter(t => 
          t.card_id === cartao.id && 
          t.type === 'despesa' && 
          t.status === 'confirmado'
        )
        
        let usedAmount = 0
        transacoesCartao.forEach(t => {
          if (t.installments && t.installments > 1) {
            // Para parceladas, considerar parcelas restantes
            const parcelasRestantes = t.installments - ((t.installment_number || 1) - 1)
            usedAmount += ((t.amount / t.installments) * parcelasRestantes)
          } else {
            usedAmount += t.amount
          }
        })
        
        totalFaturas += usedAmount
        
        const usagePercentage = cartao.credit_limit > 0 ? 
          Math.round((usedAmount / cartao.credit_limit) * 100) : 0
        
        // Definir cor por banco
        let cor = '#6b7280'
        const nomeCartao = cartao.name.toLowerCase()
        if (nomeCartao.includes('nubank')) cor = '#8A2BE2'
        else if (nomeCartao.includes('santander')) cor = '#FF4500'
        else if (nomeCartao.includes('inter')) cor = '#FF8C00'
        else if (nomeCartao.includes('c6')) cor = '#32CD32'
        
        cartoesComUso.push({
          nome: cartao.name,
          usado: usedAmount,
          limite: cartao.credit_limit,
          percentual: usagePercentage,
          cor: cor
        })
      })
    }
    
    // 8. CALCULAR DADOS DA FAMÍLIA
    const rendaFamiliar = profileData?.monthly_income || 0
    
    // ✅ ADICIONAR LOGO APÓS:
    if (rendaFamiliar === 0) {
      setFinBotDica("⚠️ Configure sua renda mensal para cálculos automáticos!")
      setDadosFamilia(prev => ({
        ...prev,
        tituloNivel: "CONFIGURE SUA RENDA",
        nivel: 0
      }))
    }
    const saldoAtual = totalReceitas - totalDespesas
    const percentualComprometido = Math.round((totalFaturas / rendaFamiliar) * 100)
    const percentualLivre = 100 - percentualComprometido
    
    // Calcular saúde financeira baseada em critérios reais
    let saudeFinanceira = 100
    if (percentualComprometido > 70) saudeFinanceira = 25
    else if (percentualComprometido > 50) saudeFinanceira = 50
    else if (percentualComprometido > 30) saudeFinanceira = 75
    
    // Calcular nível baseado em múltiplos fatores
const fatores = {
  saudeFinanceira: saudeFinanceira,
  temMetas: false, // Será calculado se tiver metas ativas
  controlaGastos: 0, // +20 se não gastou com delivery
  temReserva: saldoAtual > (rendaFamiliarTotal * 0.1) ? 15 : 0, // +15 se tem reserva
  transacoesRegulares: (todasTransacoes || []).length > 10 ? 10 : 0 // +10 se tem histórico
}

// Buscar metas ativas
const { data: metasAtivas } = await supabase
  .from('goals')
  .select('*')
  .eq('user_id', currentUser.id)
  .eq('is_active', true)

fatores.temMetas = (metasAtivas && metasAtivas.length > 0) ? 25 : 0

const pontuacaoTotal = Object.values(fatores).reduce((sum, valor) => sum + valor, 0)

let nivel = Math.max(1, Math.min(10, Math.floor(pontuacaoTotal / 15)))
let tituloNivel = "INICIANTE"

if (nivel >= 9) tituloNivel = "MESTRE FINANCEIRO"
else if (nivel >= 7) tituloNivel = membrosData.length > 1 ? "CASAL EXPERT" : "EXPERT SOLO"
else if (nivel >= 5) tituloNivel = membrosData.length > 1 ? "CASAL ORGANIZADO" : "BOM CONTROLE"
else if (nivel >= 3) tituloNivel = "APRENDENDO"
    
    
    // 9. CALCULAR PRÓXIMOS EVENTOS REAIS
    const proximosEventosReais = []
    
    // Eventos de cartões
    if (cartoesData && cartoesData.length > 0) {
      cartoesData.forEach(cartao => {
        let proximoVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), cartao.due_day)
        if (proximoVencimento <= hoje) {
          proximoVencimento.setMonth(proximoVencimento.getMonth() + 1)
        }
        
        // Calcular valor da fatura atual
        const faturaCartao = (todasTransacoes || [])
          .filter(t => {
            const dataTransacao = new Date(t.date)
            return t.card_id === cartao.id && 
                  t.type === 'despesa' && 
                  t.status === 'confirmado' &&
                  dataTransacao.getMonth() === hoje.getMonth() &&
                  dataTransacao.getFullYear() === hoje.getFullYear()
          })
          .reduce((sum, t) => {
            if (t.installments > 1) {
              return sum + (t.amount / t.installments)
            }
            return sum + t.amount
          }, 0)
        
        if (faturaCartao > 0) {
          const parcelasAtivas = (todasTransacoes || [])
            .filter(t => t.card_id === cartao.id && t.installments > 1 && t.status === 'confirmado')
            .length
          
          proximosEventosReais.push({
            data: proximoVencimento.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            descricao: `💳 ${cartao.name}`,
            valor: faturaCartao,
            extra: parcelasAtivas > 0 ? `(${parcelasAtivas} parcelas ativas)` : "",
            tipo: "cartao",
            dataOrdem: proximoVencimento
          })
        }
      })
    }
    
    // Adicionar evento "hoje" se aplicável
    proximosEventosReais.forEach(evento => {
      const dataEvento = new Date(evento.dataOrdem)
      if (dataEvento.toDateString() === hoje.toDateString()) {
        evento.data = `Hoje - ${evento.data}`
      }
    })
    
    // Ordenar por data
    proximosEventosReais.sort((a, b) => a.dataOrdem - b.dataOrdem)
    
    // 10. CALCULAR TOP CATEGORIAS REAIS
    const categoriasGastos = {}
    despesasMes.forEach(despesa => {
      const categoriaNome = despesa.categories?.name || 'Outros'
      const categoriaIcon = despesa.categories?.icon || '📦'
      const categoriaColor = despesa.categories?.color || '#6b7280'
      
      if (!categoriasGastos[categoriaNome]) {
        categoriasGastos[categoriaNome] = {
          nome: `${categoriaIcon} ${categoriaNome}`,
          valor: 0,
          cor: categoriaColor
        }
      }
      categoriasGastos[categoriaNome].valor += despesa.amount
    })
    
    const categoriasArray = Object.values(categoriasGastos)
      .map(cat => ({
        ...cat,
        percentual: totalDespesas > 0 ? ((cat.valor / totalDespesas) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 3)
    
    // 11. GERAR FLUXO DE CAIXA REAL (últimos 6 meses)
    const fluxoReal = []
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    for (let i = -5; i <= 0; i++) {
      const dataCalculo = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1)
      const inicioMesCalc = new Date(dataCalculo.getFullYear(), dataCalculo.getMonth(), 1).toISOString().split('T')[0]
      const fimMesCalc = new Date(dataCalculo.getFullYear(), dataCalculo.getMonth() + 1, 0).toISOString().split('T')[0]
      
      const receitasMesCalc = (todasTransacoes || [])
        .filter(t => t.type === 'receita' && t.date >= inicioMesCalc && t.date <= fimMesCalc && t.status === 'confirmado')
        .reduce((sum, r) => sum + r.amount, 0)
      
      const despesasMesCalc = (todasTransacoes || [])
        .filter(t => t.type === 'despesa' && t.date >= inicioMesCalc && t.date <= fimMesCalc && t.status === 'confirmado')
        .reduce((sum, d) => sum + d.amount, 0)
      
      const saldoMes = receitasMesCalc - despesasMesCalc
      
      fluxoReal.push({
        mes: mesesNomes[dataCalculo.getMonth()],
        valor: Math.round(saldoMes)
      })
    }
    
    // 12. GERAR DESAFIO SEMANAL BASEADO EM DADOS REAIS
    const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()))
    const fimSemana = new Date(inicioSemana)
    fimSemana.setDate(inicioSemana.getDate() + 6)

    // Buscar gastos da semana atual
    const gastosDestaeSemana = (todasTransacoes || []).filter(t => {
      const dataTransacao = new Date(t.date)
      return t.type === 'despesa' && 
            dataTransacao >= inicioSemana && 
            dataTransacao <= fimSemana &&
            t.status === 'confirmado'
    })

    // Identificar gastos com delivery/fast-food
    const gastosDelivery = gastosDestaeSemana.filter(t => {
      const desc = t.description.toLowerCase()
      return desc.includes('delivery') || 
            desc.includes('ifood') || 
            desc.includes('uber') ||
            desc.includes('pizza') ||
            desc.includes('lanche') ||
            desc.includes('fast')
    })

    const valorGastoDelivery = gastosDelivery.reduce((sum, t) => sum + t.amount, 0)
    const metaEconomia = Math.max(100, valorGastoDelivery * 2) // Meta: economizar 2x o que gastou

    // Calcular dias sem delivery (baseado em transações reais)
    const diasComDelivery = new Set(
      gastosDelivery.map(t => new Date(t.date).toDateString())
    ).size

    const diasSemana = 7
    const diasSemDelivery = diasSemana - diasComDelivery
    const economiaDesafio = Math.max(100, valorGastoDelivery * 2)
    const diasCompletos = diasSemDelivery
    const progresso = Math.round((diasSemDelivery / diasSemana) * 100)
    
    // 13. GERAR FINBOT DICA INTELIGENTE
    let dicaInteligente = "Analisando seus dados financeiros..."
    if (percentualComprometido > 60) {
      dicaInteligente = `⚠️ Atenção! ${percentualComprometido}% da renda comprometida. Evite novas compras parceladas.`
    } else if (percentualComprometido > 40) {
      dicaInteligente = `🟡 Situação moderada com ${percentualComprometido}% comprometido. Monitore os gastos.`
    } else {
      dicaInteligente = `✅ Excelente controle! Apenas ${percentualComprometido}% da renda comprometida.`
    }
    
    // 13.1. CARREGAR PREVISÃO 12 MESES REAL
    const { data: previsaoReal } = await previsaoFaturas.calcularPrevisao12Meses(currentUser.id)
    const alertasReal = previsaoReal ? await previsaoFaturas.gerarAlertas(previsaoReal, rendaFamiliar) : []

    // 13.2. CARREGAR CONQUISTAS REAIS
    const conquistasReal = await calcularConquistasReais(currentUser.id, {
      saudeFinanceira,
      diasAtivos: await calcularDiasAtivos(currentUser.id, todasTransacoes),
      metasAtivas: metasAtivas?.length || 0,
      transacoesTotal: todasTransacoes?.length || 0
    })

    // 14. ATUALIZAR TODOS OS ESTADOS COM DADOS REAIS
    setDadosFamilia({
      nome: familiaData ? `FAMÍLIA ${familiaData.name.toUpperCase()}` : 
            profileData?.name ? `${profileData.name.toUpperCase()}` : 
            `${currentUser.email?.split('@')[0]?.toUpperCase() || 'USUÁRIO'}`,
      rendaTotal: rendaFamiliarTotal,
      nivel: nivel,
      tituloNivel: tituloNivel,
      familia: familiaData,
      membros: membrosData.map(m => ({
        id: m.profiles?.id,
        nome: m.profiles?.name || 'Membro',
        email: m.profiles?.email,
        renda: m.profiles?.monthly_income || 0,
        percentual: rendaFamiliarTotal > 0 ? 
          Math.round(((m.profiles?.monthly_income || 0) / rendaFamiliarTotal) * 100) : 0,
        role: m.role
      })),
      saudeFinanceira,
      rendaComprometida: percentualComprometido,
      rendaLivre: percentualLivre,
      economiaMedia: Math.max(0, saldoAtual / new Date().getDate()),
      diasAtivos: await calcularDiasAtivos(currentUser.id, todasTransacoes)
    })

    setCardsData({
      receita: { 
        valor: totalReceitas, 
        status: totalReceitas > 0 ? "✅ Confirmada" : "⏳ Pendente", 
        emoji: "💰" 
      },
      despesas: { 
        valor: totalDespesas, 
        percentualOrcado: Math.round((totalDespesas / (rendaFamiliar * 0.8)) * 100), 
        emoji: "💸" 
      },
      faturas: { 
        valor: totalFaturas, 
        percentualRenda: percentualComprometido, 
        emoji: "💳", 
        alerta: percentualComprometido > 50 ? "⚠️" : "" 
      },
      saldo: { 
        valor: saldoAtual, 
        situacao: saldoAtual > 1000 ? "🟢 Situação Boa" : saldoAtual > 0 ? "🟡 Atenção" : "🔴 Negativo", 
        emoji: "🔮" 
      }
    })

    setProximosEventos(proximosEventosReais.slice(0, 4))
    setCartoes(cartoesComUso)
    setCategorias(categoriasArray.length > 0 ? categoriasArray : [
      { nome: "📦 Sem dados", valor: 0, percentual: 0, cor: "#6b7280" }
    ])
    setFluxoCaixaData(fluxoReal)
    setFinBotDica(dicaInteligente)
    
    setDesafioSemanal({
      titulo: "🍕 SEMANA SEM DELIVERY",
      meta: `Economia potencial: ${formatCurrency(economiaDesafio)}`,
      progresso: progresso,
      diasCompletos: diasCompletos,
      totalDias: diasSemana,
      progressoVoce: Array(diasSemana).fill(false).map((_, i) => i < diasCompletos - 1),
      progressoEsposa: Array(diasSemana).fill(false).map((_, i) => i < diasCompletos),
      premio: `🏆 Prêmio: ${formatCurrency(economiaDesafio / 2)} cada um para gastos livres!`
    })

    setPrevisao12Meses(previsaoReal || [])
    setAlertasInteligentes(alertasReal || [])
    setConquistasUsuario(conquistasReal || [])

  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    setFinBotDica("Erro ao carregar dados. Tente recarregar a página.")
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

  const calcularConquistasReais = async (userId, dados) => {
    const conquistas = []
    
    // Conquista: Saúde Financeira
    if (dados.saudeFinanceira >= 80) {
      conquistas.push({
        id: 'saude_excelente',
        titulo: '🏆 SAÚDE FINANCEIRA EXCELENTE',
        descricao: 'Manteve saúde financeira acima de 80%',
        icone: '🏆',
        cor: '#10b981',
        desbloqueada: true
      })
    }
    
    // Conquista: Usuário Ativo
    if (dados.diasAtivos >= 15) {
      conquistas.push({
        id: 'usuario_ativo',
        titulo: '🔥 USUÁRIO SUPER ATIVO',
        descricao: `${dados.diasAtivos} dias com movimentação`,
        icone: '🔥',
        cor: '#f59e0b',
        desbloqueada: true
      })
    }
    
    // Conquista: Organizador
    if (dados.transacoesTotal >= 50) {
      conquistas.push({
        id: 'organizador',
        titulo: '📊 MESTRE DA ORGANIZAÇÃO',
        descricao: `${dados.transacoesTotal} transações registradas`,
        icone: '📊',
        cor: '#3b82f6',
        desbloqueada: true
      })
    }

    // Conquista: Controle de Gastos
    if (dados.saudeFinanceira >= 70 && dados.diasAtivos >= 10) {
      conquistas.push({
        id: 'controle_gastos',
        titulo: '💪 MESTRE DO CONTROLE',
        descricao: 'Excelente controle financeiro',
        icone: '💪',
        cor: '#8b5cf6',
        desbloqueada: true
      })
    }
    
    return conquistas
  }

  const getCorSaude = (percentual) => {
    if (percentual >= 70) return '#10B981' // Verde
    if (percentual >= 50) return '#F59E0B' // Amarelo
    return '#EF4444' // Vermelho
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
        {/* Sidebar Skeleton */}
        <div style={{
          width: '300px',
          backgroundColor: '#1a202c',
          position: 'fixed',
          height: '100vh',
          padding: '24px'
        }}>
          <div style={{
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            marginBottom: '32px',
            animation: 'shimmer 1.5s infinite'
          }} />
          
          {Array(8).fill(0).map((_, i) => (
            <div key={i} style={{
              height: '44px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              marginBottom: '8px',
              animation: `shimmer 1.5s infinite ${i * 0.1}s`
            }} />
          ))}
        </div>

        {/* Main Content Skeleton */}
        <main style={{ flex: 1, marginLeft: '300px' }}>
          {/* Header Skeleton */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px 32px',
            height: '140px'
          }}>
            <div style={{
              height: '32px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              marginBottom: '16px',
              animation: 'shimmer 1.5s infinite'
            }} />
            <div style={{
              height: '60px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              animation: 'shimmer 1.5s infinite 0.2s'
            }} />
          </div>

          {/* Content Skeleton */}
          <div style={{ padding: '32px' }}>
            {/* Resumo Skeleton */}
            <div style={{
              height: '120px',
              backgroundColor: 'white',
              borderRadius: '16px',
              marginBottom: '24px',
              animation: 'shimmer 1.5s infinite 0.3s'
            }} />

            {/* Cards Grid Skeleton */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '24px',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} style={{
                    height: '140px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    animation: `shimmer 1.5s infinite ${0.4 + i * 0.1}s`
                  }} />
                ))}
              </div>
              
              <div style={{
                height: '300px',
                backgroundColor: 'white',
                borderRadius: '16px',
                animation: 'shimmer 1.5s infinite 0.8s'
              }} />
            </div>

            {/* Bottom Grid Skeleton */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px'
            }}>
              {Array(4).fill(0).map((_, i) => (
                <div key={i} style={{
                  height: '250px',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  animation: `shimmer 1.5s infinite ${0.9 + i * 0.1}s`
                }} />
              ))}
            </div>
          </div>
        </main>

        {/* Loading Text */}
        <div style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          backgroundColor: 'rgba(139, 92, 246, 0.9)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          animation: 'pulse 2s infinite'
        }}>
          🚀 Carregando dashboard revolucionário...
        </div>

        {/* Skeleton CSS */}
        <style jsx>{`
          @keyframes shimmer {
            0% {
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
              background-size: 200px 100%;
              background-position: -200px 0;
            }
            100% {
              background-position: 200px 0;
            }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.02); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar Expandida */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        currentPage="dashboard"
      />

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '300px' : '80px',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header Familiar */}
        <header style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                  👨‍👩‍👧‍👦 {dadosFamilia.nome}
                  <span style={{ fontSize: '18px', opacity: 0.9 }}>
                    | 💰 {formatCurrency(dadosFamilia.rendaTotal)}
                    | 🏆 Nível {dadosFamilia.nivel} {dadosFamilia.tituloNivel}
                  </span>
                </h1>
                <div style={{ 
                  fontSize: '16px', 
                  opacity: 0.9,
                  marginTop: '4px'
                }}>
                  {dadosFamilia.membros.length > 0 ? (
                    dadosFamilia.membros.map((membro, index) => (
                      <span key={membro.id}>
                        {index > 0 && ' | '}
                        👤 {membro.nome}: {formatCurrency(membro.renda)} ({membro.percentual}%)
                      </span>
                    ))
                  ) : (
                    `💰 Renda: ${formatCurrency(dadosFamilia.rendaTotal)}`
                  )}
                </div>
              </div>
            </div>
          </div>
          
                    {/* FinBot Inteligente */}
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
                fontSize: '20px',
                animation: 'pulse 2s infinite'
              }}>
                🤖
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '14px' }}>
                  FinBot - Assistente Inteligente
                </p>
                
                {/* Dica Principal */}
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.5', opacity: 0.95 }}>
                  {finBotDica}
                </p>
                
                {/* Alertas Inteligentes */}
                {alertasInteligentes.length > 0 && (
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px',
                    marginTop: '8px'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', opacity: 0.9 }}>
                      💡 Insights Adicionais:
                    </div>
                    {alertasInteligentes.slice(0, 2).map((alerta, i) => (
                      <div key={i} style={{
                        fontSize: '11px',
                        opacity: 0.85,
                        marginBottom: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>{alerta.icone}</span>
                        <span>{alerta.sugestao || alerta.descricao}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Botões de Ação */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '8px'
                }}>
                  <button style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    color: 'white',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}>
                    💡 Mais Dicas
                  </button>
                  <button style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    color: 'white',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}>
                    🎯 Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Resumo Inteligente */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              alignItems: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                  🎯 SAÚDE FINANCEIRA
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: getCorSaude(dadosFamilia.saudeFinanceira)
                }}>
                  {dadosFamilia.saudeFinanceira}% 🟢
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                  💳 RENDA COMPROMETIDA
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#f59e0b'
                }}>
                  {dadosFamilia.rendaComprometida}%
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                  💰 RENDA LIVRE
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#10b981'
                }}>
                  {dadosFamilia.rendaLivre}%
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                  💰 ECONOMIZADO HOJE
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#10b981'
                }}>
                  {formatCurrency(animatedValues.economia)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  🔥 Ativo: {dadosFamilia.diasAtivos} dias!
                </div>
              </div>
            </div>
          </div>

          {/* Grid Principal */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Cards Principais */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              {/* Receita Mês */}
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>💰</span>
                  <div>
                    <h3 style={{ fontSize: '14px', opacity: 0.9, margin: 0, fontWeight: '500' }}>
                      RECEITA MÊS
                    </h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                      {formatCurrency(animatedValues.receita)}
                    </p>
                    <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>
                      {cardsData.receita.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Despesas Mês */}
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>💸</span>
                  <div>
                    <h3 style={{ fontSize: '14px', opacity: 0.9, margin: 0, fontWeight: '500' }}>
                      DESPESAS MÊS
                    </h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                      {formatCurrency(animatedValues.despesas)}
                    </p>
                    <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>
                      📊 {cardsData.despesas.percentualOrcado}% do orçado
                    </p>
                  </div>
                </div>
              </div>

              {/* Faturas Previstas */}
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>💳</span>
                  <div>
                    <h3 style={{ fontSize: '14px', opacity: 0.9, margin: 0, fontWeight: '500' }}>
                      FATURAS PREVISTAS
                    </h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                      {formatCurrency(animatedValues.faturas)}
                    </p>
                    <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>
                      ⚠️ {cardsData.faturas.percentualRenda}% da renda
                    </p>
                  </div>
                </div>
              </div>

                            {/* Crystal Ball */}
                            <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>🔮</span>
                  <div style={{ width: '100%' }}>
                    <h3 style={{ fontSize: '14px', opacity: 0.9, margin: 0, fontWeight: '500' }}>
                      CRYSTAL BALL
                    </h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                      {formatCurrency(animatedValues.saldo)}
                    </p>
                    <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>
                      {cardsData.saldo.situacao}
                    </p>
                    
                    {/* ✅ PREVISÃO INTELIGENTE: */}
                    {previsao12Meses.length > 0 && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        lineHeight: '1.3'
                      }}>
                        {(() => {
                          const proximoCritico = previsao12Meses.find(m => m.status === 'critico')
                          const proximoAlto = previsao12Meses.find(m => m.status === 'alto')
                          
                          if (proximoCritico) {
                            return `⚠️ ${proximoCritico.mesCompleto}: ${formatCurrency(proximoCritico.total)}`
                          } else if (proximoAlto) {
                            return `🟡 ${proximoAlto.mesCompleto}: ${formatCurrency(proximoAlto.total)}`
                          } else {
                            return `✅ Próximos 12 meses: Situação controlada`
                          }
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Próximos 7 Dias */}
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
                📅 PRÓXIMOS 7 DIAS
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {proximosEventos.map((evento, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      {evento.data}
                    </div>
                    <div style={{ fontWeight: '600', color: '#1a202c', marginBottom: '2px' }}>
                      {evento.descricao}: {formatCurrency(evento.valor)}
                    </div>
                    {evento.extra && (
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {evento.extra}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setCalendarioOpen(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginTop: '16px'
                }}
              >
                📅 Ver Calendário Completo
              </button>
            </div>
          </div>

          {/* Segunda linha */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Gráfico Fluxo Futuro */}
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
                📊 FLUXO DE CAIXA FUTURO
              </h2>
              
              <div style={{ height: '200px', marginBottom: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fluxoCaixaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  />
                  {/* ADICIONAR ESTA LINHA: */}
                  <ReferenceLine 
                    x="Jul" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{ 
                      value: "← Você está aqui", 
                      position: "topRight",
                      style: { fill: '#ef4444', fontWeight: 'bold', fontSize: '12px' }
                    }} 
                  />
                </LineChart>
              </ResponsiveContainer>
              </div>
              
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '13px',
                color: '#92400e'
              }}>
                🎯 <strong>Você está aqui (Jul)</strong> - Setembro será o mês mais apertado
              </div>
            </div>

            {/* Desafio da Semana */}
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
                margin: '0 0 16px 0',
                color: '#1a202c'
              }}>
                🎯 DESAFIO DA SEMANA
              </h2>
              
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #7dd3fc',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  margin: '0 0 8px 0',
                  color: '#0c4a6e'
                }}>
                  {desafioSemanal.titulo}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#0369a1',
                  margin: '0 0 12px 0'
                }}>
                  {desafioSemanal.meta}
                </p>
                
                {/* Barra de Progresso */}
                <div style={{
                  backgroundColor: '#e0e7ff',
                  borderRadius: '8px',
                  height: '8px',
                  marginBottom: '12px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    backgroundColor: '#3b82f6',
                    height: '100%',
                    width: `${desafioSemanal.progresso}%`,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e' }}>
                    {desafioSemanal.progresso}% ({desafioSemanal.diasCompletos}/{desafioSemanal.totalDias} dias)
                  </span>
                </div>
                
                {/* Progresso Individual */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      👨 Você
                    </div>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      {desafioSemanal.progressoVoce.map((completo, i) => (
                        <span key={i} style={{
                          fontSize: '16px',
                          opacity: completo ? 1 : 0.3
                        }}>
                          {completo ? '✅' : '❌'}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      👩 Esposa
                    </div>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      {desafioSemanal.progressoEsposa.map((completo, i) => (
                        <span key={i} style={{
                          fontSize: '16px',
                          opacity: completo ? 1 : 0.3
                        }}>
                          {completo ? '✅' : '❌'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#059669',
                  textAlign: 'center'
                }}>
                  {desafioSemanal.premio}
                </div>
              </div>
            </div>
          </div>

                    {/* ✅ NOVA SEÇÃO: PREVISÃO 12 MESES */}
                    {previsao12Meses.length > 0 && (
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
                🔮 PREVISÃO 12 MESES - FATURAS FUTURAS
              </h2>
              
              {/* Grid de Meses */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                {previsao12Meses.slice(0, 6).map((mes, index) => (
                  <div key={index} style={{
                    padding: '16px',
                    backgroundColor: mes.status === 'critico' ? '#fef2f2' : 
                                   mes.status === 'alto' ? '#fef3c7' : '#f0f9ff',
                    borderRadius: '12px',
                    border: `1px solid ${mes.status === 'critico' ? '#fecaca' : 
                                        mes.status === 'alto' ? '#fcd34d' : '#bfdbfe'}`,
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      marginBottom: '8px'
                    }}>
                      {mes.icone}
                    </div>
                    
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#1a202c',
                      marginBottom: '4px'
                    }}>
                      {mes.mes}
                    </div>
                    
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: mes.cor,
                      marginBottom: '4px'
                    }}>
                      {formatCurrency(mes.total)}
                    </div>
                    
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b'
                    }}>
                      {mes.percentualRenda}% da renda
                    </div>
                    
                    {mes.status === 'critico' && (
                      <div style={{
                        fontSize: '10px',
                        color: '#dc2626',
                        fontWeight: '600',
                        marginTop: '4px'
                      }}>
                        ⚠️ CRÍTICO
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Resumo dos Alertas */}
              {alertasInteligentes.length > 0 && (
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#92400e',
                    margin: '0 0 12px 0'
                  }}>
                    🚨 ALERTAS INTELIGENTES
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {alertasInteligentes.slice(0, 3).map((alerta, i) => (
                      <div key={i} style={{
                        fontSize: '13px',
                        color: '#92400e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>{alerta.icone}</span>
                        <span><strong>{alerta.titulo}:</strong> {alerta.descricao}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => window.location.href = '/previsao'}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🔮 Ver Previsão Completa
              </button>
            </div>
          )}

          {/* Terceira linha */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Resumo por Cartão */}
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
                💳 RESUMO POR CARTÃO
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cartoes.map((cartao, index) => (
                  <div key={index} style={{
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
                      <span style={{ fontWeight: '600', color: '#1a202c' }}>
                        💳 {cartao.nome}
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: cartao.percentual >= 70 ? '#ef4444' : 
                               cartao.percentual >= 40 ? '#f59e0b' : '#10b981'
                      }}>
                        {cartao.percentual}% {cartao.percentual >= 70 ? '🔴' : 
                                           cartao.percentual >= 40 ? '🟡' : '🟢'}
                      </span>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#e2e8f0',
                      borderRadius: '6px',
                      height: '6px',
                      marginBottom: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        backgroundColor: cartao.cor,
                        height: '100%',
                        width: `${cartao.percentual}%`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      color: '#64748b'
                    }}>
                      <span>{formatCurrency(cartao.usado)}</span>
                      <span>{formatCurrency(cartao.limite)}</span>
                    </div>
                  </div>
                ))}
                
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#475569'
                }}>
                  Total Usado: {formatCurrency(cartoes.reduce((acc, c) => acc + c.usado, 0))}
                </div>
              </div>
            </div>

            {/* Top Categorias */}
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
                📊 TOP CATEGORIAS
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {categorias.map((categoria, index) => (
                  <div key={index} style={{
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
                      <span style={{ fontWeight: '600', color: '#1a202c' }}>
                        {categoria.nome}
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: categoria.cor
                      }}>
                        {categoria.percentual}%
                      </span>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#e2e8f0',
                      borderRadius: '6px',
                      height: '6px',
                      marginBottom: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        backgroundColor: categoria.cor,
                        height: '100%',
                        width: `${categoria.percentual}%`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    
                    <div style={{
                      fontSize: '13px',
                      color: '#64748b',
                      textAlign: 'center'
                    }}>
                      {formatCurrency(categoria.valor)}
                    </div>
                  </div>
                ))}
                
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#475569'
                }}>
                  Total: {formatCurrency(categorias.reduce((acc, c) => acc + c.valor, 0))}
                </div>
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
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
                   {[
                { label: '💰 + Receita', cor: '#10b981', href: '/receitas' },
                { label: '💸 + Despesa', cor: '#ef4444', href: '/despesas' },
                { label: '🛒 + Compra', cor: '#3b82f6', href: '/despesas/gerenciar' },
                { label: '💳 Pagar', cor: '#f59e0b', href: '/cartoes' },
                { label: '🎯 + Meta', cor: '#8b5cf6', href: '/metas' },
                { label: '📊 Relatório', cor: '#6b7280', href: '/relatorios' },
                { label: '🎭 Modo Casal', cor: '#ec4899', action: 'modal' },
                { label: '🔮 Previsão', cor: '#14b8a6', href: '/previsao' }
              ].map((acao, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (acao.action === 'modal') {
                      setModoCosal(!modoCosal)
                    } else if (acao.href) {
                      window.location.href = acao.href
                    }
                  }}
                  style={{
                    backgroundColor: acao.cor,
                    color: 'white',
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 15px ${acao.cor}33`
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = `0 8px 25px ${acao.cor}44`
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = `0 4px 15px ${acao.cor}33`
                  }}
                >
                  {acao.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modo Casal - Modal */}
          {modoCosal && (
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
                    🎭 MODO CASAL - ANÁLISE FAMILIAR
                  </h2>
                  <button
                    onClick={() => setModoCosal(false)}
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

                {/* Situação Atual */}
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
                    margin: '0 0 12px 0',
                    color: '#0c4a6e'
                  }}>
                    🎯 ANÁLISE FAMILIAR ATUAL
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px'
                  }}>
                    {/* Situação Atual */}
                    <div style={{
                      backgroundColor: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 12px 0',
                        color: '#059669'
                      }}>
                        📊 SITUAÇÃO ATUAL
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                        <li>Renda Total: {formatCurrency(dadosFamilia.rendaTotal)}</li>
                        <li>Comprometimento: {dadosFamilia.rendaComprometida}%</li>
                        <li>Saúde Financeira: {dadosFamilia.saudeFinanceira}%</li>
                        <li>Nível: {dadosFamilia.nivel} - {dadosFamilia.tituloNivel}</li>
                      </ul>
                    </div>
                    
                    {/* Próximas Ações */}
                    <div style={{
                      backgroundColor: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 12px 0',
                        color: '#059669'
                      }}>
                        🎯 ALERTAS INTELIGENTES
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                        {alertasInteligentes.slice(0, 3).map((alerta, i) => (
                          <li key={i} style={{ marginBottom: '4px' }}>
                            {alerta.icone} {alerta.titulo}
                          </li>
                        ))}
                        {alertasInteligentes.length === 0 && (
                          <li>✅ Situação sob controle!</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Conquistas */}
                {conquistasUsuario.length > 0 && (
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
                      margin: '0 0 12px 0',
                      color: '#92400e'
                    }}>
                      🏆 CONQUISTAS DESBLOQUEADAS
                    </h3>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px'
                    }}>
                      {conquistasUsuario.map((conquista, index) => (
                        <div key={index} style={{
                          backgroundColor: 'white',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                            {conquista.icone}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: conquista.cor,
                            marginBottom: '2px'
                          }}>
                            {conquista.titulo}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>
                            {conquista.descricao}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center'
                }}>
                  <button 
                    onClick={() => setModoCosal(false)}
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
                    ✅ Entendi
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* ✅ MODAL CALENDÁRIO */}
          {calendarioOpen && (
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
                maxWidth: '900px',
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
                    📅 CALENDÁRIO FINANCEIRO
                  </h2>
                  <button
                    onClick={() => setCalendarioOpen(false)}
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

                {/* Próximos 30 Dias */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px'
                }}>
                  {proximosEventos.length > 0 ? proximosEventos.map((evento, index) => (
                    <div key={index} style={{
                      padding: '16px',
                      backgroundColor: index < proximosEventos.length ? '#f0f9ff' : '#f8fafc',
                      borderRadius: '12px',
                      border: `1px solid ${index < proximosEventos.length ? '#bfdbfe' : '#e2e8f0'}`
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: '#1a202c'
                        }}>
                          {evento.data}
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#059669'
                        }}>
                          {formatCurrency(evento.valor)}
                        </div>
                      </div>
                      
                      <div style={{
                        fontSize: '14px',
                        color: '#374151',
                        marginBottom: '4px'
                      }}>
                        {evento.descricao}
                      </div>
                      
                      {evento.extra && (
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          {evento.extra}
                        </div>
                      )}
                    </div>
                  )) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#64748b'
                    }}>
                      📅 Nenhum evento encontrado
                      <br />
                      <button 
                        onClick={() => window.location.href = '/despesas'}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          marginTop: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        + Cadastrar despesa recorrente
                      </button>
                    </div>
                  )}
                </div>

                {/* Resumo do Mês */}
                <div style={{
                  marginTop: '24px',
                  padding: '20px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '12px',
                  border: '1px solid #bfdbfe'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1a202c',
                    margin: '0 0 12px 0'
                  }}>
                    📊 RESUMO DO MÊS
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '16px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                        {formatCurrency(proximosEventos.reduce((sum, e) => sum + e.valor, 0) + 2440)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Total Previsto
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                        {proximosEventos.length + 4}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Eventos
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                        {Math.round(((proximosEventos.reduce((sum, e) => sum + e.valor, 0) + 2440) / dadosFamilia.rendaTotal) * 100)}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        da Renda
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ MODAL NOTIFICAÇÕES */}
          {showNotificationPrompt && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0',
              zIndex: 1000,
              maxWidth: '350px',
              animation: 'slideInRight 0.5s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  backgroundColor: '#8b5cf6',
                  borderRadius: '50%',
                  padding: '8px',
                  fontSize: '20px'
                }}>
                  🔔
                </div>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    margin: 0,
                    color: '#1a202c'
                  }}>
                    Ativar Notificações?
                  </h3>
                  <p style={{
                    fontSize: '12px',
                    color: '#64748b',
                    margin: '4px 0 0 0'
                  }}>
                    Receba alertas importantes sobre suas finanças
                  </p>
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
                  <strong>Você receberá:</strong>
                </div>
                <ul style={{
                  margin: 0,
                  paddingLeft: '16px',
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  <li>⚠️ Alertas de gastos altos</li>
                  <li>💳 Lembretes de vencimento</li>
                  <li>🎯 Progresso de metas</li>
                  <li>🏆 Conquistas desbloqueadas</li>
                </ul>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={solicitarPermissaoNotificacao}
                  style={{
                    flex: 1,
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ✅ Ativar
                </button>
                <button
                  onClick={() => setShowNotificationPrompt(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Agora não
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

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
        
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.01); }
        }

        .card-breathe {
          animation: breathe 6s ease-in-out infinite;
        }

        .card-hover {
          transition: all 0.3s ease;
        }

        .card-hover:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes shimmer {
          0% {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            background-size: 200px 100%;
            background-position: -200px 0;
          }
          100% {
            background-position: 200px 0;
          }
        }
        
        @keyframes progressGlow {
          0% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
          100% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.8); }
        }
        
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}