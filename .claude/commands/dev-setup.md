Set up the development environment for YooKassa payment integration project.

Arguments: $ARGUMENTS (optional: "frontend" or "backend" to set up specific component)

Execute the following steps based on arguments:

## If no arguments or "frontend":

1. Check if frontend directory exists, create if needed
2. Initialize Vite + React + TypeScript if not already set up
3. Install dependencies: @tanstack/react-query, react-hook-form, zod
4. Set up shadcn/ui (invoke shadcn-ui skill)
5. Create frontend/.env from template if needed
6. Generate types from OpenAPI specs (invoke openapi-sync skill)
7. Verify tsconfig.json has correct paths configuration

## If no arguments or "backend":

1. Check if backend directory exists, create if needed
2. Initialize Node.js project with TypeScript if not already set up
3. Install dependencies: fastify, @fastify/cors, dotenv
4. Create backend/.env from template with YooKassa test keys placeholders
5. Generate types from OpenAPI specs (invoke openapi-sync skill)
6. Set up basic Fastify server structure
7. Verify tsconfig.json configuration

## Always:

1. Verify specs directory exists with OpenAPI files
2. Check git configuration
3. Provide next steps for the developer

Report setup status and any issues encountered.
