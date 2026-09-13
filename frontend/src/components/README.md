# Frontend UI Components

This directory houses the reusable, accessible design system components built for Mini Jira.

---

## Component Guidelines

All components follow these principles:
- **Zero External UI Libraries**: Hand-crafted with vanilla React and Tailwind CSS.
- **WAI-ARIA Accessibility**: Complete keyboard navigation, focus management, and ARIA roles.
- **Composition-Friendly**: Uses compound component patterns where applicable.

---

## Component Inventory

### 1. Modal (`Modal/`)
- Accessible dialog overlay with backdrop blur.
- Traps focus inside the modal and dismisses on `Escape` key or backdrop click.
- Prevents body scrolling while active.
- Sub-components: `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter`.

### 2. Tabs (`Tabs/`)
- Compound tabs component implementing WAI-ARIA tabbed interface guidelines.
- Supports full keyboard navigation: `ArrowRight`, `ArrowLeft`, `Home`, `End`.
- Sub-components: `Tabs`, `TabList`, `Tab`, `TabPanels`, `TabPanel`.

### 3. Accordion (`Accordion/`)
- Collapsible content disclosure panels with animated height transitions.
- Supports single-panel or multi-panel expansion modes.
- Sub-components: `Accordion`, `AccordionItem`, `AccordionHeader`, `AccordionPanel`.

### 4. Dropdown (`Dropdown/`)
- Custom select and menu component.
- Implements `role="listbox"`, `role="option"`, and keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`).
- Supports disabled options and custom render trigger props.

### 5. Avatar (`Avatar/`)
- Displays user profile picture or fallback initials with deterministic background colors based on user ID.
- Sizes: `xs` (20px), `sm` (24px), `md` (32px), `lg` (40px).

### 6. Icon (`Icon/`)
- **`IssueTypeIcon.jsx`**: Renders Jira issue icons (`task`, `bug`, `story`, `epic`) with official color accents.
- **`PriorityIcon.jsx`**: Renders Jira priority indicators (`highest`, `high`, `medium`, `low`, `lowest`).

### 7. Navbar (`Navbar/`)
- Fixed top navigation header (56px height).
- Contains sidebar toggle, Jira logo, navigation links, `GlobalSearch` input, and direct link to the AI Assistant.

### 8. Sidebar (`Sidebar/`)
- Collapsible left navigation sidebar (240px width).
- Displays the stable project list with in-place active highlighting, and status/label quick filters.

### 9. Spinner (`Spinner/`)
- SVG-based indeterminate circular loading indicator.
- Sizes: `sm`, `md`, `lg`.

### 10. Badge (`Badge/`)
- Inline status and category indicators with customizable color tokens.
