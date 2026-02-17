# OpenModal Documentation

Welcome to the OpenModal documentation. This platform tracks AI's real-world impact on jobs and capabilities through community-driven data.

## ⚠️ Important Patterns

Before diving in, make sure you understand these critical patterns:

- **[Nested Dynamic Routes](routing.md#nested-dynamic-routes-pattern)** - Always use `$segment/index.tsx` for single params, `$segment/$subsegment.tsx` for multiple. This is a common source of bugs.
- **[Data Layer Pattern](architecture.md#data-layer-layer)** - Never call `db` directly from actions. Use data-layer functions.
- **[Middleware for Auth/Rate-Limit](architecture.md#middleware-layer)** - Actions use middleware for cross-cutting concerns.

## Getting Started

- **[CLAUDE.md](../CLAUDE.md)** - Main guide for Claude Code and developers
- **[Quick Reference](quick-reference.md)** - Common patterns and commands

## Platform & Domain

- **[Domain Guide](domain-guide.md)** - What is OpenModal, philosophy, core concepts
- **[Entities](entities.md)** - Complete entity specifications
- **[Relationships](relationships.md)** - How entities connect and relate
- **[RESTRUCTURE.md](../RESTRUCTURE.md)** - Complete platform architecture document

## Architecture

- **[Architecture](architecture.md)** - Layered architecture (UI → Actions → Middleware → Data Layer)

## Core Guides

- **[Routing](routing.md)** - TanStack Start file-based routing
- **[Forms](forms.md)** - Form implementation with TanStack Form
- **[Database](database.md)** - Drizzle ORM operations and data layer pattern
- **[Authentication](authentication.md)** - Better Auth setup and usage

## Platform Features

- **[Features](features.md)** - Impact reports, enrichments, discussions, suggestions
- **[Moderation](moderation.md)** - Content moderation and quality control
- **[Rewards](rewards.md)** - Reputation system, user tiers, and badges

## Stack

- **Framework:** TanStack Start (React SSR)
- **Database:** Neon PostgreSQL + Drizzle ORM
- **Auth:** Better Auth
- **Deployment:** Cloudflare Workers
- **Package Manager:** Bun

## Quick Links

| Topic                 | Link                                                         |
| --------------------- | ------------------------------------------------------------ |
| Platform Overview     | [Domain Guide](domain-guide.md)                              |
| Architecture Overview | [Architecture Guide](architecture.md)                        |
| Entity Specs          | [Entities](entities.md)                                      |
| Entity Relationships  | [Relationships](relationships.md)                            |
| Development Commands  | [Quick Reference](quick-reference.md#bun-commands)           |
| Database Commands     | [Quick Reference](quick-reference.md#database-commands)      |
| Data Layer Pattern    | [Database Guide](database.md)                                |
| Form Implementation   | [Forms Guide](forms.md)                                      |
| Nested Dynamic Routes | [Routing Guide](routing.md#nested-dynamic-routes-pattern) ⚠️ |
| Protected Routes      | [Routing Guide](routing.md#protected-routes)                 |
| Server Actions        | [Architecture Guide](architecture.md#actions-layer)          |
| Middleware            | [Architecture Guide](architecture.md#middleware-layer)       |
| Impact Reports        | [Features Guide](features.md#impact-reports-system)          |
| User Tiers            | [Rewards Guide](rewards.md)                                  |
| Moderation            | [Moderation Guide](moderation.md)                            |
