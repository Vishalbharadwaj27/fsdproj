
import { useState } from "react";
import KanbanBoard from "@/components/KanbanBoard";
import Header from "@/components/Header";
import ActivityLog from "@/components/ActivityLog";
import CreateTaskForm from "@/components/CreateTaskForm";
import { project, currentUser } from "@/lib/data";

const Index = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onCreateTask={() => setIsCreateModalOpen(true)} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">
              Project Owner: <span className="font-semibold text-gray-800">{currentUser.name}</span>
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
        onCreateTask={(task) => {
          // This is just a placeholder since KanbanBoard handles its own state
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
};

export default Index;
