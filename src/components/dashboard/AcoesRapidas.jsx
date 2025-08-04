// src/components/dashboard/AcoesRapidas.jsx
// Botões de ações rápidas do dashboard

import { CONTAINER_PADRAO, CORES_SISTEMA } from '@/lib/constants'

export function AcoesRapidas({ 
  setModoCosal,
  modoCosal = false 
}) {
  const acoes = [
    { label: '💰 + Receita', cor: CORES_SISTEMA.receitas, href: '/receitas' },
    { label: '💸 + Despesa', cor: CORES_SISTEMA.despesas, href: '/despesas' },
    { label: '🛒 + Compra', cor: CORES_SISTEMA.cartoes, href: '/despesas/gerenciar' },
    { label: '💳 Pagar', cor: CORES_SISTEMA.alerta, href: '/cartoes' },
    { label: '🎯 + Meta', cor: CORES_SISTEMA.metas, href: '/metas' },
    { label: '📊 Relatório', cor: CORES_SISTEMA.neutro, href: '/relatorios' },
    { label: '🎭 Modo Casal', cor: '#ec4899', action: 'modal' },
    { label: '🔮 Previsão', cor: CORES_SISTEMA.previsao, href: '/previsao' }
  ]

  const handleAcaoClick = (acao) => {
    if (acao.action === 'modal') {
      setModoCosal && setModoCosal(!modoCosal)
    } else if (acao.href) {
      window.location.href = acao.href
    }
  }

  return (
    <div style={CONTAINER_PADRAO}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        margin: '0 0 20px 0',
        color: '#1a202c'
      }}>
        ⚡ AÇÕES RÁPIDAS
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        {acoes.map((acao, index) => (
          <button
            key={index}
            onClick={() => handleAcaoClick(acao)}
            style={{
              backgroundColor: acao.cor,
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: `0 4px 15px ${acao.cor}33`,
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = `0 8px 25px ${acao.cor}44`
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = `0 4px 15px ${acao.cor}33`
            }}
          >
            {acao.label}
            
            {/* Efeito de brilho no hover */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              transition: 'left 0.5s ease'
            }} 
            onMouseOver={(e) => {
              e.target.style.left = '100%'
            }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}