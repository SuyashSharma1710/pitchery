# Visual Design System & UI Specifications
## Project: Pitchery (YC Directory) — Neo-Brutalism Design Guide

---

## 1. Design Aesthetics & Visual Identity

Pitchery embraces a vibrant **Neo-Brutalist** design language characterized by:
- High-contrast color blocking with hot pink (`#EE2B69`), bright canary yellow (`#FBE843`), deep black borders (`#000000`), and clean canvas white (`#FFFFFF`).
- Distinctive vertical pinstripe background patterns on hero banners.
- Chunky, solid drop shadows without blur (`shadow-[4px_4px_0px_0px_#000000]`).
- Pill-shaped buttons and search bars with prominent black outlines.
- Playful badges with diagonal cut / folded paper visual details.
- Expressive hand-drawn / doodle accent lines (sparkles/energy marks) around key profile containers.

---

## 2. Color Palette & Design Tokens

| Token Name | Hex Code | RGB | Usage |
| :--- | :--- | :--- | :--- |
| **Brand Primary (Hot Pink)** | `#EE2B69` | `238, 43, 105` | Hero background, submit buttons, profile card background, active highlights |
| **Accent Yellow** | `#FBE843` | `251, 232, 67` | Folded ribbon badges, date pills, avatar ring accents, CTA highlights |
| **Accent Yellow Bright** | `#FFE600` | `255, 230, 0` | Secondary badges, hover states |
| **Canvas Background** | `#F7F7F7` | `247, 247, 247` | Main page body background, card interiors |
| **Dark Neutral (Black)** | `#000000` | `0, 0, 0` | All borders, text headings, button fills, brutalist shadows |
| **Charcoal Dark** | `#141413` | `20, 20, 19` | Media preview container backgrounds, contrast cards |
| **Soft Tag Pink** | `#FEE2E2` | `254, 226, 226` | Category pill background in cards and detail views |
| **Pure White** | `#FFFFFF` | `255, 255, 255` | Card backgrounds, input fields, navbar background |
| **Muted Grey** | `#6B7280` | `107, 114, 128` | Placeholder text, date subtitles |

---

## 3. Typography System

### 3.1 Font Families
- **Primary Headings**: `Work Sans` / `Plus Jakarta Sans` / `Archivo Black` (Bold & Black weights: 700, 800, 900).
- **Body & Controls**: `Work Sans` / `Inter` (Regular 400, Medium 500, SemiBold 600).
- **Badges & Labels**: `Work Sans` (Uppercase, ExtraBold 800, Letter spacing `tracking-wider`).

### 3.2 Type Scale
- **Display 1 (Hero Title)**: `text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight`
- **Heading 1 (Section Title)**: `text-2xl md:text-3xl font-extrabold text-black`
- **Heading 2 (Card Title)**: `text-xl md:text-2xl font-bold text-black`
- **Subtitle / Deck**: `text-base md:text-lg font-medium text-black/80`
- **Body Regular**: `text-sm md:text-base font-normal leading-relaxed text-black/90`
- **Tag / Badge Text**: `text-xs font-bold uppercase tracking-wider`

---

## 4. UI Patterns & Key Screens Breakdown

### 4.1 Global Header (Navbar)
- **Background**: Solid `#FFFFFF` with bottom border `border-b-[3px] border-black`.
- **Left**: `YCDirectory` wordmark with 3-ray spark doodle icon.
- **Right**:
  - `Create` link with bold weight.
  - `Logout` / `Login` action in vibrant red/pink text.
  - User Avatar: Circular thumbnail with `2px` black border.

### 4.2 Hero Section with Pinstripes
- **Background**: Hot pink `#EE2B69` overlaid with fine pinstripe CSS gradient:
  ```css
  background-color: #EE2B69;
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 14px,
    rgba(255, 255, 255, 0.22) 14px,
    rgba(255, 255, 255, 0.22) 16px
  );
  ```
- **Folded Tag Badge**:
  - Yellow background `#FBE843`, black border `border-2 border-black`.
  - Folded bottom-right / top-left corner effect created via CSS clip-path or pseudo-elements.
- **Hero Title Box**: Solid black rectangle container `#000000` with white uppercase text.
- **Search Bar**:
  - Pill container (`rounded-full`) with `3px` solid black border and white background.
  - Uppercase placeholder: `SEARCH STARTUP`.
  - Circular search icon button on the right.

### 4.3 Startup Card (Neo-Brutalist Grid Card)
- **Container**: `bg-white border-[3px] border-black rounded-[24px] p-5 shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#EE2B69] transition-all`.
- **Top Row**:
  - Date Pill: `bg-[#FFE4E6] text-black px-3 py-1 rounded-full text-xs font-semibold`.
  - View Count Pill: `flex items-center gap-1 text-xs font-semibold text-black` with eye icon (`👁 232`).
- **Author Row**:
  - Author name (e.g. `Steven Smith`) with small circular avatar.
- **Startup Title**:
  - Bold black heading (e.g. `EcoTrack`).
- **Description**:
  - 2-line clamped summary (`line-clamp-2 text-sm text-gray-700`).
- **Media Thumbnail**:
  - Rounded image container (`rounded-[16px] overflow-hidden border-2 border-black/10 aspect-[16/9] object-cover`).
- **Bottom Row**:
  - Category pill (e.g. `Senior level`, `EdTech`, `Education`).
  - Action Button: Solid black pill `Details` button (`bg-black text-white px-5 py-2 rounded-full font-bold text-xs hover:bg-gray-800`).

### 4.4 Pitch Creation Form (`/startup/create`)
- **Inputs & Textareas**:
  - `bg-white border-[3px] border-black rounded-full px-6 py-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#EE2B69]` (for single line inputs).
  - `rounded-[20px]` for textareas.
  - Labels: Uppercase, bold, tracking-wider (`text-xs font-extrabold text-black mb-2 block`).
- **Rich Markdown Editor**:
  - Custom container with top formatting toolbar (Undo, Redo, Heading dropdown, Bold, Italic, Underline, Lists, Links, Media embed).
  - Clean preview pane with real-time markdown parsing.
- **Submit Button**:
  - `bg-[#EE2B69] text-white border-[3px] border-black rounded-full py-4 px-8 font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[0px] active:translate-y-[0px]`.

### 4.5 Founder Profile Sidebar (`/user/[id]`)
- **Profile Container**:
  - Solid hot pink card (`bg-[#EE2B69] border-[3px] border-black rounded-[28px] p-6 text-center shadow-[6px_6px_0px_0px_#000000] relative`).
  - Three decorative doodle spark rays in upper-left corner.
  - Top Badge: `NATHAN SMITH` in white pill box with black border.
  - Avatar: Circular image inside yellow `#FBE843` ring border.
  - Handle: `@nathansmith` in bold white font.
  - Bio: `Next.js Enthusiast & Educator` in clean white subtitle font.

---

## 5. Micro-Interactions & Responsive Behavior
- **Card Hover**: Subtle 2px lift (`transform: -2px, -2px`) and shadow change to highlight active focus.
- **Button Click**: Physical brutalist depression effect (`transform: translate(2px, 2px)` with shadow reset to `0px 0px`).
- **Search Debounce**: Smooth 300ms debounce with instant URL query synchronization.
- **Mobile Adaptations**:
  - Hero banners scale smoothly with fluid typography.
  - Profile layout switches from 2-column sidebar to stacked cards on viewports < 1024px.
  - Pitch cards adapt seamlessly in a 1-col (mobile) -> 2-col (tablet) -> 3/4-col (desktop) grid.
