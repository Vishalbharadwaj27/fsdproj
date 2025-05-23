
import { useState, useEffect } from "react";
import { Task, User } from "@/lib/types";
import { userService } from "@/services/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      userService.getUserById(task.assigneeId)
        .then(user => {
          setAssignee(user);
        })
        .catch(error => {
          console.error("Error fetching assignee:", error);
        });
    }
  }, [task.assigneeId]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    try {
      setIsDeleting(true);
      if (onDelete) onDelete(task.id);
    } catch (error) {
      console.error("Error deleting task:", error);
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    if (onEdit) onEdit(task);
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <Card className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {task.description && (
          <CardDescription className="mt-1 line-clamp-2">
            {task.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {task.priority && (
            <Badge variant="outline" className={`${priorityColors[task.priority]}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </Badge>
          )}
          
          {task.dueDate && (
            <div className="flex items-center text-sm text-gray-500">
              <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            {task.assigneeId ? (
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={assignee?.avatar} alt={assignee?.name || "Assignee"} />
                  <AvatarFallback>{assignee?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-600">{assignee?.name || "Loading..."}</span>
              </div>
            ) : (
              <span className="text-xs text-gray-500">Unassigned</span>
            )}
            
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center text-gray-500">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span className="text-xs">{task.comments.length}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
