# Conceptual Layout: Course Discovery / Catalog Page

This document outlines the conceptual layout for the Course Discovery/Catalog page (`/courses`, `/courses/search`, `/courses/{category-slug}`), applying principles from the Information Architecture (`docs/information-architecture.md`) and the Style Guide (`docs/style-guide.md`).

## 1. Overall Layout & Responsiveness

The page follows a standard three-part structure: Header, Main Content Area, and Footer.

*   **Header:** Persistent across the site, containing global navigation and actions. (See Section 2)
*   **Main Content Area:** Contains the core discovery features: Filters, Sorting, Course Grid/List, and Pagination. This area adapts significantly for different screen sizes.
*   **Footer:** Persistent across the site, containing informational links. (Defined in IA/Style Guide)

**Responsiveness:**

*   **Desktop (Large Screens):**
    *   Filters displayed in a dedicated left sidebar.
    *   Main content area shows Sorting controls above the Course Grid.
    *   Course Grid uses 3-4 columns.
*   **Tablet (Medium Screens):**
    *   Filters might be initially hidden behind a toggle button ("Filters") or collapsed in the sidebar, expandable on click.
    *   Course Grid uses 2-3 columns.
*   **Mobile (Small Screens):**
    *   Filters accessible via a dedicated button, opening in a modal/drawer overlay.
    *   Sorting controls might be simplified or placed below the filter button.
    *   Course Grid uses 1 column.

## 2. Header

*   **Structure:** As defined in Style Guide (4.2. Navigation - Header).
*   **Components:**
    *   **Logo:** Top-left, links to Homepage (`/`).
    *   **Primary Navigation:** Links like "Courses" (active state styled with `Primary` color), potentially "Community", "About". Uses `Body` typography.
    *   **Search:** Prominent search input field (Style Guide 4.4. Text Input) or an icon button (Style Guide 4.1. Icon Button) expanding into a search field. Positioned centrally or right-aligned.
    *   **User Actions (Right-aligned):**
        *   Login/Signup Buttons (Style Guide 4.1. Primary/Secondary variations) if logged out.
        *   User Avatar/Dropdown Menu if logged in, linking to Dashboard (`/dashboard`), Profile (`/dashboard/profile`), Settings (`/dashboard/settings`), Logout.
        *   Optional: Notification Bell Icon (Style Guide 3. Iconography).
*   **Styling:** Uses `Neutral White` or `Neutral Lightest` background, adhering to color palette and typography defined in the Style Guide. May be `position: sticky`.

## 3. Filtering & Search

*   **Placement:**
    *   **Desktop:** Dedicated fixed/sticky left sidebar.
    *   **Tablet/Mobile:** Accessible via a "Filter" button (Style Guide 4.1. Secondary Button) near the top of the main content area, opening a modal or off-canvas drawer.
*   **Search Bar:**
    *   If not in the global header, a dedicated search bar (Style Guide 4.4. Text Input with search icon) can be placed prominently above the sorting controls or within the filter sidebar/modal. It updates the results dynamically or upon submission.
*   **Filter Components (within Sidebar/Modal):**
    *   **Structure:** Filters grouped by category (e.g., "Topic", "Skill Level", "Duration") using `H5` or `H6` headings. Clear "Apply Filters" and "Reset Filters" buttons (Style Guide 4.1. Primary/Tertiary).
    *   **Topic/Category:** Hierarchical list, potentially using nested Checkboxes (Style Guide 4.4. Checkbox) or links that navigate to specific category pages (`/courses/{category-slug}`).
    *   **Skill Level:** Radio Buttons (Style Guide 4.4. Radio Button) for single selection (Beginner, Intermediate, Advanced).
    *   **Duration:** Checkboxes or Radio Buttons for predefined ranges.
    *   **Specific Skills/Tools:** Multi-select Checkboxes.
    *   **Language:** Checkboxes or Select Dropdown (Style Guide 4.4. Select Dropdown).
    *   **Features:** Checkboxes (Certificate, Assessments, Projects).
    *   **User Rating:** Radio Buttons or clickable star icons representing minimum ratings (e.g., 4.5+, 4+).
    *   **Price:** Radio Buttons (Free, Paid) or Checkboxes. A range slider could be used for paid courses if needed.
    *   **Instructor:** Checkboxes or a searchable multi-select input.
*   **Styling:** Uses `Neutral Lightest` background for sidebar/modal. Form elements styled according to Style Guide 4.4.

## 4. Sorting

*   **Placement:** Above the Course Grid/List, typically right-aligned or spanning the width below the Filter button (on mobile).
*   **Component:** A Select Dropdown (Style Guide 4.4. Select Dropdown) labeled "Sort by:".
*   **Options:** As defined in IA (Relevance, Most Popular, Highest Rated, Newest, Price Asc/Desc). Default is 'Relevance' for search, 'Most Popular' for general catalog view.

## 5. Course Grid/List

*   **Layout:** Primarily a grid layout for visual browsing. A toggle for List view could be added if desired.
*   **Component:** Each course is represented by a 'Card' component (Style Guide 4.5. Cards).
*   **Card Structure:**
    *   **Image:** Course thumbnail/image at the top.
    *   **Title:** Course Title (`H4` typography).
    *   **Short Description:** 1-2 lines of text (`P` or `Small Text` typography).
    *   **Instructor:** Name (`Small Text`).
    *   **Rating:** Star rating display (e.g., icons + numerical average) (`Small Text`).
    *   **Price/Status:** Price or "Free" or "Enrolled" badge (`Small Text`, potentially using `Accent` or `Success` colors for emphasis).
*   **Responsiveness (Grid Columns):**
    *   **Desktop:** 3-4 columns.
    *   **Tablet:** 2-3 columns.
    *   **Mobile:** 1 column.
*   **Styling:** Cards use `Neutral Lightest` background, subtle borders/shadows as per Style Guide. Consistent padding and spacing between cards.

## 6. Pagination

*   **Placement:** Below the Course Grid/List, centered.
*   **Component:** Standard pagination controls.
    *   **Structure:** "Previous" button, numbered page links (current page highlighted using `Primary` color), "Next" button. Ellipses (...) used for numerous pages. Buttons styled using Style Guide 4.1 (Secondary or Tertiary variations).
*   **Behavior:** Updates the Course Grid/List with the corresponding set of courses without a full page reload (if using client-side fetching/routing).

## 7. Accessibility Considerations

*   **Keyboard Navigation:** All interactive elements (Header links, Search, Filters, Sorting, Course Cards, Pagination) must be focusable and operable via keyboard. Focus states clearly defined (Style Guide 4.1, 4.4).
*   **Filters:** Filter sidebar/modal must be navigable via keyboard. Checkboxes and Radio Buttons should have associated labels.
*   **Color Contrast:** Adhere to WCAG AA contrast ratios using the defined Color Palette (Style Guide 1). Text on backgrounds, button text, link colors should meet requirements.
*   **ARIA Landmarks:** Use appropriate HTML5 semantic elements (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`) and ARIA roles where necessary (e.g., `role="search"`, `role="region"` for filter section).
*   **Headings:** Logical heading structure (`H1` for page title, `H2`/`H3` for sections like Filters/Results) aids screen reader navigation.
*   **Images:** Course card images should have appropriate `alt` text.