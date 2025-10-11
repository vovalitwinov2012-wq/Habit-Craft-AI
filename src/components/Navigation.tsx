import { Home, BarChart3, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Navigation = () => {
  const location = useLocation();
  const { t } = useLanguage();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-around gap-4">
          <Link to="/" className="flex-1 flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className={`flex flex-col gap-1 h-auto py-2 ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">{t('home')}</span>
            </Button>
          </Link>
          
          <Link to="/statistics" className="flex-1 flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className={`flex flex-col gap-1 h-auto py-2 ${isActive("/statistics") ? "text-primary" : "text-muted-foreground"}`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">{t('statistics')}</span>
            </Button>
          </Link>
          
          <Link to="/settings" className="flex-1 flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className={`flex flex-col gap-1 h-auto py-2 ${isActive("/settings") ? "text-primary" : "text-muted-foreground"}`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs">{t('settings')}</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
