# Product Requirements Document (PRD)
## Project: Pitchery — Startup Pitch & Discovery Platform

---

## 1. Executive Summary
**Pitchery** is a high-energy, community-driven platform designed for founders to pitch their startups, connect with entrepreneurs, and gain visibility from investors and early adopters. Featuring a distinctive Neo-brutalist aesthetic with playful pinstripes, bold badges, and high-contrast typography, Pitchery simplifies the pitch submission process with markdown-powered pitch storytelling, live view tracking, categorized startup directories, and rich founder portfolios.

The platform is engineered using **Next.js 15 (App Router)** for fast edge rendering and SEO, paired with **Neon Serverless PostgreSQL** for resilient, scalable data persistence.

---

## 2. Product Objectives & Success Metrics
### 2.1 Core Objectives
1. **Frictionless Pitch Submission**: Enable founders to submit startup pitches in under 3 minutes with rich markdown explanations and embedded media.
2. **Engaging Startup Discovery**: Provide a visually striking directory where visitors can search, filter by category, explore similar startups, and track view counts.
3. **Founder Showcase**: Deliver personalized founder profiles highlighting all projects submitted by the user.
4. **Blazing-Fast Performance**: Achieve sub-second page loads leveraging Next.js Server Components (RSC) and Neon serverless database pooling.

### 2.2 Key Performance Indicators (KPIs)
- Total Pitches Published & Active Founder Ratio.
- Search-to-View Conversion Rate.
- Platform Performance (Lighthouse Score > 95 in Performance, Accessibility, and SEO).
- User Engagement: Average view counts and return visitor frequency.

---

## 3. User Personas
### 3.1 The Startup Founder (Creator)
- **Profile**: Indie hacker, early-stage entrepreneur, or developer launching a new product.
- **Goals**: Wants to pitch an MVP, get immediate feedback, gain traffic, and build social proof.
- **Pain Points**: Complex launch platforms with high barrier to entry, lack of formatting flexibility, poor mobile optimization.

### 3.2 The Explorer / Investor / Peer (Consumer)
- **Profile**: Tech enthusiast, developer, angel investor, or product hunter.
- **Goals**: Discover innovative startups, explore niche categories (AI, EdTech, SaaS, Health), and connect with founders.
- **Pain Points**: Cluttered directories, outdated listings, lack of detailed pitch context.

---

## 4. Feature Specifications

### 4.1 Navigation & Global Header
- **Brand Identity**: "YCDirectory" logo with dynamic spark/lightning emblem.
- **Navigation Links**:
  - `Create` link (directs to pitch creation form).
  - Authentication control: `Login` (via GitHub OAuth) or `Logout` when authenticated.
  - User Avatar thumbnail linked to `/user/[id]`.

### 4.2 Home / Pitch Discovery Hub (`/`)
- **Hero Banner**:
  - Textured hot pink background (`#EE2B69`) with fine vertical pinstripes.
  - Yellow badge (`#FBE843` / `#FFE600`) with folded tag: `PITCH, VOTE, AND GROW`.
  - Main Headline: `PITCH YOUR STARTUP, CONNECT WITH ENTREPRENEURS`.
  - Subheadline: `Submit Ideas, Vote on Pitches, and Get Noticed in Virtual Competitions`.
  - **Live Search Bar**: Pill-shaped input with black outline, real-time query parameter synchronization, instant search across titles, descriptions, and categories.
- **Startups Feed Grid**:
  - Section title: `Recommended startups` / `Search results for "{query}"`.
  - **Neo-Brutalist Startup Card**:
    - Header: Date pill (e.g., `20 May, 2023`) and real-time view counter pill (`👁 232`).
    - Author details: Founder name and clickable avatar leading to founder profile.
    - Startup Title: Large bold text linking to pitch details.
    - Summary Description: 2-3 lines truncated snippet.
    - Media Thumbnail: Demo banner/screenshot with rounded container.
    - Card Footer: Category badge pill (e.g. `Education`, `Senior level`, `EdTech`) and black pill `Details` action button.
    - Interactive Hover State: Pink accent glow/border and micro-lift effect.

### 4.3 Pitch Creation Studio (`/startup/create`)
- **Hero Banner**: Hot pink pinstripe banner with high-contrast black badge: `SUBMIT YOUR STARTUP PITCH`.
- **Form Inputs**:
  - `TITLE`: Text input with placeholder `e.g. JSM Academy Masterclass`.
  - `DESCRIPTION`: Textarea for concise one-liner/summary.
  - `CATEGORY`: Text input with helper suggestion (e.g., `Tech, Health, Education, SaaS`).
  - `IMAGE/VIDEO LINK`: URL input for promotional media, YouTube demo, Loom recording, or image asset.
  - `PITCH (Rich Markdown Editor)`:
    - Formatting Toolbar: Undo/Redo, Heading select (H1-H3), Bold, Italic, Underline, Blockquote, Lists, Links, Image embed.
    - Live Markdown preview / split editing mode.
  - `SUBMIT YOUR PITCH` Button: Hot pink pill button with submit paper airplane icon, loading spinner, and error toast feedback.

### 4.4 Startup Pitch Details Page (`/startup/[id]`)
- **Hero Section**:
  - Yellow date badge with folded banner styling.
  - Large Startup Title and Elevator Pitch Subtitle.
- **Showcase Media Container**:
  - High-resolution demo player or styled dark container with responsive aspect ratio.
- **Founder Profile & Category Row**:
  - Circular avatar, Founder display name, handle (e.g. `@yashbhardwaj56`), and soft pink category pill.
- **Pitch Breakdown (Markdown Body)**:
  - Custom styled typography (headings, bold text, blockquotes, lists, code blocks, tables).
- **Engagement & Similar Startups**:
  - Real-time view count incrementer.
  - "Similar startups" recommendation carousel/grid filtered by matching category.

### 4.5 Founder Profile Page (`/user/[id]`)
- **Profile Card (Left Sidebar)**:
  - Hot pink Neo-brutalist container with thick black border and doodle spark accents.
  - Top badge: `[FOUNDER NAME]`.
  - Circular avatar with yellow ring background.
  - User handle `@username` and bio snippet.
- **Founder's Pitches Grid (Right Column)**:
  - Responsive grid of all startups created by the user.
  - Full card controls, live view counters, and details modal/navigation.

---

## 5. Non-Functional & Technical Requirements
- **Performance**: Edge caching for public pages, Incremental Static Regeneration (ISR) or on-demand revalidation on pitch submission.
- **Security**:
  - Sanitized markdown rendering via `rehype-sanitize` to eliminate XSS risks.
  - Server-side Zod validation on all Server Actions.
  - SQL injection immunity via parameterized queries in Drizzle ORM.
- **Accessibility**: High color contrast (AAA standard for text on brutalist backgrounds), ARIA attributes for interactive elements.
- **Responsive Design**: Flawless experience across mobile (320px+), tablet (768px+), and desktop (1024px-1920px).
