# Real-Time Section Availability

This document defines how the night club booking platform should provide **real-time section availability** across:
- Customer mobile app
- Employee mobile app
- Web admin portal

## Goal

Users must see accurate section inventory in near real time so they can only request bookable sections for a specific venue, date, and time slot.

## Availability States

Each section/time slot combination should expose one of these states:

- `available`: can be requested immediately.
- `held`: temporarily reserved while a user completes deposit/payment.
- `pending_approval`: requested and waiting manager action.
- `confirmed`: approved booking; no longer available.
- `blocked`: manually blocked by staff (maintenance, VIP override, private event).

## Core Rules

1. A section/time slot can only have one active terminal winner (`confirmed`), unless the club enables split-capacity mode.
2. `held` inventory expires automatically after a short TTL (recommended: 5 minutes) if payment/deposit is not completed.
3. `pending_approval` inventory should be hidden from public customer availability to prevent double requests.
4. Manager overrides must be audit logged and immediately broadcast to all clients.

## Source of Truth

The backend booking service is the source of truth for availability.

Availability is computed from:
- section inventory definitions,
- booking records and statuses,
- active holds,
- manual blocks.

## API Contract

### Snapshot Endpoint (initial load)

`GET /v1/clubs/:clubId/venues/:venueId/availability?date=YYYY-MM-DD&slotId=...`

Returns all sections and current availability status for the requested slot/date.

### Real-Time Stream (incremental updates)

Use WebSocket (or SSE fallback) channel:

`availability:{clubId}:{venueId}:{date}:{slotId}`

Event payload example:

```json
{
  "eventType": "availability.updated",
  "sectionId": "sec_102",
  "slotId": "slot_21_00",
  "date": "2026-02-15",
  "previousState": "available",
  "newState": "pending_approval",
  "reason": "booking_requested",
  "updatedAt": "2026-02-15T21:01:12Z",
  "version": 381
}
```

## Consistency Strategy

- Clients always perform an initial snapshot fetch.
- Clients then subscribe to streaming updates.
- Every event includes a monotonically increasing `version`.
- If a client detects a gap in versions, it must re-fetch the snapshot.

## Concurrency Controls

To prevent race conditions when two users request the same section:

- Use a DB transaction with row-level lock on `(section_id, date, slot_id)` availability key.
- Reject conflicting updates with a domain error: `SECTION_NOT_AVAILABLE`.
- Record an audit event for all state transitions.

## Caching and Performance

- Store computed availability in Redis with short TTL (15-30 seconds) for read speed.
- Invalidate cache immediately after booking/hold/block changes.
- Broadcast updates from the same transaction boundary that commits state changes.

## UX Requirements

- Customer app: visually mark section as unavailable in under 2 seconds after update arrives.
- Employee app/web: display who changed status when caused by staff action.
- If stream disconnects, show "Refreshing availability..." and auto-reconnect with exponential backoff.

## Monitoring

Track:
- stream delivery latency (p95 under 1 second),
- mismatch rate between snapshot and stream state,
- failed booking attempts due to stale client state,
- hold expiration conversion rate.

## MVP Scope

For MVP, implement:
1. Snapshot endpoint,
2. WebSocket updates for `availability.updated`,
3. Hold TTL expiration worker,
4. Client-side re-sync on version gap.

This gives reliable real-time behavior without requiring complex event-sourcing in v1.
