
import { useState, useEffect } from "react";
import KanbanBoard from "@/components/KanbanBoard";
import Header from "@/components/Header";
import ActivityLog from "@/components/ActivityLog";
import CreateTaskForm from "@/components/CreateTaskForm";
import { projectService, taskService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Project, Task } from "@/lib/types";

const Index = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const projectData = await projectService.getProject("p1");
      setProject(projectData);
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (task: Omit<Task, "id" | "createdAt" | "comments">) => {
    try {
      await taskService.createTask(task);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
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
          <div className="text-sm">
            <span className="text-gray-500">
              Project Owner: <span className="font-semibold text-gray-800">{user?.name}</span>
            </span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-grow order-2 md:order-1">
            <KanbanBoard />
          </div>
          
          <div className="w-full md:w-80 flex-shrink-0 order-1 md:order-2">
            <ActivityLog className="sticky top-6" />
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
