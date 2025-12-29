# AGENTS.md

## Repository expectations

- Run `npm run prettier; npm run lint; npm run test` after every change.
- You should always implement code using strict TDD (Kent Beck):
  - For every behavior change or new production code, add a minimal test first.
  - Run tests immediately after adding the test and confirm the failure is expected.
  - Only then add the minimal production code to pass the test.
  - Re-run the full test suite after each green step.
  - Do not introduce new files or production code without a failing test unless I explicitly approve.
