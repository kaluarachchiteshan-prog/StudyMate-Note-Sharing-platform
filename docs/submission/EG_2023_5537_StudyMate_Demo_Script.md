# StudyMate Hub - 5-minute demonstration script

**Student:** Chamuditha K.D.T.  
**Index:** EG/2023/5537  
**Course:** EC4307 Web Application Development  
**Target duration:** 4 minutes 45 seconds (leave a 15-second margin)

## Before recording

- Use the browser-based app at `http://localhost:5173` in a desktop-sized window.
- Start MongoDB and the app using the steps in the project README.
- Test that `/api/health` reports a connected database and that notes load.
- Keep a clean sample note ready to create, edit, and delete during the video.
- Close unrelated tabs and notifications. Turn the camera on, as required by the rubric.
- Do not show credentials, private environment files, or real student information.

## Timed walkthrough

| Time | Show and say |
|---|---|
| 0:00-0:25 | **Introduction.** “I’m Chamuditha K.D.T., EG/2023/5537. StudyMate Hub is a browser-based study-note sharing application. It uses React and Vite, an Express/Node API, and MongoDB. I’ll demonstrate persistent note CRUD, filtering, and validation.” |
| 0:25-0:55 | **Read / UI.** Point out the dashboard, note cards, subject chips, search, and sort selector. Search a course code, then choose a subject filter. Open a note's details. Explain that the directory data is loaded through the REST API from MongoDB. |
| 0:55-1:35 | **Create.** Select “Share a note”. Enter a unique title, course code, subject, university, description, and tags. Submit. Point out the success message and the new card in the list. |
| 1:35-2:00 | **Persistence.** Refresh the browser. Search for the created title and open it again. Explain that it remains after refresh because it was stored in MongoDB, not only in browser state. |
| 2:00-2:40 | **Update.** Open edit for the test note. Change the title or description and save. Show the updated card/details and refresh once more if time allows. |
| 2:40-3:05 | **Delete.** Select delete on the same test note. Read the confirmation and confirm it. Search for the title and show that the record is gone. |
| 3:05-3:35 | **Validation.** Open the create form and try to submit it empty to show browser validation. Then explain that the API independently uses a strict Zod schema and returns HTTP 400 for invalid input; do not spend time typing a malformed direct API request unless the API client is already prepared. |
| 3:35-4:10 | **Database and design.** Briefly show the README database diagram and explain `_id`, note fields, timestamps, schema limits, and the `notes` collection. Mention the list, item, create, update, and delete API endpoints. |
| 4:10-4:45 | **Close.** Summarize that CRUD is persistent, notes can be searched/filtered/sorted, and server-side validation is present. Mention the documented setup and the current scope: this demonstration handles note metadata and links; it does not include sign-in or binary uploads. |

## If something goes wrong

- If notes do not load, check MongoDB first, then `server/.env`, then the API terminal and `/api/health`.
- If the app is not running, start it with `npm run dev` at the repository root and wait for both API and Vite ready messages.
- If a sample note is edited or deleted by mistake, recreate a demonstration note through the form; do not delete the MongoDB database.
- If the recording is approaching five minutes, skip the optional database tooling view rather than rushing through CRUD.
