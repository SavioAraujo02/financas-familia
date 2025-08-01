export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '672px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '60px',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '24px'
        }}>
          💰 Finanças Família
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#6b7280',
          marginBottom: '32px'
        }}>
          O sistema mais inteligente para controlar as finanças da sua família.
          Previsões precisas, alertas inteligentes e gamificação para motivar!
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          justifyContent: 'center',
          marginBottom: '48px'
        }}>
          <a 
            href="/auth/login"
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '500',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'block'
            }}
          >
            Fazer Login
          </a>
          
          <a 
            href="/auth/register"
            style={{
              border: '2px solid #2563eb',
              color: '#2563eb',
              backgroundColor: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '500',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'block'
            }}
          >
            Criar Conta Grátis
          </a>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          textAlign: 'left'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔮</div>
            <h3 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '12px', color: '#111827' }}>
              Previsão Inteligente
            </h3>
            <p style={{ color: '#6b7280' }}>
              Saiba exatamente como estarão suas faturas nos próximos 12 meses.
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>👨‍👩‍👧‍👦</div>
            <h3 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '12px', color: '#111827' }}>
              Controle Familiar
            </h3>
            <p style={{ color: '#6b7280' }}>
              Gerencie as finanças de toda família em tempo real.
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎮</div>
            <h3 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '12px', color: '#111827' }}>
              Gamificação
            </h3>
            <p style={{ color: '#6b7280' }}>
              Conquistas, desafios e recompensas para economizar.
            </p>
          </div>
        </div>

        <div style={{
          marginTop: '64px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '12px',
          padding: '32px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '16px'
          }}>
            🚀 Teste de Navegação
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Clique nos botões azuis acima para testar a navegação!
          </p>
          
          {/* Links diretos para teste */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <a 
              href="/auth/login" 
              style={{ 
                color: '#2563eb', 
                textDecoration: 'underline',
                fontSize: '16px'
              }}
            >
              → Login direto
            </a>
            <a 
              href="/auth/register" 
              style={{ 
                color: '#2563eb', 
                textDecoration: 'underline',
                fontSize: '16px'
              }}
            >
              → Registro direto
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}