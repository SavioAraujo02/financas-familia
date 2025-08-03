'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Sidebar from '@/components/layout/Sidebar'
import { ResumoRapido } from '@/components/receitas/ResumoRapido'
import { FiltrosInteligentes } from '@/components/receitas/FiltrosInteligentes'
import { NovaReceita } from '@/components/receitas/NovaReceita'
import { ListaReceitas } from '@/components/receitas/ListaReceitas'
import { AnaliseInteligente } from '@/components/receitas/AnaliseInteligente'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    responsible: 'todos', // 'voce', 'esposa', 'todos'
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
    responsible: 'voce',
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
        'Responsável': receita.responsible === 'voce' ? 'Você' : 
                      receita.responsible === 'esposa' ? 'Esposa' : 'Compartilhado',
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

  const corrigirresponsibleReceitas = async () => {
    try {
      const { transactions } = await import('@/lib/supabase')
      
      // Buscar receitas sem responsável definido
      const receitasSemresponsible = receitas.filter(r => !r.responsible)
      
      if (receitasSemresponsible.length > 0) {
        console.log(`🔧 Corrigindo ${receitasSemresponsible.length} receitas sem responsável`)
        
        for (const receita of receitasSemresponsible) {
          // Definir responsável baseado na descrição ou valor padrão
          let novoresponsible = 'voce'
          
          const desc = receita.description.toLowerCase()
          if (desc.includes('esposa') || desc.includes('ela') || desc.includes('mulher')) {
            novoresponsible = 'esposa'
          }
          
          await transactions.update(receita.id, {
            responsible: novoresponsible
          })
        }
        
        // Recarregar dados após correção
        await loadData()
        alert(`✅ Corrigidas ${receitasSemresponsible.length} receitas sem responsável definido!`)
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
    console.log('🔄 Receitas carregadas:', receitas.length) // DEBUG
    if (receitas.length > 0) {
      setReceitasFiltradas(receitas) // Inicializar com todas as receitas
      console.log('✅ ReceitasFiltradas inicializadas:', receitas.length) // DEBUG
    }
  }, [receitas])

  useEffect(() => {
    if (user && receitas.length > 0) {
      loadMetasReceitas()
    }
  }, [user, receitas])

  // Função para calcular próxima recorrência
  const calcularProximaRecorrencia = (serie) => {
    const hoje = new Date()
    let proximaData = new Date(serie.start_date)
    
    // Avançar até encontrar data futura
    while (proximaData <= hoje) {
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
    
    return proximaData
  }

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

      console.log('💰 Renda familiar configurada:', rendaFamiliar)

      if (rendaFamiliar === 0) {
        console.log('⚠️ ATENÇÃO: Renda familiar não configurada!')
        // Você pode definir uma meta padrão ou mostrar um aviso
      }

      setMetaMensal(rendaFamiliar)
      
      // 2. CARREGAR TODAS AS TRANSAÇÕES
      const { data: transactionsData } = await transactions.getAll(currentUser.id)
      const receitasData = (transactionsData || []).filter(t => t.type === 'receita')
      setReceitas(receitasData)

      // CORREÇÃO FORÇADA DE RESPONSÁVEIS
      console.log('🔧 Verificando responsáveis das receitas...')
      let receitasCorrigidas = 0

      for (const receita of receitasData) {
        if (!receita.responsible || receita.responsible === 'undefined' || receita.responsible === '') {
          console.log(`🔧 Corrigindo receita: ${receita.description} - ID: ${receita.id}`)
          
          try {
            await transactions.update(receita.id, {
              responsible: 'voce'
            })
            receitasCorrigidas++
          } catch (error) {
            console.error('Erro ao corrigir receita:', receita.id, error)
          }
        }
      }

      if (receitasCorrigidas > 0) {
        console.log(`✅ ${receitasCorrigidas} receitas corrigidas! Recarregando dados...`)
        
        // Recarregar dados após correção
        const { data: transactionsDataAtualizada } = await transactions.getAll(currentUser.id)
        const receitasDataAtualizada = (transactionsDataAtualizada || []).filter(t => t.type === 'receita')
        setReceitas(receitasDataAtualizada)
      }
      
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
  
      // 6. CALCULAR DADOS DA FAMÍLIA - DEBUG COMPLETO
      console.log('🔍 =================================')
      console.log('🔍 DEBUG: Calculando dados da família...')
      console.log('📊 Total de receitas do mês:', totalReceitasMes)
      console.log('📊 Receitas do mês atual:', receitasMesAtual.length)

      // Vamos ver CADA receita individualmente
      console.log('📋 LISTA COMPLETA DE RECEITAS DO MÊS:')
      receitasMesAtual.forEach((receita, index) => {
        console.log(`${index + 1}. ${receita.description} - R$ ${receita.amount} - Responsável: "${receita.responsible || 'SEM RESPONSÁVEL'}"`)
      })

      // Calcular receitas por responsável COM DEBUG
      console.log('🔍 Filtrando por responsável...')

      // LÓGICA CORRIGIDA - SEM DUPLICAÇÃO
      const receitasVoce = receitasMesAtual.filter(r => {
        const isVoce = r.responsible === 'voce'
        console.log(`- ${r.description}: responsável="${r.responsible}" → isVoce=${isVoce}`)
        return isVoce
      })

      const receitasEsposa = receitasMesAtual.filter(r => {
        const isEsposa = r.responsible === 'esposa'
        console.log(`- ${r.description}: responsável="${r.responsible}" → isEsposa=${isEsposa}`)
        return isEsposa
      })

      const receitasCompartilhadas = receitasMesAtual.filter(r => {
        const isCompartilhado = r.responsible === 'compartilhado'
        console.log(`- ${r.description}: responsável="${r.responsible}" → isCompartilhado=${isCompartilhado}`)
        return isCompartilhado
      })

      // Receitas sem responsável definido (dados antigos) - SEM FALLBACK
      const receitasSemresponsible = receitasMesAtual.filter(r => {
        const semResp = !r.responsible || r.responsible === '' || r.responsible === 'undefined'
        console.log(`- ${r.description}: responsável="${r.responsible}" → semResponsável=${semResp}`)
        return semResp
      })

      // Calcular totais
      const totalVoce = receitasVoce.reduce((sum, r) => sum + r.amount, 0)
      const totalEsposa = receitasEsposa.reduce((sum, r) => sum + r.amount, 0)
      const totalCompartilhadas = receitasCompartilhadas.reduce((sum, r) => sum + r.amount, 0)
      const totalSemresponsible = receitasSemresponsible.reduce((sum, r) => sum + r.amount, 0)

      console.log('💰 TOTAIS POR CATEGORIA:')
      console.log('- Você:', totalVoce)
      console.log('- Esposa:', totalEsposa)
      console.log('- Compartilhadas:', totalCompartilhadas)
      console.log('- Sem Responsável:', totalSemresponsible)
      console.log('- SOMA:', totalVoce + totalEsposa + totalCompartilhadas + totalSemresponsible)
      console.log('- TOTAL ESPERADO:', totalReceitasMes)

      // Distribuir receitas compartilhadas e sem responsável (50/50)
      const metadeCompartilhadas = totalCompartilhadas / 2
      const metadeSemresponsible = totalSemresponsible / 2

      const finalVoce = totalVoce + metadeCompartilhadas + metadeSemresponsible
      const finalEsposa = totalEsposa + metadeCompartilhadas + metadeSemresponsible

      console.log('💰 CÁLCULO FINAL:')
      console.log('- Você: base=' + totalVoce + ' + compartilhadas=' + metadeCompartilhadas + ' + semResp=' + metadeSemresponsible + ' = ' + finalVoce)
      console.log('- Esposa: base=' + totalEsposa + ' + compartilhadas=' + metadeCompartilhadas + ' + semResp=' + metadeSemresponsible + ' = ' + finalEsposa)
      console.log('- SOMA FINAL:', finalVoce + finalEsposa)

      // Calcular percentuais REAIS
      const percentualVoce = totalReceitasMes > 0 ? ((finalVoce / totalReceitasMes) * 100).toFixed(1) : 0
      const percentualEsposa = totalReceitasMes > 0 ? ((finalEsposa / totalReceitasMes) * 100).toFixed(1) : 0

      const dadosFamiliaReais = {
        voce: { 
          nome: "Você", 
          total: finalVoce, 
          percentual: percentualVoce
        },
        esposa: { 
          nome: "Esposa", 
          total: finalEsposa, 
          percentual: percentualEsposa
        }
      }

      console.log('✅ RESULTADO FINAL:', dadosFamiliaReais)
      console.log('🔍 =================================')

    // ✅ DEBUG: Log para verificar os cálculos
    console.log('📊 DEBUG RESUMO FAMILIAR:', {
      totalReceitasMes,
      receitasVoce,
      receitasEsposa,
      receitasCompartilhadas,
      receitasSemresponsible,
      totalVoce,
      totalEsposa,
      dadosFamiliaReais
    })
  
      // Atualizar o estado
      setDadosFamiliaCalculado(dadosFamiliaReais)

      // 7. CALCULAR PRÓXIMOS RECEBIMENTOS REAIS
      console.log('🔮 Calculando próximos recebimentos...')
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() + 30) // Próximos 30 dias

      const proximosRecebimentosReais = []

      // 1. Buscar receitas pendentes dos próximos 30 dias
      const receitasPendentes = receitasData.filter(r => {
        const dataReceita = new Date(r.date)
        return dataReceita > hoje && dataReceita <= dataLimite && r.status === 'pendente'
      })

      console.log('📅 Receitas pendentes próximos 30 dias:', receitasPendentes.length)

      receitasPendentes.forEach(receita => {
        console.log('📝 Adicionando receita pendente:', receita.description, receita.date)
        proximosRecebimentosReais.push({
          data: new Date(receita.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          descricao: receita.description,
          valor: receita.amount,
          responsible: receita.responsible || 'voce',
          dataOrdem: new Date(receita.date)
        })
      })

      // 2. Se não há receitas pendentes, buscar próximas recorrências (APENAS UMA VEZ POR SÉRIE)
      if (proximosRecebimentosReais.length === 0 && series && series.length > 0) {
        console.log('📊 Calculando próximas recorrências...')
        console.log('📊 Séries ativas encontradas:', series.filter(s => s.is_active).length)
        
        const seriesProcessadas = new Set() // ✅ EVITAR DUPLICAÇÃO
        
        series.forEach(serie => {
          if (serie.is_active && !seriesProcessadas.has(serie.id)) { // ✅ VERIFICAR SE JÁ FOI PROCESSADA
            console.log('🔄 Processando série:', serie.title, 'ID:', serie.id)
            
            const proximaData = calcularProximaRecorrencia(serie)
            if (proximaData && proximaData <= dataLimite) {
              console.log('📅 Próxima data calculada:', proximaData.toLocaleDateString('pt-BR'))
              
              proximosRecebimentosReais.push({
                data: proximaData.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                descricao: `${serie.title} (Recorrente)`,
                valor: serie.amount,
                responsible: 'voce',
                dataOrdem: proximaData
              })
              
              seriesProcessadas.add(serie.id) // ✅ MARCAR COMO PROCESSADA
            }
          }
        })
      }

      // 3. Ordenar por data e pegar os primeiros 4
      proximosRecebimentosReais.sort((a, b) => a.dataOrdem - b.dataOrdem)
      const proximosLimitados = proximosRecebimentosReais.slice(0, 4) // ✅ LIMITAR A 4

      console.log('✅ Próximos recebimentos finais:', proximosLimitados.length)
      proximosLimitados.forEach((p, i) => {
        console.log(`${i + 1}. ${p.descricao} - ${p.data} - ${formatCurrency(p.valor)}`)
      })

      // ✅ USAR A VERSÃO LIMITADA
      setProximosRecebimentosCalculado(proximosLimitados)
  
  
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
        responsible: formData.responsible 
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
        responsible: 'voce',
        frequencia: 'unica'
      })
      
    } catch (error) {
      console.error('Erro ao salvar receita:', error)
      alert('Erro ao salvar receita. Tente novamente.')
    }
  }

  // Função para salvar recorrência
// Função para salvar recorrência - VERSÃO CORRIGIDA
const handleRecurrenceSave = async () => {
  try {
    console.log('🔄 Iniciando criação de série recorrente...')
    
    if (!formData.description || !formData.amount || !formData.category_id) {
      alert('Por favor, preencha todos os campos obrigatórios primeiro')
      return
    }

    const { recurringTransactions, transactions } = await import('@/lib/supabase')
    
    console.log('📝 Dados da recorrência:', {
      title: formData.description,
      amount: parseFloat(formData.amount),
      category_id: formData.category_id,
      frequency: recurrenceData.frequency,
      startDate: recurrenceData.startDate,
      generateFor: recurrenceData.generateFor
    })
    
    // 1. Criar a série recorrente
    const recurringData = {
      user_id: user.id,
      title: formData.description,
      amount: parseFloat(formData.amount),
      category_id: formData.category_id,
      frequency: recurrenceData.frequency,
      start_date: recurrenceData.startDate,
      end_date: recurrenceData.indefinite ? null : recurrenceData.endDate,
      total_occurrences: recurrenceData.indefinite ? null : parseInt(recurrenceData.generateFor),
      is_active: true
    }

    console.log('💾 Criando série recorrente...')
    const { data: recurring, error: recurringError } = await recurringTransactions.create(recurringData)
    
    if (recurringError) {
      console.error('❌ Erro ao criar série:', recurringError)
      alert('Erro ao criar série recorrente: ' + recurringError.message)
      return
    }
    
    console.log('✅ Série criada:', recurring)
    
    // 2. Gerar transações futuras
    if (recurring && recurring.length > 0) {
      const serieId = recurring[0].id
      console.log('📅 Gerando transações para série ID:', serieId)
      
      const transacoesGeradas = []
      const dataInicio = new Date(recurrenceData.startDate)
      const quantidadeMeses = parseInt(recurrenceData.generateFor)
      
      for (let i = 0; i < quantidadeMeses; i++) {
        const dataTransacao = new Date(dataInicio)
        
        // Calcular data baseada na frequência
        switch (recurrenceData.frequency) {
          case 'weekly':
            dataTransacao.setDate(dataInicio.getDate() + (i * 7))
            break
          case 'monthly':
            dataTransacao.setMonth(dataInicio.getMonth() + i)
            break
          case 'quarterly':
            dataTransacao.setMonth(dataInicio.getMonth() + (i * 3))
            break
          case 'annually':
            dataTransacao.setFullYear(dataInicio.getFullYear() + i)
            break
          default:
            dataTransacao.setMonth(dataInicio.getMonth() + i)
        }
        
        const transacaoData = {
          user_id: user.id,
          category_id: formData.category_id,
          type: 'receita',
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: dataTransacao.toISOString().split('T')[0],
          status: i === 0 ? 'confirmado' : 'pendente', // Primeira como confirmada, resto pendente
          recurring_id: serieId,
          responsible: formData.responsavel || 'voce'
        }
        
        transacoesGeradas.push(transacaoData)
      }
      
      console.log(`📊 Criando ${transacoesGeradas.length} transações...`)
      
      // Criar todas as transações
      for (const transacao of transacoesGeradas) {
        console.log(`📝 Criando transação: ${transacao.description} - ${transacao.date}`)
        const { error: transactionError } = await transactions.create(transacao)
        
        if (transactionError) {
          console.error('❌ Erro ao criar transação:', transactionError)
        }
      }
      
      console.log('✅ Todas as transações criadas!')
      
      // 3. Recarregar dados
      console.log('🔄 Recarregando dados...')
      await loadData()
      
      // 4. Fechar modal e limpar formulário
      setShowRecurrenceModal(false)
      
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category_id: '',
        status: 'confirmado',
        responsavel: 'voce',
        frequencia: 'unica'
      })
      
      setRecurrenceData({
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        indefinite: true,
        occurrences: 12,
        generateFor: '12'
      })
      
      alert(`🎉 Série recorrente criada com sucesso!\n\n📊 ${transacoesGeradas.length} receitas geradas\n💰 Total projetado: ${formatCurrency(parseFloat(formData.amount) * transacoesGeradas.length)}`)
      
    } else {
      console.error('❌ Série não foi criada corretamente')
      alert('Erro: Série não foi criada corretamente')
    }
    
  } catch (error) {
    console.error('❌ Erro geral ao criar recorrência:', error)
    alert('Erro ao criar recorrência: ' + error.message)
  }
}

// Estados para receitas filtradas
const [receitasFiltradas, setReceitasFiltradas] = useState([])

const applyFilters = async (periodo, responsible, busca) => {
  try {
    console.log('🔍 Aplicando filtros:', { periodo, responsible, busca }) // DEBUG
    
    const { auth, transactions } = await import('@/lib/supabase')
    const { user: currentUser } = await auth.getUser()
    
    const { data: transactionsData } = await transactions.getAll(currentUser.id)
    let receitasData = (transactionsData || []).filter(t => t.type === 'receita')
    
    console.log('📊 Receitas antes do filtro:', receitasData.length) // DEBUG
    
    const hoje = new Date()
    let filteredData = [...receitasData]
    
    // Filtro por período
    if (periodo === 'este_mes') {
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
      filteredData = filteredData.filter(r => r.date >= inicioMes && r.date <= fimMes)
      console.log('📅 Filtro este_mes aplicado:', filteredData.length) // DEBUG
    } else if (periodo === 'fixas') {
      filteredData = filteredData.filter(r => r.recurring_id !== null)
      console.log('💰 Filtro fixas aplicado:', filteredData.length) // DEBUG
    } else if (periodo === 'variaveis') {
      filteredData = filteredData.filter(r => r.recurring_id === null)
      console.log('🔄 Filtro variáveis aplicado:', filteredData.length) // DEBUG
    }
    
    // Filtro por responsável
    if (responsible === 'voce') {
      filteredData = filteredData.filter(r => (r.responsible || 'voce') === 'voce')
      console.log('👨 Filtro você aplicado:', filteredData.length) // DEBUG
    } else if (responsible === 'esposa') {
      filteredData = filteredData.filter(r => r.responsible === 'esposa')
      console.log('👩 Filtro esposa aplicado:', filteredData.length) // DEBUG
    }
    
    // Filtro por busca
    if (busca && busca.trim() !== '') {
      filteredData = filteredData.filter(r => 
        r.description.toLowerCase().includes(busca.toLowerCase())
      )
      console.log('🔍 Filtro busca aplicado:', filteredData.length) // DEBUG
    }
    
    console.log('✅ Resultado final:', filteredData.length) // DEBUG
    
    // ✅ IMPORTANTE: Atualizar o estado
    setReceitasFiltradas(filteredData)
    
  } catch (error) {
    console.error('❌ Erro ao aplicar filtros:', error)
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
    if (filtros.responsible !== 'todos') {
      receitasData = receitasData.filter(r => r.responsible === filtros.responsible)
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
        responsible: editData.responsible
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

  const getResponsavelIcon = (responsible) => {
    switch (responsible) {
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
                    {(() => {
                      const diferenca = totalMes - metaMensal
                      const metaAtingida = diferenca >= 0
                      
                      return metaAtingida 
                        ? `| Mês Atual: ${formatCurrency(totalMes)} | Meta: ${formatCurrency(metaMensal)} (✅ ${progressoMeta}%)`
                        : `| Mês Atual: ${formatCurrency(totalMes)} | Meta: ${formatCurrency(metaMensal)} (${progressoMeta}%)`
                    })()}
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
              {(() => {
                const diferenca = totalMes - metaMensal
                const metaAtingida = diferenca >= 0
                
                return (
                  <>
                    <div style={{ fontSize: '12px', marginBottom: '4px', textAlign: 'center' }}>
                      {metaAtingida ? `🎉 Meta atingida: ${progressoMeta}%` : `Meta Mensal: ${progressoMeta}%`}
                    </div>
                    <div style={{
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      height: '6px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        backgroundColor: metaAtingida ? '#10b981' : 'white',
                        height: '100%',
                        width: `${Math.min(progressoMeta, 100)}%`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '4px', textAlign: 'center' }}>
                      {metaAtingida 
                        ? `Excedeu: +${formatCurrency(diferenca)}`
                        : `Faltam: ${formatCurrency(-diferenca)}`
                      }
                    </div>
                  </>
                )
              })()}
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
            <NovaReceita 
              formMode={formMode}
              setFormMode={setFormMode}
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              handleSubmit={handleSubmit}
              setShowRecurrenceModal={setShowRecurrenceModal}
              setShowContrachequeModal={setShowContrachequeModal}
            />

            {/* Filtros + Resumo */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <FiltrosInteligentes 
                filtros={filtros}
                setFiltros={setFiltros}
                applyFilters={applyFilters}
                applyAdvancedFilters={applyAdvancedFilters}
                showFiltroAvancado={showFiltroAvancado}
                setShowFiltroAvancado={setShowFiltroAvancado}
              />

              <ResumoRapido 
                totalMes={totalMes}
                dadosFamiliaCalculado={dadosFamiliaCalculado}
                metaMensal={metaMensal}
                formatCurrency={formatCurrency}
                corrigirresponsibleReceitas={corrigirresponsibleReceitas}
              />
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
                          {getResponsavelIcon(recebimento.responsible)}
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

          <ListaReceitas 
            receitas={receitas}
            receitasFiltradas={receitasFiltradas}
            viewMode={viewMode}
            setViewMode={setViewMode}
            editingId={editingId}
            setEditingId={setEditingId}
            editData={editData}
            setEditData={setEditData}
            handleSaveEdit={handleSaveEdit}
            handleOpenSeriesModal={handleOpenSeriesModal}
            handleExport={handleExport}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusIcon={getStatusIcon}
            getResponsavelIcon={getResponsavelIcon}
            evolucaoCalculada={evolucaoCalculada}
            insights={insights}
            categoriasPieCalculadas={categoriasPieCalculadas}
            totalMes={totalMes}
          />

          <AnaliseInteligente 
            evolucaoCalculada={evolucaoCalculada}
            categoriasPieCalculadas={categoriasPieCalculadas} 
            totalMes={totalMes}
            recurringSeries={recurringSeries}
            formatCurrency={formatCurrency}
          />
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