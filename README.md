# Simple CRM

A lightweight Customer Relationship Management system built for small businesses (5-20 people).

## Features

- **Contacts & Companies**: Manage contacts with company associations and tags
- **Sales Pipeline**: Visual Kanban board with drag-and-drop deal management
- **Communication Log**: Track calls, emails, and meetings
- **Tasks & Reminders**: Never miss a follow-up
- **Reports**: Simple sales metrics and pipeline overview
- **User Roles**: Admin and User roles with ownership-based access

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL with Prisma ORM (v7)
- **Authentication**: NextAuth.js v5
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

### 2. Start Database

```bash
docker compose up -d db
```

### 3. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create Your Account

The first user to register will automatically become an Admin.

## Environment Variables

Copy `.env.example` to `.env` and configure:

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
│   ├── actions/                # Server Actions
│   ├── components/             # React components
│   │   └── ui/                 # shadcn/ui components
│   └── lib/                    # Utilities (db, auth)
├── prisma/
│   └── schema.prisma           # Database schema
├── docker-compose.yml
└── Dockerfile
```

## Key Pages

- `/dashboard` - Overview with key metrics
- `/contacts` - Contact management
- `/companies` - Company management
- `/deals` - Sales pipeline (Kanban)
- `/tasks` - Task management
- `/reports` - Sales reports

## License

MIT
