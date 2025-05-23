
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DueDatePickerProps {
  date: Date | null;
  onDateChange: (date: Date | null) => void;
  disabled?: boolean;
}

export default function DueDatePicker({ date, onDateChange, disabled = false }: DueDatePickerProps) {
  return (
    <div className="space-y-2">
      <Label className="font-medium block">Due Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "MMM d, yyyy") : "No date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={(date) => onDateChange(date)}
            initialFocus
          />
          {date && (
            <div className="p-3 border-t flex justify-end">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => onDateChange(null)}
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
