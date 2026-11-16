# Challenge 011 — Kubernetes Workload Resilience

**Level:** 4 — Systems (Level 4 consolidation)  
**Industry:** Municipal water utilities  
**Stack:** Python 3.11+, Kubernetes manifests, kubectl, Docker

## Business context

A municipal water utility runs a small service that reports reservoir telemetry to operators. The service is already containerized, but its current runtime contract does not express how Kubernetes should keep it available during node pressure or safely replace unhealthy replicas. Operators need predictable recovery behavior without adding unnecessary platform components.

## What already works

A standard-library HTTP service exposes `/health` and `/reservoirs`; unit tests run locally without dependencies. A Dockerfile builds the service image. The Kubernetes workload and service configuration are intentionally absent.

## Your assignment

As a platform engineer, define the Kubernetes deployment contract so the telemetry API can be operated reliably in a small production cluster.

## Acceptance criteria

- A Deployment and Service expose two or more ready replicas using the provided container image and port.
- The workload has meaningful startup/readiness/liveness behavior; an unready or unhealthy process is not treated as ready traffic.
- Container resource requests and limits, non-root execution, and a non-zero-priority workload policy are explicit and valid.
- A rolling update can proceed without taking all available replicas out of service, and configuration passes the supplied validation command.
- Invalid image/configuration values or a failed readiness check do not falsely report the workload as available.

## Constraints

- Kubernetes `apps/v1` and `v1` APIs; keep all resources namespaced and use synthetic values.
- Do not add a database, cloud service, ingress controller, or credentials.
- Verification must work with a local Kubernetes distribution if available; static schema validation is an acceptable minimum.

## Out of scope

Cluster provisioning, autoscaling, service mesh, production monitoring stack, and application feature changes.

## Run & verify

Requires Python 3.11+; Docker is optional for the baseline. From this directory:

```bash
python3 -m unittest discover -s tests -v
python3 app/main.py
```

Then in another terminal:

```bash
curl http://localhost:8080/health
# {"status":"ok"}
curl http://localhost:8080/reservoirs
# {"reservoirs":[{"id":"R-101","level_percent":72}]}
```

Build the baseline container with `docker build -t water-telemetry:local .`. After adding your manifests, validate them with `kubectl apply --dry-run=client -f <manifest.yaml>` (clusterless validation depends on local kubectl/OpenAPI availability); ideally also apply them to kind or minikube and verify rollout/readiness behavior.

## Optional stretch goal

Document a maintenance-mode and recovery procedure that operators can execute during a planned service interruption.
