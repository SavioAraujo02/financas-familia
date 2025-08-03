export function FormularioDespesa({
    tipoFormulario,
    setTipoFormulario,
    formData,
    setFormData,
    categories,
    cartoes,
    handleSubmit
  }) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          margin: '0 0 20px 0',
          color: '#1a202c',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          💸 NOVA DESPESA
        </h2>
  
        {/* Seleção do Tipo */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '12px'
        }}>
          {[
            { id: 'avista', label: '💵 À Vista', desc: 'Dinheiro/Débito' },
            { id: 'parcelada', label: '💳 Parcelada', desc: 'Cartão Crédito' },
            { id: 'fixa', label: '📅 Fixa', desc: 'Recorrente' },
            { id: 'variavel', label: '🔄 Variável', desc: 'Esporádica' }
          ].map(tipo => (
            <button
              key={tipo.id}
              onClick={() => setTipoFormulario(tipo.id)}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: tipoFormulario === tipo.id ? '#ef4444' : '#f8fafc',
                color: tipoFormulario === tipo.id ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div>{tipo.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{tipo.desc}</div>
            </button>
          ))}
        </div>
  
        {/* Formulário Dinâmico */}
        <form onSubmit={handleSubmit}>
          <CamposComuns 
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            tipoFormulario={tipoFormulario}
          />
          
          <CamposEspecificos 
            tipoFormulario={tipoFormulario}
            formData={formData}
            setFormData={setFormData}
            cartoes={cartoes}
          />
          
          <BotoesFormulario 
            setFormData={setFormData}
          />
        </form>
      </div>
    )
  }
  
  // Componente dos Campos Comuns
  function CamposComuns({ formData, setFormData, categories, tipoFormulario }) {
    return (
      <>
        {/* Descrição e Valor */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              📝 Descrição *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder={
                tipoFormulario === 'avista' ? 'Mercado, Farmácia...' :
                tipoFormulario === 'parcelada' ? 'Sofá, TV, Celular...' :
                tipoFormulario === 'fixa' ? 'Aluguel, Plano Saúde...' :
                'Cinema, Restaurante...'
              }
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
  
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              💵 Valor (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0,00"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
  
        {/* Categoria, Data, Responsável */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              🏷️ Categoria *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="">Selecione...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
  
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              📅 Data
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
  
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              👤 Responsável
            </label>
            <select
              value={formData.responsavel}
              onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="voce">👨 Você</option>
              <option value="esposa">👩 Esposa</option>
              <option value="compartilhado">👨👩 Compartilhado</option>
            </select>
          </div>
        </div>
      </>
    )
  }
  
  // Componente dos Campos Específicos
  function CamposEspecificos({ tipoFormulario, formData, setFormData, cartoes }) {
    if (tipoFormulario === 'avista') {
      return (
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            💰 Forma de Pagamento
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { value: 'dinheiro', label: '💵 Dinheiro' },
              { value: 'debito', label: '💳 Cartão Débito' }
            ].map(forma => (
              <label key={forma.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="payment_method"
                  value={forma.value}
                  checked={formData.payment_method === forma.value}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                />
                {forma.label}
              </label>
            ))}
          </div>
        </div>
      )
    }
  
    if (tipoFormulario === 'parcelada') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              🏦 Cartão
            </label>
            <select
              value={formData.card_id}
              onChange={(e) => setFormData({...formData, card_id: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="">Selecione o cartão...</option>
              {cartoes.map(cartao => (
                <option key={cartao.id} value={cartao.id}>
                  🏦 {cartao.name} (fecha {cartao.closing_day})
                </option>
              ))}
            </select>
          </div>
  
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              🔢 Parcelas
            </label>
            <select
              value={formData.installments}
              onChange={(e) => setFormData({...formData, installments: parseInt(e.target.value)})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12,15,18,24].map(num => (
                <option key={num} value={num}>{num}x</option>
              ))}
            </select>
          </div>
        </div>
      )
    }
  
    if (tipoFormulario === 'fixa') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              📅 Dia Vencimento
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={formData.due_day}
              onChange={(e) => setFormData({...formData, due_day: e.target.value})}
              placeholder="15"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
  
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              🔄 Frequência
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({...formData, frequency: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="monthly">🗓️ Mensal</option>
              <option value="quarterly">📊 Trimestral</option>
              <option value="annually">🎊 Anual</option>
            </select>
          </div>
  
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              📊 Gerar para
            </label>
            <select
              value={formData.recurrence_months}
              onChange={(e) => setFormData({...formData, recurrence_months: parseInt(e.target.value)})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
              <option value="24">24 meses</option>
            </select>
          </div>
        </div>
      )
    }
  
    return null
  }
  
  // Componente dos Botões
  function BotoesFormulario({ setFormData }) {
    return (
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="submit"
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            flex: 1
          }}
        >
          💾 SALVAR DESPESA
        </button>
        <button
          type="button"
          onClick={() => setFormData({
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            category_id: '',
            payment_method: 'dinheiro',
            responsavel: 'voce',
            card_id: '',
            installments: 1,
            due_day: '',
            frequency: 'monthly',
            recurrence_months: 12
          })}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🔄 LIMPAR
        </button>
      </div>
    )
  }