# Common Errors & Solutions

This document captures common errors encountered during development and their solutions to avoid repeating them.

## TanStack Router / TanStack Start

### Link Component Type Errors

**Error:** Type errors when using string interpolation in `to` prop

```tsx
// ❌ WRONG - Causes type errors
<Link to={`/capabilities/${slug}`} />

// ❌ WRONG - Route parameters not recognized
<Link to="/capabilities/$slug" params={{ slug }} />
```

**Solution:** Use the proper `to` with `params` pattern for type safety

```tsx
// ✅ CORRECT
<Link
  to="/capabilities/$slug"
  params={{ slug: capability.slug }}
/>

// ✅ CORRECT - Multiple params
<Link
  to="/capabilities/$slug/$subslug"
  params={{
    slug: capability.slug,
    subslug: subtype.slug,
  }}
/>
```

### Route Tree Not Updated

**Error:** TypeScript errors about missing routes after creating new route files

```
Type '`/jobs/${string}`' is not assignable to type '...'
```

**Solution:** The route tree needs to be regenerated. In TanStack Start, this happens automatically via the `@tanstack/router-plugin` during dev/build. If issues persist:

1. Restart the dev server
2. Ensure route files follow the correct naming convention (`$param.tsx` for dynamic routes)

### Loader Data Handling

**Error:** "Possibly undefined" errors when accessing loader data

```tsx
// ❌ WRONG - No null check
const subtype = result.data
console.log(subtype.parentCapability) // Error: possibly undefined
```

**Solution:** Handle errors at the loader level with `notFound()` or `redirect()`

```tsx
// ✅ CORRECT - Throw 404 at loader level
loader: async ({ params }) => {
  const result = await getDataFn({ data: { slug: params.slug } })
  if (!result.success || !result.data) {
    throw notFound() // or throw redirect({ to: '/somewhere' })
  }
  return result
}

// ✅ CORRECT - Component can now safely access data
function Component() {
  const result = Route.useLoaderData()
  const data = result.data // Type-narrowed to exist
}
```

## Drizzle ORM

### Query Result Type Errors

**Error:** `.length` doesn't exist on query result

```tsx
// ❌ WRONG
const [result] = await db.select().from(table).where(eq(table.id, id))
return result.length ? result[0] : null // Error: result.length doesn't exist
```

**Solution:** Don't destructure, use array access

```tsx
// ✅ CORRECT
const result = await db.select().from(table).where(eq(table.id, id))
return result[0] ?? null
```

## TypeScript

### Implicit Any Types in Map/Reduce

**Error:** Parameter implicitly has 'any' type

```tsx
// ❌ WRONG
items.map((item) => item.name)
items.reduce((sum, item) => sum + item.count, 0)
```

**Solution:** Add explicit type annotations

```tsx
// ✅ CORRECT
items.map((item: ItemType) => item.name)
items.reduce((sum: number, item: ItemType) => sum + item.count, 0)
```

### Unused Variables

**Error:** Variable is declared but its value is never read

```tsx
// ❌ WRONG - destructuring unused params
const { slug } = Route.useParams() // slug never used
```

**Solution:** Only destructure what you use

```tsx
// ✅ CORRECT
const result = Route.useLoaderData()
```

## Server Actions

### Wrong Validator Method

**Error:** `.validator() is not a function`

```tsx
// ❌ WRONG
export const myAction = createServerFn({ method: 'POST' }).validator(
  z.object({ id: z.string() }),
)
```

**Solution:** Use `.inputValidator()` instead

```tsx
// ✅ CORRECT
export const myAction = createServerFn({ method: 'POST' }).inputValidator(
  z.object({ id: z.string() }),
)
```

### Wrong HTTP Method

**Error:** Server action with input should use POST not GET

**Solution:** Use `method: 'POST'` when the action accepts input

```tsx
// ✅ CORRECT
export const getBySlug = createServerFn({ method: 'POST' }) // has input
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => { ... })

export const getAll = createServerFn({ method: 'GET' }) // no input
  .handler(async () => { ... })
```

## General Patterns

### Error Response Structure

**Error:** Inconsistent error handling

**Solution:** Always return consistent response structure from server actions:

```tsx
// ✅ CORRECT - Standard response pattern
return {
  success: true,
  data: result,
}

// ✅ CORRECT - Standard error pattern
return {
  success: false,
  error: 'Error message',
}
```

### Imports

**Error:** Unused imports cluttering code

**Solution:** Regularly clean up imports. Most linters will catch this, but be mindful of:

- Drizzle operators: only import what you use (`eq`, `desc`, etc.)
- React hooks: only import what's actually used
- Type-only imports when appropriate: `import type { ... }`

## Route Structure

### File Naming

**Error:** Routes not recognized by TanStack Router

**Solution:** Follow the file-based routing convention:

- `index.tsx` → `/`
- `about.tsx` → `/about`
- `users/$id.tsx` → `/users/:id`
- `users/$id/posts.tsx` → `/users/:id/posts`
- `users/$id/posts/$postId.tsx` → `/users/:id/posts/:postId`

### Nested Routes

**Error:** Layout not applying correctly

**Solution:** Use the `__root.tsx` or folder-based route groups:

- `_authed/route.tsx` → Creates a layout for authed routes
- File-based `_` prefix groups routes without affecting URL
