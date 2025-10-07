import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

interface AddHabitDialogProps {
  onAdd: (title: string, quote: string, color: string, category: string, goal: number, reminder: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const COLORS = [
  { name: "Coral", value: "5 100% 70%" },
  { name: "Yellow", value: "48 100% 62%" },
  { name: "Purple", value: "250 65% 65%" },
  { name: "Blue", value: "190 100% 50%" },
  { name: "Green", value: "145 50% 60%" },
  { name: "Pink", value: "340 85% 70%" },
];

const getCATEGORIES = (t: (key: string) => string) => [
  t('health'),
  t('sport'),
  t('learning'),
  t('work'),
  t('hobby'),
  t('finance'),
  t('relationships'),
  t('other'),
];

const AddHabitDialog = ({ onAdd, open: controlledOpen, onOpenChange }: AddHabitDialogProps) => {
  const { t } = useLanguage();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  
  const [title, setTitle] = useState("");
  const [quote, setQuote] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [category, setCategory] = useState("");
  const [goal, setGoal] = useState("");
  const [reminder, setReminder] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title, quote, selectedColor, category, goal ? parseInt(goal) : 30, reminder);
      setTitle("");
      setQuote("");
      setSelectedColor(COLORS[0].value);
      setCategory("");
      setGoal("");
      setReminder("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlledOpen && (
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg fixed bottom-24 right-6 bg-primary hover:bg-primary/90 z-40"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t('addHabit')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('habitName')}</Label>
            <Input
              id="title"
              placeholder={t('habitNamePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote">{t('motivationalQuote')}</Label>
            <Textarea
              id="quote"
              placeholder={t('quotePlaceholder')}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('selectColor')}</Label>
            <div className="grid grid-cols-6 gap-3">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-full aspect-square rounded-xl transition-all duration-200 ${
                    selectedColor === color.value
                      ? "ring-4 ring-primary ring-offset-2 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ background: `hsl(${color.value})` }}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t('category')}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder={t('selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {getCATEGORIES(t).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">{t('goalDays')}</Label>
            <Input
              id="goal"
              type="number"
              placeholder="30"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder">{t('reminder')}</Label>
            <Input
              id="reminder"
              type="time"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            {t('addHabitButton')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHabitDialog;
