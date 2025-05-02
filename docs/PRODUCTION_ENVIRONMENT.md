# Production Environment Configuration

This document details the configuration for the production environment of the Flow Masters application, based on the strategy outlined in `docs/DEPLOYMENT.md`.

## Overview

The production environment runs the Flow Masters application, consisting of a Next.js frontend and a Payload CMS backend. Both applications are containerized using Docker and deployed to a major cloud provider (e.g., AWS, GCP, Azure). The architecture leverages managed cloud services for scalability, reliability, and maintainability.

## Infrastructure Components

### Compute

*   **Service:** A container orchestration service manages the application containers (e.g., AWS ECS Fargate, AWS EKS, Google Cloud Run, Google GKE, Azure Container Apps, Azure AKS).
*   **Instance Types/Sizes:** Chosen based on performance requirements and cost analysis within the selected cloud provider's offerings.
*   **Scaling:** Configured with auto-scaling based on metrics like CPU utilization or request count to handle varying loads. Health checks ensure instance reliability.

### Database

*   **Service:** A managed relational database service hosts the Payload CMS data (e.g., AWS RDS for PostgreSQL, Google Cloud SQL for PostgreSQL, Azure Database for PostgreSQL).
*   **Instance Size:** Selected based on data size, connection requirements, and performance needs.
*   **Backup Strategy:** Automated daily backups are configured, with point-in-time recovery enabled. Retention policies are defined according to business requirements.

### Caching (Recommended)

*   **Service:** A managed in-memory caching service (e.g., AWS ElastiCache for Redis, Google Memorystore for Redis, Azure Cache for Redis).
*   **Purpose:** Used for session management, rate limiting, and potentially caching frequently accessed data to improve performance.

### Networking

*   **VPC:** Applications run within a Virtual Private Cloud (VPC) or equivalent virtual network for isolation.
*   **Subnets:** Deployed across multiple availability zones using private subnets for application instances and public subnets for load balancers/bastion hosts if needed.
*   **Security Groups/Firewalls:** Network access is restricted using security groups or firewall rules, allowing traffic only on necessary ports (e.g., 80/443 for HTTP/S, database port only from application instances).
*   **Load Balancer:** A managed load balancer (e.g., AWS ALB, Google Cloud Load Balancer, Azure Load Balancer) distributes incoming traffic across healthy application instances, handles SSL termination.
*   **CDN:** A Content Delivery Network (e.g., AWS CloudFront, Google Cloud CDN, Azure CDN) caches static assets (CSS, JS, images) and potentially Next.js pages closer to users for faster load times.

## Application Configuration

### Environment Variables

The following key environment variables are required for the production environment. These **must** be managed securely using a secrets management service (e.g., AWS Secrets Manager, Google Secret Manager, Azure Key Vault).

*   `NODE_ENV=production`: Ensures applications run in production mode.
*   `DATABASE_URL`: Connection string for the production database.
*   `PAYLOAD_SECRET`: Strong, unique secret key for Payload CMS security functions.
*   `NEXT_PUBLIC_SERVER_URL`: The public URL of the Payload CMS backend, accessible by the Next.js frontend.
*   `SERVER_URL`: (If different from `NEXT_PUBLIC_SERVER_URL`) The internal or specific URL the Payload backend uses for self-references.
*   `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_BUCKET`: Credentials and configuration for the object storage service (if using S3 plugin).
*   Payment Gateway Keys (e.g., `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`): API keys for payment processing.
*   Email Service Keys: API keys and configuration for the transactional email service (e.g., SendGrid, Postmark, AWS SES).
*   Other service-specific API keys or secrets.

### Payload CMS Production Settings

Ensure the following are configured in Payload CMS settings for production:

*   `devMode: false`: Disabled in production.
*   `serverURL`: Set to the correct public URL (`NEXT_PUBLIC_SERVER_URL` or `SERVER_URL`).
*   Email Adapter: Configured to use the production email service provider.
*   Uploads: Configured to use the production object storage (e.g., S3 plugin).

### Next.js Production Settings

Ensure the following are configured in `next.config.mjs` or via environment variables for production:

*   `output`: Typically `standalone` for optimized Docker deployments.
*   `assetPrefix`: Configured with the CDN URL if a CDN is used for serving assets.
*   Ensure development-only plugins or configurations are disabled.

## Logging & Monitoring

*   **Logging:** Application logs (stdout/stderr from containers) are collected and forwarded to a centralized logging service (e.g., AWS CloudWatch Logs, Google Cloud Logging, Datadog, Logtail).
*   **Monitoring:** An Application Performance Monitoring (APM) tool (e.g., Datadog, New Relic, Dynatrace) and cloud provider monitoring services (e.g., CloudWatch Metrics) are used to track application health, performance, and resource utilization. Alerting is configured for critical issues.

## Security Considerations

*   **Network Security:** Strict firewall rules and security groups limit access.
*   **Secrets Management:** All sensitive credentials and API keys are stored and injected securely via a secrets manager.
*   **Regular Updates:** Operating systems, application dependencies, and base Docker images are kept up-to-date with security patches.
*   **Principle of Least Privilege:** IAM roles or service accounts for cloud resources have the minimum necessary permissions.
*   **WAF:** Consider using a Web Application Firewall (WAF) in front of the load balancer for additional protection against common web exploits.