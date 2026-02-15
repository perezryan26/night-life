-- Multi-tenant schema for Night Life backend

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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sections (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  section_type VARCHAR(64) NOT NULL,
  min_spend NUMERIC(12,2) NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(venue_id, name)
);

CREATE TABLE time_slots (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'open',
  base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  time_slot_id UUID NOT NULL REFERENCES time_slots(id),
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  status VARCHAR(32) NOT NULL DEFAULT 'requested',
  quoted_amount NUMERIC(12,2),
  notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE booking_events (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  event_type VARCHAR(32) NOT NULL,
  actor_user_id UUID REFERENCES users(id),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider VARCHAR(32) NOT NULL,
  provider_reference VARCHAR(255),
  amount NUMERIC(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employee_roles_club_user ON employee_roles(club_id, user_id);
CREATE INDEX idx_venues_club_id ON venues(club_id);
CREATE INDEX idx_sections_club_id ON sections(club_id);
CREATE INDEX idx_time_slots_club_section ON time_slots(club_id, section_id);
CREATE INDEX idx_bookings_club_status ON bookings(club_id, status);
CREATE INDEX idx_booking_events_booking_id ON booking_events(booking_id);
CREATE INDEX idx_payments_club_status ON payments(club_id, status);
