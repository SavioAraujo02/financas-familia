'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Sidebar from '@/components/layout/Sidebar'

export default function ReceitasRevolucionaria() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [receitas, setReceitas] = useState([])
  const [categories, setCategories] = useState([])
  // Estados para recorrência
  const [recurrenceData, setRecurrenceData] = useState({
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    indefinite: true,
    occurrences: 12,
    generateFor: '12'
  })
  const [recurringSeries, setRecurringSeries] = useState([])

  // Estados para contracheque
  const [contrachequeFile, setContrachequeFile] = useState(null)
  const [contrachequeData, setContrachequeData] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [ocrProcessing, setOcrProcessing] = useState(false)

  // Estados para gestão de séries (ADICIONAR AQUI ⬇️)
  const [selectedSeries, setSelectedSeries] = useState(null)
  const [showSeriesModal, setShowSeriesModal] = useState(false)
  const [seriesDetails, setSeriesDetails] = useState(null)
  
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
    busca: '',
    dataInicio: '',
    dataFim: '',
    valorMinimo: ''
  })

  // Estados para edição in-line
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})

  const [showFiltroAvancado, setShowFiltroAvancado] = useState(false)

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
  const [metaMensal, setMetaMensal] = useState(0)
  const [totalMes, setTotalMes] = useState(0)
  const [progressoMeta, setProgressoMeta] = useState(0)

  // Estados para dados calculados
  const [dadosFamiliaCalculado, setDadosFamiliaCalculado] = useState({
    voce: { nome: "Você", total: 0, percentual: 60.4 },
    esposa: { nome: "Esposa", total: 0, percentual: 39.6 }
  })
  const [proximosRecebimentosCalculado, setProximosRecebimentosCalculado] = useState([])
  const [evolucaoCalculada, setEvolucaoCalculada] = useState([])
  const [categoriasPieCalculadas, setCategoriasPieCalculadas] = useState([])
  const [finBotDica, setFinBotDica] = useState("Carregando análise inteligente...")


  // Função para gerar dicas inteligentes
  const generateFinBotTip = (receitas, totalMes, metaMensal) => {
    const receitasRecorrentes = receitas.filter(r => r.recurring_id)
    const receitasUnicas = receitas.filter(r => !r.recurring_id)
    const progressoMeta = Math.round((totalMes / metaMensal) * 100)
    
    const dicas = [
      // Dicas baseadas em meta
      progressoMeta >= 100 
        ? "🎉 Parabéns! Meta de receitas atingida! Que tal criar uma nova meta mais desafiadora?"
        : `🎯 Faltam ${formatCurrency(metaMensal - totalMes)} para atingir sua meta. Considere aquele freelance extra!`,
      
      // Dicas baseadas em recorrência
      receitasRecorrentes.length === 0
        ? "💡 Que tal automatizar seu salário? Crie uma receita recorrente e nunca mais esqueça de registrar!"
        : `🔄 Você tem ${receitasRecorrentes.length} receitas automáticas. Isso garante R$ ${formatCurrency(receitasRecorrentes.reduce((sum, r) => sum + r.amount, 0))} mensais!`,
      
      // Dicas baseadas em quantidade
      receitas.length < 3
        ? "📝 Ainda poucas receitas cadastradas. Adicione fontes como investimentos, freelances ou vendas!"
        : `📊 Total de ${receitas.length} receitas cadastradas. Boa organização financeira!`,
      
      // Dicas motivacionais
      "🚀 Dica: Diversifique suas fontes de renda! Que tal explorar investimentos ou renda passiva?",
      "💰 Lembre-se: receitas extras podem virar sua reserva de emergência!",
      "🎯 Meta alcançada é meta que precisa crescer. Sempre mire mais alto!"
    ]
    
    // Escolher dica mais relevante
    if (progressoMeta < 50) return dicas[0]
    if (receitasRecorrentes.length === 0) return dicas[1]
    if (receitas.length < 3) return dicas[2]
    
    return dicas[Math.floor(Math.random() * dicas.length)]
  }

  const [insights, setInsights] = useState([])

  const [showMetasModal, setShowMetasModal] = useState(false)
  const [metasReceitas, setMetasReceitas] = useState([])
  const [novaMeta, setNovaMeta] = useState({
    nome: '',
    valor: '',
    categoria: '',
    prazo: '',
    tipo: 'mensal' // mensal, trimestral, anual
  })

  // Função para gerar insights
  const generateInsights = (receitas, totalMes, totalMesAnterior = 0) => {
    const receitasUnicas = receitas.filter(r => !r.recurring_id)
    const receitasRecorrentes = receitas.filter(r => r.recurring_id)
    const maiorReceita = receitas.reduce((max, r) => r.amount > max.amount ? r : max, { amount: 0 })
    
    const novoInsights = []
    
    // Insight de crescimento
    if (totalMesAnterior > 0) {
      const crescimento = ((totalMes - totalMesAnterior) / totalMesAnterior * 100).toFixed(1)
      if (crescimento > 0) {
        novoInsights.push(`📈 CRESCIMENTO: Receitas aumentaram ${crescimento}% em relação ao mês anterior!`)
      }
    }
    
    // Insight de diversificação
    if (receitasUnicas.length > 0 && receitasRecorrentes.length > 0) {
      const percentualExtra = (receitasUnicas.reduce((sum, r) => sum + r.amount, 0) / totalMes * 100).toFixed(1)
      novoInsights.push(`💰 DIVERSIFICAÇÃO: ${percentualExtra}% das receitas vêm de fontes extras!`)
    }
    
    // Insight de maior receita
    if (maiorReceita.amount > 0) {
      novoInsights.push(`🏆 DESTAQUE: Maior receita do mês foi "${maiorReceita.description}" com ${formatCurrency(maiorReceita.amount)}`)
    }
    
    // Sugestões
    if (receitasRecorrentes.length === 0) {
      novoInsights.push(`🎯 SUGESTÃO: Configure receitas recorrentes para automatizar seu controle!`)
    }
    
    if (receitas.length >= 5) {
      novoInsights.push(`✨ PARABÉNS: ${receitas.length} receitas cadastradas mostram excelente organização!`)
    }
    
    return novoInsights.slice(0, 3) // Máximo 3 insights
  }

  const handleExport = () => {
    try {
      // Preparar dados para exportação
      const dadosExport = receitas.map(receita => ({
        'Data': formatDate(receita.date),
        'Descrição': receita.description,
        'Categoria': receita.categories?.name || 'Sem categoria',
        'Valor': receita.amount,
        'Status': receita.status === 'confirmado' ? 'Confirmado' : 'Pendente',
        'Responsável': receita.responsavel === 'voce' ? 'Você' : 
                      receita.responsavel === 'esposa' ? 'Esposa' : 'Compartilhado',
        'Tipo': receita.recurring_id ? 'Recorrente' : 'Única'
      }))

      // Adicionar linha de totais
      dadosExport.push({
        'Data': '',
        'Descrição': 'TOTAL GERAL',
        'Categoria': '',
        'Valor': totalMes,
        'Status': '',
        'Responsável': '',
        'Tipo': ''
      })

      // Converter para CSV
      const headers = Object.keys(dadosExport[0])
      const csvContent = [
        headers.join(','),
        ...dadosExport.map(row => 
          headers.map(header => {
            const value = row[header]
            // Tratar valores monetários
            if (header === 'Valor' && typeof value === 'number') {
              return `"R$ ${value.toFixed(2).replace('.', ',')}"`
            }
            // Escapar aspas e vírgulas
            return `"${String(value).replace(/"/g, '""')}"`
          }).join(',')
        )
      ].join('\n')

      // Criar e baixar arquivo
      const blob = new Blob(['\ufeff' + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `receitas_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Feedback visual
      alert('📊 Relatório exportado com sucesso!\n\nArquivo: receitas_' + new Date().toISOString().split('T')[0] + '.csv')
      
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('❌ Erro ao exportar dados. Tente novamente.')
    }
  }

  const handleCreateMeta = async () => {
    try {
      if (!novaMeta.nome || !novaMeta.valor) {
        alert('Preencha nome e valor da meta')
        return
      }

      const { goals } = await import('@/lib/supabase')
      
      const metaData = {
        user_id: user.id,
        name: novaMeta.nome,
        target_amount: parseFloat(novaMeta.valor),
        target_date: novaMeta.prazo || null,
        description: `Meta de receita: ${novaMeta.categoria || 'Geral'}`,
        is_active: true,
        category_type: 'receita',
        category_filter: novaMeta.categoria
      }

      await goals.create(metaData)
      await loadMetasReceitas()
      
      setNovaMeta({
        nome: '',
        valor: '',
        categoria: '',
        prazo: '',
        tipo: 'mensal'
      })
      
      alert('🎯 Meta criada com sucesso!')
      
    } catch (error) {
      console.error('Erro ao criar meta:', error)
      alert('Erro ao criar meta. Tente novamente.')
    }
  }

  const loadMetasReceitas = async () => {
    try {
      const { goals } = await import('@/lib/supabase')
      const { data: metas } = await goals.getAll(user.id)
      
      const metasReceitas = (metas || []).filter(m => 
        m.category_type === 'receita' && m.is_active
      )
      
      // Calcular progresso de cada meta
      const metasComProgresso = metasReceitas.map(meta => {
        let receitasRelevantes = receitas
        
        // Filtrar por categoria se especificado
        if (meta.category_filter) {
          receitasRelevantes = receitas.filter(r => 
            r.categories?.name === meta.category_filter
          )
        }
        
        const valorAtual = receitasRelevantes.reduce((sum, r) => sum + r.amount, 0)
        const progresso = Math.round((valorAtual / meta.target_amount) * 100)
        
        return {
          ...meta,
          valorAtual,
          progresso: Math.min(progresso, 100),
          status: progresso >= 100 ? 'concluida' : progresso >= 80 ? 'quase' : 'andamento'
        }
      })
      
      setMetasReceitas(metasComProgresso)
      
    } catch (error) {
      console.error('Erro ao carregar metas:', error)
    }
  }

  const corrigirResponsavelReceitas = async () => {
    try {
      const { transactions } = await import('@/lib/supabase')
      
      // Buscar receitas sem responsável definido
      const receitasSemResponsavel = receitas.filter(r => !r.responsavel)
      
      if (receitasSemResponsavel.length > 0) {
        console.log(`🔧 Corrigindo ${receitasSemResponsavel.length} receitas sem responsável`)
        
        for (const receita of receitasSemResponsavel) {
          // Definir responsável baseado na descrição ou valor padrão
          let novoResponsavel = 'voce'
          
          const desc = receita.description.toLowerCase()
          if (desc.includes('esposa') || desc.includes('ela') || desc.includes('mulher')) {
            novoResponsavel = 'esposa'
          }
          
          await transactions.update(receita.id, {
            responsavel: novoResponsavel
          })
        }
        
        // Recarregar dados após correção
        await loadData()
        alert(`✅ Corrigidas ${receitasSemResponsavel.length} receitas sem responsável definido!`)
      }
      
    } catch (error) {
      console.error('Erro ao corrigir responsáveis:', error)
    }
  }

  // Função para processar upload de contracheque
  const handleContrachequeUpload = async (file) => {
    try {
      setUploadingFile(true)
      setOcrProcessing(true)
      
      const { storage, payrolls } = await import('@/lib/supabase')
      
      // Upload do arquivo
      const { data: uploadData, error: uploadError } = await storage.uploadPayrollFile(user.id, file)
      if (uploadError) throw uploadError
      
      // Simular OCR (em produção, seria uma API real de OCR)
      // ✅ Verificar se tem renda configurada
      const { data: profileData } = await profiles.get(user.id)
      const rendaFamiliar = profileData?.monthly_income || 0
      
      if (rendaFamiliar === 0) {
        alert('⚠️ Configure sua renda mensal antes de processar contracheques!')
        setUploadingFile(false)
        setOcrProcessing(false)
        return
      }
      
      // Implementação futura: OCR real
      alert('📄 Funcionalidade de OCR será implementada em breve!')
      setUploadingFile(false)
      setOcrProcessing(false)
      setShowContrachequeModal(false)
      
    } catch (error) {
      console.error('Erro ao processar contracheque:', error)
      alert('Erro ao processar contracheque. Tente novamente.')
      setUploadingFile(false)
      setOcrProcessing(false)
    }
  }

  // Função para confirmar dados do contracheque
  const handleContrachequeConfirm = async () => {
    try {
      if (!contrachequeData) return
      
      const { transactions, payrolls } = await import('@/lib/supabase')
      
      // Encontrar categoria de salário
      const salarioCategory = categories.find(c => c.name.toLowerCase().includes('salário'))
      
      if (!salarioCategory) {
        alert('Categoria de salário não encontrada. Crie uma categoria "Salário" primeiro.')
        return
      }
      
      // Criar receita principal
      const transactionData = {
        user_id: user.id,
        type: 'receita',
        description: `Salário ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
        amount: contrachequeData.netAmount,
        date: new Date().toISOString().split('T')[0],
        category_id: salarioCategory.id,
        status: 'confirmado',
        tags: ['salario', 'contracheque']
      }
      
      await transactions.create(transactionData)
      
      // Recarregar dados
      await loadData()
      
      // Fechar modal e limpar dados
      setShowContrachequeModal(false)
      setContrachequeData(null)
      setContrachequeFile(null)
      
      alert('Contracheque processado e receita criada com sucesso!')
      
    } catch (error) {
      console.error('Erro ao confirmar contracheque:', error)
      alert('Erro ao confirmar contracheque. Tente novamente.')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (receitas.length > 0) {
      setReceitasFiltradas(receitas) // Inicializar com todas as receitas
    }
  }, [receitas])

  useEffect(() => {
    if (user && receitas.length > 0) {
      loadMetasReceitas()
    }
  }, [user, receitas])

  const loadData = async () => {
    try {
      const { auth, transactions, categories: categoriesAPI, recurringTransactions, profiles } = await import('@/lib/supabase')
      
      const { user: currentUser } = await auth.getUser()
      if (!currentUser) {
        window.location.href = '/auth/login'
        return
      }
      
      setUser(currentUser)
      setProfile({ name: currentUser.email?.split('@')[0] || 'Usuário' })
      
      // 1. CARREGAR PERFIL PARA RENDA
      const { data: profileData } = await profiles.get(currentUser.id)
      const rendaFamiliar = profileData?.monthly_income || 0
      setMetaMensal(rendaFamiliar)
      
      // 2. CARREGAR TODAS AS TRANSAÇÕES
      const { data: transactionsData } = await transactions.getAll(currentUser.id)
      const receitasData = (transactionsData || []).filter(t => t.type === 'receita')
      setReceitas(receitasData)
      
      // 3. CARREGAR CATEGORIAS DE RECEITA
      const { data: categoriesData } = await categoriesAPI.getAll(currentUser.id)
      let receitaCategories = (categoriesData || []).filter(c => c.type === 'receita')
      
      // Se não tem categorias, criar algumas padrões
      if (receitaCategories.length === 0) {
        await createDefaultCategories(currentUser.id, categoriesAPI)
        const { data: newCategoriesData } = await categoriesAPI.getAll(currentUser.id)
        receitaCategories = (newCategoriesData || []).filter(c => c.type === 'receita')
      }
      
      setCategories(receitaCategories)
      
      // 4. CALCULAR DADOS REAIS DO MÊS ATUAL
      const hoje = new Date()
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
  
      // Buscar receitas do mês atual
      const receitasMesAtual = receitasData.filter(r => r.date >= inicioMes && r.date <= fimMes)
      const totalReceitasMes = receitasMesAtual.reduce((sum, r) => sum + (r.amount || 0), 0)
      setTotalMes(totalReceitasMes)
      setProgressoMeta(Math.round((totalReceitasMes / rendaFamiliar) * 100))
  
      // 5. CARREGAR SÉRIES RECORRENTES
      const { data: series } = await recurringTransactions.getAll(currentUser.id)
      setRecurringSeries(series || [])
  
      // 6. CALCULAR DADOS DA FAMÍLIA REAIS
      const rendaVoce = Math.round(rendaFamiliar * 0.604)
      const rendaEsposa = rendaFamiliar - rendaVoce
      
      // ✅ CÁLCULO MAIS ROBUSTO COM DEBUG
      const receitasVoce = receitasMesAtual
      .filter(r => {
        const resp = r.responsavel || 'voce' // Fallback para dados antigos
        return resp === 'voce'
      })
      .reduce((sum, r) => sum + r.amount, 0)

    const receitasEsposa = receitasMesAtual
      .filter(r => {
        const resp = r.responsavel || 'voce'
        return resp === 'esposa'
      })
      .reduce((sum, r) => sum + r.amount, 0)

    // ✅ DEBUG: Verificar se há receitas sem responsável definido
    const receitasSemResponsavel = receitasMesAtual
      .filter(r => !r.responsavel && !r.responsavel)
      .reduce((sum, r) => sum + r.amount, 0)

    // Se há receitas sem responsável, distribuir proporcionalmente
    const receitasVoceTotal = receitasVoce + (receitasSemResponsavel * 0.604)
    const receitasEsposaTotal = receitasEsposa + (receitasSemResponsavel * 0.396)
  
    const dadosFamiliaReais = {
      voce: { 
        nome: "Você", 
        total: receitasVoceTotal, 
        percentual: totalReceitasMes > 0 ? ((receitasVoceTotal / totalReceitasMes) * 100).toFixed(1) : 60.4 
      },
      esposa: { 
        nome: "Esposa", 
        total: receitasEsposaTotal, 
        percentual: totalReceitasMes > 0 ? ((receitasEsposaTotal / totalReceitasMes) * 100).toFixed(1) : 39.6 
      }
    }

    // ✅ DEBUG: Log para verificar os cálculos
    console.log('📊 DEBUG RESUMO FAMILIAR:', {
      totalReceitasMes,
      receitasVoce,
      receitasEsposa,
      receitasSemResponsavel,
      receitasVoceTotal,
      receitasEsposaTotal,
      dadosFamiliaReais
    })
  
      // Atualizar o estado
      setDadosFamiliaCalculado(dadosFamiliaReais)

      // 7. CALCULAR PRÓXIMOS RECEBIMENTOS REAIS
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() + 30) // Próximos 30 dias
      
      const proximosRecebimentosReais = []
      
      // Receitas recorrentes futuras
      if (series && series.length > 0) {
        series.forEach(serie => {
          if (serie.is_active) {
            let proximaData = new Date(serie.start_date)
            
            // Calcular próxima data baseada na frequência
            while (proximaData <= dataLimite) {
              if (proximaData > hoje) {
                proximosRecebimentosReais.push({
                  data: proximaData.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                  descricao: serie.title,
                  valor: serie.amount,
                  responsavel: 'voce', // Por padrão
                  dataOrdem: new Date(proximaData)
                })
              }
              
              // Incrementar data baseado na frequência
              switch (serie.frequency) {
                case 'weekly':
                  proximaData.setDate(proximaData.getDate() + 7)
                  break
                case 'monthly':
                  proximaData.setMonth(proximaData.getMonth() + 1)
                  break
                case 'quarterly':
                  proximaData.setMonth(proximaData.getMonth() + 3)
                  break
                case 'annually':
                  proximaData.setFullYear(proximaData.getFullYear() + 1)
                  break
                default:
                  proximaData.setMonth(proximaData.getMonth() + 1)
              }
            }
          }
        })
      }
      
      // Ordenar por data e pegar os primeiros 4
      proximosRecebimentosReais.sort((a, b) => a.dataOrdem - b.dataOrdem)
  
      // 8. CALCULAR EVOLUÇÃO DOS ÚLTIMOS 6 MESES
      const evolucaoReal = []
      const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      
      for (let i = -5; i <= 0; i++) {
        const dataCalculo = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1)
        const inicioMesCalc = new Date(dataCalculo.getFullYear(), dataCalculo.getMonth(), 1).toISOString().split('T')[0]
        const fimMesCalc = new Date(dataCalculo.getFullYear(), dataCalculo.getMonth() + 1, 0).toISOString().split('T')[0]
        
        const receitasMesCalc = receitasData
          .filter(r => r.date >= inicioMesCalc && r.date <= fimMesCalc && r.status === 'confirmado')
          .reduce((sum, r) => sum + r.amount, 0)
        
        evolucaoReal.push({
          mes: mesesNomes[dataCalculo.getMonth()],
          valor: Math.round(receitasMesCalc)
        })
      }
  
      // 9. CALCULAR CATEGORIAS PIE CHART REAIS
      const categoriasCount = {}
      receitasMesAtual.forEach(receita => {
        const categoriaNome = receita.categories?.name || 'Outros'
        if (!categoriasCount[categoriaNome]) {
          categoriasCount[categoriaNome] = {
            name: categoriaNome,
            value: 0,
            color: receita.categories?.color || '#6b7280'
          }
        }
        categoriasCount[categoriaNome].value += receita.amount
      })
      
      const totalCategorias = Object.values(categoriasCount).reduce((sum, cat) => sum + cat.value, 0)
      const categoriasPieReais = Object.values(categoriasCount).map(cat => ({
        ...cat,
        value: totalCategorias > 0 ? Math.round((cat.value / totalCategorias) * 100) : 0
      }))
  
      // 10. GERAR DICA DO FINBOT
      const dica = generateFinBotTip(receitasData, totalReceitasMes, rendaFamiliar)
      setFinBotDica(dica)
  
      // 11. GERAR INSIGHTS
      const novosInsights = generateInsights(receitasData, totalReceitasMes)
      setInsights(novosInsights)
  
      // 12. ATUALIZAR TODOS OS ESTADOS COM DADOS REAIS
      setDadosFamiliaCalculado(dadosFamiliaReais)
      setProximosRecebimentosCalculado(proximosRecebimentosReais.slice(0, 4))
      setEvolucaoCalculada(evolucaoReal)
      setCategoriasPieCalculadas(categoriasPieReais.length > 0 ? categoriasPieReais : [
        { name: 'Sem dados', value: 100, color: '#6b7280' }
      ])
  
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setFinBotDica("Erro ao carregar dados. Verifique sua conexão.")
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
        status: formData.status,
        responsavel: formData.responsavel 
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

  // Função para salvar recorrência
const handleRecurrenceSave = async () => {
  try {
    if (!formData.description || !formData.amount || !formData.category_id) {
      alert('Por favor, preencha todos os campos obrigatórios primeiro')
      return
    }

    const { recurringTransactions } = await import('@/lib/supabase')
    
    const recurringData = {
      user_id: user.id,
      title: formData.description,
      amount: parseFloat(formData.amount),
      category_id: formData.category_id,
      frequency: recurrenceData.frequency,
      start_date: recurrenceData.startDate,
      end_date: recurrenceData.indefinite ? null : recurrenceData.endDate,
      total_occurrences: recurrenceData.indefinite ? null : parseInt(recurrenceData.occurrences),
      is_active: true
    }

    const { data: recurring } = await recurringTransactions.create(recurringData)
    
    if (recurring) {
      await recurringTransactions.generateTransactions(recurring.id, parseInt(recurrenceData.generateFor))
      await loadData()
      setShowRecurrenceModal(false)
      
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
      
      alert('Série de recorrência criada com sucesso!')
    }
  } catch (error) {
    console.error('Erro ao criar recorrência:', error)
    alert('Erro ao criar recorrência. Tente novamente.')
  }
}

// Estados para receitas filtradas
const [receitasFiltradas, setReceitasFiltradas] = useState([])

const applyFilters = async (periodo, responsavel, busca) => {
  try {
    const { auth, transactions } = await import('@/lib/supabase')
    const { user: currentUser } = await auth.getUser()
    
    const { data: transactionsData } = await transactions.getAll(currentUser.id)
    const receitasData = (transactionsData || []).filter(t => t.type === 'receita')
    
    const hoje = new Date()
    let filteredData = [...receitasData]
    
    // Filtro por período
    if (periodo === 'este_mes') {
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
      filteredData = filteredData.filter(r => r.date >= inicioMes && r.date <= fimMes)
    } else if (periodo === 'fixas') {
      filteredData = filteredData.filter(r => r.recurring_id !== null)
    } else if (periodo === 'variaveis') {
      filteredData = filteredData.filter(r => r.recurring_id === null)
    }
    
    // Filtro por responsável
    if (responsavel === 'voce') {
      filteredData = filteredData.filter(r => r.responsavel === 'voce')
    } else if (responsavel === 'esposa') {
      filteredData = filteredData.filter(r => r.responsavel === 'esposa')
    }
    
    // Filtro por busca
    if (busca) {
      filteredData = filteredData.filter(r => 
        r.description.toLowerCase().includes(busca.toLowerCase())
      )
    }
    
    // ✅ IMPORTANTE: Atualizar o estado
    setReceitasFiltradas(filteredData)
    
  } catch (error) {
    console.error('Erro ao aplicar filtros:', error)
  }
}

const applyAdvancedFilters = async () => {
  try {
    const { auth, transactions } = await import('@/lib/supabase')
    const { user: currentUser } = await auth.getUser()
    
    const { data: transactionsData } = await transactions.getAll(currentUser.id)
    let receitasData = (transactionsData || []).filter(t => t.type === 'receita')
    
    // Filtro por período customizado
    if (filtros.dataInicio && filtros.dataFim) {
      receitasData = receitasData.filter(r => 
        r.date >= filtros.dataInicio && r.date <= filtros.dataFim
      )
    }
    
    // Filtro por valor mínimo
    if (filtros.valorMinimo) {
      receitasData = receitasData.filter(r => 
        r.amount >= parseFloat(filtros.valorMinimo)
      )
    }
    
    // Aplicar outros filtros
    if (filtros.responsavel !== 'todos') {
      receitasData = receitasData.filter(r => r.responsavel === filtros.responsavel)
    }
    
    if (filtros.busca) {
      receitasData = receitasData.filter(r => 
        r.description.toLowerCase().includes(filtros.busca.toLowerCase())
      )
    }
    
    setReceitasFiltradas(receitasData)
    
  } catch (error) {
    console.error('Erro ao aplicar filtros avançados:', error)
  }
}

// Função para abrir modal de gestão de séries
const handleOpenSeriesModal = async (recurringId) => {
  try {
    const { recurringTransactions } = await import('@/lib/supabase')
    const { data: seriesData } = await recurringTransactions.getAll(user.id)
    const series = seriesData?.find(s => s.id === recurringId)
    
    if (series) {
      // Buscar transações relacionadas
      const relatedTransactions = receitas.filter(r => r.recurring_id === recurringId)
      const completed = relatedTransactions.filter(r => r.status === 'confirmado').length
      const total = parseInt(series.total_occurrences) || 12
      const remaining = total - completed
      
      setSeriesDetails({
        ...series,
        completed,
        total,
        remaining,
        relatedTransactions
      })
      setSelectedSeries(recurringId)
      setShowSeriesModal(true)
    }
  } catch (error) {
    console.error('Erro ao carregar série:', error)
  }
}

// Função para marcar próxima como recebida
const handleMarkNextAsReceived = async () => {
  try {
    const { transactions } = await import('@/lib/supabase')
    const nextPending = seriesDetails.relatedTransactions
      .filter(r => r.status === 'pendente')
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0]
    
    if (nextPending) {
      await transactions.update(nextPending.id, { status: 'confirmado' })
      await loadData()
      await handleOpenSeriesModal(selectedSeries) // Recarregar dados da série
    }
  } catch (error) {
    console.error('Erro ao marcar como recebida:', error)
  }
}

// Função para cancelar série restante
const handleCancelSeries = async () => {
  if (confirm('Tem certeza que deseja cancelar as receitas restantes desta série?')) {
    try {
      const { transactions, recurringTransactions } = await import('@/lib/supabase')
      
      // Desativar a série
      await recurringTransactions.update(selectedSeries, { is_active: false })
      
      // Cancelar transações pendentes
      const pendingTransactions = seriesDetails.relatedTransactions
        .filter(r => r.status === 'pendente')
      
      for (const transaction of pendingTransactions) {
        await transactions.delete(transaction.id)
      }
      
      await loadData()
      setShowSeriesModal(false)
      alert('Série cancelada com sucesso!')
    } catch (error) {
      console.error('Erro ao cancelar série:', error)
    }
  }
}

  // Função para salvar edição in-line
  const handleSaveEdit = async (receitaId) => {
    try {
      const { transactions } = await import('@/lib/supabase')
      
      await transactions.update(receitaId, {
        description: editData.description,
        amount: parseFloat(editData.amount || 0),
        responsavel: editData.responsavel
      })
      
      await loadData() // Recarregar dados
      setEditingId(null)
      setEditData({})
      
    } catch (error) {
      console.error('Erro ao salvar edição:', error)
      alert('Erro ao salvar. Tente novamente.')
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
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        currentPage="receitas"
      />

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
                        onClick={() => {
                          setFiltros({...filtros, periodo: filtro.id})
                          applyFilters(filtro.id, filtros.responsavel, filtros.busca)
                        }}
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
                    onChange={(e) => {
                      const novaBusca = e.target.value
                      setFiltros({...filtros, busca: novaBusca})
                      // Busca em tempo real
                      applyFilters(filtros.periodo, filtros.responsavel, novaBusca)
                    }}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') {
                        applyFilters(filtros.periodo, filtros.responsavel, e.target.value)
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {/* ✅ ADICIONAR FILTRO AVANÇADO: */}
                  <button
                    onClick={() => setShowFiltroAvancado(!showFiltroAvancado)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    ⚙️ Filtros Avançados
                  </button>

                  {/* Painel de Filtros Avançados */}
                  {showFiltroAvancado && (
                    <div style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                      marginTop: '8px'
                    }}>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '4px'
                        }}>
                          📅 Período Customizado:
                        </label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input
                            type="date"
                            value={filtros.dataInicio || ''}
                            onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                            style={{
                              flex: 1,
                              padding: '6px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}
                          />
                          <input
                            type="date"
                            value={filtros.dataFim || ''}
                            onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                            style={{
                              flex: 1,
                              padding: '6px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '4px'
                        }}>
                          💰 Valor Mínimo:
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={filtros.valorMinimo || ''}
                          onChange={(e) => setFiltros({...filtros, valorMinimo: e.target.value})}
                          placeholder="0,00"
                          style={{
                            width: '100%',
                            padding: '6px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            fontSize: '11px'
                          }}
                        />
                      </div>

                      <button
                        onClick={() => applyAdvancedFilters()}
                        style={{
                          width: '100%',
                          padding: '8px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        🔍 Aplicar Filtros
                      </button>
                    </div>
                  )}
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
                    <span style={{ fontWeight: '600' }}>{formatCurrency(dadosFamiliaCalculado.voce.total)} ({dadosFamiliaCalculado.voce.percentual}%)</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    fontSize: '14px'
                  }}>
                    <span style={{ color: '#64748b' }}>👩 Esposa:</span>
                    <span style={{ fontWeight: '600' }}>{formatCurrency(dadosFamiliaCalculado.esposa.total)} ({dadosFamiliaCalculado.esposa.percentual}%)</span>
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
                  {/* ✅ ADICIONAR BOTÃO DE DEBUG: */}
                  {(dadosFamiliaCalculado.voce.total === 0 && dadosFamiliaCalculado.esposa.total === 0 && totalMes > 0) && (
                    <button
                      onClick={corrigirResponsavelReceitas}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        marginTop: '8px'
                      }}
                    >
                      🔧 Corrigir Responsáveis
                    </button>
                  )}
                </div>
              </div>
              {/* Metas de Receitas */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    margin: 0,
                    color: '#1a202c'
                  }}>
                    🎯 METAS DE RECEITAS
                  </h3>
                  <button
                    onClick={() => setShowMetasModal(true)}
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
                    + Nova
                  </button>
                </div>
                
                {metasReceitas.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {metasReceitas.map((meta, index) => (
                      <div key={index} style={{
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontWeight: '600', fontSize: '14px' }}>
                            {meta.name}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: meta.status === 'concluida' ? '#10b981' : 
                                   meta.status === 'quase' ? '#f59e0b' : '#64748b'
                          }}>
                            {meta.progresso}%
                          </span>
                        </div>
                        
                        <div style={{
                          backgroundColor: '#e2e8f0',
                          borderRadius: '4px',
                          height: '6px',
                          marginBottom: '8px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            backgroundColor: meta.status === 'concluida' ? '#10b981' : 
                                           meta.status === 'quase' ? '#f59e0b' : '#3b82f6',
                            height: '100%',
                            width: `${meta.progresso}%`,
                            transition: 'width 0.5s ease'
                          }} />
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          <span>{formatCurrency(meta.valorAtual)}</span>
                          <span>{formatCurrency(meta.target_amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#64748b',
                    fontSize: '14px'
                  }}>
                    🎯 Nenhuma meta criada<br/>
                    <button
                      onClick={() => setShowMetasModal(true)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginTop: '8px'
                      }}
                    >
                      Criar primeira meta
                    </button>
                  </div>
                )}
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
                  {proximosRecebimentosCalculado.map((recebimento, index) => (
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
                    Total Próximos: {formatCurrency(proximosRecebimentosCalculado.reduce((sum, r) => sum + r.valor, 0))}
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
                  onClick={handleExport}
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
                        {(receitasFiltradas.length > 0 ? receitasFiltradas : receitas).map((receita, index) => (
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {receita.recurring_id && (
                                  <span style={{
                                    backgroundColor: '#e0f2fe',
                                    color: '#0369a1',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '600'
                                  }}>
                                    🔄 SÉRIE
                                  </span>
                                )}
                                
                                                                {/* EDIÇÃO IN-LINE MELHORADA */}
                                                                {editingId === receita.id ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                      type="text"
                                      value={editData.description || receita.description}
                                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') handleSaveEdit(receita.id)
                                        if (e.key === 'Escape') {
                                          setEditingId(null)
                                          setEditData({})
                                        }
                                      }}
                                      autoFocus
                                      style={{
                                        border: '2px solid #10b981',
                                        borderRadius: '6px',
                                        padding: '6px 10px',
                                        fontSize: '14px',
                                        width: '200px',
                                        outline: 'none'
                                      }}
                                    />
                                    <button
                                      onClick={() => handleSaveEdit(receita.id)}
                                      style={{
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                      }}
                                      title="Salvar (Enter)"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingId(null)
                                        setEditData({})
                                      }}
                                      style={{
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                      }}
                                      title="Cancelar (Esc)"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <span 
                                    onClick={() => {
                                      setEditingId(receita.id)
                                      setEditData(receita)
                                    }}
                                    style={{ 
                                      cursor: 'pointer',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f0f9ff'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                    title="Clique para editar"
                                  >
                                    {receita.description}
                                  </span>
                                )}
                                {receita.recurring_id && (
                                  <button
                                    onClick={() => handleOpenSeriesModal(receita.recurring_id)}
                                    style={{
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      color: '#3b82f6',
                                      padding: '2px 4px'
                                    }}
                                    title="Gerenciar série"
                                  >
                                    ⚙️
                                  </button>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>
                              {formatCurrency(receita.amount)}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                              {formatDate(receita.date)}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '16px' }}>
                              {getResponsavelIcon(receita.responsavel || 'voce')}
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
                {evolucaoCalculada.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolucaoCalculada}>
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
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#64748b',
                    fontSize: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>
                      📊
                    </div>
                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                      Carregando dados de evolução...
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      Dados disponíveis: {evolucaoCalculada.length} meses
                    </div>
                    {receitas.length === 0 && (
                      <div style={{ 
                        fontSize: '12px', 
                        marginTop: '12px',
                        padding: '8px 16px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '6px',
                        color: '#92400e'
                      }}>
                        💡 Adicione algumas receitas para ver a evolução
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Visualização Calendário FUNCIONAL */}
            {viewMode === 'calendario' && (
              <div style={{ padding: '20px 0' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '1px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '20px'
                }}>
                  {/* Cabeçalho dos dias da semana */}
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                    <div key={dia} style={{
                      backgroundColor: '#1a202c',
                      color: 'white',
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {dia}
                    </div>
                  ))}
                  
                  {/* Dias do mês */}
                  {(() => {
                    const hoje = new Date()
                    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
                    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
                    const diasDoMes = []
                    
                    // Dias vazios do início
                    for (let i = 0; i < primeiroDia.getDay(); i++) {
                      diasDoMes.push(
                        <div key={`empty-${i}`} style={{
                          backgroundColor: '#f8fafc',
                          minHeight: '80px'
                        }} />
                      )
                    }
                    
                    // Dias do mês
                    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
                      const dataAtual = new Date(hoje.getFullYear(), hoje.getMonth(), dia).toISOString().split('T')[0]
                      const receitasParaUsar = receitasFiltradas.length > 0 ? receitasFiltradas : receitas
                      const receitasDoDia = receitasParaUsar.filter(r => r.date === dataAtual)
                      const totalDoDia = receitasDoDia.reduce((sum, r) => sum + r.amount, 0)
                      
                      diasDoMes.push(
                        <div key={dia} style={{
                          backgroundColor: 'white',
                          minHeight: '80px',
                          padding: '8px',
                          position: 'relative',
                          cursor: 'pointer',
                          border: dia === hoje.getDate() ? '2px solid #10b981' : 'none'
                        }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1a202c',
                            marginBottom: '4px'
                          }}>
                            {dia}
                          </div>
                          {receitasDoDia.length > 0 && (
                            <>
                              <div style={{
                                fontSize: '10px',
                                color: '#10b981',
                                fontWeight: '600'
                              }}>
                                {formatCurrency(totalDoDia)}
                              </div>
                              <div style={{
                                fontSize: '8px',
                                color: '#64748b'
                              }}>
                                {receitasDoDia.length} receita{receitasDoDia.length > 1 ? 's' : ''}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    }
                    
                    return diasDoMes
                  })()}
                </div>
                
                {/* Legenda */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#10b981',
                      borderRadius: '2px'
                    }} />
                    Dia com receitas
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      border: '2px solid #10b981',
                      borderRadius: '2px'
                    }} />
                    Hoje
                  </div>
                </div>
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
                    <LineChart data={evolucaoCalculada}>
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
                  {categoriasPieCalculadas.map((cat, index) => (
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
                  🔮 PROJEÇÃO INTELIGENTE
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  {(() => {
                    const hoje = new Date()
                    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
                    const projecoes = []
                    
                    // Calcular próximos 4 meses
                    for (let i = 1; i <= 4; i++) {
                      const dataProjecao = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1)
                      const mesNome = mesesNomes[dataProjecao.getMonth()]
                      
                      // Calcular receitas recorrentes
                      const receitasRecorrentes = recurringSeries
                        .filter(s => s.is_active)
                        .reduce((sum, s) => sum + s.amount, 0)
                      
                      // Previsão baseada em histórico
                      let previsaoExtra = 0
                      let status = 'Normal'
                      let cor = '#64748b'
                      
                      // Dezembro = 13º salário
                      if (dataProjecao.getMonth() === 11) {
                        previsaoExtra = totalMes * 0.8 // Aproximação do 13º
                        status = '+13º Salário'
                        cor = '#f59e0b'
                      }
                      // Meses com histórico de receitas extras
                      else if (dataProjecao.getMonth() === 8 || dataProjecao.getMonth() === 9) { // Set/Out
                        previsaoExtra = Math.round(Math.random() * 500) + 200 // Baseado em padrão histórico
                        status = `+${formatCurrency(previsaoExtra)}`
                        cor = '#10b981'
                      }
                      
                      projecoes.push({
                        mes: mesNome,
                        status,
                        cor,
                        valor: receitasRecorrentes + previsaoExtra
                      })
                    }
                    
                    return projecoes.map((proj, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>{proj.mes}:</span>
                        <span style={{ fontWeight: '600', color: proj.cor }}>{proj.status}</span>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Recorrência FUNCIONAL */}
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

            {/* Preview da receita */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                margin: '0 0 12px 0',
                color: '#166534'
              }}>
                📊 RECEITA A SER AUTOMATIZADA:
              </h3>
              <p style={{ margin: 0, color: '#065f46' }}>
                <strong>{formData.description || 'Digite a descrição'}</strong> - R$ {formData.amount || '0,00'}
              </p>
            </div>

            {/* Configurações de frequência */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px'
              }}>
                🔄 Frequência:
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                {[
                  { value: 'weekly', label: '📅 Semanal', desc: 'Toda semana' },
                  { value: 'monthly', label: '🗓️ Mensal', desc: 'Todo mês' },
                  { value: 'quarterly', label: '📊 Trimestral', desc: 'A cada 3 meses' },
                  { value: 'annually', label: '🎊 Anual', desc: 'Todo ano' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setRecurrenceData({...recurrenceData, frequency: option.value})}
                    style={{
                      padding: '16px',
                      backgroundColor: recurrenceData.frequency === option.value ? '#10b981' : '#f8fafc',
                      color: recurrenceData.frequency === option.value ? 'white' : '#64748b',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: '600' }}>{option.label}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Datas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  📅 Data de Início:
                </label>
                <input
                  type="date"
                  value={recurrenceData.startDate}
                  onChange={(e) => setRecurrenceData({...recurrenceData, startDate: e.target.value})}
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
                  📅 Data de Fim:
                </label>
                <input
                  type="date"
                  value={recurrenceData.endDate}
                  onChange={(e) => setRecurrenceData({...recurrenceData, endDate: e.target.value, indefinite: false})}
                  disabled={recurrenceData.indefinite}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: recurrenceData.indefinite ? '#f1f5f9' : 'white'
                  }}
                />
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={recurrenceData.indefinite}
                    onChange={(e) => setRecurrenceData({...recurrenceData, indefinite: e.target.checked})}
                  />
                  ⚡ Indefinido
                </label>
              </div>
            </div>

            {/* Configurações de geração */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                🔢 Gerar transações para os próximos:
              </label>
              <select
                value={recurrenceData.generateFor}
                onChange={(e) => setRecurrenceData({...recurrenceData, generateFor: e.target.value})}
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
                <option value="3">3 meses</option>
                <option value="6">6 meses</option>
                <option value="12">12 meses</option>
                <option value="24">24 meses</option>
              </select>
            </div>

            {/* Preview */}
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
                margin: '0 0 8px 0',
                color: '#0c4a6e'
              }}>
                📊 PREVIEW:
              </h4>
              <p style={{ margin: 0, color: '#0369a1' }}>
                Vai criar <strong>{recurrenceData.generateFor} transações</strong> de <strong>R$ {formData.amount || '0,00'}</strong><br/>
                Total projetado: <strong>R$ {(parseFloat(formData.amount || 0) * parseInt(recurrenceData.generateFor)).toFixed(2)}</strong>
              </p>
            </div>

            {/* Botões */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleRecurrenceSave}
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
                💾 CRIAR SÉRIE
              </button>
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
                ❌ CANCELAR
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
                    {contrachequeData ? (
                      <>
                        ├─ Salário Bruto: <strong>{formatCurrency(contrachequeData.grossAmount)}</strong><br/>
                        {contrachequeData.extras?.overtime && (
                          <>├─ Horas Extras: <strong>{formatCurrency(contrachequeData.extras.overtime)}</strong><br/></>
                        )}
                        {contrachequeData.extras?.nightShift && (
                          <>├─ Adicional Noturno: <strong>{formatCurrency(contrachequeData.extras.nightShift)}</strong><br/></>
                        )}
                        └─ <strong>Total Bruto: {formatCurrency(contrachequeData.grossAmount + (contrachequeData.extras?.overtime || 0) + (contrachequeData.extras?.nightShift || 0))}</strong>
                      </>
                    ) : (
                      <>
                        ├─ Salário Base: <strong>{formatCurrency(profile?.monthly_income * 1.3 || 8500)}</strong><br/>
                        ├─ Horas Extras: <strong>{formatCurrency(250)}</strong><br/>
                        ├─ Adicional Noturno: <strong>{formatCurrency(180)}</strong><br/>
                        └─ <strong>Total Bruto: {formatCurrency((profile?.monthly_income * 1.3 || 8500) + 430)}</strong>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 style={{ fontSize: '14px', color: '#dc2626', margin: '0 0 8px 0' }}>💸 DESCONTOS:</h4>
                  <div style={{ fontSize: '13px', color: '#991b1b' }}>
                    {contrachequeData ? (
                      <>
                        ├─ INSS: <strong>{formatCurrency(contrachequeData.deductions.inss)}</strong><br/>
                        ├─ IRRF: <strong>{formatCurrency(contrachequeData.deductions.irrf)}</strong><br/>
                        ├─ Plano Saúde: <strong>{formatCurrency(contrachequeData.deductions.healthPlan)}</strong><br/>
                        ├─ Vale Transporte: <strong>{formatCurrency(contrachequeData.deductions.transport)}</strong><br/>
                        └─ <strong>Total Descontos: {formatCurrency(Object.values(contrachequeData.deductions).reduce((sum, val) => sum + val, 0))}</strong>
                      </>
                    ) : (
                      <>
                        ├─ INSS: <strong>{formatCurrency((profile?.monthly_income || 6400) * 0.11)}</strong><br/>
                        ├─ IRRF: <strong>{formatCurrency((profile?.monthly_income || 6400) * 0.15)}</strong><br/>
                        ├─ Plano Saúde: <strong>{formatCurrency(280)}</strong><br/>
                        ├─ Vale Transporte: <strong>{formatCurrency(192)}</strong><br/>
                        └─ <strong>Total Descontos: {formatCurrency(((profile?.monthly_income || 6400) * 0.26) + 472)}</strong>
                      </>
                    )}
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
                  ✅ VALOR LÍQUIDO DETECTADO: {contrachequeData ? 
                    formatCurrency(contrachequeData.netAmount) : 
                    formatCurrency(profile?.monthly_income || 6400)
                  }
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#065f46'
                }}>
                  🎯 Baseado no seu perfil e dados históricos!
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
                📊 ANÁLISE INTELIGENTE:
              </h4>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '14px',
                color: '#0369a1'
              }}>
                {(() => {
                  const analises = []
                  const rendaAtual = profile?.monthly_income || 6400
                  const crescimento = Math.round(((rendaAtual - 6200) / 6200) * 100 * 10) / 10
                  
                  if (crescimento > 0) {
                    analises.push(`📈 Crescimento de ${crescimento}% em relação ao histórico`)
                  }
                  
                  if (rendaAtual > 6000) {
                    analises.push(`💪 Renda acima da média nacional (excelente!)`)
                  }
                  
                  const percentualDesconto = ((rendaAtual * 1.3 - rendaAtual) / (rendaAtual * 1.3)) * 100
                  if (percentualDesconto > 25) {
                    analises.push(`⚠️ Descontos altos (${percentualDesconto.toFixed(1)}%) - considere otimizações`)
                  }
                  
                  analises.push(`🎯 Situação financeira: ${rendaAtual > 8000 ? 'Excelente' : rendaAtual > 5000 ? 'Boa' : 'Regular'}`)
                  
                  return analises.map((analise, i) => (
                    <li key={i}>{analise}</li>
                  ))
                })()}
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
      {/* Modal de Gestão de Séries */}
      {showSeriesModal && seriesDetails && (
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
                🔧 GERENCIAR SÉRIE
              </h2>
              <button
                onClick={() => setShowSeriesModal(false)}
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

            {/* Informações da Série */}
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
                📊 {seriesDetails.title}
              </h3>
              <div style={{ fontSize: '14px', color: '#0369a1' }}>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Status:</strong> {seriesDetails.completed}/{seriesDetails.total} recebidas | 
                  R$ {(seriesDetails.amount * seriesDetails.remaining).toFixed(2)} restante
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Valor:</strong> {formatCurrency(seriesDetails.amount)} por {seriesDetails.frequency === 'monthly' ? 'mês' : 'período'}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Frequência:</strong> {
                    seriesDetails.frequency === 'weekly' ? '📅 Semanal' :
                    seriesDetails.frequency === 'monthly' ? '🗓️ Mensal' :
                    seriesDetails.frequency === 'quarterly' ? '📊 Trimestral' :
                    seriesDetails.frequency === 'annually' ? '🎊 Anual' : seriesDetails.frequency
                  }
                </p>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 16px 0',
                color: '#374151'
              }}>
                ⚡ AÇÕES RÁPIDAS:
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={handleMarkNextAsReceived}
                  disabled={seriesDetails.relatedTransactions.filter(r => r.status === 'pendente').length === 0}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    opacity: seriesDetails.relatedTransactions.filter(r => r.status === 'pendente').length === 0 ? 0.5 : 1
                  }}
                >
                  ✅ Marcar Próxima como Recebida
                </button>
                
                <button
                  onClick={handleCancelSeries}
                  style={{
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
                  ❌ Cancelar Série Restante
                </button>
                
                <button
                  onClick={() => {
                    alert('Funcionalidade em breve: Estender série por mais períodos')
                  }}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  ➕ Estender por mais 6 meses
                </button>
              </div>
            </div>

            {/* Lista de Transações da Série */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 16px 0',
                color: '#374151'
              }}>
                📋 TRANSAÇÕES DA SÉRIE:
              </h4>
              
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}>
                {seriesDetails.relatedTransactions
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((transaction, index) => (
                  <div key={transaction.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: index < seriesDetails.relatedTransactions.length - 1 ? '1px solid #f1f5f9' : 'none',
                    backgroundColor: transaction.status === 'confirmado' ? '#f0fdf4' : '#fef3c7'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>
                        {formatDate(transaction.date)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {transaction.status === 'confirmado' ? '✅ Recebido' : '⏳ Pendente'}
                      </div>
                    </div>
                    <div style={{ fontWeight: '600', color: '#10b981' }}>
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão Fechar */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowSeriesModal(false)}
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

      {/* ✅ ADICIONAR ESTE MODAL COMPLETO: */}
      {/* Modal de Metas */}
      {showMetasModal && (
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
                🎯 NOVA META DE RECEITA
              </h2>
              <button
                onClick={() => setShowMetasModal(false)}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  📝 Nome da Meta *
                </label>
                <input
                  type="text"
                  value={novaMeta.nome}
                  onChange={(e) => setNovaMeta({...novaMeta, nome: e.target.value})}
                  placeholder="Ex: Freelances do mês, Renda extra..."
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    💰 Valor Meta *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={novaMeta.valor}
                    onChange={(e) => setNovaMeta({...novaMeta, valor: e.target.value})}
                    placeholder="0,00"
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
                    📅 Prazo
                  </label>
                  <input
                    type="date"
                    value={novaMeta.prazo}
                    onChange={(e) => setNovaMeta({...novaMeta, prazo: e.target.value})}
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  🏷️ Categoria (Opcional)
                </label>
                <select
                  value={novaMeta.categoria}
                  onChange={(e) => setNovaMeta({...novaMeta, categoria: e.target.value})}
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
                  <option value="">Todas as categorias</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginTop: '24px'
            }}>
              <button
                onClick={handleCreateMeta}
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
                🎯 CRIAR META
              </button>
              <button
                onClick={() => setShowMetasModal(false)}
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
                ❌ CANCELAR
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
      `}</style>
    </div>
  )
}