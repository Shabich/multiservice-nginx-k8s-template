import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'

describe('App', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('shows each backend service status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ service: 'test', database: 'PostgreSQL 18' })),
    )
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('react-nginx-k8s-template')
    expect(await screen.findAllByText('PostgreSQL 18')).toHaveLength(2)
  })

  it('reports an unavailable service', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 503 })))
    render(<App />)
    expect(await screen.findAllByRole('alert')).toHaveLength(2)
  })
})
