import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const inputCls = 'w-full pl-11 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm text-on-surface placeholder:text-outline'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from ?? '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    })

    setSubmitting(false)
    if (error) { setError(error.message); return }
    navigate(redirectTo, { replace: true })
  }

  async function handleGoogleLogin() {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-12 relative overflow-hidden bg-background">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-110 z-10">
        {/* Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden p-8">
          {/* Tabs */}
          <div className="flex border-b border-outline-variant mb-8 relative">
            <button
              className="flex-1 py-4 text-sm font-bold text-primary border-b-2 border-primary transition-all"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              Login
            </button>
            <Link
              to="/signup"
              className="flex-1 py-4 text-sm text-on-surface-variant hover:text-primary text-center transition-all"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              Signup
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-on-surface mb-1" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
              Welcome Back
            </h2>
            <p className="text-sm text-on-surface-variant">Resume your contribution to the African developer ecosystem.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-on-surface ml-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '20px' }}>alternate_email</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@institution.edu"
                  required
                  className={inputCls}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-medium text-on-surface" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  Password
                </label>
                <a href="#" className="text-xs text-primary hover:underline" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '20px' }}>lock</span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={inputCls}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-error-container px-3 py-2.5 text-sm text-on-error-container">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-primary-container text-on-primary text-sm font-semibold rounded-lg hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {submitting ? 'Logging in…' : 'Login to Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface-container-lowest px-4 text-xs text-on-surface-variant uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Or continue with
              </span>
            </div>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-4 border border-outline-variant rounded-lg flex items-center justify-center gap-3 hover:bg-surface-container-low transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm text-on-surface font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Google Account</span>
          </button>

          <p className="mt-8 text-center text-xs text-on-surface-variant">
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-3 text-outline">
          <div className="h-px w-12 bg-outline-variant rounded-full" />
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified_user</span>
          <span className="text-xs text-on-surface-variant italic" style={{ fontFamily: 'JetBrains Mono, monospace' }}>SSL Secure Encryption</span>
          <div className="h-px w-12 bg-outline-variant rounded-full" />
        </div>
      </div>
    </div>
  )
}
