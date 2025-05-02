# Courses Feature - Analysis & Design Document

## 1. Introduction

This document outlines the analysis of the existing system and the proposed design for the new 'Courses' feature, based on the provided requirements and exploration of the codebase (`docs/`, `src/collections/`, `src/globals/`, `src/services/`).

## 2. Analysis Summary & Identified Gaps/Conflicts

The existing system provides a strong foundation with Payload CMS, including user authentication, content blocks, media management, basic e-commerce (Products, Orders), notifications, and some course-related collections (`Courses`, `Modules`, `Lessons`, `CourseEnrollments`, `LessonProgress`, `Certificates`). However, several gaps and potential conflicts exist regarding the full implementation of the 'Courses' feature:

1.  **Module Content Strategy:** `Modules` collection has a `layout` (blocks) field, while `Lessons` use `richText`/`videoUrl`. Mockups suggest modules are primarily organizational. **Conflict:** Should modules have their own content via blocks, or just be containers for lessons?
2.  **Lesson Content Flexibility:** Using only `richText` and `videoUrl` in `Lessons` is less flexible than the block-based approach used elsewhere (`Pages`, `Courses`, `Modules`). Mockups imply richer lesson layouts (e.g., video + transcript tabs). **Gap:** Limited lesson content presentation.
3.  **Quiz/Assignment Content:** `Lessons` can be typed as 'quiz' or 'assignment', but lack fields to define questions, answers, grading logic, or submission details. **Major Gap:** Core assessment functionality missing.
4.  **Prerequisites:** No mechanism exists in `Lessons` or `Modules` to define prerequisites (e.g., Lesson 1 must be completed before Lesson 2). **Gap:** Required feature missing.
5.  **Completion Criteria:** Lesson completion is currently just "viewed" (`lessonProgressService`). Course completion is solely based on 100% lesson completion (`enrollmentService`). **Gap:** No support for criteria like passing a quiz or submitting an assignment.
6.  **Course Reviews:** The existing `Reviews` collection is for project testimonials, not course reviews by users. **Gap:** Course review functionality missing.
7.  **Course Favorites:** The existing `UserFavorites` collection is for `products`, not `courses`. **Gap:** Course favoriting functionality missing.
8.  **Payment -> Enrollment Trigger:** `payment.service.ts` does not automatically create a `CourseEnrollments` record upon successful payment for a course-linked product. **Major Gap:** Automatic access grant for paid courses missing.
9.  **Notification Gaps:**
    *   `Notifications` collection `type` field needs more course-specific options (enrollment, module completion, etc.).
    *   `NotificationSettings` global needs corresponding templates for new course notification types. **Gap:** Incomplete notification coverage for course events.
10. **Achievement Definition:** `UserAchievements` links to an `achievements` collection, but the definition of this collection is missing. **Gap:** Achievement criteria and details are undefined.
11. **Service Stubs:** Several provider-specific methods in `payment.service.ts` are not implemented (though less critical for this design phase).

## 3. Proposed Solutions & Design Decisions

1.  **Module Content:** Redefine `Modules` to be primarily organizational containers. **Remove** the `layout` field from the `Modules` collection config (`src/collections/Modules/config.ts`). Any introductory content can be the first lesson within the module.
2.  **Lesson Content:** **Replace** the `content` (richText) and `videoUrl` fields in the `Lessons` collection (`src/collections/Lessons/config.ts`) with a `layout` field of type `blocks`. This allows using flexible blocks (Video, Text, Code, Quiz Block, Assignment Block, etc.) for lesson content, consistent with `Pages` and `Courses`.
3.  **Quiz/Assignment Content:**
    *   Create a new collection: `Assessments`. Fields: `type` (quiz, assignment), `title`, `description`, `lesson` (relationship), `questions` (array for quizzes: question text, type [multiple choice, single choice, text], options, correct answer), `passingScore` (%), `submissionInstructions` (for assignments), `maxAttempts`.
    *   Add a relationship field `assessment` to the `Lessons` collection, linking to `Assessments` (conditional based on lesson `type`).
    *   Create a new collection: `AssessmentSubmissions`. Fields: `assessment` (relationship), `user` (relationship), `enrollment` (relationship), `submittedAt`, `status` (submitted, grading, graded), `score` (%), `answers` (JSON for quiz answers), `files` (array of uploads for assignments), `feedback` (text).
4.  **Prerequisites:**
    *   Add an optional `prerequisites` field (relationship, `hasMany: true`) to the `Lessons` collection, linking to other `Lessons`.
    *   Add an optional `prerequisites` field (relationship, `hasMany: true`) to the `Modules` collection, linking to other `Modules`.
    *   Services (`lessonProgressService`, UI) will need logic to check these prerequisites before allowing access.
5.  **Completion Criteria:**
    *   Add a `completionCriteria` field (select) to the `Lessons` collection. Options: `viewed` (default), `pass_assessment`.
    *   Modify `lessonProgressService.markLessonAsViewed` to `markLessonCompleted`. It should check `completionCriteria`. If 'viewed', mark complete immediately. If 'pass_assessment', mark complete only when a related `AssessmentSubmissions` record meets the `passingScore`.
    *   Modify `enrollmentService.updateCourseProgress` to potentially include logic for a final course assessment if required, beyond just 100% lesson completion. (Consider adding a `finalAssessment` relationship field to `Courses`).
6.  **Course Reviews:** Create a new collection: `CourseReviews`. Fields: `user` (relationship), `course` (relationship), `enrollment` (relationship), `rating` (number 1-5), `reviewText` (textarea), `createdAt`, `updatedAt`, `status` (pending, approved, rejected).
7.  **Course Favorites:** Create a new collection: `UserFavoriteCourses`. Fields: `user` (relationship, unique), `courses` (relationship to `Courses`, `hasMany: true`), `createdAt`, `updatedAt`. (Mirroring `UserFavorites` structure).
8.  **Payment -> Enrollment Trigger:** Modify `payment.service.ts` (`updateOrderStatus` method). When an order status becomes 'paid', iterate through `order.items`. If an item's linked `product` corresponds to a `course` (check via a lookup or potentially add a direct `course` relationship to `products`), call `enrollmentService.enrollUserInCourse` with the relevant `userId`, `courseId`, `orderId`, and calculated `expiresAt` (based on `course.accessDuration`).
9.  **Notification Enhancements:**
    *   Add new types (`course_enrolled`, `lesson_completed`, `module_completed`, etc.) to the `type` field options in `src/collections/Notifications/index.ts`.
    *   Add corresponding template configuration sections (subject, body for email/SMS/push) within `src/globals/NotificationSettings/config.ts`.
    *   Update `notification.service.ts` to use these new types and templates when triggered by relevant events (enrollment, lesson completion, etc.).
10. **Achievement Definition:** Create a new collection: `Achievements`. Fields: `title`, `description`, `icon` (upload), `type` (e.g., 'course_started', 'lesson_completed', 'course_completed', 'progress_milestone'), `criteria` (JSON or specific fields, e.g., `courseId`, `lessonCount`, `progressPercent`), `xpAwarded` (number). Modify `UserAchievements` to link to this. Implement `achievementService` logic to evaluate criteria against events.
11. **Service Stubs:** Implementation of payment provider specifics is outside this design scope but noted.

## 4. Defined Course Structure

*   **Course:** Top-level container. Contains metadata (title, author, difficulty, etc.) and the overall landing page layout (using blocks). Holds a sequence of Modules. Can have an optional final assessment.
*   **Module:** Organizational unit within a Course. Contains a title and holds a sequence of Lessons. Can have prerequisites (other modules).
*   **Lesson:** Smallest unit of learning content within a Module. Contains content (using blocks: video, text, quiz, assignment, etc.), metadata (duration, order), optional prerequisites (other lessons), and specific completion criteria (`viewed` or `pass_assessment`).
*   **Assessment:** Linked from a Lesson (if type is quiz/assignment). Defines questions, passing score, instructions, etc.
*   **Content Types (within Lesson Blocks):** Video (hosted URL or Media relationship), Rich Text, Code Snippets, Image Galleries, Downloads (Media relationship), Embedded Quiz (linking to Assessment), Assignment Submission (linking to Assessment).

## 5. Data Models (Conceptual Schema)

*(Based on existing collections + proposed changes/additions)*

*   **`courses` (Existing, Modified):**
    *   `title` (text, localized)
    *   `slug` (text)
    *   `status` (select: draft, published, archived)
    *   `author` (relationship -> users)
    *   `featuredImage` (relationship -> media)
    *   `excerpt` (textarea, localized)
    *   `difficulty` (select: beginner, intermediate, advanced)
    *   `estimatedDuration` (text)
    *   `tags` (relationship -> tags, hasMany)
    *   `layout` (blocks, localized) - *For landing page*
    *   `product` (relationship -> products) - *For paid access*
    *   `accessType` (select: paid, free, subscription)
    *   `accessDuration` (group: type [unlimited, limited], duration, unit)
    *   `finalAssessment` (relationship -> assessments) - **NEW (Optional)**
    *   `modules` (relationship -> modules, hasMany) - **Implicit relationship via Module.course** (Or add explicit array field if needed for ordering)
    *   `createdAt`, `updatedAt`

*   **`modules` (Existing, Modified):**
    *   `title` (text, localized)
    *   `slug` (text) - *Consider making unique within course*
    *   `status` (select: draft, published)
    *   `course` (relationship -> courses)
    *   `order` (number) - **NEW** (For sequencing within course)
    *   `prerequisites` (relationship -> modules, hasMany) - **NEW (Optional)**
    *   `lessons` (relationship -> lessons, hasMany) - **Implicit relationship via Lesson.module** (Or add explicit array field if needed for ordering)
    *   `createdAt`, `updatedAt`
    *   ~~`layout` (blocks)~~ - **REMOVED**

*   **`lessons` (Existing, Modified):**
    *   `title` (text, localized)
    *   `slug` (text) - *Consider making unique within module*
    *   `status` (select: draft, published)
    *   `module` (relationship -> modules)
    *   `description` (textarea, localized)
    *   `layout` (blocks, localized) - **NEW (Replaces content/videoUrl)**
    *   `type` (select: video, text, quiz, assignment) - *Determines required blocks/assessment link*
    *   `duration` (text)
    *   `order` (number) - *For sequencing within module*
    *   `attachments` (array: title, file [upload -> media])
    *   `assessment` (relationship -> assessments) - **NEW (Conditional on type=quiz/assignment)**
    *   `prerequisites` (relationship -> lessons, hasMany) - **NEW (Optional)**
    *   `completionCriteria` (select: viewed, pass_assessment) - **NEW**
    *   `createdAt`, `updatedAt`
    *   ~~`content` (richText)~~ - **REMOVED**
    *   ~~`videoUrl` (text)~~ - **REMOVED**

*   **`assessments` (NEW):**
    *   `title` (text)
    *   `description` (textarea)
    *   `type` (select: quiz, assignment)
    *   `lesson` (relationship -> lessons) - *Link back for context*
    *   `questions` (array, conditional type=quiz): `questionText`, `questionType` (select: mcq, scq, text), `options` (array: text, isCorrect), `points` (number)
    *   `passingScore` (number, 0-100)
    *   `submissionInstructions` (richText, conditional type=assignment)
    *   `maxAttempts` (number, 0 for unlimited)
    *   `createdAt`, `updatedAt`

*   **`assessmentSubmissions` (NEW):**
    *   `assessment` (relationship -> assessments)
    *   `user` (relationship -> users)
    *   `enrollment` (relationship -> course-enrollments)
    *   `submittedAt` (date)
    *   `status` (select: submitted, grading, graded)
    *   `score` (number, 0-100)
    *   `answers` (json) - *Store user's quiz answers*
    *   `files` (array -> relationship -> media, conditional type=assignment)
    *   `feedback` (textarea)
    *   `attemptNumber` (number)
    *   `createdAt`, `updatedAt`

*   **`courseEnrollments` (Existing, Modified):**
    *   `user` (relationship -> users)
    *   `course` (relationship -> courses)
    *   `status` (select: active, completed, expired, revoked)
    *   `enrolledAt` (date)
    *   `expiresAt` (date)
    *   `completedAt` (date)
    *   `progress` (number, 0-100) - *Still useful for overall display*
    *   `lastAccessedAt` (date)
    *   `source` (select: purchase, admin, promotion, subscription)
    *   `orderId` (relationship -> orders)
    *   `notes` (textarea)
    *   `createdAt`, `updatedAt`

*   **`lessonProgress` (Existing, No changes needed for core structure):**
    *   `user` (relationship -> users)
    *   `lesson` (relationship -> lessons)
    *   `course` (relationship -> courses)
    *   `status` (select: in_progress, completed)
    *   `completedAt` (date)
    *   `lastAccessedAt` (date)
    *   `timeSpent` (number)
    *   `metadata` (json)
    *   `createdAt`, `updatedAt`

*   **`certificates` (Existing, No changes needed):**
    *   `certificateId` (text, unique)
    *   `user` (relationship -> users)
    *   `userName` (text)
    *   `course` (relationship -> courses)
    *   `courseTitle` (text)
    *   `completionDate` (date)
    *   `issueDate` (date)
    *   `instructor` (relationship -> users)
    *   `status` (select: active, revoked)
    *   `metadata` (json)
    *   `createdAt`, `updatedAt`

*   **`courseReviews` (NEW):**
    *   `user` (relationship -> users)
    *   `course` (relationship -> courses)
    *   `enrollment` (relationship -> course-enrollments) - *Ensures only enrolled users review*
    *   `rating` (number, 1-5)
    *   `reviewText` (textarea)
    *   `status` (select: pending, approved, rejected)
    *   `createdAt`, `updatedAt`

*   **`userFavoriteCourses` (NEW):**
    *   `user` (relationship -> users, unique)
    *   `courses` (relationship -> courses, hasMany)
    *   `createdAt`, `updatedAt`

*   **`achievements` (NEW):**
    *   `title` (text, localized)
    *   `description` (textarea, localized)
    *   `icon` (relationship -> media)
    *   `type` (select: course_started, lesson_completed, course_completed, progress_milestone, etc.)
    *   `criteria` (json or specific fields like `courseId`, `lessonCount`, `progressPercent`)
    *   `xpAwarded` (number)
    *   `createdAt`, `updatedAt`

*   **`userAchievements` (Existing, No changes needed):**
    *   `user` (relationship -> users)
    *   `achievement` (relationship -> achievements)
    *   `awardedAt` (date)
    *   `status` (select: active, revoked)
    *   `metadata` (json)
    *   `createdAt`, `updatedAt`

*   **`notifications` (Existing, Modified):**
    *   `title` (text)
    *   `message` (textarea)
    *   `user` (relationship -> users)
    *   `type` (select: ..., `course_enrolled`, `lesson_completed`, `module_completed`, ...) - **Add new types**
    *   `isRead` (checkbox)
    *   `link` (text)
    *   `metadata` (json) - *Define structure per type*
    *   `createdAt`, `updatedAt`

*   **`products` (Existing, Modified - Conceptual):**
    *   ... (existing fields)
    *   `linkedCourse` (relationship -> courses) - **NEW (Optional)** - *To easily link product purchase to course enrollment.*

## 6. Primary User Flows

*(Conceptual descriptions, Mermaid diagrams for key flows)*

1.  **Course Discovery & Browsing:**
    *   User navigates to `/courses` (Catalog Page).
    *   UI displays courses fetched from `courses` collection (filtered by `status: published`).
    *   User uses filters (based on `courses` fields like `tags`, `difficulty`, `accessType`) and sorting.
    *   User clicks a course card, navigating to `/courses/{course-slug}` (Landing Page).
    *   *(Mermaid Diagram)*
        ```mermaid
        sequenceDiagram
            participant User
            participant Browser
            participant Frontend
            participant Backend (Payload API)

            User->>Browser: Navigates to /courses
            Browser->>Frontend: Request Catalog Page
            Frontend->>Backend (Payload API): GET /api/courses?where[status][equals]=published&sort=popularity&limit=12
            Backend (Payload API)-->>Frontend: Returns list of Courses
            Frontend->>Browser: Renders Catalog Page (Grid, Filters)
            User->>Browser: Applies Filter (e.g., difficulty=beginner)
            Browser->>Frontend: Update Filter State
            Frontend->>Backend (Payload API): GET /api/courses?where[status][equals]=published&where[difficulty][equals]=beginner&sort=popularity&limit=12
            Backend (Payload API)-->>Frontend: Returns filtered list of Courses
            Frontend->>Browser: Updates Course Grid
            User->>Browser: Clicks Course Card
            Browser->>Frontend: Navigate to /courses/{slug}
        ```

2.  **Enrollment (Paid Course):**
    *   User on Course Landing Page (`/courses/{slug}`).
    *   User clicks "Enroll Now" / "Buy Course".
    *   Frontend identifies the linked `product` from the `courses` data.
    *   Frontend initiates checkout process (e.g., adds product to cart or directly calls backend).
    *   Backend creates an `orders` record (status: pending).
    *   User completes payment via selected provider (e.g., Stripe).
    *   Payment provider sends webhook to Backend (`/api/webhooks/payment`).
    *   `payment.service.ts` verifies webhook, processes data.
    *   `payment.service.ts` updates `orders` record (status: paid, paymentId, etc.).
    *   **Crucial Step:** `payment.service.ts` identifies the `linkedCourse` from the order item's product.
    *   `payment.service.ts` calls `enrollmentService.enrollUserInCourse` with `userId`, `courseId`, `orderId`, `source: 'purchase'`, `expiresAt`.
    *   `enrollmentService` creates `course-enrollments` record.
    *   `enrollmentService` triggers `notification.service.ts` (enrollment email/in-app).
    *   `enrollmentService` triggers `achievementService` (course started).
    *   User is redirected to a confirmation page or dashboard.
    *   *(Mermaid Diagram)*
        ```mermaid
         sequenceDiagram
            participant User
            participant Frontend
            participant Backend (Payload API)
            participant PaymentProvider
            participant PaymentService
            participant EnrollmentService
            participant NotificationService
            participant AchievementService

            User->>Frontend: Clicks "Enroll" on Course Page
            Frontend->>Backend (Payload API): Initiate Checkout (Product ID)
            Backend (Payload API)->>Backend (Payload API): Create Order (status: pending)
            Backend (Payload API)-->>Frontend: Redirect URL or Payment Intent
            User->>PaymentProvider: Completes Payment
            PaymentProvider->>Backend (Payload API): Payment Webhook
            Backend (Payload API)->>PaymentService: processWebhookData(webhook)
            PaymentService-->>Backend (Payload API): { orderId, status: 'paid', paymentId }
            Backend (Payload API)->>PaymentService: updateOrderStatus(orderId, { status: 'paid', ... })
            PaymentService->>Backend (Payload API): Update Order Collection (status: 'paid')
            PaymentService->>PaymentService: Identify linkedCourse from Order Items
            PaymentService->>EnrollmentService: enrollUserInCourse(userId, courseId, orderId, ...)
            EnrollmentService->>Backend (Payload API): Create CourseEnrollment
            EnrollmentService->>NotificationService: Send Enrollment Notification
            NotificationService-->>User: Email/In-App Notification
            EnrollmentService->>AchievementService: Track 'course.started'
            Backend (Payload API)-->>User: Redirect to Dashboard/Confirmation
        ```

3.  **Enrollment (Free Course):**
    *   User on Course Landing Page (`/courses/{slug}`).
    *   Course `accessType` is 'free'.
    *   User clicks "Start Learning" / "Enroll".
    *   Frontend calls Backend endpoint (e.g., `/api/courses/{courseId}/enroll-free`).
    *   Backend endpoint verifies user is logged in and course is free.
    *   Backend calls `enrollmentService.enrollUserInCourse` with `userId`, `courseId`, `source: 'free'`.
    *   `enrollmentService` creates `course-enrollments` record.
    *   `enrollmentService` triggers notifications/achievements.
    *   Frontend redirects user to the first lesson (`/dashboard/my-courses/{enrollmentId}/learn/{firstLessonId}`).

4.  **Content Consumption:**
    *   User navigates to the lesson view (e.g., `/dashboard/my-courses/{enrollmentId}/learn/{lessonId}`).
    *   Frontend checks access via `enrollmentService.hasAccessToCourse`.
    *   Frontend fetches `lessons` data (including `layout` blocks) and `lessonProgress` for the user/lesson.
    *   Frontend renders lesson content based on blocks (video player, text, quiz component, etc.).
    *   Frontend renders sidebar navigation showing modules/lessons, highlighting current lesson, marking completed lessons (based on `lessonProgress` status).
    *   User interacts with content (watches video, reads text).
    *   If `lesson.completionCriteria` is 'viewed', Frontend shows "Mark Complete" button.
    *   User clicks "Mark Complete".
    *   Frontend calls Backend endpoint (e.g., `/api/lessons/{lessonId}/complete`).
    *   Backend calls `lessonProgressService.markLessonCompleted`.
    *   `lessonProgressService` updates/creates `lesson-progress` record (status: completed).
    *   `lessonProgressService` triggers `achievementService`.
    *   `lessonProgressService` calls `enrollmentService.updateCourseProgress`.
    *   `enrollmentService` updates `course-enrollments.progress` and checks for 100% completion (triggers certificate/notifications if needed).
    *   Frontend updates UI (checkmark in sidebar, enables "Next Lesson").

5.  **Progress Tracking:**
    *   Individual lesson completion tracked in `lesson-progress` collection (status: completed). Triggered by user action ('Mark Complete') or assessment completion.
    *   Overall course progress percentage stored in `course-enrollments.progress`. Calculated and updated by `lessonProgressService.updateCourseProgress` whenever a `lesson-progress` record is marked 'completed'.
    *   UI (Dashboard, Lesson Sidebar Header) fetches and displays progress from `course-enrollments` and `lesson-progress`.

6.  **Assessment Submission & Evaluation (Quiz Example):**
    *   User is on a lesson view with a Quiz block (`lesson.type` is 'quiz', `lesson.assessment` relationship exists).
    *   Frontend fetches `assessments` data for the linked assessment.
    *   Frontend renders quiz questions.
    *   User answers questions and clicks "Submit Quiz".
    *   Frontend sends answers to Backend endpoint (e.g., `/api/assessments/{assessmentId}/submit`).
    *   Backend creates `assessmentSubmissions` record (status: submitted).
    *   Backend evaluates answers against `assessments.questions`, calculates `score`.
    *   Backend updates `assessmentSubmissions` (status: graded, score).
    *   Backend checks if `score >= assessments.passingScore`.
    *   If passed AND `lesson.completionCriteria` is 'pass_assessment', Backend calls `lessonProgressService.markLessonCompleted`.
    *   `lessonProgressService` proceeds as in Flow 4.
    *   Backend returns submission result (score, passed/failed) to Frontend.
    *   Frontend displays result to user.

7.  **Course Completion & Certification:**
    *   Triggered when `enrollmentService.updateCourseProgress` detects progress >= 100% (and potentially checks `course.finalAssessment` status if implemented).
    *   `enrollmentService` updates `course-enrollments` status to 'completed', sets `completedAt`.
    *   `enrollmentService` calls `enrollmentService.generateCertificate`.
    *   `generateCertificate` creates `certificates` record.
    *   `enrollmentService` triggers `achievementService` (course completed, certificate earned).
    *   `enrollmentService` triggers `notification.service.ts` (completion email, certificate email).
    *   User sees "Completed" status on Dashboard.
    *   User can view/download certificate from Dashboard or via link in email/notification.

## 7. Navigation Design

*   **Global Header:** Add "Courses" link to primary navigation (linking to `/courses`). If user is logged in, the User Menu dropdown should include "My Dashboard" (linking to `/dashboard`).
*   **Student Dashboard (`/dashboard`):** This becomes the central hub for enrolled users. It should prominently display "My Courses" (linking to the consumption view), potentially "My Certificates", and "My Achievements".
*   **Course Catalog (`/courses`):** Main discovery page.
*   **Course Landing Page (`/courses/{slug}`):** Details for a specific course.
*   **Lesson View (`/dashboard/my-courses/{enrollmentId}/learn/{lessonId}`):** The core learning interface. Includes sidebar navigation for modules/lessons within the current course.

## 8. Conclusion

This design addresses the core requirements for the 'Courses' feature by leveraging existing Payload structures while proposing necessary modifications and new collections/services to fill the identified gaps. Key changes include standardizing lesson content with blocks, introducing dedicated collections for assessments, reviews, and favorites, defining clear enrollment triggers from payments, and enhancing notification/achievement systems. This provides a robust and scalable architecture for the learning management functionality.