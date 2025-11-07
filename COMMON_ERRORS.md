# Common Build Errors & Solutions

This document tracks common build errors encountered during development and their solutions.

## Next.js 16 with Cache Components

### Error: Route segment config "dynamic" is not compatible with `nextConfig.cacheComponents`

**Error Message:**

```
Route segment config "dynamic" is not compatible with `nextConfig.cacheComponents`. Please remove it.
```

**Cause:**
When using `cacheComponents: true` in `next.config.ts`, you cannot use `export const dynamic = "force-dynamic"` in route files. Cache Components has its own way of handling dynamic routes.

**Solution:**

1. Remove `export const dynamic = "force-dynamic"` from route files
2. For API routes that use `searchParams`, Next.js will automatically detect they need to be dynamic
3. For pages that need dynamic rendering, use `await headers()` or other dynamic functions to force dynamic rendering
4. Do not use `export const runtime = "nodejs"` either - it's also incompatible

**Example:**

```typescript
// ❌ Don't do this with cacheComponents: true
export const dynamic = "force-dynamic";

// ✅ Instead, use dynamic functions
export default async function Page() {
  await headers(); // This forces dynamic rendering
  // ... rest of code
}
```

---

### Error: Route needs to bail out of prerendering because it used `nextUrl.searchParams`

**Error Message:**

```
Route /api/search needs to bail out of prerendering at this point because it used nextUrl.searchParams.
```

**Cause:**
Next.js is trying to prerender API routes during build, but they use `searchParams` which requires dynamic rendering.

**Solution:**
This is actually expected behavior - the error message indicates that Next.js is correctly bailing out of prerendering. The route will work correctly at runtime. However, if you want to suppress the error during build:

1. Ensure the API route handler properly handles the case where searchParams might not be available
2. The route will automatically be treated as dynamic at runtime
3. These warnings during build are informational and don't prevent the build from succeeding (unless there are actual errors)

**Example:**

```typescript
// API route - this will automatically be dynamic
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  // ... rest of handler
}
```

---

### Error: Route has a `generateMetadata` that depends on Request data when the rest of the route does not

**Error Message:**

```
Route "/reports/[id]" has a `generateMetadata` that depends on Request data (`cookies()`, etc...) or uncached external data (`fetch(...)`, etc...) when the rest of the route does not.
```

**Cause:**
When using `cacheComponents: true`, if you have a `generateMetadata` function that fetches data (e.g., from database), but the page component doesn't use the same data fetching pattern, Next.js gets confused about whether the route should be static or dynamic. Additionally, if the route is fully dynamic (requires authentication), Next.js will try to prerender it during build, causing `params` Promise to reject.

**Solution:**

1. **For fully dynamic routes (require auth)**:
   - Remove `generateMetadata` entirely. The route will be dynamic and metadata will be generated at runtime.
   - Add `generateStaticParams` that returns a placeholder param to satisfy Cache Components requirement
   - The placeholder will result in 404, which is handled by the page component
2. **For routes that can be partially static**: Ensure `generateMetadata` handles errors gracefully and returns default metadata
3. Make sure the page component also uses dynamic functions (like `await headers()`) to mark it as dynamic
4. Both `generateMetadata` and the page component should use similar data fetching patterns

**Example - Dynamic Route (No generateMetadata):**

```typescript
// ✅ For fully dynamic routes that require auth
// With Cache Components, must return at least one param
export async function generateStaticParams() {
  // Return a placeholder to satisfy Cache Components requirement
  // This will result in 404, which is handled by the page component
  return [{ id: "__placeholder__dynamic_route__" }];
}

// Don't use generateMetadata - it will cause prerendering issues
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await headers(); // Force dynamic rendering
  const { id } = await params;
  // ... rest of code
}
```

**Example - Partially Static Route (With generateMetadata):**

```typescript
// ✅ Good: generateMetadata handles errors gracefully
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const data = await fetchData(id);

    if (!data) {
      return {
        title: "Not Found | OpenModal",
        description: "The requested resource could not be found.",
      };
    }

    return {
      title: `${data.title} | OpenModal`,
      description: data.description || "Default description",
    };
  } catch (error) {
    // Handle errors gracefully
    console.error("Error generating metadata:", error);
    return {
      title: "Resource | OpenModal",
      description: "View resource details on OpenModal",
    };
  }
}

// ✅ Page component also uses dynamic functions
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await headers(); // Force dynamic rendering
  const { id } = await params;
  // ... rest of code
}
```

---

### Error: Empty generateStaticParams with Cache Components

**Error Message:**

```
When using Cache Components, all `generateStaticParams` functions must return at least one result.
```

**Cause:**
When using `cacheComponents: true`, `generateStaticParams` must return at least one result to allow build-time validation. You cannot return an empty array.

**Solution:**
Return a placeholder param that will result in 404. The page component will handle the 404 case with `notFound()`.

**Example:**

```typescript
// ✅ For fully dynamic routes that shouldn't be statically generated
export async function generateStaticParams() {
  // Return a placeholder to satisfy Cache Components requirement
  // This will result in 404, which is handled by the page component
  return [{ id: "__placeholder__dynamic_route__" }];
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Handle placeholder case
  if (id === "__placeholder__dynamic_route__") {
    notFound();
  }

  // ... rest of code
}
```

---

## TypeScript Errors

### Error: Parameter implicitly has an 'any' type

**Error Message:**

```
Type error: Parameter 'otherField' implicitly has an 'any' type.
```

**Cause:**
TypeScript strict mode requires explicit types for all parameters.

**Solution:**
Add explicit type annotations to function parameters, even if using `any` is necessary for library compatibility.

**Example:**

```typescript
// ❌ Don't do this
children={(otherField) => {
  // ...
}}

// ✅ Do this
children={(otherField: any) => {
  // ...
}}
```

---

### Error: Type 'undefined' is not assignable to type

**Error Message:**

```
Type 'undefined' is not assignable to type '"option1" | "option2" | "option3"'.
```

**Cause:**
Form values can be `undefined` initially, but the schema expects a specific enum type.

**Solution:**

1. Add runtime validation before calling the action
2. Ensure the value is defined before passing it to the function
3. Use type narrowing to satisfy TypeScript

**Example:**

```typescript
// ❌ Don't do this
const result = await action(user.id, formValue);

// ✅ Do this
if (!formValue.requiredField) {
  toast.error("Please fill in required field");
  return;
}

const result = await action(user.id, {
  ...formValue,
  requiredField: formValue.requiredField, // TypeScript now knows it's defined
});
```

---

## General Best Practices

1. **Always handle errors gracefully** in `generateMetadata` functions
2. **Use `await headers()`** to force dynamic rendering when needed with Cache Components
3. **Don't use `export const dynamic`** or `export const runtime` when `cacheComponents: true` is enabled
4. **Add explicit types** to all function parameters, even if using `any`
5. **Validate form data** before calling server actions to prevent TypeScript errors
6. **Handle missing data** in all data fetching functions with proper fallbacks

---

## Related Files

- `next.config.ts` - Contains `cacheComponents: true` configuration
- `src/app/reports/[id]/page.tsx` - Example of proper `generateMetadata` implementation
- `src/app/api/search/route.ts` - Example of API route with searchParams
- `src/components/reports/verification-modal.tsx` - Example of form validation before action call
