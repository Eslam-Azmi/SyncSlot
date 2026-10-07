CREATE TABLE users(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'patient')),
  specialty TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

CREATE TABLE slots(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT concurrency UNIQUE (doctor_id, start_time)
)

CREATE TABLE bookings(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID UNIQUE REFERENCES slots(id),
  patient_id UUID REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)