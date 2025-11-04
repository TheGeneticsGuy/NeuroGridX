# NeuroGrid: A Web-Based Platform for Human Computer Interaction Analysis

[Backend Deployment](https://neurogrid-server.onrender.com/api)

[Frontend Deployment](https://neurogrid-client.onrender.com)

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

## Frontend (`/client`)

The frontend is a modern, single-page application (SPA) built with React that provides the user interface for all interactive challenges, including user and admin dashboards.


## MISC LIBRARIES USED

-   [**React Oauth2 | Google**](https://www.npmjs.com/package/@react-oauth/google) - User Auth with Google with customizable frames.