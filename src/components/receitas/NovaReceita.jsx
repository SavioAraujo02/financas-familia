export function NovaReceita({ 
    formMode,
    setFormMode,
    formData,
    setFormData,
    categories,
    handleSubmit,
    setShowRecurrenceModal,
    setShowContrachequeModal
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
          💰 NOVA RECEITA
        </h2>
  
        {/* Abas do Formulário */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '12px'
        }}>
          {[
            { id: 'manual', label: '📝 Manual', desc: 'Entrada manual' },
            { id: 'contracheque', label: '📄 Contracheque', desc: 'Upload/OCR' },
            { id: 'automatica', label: '📊 Automática', desc: 'Recorrente' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFormMode(tab.id)}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: formMode === tab.id ? '#10b981' : '#f8fafc',
                color: formMode === tab.id ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div>{tab.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{tab.desc}</div>
            </button>
          ))}
        </div>
  
        {/* Formulário Manual */}
        {formMode === 'manual' && (
          <FormularioManual 
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            handleSubmit={handleSubmit}
          />
        )}
  
        {/* Formulário Contracheque */}
        {formMode === 'contracheque' && (
          <FormularioContracheque 
            setShowContrachequeModal={setShowContrachequeModal}
          />
        )}
  
        {/* Formulário Automática */}
        {formMode === 'automatica' && (
          <FormularioAutomatica 
            setShowRecurrenceModal={setShowRecurrenceModal}
          />
        )}
      </div>
    )
  }
  
  // Componente do Formulário Manual
  function FormularioManual({ formData, setFormData, categories, handleSubmit }) {
    return (
      <form onSubmit={handleSubmit}>
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
              placeholder="Salário, Freelance, Aluguel..."
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
  
        {/* Frequência */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            🔄 Frequência
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="frequencia"
                value="unica"
                checked={formData.frequencia === 'unica'}
                onChange={(e) => setFormData({...formData, frequencia: e.target.value})}
              />
              ⚡ Única
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="frequencia"
                value="recorrente"
                checked={formData.frequencia === 'recorrente'}
                onChange={(e) => setFormData({...formData, frequencia: e.target.value})}
              />
              🔄 Recorrente
            </label>
          </div>
        </div>
  
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            style={{
              backgroundColor: '#10b981',
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
            💾 SALVAR RECEITA
          </button>
          <button
            type="button"
            onClick={() => setFormData({
              description: '',
              amount: '',
              date: new Date().toISOString().split('T')[0],
              category_id: '',
              status: 'confirmado',
              responsavel: 'voce',
              frequencia: 'unica'
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
      </form>
    )
  }
  
  // Componente do Formulário Contracheque
  function FormularioContracheque({ setShowContrachequeModal }) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '2px dashed #cbd5e0'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', color: '#1a202c' }}>
          Upload do Contracheque
        </h3>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          Tire uma foto ou faça upload do PDF do seu contracheque
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => setShowContrachequeModal(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📱 Tirar Foto
          </button>
          <button
            onClick={() => setShowContrachequeModal(true)}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📄 Upload PDF
          </button>
          <button
            onClick={() => setShowContrachequeModal(true)}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            🔗 Conectar RH
          </button>
        </div>
        
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
          Nossa IA extrai automaticamente: salário bruto, descontos (INSS, IR, plano de saúde) e valor líquido
        </p>
      </div>
    )
  }
  
  // Componente do Formulário Automática
  function FormularioAutomatica({ setShowRecurrenceModal }) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#f0f9ff',
        borderRadius: '12px',
        border: '2px solid #7dd3fc'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', color: '#0c4a6e' }}>
          Receita Recorrente
        </h3>
        <p style={{ color: '#0369a1', marginBottom: '20px' }}>
          Configure uma receita que se repete automaticamente
        </p>
        
        <button
          onClick={() => setShowRecurrenceModal(true)}
          style={{
            backgroundColor: '#0ea5e9',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ⚙️ CONFIGURAR RECORRÊNCIA
        </button>
        
        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '16px' }}>
          Salários, aluguéis, freelances mensais, etc.
        </p>
      </div>
    )
  }