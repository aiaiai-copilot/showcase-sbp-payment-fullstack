Set up the development environment for YooKassa payment integration project.

Arguments: $ARGUMENTS (optional: "frontend" or "backend" to set up specific component)

**CRITICAL: You MUST explicitly state "I will use the [skill-name] skill" before each skill-dependent step to load the skill's knowledge.**

Execute the following steps based on arguments:

## If no arguments or "frontend":

1. Check if frontend directory exists and has package.json
2. If not set up, initialize the structure
3. If dependencies not installed, run: `cd frontend && npm install`
4. **Say: "I will use the shadcn-ui skill to set up shadcn/ui"** then follow the skill's procedures
5. Create frontend/.env from .env.example if needed
6. **Say: "I will use the openapi-sync skill to configure type generation"** then follow the skill's procedures
7. Run type generation: `cd frontend && npm run generate:types`
8. Verify types were generated in src/types/api.ts

## If no arguments or "backend":

1. Check if backend directory exists and has package.json
2. If not set up, initialize the structure
3. If dependencies not installed, run: `cd backend && npm install`
4. Create backend/.env from .env.example if needed
5. **Say: "I will use the openapi-sync skill to configure type generation"** then follow the skill's procedures
6. Run type generation: `cd backend && npm run generate:types`
7. Verify types were generated in src/types/api.ts and src/types/webhook.ts

## Always:

1. Verify specs directory exists with both OpenAPI files
2. List available skills: shadcn-ui, openapi-sync, yookassa-test
3. Check git configuration
4. Provide next steps with skill references

**REMEMBER: Explicitly mentioning a skill by name loads its knowledge into context.**
