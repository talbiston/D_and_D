# PRD: Backend API with SQLite Storage

## Introduction

Replace localStorage with a persistent backend API using Express and SQLite, packaged in a Docker container and deployed to Fly.io. Characters will be identified by unique IDs that can be shared as links, enabling multi-device access and simple sharing without user accounts.

## Goals

- Persist character data in SQLite database instead of browser localStorage
- Enable access to characters from any device via unique character ID
- Provide shareable read-only links for characters
- Package everything in a Docker container for easy deployment
- Deploy to Fly.io with persistent storage

## User Stories

### US-001: Set up Express server with TypeScript
**Description:** As a developer, I need a basic Express server structure to build the API on.

**Acceptance Criteria:**
- [ ] Create `server/` directory with Express + TypeScript setup
- [ ] Add `server/index.ts` with basic Express app listening on PORT env var (default 3001)
- [ ] Add health check endpoint `GET /api/health` returning `{ status: 'ok' }`
- [ ] Add `server/package.json` with necessary dependencies
- [ ] Add `server/tsconfig.json` for TypeScript compilation
- [ ] Server starts without errors via `npm run dev`
- [ ] Typecheck passes

### US-002: Set up SQLite database with schema
**Description:** As a developer, I need a SQLite database to store character data.

**Acceptance Criteria:**
- [ ] Install `better-sqlite3` package for SQLite
- [ ] Create `server/db/schema.sql` with characters table
- [ ] Characters table has: id (TEXT PRIMARY KEY), name (TEXT), data (JSON), created_at (DATETIME), updated_at (DATETIME)
- [ ] Create `server/db/index.ts` that initializes database and runs schema
- [ ] Database file created at `./data/characters.db`
- [ ] Database initializes on server start
- [ ] Typecheck passes

### US-003: Create character API endpoint
**Description:** As a user, I want to create a new character and get a unique ID for it.

**Acceptance Criteria:**
- [ ] `POST /api/characters` accepts JSON body with character data
- [ ] Generates unique ID (nanoid or uuid)
- [ ] Stores character in SQLite
- [ ] Returns `{ id: string, character: CharacterData }`
- [ ] Returns 400 if body is invalid
- [ ] Typecheck passes

### US-004: Get character API endpoint
**Description:** As a user, I want to retrieve a character by its unique ID.

**Acceptance Criteria:**
- [ ] `GET /api/characters/:id` returns character data
- [ ] Returns full character JSON with id
- [ ] Returns 404 if character not found
- [ ] Typecheck passes

### US-005: Update character API endpoint
**Description:** As a user, I want to update an existing character's data.

**Acceptance Criteria:**
- [ ] `PUT /api/characters/:id` accepts JSON body with updated character data
- [ ] Updates character in SQLite
- [ ] Updates `updated_at` timestamp
- [ ] Returns updated character data
- [ ] Returns 404 if character not found
- [ ] Typecheck passes

### US-006: Delete character API endpoint
**Description:** As a user, I want to delete a character I no longer need.

**Acceptance Criteria:**
- [ ] `DELETE /api/characters/:id` removes character from database
- [ ] Returns `{ success: true }` on deletion
- [ ] Returns 404 if character not found
- [ ] Typecheck passes

### US-007: List characters API endpoint
**Description:** As a user, I want to see all my characters (by device/session or all public).

**Acceptance Criteria:**
- [ ] `GET /api/characters` returns array of character summaries
- [ ] Each summary includes: id, name, class, level, species, updated_at
- [ ] Sorted by updated_at descending (most recent first)
- [ ] Typecheck passes

### US-008: Create Dockerfile for full application
**Description:** As a developer, I need a Dockerfile that builds both frontend and backend.

**Acceptance Criteria:**
- [ ] Create `Dockerfile` in project root
- [ ] Multi-stage build: build frontend, build backend, run production
- [ ] Frontend built and served as static files by Express
- [ ] SQLite data directory at `/data` for persistent volume
- [ ] Exposes port 3000
- [ ] Container builds successfully with `docker build -t dnd-app .`
- [ ] Container runs successfully with `docker run -p 3000:3000 dnd-app`

### US-009: Add Fly.io configuration
**Description:** As a developer, I need Fly.io config files for deployment.

**Acceptance Criteria:**
- [ ] Create `fly.toml` with app configuration
- [ ] Configure persistent volume mount at `/data` for SQLite
- [ ] Set up health check endpoint
- [ ] Configure single instance (SQLite doesn't support multiple writers)
- [ ] Add `.dockerignore` to exclude node_modules, .git, etc.
- [ ] Document deployment steps in README

### US-010: Update React app to use API instead of localStorage
**Description:** As a developer, I need to update the frontend to use the new API.

**Acceptance Criteria:**
- [ ] Create `src/utils/api.ts` with functions: createCharacter, getCharacter, updateCharacter, deleteCharacter, listCharacters
- [ ] API base URL configurable via environment variable (default to relative `/api`)
- [ ] Update `storage.ts` to use API functions instead of localStorage
- [ ] Handle loading states in UI
- [ ] Handle API errors gracefully with user feedback
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-011: Update character creation flow for API
**Description:** As a user, I want creating a character to save it to the server and give me a shareable ID.

**Acceptance Criteria:**
- [ ] Character creation calls `POST /api/characters`
- [ ] After creation, redirect to `/character/:id` (not localStorage key)
- [ ] Display character ID somewhere on the page for sharing
- [ ] Show loading indicator during save
- [ ] Show error message if save fails
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-012: Update character sheet to load from API
**Description:** As a user, I want to view a character by going to its unique URL.

**Acceptance Criteria:**
- [ ] Route `/character/:id` fetches character from API
- [ ] Shows loading state while fetching
- [ ] Shows 404 page if character not found
- [ ] Character data populates the sheet correctly
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-013: Auto-save character changes to API
**Description:** As a user, I want my character changes to save automatically.

**Acceptance Criteria:**
- [ ] Character changes trigger `PUT /api/characters/:id`
- [ ] Debounce saves (500ms delay after last change)
- [ ] Show subtle "Saving..." indicator during save
- [ ] Show "Saved" confirmation briefly after success
- [ ] Show error if save fails, allow retry
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-014: Update home page to list characters from API
**Description:** As a user, I want the home page to show all available characters from the server.

**Acceptance Criteria:**
- [ ] Home page calls `GET /api/characters` on load
- [ ] Displays list of characters with name, class, level
- [ ] Each character links to `/character/:id`
- [ ] Shows loading state while fetching
- [ ] Shows empty state if no characters exist
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-015: Add shareable link UI
**Description:** As a user, I want to easily copy a shareable link to my character.

**Acceptance Criteria:**
- [ ] Character sheet shows "Share" button or link icon
- [ ] Clicking copies the full URL to clipboard
- [ ] Shows brief "Link copied!" confirmation
- [ ] URL format: `https://[domain]/character/[id]`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Express server serves both API endpoints and static frontend files
- FR-2: SQLite database stores all character data as JSON
- FR-3: Characters identified by unique nanoid/uuid, no user accounts
- FR-4: All API endpoints return JSON with appropriate status codes
- FR-5: Frontend communicates with backend via `/api/*` endpoints
- FR-6: Docker container packages entire application
- FR-7: Fly.io deployment with persistent volume for SQLite data

## Non-Goals

- No user authentication or accounts
- No migration from existing localStorage data
- No edit permissions on shared characters (read-only sharing)
- No campaign or party grouping features
- No character versioning or history
- No real-time collaboration or sync

## Technical Considerations

- **SQLite with better-sqlite3:** Synchronous API, simpler than async alternatives
- **Single instance on Fly.io:** SQLite doesn't handle multiple writers; scale vertically not horizontally
- **Persistent volume:** Fly.io requires volume mount for SQLite to survive deploys
- **API prefix:** All backend routes under `/api/*`, everything else serves React app
- **CORS:** Not needed since frontend and backend on same origin
- **Environment variables:** PORT, DATABASE_PATH, NODE_ENV

## Success Metrics

- Characters persist across browser sessions and devices
- Shareable links work for viewing characters
- App deploys successfully to Fly.io
- Response times under 200ms for all API calls

## Open Questions

- Should we add rate limiting to prevent abuse?
- Should there be a character limit per IP/session?
- Do we need backup/export functionality for the SQLite database?
