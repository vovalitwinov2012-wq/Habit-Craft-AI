import { Check, Trash2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface HabitCardProps {
  id: string;
  title: string;
  quote?: string;
  color: string;
  completedDays: number;
  totalDays: number;
  isCompletedToday: boolean;
  category?: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const HabitCard = ({
  id,
  title,
  quote,
  color,
  completedDays,
  totalDays,
  isCompletedToday,
  category,
  onToggle,
  onDelete,
}: HabitCardProps) => {
  const { t } = useLanguage();
  const successRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  const navigate = useNavigate();

  return (
    <Card
      className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-none cursor-pointer"
      style={{
        background: `linear-gradient(135deg, hsl(${color}), hsl(${color} / 0.8))`,
      }}
      onClick={() => navigate(`/habit/${id}`)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
            {quote && (
              <p className="text-sm text-white/80 italic line-clamp-2">{quote}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="text-white/60 hover:text-white hover:bg-white/10 shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {category && (
          <div className="mb-3 inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs text-white">
            <TrendingUp className="h-3 w-3" />
            {category}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(id);
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                isCompletedToday
                  ? "bg-white text-primary scale-110"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Check className={`h-6 w-6 ${isCompletedToday ? "animate-in zoom-in" : ""}`} />
            </button>
            <div className="text-white">
              <div className="text-3xl font-bold">{successRate}%</div>
              <div className="text-xs text-white/80">
                {completedDays}/{totalDays} {t('days')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-500"
          style={{ width: `${successRate}%` }}
        />
      </div>
    </Card>
  );
};

export default HabitCard;
