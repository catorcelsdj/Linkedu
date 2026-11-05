import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import ProjectCard from '../components/ProjectCard'
import ResourceCard from '../components/ResourceCard'

export default function Home({ setPage }) {
  const { profile } = useAuth()
  const [ps, setPs] = useState([]), [rs, setRs] = useState([])
  useEffect(() => {
    supabase.from('projects').select('*, owner:profiles!owner_id(full_name), project_members(user_id,status)').order('created_at', { ascending: false }).limit(3).then(({ data }) => setPs(data || []))
    supabase.from('resources').select('*, owner:profiles!owner_id(full_name)').order('created_at', { ascending: false }).limit(3).then(({ data }) => setRs(data || []))
  }, [])
  const go = profile.role === 'docente' ? ['Crear un proyecto', 'proyectos'] : profile.role === 'alumno' ? ['Explorar proyectos', 'proyectos'] : ['Buscar docentes', 'talento']
  return (<>
    <section className="mt-5 flex flex-col items-start gap-3 rounded-2xl bg-gradient-to-br from-navy to-electric p-8 text-white">
      <h1 className="text-3xl font-bold">Hola, {profile.full_name.split(' ')[0]}</h1>
      <p className="max-w-md text-lg opacity-90">Conectando docentes, impulsando proyectos educativos</p>
      <button className="btn bg-mint text-emerald-950" onClick={() => setPage(go[1])}>{go[0]}</button>
    </section>
    <h2 className="mb-3 mt-8 text-lg font-bold">Proyectos recientes</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{ps.map(p => <ProjectCard key={p.id} p={p} uid={profile.id} role={profile.role} />)}</div>
    {ps.length === 0 && <p className="text-muted">Todavía no hay proyectos.</p>}
    <h2 className="mb-3 mt-8 text-lg font-bold">Recursos destacados</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rs.map(r => <ResourceCard key={r.id} r={r} />)}</div>
    {rs.length === 0 && <p className="text-muted">Todavía no hay recursos.</p>}
  </>)
}
