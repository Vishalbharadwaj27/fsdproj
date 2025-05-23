
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task, TaskStatus } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { userService } from "@/services/api";
import { toast } from "sonner";

interface EditTaskFormProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
}

export default function EditTaskForm({ task, open, onClose, onUpdateTask }: EditTaskFormProps) {
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        assigneeId: task.assigneeId,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        priority: task.priority || "medium",
        labels: task.labels || []
      });
      
      fetchUsers();
    }
  }, [task, open]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersData = await userService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof Task, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task || !formData.title?.trim()) {
      toast.error("Task title is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedTask: Task = {
        ...task,
        ...formData,
        title: formData.title || task.title,
        status: (formData.status as TaskStatus) || task.status
      };
      
      onUpdateTask(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => isSubmitting && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title || ""}
              onChange={(e) => handleChange('title', e.target.value)}
              className="text-base"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description (optional)"
              value={formData.description || ""}
              onChange={(e) => handleChange('description', e.target.value)}
              className="min-h-[100px] text-base"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="font-medium">Status</Label>
              <Select
                value={formData.status || ""}
                onValueChange={(value) => handleChange('status', value as TaskStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="inProgress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority" className="font-medium">Priority</Label>
              <Select
                value={formData.priority || ""}
                onValueChange={(value) => handleChange('priority', value as 'low' | 'medium' | 'high')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee" className="font-medium">
                {isLoading ? 'Loading users...' : 'Assignee'}
              </Label>
              <Select 
                value={formData.assigneeId || ""} 
                onValueChange={(value) => handleChange('assigneeId', value || null)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium block">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "MMM d, yyyy") : "No date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate || undefined}
                    onSelect={(date) => handleChange('dueDate', date)}
                    initialFocus
                  />
                  {formData.dueDate && (
                    <div className="p-3 border-t flex justify-end">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleChange('dueDate', null)}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.title?.trim() || isSubmitting}
              className="ml-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
