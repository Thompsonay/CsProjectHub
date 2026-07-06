import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center bg-background">
      <span className="material-symbols-outlined text-outline mb-2" style={{ fontSize: '72px' }}>error</span>
      <p className="text-8xl font-bold text-primary/10" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>404</p>
      <h1 className="text-2xl font-semibold text-on-surface mt-2" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
        Page not found
      </h1>
      <p className="mt-2 text-sm text-on-surface-variant max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-on-primary bg-primary rounded-xl hover:shadow-lg transition-all active:scale-95"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}
      >
        ← Back to Browse
      </Link>
    </div>
  )
}
