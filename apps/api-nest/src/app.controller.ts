import { Controller, Get } from '@nestjs/common'
import { DatabaseService } from './database.service'

@Controller()
export class AppController {
  constructor(private readonly db: DatabaseService) {}

  /** Liveness probe: process is up (does not depend on the database). */
  @Get('healthz')
  healthz() {
    return { status: 'ok' }
  }

  /** Readiness probe: database reachable. */
  @Get('readyz')
  async readyz() {
    await this.db.query('SELECT 1')
    return { status: 'ready' }
  }

  @Get('info')
  async info() {
    const [row] = await this.db.query<{ version: string }>('SELECT version()')
    return { service: 'api-nest (NestJS)', database: row?.version ?? 'unknown' }
  }
}
