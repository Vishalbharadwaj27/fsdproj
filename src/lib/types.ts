
export type Role = "admin" | "manager" | "member";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
}

export type TaskStatus = "todo" | "inProgress" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: string | null;
  createdBy: string;
  createdAt: Date;
  dueDate: Date | null;
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  members: User[];
  createdBy: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  taskId?: string;
  projectId?: string;
  createdAt: Date;
}
