# Student Dashboard Conceptual Layout (`/dashboard`)

This document outlines the conceptual layout and component structure for the Student Dashboard page, applying principles from the Information Architecture (`docs/information-architecture.md`) and the Style Guide (`docs/style-guide.md`).

## 1. Overall Structure

*   **Layout:** Standard three-part structure: Header, Main Content Area, Footer.
*   **Main Content:** A primary content column. A secondary sidebar for dashboard navigation *could* be used if complexity increases, but initially, focus on a single content flow. (Ref: IA 3.3 - Dashboard nav can be sidebar or tabs).
*   **Responsiveness:** The layout should adapt gracefully. On smaller screens, navigation might collapse, and grids might stack vertically.

## 2. Header

*   **Consistency:** Uses the standard authenticated header component defined in the Style Guide (4.2).
*   **Elements:**
    *   Logo (Left-aligned)
    *   Primary Navigation Links (e.g., "Courses", potentially others if applicable)
    *   Search Bar (Optional, depending on global search strategy)
    *   User Menu (Right-aligned):
        *   User Avatar/Initials
        *   Dropdown containing links to:
            *   **Profile (`/dashboard/profile`)**
            *   **Settings (`/dashboard/settings`)**
            *   Notifications (`/dashboard/settings/notifications`)
            *   Billing (Optional)
            *   Logout

## 3. Main Content Area

This area contains the core dashboard widgets and information.

### 3.1. Welcome/Overview Section

*   **Placement:** Top of the main content area.
*   **Content:**
    *   **Greeting:** H2 Heading - "Welcome back, [User Name]!" (Typography: H2 Style)
    *   **Quick Stats:** A small horizontal list or set of blocks displaying key metrics. (Typography: Small Text/Paragraph for labels, potentially H5/H6 for numbers).
        *   Example Stats:
            *   "Courses in Progress: **3**"
            *   "Completed Courses: **5**"
            *   "Certificates Earned: **2**"
*   **Styling:** Clean separation, perhaps a subtle background or divider.

### 3.2. Enrolled Courses Section ("My Courses")

*   **Placement:** Prominently below the Welcome section.
*   **Title:** H3 Heading - "My Courses" (Typography: H3 Style)
*   **Filtering/Sorting Controls:**
    *   **Placement:** Above the course list/grid.
    *   **Components:** Use standard Form Elements (Style Guide 4.4).
        *   **Filter Tabs/Buttons:** "All", "In Progress", "Completed" (Use Button Group or Tab styling).
        *   **Sort Dropdown (Optional):** "Sort by:" (Label) + Select Dropdown with options like "Recently Accessed", "Progress (Low to High)", "Progress (High to Low)", "Title (A-Z)".
*   **Course List/Grid:**
    *   **Layout:** Display courses using the 'Card' component (Style Guide 4.5) arranged in a responsive grid (e.g., 2-3 columns on desktop, stacking on mobile).
    *   **Card Content (per course):**
        *   **Image:** Course thumbnail/banner at the top of the card.
        *   **Title:** Course Title (Typography: H4 Style). Link to the course consumption view (`/dashboard/my-courses/{enrollment-id}/`).
        *   **Progress Indicator:** Linear Progress Bar (Style Guide 4.3) below the title. Shows percentage complete (e.g., "65% Complete"). Use Accent or Primary color for the bar.
        *   **Call to Action (CTA):** Primary Button (Style Guide 4.1) at the bottom of the card.
            *   Text: "Continue Learning" (if in progress) or "View Course" (if completed or not started). Links to the appropriate lesson or course home.
*   **Styling:** Cards use `Neutral Lightest` background, subtle border/shadow as per Style Guide 4.5. Consistent padding within cards.

### 3.3. Achievements/Certificates Section (Optional but Recommended)

*   **Placement:** Below or alongside the "My Courses" section, depending on visual hierarchy preference.
*   **Title:** H3 Heading - "My Achievements" or "Certificates" (Typography: H3 Style)
*   **Layout Options:**
    *   **Option A (Grid of Badges):** Display earned badges/icons in a grid. Each item could be an icon with a tooltip or small text label below.
    *   **Option B (List of Certificates):** A list format. Each item includes:
        *   Certificate Title (e.g., "Certificate of Completion: Advanced JavaScript") (Typography: Paragraph or H5)
        *   Date Earned (Typography: Small Text)
        *   Download Link: Styled link with a download icon (Style Guide 4.10) - "Download PDF".
*   **Styling:** Clear visual separation from other sections.

### 3.4. Recommended Courses Section (Optional)

*   **Placement:** Typically towards the bottom of the dashboard.
*   **Title:** H3 Heading - "Recommended For You" (Typography: H3 Style)
*   **Layout:** Horizontal scrolling container or a smaller grid of Course Cards (potentially a simplified version of the main course card).
*   **Card Content (per recommendation):**
    *   Course Image
    *   Course Title (H4/H5)
    *   (Optional) Reason: "Based on your interest in [Topic]" (Small Text)
    *   CTA: Secondary or Tertiary Button (Style Guide 4.1) - "View Course". Links to the Course Landing Page (`/courses/{course-slug}`).
*   **Styling:** Differentiate visually from the "My Courses" section if using cards (e.g., slightly different background or less emphasis).

## 4. Footer

*   **Consistency:** Uses the standard site footer.
*   **Elements:** Standard informational links (About, Contact, Help, Legal Terms/Privacy, etc.) as defined in the IA (3.2).

## 5. Accessibility Considerations

*   **Semantic HTML:** Use appropriate tags (`<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, headings `<h1>`-`<h6>`).
*   **Headings:** Maintain logical heading order (H1 for page title - implicitly handled by framework, H2/H3 for sections).
*   **Keyboard Navigation:** All interactive elements (links, buttons, form controls, course cards) must be keyboard focusable and operable. Focus states should be clearly visible (Style Guide 4.1 - Buttons, 4.4 - Forms).
*   **ARIA:** Use appropriate ARIA roles and attributes where necessary (e.g., `aria-label` for icon buttons, `aria-valuenow` for progress bars).
*   **Images:** Provide `alt` text for images (course thumbnails, icons).
*   **Color Contrast:** Ensure text and UI elements meet WCAG AA contrast ratios using the defined palette.