export default function TalentCard({ t, uid, onContact }) {
  return (
    <article className="card">
      <div><b>{t.full_name}</b><div><span className="tag">{t.subject_area || 'General'}</span></div></div>
      <p className="text-sm text-muted">{t.bio || 'Este perfil aún no tiene descripción.'}</p>
      {t.id !== uid ? <button className="btn self-start" onClick={() => onContact(t)}>Contactar</button> : <span className="text-sm text-muted">Este es tu perfil</span>}
    </article>
  )
}
