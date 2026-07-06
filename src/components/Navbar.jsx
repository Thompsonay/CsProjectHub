import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const searchRef = useRef(null)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  function handleSearch(e) {
    e.preventDefault()
    const q = searchRef.current?.value.trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className="w-full sticky top-0 z-50 glass-nav bg-surface/90 border-b border-outline-variant shadow-sm transition-all duration-200" style={{ height: '72px' }}>
      <div className="flex items-center justify-between h-full px-6 md:px-12 w-full max-w-7xl mx-auto gap-4">

        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>hub</span>
            <span className="font-headline text-xl font-bold text-primary tracking-tight" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
              CSProjectHub
            </span>
          </Link>

          {/* Inline search */}
          <form onSubmit={handleSearch} className="hidden lg:flex relative items-center w-80">
            <span className="material-symbols-outlined absolute left-4 text-outline" style={{ fontSize: '20px' }}>search</span>
            <input
              ref={searchRef}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-11 pr-4 text-sm font-body focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-outline"
              placeholder="Search projects..."
              type="text"
            />
          </form>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-primary border-b-2 border-primary py-1 transition-all duration-200"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Browse
          </Link>
          <Link
            to="/submit"
            className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors px-1 py-1 rounded"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Submit
          </Link>
          {user && (
            <Link
              to="/me/projects"
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors px-1 py-1 rounded"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              My Projects
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {!loading && !user && (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-primary hover:bg-surface-container-low transition-all duration-200 px-4 py-2 rounded-lg"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-primary-container text-on-primary text-sm font-medium px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                Signup
              </button>
            </>
          )}

          {!loading && user && (
            <>
              <Link to="/me/bookmarks" className="text-on-surface-variant hover:text-primary transition-colors hidden sm:block">
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>bookmark</span>
              </Link>
              <Link to="/me" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-sm font-bold text-on-primary">
                    {(profile?.username ?? user.email ?? '?')[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-on-surface">
                  {profile?.username ?? 'Profile'}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
