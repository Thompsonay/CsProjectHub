import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [originalProject, setOriginalProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setOriginalProject(null)

      const { data, error } = await supabase
        .from('projects')
        .select('*, profiles(username)')
        .eq('id', id)
        .single()

      if (cancelled) return

      if (error) { setError(error.message); setLoading(false); return }

      setProject(data)

      if (data.forked_from) {
        const { data: original } = await supabase
          .from('projects')
          .select('id, title')
          .eq('id', data.forked_from)
          .single()
        if (!cancelled) setOriginalProject(original)
      }

      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
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

  if (error || !project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
        <span className="material-symbols-outlined text-outline mb-4" style={{ fontSize: '56px' }}>sentiment_dissatisfied</span>
        <h1 className="text-2xl font-semibold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>Project not found</h1>
        <p className="mt-2 text-sm text-on-surface-variant max-w-xs">
          It may still be pending approval, or it no longer exists.
        </p>
        <Link to="/" className="mt-5 text-sm text-primary font-medium hover:underline" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ← Back to Browse
        </Link>
      </div>
    )
  }

  const initials = project.institution
    ? project.institution.replace(/[^A-Z]/g, '').slice(0, 2) || project.institution[0].toUpperCase()
    : '?'

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      {/* Fork notice */}
      {originalProject && (
        <div className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant bg-surface-container border border-outline-variant rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>fork_right</span>
          Forked from{' '}
          <Link to={`/projects/${originalProject.id}`} className="text-primary hover:underline font-medium">
            {originalProject.title}
          </Link>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Screenshot */}
          {project.screenshot_url && (
            <div className="rounded-xl overflow-hidden border border-outline-variant mb-8 shadow-sm">
              <img src={project.screenshot_url} alt="" className="w-full" />
            </div>
          )}

          {/* Title */}
          <h1
            className="text-3xl font-bold text-on-surface leading-tight"
            style={{ fontFamily: 'Geist, system-ui, sans-serif', letterSpacing: '-0.01em' }}
          >
            {project.title}
          </h1>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-on-surface-variant">
            {project.institution && (
              <Link to={`/institutions/${encodeURIComponent(project.institution)}`} className="hover:text-primary transition-colors">
                {project.institution}
              </Link>
            )}
            {project.year && <><span className="text-outline-variant">·</span><span>{project.year}</span></>}
            {project.profiles?.username && (
              <>
                <span className="text-outline-variant">·</span>
                <Link to={`/user/${project.profiles.username}`} className="hover:text-primary transition-colors">
                  by {project.profiles.username}
                </Link>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {project.language && (
              <span className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {project.language}
              </span>
            )}
            {project.tech_stack?.map((tech) => (
              <span key={tech} className="bg-surface-container text-on-surface-variant text-xs px-3 py-1 rounded-full" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {tech}
              </span>
            ))}
            {project.topic && (
              <span className="bg-secondary/10 text-secondary text-xs font-medium px-3 py-1 rounded-full" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {project.topic}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-on-surface border border-outline-variant rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View Repository
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-on-primary bg-primary rounded-xl hover:shadow-xl transition-all duration-300 active:scale-95"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
                Live Demo
              </a>
            )}
          </div>

          {/* Description */}
          {project.description && (
            <div className="mt-8 pt-8 border-t border-outline-variant">
              <h2 className="text-lg font-semibold text-on-surface mb-3" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>About this project</h2>
              <p className="text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">{project.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar info card */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-lg">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-on-surface text-sm">{project.institution || 'Unknown institution'}</p>
                {project.year && <p className="text-xs text-outline mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Class of {project.year}</p>}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {project.profiles?.username && (
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>person</span>
                  <Link to={`/user/${project.profiles.username}`} className="hover:text-primary transition-colors">
                    {project.profiles.username}
                  </Link>
                </div>
              )}
              {project.language && (
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>code</span>
                  <span>{project.language}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-outline-variant flex items-center justify-between text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>thumb_up</span>
                <span className="text-sm font-medium">{project.upvotes ?? 0} upvotes</span>
              </div>
              <button className="flex items-center gap-1.5 text-primary hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bookmark_add</span>
                <span className="text-sm font-medium">Save</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
