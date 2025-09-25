# Overview

This is a real-time multiplayer math game built as a full-stack web application. Players join rooms and compete to solve mathematical expressions that equal 24 using four given numbers. The game features live updates, scoring, and turn-based gameplay with timer mechanics.

The application is built with a React frontend, Express.js backend, and uses WebSockets for real-time communication. It includes a comprehensive UI built with shadcn/ui components and Tailwind CSS for styling.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite for development and production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Real-time Communication**: WebSocket server using the 'ws' library
- **API Design**: RESTful endpoints for initial setup, WebSockets for game interactions
- **Game Logic**: Custom game engine with mathematical expression validation
- **Storage**: In-memory storage with interface for future database integration

## Data Storage
- **Current Implementation**: Memory-based storage using Map data structures
- **Database Ready**: Drizzle ORM configured for PostgreSQL with schema definitions
- **Session Management**: Connect-pg-simple for session storage (when database is connected)

## Core Game Components
- **Math Validator**: Validates mathematical expressions and checks if they equal 24
- **Solution Finder**: Generates solvable number sets and finds solutions when needed
- **Game Engine**: Manages room state, player turns, scoring, and game flow
- **Real-time Updates**: WebSocket-based communication for live game state synchronization

## Authentication & Authorization
- **Current State**: Basic player identification through WebSocket connections
- **Session Tracking**: Players identified by unique IDs generated on join
- **Room Access**: Room code-based access control

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver for Neon
- **drizzle-orm** & **drizzle-kit**: Type-safe ORM and schema management
- **express**: Web application framework
- **ws**: WebSocket library for real-time communication

### Frontend UI Dependencies
- **@radix-ui/***: Comprehensive set of UI primitives (accordion, dialog, dropdown, etc.)
- **@tanstack/react-query**: Server state management and caching
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Minimalist routing library

### Development & Build Tools
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific development features

### Utility Libraries
- **zod**: Schema validation library
- **date-fns**: Date manipulation utilities
- **clsx** & **tailwind-merge**: CSS class manipulation
- **class-variance-authority**: Component variant management

### Optional Integrations
- **connect-pg-simple**: PostgreSQL session store (when database is active)
- **react-hook-form** & **@hookform/resolvers**: Form handling and validation