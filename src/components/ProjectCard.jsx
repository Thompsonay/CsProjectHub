import { Link } from 'react-router-dom'

export default function ProjectCard({ project }) {
  const initials = project.institution
    ? project.institution.replace(/[^A-Z]/g, '').slice(0, 2) || project.institution[0].toUpperCase()
    : '?'

  return (
    <article
      className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden transition-all duration-300 group flex flex-col"
      style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)' }}
    >
      {/* Screenshot */}
      <div className="relative h-48 bg-surface-container-high overflow-hidden">
        {project.screenshot_url ? (
          <img
            src={project.screenshot_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-surface-container">
            <span className="material-symbols-outlined text-outline" style={{ fontSize: '40px' }}>code</span>
          </div>
        )}
        {/* Verified badge placeholder */}
        <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>verified</span>
          Verified
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Language + topic tags */}
        <div className="flex items-center gap-2 mb-2">
          {project.language && (
            <span className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {project.language}
            </span>
          )}
          {project.tech_stack?.[0] && (
            <span className="bg-secondary/10 text-secondary text-xs font-medium px-3 py-1 rounded-full" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {project.tech_stack[0]}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-base font-semibold text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-2"
          style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
        >
          {project.title}
        </h3>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-on-surface-variant line-clamp-2 mb-6 leading-relaxed flex-1">
            {project.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
            {/* Institution badge */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm">
                {initials}
              </div>
              <div>
                <p className="text-xs font-medium text-on-surface leading-none" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {project.institution || 'Unknown'}
                </p>
                {project.year && (
                  <p className="text-[10px] text-outline mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    Class of {project.year}
                  </p>
                )}
              </div>
            </div>

            {/* Upvote count */}
            <div className="flex items-center gap-1 text-on-surface-variant">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>thumb_up</span>
              <span className="text-xs font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {project.upvotes ?? 0}
              </span>
            </div>
          </div>

          {/* View Details button */}
          <Link
            to={`/projects/${project.id}`}
            className="block w-full bg-surface-container-low text-primary text-sm font-medium py-2 rounded-lg text-center hover:bg-primary hover:text-on-primary transition-all duration-300"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  )
}
