import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabaseClient'

export default function Bookmarks() {
  const { user, loading: authLoading } = useAuth()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    let cancelled = false

    async function load() {
      // Bookmarks table join — falls back gracefully if table doesn't exist yet
      const { data } = await supabase
        .from('bookmarks')
        .select('project_id, projects(id, title, description, language, tech_stack, screenshot_url, institution, year)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!cancelled) {
        setBookmarks(data?.map((b) => b.projects).filter(Boolean) ?? [])
        setLoading(false)
      }
    }

    load().catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [user])

  const handleRemove = (projectId) => {
    setBookmarks((prev) => prev.filter((p) => p.id !== projectId))
    if (user) supabase.from('bookmarks').delete().match({ user_id: user.id, project_id: projectId })
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

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>Your Saved Projects</h1>
        <p className="text-sm text-on-surface-variant mt-1">Review and manage the projects you've bookmarked.</p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {!loading && bookmarks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-outline mb-4" style={{ fontSize: '72px' }}>bookmark</span>
          <h2 className="text-xl font-semibold text-on-surface mb-2" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>No saved projects yet</h2>
          <p className="text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
            Explore high-quality computer science projects from across the continent. Start bookmarking to build your reference library.
          </p>
          <Link
            to="/"
            className="bg-primary text-on-primary px-8 py-4 rounded-lg text-sm font-medium transition-all active:scale-95 shadow-sm hover:shadow-md"
          >
            Browse Projects
          </Link>
        </div>
      )}

      {!loading && bookmarks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((project) => (
            <div
              key={project.id}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-4 transition-all duration-200 hover:shadow-md group"
            >
              {/* Tags + Bookmark remove */}
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  {project.language && (
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {project.language}
                    </span>
                  )}
                  {project.tech_stack?.[0] && (
                    <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-xs font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {project.tech_stack[0]}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(project.id)}
                  className="text-primary hover:text-error transition-colors"
                  title="Remove bookmark"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                </button>
              </div>

              {/* Title + description */}
              <div>
                <Link to={`/projects/${project.id}`}>
                  <h3 className="text-base font-semibold text-on-surface group-hover:text-primary transition-colors" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
                    {project.title}
                  </h3>
                </Link>
                {project.description && (
                  <p className="text-sm text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">{project.description}</p>
                )}
              </div>

              {/* Screenshot */}
              {project.screenshot_url && (
                <div className="w-full h-40 rounded-lg overflow-hidden">
                  <img src={project.screenshot_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/30">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-xs text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>star</span>
                    {project.upvotes ?? 0}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>fork_right</span>
                    0
                  </span>
                </div>
                {project.institution && (
                  <span className="text-xs text-on-surface-variant italic" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {project.institution}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
