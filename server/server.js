
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
  origin: true,
  credentials: true,
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
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  if (!connected) {
    console.error("Failed to connect to MongoDB after multiple attempts");
    process.exit(1);
  }

  // Initialize database with some seed data if empty
  const usersCount = await db.collection('users').countDocuments();
  if (usersCount === 0) {
    console.log("Initializing database with seed data...");
    
    // Seed users
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
    console.log("Users seeded successfully");
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
    let user = await db.collection('users').findOne({ email });
    
    if (!user) {
      user = {
        id: new ObjectId().toString(),
        name: email.split("@")[0],
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        role: "member",
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
      projectId: "p1",
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
    
    if (!oldTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    
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
        projectId: "p1",
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
      projectId: "p1",
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
      projectId: "p1",
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
      project = {
        id: "p1",
        name: "Kanban Task Management",
        description: "Kanban-style task management application",
        createdBy: "1",
        createdAt: new Date()
      };
      await db.collection('projects').insertOne(project);
    }
    
    const tasks = await db.collection('kanban').find().toArray();
    const users = await db.collection('users').find().toArray();
    
    project.tasks = tasks;
    project.members = users;
    
    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Error fetching project" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection...');
  await client.close();
  process.exit(0);
});
