
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Task, TaskStatus } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/context/AuthContext";
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
  onCreateTask: (task: Omit<Task, "id" | "createdAt" | "comments">) => Promise<Task | void>;
  initialStatus: TaskStatus;
}

export default function CreateTaskForm({ 
  open, 
  onClose, 
  onCreateTask,
  initialStatus = "todo"
}: CreateTaskFormProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { 
    formData, 
    setFormData, 
    handleChange, 
    resetForm, 
    users, 
    isLoadingUsers, 
    isSubmitting, 
    setIsSubmitting 
  } = useTaskForm({ 
    initialStatus,
    open 
  });

  if (isAuthLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-blue-500 rounded animate-pulse"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a title for the task");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the task data with all required fields
      const taskData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        status: formData.status || initialStatus,
        dueDate: formData.dueDate || new Date(),
        priority: formData.priority || "medium",
        labels: formData.labels || [],
        createdBy: user?.id || "1",
        assigneeId: formData.assigneeId || user?.id || "1"
      };

      // Call the parent's onCreateTask with the complete task data
      const result = await onCreateTask(taskData);
      
      // If we got here, the task was created successfully
      resetForm();
      onClose();
      
      // Only show success message if the parent didn't throw an error
      if (result) {
        toast.success(`Task added to ${statusLabels[result.status as TaskStatus] || 'the board'}`);
      }
      
      return result;
    } catch (error) {
      console.error("Error creating task:", error);
      // Only show error toast if the error wasn't handled by the parent
      if (!(error instanceof Error && error.message === 'Task creation handled by parent')) {
        toast.error("Failed to create task. Please try again.");
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className="sm:max-w-[500px]" 
        onInteractOutside={(e) => e.preventDefault()}
        aria-describedby="create-task-description"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Task to {statusLabels[formData.status]}
          </DialogTitle>
          <p id="create-task-description" className="sr-only">
            Fill out the form to create a new task
          </p>
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
              value={formData.assigneeId || "unassigned"}
              onValueChange={(value) => handleChange('assigneeId', value === "unassigned" ? null : value)}
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
