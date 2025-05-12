
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // Allow requests from any origin during development
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const client = new MongoClient(uri);
let db;

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db("projectfsd");
    
    // Create indexes for frequently accessed fields
    await db.collection('kanban').createIndex({ status: 1 });
    await db.collection('kanban').createIndex({ assigneeId: 1 });
    await db.collection('users').createIndex({ email: 1 });
    await db.collection('activities').createIndex({ createdAt: -1 });

    return true;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // Implement retry logic
    return false;
  }
}

// Connect to MongoDB when starting the server
(async () => {
  let connected = false;
  let retries = 5;
  
  while (!connected && retries > 0) {
    connected = await connectToMongoDB();
    if (!connected) {
      console.log(`Retrying connection... (${retries} attempts left)`);
      retries--;
      // Wait for 3 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  if (!connected) {
    console.error("Failed to connect to MongoDB after multiple attempts");
    process.exit(1);
  }
})();

// API Routes

// Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // For now, we're accepting any credentials as specified
    // In a real app, you'd validate against stored credentials
    let user = await db.collection('users').findOne({ email });
    
    if (!user) {
      // Create new user if it doesn't exist
      user = {
        id: new ObjectId().toString(),
        name: email.split("@")[0],
        email,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + email,
        role: "admin",
      };
      
      await db.collection('users').insertOne(user);
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error during login" });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
});

// Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const status = req.query.status;
    const assigneeId = req.query.assigneeId;
    
    let query = {};
    if (status) query.status = status;
    if (assigneeId) query.assigneeId = assigneeId;
    
    const tasks = await db.collection('kanban').find(query).toArray();
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const newTask = {
      ...req.body,
      id: new ObjectId().toString(),
      createdAt: new Date(),
      comments: []
    };
    
    await db.collection('kanban').insertOne(newTask);
    
    // Log activity
    const activity = {
      id: new ObjectId().toString(),
      userId: newTask.createdBy,
      action: `created task '${newTask.title}'`,
      taskId: newTask.id,
      projectId: "p1", // Default project ID
      createdAt: new Date()
    };
    await db.collection('activities').insertOne(activity);
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Error creating task" });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedTask = req.body;
    
    // Get old task for activity logging
    const oldTask = await db.collection('kanban').findOne({ id: taskId });
    
    await db.collection('kanban').updateOne(
      { id: taskId },
      { $set: updatedTask }
    );
    
    // Log activity if status changed
    if (oldTask && oldTask.status !== updatedTask.status) {
      const activity = {
        id: new ObjectId().toString(),
        userId: updatedTask.createdBy,
        action: `moved task '${updatedTask.title}' to ${updatedTask.status === "todo" ? "To Do" : updatedTask.status === "inProgress" ? "In Progress" : "Done"}`,
        taskId: taskId,
        projectId: "p1", // Default project ID
        createdAt: new Date()
      };
      await db.collection('activities').insertOne(activity);
    }
    
    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Error updating task" });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await db.collection('kanban').findOne({ id: taskId });
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    await db.collection('kanban').deleteOne({ id: taskId });
    
    // Log activity
    const activity = {
      id: new ObjectId().toString(),
      userId: task.createdBy,
      action: `deleted task '${task.title}'`,
      projectId: "p1", // Default project ID
      createdAt: new Date()
    };
    await db.collection('activities').insertOne(activity);
    
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Error deleting task" });
  }
});

// Comments
app.post('/api/tasks/:taskId/comments', async (req, res) => {
  try {
    const { taskId } = req.params;
    const comment = {
      id: new ObjectId().toString(),
      userId: req.body.userId,
      content: req.body.content,
      createdAt: new Date()
    };
    
    await db.collection('kanban').updateOne(
      { id: taskId },
      { $push: { comments: comment } }
    );
    
    // Log activity
    const task = await db.collection('kanban').findOne({ id: taskId });
    const activity = {
      id: new ObjectId().toString(),
      userId: comment.userId,
      action: `commented on task '${task.title}'`,
      taskId: taskId,
      projectId: "p1", // Default project ID
      createdAt: new Date()
    };
    await db.collection('activities').insertOne(activity);
    
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
});

// Activities
app.get('/api/activities', async (req, res) => {
  try {
    // Get most recent activities first
    const activities = await db.collection('activities')
      .find()
      .sort({ createdAt: -1 })
      .limit(req.query.limit ? parseInt(req.query.limit) : 20)
      .toArray();
    
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Error fetching activities" });
  }
});

// Project
app.get('/api/projects/:id', async (req, res) => {
  try {
    let project = await db.collection('projects').findOne({ id: req.params.id });
    
    if (!project) {
      // Create default project if it doesn't exist
      project = {
        id: "p1",
        name: "Kanban Task Management",
        description: "Kanban-style task management application",
        createdBy: "1",
        createdAt: new Date()
      };
      await db.collection('projects').insertOne(project);
    }
    
    // Get tasks for this project
    const tasks = await db.collection('kanban').find().toArray();
    // Get users for this project
    const users = await db.collection('users').find().toArray();
    
    project.tasks = tasks;
    project.members = users;
    
    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Error fetching project" });
  }
});

// Initialize database with mock data if empty
async function initializeDatabase() {
  try {
    // Check if we already have users
    const userCount = await db.collection('users').countDocuments();
    
    if (userCount === 0) {
      console.log("Initializing database with mock data...");
      
      // Insert mock users
      const users = [
        { 
          id: "1", 
          name: "Alex Johnson", 
          email: "alex@example.com", 
          avatar: "https://i.pravatar.cc/150?img=1",
          role: "admin" 
        },
        { 
          id: "2", 
          name: "Sarah Miller", 
          email: "sarah@example.com", 
          avatar: "https://i.pravatar.cc/150?img=2",
          role: "manager" 
        },
        { 
          id: "3", 
          name: "David Kim", 
          email: "david@example.com", 
          avatar: "https://i.pravatar.cc/150?img=3",
          role: "member" 
        },
        { 
          id: "4", 
          name: "Emily Chen", 
          email: "emily@example.com", 
          avatar: "https://i.pravatar.cc/150?img=4",
          role: "member" 
        }
      ];
      await db.collection('users').insertMany(users);
      
      // Insert mock tasks
      const tasks = [
        {
          id: "t1",
          title: "Create user stories",
          description: "Define user stories for the next sprint",
          status: "todo",
          assigneeId: "2",
          createdBy: "1",
          createdAt: new Date(2025, 4, 5),
          dueDate: new Date(2025, 4, 10),
          comments: [
            {
              id: "c1",
              userId: "1",
              content: "Make sure to include acceptance criteria",
              createdAt: new Date(2025, 4, 5, 12, 30)
            }
          ]
        },
        {
          id: "t2",
          title: "Design database schema",
          description: "Design MongoDB schema for the application",
          status: "inProgress",
          assigneeId: "3",
          createdBy: "1",
          createdAt: new Date(2025, 4, 3),
          dueDate: new Date(2025, 4, 8),
          comments: []
        },
        {
          id: "t3",
          title: "Implement authentication",
          description: "Set up user authentication using JWT",
          status: "todo",
          assigneeId: "4",
          createdBy: "2",
          createdAt: new Date(2025, 4, 4),
          dueDate: new Date(2025, 4, 9),
          comments: []
        },
        {
          id: "t4",
          title: "Setup API endpoints",
          description: "Create RESTful API endpoints for tasks",
          status: "inProgress",
          assigneeId: "1",
          createdBy: "2",
          createdAt: new Date(2025, 4, 2),
          dueDate: new Date(2025, 4, 7),
          comments: []
        },
        {
          id: "t5",
          title: "Write unit tests",
          description: "Create unit tests for backend services",
          status: "done",
          assigneeId: "3",
          createdBy: "1",
          createdAt: new Date(2025, 4, 1),
          dueDate: new Date(2025, 4, 6),
          comments: [
            {
              id: "c2",
              userId: "3",
              content: "All tests are passing now",
              createdAt: new Date(2025, 4, 6, 15, 45)
            }
          ]
        },
        {
          id: "t6",
          title: "Frontend setup",
          description: "Initialize React project and set up routing",
          status: "done",
          assigneeId: "2",
          createdBy: "1",
          createdAt: new Date(2025, 3, 30),
          dueDate: new Date(2025, 4, 5),
          comments: []
        }
      ];
      await db.collection('kanban').insertMany(tasks);
      
      // Insert mock project
      const project = {
        id: "p1",
        name: "Kanban Task Management",
        description: "Kanban-style task management application",
        createdBy: "1",
        createdAt: new Date(2025, 3, 28)
      };
      await db.collection('projects').insertOne(project);
      
      // Insert mock activities
      const activities = [
        {
          id: "a1",
          userId: "1",
          action: "created task 'Create user stories'",
          taskId: "t1",
          projectId: "p1",
          createdAt: new Date(2025, 4, 5, 10, 15)
        },
        {
          id: "a2",
          userId: "2",
          action: "moved task 'Setup API endpoints' to In Progress",
          taskId: "t4",
          projectId: "p1",
          createdAt: new Date(2025, 4, 4, 14, 30)
        },
        {
          id: "a3",
          userId: "3",
          action: "completed task 'Write unit tests'",
          taskId: "t5",
          projectId: "p1",
          createdAt: new Date(2025, 4, 6, 16, 0)
        },
        {
          id: "a4",
          userId: "1",
          action: "added Sarah Miller to the project",
          projectId: "p1",
          createdAt: new Date(2025, 4, 3, 9, 45)
        },
        {
          id: "a5",
          userId: "4",
          action: "commented on task 'Create user stories'",
          taskId: "t1",
          projectId: "p1",
          createdAt: new Date(2025, 4, 5, 13, 0)
        }
      ];
      await db.collection('activities').insertMany(activities);
      
      console.log("Database initialized successfully");
    } else {
      console.log("Database already initialized");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  
  // Initialize database with mock data
  setTimeout(() => {
    initializeDatabase();
  }, 1000); // Small delay to ensure connection is ready
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection...');
  await client.close();
  process.exit(0);
});
