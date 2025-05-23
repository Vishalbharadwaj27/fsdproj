
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PrioritySelectorProps {
  value: string;
  onValueChange: (value: 'low' | 'medium' | 'high') => void;
  disabled?: boolean;
}

export default function PrioritySelector({ value, onValueChange, disabled = false }: PrioritySelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="priority" className="font-medium">Priority</Label>
      <Select
        value={value}
        onValueChange={(value) => onValueChange(value as 'low' | 'medium' | 'high')}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
