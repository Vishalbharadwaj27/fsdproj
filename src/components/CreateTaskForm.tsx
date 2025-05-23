
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Task, TaskStatus } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { taskService } from "@/services/api";
import { toast } from "sonner";

// Import our new components
import StatusSelector from "./task-form/StatusSelector";
import PrioritySelector from "./task-form/PrioritySelector";
import AssigneeSelector from "./task-form/AssigneeSelector";
import DueDatePicker from "./task-form/DueDatePicker";
import { useTaskForm } from "@/hooks/useTaskForm";

const statusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  inProgress: "In Progress",
  done: "Done"
};

interface CreateTaskFormProps {
  open: boolean;
  onClose: () => void;
  onCreateTask: (task: Omit<Task, "id" | "createdAt" | "comments">) => Promise<void>;
  initialStatus: TaskStatus;
}

export default function CreateTaskForm({ 
  open, 
  onClose, 
  onCreateTask,
  initialStatus = "todo"
}: CreateTaskFormProps) {
  const { user } = useAuth();
  const { 
    formData, 
    handleChange, 
    users, 
    isLoadingUsers, 
    isSubmitting, 
    setIsSubmitting 
  } = useTaskForm({ initialStatus, open });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a title for the task");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Ensure createdBy is always set
      const taskData = {
        ...formData,
        createdBy: user?.id || "1" // Default to user 1 if not logged in
      };

      await taskService.createTask(taskData);
      
      toast.success(`Task added to ${statusLabels[formData.status]}`);
      
      if (onCreateTask) {
        await onCreateTask(taskData);
      }
      
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Task to {statusLabels[formData.status]}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="text-base"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description (optional)"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="min-h-[100px] text-base"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <StatusSelector 
              value={formData.status}
              onValueChange={(value) => handleChange('status', value)}
            />
            
            <PrioritySelector
              value={formData.priority}
              onValueChange={(value) => handleChange('priority', value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <AssigneeSelector
              value={formData.assigneeId}
              onValueChange={(value) => handleChange('assigneeId', value)}
              users={users}
              isLoading={isLoadingUsers}
            />
            
            <DueDatePicker
              date={formData.dueDate}
              onDateChange={(date) => handleChange('dueDate', date)}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
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
              disabled={!formData.title.trim() || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
