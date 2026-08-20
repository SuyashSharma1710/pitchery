# Project State & Architecture Memory
## Project: Pitchery

---

## 1. Project Overview & Identity
- **Repository Name**: `pitchery`
- **Application Brand**: `Pitchery` (PITCH, VOTE, AND GROW)
- **Tagline**: `PITCH YOUR STARTUP, CONNECT WITH ENTREPRENEURS`
- **Core Value Proposition**: A full-stack Neo-Brutalist startup pitch platform powered by Next.js 15 App Router and Neon Serverless PostgreSQL, featuring account creation & login, protected pitch creation, founder pitch CRUD, public commenting threads, and private 1-on-1 reach-out inboxes.

---

## 2. Tech Stack & Environment Specification
- **Framework**: Next.js 15 App Router (React 19)
- **Language**: TypeScript 5 (Strict Mode, 0 Errors)
- **Database**: Neon Serverless PostgreSQL (`ep-royal-hat-az3bminf.c-3.ap-southeast-1.aws.neon.tech`)
- **Architecture**: SOLID Principles (Domain Services, Segregated Interfaces, Dependency Inversion)
- **Authentication**: Native Web Crypto session tokens with secure HTTP-only cookies, `/login`, `/register`, and 1-click Demo switchers
- **Styling**: Tailwind CSS + Neo-Brutalist tokens (`#EE2B69` pink, `#FBE843` yellow, pinstripes, folded ribbon tags, brutalist drop shadows)
- **Markdown Studio**: MarkdownEditor with custom live toolbar + sanitized ReactMarkdown renderer

---

## 3. Database Schema Status (Live on Neon PostgreSQL)
- ✅ `users`: `id`, `name`, `username`, `email`, `password_hash`, `image`, `bio`, `created_at`, `updated_at`
- ✅ `startups`: `id`, `title`, `slug`, `description`, `category`, `image`, `pitch`, `views`, `author_id`, `created_at`, `updated_at`
- ✅ `comments`: `id`, `startup_id`, `user_id`, `content`, `created_at` (with `comment_startup_idx`, `comment_user_idx`)
- ✅ `reachouts`: `id`, `sender_id`, `receiver_id`, `startup_id`, `sender_name`, `sender_email`, `subject`, `message`, `is_read`, `created_at` (with `reachout_receiver_idx`, `reachout_sender_idx`, `reachout_read_idx`)
- ✅ `votes`: `id`, `user_id`, `startup_id`, `created_at` (compound index)

---

## 4. SOLID Architecture Structure
- `src/core/interfaces/` -> `auth.interface.ts`, `startup.interface.ts`, `comment.interface.ts`, `message.interface.ts` (ISP)
- `src/services/` -> `auth.service.ts`, `startup.service.ts`, `comment.service.ts`, `message.service.ts` (SRP, OCP, DIP)
- `src/lib/actions.ts` -> Segregated Server Actions for Auth, Pitch CRUD, Comments, and Reachout
- `src/lib/session.ts` -> Edge-compatible secure session cookie manager

---

## 5. UI/UX Views & Flow Status
1. **Explore Feed (`/`)**: Pinstripes hero, `PITCH YOUR STARTUP, CONNECT WITH ENTREPRENEURS`, search bar, live startup cards.
2. **Submit Pitch Studio (`/startup/create`)**: Protected with Auth Guard -> redirects unauthenticated users to `/login`.
3. **Pitch Details Showcase (`/startup/[id]`)**: Date badge, video/media banner, author info, Markdown pitch, Reach Out to Founder button, Author Actions (Edit/Delete), Public Comment Section, and Similar Startups.
4. **Edit Pitch Studio (`/startup/[id]/edit`)**: Pre-populated markdown studio, author verification guard.
5. **Founder Profile Hub (`/user/[id]`)**: Founder profile card, Tab switching (**"All Pitches"** and **"Private Inbox"** with unread count badge), Reach Out modal for visitors.
6. **Authentication (`/login`, `/register`)**: Neo-brutalist authentication views with 1-click Quick Demo logins.
