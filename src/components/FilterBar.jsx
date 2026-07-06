import { useSearchParams } from 'react-router-dom'

const LANGUAGES = ['Python', 'Java', 'JavaScript', 'PHP', 'C++', 'Go', 'TypeScript']
const TECH_STACK = ['React', 'Django', 'Laravel', 'Flutter', 'Node.js', 'Vue', 'Spring']
const TOPICS = ['AI / ML', 'Web App', 'Mobile App', 'IoT', 'Blockchain', 'Cybersecurity']
const YEARS = ['2025', '2024', '2023', '2022']

const labelCls = 'text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-3 block'

export default function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams()

  const activeLanguage = searchParams.get('language') ?? ''
  const activeTech = searchParams.get('tech') ?? ''
  const activeYear = searchParams.get('year') ?? ''

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  function toggleLanguage(lang) {
    setParam('language', activeLanguage === lang ? '' : lang)
  }

  function toggleTech(tech) {
    setParam('tech', activeTech === tech ? '' : tech)
  }

  function toggleYear(year) {
    setParam('year', activeYear === year ? '' : year)
  }

  function handleReset() {
    setSearchParams({})
  }

  return (
    <aside className="w-full md:w-64 lg:w-72 shrink-0 space-y-8">
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-on-surface" style={{ fontFamily: 'Inter, sans-serif' }}>Filters</h3>
          <button
            onClick={handleReset}
            className="text-primary text-xs font-medium hover:underline"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            Reset all
          </button>
        </div>

        <div className="space-y-8">
          {/* Programming Language */}
          <div>
            <span className={labelCls} style={{ fontFamily: 'JetBrains Mono, monospace' }}>Programming Language</span>
            <div className="space-y-2">
              {LANGUAGES.map((lang) => (
                <label key={lang} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={activeLanguage === lang}
                    onChange={() => toggleLanguage(lang)}
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all accent-primary"
                  />
                  <span className={`text-sm transition-colors group-hover:text-primary ${activeLanguage === lang ? 'text-primary font-medium' : 'text-on-surface'}`}>
                    {lang}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <span className={labelCls} style={{ fontFamily: 'JetBrains Mono, monospace' }}>Tech Stack</span>
            <div className="flex flex-wrap gap-2">
              {TECH_STACK.map((tech) => (
                <button
                  key={tech}
                  onClick={() => toggleTech(tech)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    activeTech === tech
                      ? 'bg-primary-container text-on-primary-container font-medium'
                      : 'bg-surface-container text-on-surface hover:bg-primary-container hover:text-on-primary-container'
                  }`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <span className={labelCls} style={{ fontFamily: 'JetBrains Mono, monospace' }}>Topic</span>
            <div className="space-y-2">
              {TOPICS.map((topic) => {
                const active = searchParams.get('topic') === topic
                return (
                  <label key={topic} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="topic"
                      checked={active}
                      onChange={() => setParam('topic', active ? '' : topic)}
                      className="w-5 h-5 border-outline-variant text-primary focus:ring-primary/20 accent-primary"
                    />
                    <span className={`text-sm ${active ? 'text-primary font-medium' : 'text-on-surface'}`}>
                      {topic}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Institution */}
          <div>
            <span className={labelCls} style={{ fontFamily: 'JetBrains Mono, monospace' }}>Institution</span>
            <select
              value={searchParams.get('institution') ?? ''}
              onChange={(e) => setParam('institution', e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            >
              <option value="">All Institutions</option>
              <option>UNILAG</option>
              <option>OAU</option>
              <option>UNN</option>
              <option>LASU</option>
              <option>ABU</option>
              <option>FUTA</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <span className={labelCls} style={{ fontFamily: 'JetBrains Mono, monospace' }}>Year</span>
            <div className="grid grid-cols-2 gap-2">
              {YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => toggleYear(year)}
                  className={`p-2 border rounded-lg text-xs text-center transition-colors ${
                    activeYear === year
                      ? 'border-primary bg-primary text-on-primary font-medium'
                      : 'border-outline-variant hover:border-primary text-on-surface'
                  }`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {year}
                </button>
              ))}
              <button
                onClick={() => toggleYear('older')}
                className={`p-2 border rounded-lg text-xs text-center transition-colors col-span-2 ${
                  activeYear === 'older'
                    ? 'border-primary bg-primary text-on-primary font-medium'
                    : 'border-outline-variant hover:border-primary text-on-surface'
                }`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                Older
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
