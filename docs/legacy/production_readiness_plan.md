## Production Readiness Plan

This plan outlines the remaining tasks to achieve 100% production readiness for the Orders Management, Subscriptions Management, and integrated Payment Systems (Yoomoney, Robokassa). Crypto payment provider implementation is deferred.

**I. Orders Management System (OMS)**

- **A. Core Functionality & Enhancements:**

  1.  **Order Item Validation:** Implement validation logic to ensure `items` in an order align with the specified `orderType` (e.g., if `orderType` is 'service', items must contain a service). (Ref: [`src/collections/Orders.ts:613`](src/collections/Orders.ts:613) `TODO`).
  2.  **Service Order Fulfillment:** Define and implement the complete workflow for 'service' type orders, including integration with the `Bookings` collection if `serviceData.requiresBooking` is true. Ensure status updates in `Orders` correctly propagate to `Bookings`.
  3.  **Product Order Fulfillment:** Define and implement the workflow for 'product' type orders (e.g., inventory checks, shipping integration placeholders/actuals).
  4.  **Order Cancellation Flow:**
      - Refine cancellation logic for all order types.
      - Ensure related entities (subscriptions, bookings) are correctly cancelled/updated.
      - Handle partial cancellations if applicable.
  5.  **Order Modification:** Define and implement logic for order modifications (e.g., changing items, quantities) post-creation, including recalculation of totals and impact on related entities.
  6.  **Order Number Generation:** Review and confirm robustness of `orderNumber` generation (`ORD-${Date.now()}`) for uniqueness and potential formatting requirements.

- **B. Integration Points:**

  1.  **Subscription Creation:** Verify and solidify the link between `Orders` and `Subscriptions` collections, specifically addressing the `TODO` regarding the 'customer' field in the `Subscription` collection when created from an order (Ref: [`src/collections/Orders.ts:180`](src/collections/Orders.ts:180), [`src/collections/Orders.ts:332`](src/collections/Orders.ts:332)). Consider changing `Subscription.userId` to a relationship to `users`.
  2.  **Payment System Integration:** Ensure seamless handoff to and response from the Payment System for all order types.
  3.  **Notification System Integration:** Confirm all relevant order events trigger appropriate notifications.
  4.  **Existing Services Integration:** (Covered in Section IV)

- **C. Key Aspects:**
  1.  **Comprehensive Testing:**
      - **Functional:** Unit tests for `calculateOrderTotalsHook` and `afterChangeHook`. Component tests for order creation, update, and status transition logic. End-to-end tests for full order lifecycle (creation, payment, fulfillment, cancellation, refund).
      - **Integration:** Test OMS with Subscriptions, Payments, Notifications, and Booking systems.
      - **Load/Performance:** Simulate high volume order creation and processing.
      - **Security:** Test for unauthorized access to order data, data manipulation vulnerabilities.
      - **UAT:** Stakeholder testing of all order flows.
  2.  **Documentation:**
      - **Technical:** Update/create architecture diagrams for OMS, data models for `Orders` collection, API specs if OMS exposes any.
      - **User:** How-to guides for admins managing orders, FAQs for customers regarding their orders.
  3.  **Error Handling, Fault Tolerance, Recovery:**
      - Implement robust error handling in all hooks and service interactions.
      - Develop retry mechanisms for transient errors during integrations (e.g., payment processing, notification sending).
      - Define data backup and restore procedures for order data.
  4.  **Security:**
      - Ensure sensitive order data (e.g., customer details) is handled securely.
      - Implement access controls for order management functionalities.
      - Regular code reviews focusing on security.
  5.  **Monitoring, Logging, Alerting:**
      - Implement detailed logging for order creation, status changes, payment events, and errors.
      - Set up monitoring dashboards for order volume, processing times, error rates.
      - Configure alerts for critical order processing failures.
  6.  **Performance Optimization & Scalability:**
      - Optimize database queries related to orders.
      - Assess scalability of order processing logic.
  7.  **Deployment Preparation:** (Covered in Section VII)
  8.  **Usability & UX:** (Covered in Section VI)
  9.  **Legal & Company Policy Compliance:**
      - Ensure order data handling complies with privacy regulations.
      - Align order processes with company terms of service.

**II. Subscriptions Management System (SMS)**

- **A. Core Functionality & Enhancements:**

  1.  **User Relationship:** Change `userId` field in [`src/collections/subscriptions.ts`](src/collections/subscriptions.ts) from `text` to a `relationship` field pointing to the `users` collection. Update all related logic. This addresses the `TODO` from [`src/collections/Orders.ts`](src/collections/Orders.ts).
  2.  **Lifecycle Event Management:**
      - **Activation:** Implement concrete logic for "additional provisioning" when a subscription becomes `active` (Ref: [`src/collections/subscriptions.ts:305`](src/collections/subscriptions.ts:305)).
      - **Cancellation:** Implement concrete logic for "access revocation" when a subscription is `canceled` (Ref: [`src/collections/subscriptions.ts:307`](src/collections/subscriptions.ts:307)).
      - **Expiration:** Implement concrete logic for "access revocation" when a subscription is `expired` (Ref: [`src/collections/subscriptions.ts:309`](src/collections/subscriptions.ts:309)).
      - **Upgrades/Downgrades:** Design and implement workflows for subscription plan changes, including proration logic if applicable, and updates to payment amounts/tokens.
      - **Pause/Resume:** Fully implement pause and resume functionality, including effects on billing and access.
  3.  **Dunning Management:**
      - Define and implement logic for handling failed recurring payments (`status: 'failed'`).
      - Implement retry schedules for payment attempts (`paymentRetryAttempt` field).
      - Define actions after exhausting retries (e.g., moving subscription to `canceled` or `paused`).
  4.  **Renewal Orders:** Formalize the creation of renewal `Orders` for active subscriptions. Ensure `renewalForSubscription` field in `Orders` is correctly populated.
  5.  **Payment Token Management:** Ensure robust handling of `paymentToken` storage, update, and usage for recurring billing across different providers.

- **B. Integration Points:**

  1.  **Order System Integration:** Solidify creation of subscriptions from `Orders` of type 'subscription'. Ensure status changes in `Orders` (e.g., cancellation of initial order) correctly affect the `Subscription`.
  2.  **Payment System Integration:**
      - Reliable recurring billing using stored payment tokens with Yoomoney and Robokassa.
      - Handling of payment success/failure for renewals.
  3.  **Notification System Integration:** Ensure notifications for all lifecycle events (created, activated, failed payment, cancellation warning, cancelled, expiration warning, expired, upgraded, downgraded, paused, resumed). Leverage existing `notification.service.ts` and `email.service.ts`.
  4.  **Existing Services Integration:** (Covered in Section IV)

- **C. Key Aspects:**
  1.  **Comprehensive Testing:**
      - **Functional:** Unit tests for lifecycle event logic (activation provisioning, cancellation revocation), dunning management (retry logic, status transitions), proration calculations. Component tests for subscription creation, updates (plan changes, pause/resume), status changes via hooks. End-to-end tests for full subscription lifecycle (signup through initial order, successful renewals, failed renewals with dunning, plan change, pause/resume, cancellation, expiration).
      - **Integration:** Test SMS interactions with Orders (creation, renewal order generation), Payments (initial payment, recurring billing success/failure via tokens, refunds affecting subscriptions), and Notifications (correct triggers for lifecycle events).
      - **Load/Performance:** Simulate a large number of active subscriptions undergoing concurrent renewal events and dunning processes. Measure processing time per subscription event.
      - **Security:** Test for unauthorized access/modification of subscription data, including plan details, status, and payment tokens. Validate access controls.
      - **UAT:** Stakeholder testing of all subscription management flows from both customer and admin perspectives.
  2.  **Documentation:**
      - **Technical:** Update/create architecture diagrams specifically for SMS, data models for `Subscriptions` and `SubscriptionPlans` collections (including state transitions), API specs if SMS exposes any direct endpoints, sequence diagrams for key flows (renewal, dunning).
      - **User:** How-to guides for admins managing subscriptions (viewing, editing, manual overrides), FAQs for customers regarding their subscriptions management (how to upgrade, cancel, update payment method).
  3.  **Error Handling, Fault Tolerance, Recovery:**
      - Robust error handling in `afterChange` hooks (e.g., handling failures during provisioning/revocation) and service interactions (payment gateway API calls, notification sending).
      - Implement idempotent logic for potentially duplicated events (e.g., webhook calls).
      - Retry mechanisms specifically for recurring payment processing failures and notification sending during renewals/dunning.
      - Define data backup and restore procedures specifically for `Subscriptions` and `SubscriptionPlans` data, considering dependencies on `Orders` and `Users`.
  4.  **Security:**
      - Secure storage and handling of `paymentToken` (encryption at rest, restricted access). Ensure token usage complies with provider requirements and security best practices.
      - Implement fine-grained access controls for subscription management functionalities in the admin panel.
  5.  **Monitoring, Logging, Alerting:**
      - Detailed logging for all subscription lifecycle events (creation, status changes, plan changes, payment attempts), payment provider interactions (API calls, webhook receipts), errors encountered.
      - Dashboards tracking key SMS metrics: active subscriptions by plan, new subscriptions, renewal rates, churn rates, dunning success/failure rates, payment failures by reason/provider.
      - Configure alerts for critical subscription processing failures (e.g., mass payment failures during renewal cycle), high churn rate spikes, significant increase in dunning failures.
  6.  **Performance Optimization & Scalability:**
      - Optimize database queries for fetching active subscriptions due for renewal or dunning. Index relevant fields (`status`, `renewalDate`, `paymentRetryAttempt`).
      - Design renewal and dunning processes to scale horizontally (e.g., using job queues or serverless functions if applicable) to handle large volumes without impacting overall system performance. Assess potential database locking issues during bulk updates.
  7.  **Deployment Preparation:** (Covered in Section VII)
  8.  **Usability & UX:** (Covered in Section VI)
  9.  **Legal & Company Policy Compliance:**
      - Ensure subscription terms and billing practices comply with regulations and company policies.

**III. Payment Systems (Yoomoney, Robokassa)**

- **A. Yoomoney:**

  1.  **Review & Refine:** Thoroughly review existing Yoomoney integration in [`src/services/payment.service.ts`](src/services/payment.service.ts) for `processPayment` (initial payments), `chargeWithToken` (recurring payments), `refundPayment`, `voidPayment` (if applicable to Yoomoney's flow, otherwise confirm it's correctly handled or not needed), and webhook handling. Verify logic for different payment types (e.g. bank card, Yoomoney wallet).
  2.  **Tokenization:** Confirm robustness of `save_payment_method: true` flow and `payment_method_id` usage for recurring billing. Ensure secure storage and retrieval of tokens. Verify compliance with Yoomoney's token lifecycle policies (e.g., expiration, revocation).
  3.  **Error Codes:** Ensure comprehensive mapping of Yoomoney API error codes to internal error messages, user-facing messages (where appropriate and safe), and system statuses (e.g., `order.paymentStatus`, `subscription.status`).
  4.  **Webhook Completeness:** Verify all relevant Yoomoney webhook events (e.g., `payment.succeeded`, `payment.waiting_for_capture`, `payment.canceled`, `refund.succeeded`) are handled correctly and idempotently. Ensure timely processing of webhooks to update order/subscription statuses.

- **B. Robokassa (Medium Priority - All Features):**

  1.  **`chargeWithToken` Implementation:** Implement logic for recurring payments. This will involve:
      - Investigating Robokassa's specific mechanisms for recurring/subscription payments (e.g., `Recurrent=Y` parameter during initial payment, use of `RecurringFrequency` and `NumRecurrences` or similar, or their subscription API if available). Confirm if a separate agreement or setup is needed with Robokassa for recurring payments.
      - Storing necessary identifiers/tokens (e.g., `ParentInvId`, `Shp_recurringPaymentId`) from the initial payment to facilitate subsequent charges. Ensure these are stored securely.
      - Implementing the `chargeWithToken` method in [`src/services/payment.service.ts:1891-1908`](src/services/payment.service.ts:1891) to use these stored identifiers. This method should initiate a new payment with appropriate parameters for a recurring charge.
  2.  **`refundPayment` Implementation:**
      - Research and implement Robokassa's API for processing refunds (e.g. specific API endpoint for refunds, or parameters within an existing payment operation endpoint). Clarify if full and partial refunds are supported and how they are initiated.
      - Update the `refundPayment` method stub in [`src/services/payment.service.ts:1910-1920`](src/services/payment.service.ts:1910). Ensure it handles different refund scenarios and updates statuses accordingly.
  3.  **`voidPayment` Implementation:**
      - Research and implement Robokassa's API for voiding/cancelling payments if applicable (typically for payments not yet fully settled or authorized but not captured). Distinguish this from refunds.
      - Update the `voidPayment` method stub in [`src/services/payment.service.ts:1922-1932`](src/services/payment.service.ts:1922).
  4.  **Webhook Enhancement:** Review Robokassa webhook handling ([`src/services/payment.service.ts:863-893`](src/services/payment.service.ts:863)) to ensure all necessary notifications (e.g., for successful recurring payments, failed recurring payments, refunds processed, payment cancellations) are processed correctly and idempotently. Map Robokassa's result codes in webhooks to internal statuses.
  5.  **Error Codes:** Map Robokassa API error codes (from direct API responses and webhook notifications) comprehensively to internal error messages, user-facing messages, and system statuses.

- **C. General Payment System Aspects:**

  1.  **Payment Method Management UI:** (Covered in Section VI) Ensure backend supports listing, adding (via provider tokenization flows), and removing saved payment methods for users.
  2.  **Payment Confirmation/Failure Handling:**
      - Ensure `updateOrderStatus` and potentially a new `updateSubscriptionStatusAfterPayment` function in [`src/services/payment.service.ts`](src/services/payment.service.ts) correctly reflects payment outcomes (success, pending, failed, requires_action) from all providers for both initial and recurring payments.
      - Standardize how payment failures are communicated to users (clear, actionable messages) and logged internally (detailed logs for debugging).
      - Implement logic for handling `pending` or `requires_action` states, potentially involving polling or awaiting further webhooks.
  3.  **Refund UI & Backend Flow:** Design and implement UI for initiating refunds (admin-side, potentially user-side for specific cases) and ensure the backend flow correctly calls the respective provider's `refundPayment` method. Track refund status and update related orders/subscriptions.
  4.  **Configuration Management:** Ensure secure and flexible management of provider API keys, shop IDs, secret keys, and other settings (currently loaded via `loadSettings` in [`src/services/payment.service.ts`](src/services/payment.service.ts)). Consider environment-specific configurations and secure vault solutions for production keys.
  5.  **`extractPaymentTokenFromProviderData`:** Refine this method in [`src/services/payment.service.ts:895-967`](src/services/payment.service.ts:895) for robustness with Yoomoney and the new Robokassa token mechanism. Ensure it consistently extracts and stores the correct token or recurring payment identifier needed for `chargeWithToken`.

- **D. Key Aspects (Applicable to all integrated providers):**
  1.  **Comprehensive Testing:**
      - **Functional:** Unit tests for each provider's methods (`processPayment`, `chargeWithToken`, `refundPayment`, `voidPayment`, webhook signature verification and processing logic). End-to-end tests for payment flows with each provider: initial payment success/failure, recurring payment success/failure, refund success/failure (full/partial), void success/failure. Test with different card types/payment methods supported.
      - **Integration:** Test payment processing integration with Orders (status updates, fulfillment triggers) and Subscriptions (activation, renewal, dunning based on payment outcomes).
      - **Security:** Test for vulnerabilities in payment data handling (ensure no raw card data is stored), webhook spoofing (verify signatures), secure token handling, PCI DSS compliance checks (even with tokenization, self-assessment might be needed). Test access controls for refund/void operations.
      - **UAT:** Stakeholder testing of payment and refund processes for all providers, including customer experience during checkout and error scenarios.
  2.  **Documentation:**
      - **Technical:** Document payment provider integration details (API endpoints, request/response formats, authentication), API interaction flows for each operation, webhook processing logic (event types, signature verification, idempotency measures), tokenization mechanisms, and error code mappings for each provider.
      - **User:** FAQs for customers on supported payment methods, troubleshooting common payment issues, how refunds are processed. Internal guides for admins on managing payment configurations, processing manual refunds/voids, and interpreting payment statuses.
  3.  **Error Handling, Fault Tolerance, Recovery:**
      - Robust error handling for API calls to payment providers (network errors, API errors, invalid request errors). Implement retry mechanisms with exponential backoff for transient API errors, especially for critical operations like payment processing and webhook acknowledgments.
      - Ensure idempotency in webhook handling and payment processing logic to prevent duplicate operations on retries or delayed webhooks.
      - Define procedures for manual intervention in case of unrecoverable payment processing errors (e.g., prolonged provider outage).
  4.  **Security:**
      - Strict adherence to PCI DSS guidelines as applicable to the integration model (e.g., SAQ A or SAQ A-EP). Ensure all data transmission uses TLS 1.2+.
      - Secure storage of API keys, secret keys, and any sensitive configuration using environment variables or a secrets management service. Do not commit secrets to version control.
      - Regularly review provider security bulletins and update integrations as needed.
      - Implement measures against common payment fraud vectors if applicable (though largely handled by providers).
  5.  **Monitoring, Logging, Alerting:**
      - Log all payment transactions (requests and anonymized responses to/from providers), API calls, webhook events (received and processed), and errors. Ensure logs are detailed enough for audit and debugging but do not contain sensitive cardholder data.
      - Dashboards for payment success/failure rates by provider and payment method, transaction volumes, average transaction value, refund rates, chargeback rates (if data available).
      - Alerts for high payment failure rates, API downtime or high latency from providers, webhook processing errors or delays, and suspicious transaction patterns.
  6.  **Performance Optimization & Scalability:**
      - Optimize API interactions with payment gateways (e.g., use batch operations if available and appropriate, keep connections alive if supported).
      - Ensure payment processing logic (especially webhooks) can handle spikes in transaction volume without significant delays.

**IV. Integration with Existing Services/Products**

- **A. Discovery & Mapping:**
  1.  Identify all existing company services/products (e.g., CRM, ERP, legacy billing, product catalog, inventory systems) that need to interact with the new Orders, Subscriptions, or Payment systems.
  2.  Define the specific data and event flows for each integration point. This includes:
      - Mapping data models between systems.
      - Defining triggers for data synchronization (e.g., new order created, subscription status changed).
      - Analyzing APIs of existing services to understand capabilities and limitations.
      - Determining if integrations will be synchronous (direct API calls) or asynchronous (event-based, message queues).
- **B. Implementation:**
  1.  Develop necessary API clients or event listeners for communication with each external service. Prioritize creating reusable integration modules/adapters.
  2.  Implement data transformation logic (mapping, validation, enrichment) if required between systems.
  3.  Update `IntegrationService` ([`src/collections/Orders.ts:4`](src/collections/Orders.ts:4)) or create new dedicated services (e.g., `CrmIntegrationService`, `InventoryIntegrationService`) as needed to encapsulate integration logic for each external system. Follow SOLID principles for service design.
  4.  Implement retry mechanisms and error handling for calls to external services.
- **C. Key Aspects:**
  1.  **Comprehensive Testing:** Thorough integration testing for each connected service, including data consistency checks, end-to-end workflow tests involving integrated systems, and failure scenario testing (e.g., external service unavailable).
  2.  **Documentation:** Document integration points, data flows (with sequence diagrams), API contracts (including versions), data mappings, and dependencies for each integrated service. Create operational runbooks for troubleshooting integration issues.
  3.  **Error Handling & Resilience:** Implement robust error handling, retry mechanisms (with backoff), and circuit breaker patterns for inter-service communication to prevent cascading failures. Define fallback strategies if an external service is down.
  4.  **Monitoring & Alerting:** Monitor health and performance of integrations: transaction success/failure rates, latency of calls to external services, queue lengths (if using asynchronous communication). Set up alerts for integration failures or performance degradation.
  5.  **Versioning & Compatibility:** Plan for API versioning of external services. Ensure integrations are backward compatible or have a clear upgrade path when external services change.
  6.  **Security:** Ensure secure communication with external services (e.g., HTTPS, API key management). Validate data received from external systems.

**V. Notification System**

- **A. Event Coverage:**
  1.  Review and finalize the list of critical events across OMS, SMS, PS, and general account management that require notifications. Examples include:
      - **OMS:** Order Confirmation, Order Shipped/Fulfilled, Order Cancelled, Refund Processed.
      - **SMS:** Subscription Activated, Subscription Renewal Reminder, Subscription Renewed Successfully, Subscription Payment Failed (Dunning notification), Subscription Cancelled, Subscription Expired, Plan Changed.
      - **PS:** Payment Confirmation (redundant if Order Confirmation covers it?), Payment Failed (initial), Refund Confirmation.
      - **Account:** Welcome Email, Password Reset/Changed, Email Address Changed, Account Updated.
  2.  Ensure a notification (email primarily, potentially in-app as well) is reliably triggered for each defined event using the existing services.
  3.  Leverage [`src/services/notification.service.ts`](src/services/notification.service.ts) as the central hub for triggering notifications and [`src/services/email.service.ts`](src/services/email.service.ts) for email delivery.
- **B. Channel Expansion:**
  1.  Evaluate business needs and technical feasibility for implementing additional notification channels beyond email (e.g., In-App notifications, SMS for critical alerts like payment failures, Push notifications if a mobile app exists/is planned).
  2.  If new channels are added, update `notification.service.ts` to support them.
- **C. Template Management:**
  1.  Develop and manage responsive HTML email templates for all notifications. Consider using a dedicated templating engine (like Handlebars, Pug, or MJML integrated with Payload) or Payload's built-in field types for managing template content.
  2.  Ensure templates support dynamic content using variables (e.g., customer name, order number, subscription details).
  3.  Implement internationalization (i18n) for notification templates to support multiple languages based on user preferences or context.
- **D. User Preferences:**
  1.  Design and implement UI and backend functionality for users to manage their notification preferences (e.g., opt-in/opt-out of specific notification types like promotional emails vs. transactional alerts).
  2.  Ensure compliance with regulations regarding notification opt-outs (e.g., CAN-SPAM).
- **E. Key Aspects:**
  1.  **Comprehensive Testing:**
      - **Functional:** Test notification triggering for all defined events. Verify correct template rendering with dynamic data. Test notification delivery to mock inboxes. Validate unsubscribe links and preference saving.
      - **Integration:** Test that events from OMS, SMS, PS correctly trigger the notification service.
      - **Localization:** Test template rendering and content in all supported languages.
      - **Deliverability:** Test email deliverability using tools like Mailtrap in staging and monitor sender reputation in production.
  2.  **Documentation:** Document all notification events, their triggers, the channels used, template locations/management system, and available user preferences.
  3.  **Error Handling & Reliability:** Implement robust error handling for notification sending (e.g., email provider API errors, invalid recipient addresses). Use queues (e.g., RabbitMQ, Payload's background tasks) for asynchronous sending and implement retry mechanisms for transient delivery failures.
  4.  **Monitoring & Logging:** Monitor notification delivery rates, open rates, click-through rates (if applicable), bounce rates, and error rates per notification type and channel. Log all notification sending attempts and outcomes.
  5.  **Scalability:** Ensure the notification system architecture (including template rendering and email sending service integration) can handle high volumes of notifications, especially during peak times or bulk actions.
  6.  **Security:** Prevent header injection in emails. Ensure unsubscribe links are secure and cannot be misused.

**VI. User Interface (UI) / User Experience (UX)**

- **A. Customer Facing (Frontend Application):**
  1.  **Order Management:** Clean and intuitive UI for viewing order history (list with status, date, total), order details (items, pricing, shipping info, status history).
  2.  **Subscription Management:** UI for viewing active/past subscriptions (plan details, status, renewal date, cost), changing plans (clear comparison, proration info), pausing/resuming (confirming effects), cancelling subscriptions (retention flows?), updating payment methods linked to subscriptions.
  3.  **Payment Management:** UI for selecting payment methods during checkout, inputting payment details securely (likely via provider-hosted fields/redirects/iframes), viewing payment history (transaction list linked to orders/subscriptions), managing saved payment methods (adding new, deleting old, setting default - requires robust security and backend support).
  4.  **Account Management:** Standard UI for profile updates (name, email), password changes, managing notification preferences (linking to V.D).
  5.  **Checkout Process:** Streamlined, multi-step or single-page checkout flow optimized for conversion. Clear display of items, costs (subtotal, taxes, shipping, total), payment options. Clear feedback on success or failure.
- **B. Administrator Facing (Payload Admin Panel & Custom UIs if any):**
  1.  **Order Management:** Enhanced Payload list view for orders (filtering, sorting, searching). Detail view showing all order data, related customer/subscription/payment info. Actions for manual status updates (e.g., mark as shipped), triggering refunds (linking to III.C.3), handling cancellations.
  2.  **Subscription Management:** Payload list view for subscriptions (filtering by status, plan, user). Detail view showing subscription history, linked orders, payment token status. Tools for viewing/editing subscription details, manually triggering lifecycle events (e.g., activate, cancel, pause), managing dunning process manually if needed.
  3.  **Payment Management:** Payload list view for payment transactions (filtering by provider, status, date). Detail view showing transaction details from provider. Interface for initiating refunds/voids (linking to III.C.3).
  4.  **User Management:** Standard Payload user management augmented with views of associated orders and subscriptions for each user.
- **C. Key Aspects:**
  1.  **Comprehensive Testing:**
      - **Functional:** Test all UI interactions, form submissions, validations, and user flows across different customer and admin scenarios.
      - **Usability Testing:** Conduct usability testing sessions with representative target users (customers and admins) to identify pain points and areas for improvement.
      - **Accessibility Testing:** Ensure compliance with WCAG 2.1 AA standards (keyboard navigation, screen reader compatibility, color contrast, ARIA attributes).
      - **Cross-browser/Cross-device Testing:** Test on major browsers (Chrome, Firefox, Safari, Edge) and various screen sizes (desktop, tablet, mobile) ensuring responsiveness.
      - **UAT:** Stakeholder and end-user acceptance testing of all critical UI flows.
  2.  **Documentation:**
      - **User Guides:** Clear and concise guides for both customers (how to manage account, orders, subscriptions) and administrators (how to use the admin panel features).
      - **UI Style Guides/Component Libraries:** Maintain consistency using a defined style guide or component library (e.g., using Payload's built-in design system or a custom one).
  3.  **Error Handling:** Provide clear, user-friendly, and non-technical error messages in the UI for validation errors, API errors, or unexpected issues. Guide users on how to resolve the error if possible.
  4.  **Security:** Implement standard web security practices: protect against XSS (sanitize user input, use secure frameworks), CSRF (use anti-CSRF tokens), ensure sensitive data (e.g., payment details) is handled securely (never stored or logged directly, rely on provider's secure elements). Secure admin panel access.
  5.  **Monitoring & Analytics:** Track key user interactions and funnel progression using web analytics tools (e.g., Google Analytics, Plausible). Monitor UI error rates using frontend error tracking services (e.g., Sentry, LogRocket). Track Core Web Vitals.
  6.  **Performance Optimization:** Optimize frontend asset loading (code splitting, image optimization, caching). Ensure fast API response times for data fetching. Optimize UI rendering performance, especially for lists.
  7.  **Feedback Mechanisms:** Implement ways for users (both customers and admins) to provide feedback on the UI/UX (e.g., feedback forms, surveys).
  8.  **User Journey Mapping:** Map and continuously optimize key user journeys (e.g., checkout, subscription upgrade, finding order status) based on analytics and user feedback.
  9.  **Consistency:** Ensure consistent design language, terminology, and interaction patterns across the entire application (customer-facing and admin panel).

**VII. Cross-Cutting Concerns (Applicable to all systems)**

- **A. Deployment Preparation:**
  1.  **Detailed Deployment Plan:** Define steps, timelines, and responsibilities for deploying OMS, SMS, and PS enhancements to staging and production. Consider deployment strategies (e.g., blue/green, canary) to minimize downtime and risk. Include smoke tests post-deployment.
  2.  **Data Migration Plan:** If migrating data from old systems (e.g., existing user subscriptions, orders), develop and rigorously test a comprehensive data migration plan, including validation scripts and rollback procedures for migration failures.
  3.  **Rollback Plan:** Establish clear, tested rollback procedures for both code deployments and data migrations in case of critical issues post-deployment.
  4.  **Environment Configuration Management:** Ensure consistent, secure, and automated configuration management for dev, staging, and production environments (API keys, database connections, feature flags, provider settings). Use environment variables and potentially a secrets management system (e.g., HashiCorp Vault, AWS Secrets Manager).
  5.  **Pre-flight & Post-flight Checklists:** Develop detailed checklists for pre-deployment (e.g., backups taken, dependencies met, stakeholder sign-off) and post-deployment verification (e.g., key functionalities working, monitoring checks green, no critical errors in logs).
- **B. Security (Overall):**
  1.  **Holistic Security Review:** Conduct a comprehensive security architecture review and code audit (manual or automated) covering all systems (OMS, SMS, PS, Integrations, UI) and their interactions. Focus on authentication, authorization, data validation, secure API design, and dependency security.
  2.  **Penetration Testing:** Engage a reputable third-party for penetration testing of the production environment (or a staging environment mirroring production) before launch and periodically thereafter.
  3.  **Dependency Scanning:** Implement automated dependency scanning (e.g., npm audit, trivy, Snyk) in the CI/CD pipeline to identify and address vulnerabilities in third-party libraries promptly.
  4.  **Incident Response Plan:** Develop and document an incident response plan outlining steps to take in case of a security breach, data leak, or major system outage (identification, containment, eradication, recovery, post-mortem).
  5.  **Infrastructure Security:** Ensure underlying infrastructure (servers, databases, network) is securely configured (firewalls, access controls, patching).
- **C. Legal and Company Policy Compliance (Overall):**
  1.  **Final Legal Review:** Ensure the legal team reviews and approves all user-facing terms of service, privacy policies, refund policies, and subscription agreements, ensuring they accurately reflect system functionalities related to data handling, billing, and payments.
  2.  **Data Privacy Audit:** Conduct an audit to ensure compliance with relevant data privacy regulations (e.g., GDPR, CCPA), including data minimization, user consent management, data subject access requests (DSAR) handling, and data retention policies.
  3.  **Accessibility Compliance:** Ensure final product meets agreed-upon accessibility standards (e.g., WCAG 2.1 AA), potentially requiring a third-party audit.

This plan provides a roadmap. Each major point can be broken down further into specific tasks and assigned to team members using a project management tool. Regular review and adjustment of this plan will be necessary as development progresses and priorities shift.

---

Once this file is created, use the `attempt_completion` tool. The `result` should confirm the file creation.
These specific instructions supersede any conflicting general instructions you might have.
