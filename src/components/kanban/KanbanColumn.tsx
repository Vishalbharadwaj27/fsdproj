
import { Task, TaskStatus } from "@/lib/types";
import { Plus } from "lucide-react";
import DraggableTaskCard from "./DraggableTaskCard";

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  onDragStart: (e: React.DragEvent, taskId: string, status: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, newStatus: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function KanbanColumn({
  status,
  title,
  color,
  tasks,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onAddTask,
  onEditTask,
  onDeleteTask
}: KanbanColumnProps) {
  return (
    <div
      className={`flex-1 min-w-[300px] max-w-[400px] bg-white rounded-lg p-4 shadow flex flex-col h-full`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium flex items-center">
          <div className={`h-2 w-2 rounded-full ${color} mr-2`}></div>
          {title} <span className="ml-2 text-gray-500 text-sm">({tasks.length})</span>
        </h3>
        <button
          onClick={() => onAddTask(status)}
          className="text-gray-500 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
          aria-label={`Add task to ${title}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              status={status}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onDragStart={onDragStart}
            />
          ))
        ) : (
          <div className="text-center text-gray-400 py-4 border-2 border-dashed border-gray-200 rounded-lg">
            No tasks here yet
          </div>
        )}
      </div>
    </div>
  );
}
