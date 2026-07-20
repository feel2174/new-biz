# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `pnpm dev` - Start development server with turbo mode
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run all tests (Vitest)
- `pnpm test:watch` - Run tests in watch mode
- `pnpm vitest run __tests__/lib/utils.test.ts` - Run a single test file
- `pnpm vitest run -t "test name"` - Run a specific test by name

## Architecture Overview

Headless WordPress starter using Next.js 16 App Router with TypeScript.

### Data Layer (`lib/wordpress.ts`)
- All WordPress REST API interactions centralized here
- Type definitions in `lib/wordpress.d.ts` (Post, Page, Category, Tag, Author, FeaturedMedia)
- Two fetch patterns: `wordpressFetch` (throws on error) vs `wordpressFetchGraceful` (returns fallback)
- `WordPressAPIError` class for consistent error handling
- Cache tags for granular revalidation: `['wordpress', 'posts', 'post-{id}', 'posts-page-{n}']`
- Pagination via `getPostsPaginated()` returns `{ data, headers: { total, totalPages } }`
- Default cache: 1 hour (`revalidate: 3600`)
- Graceful degradation: builds succeed even when WordPress is unavailable

### Routing
- Dynamic: `/posts/[slug]`, `/pages/[slug]`
- Archives: `/posts`, `/posts/authors`, `/posts/categories`, `/posts/tags`
- API: `/api/revalidate` (webhook), `/api/og` (OG images)

### Local Content System (biz.zucca100.com)
- Site-specific content lives in `content/posts.json` + `lib/local-posts.ts`, rendered by
  `app/posts/[slug]/page.tsx`'s `LocalPostView` (takes priority over WordPress when a local
  post with the same slug exists).
- CTA buttons and AdSense units are gated to paid ad traffic only via
  `components/traffic/traffic-gate.tsx` (`PaidOnly`, `useTrafficGate`) — direct visits show a
  clean page with no CTA/ads, for ad-review purposes.
- **Before creating or editing a content page or touching the gating system, read
  [`docs/content-page-playbook.md`](./docs/content-page-playbook.md)** — it documents the full
  workflow (research, keyword coverage, compliance rules, verification checklist, git workflow)
  and the known technical pitfalls (CRLF line endings in posts.json, RSC boundary errors for
  onClick, dev server instability). See also
  [`docs/naver-action-landing-template.md`](./docs/naver-action-landing-template.md) for the
  structured `actionGuide` landing template (alternative to the default `contentHtml` +
  `<!--CTA:n-->` marker approach).

### Data Fetching Patterns
- Server Components with parallel `Promise.all()` calls
- `generateStaticParams()` uses `getAllPostSlugs()` for static generation
- URL-based state for search/filters via `searchParams`
- Debounced search (300ms) in `SearchInput` component
- Next.js 15+ async params pattern: `params: Promise<{ slug: string }>`

### Revalidation Flow
1. WordPress plugin sends webhook to `/api/revalidate`
2. Validates `x-webhook-secret` header against `WORDPRESS_WEBHOOK_SECRET`
3. Calls `revalidateTag()` for specific content types (posts, categories, tags, authors)
4. Also calls `revalidatePath("/", "layout")` for full site refresh

### Configuration Files
- `site.config.ts` - Site metadata (domain, name, description)
- `menu.config.ts` - Navigation menu structure (`mainMenu`, `contentMenu`)
- `next.config.ts` - Image remotePatterns, /admin redirect to WordPress, standalone output

### Layout Components (`components/craft.tsx`)
Local copy of craft-ds (v0.3.2) providing layout primitives:
- `Section` - Page sections with vertical padding
- `Container` - Max-width container with horizontal padding
- `Article` - Prose container for WordPress content (max-width prose)
- `Prose` - Typography styles for rich content
- `Box` - Flex/grid layout with responsive props

### Utility Functions
- `lib/utils.ts` - `cn()` function for merging Tailwind classes (clsx + tailwind-merge)
- `lib/metadata.ts` - `generateContentMetadata()` for SEO metadata, `stripHtml()` for excerpt cleaning

### Testing (`__tests__/`)
- Vitest with `@` path alias matching `tsconfig.json`
- Tests mirror source structure: `__tests__/lib/utils.test.ts` tests `lib/utils.ts`
- Tests cover: `lib/utils`, `lib/metadata`, `lib/wordpress`, `api/revalidate`
- WordPress API tests mock `global.fetch` to avoid external calls

## Code Style

### TypeScript
- Strict typing with interfaces from `lib/wordpress.d.ts`
- Async params: `params: Promise<{ slug: string }>` (Next.js 15+ pattern)

### Naming
- Components: PascalCase (`PostCard.tsx`)
- Functions/variables: camelCase
- Types/interfaces: PascalCase

### File Structure
- Pages: `/app/**/*.tsx`
- UI components: `/components/ui/*.tsx` (shadcn/ui)
- Feature components: `/components/posts/*.tsx`, `/components/theme/*.tsx`
- WordPress functions must include cache tags

## Environment Variables
```
WORDPRESS_URL="https://example.com"      # Full WordPress URL
WORDPRESS_HOSTNAME="example.com"          # For Next.js image optimization
WORDPRESS_WEBHOOK_SECRET="secret-key"     # Webhook validation
```

## Key Dependencies
- Next.js 16 with React 19
- Tailwind CSS v4 with `@tailwindcss/postcss`
- shadcn/ui components (Radix primitives)
- craft-ds for layout (`Section`, `Container`, `Article`, `Prose`)
