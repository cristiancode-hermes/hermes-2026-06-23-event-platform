# Architecture

## System Overview

The Event Platform follows a classic monorepo architecture with separate frontend (Angular) and backend (NestJS) applications sharing a common data model.

## Data Flow

```
User → Angular App → HTTP → NestJS API → TypeORM → SQLite
                            ↓
                        SSE Stream ← Events (capacity changes, waitlist promotions)
                            ↓
                     Connected Clients
```

## Key Architectural Decisions

### 1. Monorepo Structure
```
2026-06-23-event-platform/
├── apps/
│   ├── api/     # NestJS backend
│   └── web/     # Angular frontend
├── docs/        # Documentation
├── .github/     # CI workflow
└── README.md
```

### 2. Transactional Capacity Management
Registration uses database transactions with `QueryRunner` to ensure atomic capacity checks. This prevents overbooking when multiple users register simultaneously.

### 3. SSE for Real-Time Updates
Server-Sent Events (SSE) provide unidirectional real-time updates for capacity changes. Simpler than WebSockets since data flows server→client only. Uses RxJS Subject pattern proven in previous Kanban Board project.

### 4. Waitlist Auto-Promotion
When a registration is cancelled, the system automatically promotes the first waiting user. This happens within the same transaction to ensure consistency.

### 5. Signal-First Frontend
All component state uses Angular signals (`signal()`, `computed()`) with zoneless change detection. No RxJS in components except for HTTP bridging via `firstValueFrom()`.

## Module Dependency Graph

```
AppModule
├── AuthModule (JWT, Passport)
├── EventsModule (CRUD, search, attendees)
├── RegistrationsModule (capacity control, cancellation)
├── WaitlistModule (queue management)
├── DashboardModule (aggregation queries)
├── SseModule (real-time broadcast)
└── SeedModule (development data)
```
