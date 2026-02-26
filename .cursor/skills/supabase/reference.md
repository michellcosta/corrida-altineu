# Supabase Reference

## Client Setup Details

### Browser Client (`lib/supabase/browserClient.ts`)

Uses `createBrowserClient` from `@supabase/ssr`. Cookies are handled automatically in the browser. Use in Client Components only.

### Server Client (`lib/supabase/serverClient.ts`)

Uses `createServerClient` with `cookies()` from `next/headers`. Requires `get`, `set`, and `remove` cookie handlers. Use in Server Components, Server Actions, and API routes.

### Middleware

Uses `createServerClient` with request/response cookie handling. Must pass `request.cookies` for `get` and update `response.cookies` in `set`/`remove` to persist session changes.

---

## Service Role Client

`createServiceClient()` bypasses RLS. Use only for:
- Admin user management
- Bulk data operations
- Reports that need full data access

Requires `SUPABASE_SERVICE_ROLE_KEY`. Never expose in client bundles.

---

## Common Query Helpers

```typescript
// Single row
const { data, error } = await supabase.from('table').select('*').eq('id', id).single()

// With relations
const { data } = await supabase.from('pages').select('*, sections(*)').eq('slug', slug).single()

// Insert
const { data, error } = await supabase.from('table').insert({ col: value }).select().single()

// Update
const { error } = await supabase.from('table').update({ col: value }).eq('id', id)

// Upsert
const { data, error } = await supabase.from('table').upsert(payload, { onConflict: 'id' })
```

---

## Auth Helpers

```typescript
// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password })

// Sign out
await supabase.auth.signOut()

// Sign in with OAuth
await supabase.auth.signInWithOAuth({ provider: 'google' })
```
