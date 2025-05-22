
import { useState, useEffect } from "react";
import { Task, User, TaskPriority, TaskLabel } from "@/lib/types";
import { userService } from "@/services/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Edit2, Trash2, Tag, Clock, Flag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { taskService } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [assignee, setAssignee] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (task.assigneeId) {
      userService.getUserById(task.assigneeId).then(user => {
        setAssignee(user);
      });
    }
  }, [task.assigneeId]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      setIsDeleting(true);
      await taskService.deleteTask(task.id);
      toast.success("Task deleted successfully");
      if (onDelete) onDelete(task.id);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const priorityColors: Record<TaskPriority, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const labelColors: Record<TaskLabel, string> = {
    bug: 'bg-red-100 text-red-800',
    feature: 'bg-blue-100 text-blue-800',
    enhancement: 'bg-purple-100 text-purple-800',
    documentation: 'bg-gray-100 text-gray-800',
  };

  const getDueDateColor = (): string => {
    if (!task.dueDate) return "";

    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-500";
    if (diffDays <= 2) return "text-amber-500";
    return "text-green-500";
  };

  return (
    <Card className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {task.priority && (
                <span className={`px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                  <Flag className="w-3 h-3 mr-1" />
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              )}
              {task.title}
            </CardTitle>
            <CardDescription>{task.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(task)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {task.dueDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
          {task.labels?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {task.labels.map((label) => (
                <span
                  key={label}
                  className={`px-2 py-1 rounded-full ${labelColors[label]}`}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <div className="flex items-center justify-between text-xs text-gray-500">
        {task.assigneeId && (
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={assignee.avatar} alt={assignee.name} />
              <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600">{assignee.name}</span>
          </div>
        ) || (
          <span className="text-xs text-gray-500">Unassigned</span>
        )}
        
        {task.comments && task.comments.length > 0 && (
          <div className="flex items-center text-gray-500">
            <MessageSquare className="h-3 w-3 mr-1" />
            <span className="text-xs">{task.comments.length}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
