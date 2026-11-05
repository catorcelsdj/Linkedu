import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import ProjectCard from '../components/ProjectCard'
import Modal from '../components/Modal'

export default function Projects() {
  const { profile } = useAuth()
  const [items, setItems] = useState([]), [q, setQ] = useState('')
  const [modal, setModal] = useState(null), [err, setErr] = useState('')
  const [form, setForm] = useState({ title: '', description: '', is_public: true }), [code, setCode] = useState(''), [reqs, setReqs] = useState([])

  const load = async () => {
    const { data } = await supabase.from('projects').select('*, owner:profiles!owner_id(full_name), project_members(user_id,status)').order('created_at', { ascending: false })
    setItems(data || [])
  }
  useEffect(() => { load() }, [])
  const close = () => { setModal(null); setErr('') }

  const create = async () => {
    if (!form.title.trim()) return setErr('Escribe un título para el proyecto.')
    const invite_code = 'LK-' + Math.random().toString(36).slice(2, 6).toUpperCase()
    const { data, error } = await supabase.from('projects').insert({ ...form, title: form.title.trim(), invite_code, owner_id: profile.id }).select().single()
    if (error) return setErr(error.message)
    await supabase.from('project_members').insert({ project_id: data.id, user_id: profile.id, status: 'aceptado' })
    setForm({ title: '', description: '', is_public: true }); close(); load()
  }
  const request = async p => { await supabase.from('project_members').insert({ project_id: p.id, user_id: profile.id, status: 'pendiente' }); load() }
  const join = async () => {
    const { error } = await supabase.rpc('join_project_by_code', { code })
    if (error) return setErr(error.message)
    setCode(''); close(); load()
  }
  const review = async p => {
    const { data } = await supabase.from('project_members').select('id, profiles(full_name)').eq('project_id', p.id).eq('status', 'pendiente')
    setReqs(data || []); setModal('reqs')
  }
  const accept = async id => { await supabase.from('project_members').update({ status: 'aceptado' }).eq('id', id); setReqs(reqs.filter(r => r.id !== id)); load() }

  const shown = items.filter(p => (p.title + p.description).toLowerCase().includes(q.toLowerCase()))
  return (<>
    <h1 className="mt-6 text-xl font-bold">Explorar proyectos</h1>
    <div className="my-4 flex flex-wrap gap-2">
      <input className="input max-w-xs flex-1" placeholder="Buscar" aria-label="Buscar" value={q} onChange={e => setQ(e.target.value)} />
      {profile.role !== 'empresa' && <button className="btn btn-s" onClick={() => setModal('code')}>Unirme con código</button>}
      {profile.role === 'docente' && <button className="btn" onClick={() => setModal('new')}>Nuevo proyecto</button>}
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map(p => <ProjectCard key={p.id} p={p} uid={profile.id} role={profile.role} onRequest={request} onCode={() => setModal('code')} onReview={review} />)}
    </div>
    {shown.length === 0 && <p className="text-muted">No hay proyectos con esa búsqueda.</p>}
    {modal === 'new' && <Modal title="Nuevo proyecto" onClose={close}>
      <label className="lbl" htmlFor="t">Título</label><input id="t" className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
      <label className="lbl" htmlFor="d">Descripción</label><textarea id="d" rows={3} className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      <label className="mt-3 flex gap-2 text-sm"><input type="checkbox" checked={form.is_public} onChange={e => setForm({ ...form, is_public: e.target.checked })} />Visible para todos, con solicitud de ingreso</label>
      {err && <p role="alert" className="mt-2 text-sm text-red-600">{err}</p>}
      <div className="mt-4 flex justify-end gap-2"><button className="btn btn-s" onClick={close}>Cancelar</button><button className="btn" onClick={create}>Crear proyecto</button></div>
    </Modal>}
    {modal === 'code' && <Modal title="Unirme con código" onClose={close}>
      <label className="lbl" htmlFor="c">Código de invitación</label><input id="c" className="input" placeholder="LK-XXXX" value={code} onChange={e => setCode(e.target.value)} />
      {err && <p role="alert" className="mt-2 text-sm text-red-600">{err}</p>}
      <div className="mt-4 flex justify-end gap-2"><button className="btn btn-s" onClick={close}>Cancelar</button><button className="btn" onClick={join}>Unirme</button></div>
    </Modal>}
    {modal === 'reqs' && <Modal title="Solicitudes pendientes" onClose={close}>
      {reqs.length === 0 && <p className="text-sm text-muted">No quedan solicitudes.</p>}
      {reqs.map(r => <div key={r.id} className="mt-3 flex items-center justify-between"><span>{r.profiles?.full_name || 'Alumno'}</span><button className="btn" onClick={() => accept(r.id)}>Aceptar</button></div>)}
      <div className="mt-4 flex justify-end"><button className="btn btn-s" onClick={close}>Cerrar</button></div>
    </Modal>}
  </>)
}
