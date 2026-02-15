# Backend module scaffold

This directory contains a modular backend scaffold with:

- `auth`: JWT/session issuance, refresh, password reset, and optional club SSO initiation.
- `clubs`: tenant model and employee membership endpoints.
- `bookings`: booking request/approval/rejection lifecycle.
- `analytics`: aggregated metrics endpoints.

## Versioned interfaces

- REST base path: `/api/v1`
- GraphQL endpoint: `/api/v1/graphql`

## Cross-cutting middleware

All protected routes and GraphQL operations use:

1. `authenticate` (token/session context extraction)
2. `enforceTenantIsolation` (`club_id` bound to auth + route scope)
3. `requireRole` (role-based access checks)

## Database schema

Relational schema is defined in `db/schema.sql` for:

- `clubs`
- `venues`
- `sections`
- `time_slots`
- `bookings`
- `booking_events`
- `users`
- `employee_roles`
- `payments`
