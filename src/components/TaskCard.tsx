
import { useState, useEffect } from "react";
import { Task, User } from "@/lib/types";
import { userService } from "@/services/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [assignee, setAssignee] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (task.assigneeId) {
      fetchAssignee(task.assigneeId);
    }
  }, [task.assigneeId]);

  const fetchAssignee = async (userId: string) => {
    setLoading(true);
    try {
      const user = await userService.getUserById(userId);
      setAssignee(user);
    } catch (error) {
      console.error("Error fetching assignee:", error);
      setAssignee(null);
    } finally {
      setLoading(false);
    }
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

  const handleDeleteClick = () => {
    if (isConfirmingDelete) {
      onDelete(task.id);
      setIsConfirmingDelete(false);
    } else {
      setIsConfirmingDelete(true);
      // Auto-reset after 3 seconds
      setTimeout(() => setIsConfirmingDelete(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={cn(
                "text-red-600",
                isConfirmingDelete && "bg-red-50"
              )}
              onClick={handleDeleteClick}
            >
              {isConfirmingDelete ? "Confirm Delete?" : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{task.description}</p>
      
      {task.dueDate && (
        <div className="flex items-center text-xs mb-3">
          <Calendar className="h-3 w-3 mr-1" />
          <span className={cn("text-xs", getDueDateColor())}>
            Due {format(new Date(task.dueDate), "MMM d")}
          </span>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-2">
        {loading && <span className="text-xs text-gray-500">Loading...</span>}
        
        {!loading && assignee ? (
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={assignee.avatar} alt={assignee.name} />
              <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600">{assignee.name}</span>
          </div>
        ) : !loading ? (
          <span className="text-xs text-gray-500">Unassigned</span>
        ) : null}
        
        {task.comments && task.comments.length > 0 && (
          <div className="flex items-center text-gray-500">
            <MessageSquare className="h-3 w-3 mr-1" />
            <span className="text-xs">{task.comments.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
