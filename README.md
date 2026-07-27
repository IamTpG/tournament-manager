# TournaX - Esport Tournament Management System

TournaX is a Full-stack Web platform that allows administrators and users to manage and track professional Esport tournaments. The system supports everything from registration and member approval to updating match results and news.

> **About this version — v0**
>
> v0 is the completed form of my first real web project, originally built with a team for an *Introduction to Software Engineering* university course. It has been finished and preserved deliberately: the remaining bugs were fixed, the dead code removed, and the security holes closed, but the architecture and UI are left as they were.
>
> It is kept as a record of where the project started. Active development continues in v1, which is a rebuild rather than an extension of this codebase — the Known Limitations section below explains why.

## Key Features

### For Administrators

* Create and edit tournament information.
* Approve the list of users registered to participate.
* Manage match schedules and update results.
* Post news and highlight videos links of the tournament.

### For Users

* View the list of ongoing and upcoming tournaments.
* Track tournament brackets and match results.
* Watch news and impressive moments from the tournaments.

### Bracket formats

* **Single elimination** (`Loại trực tiếp`) — including automatic BYE resolution for participant counts that are not a power of two.
* **Double elimination** (`Loại lần 2`) — Winners'/Losers' brackets advancing concurrently, plus the standard Grand Finals bracket reset.
* **Ranking** (`Xếp hạng`) — a single multi-player result table.

## Tech Stack

### Frontend

* React 19 (Vite)
* CSS Modules
* React Router DOM

### Backend

* Node.js & Express 5
* MongoDB (Mongoose 8)
* JWT for admin authentication, bcrypt for password hashing
* express-validator for request validation

## Getting Started

### Prerequisites

* Node.js 20+
* Docker (for MongoDB)

### 1. Start MongoDB

From the repository root:

```bash
docker compose up -d
```

This runs MongoDB 7 on `localhost:27017` with a persistent volume.

### 2. Configure the backend

```bash
cd backend
cp .env.example .env      # then edit .env and set JWT_SECRET
npm install
```

### 3. Create an admin account

Admin accounts are not self-service — seed one from the CLI:

```bash
node scripts/seedAdmin.js <username> <password>
```

### 4. Run the backend

```bash
npm start                 # or: npm run dev  (nodemon)
```

The API listens on `http://localhost:5000`.

### 5. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite serves the app on `http://localhost:5173`. Log in at `/login` with the account you seeded.

## Project Structure

* `/backend` — server source: database configuration, controllers, models, routes, validators, middleware.
* `/frontend` — user interface: components, pages, shared utilities.

## System Architecture

The project follows an MVC-style separation of data, control, and presentation. Bracket generation and advancement live in `backend/controllers/matchControllers.js`: the entire bracket structure — including empty placeholder matches for every future round — is created up front, and advancement fills those placeholders in as results come in.

## Known Limitations

Kept deliberately, and documented rather than hidden. These are the reasons v1 is a rebuild rather than an extension.

* **No authorization tier.** Any valid JWT grants every admin capability. Tokens are signed with a `role` claim read from a field that does not exist on the account schema, so `verifyRole` middleware is present but unusable. Tokens also have no expiry.
* **No participant accounts.** Registration creates a record, not a login. Participants cannot sign in, view, or withdraw their own registrations.
* **No rate limiting** on login or public registration.
* **No pagination** — every list endpoint returns its full collection.
* **No automated tests or CI.** Every fix in this version was verified by hand against a running server.
* **Hardcoded API URL.** The frontend calls `http://localhost:5000` directly; there is no environment-based configuration.
* **No referential integrity.** Collections are joined by plain string ids, so deleting a tournament orphans its matches and registrations.
* **Mixed-language UI.** Interface text is Vietnamese, identifiers and code comments are mixed Vietnamese/English.
* **Not responsive.** Layouts were only ever checked at desktop widths.

## License

This project is released under the MIT License.
