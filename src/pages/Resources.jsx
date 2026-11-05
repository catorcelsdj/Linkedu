import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { SUBJECTS } from '../constants'
import ResourceCard from '../components/ResourceCard'
import Modal from '../components/Modal'

const EMPTY = { title: '', description: '', subject_area: '', link_url: '' }

export default function Resources() {
  const { profile } = useAuth()
  const [items, setItems] = useState([]), [q, setQ] = useState(''), [s, setS] = useState('')
  const [open, setOpen] = useState(false), [f, setF] = useState(EMPTY), [err, setErr] = useState('')
  const load = async () => {
    const { data } = await supabase.from('resources').select('*, owner:profiles!owner_id(full_name)').order('created_at', { ascending: false })
    setItems(data || [])
  }
  useEffect(() => { load() }, [])
  const save = async () => {
    if (!f.title.trim()) return setErr('Escribe un título.')
    if (!f.subject_area) return setErr('Elige una asignatura.')
    if (!/^https?:\/\/\S+$/.test(f.link_url)) return setErr('El enlace debe empezar por http:// o https://')
    const { error } = await supabase.from('resources').insert({ ...f, resource_type: 'external_link', owner_id: profile.id })
    if (error) return setErr(error.message)
    setF(EMPTY); setOpen(false); setErr(''); load()
  }
  const shown = items.filter(r => (!s || r.subject_area === s) && (r.title + (r.description || '')).toLowerCase().includes(q.toLowerCase()))
  return (<>
    <h1 className="mt-6 text-xl font-bold">Banco de recursos</h1>
    <div className="my-4 flex flex-wrap gap-2">
      <input className="input max-w-xs flex-1" placeholder="Buscar" aria-label="Buscar" value={q} onChange={e => setQ(e.target.value)} />
      <select className="input max-w-52" aria-label="Asignatura" value={s} onChange={e => setS(e.target.value)}><option value="">Todas las asignaturas</option>{SUBJECTS.map(x => <option key={x}>{x}</option>)}</select>
      {profile.role === 'docente' && <button className="btn" onClick={() => setOpen(true)}>Compartir recurso</button>}
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map(r => <ResourceCard key={r.id} r={r} />)}</div>
    {shown.length === 0 && <p className="text-muted">Aún no hay recursos que coincidan.</p>}
    {open && <Modal title="Compartir recurso" onClose={() => setOpen(false)}>
      <label className="lbl" htmlFor="rt">Título</label><input id="rt" className="input" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
      <label className="lbl" htmlFor="rd">Descripción</label><textarea id="rd" rows={2} className="input" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
      <label className="lbl" htmlFor="rs">Asignatura</label><select id="rs" className="input" value={f.subject_area} onChange={e => setF({ ...f, subject_area: e.target.value })}><option value="">Elige una</option>{SUBJECTS.map(x => <option key={x}>{x}</option>)}</select>
      <label className="lbl" htmlFor="rl">Enlace (Drive, OneDrive u otro)</label><input id="rl" className="input" placeholder="https://" value={f.link_url} onChange={e => setF({ ...f, link_url: e.target.value })} />
      {err && <p role="alert" className="mt-2 text-sm text-red-600">{err}</p>}
      <div className="mt-4 flex justify-end gap-2"><button className="btn btn-s" onClick={() => setOpen(false)}>Cancelar</button><button className="btn" onClick={save}>Compartir</button></div>
    </Modal>}
  </>)
}
