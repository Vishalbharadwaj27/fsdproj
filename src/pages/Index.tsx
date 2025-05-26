
import { useState, useEffect } from "react";
import KanbanBoard from "@/components/KanbanBoard";
import Header from "@/components/Header";
import ActivityLog from "@/components/ActivityLog";
import CreateTaskForm from "@/components/CreateTaskForm";
import { projectService } from "@/services/api";
import { Project } from "@/lib/types";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";

const Index = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();
  
  // Log user state
  useEffect(() => {
    console.log("Index: Current user", user);
  }, [user]);
  
  useEffect(() => {
    console.log("Index: Fetching project data");
    fetchProject();
  }, [refreshTrigger]);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching project p1");
      const projectData = await projectService.getProject("p1");
      console.log("Project data received:", projectData);
      setProject(projectData);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataChange = () => {
    console.log("Data change detected, refreshing...");
    setRefreshTrigger(prev => prev + 1); // Trigger a refresh
  };

  const handleCreateTask = async (taskData: any) => {
    console.log("Creating task from Index page:", taskData);
    try {
      await taskData;
      handleDataChange();
      return Promise.resolve();
    } catch (error) {
      console.error("Error creating task:", error);
      return Promise.reject(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onCreateTask={() => {
        console.log("Opening create task modal");
        setIsCreateModalOpen(true);
      }} />
      
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
            <KanbanBoard 
              refreshTrigger={refreshTrigger} 
              onDataChange={handleDataChange} 
            />
          </div>
          
          <div className="w-full md:w-80 flex-shrink-0 order-1 md:order-2">
            <ActivityLog className="sticky top-6" refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
      
      <CreateTaskForm
        open={isCreateModalOpen}
        onClose={() => {
          console.log("Closing create task modal from Index page");
          setIsCreateModalOpen(false);
        }}
        onCreateTask={handleCreateTask}
        initialStatus="todo"
      />
    </div>
  );
};

export default Index;
