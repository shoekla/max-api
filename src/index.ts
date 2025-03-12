import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  return c.json({ success: true });
});

// ONLY MEANT FOR TEST SETUP
app.post("/test-setup", async (c) => {
  // Making it one line since ran into formatting syntax issues if I go multi-line
  await c.env.DB.exec(`CREATE TABLE IF NOT EXISTS artists (id TEXT PRIMARY KEY, name TEXT NOT NULL, bio TEXT NOT NULL, genre TEXT NOT NULL);`);
  await c.env.DB.exec(`CREATE TABLE IF NOT EXISTS releases (id TEXT PRIMARY KEY, title TEXT NOT NULL, release_date TEXT NOT NULL, status TEXT NOT NULL, genre TEXT NOT NULL, artist_id TEXT NOT NULL, FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE);`);

  return c.json({ success: true });
});

// ONLY MEANT FOR TEST CLEANUP
app.post("/test-cleanup", async (c) => {
  try {
    await c.env.DB.exec(`DROP TABLE IF EXISTS releases;`);
    await c.env.DB.exec(`DROP TABLE IF EXISTS artists;`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ info: error.message }, 500);
  }
});

async function generateNewId(DB: D1Database, tableName: string, prefix: string): Promise<string> {
  const lastEntry = await DB.prepare(`
    SELECT id FROM ${tableName} 
    ORDER BY CAST(SUBSTR(id, INSTR(id, '_') + 1) AS INTEGER) DESC 
    LIMIT 1
  `).first(); // SUBSTR CAST because I ran into an issue where artist_9 was returned instead of artist_10 causing unique key to fail
  const lastIdNumber = lastEntry ? parseInt(lastEntry.id.split('_')[1]) : 0; // Sets to 0 if no entry in table
  return `${prefix}_${lastIdNumber + 1}`;
}

app.get("/artists", async (c) => {
  // Get url params
  const genre = c.req.query('genre');
  const name = c.req.query('name');
  let query = "SELECT id, name, bio, genre FROM artists"
  let params = [];
  if (genre) {
    query += " WHERE LOWER(genre) = LOWER(?)"; // Lower to have case-insensitive match
    params.push(genre);
  }
  if (name) {
    // Following query could proably be changed to LIKE to enable sub-string searches, but don't want to change acceptance behavior
    // WHERE LOWER(name) LIKE LOWER(?)
    query += " WHERE LOWER(name) = LOWER(?)"; // Lower to have case-insensitive match
    params.push(name);
  }

  try {
    const artistRecords = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(artistRecords.results, 200);
  } catch (err) {
    return c.json({ error: 'Unexpected error', info: err }, 500); // internal server error code
  }
});

app.post('/artists', async (c) => {
  //Get post body params
  const { name, bio, genre } = await c.req.json();

  if (!name || !bio || !genre) {
    return c.json({ error: 'All fields (name, bio, genre) are required' }, 400); // Bad request code
  }
  try {
    const newTextId = await generateNewId(c.env.DB, "artists", "artist");
    // No searching for pre-exisiting name, just inserting the new values
    await c.env.DB.prepare(
      "INSERT INTO artists (id, name, bio, genre) VALUES (?, ?, ?, ?);"
    ).bind(newTextId, name, bio, genre).run();
  
    const addedArtist = await c.env.DB.prepare("SELECT * FROM artists WHERE id = ?").bind(newTextId).first();

    if (!addedArtist) {
        return c.json({ error: "Artist insert failed" }, 500); // internal server error code
    }
    return c.json(addedArtist, 201); // created code
  } catch (err) {
      return c.json({ error: 'Unexpected error', info: err }, 500); // internal server error code
  }
  
});

app.get('/releases', async (c) => {
  // Get url params
  const genre = c.req.query('genre');
  const status = c.req.query('status');
  const artist_id = c.req.query('artist_id')

  let query = "SELECT * FROM releases";
  let conditions = [];
  let params = [];

  if (artist_id) {
      conditions.push("artist_id = ?");
      params.push(artist_id);
  }
  if (genre) {
      conditions.push("LOWER(genre) = LOWER(?)");
      params.push(genre);
  }
  if (status) {
      conditions.push("LOWER(status) = LOWER(?)");
      params.push(status);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  try {
    const releaseRecords = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(releaseRecords.results, 200);
  } catch (err) {
    return c.json({ error: 'Unexpected error', info: err }, 500); // internal server error code
  }

});

app.post('/releases', async (c) => {
  // Get post body params
  const { title, release_date, status, genre, artist_id } = await c.req.json();

  if (!title || !release_date || !status || !genre || !artist_id) {
    return c.json({ error: 'All fields (title, release_date, status, genre, artist_id) are required' }, 400);
  }

  try {
    // Check if artist_id exists
    const artistExists = await c.env.DB.prepare("SELECT id FROM artists WHERE id = ?").bind(artist_id).first();
    if (!artistExists) {
        return c.json({ error: `Artist with id '${artist_id}' does not exist` }, 404); // not found code
    }

    const newTextId = await generateNewId(c.env.DB, "releases", "release");

    // Insert new release
    await c.env.DB.prepare("INSERT INTO releases (id, title, release_date, status, genre, artist_id) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(newTextId, title, release_date, status, genre, artist_id).run();
    
    const addedRelease = await c.env.DB.prepare("SELECT * FROM releases WHERE id = ?").bind(newTextId).first();
    if (!addedRelease) {
        return c.json({ error: "Release insert failed" }, 500);
    }
    return c.json(addedRelease, 201);
  }catch (err) {
    return c.json({ error: 'Unexpected error', info: err }, 500); // internal server error code
  }
});

export default app;
