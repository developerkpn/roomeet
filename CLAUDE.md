# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- `npm run dev` - Start development server on localhost:3000
- `npm run dev:https` - Start development server with experimental HTTPS support
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Testing
No specific test commands configured in package.json - check for test files or ask user for testing approach.

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **UI Library**: MUI (Material-UI) with custom styling
- **Styling**: Tailwind CSS + MUI emotion
- **Calendar**: React Big Calendar with date-fns
- **State Management**: Zustand for authentication state
- **Data Fetching**: SWR with Axios
- **Database**: MySQL with mysql2 connection pool
- **PWA**: Next-PWA implementation

### Key Architecture Patterns

**State Management**: Authentication uses Zustand store with persistence at `src/lib/store/useAuthStore.ts`. User info and access tokens are managed globally.

**Database Connection**: MySQL pool configured in `src/app/config/pool.ts` with connection reuse and idle timeout management.

**Component Organization**:
- `src/components/` - Feature-based component organization (auth, book, home, room, etc.)
- `src/common/` - Reusable UI components
- `src/app/` - Next.js App Router pages and layouts
- Each major feature has its own directory with an index.ts barrel export

**Calendar Integration**: Uses React Big Calendar with custom toolbar and Indonesian localization. Calendar events support booking details modal.

**Authentication Flow**: Uses Zustand for client state, no next-auth. Custom hooks for token refresh and axios interceptors.

### File Structure Conventions
- Components follow feature-based organization
- Each component directory includes an `index.tsx` for barrel exports
- Common components are in `src/common/`
- Custom hooks in `src/lib/hooks/`
- Type definitions in `src/types/`

### Deployment
Production deployment uses Docker with ARM64 support. Environment variables managed through `.env.production`. Docker image naming: `faizbyp/roomeet:x.x.x`.

## Image Configuration
Custom image loader at `src/lib/imageLoader.ts` with remote patterns for:
- images.unsplash.com
- i.pinimg.com  
- roomeet.gamasap.com domains
- localhost:5000/5001 for development API

## PWA Configuration
Progressive Web App enabled with aggressive caching, offline support, and service worker in public directory.