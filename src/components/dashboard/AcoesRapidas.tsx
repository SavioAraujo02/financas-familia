'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  CreditCard, 
  Target, 
  BarChart3, 
  Eye, 
  Repeat,
  DollarSign,
  TrendingDown
} from 'lucide-react'

const acoes = [
  {
    title: 'Nova Receita',
    description: 'Cadastrar nova receita',
    icon: DollarSign,
    href: '/receitas',  // ✅ CORRIGIDO
    className: 'bg-green-500 hover:bg-green-600 text-white'
  },
  {
    title: 'Nova Despesa',
    description: 'Registrar nova despesa',
    icon: TrendingDown,
    href: '/despesas',  // ✅ CORRIGIDO
    className: 'bg-red-500 hover:bg-red-600 text-white'
  },
  {
    title: 'Pagar Fatura',
    description: 'Marcar fatura como paga',
    icon: CreditCard,
    href: '/cartoes',  // ✅ CORRIGIDO
    className: 'bg-blue-500 hover:bg-blue-600 text-white'
  },
  {
    title: 'Depositar Meta',
    description: 'Adicionar valor nas metas',
    icon: Target,
    href: '/metas',  // ✅ CORRIGIDO
    className: 'bg-purple-500 hover:bg-purple-600 text-white'
  },
  {
    title: 'Ver Relatório',
    description: 'Gerar relatório mensal',
    icon: BarChart3,
    href: '/relatorios',  // ✅ CORRIGIDO
    className: 'bg-indigo-500 hover:bg-indigo-600 text-white'
  },
  {
    title: 'Visualizar Gastos',
    description: 'Ver todas as despesas',
    icon: Eye,
    href: '/despesas/gerenciar',  // ✅ CORRIGIDO (baseado na sidebar)
    className: 'bg-gray-500 hover:bg-gray-600 text-white'
  }
]

export function AcoesRapidas() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {acoes.map((acao) => (
            <Link key={acao.title} href={acao.href}>
              <Button
                variant="outline"
                className={`h-20 w-full flex flex-col items-center justify-center space-y-2 border-2 hover:border-transparent transition-all ${acao.className}`}
              >
                <acao.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="text-xs font-semibold">{acao.title}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}