'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import Sidebar from '@/components/layout/Sidebar'

export default function DespesasRevolucionaria() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [despesas, setDespesas] = useState([])
  const [categories, setCategories] = useState([])
  const [cartoes, setCartoes] = useState([])
  
  // Estados do formulário
  const [tipoFormulario, setTipoFormulario] = useState('avista') // 'avista', 'parcelada', 'fixa', 'variavel'
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    payment_method: 'dinheiro', // 'dinheiro', 'debito', 'credito'
    responsible: 'voce',
    // Para parceladas
    card_id: '',
    installments: 1,
    // Para fixas/recorrentes
    due_day: '',
    frequency: 'monthly',
    recurrence_months: 12
  })
  
  // Estados do simulador
  const [simuladorData, setSimuladorData] = useState({
    impactoOrcamento: 0,
    faturaDestino: '',
    sugestao: '',
    alertas: []
  })

  const [filtros, setFiltros] = useState({
    periodo: 'este_mes',
    categoria: 'todas',
    responsavel: 'todos',
    tipo: 'todas', // 'avista', 'parcelada', 'fixa', 'variavel'
    busca: ''
  })
  const [despesasFiltradas, setDespesasFiltradas] = useState([])
  const [viewMode, setViewMode] = useState('lista') // 'lista', 'grafico'

  // Estados para dados reais
  const [orcamentoMensal, setOrcamentoMensal] = useState(0)
  const [totalMes, setTotalMes] = useState(0)
  const [progressoOrcamento, setProgressoOrcamento] = useState(0)
  const [finBotDica, setFinBotDica] = useState("Carregando análise inteligente...")

  // Carregar dados
  useEffect(() => {
    loadData()
  }, [])

  // Atualizar simulador quando formulário muda
  useEffect(() => {
    if (formData.amount && parseFloat(formData.amount) > 0) {
      calcularSimulador()
    }
  }, [formData.amount, formData.date, formData.card_id, formData.installments, tipoFormulario])

  const loadData = async () => {
    try {
      const { auth, transactions, categories: categoriesAPI, cards, profiles } = await import('@/lib/supabase')
      
      const { user: currentUser } = await auth.getUser()
      if (!currentUser) {
        window.location.href = '/auth/login'
        return
      }
      
      setUser(currentUser)
      setProfile({ name: currentUser.email?.split('@')[0] || 'Usuário' })
      
      // Carregar despesas
      const { data: transactionsData } = await transactions.getAll(currentUser.id)
      const despesasData = (transactionsData || []).filter(t => t.type === 'despesa')
      setDespesas(despesasData)
      
      // Carregar categorias de despesa
      const { data: categoriesData } = await categoriesAPI.getAll(currentUser.id)
      let despesaCategories = (categoriesData || []).filter(c => c.type === 'despesa')
      
      if (despesaCategories.length === 0) {
        await createDefaultCategories(currentUser.id, categoriesAPI)
        const { data: newCategoriesData } = await categoriesAPI.getAll(currentUser.id)
        despesaCategories = (newCategoriesData || []).filter(c => c.type === 'despesa')
      }
      
      setCategories(despesaCategories)
      
            // Carregar cartões
            const { data: cartoesData } = await cards.getAll(currentUser.id)
            setCartoes(cartoesData || [])
            
            // ✅ ADICIONAR ESTES CÁLCULOS REAIS:
            // 1. CALCULAR TOTAL DO MÊS ATUAL
            const hoje = new Date()
            const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
            const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
            
            const despesasMesAtual = despesasData.filter(d => 
              d.date >= inicioMes && d.date <= fimMes && d.status === 'confirmado'
            )
            const totalDespesasMes = despesasMesAtual.reduce((sum, d) => sum + (d.amount || 0), 0)
            
            // 2. DEFINIR ORÇAMENTO BASEADO NA RENDA
            const { data: profileData } = await profiles.get(currentUser.id)
            const rendaFamiliar = profileData?.monthly_income || 0

            // ✅ VERIFICAR SE TEM RENDA CADASTRADA:
            let orcamentoCalculado = 0
            let dicaInteligente = "Analisando seus gastos..."

            if (rendaFamiliar === 0) {
              // Sem renda cadastrada - usar orçamento padrão ou pedir para cadastrar
              orcamentoCalculado = 0
              dicaInteligente = "⚠️ Cadastre sua renda mensal para calcular o orçamento automaticamente!"
            } else {
              orcamentoCalculado = Math.round(rendaFamiliar * 0.8)
              
              // 3. CALCULAR PROGRESSO
              const progressoCalculado = orcamentoCalculado > 0 ? 
                Math.round((totalDespesasMes / orcamentoCalculado) * 100) : 0

              // 4. GERAR DICA INTELIGENTE
              if (progressoCalculado <= 70) {
                dicaInteligente = `🎉 Excelente controle! Apenas ${progressoCalculado}% do orçamento usado. Vocês estão no caminho certo!`
              } else if (progressoCalculado <= 85) {
                dicaInteligente = `✅ Bom controle! ${progressoCalculado}% do orçamento usado. Mantenham o foco!`
              } else if (progressoCalculado <= 100) {
                dicaInteligente = `⚠️ Atenção! ${progressoCalculado}% do orçamento usado. Cuidado com gastos extras!`
              } else {
                dicaInteligente = `🚨 Orçamento estourado! ${progressoCalculado}% usado. Hora de revisar os gastos!`
              }
              
              // Atualizar progresso
              setProgressoOrcamento(progressoCalculado)
            }

            // 5. ATUALIZAR ESTADOS
            setTotalMes(totalDespesasMes)
            setOrcamentoMensal(orcamentoCalculado)
            setFinBotDica(dicaInteligente)  

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultCategories = async (userId, categoriesAPI) => {
    const defaultDespesas = [
      { name: 'Moradia', icon: '🏠', color: '#ef4444' },
      { name: 'Alimentação', icon: '🍔', color: '#f59e0b' },
      { name: 'Transporte', icon: '🚗', color: '#3b82f6' },
      { name: 'Saúde', icon: '💊', color: '#10b981' },
      { name: 'Lazer', icon: '🎮', color: '#8b5cf6' },
      { name: 'Educação', icon: '📚', color: '#06b6d4' },
      { name: 'Roupas', icon: '👕', color: '#ec4899' },
      { name: 'Outros', icon: '📦', color: '#6b7280' }
    ]

    for (const cat of defaultDespesas) {
      await categoriesAPI.create({
        user_id: userId,
        name: cat.name,
        type: 'despesa',
        icon: cat.icon,
        color: cat.color
      })
    }
  }

  const calcularSimulador = () => {
    const valorTotal = parseFloat(formData.amount)
    const valor = tipoFormulario === 'parcelada' ? 
      valorTotal / formData.installments : 
      valorTotal  // ✅ VALOR DA PARCELA SE FOR PARCELADA
    
    const impacto = Math.round((valor / orcamentoMensal) * 100)
    
    let simulador = {
      impactoOrcamento: impacto,
      faturaDestino: '',
      sugestao: '',
      alertas: []
    }

    // ✅ ANÁLISE MAIS INTELIGENTE:
    if (tipoFormulario === 'parcelada' && formData.card_id) {
      const cartao = cartoes.find(c => c.id === formData.card_id)
      if (cartao) {
        const dataCompra = new Date(formData.date)
        const diaCompra = dataCompra.getDate()
        const diaFechamento = cartao.closing_day
        
        let mesDestino = dataCompra.getMonth()
        let anoDestino = dataCompra.getFullYear()
        
        if (diaCompra > diaFechamento) {
          mesDestino += 1
          if (mesDestino > 11) {
            mesDestino = 0
            anoDestino += 1
          }
        }
        
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        simulador.faturaDestino = `${meses[mesDestino]}/${anoDestino.toString().slice(-2)}`
        
        const valorParcela = valor / formData.installments
        simulador.sugestao = `${formData.installments}x de ${formatCurrency(valorParcela)} na fatura ${simulador.faturaDestino}`
        simulador.sugestao = `${formData.installments}x de ${formatCurrency(valorParcela)} na fatura ${simulador.faturaDestino}`

        // ✅ ADICIONAR ESTE BLOCO AQUI:
        // Alertas inteligentes de fechamento
        if (diaCompra <= diaFechamento && (diaFechamento - diaCompra) <= 3) {
          simulador.alertas.push(`💡 DICA: Aguarde ${diaFechamento - diaCompra + 1} dias para a compra cair na próxima fatura`)
        }

        // Sugestão de melhor data
        if (diaCompra <= diaFechamento && (diaFechamento - diaCompra) <= 5) {
          const proximaFatura = new Date(dataCompra)
          proximaFatura.setMonth(proximaFatura.getMonth() + 1)
          const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
          const proximoMes = meses[proximaFatura.getMonth()]
          
          simulador.alertas.push(`🎯 SUGESTÃO: Compre após dia ${diaFechamento} para cair na fatura ${proximoMes}/${proximaFatura.getFullYear().toString().slice(-2)}`)
        }
        
        // ✅ ALERTAS MAIS ESPECÍFICOS:
        if (diaCompra <= diaFechamento && (diaFechamento - diaCompra) <= 3) {
          simulador.alertas.push(`💡 Aguarde ${diaFechamento - diaCompra + 1} dias para a compra cair na próxima fatura`)
        }
        
        // Verificar uso do cartão
        const usoAtual = cartao.used_amount || 0
        const novoUso = usoAtual + valor
        const percentualUso = Math.round((novoUso / cartao.credit_limit) * 100)
        
        if (percentualUso > 80) {
          simulador.alertas.push(`⚠️ Cartão ficará com ${percentualUso}% de uso (alto risco!)`)
        } else if (percentualUso > 60) {
          simulador.alertas.push(`🟡 Cartão ficará com ${percentualUso}% de uso (moderado)`)
        }
        
        // Sugerir melhor cartão
        const melhorCartao = cartoes
          .filter(c => c.id !== formData.card_id)
          .find(c => {
            const usoCartao = (c.used_amount || 0) + valor
            return (usoCartao / c.credit_limit) < 0.6
          })
        
        if (melhorCartao && percentualUso > 60) {
          simulador.alertas.push(`💡 Melhor usar ${melhorCartao.name} (menor impacto no limite)`)
        }
        const percentualUsoReal = Math.round(((cartao.used_amount || 0) + valor) / cartao.credit_limit * 100)

        if (percentualUsoReal > 80) {
          simulador.alertas.push(`🚨 CRÍTICO: Cartão ficará com ${percentualUsoReal}% de uso!`)
        } else if (percentualUsoReal > 60) {
          simulador.alertas.push(`⚠️ ALTO: Cartão ficará com ${percentualUsoReal}% de uso`)
        } else {
          simulador.alertas.push(`✅ SEGURO: Cartão ficará com ${percentualUsoReal}% de uso`)
        }
      }
    }
    

    // ✅ ANÁLISE DE ORÇAMENTO:
    // ✅ ANÁLISE DE ORÇAMENTO:
    if (tipoFormulario === 'parcelada') {
      if (impacto > 15) {
        simulador.alertas.push(`🚨 Alto impacto mensal: ${formatCurrency(valor)} (${impacto}% do orçamento)`)
      } else if (impacto > 10) {
        simulador.alertas.push(`⚠️ Impacto moderado: ${formatCurrency(valor)}/mês (${impacto}% do orçamento)`)
      } else {
        simulador.alertas.push(`✅ Baixo impacto: ${formatCurrency(valor)}/mês (${impacto}% do orçamento)`)
      }
      simulador.alertas.push(`📊 Total da compra: ${formatCurrency(valorTotal)} em ${formData.installments}x`)
    } else {
      if (impacto > 15) {
        simulador.alertas.push(`🚨 Alto impacto no orçamento (${impacto}%)`)
      } else if (impacto > 10) {
        simulador.alertas.push(`⚠️ Impacto moderado no orçamento (${impacto}%)`)
      } else {
        simulador.alertas.push(`✅ Baixo impacto no orçamento (${impacto}%)`)
      }
    }

    // ✅ SUGESTÕES BASEADAS NO TIPO:
    if (tipoFormulario === 'avista' && valor > 500) {
      simulador.alertas.push(`💡 Valor alto para à vista. Considere parcelar para preservar fluxo de caixa`)
    }
    
    if (tipoFormulario === 'fixa' && valor > orcamentoMensal * 0.2) {
      simulador.alertas.push(`⚠️ Despesa fixa alta (${Math.round((valor/orcamentoMensal)*100)}% do orçamento)`)
    }

    setSimuladorData(simulador)
  }


  const gerarDespesasRecorrentes = async (recurringId, meses) => {
    try {
      const { transactions } = await import('@/lib/supabase')
      
      const despesasParaGerar = []
      const dataInicio = new Date(formData.date)
      
      for (let i = 0; i < meses; i++) {
        const dataVencimento = new Date(dataInicio)
        
        if (formData.frequency === 'monthly') {
          dataVencimento.setMonth(dataInicio.getMonth() + i)
          dataVencimento.setDate(parseInt(formData.due_day))
        } else if (formData.frequency === 'quarterly') {
          dataVencimento.setMonth(dataInicio.getMonth() + (i * 3))
          dataVencimento.setDate(parseInt(formData.due_day))
        } else if (formData.frequency === 'annually') {
          dataVencimento.setFullYear(dataInicio.getFullYear() + i)
          dataVencimento.setDate(parseInt(formData.due_day))
        }
        
        despesasParaGerar.push({
          user_id: user.id,
          type: 'despesa',
          description: `${formData.description} (${i + 1}/${meses})`,
          amount: parseFloat(formData.amount),
          date: dataVencimento.toISOString().split('T')[0],
          category_id: formData.category_id,
          payment_method: formData.payment_method || 'debito',
          responsible: formData.responsible,
          status: i === 0 ? 'confirmado' : 'pendente',
          recurring_id: recurringId
          // ✅ REMOVIDO: due_day
        })
      }
      
      // Criar todas as despesas
      for (const despesa of despesasParaGerar) {
        await transactions.create(despesa)
      }
      
    } catch (error) {
      console.error('Erro ao gerar despesas recorrentes:', error)
    }
  }

  const applyFilters = async () => {
    try {
      let filteredData = [...despesas]
      
      const hoje = new Date()
      
      // Filtro por período
      if (filtros.periodo === 'este_mes') {
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
        filteredData = filteredData.filter(d => d.date >= inicioMes && d.date <= fimMes)
      } else if (filtros.periodo === 'ultimos_30') {
        const data30Dias = new Date()
        data30Dias.setDate(data30Dias.getDate() - 30)
        filteredData = filteredData.filter(d => new Date(d.date) >= data30Dias)
      }
      
      // Filtro por categoria
      if (filtros.categoria !== 'todas') {
        filteredData = filteredData.filter(d => d.category_id === filtros.categoria)
      }
      
      // Filtro por responsável
      if (filtros.responsavel !== 'todos') {
        filteredData = filteredData.filter(d => d.responsible === filtros.responsavel)
      }
      
      // Filtro por tipo
      if (filtros.tipo !== 'todas') {
        if (filtros.tipo === 'avista') {
          filteredData = filteredData.filter(d => 
            (d.payment_method === 'dinheiro' || d.payment_method === 'debito') && 
            (!d.installments || d.installments === 1)
          )
        } else if (filtros.tipo === 'parcelada') {
          filteredData = filteredData.filter(d => d.installments > 1)
        } else if (filtros.tipo === 'fixa') {
          filteredData = filteredData.filter(d => d.recurring_id !== null)
        }
      }
      
      // Filtro por busca
      if (filtros.busca) {
        filteredData = filteredData.filter(d => 
          d.description.toLowerCase().includes(filtros.busca.toLowerCase())
        )
      }
      
      setDespesasFiltradas(filteredData)
      
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error)
    }
  }

  const handleExport = () => {
    try {
      const dadosExport = (despesasFiltradas.length > 0 ? despesasFiltradas : despesas).map(despesa => ({
        'Data': new Date(despesa.date).toLocaleDateString('pt-BR'),
        'Descrição': despesa.description,
        'Categoria': despesa.categories?.name || 'Sem categoria',
        'Valor': despesa.amount,
        'Pagamento': despesa.payment_method === 'dinheiro' ? 'Dinheiro' :
                    despesa.payment_method === 'debito' ? 'Débito' :
                    despesa.payment_method === 'credito' ? 'Crédito' : 'Outros',
        'Parcelas': despesa.installments > 1 ? `${despesa.installment_number || 1}/${despesa.installments}` : '1x',
        'Status': despesa.status === 'confirmado' ? 'Confirmado' : 'Pendente',
        'Responsável': despesa.responsible === 'voce' ? 'Você' : 
                      despesa.responsible === 'esposa' ? 'Esposa' : 'Compartilhado'
      }))

      // Adicionar linha de totais
      dadosExport.push({
        'Data': '',
        'Descrição': 'TOTAL GERAL',
        'Categoria': '',
        'Valor': (despesasFiltradas.length > 0 ? despesasFiltradas : despesas)
          .reduce((sum, d) => sum + d.amount, 0),
        'Pagamento': '',
        'Parcelas': '',
        'Status': '',
        'Responsável': ''
      })

      // Converter para CSV
      const headers = Object.keys(dadosExport[0])
      const csvContent = [
        headers.join(','),
        ...dadosExport.map(row => 
          headers.map(header => {
            const value = row[header]
            if (header === 'Valor' && typeof value === 'number') {
              return `"R$ ${value.toFixed(2).replace('.', ',')}"`
            }
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
      link.setAttribute('download', `despesas_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      alert('📊 Relatório exportado com sucesso!')
      
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('❌ Erro ao exportar dados. Tente novamente.')
    }
  }

  // useEffect para aplicar filtros
  useEffect(() => {
    if (despesas.length > 0) {
      applyFilters()
    }
  }, [despesas, filtros])

  // ADICIONAR esta função ANTES do handleSubmit (aproximadamente linha 140):
  // ✅ SUBSTITUIR TODA A FUNÇÃO:
  const criarParcelas = async (transactionBase) => {
    const { transactions } = await import('@/lib/supabase')
    const valorParcela = parseFloat(formData.amount) / formData.installments
    
    for (let i = 2; i <= formData.installments; i++) {
      const dataVencimento = new Date(transactionBase.date)
      dataVencimento.setMonth(dataVencimento.getMonth() + (i - 1))
      
      const parcelaData = {
        ...transactionBase,
        installment_number: i,
        date: dataVencimento.toISOString().split('T')[0],
        description: `${transactionBase.description} (${i}/${formData.installments})`,
        amount: valorParcela
      }
      
      await transactions.create(parcelaData)
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

      // ✅ ADICIONAR LÓGICA PARA DESPESAS FIXAS:
      if (tipoFormulario === 'fixa') {
        // Criar despesa recorrente
        const { recurringTransactions } = await import('@/lib/supabase')
        
        const recurringData = {
          user_id: user.id,
          title: formData.description,
          amount: parseFloat(formData.amount),
          category_id: formData.category_id,
          frequency: formData.frequency,
          start_date: formData.date,
          is_active: true
          // ✅ REMOVIDOS: due_day, payment_method, responsible
        }
        
        const { data: recurring } = await recurringTransactions.create(recurringData)
        
        if (recurring) {
          // Gerar despesas futuras
          await gerarDespesasRecorrentes(recurring.id, formData.recurrence_months)
          alert(`✅ Despesa fixa criada! ${formData.recurrence_months} despesas geradas.`)
        }
        
        await loadData()
        
        // Limpar formulário
        setFormData({
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category_id: '',
          payment_method: 'dinheiro',
          responsible: 'voce',
          card_id: '',
          installments: 1,
          due_day: '',
          frequency: 'monthly',
          recurrence_months: 12
        })
        
        return
      }
      
      const transactionData = {
        user_id: user.id,
        type: 'despesa',
        description: formData.description,
        amount: tipoFormulario === 'parcelada' ? 
          parseFloat(formData.amount) / formData.installments : 
          parseFloat(formData.amount),  // ✅ VALOR DA PARCELA SE FOR PARCELADA
        date: formData.date,
        category_id: formData.category_id,
        payment_method: formData.payment_method,
        responsible: formData.responsible,
        status: 'confirmado'
      }
      
      // ADICIONAR campos específicos para parceladas
      if (tipoFormulario === 'parcelada') {
        transactionData.card_id = formData.card_id
        transactionData.installments = formData.installments
        transactionData.installment_number = 1
        transactionData.description = `${formData.description} (1/${formData.installments})`  // ✅ INDICAR PARCELA
      }
  
      await transactions.create(transactionData)
      
      // Se for parcelada, criar as outras parcelas
      if (tipoFormulario === 'parcelada' && formData.installments > 1) {
        await criarParcelas(transactionData)
      }
      
      await loadData()
      
      // Limpar formulário
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category_id: '',
        payment_method: 'dinheiro',
        responsible: 'voce',
        card_id: '',
        installments: 1,
        due_day: '',
        frequency: 'monthly',
        recurrence_months: 12
      })
      
    } catch (error) {
      console.error('Erro ao salvar despesa:', error)
      alert('Erro ao salvar despesa. Tente novamente.')
    }
  }


  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // ✅ ADICIONAR ESTA FUNÇÃO AQUI:
  const gerarDadosEvolucao = () => {
    const dados = []
    const hoje = new Date()
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    for (let i = -5; i <= 0; i++) {
      const mesData = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1)
      const inicioMes = new Date(mesData.getFullYear(), mesData.getMonth(), 1).toISOString().split('T')[0]
      const fimMes = new Date(mesData.getFullYear(), mesData.getMonth() + 1, 0).toISOString().split('T')[0]
      
      const despesasMes = despesas.filter(d => 
        d.date >= inicioMes && d.date <= fimMes && d.status === 'confirmado'
      )
      const totalMes = despesasMes.reduce((sum, d) => sum + d.amount, 0)
      
      dados.push({
        mes: mesesNomes[mesData.getMonth()],
        valor: totalMes
      })
    }
    
    return dados
  }
  

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
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
            💸 Carregando sistema de despesas...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar - igual às outras páginas */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        currentPage="despesas"
      />

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '300px' : '80px',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header */}
        <header style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
                  💸 DESPESAS
                  <span style={{ fontSize: '18px', opacity: 0.9 }}>
                    | Mês: {formatCurrency(totalMes)} | Orçado: {formatCurrency(orcamentoMensal)} ({progressoOrcamento}%)
                  </span>
                </h1>
              </div>
            </div>

            {/* Barra de Progresso do Orçamento */}
            <div style={{ 
              minWidth: '200px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '8px 12px'
            }}>
              <div style={{ fontSize: '12px', marginBottom: '4px', textAlign: 'center' }}>
                Orçamento: {progressoOrcamento}%
              </div>
              <div style={{
                                backgroundColor: 'rgba(255,255,255,0.3)',
                                borderRadius: '8px',
                                height: '6px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  backgroundColor: progressoOrcamento > 90 ? '#fbbf24' : 'white',
                                  height: '100%',
                                  width: `${Math.min(progressoOrcamento, 100)}%`,
                                  transition: 'width 0.5s ease'
                                }} />
                              </div>
                              <div style={{ fontSize: '11px', marginTop: '4px', textAlign: 'center' }}>
                                Restam: {formatCurrency(orcamentoMensal - totalMes)}
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
                                  FinBot - Assistente de Despesas
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
                          {/* Linha Superior - Formulário + Simulador */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr',
                            gap: '24px',
                            marginBottom: '24px'
                          }}>
                            {/* Nova Despesa */}
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
                                💸 NOVA DESPESA
                              </h2>
                
                              {/* Seleção do Tipo */}
                              <div style={{
                                display: 'flex',
                                gap: '8px',
                                marginBottom: '20px',
                                borderBottom: '1px solid #e2e8f0',
                                paddingBottom: '12px'
                              }}>
                                {[
                                  { id: 'avista', label: '💵 À Vista', desc: 'Dinheiro/Débito' },
                                  { id: 'parcelada', label: '💳 Parcelada', desc: 'Cartão Crédito' },
                                  { id: 'fixa', label: '📅 Fixa', desc: 'Recorrente' },
                                  { id: 'variavel', label: '🔄 Variável', desc: 'Esporádica' }
                                ].map(tipo => (
                                  <button
                                    key={tipo.id}
                                    onClick={() => setTipoFormulario(tipo.id)}
                                    style={{
                                      flex: 1,
                                      padding: '12px',
                                      backgroundColor: tipoFormulario === tipo.id ? '#ef4444' : '#f8fafc',
                                      color: tipoFormulario === tipo.id ? 'white' : '#64748b',
                                      border: 'none',
                                      borderRadius: '8px',
                                      fontSize: '14px',
                                      fontWeight: '500',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <div>{tipo.label}</div>
                                    <div style={{ fontSize: '10px', opacity: 0.8 }}>{tipo.desc}</div>
                                  </button>
                                ))}
                              </div>
                
                              {/* Formulário Dinâmico */}
                              <form onSubmit={handleSubmit}>
                                {/* Campos Comuns */}
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
                                      placeholder={
                                        tipoFormulario === 'avista' ? 'Mercado, Farmácia...' :
                                        tipoFormulario === 'parcelada' ? 'Sofá, TV, Celular...' :
                                        tipoFormulario === 'fixa' ? 'Aluguel, Plano Saúde...' :
                                        'Cinema, Restaurante...'
                                      }
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
                                      value={formData.responsible}
                                      onChange={(e) => setFormData({...formData, responsible: e.target.value})}
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
                
                                {/* Campos Específicos por Tipo */}
                                {tipoFormulario === 'avista' && (
                                  <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                      display: 'block',
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      color: '#374151',
                                      marginBottom: '6px'
                                    }}>
                                      💰 Forma de Pagamento
                                    </label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                      {[
                                        { value: 'dinheiro', label: '💵 Dinheiro' },
                                        { value: 'debito', label: '💳 Cartão Débito' }
                                      ].map(forma => (
                                        <label key={forma.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                          <input
                                            type="radio"
                                            name="payment_method"
                                            value={forma.value}
                                            checked={formData.payment_method === forma.value}
                                            onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                                          />
                                          {forma.label}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                )}
                
                                {tipoFormulario === 'parcelada' && (
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                    <div>
                                      <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '6px'
                                      }}>
                                        🏦 Cartão
                                      </label>
                                      <select
                                        value={formData.card_id}
                                        onChange={(e) => setFormData({...formData, card_id: e.target.value})}
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
                                        <option value="">Selecione o cartão...</option>
                                        {cartoes.map(cartao => (
                                          <option key={cartao.id} value={cartao.id}>
                                            🏦 {cartao.name} (fecha {cartao.closing_day})
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
                                        🔢 Parcelas
                                      </label>
                                      <select
                                        value={formData.installments}
                                        onChange={(e) => setFormData({...formData, installments: parseInt(e.target.value)})}
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
                                  </div>
                                )}
                
                                {tipoFormulario === 'fixa' && (
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                    <div>
                                      <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '6px'
                                      }}>
                                        📅 Dia Vencimento
                                      </label>
                                      <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={formData.due_day}
                                        onChange={(e) => setFormData({...formData, due_day: e.target.value})}
                                        placeholder="15"
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
                        🔄 Frequência
                      </label>
                      <select
                        value={formData.frequency}
                        onChange={(e) => setFormData({...formData, frequency: e.target.value})}
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
                        <option value="monthly">🗓️ Mensal</option>
                        <option value="quarterly">📊 Trimestral</option>
                        <option value="annually">🎊 Anual</option>
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
                        📊 Gerar para
                      </label>
                      <select
                        value={formData.recurrence_months}
                        onChange={(e) => setFormData({...formData, recurrence_months: parseInt(e.target.value)})}
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
                        <option value="6">6 meses</option>
                        <option value="12">12 meses</option>
                        <option value="24">24 meses</option>
                      </select>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#ef4444',
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
                    💾 SALVAR DESPESA
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      description: '',
                      amount: '',
                      date: new Date().toISOString().split('T')[0],
                      category_id: '',
                      payment_method: 'dinheiro',
                      responsible: 'voce',
                      card_id: '',
                      installments: 1,
                      due_day: '',
                      frequency: 'monthly',
                      recurrence_months: 12
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
            </div>

            {/* Simulador Inteligente */}
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
                margin: '0 0 20px 0',
                color: '#1a202c'
              }}>
                🧮 SIMULADOR DE IMPACTO
              </h3>

              {formData.amount && parseFloat(formData.amount) > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    border: '1px solid #fcd34d'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                      💰 IMPACTO NO ORÇAMENTO:
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
                      +{simuladorData.impactoOrcamento}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#92400e' }}>
                      {formatCurrency(parseFloat(formData.amount))} de {formatCurrency(orcamentoMensal)}
                    </div>
                  </div>

                  {tipoFormulario === 'parcelada' && simuladorData.faturaDestino && (
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#e0f2fe',
                      borderRadius: '8px',
                      border: '1px solid #7dd3fc'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>
                        💳 ANÁLISE DE FATURA:
                      </div>
                      <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '8px' }}>
                        📅 Fatura destino: {simuladorData.faturaDestino}
                      </div>
                      <div style={{ fontSize: '14px', color: '#0369a1' }}>
                        🔄 {simuladorData.sugestao}
                      </div>
                    </div>
                  )}

                  {simuladorData.alertas.length > 0 && (
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      border: '1px solid #7dd3fc'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>
                        💡 SUGESTÕES:
                      </div>
                      {simuladorData.alertas.map((alerta, index) => (
                        <div key={index} style={{ fontSize: '14px', color: '#0369a1', marginBottom: '4px' }}>
                          {alerta}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{
                    padding: '16px',
                    backgroundColor: simuladorData.impactoOrcamento > 10 ? '#fef2f2' : '#f0fdf4',
                    borderRadius: '8px',
                    border: `1px solid ${simuladorData.impactoOrcamento > 10 ? '#fecaca' : '#bbf7d0'}`
                  }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: simuladorData.impactoOrcamento > 10 ? '#dc2626' : '#166534',
                      marginBottom: '8px' 
                    }}>
                      📊 SITUAÇÃO:
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: simuladorData.impactoOrcamento > 10 ? '#dc2626' : '#166534'
                    }}>
                      {simuladorData.impactoOrcamento > 10 
                        ? '⚠️ Impacto alto no orçamento' 
                        : '✅ Dentro do planejado'}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#64748b'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🧮</div>
                  <p style={{ margin: 0 }}>
                    Digite um valor para ver o impacto no orçamento
                  </p>
                </div>
              )}
            </div>
          </div>

                    {/* ✅ ADICIONAR ESTA SEÇÃO ANTES DA LISTA: */}
          {/* Filtros Inteligentes */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 0 16px 0',
              color: '#1a202c'
            }}>
              🔍 FILTROS INTELIGENTES
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}>
              {/* Período */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  📅 Período:
                </label>
                <select
                  value={filtros.periodo}
                  onChange={(e) => setFiltros({...filtros, periodo: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="este_mes">📅 Este Mês</option>
                  <option value="ultimos_30">📊 Últimos 30 dias</option>
                  <option value="todos">🗓️ Todos</option>
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  🏷️ Categoria:
                </label>
                <select
                  value={filtros.categoria}
                  onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="todas">Todas</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Responsável */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  👤 Responsável:
                </label>
                <select
                  value={filtros.responsavel}
                  onChange={(e) => setFiltros({...filtros, responsavel: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="voce">👨 Você</option>
                  <option value="esposa">👩 Esposa</option>
                  <option value="compartilhado">👨👩 Compartilhado</option>
                </select>
              </div>

              {/* Tipo */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  💳 Tipo:
                </label>
                <select
                  value={filtros.tipo}
                  onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="todas">Todas</option>
                  <option value="avista">💵 À Vista</option>
                  <option value="parcelada">💳 Parcelada</option>
                  <option value="fixa">📅 Fixa</option>
                </select>
              </div>
            </div>

            {/* Busca */}
            <input
              type="text"
              placeholder="🔍 Buscar despesa..."
              value={filtros.busca}
              onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />

            {/* Resumo dos Filtros */}
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#64748b'
            }}>
              📊 Mostrando {despesasFiltradas.length} de {despesas.length} despesas
            </div>
          </div>

          {/* Lista de Despesas */}
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
                📋 DESPESAS RECENTES
              </h2>
              
              <div style={{ display: 'flex', gap: '8px' }}>
              <button
                  onClick={() => setViewMode('lista')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: viewMode === 'lista' ? '#ef4444' : '#f1f5f9',
                    color: viewMode === 'lista' ? 'white' : '#64748b',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  📊 Lista
                </button>
                <button
                  onClick={() => setViewMode('grafico')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: viewMode === 'grafico' ? '#ef4444' : '#f1f5f9',
                    color: viewMode === 'grafico' ? 'white' : '#64748b',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  📈 Gráfico
                </button>
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

            {despesas.length > 0 ? (
              viewMode === 'lista' ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Descrição</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Valor</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Pagamento</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Data</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Responsável</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(despesasFiltradas.length > 0 ? despesasFiltradas : despesas).slice(0, 10).map((despesa, index) => (
                        <tr key={despesa.id} style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '12px' }}>
                            <span style={{ fontSize: '16px' }}>
                              {despesa.status === 'confirmado' ? '✅' : '⏳'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontWeight: '500' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {despesa.installments > 1 && (
                                <span style={{
                                  backgroundColor: '#fef3c7',
                                  color: '#92400e',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: '600'
                                }}>
                                  💳 {despesa.installment_number || 1}/{despesa.installments}
                                </span>
                              )}
                              <span>{despesa.description}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#ef4444' }}>
                            {formatCurrency(despesa.amount)}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                            {despesa.payment_method === 'dinheiro' ? '💵' :
                             despesa.payment_method === 'debito' ? '💳' :
                             despesa.payment_method === 'credito' ? '💳' : '💰'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                            {new Date(despesa.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: '16px' }}>
                            {despesa.responsible === 'voce' ? '👨' :
                             despesa.responsible === 'esposa' ? '👩' : '👨👩'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                ) : (
                  <div style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={gerarDadosEvolucao()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Line 
                        type="monotone" 
                        dataKey="valor" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px',
                color: '#64748b'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>💸</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                  Nenhuma despesa cadastrada
                </h3>
                <p style={{ margin: 0 }}>
                  Comece adicionando seus gastos acima
                </p>
              </div>
            )}
          </div>
          {/* ✅ ADICIONAR AQUI - ANÁLISE POR CATEGORIA */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            marginTop: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              margin: '0 0 24px 0',
              color: '#1a202c'
            }}>
              📊 ANÁLISE POR CATEGORIA
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '24px'
            }}>
              {/* Evolução 6 Meses */}
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
                    <LineChart data={gerarDadosEvolucao()}>
                      <Line 
                        type="monotone" 
                        dataKey="valor" 
                        stroke="#ef4444" 
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
                  🏷️ POR CATEGORIA
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(() => {
                    // Calcular gastos por categoria
                    const categoriasGastos = {}
                    const hoje = new Date()
                    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
                    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
                    
                    const despesasMes = despesas.filter(d => 
                      d.date >= inicioMes && d.date <= fimMes && d.status === 'confirmado'
                    )
                    
                    despesasMes.forEach(despesa => {
                      const categoriaNome = despesa.categories?.name || 'Outros'
                      const categoriaIcon = despesa.categories?.icon || '📦'
                      
                      if (!categoriasGastos[categoriaNome]) {
                        categoriasGastos[categoriaNome] = {
                          nome: categoriaNome,
                          icon: categoriaIcon,
                          valor: 0
                        }
                      }
                      categoriasGastos[categoriaNome].valor += despesa.amount
                    })
                    
                    const categoriasArray = Object.values(categoriasGastos)
                      .sort((a, b) => b.valor - a.valor)
                      .slice(0, 4)
                    
                    return categoriasArray.map((cat, index) => {
                      const percentual = totalMes > 0 ? ((cat.valor / totalMes) * 100).toFixed(1) : 0
                      return (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '14px'
                        }}>
                          <span style={{ color: '#64748b' }}>{cat.icon} {cat.nome}:</span>
                          <span style={{ fontWeight: '600', color: '#ef4444' }}>{percentual}%</span>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>

              {/* Meta vs Real */}
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 16px 0',
                  color: '#374151'
                }}>
                  🎯 META VS REAL
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      Meta Orçamento:
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>
                      {formatCurrency(orcamentoMensal)}
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      Gasto Real:
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>
                      {formatCurrency(totalMes)}
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '12px',
                    backgroundColor: progressoOrcamento > 100 ? '#fef2f2' : '#f0fdf4',
                    borderRadius: '8px',
                    border: `1px solid ${progressoOrcamento > 100 ? '#fecaca' : '#bbf7d0'}`
                  }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      Situação:
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold', 
                      color: progressoOrcamento > 100 ? '#dc2626' : '#166534'
                    }}>
                      {progressoOrcamento > 100 ? '🚨 Acima' : '✅ Dentro'} do orçamento
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {progressoOrcamento > 100 
                        ? `Excesso: ${formatCurrency(totalMes - orcamentoMensal)}`
                        : `Restam: ${formatCurrency(orcamentoMensal - totalMes)}`
                      }
                    </div>
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
        }
      `}</style>
    </div>
  )
}