# User Notification Preferences UI Implementation Guide

## 1. Objective

To implement the User Interface (UI) for managing user notification preferences as per section V.D of the `production_readiness_plan.md`. This allows users to opt-in or opt-out of various notification types and set their preferred notification frequency.

## 2. Backend Foundation

The Payload CMS `Users` collection ([`src/collections/Users/index.ts`](src/collections/Users/index.ts:191-266)) already defines the necessary fields for storing user notification preferences:

-   `notificationPreferences` (group):
    -   `email` (group):
        -   `orderUpdates` (boolean, default: true): "Order Updates"
        -   `subscriptionUpdates` (boolean, default: true): "Subscription Updates"
        -   `accountActivity` (boolean, default: true): "Account Activity"
        -   `marketingAndPromotions` (boolean, default: false): "Marketing and Promotions"
        -   `productNewsAndTips` (boolean, default: false): "Product News and Tips"
-   `notificationFrequency` (select, default: 'immediately'): "How often to receive notifications"
    -   Options: 'immediately', 'daily', 'weekly', 'never'

The frontend UI will interact with these fields via the Payload API.

## 3. Frontend Implementation (Conceptual)

This section outlines the implementation for a React-based frontend.

### 3.1. File Location (Example)

A new component, for instance, `NotificationPreferencesForm.tsx`, could be created at a path like `frontend/src/components/Account/NotificationPreferencesForm.tsx`. This component would be integrated into the user's account management page.

### 3.2. Core Functionality

The UI component will:
1.  **Fetch Current Preferences**: On load, retrieve the logged-in user's current `notificationPreferences` and `notificationFrequency` from the backend.
2.  **Display Form**: Render a form with:
    *   Checkboxes for each boolean preference under `notificationPreferences.email`.
    *   A select dropdown for `notificationFrequency`.
    *   Labels and descriptions can be sourced from the `Users` collection definition or defined in the frontend.
3.  **Manage State**: Hold the form's state locally.
4.  **Handle Submission**: On form submission (e.g., "Save Changes" button click), send the updated preferences to the Payload API.
5.  **Provide Feedback**: Inform the user about the outcome of the save operation (success or error).

### 3.3. API Interaction

-   **Fetch Data**:
    -   `GET /api/users/me` (if user is authenticated and endpoint provides full user doc)
    -   OR `GET /api/users/:id` (where `:id` is the logged-in user's ID)
    -   The response should include the `notificationPreferences` and `notificationFrequency` fields.
-   **Update Data**:
    -   `PATCH /api/users/:id`
    -   Request Body:
        ```json
        {
          "notificationPreferences": {
            "email": {
              "orderUpdates": true,
              "subscriptionUpdates": true,
              "accountActivity": true,
              "marketingAndPromotions": false,
              "productNewsAndTips": false
            }
          },
          "notificationFrequency": "daily"
        }
        ```

## 4. Example React Component (`NotificationPreferencesForm.tsx`)

```typescript jsx
import React, { useState, useEffect, FormEvent } from 'react';

// Assume an API client is available, e.g., axios or fetch wrapper
// import apiClient from '../apiClient';

interface UserNotificationPreferences {
  email: {
    orderUpdates: boolean;
    subscriptionUpdates: boolean;
    accountActivity: boolean;
    marketingAndPromotions: boolean;
    productNewsAndTips: boolean;
  };
}

interface UserPreferences {
  notificationPreferences: UserNotificationPreferences;
  notificationFrequency: 'immediately' | 'daily' | 'weekly' | 'never';
}

// Mock API functions for demonstration
const fetchUserPreferences = async (userId: string): Promise<UserPreferences> => {
  console.log(`Fetching preferences for user ${userId}...`);
  // Replace with actual API call: await apiClient.get(`/api/users/${userId}`);
  // This is example data
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          notificationPreferences: {
            email: {
              orderUpdates: true,
              subscriptionUpdates: true,
              accountActivity: true,
              marketingAndPromotions: false,
              productNewsAndTips: false,
            },
          },
          notificationFrequency: 'daily',
        }),
      500,
    ),
  );
};

const updateUserPreferences = async (userId: string, prefs: Partial<UserPreferences>): Promise<void> => {
  console.log(`Updating preferences for user ${userId}:`, prefs);
  // Replace with actual API call: await apiClient.patch(`/api/users/${userId}`, prefs);
  return new Promise((resolve) => setTimeout(resolve, 500));
};


const NotificationPreferencesForm: React.FC<{ userId: string }> = ({ userId }) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchUserPreferences(userId);
        setPreferences(data);
      } catch (err) {
        setError('Failed to load preferences.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, [userId]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!preferences) return;

    const { name, type } = event.target;
    const value = type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value;

    setPreferences((prevPrefs) => {
      if (!prevPrefs) return null;
      // Helper to deeply set values
      const keys = name.split('.');
      let currentLevel = { ...prevPrefs } as any;
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          currentLevel[key] = value;
        } else {
          currentLevel[key] = { ...currentLevel[key] };
          currentLevel = currentLevel[key];
        }
      });
      return { ...prevPrefs, ...currentLevel } as UserPreferences; // This needs proper deep merge
    });

    // More robust state update for nested properties:
    setPreferences(prev => {
        if (!prev) return null;
        const newPrefs = JSON.parse(JSON.stringify(prev)); // Deep copy
        if (name.startsWith('notificationPreferences.email.')) {
            const key = name.split('.')[2] as keyof UserNotificationPreferences['email'];
            newPrefs.notificationPreferences.email[key] = value as boolean;
        } else if (name === 'notificationFrequency') {
            newPrefs.notificationFrequency = value as UserPreferences['notificationFrequency'];
        }
        return newPrefs;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!preferences) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      await updateUserPreferences(userId, preferences);
      setSuccessMessage('Preferences updated successfully!');
    } catch (err) {
      setError('Failed to update preferences.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !preferences) return <div>Loading preferences...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!preferences) return <div>No preferences data found.</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h3>Email Notifications</h3>
      <div>
        <label>
          <input
            type="checkbox"
            name="notificationPreferences.email.orderUpdates"
            checked={preferences.notificationPreferences.email.orderUpdates}
            onChange={handleChange}
          />
          Order Updates (confirmation, shipping, etc.)
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            name="notificationPreferences.email.subscriptionUpdates"
            checked={preferences.notificationPreferences.email.subscriptionUpdates}
            onChange={handleChange}
          />
          Subscription Updates (activation, renewal, payment issues)
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            name="notificationPreferences.email.accountActivity"
            checked={preferences.notificationPreferences.email.accountActivity}
            onChange={handleChange}
          />
          Account Activity (welcome email, security alerts)
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            name="notificationPreferences.email.marketingAndPromotions"
            checked={preferences.notificationPreferences.email.marketingAndPromotions}
            onChange={handleChange}
          />
          Marketing and Promotions
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            name="notificationPreferences.email.productNewsAndTips"
            checked={preferences.notificationPreferences.email.productNewsAndTips}
            onChange={handleChange}
          />
          Product News and Tips
        </label>
      </div>

      <h3>Notification Frequency</h3>
      <div>
        <label htmlFor="notificationFrequency">Receive notifications:</label>
        <select
          id="notificationFrequency"
          name="notificationFrequency"
          value={preferences.notificationFrequency}
          onChange={handleChange}
        >
          <option value="immediately">Immediately</option>
          <option value="daily">Daily Digest</option>
          <option value="weekly">Weekly Digest</option>
          <option value="never">Never (except critical alerts)</option>
        </select>
      </div>

      <br />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Preferences'}
      </button>
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
      {error && !successMessage && <div style={{ color: 'red' }}>Error: {error}</div>}
    </form>
  );
};

export default NotificationPreferencesForm;

// Example Usage:
// <NotificationPreferencesForm userId="currentUserActualId" />
```

## 5. Compliance and Backend Considerations

-   **CAN-SPAM and Similar Regulations**:
    -   The UI provides clear opt-out mechanisms for non-transactional emails (`marketingAndPromotions`, `productNewsAndTips`).
    -   The backend email sending logic (e.g., in [`src/services/email.service.ts`](src/services/email.service.ts) or [`src/services/notification.service.ts`](src/services/notification.service.ts)) **must** check these user preferences before dispatching relevant emails. For example, before sending a marketing email, the service should fetch the user's `notificationPreferences.email.marketingAndPromotions` setting.
-   **Transactional Emails**: While users can technically opt-out of "Order Updates" or "Subscription Updates" via this UI, it's crucial to consider the implications. Some of these (like order confirmations or critical payment failure notices) might be essential. Company policy should define which notifications can be fully suppressed.
-   **Unsubscribe Links**: All marketing and promotional emails must contain a clear and functional unsubscribe link, which should ideally lead the user to this preferences page or directly update their settings.

This guide provides a starting point for implementing the Notification Preferences UI. The actual implementation will need to be adapted to the specific frontend framework, styling, and API client used in the project.