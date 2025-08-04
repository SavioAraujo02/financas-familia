// src/types/index.ts
// Tipos unificados para todo o sistema financeiro

export interface Transaction {
    id: string
    user_id: string
    amount: number
    description: string
    date: string
    status: 'confirmado' | 'pendente'
    responsible: 'voce' | 'esposa' | 'compartilhado'
    type: 'receita' | 'despesa'
    category_id?: string
    card_id?: string
    installments?: number
    installment_number?: number
    recurring_id?: string
    payment_method?: string
    tags?: string[]
    created_at?: string
    categories?: {
      name: string
      icon: string
      color: string
    }
    cards?: {
      name: string
      color: string
      bank: string
    }
  }
  
  export interface CardData {
    valor: number
    status: string
    emoji: string
    percentualRenda?: number
    percentualOrcado?: number
    alerta?: string
    situacao?: string
  }
  
  export interface FilterState {
    periodo: string
    categoria: string
    responsible: string
    busca: string
    dataInicio?: string
    dataFim?: string
    valorMinimo?: string
  }
  
  export interface DadosFamilia {
    nome: string
    rendaTotal: number
    nivel: number
    tituloNivel: string
    saudeFinanceira: number
    rendaComprometida: number
    rendaLivre: number
    economiaMedia: number
    diasAtivos: number
  }
  
  export interface CartaoResumo {
    nome: string
    usado: number
    limite: number
    percentual: number
    cor: string
  }
  
  export interface CategoriaResumo {
    nome: string
    valor: number
    percentual: number
    cor: string
  }