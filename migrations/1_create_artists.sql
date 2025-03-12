CREATE TABLE IF NOT EXISTS artists (
    id TEXT PRIMARY KEY, -- to support artist_123 syntax (123 being the ID)
    name TEXT NOT NULL,
    bio TEXT NOT NULL,
    genre TEXT NOT NULL
);