<div align="center">

# 🚀 Pitchery

### *Pitch your startup, connect with entrepreneurs, and get noticed.*

[![Next.js](https://img.shields.io/badge/Next.js-15%20(App%20Router)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Neon Database](https://img.shields.io/badge/Neon-Serverless%20PostgreSQL-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-EE2B69?style=for-the-badge)](#license)

</div>

---

## 📖 Overview

**Pitchery** is a full-stack, high-energy startup pitch and discovery platform designed with a bold **Neo-Brutalist** aesthetic. Founders can submit startup pitches in under 3 minutes with rich markdown storytelling, showcase demo media, collect community feedback and upvotes, and receive direct inquiries from investors, partners, and early adopters through a private 1-on-1 inbox.

Built on **Next.js 15 (App Router)** and **Neon Serverless PostgreSQL**, Pitchery enforces **SOLID principles** and Clean Architecture across its service layers, complete with dual-mode data persistence (Neon PostgreSQL + In-Memory repository fallback).

---

## ✨ Key Features

### 🔍 1. Startup Discovery & Exploration Hub
- **Neo-Brutalist Home Feed**: Striped hero banner (`#EE2B69`), folded tag ribbons, live search bar with real-time query parameter synchronization.
- **Explore & Filter Studio (`/explore`)**: Filter breakthrough pitches by category (*AI, SaaS, EdTech, FinTech, Health, Climate*), search across titles, summaries, and founder bios.
- **Dynamic Sorting Strategies**: Sort by *Most Popular (Views)*, *Newest First*, *Oldest First*, or *Alphabetical (A-Z)* using pluggable strategy engines.

### ✍️ 2. Pitch Creation & Rich Markdown Studio
- **Protected Pitch Studio (`/startup/create`)**: Auth-guarded pitch submission with real-time Zod schema validation.
- **Interactive Markdown Editor**: Custom formatting toolbar (H1-H3, Bold, Italic, Strikethrough, Code, Blockquotes, Ordered/Unordered Lists, Links, Image embeds) with split preview mode.
- **Pitch CRUD Management**: Full author permissions to update or delete pitches (`/startup/[id]/edit`) with cache invalidation.

### 🚀 3. Pitch Details Showcase & Community Engagement
- **Showcase Container (`/startup/[id]`)**: High-resolution demo media banners, founder metadata badges, and sanitized markdown breakdown powered by `react-markdown` and `rehype-sanitize`.
- **Atomic Real-Time Views Tracker**: Non-blocking atomic view incrementing with zero row-locking contention.
- **Similar Startups**: Context-aware recommendation engine filtering pitches by matching category.
- **Public Discussion Section**: Community comments with **React 19 optimistic updates** (`useOptimistic`) and author moderation.

### 📬 4. Private Founder 1-on-1 Reach-Out Inbox
- **Direct Inquiry Modal**: Prospective investors and collaborators can send private messages directly to startup founders.
- **Dual-Pane Inbox View (`/user/[id]?tab=inbox`)**: Private messaging dashboard with unread counters, instant read status toggles via optimistic transitions, and 1-click `mailto:` reply triggers.

### 👤 5. Founder Onboarding & Profile Hub
- **3-Step Registration Wizard**: Account credentials $\rightarrow$ Persona selection (*Founder, Investor, Builder*) $\rightarrow$ Avatar selector (DiceBear presets + custom URL input with live badge preview).
- **1-Click Quick Demo Logins**: Instant demo switcher for pre-seeded founder profiles (*Sarah Connor, Alex Rivera, Maya Lin*).
- **Founder Profile Showcase (`/user/[id]`)**: Brutalist profile card, bio customizer, and tabbed view for published pitches & private messages.

---

## 🏗️ Architecture & SOLID Principles

Pitchery is structured following **Domain-Driven Design (DDD)** and **SOLID design principles**:

```mermaid
graph TD
    Client[Next.js 15 Client & Server Components] -->|Server Actions| SA[Actions Layer src/lib/actions.ts]
    SA -->|Injects| Container[DI Container src/core/container.ts]
    Container --> Services[Pure Domain Services src/services/]
    Services --> Repos[Repository Interfaces src/core/interfaces/]
    Repos --> DrizzleRepo[Neon PostgreSQL via Drizzle ORM]
    Repos -.-> InMemoryRepo[In-Memory Repository Fallback]
```

- **Single Responsibility Principle (SRP)**: Each domain service ([`AuthService`](file:///c:/Users/priya/OneDrive/Desktop/my-work/pitchery/src/services/auth.service.ts), [`StartupService`](file:///c:/Users/priya/OneDrive/Desktop/my-work/pitchery/src/services/startup.service.ts), [`CommentService`](file:///c:/Users/priya/OneDrive/Desktop/my-work/pitchery/src/services/comment.service.ts), [`MessageService`](file:///c:/Users/priya/OneDrive/Desktop/my-work/pitchery/src/services/message.service.ts)) manages a single, focused boundary of business rules.
- **Open/Closed Principle (OCP)**: Filter and sorting engines ([`startup-filter.strategy.ts`](file:///c:/Users/priya/OneDrive/Desktop/my-work/pitchery/src/core/strategies/startup-filter.strategy.ts), [`startup-sort.strategy.ts`](file:///c:/Users/priya/OneDrive/Desktop/my-work/pitchery/src/core/strategies/startup-sort.strategy.ts)) allow extending search and ordering predicates without modifying repository code.
- **Liskov Substitution Principle (LSP)**: Concrete repositories (`Drizzle*Repository` and `InMemory*Repository`) implement the same interfaces and can be swapped seamlessly based on database connectivity.
- **Interface Segregation Principle (ISP)**: Granular interfaces located in [`src/core/interfaces/`](file:///c:/Users/priya/OneDrive/Desktop/my-work/pitchery/src/core/interfaces/) ensure consumers only depend on methods they use.
- **Dependency Inversion Principle (DIP)**: High-level modules and services depend on abstractions, with dependencies injected via the central Service Container ([`src/core/container.ts`](file:///c:/Users/priya/OneDrive/Desktop/my-work/pitchery/src/core/container.ts)).

---

## 🗄️ Database Schema

Defined in [`src/db/schema.ts`](file:///c:/Users/priya/OneDrive/Desktop/my-work/pitchery/src/db/schema.ts) using **Drizzle ORM**:

```mermaid
erDiagram
    USERS ||--o{ STARTUPS : authors
    USERS ||--o{ COMMENTS : writes
    USERS ||--o{ REACHOUTS : receives
    STARTUPS ||--o{ COMMENTS : contains
    STARTUPS ||--o{ REACHOUTS : referenced_in
    USERS ||--o{ VOTES : casts
    STARTUPS ||--o{ VOTES : receives

    USERS {
        text id PK
        varchar name
        varchar username UK
        varchar email UK
        text password_hash
        text image
        text bio
        timestamp created_at
        timestamp updated_at
    }

    STARTUPS {
        text id PK
        varchar title
        varchar slug UK
        text description
        varchar category
        text image
        text pitch
        integer views
        text author_id FK
        timestamp created_at
        timestamp updated_at
    }

    COMMENTS {
        text id PK
        text startup_id FK
        text user_id FK
        text content
        timestamp created_at
    }

    REACHOUTS {
        text id PK
        text sender_id FK
        text receiver_id FK
        text startup_id FK
        varchar sender_name
        varchar sender_email
        varchar subject
        text message
        boolean is_read
        timestamp created_at
    }

    VOTES {
        text id PK
        text user_id FK
        text startup_id FK
        timestamp created_at
    }
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server Actions, React 19) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Database** | [Neon Serverless PostgreSQL](https://neon.tech/) (`@neondatabase/serverless`) |
| **ORM / Migrations** | [Drizzle ORM](https://orm.drizzle.team/) (`drizzle-orm`, `drizzle-kit`) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom Neo-Brutalist design tokens |
| **Markdown Processing** | `@uiw/react-md-editor`, `react-markdown`, `remark-gfm`, `rehype-sanitize` |
| **Security & Auth** | Web Crypto SHA-256 password hashing & secure HTTP-only cookies |
| **Validation** | [Zod](https://zod.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 🎨 Neo-Brutalist Design System

Pitchery incorporates a distinctive, playful Neo-Brutalist design language:
- **Palette**: `#EE2B69` (Electric Pink), `#FBE843` (Vibrant Yellow), `#141413` (Charcoal Black), `#F8F8F8` (Canvas Light).
- **Hard Box Shadows**: `shadow-[4px_4px_0px_0px_#000000]`, `shadow-[6px_6px_0px_0px_#000000]`.
- **Borders**: 2px & 3px solid black outlines with rounded pill controls.
- **Pinstripe Texture**: Repeating SVG/CSS linear gradient pinstripe banner utility (`bg-pinstripe`).
- **Folded Ribbons**: Custom geometric badges with triangle fold shadows (`tag-folded`).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.18.0` or later
- **npm**, **pnpm**, or **yarn**
- A **Neon PostgreSQL** database connection string (or run in In-Memory fallback mode)

### 1. Clone the Repository
```bash
git clone https://github.com/SuyashSharma1710/pitchery.git
cd pitchery
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory (refer to [`.env.example`](file:///.env.example)):

```env
# Neon Serverless PostgreSQL Connection String
DATABASE_URL="postgresql://user:password@ep-sample-project.neon.tech/neondb?sslmode=require"

# Session Secret Key
SESSION_SECRET="your-super-secret-32-character-key"
```

### 4. Push Database Schema & Seed Data
```bash
# Push schema to Neon PostgreSQL
npm run db:push

# Seed database with realistic startup pitches & demo accounts
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Runs the built production server |
| `npm run lint` | Runs ESLint to check for code quality and type safety |
| `npm run db:push` | Pushes the Drizzle schema directly to Neon PostgreSQL |
| `npm run db:studio` | Launches Drizzle Studio for visual database management |
| `npm run seed` | Seeds Neon DB with realistic pitches, demo founders, and discussions |

---

## 📂 Project Directory Structure

```
pitchery/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx            # Login & Quick Demo Switcher
│   │   │   └── register/page.tsx         # 3-Step Founder Onboarding
│   │   ├── explore/                      # Pitches Filter & Search Studio
│   │   ├── startup/
│   │   │   ├── [id]/                     # Pitch Showcase & Details
│   │   │   └── create/                   # Protected Pitch Submission Studio
│   │   ├── user/[id]/                    # Founder Profile & Private Inbox
│   │   ├── globals.css                   # Neo-brutalist theme utilities
│   │   ├── layout.tsx                    # Root Layout & Global Navigation
│   │   └── page.tsx                      # Discovery Feed & Hero Banner
│   ├── components/
│   │   ├── auth/                         # Wizard Onboarding step components
│   │   ├── comments/                     # Public Discussion & Optimistic comments
│   │   ├── explore/                      # Filter bars & sorting controls
│   │   ├── inbox/                        # Private 1-on-1 reach-out inbox reader
│   │   ├── reachout/                     # Founder reach-out modal
│   │   ├── startup/                      # Startup actions & delete modals
│   │   ├── markdown-editor.tsx           # Rich Markdown editing studio
│   │   ├── markdown-renderer.tsx         # Sanitized safe Markdown viewer
│   │   ├── navbar.tsx                    # Global Brutalist Header & Auth state
│   │   └── startup-card.tsx              # Neo-brutalist Pitch Card
│   ├── core/
│   │   ├── container.ts                  # Dependency Inversion Container (DI)
│   │   ├── interfaces/                   # Segregated Repository & Service Interfaces
│   │   ├── security/                     # WebCrypto SHA-256 Hasher
│   │   ├── session/                      # Edge-compatible Session Manager
│   │   └── strategies/                   # Startup Filter & Sort Strategy Engines
│   ├── db/
│   │   ├── index.ts                      # Neon Connection Pool & Drizzle client
│   │   ├── schema.ts                     # Relational Drizzle schema definitions
│   │   └── seed.ts                       # Realistic startup pitches & seed data
│   ├── lib/
│   │   ├── actions.ts                    # Segregated Server Actions
│   │   ├── auth.ts                       # Current user auth helper
│   │   ├── session.ts                    # Secure HTTP-only cookie handlers
│   │   ├── utils.ts                      # Formatting & helper utilities
│   │   └── validation.ts                 # Zod validation schemas
│   ├── repositories/
│   │   ├── drizzle/                      # Neon PostgreSQL Drizzle implementations
│   │   └── in-memory/                    # In-Memory fallback repositories
│   ├── services/                         # Pure business logic domain services
│   └── types/                            # Shared TypeScript interfaces
├── drizzle.config.ts                     # Drizzle Kit migration configuration
├── next.config.ts                        # Next.js image domain whitelists
├── package.json
└── tsconfig.json
```

---

## 🛡️ Security & Performance

- **Sanitized Markdown**: Strict client & server markdown sanitization using `rehype-sanitize` prevents XSS attacks.
- **Parameterized Queries**: All database queries are fully parameterized via Drizzle ORM to eliminate SQL injection vulnerabilities.
- **Server-Side Validation**: Every Server Action validates payloads against strict Zod schemas before database execution.
- **Optimistic UI Transitions**: Instant feedback for comments and inbox read status using React 19 `useOptimistic` and `useTransition`.
- **Edge Caching & Connection Pooling**: Neon HTTP connection caching ensures zero TCP overhead during serverless invocations.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
