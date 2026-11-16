# Challenge 012 — Helm Chart for a Small Business Service

**Level:** 4 — Systems (Level 4 consolidation)  
**Industry:** Independent business formation services  
**Stack:** Python 3.11+, Docker, Helm 3, Kubernetes

## Business context

A business-formation platform operates a small status API used by internal support teams. Several environments need the same workload with different image tags and resource sizing, while keeping safe runtime defaults consistent. The service and container already work; the deployable Helm chart is the missing platform capability.

## What already works

A dependency-free HTTP service returns service health and status, with passing local tests and a Dockerfile. No Helm chart or Kubernetes resources are supplied.

## Your assignment

As a platform engineer, package the service as a maintainable Helm chart suitable for repeatable installation across development and production-like environments.

## Acceptance criteria

- `helm lint` and `helm template` succeed with the default values and a production-like values override.
- Rendered resources include a Deployment and Service with a configurable image repository/tag and service port.
- Replicas, resource requests/limits, and health probes can be configured without editing templates.
- The chart rejects invalid required image settings or unsafe replica/resource values with a clear render/install error.
- Rendered workloads use a non-root security context and do not expose credentials in chart defaults.

## Constraints

- Helm 3 and stable Kubernetes APIs; keep the chart limited to this service.
- No cluster/cloud credentials, external chart dependencies, or paid services.
- Defaults must be useful locally and safe enough to review for production; document assumptions.

## Out of scope

Building a chart repository, provisioning clusters, secret-management integration, ingress/TLS, and application feature development.

## Run & verify

Requires Python 3.11+ and Helm 3. From this directory:

```bash
python3 -m unittest discover -s tests -v
python3 app/main.py
```

In another terminal, `curl http://localhost:8080/health` returns `{"status":"ok"}`. Build the container with `docker build -t business-status:local .`.

After adding the chart:

```bash
helm lint ./chart
helm template business-status ./chart
helm template business-status ./chart -f values-production.yaml
```

Install to a disposable local cluster only if one is available; the baseline does not require a cluster.

## Optional stretch goal

Add a chart-level test or CI check that verifies key rendered security and resource settings.
