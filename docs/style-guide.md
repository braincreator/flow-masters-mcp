# Visual Design System: Style Guide & Component Foundation

This document outlines the core visual design principles and component definitions for the online learning platform. It serves as a foundation for creating consistent, professional, modern, and clean user interfaces.

## 1. Color Palette

The color palette is designed for clarity, accessibility, and a professional feel.

### 1.1. Primary Colors

*   **Primary (Blue):** `#0052CC` (e.g., `#0052CC`)
    *   **Use:** Main call-to-actions (buttons), active navigation elements, key interactive elements.
*   **Primary Dark:** `#003E99` (e.g., `#003E99`)
    *   **Use:** Hover/active states for primary elements.

### 1.2. Secondary Colors

*   **Secondary (Teal):** `#008DAA` (e.g., `#008DAA`)
    *   **Use:** Secondary actions, supporting information highlights, section dividers.
*   **Secondary Dark:** `#006C80` (e.g., `#006C80`)
    *   **Use:** Hover/active states for secondary elements.

### 1.3. Accent Color

*   **Accent (Orange):** `#FF8B00` (e.g., `#FF8B00`)
    *   **Use:** Highlighting important features, promotions, progress indicators (optional). Use sparingly.

### 1.4. Neutral Colors (Grays)

*   **Neutral Darkest:** `#172B4D` (e.g., `#172B4D`) - Body text, headings.
*   **Neutral Dark:** `#42526E` (e.g., `#42526E`) - Subheadings, secondary text.
*   **Neutral Medium:** `#6B778C` (e.g., `#6B778C`) - Tertiary text, disabled text, icons.
*   **Neutral Light:** `#DFE1E6` (e.g., `#DFE1E6`) - Borders, dividers.
*   **Neutral Lightest:** `#F4F5F7` (e.g., `#F4F5F7`) - Subtle backgrounds, card backgrounds.
*   **Neutral White:** `#FFFFFF` (e.g., `#FFFFFF`) - Main background, text on dark backgrounds.

### 1.5. Status Colors

*   **Success:** `#36B37E` (e.g., `#36B37E`) - Confirmation messages, successful operations.
*   **Error:** `#DE350B` (e.g., `#DE350B`) - Error messages, validation failures.
*   **Warning:** `#FFAB00` (e.g., `#FFAB00`) - Warnings, potentially problematic states.
*   **Info:** `#0052CC` (e.g., `#0052CC`) - Informational messages, tips (can use Primary).

## 2. Typography

Typography focuses on readability and clear hierarchy, using modern sans-serif fonts.

### 2.1. Font Families

*   **Headings:** 'Inter', sans-serif (or a similar modern, geometric sans-serif)
*   **Body:** 'Inter', sans-serif (or a similar highly readable sans-serif like 'Source Sans Pro')

### 2.2. Font Scale & Weights

| Element         | Font Size (px/rem) | Font Weight | Line Height | Notes                               |
| :-------------- | :----------------- | :---------- | :---------- | :---------------------------------- |
| H1              | 32 / 2rem          | 700 (Bold)  | 1.3         | Page titles                         |
| H2              | 28 / 1.75rem       | 700 (Bold)  | 1.3         | Section titles                      |
| H3              | 24 / 1.5rem        | 600 (Semi-Bold) | 1.4         | Sub-section titles                |
| H4              | 20 / 1.25rem       | 600 (Semi-Bold) | 1.4         | Card titles, minor headings       |
| H5              | 18 / 1.125rem      | 600 (Semi-Bold) | 1.5         |                                     |
| H6              | 16 / 1rem          | 600 (Semi-Bold) | 1.5         |                                     |
| Paragraph (P)   | 16 / 1rem          | 400 (Regular) | 1.6         | Default body text                   |
| Small Text      | 14 / 0.875rem      | 400 (Regular) | 1.5         | Captions, helper text, metadata   |
| Button Text     | 16 / 1rem          | 500 (Medium)  | 1 (or N/A)  | Consistent across button variants |
| Input/Label Text| 16 / 1rem          | 400 (Regular) | 1.5         | Form elements                       |

## 3. Iconography

*   **Style:** Line icons (consistent stroke width). Filled icons may be used for active/selected states where appropriate.
*   **Recommended Library:** Material Symbols (Outlined variant) or Phosphor Icons (Thin or Light variant). These offer comprehensive sets with a clean, modern aesthetic suitable for professional contexts. Ensure consistent sizing (e.g., 20px or 24px standard).

## 4. Core UI Components (Conceptual Definition)

Definitions focus on structure, variations, and states.

### 4.1. Buttons

*   **Structure:** Text label, optional leading/trailing icon. Consistent padding and minimum width.
*   **Variations:**
    *   **Primary:** Solid background (Primary color), white text.
    *   **Secondary:** Outline (Primary or Neutral Light border), text (Primary color).
    *   **Tertiary/Text:** No border or background, text (Primary color).
    *   **Icon Button:** Icon only, transparent background, often circular or square shape on hover.
*   **States:**
    *   **Default:** Standard appearance.
    *   **Hover:** Subtle background change (darken/lighten), slight scale/shadow effect.
    *   **Active/Pressed:** Darker background/border, inset effect.
    *   **Disabled:** Grayed-out appearance (Neutral Medium/Light), non-interactive cursor.
    *   **Focus:** Visible outline (e.g., using Primary color or standard focus ring).

### 4.2. Navigation

*   **Header:**
    *   **Structure:** Logo, primary navigation links (e.g., Courses, Dashboard, Community), user profile/actions (Search, Notifications, Avatar/Dropdown). Consider fixed or sticky behavior.
*   **Breadcrumbs:**
    *   **Structure:** Hierarchical links separated by dividers (e.g., '>'), showing user's location. Last item is current page (non-link).
*   **Sidebar Navigation (e.g., within a course):**
    *   **Structure:** Vertical list of links, potentially collapsible sections (modules/lessons). Active item highlighted.

### 4.3. Progress Indicators

*   **Linear Progress Bar:**
    *   **Structure:** Horizontal track, filled bar indicating progress percentage. Optional label.
    *   **Use:** Course completion, module progress, file uploads.
*   **Circular Progress Indicator:**
    *   **Structure:** Circular track, arc indicating progress. Optional percentage text inside.
    *   **Use:** Loading states, dashboard summaries.

### 4.4. Form Elements

*   **General States:** Default, Hover (subtle border change), Focus (highlighted border - Primary color), Disabled (grayed out), Error (Error color border, optional icon/message).
*   **Text Input:**
    *   **Structure:** Rectangular input field, placeholder text, optional label above or inline. Optional leading/trailing icon.
*   **Text Area:**
    *   **Structure:** Similar to Text Input but multi-line, resizable (optional).
*   **Select Dropdown:**
    *   **Structure:** Field displaying selected value, dropdown arrow icon. Opens a list of options on click.
*   **Checkbox:**
    *   **Structure:** Square box, checkmark icon when selected. Associated label text.
*   **Radio Button:**
    *   **Structure:** Circular button, filled circle when selected. Associated label text. Used in groups where only one option can be selected.

### 4.5. Cards

*   **Structure:** Container (Neutral Lightest background, subtle border/shadow). Optional header (image/icon), title (H4), body text (P), footer (actions/metadata).
*   **Use:** Course previews, blog post summaries, resource links. Variations based on content type.

### 4.6. Video Player Controls

*   **Conceptual Layout:** Control bar (appears on hover/interaction). Includes: Play/Pause button, Volume control (slider/mute), Progress bar (clickable/draggable), Time display (current/total), Fullscreen toggle. Consistent iconography.

### 4.7. Interactive Quiz Elements

*   **Conceptual Structure:**
    *   **Question Display:** Clear text (H4 or P).
    *   **Multiple Choice/True/False:** Options presented using Radio Buttons or styled containers.
    *   **Feedback Display:** Areas for showing correct/incorrect status (using Success/Error colors/icons) and explanatory text after submission.

### 4.8. Discussion Forum Interface

*   **Conceptual Layout:**
    *   **Thread List Item:** Container showing thread title, author, reply count, last activity time. Clickable to view thread.
    *   **Post/Reply Structure:** Author avatar/name, timestamp, post content, action links (Reply, Like). Indentation for replies.

### 4.9. Notification/Alerts

*   **Structure:** Container with distinct background/border based on status (Info, Success, Warning, Error). Icon corresponding to status, message text, optional close button. Can appear inline or as dismissible toasts.

### 4.10. Resource Download Links

*   **Styling Convention:** Standard link style, potentially with a leading download icon (e.g., Material Symbols 'download'). Clearly indicate file type and size if possible.