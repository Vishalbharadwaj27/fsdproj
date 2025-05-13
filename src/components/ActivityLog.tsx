import { useState, useEffect } from "react";
import { Activity, User } from "@/lib/types";
import { activityService, userService } from "@/services/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toast } from "sonner";

interface ActivityLogProps {
  className?: string;
  refreshTrigger?: number;
}

export default function ActivityLog({ className, refreshTrigger = 0 }: ActivityLogProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [refreshTrigger]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const data = await activityService.getActivities(10);
      setActivities(data);
      
      // Collect all unique user IDs
      const userIds = new Set<string>();
      data.forEach(activity => {
        if (activity.userId) userIds.add(activity.userId);
      });
      
      // Fetch user data for all users
      await fetchUsers(Array.from(userIds));
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to load activity data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async (userIds: string[]) => {
    try {
      const userDataMap: Record<string, User> = {};
      
      // Fetch each user's data individually
      await Promise.all(userIds.map(async (userId) => {
        try {
          const userData = await userService.getUserById(userId);
          userDataMap[userId] = userData;
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
        }
      }));
      
      setUsers(userDataMap);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const formatActivityTime = (date: Date) => {
    const activityDate = new Date(date);
    const now = new Date();
    
    // If it's today, show the time
    if (activityDate.toDateString() === now.toDateString()) {
      return format(activityDate, "h:mm a");
    }
    
    // Otherwise, show date
    return format(activityDate, "MMM d");
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <h3 className="font-medium mb-4">Recent Activity</h3>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => {
            const user = users[activity.userId || ""];
            return (
              <div key={activity.id} className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{user?.name || "Unknown user"}</span>{" "}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatActivityTime(new Date(activity.createdAt))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-6">No recent activity</p>
      )}
    </div>
  );
}
