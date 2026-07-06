import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Institution from './pages/Institution.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Submit from './pages/Submit.jsx'
import EditProject from './pages/EditProject.jsx'
import MyProfile from './pages/MyProfile.jsx'
import MyProjects from './pages/MyProjects.jsx'
import Bookmarks from './pages/Bookmarks.jsx'
import PublicProfile from './pages/PublicProfile.jsx'
import ModerationDashboard from './pages/ModerationDashboard.jsx'
import NotFound from './pages/NotFound.jsx'

// This is the routing skeleton for the whole app. Every page is a stub for
// now — each one gets filled in during the phase noted in its file.
// Route params (the ":id" parts) are read inside each page with useParams().
function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/institutions/:name" element={<Institution />} />
          {/* Search reuses Home — filters live in the URL, not the route */}
          <Route path="/search" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Authenticated */}
          <Route path="/submit" element={<Submit />} />
          <Route path="/projects/:id/edit" element={<EditProject />} />
          <Route path="/me" element={<MyProfile />} />
          <Route path="/me/projects" element={<MyProjects />} />
          <Route path="/me/bookmarks" element={<Bookmarks />} />
          <Route path="/user/:username" element={<PublicProfile />} />

          {/* Admin/Mod */}
          <Route path="/admin/moderation" element={<ModerationDashboard />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
