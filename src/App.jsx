import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Resources from './pages/Resources'
import TalentDirectory from './pages/TalentDirectory'
import Auth from './pages/Auth'

const PAGES = { inicio: Home, proyectos: Projects, recursos: Resources, talento: TalentDirectory }

function Shell() {
  const { session, profile, loading } = useAuth()
  const [page, setPage] = useState('inicio')
  if (loading) return <p className="p-10 text-muted">Cargando…</p>
  if (!session || !profile) return <Auth />
  const Page = PAGES[page === 'talento' && profile.role === 'alumno' ? 'inicio' : page]
  return (<><Navbar page={page} setPage={setPage} /><main className="mx-auto max-w-5xl px-4 pb-16"><Page setPage={setPage} /></main></>)
}

export default function App() { return <AuthProvider><Shell /></AuthProvider> }
