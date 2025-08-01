// Formatação de moeda brasileira
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Formatação de data brasileira
export function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

// Formatação de porcentagem
export function formatPercentage(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100)
}

// Calcular porcentagem
export function calculatePercentage(value, total) {
  if (total === 0) return 0
  return (value / total) * 100
}

// Combinar classes CSS
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}