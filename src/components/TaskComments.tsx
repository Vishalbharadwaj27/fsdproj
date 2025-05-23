
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Comment, User } from "@/lib/types";
import { taskService, userService } from "@/services/api";
import { toast } from "sonner";
import { useEffect } from "react";

interface TaskCommentsProps {
  taskId: string;
  comments: Comment[];
  onCommentAdded?: () => void;
}

export default function TaskComments({ taskId, comments, onCommentAdded }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commentUsers, setCommentUsers] = useState<Record<string, User>>({});

  // Fetch users for comments
  useEffect(() => {
    const userIds = [...new Set(comments.map(comment => comment.userId))];
    
    const fetchUsers = async () => {
      try {
        const userMap: Record<string, User> = {};
        
        for (const userId of userIds) {
          if (!userId) continue;
          const user = await userService.getUserById(userId);
          userMap[userId] = user;
        }
        
        setCommentUsers(userMap);
      } catch (error) {
        console.error("Error fetching comment users:", error);
      }
    };
    
    if (userIds.length > 0) {
      fetchUsers();
    }
  }, [comments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsLoading(true);
      await taskService.addComment(taskId, "1", newComment); // Using default user ID 1 for now
      setNewComment("");
      toast.success("Comment added successfully");
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            />
            <Button onClick={handleAddComment} disabled={isLoading || !newComment.trim()}>
              {isLoading ? "Adding..." : "Add"}
            </Button>
          </div>
          {comments.map((comment) => (
            <div key={comment.id} className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {comment.content}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>By: {commentUsers[comment.userId]?.name || "Unknown User"}</span>
                <span>•</span>
                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
