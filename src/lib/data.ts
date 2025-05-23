
import { User, Task, Project, Activity, TaskStatus } from './types';

export const users: User[] = [
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

export const currentUser = users[0];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Create user stories",
    description: "Define user stories for the next sprint",
    status: "todo",
    priority: "medium",
    labels: ["documentation"],
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
    priority: "high",
    labels: ["feature"],
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
    priority: "high",
    labels: ["feature"],
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
    priority: "medium",
    labels: ["feature"],
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
    priority: "low",
    labels: ["documentation"],
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
    priority: "medium",
    labels: ["feature"],
    assigneeId: "2",
    createdBy: "1",
    createdAt: new Date(2025, 3, 30),
    dueDate: new Date(2025, 4, 5),
    comments: []
  }
];

export const project: Project = {
  id: "p1",
  name: "Task Management System",
  description: "Kanban-style task management application",
  tasks: tasks,
  members: users,
  createdBy: "1",
  createdAt: new Date(2025, 3, 28)
};

export const activities: Activity[] = [
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

export const getTasksByStatus = (status: TaskStatus): Task[] => {
  return tasks.filter(task => task.status === status);
};

export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const moveTask = (taskId: string, newStatus: TaskStatus): void => {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = newStatus;
  }
};

export const getFilteredTasks = (
  status: TaskStatus | null = null,
  assigneeId: string | null = null
): Task[] => {
  return tasks.filter(task => {
    const statusMatch = status ? task.status === status : true;
    const assigneeMatch = assigneeId ? task.assigneeId === assigneeId : true;
    return statusMatch && assigneeMatch;
  });
};
