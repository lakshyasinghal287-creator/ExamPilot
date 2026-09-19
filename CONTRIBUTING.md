# ExamPilot: Team Contribution & Engineering Guidelines

This document establishes the software engineering workflow, branching strategy, commit standards, and quality gates for **Lakshya** and **Vaibhav Rawat**.

---

## 1. Branching Strategy

To maintain a production-grade, always-stable `main` branch for university demonstrations and examinations, we adhere to a **Feature-Branch Workflow**:

```
main (always stable, fully tested, demonstrable)
  │
  ├── feature/ai-validation-pipeline (Lakshya)
  ├── feature/cat-palette-ui         (Vaibhav)
  └── docs/srs-specification         (Joint)
```

### Rules:
1. **Never commit directly to `main` for non-trivial features.**
2. Branch naming conventions:
   - `feature/<name>` : New functionality (e.g., `feature/sympy-math-verifier`).
   - `fix/<name>`     : Bug fixes (e.g., `fix/tita-scoring-edge-case`).
   - `docs/<name>`    : Documentation updates (e.g., `docs/phase1-requirements`).
   - `test/<name>`    : Dedicated test suite expansions (e.g., `test/scoring-unit-tests`).
3. Always pull latest `main` before branching:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

---

## 2. Commit Message Standards (Conventional Commits)

Commit messages must reflect genuine software engineering progress. Single giant commits like `"Final project complete"` or vague messages like `"updated code"` are strictly prohibited.

We enforce the **Conventional Commits** specification:

```
<type>(<optional scope>): <imperative description>

[optional body explaining rationale and trade-offs]
```

### Permitted Types:
- `feat`: A new user-facing or system feature.
- `fix`: A bug fix.
- `docs`: Documentation-only changes (README, SRS, ADRs).
- `test`: Adding or refactoring tests (no production code change).
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `chore`: Build process, package updates, `.gitignore`, directory scaffolding.
- `perf`: A code change that improves performance.

### Examples:
- `feat(scoring): implement CAT +3/-1 and TITA marking rubrics`
- `docs(adr): add ADR-001 justifying FastAPI over Flask`
- `test(validator): add test cases for SymPy algebraic verification`
- `fix(timer): resolve 500ms client drift during section transitions`

---

## 3. Code Review & Pull Request Checklist

Before any branch is merged into `main`, both team members must verify:
- [ ] **Tests Pass:** All automated unit and integration tests run green.
- [ ] **Type Checked:** Code passes Python type checks (`mypy`) and TypeScript compiler (`tsc`).
- [ ] **No Secrets:** No `.env` files, API keys, or personal tokens are committed.
- [ ] **Documentation Updated:** Corresponding markdown specs, schemas, or ADRs reflect code reality.
- [ ] **Clean Git History:** Meaningful, atomic commits without merge clutter.

---

## 4. Architecture Decision Records (ADRs)

Whenever a significant architectural decision is made:
1. Create a new markdown file in `docs/adr/` following the naming convention:
   `ADR-[NUMBER]-[short-slug].md` (e.g., `ADR-001-fastapi-backend.md`).
2. Use the template provided in [`docs/adr/ADR_TEMPLATE.md`](docs/adr/ADR_TEMPLATE.md).
3. Both team members must review and agree on the trade-offs before accepting the ADR.
