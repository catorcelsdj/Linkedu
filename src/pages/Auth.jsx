import { useState } from 'react'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import { SUBJECTS } from '../constants'

const ROLES = [['docente', 'Docente', 'Crea proyectos y comparte recursos'], ['alumno', 'Alumno', 'Únete a proyectos entre centros'], ['empresa', 'Empresa', 'Busca docentes expertos']]

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ email: '', password: '', full_name: '', role: 'docente', subject_area: '' })
  const [consent, setConsent] = useState(false)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const set = k => e => setF({ ...f, [k]: e.target.value })

  const submit = async e => {
    e.preventDefault(); setMsg('')
    if (mode === 'signup' && f.role === 'alumno' && !consent) return setMsg('Confirma que tienes la edad o la autorización necesaria.')
    setBusy(true)
    const r = mode === 'login' ? await signIn(f.email, f.password) : await signUp(f.email, f.password, f.full_name, f.role, f.role === 'docente' ? f.subject_area : '')
    setBusy(false)
    if (r.error) setMsg(r.error.message)
    else if (mode === 'signup' && !r.data.session) setMsg('Cuenta creada. Revisa tu correo para confirmarla y luego entra.')
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-4xl items-center gap-8 p-6 md:grid-cols-2">
      <img src={logo} alt="Linkedu, red educativa conectada" className="mx-auto max-h-72 md:max-h-96" />
      <form onSubmit={submit} className="card">
        <h1 className="text-xl font-bold">{mode === 'login' ? 'Entrar en Linkedu' : 'Crear cuenta'}</h1>
        {mode === 'signup' && (<>
          <div className="grid gap-2">{ROLES.map(([k, l, d]) => (
            <label key={k} className={`cursor-pointer rounded-xl border-2 p-3 ${f.role === k ? 'border-electric bg-electric/5' : 'border-slate-200'}`}>
              <input type="radio" name="role" className="mr-2" checked={f.role === k} onChange={() => setF({ ...f, role: k })} /><b>{l}</b><span className="block pl-6 text-sm text-muted">{d}</span>
            </label>))}</div>
          <label className="lbl" htmlFor="fn">Nombre completo</label><input id="fn" required className="input" value={f.full_name} onChange={set('full_name')} />
          {f.role === 'docente' && (<><label className="lbl" htmlFor="sa">Asignatura o área</label>
            <select id="sa" className="input" value={f.subject_area} onChange={set('subject_area')}><option value="">Sin especificar</option>{SUBJECTS.map(s => <option key={s}>{s}</option>)}</select></>)}
          {f.role === 'alumno' && <label className="mt-3 flex gap-2 text-sm"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />Tengo 14 años o más, o cuento con la autorización de mi madre, padre o tutor.</label>}
        </>)}
        <label className="lbl" htmlFor="em">Correo electrónico</label><input id="em" type="email" required className="input" value={f.email} onChange={set('email')} />
        <label className="lbl" htmlFor="pw">Contraseña</label><input id="pw" type="password" minLength={6} required className="input" value={f.password} onChange={set('password')} />
        {msg && <p role="alert" className="mt-3 text-sm text-red-600">{msg}</p>}
        <button className="btn mt-4 justify-center" disabled={busy}>{mode === 'login' ? 'Entrar' : 'Crear cuenta'}</button>
        <button type="button" className="text-sm text-electric" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMsg('') }}>
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}</button>
      </form>
    </div>
  )
}
