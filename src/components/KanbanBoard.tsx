
import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import CreateTaskForm from "./CreateTaskForm";
import EditTaskForm from "./EditTaskForm";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import KanbanColumn from "./kanban/KanbanColumn";
import { toast } from "sonner";
import { taskService } from "@/services/api";

type TaskStatus = "todo" | "inProgress" | "done";

// This is a local type definition to avoid conflicts with the imported Task type

interface KanbanBoardProps {
  refreshTrigger?: number;
  onDataChange?: () => void;
}

const KanbanBoard = ({ refreshTrigger = 0, onDataChange }: KanbanBoardProps) => {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [createForColumn, setCreateForColumn] = useState<TaskStatus>("todo");
  const { user, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="p-4 bg-white rounded-lg shadow h-24 animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Use our custom hooks
  const {
    todoTasks,
    inProgressTasks,
    doneTasks,
    isLoading,
    createTask,
    deleteTask,
    updateTask,
    updateTaskStatus,
    fetchTasks
  } = useTasks(refreshTrigger);
  
  // Combine all tasks for easier access
  const allTasks = [...todoTasks, ...inProgressTasks, ...doneTasks];

  // Debug auth state
  useEffect(() => {
    console.log("KanbanBoard: Current user", user);
  }, [user]);

  // Set up drag and drop handlers
  const { 
    handleDragStart, 
    handleDrop, 
    handleDragOver, 
    handleDragLeave 
  } = useDragAndDrop({
    onStatusChange: async (taskId, oldStatus, newStatus) => {
      await updateTaskStatus(taskId, oldStatus, newStatus);
      if (onDataChange) onDataChange();
    }
  });

  // Handle creating a new task
  const handleCreateTask = async (taskData: Omit<Task, "id" | "createdAt" | "comments">): Promise<void> => {
    try {
      // Ensure required fields are present with proper defaults
      const taskToCreate = {
        ...taskData,
        title: taskData.title.trim(),
        description: taskData.description?.trim() || "",
        status: taskData.status || createForColumn || "todo",
        priority: taskData.priority || "medium",
        dueDate: taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
        createdBy: user?.id || "1",
        assigneeId: taskData.assigneeId || user?.id || "1",
        labels: taskData.labels || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create the task using the service
      await createTask(taskToCreate);
      
      // Refresh the tasks list
      await fetchTasks();
      
      // Notify parent component about data change
      if (onDataChange) {
        onDataChange();
      }
      // Validate required fields
      if (!taskToCreate.title) {
        toast.error("Task title is required");
        return;
      }

      // Create the task using the hook
      await createTask(taskToCreate);
      
      // Close the create task form
      setIsCreateModalOpen(false);
      setCreateForColumn(undefined);
      
      // Show success message
      toast.success("Task created successfully!");
      
      // Notify parent component about data change
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task. Please try again.");
    }
  };

  // Handle editing a task
  const handleEditTask = async (task: Task) => {
    setCurrentTask(task);
    setIsEditModalOpen(true);
  };

  // Handle updating a task
  const handleUpdateTask = async (taskData: Task) => {
    try {
      await updateTask(taskData);
      setIsEditModalOpen(false);
      toast.success("Task updated successfully!");
      
      // Notify parent component about data change
      if (onDataChange) {
        onDataChange();
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task. Please try again.");
      return Promise.reject(error);
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast.success("Task deleted successfully!");
      
      // Notify parent component about data change
      if (onDataChange) {
        onDataChange();
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task. Please try again.");
      return Promise.reject(error);
    }
  };

  // Handle task drop
  const handleTaskDrop = useCallback(
    async (e: React.DragEvent, status: TaskStatus) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("taskId");
      const fromStatus = e.dataTransfer.getData("fromStatus") as TaskStatus;

      if (status === fromStatus) return;

      try {
        // Find the task being moved
        const taskToUpdate = allTasks.find((t) => t.id === taskId);
        if (!taskToUpdate) return;
        
        // Update the task status using the hook
        await updateTaskStatus(taskId, fromStatus, status);
        
        toast.success(`Task moved to ${status.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        
        // Notify parent component about data change
        if (onDataChange) {
          onDataChange();
        }
      } catch (error) {
        console.error("Error moving task:", error);
        toast.error("Failed to move task");
        // Refresh tasks to revert any optimistic updates
        fetchTasks();
      }
    },
    [allTasks, updateTaskStatus, fetchTasks, onDataChange]
  );

  // Columns config
  const columnsConfig = [
    { status: "todo" as const, title: "To Do", color: "bg-blue-500", tasks: todoTasks },
    { status: "inProgress" as const, title: "In Progress", color: "bg-amber-500", tasks: inProgressTasks },
    { status: "done" as const, title: "Done", color: "bg-green-500", tasks: doneTasks }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Tasks</h2>
        <Button 
          onClick={() => {
            setCreateForColumn("todo");
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex-1 overflow-hidden">
          <KanbanColumn
            status="todo"
            title="To Do"
            tasks={todoTasks}
            onEditTask={(task) => {
              setCurrentTask(task);
              setIsEditModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onDrop={handleTaskDrop}
            onAddTask={() => {
              setCreateForColumn("todo");
              setIsCreateModalOpen(true);
            }}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <KanbanColumn
            status="inProgress"
            title="In Progress"
            tasks={inProgressTasks}
            onEditTask={(task) => {
              setCurrentTask(task);
              setIsEditModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onDrop={handleTaskDrop}
            onAddTask={() => {
              setCreateForColumn("inProgress");
              setIsCreateModalOpen(true);
            }}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <KanbanColumn
            status="done"
            title="Done"
            tasks={doneTasks}
            onEditTask={(task) => {
              setCurrentTask(task);
              setIsEditModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onDrop={handleTaskDrop}
            onAddTask={() => {
              setCreateForColumn("done");
              setIsCreateModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskForm
        open={isCreateModalOpen}
        onClose={() => {
          console.log("Closing create task modal");
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
        onClose={() => {
          console.log("Closing edit task modal");
          setIsEditModalOpen(false);
        }}
        onUpdateTask={handleEditTask}
      />
    </div>
  );
};

export default KanbanBoard;
