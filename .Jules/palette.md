## 2025-05-18 - Accessible Icon-Only Close Buttons in Arabic UI Modals
**Learning:** Icon-only modal header controls (`<X />` buttons) lack descriptive text for screen readers. In localized Arabic web applications, providing localized explicit `aria-label="إغلاق النافذة"` and `type="button"` ensures proper screen reader announcement and prevents unwanted form submission triggers.
**Action:** Always check modal header icon buttons across all modal dialog components to ensure explicit ARIA labeling in the app's primary language.

## 2025-05-19 - Accessible Password Visibility Toggles and Icon Buttons
**Learning:** Password visibility toggle buttons (`<Eye />` / `<EyeOff />`) with `tabIndex={-1}` create a keyboard trap where screen readers and keyboard-only users cannot focus or activate password visibility toggle controls. Adding localized `aria-label`s, visible focus rings (`focus-visible:ring-2`), and enabling keyboard focus (removing `tabIndex={-1}`) ensures full accessibility for credential inputs and dynamic icon actions in Arabic UIs.
**Action:** Always verify that input adornment buttons (e.g. password visibility toggles, item deletion triggers) are keyboard-focusable with localized `aria-label` and `focus-visible` ring indicators.
