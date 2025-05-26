
import { Button } from "@/components/ui/button";
import { PlusCircle, LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, NavLink } from "react-router-dom";

interface HeaderProps {
  onCreateTask?: () => void;
}

export default function Header({ onCreateTask }: HeaderProps) {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-primary mr-6">
            <NavLink to="/">Kanban</NavLink>
          </h1>
          
          <nav className="hidden md:flex space-x-4">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => 
                isActive 
                  ? "text-sm font-medium text-gray-800" 
                  : "text-sm font-medium text-gray-500 hover:text-gray-800"
              }
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/projects" 
              className={({ isActive }) => 
                isActive 
                  ? "text-sm font-medium text-gray-800" 
                  : "text-sm font-medium text-gray-500 hover:text-gray-800"
              }
            >
              Projects
            </NavLink>
            <NavLink 
              to="/calendar" 
              className={({ isActive }) => 
                isActive 
                  ? "text-sm font-medium text-gray-800" 
                  : "text-sm font-medium text-gray-500 hover:text-gray-800"
              }
            >
              Calendar
            </NavLink>
            <NavLink 
              to="/reports" 
              className={({ isActive }) => 
                isActive 
                  ? "text-sm font-medium text-gray-800" 
                  : "text-sm font-medium text-gray-500 hover:text-gray-800"
              }
            >
              Reports
            </NavLink>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          {onCreateTask && (
            <Button 
              onClick={onCreateTask} 
              size="sm" 
              className="hidden md:flex" 
              variant="default"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              New Task
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            
            <div className="hidden md:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2 text-gray-500 hover:text-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
