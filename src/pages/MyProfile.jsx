import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabaseClient'
import { Field, TextArea } from '../components/FormField.jsx'

export default function MyProfile() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const location = useLocation()
  const [form, setForm] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username ?? '',
        full_name: profile.full_name ?? '',
        institution: profile.institution ?? '',
        bio: profile.bio ?? '',
        avatar_url: profile.avatar_url ?? '',
      })
    }
  }, [profile])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.username.trim()) { setError('Username is required.'); return }
    setSubmitting(true); setError(null); setSaved(false)

    const { error } = await supabase
      .from('profiles')
      .update({
        username: form.username.trim(),
        full_name: form.full_name.trim() || null,
        institution: form.institution.trim() || null,
        bio: form.bio.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
      })
      .eq('id', user.id)

    setSubmitting(false)
    if (error) { setError(error.message); return }
    setSaved(true)
    refreshProfile()
  }

  if (loading || (user && !form)) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
        <h1 className="text-2xl font-semibold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>My Profile</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          You need to be logged in.{' '}
          <Link to="/login" state={{ from: location.pathname }} className="text-primary font-medium hover:underline">Log in</Link>
        </p>
      </div>
    )
  }

  const initials = (profile?.username ?? user.email ?? '?')[0].toUpperCase()

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-12 py-10">
      {/* Avatar header */}
      <div className="flex items-center gap-5 mb-8">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary/10" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-primary-container flex items-center justify-center text-3xl font-bold text-on-primary shrink-0">
            {initials}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
            {profile?.full_name || profile?.username || 'My Profile'}
          </h1>
          {profile?.username && (
            <Link to={`/user/${profile.username}`} className="text-sm text-primary hover:underline font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              View public profile →
            </Link>
          )}
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Username *" name="username" value={form.username} onChange={handleChange} required />
          <Field label="Full name" name="full_name" value={form.full_name} onChange={handleChange} />
          <Field label="Institution" name="institution" value={form.institution} onChange={handleChange} placeholder="e.g. University of Lagos" />
          <TextArea label="Bio" name="bio" value={form.bio} onChange={handleChange} />
          <Field label="Avatar URL" name="avatar_url" type="url" value={form.avatar_url} onChange={handleChange} placeholder="https://…" />

          {error && (
            <div className="rounded-lg bg-error-container px-3 py-2.5 text-sm text-on-error-container">{error}</div>
          )}
          {saved && (
            <div className="rounded-lg bg-primary/10 px-3 py-2.5 text-sm text-primary font-medium">Profile saved.</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 text-sm font-semibold text-on-primary bg-primary rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
