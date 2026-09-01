---
name: Institutional Ledger
colors:
  surface: '#fff8f5'
  surface-dim: '#e3d8d2'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fdf1eb'
  surface-container: '#f7ece5'
  surface-container-high: '#f1e6e0'
  surface-container-highest: '#ece0da'
  on-surface: '#201b17'
  on-surface-variant: '#51443b'
  inverse-surface: '#352f2b'
  inverse-on-surface: '#faeee8'
  outline: '#84746a'
  outline-variant: '#d6c3b7'
  surface-tint: '#84532a'
  primary: '#3b1c00'
  on-primary: '#ffffff'
  primary-container: '#582f08'
  on-primary-container: '#d29667'
  inverse-primary: '#fab987'
  secondary: '#964900'
  on-secondary: '#ffffff'
  secondary-container: '#fd984e'
  on-secondary-container: '#6d3300'
  tertiary: '#002739'
  on-tertiary: '#ffffff'
  tertiary-container: '#003e57'
  on-tertiary-container: '#7ba9c6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc4'
  primary-fixed-dim: '#fab987'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#683c15'
  secondary-fixed: '#ffdcc7'
  secondary-fixed-dim: '#ffb787'
  on-secondary-fixed: '#311300'
  on-secondary-fixed-variant: '#723600'
  tertiary-fixed: '#c5e7ff'
  tertiary-fixed-dim: '#9ecdeb'
  on-tertiary-fixed: '#001e2d'
  on-tertiary-fixed-variant: '#174c65'
  background: '#fff8f5'
  on-background: '#201b17'
  surface-variant: '#ece0da'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  table-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-width: 280px
  container-max: 1440px
  gutter: 24px
  margin-page: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is engineered for high-stakes financial governance and institutional oversight. The brand personality is authoritative, immutable, and precise, reflecting the gravity of budget management within government or corporate finance sectors. 

The aesthetic follows a **Corporate / Modern** direction with a heavy emphasis on structural integrity and information density. It avoids transient trends like glassmorphism or neon accents in favor of a grounded, tactile professionalism. The UI uses clear containment, purposeful grouping, and a strict hierarchy to ensure that complex financial workflows remain legible and error-resistant. The emotional response should be one of stability, accountability, and clarity.

## Colors
The palette is rooted in earth-toned neutrals to project maturity and permanence. 

- **Primary Dark Brown (#582F08):** Used for structural anchors such as the sidebar, heavy headers, and "Completed" states. It provides the visual weight necessary for an institutional tool.
- **Secondary Burnt Orange (#9D4D01):** Reserved for action and focus. This color draws the eye to primary buttons, active navigation, and the "Current" step in a workflow.
- **Functional Surfaces:** The background is a soft, warm off-white (#FDF5EF) to reduce eye strain during long periods of data entry. Secondary surfaces (#F0E6DB) are used to differentiate cards, filters, and read-only data regions.
- **Semantic Colors:** Statuses follow a muted, professional spectrum—deep forest greens for "Approved" and oxblood reds for "Rejected"—maintaining high contrast without appearing overly vibrant.

## Typography
Inter is utilized for its exceptional legibility in data-heavy environments. The typographic system is restrained, relying on weight changes rather than size variations to denote hierarchy.

- **Headlines:** Use Semi-Bold or Bold weights in Dark Brown to establish clear section starts.
- **Data Tables:** Use a specialized `table-data` size (13px) to maximize information density while maintaining readability.
- **Labels:** Meta-information and small UI labels use uppercase with slight letter spacing to differentiate them from interactive body text.
- **Mobile Scaling:** On devices smaller than 768px, `display-lg` should scale down to 24px and `headline-md` to 20px to ensure long financial titles do not wrap excessively.

## Layout & Spacing
The system employs a **fixed-fluid hybrid layout**. 

- **Sidebar:** A fixed 280px left navigation bar in Primary Dark Brown houses the main application hierarchy.
- **Grid:** A 12-column fluid grid system is used for the main content area, with a maximum width of 1440px to prevent line lengths from becoming unreadable on ultra-wide monitors.
- **Rhythm:** An 8px base unit drives all spacing. For forms and tables, use "Compact" spacing (8px-12px) to keep related data visible without scrolling. Page-level margins are 40px on desktop, scaling down to 16px on mobile.
- **Responsive Behavior:** On tablet, the sidebar collapses into a narrow icon-only rail or a hidden drawer. Tables should allow horizontal scrolling rather than stacking to preserve the integrity of financial columns.

## Elevation & Depth
Depth in the design system is achieved through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows.

- **Level 0 (Background):** The main off-white surface (#FDF5EF).
- **Level 1 (Cards/Containers):** Secondary surface (#F0E6DB) with a subtle 1px border (#D9C5B2). No shadow.
- **Level 2 (Modals/Popovers):** White surface with a very soft, high-diffusion shadow (0px 4px 20px rgba(88, 47, 8, 0.08)) to distinguish it from the underlying page without breaking the flat, professional aesthetic.
- **Dividers:** 1px solid lines in #E5D5C5 are used to separate table rows and form sections, ensuring a rigid, ledger-like structure.

## Shapes
The shape language is **Soft (0.25rem)**. This slight rounding provides a professional, modern feel that is more approachable than sharp 90-degree corners, while still appearing disciplined and institutional.

- **Buttons & Inputs:** 4px (0.25rem) corner radius.
- **Cards & Modals:** 8px (0.5rem) corner radius.
- **Status Badges:** Fully rounded (pill) to differentiate them from interactive square buttons and inputs.

## Components
Consistent implementation of these components ensures the system feels like a singular, reliable tool.

- **Sidebar Navigation:** Solid #582F08 background. Active items use #9D4D01 with a high-contrast white text label. Icons should be 20px, stroke-based, and minimal.
- **Workflow Tracker:** A horizontal progression bar.
    - *Completed:* Dark Brown (#582F08) with a check icon.
    - *Current:* Burnt Orange (#9D4D01) with bold text.
    - *Upcoming:* Secondary Surface (#F0E6DB) with Dark Brown text at 50% opacity.
- **Buttons:**
    - *Primary:* Solid #9D4D01 with white text. No gradient.
    - *Secondary:* Transparent with 1px #9D4D01 border and text.
    - *Ghost:* No border, Dark Brown text, used for "Cancel" or "Go Back."
- **Data Tables:**
    - *Header:* Dark Brown (#582F08) background with White bold text.
    - *Rows:* Alternating zebra-striping using #FDF5EF and #F7EEE6.
    - *Cells:* Right-aligned for numeric/financial data; Left-aligned for text.
- **Inputs:** 1px border (#D9C5B2). Focused state uses a 2px Burnt Orange border. Read-only fields use the #F0E6DB surface with a subtle lock icon.
- **Status Badges:** Small, pill-shaped markers. "Pending" (Gold/Orange), "Approved" (Deep Green), "Rejected" (Oxblood). Text should be high-contrast against the badge background.