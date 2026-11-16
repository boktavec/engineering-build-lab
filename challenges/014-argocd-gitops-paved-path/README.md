# Challenge 014 — Argo CD GitOps Paved Path

**Level:** 4 — Systems (Level 4 consolidation)  
**Industry:** Community solar energy  
**Stack:** Python 3.11+, Docker, Kubernetes, Argo CD, Kustomize

## Business context

A community-solar operator runs an API that reports synthetic site production summaries. Engineers currently lack a consistent, reviewable path from a Git change to a cluster deployment. A narrow GitOps setup should make desired state visible and recoverable while keeping environment-specific changes explicit.

## What already works

A dependency-free HTTP API, local tests, and Dockerfile are provided. The service exposes health and production-summary endpoints. No Kubernetes overlays or Argo CD application configuration are included.

## Your assignment

As a platform engineer, define a GitOps deployment path that lets Argo CD reconcile the service from version-controlled configuration for a local development environment.

## Acceptance criteria

- A Kustomize base describes the service workload and network service, and a development overlay can be rendered locally.
- An Argo CD Application points at the intended repository path and target namespace with automated reconciliation and pruning policy made explicit.
- The workload uses an immutable image reference, health checks, resource requests/limits, and non-root execution.
- Local rendering and manifest validation succeed; documentation explains how an operator can identify and recover from drift or a failed rollout.
- Configuration does not embed secrets or require a paid service.

## Constraints

- Use stable Kubernetes APIs and the open-source Argo CD distribution; local cluster installation is optional.
- Git is the source of truth; do not require imperative post-deployment edits.
- Keep the scope to one service and one development environment; synthetic data only.

## Out of scope

Installing or operating a production Argo CD control plane, multi-cluster promotion, secret operators, cloud infrastructure, and application feature development.

## Run & verify

Requires Python 3.11+; a local `kubectl` is recommended. From this directory:

```bash
python3 -m unittest discover -s tests -v
python3 app/main.py
```

In another terminal, `curl http://localhost:8080/health` returns `{"status":"ok"}`. Build the container with `docker build -t solar-summary:local .`.

After creating GitOps configuration, render it with `kubectl kustomize <overlay-directory>` and validate with `kubectl apply --dry-run=client -k <overlay-directory>` where clusterless schema validation is available. If you have kind/minikube and Argo CD installed, verify reconciliation and drift recovery there.

## Optional stretch goal

Add a second overlay that changes only environment-specific configuration while preserving the same workload contract.
