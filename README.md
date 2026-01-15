# TournaX - Esport Tournament Management System

TournaX is a Full-stack Web platform that allows administrators and users to manage and track professional Esport tournaments. The system supports everything from registration and member approval to updating match results and news.

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

## Tech Stack

### Frontend

* React.js (Vite)
* CSS Modules
* React Router DOM
* JWT (JSON Web Token) for user authentication.

### Backend

* Node.js & Express
* MongoDB
* JWT & Middleware for Role-Based Access Control (Admin/User).

## Project Structure

* /backend: Contains the server source code, database configuration, controllers, models, and routes.
* /frontend: Contains the user interface source code, components, and page logic.

## System Architecture

The project is built following the MVC (Model-View-Controller) pattern to separate data logic, control, and display. This structure facilitates easy maintenance and future feature expansions.

## License

This project is released under the MIT License.
