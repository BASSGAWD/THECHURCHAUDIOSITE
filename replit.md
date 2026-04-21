# The Church Audio - Artist Portfolio & Content Platform

## Overview
Full-stack artist portfolio and content management platform for Bassgawd / reed. / The Church Audio. Features an interactive "torn paper" landing page, artist profiles, tour dates, merch, and a content management system for tutorials, blog posts, and sample packs.

## Architecture
- **Frontend**: React 19 + Vite 7 + Tailwind CSS v4 + Framer Motion + Wouter routing + TanStack Query
- **Backend**: Express 5 + Node.js + TypeScript
- **Database**: PostgreSQL via Drizzle ORM
- **File Storage**: Replit Object Storage (for uploaded images and sample pack files)
- **Auth**: Session-based with express-session + memorystore

## Key Features
- Interactive torn paper / origami unfolding homepage
- Artist pages (Bassgawd, Reed, Hallways)
- Tour dates & Merch pages
- **Content Management (Admin)**: Upload tutorials, blog posts, and sample packs via `/admin`
- **User Accounts**: Registration/login system with session auth
- **Mailing List**: Users auto-added to mailing list on signup (email collected during registration, stored in `mailing_list` table)
- **Comments**: Blog/tutorial articles have comment sections (login required to post)
- **HolyTablet**: Web-based beat maker / numpad sampler with 9 synthesized drum pads, 16-step sequencer, save songs to account, export as full mix or individual stems (.wav)
- Music player with multiple tracks

## File Structure
```
client/src/
  App.tsx              - Main router
  pages/
    Home.tsx           - Interactive landing page
    Admin.tsx          - Admin panel (mobile-friendly content management)
    Tutorials.tsx      - Public tutorials listing
    Blog.tsx           - Public blog listing
    ArticleView.tsx    - Article detail + comments
    SamplePacks.tsx    - Sample packs with lock overlay
    Tour.tsx           - Tour dates
    Merch.tsx          - Merchandise
    ArtistBassgawd.tsx - Bassgawd artist page
    ArtistReed.tsx     - Reed artist page
    ArtistHallways.tsx - Hallways artist page
  components/
    AuthModal.tsx      - Login/Register modal
    LockedOverlay.tsx  - Lock overlay for gated content
    HolyTablet.tsx     - Beat maker / numpad sampler with sequencer
    ObjectUploader.tsx - File upload component
  hooks/
    use-auth.tsx       - Auth context provider & hook
    use-upload.ts      - File upload hook

server/
  index.ts             - Express server entry point
  routes.ts            - API routes (auth, articles, sample packs, comments)
  storage.ts           - Database storage interface (Drizzle)
  db.ts                - Database connection
  static.ts            - Static file serving (production)
  vite.ts              - Vite dev server setup
  replit_integrations/
    object_storage/    - Object storage integration

shared/
  schema.ts            - Database schema (users, articles, samplePacks, comments)
```

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_PASSWORD` - Password for admin panel access
- `SESSION_SECRET` - Express session secret
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID` - Object storage bucket
- `PUBLIC_OBJECT_SEARCH_PATHS` - Public asset paths
- `PRIVATE_OBJECT_DIR` - Private upload directory

## API Routes
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Current user
- `GET/POST/PATCH/DELETE /api/articles` - Articles CRUD (admin for write ops)
- `GET/POST /api/articles/:id/comments` - Comments (login required for POST)
- `GET/POST/PATCH/DELETE /api/sample-packs` - Sample packs CRUD (admin for write ops)
- `GET/POST/PATCH/DELETE /api/saved-songs` - Saved songs CRUD (login required, user-scoped)
- `POST /api/uploads/request-url` - Get presigned URL for file upload
