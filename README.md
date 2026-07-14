# SignalRoom — Anonymous Course Feedback & AI Insights

SignalRoom is a focused portfolio application for instructors to collect anonymous lecture feedback, review aggregate patterns, complete a private reflection, and generate exactly five evidence-grounded teaching insights with DeepSeek V4 Pro.

## Main features

- Instructor and administrator authentication with Supabase Auth
- Admin-managed course catalog and instructor assignments
- Instructor-owned lecture-level feedback sessions for assigned courses
- Configurable rating, single-choice, and long-text questions
- Anonymous, single-use response codes stored only as SHA-256 hashes
- Atomic PostgreSQL submission transaction that prevents concurrent code reuse
- Response progress, rating distributions, choice charts, and anonymous comments
- One private PDF per session through Supabase Storage
- Instructor reflection required before analysis
- DeepSeek V4 Pro JSON output validated with Zod
- Versioned analysis history; regeneration never deletes prior results
- Department, course-assignment, and instructor-access administration
- RLS on every application table, plus server-side ownership checks

## Screenshots

Add portfolio screenshots here after deploying:

- Landing page
- Instructor dashboard
- Session analytics
- Anonymous student form
- AI analysis history

## Technology

Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, Supabase Postgres/Auth/Storage/RLS, `@supabase/ssr`, React Hook Form-compatible validation patterns, Zod, OpenAI JavaScript SDK configured for DeepSeek, Recharts, Vitest, and Playwright.

## Architecture

Server Components load protected dashboard data. Route Handlers own mutations and repeat authentication, active-account, role, and ownership checks. Supabase RLS provides a second authorization layer. Anonymous participants can only call two narrow `security definer` database functions: one reads the open public form and one performs the entire validated submission transaction.

See [architecture](docs/architecture.md), [database](docs/database.md), [authentication](docs/authentication.md), and [security](docs/security.md).

## Local setup

Requirements: Node.js 22.3+ (Node 24 works), npm, a Supabase project, a Supabase service-role key, and a funded DeepSeek API key.

1. Install packages with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Add the Supabase URL, publishable key, service-role key, and DeepSeek key.
4. Apply all files in `supabase/migrations` in timestamp order. Codex can apply them through the Supabase MCP server; with the CLI use `supabase db push` after linking the project.
5. In Supabase Auth, keep Email/Password enabled. Create accounts manually or configure the two demo passwords and run `npm run seed:users`.
6. Optionally run `supabase/seed.sql` after the demo instructor exists.
7. Start the app with `npm run dev` and open `http://localhost:3000`.

On Windows PowerShell systems that block `npm.ps1`, use `npm.cmd run dev`.

## Environment variables

Browser-safe:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

Server-only:

- `SUPABASE_SERVICE_ROLE_KEY`
- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL` (defaults to `https://api.deepseek.com`)
- `DEEPSEEK_MODEL` (defaults to `deepseek-v4-pro`)
- `AI_PROVIDER_MODE` (`deepseek`; use `mock` only in controlled testing)
- `TURNSTILE_SECRET_KEY`
- `RATE_LIMIT_SECRET`
- `DEMO_INSTRUCTOR_EMAIL` (defaults to `instructor@example.com`)
- `DEMO_INSTRUCTOR_PASSWORD` (used only by the account seed script)
- `DEMO_ADMIN_PASSWORD` (used only by the account seed script)

Never expose or prefix server-only values with `NEXT_PUBLIC_`.

## Database and storage setup

The initial migration creates enums, ten product tables, constraints, indexes, helper functions, RLS policies, the private `session-materials` bucket, and two starter departments. The second migration adds a service-role-only database rate limiter.

PDFs must be `application/pdf` and no larger than 10 MB. Object paths begin with the authenticated instructor ID. Files are downloaded and parsed only inside the server-side analysis route.

## Anonymous duplicate prevention

Codes are generated with a non-ambiguous alphabet. Only normalized SHA-256 hashes are stored. `submit_anonymous_feedback` locks both the session row and matching code row, validates lifecycle and every answer, inserts the response and answers, then marks the code used in one transaction. Two simultaneous requests with the same code cannot both succeed.

The application prevents a single anonymous response code from being used more than once. It does not claim to prove that one physical person has submitted only one response, because doing so would require some form of student identification.

## Tests and quality checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Unit tests cover code generation/normalization/hashing, question and answer validation, AI output validation, and response-percentage calculation. The database concurrency integration test runs only when `SUPABASE_TEST_URL` and `SUPABASE_TEST_SERVICE_ROLE_KEY` point to an isolated test project. Never point destructive integration tests at production.

The normal Playwright suite is non-destructive. A complete instructor-to-anonymous-response workflow is available as an explicit opt-in against the configured development project; it uses the assigned Software Testing course, cleans up its test session, and uses the deterministic mock AI provider so it does not consume DeepSeek credits:

```powershell
$env:RUN_FULL_E2E='true'
npm.cmd run test:e2e -- tests/e2e/full-workflow.spec.ts
```

## Deployment

Deploy to Vercel or another Next.js-compatible Node host. Add all environment values in the host settings, set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS URL, and update Supabase Auth Site URL/redirect URLs. Apply migrations before the first production request. Configure Cloudflare Turnstile for the public form in production.

## Demo accounts

`npm run seed:users` creates `instructor@example.com` and `admin@example.com` using passwords supplied only through `.env.local`. No passwords are committed. The login page offers a one-click test-instructor session by creating and immediately exchanging a server-only Supabase magic link; it does not expose or require the demo password at runtime. Analyses created by this shared demo account use the deterministic demo provider so public visitors cannot spend DeepSeek credits. Run `supabase/seed.sql` afterward for the Software Testing demo course and five default questions.

## Privacy limitations

SignalRoom deliberately avoids student accounts, names, emails, device tracking, and browser fingerprinting. Response codes control submissions, not physical people. Shared codes can be transferred before use, and written feedback can still contain self-identifying content. These limitations are explained plainly rather than overstating anonymity.

## Future improvements

Possible extensions include LMS integration, scheduled reminders, multilingual forms, exportable PDF reports, richer accessibility audits, and institution-level analytics. They are intentionally outside this focused portfolio scope.
