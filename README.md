# react-nginx-k8s-template

Template monorepo prêt pour Kubernetes : un frontend **React** servi par **nginx**, deux APIs (**FastAPI** et **NestJS**), une base **PostgreSQL**, le tout derrière un seul **Ingress**.

```
                    ┌──────────── Ingress (app.localtest.me) ────────────┐
                    │  /            /api/py             /api/nest        │
                    └────┬────────────┬───────────────────┬──────────────┘
                         ▼            ▼                   ▼
                    frontend     api-python           api-nest
                 (React + nginx)  (FastAPI)           (NestJS)
                                      └────────┬──────────┘
                                               ▼
                                     postgres (StatefulSet)
```

## Structure

```
apps/
  frontend/      React 19 + Vite + TypeScript, image nginx-unprivileged
  api-python/    FastAPI + psycopg (pool async)
  api-nest/      NestJS + pg
k8s/
  base/          Deployments, Services, StatefulSet Postgres, Ingress
  overlays/dev/  namespace app-dev, images locales, secrets de dev
  overlays/prod/ namespace app-prod, images GHCR, TLS, HPA + PDB, 2 réplicas
docker-compose.yml   stack locale identique (proxy /api/* dans nginx)
Makefile             raccourcis (make help)
.github/workflows/   CI : lint, tests, build, rendu kustomize, push GHCR
```

## Démarrage rapide

```bash
make up          # docker compose : http://localhost:8080
make down
```

La page d'accueil appelle `/api/py/info` et `/api/nest/info`, qui renvoient chacun la version de Postgres. Si les deux cartes sont vertes, la stack complète fonctionne.

### Développer un service sans Docker

```bash
make install
docker compose up -d postgres

cd apps/frontend   && npm run dev                          # http://localhost:5173 (proxy vers les APIs)
cd apps/api-python && .venv/bin/uvicorn app.main:app --reload --port 8000
cd apps/api-nest   && npm run build && npm start           # port 3000
```

```bash
make lint
make test
```

## Kubernetes

Il faut un contrôleur Ingress. Le manifeste utilise `ingressClassName: nginx` ; changez-le dans `k8s/base/ingress.yaml` si vous utilisez Traefik ou autre chose.

```bash
make k8s-dev          # build des images :dev + kubectl apply -k k8s/overlays/dev
make k8s-render       # affiche les manifestes dev et prod
make k8s-dev-delete
```

Le host de dev est `app.localtest.me`, qui résout vers 127.0.0.1. Avec kind, chargez d'abord les images : `kind load docker-image react-nginx-k8s-template/frontend:dev` (idem pour les autres).

### Prod

1. `cp k8s/overlays/prod/postgres.env.example k8s/overlays/prod/postgres.env` et changez le mot de passe. Ce fichier est ignoré par git. Mieux : passez par External Secrets ou Sealed Secrets.
2. Remplacez `OWNER` et `app.example.com` dans `k8s/overlays/prod/kustomization.yaml`.
3. Fixez les tags d'image publiés par la CI (`sha-xxxxxxx`) :
   ```bash
   cd k8s/overlays/prod
   kustomize edit set image frontend=ghcr.io/<owner>/react-nginx-k8s-template/frontend:sha-abc1234
   ```
4. `kubectl apply -k k8s/overlays/prod`

Pour une vraie prod, privilégiez une base managée ou un opérateur (CloudNativePG) plutôt que le StatefulSet fourni.

## Choix techniques

- **Routage par préfixe sans rewrite** : chaque API sert elle-même son préfixe (`/api/py`, `/api/nest`). L'Ingress reste donc standard et marche avec n'importe quel contrôleur.
- **Probes séparées** : `/healthz` (liveness, ne dépend pas de la DB) et `/readyz` (readiness, ping Postgres), à la racine et hors préfixe. Une panne DB retire les pods du trafic sans les redémarrer en boucle.
- **Config runtime du frontend** : `/config/env.js` vient d'une ConfigMap. La même image tourne dans tous les environnements, et le hash kustomize relance le rollout quand la config change.
- **Sécurité** : namespaces en PodSecurity `restricted`, conteneurs non-root, `readOnlyRootFilesystem`, capabilities supprimées, pas de token de ServiceAccount monté. nginx ajoute les headers de sécurité (CSP, X-Frame-Options, …).
- **Cache nginx** : `/assets/*` (fichiers hashés) en `immutable` pendant 1 an, `index.html` en `no-cache`, `env.js` en `no-store`.

## Ajouter un service

1. `apps/<nom>/` avec un `Dockerfile` qui sert `/<préfixe>`, `/healthz` et `/readyz`.
2. `k8s/base/<nom>.yaml` (Deployment + Service), à ajouter dans `k8s/base/kustomization.yaml`.
3. Un chemin dans `k8s/base/ingress.yaml`, une entrée `images:` dans chaque overlay.
4. Le service dans `docker-compose.yml` et `apps/frontend/nginx/dev-proxy.conf`.
5. La matrice de `.github/workflows/ci.yml`.
