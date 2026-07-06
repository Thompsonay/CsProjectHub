import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const inputCls = 'w-full px-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm text-on-surface placeholder:text-outline'
const inputWithIconCls = 'w-full pl-11 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm text-on-surface placeholder:text-outline'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
    })

    setSubmitting(false)
    if (error) { setError(error.message); return }
    if (!data.session) { setNeedsConfirmation(true); return }
    navigate('/')
  }

  if (needsConfirmation) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-110 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>mark_email_read</span>
          </div>
          <h1 className="text-2xl font-semibold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>Check your email</h1>
          <p className="mt-3 text-on-surface-variant text-sm leading-relaxed">
            We sent a confirmation link to{' '}
            <strong className="text-on-surface">{form.email}</strong>.{' '}
            Click it to finish creating your account.
          </p>
          <Link to="/login" className="mt-6 inline-block text-sm text-primary font-medium hover:underline" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-12 relative overflow-hidden bg-background">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-110 z-10">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden p-8">
          {/* Tabs */}
          <div className="flex border-b border-outline-variant mb-8">
            <Link
              to="/login"
              className="flex-1 py-4 text-sm text-on-surface-variant hover:text-primary text-center transition-all"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              Login
            </Link>
            <button
              className="flex-1 py-4 text-sm font-bold text-primary border-b-2 border-primary transition-all"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              Signup
            </button>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-on-surface mb-1" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
              Join the Hub
            </h2>
            <p className="text-sm text-on-surface-variant">The central node for student innovators across Africa.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-on-surface ml-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Institution Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '20px' }}>school</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="student@institution.edu"
                  required
                  className={inputWithIconCls}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-on-surface ml-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '20px' }}>shield</span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  className={inputWithIconCls}
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
              className="w-full py-4 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-on-surface-variant">
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>

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
