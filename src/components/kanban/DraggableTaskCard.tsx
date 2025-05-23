
import { useState } from "react";
import { Task, TaskStatus } from "@/lib/types";
import TaskCard from "../TaskCard";

interface DraggableTaskCardProps {
  task: Task;
  status: TaskStatus;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string, status: string) => void;
}

export default function DraggableTaskCard({ task, status, onEdit, onDelete, onDragStart }: DraggableTaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(task.id);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id, status)}
      className="cursor-move mb-3"
    >
      <TaskCard
        task={task}
        onDelete={handleDelete}
        onEdit={() => onEdit(task)}
      />
    </div>
  );
}
