
import { useState, useEffect, useCallback } from "react";
import { Task, TaskStatus } from "@/lib/types";
import { userService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";

export interface TaskFormData extends Omit<Task, "id" | "createdAt" | "comments"> {
  // Same as Task but without id, createdAt, comments
}

interface UseTaskFormProps {
  initialStatus: TaskStatus;
  open: boolean;
}

export function useTaskForm({ initialStatus, open }: UseTaskFormProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: initialStatus,
    assigneeId: user?.id || null,
    dueDate: new Date(),
    createdBy: user?.id || "",
    priority: "medium",
    labels: []
  });
  
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  // Update form data when user loads
  useEffect(() => {
    if (user && !isAuthLoading) {
      setFormData(prev => ({
        ...prev,
        assigneeId: user.id,
        createdBy: user.id
      }));
    }
  }, [user, isAuthLoading]);

  // Reset form when modal is opened/closed or initialStatus changes
  useEffect(() => {
    if (open) {
      setFormData({
        title: "",
        description: "",
        status: initialStatus,
        assigneeId: null,
        dueDate: null,
        createdBy: user?.id || "",
        priority: "medium",
        labels: []
      });
    }
  }, [open, initialStatus, user?.id]);

  // Fetch users when modal is opened
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const usersData = await userService.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const handleChange = useCallback((field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      status: initialStatus,
      assigneeId: user?.id || null,
      dueDate: new Date(),
      createdBy: user?.id || "",
      priority: "medium",
      labels: []
    });
  }, [initialStatus, user?.id]);

  return {
    formData,
    setFormData,
    handleChange,
    resetForm,
    users,
    isLoadingUsers,
    isSubmitting,
    setIsSubmitting
  };
}
