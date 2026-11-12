import 'reflect-metadata'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { afterAll, beforeAll, describe, it } from 'vitest'
import { AppModule } from './app.module'
import { DatabaseService } from './database.service'

describe('AppController', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DatabaseService)
      .useValue({ query: async () => [{ version: 'PostgreSQL 18' }] })
      .compile()
    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api/nest', { exclude: ['healthz', 'readyz'] })
    await app.init()
  })

  afterAll(() => app.close())

  it('GET /healthz', () => request(app.getHttpServer()).get('/healthz').expect(200, { status: 'ok' }))

  it('GET /api/nest/info', () =>
    request(app.getHttpServer())
      .get('/api/nest/info')
      .expect(200, { service: 'api-nest (NestJS)', database: 'PostgreSQL 18' }))
})
