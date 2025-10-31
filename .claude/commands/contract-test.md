Run contract tests for both frontend and backend to ensure API compliance.

Execute the following steps:

1. Check if frontend and backend directories exist
2. Run frontend contract tests: `cd frontend && npm test -- --grep "contract"`
3. Run backend contract tests: `cd backend && npm test -- --grep "contract"`
4. Report results for each component
5. If any tests fail, explain the failures and suggest fixes
6. Provide a summary of contract compliance status

Contract tests ensure that implementations match OpenAPI specifications exactly.
