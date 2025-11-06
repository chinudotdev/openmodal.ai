# OpenModal

**AGI Progress Tracker & AI Capabilities Dashboard**

OpenModal is a community-driven platform that tracks progress toward Artificial General Intelligence (AGI). It provides a comprehensive dashboard showing AI capabilities, breakthrough developments, and insights into which jobs are safe from automation.

## Features

- **AI Capabilities Tracking**: Monitor and explore various AI capabilities and their progress
- **Job Automation Analysis**: Compare jobs and understand their automation potential
- **Activity Feed**: Stay updated with the latest AI developments and breakthroughs
- **Statistics Dashboard**: View comprehensive statistics and progress metrics
- **User Authentication**: Secure authentication with email verification
- **Community-Driven**: Contribute and share insights about AI progress

## Tech Stack

- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **Database**: Postgres with Drizzle ORM
- **Authentication**: Better Auth
- **State Management**: TanStack Query
- **Analytics**: PostHog
- **Email**: Resend
- **Code Quality**: Biome

## Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd openmodal
```

2. Install dependencies:

```bash
bun install
# or
npm install
```

3. Set up the database:

```bash
bun run db:push
# or
npm run db:push
```

4. Run the development server:

```bash
bun run dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run linter (Biome)
- `bun run format` - Format code (Biome)
- `bun run db:generate` - Generate database migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:push` - Push schema changes to database

## Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── (public)/     # Public pages
│   ├── capabilities/ # Capabilities pages
│   ├── jobs/         # Jobs pages
│   └── api/          # API routes
├── components/       # React components
├── actions/          # Server actions
├── db/               # Database schema and config
├── lib/              # Utility functions
└── hooks/            # React hooks
```

## License

MIT License - See LICENSE file for details
