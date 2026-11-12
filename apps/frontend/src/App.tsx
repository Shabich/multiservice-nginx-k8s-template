import { useEffect, useState } from 'react'
import { config } from './config.ts'

type Status =
  | { state: 'loading' }
  | { state: 'ok'; data: { service: string; database: string } }
  | { state: 'error'; message: string }

const SERVICES = [
  { name: 'API Python (FastAPI)', url: '/api/py/info' },
  { name: 'API Nest (NestJS)', url: '/api/nest/info' },
] as const

function ServiceCard({ name, url }: { name: string; url: string }) {
  const [status, setStatus] = useState<Status>({ state: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setStatus({ state: 'ok', data: await res.json() })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setStatus({ state: 'error', message: err instanceof Error ? err.message : String(err) })
      })
    return () => controller.abort()
  }, [url])

  return (
    <article className={`card card--${status.state}`}>
      <h2>{name}</h2>
      <code>{url}</code>
      {status.state === 'loading' && <p>Chargement…</p>}
      {status.state === 'error' && <p role="alert">Indisponible : {status.message}</p>}
      {status.state === 'ok' && (
        <dl>
          <dt>Service</dt>
          <dd>{status.data.service}</dd>
          <dt>Postgres</dt>
          <dd>{status.data.database}</dd>
        </dl>
      )}
    </article>
  )
}

export default function App() {
  return (
    <main>
      <header>
        <h1>react-nginx-k8s-template</h1>
        <p>
          Environnement : <strong>{config.APP_ENV}</strong>
        </p>
      </header>
      <section className="grid">
        {SERVICES.map((s) => (
          <ServiceCard key={s.url} {...s} />
        ))}
      </section>
    </main>
  )
}
