
import { useState } from "react";
import { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import TaskCard from "../TaskCard";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface DraggableTaskCardProps {
  task: Task;
  status: TaskStatus;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void | Promise<void>;
  onDragStart?: (e: React.DragEvent) => void;  
  className?: string;
  showActions?: boolean;
}

export default function DraggableTaskCard({ 
  task, 
  status, 
  onEdit, 
  onDelete, 
  onDragStart,
  className = "",
  showActions = false
}: DraggableTaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      const deletePromise = onDelete(task.id);
      if (deletePromise) {
        setIsDeleting(true);
        deletePromise.catch((error) => {
          console.error("Error deleting task:", error);
          setIsDeleting(false);
        });
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    if (onDragStart) {
      onDragStart(e);
    }
    // Set drag data for the drag and drop operation
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.setData("fromStatus", status);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
      className={cn(
        "relative group transition-all cursor-grab active:cursor-grabbing",
        isDragging ? "opacity-50" : "opacity-100",
        className
      )}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <TaskCard
          task={task}
          onDelete={() => onDelete(task.id)}
          onEdit={() => onEdit(task)}
        />
      </div>
      
      {/* Action Buttons - Only shown on hover and when showActions is true */}
      {showActions && (
        <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-white/80 hover:bg-white"
            onClick={handleEdit}
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-white/80 hover:bg-white text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
