import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface HabitCalendarProps {
  completedDates: string[];
  color: string;
}

const HabitCalendar = ({ completedDates, color }: HabitCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const isCompleted = (date: Date) => {
    return completedDates.some((d) => isSameDay(new Date(d), date));
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {format(currentDate, "LLLL yyyy", { locale: ru })}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
        
        {days.map((day, idx) => {
          const completed = isCompleted(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isTodayDate = isToday(day);
          
          return (
            <div
              key={idx}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-all ${
                !isCurrentMonth
                  ? "text-muted-foreground/30"
                  : completed
                  ? "text-white font-medium"
                  : "text-foreground"
              } ${
                isTodayDate ? "ring-2 ring-primary" : ""
              }`}
              style={{
                backgroundColor: completed && isCurrentMonth
                  ? `hsl(${color})`
                  : completed
                  ? `hsl(${color} / 0.3)`
                  : "transparent",
              }}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitCalendar;
