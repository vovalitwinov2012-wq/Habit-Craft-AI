import { Flame } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
  color: string;
}

const StreakDisplay = ({ currentStreak, bestStreak, color }: StreakDisplayProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div
          className="p-2 rounded-full"
          style={{ backgroundColor: `hsl(${color} / 0.2)` }}
        >
          <Flame className="h-5 w-5" style={{ color: `hsl(${color})` }} />
        </div>
        <div>
          <div className="text-2xl font-bold">{currentStreak}</div>
          <div className="text-xs text-muted-foreground">Текущая серия</div>
        </div>
      </div>
      
      <div className="h-12 w-px bg-border" />
      
      <div>
        <div className="text-2xl font-bold">{bestStreak}</div>
        <div className="text-xs text-muted-foreground">Лучшая серия</div>
      </div>
    </div>
  );
};

export default StreakDisplay;
