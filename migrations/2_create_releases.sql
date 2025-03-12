CREATE TABLE IF NOT EXISTS releases (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    release_date TEXT NOT NULL,
    status TEXT NOT NULL,
    genre TEXT NOT NULL,
    artist_id TEXT NOT NULL,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE -- Deletes all artists releases if artist record is deleted
);