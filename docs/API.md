# API Reference

Base URL: `http://localhost:3000/api`

## Authentication

### POST /api/auth/register
```json
// Request
{ "name": "María García", "email": "maria@ejemplo.com", "password": "SecurePass1" }
// Response 201
{ "token": "jwt...", "user": { "id": 1, "name": "María García", "email": "maria@ejemplo.com" } }
```

### POST /api/auth/login
```json
{ "email": "maria@ejemplo.com", "password": "SecurePass1" }
// Response 200
{ "token": "jwt...", "user": { "id": 1, "name": "María García", "email": "maria@ejemplo.com" } }
```

### GET /api/auth/profile (Bearer)
```json
// Response 200
{ "id": 1, "name": "María García", "email": "maria@ejemplo.com", "avatarUrl": null, "bio": null }
```

## Events

### GET /api/events
Query params: `page=1&limit=10&search=tech&category=tech&dateFrom=2026-01-01&sortBy=date&sortOrder=ASC`
```json
{
  "data": [{ "id": 1, "title": "TechConf 2026", "slug": "tech-conference-2026", "description": "...", "date": "2026-09-15T09:00:00.000Z", "location": "Madrid, Spain", "category": "tech", "capacity": 500, "status": "active", "organizer": { "id": 1, "name": "Organizer User" }, "ticketTypes": [{"id": 1, "name": "Early Bird", "price": 149.99, "capacity": 100, "available": 100, "perOrderLimit": 2}] }],
  "meta": { "total": 3, "page": 1, "limit": 10, "totalPages": 1 }
}
```

### GET /api/events/:id
Same event structure with full ticket types and organizer info.

### POST /api/events (Bearer)
```json
{
  "title": "New Event",
  "description": "Description",
  "date": "2026-12-01T10:00:00Z",
  "endDate": "2026-12-01T18:00:00Z",
  "location": "Madrid",
  "category": "tech",
  "capacity": 200,
  "ticketTypes": [
    { "name": "General", "price": 0, "capacity": 200, "perOrderLimit": 5 }
  ]
}
```

## Registrations

### POST /api/registrations (Bearer)
```json
{ "eventId": 1, "items": [{ "ticketTypeId": 1, "quantity": 1 }] }
// Response 201: { "id": 42, "status": "confirmed", "totalPrice": 149.99, ... }
// Response 409: { "message": "Not enough capacity available", "capacityAvailable": 0, "requested": 2, "waitlistAvailable": true }
```

### DELETE /api/registrations/:id (Bearer)
```json
// Response 200: { "message": "Registration cancelled", "promoted": true }
```

## Waitlist

### POST /api/waitlist (Bearer)
```json
{ "eventId": 1 }
// Response 201: { "id": 5, "position": 1, "status": "waiting" }
```

## Dashboard

### GET /api/dashboard/stats (Bearer)
```json
{
  "myEvents": { "total": 3, "active": 2, "draft": 1, "totalRegistrations": 275, "upcoming": [...] },
  "myRegistrations": { "total": 3, "upcoming": 2, "past": 1, "waitlisted": 1 }
}
```

## SSE

### GET /api/events/:id/stream
SSE stream with events: `capacity` (capacity update), `full` (event full), `waitlist_promoted`
