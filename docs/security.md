# Security

## Defense in depth

Authorization exists in Route Handlers and PostgreSQL RLS. UI visibility is never treated as a security control. All tables have RLS enabled, including the service-only rate-limit table.

## Course assignment boundaries

Only active administrators can create catalog courses or change instructor assignments. Instructors have read-only access to assigned courses, and both the session API and PostgreSQL insertion policy verify the assignment before a feedback session can be created. Removing an assignment blocks future sessions without transferring or exposing historical sessions owned by another instructor.

## Service-role isolation

`SUPABASE_SERVICE_ROLE_KEY` is read only from the server environment and imported from a `server-only` module. It is never sent to Client Components. DeepSeek credentials follow the same rule.

## Anonymous codes and atomicity

Plaintext response codes are returned once at generation time and never persisted. Normalization removes separators and casing differences. SHA-256 hashes are compared in PostgreSQL. The submission function uses row locks, so concurrent reuse produces exactly one response.

## Public access

Anonymous database access is limited to two explicit RPC grants. Public users cannot select product tables, response counts, answers, reflections, materials, or analyses. Error messages intentionally combine invalid and used-code cases to avoid code enumeration.

## Private files

The material bucket is private, limited to PDF MIME type and 10 MB, and protected with ownership policies. Material is downloaded only within authenticated server-side analysis.

## Validation and abuse controls

Zod validates request shape before database calls. PostgreSQL repeats lifecycle, required-answer, type, range, option-membership, text-length, and unknown-question checks. Public submissions have a size cap, HMAC-keyed IP rate limit, and optional Cloudflare Turnstile. Production rejects submissions when Turnstile is not configured.

## Logging

User-facing responses never expose raw Supabase, PostgreSQL, or AI-provider errors. Server logging avoids plaintext codes, private signed URLs, API keys, and unnecessary student-written content.

## Known privacy limitations

Codes prevent reuse, not transfer. The system does not identify physical people and therefore cannot prove one response per person. Written answers may contain voluntarily self-identifying details. Shared-IP environments are not treated as duplicate students; IP-derived HMACs are used only for short-window abuse limiting and are not stored as raw addresses.
