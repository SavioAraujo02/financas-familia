// src/components/dashboard/CardsFinanceiros.jsx
// Cards principais do dashboard seguindo a especificação

import { useState, useEffect } from 'react'
import { StatCard } from '@/components/ui/StatCard'
import { formatCurrency } from '@/lib/utils'

export function CardsFinanceiros({ 
  cardsData, 
  animatedValues, 
  loading = false 
}) {
  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}>
        {Array(4).fill(0).map((_, index) => (
          <StatCard key={index} loading={true} />
        ))}
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    }}>
      {/* 💰 RECEITA MÊS */}
      <StatCard
        tipo="receitas"
        titulo="RECEITA MÊS"
        valor={animatedValues.receita}
        emoji="💰"
        subtitulo={cardsData.receita.status}
        onClick={() => window.location.href = '/receitas'}
      />

      {/* 💸 DESPESAS MÊS */}
      <StatCard
        tipo="despesas"
        titulo="DESPESAS MÊS"
        valor={animatedValues.despesas}
        emoji="💸"
        subtitulo={`📊 ${cardsData.despesas.percentualOrcado}% do orçado`}
        onClick={() => window.location.href = '/despesas'}
      />

      {/* 💳 FATURAS PREVISTAS */}
      <StatCard
        tipo="faturas"
        titulo="FATURAS PREVISTAS"
        valor={animatedValues.faturas}
        emoji="💳"
        subtitulo={`${cardsData.faturas.alerta} ${cardsData.faturas.percentualRenda}% da renda`}
        onClick={() => window.location.href = '/cartoes'}
      />

      {/* 🔮 CRYSTAL BALL */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        color: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onClick={() => window.location.href = '/previsao'}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(139, 92, 246, 0.4)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)'
      }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '32px' }}>🔮</span>
          <div style={{ width: '100%' }}>
            <h3 style={{ fontSize: '14px', opacity: 0.9, margin: 0, fontWeight: '500' }}>
              CRYSTAL BALL
            </h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '4px 0 0 0' }}>
              {formatCurrency(animatedValues.saldo)}
            </p>
            <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>
              {cardsData.saldo.situacao}
            </p>
            
            {/* Previsão Inteligente */}
            <div style={{
              marginTop: '8px',
              padding: '8px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: '6px',
              fontSize: '11px',
              lineHeight: '1.3'
            }}>
              🔮 Próximo mês crítico: Setembro
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}