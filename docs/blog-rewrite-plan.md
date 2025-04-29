# Blog Page Rewrite Plan

## Objective

Plan a complete rewrite of the blog page (`src/app/(frontend)/[lang]/blog/page.tsx`) using best practices and professional design principles. Consider the existing filtering, search, and pagination requirements, and propose an improved architecture and implementation strategy. The plan should outline the necessary steps and potentially identify components to be created or modified.

## Analysis of Current Implementation

The current blog page (`src/app/(frontend)/[lang]/blog/page.tsx`) is a Next.js server component that fetches blog posts, categories, and tags using a PayloadCMS client. It handles filtering by category, tag, and search query, as well as pagination, primarily through URL search parameters.

**Observations:**

*   Data fetching for posts, categories, and tags is done directly within the server component.
*   Query building for filtering is handled within the server component.
*   The file is relatively large and combines data fetching, logic, and rendering.
*   Filtering and pagination state is managed via URL search parameters.

## Proposed Architecture

To improve performance, user experience, and maintainability, a new architecture is proposed:

*   **Server Component (`page.tsx`):** Primarily responsible for initial data fetching (first page of posts, all categories, and tags) and rendering the initial HTML structure.
*   **Client Component Wrapper (`page.client.tsx`):** Wraps the main blog content area. Handles client-side interactions (filter changes, search input, pagination) and fetches updated data from API routes.
*   **API Routes (`/api/v1/posts`):** Dedicated endpoints for fetching filtered and paginated blog posts based on client-side requests.
*   **Refactored Components:** Existing components (`BlogSearch`, `BlogTagCloud`, `BlogPostCard`, `BlogPagination`) will be adapted to work with the client-side data fetching approach.

## Implementation Strategy

1.  **Create/Modify API Route for Posts:**
    *   Develop or modify `/api/v1/posts` to accept query parameters for pagination, category, tag, and search term.
    *   Implement logic to fetch data from PayloadCMS based on these parameters.
2.  **Refactor `src/app/(frontend)/[lang]/blog/page.tsx`:**
    *   Keep initial data fetching for the first page and filter data (categories, tags).
    *   Pass initial data and filter options to `page.client.tsx`.
    *   Render the basic page layout.
3.  **Create/Refactor `src/app/(frontend)/[lang]/blog/page.client.tsx`:**
    *   Receive initial data from the server component.
    *   Implement client-side state management for filters, search, and pagination.
    *   Implement functions to call the API route on user interaction.
    *   Display loading states while fetching data.
    *   Render the blog components (`BlogSearch`, `BlogTagCloud`, `BlogPostCard` list, `BlogPagination`).
4.  **Refactor Existing Components:**
    *   Update `BlogSearch`, `BlogTagCloud`, `BlogPostCard`, and `BlogPagination` to trigger state updates in `page.client.tsx` and receive data/state as props.
5.  **Implement Loading States and Error Handling:**
    *   Add visual feedback for data fetching.
    *   Implement error handling for API calls.
6.  **Optimize Performance:**
    *   Consider API response caching.
    *   Implement search input debouncing.
    *   Lazy load images.
7.  **Improve User Experience:**
    *   Ensure smooth interactions.
    *   Refine active filter display.

## Components to Create or Modify

*   `src/app/(frontend)/[lang]/blog/page.tsx` (Modify)
*   `src/app/(frontend)/[lang]/blog/page.client.tsx` (Create/Modify)
*   `src/app/api/v1/posts/route.ts` (Modify/Create)
*   `src/components/blog/BlogSearch.tsx` (Modify)
*   `src/components/blog/BlogTagCloud.tsx` (Modify)
*   `src/components/blog/BlogPostCard.tsx` (Modify)
*   `src/components/blog/BlogPagination.tsx` (Modify)
*   Potentially new components for managing the blog post list and filter/pagination state.

## Mermaid Diagram

```mermaid
graph TD
    A[User Interaction] --> B{Client Component<br>page.client.tsx};
    B --> C[Update State];
    C --> D[Call API Route<br>/api/v1/posts];
    D --> E[Fetch Data from PayloadCMS];
    E --> D;
    D --> B;
    B --> F[Render Components<br>BlogSearch, BlogTagCloud, BlogPostCard, BlogPagination];
    G[Initial Page Load] --> H[Server Component<br>page.tsx];
    H --> I[Fetch Initial Data<br>Posts, Categories, Tags];
    I --> H;
    H --> B;