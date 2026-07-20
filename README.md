# Expert Listing — Backend

This is the API server for Expert Listing. It uses Node.js, Express, and PostgreSQL.

---

## Requirements

- Node.js version 18 or later
- A running PostgreSQL database

---

## How to Run

**Step 1.** Install the packages.
```bash
npm install
```

**Step 2.** Create the environment file.
```bash
cp .env.example .env
```
Open the `.env` file. Set the `DATABASE_URL` value.

**Step 3.** Push the schema and generate the Prisma client.
```bash
npm run db:push
npm run db:generate
```

**Step 4.** Add sample data.
```bash
npm run seed
```

**Step 5.** Start the server.
```bash
npm run dev
```

The server runs on **http://localhost:3000**. To use a different port, set `PORT` in the `.env` file.

---

## Environment File

Create a `.env` file in the root folder.

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/expert_listing"
PORT=3000
```

> If the password contains special characters, you must encode them.
> Example: `@` becomes `%40`. `!` becomes `%21`.

---

## Endpoints

### Feed

| Method | Path | Action |
|--------|------|--------|
| `GET` | `/posts` | Get a list of feed posts |
| `POST` | `/posts` | Create a new post |

**GET /posts — Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `tab` | `Property`, `General`, `Request`, or `All` | Filter by post category |
| `type` | `For Rent`, `For Sale`, or `All` | Filter by listing type |
| `location` | string | Filter by location name |
| `search` | string | Search post text or author name |
| `limit` | number | Number of results (default: `10`) |
| `offset` | number | Skip this many results (default: `0`) |

The response includes an `X-Cache` header. The value is `HIT` or `MISS`.

**POST /posts — Request Body**

```json
{
  "body": "3-bedroom apartment with ocean view",
  "location": "Lekki Phase 1, Lagos",
  "type": "Property",
  "listingType": "For Rent",
  "media": [{ "type": "image", "url": "https://..." }]
}
```

---

### Likes

| Method | Path | Action |
|--------|------|--------|
| `POST` | `/posts/:id/like` | Like or unlike a post |

**Response**

```json
{
  "likesCount": 12,
  "likedByUser": true,
  "likedBy": [{ "name": "Alex Johnson", "username": "alex.johnson" }]
}
```

---

### Comments

| Method | Path | Action |
|--------|------|--------|
| `GET` | `/posts/:id/comments` | Get comments for a post |
| `POST` | `/posts/:id/comments` | Add a comment to a post |

**POST /posts/:id/comments — Request Body**

```json
{ "body": "What is the asking price?" }
```

---

## Schema

The schema is in `prisma/schema.prisma`. Prisma manages the tables.

**users**

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT | Primary key |
| `name` | TEXT | |
| `avatar` | TEXT | URL of the avatar image |
| `role` | TEXT | Agent, Developer, Broker, or Individual |
| `has_status` | BOOLEAN | Shows an online ring on the avatar |

**posts**

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT | Primary key |
| `user_id` | TEXT | Foreign key → users.id |
| `type` | TEXT | Property, General, or Request |
| `body` | TEXT | Post text |
| `location` | TEXT | Example: Lekki Phase 1, Lagos |
| `listing_type` | TEXT | For Rent, For Sale, or null |
| `media` | JSONB | Array of media items |
| `bookmarks_count` | INT | Default: 0 |
| `created_at` | TIMESTAMPTZ | Default: now() |

**comments**

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT | Primary key |
| `post_id` | TEXT | Foreign key → posts.id |
| `user_id` | TEXT | Foreign key → users.id |
| `body` | TEXT | Comment text |
| `created_at` | TIMESTAMPTZ | Default: now() |

**likes**

| Column | Type | Notes |
|--------|------|-------|
| `post_id` | TEXT | Foreign key → posts.id |
| `user_id` | TEXT | Foreign key → users.id |
| — | — | Primary key is (post_id, user_id) |

All related rows delete automatically when a parent row is deleted.

---

## Cache

The `GET /posts` endpoint uses a cache in memory.

- The cache stores each response for 5 seconds.
- The key is a combination of all query parameters.
- The `X-Cache` header shows `HIT` when the response comes from the cache.

---

## Current User

Authentication is not in scope. The server reads the current user from the `x-user-id` request header. If the header is not present, the server uses `"currentUser"`. This user exists in the database after you run the seed.

---

## What Was Not Built

| Item | Reason |
|------|--------|
| Authentication and JWT | Out of scope |
| Email verification | Out of scope |
| Payments | Out of scope |
| Redis cache | A simple in-memory map is enough for this scale |
| CDN and image resizing | Out of scope. Images use Unsplash URLs. |
| File uploads | Out of scope. Media URLs are plain strings in the request body. |
| Cursor-based pagination | Offset pagination is used. Cursor pagination is better at scale. |
| Rate limiting | Not applied. Use `express-rate-limit` in production. |
| HTTPS | Not configured. This server is for local development only. |
