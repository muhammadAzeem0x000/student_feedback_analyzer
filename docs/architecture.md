# Architecture

## Next.js application

The App Router separates three surfaces:

- `/dashboard` contains the instructor workspace.
- `/admin` contains departments, the course catalog, instructor assignments, and access administration.
- `/session/[slug]` is the anonymous public form.

Pages and layouts are Server Components by default. Interactive editors, uploads, charts, and forms are small Client Components. Route Handlers own all mutations and validate input with Zod.

## Supabase usage

The browser client uses only the project URL and publishable key. Server-rendered authenticated pages use `@supabase/ssr` with request cookies. The service-role client is isolated in `lib/supabase/admin.ts` and used only for server-only rate limiting or administrative setup.

## Authentication and authorization

Supabase Auth manages instructor and admin credentials. An `auth.users` trigger creates a profile. `proxy.ts` refreshes sessions and redirects unauthenticated protected routes. Administrators create catalog courses and manage `course_assignments`; instructors can only create sessions for courses assigned to them. Every protected handler re-fetches the authenticated user, checks `profiles.is_active`, checks the role where needed, and queries owned records rather than trusting browser-supplied IDs. RLS repeats these rules in PostgreSQL.

## Anonymous submission flow

```mermaid
sequenceDiagram
  participant S as Student browser
  participant N as Next.js route
  participant P as PostgreSQL function
  S->>N: Session slug, code, answers
  N->>N: Body, Zod, Turnstile, rate-limit checks
  N->>P: Hash(code) + answers
  P->>P: Lock session and response-code rows
  P->>P: Validate lifecycle, questions, and answers
  P->>P: Insert response + answers; consume code
  P-->>N: Response ID or safe error
  N-->>S: Success or non-enumerating failure
```

## AI analysis flow

The analysis handler verifies ownership, a closed/analyzed state, the minimum response count, at least one question, and a completed reflection. It loads aggregate statistics through PostgreSQL, anonymous text answers, and the private PDF through authenticated Storage. PDF text is extracted server-side. DeepSeek receives the contextual dataset through the OpenAI-compatible SDK. JSON mode is enabled, then Zod requires exactly five ranked insights before one immutable `ai_analyses` row is saved. The model and prompt version are stored with every result.

## Storage flow

The private `session-materials` bucket accepts PDFs up to 10 MB. Paths are `{instructor_id}/{session_id}/{random}.pdf`. Storage RLS checks the first folder for writes and session ownership for reads. Students never receive signed URLs.
