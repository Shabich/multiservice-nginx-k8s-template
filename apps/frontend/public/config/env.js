// Runtime configuration. Overridden in Kubernetes by a ConfigMap mounted at /usr/share/nginx/html/config.
window.__ENV__ = {
  APP_ENV: 'local',
}
