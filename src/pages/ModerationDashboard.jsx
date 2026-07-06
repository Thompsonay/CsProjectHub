import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'

export default function ModerationDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [role, setRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(true)
  const [pending, setPending] = useState([])
  const [reports, setReports] = useState([])
  const [approvedToday, setApprovedToday] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setRoleLoading(false); return }
    let cancelled = false
    supabase.from('user_roles').select('role').eq('user_id', user.id).single()
      .then(({ data }) => { if (!cancelled) { setRole(data?.role ?? 'user'); setRoleLoading(false) } })
      .catch(() => { if (!cancelled) { setRole('user'); setRoleLoading(false) } })
    return () => { cancelled = true }
  }, [user])

  const isModerator = role === 'admin' || role === 'moderator'

  useEffect(() => {
    if (!isModerator) { setLoading(false); return }
    let cancelled = false
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    async function load() {
      const [{ data: pendingData }, { data: reportsData }, { count }] = await Promise.all([
        supabase
          .from('projects')
          .select('id, title, description, language, tech_stack, created_at, profiles(username)')
          .eq('status', 'pending')
          .order('created_at', { ascending: true }),
        supabase
          .from('reports')
          .select('id, reason, status, created_at, projects(id, title), profiles(username)')
          .order('status', { ascending: true })
          .order('created_at', { ascending: true }),
        supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'approved')
          .gte('updated_at', startOfToday.toISOString()),
      ])

      if (!cancelled) {
        setPending(pendingData ?? [])
        setReports(reportsData ?? [])
        setApprovedToday(count ?? 0)
        setLoading(false)
      }
    }
    load().catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [isModerator])

  async function approve(id) {
    await supabase.from('projects').update({ status: 'approved' }).eq('id', id)
    setPending((prev) => prev.filter((p) => p.id !== id))
    setApprovedToday((prev) => prev + 1)
  }

  async function reject(id) {
    await supabase.from('projects').update({ status: 'rejected' }).eq('id', id)
    setPending((prev) => prev.filter((p) => p.id !== id))
  }

  async function resolveReport(id) {
    await supabase.from('reports').update({ status: 'resolved' }).eq('id', id)
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)))
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  if (authLoading || roleLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (!user || !isModerator) {
    return <Navigate to="/" replace />
  }

  const openReportsCount = reports.filter((r) => r.status === 'open').length

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
            Moderation Dashboard
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">Oversee platform integrity and review community contributions.</p>
        </div>

        {/* Stat chips */}
        <div className="flex gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>verified</span>
            </div>
            <div>
              <p className="text-xs text-outline uppercase tracking-wide" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Approved Today</p>
              <p className="text-2xl font-semibold text-on-surface leading-none" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>{approvedToday}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center text-error">
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>report_problem</span>
            </div>
            <div>
              <p className="text-xs text-outline uppercase tracking-wide" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Reports Open</p>
              <p className="text-2xl font-semibold text-on-surface leading-none" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>{openReportsCount}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pending Approval */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>Pending Approval</h2>
            <span className="bg-primary-container text-on-primary-container text-xs font-bold px-3 py-1 rounded-full" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {pending.length} New
            </span>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {!loading && pending.length === 0 && (
          <div className="text-center py-10 bg-surface-container-lowest border border-outline-variant rounded-xl">
            <span className="material-symbols-outlined text-outline block mb-2" style={{ fontSize: '40px' }}>task_alt</span>
            <p className="text-sm text-on-surface-variant">No pending submissions — you're all caught up!</p>
          </div>
        )}

        {!loading && pending.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pending.map((project) => (
              <div key={project.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-xs font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Pending</span>
                    <span className="text-outline text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{timeAgo(project.created_at)}</span>
                  </div>
                  <h3 className="text-base font-semibold text-on-surface mb-2" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>{project.title}</h3>
                  {project.description && (
                    <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">{project.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mb-6">
                    {project.language && (
                      <span className="bg-surface-container text-on-surface-variant text-xs px-2 py-0.5 rounded-lg" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{project.language}</span>
                    )}
                    {project.tech_stack?.slice(0, 2).map((t) => (
                      <span key={t} className="bg-surface-container text-on-surface-variant text-xs px-2 py-0.5 rounded-lg" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t}</span>
                    ))}
                  </div>
                  {project.profiles?.username && (
                    <p className="text-xs text-on-surface-variant mb-4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      by {project.profiles.username}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => approve(project.id)}
                    className="flex-1 bg-primary text-on-primary text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                    Approve
                  </button>
                  <button
                    onClick={() => reject(project.id)}
                    className="flex-1 border border-outline-variant text-on-surface-variant text-sm font-medium py-2.5 rounded-lg hover:bg-error/5 hover:text-error hover:border-error transition-all flex items-center justify-center gap-1.5"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reported Content */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>Reported Content</h2>
            {openReportsCount > 0 && (
              <span className="bg-error-container text-on-error-container text-xs font-bold px-3 py-1 rounded-full" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {openReportsCount} Open
              </span>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {!loading && reports.length === 0 && (
          <div className="text-center py-10 bg-surface-container-lowest border border-outline-variant rounded-xl">
            <span className="material-symbols-outlined text-outline block mb-2" style={{ fontSize: '40px' }}>task_alt</span>
            <p className="text-sm text-on-surface-variant">No reports have been filed.</p>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  {['REPORTED ITEM', 'REASON', 'REPORTED BY', 'STATUS', 'ACTIONS'].map((h) => (
                    <th key={h} className={`px-6 py-4 text-xs text-outline font-medium ${h === 'ACTIONS' ? 'text-right' : ''}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-outline shrink-0">
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>description</span>
                        </div>
                        <span className="text-sm font-medium text-on-surface">{report.projects?.title ?? 'Deleted project'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{report.reason}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{report.profiles?.username ?? '—'}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        report.status === 'open' ? 'bg-error/10 text-error' : 'bg-surface-container text-on-surface-variant'
                      }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {report.status === 'open' ? 'Open' : 'Resolved'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {report.status === 'open' ? (
                        <button
                          onClick={() => resolveReport(report.id)}
                          className="text-xs text-primary hover:underline font-medium"
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-xs text-outline" style={{ fontFamily: 'JetBrains Mono, monospace' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
