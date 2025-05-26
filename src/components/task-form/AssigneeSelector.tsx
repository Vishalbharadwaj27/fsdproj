
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  name: string;
}

interface AssigneeSelectorProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  users: User[];
  isLoading: boolean;
  disabled?: boolean;
}

export default function AssigneeSelector({ 
  value, 
  onValueChange, 
  users, 
  isLoading, 
  disabled = false 
}: AssigneeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="assignee" className="font-medium">
        {isLoading ? 'Loading users...' : 'Assignee'}
      </Label>
      <Select 
        value={value || "unassigned"} 
        onValueChange={(value) => onValueChange(value === "unassigned" ? null : value)}
        disabled={isLoading || disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
