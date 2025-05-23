
import { User, Task, Project, Activity, LoginCredentials } from '@/lib/types';
import { toast } from 'sonner';

// Use environment-aware API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to handle API errors
const handleError = (error: unknown, message: string) => {
  console.error("API Error:", error);
  toast.error(message);
  throw error;
};

// Helper function for API requests
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    console.log(`Making API request to: ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      // Include credentials for cookies/auth
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error response:", errorData);
      throw new Error(`API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    handleError(error, "Failed to connect to server. Please try again later.");
    throw error;
  }
}

// Auth services
export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      console.log("Attempting login with:", credentials.email);
      const { user } = await fetchAPI<{ success: boolean; user: User }>('/users/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      console.log("Login successful:", user);
      return user;
    } catch (error) {
      handleError(error, "Login failed. Please check your credentials and try again.");
      throw error;
    }
  },
};

// User services
export const userService = {
  getUsers: async (): Promise<User[]> => {
    try {
      return await fetchAPI<User[]>('/users');
    } catch (error) {
      handleError(error, "Failed to fetch users");
      throw error;
    }
  },
  
  getUserById: async (userId: string): Promise<User> => {
    try {
      return await fetchAPI<User>(`/users/${userId}`);
    } catch (error) {
      handleError(error, `Failed to fetch user with ID: ${userId}`);
      throw error;
    }
  },
};

// Task services
export const taskService = {
  getTasks: async (status?: string, assigneeId?: string): Promise<Task[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);
      if (assigneeId) queryParams.append('assigneeId', assigneeId);
      
      const endpoint = `/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log(`Fetching tasks with params:`, { status, assigneeId });
      return await fetchAPI<Task[]>(endpoint);
    } catch (error) {
      handleError(error, "Failed to fetch tasks");
      throw error;
    }
  },
  
  getTasksByStatus: async (status: string): Promise<Task[]> => {
    console.log(`Fetching tasks by status: ${status}`);
    return taskService.getTasks(status);
  },
  
  createTask: async (task: Omit<Task, "id" | "createdAt" | "comments">): Promise<Task> => {
    try {
      console.log("Creating new task:", task);
      const result = await fetchAPI<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
      });
      console.log("Task created successfully:", result);
      return result;
    } catch (error) {
      handleError(error, "Failed to create task");
      throw error;
    }
  },
  
  updateTask: async (task: Task): Promise<Task> => {
    try {
      console.log(`Updating task ${task.id}:`, task);
      const result = await fetchAPI<Task>(`/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify(task),
      });
      console.log("Task updated successfully:", result);
      return result;
    } catch (error) {
      handleError(error, "Failed to update task");
      throw error;
    }
  },
  
  deleteTask: async (taskId: string): Promise<void> => {
    try {
      console.log(`Deleting task: ${taskId}`);
      await fetchAPI<{ message: string }>(`/tasks/${taskId}`, {
        method: 'DELETE',
      });
      console.log("Task deleted successfully");
    } catch (error) {
      handleError(error, "Failed to delete task");
      throw error;
    }
  },
  
  addComment: async (taskId: string, userId: string, content: string): Promise<Comment> => {
    try {
      console.log(`Adding comment to task ${taskId} by user ${userId}`);
      const result = await fetchAPI<Comment>(`/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ userId, content }),
      });
      console.log("Comment added successfully");
      return result;
    } catch (error) {
      handleError(error, "Failed to add comment");
      throw error;
    }
  },
};

// Project services
export const projectService = {
  getProject: async (projectId: string): Promise<Project> => {
    try {
      console.log(`Fetching project: ${projectId}`);
      return await fetchAPI<Project>(`/projects/${projectId}`);
    } catch (error) {
      handleError(error, "Failed to fetch project");
      throw error;
    }
  },
};

// Activity services
export const activityService = {
  getActivities: async (limit?: number): Promise<Activity[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit.toString());
      
      const endpoint = `/activities${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log(`Fetching activities with limit: ${limit || 'none'}`);
      return await fetchAPI<Activity[]>(endpoint);
    } catch (error) {
      handleError(error, "Failed to fetch activities");
      throw error;
    }
  },
};

export default {
  authService,
  userService,
  taskService,
  projectService,
  activityService,
};
