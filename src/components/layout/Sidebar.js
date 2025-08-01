'use client'
import { useRouter, usePathname } from 'next/navigation'

export default function Sidebar({ sidebarOpen, setSidebarOpen, currentPage }) {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    { icon: '💰', label: 'Receitas', path: '/receitas' },
    { icon: '💸', label: 'Despesas', path: '/despesas' },
    { icon: '👁️', label: 'Gerenciar', path: '/despesas/gerenciar' },
    { icon: '💳', label: 'Cartões', path: '/cartoes' },
    { icon: '🔮', label: 'Previsão', path: '/previsao' },
    { icon: '🎯', label: 'Metas', path: '/metas' },
    { icon: '📊', label: 'Relatórios', path: '/relatorios' },
    { icon: '📅', label: 'Calendário', path: '/calendario' },
    { icon: '👥', label: 'Assinaturas', path: '/assinaturas' },
    { icon: '🏆', label: 'Conquistas', path: '/conquistas' },
    { icon: '🎮', label: 'Desafios', path: '/desafios' },
    { icon: '⚙️', label: 'Config', path: '/config' },
    { icon: '🎨', label: 'Tema', path: '/tema' }
  ]

  const handleNavigation = (path) => {
    router.push(path)
  }

  const isActive = (path) => {
    return pathname === path || (path === '/despesas/gerenciar' && pathname === '/despesas/visualizar')
  }

  return (
    <aside style={{
      width: sidebarOpen ? '300px' : '80px',
      backgroundColor: '#1a202c',
      transition: 'width 0.3s ease',
      position: 'fixed',
      height: '100vh',
      zIndex: 50,
      borderRight: '1px solid #2d3748',
      overflowY: 'auto'
    }}>
      <div style={{ padding: '24px' }}>
        {/* Logo */}
        <div style={{ marginBottom: '32px', textAlign: sidebarOpen ? 'left' : 'center' }}>
          <h1 style={{ 
            color: 'white', 
            fontSize: sidebarOpen ? '20px' : '24px', 
            fontWeight: 'bold',
            margin: 0,
            background: `linear-gradient(135deg, ${getGradientByPage(currentPage)})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {sidebarOpen ? `${getEmojiByPage(currentPage)} FinançasFamília` : getEmojiByPage(currentPage)}
          </h1>
        </div>

        {/* Menu Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: isActive(item.path) ? getActiveColorByPage(currentPage) : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (!isActive(item.path)) e.target.style.backgroundColor = '#2d3748'
              }}
              onMouseOut={(e) => {
                if (!isActive(item.path)) e.target.style.backgroundColor = 'transparent'
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

                {/* ✅ ADICIONAR ESTA SEÇÃO COMPLETA ANTES DO LOGOUT: */}
                {/* Seção de Conquistas */}
                {sidebarOpen && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#8b5cf6',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🏆 CONQUISTAS
            </h3>
            
            {/* Progresso do Nível - DINÂMICO */}
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#a78bfa' }}>
                  Nível {typeof window !== 'undefined' && localStorage.getItem('userLevel') || '7'} POUPADOR
                </span>
                <span style={{ fontSize: '12px', color: '#8b5cf6' }}>
                  {typeof window !== 'undefined' && localStorage.getItem('levelProgress') || '75'}%
                </span>
              </div>
              
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                height: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: '#8b5cf6',
                  height: '100%',
                  width: `${typeof window !== 'undefined' && localStorage.getItem('levelProgress') || '75'}%`,
                  transition: 'width 0.5s ease',
                  animation: 'progressGlow 2s ease-in-out infinite alternate'
                }} />
              </div>
              
              <div style={{
                fontSize: '10px',
                color: '#a78bfa',
                marginTop: '4px',
                textAlign: 'center'
              }}>
                Próximo: INVESTIDOR
              </div>
            </div>
            
            {/* Badges de Conquistas - DINÂMICO */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}>
              {[
                { id: 'saude', icone: '🏆', titulo: 'SAÚDE EXCELENTE', cor: '#10b981', desbloqueada: true },
                { id: 'ativo', icone: '🔥', titulo: 'SUPER ATIVO', cor: '#f59e0b', desbloqueada: true },
                { id: 'organizador', icone: '📊', titulo: 'ORGANIZADOR', cor: '#3b82f6', desbloqueada: true },
                { id: 'bloqueado', icone: '🔒', titulo: 'BLOQUEADO', cor: '#64748b', desbloqueada: false }
              ].map((badge, index) => (
                <div key={index} style={{
                  backgroundColor: badge.desbloqueada ? `rgba(${badge.cor === '#10b981' ? '16, 185, 129' : 
                                                                badge.cor === '#f59e0b' ? '245, 158, 11' : 
                                                                badge.cor === '#3b82f6' ? '59, 130, 246' : '100, 116, 139'}, 0.2)` : 
                                                        'rgba(100, 116, 139, 0.2)',
                  borderRadius: '8px',
                  padding: '8px',
                  textAlign: 'center',
                  border: `1px solid ${badge.desbloqueada ? badge.cor + '50' : 'rgba(100, 116, 139, 0.3)'}`,
                  opacity: badge.desbloqueada ? 1 : 0.5,
                  transform: badge.desbloqueada ? 'scale(1)' : 'scale(0.95)',
                  transition: 'all 0.3s ease',
                  animation: badge.desbloqueada ? 'badgePulse 3s ease-in-out infinite' : 'none'
                }}>
                  <div style={{ 
                    fontSize: '16px', 
                    marginBottom: '2px',
                    filter: badge.desbloqueada ? 'none' : 'grayscale(100%)'
                  }}>
                    {badge.icone}
                  </div>
                  <div style={{ 
                    fontSize: '9px', 
                    fontWeight: '600', 
                    color: badge.desbloqueada ? badge.cor : '#64748b'
                  }}>
                    {badge.titulo}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Botão Ver Todas - ANIMADO */}
            <button 
              onClick={() => handleNavigation('/conquistas')}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '8px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#7c3aed'
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)'
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#8b5cf6'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <span style={{ position: 'relative', zIndex: 1 }}>
                Ver Todas (3/12) ⭐
              </span>
            </button>
          </div>
        )}

        {/* Logout */}
        {sidebarOpen && (
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #2d3748' }}>
            <button
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              🚪 Sair
            </button>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes progressGlow {
          0% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
          100% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.8); }
        }
        
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
      `}</style>
    </aside>
  )
}

// Funções auxiliares para cores por página
function getGradientByPage(page) {
  const gradients = {
    dashboard: '#667eea 0%, #764ba2 100%',
    receitas: '#10b981 0%, #059669 100%',
    despesas: '#ef4444 0%, #dc2626 100%',
    gerenciar: '#8b5cf6 0%, #7c3aed 100%',
    cartoes: '#3b82f6 0%, #1d4ed8 100%',
    previsao: '#8b5cf6 0%, #7c3aed 100%',
    default: '#3b82f6 0%, #2563eb 100%'
  }
  return gradients[page] || gradients.default
}

function getEmojiByPage(page) {
  const emojis = {
    dashboard: '🏠',
    receitas: '💰',
    despesas: '💸',
    gerenciar: '👁️',
    cartoes: '💳',
    previsao: '🔮',
    default: '💰'
  }
  return emojis[page] || emojis.default
}

function getActiveColorByPage(page) {
  const colors = {
    dashboard: '#667eea',
    receitas: '#10b981',
    despesas: '#ef4444',
    gerenciar: '#8b5cf6',
    cartoes: '#3b82f6',
    previsao: '#8b5cf6',
    default: '#3b82f6'
  }
  return colors[page] || colors.default
}