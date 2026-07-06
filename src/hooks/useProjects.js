import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Fetches approved projects, building the Supabase query dynamically from
// whatever filters are present. Every filter is optional — an empty/missing
// one is simply skipped, so this one query powers both the plain Browse
// page and any filtered search.
export function useProjects(filters) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { q, language, techStack, institution, year } = filters

  useEffect(() => {
    // Guards against setting state after the component has unmounted (or
    // after a newer request has started) if filters change quickly.
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('projects')
        .select(
          'id, title, description, language, tech_stack, institution, year, screenshot_url, created_at, profiles(username)'
        )
        .eq('status', 'approved')

      if (language) query = query.eq('language', language)
      if (institution) query = query.eq('institution', institution)
      if (year) query = query.eq('year', Number(year))
      if (techStack) query = query.contains('tech_stack', [techStack])
      if (q) {
        // Commas separate OR conditions in PostgREST's .or() syntax, so
        // strip any from the user's input to keep the filter well-formed.
        const safeQ = q.replace(/,/g, '')
        query = query.or(`title.ilike.%${safeQ}%,description.ilike.%${safeQ}%`)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query
      if (cancelled) return

      if (error) setError(error.message)
      else setProjects(data)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [q, language, techStack, institution, year])

  return { projects, loading, error }
}
