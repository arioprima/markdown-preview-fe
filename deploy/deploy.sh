#!/usr/bin/env bash

set -Eeuo pipefail

if [[ $# -ne 3 ]]; then
  echo "Usage: deploy.sh APP_DIR COMPOSE_FILE ENV_FILE" >&2
  exit 2
fi

app_dir=$1
compose_source=$2
env_source=$3
service=frontend

if docker info >/dev/null 2>&1; then
  docker_command=(docker)
else
  docker_command=(sudo docker)
fi

compose() {
  "${docker_command[@]}" compose \
    --project-directory "$app_dir" \
    --env-file "$app_dir/.env" \
    -f "$app_dir/compose.yml" \
    "$@"
}

restore_previous_release() {
  if [[ ! -f "$app_dir/.env.previous" || ! -f "$app_dir/compose.yml.previous" ]]; then
    echo "No previous release is available for rollback." >&2
    return 0
  fi

  echo "Restoring the previous frontend release..." >&2
  cp "$app_dir/.env.previous" "$app_dir/.env"
  cp "$app_dir/compose.yml.previous" "$app_dir/compose.yml"
  compose pull "$service" || true
  compose up -d --no-deps "$service" || true
}

if [[ -f "$app_dir/.env" ]]; then
  cp "$app_dir/.env" "$app_dir/.env.previous"
fi

if [[ -f "$app_dir/compose.yml" ]]; then
  cp "$app_dir/compose.yml" "$app_dir/compose.yml.previous"
fi

install -m 0644 "$compose_source" "$app_dir/compose.yml"
install -m 0600 "$env_source" "$app_dir/.env"

if ! compose config --quiet; then
  restore_previous_release
  exit 1
fi

if ! compose pull "$service"; then
  restore_previous_release
  exit 1
fi

if ! compose up -d --no-deps "$service"; then
  restore_previous_release
  exit 1
fi

container_id=$(compose ps -q "$service")
if [[ -z "$container_id" ]]; then
  echo "Frontend container was not created." >&2
  restore_previous_release
  exit 1
fi

for _ in {1..45}; do
  container_status=$(
    "${docker_command[@]}" inspect \
      --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
      "$container_id"
  )

  case "$container_status" in
    healthy)
      echo "Frontend deployment is healthy."
      exit 0
      ;;
    unhealthy | exited | dead)
      echo "Frontend container entered state: $container_status" >&2
      compose logs --tail 100 "$service" >&2 || true
      restore_previous_release
      exit 1
      ;;
  esac

  sleep 2
done

echo "Frontend did not become healthy before the timeout." >&2
compose logs --tail 100 "$service" >&2 || true
restore_previous_release
exit 1
