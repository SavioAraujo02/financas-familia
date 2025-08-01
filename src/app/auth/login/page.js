'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function LoginFamiliarPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [biometryAvailable, setBiometryAvailable] = useState(false)

  // Verificar se biometria está disponível
  useEffect(() => {
    // Verificar se estamos em um dispositivo móvel com biometria
    const checkBiometry = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)
      const isMobile = isIOS || isAndroid
      
      // Verificar se tem suporte a WebAuthn (biometria web)
      const hasWebAuthn = window.PublicKeyCredential !== undefined
      
      setBiometryAvailable(isMobile && hasWebAuthn)
    }
    
    checkBiometry()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
  
    console.log('🔐 Login familiar - Dados:', { email, password, rememberMe })
  
    try {
      // Importar o auth do Supabase
      const { auth } = await import('@/lib/supabase')
      
      // Fazer login real
      const { data, error } = await auth.signIn(email, password)
  
      if (error) {
        console.error('❌ Erro no login:', error)
        setMessage(`❌ ${error.message}`)
        return
      }
  
      if (data.user) {
        console.log('✅ Login familiar realizado!', data.user)
        setMessage('🎉 Bem-vindo a sua gestão financeira familiar!')
        
        // Salvar "lembrar-me" se marcado
        if (rememberMe) {
          localStorage.setItem('remember_login', 'true')
        }
        
        // Redirecionar para dashboard
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error)
      setMessage('❌ Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    setMessage('🔐 Iniciando autenticação biométrica...')
    
    try {
      // Simular biometria por enquanto (em produção usar WebAuthn)
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "FinançasFamília" },
          user: {
            id: new Uint8Array(16),
            name: "usuario@familia.com",
            displayName: "Usuário Família"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      })
      
      if (credential) {
        setMessage('✅ Biometria confirmada! Entrando...')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      }
    } catch (error) {
      console.error('Erro na biometria:', error)
      setMessage('❌ Biometria não disponível. Use email e senha.')
    }
  }

  const handleForgotPassword = () => {
    setMessage('📧 Em breve: sistema de recuperação de senha!')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        padding: '40px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        
        {/* Header com Logo */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#2d3748',
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            💰 FinançasFamília
          </h1>
          
          {/* Logo Personalizado */}
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            margin: '16px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
          }}>
            👨‍👩‍👧‍👦
          </div>
          
          <p style={{ 
            color: '#718096', 
            fontSize: '16px',
            margin: 0
          }}>
            Gerencie as finanças da sua família com inteligência
          </p>
        </div>

        {/* Mensagem de Status */}
        {message && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '20px',
            borderRadius: '12px',
            backgroundColor: message.includes('✅') || message.includes('🎉') ? '#d4edda' : 
                            message.includes('🔐') ? '#e2e3ff' : '#f8d7da',
            color: message.includes('✅') || message.includes('🎉') ? '#155724' : 
                   message.includes('🔐') ? '#3c4fe0' : '#721c24',
            fontSize: '14px',
            fontWeight: '500',
            border: `1px solid ${message.includes('✅') || message.includes('🎉') ? '#c3e6cb' : 
                                 message.includes('🔐') ? '#c5d0ff' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          {/* Campo Email */}
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#4a5568',
              marginBottom: '8px'
            }}>
              📧 Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                backgroundColor: '#f8fafc'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea'
                e.target.style.backgroundColor = 'white'
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.backgroundColor = '#f8fafc'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Campo Senha */}
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#4a5568',
              marginBottom: '8px'
            }}>
              🔒 Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                backgroundColor: '#f8fafc'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea'
                e.target.style.backgroundColor = 'white'
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.backgroundColor = '#f8fafc'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Opções */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: '#4a5568'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#667eea'
                }}
              />
              ✅ Lembrar-me
            </label>
            
            <button
              type="button"
              onClick={handleForgotPassword}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline'
              }}
            >
              ❓ Esqueci a senha
            </button>
          </div>

          {/* Botões Principais */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <button 
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '16px 20px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)'
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
                }
              }}
            >
              {loading ? '⏳ Entrando...' : '🚀 ENTRAR'}
            </button>
            
            <Link 
              href="/auth/register"
              style={{
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                padding: '16px 20px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 25px rgba(72, 187, 120, 0.4)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(72, 187, 120, 0.3)'
              }}
            >
              👥 CADASTRAR
            </Link>
          </div>
        </form>

        {/* Divisor */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          margin: '24px 0',
          fontSize: '14px',
          color: '#a0aec0'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          <span>ou</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
        </div>

        {/* Opções de Biometria */}
        {biometryAvailable && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <button
              onClick={handleBiometricLogin}
              style={{
                backgroundColor: '#f7fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#4a5568',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#edf2f7'
                e.target.style.borderColor = '#cbd5e0'
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#f7fafc'
                e.target.style.borderColor = '#e2e8f0'
              }}
            >
              📱 Face ID
            </button>
            
            <button
              onClick={handleBiometricLogin}
              style={{
                backgroundColor: '#f7fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#4a5568',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#edf2f7'
                e.target.style.borderColor = '#cbd5e0'
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#f7fafc'
                e.target.style.borderColor = '#e2e8f0'
              }}
            >
              👆 Touch ID
            </button>
            
            <button
              onClick={handleBiometricLogin}
              style={{
                backgroundColor: '#f7fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#4a5568',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#edf2f7'
                e.target.style.borderColor = '#cbd5e0'
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#f7fafc'
                e.target.style.borderColor = '#e2e8f0'
              }}
            >
              🔑 Biometria
            </button>
          </div>
        )}

        {/* Mensagem para Novos Usuários */}
        <div style={{
          backgroundColor: '#e6fffa',
          border: '1px solid #b2f5ea',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#234e52',
            fontWeight: '500'
          }}>
            💡 Primeira vez? Crie sua conta familiar!
          </p>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '12px',
            color: '#319795'
          }}>
            Gerencie as finanças de vocês dois em tempo real
          </p>
        </div>

        {/* Link para Home */}
        <div style={{ textAlign: 'center' }}>
          <Link 
            href="/"
            style={{ 
              color: '#667eea', 
              textDecoration: 'none', 
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ← Voltar para início
          </Link>
        </div>
      </div>
    </div>
  )
}