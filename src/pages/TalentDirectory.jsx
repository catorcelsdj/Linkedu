import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { SUBJECTS } from '../constants'
import TalentCard from '../components/TalentCard'
import Modal from '../components/Modal'

export default function TalentDirectory() {
  const { profile } = useAuth()
  const [items, setItems] = useState([]), [q, setQ] = useState(''), [s, setS] = useState('')
  const [to, setTo] = useState(null), [text, setText] = useState(''), [msg, setMsg] = useState('')
  useEffect(() => { supabase.from('profiles').select('id,full_name,subject_area,bio').eq('role', 'docente').then(({ data }) => setItems(data || [])) }, [])
  const send = async () => {
    if (!text.trim()) return setMsg('Escribe un mensaje antes de enviarlo.')
    const { error } = await supabase.from('messages').insert({ sender_id: profile.id, receiver_id: to.id, content: text.trim() })
    if (error) return setMsg(error.message)
    setTo(null); setText(''); setMsg('')
  }
  const shown = items.filter(t => (!s || t.subject_area === s) && (t.full_name + t.bio + t.subject_area).toLowerCase().includes(q.toLowerCase()))
  return (<>
    <h1 className="mt-6 text-xl font-bold">Directorio de talento docente</h1>
    <p className="text-sm text-muted">Durante la fase gratuita, el contacto directo no tiene coste.</p>
    <div className="my-4 flex flex-wrap gap-2">
      <input className="input max-w-xs flex-1" placeholder="Buscar" aria-label="Buscar" value={q} onChange={e => setQ(e.target.value)} />
      <select className="input max-w-52" aria-label="Asignatura" value={s} onChange={e => setS(e.target.value)}><option value="">Todas las asignaturas</option>{SUBJECTS.map(x => <option key={x}>{x}</option>)}</select>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map(t => <TalentCard key={t.id} t={t} uid={profile.id} onContact={setTo} />)}</div>
    {shown.length === 0 && <p className="text-muted">Ningún docente coincide con esa búsqueda.</p>}
    {to && <Modal title={`Contactar con ${to.full_name}`} onClose={() => setTo(null)}>
      <label className="lbl" htmlFor="mg">Mensaje</label><textarea id="mg" rows={4} className="input" value={text} onChange={e => setText(e.target.value)} />
      {msg && <p role="alert" className="mt-2 text-sm text-red-600">{msg}</p>}
      <div className="mt-4 flex justify-end gap-2"><button className="btn btn-s" onClick={() => setTo(null)}>Cancelar</button><button className="btn" onClick={send}>Enviar mensaje</button></div>
    </Modal>}
  </>)
}
