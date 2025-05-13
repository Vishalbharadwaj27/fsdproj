import { useState, useEffect } from "react";
import { Task } from "@/lib/types";
import { taskService } from "@/services/api";
import TaskCard from "./TaskCard";
import CreateTaskForm from "./CreateTaskForm";
import EditTaskForm from "./EditTaskForm";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface KanbanBoardProps {
  refreshTrigger?: number;
  onDataChange?: () => void;
}

export default function KanbanBoard({ refreshTrigger = 0, onDataChange }: KanbanBoardProps) {
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [createForColumn, setCreateForColumn] = useState<"todo" | "inProgress" | "done">("todo");
  
  const { user } = useAuth();

  // Fetch tasks on component mount or when refreshTrigger changes
  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  // Fetch all tasks from MongoDB
  const fetchTasks = async () => {
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
  };

  // Handle creating a new task
  const handleCreateTask = async (task: Omit<Task, "id" | "createdAt" | "comments">) => {
    try {
      // Ensure task has the current user's ID
      const taskWithUser = {
        ...task,
        createdBy: user?.id || "1" // Fallback to default user if not authenticated
      };
      
      const newTask = await taskService.createTask(taskWithUser);
      
      // Update the state based on the status
      if (newTask.status === "todo") {
        setTodoTasks([...todoTasks, newTask]);
      } else if (newTask.status === "inProgress") {
        setInProgressTasks([...inProgressTasks, newTask]);
      } else if (newTask.status === "done") {
        setDoneTasks([...doneTasks, newTask]);
      }
      
      toast.success("Task created successfully");
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    }
    
    setIsCreateModalOpen(false);
  };

  // Handle editing a task
  const handleEditTask = async (updatedTask: Task) => {
    try {
      const result = await taskService.updateTask(updatedTask);
      
      // Remove the task from its original column and add to the new column based on status
      const originalStatus = currentTask?.status;
      
      if (originalStatus !== updatedTask.status) {
        // Task status changed - move between columns
        
        if (originalStatus === "todo") {
          setTodoTasks(todoTasks.filter(task => task.id !== updatedTask.id));
        } else if (originalStatus === "inProgress") {
          setInProgressTasks(inProgressTasks.filter(task => task.id !== updatedTask.id));
        } else if (originalStatus === "done") {
          setDoneTasks(doneTasks.filter(task => task.id !== updatedTask.id));
        }
        
        if (updatedTask.status === "todo") {
          setTodoTasks([...todoTasks, result]);
        } else if (updatedTask.status === "inProgress") {
          setInProgressTasks([...inProgressTasks, result]);
        } else if (updatedTask.status === "done") {
          setDoneTasks([...doneTasks, result]);
        }
      } else {
        // Task status unchanged - update in the same column
        if (updatedTask.status === "todo") {
          setTodoTasks(todoTasks.map(task => task.id === updatedTask.id ? result : task));
        } else if (updatedTask.status === "inProgress") {
          setInProgressTasks(inProgressTasks.map(task => task.id === updatedTask.id ? result : task));
        } else if (updatedTask.status === "done") {
          setDoneTasks(doneTasks.map(task => task.id === updatedTask.id ? result : task));
        }
      }
      
      toast.success("Task updated successfully");
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
    
    setIsEditModalOpen(false);
    setCurrentTask(null);
  };

  // Handle deleting a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      
      setTodoTasks(todoTasks.filter(task => task.id !== taskId));
      setInProgressTasks(inProgressTasks.filter(task => task.id !== taskId));
      setDoneTasks(doneTasks.filter(task => task.id !== taskId));
      
      toast.success("Task deleted successfully");
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  // Open create modal for a specific column
  const openCreateModal = (column: "todo" | "inProgress" | "done") => {
    setCreateForColumn(column);
    setIsCreateModalOpen(true);
  };

  // Open edit modal for a task
  const openEditModal = (task: Task) => {
    setCurrentTask(task);
    setIsEditModalOpen(true);
  };

  // For drag and drop functionality
  const handleDragStart = (e: React.DragEvent, taskId: string, status: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("status", status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-gray-100");
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-gray-100");
  };

  const handleDrop = async (e: React.DragEvent, newStatus: "todo" | "inProgress" | "done") => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-gray-100");
    
    const taskId = e.dataTransfer.getData("taskId");
    const oldStatus = e.dataTransfer.getData("status");
    
    if (oldStatus === newStatus) return;
    
    // Find the task in its original list
    let taskToMove: Task | undefined;
    if (oldStatus === "todo") {
      taskToMove = todoTasks.find(task => task.id === taskId);
      if (taskToMove) setTodoTasks(todoTasks.filter(task => task.id !== taskId));
    } else if (oldStatus === "inProgress") {
      taskToMove = inProgressTasks.find(task => task.id === taskId);
      if (taskToMove) setInProgressTasks(inProgressTasks.filter(task => task.id !== taskId));
    } else if (oldStatus === "done") {
      taskToMove = doneTasks.find(task => task.id === taskId);
      if (taskToMove) setDoneTasks(doneTasks.filter(task => task.id !== taskId));
    }
    
    // Add the task to its new list
    if (taskToMove) {
      try {
        const updatedTask = { ...taskToMove, status: newStatus };
        const result = await taskService.updateTask(updatedTask);
        
        if (newStatus === "todo") {
          setTodoTasks([...todoTasks, result]);
        } else if (newStatus === "inProgress") {
          setInProgressTasks([...inProgressTasks, result]);
        } else if (newStatus === "done") {
          setDoneTasks([...doneTasks, result]);
        }
        
        toast.success(`Task moved to ${newStatus === "todo" ? "To Do" : newStatus === "inProgress" ? "In Progress" : "Done"}`);
        if (onDataChange) onDataChange();
      } catch (error) {
        console.error("Error moving task:", error);
        toast.error("Failed to move task");
        // Revert UI changes if API call fails
        fetchTasks();
      }
    }
  };

  const renderColumn = (
    title: string,
    tasks: Task[],
    status: "todo" | "inProgress" | "done",
    color: string
  ) => {
    return (
      <div 
        className="bg-gray-50 rounded-lg p-4 w-full md:w-80 flex-shrink-0 transition-colors"
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
            onClick={() => openCreateModal(status)} 
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
            aria-label={`Add task to ${title}`}
          >
            <Plus size={16} />
          </button>
        </div>
        
        <div className="space-y-3 min-h-[200px]">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, task.id, task.status)}
              className="cursor-grab active:cursor-grabbing"
            >
              <TaskCard
                task={task}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
              />
            </div>
          ))}
          
          {!isLoading && tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400 italic text-sm">
              No tasks yet
            </div>
          )}
          
          {isLoading && (
            <div className="text-center py-8 text-gray-400">
              Loading tasks...
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-4 mt-6">
        {renderColumn("To Do", todoTasks, "todo", "bg-blue-500")}
        {renderColumn("In Progress", inProgressTasks, "inProgress", "bg-amber-500")}
        {renderColumn("Done", doneTasks, "done", "bg-green-500")}
      </div>
      
      <CreateTaskForm
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
        initialStatus={createForColumn}
      />
      
      <EditTaskForm
        task={currentTask}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdateTask={handleEditTask}
      />
    </>
  );
}
