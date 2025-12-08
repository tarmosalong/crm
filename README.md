# Simple CRM

A lightweight Customer Relationship Management system built for small businesses (5-20 people).

> **🧪 AI Development Experiment**
> 
> This project was built as an experiment to explore the capabilities and limitations of AI-assisted development using [Cursor](https://cursor.sh) with Claude.
> 
> **Key findings:**
> - ✅ Full-stack apps with complex features can be built entirely through AI assistance
> - ✅ Database schema design, ORM integration, and CRUD operations work seamlessly
> - ✅ UI/UX with modern frameworks (React, Tailwind, shadcn/ui) produces quality results
> - ✅ Authentication, authorization, and security patterns are handled well
> - ⚠️ Complex drag-and-drop interactions required multiple iterations to resolve state management issues
> - ⚠️ Some edge cases and performance optimizations still need human oversight
> 
> This demonstrates where AI-assisted development stands today—powerful for rapid prototyping and building functional applications, while still benefiting from human guidance for complex interactions and production hardening.

---

## Features

- **Contacts & Companies**: Manage contacts with company associations and tags
- **Sales Pipeline**: Visual Kanban board with drag-and-drop deal management
- **Communication Log**: Track calls, emails, and meetings
- **Tasks & Reminders**: Never miss a follow-up with calendar view
- **Reports**: Sales metrics, charts, and CSV export
- **Global Search**: Quick search across all entities (⌘K)
- **User Roles**: Admin and User roles with ownership-based access

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Charts**: Recharts
- **Drag & Drop**: dnd-kit
- **Deployment**: Docker / Docker Compose

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (for PostgreSQL)
- npm

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd crm
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```env
# Database
DATABASE_URL="postgresql://crm:crm_password@localhost:5432/crm?schema=public"

# PostgreSQL (for Docker)
POSTGRES_USER=crm
POSTGRES_PASSWORD=crm_password
POSTGRES_DB=crm

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32
```

### 3. Start Database

```bash
docker compose up -d db
```

### 4. Run Database Migrations & Seed

```bash
npx prisma migrate dev
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

After seeding, you can log in with:

| User | Email | Password | Role |
|------|-------|----------|------|
| Mart Tamm | admin@firma.ee | admin123 | Admin |
| Kati Kask | kati@firma.ee | admin123 | User |
| Priit Pärn | priit@firma.ee | admin123 | User |

## Docker Deployment

### Development

```bash
docker compose up -d
```

### Production Build

```bash
docker compose -f docker-compose.yml up -d --build
```

## Project Structure

```
crm/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, register)
│   │   ├── (dashboard)/        # Main app pages
│   │   └── api/                # API routes
│   ├── actions/                # Server Actions (CRUD operations)
│   ├── components/             # React components
│   │   └── ui/                 # shadcn/ui components
│   └── lib/                    # Utilities (db, auth)
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Sample data
├── docker-compose.yml
└── Dockerfile
```

## Key Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | Overview with key metrics and quick actions |
| `/contacts` | Contact management with filtering |
| `/companies` | Company management |
| `/deals` | Sales pipeline (Kanban board) |
| `/tasks` | Task management |
| `/calendar` | Calendar view for tasks |
| `/reports` | Sales reports with charts |
| `/settings` | User profile and tag management |

## Database Schema

The application uses a relational database with the following main entities:

- **Users**: Authentication and ownership
- **Contacts**: People you interact with
- **Companies**: Organizations
- **Deals**: Sales opportunities with pipeline stages
- **Tasks**: To-dos and reminders
- **Notes**: Free-form notes on any entity
- **Communications**: Logged calls, emails, meetings
- **Tags**: Flexible categorization

## What's Implemented

### ✅ Core Features
- Full authentication flow (login, register, logout)
- Contact & Company CRUD with relationships
- Deal management with Kanban pipeline
- Task management with calendar view
- Notes and communication logging
- Global search (⌘K)
- CSV data export
- Visual reports with charts

### ✅ Technical Implementation
- PostgreSQL database with Docker
- Prisma ORM with type-safe queries
- Next.js Server Actions for data mutations
- React Server Components for data fetching
- Responsive UI with dark theme

### ⏳ Future Enhancements
- REST API for external integrations
- Webhook notifications
- Email integration
- Mobile app

## License

MIT

---

*Built with [Cursor](https://cursor.sh) + Claude as an AI development experiment*
