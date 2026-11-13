# Job & Application Management System

A beginner-friendly full-stack project using **Node.js, Express, MongoDB Atlas, Mongoose, HTML, CSS and JavaScript**.

## Features
- Create, view, update and delete job postings.
- Store title, company, description, skills, location, employment type and salary.
- Submit and view candidate applications.
- Update application status and delete applications.
- Each application references a job using MongoDB `ObjectId` (`job` field).
- Deleting a job also deletes applications linked to that job.
- Simple browser dashboard served by Express.

## 1. Requirements
Install:
- Node.js LTS: https://nodejs.org/
- Visual Studio Code: https://code.visualstudio.com/
- MongoDB Atlas account: https://www.mongodb.com/cloud/atlas

Check Node and npm in VS Code terminal:
```bash
node -v
npm -v
```

## 2. Open the project
1. Extract the ZIP file.
2. Open VS Code.
3. Select **File → Open Folder** and choose `job-application-management`.
4. Open **Terminal → New Terminal**.

## 3. Create MongoDB Atlas database
1. Sign in to MongoDB Atlas and create a free cluster.
2. Open **Database Access** and create a database username and password.
3. Open **Network Access** and add your current IP address. For a temporary learning setup, Atlas also allows `0.0.0.0/0`, but it is less secure; remove it after testing.
4. Open **Database → Connect → Drivers** and copy the Node.js connection string.
5. Replace the username, password and cluster placeholder with your own values. If the password contains special characters, URL-encode them.
6. The database name in this project's example URI is `jobs`. MongoDB creates the database and collections automatically when the first document is inserted.

Example shape (do not copy the placeholders literally):
```text
mongodb+srv://USERNAME:PASSWORD@cluster-name.xxxxx.mongodb.net/jobs?retryWrites=true&w=majority
```

## 4. Configure environment variables
1. In VS Code, duplicate `.env.example`.
2. Rename the duplicate to `.env` (exactly `.env`, not `.env.txt`).
3. Paste your Atlas URI after `MONGODB_URI=`.
4. Keep `.env` private. It is excluded from Git by `.gitignore`.

Example:
```env
PORT=5000
MONGODB_URI=mongodb+srv://yourUser:yourPassword@yourcluster.mongodb.net/jobs?retryWrites=true&w=majority
```

## 5. Install packages and run
In the VS Code terminal, make sure you are in the project root:
```bash
npm install
npm run dev
```
If nodemon does not start, use:
```bash
npm start
```
Expected terminal messages:
```text
MongoDB connected: ...
Server running at http://localhost:5000
```
Open **http://localhost:5000** in your browser. Keep the terminal running while using the app.

## 6. Database design

### `jobs` collection
```json
{
  "_id": "MongoDB ObjectId",
  "title": "Junior Backend Developer",
  "companyName": "ABC Technologies",
  "description": "Build and maintain REST APIs.",
  "skills": ["Node.js", "Express", "MongoDB"],
  "location": "Hyderabad",
  "employmentType": "Full-time",
  "salary": "3-5 LPA",
  "isActive": true,
  "createdAt": "date",
  "updatedAt": "date"
}
```

### `applications` collection
```json
{
  "_id": "MongoDB ObjectId",
  "job": "ObjectId referencing jobs._id",
  "applicantName": "Sample Candidate",
  "email": "candidate@example.com",
  "phone": "9876543210",
  "resumeUrl": "https://example.com/resume.pdf",
  "coverLetter": "I am interested in this role.",
  "status": "Applied",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Relationship
One job can have many applications (**one-to-many**). The `applications.job` field stores the referenced job's `_id`. Mongoose `populate("job")` retrieves selected job details when applications are listed.

## 7. API endpoints (CRUD)

Base URL: `http://localhost:5000`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API |
| POST | `/api/jobs` | Create a job |
| GET | `/api/jobs` | List all jobs |
| GET | `/api/jobs/:id` | Get one job |
| PUT | `/api/jobs/:id` | Update a job |
| DELETE | `/api/jobs/:id` | Delete job and its applications |
| POST | `/api/applications` | Create application |
| GET | `/api/applications` | List applications with job details |
| GET | `/api/applications/job/:jobId` | List applications for one job |
| PUT | `/api/applications/:id` | Update application/status |
| DELETE | `/api/applications/:id` | Delete application |

### Sample POST job body
```json
{
  "title": "Junior Backend Developer",
  "companyName": "ABC Technologies",
  "description": "Build REST APIs and work with databases.",
  "skills": ["Node.js", "Express", "MongoDB"],
  "location": "Hyderabad",
  "employmentType": "Full-time",
  "salary": "3-5 LPA"
}
```

### Sample POST application body
Use the `_id` returned by creating a job:
```json
{
  "job": "PASTE_JOB_OBJECT_ID_HERE",
  "applicantName": "Sample Candidate",
  "email": "candidate@example.com",
  "phone": "9876543210",
  "resumeUrl": "https://example.com/resume.pdf",
  "coverLetter": "I would like to apply for this role."
}
```

### Sample PUT application body
```json
{ "status": "Shortlisted" }
```

## 8. Test with Postman
1. Start the server with `npm run dev`.
2. Create a job using `POST http://localhost:5000/api/jobs`.
3. Select **Body → raw → JSON** and paste the sample job JSON.
4. Copy the `_id` from the response.
5. Create an application using `POST http://localhost:5000/api/applications`, replacing `job` with the copied ID.
6. Test `GET /api/jobs` and `GET /api/applications`.
7. Copy a job ID and test `GET /api/jobs/ID`.
8. Test `PUT /api/jobs/ID` with a JSON field to change.
9. Test `PUT /api/applications/APPLICATION_ID` with `{"status":"Shortlisted"}`.
10. Test `DELETE /api/applications/APPLICATION_ID`. Finally test job deletion carefully; it also removes its related applications.

## 9. Common problems
- **`node is not recognized`**: install Node.js LTS, close and reopen VS Code, then check `node -v`.
- **MongoDB connection/server selection error**: check Atlas IP allowlist, database username/password, cluster hostname and internet connection.
- **Authentication failed**: use the Database Access username/password, not your MongoDB website login. URL-encode special characters in the password.
- **Cannot find module**: run `npm install` from the folder containing `package.json`.
- **Port already in use**: change `PORT=5001` in `.env`, then open `http://localhost:5001`.
- **Invalid job ID**: use the actual `_id` returned by MongoDB, not the job title.

## 10. Suggested submission screenshots
Capture:
1. VS Code project folder structure.
2. Successful server + MongoDB connection in terminal.
3. Job created in the browser.
4. Job document in Atlas `jobs` collection.
5. Application document in Atlas `applications` collection showing its `job` ObjectId.
6. Postman GET response showing application with populated job details.
7. Update and delete test results.

## Notes
This is a learning/demo application. Before production use, add authentication and role-based authorization, pagination, stronger validation, rate limiting, secure resume upload/storage, logging and automated tests. Do not commit your `.env` file or share database credentials.
