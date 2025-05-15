# API Endpoint: Mark Notification as Unread

**Objective:** To mark a specific notification as unread by setting its `isRead` field to `false`.

**1. Endpoint Specification:**

*   **HTTP Method:** `POST`
*   **URL Structure:** `/api/notifications/{notificationId}/unread`
*   **Request Parameters/Body:**
    *   **URL Parameter:** `notificationId` (string, required) - The ID of the notification to mark as unread.
    *   **Request Body:** Empty.
*   **Expected Response:**
    *   **Success Response:**
        *   **Status Code:** `200 OK`
        *   **Response Body:**
            ```json
            {
              "success": true,
              "notification": {
                "id": "string",
                "user": "string", // or user object
                "message": "string",
                "isRead": false,
                "createdAt": "datetime",
                "updatedAt": "datetime"
                // ... other relevant notification fields
              }
            }
            ```
    *   **Error Responses:**
        *   **Status Code:** `400 Bad Request`
            *   **Response Body:** `{ "error": "Notification ID is required" }` or `{ "error": "Invalid Notification ID format" }`
        *   **Status Code:** `401 Unauthorized`
            *   **Response Body:** `{ "error": "Unauthorized" }`
        *   **Status Code:** `403 Forbidden`
            *   **Response Body:** `{ "error": "Forbidden" }`
        *   **Status Code:** `404 Not Found`
            *   **Response Body:** `{ "error": "Notification not found" }`
        *   **Status Code:** `500 Internal Server Error`
            *   **Response Body:** `{ "error": "Failed to mark notification as unread" }`

**2. Considerations:**

*   **Consistency with `mark-as-read` (multiple IDs):** This endpoint is defined for a single `notificationId`. The existing `POST /api/notifications/mark-as-read` (which handles an array `ids: string[]`) can remain separate.
*   **Backend Logic:** The backend implementation will involve authenticating the user, validating the `notificationId`, fetching the notification, verifying user ownership or admin privileges, updating the `isRead` field to `false`, saving the updated notification, and returning the appropriate response.