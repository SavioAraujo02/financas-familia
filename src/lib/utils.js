// src/lib/utils.js
// Utilitários padronizados - importa das novas funções centralizadas

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Função para combinar classes CSS
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Re-exportar funções de formatação do novo serviço
export { 
  formatCurrency, 
  formatDate, 
  formatDateShort,
  formatPercentage,
  formatInstallments,
  getStatusIcon,
  getResponsavelIcon,
  getPaymentMethodLabel,
  formatMonthYear,
  calculatePercentage,
  formatCompactNumber
} from './services/formatService'

// Re-exportar constantes
export { 
  CORES_SISTEMA, 
  CONTAINER_PADRAO, 
  HEADER_GRADIENTS,
  CARD_FINANCEIRO_STYLES,
  LOADING_SPINNER_STYLE,
  FINBOT_STYLE
} from './constants'

// Função utilitária para criar estilos de loading
export const createLoadingSpinner = (color = 'white') => ({
  width: '60px',
  height: '60px',
  border: `4px solid ${color === 'white' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}`,
  borderTop: `4px solid ${color}`,
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto 20px'
})

// Função utilitária para criar containers padronizados
export const createContainer = (customStyles = {}) => ({
  ...CONTAINER_PADRAO,
  ...customStyles
})

// Função utilitária para validações
export const validators = {
  isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isValidAmount: (amount) => !isNaN(amount) && parseFloat(amount) > 0,
  isValidDate: (date) => !isNaN(Date.parse(date)),
  isValidCPF: (cpf) => {
    // Implementação básica - pode ser expandida
    return cpf && cpf.length === 11 && /^\d+$/.test(cpf)
  }
}

// Função para calcular saúde financeira
export const calculateFinancialHealth = (receitas, despesas, faturas, renda) => {
  if (!renda || renda === 0) return 0
  
  const comprometimento = (faturas / renda) * 100
  const economia = receitas - despesas
  const percentualEconomia = (economia / receitas) * 100
  
  let score = 100
  
  // Penalizar alto comprometimento
  if (comprometimento > 70) score -= 40
  else if (comprometimento > 50) score -= 25
  else if (comprometimento > 30) score -= 10
  
  // Bonificar economia
  if (percentualEconomia > 20) score += 10
  else if (percentualEconomia < 0) score -= 20
  
  return Math.max(0, Math.min(100, Math.round(score)))
}

// Função para determinar cor baseada em saúde financeira
export const getHealthColor = (percentage) => {
  if (percentage >= 80) return CORES_SISTEMA.sucesso
  if (percentage >= 60) return CORES_SISTEMA.info
  if (percentage >= 40) return CORES_SISTEMA.alerta
  return CORES_SISTEMA.erro
}