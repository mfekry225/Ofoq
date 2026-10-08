## 2025-05-18 - Accessible Icon-Only Close Buttons in Arabic UI Modals
**Learning:** Icon-only modal header controls (`<X />` buttons) lack descriptive text for screen readers. In localized Arabic web applications, providing localized explicit `aria-label="إغلاق النافذة"` and `type="button"` ensures proper screen reader announcement and prevents unwanted form submission triggers.
**Action:** Always check modal header icon buttons across all modal dialog components to ensure explicit ARIA labeling in the app's primary language.

## 2025-05-19 - Password Visibility Toggle Keyboard Accessibility
**Learning:** Password visibility toggle buttons using `tabIndex={-1}` prevent keyboard users from reaching the toggle via Tab navigation. Adding localized `aria-label` ("إظهار/إخفاء كلمة المرور"), `aria-pressed`, and explicit `focus-visible:ring-2` styles ensures keyboard users and screen reader users can toggle password visibility seamlessly.
**Action:** When implementing input toggle buttons, never use `tabIndex={-1}` unless explicitly non-interactive, and always provide localized `aria-label`, `aria-pressed`, and `focus-visible` focus styles.
