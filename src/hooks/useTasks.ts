
import { useState, useCallback, useEffect } from "react";
import { Task, TaskStatus } from "@/lib/types";
import { taskService } from "@/services/api";
import { toast } from "sonner";

export function useTasks(refreshTrigger = 0) {
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all tasks from MongoDB
  const fetchTasks = useCallback(async () => {
    console.log("Fetching tasks...");
    setIsLoading(true);
    try {
      const [todoData, inProgressData, doneData] = await Promise.all([
        taskService.getTasksByStatus("todo"),
        taskService.getTasksByStatus("inProgress"),
        taskService.getTasksByStatus("done")
      ]);

      console.log("Tasks fetched successfully:", { 
        todo: todoData.length, 
        inProgress: inProgressData.length, 
        done: doneData.length 
      });

      setTodoTasks(todoData);
      setInProgressTasks(inProgressData);
      setDoneTasks(doneData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch tasks on component mount or when refreshTrigger changes
  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger, fetchTasks]);

  // Handle updating tasks when they change status
  const updateTaskStatus = async (taskId: string, oldStatus: TaskStatus, newStatus: TaskStatus) => {
    if (oldStatus === newStatus) return;
    
    // Find the task in its original list
    const findTask = (status: TaskStatus) => {
      if (status === "todo") return todoTasks.find(t => t.id === taskId);
      if (status === "inProgress") return inProgressTasks.find(t => t.id === taskId);
      return doneTasks.find(t => t.id === taskId);
    };
    
    const taskToMove = findTask(oldStatus);
    if (!taskToMove) return;
    
    try {
      const updatedTask = { ...taskToMove, status: newStatus };
      const result = await taskService.updateTask(updatedTask);
      
      // Remove from old status
      if (oldStatus === "todo") {
        setTodoTasks(prev => prev.filter(t => t.id !== taskId));
      } else if (oldStatus === "inProgress") {
        setInProgressTasks(prev => prev.filter(t => t.id !== taskId));
      } else if (oldStatus === "done") {
        setDoneTasks(prev => prev.filter(t => t.id !== taskId));
      }
      
      // Add to new status
      if (newStatus === "todo") {
        setTodoTasks(prev => [...prev, result]);
      } else if (newStatus === "inProgress") {
        setInProgressTasks(prev => [...prev, result]);
      } else if (newStatus === "done") {
        setDoneTasks(prev => [...prev, result]);
      }
      
      toast.success(
        `Task moved to ${
          newStatus === "todo" ? "To Do" : 
          newStatus === "inProgress" ? "In Progress" : "Done"
        }`
      );
      
      return result;
    } catch (error) {
      console.error("Error moving task:", error);
      toast.error("Failed to move task");
      fetchTasks(); // Revert UI changes if API call fails
      throw error;
    }
  };

  // Handle creating a new task
  const createTask = async (taskData: Omit<Task, "id" | "createdAt" | "comments">) => {
    try {
      const newTask = await taskService.createTask(taskData);
      
      // Update the appropriate state based on the task status
      const status = newTask.status;
      
      switch (status) {
        case "todo":
          setTodoTasks(prev => [...prev, newTask]);
          break;
        case "inProgress":
          setInProgressTasks(prev => [...prev, newTask]);
          break;
        case "done":
          setDoneTasks(prev => [...prev, newTask]);
          break;
      }
      
      toast.success(`Task added to ${status === "todo" ? "To Do" : status === "inProgress" ? "In Progress" : "Done"}`);
      return newTask;
    } catch (error) {
      console.error("Error in createTask:", error);
      toast.error("Failed to create task. Please try again.");
      throw error;
    }
  };

  // Handle deleting a task
  const deleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      
      // Remove task from all columns
      setTodoTasks(prev => prev.filter(task => task.id !== taskId));
      setInProgressTasks(prev => prev.filter(task => task.id !== taskId));
      setDoneTasks(prev => prev.filter(task => task.id !== taskId));
      
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
      throw error;
    }
  };

  // Update task data
  const updateTask = async (updatedTask: Task) => {
    try {
      const result = await taskService.updateTask(updatedTask);
      const originalStatus = updatedTask.status;

      // Update in the correct list based on status
      if (originalStatus === "todo") {
        setTodoTasks(prev => prev.map(task => task.id === updatedTask.id ? result : task));
      } else if (originalStatus === "inProgress") {
        setInProgressTasks(prev => prev.map(task => task.id === updatedTask.id ? result : task));
      } else if (originalStatus === "done") {
        setDoneTasks(prev => prev.map(task => task.id === updatedTask.id ? result : task));
      }
      
      toast.success("Task updated successfully");
      return result;
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
      throw error;
    }
  };

  return {
    todoTasks,
    inProgressTasks,
    doneTasks,
    isLoading,
    createTask,
    deleteTask,
    updateTask,
    updateTaskStatus,
    fetchTasks
  };
}
