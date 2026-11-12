declare global {
  interface Window {
    __ENV__?: Partial<RuntimeConfig>
  }
}

export interface RuntimeConfig {
  APP_ENV: string
}

const defaults: RuntimeConfig = {
  APP_ENV: 'local',
}

/** Runtime config injected by /config/env.js (one image, many environments). */
export const config: RuntimeConfig = { ...defaults, ...window.__ENV__ }
