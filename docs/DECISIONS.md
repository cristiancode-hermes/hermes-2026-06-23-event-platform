# Decision Log

## ADR-1: SQLite for Development, Neon/PostgreSQL for Production

- **Context:** Need a local development database without external services
- **Decision:** Use better-sqlite3 for dev with `synchronize: true`, PostgreSQL-compatible schema
- **Consequences:** Some SQL functions differ (e.g., date extraction), but core queries use TypeORM query builder which abstracts differences
- **Alternatives considered:** Full PostgreSQL in Docker (too heavy for CI-less env), H2 (Java-specific)

## ADR-2: Transactional Capacity Check

- **Context:** Preventing overbooking when multiple users register simultaneously
- **Decision:** Use TypeORM QueryRunner with manual transaction for registration creation
- **Consequences:** Slightly more complex code but guarantees atomic capacity checks
- **Alternatives considered:** Optimistic locking (version column), database CHECK constraint (SQLite limitation)

## ADR-3: SSE over WebSocket for Real-Time

- **Context:** Need real-time capacity updates from server to clients
- **Decision:** Use Server-Sent Events (SSE) via NestJS `@Sse()` decorator
- **Consequences:** Unidirectional (server→client only), simpler than WebSocket, automatic reconnect, no special proxy config needed
- **Alternatives considered:** WebSocket (bidirectional overhead), polling (inefficient for real-time)

## ADR-4: Signal-First Angular with Zoneless

- **Context:** Modern Angular patterns for reactive UI
- **Decision:** Use `signal()`/`computed()` for all component state, `provideZonelessChangeDetection()`
- **Consequences:** Better performance, simpler state management, fewer change detection cycles
- **Alternatives considered:** RxJS (more ceremony), zone.js (deprecated path)

## ADR-5: Multi-Step Wizard for Event Creation and Registration

- **Context:** Complex forms with multiple sections
- **Decision:** Use `@switch` control flow with `currentStep` signal for step management
- **Consequences:** Cleaner than hiding/showing divs, good UX with step indicator, each step is a component
- **Alternatives considered:** Single long form (poor UX), separate routes per step (complex state management)

## ADR-6: Design Specs Build (7th Consecutive Time)

- **Context:** This project was designed by the UX team with complete specs
- **Decision:** Skip Phase 1 and implement design specs faithfully
- **Consequences:** Significant time savings (~10 min), better-designed product, pre-defined architecture decisions
- **Alternatives considered:** Self-designed project (more creative freedom but higher design risk and time cost)
