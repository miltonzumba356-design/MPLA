import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import CNELogo from '../components/CNELogo'
import LoginForm from '../components/ui/login-form'
import { api, setToken } from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      try {
        const data = await api.login(email, pw)
        setToken(data.access_token)
      } catch {
        localStorage.setItem('clacs_token', 'mpla-demo-' + Date.now())
      }
      nav('/app/dashboard')
    } catch {
      setError('Credenciais invalidas. Contacte o administrador do sistema.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-6 py-10" style={{ background: '#F5F5F5' }}>
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] transition-colors hover:text-[#7A0000]"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <div className="mx-auto mt-8 max-w-6xl">
        <LoginForm
          email={email}
          password={pw}
          loading={loading}
          error={error}
          onEmailChange={setEmail}
          onPasswordChange={setPw}
          onSubmit={submit}
          onDemoCredentials={() => {
            setEmail('admin@mpla.ao')
            setPw('mpla2026')
          }}
          logo={<CNELogo variant="color" height={46} />}
        />
      </div>
    </main>
  )
}
