
# Kanban - Task Management System

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

## Project Structure

```
project-root/
├── src/                      # React frontend source code
│   ├── components/           # Reusable UI components
│   ├── contexts/             # React context providers
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and type definitions
│   ├── pages/                # Page components
│   ├── services/             # API services
│   └── ...
├── server/                   # Backend Express server
│   ├── server.js             # Main server file
│   ├── package.json          # Server dependencies
│   └── .env                  # Server environment variables
└── ...
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local installation or MongoDB Atlas)

### MongoDB Setup

1. Install MongoDB locally or create a MongoDB Atlas account
2. Create a database named `projectfsd`
3. The application will automatically create the following collections:
   - `users`
   - `kanban`
   - `projects`
   - `activities`
4. Update the MongoDB connection string in `server/.env` if necessary

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
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

## Troubleshooting

If you encounter "Failed to fetch" errors:
1. Ensure both frontend and backend servers are running
2. Check that MongoDB is running and accessible
3. Verify the correct ports are being used (backend: 5000, frontend: 5173)
4. Check browser console for specific error messages

## Data Persistence

All data is stored in MongoDB and persists between sessions. The application includes seed data that is automatically loaded if the database is empty.

