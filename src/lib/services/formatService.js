// src/lib/services/formatService.js
// Funções de formatação padronizadas para todo o sistema

export const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'R$ 0,00'
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }
  
  export const formatDate = (date) => {
    if (!date) return ''
    
    try {
      return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
    } catch (error) {
      return ''
    }
  }
  
  export const formatDateShort = (date) => {
    if (!date) return ''
    
    try {
      return new Date(date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short' 
      })
    } catch (error) {
      return ''
    }
  }
  
  export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0%'
    }
    
    return `${value.toFixed(decimals)}%`
  }
  
  export const formatInstallments = (current, total) => {
    if (!current || !total || total === 1) {
      return '1x'
    }
    
    return `${current}/${total}`
  }
  
  export const getStatusIcon = (status) => {
    const icons = {
      confirmado: '✅',
      pendente: '⏳',
      recorrente: '🔄',
      cancelado: '❌'
    }
    
    return icons[status] || '⏳'
  }
  
  export const getResponsavelIcon = (responsible) => {
    const icons = {
      voce: '👨',
      esposa: '👩',
      compartilhado: '👨👩'
    }
    
    return icons[responsible] || '👨'
  }
  
  export const getPaymentMethodLabel = (method) => {
    const labels = {
      dinheiro: 'Dinheiro',
      debito: 'Débito',
      credito: 'Crédito',
      pix: 'PIX',
      transferencia: 'Transferência'
    }
    
    return labels[method] || method
  }
  
  export const formatMonthYear = (date) => {
    if (!date) return ''
    
    try {
      return new Date(date).toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      })
    } catch (error) {
      return ''
    }
  }
  
  export const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0
    
    return Math.round((value / total) * 100)
  }
  
  export const formatCompactNumber = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    
    return value.toString()
  }