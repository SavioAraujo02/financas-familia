'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'

export default function ConfiguracoesRevolucionarias() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Estados para abas de configuração
  const [abaAtiva, setAbaAtiva] = useState('perfil') // 'perfil', 'financeiro', 'notificacoes', 'visual', 'seguranca', 'backup', 'dados', 'avancado'

  // Estados para configurações de perfil
  const [perfilConfig, setPerfilConfig] = useState({
    // Seu Perfil
    seuNome: 'João Silva',
    seuEmail: 'joao@email.com',
    seuTelefone: '(11) 99999-9999',
    suaRenda: 6400.00,
    suaParticipacao: 60.4,
    
    // Perfil da Esposa
    nomeEsposa: 'Maria Silva',
    emailEsposa: 'maria@email.com',
    telefoneEsposa: '(11) 88888-8888',
    rendaEsposa: 4200.00,
    participacaoEsposa: 39.6,
    
    // Dados Familiares
    nomeFamilia: 'Família Silva',
    rendaTotal: 10600.00,
    metaPoupanca: 20,
    dataCriacao: '15/Jan/2025'
  })

  // Estados para configurações financeiras
  const [financeiroConfig, setFinanceiroConfig] = useState({
    // Limites e Alertas
    gastoAlto: 500.00,
    faturaCritica: 80,
    metaPoupancaMensal: 2120.00,
    rendaComprometidaMax: 70,
    
    // Categorias Personalizadas
    categorias: [
      { id: 1, nome: 'Moradia', icone: '🏠', cor: '#3b82f6', editando: false },
      { id: 2, nome: 'Alimentação', icone: '🍔', cor: '#10b981', editando: false },
      { id: 3, nome: 'Transporte', icone: '🚗', cor: '#f59e0b', editando: false },
      { id: 4, nome: 'Saúde', icone: '💊', cor: '#ef4444', editando: false },
      { id: 5, nome: 'Lazer', icone: '🎮', cor: '#8b5cf6', editando: false },
      { id: 6, nome: 'Educação', icone: '📚', cor: '#06b6d4', editando: false }
    ],
    
    // Configuração dos Cartões
    coresPersonalizadas: true,
    lembreteVencimento: 3,
    alertasUso: true,
    sugestoesInteligentes: true
  })

  // Estados para configurações de notificações
  const [notificacoesConfig, setNotificacoesConfig] = useState({
    // Notificações Push
    receitas: { ativo: true, email: true, push: true, sms: false },
    despesas: { ativo: true, email: true, push: true, sms: false },
    faturas: { ativo: true, email: true, push: true, sms: true },
    metas: { ativo: true, email: true, push: true, sms: false },
    conquistas: { ativo: true, email: false, push: true, sms: false },
    
    // Frequência
    relatorioSemanal: { ativo: true, dia: 'sexta', hora: '18:00' },
    resumoMensal: { ativo: true, dia: 1 },
    lembreteMetas: { ativo: true, frequencia: 'semanal' },
    alertasUrgentes: { ativo: true, imediato: true },
    
    // FinBot
    dicasDiarias: { ativo: true, frequencia: 'diaria' },
    analises: true,
    sugestoesEconomia: true,
    personalidade: 'profissional' // 'profissional', 'amigavel', 'motivacional'
  })

  // Estados para configurações visuais
  const [visualConfig, setVisualConfig] = useState({
    tema: 'claro', // 'claro', 'escuro', 'auto'
    corPrimaria: '#3b82f6',
    tamanhoFonte: 'medio', // 'pequeno', 'medio', 'grande'
    animacoes: true,
    graficosAnimados: true,
    modoCompacto: false,
    sidebarExpandida: true
  })

  // Estados para configurações de segurança
  const [segurancaConfig, setSegurancaConfig] = useState({
    autenticacaoDupla: false,
    biometria: true,
    sessaoAutomatica: 30, // minutos
    logoutAutomatico: true,
    historicoAcessos: true,
    alertasLogin: true,
    senhaExpira: false,
    backupCriptografado: true
  })

  // Estados para configurações de backup
  const [backupConfig, setBackupConfig] = useState({
    backupAutomatico: true,
    frequenciaBackup: 'diario', // 'diario', 'semanal', 'mensal'
    manterBackups: 30, // dias
    incluirAnexos: true,
    compressao: true,
    ultimoBackup: '29/Jul/2025 14:30',
    proximoBackup: '30/Jul/2025 14:30',
    tamanhoBackup: '2.3 MB'
  })

  // Estados para modais
  const [showEditarPerfilModal, setShowEditarPerfilModal] = useState(false)
  const [showEditarCategoriaModal, setShowEditarCategoriaModal] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [showExportarModal, setShowExportarModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  // Estados para edição
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)
  const [perfilEditando, setPerfilEditando] = useState('seu') // 'seu', 'esposa', 'familia'

  // Estados para dados calculados
  const [estatisticasUso, setEstatisticasUso] = useState({
    diasUso: 127,
    transacoes: 1247,
    categorias: 12,
    metas: 8,
    backups: 45,
    espacoUsado: '15.7 MB'
  })

  const [finBotDica, setFinBotDica] = useState("Carregando configurações...")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { auth, profiles } = await import('@/lib/supabase')
      
      const { user: currentUser } = await auth.getUser()
      if (!currentUser) {
        window.location.href = '/auth/login'
        return
      }
      
      setUser(currentUser)
      setProfile({ name: currentUser.email?.split('@')[0] || 'Usuário' })

      // 1. CARREGAR CONFIGURAÇÕES REAIS DO USUÁRIO
      const { data: profileData } = await profiles.get(currentUser.id)
      
      if (profileData) {
        setPerfilConfig(prev => ({
          ...prev,
          seuNome: profileData.name || 'João Silva',
          seuEmail: profileData.email || currentUser.email,
          suaRenda: profileData.monthly_income || 6400.00,
          rendaTotal: profileData.monthly_income || 10600.00
        }))
      }

      // 2. GERAR DICA DO FINBOT
      const dica = gerarFinBotDica()
      setFinBotDica(dica)

    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      setFinBotDica("Erro ao carregar dados. Verifique sua conexão.")
    } finally {
      setLoading(false)
    }
  }

  const gerarFinBotDica = () => {
    const dicas = [
      "⚙️ Mantenha suas configurações sempre atualizadas para uma experiência otimizada!",
      "🔔 Configure alertas inteligentes para nunca perder prazos importantes!",
      "🎨 Personalize a interface para tornar o controle financeiro mais agradável!",
      "🔐 Ative a autenticação dupla para máxima segurança dos seus dados!",
      "☁️ O backup automático garante que seus dados estejam sempre seguros!",
      "📊 Ajuste os limites de alerta conforme sua realidade financeira evolui!"
    ]
    
    return dicas[Math.floor(Math.random() * dicas.length)]
  }

  const handleSalvarPerfil = async () => {
    try {
      const { profiles } = await import('@/lib/supabase')
      
      const updates = {
        name: perfilConfig.seuNome,
        monthly_income: perfilConfig.suaRenda
      }

      await profiles.update(user.id, updates)
      alert('✅ Perfil atualizado com sucesso!')
      setShowEditarPerfilModal(false)
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      alert('❌ Erro ao salvar perfil. Tente novamente.')
    }
  }

  const handleEditarCategoria = (categoria) => {
    setCategoriaSelecionada(categoria)
    setShowEditarCategoriaModal(true)
  }

  const handleSalvarCategoria = () => {
    if (!categoriaSelecionada) return

    setFinanceiroConfig(prev => ({
      ...prev,
      categorias: prev.categorias.map(cat => 
        cat.id === categoriaSelecionada.id ? categoriaSelecionada : cat
      )
    }))
    
    setShowEditarCategoriaModal(false)
    setCategoriaSelecionada(null)
    alert('✅ Categoria atualizada com sucesso!')
  }

  const handleAdicionarCategoria = () => {
    const novaCategoria = {
      id: Date.now(),
      nome: 'Nova Categoria',
      icone: '📦',
      cor: '#6b7280',
      editando: true
    }
    
    setFinanceiroConfig(prev => ({
      ...prev,
      categorias: [...prev.categorias, novaCategoria]
    }))
  }

  const handleRemoverCategoria = (categoriaId) => {
    if (confirm('Tem certeza que deseja remover esta categoria?')) {
      setFinanceiroConfig(prev => ({
        ...prev,
        categorias: prev.categorias.filter(cat => cat.id !== categoriaId)
      }))
      alert('✅ Categoria removida com sucesso!')
    }
  }

  const handleFazerBackup = async () => {
    try {
      // Simular processo de backup
      alert('🔄 Iniciando backup...')
      
      setTimeout(() => {
        setBackupConfig(prev => ({
          ...prev,
          ultimoBackup: new Date().toLocaleString('pt-BR'),
          proximoBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('pt-BR')
        }))
        
        alert('✅ Backup realizado com sucesso!')
        setShowBackupModal(false)
      }, 2000)
      
    } catch (error) {
      console.error('Erro ao fazer backup:', error)
      alert('❌ Erro ao fazer backup. Tente novamente.')
    }
  }

  const handleExportarDados = () => {
    try {
      const dadosExport = {
        perfil: perfilConfig,
        configuracoes: {
          financeiro: financeiroConfig,
          notificacoes: notificacoesConfig,
          visual: visualConfig,
          seguranca: segurancaConfig,
          backup: backupConfig
        },
        estatisticas: estatisticasUso,
        dataExportacao: new Date().toISOString()
      }

      const dataStr = JSON.stringify(dadosExport, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `configuracoes_financas_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      alert('📤 Configurações exportadas com sucesso!')
      setShowExportarModal(false)
      
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('❌ Erro ao exportar dados. Tente novamente.')
    }
  }

  const handleResetConfiguracoes = () => {
    if (confirm('⚠️ ATENÇÃO: Isso irá resetar TODAS as configurações para os valores padrão. Esta ação não pode ser desfeita. Tem certeza?')) {
      // Reset para valores padrão
      setFinanceiroConfig({
        gastoAlto: 500.00,
        faturaCritica: 80,
        metaPoupancaMensal: 2120.00,
        rendaComprometidaMax: 70,
        categorias: [
          { id: 1, nome: 'Moradia', icone: '🏠', cor: '#3b82f6', editando: false },
          { id: 2, nome: 'Alimentação', icone: '🍔', cor: '#10b981', editando: false },
          { id: 3, nome: 'Transporte', icone: '🚗', cor: '#f59e0b', editando: false }
        ],
        coresPersonalizadas: true,
        lembreteVencimento: 3,
        alertasUso: true,
        sugestoesInteligentes: true
      })
      
      setNotificacoesConfig({
        receitas: { ativo: true, email: true, push: true, sms: false },
        despesas: { ativo: true, email: true, push: true, sms: false },
        faturas: { ativo: true, email: true, push: true, sms: true },
        metas: { ativo: true, email: true, push: true, sms: false },
        conquistas: { ativo: true, email: false, push: true, sms: false },
        relatorioSemanal: { ativo: true, dia: 'sexta', hora: '18:00' },
        resumoMensal: { ativo: true, dia: 1 },
        lembreteMetas: { ativo: true, frequencia: 'semanal' },
        alertasUrgentes: { ativo: true, imediato: true },
        dicasDiarias: { ativo: true, frequencia: 'diaria' },
        analises: true,
        sugestoesEconomia: true,
        personalidade: 'profissional'
      })
      
      setVisualConfig({
        tema: 'claro',
        corPrimaria: '#3b82f6',
        tamanhoFonte: 'medio',
        animacoes: true,
        graficosAnimados: true,
        modoCompacto: false,
        sidebarExpandida: true
      })
      
      alert('✅ Configurações resetadas para os valores padrão!')
      setShowResetModal(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: 'white', fontSize: '18px', fontWeight: '500' }}>
            ⚙️ Carregando configurações...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        currentPage="config"
      />

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '300px' : '80px',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header Especializado */}
        <header style={{
          background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          color: 'white',
          padding: '20px 32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ☰
              </button>
              
              <div>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  ⚙️ CONFIGURAÇÕES
                  <span style={{ fontSize: '18px', opacity: 0.9 }}>
                    | Personalização Completa do Sistema
                  </span>
                </h1>
              </div>
            </div>

            {/* Status do Sistema */}
            <div style={{ 
              minWidth: '200px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '8px 12px'
            }}>
              <div style={{ fontSize: '12px', marginBottom: '4px', textAlign: 'center' }}>
                ☁️ Backup Automático Ativo
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
                Última sync: 2 min atrás
              </div>
              <div style={{ fontSize: '10px', marginTop: '2px', textAlign: 'center', opacity: 0.8 }}>
                Todos os dados seguros
              </div>
            </div>
          </div>
          
          {/* FinBot */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                padding: '8px',
                fontSize: '20px'
              }}>
                🤖
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '14px' }}>
                  FinBot - Assistente de Configurações
                </p>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', opacity: 0.95 }}>
                  {finBotDica}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Configurações Rápidas */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              margin: '0 0 20px 0',
              color: '#1a202c'
            }}>
              ⚡ CONFIGURAÇÕES RÁPIDAS
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              {[
                { id: 'perfil', label: '👤 Perfil', desc: 'Dados pessoais' },
                { id: 'financeiro', label: '💰 Financeiro', desc: 'Limites e alertas' },
                { id: 'notificacoes', label: '🔔 Notificações', desc: 'Alertas e lembretes' },
                { id: 'visual', label: '🎨 Visual', desc: 'Tema e aparência' },
                { id: 'seguranca', label: '🔐 Segurança', desc: 'Proteção de dados' },
                { id: 'backup', label: '☁️ Backup', desc: 'Sincronização' },
                { id: 'dados', label: '🌐 Dados', desc: 'Exportar/Importar' },
                { id: 'avancado', label: '⚡ Avançado', desc: 'Configurações técnicas' }
              ].map(aba => (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id)}
                  style={{
                    padding: '16px',
                    backgroundColor: abaAtiva === aba.id ? '#6b7280' : '#f8fafc',
                    color: abaAtiva === aba.id ? 'white' : '#64748b',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    if (abaAtiva !== aba.id) {
                      e.target.style.backgroundColor = '#f1f5f9'
                      e.target.style.borderColor = '#cbd5e0'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (abaAtiva !== aba.id) {
                      e.target.style.backgroundColor = '#f8fafc'
                      e.target.style.borderColor = '#e2e8f0'
                    }
                  }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {aba.label}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    {aba.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo das Abas */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            {/* ABA: PERFIL */}
            {abaAtiva === 'perfil' && (
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  margin: '0 0 24px 0',
                  color: '#1a202c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  👤 CONFIGURAÇÕES DE PERFIL
                </h2>

                {/* Seu Perfil */}
                <div style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #7dd3fc',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      margin: 0,
                      color: '#0c4a6e'
                    }}>
                      👨 SEU PERFIL
                    </h3>
                    <button
                      onClick={() => {
                        setPerfilEditando('seu')
                        setShowEditarPerfilModal(true)
                      }}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Editar
                    </button>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '8px' }}>
                        📝 Nome: <strong>{perfilConfig.seuNome}</strong>
                      </div>
                      <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '8px' }}>
                        📧 Email: <strong>{perfilConfig.seuEmail}</strong>
                      </div>
                      <div style={{ fontSize: '14px', color: '#0369a1' }}>
                        📱 Telefone: <strong>{perfilConfig.seuTelefone}</strong>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '8px' }}>
                        💰 Renda: <strong>{formatCurrency(perfilConfig.suaRenda)}</strong>
                      </div>
                      <div style={{ fontSize: '14px', color: '#0369a1' }}>
                        📊 Participação: <strong>{perfilConfig.suaParticipacao}% da renda familiar</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Perfil da Esposa */}
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      margin: 0,
                      color: '#92400e'
                    }}>
                      👩 PERFIL DA ESPOSA
                    </h3>
                    <button
                      onClick={() => {
                        setPerfilEditando('esposa')
                        setShowEditarPerfilModal(true)
                      }}
                      style={{
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Editar
                    </button>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>
                        📝 Nome: <strong>{perfilConfig.nomeEsposa}</strong>
                      </div>
                      <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>
                      📧 Email: <strong>{perfilConfig.emailEsposa}</strong>
                      </div>
                      <div style={{ fontSize: '14px', color: '#92400e' }}>
                        📱 Telefone: <strong>{perfilConfig.telefoneEsposa}</strong>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>
                        💰 Renda: <strong>{formatCurrency(perfilConfig.rendaEsposa)}</strong>
                      </div>
                      <div style={{ fontSize: '14px', color: '#92400e' }}>
                        📊 Participação: <strong>{perfilConfig.participacaoEsposa}% da renda familiar</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dados Familiares */}
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      margin: 0,
                      color: '#166534'
                    }}>
                      🏠 DADOS FAMILIARES
                    </h3>
                    <button
                      onClick={() => {
                        setPerfilEditando('familia')
                        setShowEditarPerfilModal(true)
                      }}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      ⚙️ Ajustar
                    </button>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#166534', marginBottom: '8px' }}>
                        👨‍👩‍👧‍👦 Nome Família: <strong>{perfilConfig.nomeFamilia}</strong>
                      </div>
                      <div style={{ fontSize: '14px', color: '#166534', marginBottom: '8px' }}>
                        💰 Renda Total: <strong>{formatCurrency(perfilConfig.rendaTotal)}</strong>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#166534', marginBottom: '8px' }}>
                        🎯 Meta Poupança: <strong>{perfilConfig.metaPoupanca}% da renda</strong>
                      </div>
                      <div style={{ fontSize: '14px', color: '#166534' }}>
                        📅 Data Criação Conta: <strong>{perfilConfig.dataCriacao}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: FINANCEIRO */}
            {abaAtiva === 'financeiro' && (
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  margin: '0 0 24px 0',
                  color: '#1a202c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  💰 CONFIGURAÇÕES FINANCEIRAS
                </h2>

                {/* Limites e Alertas */}
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0 0 16px 0',
                    color: '#dc2626'
                  }}>
                    📊 LIMITES E ALERTAS
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#dc2626',
                        marginBottom: '6px'
                      }}>
                        ⚠️ Gasto alto: Acima de
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          value={financeiroConfig.gastoAlto}
                          onChange={(e) => setFinanceiroConfig(prev => ({
                            ...prev,
                            gastoAlto: parseFloat(e.target.value) || 0
                          }))}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '2px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <button
                          style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '8px 12px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          ⚙️ Alterar
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#dc2626',
                        marginBottom: '6px'
                      }}>
                        🔴 Fatura crítica:
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          value={financeiroConfig.faturaCritica}
                          onChange={(e) => setFinanceiroConfig(prev => ({
                            ...prev,
                            faturaCritica: parseInt(e.target.value) || 0
                          }))}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '2px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <span style={{ fontSize: '14px', color: '#dc2626' }}>% do limite</span>
                      </div>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#dc2626',
                        marginBottom: '6px'
                      }}>
                        💰 Meta poupança mensal:
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          value={financeiroConfig.metaPoupancaMensal}
                          onChange={(e) => setFinanceiroConfig(prev => ({
                            ...prev,
                            metaPoupancaMensal: parseFloat(e.target.value) || 0
                          }))}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '2px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <button
                          style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '8px 12px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          ⚙️ Alterar
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#dc2626',
                        marginBottom: '6px'
                      }}>
                        📈 % renda comprometida máx:
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          value={financeiroConfig.rendaComprometidaMax}
                          onChange={(e) => setFinanceiroConfig(prev => ({
                            ...prev,
                            rendaComprometidaMax: parseInt(e.target.value) || 0
                          }))}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '2px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <span style={{ fontSize: '14px', color: '#dc2626' }}>%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categorias Personalizadas */}
                <div style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #7dd3fc',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      margin: 0,
                      color: '#0c4a6e'
                    }}>
                      🏷️ CATEGORIAS PERSONALIZADAS
                    </h3>
                    <button
                      onClick={handleAdicionarCategoria}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      ➕ Adicionar Nova Categoria
                    </button>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    {financeiroConfig.categorias.map((categoria, index) => (
                      <div key={categoria.id} style={{
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '20px' }}>{categoria.icone}</span>
                        <span style={{ 
                          flex: 1, 
                          fontWeight: '600', 
                          color: categoria.cor 
                        }}>
                          {categoria.nome}
                        </span>
                        <button
                          onClick={() => handleEditarCategoria(categoria)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#3b82f6'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleRemoverCategoria(categoria.id)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#ef4444'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Configuração dos Cartões */}
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0 0 16px 0',
                    color: '#92400e'
                  }}>
                    💳 CONFIGURAÇÃO DOS CARTÕES
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#92400e',
                        marginBottom: '8px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={financeiroConfig.coresPersonalizadas}
                          onChange={(e) => setFinanceiroConfig(prev => ({
                            ...prev,
                            coresPersonalizadas: e.target.checked
                          }))}
                        />
                        🎨 Cores personalizadas
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#92400e',
                        marginBottom: '8px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={financeiroConfig.alertasUso}
                          onChange={(e) => setFinanceiroConfig(prev => ({
                            ...prev,
                            alertasUso: e.target.checked
                          }))}
                        />
                        🔔 Alertas de uso
                      </label>
                    </div>

                    <div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#92400e',
                          marginBottom: '4px'
                        }}>
                          📅 Lembrete vencimento:
                        </label>
                        <select
                          value={financeiroConfig.lembreteVencimento}
                          onChange={(e) => setFinanceiroConfig(prev => ({
                            ...prev,
                            lembreteVencimento: parseInt(e.target.value)
                          }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '2px solid #fcd34d',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value={1}>1 dia antes</option>
                          <option value={3}>3 dias antes</option>
                          <option value={5}>5 dias antes</option>
                          <option value={7}>7 dias antes</option>
                        </select>
                      </div>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#92400e',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={financeiroConfig.sugestoesInteligentes}
                          onChange={(e) => setFinanceiroConfig(prev => ({
                            ...prev,
                            sugestoesInteligentes: e.target.checked
                          }))}
                        />
                        📊 Sugestões inteligentes
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: NOTIFICAÇÕES */}
            {abaAtiva === 'notificacoes' && (
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  margin: '0 0 24px 0',
                  color: '#1a202c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  🔔 CONFIGURAÇÕES DE NOTIFICAÇÕES
                </h2>

                {/* Notificações Push */}
                <div style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #7dd3fc',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0 0 16px 0',
                    color: '#0c4a6e'
                  }}>
                    📱 NOTIFICAÇÕES PUSH
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {[
                      { key: 'receitas', label: '💰 Receitas', desc: 'Novos recebimentos' },
                      { key: 'despesas', label: '💸 Despesas', desc: 'Gastos registrados' },
                      { key: 'faturas', label: '💳 Faturas', desc: 'Vencimentos de cartão' },
                      { key: 'metas', label: '🎯 Metas', desc: 'Progresso e conquistas' },
                      { key: 'conquistas', label: '🏆 Conquistas', desc: 'Badges desbloqueados' }
                    ].map(item => (
                      <div key={item.key} style={{
                        padding: '16px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#0c4a6e',
                              marginBottom: '2px'
                            }}>
                              {item.label}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#64748b'
                            }}>
                              {item.desc}
                            </div>
                          </div>
                          
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={notificacoesConfig[item.key]?.ativo || false}
                              onChange={(e) => setNotificacoesConfig(prev => ({
                                ...prev,
                                [item.key]: {
                                  ...prev[item.key],
                                  ativo: e.target.checked
                                }
                              }))}
                            />
                            <span style={{ fontSize: '14px', color: '#0c4a6e' }}>Ativo</span>
                          </label>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          gap: '16px',
                          fontSize: '14px'
                        }}>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={notificacoesConfig[item.key]?.email || false}
                              onChange={(e) => setNotificacoesConfig(prev => ({
                                ...prev,
                                [item.key]: {
                                  ...prev[item.key],
                                  email: e.target.checked
                                }
                              }))}
                            />
                            📧 Email
                          </label>
                          
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={notificacoesConfig[item.key]?.push || false}
                              onChange={(e) => setNotificacoesConfig(prev => ({
                                ...prev,
                                [item.key]: {
                                  ...prev[item.key],
                                  push: e.target.checked
                                }
                              }))}
                            />
                            📱 Push
                          </label>
                          
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={notificacoesConfig[item.key]?.sms || false}
                              onChange={(e) => setNotificacoesConfig(prev => ({
                                ...prev,
                                [item.key]: {
                                  ...prev[item.key],
                                  sms: e.target.checked
                                }
                              }))}
                            />
                            📞 SMS
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Frequência */}
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0 0 16px 0',
                    color: '#92400e'
                  }}>
                    ⏰ FREQUÊNCIA
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#92400e',
                        marginBottom: '8px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={notificacoesConfig.relatorioSemanal?.ativo || false}
                          onChange={(e) => setNotificacoesConfig(prev => ({
                            ...prev,
                            relatorioSemanal: {
                              ...prev.relatorioSemanal,
                              ativo: e.target.checked
                            }
                          }))}
                        />
                        📊 Relatório semanal: Sextas 18h
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#92400e',
                        marginBottom: '8px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={notificacoesConfig.resumoMensal?.ativo || false}
                          onChange={(e) => setNotificacoesConfig(prev => ({
                            ...prev,
                            resumoMensal: {
                              ...prev.resumoMensal,
                              ativo: e.target.checked
                            }
                          }))}
                        />
                        📈 Resumo mensal: Dia 1º de cada mês
                      </label>
                    </div>

                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#92400e',
                        marginBottom: '8px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={notificacoesConfig.lembreteMetas?.ativo || false}
                          onChange={(e) => setNotificacoesConfig(prev => ({
                            ...prev,
                            lembreteMetas: {
                              ...prev.lembreteMetas,
                              ativo: e.target.checked
                            }
                          }))}
                        />
                        🎯 Lembrete metas: Toda semana
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#92400e',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={notificacoesConfig.alertasUrgentes?.ativo || false}
                          onChange={(e) => setNotificacoesConfig(prev => ({
                            ...prev,
                            alertasUrgentes: {
                              ...prev.alertasUrgentes,
                              ativo: e.target.checked
                            }
                          }))}
                        />
                        ⚠️ Alertas urgentes: Imediato
                      </label>
                    </div>
                  </div>
                </div>

                {/* FinBot */}
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0 0 16px 0',
                    color: '#166534'
                  }}>
                    🤖 FINBOT
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#166534',
                          marginBottom: '4px'
                        }}>
                          Dicas diárias:
                        </label>
                        <select
                          value={notificacoesConfig.dicasDiarias?.frequencia || 'diaria'}
                          onChange={(e) => setNotificacoesConfig(prev => ({
                            ...prev,
                            dicasDiarias: {
                              ...prev.dicasDiarias,
                              frequencia: e.target.value
                            }
                          }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '2px solid #bbf7d0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="diaria">Diária</option>
                          <option value="semanal">Semanal</option>
                          <option value="mensal">Mensal</option>
                        </select>
                      </div>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#166534',
                        marginBottom: '8px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={notificacoesConfig.analises || false}
                          onChange={(e) => setNotificacoesConfig(prev => ({
                            ...prev,
                            analises: e.target.checked
                          }))}
                        />
                        Análises inteligentes
                      </label>
                    </div>

                    <div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#166534',
                          marginBottom: '4px'
                        }}>
                          Personalidade:
                        </label>
                        <select
                          value={notificacoesConfig.personalidade || 'profissional'}
                          onChange={(e) => setNotificacoesConfig(prev => ({
                            ...prev,
                            personalidade: e.target.value
                          }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '2px solid #bbf7d0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="profissional">🤖 Profissional</option>
                          <option value="amigavel">😊 Amigável</option>
                          <option value="motivacional">💪 Motivacional</option>
                        </select>
                      </div>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#166534',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={notificacoesConfig.sugestoesEconomia || false}
                          onChange={(e) => setNotificacoesConfig(prev => ({
                            ...prev,
                            sugestoesEconomia: e.target.checked
                          }))}
                        />
                        Sugestões de economia
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: VISUAL */}
            {abaAtiva === 'visual' && (
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  margin: '0 0 24px 0',
                  color: '#1a202c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  🎨 CONFIGURAÇÕES VISUAIS
                </h2>

                {/* Tema e Cores */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0 0 16px 0',
                    color: '#374151'
                  }}>
                    🌈 TEMA E CORES
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        🌙 Tema:
                      </label>
                      <div style={{
                        display: 'flex',
                        gap: '8px'
                      }}>
                        {[
                          { value: 'claro', label: '☀️ Claro' },
                          { value: 'escuro', label: '🌙 Escuro' },
                          { value: 'auto', label: '🔄 Auto' }
                        ].map(tema => (
                          <button
                            key={tema.value}
                            onClick={() => setVisualConfig(prev => ({
                              ...prev,
                              tema: tema.value
                            }))}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              backgroundColor: visualConfig.tema === tema.value ? '#374151' : 'white',
                              color: visualConfig.tema === tema.value ? 'white' : '#374151',
                              border: '2px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            {tema.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        🎨 Cor primária:
                      </label>
                      <div style={{
                        display: 'flex',
                        gap: '8px'
                      }}>
                        {[
                          '#3b82f6', '#10b981', '#f59e0b', 
                          '#ef4444', '#8b5cf6', '#06b6d4'
                        ].map(cor => (
                          <button
                            key={cor}
                            onClick={() => setVisualConfig(prev => ({
                              ...prev,
                              corPrimaria: cor
                            }))}
                            style={{
                              width: '32px',
                              height: '32px',
                              backgroundColor: cor,
                              border: visualConfig.corPrimaria === cor ? '3px solid #1f2937' : '2px solid #e2e8f0',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interface */}
                <div style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #7dd3fc',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0 0 16px 0',
                    color: '#0c4a6e'
                  }}>
                    🖥️ INTERFACE
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0c4a6e',
                        marginBottom: '8px'
                      }}>
                        📝 Tamanho da fonte:
                      </label>
                      <select
                        value={visualConfig.tamanhoFonte}
                        onChange={(e) => setVisualConfig(prev => ({
                          ...prev,
                          tamanhoFonte: e.target.value
                        }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '2px solid #7dd3fc',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="pequeno">Pequeno</option>
                        <option value="medio">Médio</option>
                        <option value="grande">Grande</option>
                      </select>
                    </div>

                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#0c4a6e',
                        marginBottom: '8px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={visualConfig.modoCompacto}
                          onChange={(e) => setVisualConfig(prev => ({
                            ...prev,
                            modoCompacto: e.target.checked
                          }))}
                        />
                        📱 Modo compacto
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#0c4a6e',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={visualConfig.sidebarExpandida}
                          onChange={(e) => setVisualConfig(prev => ({
                            ...prev,
                            sidebarExpandida: e.target.checked
                          }))}
                        />
                        📋 Sidebar sempre expandida
                      </label>
                    </div>
                  </div>
                </div>

                {/* Animações */}
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0 0 16px 0',
                    color: '#92400e'
                  }}>
                    ✨ ANIMAÇÕES E EFEITOS
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#92400e',
                        marginBottom: '8px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={visualConfig.animacoes}
                          onChange={(e) => setVisualConfig(prev => ({
                            ...prev,
                            animacoes: e.target.checked
                          }))}
                        />
                        🎭 Animações da interface
                      </label>
                    </div>

                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#92400e',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={visualConfig.graficosAnimados}
                          onChange={(e) => setVisualConfig(prev => ({
                            ...prev,
                            graficosAnimados: e.target.checked
                          }))}
                        />
                        📊 Gráficos animados
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: SEGURANÇA */}
            {abaAtiva === 'seguranca' && (
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  margin: '0 0 24px 0',
                  color: '#1a202c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  🔐 CONFIGURAÇÕES DE SEGURANÇA
                </h2>

                {/* Autenticação */}
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0 0 16px 0',
                    color: '#dc2626'
                  }}>
                    🔑 AUTENTICAÇÃO
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#dc2626',
                        marginBottom: '12px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={segurancaConfig.autenticacaoDupla}
                          onChange={(e) => setSegurancaConfig(prev => ({
                            ...prev,
                            autenticacaoDupla: e.target.checked
                          }))}
                        />
                        🔐 Autenticação dupla (2FA)
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#dc2626',
                        marginBottom: '12px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={segurancaConfig.biometria}
                          onChange={(e) => setSegurancaConfig(prev => ({
                            ...prev,
                            biometria: e.target.checked
                          }))}
                        />
                        👆 Biometria (Face ID/Touch ID)
                      </label>
                    </div>

                    <div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#dc2626',
                          marginBottom: '4px'
                        }}>
                          ⏱️ Sessão automática:
                        </label>
                        <select
                          value={segurancaConfig.sessaoAutomatica}
                          onChange={(e) => setSegurancaConfig(prev => ({
                            ...prev,
                            sessaoAutomatica: parseInt(e.target.value)
                          }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '2px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value={15}>15 minutos</option>
                          <option value={30}>30 minutos</option>
                          <option value={60}>1 hora</option>
                          <option value={120}>2 horas</option>
                        </select>
                      </div>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#dc2626',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={segurancaConfig.logoutAutomatico}
                          onChange={(e) => setSegurancaConfig(prev => ({
                            ...prev,
                            logoutAutomatico: e.target.checked
                          }))}
                        />
                        🚪 Logout automático
                      </label>
                    </div>
                  </div>
                </div>

                {/* Monitoramento */}
                <div style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #7dd3fc',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0 0 16px 0',
                    color: '#0c4a6e'
                  }}>
                    👁️ MONITORAMENTO
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#0c4a6e',
                        marginBottom: '8px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={seguranca