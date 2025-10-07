import { useState, useEffect } from "react";
import HabitCard from "@/components/HabitCard";
import AddHabitDialog from "@/components/AddHabitDialog";
import Navigation from "@/components/Navigation";
import AIAssistant from "@/components/AIAssistant";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { toast } from "sonner";
import { loadHabits, saveHabits } from "@/services/supabaseService";
import { getClientId } from "@/lib/clientId";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

interface Habit {
  id: string;
  title: string;
  quote?: string;
  color: string;
  completedDays: number;
  totalDays: number;
  lastCompletedDate?: string;
  completedDates: string[];
  category?: string;
  goal?: number;
  reminder?: string;
  createdAt: string;
}

const STORAGE_KEY = "habits-data";

const Index = () => {
  const { t } = useLanguage();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const loaded = await loadHabits();
        if (loaded && loaded.length) {
          setHabits(loaded);
          return;
        }
      } catch (e) {
        console.warn('failed to load from supabase', e);
      }
      // fallback: try localStorage sample or initial state (unchanged)
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          setHabits(JSON.parse(raw));
          return;
        } catch (_) {}
      }
      // If no local data, keep default (or sample) which may be created later
    })();
  }, []);;

  const saveHabits = (updatedHabits: Habit[]) => {
    setHabits(updatedHabits);
    try{ saveHabits(updatedHabits); }catch(e){ console.warn('saveHabits error', e);} try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHabits)); }catch(_){}
  };

  const addHabit = (title: string, quote: string, color: string, category: string, goal: number, reminder: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      title,
      quote: quote || undefined,
      color,
      completedDays: 0,
      totalDays: 1,
      completedDates: [],
      category: category || undefined,
      goal: goal || undefined,
      reminder: reminder || undefined,
      createdAt: new Date().toISOString(),
    };
    saveHabits([...habits, newHabit]);
    toast.success(t('habitAdded'));
  };

  const toggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedHabits = habits.map((habit) => {
      if (habit.id === id) {
        const completedDates = habit.completedDates || [];
        const isCompletedToday = completedDates.some(d => d.split('T')[0] === today);
        
        if (isCompletedToday) {
          // Uncheck
          return {
            ...habit,
            completedDays: habit.completedDays - 1,
            completedDates: completedDates.filter(d => d.split('T')[0] !== today),
            lastCompletedDate: undefined,
          };
        } else {
          // Check
          return {
            ...habit,
            completedDays: habit.completedDays + 1,
            totalDays: habit.totalDays + (completedDates.length === 0 ? 0 : 1),
            completedDates: [...completedDates, new Date().toISOString()],
            lastCompletedDate: new Date().toDateString(),
          };
        }
      }
      return habit;
    });
    saveHabits(updatedHabits);
  };

  const deleteHabit = (id: string) => {
    if (confirm(t('deleteConfirm'))) {
      saveHabits(habits.filter((habit) => habit.id !== id));
      toast.success(t('habitDeleted'));
    }
  };

  const getTodayCompletion = () => {
    const today = new Date().toDateString();
    const completedToday = habits.filter((h) => h.lastCompletedDate === today).length;
    return { completed: completedToday, total: habits.length };
  };


  const getFilteredAndSortedHabits = () => {
    let filtered = habits.filter(h => 
      h.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterCategory !== "all") {
      filtered = filtered.filter(h => h.category === filterCategory);
    }

    switch (sortBy) {
      case "alphabetical":
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case "success":
        return filtered.sort((a, b) => {
          const rateA = a.totalDays > 0 ? a.completedDays / a.totalDays : 0;
          const rateB = b.totalDays > 0 ? b.completedDays / b.totalDays : 0;
          return rateB - rateA;
        });
      case "recent":
      default:
        return filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  };

  const filteredHabits = getFilteredAndSortedHabits();
  const categories = ["all", ...Array.from(new Set(habits.map(h => h.category).filter(Boolean)))];

  const { completed, total } = getTodayCompletion();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
                {t('appName')}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t('appSubtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>
          {total > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm border">
              <span className="text-sm font-medium">{t('todayLabel')}</span>
              <span className="text-lg font-bold">
                {completed}/{total}
              </span>
              <span className="text-sm text-muted-foreground">{t('completed')}</span>
            </div>
          )}
        </header>

        {/* Search and Filters */}
        {habits.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t('allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  {categories.filter(c => c !== "all").map((cat) => (
                    <SelectItem key={cat} value={cat!}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t('sortByDate')}</SelectItem>
                  <SelectItem value="alphabetical">{t('sortByAlphabet')}</SelectItem>
                  <SelectItem value="success">{t('sortBySuccess')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Habits Grid */}
        {filteredHabits.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">
              {habits.length === 0 ? "✨" : "🔍"}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {habits.length === 0 ? t('noHabits') : t('notFound')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {habits.length === 0 
                ? t('noHabitsDesc') 
                : t('notFoundDesc')}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredHabits.map((habit) => {
              const today = new Date().toISOString().split('T')[0];
              const isCompletedToday = habit.completedDates?.some(d => 
                d.split('T')[0] === today
              );
              
              return (
                <HabitCard
                  key={habit.id}
                  id={habit.id}
                  title={habit.title}
                  quote={habit.quote}
                  color={habit.color}
                  completedDays={habit.completedDays}
                  totalDays={habit.totalDays}
                  isCompletedToday={isCompletedToday || false}
                  category={habit.category}
                  onToggle={toggleHabit}
                  onDelete={deleteHabit}
                />
              );
            })}
          </div>
        )}
      </div>

      <AddHabitDialog onAdd={addHabit} open={dialogOpen} onOpenChange={setDialogOpen} />
      <Navigation />
      <AIAssistant
        onAddHabits={(habits) => {
          habits.forEach(habit => {
            addHabit(habit.title, habit.quote, habit.color, habit.category, habit.goal, "");
          });
        }}
      />
    </div>
  );
};

export default Index;
