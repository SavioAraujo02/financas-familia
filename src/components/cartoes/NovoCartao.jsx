export function NovoCartao({
    showAddCard,
    setShowAddCard,
    formData,
    setFormData,
    handleSubmit,
    bancos,
    cores
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
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '0 0 20px 0',
          color: '#1a202c'
        }}>
          💳 NOVO CARTÃO
        </h2>
  
        {!showAddCard ? (
          <EstadoInicial setShowAddCard={setShowAddCard} />
        ) : (
          <FormularioCartao 
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            setShowAddCard={setShowAddCard}
            bancos={bancos}
            cores={cores}
          />
        )}
      </div>
    )
  }
  
  // Componente do Estado Inicial
  function EstadoInicial({ setShowAddCard }) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          Adicione um novo cartão de crédito para melhor controle
        </p>
        <button
          onClick={() => setShowAddCard(true)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ➕ ADICIONAR CARTÃO
        </button>
      </div>
    )
  }
  
  // Componente do Formulário
  function FormularioCartao({ formData, setFormData, handleSubmit, setShowAddCard, bancos, cores }) {
    return (
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              🏦 Banco *
            </label>
            <select
              value={formData.bank}
              onChange={(e) => setFormData({...formData, bank: e.target.value, name: e.target.value})}
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
              <option value="">Selecione o banco...</option>
              {bancos.map(banco => (
                <option key={banco} value={banco}>{banco}</option>
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
              📛 Apelido
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({...formData, nickname: e.target.value})}
              placeholder="Ex: Cartão Principal, Raimundo..."
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
              💰 Limite (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.credit_limit}
              onChange={(e) => setFormData({...formData, credit_limit: e.target.value})}
              placeholder="5000.00"
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
  
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                📅 Fecha dia *
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.closing_day}
                onChange={(e) => setFormData({...formData, closing_day: e.target.value})}
                placeholder="15"
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
                📅 Vence dia *
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.due_day}
                onChange={(e) => setFormData({...formData, due_day: e.target.value})}
                placeholder="08"
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
  
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                👤 Titular
              </label>
              <select
                value={formData.holder}
                onChange={(e) => setFormData({...formData, holder: e.target.value})}
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
  
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                🎨 Cor
              </label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
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
                {cores.map(cor => (
                  <option key={cor.value} value={cor.value}>{cor.label}</option>
                ))}
              </select>
            </div>
          </div>
  
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1
              }}
            >
              💾 ADICIONAR CARTÃO
            </button>
            <button
              type="button"
              onClick={() => setShowAddCard(false)}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ❌
            </button>
          </div>
        </div>
      </form>
    )
  }