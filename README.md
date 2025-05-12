
# TaskFlow - Kanban Task Management System

A full-featured Kanban-style task management application with MongoDB database integration.

## Features

- User authentication
- Task creation, editing, and deletion
- Drag-and-drop task management across To Do, In Progress, and Done columns
- Task assignments to team members
- Due date tracking with color-coded indicators
- Activity logging for all user actions
- Role-based access control (Admin, Manager, Member)

## Tech Stack

- Frontend: React + TypeScript with Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local installation or MongoDB Atlas)

### MongoDB Setup

1. Install MongoDB locally or create a MongoDB Atlas account
2. Create a database named `projectfsd`
3. The application will automatically create the following collections:
   - `users`
   - `tasks`
   - `projects`
   - `activities`

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/projectfsd
   PORT=5000
   ```

4. Start the server:
   ```
   npm start
   ```

### Frontend Setup

1. In the root directory, install dependencies:
   ```
   npm install
   ```

2. Start the React development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Log in with any email/password (the application accepts any credentials)
2. Create, edit, and manage tasks using the Kanban board
3. Drag tasks between columns to change their status
4. Assign tasks to team members
5. Set due dates for tasks
6. View recent activities in the sidebar

## Data Persistence

All data is stored in MongoDB and persists between sessions. The application includes seed data that is automatically loaded if the database is empty.

## Development

- The server runs on port 5000
- The client runs on port 5173
- API routes are prefixed with `/api`
