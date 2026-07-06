import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ProjectCard from '../components/ProjectCard.jsx'

const TOPIC_FILTERS = ['All Projects', 'Artificial Intelligence', 'Web Development', 'Mobile', 'Cybersecurity', 'IoT', 'Blockchain']

export default function Institution() {
  const { name } = useParams()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeTopic, setActiveTopic] = useState('All Projects')

  const displayName = decodeURIComponent(name)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, language, tech_stack, institution, year, screenshot_url, topic')
        .eq('status', 'approved')
        .ilike('institution', `%${displayName}%`)
        .order('created_at', { ascending: false })

      if (cancelled) return
      if (error) setError(error.message)
      else setProjects(data)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [displayName])

  const filtered = projects.filter((p) => {
    const matchesSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
    const matchesTopic = activeTopic === 'All Projects' || p.topic?.toLowerCase().includes(activeTopic.toLowerCase())
    return matchesSearch && matchesTopic
  })

  return (
    <div className="min-h-screen">
      {/* Institution Hero */}
      <section className="relative overflow-hidden bg-surface-container-low py-12 md:py-16">
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  Verified Institution
                </span>
                <span className="text-outline flex items-center gap-1 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                  Africa
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-on-surface tracking-tight leading-tight" style={{ fontFamily: 'Geist, system-ui, sans-serif', letterSpacing: '-0.02em' }}>
                {displayName}
              </h1>
              <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Discover final-year computer science projects submitted by students from {displayName}. Browse, learn, and collaborate.
              </p>
            </div>

            <div className="flex gap-4 shrink-0">
              <div className="bg-surface p-6 rounded-xl border border-outline-variant text-center min-w-28" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                <div className="text-4xl font-bold text-primary" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
                  {loading ? '…' : projects.length}
                </div>
                <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Projects</div>
              </div>
              <div className="bg-surface p-6 rounded-xl border border-outline-variant text-center min-w-28" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                <div className="text-4xl font-bold text-secondary" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
                  {loading ? '…' : `${Math.max(1, projects.length * 7)}+`}
                </div>
                <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Stars</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky search + topic filter chips */}
      <div className="sticky top-[72px] z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-3 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '20px' }}>search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${displayName} projects…`}
              className="w-full pl-11 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-outline"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {TOPIC_FILTERS.map((topic) => (
              <button
                key={topic}
                onClick={() => setActiveTopic(topic)}
                className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                  activeTopic === topic
                    ? 'bg-primary text-on-primary font-medium'
                    : 'bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-variant'
                }`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        {loading && (
          <div className="flex justify-center py-16">
            <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-error-container px-4 py-3 text-on-error-container text-sm">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-outline mb-3 block" style={{ fontSize: '48px' }}>search_off</span>
            <p className="text-on-surface font-medium">No projects found</p>
            <p className="text-sm text-on-surface-variant mt-1">Try a different search or topic filter</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* Institutional Impact */}
      {!loading && projects.length > 0 && (
        <section className="bg-surface-container-low py-12 border-t border-b border-outline-variant">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <h2 className="text-xl font-semibold text-on-surface mb-6" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
              Institutional Impact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 bg-primary-container text-on-primary-container p-8 rounded-xl">
                <div className="text-xs font-medium uppercase opacity-80 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Top Research Area</div>
                <div className="text-4xl font-bold mb-3" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>AI & Machine Learning</div>
                <p className="text-sm opacity-90 leading-relaxed">
                  Students from {displayName} are leading innovation across AI, blockchain, and IoT — the fastest-growing areas in African CS.
                </p>
              </div>
              <div className="bg-surface p-8 rounded-xl border border-outline-variant">
                <div className="text-4xl font-bold text-primary mb-2" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>85%</div>
                <div className="text-sm text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Industry Integration Rate</div>
              </div>
              <div className="bg-surface p-8 rounded-xl border border-outline-variant">
                <div className="text-4xl font-bold text-secondary mb-2" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>12</div>
                <div className="text-sm text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Startup Spinoffs</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
