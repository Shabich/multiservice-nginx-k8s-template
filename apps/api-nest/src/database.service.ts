import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { Pool } from 'pg'
import { config } from './config'

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: config.databaseUrl,
    max: 5,
    connectionTimeoutMillis: 2000,
  })

  async query<T extends object>(sql: string): Promise<T[]> {
    const { rows } = await this.pool.query<T>(sql)
    return rows
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end()
  }
}
