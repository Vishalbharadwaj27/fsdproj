
import { useState, useEffect } from "react";
import { Task, TaskStatus } from "@/lib/types";
import { userService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface TaskFormData extends Omit<Task, "id" | "createdAt" | "comments"> {
  // Same as Task but without id, createdAt, comments
}

interface UseTaskFormProps {
  initialStatus: TaskStatus;
  open: boolean;
}

export function useTaskForm({ initialStatus, open }: UseTaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: initialStatus,
    assigneeId: null,
    dueDate: null,
    createdBy: "",
    priority: "medium",
    labels: []
  });
  
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const { user } = useAuth();

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

  const handleChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    formData,
    setFormData,
    handleChange,
    users,
    isLoadingUsers,
    isSubmitting,
    setIsSubmitting
  };
}
