import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ProjectCard from '../components/ProjectCard.jsx'

export default function PublicProfile() {
  const { username } = useParams()
  const [profile, setProfile] = useState(undefined)
  const [projects, setProjects] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setProfile(undefined); setProjects([]); setError(null)

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('username', username).single()

      if (cancelled) return
      setProfile(profileData ?? null)

      if (profileData) {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, title, description, language, tech_stack, institution, year, screenshot_url')
          .eq('author_id', profileData.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })

        if (cancelled) return
        if (projectsError) setError(projectsError.message)
        else setProjects(projectsData)
      }
    }

    load()
    return () => { cancelled = true }
  }, [username])

  if (profile === undefined) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (profile === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
        <span className="material-symbols-outlined text-outline mb-4" style={{ fontSize: '56px' }}>person_off</span>
        <h1 className="text-2xl font-semibold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>User not found</h1>
        <p className="text-sm text-on-surface-variant mt-1">@{username} doesn't exist.</p>
      </div>
    )
  }

  const initials = profile.username[0].toUpperCase()

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      {/* Profile card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-8" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <div className="flex items-center gap-5">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary/10 shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary-container flex items-center justify-center text-3xl font-bold text-on-primary shrink-0">
              {initials}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
              {profile.full_name || profile.username}
            </h1>
            <p className="text-sm text-on-surface-variant mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              @{profile.username}
              {profile.institution && <span> · {profile.institution}</span>}
            </p>
            {profile.bio && (
              <p className="mt-3 text-sm text-on-surface-variant leading-relaxed max-w-xl whitespace-pre-wrap">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-on-surface" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
          Projects
          {projects.length > 0 && (
            <span className="ml-2 text-sm font-normal text-on-surface-variant">({projects.length})</span>
          )}
        </h2>
      </div>

      {error && (
        <div className="rounded-xl bg-error-container border border-error/20 px-4 py-3 text-on-error-container text-sm mb-4">
          Couldn't load projects: {error}
        </div>
      )}

      {!error && projects.length === 0 && (
        <p className="text-sm text-on-surface-variant">No public projects yet.</p>
      )}

      {projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
