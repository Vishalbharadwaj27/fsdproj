
import { Task, TaskStatus } from "@/lib/types";
import { Plus, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import DraggableTaskCard from "./DraggableTaskCard";
import { taskService } from "@/services/api";
import { useAuth } from "@/features/auth/context/AuthContext";

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDrop: (e: React.DragEvent, newStatus: TaskStatus) => void;
  onAddTask?: () => void;
  className?: string;
}

export default function KanbanColumn({
  status,
  title,
  tasks = [],
  onEditTask,
  onDeleteTask,
  onDrop,
  onAddTask,
  className = "",
}: KanbanColumnProps) {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const statusColors = {
    todo: "bg-blue-500",
    inProgress: "bg-amber-500",
    done: "bg-green-500"
  };

  const color = statusColors[status] || "bg-gray-500";

  const handleDeleteTask = async (taskId: string) => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      await onDeleteTask(taskId);
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDraggingOver) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const taskId = e.dataTransfer.getData("taskId");
    const fromStatus = e.dataTransfer.getData("fromStatus") as TaskStatus;
    
    if (fromStatus !== status) {
      try {
        // Call the parent's onDrop handler to update the task status
        onDrop(e, status);
      } catch (error) {
        console.error("Error moving task:", error);
        toast.error("Failed to move task");
      }
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full min-w-[280px] max-w-[320px] rounded-lg shadow-sm transition-colors",
        isDraggingOver ? "bg-accent/20" : "bg-card",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-3 px-2">
        <h3 className="font-medium text-sm flex items-center">
          <div className={`h-2 w-2 rounded-full ${color} mr-2`}></div>
          {title} 
          <span className="ml-2 text-muted-foreground text-xs">
            ({tasks.length})
          </span>
        </h3>
        {onAddTask && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div 
              key={task.id} 
              className="relative group"
              onMouseEnter={() => setHoveredTaskId(task.id)}
              onMouseLeave={() => setHoveredTaskId(null)}
            >
              <DraggableTaskCard
                task={task}
                status={status}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onDragStart={(e) => {
                  e.dataTransfer.setData("taskId", task.id);
                  e.dataTransfer.setData("fromStatus", status);
                }}
              />
              {hoveredTaskId === task.id && (
                <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 bg-white/80 hover:bg-white"
                    onClick={() => onEditTask(task)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 bg-white/80 hover:bg-white text-destructive hover:text-destructive"
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div 
            className={cn(
              "text-center text-muted-foreground text-sm py-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer flex items-center justify-center h-24",
              isDraggingOver 
                ? "border-primary/50 bg-primary/5" 
                : "border-muted-foreground/20 hover:border-muted-foreground/40"
            )}
            onClick={onAddTask}
          >
            <div className="flex flex-col items-center">
              <Plus className="h-5 w-5 mb-1" />
              <span>Drop here to add a task</span>
            </div>
          </div>
        )}
        {user && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-muted-foreground hover:text-foreground justify-start"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add task
          </Button>
        )}
      </div>
    </div>
  );
}
