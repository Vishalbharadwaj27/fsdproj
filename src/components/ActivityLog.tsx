
import { activities, getUserById } from "@/lib/data";
import { Activity } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityLogProps {
  className?: string;
}

export default function ActivityLog({ className }: ActivityLogProps) {
  // Sort activities by most recent first
  const sortedActivities = [...activities].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const formatActivityDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 3) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return format(date, "MMM d");
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {sortedActivities.map((activity) => {
            const user = getUserById(activity.userId);
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                {user && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">
                      <span className="font-semibold">{user?.name}</span>
                      <span className="text-gray-600 ml-1">{activity.action}</span>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">{formatActivityDate(activity.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
