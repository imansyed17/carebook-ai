-- Providers table
CREATE TABLE IF NOT EXISTS providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'MD',
  phone TEXT,
  email TEXT,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  bio TEXT,
  accepting_new_patients INTEGER DEFAULT 1,
  avatar_url TEXT,
  rating REAL DEFAULT 4.5,
  review_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Appointment types table
CREATE TABLE IF NOT EXISTS appointment_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  category TEXT
);

-- Provider-appointment type relationship
CREATE TABLE IF NOT EXISTS provider_appointment_types (
  provider_id INTEGER NOT NULL,
  appointment_type_id INTEGER NOT NULL,
  PRIMARY KEY (provider_id, appointment_type_id),
  FOREIGN KEY (provider_id) REFERENCES providers(id),
  FOREIGN KEY (appointment_type_id) REFERENCES appointment_types(id)
);

-- Available time slots
CREATE TABLE IF NOT EXISTS time_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id INTEGER NOT NULL,
  slot_date TEXT NOT NULL,
  slot_time TEXT NOT NULL,
  is_available INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES providers(id),
  UNIQUE(provider_id, slot_date, slot_time)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  confirmation_number TEXT NOT NULL UNIQUE,
  provider_id INTEGER NOT NULL,
  appointment_type_id INTEGER NOT NULL,
  patient_first_name TEXT NOT NULL,
  patient_last_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_dob TEXT,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  interpreter_needed INTEGER DEFAULT 0,
  interpreter_language TEXT,
  reason_for_visit TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notification_preference TEXT DEFAULT 'email',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  cancelled_at DATETIME,
  cancel_reason TEXT,
  FOREIGN KEY (provider_id) REFERENCES providers(id),
  FOREIGN KEY (appointment_type_id) REFERENCES appointment_types(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_email ON appointments(patient_email);
CREATE INDEX IF NOT EXISTS idx_appointments_confirmation ON appointments(confirmation_number);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_time_slots_provider ON time_slots(provider_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_providers_specialty ON providers(specialty);
