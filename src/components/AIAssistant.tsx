import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageCircle, Send, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  onAddHabits?: (habits: Array<{
    title: string;
    quote: string;
    color: string;
    category: string;
    goal: number;
  }>) => void;
}

const AIAssistant = ({ onAddHabits }: AIAssistantProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: t('aiGreeting')
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Check if user is asking for habit suggestions
      const isSuggestionRequest = /предлож|добав|создай|помоги выбрать|какие привычки|новые привычки/i.test(input);

      const { data, error } = await supabase.functions.invoke("habit-assistant", {
        body: {
          messages: [...messages, userMessage],
          type: isSuggestionRequest ? "suggest" : "chat"
        }
      });

      if (error) {
        throw error;
      }

      if (data.suggestions) {
        // Handle structured habit suggestions
        const suggestionText = "Вот мои предложения:\n\n" + 
          data.suggestions.map((h: any, i: number) => 
            `${i + 1}. **${h.title}** (${h.category})\n   "${h.quote}"\n   Цель: ${h.goal} дней\n   ${h.tips}`
          ).join("\n\n");

        setMessages(prev => [...prev, {
          role: "assistant",
          content: suggestionText
        }]);

        // Offer to add the habits
        setTimeout(() => {
          const confirmed = confirm("Хотите добавить эти привычки в трекер?");
          if (confirmed && onAddHabits) {
            onAddHabits(data.suggestions);
            toast.success(`Добавлено ${data.suggestions.length} новых привычек!`);
            setOpen(false);
          }
        }, 500);
      } else if (data.message) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.message
        }]);
      }
    } catch (error: any) {
      console.error("Error calling AI assistant:", error);
      
      let errorMessage = t('aiError');
      if (error.message?.includes("429") || error.message?.includes("rate limit")) {
        errorMessage = t('rateLimitError');
      } else if (error.message?.includes("402") || error.message?.includes("payment")) {
        errorMessage = t('paymentError');
      }
      
      toast.error(errorMessage);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Извините, ${errorMessage}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    t('suggestHealth'),
    t('howNotToQuit'),
    t('helpMotivation'),
    t('howToTrack')
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-24 right-4 h-16 px-6 rounded-full shadow-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 z-40 flex items-center gap-3 animate-pulse hover:animate-none transition-all"
        >
          <Sparkles className="h-6 w-6" />
          <span className="font-semibold">AI</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('aiAssistant')}
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="mt-6 space-y-2">
              <p className="text-sm text-muted-foreground">{t('quickActions')}</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <Badge
                    key={action}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => {
                      setInput(action);
                    }}
                  >
                    {action}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Спросите о привычках..."
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AIAssistant;
