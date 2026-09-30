## 2025-05-18 - Accessible Icon-Only Close Buttons in Arabic UI Modals
**Learning:** Icon-only modal header controls (`<X />` buttons) lack descriptive text for screen readers. In localized Arabic web applications, providing localized explicit `aria-label="إغلاق النافذة"` and `type="button"` ensures proper screen reader announcement and prevents unwanted form submission triggers.
**Action:** Always check modal header icon buttons across all modal dialog components to ensure explicit ARIA labeling in the app's primary language.

## 2025-05-19 - Modal Dialog Keyboard Dismiss and ARIA Semantics
**Learning:** React modal dialogs must include `role="dialog"`, `aria-modal="true"`, and an `aria-labelledby` reference to their primary title, along with a `keydown` listener for the `Escape` key to ensure keyboard and screen-reader accessibility.
**Action:** When building modal components, include an `Escape` key event listener in `useEffect` and attach proper WAI-ARIA dialog attributes to the container wrapper.
