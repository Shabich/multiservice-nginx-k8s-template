import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

// SWC is needed to emit decorator metadata (Nest dependency injection) in tests.
export default defineConfig({
  plugins: [swc.vite()],
  test: { include: ['src/**/*.spec.ts'] },
})
