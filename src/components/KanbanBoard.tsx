
import { useState, useEffect, useCallback } from "react";
import { Task } from "@/lib/types";
import CreateTaskForm from "./CreateTaskForm";
import EditTaskForm from "./EditTaskForm";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import KanbanColumn from "./kanban/KanbanColumn";

type TaskStatus = "todo" | "inProgress" | "done";

interface KanbanBoardProps {
  refreshTrigger?: number;
  onDataChange?: () => void;
}

const KanbanBoard = ({ refreshTrigger = 0, onDataChange }: KanbanBoardProps) => {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [createForColumn, setCreateForColumn] = useState<TaskStatus>("todo");
  const { user } = useAuth();

  // Use our custom hooks
  const {
    todoTasks,
    inProgressTasks,
    doneTasks,
    isLoading,
    createTask,
    deleteTask,
    updateTask,
    updateTaskStatus
  } = useTasks(refreshTrigger);

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
    console.log("Creating new task:", taskData);
    try {
      // Ensure required fields are present
      const taskToCreate = {
        ...taskData,
        createdBy: user?.id || "1", // Fallback to default user if not authenticated
        status: taskData.status || createForColumn // Use the column's status if not provided
      };
      
      await createTask(taskToCreate);
      
      // Close the modal
      setIsCreateModalOpen(false);
      
      // Notify parent component about data change
      if (onDataChange) {
        onDataChange();
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error in handleCreateTask:", error);
      return Promise.reject(error);
    }
  };

  // Handle editing a task
  const handleEditTask = async (updatedTask: Task) => {
    try {
      await updateTask(updatedTask);
      setIsEditModalOpen(false);
      setCurrentTask(null);
      
      // Notify parent component about data change
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await deleteTask(taskId);
      
      // Notify parent component about data change
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

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
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Task Board</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columnsConfig.map(({ status, title, color, tasks }) => (
            <KanbanColumn
              key={status}
              status={status}
              title={title}
              color={color}
              tasks={tasks}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onAddTask={(status) => {
                console.log("Opening create task modal for column:", status);
                setCreateForColumn(status);
                setIsCreateModalOpen(true);
              }}
              onEditTask={(task) => {
                console.log("Opening edit modal for task:", task);
                setCurrentTask(task);
                setIsEditModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
            />
          ))}
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
