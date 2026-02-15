-- Multi-tenant schema for Night Life backend.
-- Includes realtime section availability support via holds + snapshots + event outbox.

CREATE TABLE clubs (
  id UUID PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  display_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  global_role VARCHAR(32) NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE employee_roles (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_name VARCHAR(50) NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(club_id, user_id, role_name)
);

CREATE TABLE venues (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location JSONB NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(id, club_id)
);

CREATE TABLE sections (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  section_type VARCHAR(64) NOT NULL,
  min_spend NUMERIC(12,2) NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(venue_id, name),
  UNIQUE(id, club_id),
  FOREIGN KEY (venue_id, club_id) REFERENCES venues(id, club_id) ON DELETE CASCADE
);

CREATE TABLE time_slots (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  section_id UUID NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'open',
  base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at),
  UNIQUE(id, club_id),
  FOREIGN KEY (section_id, club_id) REFERENCES sections(id, club_id) ON DELETE CASCADE
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  time_slot_id UUID NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  status VARCHAR(32) NOT NULL DEFAULT 'requested',
  quoted_amount NUMERIC(12,2),
  notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(id, club_id),
  FOREIGN KEY (time_slot_id, club_id) REFERENCES time_slots(id, club_id)
);

CREATE TABLE booking_events (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL,
  event_type VARCHAR(32) NOT NULL,
  actor_user_id UUID REFERENCES users(id),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (booking_id, club_id) REFERENCES bookings(id, club_id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL,
  provider VARCHAR(32) NOT NULL,
  provider_reference VARCHAR(255),
  amount NUMERIC(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (booking_id, club_id) REFERENCES bookings(id, club_id) ON DELETE CASCADE
);

-- Realtime section availability projections (materialized read model).
CREATE TABLE section_availability_snapshots (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  section_id UUID NOT NULL,
  time_slot_id UUID NOT NULL,
  available_spots INTEGER NOT NULL DEFAULT 0,
  held_spots INTEGER NOT NULL DEFAULT 0,
  confirmed_spots INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(club_id, section_id, time_slot_id),
  FOREIGN KEY (section_id, club_id) REFERENCES sections(id, club_id) ON DELETE CASCADE,
  FOREIGN KEY (time_slot_id, club_id) REFERENCES time_slots(id, club_id) ON DELETE CASCADE
);

-- Short-lived locks used to prevent overselling while user checks out.
CREATE TABLE section_holds (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  section_id UUID NOT NULL,
  time_slot_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  seats INTEGER NOT NULL CHECK (seats > 0),
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at TIMESTAMPTZ,
  FOREIGN KEY (section_id, club_id) REFERENCES sections(id, club_id) ON DELETE CASCADE,
  FOREIGN KEY (time_slot_id, club_id) REFERENCES time_slots(id, club_id) ON DELETE CASCADE
);

-- Outbox table for websocket/subscription fanout workers.
CREATE TABLE availability_outbox (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  section_id UUID NOT NULL,
  time_slot_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (section_id, club_id) REFERENCES sections(id, club_id) ON DELETE CASCADE,
  FOREIGN KEY (time_slot_id, club_id) REFERENCES time_slots(id, club_id) ON DELETE CASCADE
);

CREATE INDEX idx_employee_roles_club_user ON employee_roles(club_id, user_id);
CREATE INDEX idx_venues_club_id ON venues(club_id);
CREATE INDEX idx_sections_club_id ON sections(club_id);
CREATE INDEX idx_time_slots_club_section ON time_slots(club_id, section_id);
CREATE INDEX idx_bookings_club_status ON bookings(club_id, status);
CREATE INDEX idx_booking_events_booking_id ON booking_events(booking_id);
CREATE INDEX idx_payments_club_status ON payments(club_id, status);
CREATE INDEX idx_availability_snapshot_key ON section_availability_snapshots(club_id, section_id, time_slot_id);
CREATE INDEX idx_section_holds_expires_at ON section_holds(club_id, status, expires_at);
CREATE INDEX idx_availability_outbox_unpublished ON availability_outbox(club_id, published_at) WHERE published_at IS NULL;
