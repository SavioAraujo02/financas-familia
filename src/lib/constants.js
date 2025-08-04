// src/lib/constants.js
// Constantes padronizadas para todo o sistema

export const CORES_SISTEMA = {
    receitas: '#10b981',
    despesas: '#ef4444',
    cartoes: '#3b82f6',
    previsao: '#8b5cf6',
    dashboard: '#667eea',
    metas: '#f59e0b',
    neutro: '#64748b',
    sucesso: '#10b981',
    alerta: '#f59e0b',
    erro: '#ef4444',
    info: '#3b82f6'
  }
  
  export const CONTAINER_PADRAO = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0'
  }
  
  export const HEADER_GRADIENTS = {
    receitas: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    despesas: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    cartoes: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    dashboard: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    previsao: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    metas: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  }
  
  export const CARD_FINANCEIRO_STYLES = {
    receitas: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
    },
    despesas: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
    },
    faturas: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
    },
    saldo: {
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
    }
  }
  
  export const LOADING_SPINNER_STYLE = {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  }
  
  export const FINBOT_STYLE = {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: '12px',
    padding: '16px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)'
  }
  
  export const RESPONSAVEL_ICONS = {
    voce: '👨',
    esposa: '👩',
    compartilhado: '👨👩'
  }
  
  export const STATUS_ICONS = {
    confirmado: '✅',
    pendente: '⏳',
    recorrente: '🔄'
  }
  
  export const PAYMENT_METHOD_LABELS = {
    dinheiro: 'Dinheiro',
    debito: 'Débito',
    credito: 'Crédito',
    pix: 'PIX',
    transferencia: 'Transferência'
  }