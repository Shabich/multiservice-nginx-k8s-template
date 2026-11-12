# syntax=docker/dockerfile:1

FROM python:3.13-slim AS build
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_NO_CACHE_DIR=1
WORKDIR /app
RUN python -m venv /venv
COPY pyproject.toml ./
RUN /venv/bin/pip install .

FROM python:3.13-slim AS runtime
ENV PATH=/venv/bin:$PATH PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /app
COPY --from=build /venv /venv
COPY app ./app
USER 10001
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
