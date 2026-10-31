# StudyMate Hub

StudyMate Hub is a course-note sharing application built as a MERN-style mini project: MongoDB stores study notes, Express and Node.js provide a REST API, and React with Vite powers the responsive interface.

## Requirements

- Node.js 20.19 or newer (or 22.12 or newer) and npm
- MongoDB Community Server running locally

## Run locally

1. Install the project dependencies from the repository root:

   ```powershell
   npm install
   ```

2. Copy the sample server configuration and keep the copy local:

   ```powershell
   Copy-Item .env.example server\.env
   ```

   The default `MONGODB_URI` points to `mongodb://127.0.0.1:27017/studymate`. The example file contains no credentials. Do not commit `server/.env`.

3. Start MongoDB. If the MongoDB service is not already running, open a separate terminal from the repository root:

   ```powershell
   New-Item -ItemType Directory -Force .data\mongodb
   mongod --dbpath .data\mongodb --bind_ip 127.0.0.1
   ```

4. Start the API and frontend from the repository root:

   ```powershell
   npm run dev
   ```

5. Open `http://localhost:5173`. The API runs on `http://127.0.0.1:5000`; Vite proxies `/api` requests to it. On startup, existing legacy StudyMate notes are migrated in place to the current note schema without deleting them. On the first connection to an empty database, four sample notes are inserted. Set `SEED_DEMO_DATA=false` in `server/.env` to disable this for a clean database.

## Study-note operations

The Study Notes collection is the main project entity and has persistent, database-backed CRUD:

| Operation | Interface | API |
| --- | --- | --- |
| Create account / sign in | Sign-in button in the header | `POST /api/auth/register`, `POST /api/auth/login` |
| Check session / sign out | Account controls in the header | `GET /api/auth/me`, `POST /api/auth/logout` |
| Create | Share a note form | `POST /api/notes` |
| Read | Note list and detail dialog | `GET /api/notes`, `GET /api/notes/:id` |
| Update | Edit note form | `PUT /api/notes/:id` |
| Delete | Confirmed delete action | `DELETE /api/notes/:id` |

The directory supports text search, subject filtering, and sorting by recent, popularity, downloads, or title. Server-side Zod validation rejects incomplete, oversized, or unexpected input. The API returns explicit 400 and 404 responses for invalid data and identifiers.

Browsing notes is public, but creating an account or signing in is required to upload files, create notes, and download notes. Only the account that shared a note can edit or delete it. Passwords are stored as scrypt hashes, and sign-in sessions use expiring, HTTP-only cookies backed by MongoDB. Existing demo notes remain readable but are not editable by newly registered accounts. Uploaded PDF, Word, and text files (up to 10 MB each) are stored under `server/.data/uploads`; note metadata and user sessions are stored in MongoDB. Keep the API private and use only non-sensitive sample data. Uploaded files are local to the server and are not suitable for ephemeral hosting.

## Study groups

The Study Groups item in the sidebar opens a MongoDB-backed group directory. Visitors can browse and search groups; a signed-in account is required to create a group or join/leave one. Group members can open a group space to see its roster, post persistent discussion messages, and create shared study tasks with due dates. Members can mark tasks complete, and only group members can read or update group activity.

| Operation | API |
| --- | --- |
| Browse groups | `GET /api/study-groups` |
| Create a group | `POST /api/study-groups` |
| View member roster | `GET /api/study-groups/:id` |
| Read group discussion | `GET /api/study-groups/:id/messages` |
| Post a discussion message | `POST /api/study-groups/:id/messages` |
| List shared study tasks | `GET /api/study-groups/:id/tasks` |
| Create a study task | `POST /api/study-groups/:id/tasks` |
| Update task completion | `PATCH /api/study-groups/:id/tasks/:taskId` |
| Join a group | `POST /api/study-groups/:id/join` |
| Leave a group | `DELETE /api/study-groups/:id/membership` |

## Public note requests

The Note Requests section is a public board: anyone can browse open or fulfilled requests and search by title, subject, or course code. Signed-in users can post a request, which displays their account name publicly, and mark their own requests fulfilled.

| Operation | API |
| --- | --- |
| Browse requests by status | `GET /api/note-requests?status=open` |
| Post a public request | `POST /api/note-requests` |
| Mark your request fulfilled | `PATCH /api/note-requests/:id/status` |

## Interface preview

![StudyMate Hub notes dashboard](docs/screenshots/study-notes-dashboard.png)

The original Next.js routes and Firebase modules remain in the repository as reference material; the runnable MERN implementation is in `client/` and `server/`.

## Assignment submission materials

- **Mini-project report (8 pages):** [PDF](docs/submission/EG_2023_5537_StudyMate_Mini_Project_Report.pdf) and [editable Markdown source](docs/submission/EG_2023_5537_StudyMate_Mini_Project_Report.md).
- **Demonstration plan:** [timed script designed to stay under 5 minutes](docs/submission/EG_2023_5537_StudyMate_Demo_Script.md).

The report uses underscores in the filename in place of slashes in index number `EG/2023/5537`, while displaying the index number in its original format. Record the demonstration with the camera on as specified in the evaluation rubric.

To regenerate the PDF from its editable Markdown source on Windows, install ReportLab with `python -m pip install reportlab`, then run `python docs\submission\build_report.py`.

## Database design

`studymate.notes` is a MongoDB collection. MongoDB assigns each note an `_id` ObjectId primary key. Timestamps are maintained by Mongoose. The sample notes have no required relationship to another collection, keeping CRUD independently demonstrable.

```mermaid
erDiagram
    STUDY_NOTE {
        ObjectId _id PK
        string title
        string description
        string subject
        string courseCode
        string university
        string[] tags
        string fileUrl
        string fileName
        string fileType
        string authorName
        number upvotes
        number downloadsCount
        date createdAt
        date updatedAt
    }
```

Indexes support newest-first listing, and a MongoDB text index is defined for the note content fields. The directory uses escaped, case-insensitive substring matching across titles, descriptions, subjects, course codes, and tags. The UI displays required fields, subject/course details, tags, preview text, contributor, and timestamps.

## Validation and errors

- Client-side HTML constraints provide immediate feedback for required and bounded-length fields.
- The API applies a strict Zod schema and rejects unknown properties, unsafe file URL protocols, invalid note data, and more than ten tags.
- Invalid input and IDs return a 400 response; missing notes return 404.
- The app shows loading, empty, API error, save, and delete states. Deletion requires confirmation.
- `/api/health` reports API and MongoDB connection status.

## Verification

From the repository root:

```powershell
npm test
npm run typecheck
npm run build
```

The API tests cover input trimming, required fields, unexpected properties, URL schemes, and tag limits. For a presentation, also demonstrate create → refresh the browser → read → edit → refresh → delete, then show the MongoDB collection and the validation response for an invalid request.

## Rubric coverage checklist

| Rubric area | Evidence in the project |
| --- | --- |
| Create / Read / Update / Delete | Working persistent note forms, list/details, edits, confirmed deletes, and REST endpoints |
| Validation / error handling | Browser constraints, strict server validation, API errors, loading/retry states |
| Database design | Mongoose schema, ObjectId key, timestamps, indexes, and ER diagram above |
| UI / UX | Responsive notes dashboard, search, subject filters, sorting, dialogs, and empty/loading/error states |
| Code quality / version control | Separate client and server workspaces, reusable API/form components, and Git repository |
| Documentation | Setup steps, API map, database diagram, verification commands, and demo checklist |
| Demonstration | Suggested live workflow: show the list, create, read, update, refresh to prove persistence, delete, and validation |

Capture original screenshots of the running application for the final report. Personalize the report and presentation, and be prepared to explain the schema, validation, API routes, and React state flow.
