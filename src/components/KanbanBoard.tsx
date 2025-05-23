
import { useState, useEffect, useCallback } from "react";
import { Task } from "@/lib/types";
import { taskService } from "@/services/api";
import TaskCard from "./TaskCard";
import CreateTaskForm from "./CreateTaskForm";
import EditTaskForm from "./EditTaskForm";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type TaskStatus = "todo" | "inProgress" | "done";

interface KanbanBoardProps {
  refreshTrigger?: number;
  onDataChange?: () => void;
}

const KanbanBoard = ({ refreshTrigger = 0, onDataChange }: KanbanBoardProps) => {
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [createForColumn, setCreateForColumn] = useState<TaskStatus>("todo");
  const { user } = useAuth();

  // Fetch all tasks from MongoDB
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const [todoData, inProgressData, doneData] = await Promise.all([
        taskService.getTasksByStatus("todo"),
        taskService.getTasksByStatus("inProgress"),
        taskService.getTasksByStatus("done")
      ]);

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

  // Handle creating a new task
  const handleCreateTask = async (taskData: Omit<Task, "id" | "createdAt" | "comments">): Promise<void> => {
    try {
      // Ensure required fields are present
      const taskToCreate = {
        ...taskData,
        createdBy: user?.id || "1", // Fallback to default user if not authenticated
        status: taskData.status || createForColumn // Use the column's status if not provided
      };
      
      const newTask = await taskService.createTask(taskToCreate);
      
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
      
      // Close the modal
      setIsCreateModalOpen(false);
      
      // Show success message
      toast.success(`Task added to ${status === "todo" ? "To Do" : status === "inProgress" ? "In Progress" : "Done"}`);
      
      // Notify parent component about data change
      if (onDataChange) {
        onDataChange();
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error in handleCreateTask:", error);
      toast.error("Failed to create task. Please try again.");
      return Promise.reject(error);
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, taskId: string, status: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("status", status);
  };

  // Handle editing a task
  const handleEditTask = async (updatedTask: Task) => {
    try {
      const result = await taskService.updateTask(updatedTask);
      const originalStatus = currentTask?.status;

      // Remove from old status if it changed
      if (originalStatus && originalStatus !== updatedTask.status) {
        if (originalStatus === "todo") {
          setTodoTasks(prev => prev.filter(task => task.id !== updatedTask.id));
        } else if (originalStatus === "inProgress") {
          setInProgressTasks(prev => prev.filter(task => task.id !== updatedTask.id));
        } else if (originalStatus === "done") {
          setDoneTasks(prev => prev.filter(task => task.id !== updatedTask.id));
        }
      }

      // Add to new status
      if (updatedTask.status === "todo") {
        setTodoTasks(prev => [...prev.filter(t => t.id !== updatedTask.id), result]);
      } else if (updatedTask.status === "inProgress") {
        setInProgressTasks(prev => [...prev.filter(t => t.id !== updatedTask.id), result]);
      } else if (updatedTask.status === "done") {
        setDoneTasks(prev => [...prev.filter(t => t.id !== updatedTask.id), result]);
      }
      
      toast.success("Task updated successfully");
      setIsEditModalOpen(false);
      setCurrentTask(null);
      
      // Notify parent component about data change
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await taskService.deleteTask(taskId);
      
      // Remove task from all columns
      setTodoTasks(prev => prev.filter(task => task.id !== taskId));
      setInProgressTasks(prev => prev.filter(task => task.id !== taskId));
      setDoneTasks(prev => prev.filter(task => task.id !== taskId));
      
      toast.success("Task deleted successfully");
      
      // Notify parent component about data change
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  // Handle drop event for drag and drop
  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-gray-100");
    
    const taskId = e.dataTransfer.getData("taskId");
    const oldStatus = e.dataTransfer.getData("status") as TaskStatus;
    
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
      
      // Notify parent component about data change
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Error moving task:", error);
      toast.error("Failed to move task");
      fetchTasks(); // Revert UI changes if API call fails
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-gray-100");
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-gray-100");
  };

  // Render task cards for a column
  const renderTaskCards = (tasks: Task[], status: TaskStatus) => {
    return tasks.map((task) => (
      <div
        key={task.id}
        draggable
        onDragStart={(e) => handleDragStart(e, task.id, status)}
        className="cursor-move mb-3"
      >
        <TaskCard
          task={task}
          onDelete={() => handleDeleteTask(task.id)}
          onEdit={() => {
            setCurrentTask(task);
            setIsEditModalOpen(true);
          }}
        />
      </div>
    ));
  };

  // Render a column
  const renderColumn = (status: TaskStatus, tasks: Task[], title: string, color: string) => (
    <div
      className={`flex-1 min-w-[300px] max-w-[400px] bg-white rounded-lg p-4 shadow flex flex-col h-full`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, status)}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium flex items-center">
          <div className={`h-2 w-2 rounded-full ${color} mr-2`}></div>
          {title} <span className="ml-2 text-gray-500 text-sm">({tasks.length})</span>
        </h3>
        <button
          onClick={() => {
            setCreateForColumn(status);
            setIsCreateModalOpen(true);
          }}
          className="text-gray-500 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
          aria-label={`Add task to ${title}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
        {tasks.length > 0 ? (
          renderTaskCards(tasks, status)
        ) : (
          <div className="text-center text-gray-400 py-4 border-2 border-dashed border-gray-200 rounded-lg">
            No tasks here yet
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Task Board</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderColumn("todo", todoTasks, "To Do", "bg-blue-500")}
          {renderColumn("inProgress", inProgressTasks, "In Progress", "bg-amber-500")}
          {renderColumn("done", doneTasks, "Done", "bg-green-500")}
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskForm
        open={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          // Reset the createForColumn to prevent stale state
          setTimeout(() => setCreateForColumn("todo"), 300);
        }}
        onCreateTask={handleCreateTask}
        initialStatus={createForColumn}
      />
      
      {/* Edit Task Modal */}
      <EditTaskForm
        task={currentTask}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdateTask={handleEditTask}
      />
    </div>
  );
};

export default KanbanBoard;
