# 🧩 Husky Commit Hooks & Validation System

This project uses a custom **Husky-based Git hook system** to enforce consistent and high-quality commit messages.

---

## 🚦 Commit Rules

### 1. ✅ Use Present Tense

Commit messages **must not** contain past-tense verbs.

| Valid ✅           | Invalid ❌           |
| ------------------ | -------------------- |
| `Add login screen` | `Added login screen` |
| `Fix UI layout`    | `Fixed UI layout`    |

---

### 2. 🧱 Follow the Conventional Commit Format

**Format:** `<type>(<scope>): <subject>`

#### ✅ Valid Examples:

- `feat(auth): add login functionality`
- `fix(home-page): fix layout shift issue`
- `docs(readme): update usage instructions`

#### ❌ Invalid Examples:

- `updated styles`
- `Added readme`
- `feat: Added login`

---

### 3. ⚙️ Commitlint Configuration

| Rule                | Description                                                                       |
| ------------------- | --------------------------------------------------------------------------------- |
| `type` required     | Must be one of: `feat`, `fix`, `change`, `chore`, `docs`, `style`, `perf`, `test` |
| `scope` required    | Must be in `kebab-case` (e.g., `user-profile`, `api`, `readme`)                   |
| `subject` required  | Must start with lowercase, no period at the end                                   |
| `header` max length | Must not exceed 100 characters                                                    |

---

### 4. 🔒 Master Branch Protection

⛔ **Direct commits to the `master` branch are blocked.** ✅ Please create a new feature or bugfix branch before
committing.

---

## 🧪 When Are Checks Performed?

| Git Hook     | What It Does                                            |
| ------------ | ------------------------------------------------------- |
| `pre-commit` | Runs `lint-staged` and checks if you're on `master`     |
| `commit-msg` | Validates commit message format and verb tense using AI |

---

## 📁 Key Files Overview

| File                                           | Description                                         |
| ---------------------------------------------- | --------------------------------------------------- |
| `.husky/commit-msg`                            | Validates commit message format and tense           |
| `.husky/pre-commit`                            | Lints staged files, blocks `master` commits         |
| `scripts/commits/utils.sh`                     | Shell utilities (logging, validation helpers)       |
| `scripts/commits/commit-tense-check.ts`        | AI-based tense validation using Google Gemini API   |
| `scripts/commits/commit-lint-check.sh`         | Wrapper script for `commitlint` validation          |
| `scripts/commits/commit-message-template.html` | Opens a visual guide in browser when a commit fails |

---

## 🌍 Environment Requirements

Ensure your `.env` file contains the following key:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your-key-here
```

> ❗ **Important:** If the API key is missing, invalid, or your machine is offline, the commit will be blocked. A
> browser-based help guide will automatically open to assist you in resolving the issue.

---

## ⚠️ Common Errors & Fixes

| ❗ **Error Message**                      | 🔍 **Explanation**                                                                |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| `Commit message is in past tense.`        | You used a past-tense verb like "Added". Use present tense instead (e.g., "Add"). |
| `Commit message does not follow format.`  | The message doesn't match the required format: `type(scope): subject`.            |
| `You are on master branch`                | Direct commits to the `master` branch are blocked. Switch to a feature branch.    |
| `GOOGLE_GENERATIVE_AI_API_KEY is missing` | Your `.env` file is missing the API key. Add `GOOGLE_GENERATIVE_AI_API_KEY`.      |
| `No internet connection`                  | The AI service couldn't be reached. Check your network connection.                |

---

## 🤖 AI-Powered Commit Message Suggestions

If your commit message is written in **past tense**, the system will:

- ❌ Block the commit
- 💡 Automatically generate a **present-tense suggestion** using the Google Gemini AI API

This helps you quickly rewrite the message using the correct verb tense and conventional format.

### 🧪 Example Output:

```plain
❌ Commit message is in past tense: feat(auth): added token validation
💡 Suggested fix: feat(auth): add token validation
```

### ✍️ What You Should Do:

1. Copy the suggested message provided by the AI
2. Run `git commit --amend -m "your-new-message"` to update the commit
3. Save and close the commit editor (if it opens)
4. Re-run your Git operation (e.g., `git push`)

> This ensures your commit history stays clean, clear, and consistent.

---

## 🛠️ Contributing to Hook Logic

You can extend or customize this system by editing or adding logic in the following areas:

### 🔧 Shell-Based Logic

- Located in `scripts/commits/utils.sh` or other `.sh` files.
- Handles branch protection, formatting checks, and environment validation.

### 🤖 AI-Based Logic

- Located in `scripts/commits/commit-tense-check.ts`.
- Uses the **Google Gemini API** to detect past-tense verbs in commit messages.

### 📝 Commit Format Rules

- Defined in `commitlint.config.js`.
- Based on `@commitlint/config-conventional`, with custom overrides for stricter enforcement.

> **Tip:** When adding new checks, make sure they are properly integrated via the appropriate Husky hook
> (`.husky/commit-msg`, `.husky/pre-commit`, etc.) and use the provided logging functions for clear feedback:
>
> - `log_success`
> - `log_error`
> - `log_info`

---

## 📊 Weekly Commit Type Stats

```
chore    :  5 commits (100%)
```

---

## 📘 Resources

- [📖 Conventional Commits](https://www.conventionalcommits.org/)
- [📚 commitlint Documentation](https://commitlint.js.org/)
- [🧩 Husky Git Hooks](https://typicode.github.io/husky/#/)
- [🤖 Google Generative AI API](https://ai.google.dev/)
