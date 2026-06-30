# QA Report — Event Platform (2026-06-23)

## Resumen
⚠️ **WARN** — Builds OK, tests mejorados, pero hay 171 issues de lint y la app frontend no está cableada.

---

## Build

| Proyecto | Comando | Resultado |
|----------|---------|-----------|
| API (NestJS) | `npm run build` | ✅ |
| Web (Angular 22) | `ng build` | ✅ (2 warnings menores) |

**Warnings de build:**
- `LoadingButtonComponent` importado pero no usado en `EventDetailPageComponent`
- `RouterLink` importado pero no usado en `ExplorePageComponent`

---

## Tests

### Previo (existente)
| Suite | Tests | Resultado |
|-------|-------|-----------|
| `auth.service.spec.ts` | 8 | ✅ Todos pass |
| `app.controller.spec.ts` | 1 | ✅ Pass |
| `app.spec.ts` (Web) | 2 | ✅ Pass |
| **Total previo** | **11** | **✅ 11 pass** |

### Nuevos tests añadidos
| Suite | Tests | Cobertura |
|-------|-------|-----------|
| `events.service.spec.ts` | 17 | CRUD, filtros, ownership, soft-delete |
| `registrations.service.spec.ts` | 14 | Transacción, control capacidad, overbooking, waitlist auto-promote, rollback |
| `waitlist.service.spec.ts` | 8 | Join (posición), leave, conflictos, ownership |
| `dashboard.service.spec.ts` | 2 | Stats agregadas, caso vacío |
| **Total nuevos** | **41** | |

### Resultado final
| Métrica | Valor |
|---------|-------|
| Suites | 6 passed ✅ |
| Tests totales | **50 pass** ✅ |
| Tests nuevos | **41 añadidos** |
| Tiempo ejecución | 2.4s |

---

## Auditoría

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| **Lint (API)** | ❌ | 171 issues (141 errors, 30 warnings) |
| **Lint (Web)** | ✅ | Sin ESLint configurado, `tsc --noEmit` ok |
| **Types** | ⚠️ | API: uso masivo de `any` (req.user, dto params). Web strict mode ok |
| **Código** | ⚠️ | `require()` en events.service (líneas 182,196); imports sin usar en 4 archivos; `password` variable sin usar |
| **Docs** | ✅ | ARCHITECTURE.md, API.md, FRONTEND.md, DATABASE.md, LEARNINGS.md, DECISIONS.md completos |
| **Edge cases** | ⚠️ | Servicios manejan NotFound/Conflict/Forbidden. Faltan tests de concurrencia y rate limiting |
| **Design System** | ✅ | `styles.css` implementa fielmente todos los tokens del DESIGN_SYSTEM.md (colores, tipografía, sombras, animaciones, dark mode) |
| **UX States** | ⚠️ | Componentes tienen estados carga/error/vacío, pero no hay routing que los conecte |
| **Web Completeness** | ❌ | Routes vacías (`routes: []`), `app.html` es scaffolding default de Angular. Componentes existen pero la app no renderiza nada funcional |

---

## Issues

### 🔥 Alta — 171 errores de lint en API
- **Problema:** Uso extensivo de `any` en TypeScript strict mode. `req.user` casteado como `any`, parámetros `dto: any` en services. También `require()` calls en lugar de imports estáticos, imports sin usar en 4 archivos, floating promise en `main.ts`.
- **Solución:** 
  - Crear decorator `@CurrentUser()` tipado para extraer `user.id` del request
  - Tipar DTOs correctamente en las firmas de servicios (usar `CreateEventDto` en vez de `any`)
  - Reemplazar `require()` con imports estáticos circulares o refactorizar entidades
  - Eliminar imports no usados
  - Añadir `void` o `.catch` a `bootstrap()` en `main.ts`

### 🔥 Alta — Frontend sin routing funcional
- **Problema:** `app.routes.ts` tiene `routes: []` vacío. Todos los componentes de página existen (ExplorePageComponent, DashboardComponent, etc.) pero no hay rutas que los activen. `app.html` muestra el template default de Angular "Hello, web-tmp".
- **Solución:** Configurar rutas (explore, event-detail, login, register, dashboard, create-event, registration-wizard, registration-success) en `app.routes.ts` y eliminar el template placeholder de `app.html`.

### ⚠️ Media — `http.put()` donde API espera `PATCH`
- **Problema:** `event.service.ts:44` usa `http.put()` pero el endpoint del API es `PATCH /api/events/:id`.
- **Solución:** Cambiar a `http.patch()`.

### ⚠️ Media — Sin tests de integración (e2e)
- **Problema:** El archivo `test/app.e2e-spec.ts` existe pero su contenido es el scaffold. No hay tests que verifiquen el flujo completo API.
- **Solución:** Implementar tests e2e con supertest para los flujos críticos (registro → login → crear evento → registrarse → cancelar).

### ⚠️ Media — Seed service con `unsafe assignment`
- **Problema:** `seed.service.ts` tiene múltiples `Unsafe assignment of an any value` por el uso de `queryRunner.manager.create()` sin tipado genérico.
- **Solución:** Usar `queryRunner.manager.create(Entity, {...})` con tipo explícito.

### 📝 Baja — `EventModel.id` es `string`, API devuelve `number`
- **Problema:** El modelo frontend `EventModel` define `id: string` pero la API de NestJS devuelve `id: number` (autoincremental). No hay transformación.
- **Solución:** Cambiar `id: string` a `id: number` en los modelos del frontend.

### 📝 Baja — Warnings de build web
- **Problema:** 2 componentes importados pero no usados en templates.
- **Solución:** Eliminar imports no utilizados.

---

## Tests nuevos — Resumen

### `events.service.spec.ts` (17 tests)
Cubre: findAll con paginación y filtros, findOne con NotFoundException, findBySlug, findMyEvents, create con slug auto-generado y ticket types, update con ownership check, remove con soft-delete si hay registrations activas.

### `registrations.service.spec.ts` (14 tests)
Cubre: creación exitosa en transacción con SSE, NotFound si evento no existe, BadRequest si evento inactivo, Conflict si ya registrado, BadRequest si excede per-order limit, Conflict si capacidad insuficiente, rollback en error, cancelación con auto-promote de waitlist + SSE, Forbidden si no es owner, BadRequest si ya cancelado, findMyRegistrations con datos sanitizados, findOne con ownership check.

### `waitlist.service.spec.ts` (8 tests)
Cubre: join con asignación de posición, incremento de posición con cola existente, NotFound en evento inexistente, Conflict si ya en waitlist, leave con remove, NotFound/Forbidden en leave.

### `dashboard.service.spec.ts` (2 tests)
Cubre: stats agregadas (eventos totales/activos/draft, registros totales, próximos, pasados, waitlisted), stats vacías para usuario sin datos.

---

## Diseño — Compliance

✅ **Design System aplicado correctamente** en Tailwind v4:
- Paleta primaria (blue), secundaria (violet), accent (orange), semánticos (success/warning/danger), neutros → exactamente según especificación
- Tipografía: Inter, Plus Jakarta Sans, JetBrains Mono
- Sombras: card/dropdown/modal personalizadas
- Animaciones: fade-in, slide-up, scale-in, pulse-soft
- Dark mode: `@custom-variant dark` correcto

Los componentes (ExplorePageComponent, EventCardComponent) usan correctamente los tokens del design system.
