# Notification Card Redesign Specification

**Overall Goal:** To create a notification card that is more informative, visually appealing, and easily scannable, focusing on a clear content hierarchy, intuitive icons, and a modern, clean visual style.

---

## 1. Content Hierarchy & Layout

The proposed layout aims for a clear visual flow, prioritizing information based on importance. We'll adopt a three-section approach within the card: **Indicator & Icon**, **Main Content**, and **Actions**.

```
+--------------------------------------------------------------------------------------+
| [Icon/Indicator Area]  [Notification Title - Bold, Larger Font]       [Timestamp]    |
|                        [Notification Type Tag]                                       |
|                        [Short Description - Regular Font, Muted Color]               |
|                                                                                      |
|                        [Expand for Full Text / View Details Link (if applicable)]    |
|                                                                                      |
| [Read/Unread Dot]                                     [Action Icons: Mark Read/Unread, Delete] |
+--------------------------------------------------------------------------------------+
```

**Detailed Breakdown:**

*   **A. Left Section (Indicator & Icon):**
    *   **Icon:** A prominent, intuitive icon representing the `NotificationType` (see Iconography section). This will be the primary visual cue.
    *   **(Optional) Read/Unread Vertical Bar:** A thin, colored vertical bar on the very left edge of the card could also indicate status (e.g., blue for unread, grey for read), complementing the dot indicator in the footer.

*   **B. Center/Main Content Section (Top-Aligned with Icon):**
    *   **Notification Title (`title`):**
        *   Placement: Top, next to the icon area.
        *   Style: Bold, slightly larger font size for emphasis.
    *   **Notification Type Tag (`type`):**
        *   Placement: Directly below or slightly to the right of the Title.
        *   Style: A small, colored tag/badge (e.g., `COURSE_ENROLLED` could be green, `SYSTEM_ALERT` could be red). This provides quick categorization.
    *   **Short Description (`shortText`):**
        *   Placement: Below the Title and Type Tag.
        *   Style: Regular font weight, slightly smaller than the title, possibly a muted text color to differentiate from the title.
    *   **Timestamp (`receivedAt`):**
        *   Placement: Top-right corner of the card, aligned with the Title.
        *   Style: Smaller font size, muted color, human-readable format (e.g., "2 hours ago", "May 15, 10:30 AM").

*   **C. Expandable/Link Section (Below Short Description, if applicable):**
    *   **"View Details" / "Show More":** If `fullText` or `link` exists.
        *   If `fullText` is available: A "Show More" / "Show Less" toggle (similar to current, but perhaps styled more subtly as a text link with an icon).
        *   If `link` is available: A clear "View Details" or "Go to [Context]" link, possibly with an external link icon. This could be combined with the "Show More" if both exist, or prioritized.

*   **D. Bottom Section (Actions & Status):**
    *   **Read/Unread Indicator Dot:**
        *   Placement: Bottom-left corner.
        *   Style: A small, solid colored dot (e.g., blue for unread, transparent or grey for read). This is a common and subtle pattern.
    *   **Available Actions:**
        *   Placement: Bottom-right corner.
        *   Style: Icon-only buttons with tooltips on hover for "Mark as Read/Unread" and "Delete". This keeps the interface clean.
            *   "Mark as Read/Unread": An eye icon / slashed-eye icon.
            *   "Delete": A trash can icon.
        *   Actions should be consistently placed and ordered.

---

## 2. Visual Style

The style should be modern, clean, and align with a potentially existing design system (e.g., Shadcn/UI, given the current components).

*   **Card:**
    *   **Shape:** Rounded corners (e.g., 6-8px radius).
    *   **Padding:** Sufficient internal padding (e.g., 16px) for breathing room.
    *   **Borders:** A subtle border (e.g., 1px solid, light grey). For unread items, the border color could be slightly more prominent or use an accent color (see Interactivity & States).
    *   **Shadows:** A soft, subtle box shadow on hover to give a sense of elevation and interactivity. Avoid heavy shadows in the default state to maintain a flat, clean look.
*   **Typography:**
    *   **Font Family:** A clean, sans-serif font (consistent with the application's overall typography).
    *   **Title:** Font size ~16px-18px, Semibold or Bold. Color: Dark grey/black.
    *   **Type Tag:** Font size ~10px-12px, Medium. Color: Varies by type (see Color Palette).
    *   **Short Description:** Font size ~14px, Regular. Color: Medium grey.
    *   **Timestamp:** Font size ~12px, Regular. Color: Light/Medium grey.
    *   **Action Text/Tooltips:** Font size ~12px-14px.
*   **Color Palette:**
    *   **Base:** Neutral background (white or very light grey).
    *   **Text:** Dark grey for primary text, medium grey for secondary, light grey for tertiary/timestamps.
    *   **Accent Colors:** Use sparingly for:
        *   Notification Type Tags (e.g., `COURSE_ENROLLED`: calming blue/green, `SYSTEM_ALERT`: warning orange/red, `NEW_MESSAGE`: communication blue).
        *   Read/Unread Indicators (e.g., a vibrant blue for unread).
        *   Icons (can inherit color from text or use accent colors).
    *   Avoid overly bright or numerous colors to prevent a cluttered look.
*   **Spacing and Alignment:**
    *   Consistent spacing between elements (e.g., multiples of 4px or 8px).
    *   Clear visual alignment of text and icons. Left-align most text content for readability.

---

## 3. Iconography

Icons are crucial for quick recognition.

*   **Primary Notification Type Icon:**
    *   Each `NotificationType` should map to a distinct, intuitive icon.
    *   Source: A consistent icon library (like `lucide-react` already in use, or FontAwesome, Material Icons, etc.).
    *   Examples:
        *   `COURSE_ENROLLED`: `BookOpen`, `GraduationCap`
        *   `SYSTEM_ALERT`: `AlertTriangle`, `ShieldAlert`
        *   `NEW_MESSAGE`: `MessageSquare`, `Mail`
        *   `ASSIGNMENT_DUE`: `CalendarClock`, `ClipboardCheck`
        *   `ACHIEVEMENT_UNLOCKED`: `Award`, `Star`
    *   These icons should be placed prominently in the [Icon/Indicator Area] on the left.
    *   The `icon` field from the API, if available and reliable, could be used. If it's just an emoji string like `emoji:🎉`, it might be better to standardize with a proper icon set and use the API `icon` as a fallback or supplemental detail if it can't be mapped. A mapping system is more robust.
*   **Action Icons:**
    *   Use simple, universally understood icons for actions:
        *   Mark as Read: `Eye`
        *   Mark as Unread: `EyeOff` (or toggle state of `Eye`)
        *   Delete: `Trash2`
        *   View Details/Link: `ExternalLink`
        *   Show More: `ChevronDown`
        *   Show Less: `ChevronUp`
    *   These should be smaller and less prominent than the primary notification type icon.

---

## 4. Interactivity & States

*   **Read vs. Unread State:**
    *   **Unread:**
        *   **Visual Cue 1 (Subtle):** A small, solid colored dot (e.g., accent blue) in the bottom-left.
        *   **Visual Cue 2 (Optional, more prominent):** A slightly different background color for the entire card (e.g., very light blue tint or a slightly darker shade of the default light grey) OR a colored left border (e.g., 2-3px accent blue border on the left edge).
        *   **Title Font Weight:** Could be slightly bolder for unread notifications.
    *   **Read:**
        *   Dot indicator becomes grey or transparent.
        *   Background/border returns to default.
        *   Title font weight normalizes if it was changed.
*   **Hover State (for the entire card):**
    *   Subtle lift: A slight increase in `box-shadow` and/or a very minimal upward translation (`y: -2px`).
    *   Action icons in the footer might become slightly more opaque or change color slightly to indicate interactivity.
*   **Action Access:**
    *   **Primary Actions (Mark Read/Unread, Delete):** Always visible as icon buttons in the bottom-right for quick access. Tooltips appear on hover to clarify the action.
    *   **Secondary Actions (Show More/Less, View Link):**
        *   "Show More/Less" for `fullText`: A text link (e.g., "Show more") with a chevron icon, placed below the `shortText`.
        *   "View Details" for `link`: A text link or a subtle button, also placed below `shortText`.
        *   If both `fullText` and `link` exist, "Show more" could expand to show `fullText`, and the `link` could be a separate "Learn more" link within the expanded content or alongside the "Show more" toggle.

---

## 5. Scannability

The proposed design enhances scannability through:

*   **Prominent Icons:** Type-specific icons allow users to quickly identify the nature of the notification without reading text.
*   **Clear Typography Hierarchy:** Differentiated font sizes and weights guide the eye from title to description.
*   **Color-Coded Type Tags:** Tags provide an additional visual cue for categorization at a glance.
*   **Consistent Layout:** Predictable placement of elements (icon, title, timestamp, actions) across all cards allows users to develop a quick scanning pattern.
*   **Subtle Read/Unread Indicators:** Easy to spot unread items without being visually distracting.
*   **Action Grouping:** Consolidating actions in the footer (or contextually for "Show More") makes them easy to find when needed.
*   **Ample Whitespace:** Prevents a cluttered look and helps separate individual notification items in a list.