# Store Rating Platform

A full-stack web application built with Node.js, Express, MySQL, and React.

## Features

### Roles
1.  **System Administrator**: Manage users and stores, view dashboard stats.
2.  **Normal User**: Browse stores, submit ratings (1-5), and update profiles.
3.  **Store Owner**: View ratings for their own store and overall average.

### Technical Stack
-   **Frontend**: React (CRA), Axios, React Router, React Hot Toast, React Icons.
-   **Backend**: Node.js, Express, MySQL (mysql2).
-   **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing.

---

## Getting Started

### 1. Database Setup
1.  Ensure you have **MySQL** installed and running.
2.  Login to your MySQL shell: `mysql -u root -p`
3.  Execute the schema file:
    ```bash
    source backend/schema.sql
    ```
    *Alternatively, copy the contents of `backend/schema.sql` and run them in your MySQL workbench.*

### 2. Backend Configuration
1.  Enter the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file (you can copy `.env.example`):
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=YOUR_MYSQL_PASSWORD
    DB_NAME=store_rating_db
    JWT_SECRET=your_secret_key
    JWT_EXPIRES_IN=24h
    ```
4.  Start the backend:
    ```bash
    npm run dev
    ```

### 3. Frontend Configuration
1.  Enter cross the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Start the frontend:
    ```bash
    npm start
    ```

---

## Default Admin Credentials
-   **Email**: `admin@storerating.com`
-   **Password**: `Admin@12345`

---

## Project Structure

### Backend
-   `src/server.js`: Main entry point.
-   `src/controllers/`: Logic for auth, admin, users, and store owners.
-   `src/routes/`: API route definitions.
-   `src/middleware/`: Auth and validation logic.
-   `src/config/`: Database connection pool.

### Frontend
-   `src/App.js`: Main router and layout.
-   `src/context/`: Authentication state management.
-   `src/api/`: Axios configuration.
-   `src/components/`: Reusable UI components.
-   `src/pages/`: Page-level components organized by role.
-   `src/index.css`: Global styles with a premium dark theme.
