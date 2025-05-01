# Online Learning Platform - Information Architecture & User Flows

This document outlines the finalized Information Architecture (IA) and key user flows for the online learning platform targeting adult professionals.

## Information Architecture

### High-Level Sitemap

```
/ (Homepage)
/courses
    /search?q=...&filter=...&sort=... (Course Catalog/Search Results w/ Filters & Sorting)
    /{category-slug} (Category Browse Page w/ Filters & Sorting)
    /{course-slug} (Course Detail Page)
        /enroll (Start of Enrollment Flow)
/dashboard
    /my-courses (List of enrolled courses)
    /my-courses/{enrollment-id}/ (Course Consumption View - Entry Point)
        /lesson/{lesson-slug} (Specific Lesson View w/ Content & Lesson Q&A)
        /forum (Course-Wide Discussion Forum)
        /progress (Detailed Course Progress View - Optional)
    /profile
    /settings
        /notifications (Notification Preferences)
    /billing (Optional, depending on model)
/about
/contact
/help
/legal/terms
/legal/privacy
```

### Navigation Concepts

*   **Primary Header:** Logo, Course Catalog link, Search, Login/Signup (or User Menu/Dashboard link). Potential in-app notification indicator.
*   **Footer:** Standard informational links (About, Contact, Help, Legal, etc.).
*   **Contextual Navigation:**
    *   Course Catalog/Search: Sidebar for Filters, Top controls for Sorting.
    *   Dashboard: Sidebar or tabs for My Courses, Profile, Settings, etc.
    *   Course Consumption: Persistent sidebar/panel for lesson/module navigation, link/tab to Course Forum.
*   **Breadcrumbs:** Implemented for hierarchical context.

### Filtering & Sorting Options (Course Discovery)

**Filters:**

*   **Topic / Subject / Category:** Hierarchical selection.
*   **Skill Level:** Beginner, Intermediate, Advanced, (Possibly) All Levels.
*   **Duration:** Specific ranges (e.g., Under 2 hours, 2-5 hours, 5-10 hours, 10+ hours).
*   **Specific Skills / Tools Taught:** Multi-select options for concrete skills or software/tools.
*   **Language:** Filter by teaching language.
*   **Features / Course Type:** Certificate available, Includes Assessments, Includes Projects, Downloadable Resources, (Potentially) Live Sessions.
*   **User Rating:** Filter by average rating (e.g., 4.5 stars & up, 4.0 stars & up).
*   **Price:** Free, Paid (with potential range slider/brackets).
*   **Instructor (Optional):** Filter by specific instructors.
*   **Status (Optional):** New, Most Popular / Trending.

**Sorting Options:**

*   Relevance (Default for search)
*   Most Popular / Trending
*   Highest Rated
*   Newest
*   (Optional) Price (Ascending/Descending)

## Key User Flows

### Flow 1: Course Discovery & Finding

*   **Goal:** User finds a course relevant to their needs using enhanced filtering and sorting.
*   **Steps:**
    1.  Start on Homepage/Catalog.
    2.  Browse Categories/Subjects OR Use Search Bar.
    3.  Apply Filters (selecting from detailed options).
    4.  Optionally Apply Sorting (Relevance, Popularity, Rating, Newest).
    5.  Review Refined & Sorted Course List.
    6.  Click on a Course Card to navigate to the Course Detail Page.
*   **Mermaid Diagram:**
    ```mermaid
    flowchart TD
        A[Start: Homepage/Catalog] --> B{Browse or Search?};
        B -- Browse --> C[Select Category/Subject];
        B -- Search --> D[Enter Keywords in Search Bar];
        C --> E[View Category Page];
        D --> F[View Search Results Page];
        E --> G[Apply Filters];
        F --> G;
        G --> H[Select Filters (Topic, Level, Duration, Skills, Tools, Price, Rating, etc.)];
        H --> I{Apply Sorting?};
        I -- Yes --> J[Select Sort Order (Relevance, Rating, Newest, etc.)];
        I -- No --> K[Review Refined Course List];
        J --> K;
        K --> L[Click Course Card];
        L --> M[End: View Course Detail Page];
    ```

### Flow 2: Course Evaluation

*   **Goal:** User decides if a specific course meets their needs.
*   **Steps:**
    1.  Start on Course Detail Page.
    2.  Review Overview/Description.
    3.  Check Syllabus/Curriculum.
    4.  View Instructor Bio.
    5.  Read Testimonials/Reviews.
    6.  Check Pricing/Enrollment Options.
    7.  Decide whether to proceed to enrollment or continue browsing.
*   **Mermaid Diagram:**
    ```mermaid
    flowchart TD
        A[Start: Course Detail Page] --> B[Review Overview/Description];
        B --> C[Check Syllabus/Curriculum];
        C --> D[View Instructor Bio];
        D --> E[Read Testimonials/Reviews];
        E --> F[Check Pricing/Enrollment Options];
        F --> G{Ready to Enroll?};
        G -- Yes --> H[End: Proceed to Enrollment Flow];
        G -- No --> I[End: Continue Browsing / Leave];
    ```

### Flow 3: Course Enrollment

*   **Goal:** User successfully enrolls in a course.
*   **Steps:**
    1.  Start from Course Detail Page (Click Enroll/Buy Now).
    2.  Login or Create Account if not already authenticated.
    3.  Confirm user details.
    4.  Enter Payment Information (if applicable for paid courses).
    5.  Confirm free enrollment or complete payment.
    6.  Review and Confirm the enrollment details.
    7.  View Confirmation/Receipt.
    8.  Redirected to Student Dashboard or the newly enrolled course.
*   **Mermaid Diagram:**
    ```mermaid
    flowchart TD
        A[Start: Click Enroll on Course Page] --> B{Logged In?};
        B -- Yes --> D[Confirm User Details];
        B -- No --> C[Login / Create Account];
        C --> D;
        D --> E{Paid Course?};
        E -- Yes --> F[Enter Payment Information];
        E -- No --> G[Confirm Free Enrollment];
        F --> G;
        G --> H[Review & Confirm Enrollment];
        H --> I[View Confirmation/Receipt];
        I --> J[End: Redirect to Dashboard/Course];
    ```

### Flow 4: Accessing & Navigating Enrolled Course

*   **Goal:** User accesses course content, navigates lessons, participates in lesson-specific Q&A, and accesses the course-wide forum.
*   **Steps:**
    1.  Start on Student Dashboard (`/dashboard`).
    2.  Select "My Courses".
    3.  Click on an Enrolled Course.
    4.  Land on Course Home/Overview or last viewed lesson.
    5.  Navigate within the course using lesson navigation (sidebar) or select the 'Course Forum' tab/link.
    6.  **If Lesson Selected:** View Lesson Content, access Lesson-specific Q&A, interact/complete content, mark complete, navigate next/previous.
    7.  **If Course Forum Selected:** View forum threads, read, reply, start new topics, navigate back to lesson content.
*   **Mermaid Diagram:**
    ```mermaid
    flowchart TD
        A[Start: Student Dashboard] --> B[Select 'My Courses'];
        B --> C[Click Enrolled Course];
        C --> D[View Course Home/Overview/Last Lesson];
        D --> E{Select Lesson or Forum?};
        E -- Lesson --> F[Navigate via Sidebar/Nav];
        F --> G[Select Specific Lesson];
        G --> H[View Lesson Content];
        H --> H1{Access Lesson Q&A?};
        H1 -- Yes --> H2[View/Interact with Lesson Q&A];
        H2 --> H3[Return to Lesson Content View];
        H1 -- No --> H3;
        H3 --> I{Interact/Complete Lesson Content};
        I -- Mark Complete --> J[Progress Updated];
        J --> K{Navigate Next/Previous Lesson?};
        K -- Yes --> F;
        K -- No --> L[Return to Course Navigation/Exit];
        E -- Forum --> M[Access Course-Wide Forum (`.../forum`)];
        M --> N{View/Interact with Forum Threads};
        N --> L; // Return to main course navigation options or exit
    ```

### Flow 5: Viewing Dashboard & Progress

*   **Goal:** User reviews their overall progress and enrolled courses.
*   **Steps:**
    1.  Login.
    2.  Access Student Dashboard (`/dashboard`).
    3.  View "My Courses" List (with progress indicators).
    4.  View Overall Progress Summary (if available).
    5.  Navigate to Profile/Settings or a specific course if needed.
*   **Mermaid Diagram:**
    ```mermaid
    flowchart TD
        A[Start: Login] --> B[Access Student Dashboard];
        B --> C[View 'My Courses' List];
        C --> D[Observe Progress Indicators per Course];
        B --> E[View Overall Progress Summary (Optional Widget)];
        B --> F{Navigate Elsewhere?};
        F -- Profile/Settings --> G[Go to Profile/Settings Page];
        F -- Specific Course --> H[Go to Course View];
        F -- No --> I[End: Remain on Dashboard];
        G --> I;
        H --> I;
    ```

## Accessibility & Responsiveness Considerations

Navigation will be keyboard-navigable, use appropriate ARIA landmarks/roles, and follow logical heading structures. Layouts and navigation patterns (e.g., header menu, sidebars) will adapt responsively for desktop, tablet, and mobile screen sizes.

## Notification Handling

User preferences for notifications (e.g., for Q&A/forum replies) will be managed within the User Settings section (`/dashboard/settings/notifications`). In-app notifications may be displayed via a global header element.