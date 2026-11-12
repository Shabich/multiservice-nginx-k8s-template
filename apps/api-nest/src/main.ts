import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { config } from './config'

const PROBE_ROUTES = ['healthz', 'readyz']

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // Served under /api/nest so the Ingress needs no path rewriting; probes stay at the root.
  app.setGlobalPrefix(config.globalPrefix, { exclude: PROBE_ROUTES })
  app.enableShutdownHooks()
  await app.listen(config.port, '0.0.0.0')
}

void bootstrap()
