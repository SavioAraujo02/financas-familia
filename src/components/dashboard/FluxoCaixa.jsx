// src/components/dashboard/FluxoCaixa.jsx
// Gráfico de fluxo de caixa futuro - VERSÃO AUTOMÁTICA

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts'
import { CONTAINER_PADRAO } from '@/lib/constants'

export function FluxoCaixa({ 
  fluxoCaixaData = [], 
  loading = false 
}) {
  // Detectar mês atual automaticamente
  const hoje = new Date()
  const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const mesAtual = mesesAbrev[hoje.getMonth()]
  
  // Verificar se o mês atual existe nos dados
  const temMesAtual = fluxoCaixaData.some(item => item.mes === mesAtual)
  
  // Debug para verificar
  console.log('🔍 DEBUG FluxoCaixa:', {
    hoje: hoje.toLocaleDateString('pt-BR'),
    mesNumero: hoje.getMonth(),
    mesAtual: mesAtual,
    temMesAtual: temMesAtual,
    dadosDisponiveis: fluxoCaixaData.map(item => item.mes)
  })

  if (loading) {
    return (
      <div style={CONTAINER_PADRAO}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '0 0 20px 0',
          color: '#1a202c'
        }}>
          📊 FLUXO DE CAIXA FUTURO
        </h2>
        
        <div style={{ 
          height: '200px', 
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 1.5s infinite'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      </div>
    )
  }

  return (
    <div style={CONTAINER_PADRAO}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        margin: '0 0 20px 0',
        color: '#1a202c'
      }}>
        📊 FLUXO DE CAIXA FUTURO
      </h2>
      
      <div style={{ height: '200px', marginBottom: '16px' }}>
        {fluxoCaixaData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fluxoCaixaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="mes" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
              />
              
              {/* Linha "Você está aqui" - AUTOMÁTICA */}
              {temMesAtual && (
                <ReferenceLine 
                  x={mesAtual}
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ 
                    value: "← Você está aqui", 
                    position: "topRight",
                    style: { fill: '#ef4444', fontWeight: 'bold', fontSize: '12px' }
                  }} 
                />
              )}
              
              {/* Se não tem o mês atual, mostrar no último mês disponível */}
              {!temMesAtual && fluxoCaixaData.length > 0 && (
                <ReferenceLine 
                  x={fluxoCaixaData[fluxoCaixaData.length - 1].mes}
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ 
                    value: "← Último dado", 
                    position: "topRight",
                    style: { fill: '#f59e0b', fontWeight: 'bold', fontSize: '12px' }
                  }} 
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>
              📊
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
              Dados insuficientes
            </div>
            <div style={{ fontSize: '12px', textAlign: 'center' }}>
              Adicione mais transações para ver a evolução
            </div>
          </div>
        )}
      </div>
      
      <div style={{
        backgroundColor: temMesAtual ? '#fef3c7' : '#f3f4f6',
        border: `1px solid ${temMesAtual ? '#fcd34d' : '#d1d5db'}`,
        borderRadius: '8px',
        padding: '12px',
        fontSize: '13px',
        color: temMesAtual ? '#92400e' : '#6b7280'
      }}>
        🎯 <strong>
          {temMesAtual 
            ? `Você está aqui (${mesAtual})` 
            : `Mês atual: ${mesAtual} (sem dados)`
          }
        </strong> - Setembro será o mês mais apertado
      </div>
    </div>
  )
}