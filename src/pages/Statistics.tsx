import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Award, TrendingUp, Target, Calendar } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";

interface Habit {
  id: string;
  title: string;
  color: string;
  completedDays: number;
  totalDays: number;
  completedDates: string[];
}

const STORAGE_KEY = "habits-data";

const Statistics = () => {
  const { t } = useLanguage();
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setHabits(JSON.parse(stored));
    }
  }, []);

  const getTotalCompletedDays = () => {
    return habits.reduce((sum, h) => sum + h.completedDays, 0);
  };

  const getAverageSuccess = () => {
    if (habits.length === 0) return 0;
    const total = habits.reduce((sum, h) => {
      const rate = h.totalDays > 0 ? (h.completedDays / h.totalDays) * 100 : 0;
      return sum + rate;
    }, 0);
    return Math.round(total / habits.length);
  };

  const getBestHabit = () => {
    if (habits.length === 0) return null;
    return habits.reduce((best, current) => {
      const currentRate = current.totalDays > 0 ? (current.completedDays / current.totalDays) * 100 : 0;
      const bestRate = best.totalDays > 0 ? (best.completedDays / best.totalDays) * 100 : 0;
      return currentRate > bestRate ? current : best;
    });
  };

  const getTodayCompletionRate = () => {
    const today = new Date().toDateString();
    const completedToday = habits.filter(h => 
      h.completedDates?.some(d => new Date(d).toDateString() === today)
    ).length;
    return habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
  };

  const bestHabit = getBestHabit();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('statisticsTitle')}</h1>
          <p className="text-muted-foreground">{t('statisticsSubtitle')}</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[hsl(5_100%_70%)] to-[hsl(48_100%_62%)] rounded-full">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold">{getTotalCompletedDays()}</div>
                <div className="text-sm text-muted-foreground">{t('totalCompletions')}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[hsl(250_65%_65%)] to-[hsl(190_100%_50%)] rounded-full">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold">{getAverageSuccess()}%</div>
                <div className="text-sm text-muted-foreground">{t('averageSuccess')}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[hsl(145_50%_60%)] to-[hsl(190_100%_50%)] rounded-full">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold">{getTodayCompletionRate()}%</div>
                <div className="text-sm text-muted-foreground">{t('completedToday')}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[hsl(340_85%_70%)] to-[hsl(5_100%_70%)] rounded-full">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold">{habits.length}</div>
                <div className="text-sm text-muted-foreground">{t('activeHabits')}</div>
              </div>
            </div>
          </Card>
        </div>

        {bestHabit && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              {t('bestHabit')}
            </h2>
            <div
              className="p-4 rounded-lg text-white"
              style={{ background: `linear-gradient(135deg, hsl(${bestHabit.color}), hsl(${bestHabit.color} / 0.8))` }}
            >
              <div className="text-2xl font-bold mb-1">{bestHabit.title}</div>
              <div className="text-white/80">
                {Math.round((bestHabit.completedDays / bestHabit.totalDays) * 100)}% {t('successRate')}
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{t('allHabits')}</h2>
          <div className="space-y-3">
            {habits.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('noActiveHabits')}
              </p>
            ) : (
              habits.map((habit) => {
                const rate = habit.totalDays > 0 
                  ? Math.round((habit.completedDays / habit.totalDays) * 100) 
                  : 0;
                
                return (
                  <div key={habit.id} className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: `hsl(${habit.color})` }}
                    >
                      {rate}%
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{habit.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {habit.completedDays}/{habit.totalDays} {t('days')}
                      </div>
                    </div>
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${rate}%`,
                          backgroundColor: `hsl(${habit.color})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default Statistics;
