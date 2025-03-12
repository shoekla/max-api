// test/index.spec.ts
import { SELF } from "cloudflare:test";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

const BASE_URL = "http://127.0.0.1:8787";

beforeAll(async () => {
  // Ensure the Artists and Release table exists
  await SELF.fetch(`${BASE_URL}/test-setup`, { method: "POST" }); 
});

afterAll(async () => {
  // Ensure the Artists and Release table exists
  await SELF.fetch(`${BASE_URL}/test-cleanup`, { method: "POST" }); 
});

describe("App is running", () => {
  it("respond with success", async () => {
    const response = await SELF.fetch(BASE_URL);
    const data = await response.json();
    expect(data).toEqual({ success: true });
  });
});

describe("Artists POST API", () => {
  const testArtist = {
    name: "Test Artist",
    bio: "Test Bio",
    genre: "Indie",
  };

  it("should require all fields to create an artist", async () => {
    const response = await SELF.fetch(`${BASE_URL}/artists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({name: "Test"}),
    });
    expect(response.status).toBe(400);
  });

  // Test creating a new artist
  it("should add a new artist", async () => {
    const response = await SELF.fetch(`${BASE_URL}/artists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testArtist),
    });
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty("id");
    expect(data.id).toContain("artist_");
    expect(data.name).toBe(testArtist.name);
    expect(data.bio).toBe(testArtist.bio);
    expect(data.genre).toBe(testArtist.genre);
  });

});

describe("Artists GET API", () => {
  let testArtistId: string;
  const testArtist = {
    name: "Test Artist",
    bio: "Test Bio",
    genre: "Indie",
  };
  const artistGenreCaseMismatch = testArtist['genre'].toUpperCase();
  const artistNameCaseMismatch = testArtist['name'].toUpperCase();
  beforeAll(async () => {
    // Add a test artist before each test
    const response = await SELF.fetch(`${BASE_URL}/artists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testArtist),
    });

    const data = await response.json();
    testArtistId = data.id;
  });
  // Test retrieving all artists and check for the newly added one
  it("should retrieve the newly added artist", async () => {
    const response = await SELF.fetch(`${BASE_URL}/artists`);
    expect(response.status).toBe(200);

    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);

    const foundArtist = data.find((artist) => artist.id === testArtistId);
    expect(foundArtist).toBeDefined();
    expect(foundArtist.name).toBe(testArtist.name);
    expect(foundArtist.bio).toBe(testArtist.bio);
    expect(foundArtist.genre).toBe(testArtist.genre);
  });

  // Optional: Test filtering by genre
  it("should filter artists by genre case insensitive", async () => {
    const response = await SELF.fetch(`${BASE_URL}/artists?genre=${artistGenreCaseMismatch}`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    // Verify that our newly added artist appears in the filtered results
    const filteredArtist = data.find((artist) => artist.id === testArtistId);
    expect(filteredArtist).toBeDefined();
  });

  it("should filter artists by name case insensitive", async () => {
    const response = await SELF.fetch(`${BASE_URL}/artists?name=${artistNameCaseMismatch}`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    // Verify that our newly added artist appears in the filtered results
    const filteredArtist = data.find((artist) => artist.id === testArtistId);
    expect(filteredArtist).toBeDefined();
  });
});

describe("Releases POST API", () => {
  let testArtistId: string;
  const testArtist = {
    name: "Test Artist",
    bio: "Test Bio",
    genre: "Indie",
  };
  beforeAll(async () => {
    // Add a test artist before each test
    const response = await SELF.fetch(`${BASE_URL}/artists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testArtist),
    });

    const data = await response.json();
    testArtistId = data.id;
  });
  
  it("should require all fields to create an release", async () => {
    const response = await SELF.fetch(`${BASE_URL}/releases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({title: "Test"}),
    });
    expect(response.status).toBe(400);
  });

  it("should require existing artist to create release", async () => {
    const testRelease = {
      title: "Test Release",
      release_date: "2025-03-15",
      status: "published",
      genre: "Rock",
      artist_id: 'non_existent_artist_id',
    }
    const response = await SELF.fetch(`${BASE_URL}/releases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testRelease),
    });
    expect(response.status).toBe(404);
  });

  it("should add a new release", async () => {
    const testRelease = {
      title: "Test Release",
      release_date: "2025-03-15",
      status: "published",
      genre: "Rock",
      artist_id: testArtistId,
    }
    const response = await SELF.fetch(`${BASE_URL}/releases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testRelease),
    });
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty("id");
    expect(data.title).toBe(testRelease.title);
    expect(data.id).toContain("release_");
    expect(data.status).toBe(testRelease.status);
    expect(data.release_date).toBe(testRelease.release_date);
    expect(data.genre).toBe(testRelease.genre);
    expect(data.artist_id).toBe(testArtistId);
  });
});

describe("Releases GET API", () => {
  let testArtistId: string;
  let testArtist2Id: string;
  let testReleaseJazzId: string;
  let testReleaseRockId: string;
  const testArtist = {
    name: "Test Artist",
    bio: "Test Bio",
    genre: "Indie",
  };
  const testArtist2 = {
    name: "Test Artist2",
    bio: "Test Bio2",
    genre: "Soundtrack",
  };
  beforeAll(async () => {
    // Add a test artist before each test
    let response = await SELF.fetch(`${BASE_URL}/artists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testArtist),
    });

    let data = await response.json();
    testArtistId = data.id;
    response = await SELF.fetch(`${BASE_URL}/artists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testArtist2),
    });

    data = await response.json();
    testArtist2Id = data.id;

    const testReleaseRock = {
      title: "Test Release",
      release_date: "2025-03-15",
      status: "published",
      genre: "Rock",
      artist_id: testArtistId,
    }
    const testReleaseRock2 = {
      title: "Test Release",
      release_date: "2025-03-15",
      status: "published",
      genre: "Rock",
      artist_id: testArtist2Id,
    }
    const testReleaseJazz = {
      title: "Test Release",
      release_date: "2026-03-15",
      status: "unreleased",
      genre: "Jazz",
      artist_id: testArtistId,
    }
    response = await SELF.fetch(`${BASE_URL}/releases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testReleaseRock),
    });
    expect(response.status).toBe(201);
    data = await response.json();
    testReleaseRockId = data.id;

    response = await SELF.fetch(`${BASE_URL}/releases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testReleaseJazz),
    });
    expect(response.status).toBe(201);
    data = await response.json();
    testReleaseJazzId = data.id;

    response = await SELF.fetch(`${BASE_URL}/releases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testReleaseRock2),
    });
    expect(response.status).toBe(201);
  });

  it("should retrieve all added releases", async () => {
    const response = await SELF.fetch(`${BASE_URL}/releases`);
    expect(response.status).toBe(200);

    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(3);
  });

  it("should retrieve the newly added releases filtered by artist id", async () => {
    const response = await SELF.fetch(`${BASE_URL}/releases?artist_id=${testArtistId}`);
    expect(response.status).toBe(200);

    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(2);
  });

  it("should retrieve the newly added releases filtered by genre", async () => {
    const response = await SELF.fetch(`${BASE_URL}/releases?genre=Rock`);
    expect(response.status).toBe(200);

    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(2);
  });

  it("should retrieve the newly added releases filtered by genre, status and artist id", async () => {
    let response = await SELF.fetch(`${BASE_URL}/releases??artist_id=${testArtistId}&genre=rock`);
    expect(response.status).toBe(200);

    let data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0].id).toBe(testReleaseRockId);
    response = await SELF.fetch(`${BASE_URL}/releases??artist_id=${testArtistId}&genre=jazz`);
    expect(response.status).toBe(200);

    data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0].id).toBe(testReleaseJazzId);
    response = await SELF.fetch(`${BASE_URL}/releases??artist_id=${testArtistId}&status=published`);
    expect(response.status).toBe(200);

    data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0].id).toBe(testReleaseRockId);
  });
});
