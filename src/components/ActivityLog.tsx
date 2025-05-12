
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Activity, User } from "@/lib/types";
import { activityService, userService } from "@/services/api";

interface ActivityLogProps {
  className?: string;
}

export default function ActivityLog({ className }: ActivityLogProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    fetchUsers();
  }, []);

  const fetchActivities = async () => {
    try {
      const activitiesData = await activityService.getActivities(10);
      setActivities(activitiesData);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await userService.getUsers();
      const usersMap: Record<string, User> = {};
      
      usersData.forEach(user => {
        usersMap[user.id] = user;
      });
      
      setUsers(usersMap);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className={cn("bg-white rounded-lg shadow p-5", className)}>
      <h2 className="text-lg font-medium mb-4">Recent Activities</h2>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="animate-pulse flex space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => {
            const user = users[activity.userId];
            
            return (
              <div key={activity.id} className="flex gap-3">
                {user && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{user?.name || "Unknown User"}</span>{" "}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(new Date(activity.createdAt))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          No recent activities
        </div>
      )}
    </div>
  );
}
