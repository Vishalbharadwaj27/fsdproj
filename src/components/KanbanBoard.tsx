
import { useState } from "react";
import { Task } from "@/lib/types";
import { getTasksByStatus, moveTask } from "@/lib/data";
import TaskCard from "./TaskCard";
import CreateTaskForm from "./CreateTaskForm";
import EditTaskForm from "./EditTaskForm";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function KanbanBoard() {
  const [todoTasks, setTodoTasks] = useState<Task[]>(getTasksByStatus("todo"));
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>(getTasksByStatus("inProgress"));
  const [doneTasks, setDoneTasks] = useState<Task[]>(getTasksByStatus("done"));
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [createForColumn, setCreateForColumn] = useState<"todo" | "inProgress" | "done">("todo");

  // Handle creating a new task
  const handleCreateTask = (task: Omit<Task, "id" | "createdAt" | "comments">) => {
    const newTask: Task = {
      ...task,
      id: `t${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date(),
      comments: [],
    };
    
    // Update the state based on the status
    if (task.status === "todo") {
      setTodoTasks([...todoTasks, newTask]);
    } else if (task.status === "inProgress") {
      setInProgressTasks([...inProgressTasks, newTask]);
    } else if (task.status === "done") {
      setDoneTasks([...doneTasks, newTask]);
    }
    
    toast.success("Task created successfully");
  };

  // Handle editing a task
  const handleEditTask = (updatedTask: Task) => {
    // Remove the task from its current column
    if (updatedTask.status === "todo") {
      setTodoTasks(todoTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      setInProgressTasks(inProgressTasks.filter(task => task.id !== updatedTask.id));
      setDoneTasks(doneTasks.filter(task => task.id !== updatedTask.id));
    } else if (updatedTask.status === "inProgress") {
      setTodoTasks(todoTasks.filter(task => task.id !== updatedTask.id));
      setInProgressTasks(inProgressTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      setDoneTasks(doneTasks.filter(task => task.id !== updatedTask.id));
    } else if (updatedTask.status === "done") {
      setTodoTasks(todoTasks.filter(task => task.id !== updatedTask.id));
      setInProgressTasks(inProgressTasks.filter(task => task.id !== updatedTask.id));
      setDoneTasks(doneTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    }
    
    moveTask(updatedTask.id, updatedTask.status);
    toast.success("Task updated successfully");
  };

  // Handle deleting a task
  const handleDeleteTask = (taskId: string) => {
    setTodoTasks(todoTasks.filter(task => task.id !== taskId));
    setInProgressTasks(inProgressTasks.filter(task => task.id !== taskId));
    setDoneTasks(doneTasks.filter(task => task.id !== taskId));
    toast.success("Task deleted successfully");
  };

  // Open create modal for a specific column
  const openCreateModal = (column: "todo" | "inProgress" | "done") => {
    setCreateForColumn(column);
    setIsCreateModalOpen(true);
  };

  // Open edit modal for a task
  const openEditModal = (task: Task) => {
    setCurrentTask(task);
    setIsEditModalOpen(true);
  };

  // For drag and drop functionality (to be implemented)
  const handleDragStart = (e: React.DragEvent, taskId: string, status: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("status", status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: "todo" | "inProgress" | "done") => {
    e.preventDefault();
    
    const taskId = e.dataTransfer.getData("taskId");
    const oldStatus = e.dataTransfer.getData("status");
    
    if (oldStatus === newStatus) return;
    
    // Find the task in its original list
    let taskToMove: Task | undefined;
    if (oldStatus === "todo") {
      taskToMove = todoTasks.find(task => task.id === taskId);
      if (taskToMove) setTodoTasks(todoTasks.filter(task => task.id !== taskId));
    } else if (oldStatus === "inProgress") {
      taskToMove = inProgressTasks.find(task => task.id === taskId);
      if (taskToMove) setInProgressTasks(inProgressTasks.filter(task => task.id !== taskId));
    } else if (oldStatus === "done") {
      taskToMove = doneTasks.find(task => task.id === taskId);
      if (taskToMove) setDoneTasks(doneTasks.filter(task => task.id !== taskId));
    }
    
    // Add the task to its new list
    if (taskToMove) {
      const updatedTask = { ...taskToMove, status: newStatus };
      
      if (newStatus === "todo") {
        setTodoTasks([...todoTasks, updatedTask]);
      } else if (newStatus === "inProgress") {
        setInProgressTasks([...inProgressTasks, updatedTask]);
      } else if (newStatus === "done") {
        setDoneTasks([...doneTasks, updatedTask]);
      }
      
      moveTask(taskId, newStatus);
      toast.success(`Task moved to ${newStatus === "todo" ? "To Do" : newStatus === "inProgress" ? "In Progress" : "Done"}`);
    }
  };

  const renderColumn = (
    title: string,
    tasks: Task[],
    status: "todo" | "inProgress" | "done",
    color: string
  ) => {
    return (
      <div 
        className="bg-gray-50 rounded-lg p-4 w-full md:w-80 flex-shrink-0"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium flex items-center">
            <div className={`h-2 w-2 rounded-full ${color} mr-2`}></div>
            {title} <span className="ml-2 text-gray-500 text-sm">({tasks.length})</span>
          </h3>
          <button 
            onClick={() => openCreateModal(status)} 
            className="text-gray-500 hover:text-gray-700"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <div className="space-y-3">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, task.id, task.status)}
              className="cursor-grab"
            >
              <TaskCard
                task={task}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
              />
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400 italic text-sm">
              No tasks yet
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-4 mt-6">
        {renderColumn("To Do", todoTasks, "todo", "bg-blue-500")}
        {renderColumn("In Progress", inProgressTasks, "inProgress", "bg-amber-500")}
        {renderColumn("Done", doneTasks, "done", "bg-green-500")}
      </div>
      
      <CreateTaskForm
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
        initialStatus={createForColumn}
      />
      
      <EditTaskForm
        task={currentTask}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdateTask={handleEditTask}
      />
    </>
  );
}
