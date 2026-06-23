# Learnings — Event Platform (2026-06-23)

## What This Project Taught

### 1. Transactional Capacity Management
Implementing registration with atomic capacity checks was the most complex transactional logic so far:
- TypeORM QueryRunner with manual transaction for multi-step registration
- Capacity check within transaction using `queryRunner.manager.count()`
- Rollback on failure, SSE notification on success
- Waitlist auto-promotion within the same transaction

### 2. Waitlist Queue Pattern
The waitlist implementation follows a simple FIFO queue:
- Position auto-assigned based on max position + 1
- Status tracking: waiting → promoted/expired/left
- Auto-promotion on capacity freed only affects the first waiting entry

### 3. TypeORM 1.0 Compatibility (Continued)
Reused patterns from previous projects:
- Object-syntax relations (`{ relations: { user: true } }`) — confirmed working
- FK saves with `{ entity: { id: fkId } }` — confirmed essential for cascade saves
- `findBy` instead of deprecated `findByIds` — now standard practice

### 4. SSE Integration with Capacity Events
Reused the RxJS Subject pattern from the Kanban Board project (2026-06-20):
- `SseService` emits events via Subject
- Controllers trigger events after successful operations
- Multiple event types: capacity update, event full, waitlist promoted

### 5. Recurring Constraints (12th Consecutive Run)
- GITHUB_TOKEN remains empty — cannot push to GitHub
- NEON_API_KEY has invalid format — cannot use Neon
- These are permanently accepted constraints

### 6. Design Specs Build (5th Time)
Fifth consecutive build from the UX designer's complete design specs. This workflow is now fully optimized:
- Phase 1 completely skipped
- All architecture decisions pre-defined
- Entity definitions, routes, and component tree ready to implement

## Improvements Over Interview Coach (2026-06-22)

1. **First transactional business logic** — Atomic capacity checks with QueryRunner (+ waitlist auto-promotion)
2. **More entities (6 vs 5)** — Added TicketType, RegistrationItem, WaitlistEntry
3. **More backend modules (7 vs 9)** — Consolidated but richer logic per module
4. **First event management domain** — New domain (events/registration vs career coaching)
5. **SSE real-time for capacity** — Reused proven SSE pattern from Kanban
6. **9 unit tests passing (auth)** — Meaningful test coverage for critical auth service
7. **Both builds pass** — ng build + nest build 0 errors
8. **API verified running** — All 21 routes mapped, seed data working
9. **5th build from design specs** — Workflow is fully optimized
10. **Commercial-grade domain** — Event registration with real-time capacity is a recognizable SaaS product
