export const config = {
  port: Number(process.env.PORT ?? 3000),
  globalPrefix: process.env.GLOBAL_PREFIX ?? 'api/nest',
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://app:app@localhost:5432/app',
}
