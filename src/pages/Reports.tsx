
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { taskService, activityService } from "@/services/api";
import { Task, Activity, TaskStatus } from "@/lib/types";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function Reports() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all tasks and activities
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tasksData, activitiesData] = await Promise.all([
          taskService.getTasks(),
          activityService.getActivities(20)
        ]);
        
        setTasks(tasksData);
        setActivities(activitiesData);
      } catch (error) {
        console.error("Error fetching report data:", error);
        toast.error("Failed to load report data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for task status chart
  const statusChartData = [
    { name: "To Do", value: tasks.filter(t => t.status === "todo").length, color: "#3b82f6" },
    { name: "In Progress", value: tasks.filter(t => t.status === "inProgress").length, color: "#f59e0b" },
    { name: "Done", value: tasks.filter(t => t.status === "done").length, color: "#10b981" }
  ];

  // Prepare data for task priority chart
  const priorityData = [
    { name: "High", value: tasks.filter(t => t.priority === "high").length },
    { name: "Medium", value: tasks.filter(t => t.priority === "medium").length },
    { name: "Low", value: tasks.filter(t => t.priority === "low").length }
  ];

  // Count tasks by assignee
  const tasksByAssignee = tasks.reduce((acc: Record<string, number>, task) => {
    const assigneeId = task.assigneeId || "unassigned";
    acc[assigneeId] = (acc[assigneeId] || 0) + 1;
    return acc;
  }, {});

  // Convert to chart format
  const assigneeChartData = Object.entries(tasksByAssignee).map(([assigneeId, count]) => ({
    name: assigneeId === "unassigned" ? "Unassigned" : assigneeId,
    tasks: count
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Project Reports</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{tasks.length}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Tasks Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600">
                    {tasks.filter(t => t.status === "done").length}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {tasks.length > 0 
                      ? `${Math.round((tasks.filter(t => t.status === "done").length / tasks.length) * 100)}%`
                      : "0%"} completion rate
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Tasks In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-amber-500">
                    {tasks.filter(t => t.status === "inProgress").length}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Tasks by Status</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Tasks by Priority</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={priorityData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Tasks" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="border-b pb-3">
                        <p className="text-sm">
                          <span className="font-medium">User {activity.userId}</span> {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent activities</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
