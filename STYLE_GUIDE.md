# ART5MATA — Team Style Guide

This style guide applies to all source code in the **ART5MATA Installment Management System** repository. All team members must follow these conventions consistently.

---

## 2.1 — Naming Conventions

| Element               | Convention                                  | Example                          |
|-----------------------|---------------------------------------------|----------------------------------|
| Variables             | camelCase                                   | `currentView`, `userRole`        |
| Functions / Methods   | camelCase                                   | `checkSession`, `handleLogout`   |
| Classes / Components  | PascalCase                                  | `AdminDashboard`, `Login`        |
| Files (components)    | PascalCase                                  | `UserDashboard.tsx`              |
| Files (utilities)     | camelCase                                   | `client.ts`, `utils.ts`          |
| Constants             | camelCase (local) / UPPER_SNAKE_CASE (env)  | `supabase`, `VITE_SUPABASE_URL`  |
| Database tables       | snake_case                                  | `funeral_plans`, `user_roles`    |
| Database fields       | snake_case                                  | `remaining_balance`, `due_date`  |
| TypeScript types      | PascalCase                                  | `type View = 'login' \| 'admin'` |

---

## 2.2 — Formatting Rules

| Rule                          | Team Decision                               |
|-------------------------------|---------------------------------------------|
| Indentation                   | 2 spaces                                    |
| Line length limit             | Max 100 characters                          |
| Brace style                   | Same-line / K&R style                       |
| Spaces vs. tabs               | Spaces only (no tabs)                       |
| Blank lines between functions | 1 blank line                                |
| Max function length           | ~50 lines; extract helpers if longer        |
| Trailing commas               | Yes (in arrays and objects)                 |
| Semicolons                    | Yes                                         |
| Quote style                   | Single quotes `'` for JS/TS strings         |

---

## 2.3 — Commenting Standards

| Commenting Rule              | Team Standard                                           |
|------------------------------|---------------------------------------------------------|
| File/module header comment   | Brief single-line comment describing the file purpose   |
| Function/method doc comment  | JSDoc for all exported functions and components         |
| Inline comments              | Only for non-obvious or complex logic                   |
| TODO comment format          | `// TODO: <description>` — must include a description   |
| Language for comments        | English                                                 |

### JSDoc Example

```ts
/**
 * Checks the current Supabase session and sets user role.
 * Redirects to the appropriate dashboard based on role.
 */
const checkSession = async () => { ... };
```

---

## 2.4 — Branch Naming Strategy

| Branch Type    | Naming Format              | Example                          |
|----------------|----------------------------|----------------------------------|
| Feature branch | `feature/<short-desc>`     | `feature/user-dashboard`         |
| Bug fix branch | `fix/<short-desc>`         | `fix/login-redirect-loop`        |
| Hotfix branch  | `hotfix/<short-desc>`      | `hotfix/supabase-auth-crash`     |
| Release branch | `release/<version>`        | `release/v1.0.0`                 |

---

## Commit Message Format

All commits must follow this format:

```
<type>(<scope>): <short description>
```

**Example:**
```
feat(auth): add role-based redirect after login
```

### Allowed Commit Types

| Type       | When to Use                                        |
|------------|----------------------------------------------------|
| `feat`     | A new feature or component                         |
| `fix`      | A bug fix                                          |
| `docs`     | Changes to README, STYLE_GUIDE, or documentation   |
| `style`    | CSS/Tailwind/formatting changes, no logic change   |
| `refactor` | Code restructure without behavior change           |
| `test`     | Adding or updating tests                           |
| `chore`    | Config updates, dependency changes                 |

---

*This file must match the STYLE_GUIDE.md submitted in Lab Worksheet 10.*
