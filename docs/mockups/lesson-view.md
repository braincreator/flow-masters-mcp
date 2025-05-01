# Conceptual Layout: Course Consumption / Lesson View Page

**File:** `docs/mockups/lesson-view.md`

**Purpose:** This document outlines the conceptual layout for the page where enrolled students consume course content (lessons). It adheres to the principles defined in `docs/information-architecture.md` and `docs/style-guide.md`.

---

## 1. Overall Layout

The Lesson View page uses a two-column layout on larger screens, transitioning to a single column with a collapsible navigation menu on smaller screens.

```
+-----------------------------------------------------+
| Header (Simplified)                                 |
+----------------------+------------------------------+
| Sidebar Navigation   | Main Content Area            |
| (Course Structure)   | (Lesson Content)             |
|                      |                              |
|                      |                              |
|                      |                              |
|                      |                              |
|                      |                              |
|                      |                              |
|                      |                              |
|                      | Footer (Minimal)             |
+----------------------+------------------------------+
```

*   **Responsive Behavior:** On mobile/tablet viewports, the Sidebar Navigation collapses into an off-canvas menu or a toggleable overlay, accessible via a menu icon in the header. The Main Content Area takes the full width.

---

## 2. Header

A simplified version of the main site header, focused on the learning context.

*   **Components:**
    *   `[Component: Logo]` (Link to dashboard or course catalog)
    *   `[Text: Course Title]` (Current course title, potentially truncated with tooltip)
    *   `[Component: Progress Indicator]` (Visual representation of overall course completion)
    *   `[Component: User Menu]` (Avatar, link to profile/settings, logout)
    *   (Optional) `[Icon: Menu]` (Visible on smaller screens to toggle Sidebar Navigation)

---

## 3. Sidebar Navigation

Provides context and navigation within the current course. Uses `[Component: Vertical Navigation List]` or similar from the style guide.

*   **Structure:**
    *   Course Title (non-interactive or link back to course landing page)
    *   List of Modules (Expandable/Collapsible sections using `[Component: Accordion]` or similar)
        *   Module Title
        *   List of Lessons within the module:
            *   `[Icon: Checkmark]` (or similar) + Lesson Title (for completed lessons)
            *   `[Indicator: Current]` + **Lesson Title** (for the currently viewed lesson, visually distinct - e.g., bold, background highlight)
            *   Lesson Title (for upcoming lessons)
*   **Interaction:**
    *   Clicking a lesson title navigates to that lesson's content in the Main Content Area.
    *   Modules can be expanded/collapsed to show/hide lessons.
    *   The sidebar should be scrollable if the course structure is long.
*   **Accessibility:** Keyboard navigable (Tab, Enter/Space to select/expand/collapse). `aria-current="page"` on the current lesson link.

---

## 4. Main Content Area

Displays the specific content for the selected lesson.

*   **Top Section:**
    *   `[Heading: Lesson Title]` (h1 or h2 for semantic structure)
    *   `[Component: Breadcrumbs]` (Optional, e.g., Course Title > Module Title > Lesson Title)

*   **Content Blocks (Order and presence depend on lesson type):**
    *   **Video:**
        *   `[Component: Video Player]` (Large, responsive player)
        *   Controls should follow accessibility best practices.
        *   `[Component: Tabs]` or `[Component: Accordion]` for related content like:
            *   Transcripts (Scrollable text)
            *   Resources (See below)
            *   Discussion (See below)
    *   **Text:**
        *   Formatted text content (`<p>`, `<ul>`, `<ol>`, `<blockquote>` styled according to `style-guide.md`).
        *   Embedded Images (`[Component: Image]` with captions, potentially lightbox functionality).
        *   Code Blocks (`[Component: Code Block]` with syntax highlighting and copy button).
    *   **Interactive Elements:**
        *   `[Component: Quiz]` (Embedded quiz interface)
        *   `[Component: Assignment Upload]` (Interface for assignment submission)
        *   Other custom interactive blocks.
    *   **Resource Downloads:**
        *   Clearly defined section (e.g., using a `[Component: Card]` or a styled list).
        *   Links styled using `[Style: Resource Link]` (e.g., `[Icon: Download]` + File Name + File Type/Size).
    *   **Discussion:**
        *   Option 1: `[Component: Button]` or Link styled as button (`[Style: Button Primary/Secondary]`) linking to a dedicated forum page (e.g., "Discuss this Lesson").
        *   Option 2: Embedded `[Component: Forum Thread]` or `[Component: Comment Section]` for inline discussion.

*   **Bottom Section (Lesson Navigation & Completion):**
    *   `[Component: Lesson Completion Control]`
        *   Checkbox or Button: "Mark as Complete" / "Mark as Incomplete". State visually reflected.
        *   Status Text: "Completed on [Date]" (if applicable).
    *   `[Component: Pagination/Navigation]`
        *   `[Button: Previous Lesson]` (Disabled if first lesson)
        *   `[Button: Next Lesson]` (Disabled if last lesson, or changes to "Finish Course")

*   **Accessibility:** Content structured semantically (headings, lists, etc.). Interactive elements keyboard accessible.

---

## 5. Progress Tracking & Navigation (Summary)

*   **Lesson Completion:** Explicit action (`[Component: Lesson Completion Control]`) in the Main Content Area. Status reflected in Sidebar Navigation (`[Icon: Checkmark]`).
*   **Sequential Navigation:** `[Button: Previous Lesson]` / `[Button: Next Lesson]` at the bottom of the Main Content Area.
*   **Overall Course Progress:** `[Component: Progress Indicator]` in the Header (and potentially duplicated in the Sidebar).

---

## 6. Accessibility Considerations (Conceptual)

*   **Keyboard Navigation:** All interactive elements (header menu, sidebar navigation, lesson content links/buttons, video player controls, completion button, next/prev buttons) must be focusable and operable via keyboard.
*   **Semantic Structure:** Use appropriate HTML5 elements (nav, main, aside, article, header, footer) and heading levels (h1, h2, h3...) to define page structure.
*   **ARIA Attributes:** Use `aria-current`, `aria-expanded`, `aria-controls`, etc., where appropriate, especially for sidebar navigation and interactive components.
*   **Visual Alternatives:** Provide text alternatives for icons (tooltips, `aria-label`) and transcripts/captions for videos.
*   **Color Contrast:** Adhere to WCAG contrast guidelines defined in `style-guide.md` for text, UI elements, and focus indicators.
*   **Focus Management:** Ensure logical focus order and manage focus appropriately when content changes or overlays (like a mobile menu) appear.

---