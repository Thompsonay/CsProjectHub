import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabaseClient'
import ProjectForm, { emptyProjectValues, toProjectPayload } from '../components/ProjectForm.jsx'

export default function Submit() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(form) {
    if (!form.title.trim()) { setError('Title is required.'); return }

    setSubmitting(true)
    setError(null)

    const { data, error } = await supabase
      .from('projects')
      .insert({ author_id: user.id, ...toProjectPayload(form) })
      .select('id')
      .single()

    setSubmitting(false)

    if (error) { setError(error.message); return }
    navigate(`/projects/${data.id}`)
  }

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Checking session…</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
        <span className="material-symbols-outlined text-outline mb-4" style={{ fontSize: '48px' }}>lock</span>
        <h1 className="text-2xl font-semibold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>Sign in required</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          You need to be logged in to submit a project.{' '}
          <Link to="/login" state={{ from: location.pathname }} className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-12 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
          Submit a Project
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Your project goes live immediately after submission.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
        <ProjectForm
          initialValues={emptyProjectValues}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel="Submit Project"
        />
      </div>
    </div>
  )
}
