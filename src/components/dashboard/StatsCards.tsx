'use client'

import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Target, AlertTriangle } from 'lucide-react'

// Dados mock - depois vamos buscar do banco
const statsData = {
  receitas: {
    valor: 10600,
    crescimento: 2.5,
    status: 'up'
  },
  despesas: {
    valor: 8795.79,
    crescimento: -1.8,
    status: 'down'
  },
  faturas: {
    valor: 4240,
    percentualRenda: 40,
    status: 'warning'
  },
  saldo: {
    valor: 1804.21,
    crescimento: 25.3,
    status: 'up'
  },
  saudeFinanceira: {
    score: 73,
    status: 'good'
  },
  proximaFatura: {
    valor: 847,
    dias: 3,
    cartao: 'Nubank'
  }
}

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {/* Receita Mensal */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">
            Receita do Mês
          </CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(statsData.receitas.valor)}
          </div>
          <div className="flex items-center text-xs text-green-600 mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            +{statsData.receitas.crescimento}% vs mês anterior
          </div>
        </CardContent>
      </Card>

      {/* Despesas Mensais */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">
            Despesas do Mês
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(statsData.despesas.valor)}
          </div>
          <div className="flex items-center text-xs text-green-600 mt-1">
            <TrendingDown className="h-3 w-3 mr-1" />
            {Math.abs(statsData.despesas.crescimento)}% menor que o mês anterior
          </div>
        </CardContent>
      </Card>

      {/* Faturas Previstas */}
      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-800">
            Faturas Previstas
          </CardTitle>
          <CreditCard className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">
            {formatCurrency(statsData.faturas.valor)}
          </div>
          <div className="flex items-center text-xs text-orange-600 mt-1">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {statsData.faturas.percentualRenda}% da renda comprometida
          </div>
        </CardContent>
      </Card>

      {/* Saldo Projetado */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">
            Saldo Projetado
          </CardTitle>
          <Target className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">
            {formatCurrency(statsData.saldo.valor)}
          </div>
          <div className="flex items-center text-xs text-green-600 mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            +{statsData.saldo.crescimento}% vs mês anterior
          </div>
        </CardContent>
      </Card>

      {/* Saúde Financeira */}
      <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-teal-800">
            Saúde Financeira
          </CardTitle>
          <div className={`h-3 w-3 rounded-full ${
            statsData.saudeFinanceira.score >= 70 ? 'bg-green-500' : 
            statsData.saudeFinanceira.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-teal-900">
            {statsData.saudeFinanceira.score}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${statsData.saudeFinanceira.score}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Próxima Fatura */}
      <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800">
            Próxima Fatura
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-900">
            {formatCurrency(statsData.proximaFatura.valor)}
          </div>
          <div className="text-xs text-red-600 mt-1">
            {statsData.proximaFatura.cartao} • em {statsData.proximaFatura.dias} dias
          </div>
        </CardContent>
      </Card>
    </div>
  )
}