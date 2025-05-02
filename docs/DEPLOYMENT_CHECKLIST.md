# Production Deployment Checklist

This checklist provides a step-by-step guide for deploying the Flow Masters application to production. Adapt items based on the specific deployment tools and environment.

---

**Deployment Target:** Production Environment
**Application Version:** [Specify Version/Commit SHA]
**Date:** [Specify Date]
**Deployer(s):** [Specify Names]

---

## Phase 1: Pre-Deployment

*   [ ] **Code Freeze:** Announce and enforce code freeze for the release branch/tag.
*   [ ] **Final Testing:**
    *   [ ] QA testing completed and signed off.
    *   [ ] User Acceptance Testing (UAT) completed and signed off (if applicable).
    *   [ ] Performance testing results reviewed (if applicable).
    *   [ ] Security scan results reviewed and critical issues addressed.
*   [ ] **Dependency Check:** Review and confirm versions of critical dependencies (OS, libraries, external services).
*   [ ] **Configuration:**
    *   [ ] Production environment variables (`.env` or secrets management system) verified and ready.
    *   [ ] Secrets (API keys, DB passwords) confirmed and securely stored.
*   [ ] **Database:**
    *   [ ] Production database backup created and verified (test restoration if possible).
    *   [ ] Migration scripts reviewed and tested in a staging environment.
*   [ ] **Infrastructure:**
    *   [ ] Required infrastructure (servers, DB, cache, LB, CDN, storage) provisioned or verified.
    *   [ ] Infrastructure capacity checks performed (CPU, memory, disk space).
    *   [ ] Security group/firewall rules verified.
*   [ ] **Monitoring & Alerting:**
    *   [ ] Monitoring tools configured for the new release (logs, metrics, traces).
    *   [ ] Alerting rules reviewed and confirmed active.
*   [ ] **Rollback Plan:** Rollback procedure reviewed and confirmed ready. Previous stable artifact versions identified.
*   [ ] **Communication:**
    *   [ ] Deployment schedule communicated to stakeholders.
    *   [ ] Support team notified of the deployment window and potential impact.
    *   [ ] Maintenance page prepared (if applicable).

---

## Phase 2: Deployment Execution

*   [ ] **Build Artifacts:**
    *   [ ] Build final production Docker image for the backend.
    *   [ ] Build final production Docker image for the frontend.
    *   [ ] Tag images appropriately (e.g., with Git SHA or version number).
    *   [ ] Push images to the container registry (e.g., ECR, GCR, ACR).
*   [ ] **Maintenance Mode (Optional):**
    *   [ ] Enable maintenance mode/page if required to prevent user access during critical steps.
*   [ ] **Database Migrations:**
    *   [ ] Connect securely to the production database environment.
    *   [ ] Run database migration scripts.
    *   [ ] Verify migration success (check schema, logs).
*   [ ] **Deploy Backend Service:**
    *   [ ] Initiate deployment of the new backend container version (e.g., via Kubernetes `kubectl apply`, ECS task definition update, Cloud Run service update).
    *   [ ] Monitor deployment progress (e.g., rolling update status).
    *   [ ] Verify backend service health checks pass.
    *   [ ] Check backend logs for startup errors.
*   [ ] **Deploy Frontend Service:**
    *   [ ] Initiate deployment of the new frontend container version.
    *   [ ] Monitor deployment progress.
    *   [ ] Verify frontend service health checks pass.
    *   [ ] Check frontend logs for startup errors.
*   [ ] **CDN / Load Balancer:**
    *   [ ] Clear/invalidate relevant CDN caches if necessary.
    *   [ ] Verify load balancer targets the new healthy instances.
*   [ ] **Maintenance Mode (Disable):**
    *   [ ] Disable maintenance mode/page if it was enabled.

---

## Phase 3: Post-Deployment Verification

*   [ ] **Smoke Testing:**
    *   [ ] Access main application URLs (frontend and backend admin).
    *   [ ] Test core user flows (e.g., login, view content, create content if applicable).
    *   [ ] Test key integrations.
*   [ ] **Monitoring & Logs:**
    *   [ ] Check application logs (frontend, backend) for any new errors or warnings.
    *   [ ] Review monitoring dashboards (request latency, error rates, resource utilization - CPU/Memory).
    *   [ ] Verify alerts are functioning correctly (or trigger test alerts).
*   [ ] **Performance Checks:**
    *   [ ] Perform basic performance checks (e.g., page load times using browser dev tools).
    *   [ ] Compare against pre-deployment benchmarks if available.
*   [ ] **Security Checks:**
    *   [ ] Perform basic security checks (e.g., check HTTP headers, test access controls).
*   [ ] **Automated Tests:**
    *   [ ] Run automated end-to-end tests against the production environment (if available).
*   [ ] **Rollback Decision:** Confirm deployment stability. If major issues arise, initiate the rollback plan immediately.
*   [ ] **Communication:**
    *   [ ] Announce successful deployment completion to stakeholders.
    *   [ ] Provide deployment summary/notes to the team.
*   [ ] **Close Monitoring:** Continue close monitoring of the application for the next few hours/days.

---