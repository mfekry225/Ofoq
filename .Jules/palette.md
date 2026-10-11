## 2025-05-18 - Accessible Icon-Only Close Buttons in Arabic UI Modals
**Learning:** Icon-only modal header controls (`<X />` buttons) lack descriptive text for screen readers. In localized Arabic web applications, providing localized explicit `aria-label="إغلاق النافذة"` and `type="button"` ensures proper screen reader announcement and prevents unwanted form submission triggers.
**Action:** Always check modal header icon buttons across all modal dialog components to ensure explicit ARIA labeling in the app's primary language.

## 2025-05-19 - Keyboard Escape Key Handling and ARIA Dialog Semantics in Modal Overlays
**Learning:** Modal dialog containers without `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` prevent screen readers from announcing modal title context upon opening. Furthermore, lacking a `keydown` listener for the `Escape` key breaks expected keyboard navigation conventions for dismissing overlays.
**Action:** Always attach `Escape` key event listeners and ARIA dialog properties (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`) to modal container components.
