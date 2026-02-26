---
name: supabase
description: Integrates Supabase with Next.js for database, auth, and Edge Functions. Use when working with Supabase, database queries, authentication, RLS policies, Edge Functions, or when the user mentions Supabase, Postgres, or backend data.
---

# Supabase

## When to Use

Apply this skill when:
- Writing or modifying Supabase database queries
- Implementing or debugging authentication (login, sessions, protected routes)
- Creating or updating RLS policies
- Deploying or editing Edge Functions
- Working with `lib/supabase/*`, middleware auth, or admin flows

---

## Client Selection

| Context | Import | Use |
|---------|--------|-----|
| Client Components (`"use client"`) | `@/lib/supabase/browserClient` | `createClient()` |
| Server Components, Server Actions, API Routes | `@/lib/supabase/serverClient` | `createClient()` |
| Admin operations bypassing RLS | `@/lib/supabase/serverClient` | `createServiceClient()` |

**Never** use `createServiceClient()` or expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code.

---

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` – project API URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – public anon key
- `SUPABASE_SERVICE_ROLE_KEY` – server-only, for admin operations

---

## Query Patterns

```typescript
// Server Action / Server Component
import { createClient } from '@/lib/supabase/serverClient'

const supabase = createClient()
const { data, error } = await supabase
  .from('table_name')
  .select('id, name, created_at')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
```

For client components, use `@/lib/supabase/browserClient` and the same query API.

---

## Auth Flow

- Middleware (`middleware.ts`) refreshes sessions and protects `/admin/*` routes
- Redirect to `/admin/login` when unauthenticated user hits `/admin`
- Use `supabase.auth.getUser()` for auth checks; `getSession()` for full session data

---

## RLS (Row Level Security)

- User-facing queries use anon key; RLS policies enforce access
- Admin operations that must bypass RLS use `createServiceClient()` from server code only
- When adding tables, always define RLS policies; never leave tables unrestricted

---

## MCP Tools

When Supabase MCP is available, use these tools via `call_mcp_tool` with server `user-supabase`:

| Tool | Purpose |
|------|---------|
| `generate_typescript_types` | Generate DB types from schema (requires `project_id`) |
| `get_project_url` | Get API URL for a project |
| `get_publishable_keys` | Get anon key for a project |
| `list_edge_functions` | List Edge Functions |
| `deploy_edge_function` | Deploy Edge Function (requires `project_id`, `name`, `files`, `verify_jwt`) |
| `get_logs` | Debug logs (service: `api`, `auth`, `postgres`, `edge-function`, etc.) |
| `list_branches`, `create_branch`, `merge_branch` | Branch management |

**Always read the tool schema** before calling (e.g. `mcps/user-supabase/tools/<tool>.json`).

---

## Edge Functions

- Use Deno runtime; entrypoint typically `index.ts`
- Enable `verify_jwt: true` unless the function has custom auth (webhooks, API keys)
- Deploy via MCP `deploy_edge_function` with `files` array containing entrypoint and dependencies

---

## Additional Resources

- For detailed client setup and cookie handling, see [reference.md](reference.md)
