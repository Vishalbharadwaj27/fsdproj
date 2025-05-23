
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { taskService } from "@/services/api";
import { Task } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Calendar() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[]>([]);

  // Fetch all tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const allTasks = await taskService.getTasks();
        setTasks(allTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks based on selected date
  useEffect(() => {
    if (!date || !tasks.length) {
      setSelectedDayTasks([]);
      return;
    }

    const filteredTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
    
    setSelectedDayTasks(filteredTasks);
  }, [date, tasks]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Task Calendar</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 bg-white">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(newDate) => setDate(newDate || new Date())}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 bg-white">
            <CardHeader>
              <CardTitle>
                Tasks for {date ? format(date, "MMMM d, yyyy") : "Today"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : selectedDayTasks.length > 0 ? (
                <div className="space-y-4">
                  {selectedDayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{task.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          task.status === "todo" ? "bg-blue-100 text-blue-800" :
                          task.status === "inProgress" ? "bg-amber-100 text-amber-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {task.status === "todo" ? "To Do" : 
                           task.status === "inProgress" ? "In Progress" : 
                           "Done"}
                        </span>
                      </div>
                      {task.description && (
                        <p className="mt-2 text-sm text-gray-600">{task.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <p>No tasks scheduled for this date</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
