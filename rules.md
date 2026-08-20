# Engineering Standards & Development Rules
## Project: Pitchery (YC Directory)

---

## 1. Core Development Philosophy
1. **Type Safety First**: Zero `any` types allowed. All inputs, DB queries, Server Actions, and API responses must have strict TypeScript types.
2. **Server-First by Default**: Default to React Server Components (RSC) unless interactive browser state (forms, rich markdown editing, client search debounce, upvoting) is strictly necessary.
3. **Pixel-Perfect Neo-Brutalism**: Strict adherence to the design tokens (2px/3px black borders, #000 hard drop shadows, custom pinstripe patterns, and vibrant accents). No generic styling.
4. **Resilient Data Layer**: All mutations must go through validated Server Actions with Zod schemas and parameterized SQL execution via Drizzle ORM on Neon.

---

## 2. Next.js 15 & React 19 Best Practices
- **Route Organization**:
  - Keep route handlers and page files thin. Delegate business logic to `src/lib/actions.ts` or `src/db/queries.ts`.
  - Use parallel/nested layouts where appropriate to minimize layout shifts.
- **Client vs Server Component Boundary**:
  - Only mark components with `'use client'` when using hooks (`useState`, `useEffect`, `useActionState`, `useRef`), event listeners (`onClick`, `onChange`), or browser APIs.
  - Pass server data as props into client islands.
- **Image Optimization**:
  - Use `next/image` with explicit `width`, `height`, and `sizes` attributes for all pitch thumbnails and avatars.
  - Whitelist remote image domains in `next.config.ts` (e.g., Unsplash, GitHub avatars, Cloudinary, YouTube thumbnails).

---

## 3. Database & Neon PostgreSQL Rules
- **Connection Management**:
  - Use `@neondatabase/serverless` with HTTP connection caching enabled (`neonConfig.fetchConnectionCache = true`).
  - Do not create multiple singleton instances of the database client. Export a single instance from `src/db/index.ts`.
- **Query Optimization**:
  - Always add database indexes on frequently queried fields (`category`, `author_id`, `created_at`, `slug`).
  - Use atomic SQL expressions for counters: `sql`${startups.views} + 1`` to prevent race conditions during concurrent views.
- **Data Migrations & Seeding**:
  - Schema changes must be tracked through `drizzle-kit generate` and applied via `drizzle-kit push` or `migrate`.
  - Maintain a reproducible seed script (`src/db/seed.ts`) with high-fidelity realistic startup pitches.

---

## 4. UI & Neo-Brutalism Styling Guidelines
- **Color Discipline**:
  - Primary Pink: `#EE2B69`
  - Accent Yellow: `#FBE843`
  - Background Light: `#F7F7F7`
  - Base Dark / Text / Borders: `#000000` / `#141413`
  - Tag Pill Background: `#FFE4E6` / `#FEF08A`
- **Borders & Shadows**:
  - Standard border: `border-[3px] border-black` or `border-2 border-black`.
  - Hard drop shadow utility: `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` or `shadow-[6px_6px_0px_0px_#000]`.
  - On hover: `hover:shadow-[6px_6px_0px_0px_#EE2B69]` or `hover:translate-x-[-2px] hover:translate-y-[-2px]`.
- **Typography & Font Pairing**:
  - Headlines: Bold sans-serif (`Work Sans` / `Plus Jakarta Sans` / `Archivo Black`).
  - Body: Crisp readable sans (`Inter` / `Work Sans`).
  - Badges & Tags: Uppercase, tracking-wider, font-black.

---

## 5. Security & Input Sanitization
- **Markdown Security**:
  - Never use `dangerouslySetInnerHTML` directly with raw markdown.
  - Render user markdown using `react-markdown` with `remark-gfm` and strict sanitization via `rehype-sanitize`.
- **Form & Server Action Validation**:
  - Every form submission must pass Zod schema verification before reaching the database.
  - Sanitize URLs for `image` and demo media links to prevent `javascript:` payload injection.

---

## 6. Git & Code Quality Standards
- **Commit Messages**: Follow Conventional Commits format (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).
- **Linting & Formatting**: Ensure zero ESLint errors and format with Prettier.
- **Error Boundaries**: Wrap key view components in Next.js `error.tsx` and `loading.tsx` skeletons to ensure graceful fallbacks during network latency.
