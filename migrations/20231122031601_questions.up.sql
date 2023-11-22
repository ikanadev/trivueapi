CREATE TYPE enum_level as ENUM (
  'easy',
  'medium',
  'hard',
  'expert'
);

CREATE TABLE IF NOT EXISTS questions(
  id UUID PRIMARY KEY,
  text TEXT NOT NULL,
  enabled BOOLEAN NOT NULL,
  seconds INTEGER NOT NULL,
  level enum_level NOT NULL,
  created_at TIMESTAMP DEFAULT current_timestamp
);
