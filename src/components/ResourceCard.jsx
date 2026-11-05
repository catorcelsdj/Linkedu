export default function ResourceCard({ r }) {
  return (
    <article className="card">
      <div className="flex flex-wrap items-center gap-2"><span className="tag">{r.subject_area}</span><span className="text-xs text-muted">{r.resource_type === 'file' ? 'Fichero' : 'Enlace externo'}</span></div>
      <b>{r.title}</b>
      <p className="text-sm text-muted">{r.description}</p>
      <div className="flex items-center justify-between"><span className="text-sm text-muted">{r.owner?.full_name}</span>
        <a className="btn btn-s" href={r.link_url} target="_blank" rel="noopener noreferrer">Abrir recurso</a></div>
    </article>
  )
}
