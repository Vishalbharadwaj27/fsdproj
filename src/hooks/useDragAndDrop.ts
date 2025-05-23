
import { useState } from "react";
import { TaskStatus } from "@/lib/types";

interface DragAndDropProps {
  onStatusChange: (taskId: string, oldStatus: TaskStatus, newStatus: TaskStatus) => Promise<void>;
}

export function useDragAndDrop({ onStatusChange }: DragAndDropProps) {
  // Handle drag start
  const handleDragStart = (e: React.DragEvent, taskId: string, status: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("status", status);
  };

  // Handle drop event for drag and drop
  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-gray-100");
    
    const taskId = e.dataTransfer.getData("taskId");
    const oldStatus = e.dataTransfer.getData("status") as TaskStatus;
    
    if (oldStatus === newStatus) return;
    
    try {
      await onStatusChange(taskId, oldStatus, newStatus);
    } catch (error) {
      console.error("Drop operation failed:", error);
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-gray-100");
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-gray-100");
  };

  return {
    handleDragStart,
    handleDrop,
    handleDragOver,
    handleDragLeave
  };
}
