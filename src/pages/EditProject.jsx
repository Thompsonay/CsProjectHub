import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabaseClient'
import { toProjectPayload } from '../components/ProjectForm.jsx'

const inputCls = 'w-full h-12 px-4 border border-outline-variant rounded-lg bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm text-on-surface placeholder:text-outline'
const textareaCls = 'w-full p-4 border border-outline-variant rounded-lg bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm text-on-surface placeholder:text-outline resize-none'
const iconInputCls = 'w-full h-12 border-none outline-none focus:ring-0 text-sm bg-transparent text-on-surface'

export default function EditProject() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [project, setProject] = useState(undefined)
  const [form, setForm] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data } = await supabase.from('projects').select('*').eq('id', id).single()
      if (!cancelled) {
        setProject(data ?? null)
        if (data) {
          setForm({
            title: data.title ?? '',
            description: data.description ?? '',
            language: data.language ?? '',
            techStack: (data.tech_stack ?? []).join(', '),
            topic: data.topic ?? '',
            institution: data.institution ?? '',
            year: data.year ?? '',
            repoUrl: data.repo_url ?? '',
            demoUrl: data.demo_url ?? '',
          })
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required.'); return }
    setSubmitting(true); setError(null)
    const { error } = await supabase.from('projects').update(toProjectPayload(form)).eq('id', id)
    setSubmitting(false)
    if (error) { setError(error.message); return }
    navigate(`/projects/${id}`)
  }

  async function handleDelete() {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    await supabase.from('projects').delete().eq('id', id)
    navigate('/me/projects')
  }

  if (authLoading || project === undefined) {
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
        <h1 className="text-2xl font-semibold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>Sign in required</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          <Link to="/login" state={{ from: location.pathname }} className="text-primary font-medium hover:underline">Log in</Link> to edit this project.
        </p>
      </div>
    )
  }

  if (project === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
        <h1 className="text-2xl font-semibold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>Project not found</h1>
        <Link to="/" className="mt-4 text-sm text-primary font-medium hover:underline">← Back to Browse</Link>
      </div>
    )
  }

  if (project.author_id !== user.id) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
        <h1 className="text-2xl font-semibold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>Access denied</h1>
        <p className="mt-2 text-sm text-on-surface-variant">You don't have permission to edit this project.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <nav className="flex items-center gap-1 text-on-surface-variant mb-2">
            <Link to="/me/projects" className="text-xs hover:text-primary transition-colors" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Projects</Link>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
            <span className="text-xs text-on-surface" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Edit Project</span>
          </nav>
          <h1 className="text-4xl font-bold text-on-surface tracking-tight" style={{ fontFamily: 'Geist, system-ui, sans-serif', letterSpacing: '-0.02em' }}>
            Edit Project
          </h1>
          <p className="text-lg text-on-surface-variant mt-1">Update your project details and showcase your progress.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg border-2 border-error text-error text-sm font-medium hover:bg-error/5 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
            Delete Project
          </button>
          <button
            form="edit-form"
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
          >
            {submitting ? 'Saving…' : 'Update Project'}
          </button>
        </div>
      </div>

      <form id="edit-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main form (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* General Details */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>info</span>
                <h2 className="text-xl font-semibold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>General Details</h2>
              </div>
              <div className="space-y-5">
                <label className="block">
                  <span className="text-xs font-medium text-on-surface mb-1.5 block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Project Title</span>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="Enter your project name" required className={inputCls} />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-on-surface mb-1.5 block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Description</span>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe what your project does…" rows={5} className={textareaCls} />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-medium text-on-surface mb-1.5 block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Institution</span>
                    <input name="institution" value={form.institution} onChange={handleChange} placeholder="e.g. University of Lagos" className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-on-surface mb-1.5 block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Year</span>
                    <input name="year" type="number" value={form.year} onChange={handleChange} placeholder="2024" className={inputCls} />
                  </label>
                </div>
              </div>
            </section>

            {/* Technical Specification */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>terminal</span>
                <h2 className="text-xl font-semibold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>Technical Specification</h2>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-medium text-on-surface mb-1.5 block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Primary Language</span>
                    <input name="language" value={form.language} onChange={handleChange} placeholder="e.g. Python" className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-on-surface mb-1.5 block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Topic</span>
                    <input name="topic" value={form.topic} onChange={handleChange} placeholder="e.g. Machine Learning" className={inputCls} />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-medium text-on-surface mb-1.5 block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Tech Stack (comma-separated)</span>
                  <input name="techStack" value={form.techStack} onChange={handleChange} placeholder="React, Node.js, PostgreSQL" className={inputCls} />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-medium text-on-surface mb-1.5 block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>GitHub Repository</span>
                    <div className="flex items-center px-4 border border-outline-variant rounded-lg bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                      <span className="material-symbols-outlined text-on-surface-variant mr-3" style={{ fontSize: '20px' }}>link</span>
                      <input name="repoUrl" type="url" value={form.repoUrl} onChange={handleChange} placeholder="github.com/user/project" className={iconInputCls} />
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-on-surface mb-1.5 block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Live Demo Link</span>
                    <div className="flex items-center px-4 border border-outline-variant rounded-lg bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                      <span className="material-symbols-outlined text-on-surface-variant mr-3" style={{ fontSize: '20px' }}>rocket_launch</span>
                      <input name="demoUrl" type="url" value={form.demoUrl} onChange={handleChange} placeholder="myproject.vercel.app" className={iconInputCls} />
                    </div>
                  </label>
                </div>
              </div>
            </section>

            {error && (
              <div className="rounded-xl bg-error-container px-4 py-3 text-on-error-container text-sm">{error}</div>
            )}
          </div>

          {/* Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Visibility */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-semibold text-on-surface mb-5" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>Visibility</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-primary bg-primary/5 cursor-pointer">
                  <input type="radio" name="visibility" defaultChecked className="mt-1 accent-primary" />
                  <div>
                    <span className="text-sm font-bold text-on-surface block">Public</span>
                    <span className="text-xs text-on-surface-variant">Visible to everyone in the CSProjectHub community.</span>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 rounded-lg border border-outline-variant hover:border-outline transition-colors cursor-pointer">
                  <input type="radio" name="visibility" className="mt-1 accent-primary" />
                  <div>
                    <span className="text-sm font-bold text-on-surface block">Private</span>
                    <span className="text-xs text-on-surface-variant">Only you and people with the direct link can view.</span>
                  </div>
                </label>
              </div>
              <hr className="my-5 border-outline-variant" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface">Project Status</span>
                <select className="h-10 px-3 border border-outline-variant rounded-lg bg-white focus:border-primary outline-none text-sm">
                  <option>Completed</option>
                  <option>In Progress</option>
                  <option>Maintained</option>
                  <option>Archived</option>
                </select>
              </div>
            </section>

            {/* Insights */}
            <section className="bg-surface-container-high/30 border border-outline-variant rounded-xl p-6">
              <h3 className="text-base font-semibold text-on-surface mb-5" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>Insights</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Views', value: '1,248', color: 'text-primary' },
                  { label: 'Bookmarks', value: '42', color: 'text-secondary' },
                  { label: 'GitHub Stars', value: '12', color: 'text-on-surface' },
                  { label: 'Forks', value: '3', color: 'text-on-surface' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white p-4 rounded-lg border border-outline-variant/50">
                    <span className="text-xs text-on-surface-variant block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{label}</span>
                    <span className={`text-xl font-semibold mt-1 block ${color}`} style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>{value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Danger Zone */}
            <section className="p-6 bg-error/5 border border-error/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-error">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>warning</span>
                <h3 className="text-sm font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Caution Area</h3>
              </div>
              <p className="text-xs text-on-surface-variant mb-5 leading-relaxed">
                Deleting this project will permanently remove all associated data, screenshots, and metrics. This cannot be undone.
              </p>
              <button
                type="button"
                onClick={handleDelete}
                className="w-full h-12 text-sm border border-error text-error rounded-lg hover:bg-error hover:text-white transition-all duration-200"
              >
                Permanently Delete
              </button>
            </section>
          </aside>
        </div>
      </form>
    </div>
  )
}
