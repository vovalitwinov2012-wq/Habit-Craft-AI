import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Download, Upload, Trash2, Moon, Sun } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const STORAGE_KEY = "habits-data";
const THEME_KEY = "habits-theme";

const Settings = () => {
  const { t } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem(THEME_KEY);
    const isDark = theme === "dark";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(THEME_KEY, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(THEME_KEY, "light");
    }
  };

  const exportData = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `habits-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      toast.success(t('dataExported'));
    }
  };

  const importData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = event.target?.result as string;
            JSON.parse(data); // Validate JSON
            localStorage.setItem(STORAGE_KEY, data);
            toast.success(t('dataImported'));
            setTimeout(() => window.location.reload(), 1000);
          } catch (error) {
            toast.error(t('importError'));
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const clearAllData = () => {
    if (confirm(t('deleteAllConfirm'))) {
      localStorage.removeItem(STORAGE_KEY);
      toast.success(t('allDataDeleted'));
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('settingsTitle')}</h1>
          <p className="text-muted-foreground">{t('settingsSubtitle')}</p>
        </header>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">{t('appearance')}</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="dark-mode" className="font-medium">
                    {t('darkTheme')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('darkThemeDesc')}
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">{t('data')}</h2>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={exportData}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('exportData')}
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={importData}
              >
                <Upload className="h-4 w-4 mr-2" />
                {t('importData')}
              </Button>
              
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={clearAllData}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('deleteAllData')}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">{t('aboutApp')}</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{t('version')}</p>
              <p>{t('appDescription')}</p>
              <p className="mt-4 text-xs">
                {t('dataStorageNote')}
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Settings;
