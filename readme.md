![NeuroGridX Logo](./client/src/assets/Neurogrid_logo.png)

# NeuroGridX: BCI User Performance & Analysis Platform

[![Live Demo](./client/src/assets/LiveDemo.jpg)](https://neurogrid-client.onrender.com)

**NeuroGridX** is a full-stack web platform designed to test, analyze, and calibrate Human-Computer Interaction (HCI) performance, with a specific focus on Brain-Computer Interfaces (BCI).

This project was born from a passion for the transformative potential of BCI technology (like Neuralink), and I was directly inspired by Neuralink's [Summer 2025 Update](https://www.youtube.com/watch?v=FASMejN_5gs) and their [Webgrid](https://neuralink.com/webgrid/) challenge. It was incredibly inspiring. This project serves as a way to give BCI users more challenges and tasks to do that ultimately provide a fun challenge, as well as utility in testing and tracking their BCI performance over time. Admins might also find the performance tracking over time to be useful. NeuroGridX provides several interactive challenges to measure motor control, reaction speeds, and pathing accuracy, complete with real-time telemetry for researchers and administrators who may wish to actively monitor BCI user performance live.

---

## Application Preview

### The Challenge Suite
*Test fine mental/motor control and reaction speeds with physics-based challenges.*

![Reaction Time Challenge](./client/src/assets/Neurogrid_ReactionTime.gif)

![Line Tracing Challenge](./client/src/assets/Neurogrid_LineTracing.jpg)

### Real-Time Admin Telemetry
*Admins can monitor active user sessions via WebSockets*

![Admin Live Feed](./client/src/assets/admin_dash.jpg)

### Analytics Dashboard
*Comprehensive data visualization for tracking performance trends over time.*
![User Dashboard](./client/src/assets/Analytics.jpg)

---

## Key Features

### Interactive Challenge Engine
*   **Reaction Time:** A reflex test using expanding targets with precise distance-from-center scoring. Features an "Advanced Mode" with physics-based moving targets.
*   **Line Tracing:** A "steady-hand(mind)" test requiring users to navigate complex generated paths. How far along the path can you stay within the border.
*   **Custom Physics Engine:** Basic, but built from scratch using `requestAnimationFrame` for smooth, high FPS target movement and collision detection of the moving orb targets.

### Real-Time Telemetry System
*   **Live Mirror Feed:** Utilizes **Socket.IO** to stream gameplay state from clients to the Admin Dashboard in real-time.
*   **Active Session Tracking:** Admins can see exactly who is online, what they are playing, and their current live score/status, as well as review user performance history.
*   **Heartbeat Monitoring:** Automatic cleanup of inactive sessions to ensure data accuracy. For example, navigating away from the challenge or closing the page will immediately negate the attempt.

### Data Analytics & Management
*   **Deep Statistical Analysis:** Tracks metrics like "Net Targets Per Minute" (NTPM), average accuracy variance, and completion velocity. *Work in Progress as more will be added*
*   **Visualizations:** Uses **Chart.js** to render interactive performance graphs (Daily Peaks, Activity Trends).
*   **Role-Based Access Control (RBAC):** Distinct flows for Standard Users, BCI Applicants (Pending/Verified), and Administrators.

---

## Tech Stack

This project uses a modern, type-safe stack organized in a monorepo structure.

### **Frontend (`/client`)**
*   **Framework:** React 18 + Vite
*   **Language:** TypeScript
*   **State Management:** Zustand (with persistence middleware)
*   **Networking:** Axios + Socket.IO Client
*   **Visualization:** Chart.js + React-Chartjs-2
*   **Auth:** Google OAuth 2.0 (Identity Services) + JWT - (More login options will be added)
*   **Styling:** Custom CSS Variables (Theming support for Dark/Light mode)

### **Backend (`/server`)**
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB + Mongoose ODM
*   **Real-Time:** Socket.IO Server
*   **Validation:** Express-Validator
*   **Security:** Bcrypt (hashing), JWT (stateless auth), CORS configuration


## ⚖️ License & Usage

**© 2025 Aaron Topping. All Rights Reserved.**

The source code in this repository is provided for **educational and portfolio demonstration purposes only**.

*Please note, these rights are reserved because I do not want someone to wrap this up into some commercialized service. I, the author, Aaron Topping, am a very reasonable person and if you are interested in using this for some legitimate reason, just message me and I am very likely to authorize it, excitedly.*

You are permitted to:
*   View the code.
*   Clone the repository to your local machine to test the application.

You are **NOT** permitted to:
*   Use this code for commercial purposes.
*   Distribute, modify, or sublicense the code.

---

<div align="center">
  <sub>Built with ❤️ by Aaron Topping</sub>
</div>