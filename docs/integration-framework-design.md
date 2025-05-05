# Integration Framework Design

This document outlines the proposed framework for managing integration connections and dynamically discovering the event types they support within the system.

## 1. Event Discovery & Schema Management

*   **Mechanism:** A **Manifest-based approach** will be used. Each integration *type* (e.g., Stripe, Slack) must include a `manifest.json` file within its codebase/package.
    *   **Manifest Contents:**
        *   `type`: Unique identifier (e.g., `"stripe"`).
        *   `name`: Human-readable name (e.g., `"Stripe"`).
        *   `description`: Brief explanation.
        *   `credentialSchema`: Defines fields required for authentication (e.g., API Key, Secret, OAuth scopes) to dynamically build the configuration UI.
        *   `events`: An array detailing supported events. Each entry contains:
            *   `eventType`: Unique identifier (e.g., `"charge.succeeded"`).
            *   `description`: Human-readable description.
            *   `schemaPath`: Relative path within the integration's package to the JSON schema file for the event payload (e.g., `"schemas/charge.succeeded.json"`).
*   **Discovery Timing:** Event types and schema information are discovered and registered **during integration instance setup**.
*   **Schema Storage:** The `schemaPath` is stored. Optionally, the system can cache the actual schema content for efficiency.

## 2. Integration Instance Configuration Flow

1.  **Selection:** Admin selects an integration *type* (from available manifests).
2.  **Credentials:** Admin provides authentication details based on the `credentialSchema`.
3.  **Validation:** System calls `testConnection` method (see Interface below).
4.  **Event Registration (Internal):** On success, the system reads the `manifest.json`.
5.  **Storage:** A new record is created in the `Integrations` collection storing:
    *   User-defined name.
    *   Integration `type`.
    *   Encrypted `credentials`.
    *   Connection `status`.
    *   `supportedEvents` (array derived from manifest: `eventType`, `description`, `schemaReference`).
    *   `lastValidated` timestamp.
6.  **Confirmation:** UI confirms successful setup.

## 3. Integration Interface (Contract)

Each integration implementation must adhere to a common TypeScript interface:

```typescript
// Interface defining the contract for any integration implementation
interface IntegrationImplementation {
  // --- Static properties defined in the manifest ---
  type: string; // e.g., 'stripe'
  name: string; // e.g., 'Stripe'
  description: string;
  credentialSchema: Record<string, { label: string; type: 'text' | 'password' | 'oauth'; required: boolean }>;
  events: Array<{ eventType: string; description?: string; schemaPath: string }>;

  // --- Methods for runtime interaction ---

  /**
   * Verifies the provided credentials against the external service.
   * Throws an error on failure.
   */
  testConnection(credentials: Record<string, any>): Promise<void>;

  /**
   * Optional: Validates an incoming event payload against its schema.
   * Useful for data integrity checks before triggering workflows.
   */
  validateEventPayload?(eventType: string, payload: any): Promise<{ isValid: boolean; errors?: any[] }>;

  // Other methods might be added later (e.g., for handling actions)
}

// Example structure for the stored data in the 'Integrations' collection
/*
interface IntegrationRecord {
  id: string;
  name: string;         // User-defined name, e.g., "My Stripe Account"
  type: string;         // e.g., "stripe"
  credentials: any;     // Encrypted credentials
  status: 'active' | 'inactive' | 'error';
  supportedEvents: Array<{
    eventType: string;      // e.g., "charge.succeeded"
    schemaReference: string; // e.g., "integrations/stripe/schemas/charge.succeeded.json" or cache key
    description?: string;
  }>;
  lastValidated: Date;
}
*/
```

## 4. Diagram: Configuration & Discovery Flow

```mermaid
graph TD
    A[Admin selects Integration Type<br/>(e.g., Stripe)] --> B{System reads<br/>Stripe manifest.json};
    B --> C[Admin UI shows<br/>required credential fields];
    C --> D{Admin enters<br/>API Key & Secret};
    D --> E{System calls<br/>StripeIntegration.testConnection(credentials)};
    E -- Success --> F{System reads<br/>manifest.json again<br/>(or uses cached info)};
    F --> G{System extracts<br/>event types & schema paths};
    G --> H[System creates/updates<br/>'Integrations' DB record<br/>with name, type, creds,<br/>status='active', supportedEvents];
    H --> I[UI Confirms Setup];
    E -- Failure --> J[UI Shows Error];