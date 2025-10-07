import { useParams, useNavigate } from "react-router-dom";
import { saveHabits } from "@/services/supabaseService";
import { ArrowLeft, Edit, Trash2, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import HabitCalendar from "@/components/HabitCalendar";
import StreakDisplay from "@/components/StreakDisplay";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Habit {
  id: string;
  title: string;
  quote?: string;
  color: string;
  completedDays: number;
  totalDays: number;
  completedDates: string[];
  category?: string;
  goal?: number;
  reminder?: string;
  createdAt: string;
}

const STORAGE_KEY = "habits-data";

const HabitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState<Habit | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const habits = JSON.parse(stored);
      const foundHabit = habits.find((h: Habit) => h.id === id);
      if (foundHabit) {
        setHabit(foundHabit);
      } else {
        navigate("/");
      }
    }
  }, [id, navigate]);

  const calculateStreaks = () => {
    if (!habit || !habit.completedDates) return { current: 0, best: 0 };
    
    const dates = habit.completedDates.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastDate = new Date(dates[i]);
        lastDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          currentStreak = 1;
        }
      } else {
        const diff = Math.floor((dates[i - 1].getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          tempStreak++;
          if (i === 1 || currentStreak > 0) {
            currentStreak++;
          }
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    
    bestStreak = Math.max(bestStreak, tempStreak, currentStreak);
    return { current: currentStreak, best: bestStreak };
  };

  const handleDelete = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const habits = JSON.parse(stored);
      const updated = habits.filter((h: Habit) => h.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      toast.success("Привычка удалена");
      navigate("/");
    }
  };

  if (!habit) return null;

  const streaks = calculateStreaks();
  const successRate = habit.totalDays > 0 ? Math.round((habit.completedDays / habit.totalDays) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div
        className="h-48 relative"
        style={{ background: `linear-gradient(135deg, hsl(${habit.color}), hsl(${habit.color} / 0.8))` }}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="mt-8">
            <h1 className="text-3xl font-bold text-white mb-2">{habit.title}</h1>
            {habit.quote && (
              <p className="text-white/80 italic">{habit.quote}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-12">
        <Card className="p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <StreakDisplay
              currentStreak={streaks.current}
              bestStreak={streaks.best}
              color={habit.color}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <div className="text-2xl font-bold">{successRate}%</div>
              <div className="text-xs text-muted-foreground">Успешность</div>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <div className="text-2xl font-bold">{habit.completedDays}</div>
              <div className="text-xs text-muted-foreground">Выполнено</div>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <div className="text-2xl font-bold">{habit.totalDays}</div>
              <div className="text-xs text-muted-foreground">Всего дней</div>
            </div>
          </div>

          {habit.goal && (
            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg mb-6">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm font-medium">Цель: {habit.goal} дней</div>
                <div className="text-xs text-muted-foreground">
                  Прогресс: {habit.completedDays}/{habit.goal}
                </div>
              </div>
              <div className="text-2xl font-bold">
                {Math.round((habit.completedDays / habit.goal) * 100)}%
              </div>
            </div>
          )}

          {habit.category && (
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-sm">
                <TrendingUp className="h-4 w-4" />
                {habit.category}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <HabitCalendar
            completedDates={habit.completedDates || []}
            color={habit.color}
          />
        </Card>
      </div>
    </div>
  );
};

export default HabitDetail;
