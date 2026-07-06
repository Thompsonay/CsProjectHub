import { useLocation, useSearchParams } from 'react-router-dom'
import FilterBar from '../components/FilterBar.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import { useProjects } from '../hooks/useProjects.js'

const QUICK_FILTERS = ['All Categories', 'Python', 'JavaScript', 'Machine Learning', 'Web App', 'Mobile', 'Blockchain', 'IoT']

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const isSearchPage = location.pathname === '/search'

  const filters = {
    q: searchParams.get('q') ?? '',
    language: searchParams.get('language') ?? '',
    techStack: searchParams.get('tech') ?? '',
    institution: searchParams.get('institution') ?? '',
    year: searchParams.get('year') ?? '',
  }

  const { projects, loading, error } = useProjects(filters)
  const hasFilters = Object.values(filters).some(Boolean)

  // ── Search Results layout ──────────────────────────────────────────────────
  if (isSearchPage) {
    const activeFilter = filters.language || filters.techStack || 'All Categories'

    return (
      <div className="flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 w-full">
          {/* Search header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
                {filters.q
                  ? <>Results for <span className="text-primary">"{filters.q}"</span></>
                  : 'Search Results'}
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">
                {loading ? 'Searching…' : `${projects.length} project${projects.length !== 1 ? 's' : ''} found across African institutions`}
              </p>
            </div>

            {/* Quick filter pills */}
            <div className="flex flex-wrap gap-2">
              {QUICK_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams)
                    if (f === 'All Categories') { next.delete('language'); next.delete('tech') }
                    else if (['Python', 'JavaScript'].includes(f)) next.set('language', f)
                    else next.set('tech', f)
                    setSearchParams(next)
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs border transition-colors ${
                    (f === 'All Categories' && !filters.language && !filters.techStack) ||
                    filters.language === f || filters.techStack === f
                      ? 'border-primary bg-primary-container/10 text-primary font-medium'
                      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Results grid */}
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

          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-outline mb-3 block" style={{ fontSize: '48px' }}>search_off</span>
              <p className="text-on-surface font-medium">No matching projects found</p>
              <p className="text-sm text-on-surface-variant mt-1">Try different keywords or remove some filters</p>
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="results-grid">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Browse layout (default /) ──────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero — hidden while filters are active */}
      {!hasFilters && (
        <section className="relative overflow-hidden py-16 px-6 md:px-12 flex flex-col items-center text-center">
          <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(circle at top right, rgb(0 96 101 / 0.05), transparent 60%)' }} />
          <h1
            className="text-5xl md:text-6xl font-bold text-on-surface mb-4 max-w-3xl leading-tight"
            style={{ fontFamily: 'Geist, system-ui, sans-serif', letterSpacing: '-0.02em' }}
          >
            Find the best final-year projects from across Africa.
          </h1>
          <p className="text-lg text-on-surface-variant mb-8 max-w-2xl leading-relaxed">
            The premier repository for African computer science excellence. Discover, learn, and collaborate on groundbreaking research and implementations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/submit"
              className="bg-primary text-on-primary text-sm font-medium px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload</span>
              Submit your project
            </a>
            <button className="bg-surface border-2 border-primary text-primary text-sm font-medium px-8 py-4 rounded-xl hover:bg-primary/5 transition-all duration-300">
              Explore Trends
            </button>
          </div>
        </section>
      )}

      {/* Sidebar + grid */}
      <div className="flex flex-col md:flex-row gap-6 px-6 md:px-12 pb-16 max-w-7xl mx-auto w-full">
        <FilterBar />

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
            <div>
              <h2
                className="text-2xl font-semibold text-on-surface"
                style={{ fontFamily: 'Geist, system-ui, sans-serif', letterSpacing: '-0.01em' }}
              >
                Browse Projects
              </h2>
              <p className="text-sm text-on-surface-variant mt-0.5">
                {hasFilters ? 'Showing filtered results' : 'Discover student submissions'}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant">
              <button className="p-2 bg-surface-container-lowest text-primary rounded-md shadow-sm">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>grid_view</span>
              </button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>view_list</span>
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-error-container border border-error/20 px-4 py-3 text-on-error-container text-sm">{error}</div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-outline mb-3" style={{ fontSize: '48px' }}>search_off</span>
              <p className="text-on-surface font-medium">No projects match your filters</p>
              <p className="text-sm text-on-surface-variant mt-1">Try different keywords or reset the filters</p>
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              <div className="mt-16 flex justify-center items-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
                </button>
                {[1, 2, 3].map((n) => (
                  <button key={n} className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${n === 1 ? 'bg-primary text-on-primary' : 'border border-outline-variant hover:border-primary'}`}>
                    {n}
                  </button>
                ))}
                <span className="px-2 text-outline text-sm">...</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:border-primary text-sm font-medium transition-colors">12</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
