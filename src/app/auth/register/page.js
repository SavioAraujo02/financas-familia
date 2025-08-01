'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
  
    console.log('Tentando registrar usuário:', formData)
  
    try {
      // Validações
      if (!formData.name || !formData.email || !formData.password) {
        setMessage('❌ Por favor, preencha todos os campos')
        return
      }
  
      if (formData.password !== formData.confirmPassword) {
        setMessage('❌ As senhas não coincidem')
        return
      }
  
      if (formData.password.length < 6) {
        setMessage('❌ A senha deve ter pelo menos 6 caracteres')
        return
      }
  
      // Importar o auth do Supabase
      const { auth, profiles } = await import('@/lib/supabase')
      
      // Criar conta no Supabase
      const { data, error } = await auth.signUp(formData.email, formData.password, {
        name: formData.name
      })
  
      if (error) {
        console.error('Erro no registro:', error)
        setMessage(`❌ Erro: ${error.message}`)
        return
      }
  
      if (data.user) {
        console.log('Usuário criado:', data.user)
        
        // Criar perfil do usuário
        const profileResult = await profiles.create({
          id: data.user.id,
          name: formData.name,
          email: formData.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
  
        if (profileResult.error) {
          console.error('Erro ao criar perfil:', profileResult.error)
        }
  
        setMessage('✅ Conta criada com sucesso!')
        
        // Redirecionar para login
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 2000)
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
      setMessage('❌ Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ 
              fontSize: '30px', 
              fontWeight: 'bold', 
              color: '#111827', 
              marginBottom: '8px' 
            }}>
              💰 Finanças Família
            </h1>
          </Link>
          <p style={{ color: '#6b7280' }}>
            Crie sua conta e comece a controlar suas finanças
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '32px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: '24px',
            color: '#1f2937'
          }}>
            Criar Conta
          </h2>
          
          {message && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '8px',
              backgroundColor: message.includes('✅') ? '#dcfce7' : '#fee2e2',
              color: message.includes('✅') ? '#166534' : '#dc2626',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '8px'
              }}>
                Nome Completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '8px'
              }}>
                Senha
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '8px'
              }}>
                Confirmar Senha
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Digite a senha novamente"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
            <span style={{ color: '#6b7280' }}>Já tem uma conta? </span>
            <Link 
              href="/auth/login" 
              style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}
            >
              Faça login aqui
            </Link>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link 
            href="/"
            style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px' }}
          >
            ← Voltar para início
          </Link>
        </div>
      </div>
    </div>
  )
}