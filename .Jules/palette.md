## 2025-05-18 - Accessible Icon-Only Close Buttons in Arabic UI Modals
**Learning:** Icon-only modal header controls (`<X />` buttons) lack descriptive text for screen readers. In localized Arabic web applications, providing localized explicit `aria-label="إغلاق النافذة"` and `type="button"` ensures proper screen reader announcement and prevents unwanted form submission triggers.
**Action:** Always check modal header icon buttons across all modal dialog components to ensure explicit ARIA labeling in the app's primary language.

## 2025-05-18 - Accessible Icon-Only Action & Toggle Buttons in Arabic UI
**Learning:** Icon-only action buttons (e.g., password visibility toggles, settings, logout, print, sync, delete) using visual icon packages like Lucide lack accessible names when missing `aria-label`. Visual `title` tooltips do not consistently substitute for ARIA labels in screen readers. Explicit Arabic `aria-label` attributes guarantee proper accessible announcements for screen reader users across all interactive toolbars and forms.
**Action:** Always inspect icon-only toggle and action buttons across all UI toolbars to ensure explicit localized `aria-label` attributes are present.
