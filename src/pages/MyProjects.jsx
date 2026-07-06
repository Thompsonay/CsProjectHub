import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabaseClient'

const STATUS_STYLES = {
  pending: 'bg-tertiary/10 text-tertiary border border-tertiary/20',
  approved: 'bg-primary/10 text-primary border border-primary/20',
  rejected: 'bg-error/10 text-error border border-error/20',
}

export default function MyProjects() {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const [projects, setProjects] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, status, language, year, created_at')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

      if (cancelled) return
      if (error) setError(error.message)
      else setProjects(data)
    }

    load()
    return () => { cancelled = true }
  }, [user])

  async function handleDelete(id) {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) { setError(error.message); return }
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  if (authLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
        <h1 className="text-2xl font-semibold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>My Projects</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          You need to be logged in.{' '}
          <Link to="/login" state={{ from: location.pathname }} className="text-primary font-medium hover:underline">Log in</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>My Projects</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage your submitted projects</p>
        </div>
        <Link
          to="/submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-on-primary bg-primary rounded-xl hover:shadow-lg transition-all active:scale-95"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          New Project
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-error-container border border-error/20 px-4 py-3 text-on-error-container text-sm">{error}</div>
      )}

      {projects === null && !error && (
        <p className="text-sm text-on-surface-variant">Loading…</p>
      )}

      {projects?.length === 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl py-16 text-center">
          <span className="material-symbols-outlined text-outline mb-3 block" style={{ fontSize: '48px' }}>description</span>
          <p className="text-on-surface font-medium">No projects yet</p>
          <p className="text-sm text-on-surface-variant mt-1">Submit your first project to get started</p>
          <Link to="/submit" className="mt-4 inline-block text-sm text-primary font-medium hover:underline" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Submit a project →
          </Link>
        </div>
      )}

      {projects?.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <ul className="divide-y divide-outline-variant/50">
            {projects.map((project) => (
              <li key={project.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors">
                <div className="min-w-0">
                  <Link to={`/projects/${project.id}`} className="font-medium text-on-surface hover:text-primary transition-colors text-sm">
                    {project.title}
                  </Link>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[project.status]}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {project.status}
                    </span>
                    {project.language && <span className="text-xs text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{project.language}</span>}
                    {project.year && <span className="text-xs text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{project.year}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm ml-4 shrink-0">
                  <Link to={`/projects/${project.id}/edit`} className="text-primary font-medium hover:underline" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Edit</Link>
                  <button onClick={() => handleDelete(project.id)} className="text-error font-medium hover:opacity-70 transition-opacity" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
