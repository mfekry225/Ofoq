## 2025-05-18 - Accessible Icon-Only Close Buttons in Arabic UI Modals
**Learning:** Icon-only modal header controls (`<X />` buttons) lack descriptive text for screen readers. In localized Arabic web applications, providing localized explicit `aria-label="إغلاق النافذة"` and `type="button"` ensures proper screen reader announcement and prevents unwanted form submission triggers.
**Action:** Always check modal header icon buttons across all modal dialog components to ensure explicit ARIA labeling in the app's primary language.

## 2026-10-02 - Keyboard Navigable Password Toggles and Icon-Only Controls
**Learning:** Removing `tabIndex={-1}` on password visibility eye toggles allows keyboard-only users to reach the toggle button via Tab key navigation, while adding localized `aria-label` and `focus-visible:ring-2` provides screen reader state updates ("إظهار كلمة المرور" / "إخفاء كلمة المرور") and focus indicators.
**Action:** Ensure form eye toggle buttons and action icons are keyboard reachable and explicitly labeled for screen readers.
