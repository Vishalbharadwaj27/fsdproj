
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TaskStatus } from "@/lib/types";

interface StatusSelectorProps {
  value: TaskStatus;
  onValueChange: (value: TaskStatus) => void;
  disabled?: boolean;
}

export default function StatusSelector({ value, onValueChange, disabled = false }: StatusSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="status" className="font-medium">Status</Label>
      <Select
        value={value}
        onValueChange={(value) => onValueChange(value as TaskStatus)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="inProgress">In Progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
