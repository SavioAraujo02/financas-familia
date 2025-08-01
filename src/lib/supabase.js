import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções de autenticação
export const auth = {
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Funções para perfil (com renda)
export const profiles = {
  async get(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, avatar_url, monthly_income, created_at, updated_at')
      .eq('id', userId)
      .single()
    
    return { data, error }
  },

  async update(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
    
    return { data, error }
  },

  async create(profile) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
    
    return { data, error }
  }
}

// Funções para transações
export const transactions = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          name,
          icon,
          color
        ),
        cards (
          name,
          color,
          bank
        ),
        recurring_transactions (
          title,
          frequency
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
    
    return { data, error }
  },

  async create(transaction) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transaction,
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        categories (
          name,
          icon,
          color
        ),
        cards (
          name,
          color
        )
      `)
    
    return { data, error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  async delete(id) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  // Estatísticas do mês
  async getMonthStats(userId, month, year) {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`
    
    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('status', 'confirmado')
    
    return { data, error }
  },

  // Obter receitas por período
  async getReceitas(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          name,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .eq('type', 'receita')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
    
    return { data, error }
  },

  // Obter despesas por período
  async getDespesas(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          name,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .eq('type', 'despesa')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
    
    return { data, error }
  }
}

// Funções para categorias
export const categories = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name')
    
    return { data, error }
  },

  async create(category) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
    
    return { data, error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  async delete(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    
    return { error }
  }
}

// NOVAS FUNÇÕES: Contracheques (Payrolls)
export const payrolls = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('payrolls')
      .select('*')
      .eq('user_id', userId)
      .order('month_year', { ascending: false })
    
    return { data, error }
  },

  async create(payroll) {
    const { data, error } = await supabase
      .from('payrolls')
      .insert([payroll])
      .select()
    
    return { data, error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('payrolls')
      .update(updates)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  async delete(id) {
    const { error } = await supabase
      .from('payrolls')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  async getByMonthYear(userId, monthYear) {
    const { data, error } = await supabase
      .from('payrolls')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .single()
    
    return { data, error }
  },

  // Criar receita automática a partir do contracheque
  async createReceiptFromPayroll(payrollId, userId, categoryId) {
    // Primeiro, buscar os dados do contracheque
    const { data: payroll, error: payrollError } = await supabase
      .from('payrolls')
      .select('*')
      .eq('id', payrollId)
      .single()
    
    if (payrollError) return { data: null, error: payrollError }
    
    // Criar a receita
    const receiptData = {
      user_id: userId,
      category_id: categoryId,
      type: 'receita',
      amount: payroll.net_amount,
      description: `Salário ${payroll.month_year}`,
      date: new Date().toISOString().split('T')[0],
      status: 'confirmado',
      tags: ['salario', 'contracheque']
    }
    
    return await transactions.create(receiptData)
  }
}

// NOVAS FUNÇÕES: Receitas Recorrentes
export const recurringTransactions = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select(`
        *,
        categories (
          name,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async create(recurringTransaction) {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert([recurringTransaction])
      .select(`
        *,
        categories (
          name,
          icon,
          color
        )
      `)
    
    return { data, error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .update(updates)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  async delete(id) {
    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  async toggleActive(id, isActive) {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  // Gerar transações futuras para uma recorrência
  async generateTransactions(recurringId, months = 12) {
    const { data: recurring, error: recurringError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('id', recurringId)
      .single()
    
    if (recurringError) return { data: null, error: recurringError }
    
    const transactions = []
    let currentDate = new Date(recurring.start_date)
    const endDate = recurring.end_date ? new Date(recurring.end_date) : null
    const maxOccurrences = recurring.total_occurrences || 999
    
    for (let i = 0; i < Math.min(months, maxOccurrences); i++) {
      if (endDate && currentDate > endDate) break
      
      transactions.push({
        user_id: recurring.user_id,
        category_id: recurring.category_id,
        type: 'receita',
        amount: recurring.amount,
        description: recurring.title,
        date: currentDate.toISOString().split('T')[0],
        status: 'pendente',
        recurring_id: recurringId
      })
      
      // Incrementar data baseado na frequência
      switch (recurring.frequency) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7)
          break
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1)
          break
        case 'quarterly':
          currentDate.setMonth(currentDate.getMonth() + 3)
          break
        case 'annually':
          currentDate.setFullYear(currentDate.getFullYear() + 1)
          break
        default:
          currentDate.setMonth(currentDate.getMonth() + 1)
      }
    }
    
    if (transactions.length > 0) {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactions)
        .select()
      
      return { data, error }
    }
    
    return { data: [], error: null }
  },

  // Obter próximas transações de recorrências
  async getUpcomingTransactions(userId, days = 30) {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + days)
    
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          name,
          icon,
          color
        ),
        recurring_transactions (
          title,
          frequency
        )
      `)
      .eq('user_id', userId)
      .eq('type', 'receita')
      .gte('date', today.toISOString().split('T')[0])
      .lte('date', futureDate.toISOString().split('T')[0])
      .not('recurring_id', 'is', null)
      .order('date')
    
    return { data, error }
  }
}

// Funções para cartões
export const cards = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name')
    
    return { data, error }
  },

  async create(card) {
    const { data, error } = await supabase
      .from('cards')
      .insert([card])
      .select()
    
    return { data, error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  async delete(id) {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)
    
    return { error }
  }
}

// Funções para metas
export const goals = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async create(goal) {
    const { data, error } = await supabase
      .from('goals')
      .insert([goal])
      .select()
    
    return { data, error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  async delete(id) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
    
    return { error }
  }
}

// ADICIONAR ESTAS FUNÇÕES APÓS A SEÇÃO DE GOALS (linha ~380)

// Funções para cartões avançadas
export const cardsAdvanced = {
  async getWithUsage(userId) {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name')
    
    if (error) return { data: null, error }
    
    // Para cada cartão, calcular uso atual
    const cardsWithUsage = await Promise.all(
      data.map(async (card) => {
        const { data: usage } = await this.calculateUsage(card.id)
        return {
          ...card,
          usage: usage || { used_amount: 0, usage_percentage: 0, status: 'safe' }
        }
      })
    )
    
    return { data: cardsWithUsage, error: null }
  },

  // SUBSTITUIR a função calculateUsage por esta versão adaptada:
async calculateUsage(cardId) {
  // Buscar dados do cartão
  const { data: card } = await supabase
    .from('cards')
    .select('credit_limit, used_amount')
    .eq('id', cardId)
    .single()
  
  if (!card) return { data: null, error: 'Cartão não encontrado' }
  
  const usedAmount = card.used_amount || 0
  const limit = card.credit_limit || 0
  const percentage = limit > 0 ? Math.round((usedAmount / limit) * 100) : 0
  
  let status = 'safe'
  if (percentage > 80) status = 'danger'
  else if (percentage > 60) status = 'warning'
  
  return {
    data: {
      used_amount: usedAmount,
      available_amount: limit - usedAmount,
      usage_percentage: percentage,
      status
    },
    error: null
  }
},

  async getFutureInvoices(cardId, months = 12) {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, date, installments, installment_number')
      .eq('card_id', cardId)
      .eq('status', 'confirmado')
    
    const futureInvoices = []
    const today = new Date()
    
    for (let i = 0; i < months; i++) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() + i, 1)
      const monthYear = targetDate.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })
      
      const monthAmount = (transactions || []).reduce((sum, t) => {
        if (t.installments > 1) {
          const transactionDate = new Date(t.date)
          const installmentDate = new Date(transactionDate.getFullYear(), transactionDate.getMonth() + (t.installment_number || 1) - 1, 1)
          
          if (installmentDate.getTime() === targetDate.getTime()) {
            return sum + (t.amount / t.installments)
          }
        }
        return sum
      }, 0)
      
      futureInvoices.push({
        month_year: monthYear,
        predicted_amount: monthAmount,
        installments_count: 0
      })
    }
    
    return { data: futureInvoices, error: null }
  },

  async getRecommendations(userId, purchaseAmount, installments = 1) {
    const { data: cards } = await this.getWithUsage(userId)
    
    if (!cards) return { data: [], error: null }
    
    const recommendations = cards.map(card => {
      const newUsage = card.usage.used_amount + purchaseAmount
      const newPercentage = Math.round((newUsage / card.credit_limit) * 100)
      
      let recommendation = 'avoid'
      if (newPercentage <= 30) recommendation = 'excellent'
      else if (newPercentage <= 60) recommendation = 'good'
      else if (newPercentage <= 80) recommendation = 'ok'
      
      return {
        ...card,
        new_usage_percentage: newPercentage,
        recommendation,
        available_for_purchase: card.credit_limit - card.usage.used_amount >= purchaseAmount
      }
    }).sort((a, b) => a.new_usage_percentage - b.new_usage_percentage)
    
    return { data: recommendations, error: null }
  },

  async updateCard(cardId, updates) {
    const { data, error } = await supabase
      .from('cards')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .select()
    
    return { data, error }
  }
}

// Funções para alertas de cartões
export const cardAlerts = {
  async create(alertData) {
    const { data, error } = await supabase
      .from('card_alerts')
      .insert([{
        ...alertData,
        created_at: new Date().toISOString()
      }])
      .select()
    
    return { data, error }
  },

  

  async getUnread(userId) {
    const { data, error } = await supabase
      .from('card_alerts')
      .select(`
        *,
        cards (name, color)
      `)
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async markAsRead(alertId) {
    const { data, error } = await supabase
      .from('card_alerts')
      .update({ is_read: true })
      .eq('id', alertId)
    
    return { data, error }
  }
}

// ADICIONAR ESTAS FUNÇÕES APÓS cardAlerts

// Funções para previsão de faturas
export const previsaoFaturas = {
  // Calcular previsão de 12 meses baseada em parcelas ativas
  calcularPrevisao12Meses: async (userId) => {
    try {
      // 1. Buscar todas as transações parceladas ativas
      const { data: transacoes } = await supabase
        .from('transactions')
        .select(`
          *,
          cards (name, color, due_day, closing_day)
        `)
        .eq('user_id', userId)
        .eq('type', 'despesa')
        .gt('installments', 1)
        .eq('status', 'confirmado')
      
      // 2. Buscar despesas fixas recorrentes
      const { data: despesasFixas } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'despesa')
        .not('recurring_id', 'is', null)
        .eq('status', 'confirmado')
      
      // 3. Buscar perfil do usuário para renda
      const { data: perfil } = await supabase
        .from('profiles')
        .select('monthly_income')
        .eq('id', userId)
        .single()
      
      const rendaFamiliar = perfil?.monthly_income || 10600
      
      const previsao = []
      const hoje = new Date()
      
      // 4. Calcular para cada mês dos próximos 12
      for (let i = 0; i < 12; i++) {
        const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1)
        const mesAno = mesAtual.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })
        const mesNome = mesAtual.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        
        let totalMes = 0
        const faturasPorCartao = {}
        
        // 5. Calcular parcelas que vencem neste mês
        if (transacoes) {
          transacoes.forEach(transacao => {
            const dataTransacao = new Date(transacao.date)
            const parcelasRestantes = transacao.installments - (transacao.installment_number || 1) + 1
            
            for (let p = 0; p < parcelasRestantes; p++) {
              const dataVencimento = new Date(
                dataTransacao.getFullYear(), 
                dataTransacao.getMonth() + p, 
                transacao.cards?.due_day || 15
              )
              
              if (dataVencimento.getMonth() === mesAtual.getMonth() && 
                  dataVencimento.getFullYear() === mesAtual.getFullYear()) {
                
                const valorParcela = transacao.amount / transacao.installments
                totalMes += valorParcela
                
                const cartaoNome = transacao.cards?.name || 'Cartão'
                
                if (!faturasPorCartao[cartaoNome]) {
                  faturasPorCartao[cartaoNome] = {
                    nome: cartaoNome,
                    cor: transacao.cards?.color || '#6b7280',
                    vencimento: transacao.cards?.due_day || 15,
                    total: 0,
                    parcelas: []
                  }
                }
                
                faturasPorCartao[cartaoNome].total += valorParcela
                faturasPorCartao[cartaoNome].parcelas.push({
                  descricao: transacao.description,
                  valor: valorParcela,
                  parcela: `${p + 1}/${transacao.installments}`,
                  transacaoId: transacao.id
                })
              }
            }
          })
        }
        
        // 6. Adicionar despesas fixas/recorrentes
        if (despesasFixas) {
          despesasFixas.forEach(despesa => {
            totalMes += despesa.amount
            
            if (!faturasPorCartao['DESPESAS FIXAS']) {
              faturasPorCartao['DESPESAS FIXAS'] = {
                nome: 'DESPESAS FIXAS',
                cor: '#6b7280',
                vencimento: 5,
                total: 0,
                parcelas: []
              }
            }
            
            faturasPorCartao['DESPESAS FIXAS'].total += despesa.amount
            faturasPorCartao['DESPESAS FIXAS'].parcelas.push({
              descricao: despesa.description,
              valor: despesa.amount,
              parcela: 'Fixo'
            })
          })
        }
        
        // 7. Calcular status do mês
        const percentualRenda = (totalMes / rendaFamiliar) * 100
        let status = 'normal'
        let cor = '#10b981'
        let icone = '🟢'
        
        if (percentualRenda > 60) {
          status = 'critico'
          cor = '#ef4444'
          icone = '🔴'
        } else if (percentualRenda > 45) {
          status = 'alto'
          cor = '#f59e0b'
          icone = '🟡'
        } else if (percentualRenda > 30) {
          status = 'moderado'
          cor = '#3b82f6'
          icone = '🔵'
        }
        
        previsao.push({
          mes: mesNome,
          mesAno,
          mesCompleto: mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          total: totalMes,
          percentualRenda: Math.round(percentualRenda * 10) / 10,
          status,
          cor,
          icone,
          faturasPorCartao: Object.values(faturasPorCartao),
          disponivel: rendaFamiliar - totalMes,
          isCurrentMonth: i === 0,
          isCritico: status === 'critico',
          isAlto: status === 'alto'
        })
      }
      
      return { data: previsao, error: null }
      
    } catch (error) {
      console.error('Erro ao calcular previsão:', error)
      return { data: [], error }
    }
  },

  // Gerar alertas inteligentes baseados na previsão
  gerarAlertas: async (previsao, rendaFamiliar = 10600) => {
    const alertas = []
    
    // Alertas de meses críticos
    previsao.forEach((mes, index) => {
      if (mes.status === 'critico') {
        alertas.push({
          tipo: 'critico',
          prioridade: 'alta',
          titulo: `🚨 ${mes.mesCompleto.toUpperCase()} - MÊS CRÍTICO`,
          descricao: `Faturas de ${formatCurrency(mes.total)} (${mes.percentualRenda}% da renda)`,
          sugestao: 'Considere antecipar pagamentos ou usar reserva de emergência',
          cor: '#ef4444',
          icone: '🚨',
          mes: mes.mesAno,
          valor: mes.total,
          impacto: 'alto'
        })
      } else if (mes.status === 'alto' && index <= 2) {
        alertas.push({
          tipo: 'atencao',
          prioridade: 'media',
          titulo: `⚠️ ${mes.mesCompleto} - ATENÇÃO`,
          descricao: `Faturas de ${formatCurrency(mes.total)} (${mes.percentualRenda}% da renda)`,
          sugestao: 'Evite novas compras parceladas neste período',
          cor: '#f59e0b',
          icone: '⚠️',
          mes: mes.mesAno,
          valor: mes.total,
          impacto: 'medio'
        })
      }
    })
    
    // Alerta de tendência crescente
    const primeiros3Meses = previsao.slice(0, 3)
    const crescente = primeiros3Meses.every((mes, i) => 
      i === 0 || mes.total > primeiros3Meses[i - 1].total
    )
    
    if (crescente) {
      alertas.push({
        tipo: 'tendencia',
        prioridade: 'media',
        titulo: '📈 TENDÊNCIA CRESCENTE DETECTADA',
        descricao: 'Suas faturas estão aumentando nos próximos meses',
        sugestao: 'Evite novas compras parceladas por 60 dias',
        cor: '#8b5cf6',
        icone: '📈',
        impacto: 'medio'
      })
    }
    
    // Alerta de oportunidade
    const mesesBaixos = previsao.filter(m => m.percentualRenda < 25)
    if (mesesBaixos.length > 0) {
      alertas.push({
        tipo: 'oportunidade',
        prioridade: 'baixa',
        titulo: '💡 OPORTUNIDADE DETECTADA',
        descricao: `${mesesBaixos.length} meses com faturas baixas identificados`,
        sugestao: 'Ótimo momento para grandes compras parceladas',
        cor: '#10b981',
        icone: '💡',
        impacto: 'positivo'
      })
    }
    
    // Alerta de recuperação
    const mesesCriticos = previsao.filter(m => m.status === 'critico').length
    const ultimosCriticos = previsao.slice(-6).filter(m => m.status === 'critico').length
    
    if (mesesCriticos > 0 && ultimosCriticos === 0) {
      alertas.push({
        tipo: 'recuperacao',
        prioridade: 'baixa',
        titulo: '🎯 RECUPERAÇÃO PREVISTA',
        descricao: 'Situação volta ao normal nos próximos 6 meses',
        sugestao: 'Mantenha o controle atual que a situação melhora',
        cor: '#10b981',
        icone: '🎯',
        impacto: 'positivo'
      })
    }
    
    return alertas
  },

  // Simular impacto de uma nova compra
  async simularCompra(previsao, valorCompra, parcelas, cartaoId, dataCompra) {
    const valorParcela = valorCompra / parcelas
    const dataInicio = new Date(dataCompra)
    
    const previsaoComImpacto = previsao.map((mes, index) => {
      const mesData = new Date(mes.mesAno.split('/').reverse().join('-') + '-01')
      const mesesDiferenca = (mesData.getFullYear() - dataInicio.getFullYear()) * 12 + 
                            (mesData.getMonth() - dataInicio.getMonth())
      
      if (mesesDiferenca >= 0 && mesesDiferenca < parcelas) {
        const novoTotal = mes.total + valorParcela
        const novoPercentual = (novoTotal / 10600) * 100
        
        let novoStatus = 'normal'
        let novaCor = '#10b981'
        if (novoPercentual > 60) {
          novoStatus = 'critico'
          novaCor = '#ef4444'
        } else if (novoPercentual > 45) {
          novoStatus = 'alto'
          novaCor = '#f59e0b'
        } else if (novoPercentual > 30) {
          novoStatus = 'moderado'
          novaCor = '#3b82f6'
        }
        
        return {
          ...mes,
          totalOriginal: mes.total,
          totalComCompra: novoTotal,
          impacto: valorParcela,
          novoPercentual: Math.round(novoPercentual * 10) / 10,
          novoStatus,
          novaCor,
          mudouStatus: novoStatus !== mes.status,
          piorou: novoPercentual > mes.percentualRenda
        }
      }
      
      return { ...mes, impacto: 0 }
    })
    
    // Calcular recomendação
    const mesesCriticos = previsaoComImpacto.filter(m => m.novoStatus === 'critico').length
    const mesesAltos = previsaoComImpacto.filter(m => m.novoStatus === 'alto').length
    const mesesPioraram = previsaoComImpacto.filter(m => m.piorou).length
    
    let recomendacao = 'excelente'
    let corRecomendacao = '#10b981'
    let iconeRecomendacao = '✅'
    let mensagem = 'Compra recomendada! Baixo impacto nas faturas.'
    
    if (mesesCriticos > 0) {
      recomendacao = 'evitar'
      corRecomendacao = '#ef4444'
      iconeRecomendacao = '❌'
      mensagem = `Evite! Criará ${mesesCriticos} mês(es) crítico(s).`
    } else if (mesesAltos > 2) {
      recomendacao = 'cuidado'
      corRecomendacao = '#f59e0b'
      iconeRecomendacao = '⚠️'
      mensagem = `Cuidado! Criará ${mesesAltos} meses com faturas altas.`
    } else if (mesesAltos > 0 || mesesPioraram > 3) {
      recomendacao = 'moderado'
      corRecomendacao = '#3b82f6'
      iconeRecomendacao = '🔵'
      mensagem = 'Compra moderada. Monitore as faturas.'
    }
    
    return {
      previsaoComImpacto,
      recomendacao,
      corRecomendacao,
      iconeRecomendacao,
      mensagem,
      valorParcela,
      mesesAfetados: parcelas,
      mesesCriticos,
      mesesAltos,
      impactoTotal: valorCompra
    }
  },

  // Gerar estratégias para reduzir meses críticos
  async gerarEstrategias(mesDetalhado) {
    const estrategias = []
    
    if (mesDetalhado.status === 'critico' || mesDetalhado.status === 'alto') {
      // Estratégia 1: Reagendar parcelas grandes
      const parcelasGrandes = []
      mesDetalhado.faturasPorCartao.forEach(cartao => {
        cartao.parcelas.forEach(parcela => {
          if (parcela.valor > 200 && parcela.parcela !== 'Fixo') {
            parcelasGrandes.push({
              ...parcela,
              cartao: cartao.nome
            })
          }
        })
      })
      
      if (parcelasGrandes.length > 0) {
        const maiorParcela = parcelasGrandes.reduce((max, p) => p.valor > max.valor ? p : max)
        estrategias.push({
          tipo: 'reagendar',
          titulo: '🔄 Reagendar Parcela Grande',
          descricao: `Reagendar "${maiorParcela.descricao}" para próximo mês`,
          impacto: -maiorParcela.valor,
          facilidade: 'media',
          icone: '🔄'
        })
      }
      
      // Estratégia 2: Usar reserva de emergência
      const valorExcesso = mesDetalhado.total - (10600 * 0.45) // 45% é limite aceitável
      if (valorExcesso > 0) {
        estrategias.push({
          tipo: 'reserva',
          titulo: '💰 Usar Reserva de Emergência',
          descricao: `Antecipar R$ ${Math.ceil(valorExcesso / 100) * 100} da reserva`,
          impacto: -Math.ceil(valorExcesso / 100) * 100,
          facilidade: 'facil',
          icone: '💰'
        })
      }
      
      // Estratégia 3: Reduzir gastos variáveis
      const gastosVariaveis = mesDetalhado.faturasPorCartao.find(c => c.nome !== 'DESPESAS FIXAS')
      if (gastosVariaveis) {
        const reducao = gastosVariaveis.total * 0.15 // 15% de redução
        estrategias.push({
          tipo: 'reducao',
          titulo: '🛒 Reduzir Gastos Variáveis',
          descricao: `Reduzir supermercado e extras em 15%`,
          impacto: -reducao,
          facilidade: 'media',
          icone: '🛒'
        })
      }
      
      // Estratégia 4: Pausar assinaturas
      estrategias.push({
        tipo: 'pausar',
        titulo: '📱 Pausar Assinaturas',
        descricao: 'Pausar Netflix, Spotify e outros por 1 mês',
        impacto: -150,
        facilidade: 'facil',
        icone: '📱'
      })
    }
    
    return estrategias
  }
}

// Funções para análise preditiva com IA
export const analisePreditiva = {
  // Detectar padrões de gastos
  async detectarPadroes(userId) {
    try {
      const { data: transacoes } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'despesa')
        .gte('date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 6 meses
        .order('date')
      
      if (!transacoes || transacoes.length === 0) {
        return { data: null, error: 'Dados insuficientes' }
      }
      
      // Análise de crescimento mensal
      const gastosPorMes = {}
      transacoes.forEach(t => {
        const mes = new Date(t.date).toISOString().slice(0, 7) // YYYY-MM
        gastosPorMes[mes] = (gastosPorMes[mes] || 0) + t.amount
      })
      
      const meses = Object.keys(gastosPorMes).sort()
      const valores = meses.map(m => gastosPorMes[m])
      
      // Calcular tendência
      let crescimentoMedio = 0
      if (valores.length > 1) {
        const crescimentos = []
        for (let i = 1; i < valores.length; i++) {
          const crescimento = ((valores[i] - valores[i-1]) / valores[i-1]) * 100
          crescimentos.push(crescimento)
        }
        crescimentoMedio = crescimentos.reduce((a, b) => a + b, 0) / crescimentos.length
      }
      
      // Análise de parcelamentos
      const parceladas = transacoes.filter(t => t.installments > 1)
      const crescimentoParcelamentos = parceladas.length > 0 ? 
        ((parceladas.length / transacoes.length) * 100) : 0
      
      // Análise sazonal (simplificada)
      const gastosPorMesAno = {}
      transacoes.forEach(t => {
        const mes = new Date(t.date).getMonth() + 1
        gastosPorMesAno[mes] = (gastosPorMesAno[mes] || []).concat(t.amount)
      })
      
      const padraoSazonal = Object.keys(gastosPorMesAno).map(mes => ({
        mes: parseInt(mes),
        mediaGastos: gastosPorMesAno[mes].reduce((a, b) => a + b, 0) / gastosPorMesAno[mes].length,
        transacoes: gastosPorMesAno[mes].length
      }))
      
      return {
        data: {
          crescimentoMedio: Math.round(crescimentoMedio * 100) / 100,
          crescimentoParcelamentos: Math.round(crescimentoParcelamentos * 100) / 100,
          padraoSazonal,
          totalTransacoes: transacoes.length,
          periodoAnalise: `${meses[0]} a ${meses[meses.length - 1]}`
        },
        error: null
      }
      
    } catch (error) {
      return { data: null, error }
    }
  },

  // Gerar previsões baseadas em IA
  async gerarPrevisoes(padroes, previsao) {
    const previsoes = []
    
    // Previsão de situação crítica
    const mesesCriticos = previsao.filter(m => m.status === 'critico').length
    if (mesesCriticos > 0) {
      previsoes.push({
        tipo: 'situacao',
        probabilidade: 85,
        descricao: `${mesesCriticos} mês(es) crítico(s) confirmado(s)`,
        impacto: 'alto',
        prazo: 'curto'
      })
    }
    
    // Previsão de normalização
    const ultimosCriticos = previsao.slice(-6).filter(m => m.status === 'critico').length
    if (mesesCriticos > 0 && ultimosCriticos === 0) {
      previsoes.push({
        tipo: 'recuperacao',
        probabilidade: 92,
        descricao: 'Situação normaliza até final do ano',
        impacto: 'positivo',
        prazo: 'medio'
      })
    }
    
    // Previsão de crescimento de renda
    if (padroes && padroes.crescimentoMedio > 0) {
      previsoes.push({
        tipo: 'renda',
        probabilidade: 78,
        descricao: 'Renda pode aumentar 5% no próximo ano',
        impacto: 'positivo',
        prazo: 'longo'
      })
    }
    
    // Previsão de sustentabilidade
    const mediaComprometimento = previsao.reduce((sum, m) => sum + m.percentualRenda, 0) / previsao.length
    if (mediaComprometimento < 50) {
      previsoes.push({
        tipo: 'sustentabilidade',
        probabilidade: 95,
        descricao: 'Padrão atual é financeiramente sustentável',
        impacto: 'positivo',
        prazo: 'longo'
      })
    }
    
    return previsoes
  },

  // Gerar alertas preventivos
  async gerarAlertasPreventivos(previsao, padroes) {
    const alertas = []
    
    // Alerta para evitar parcelamentos
    const proximosCriticos = previsao.slice(0, 3).filter(m => m.status === 'critico' || m.status === 'alto')
    if (proximosCriticos.length > 0) {
      alertas.push({
        tipo: 'preventivo',
        prioridade: 'alta',
        titulo: '🚨 Evitem Parcelamentos',
        descricao: `Próximos ${proximosCriticos.length} meses serão pesados`,
        acao: 'Compras à vista apenas por 60 dias',
        icone: '🚨'
      })
    }
    
    // Alerta para reserva de emergência
    const valorReserva = previsao.filter(m => m.status === 'critico')
                                 .reduce((max, m) => Math.max(max, m.total - 4770), 0) // 45% de 10600
    if (valorReserva > 0) {
      alertas.push({
        tipo: 'preparacao',
        prioridade: 'media',
        titulo: '💰 Preparar Reserva',
        descricao: `Reservem R$ ${Math.ceil(valorReserva / 100) * 100} para emergências`,
        acao: 'Separar valor da reserva de emergência',
        icone: '💰'
      })
    }
    
    // Alerta de oportunidade
    const mesesBaixos = previsao.filter(m => m.percentualRenda < 30)
    if (mesesBaixos.length > 0) {
      alertas.push({
        tipo: 'oportunidade',
        prioridade: 'baixa',
        titulo: '📈 Oportunidade de Investimento',
        descricao: `${mesesBaixos.length} meses ideais para investir`,
        acao: 'Considerar investimentos ou grandes compras',
        icone: '📈'
      })
    }
    
    return alertas
  }
}

// Função para criar cartões padrão se não existirem
export const createDefaultCards = async (userId) => {
  const defaultCards = [
    {
      user_id: userId,
      name: 'Nubank',
      bank: 'Nubank',
      credit_limit: 5000,
      closing_day: 28,
      due_day: 15,
      holder: 'voce',
      color: 'purple',
      nickname: 'Nubank',
      is_active: true
    },
    {
      user_id: userId,
      name: 'Inter',
      bank: 'Inter',
      credit_limit: 3000,
      closing_day: 10,
      due_day: 17,
      holder: 'voce',
      color: 'orange',
      nickname: 'Inter',
      is_active: true
    }
  ]

  for (const card of defaultCards) {
    await cards.create(card)
  }
}

// NOVAS FUNÇÕES: Upload de arquivos
export const storage = {
  async uploadPayrollFile(userId, file) {
    const fileName = `${userId}/${Date.now()}_${file.name}`
    
    const { data, error } = await supabase.storage
      .from('payroll-files')
      .upload(fileName, file)
    
    if (error) return { data: null, error }
    
    const { data: urlData } = supabase.storage
      .from('payroll-files')
      .getPublicUrl(fileName)
    
    return { data: { ...data, publicUrl: urlData.publicUrl }, error: null }
  },

  async deleteFile(bucketName, fileName) {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName])
    
    return { error }
  }
}

// NOVAS FUNÇÕES: Análises e Relatórios
export const analytics = {
  // Análise de receitas por categoria
  async getReceitasByCategory(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        categories (
          name,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .eq('type', 'receita')
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('status', 'confirmado')
    
    return { data, error }
  },

  // Evolução mensal de receitas
  async getMonthlyEvolution(userId, months = 6) {
    const { data, error } = await supabase.rpc('get_monthly_evolution', {
      user_id: userId,
      months_back: months,
      transaction_type: 'receita'
    })
    
    return { data, error }
  },

  // Comparação com mês anterior
  async getMonthComparison(userId) {
    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear
    
    const currentStats = await transactions.getMonthStats(userId, currentMonth, currentYear)
    const previousStats = await transactions.getMonthStats(userId, previousMonth, previousYear)
    
    return { currentStats, previousStats }
  }
}

// Função para calcular progresso das metas
export const calculateGoalProgress = (currentAmount, targetAmount) => {
  return Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
}

// Função para formatação de moeda
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Função para formatação de data
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

// Função para calcular próxima data de recorrência
export const getNextRecurrenceDate = (lastDate, frequency) => {
  const date = new Date(lastDate)
  
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'quarterly':
      date.setMonth(date.getMonth() + 3)
      break
    case 'annually':
      date.setFullYear(date.getFullYear() + 1)
      break
    default:
      date.setMonth(date.getMonth() + 1)
  }
  
  return date.toISOString().split('T')[0]
}

// Funções auxiliares para validação
export const validators = {
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },
  
  isValidAmount(amount) {
    return !isNaN(amount) && parseFloat(amount) > 0
  },
  
  isValidDate(date) {
    return !isNaN(Date.parse(date))
  }
}