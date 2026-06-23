# Event Platform

**Plataforma para crear, gestionar y promocionar eventos con registro online, control de capacidad, lista de espera y dashboard en tiempo real.**

## Features

- **Explorar eventos** — Navega y busca eventos con filtros por categoría, fecha y ubicación
- **Registro en tiempo real** — Selecciona tickets, control de capacidad atómico, confirmación instantánea
- **Lista de espera** — Únete automáticamente cuando un evento está lleno; promoción automática al liberarse cupo
- **Dashboard personal** — Gestiona tus eventos creados y tus registros como asistente
- **Creación de eventos** — Asistente multi-paso con tipos de ticket, precios y capacidades individuales
- **Panel de organizador** — Lista de asistentes, estadísticas de capacidad, lista de espera
- **SSE en tiempo real** — Actualizaciones de capacidad en vivo mediante Server-Sent Events
- **Autenticación JWT** — Registro, login, perfil de usuario
- **Modo oscuro** — Tema claro/oscuro con persistencia

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 22 (signals, zoneless, Tailwind CSS v4) |
| Backend | NestJS + TypeORM + SQLite (dev) / Neon/PostgreSQL (prod) |
| Auth | JWT con Passport.js + bcryptjs |
| Tiempo real | SSE (Server-Sent Events) |
| CI/CD | GitHub Actions |

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    Frontend Angular                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │  Auth    │ │  Events  │ │  Registration Wizard │  │
│  │  Pages   │ │  Explore │ │  (3-step multi-step)  │  │
│  └──────────┘ └──────────┘ └──────────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │Dashboard │ │  Create  │ │  Attendees Panel     │  │
│  │ Personal │ │  Event   │ │  (organizer only)    │  │
│  └──────────┘ └──────────┘ └──────────────────────┘  │
│  ┌──────────────────────────────────────────────┐    │
│  │           SSE Stream (capacity)              │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP + SSE
┌──────────────────▼──────────────────────────────────┐
│                   NestJS Backend                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │   Auth   │ │  Events  │ │   Registrations      │ │
│  │  Module  │ │  Module  │ │     Module           │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ Waitlist │ │Dashboard │ │   SSE Module         │ │
│  │  Module  │ │  Module  │ │   (real-time)        │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
│  ┌──────────────────────────────────────────────┐   │
│  │              TypeORM + SQLite                 │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Prerrequisitos

- Node.js 20+
- npm 9+

## Setup Local

```bash
# 1. Clonar
git clone https://github.com/nousresearch/hermes-event-platform
cd hermes-event-platform

# 2. Backend
cd apps/api
cp .env.example .env
npm install
npm run build
npm run start:dev

# 3. Frontend (otra terminal)
cd apps/web
npm install
npm run start

# 4. Seed data
curl -X POST http://localhost:3000/api/seed
```

## Seed Data

| Entidad | Cantidad | Detalle |
|---------|----------|---------|
| Users | 2 | Organizador + Asistente |
| Events | 3 | TechConf, Design Meetup, Workshop Angular |
| TicketTypes | 5 | Early Bird, General, VIP, Standard, Workshop |
| Registrations | 5 | 4 confirmadas + 1 cancelada |
| Waitlist | 2 | 2 en espera para Workshop Angular |

**Credenciales:**
- Organizador: `organizer@example.com` / `password123`
- Asistente: `attendee@example.com` / `password123`

## API Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Registro |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/profile` | JWT | Perfil |
| PATCH | `/api/auth/profile` | JWT | Editar perfil |
| GET | `/api/events` | No | Listar eventos |
| GET | `/api/events/:id` | No | Detalle evento |
| POST | `/api/events` | JWT | Crear evento |
| PATCH | `/api/events/:id` | JWT (owner) | Editar evento |
| DELETE | `/api/events/:id` | JWT (owner) | Eliminar evento |
| POST | `/api/registrations` | JWT | Registrarse |
| GET | `/api/registrations/my` | JWT | Mis registros |
| DELETE | `/api/registrations/:id` | JWT | Cancelar registro |
| POST | `/api/waitlist` | JWT | Unirse a waitlist |
| GET | `/api/dashboard/stats` | JWT | Dashboard stats |
| GET | `/api/events/:id/stream` | No | SSE stream |
| POST | `/api/seed` | No | Seed data |

## Roadmap

- [ ] Lista de espera con notificaciones
- [ ] Vista de calendario de eventos
- [ ] Exportar asistentes a CSV
- [ ] Código QR de entrada
- [ ] Notificaciones in-app
- [ ] Neon/PostgreSQL en producción
- [ ] Component tests en Angular
- [ ] Despliegue CI/CD funcional
