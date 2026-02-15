# Realtime section availability requirements

This implementation assumes the following minimum requirements for realtime inventory:

1. **Tenant-safe projection**: Availability is always club-scoped (`club_id`) and section/slot scoped.
2. **Short-lived holds**: Seats are held before booking confirmation and automatically expire.
3. **Versioned snapshots**: Every availability write increments a version for optimistic UI updates.
4. **Event fanout**: Changes are written to an outbox for websocket/GraphQL subscription workers.
5. **Protected access**: All availability reads/writes are authenticated, tenant-isolated, and role-checked.

## Added schema objects

- `section_availability_snapshots`
- `section_holds`
- `availability_outbox`

## Added API shape

### REST

- `GET /api/v1/clubs/:clubId/sections/:sectionId/availability`
- `POST /api/v1/clubs/:clubId/sections/:sectionId/holds`

### GraphQL

- `Query.sectionAvailability`
- `Mutation.createAvailabilityHold`
- `Subscription.availabilityUpdated`
