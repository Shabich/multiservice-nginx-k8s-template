.DEFAULT_GOAL := help
SERVICES := frontend api-python api-nest
PY := apps/api-python/.venv/bin

help: ## List targets
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*## "}{printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies for all services
	cd apps/frontend && npm ci
	cd apps/api-nest && npm ci
	cd apps/api-python && python3 -m venv .venv && .venv/bin/pip install -q -e . pytest httpx ruff

lint: ## Lint all services
	cd apps/frontend && npm run lint && npm run typecheck
	cd apps/api-nest && npm run lint && npm run typecheck
	$(PY)/ruff check apps/api-python && $(PY)/ruff format --check apps/api-python

test: ## Run all tests
	cd apps/frontend && npm test
	cd apps/api-nest && npm test
	cd apps/api-python && .venv/bin/pytest -q

up: ## Start the full stack locally (http://localhost:8080)
	docker compose up -d --build

down: ## Stop the local stack
	docker compose down

logs: ## Follow local stack logs
	docker compose logs -f

images: ## Build the images tagged :dev
	@for s in $(SERVICES); do docker build -t react-nginx-k8s-template/$$s:dev apps/$$s; done

k8s-render: ## Render the dev and prod manifests
	kubectl kustomize k8s/overlays/dev
	@test -f k8s/overlays/prod/postgres.env || cp k8s/overlays/prod/postgres.env.example k8s/overlays/prod/postgres.env
	kubectl kustomize k8s/overlays/prod

k8s-dev: images ## Build images and deploy the dev overlay to the current kube context
	kubectl apply -k k8s/overlays/dev
	kubectl -n app-dev rollout status deploy --timeout=120s

k8s-dev-delete: ## Remove the dev deployment
	kubectl delete -k k8s/overlays/dev

.PHONY: help install lint test up down logs images k8s-render k8s-dev k8s-dev-delete
