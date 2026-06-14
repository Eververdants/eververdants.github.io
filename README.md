# Eververdants Portfolio

> *Where digital craft meets artistic expression — a curated realm of projects, code, and creative endeavors.*

---

**Eververdants Portfolio** is a meticulously crafted personal showcase platform — an immersive digital space that presents a diverse body of work spanning software engineering, interactive media, and creative arts. From full-stack applications and UI component libraries to photography, calligraphy, and video production, this portfolio embodies a philosophy of continuous creation and refined craftsmanship.

---

## ✦ Contents

- [Overview](#overview)
- [Design Philosophy](#design-philosophy)
- [Features](#features)
- [Architectural Landscape](#architectural-landscape)
- [Technology Constellation](#technology-constellation)
- [Project Topography](#project-topography)
- [Quick Start](#quick-start)
- [Content Stewardship](#content-stewardship)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

This is not merely a portfolio. It is a living archive — a cross-section of a creator's journey where every project, every photograph, every line of code tells a story. The website is conceived as a full-screen, scroll-driven experience, where each vertical sweep unveils a new chapter: an introduction to the creator, a showcase of selected works, and a gateway to connect across platforms.

Built with React and TypeScript, animated with GSAP and Framer Motion, and styled with Tailwind CSS, the site balances visual richness with performance, delivering a seamless experience across devices.

---

## Design Philosophy

The design of this portfolio is guided by several core principles:

**Immersive Navigation** — The full-screen paradigm eschews traditional scrolling in favor of discrete, chapter-like transitions. Each screen is a self-contained narrative, revealed with deliberate pacing and fluid motion.

**Bilingual Symmetry** — English and Chinese coexist as equals throughout the interface, reflecting a dual-cultural identity. Language toggling is seamless and preserves state across navigation.

**Atmospheric Aesthetics** — A warm, earthy palette accented with amber and forest tones. Typography pairs the geometric clarity of Outfit with the utilitarian precision of Geist Sans and Geist Mono.

**Interactive Intimacy** — Custom cursor effects, 3D card tilts, parallax depth, and shimmering borders transform static content into a tactile, responsive surface.

**Dark Harmony** — A fully realized dark mode that inverts the warmth without losing contrast or atmosphere, ensuring comfort in any lighting.

---

## Features

- **Full-Screen Scroll Experience** — Four vertically stacked screens (Hero, About, Projects, Connect) navigated via scroll, touch, or keyboard, driven by GSAP transitions.
- **Bilingual Interface** — Complete English/Simplified Chinese toggle with persistent state and localized content across all sections.
- **Project Showcase** — Curated project cards with detailed pages, including full descriptions, technology tags, feature highlights, and external links.
- **Social Platform Integration** — Interactive cards for Bilibili, Douyin, GitHub, QQ, and WeChat, each with platform-specific gradients and hover effects. The WeChat card features an animated QR code reveal for friend connection.
- **WeChat QR Code Interaction** — Hover over the WeChat card to reveal a friend QR code with a non-linear expansion animation. An appreciation QR code floats at the bottom-left with a rotating gold border, pulse rings, and orbiting coin particles.
- **Blog & Articles** — A dedicated blog section with Markdown rendering, reading time estimates, and tag-based filtering.
- **Video Gallery** — Curated video content with embedded Bilibili players, categorized by type, with detailed descriptions and related content links.
- **Responsive Design** — Fully adaptive layout from mobile to widescreen, with tailored navigation and content density at every breakpoint.
- **Dark Mode** — Elegant dark theme with carefully adjusted color palettes that maintain visual hierarchy and readability.
- **Adaptive Cursor** — A custom cursor with glow effects and interactive feedback on hoverable elements, enhancing the tactile quality of the interface.
- **Dynamic Tag Filtering** — Projects, blog posts, and videos can be filtered by tags for rapid discovery.

---

## Architectural Landscape

```
eververdants.github.io/
├── public/                    # Static assets served at root
│   ├── images/                # QR codes, social assets
│   ├── projects/              # Project cover images
│   ├── photography/           # Photography works
│   ├── calligraphy/           # Calligraphy pieces
│   └── blog/                  # Blog illustrations
├── src/
│   ├── components/
│   │   ├── fullscreen/        # Full-screen site screens
│   │   │   ├── HeroScreen.tsx         # Landing screen
│   │   │   ├── AboutScreen.tsx        # About the creator
│   │   │   ├── ProjectsScreen.tsx     # Featured works
│   │   │   ├── SocialScreen.tsx       # Connect screen
│   │   │   ├── HeroBackground.tsx     # Canvas background
│   │   │   ├── ScreenNav.tsx          # Navigation dots
│   │   │   └── CustomCursor.tsx       # Custom cursor
│   │   ├── social-icons.tsx           # Social SVG icons
│   │   └── ...                        # Shared components
│   ├── pages/                 # Route pages
│   │   ├── FullScreenSite.tsx         # Main landing page
│   │   ├── Projects.tsx / ProjectDetail.tsx
│   │   ├── Blog.tsx / BlogArticle.tsx
│   │   ├── Videos.tsx / VideoDetail.tsx
│   │   └── NotFound.tsx
│   ├── data/                  # Static content data
│   │   ├── index.ts                   # Central data export
│   │   ├── social.ts                  # Social platform config
│   │   └── projects-cover.ts          # Project metadata
│   ├── hooks/                 # Custom React hooks
│   │   └── use-projects.ts            # Project data hook
│   ├── contexts/              # React contexts
│   │   └── LanguageContext.tsx         # Bilingual state
│   ├── layouts/               # Layout components
│   │   └── MainLayout.tsx             # Standard page layout
│   ├── routes/                # Route definitions
│   │   └── index.tsx                   # Router configuration
│   ├── utils/                 # Utilities
│   │   └── translations.ts            # i18n dictionary
│   ├── types.ts               # TypeScript interfaces
│   ├── App.tsx                # App root
│   └── index.tsx              # Entry point
├── tailwind.config.js         # Tailwind design tokens
├── vite.config.ts             # Vite build configuration
└── package.json
```

---

## Technology Constellation

### Core Framework
| Technology | Purpose |
|---|---|
| **React 18** | UI component architecture |
| **TypeScript** | Type-safe development |
| **Vite** | Build tooling and HMR |

### Styling & Animation
| Technology | Purpose |
|---|---|
| **Tailwind CSS** | Utility-first styling with custom design tokens |
| **Framer Motion** | Declarative animations and gesture handling |
| **GSAP** | High-performance scroll and timeline animations |

### Routing & State
| Technology | Purpose |
|---|---|
| **React Router v6** | Client-side routing with lazy loading |
| **React Context** | Language state management |

### Content & Data
| Technology | Purpose |
|---|---|
| **Markdown** | Blog and project article rendering |
| **JSON data files** | Static content management |

### Deployment
| Technology | Purpose |
|---|---|
| **Vercel / GitHub Pages** | Hosting and continuous deployment |
| **pnpm** | Package management |

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (recommended) or npm

### Local Development

```bash
# Clone the repository
git clone https://github.com/Eververdants/eververdants.github.io.git
cd eververdants.github.io

# Install dependencies
pnpm install

# Start the development server
pnpm run dev

# Build for production
pnpm run build

# Preview the production build
pnpm run preview
```

The development server runs at `http://localhost:3000` by default.

### Available Scripts

| Script | Description |
|---|---|
| `pnpm run dev` | Start development server with HMR |
| `pnpm run build` | Build for production |
| `pnpm run preview` | Preview production build locally |

---

## Content Stewardship

### Managing Projects

Projects are defined in `src/data/index.ts` and `src/data/projects-cover.ts`. Each project entry includes:

- Title and description (bilingual)
- Category and tags for filtering
- Feature highlights
- Cover image and detail images
- Demo and repository URLs
- Full article content in Markdown

### Managing Social Platforms

Social platform configurations live in `src/data/social.ts`. Each entry defines:

- Platform name (bilingual)
- Icon and gradient colors
- Profile URL
- Display priority (primary/secondary)

### Translations

The bilingual dictionary is maintained in `src/utils/translations.ts`. Adding a new language key requires entries in both `en` and `zh` objects.

---

## Deployment

The project is configured for deployment on both Vercel and GitHub Pages. The `vite.config.ts` includes optimized build settings with code splitting, esbuild minification, and asset fingerprinting.

```bash
# Build the project
pnpm run build

# The output is in the dist/ directory
# Deploy dist/ to your hosting provider of choice
```

---

## License

**MIT** — See [LICENSE](./LICENSE) for details.

---

*Crafted with care by Eververdants · 用心之作*
