
import { useState, useEffect } from "react";
import KanbanBoard from "@/components/KanbanBoard";
import Header from "@/components/Header";
import ActivityLog from "@/components/ActivityLog";
import CreateTaskForm from "@/components/CreateTaskForm";
import { projectService, taskService } from "@/services/api";
import { Project, Task } from "@/lib/types";
import { toast } from "sonner";

const Index = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    fetchProject();
  }, [refreshTrigger]);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const projectData = await projectService.getProject("p1");
      setProject(projectData);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (task: Omit<Task, "id" | "createdAt" | "comments">) => {
    try {
      await taskService.createTask(task);
      setIsCreateModalOpen(false);
      setRefreshTrigger(prev => prev + 1); // Trigger a refresh after creating task
      toast.success("Task created successfully");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onCreateTask={() => setIsCreateModalOpen(true)} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-6 w-40 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-64 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{project?.name}</h1>
                <p className="text-gray-600">{project?.description}</p>
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-grow order-2 md:order-1">
            <KanbanBoard refreshTrigger={refreshTrigger} onDataChange={() => setRefreshTrigger(prev => prev + 1)} />
          </div>
          
          <div className="w-full md:w-80 flex-shrink-0 order-1 md:order-2">
            <ActivityLog className="sticky top-6" refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
      
      <CreateTaskForm
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
        initialStatus="todo"
      />
    </div>
  );
};

export default Index;
