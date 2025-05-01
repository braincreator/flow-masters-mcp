# Conceptual Layout: Course Landing Page (`/courses/{course-slug}`)

This document outlines the conceptual layout and component structure for the detailed Course Landing Page. It adheres to the principles defined in `docs/information-architecture.md` and `docs/style-guide.md`.

**Target Audience:** Prospective students evaluating a specific course.
**Goal:** Provide comprehensive information and encourage enrollment.

---

## 1. Overall Layout Structure

The page follows a standard web layout pattern, adapting responsively.

*   **Desktop/Tablet:**
    *   `[Global Header]`
    *   `[Breadcrumbs]`
    *   `[Hero Section]`
    *   `[Main Content Area (Left/Wider Column)]`
        *   `[Course Overview/Description]`
        *   `[What You'll Learn]`
        *   `[Syllabus/Curriculum]`
        *   `[Instructor Information]`
        *   `[Testimonials/Reviews]`
        *   `[FAQ]`
    *   `[Sticky Enrollment/Pricing Sidebar (Right/Narrower Column)]` - Becomes sticky on scroll past the Hero section.
    *   `[Global Footer]`
*   **Mobile:**
    *   `[Global Header]`
    *   `[Breadcrumbs]`
    *   `[Hero Section]`
    *   `[Enrollment/Pricing Section]` - Placed prominently after the Hero or integrated within it.
    *   `[Main Content Area (Single Column)]`
        *   `[Course Overview/Description]`
        *   `[What You'll Learn]`
        *   `[Syllabus/Curriculum]`
        *   `[Instructor Information]`
        *   `[Testimonials/Reviews]`
        *   `[FAQ]`
    *   `[Sticky Enrollment CTA (Optional)]` - A minimal sticky bar at the bottom with price/enroll button might appear on scroll.
    *   `[Global Footer]`

---

## 2. Header

*   **Component:** `Global Header` (Consistent across the site as defined in Style Guide 4.2).
*   **Content:** Logo, Primary Navigation Links (e.g., Courses, Dashboard), Search Icon, User Menu (Login/Signup or Avatar/Dropdown).
*   **Below Header:** `Breadcrumbs` Component (Style Guide 4.2)
    *   **Example:** `Home > Courses > [Course Category] > [Course Title]`
    *   **Styling:** Use `Small Text` typography, links for parent levels, current page as plain text.

---

## 3. Hero Section

*   **Goal:** Immediately capture attention, convey core value proposition, and provide a primary enrollment path.
*   **Layout:** Typically a full-width or large container at the top. Background might be a subtle gradient, image, or solid color (Neutral Lightest or a soft brand color).
*   **Components & Content:**
    *   **Course Title:** `H1` Typography. Clear and prominent.
    *   **Tagline:** `H3` or `P` (large). Short, compelling sentence summarizing the course benefit.
    *   **Key Highlights Bar/Row:**
        *   Uses `Small Text` or custom icons + text.
        *   Examples: `Icon:Clock` Duration (e.g., "10 Hours"), `Icon:Signal` Skill Level (e.g., "Intermediate"), `Icon:Certificate` Certificate Included, `Icon:Star` Avg Rating (e.g., "4.8 stars (250 reviews)").
    *   **Course Preview:**
        *   Large container for either:
            *   High-quality promotional image/thumbnail.
            *   Embedded Video Player (Style Guide 4.6) with a preview thumbnail and play button overlay.
    *   **Primary Call-to-Action (CTA):**
        *   `Button (Primary)` Component (Style Guide 4.1).
        *   **Text:** "Enroll Now", "Get Started", "Buy Course for $X".
        *   Placement: Prominently below the title/tagline or alongside the preview media.

---

## 4. Main Content Area

This area provides detailed information to help users evaluate the course. Uses `Neutral White` or `Neutral Lightest` background. Standard content width container.

### 4.1. Course Overview/Description

*   **Heading:** `H2` ("About This Course" or similar).
*   **Content:** Detailed description using `Paragraph (P)` text. May include bullet points for key features not covered in highlights. Focus on benefits and what problems the course solves.

### 4.2. What You'll Learn

*   **Heading:** `H2` ("What You'll Learn").
*   **Layout Options:**
    *   **Option A (Bullet Points):** Simple `ul` list with checkmark icons (`Icon:Check`). Each item is a clear learning outcome.
    *   **Option B (Cards):** Grid of `Card` Components (Style Guide 4.5). Each card contains an icon, a short title (`H4`), and a brief description (`Small Text` or `P`). Visually more engaging.
*   **Content:** Focus on specific skills, knowledge, or abilities students will gain.

### 4.3. Syllabus/Curriculum

*   **Heading:** `H2` ("Course Curriculum" or "Syllabus").
*   **Layout:** Expandable/Collapsible Sections (Accordion pattern).
    *   **Top Level:** Modules/Sections (e.g., `Module 1: Introduction`). Display module title and maybe total duration/lesson count. Use `H3` or `H4` for module titles.
    *   **Expanded View:** List of Lessons within the module (e.g., `Lesson 1.1: Welcome`, `Lesson 1.2: Core Concepts`). Use `P` or `Small Text`. Include lesson titles and potentially duration or type (Video, Reading, Quiz). Use appropriate icons (`Icon:PlayCircle`, `Icon:Description`, `Icon:Quiz`).
*   **Structure:** Use nested lists or dedicated accordion components. Ensure clear visual hierarchy.

### 4.4. Instructor Information

*   **Heading:** `H2` ("Meet Your Instructor").
*   **Layout:** Section, potentially using a `Card`-like structure or a two-column layout (Image left, Text right on desktop).
*   **Components & Content:**
    *   **Instructor Photo:** Circular or square avatar/image.
    *   **Instructor Name:** `H3` or `H4`.
    *   **Instructor Title/Credentials:** `Small Text` or `P` (e.g., "Lead Data Scientist at XYZ Corp").
    *   **Instructor Bio:** `Paragraph (P)`. Brief background, expertise, and teaching philosophy.
    *   **(Optional) Social Links:** Icons linking to LinkedIn, Twitter, etc.

### 4.5. Testimonials/Reviews

*   **Heading:** `H2` ("What Our Students Say").
*   **Layout Options:**
    *   **Option A (Blockquotes):** Simple list of blockquotes, each containing the quote (`P`), student name (`Small Text`, bold), and optional photo/avatar.
    *   **Option B (Cards):** Grid of `Card` Components (Style Guide 4.5). Each card shows rating (stars), quote (`P`), student name (`Small Text`), and avatar.
*   **Content:** Authentic student feedback. Include names and potentially avatars/photos for credibility.

### 4.6. FAQ (Frequently Asked Questions)

*   **Heading:** `H2` ("Frequently Asked Questions").
*   **Layout:** Accordion Component.
    *   **Structure:** List of questions (`H4` or `P` bold). Clicking a question expands to reveal the answer (`P`).
*   **Content:** Address common queries about prerequisites, access duration, support, refunds, etc.

---

## 5. Enrollment/Pricing Section

*   **Goal:** Clearly present pricing and provide easy access to enroll.
*   **Placement:**
    *   **Desktop/Tablet:** Sticky `Sidebar` (Style Guide - Conceptual: a narrow container that fixes to the viewport on scroll). Contains key info and CTA.
    *   **Mobile:** Dedicated section placed high on the page (e.g., below Hero) or integrated into the Hero. A minimal sticky footer CTA might also be used.
*   **Components & Content:**
    *   **Price Display:** Prominent display of the course price (`H3` or larger). Clearly indicate if it's a one-time purchase or subscription. Show discounted price if applicable.
    *   **(Optional) Pricing Tiers:** If multiple options exist (e.g., Basic, Premium), use `Cards` or distinct sections to compare features.
    *   **What's Included List:** Bullet points (`ul` with `Icon:Check`) listing key deliverables (e.g., "Lifetime Access", "Certificate of Completion", "Downloadable Resources", "Instructor Q&A").
    *   **Enrollment CTA:** `Button (Primary)` (Style Guide 4.1). Text: "Enroll Now", "Add to Cart", "Buy Now".
    *   **(Optional) Guarantee/Risk Reversal:** Text like "30-day money-back guarantee" (`Small Text`).
    *   **(Optional) Limited Time Offer:** Use `Accent Color` text or badges for urgency (e.g., "Sale ends in 2 days!").

---

## 6. Footer

*   **Component:** `Global Footer` (Consistent across the site).
*   **Content:** Copyright, links to About, Contact, Help, Terms, Privacy Policy, Social Media icons.

---

## 7. Accessibility Considerations (Conceptual)

*   **Headings:** Maintain logical order (H1 -> H2 -> H3...).
*   **Images:** Include descriptive `alt` text for preview images and instructor photos.
*   **Links:** Use descriptive text (e.g., "View Syllabus Section 1" instead of "Click Here").
*   **Forms/CTAs:** Ensure buttons and interactive elements have clear focus states (`Focus` state from Style Guide).
*   **Dynamic Content:** Use appropriate ARIA attributes for accordions (FAQ, Syllabus) to indicate expanded/collapsed states (`aria-expanded`, `aria-controls`).
*   **Color Contrast:** Adhere to WCAG AA contrast ratios defined implicitly by the chosen Style Guide palette.

---