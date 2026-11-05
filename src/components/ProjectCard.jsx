export default function ProjectCard({ p, uid, role, onRequest, onCode, onReview }) {
  const ms = p.project_members || []
  const mine = p.owner_id === uid
  const m = ms.find(x => x.user_id === uid)
  const n = ms.filter(x => x.status === 'aceptado').length
  const pend = ms.filter(x => x.status === 'pendiente').length
  let action = null
  if (mine) action = (<><span className="tag">Tu código: {p.invite_code}</span>{pend > 0 && onReview && <button className="btn btn-s" onClick={() => onReview(p)}>Solicitudes ({pend})</button>}</>)
  else if (m) action = <span className="tag">{m.status === 'aceptado' ? 'Eres miembro' : 'Solicitud enviada'}</span>
  else if (role !== 'empresa' && onRequest) action = p.is_public
    ? <button className="btn" onClick={() => onRequest(p)}>Solicitar unirme</button>
    : <button className="btn btn-s" onClick={onCode}>Tengo un código</button>
  return (
    <article className="card">
      <div><b>{p.title}</b><div className="text-sm text-muted">{p.owner?.full_name}, {n} {n === 1 ? 'participante' : 'participantes'}</div></div>
      <p className="text-sm text-muted">{p.description}</p>
      <div className="flex flex-wrap items-center gap-2"><span className="tag">{p.is_public ? 'Público' : 'Privado'}</span>{action}</div>
    </article>
  )
}
