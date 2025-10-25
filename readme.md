# NeuroGrid: A Web-Based Platform for Human Computer Interaction Analysis

This repository contains the full-stack source code for the NeuroGrid project, a web-based platform for advanced human-computer interaction analysis, with a focus on Brain-Computer Interfaces (BCIs). It is structured as a monorepo with two primary packages:

-   `/server`: The backend API built with Node.js, Express, and TypeScript.
-   `/client`: The frontend application built with React and TypeScript.

---

## Backend (`/server`)

The backend provides a RESTful API for user authentication, challenge management, and data storage, along with a WebSocket server for real-time communication.

### Core Technologies

-   **Runtime:** [Node.js](https://nodejs.org/)
-   **Framework:** [Express.js](https://expressjs.com/)
-   **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
-   **Authentication:** JWT with Passport.js
-   **API Documentation:** Swagger

### Getting Started (Backend)

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file and add your `MONGO_URI`.
4.  Run the development server:
    ```bash
    npm run dev
    ```
The server will be available at `http://localhost:5001`. API documentation can be found at `/api-docs`.

---

## Frontend (`/client`)

The frontend is a modern, single-page application (SPA) built with React that provides the user interface for all interactive challenges, including user and admin dashboards.
