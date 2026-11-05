import { LogOut } from 'lucide-react'
import isotipo from '../assets/isotipo.png'
import { useAuth } from '../context/AuthContext'

const TABS = [['inicio', 'Inicio'], ['proyectos', 'Proyectos'], ['recursos', 'Recursos'], ['talento', 'Talento docente']]

export default function Navbar({ page, setPage }) {
  const { profile, signOut } = useAuth()
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-2">
        <button onClick={() => setPage('inicio')} className="flex cursor-pointer items-center gap-2 text-xl text-navy">
          <img src={isotipo} alt="" className="h-9" /><span><b>Link</b><span className="text-mint">edu</span>.es</span>
        </button>
        <nav className="flex flex-1 gap-1 overflow-x-auto">
          {TABS.filter(([k]) => !(k === 'talento' && profile.role === 'alumno')).map(([k, l]) => (
            <button key={k} onClick={() => setPage(k)} aria-current={page === k ? 'page' : undefined}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${page === k ? 'bg-electric/10 text-electric' : 'text-muted'}`}>{l}</button>
          ))}
        </nav>
        <span className="text-sm text-muted">{profile.full_name}</span>
        <button className="btn btn-s" onClick={signOut}><LogOut size={16} />Salir</button>
      </div>
    </header>
  )
}
