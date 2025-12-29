import { useState } from "react";
import { useTheme } from "next-themes";
import { Download, DollarSign, Bell, Calculator, Database, Trash2, Moon, Sun } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getSettings, saveSettings, exportToCSV } from "@/lib/storage";
import { seedDemoData, clearAllData } from "@/lib/seedData";
import { CURRENCIES } from "@/types/subscription";
import { toast } from "sonner";
import { PaymentMethods } from "@/components/settings/PaymentMethods";
import { ImportCSV } from "@/components/settings/ImportCSV";
import { BudgetSettings } from "@/components/settings/BudgetSettings";

export default function SettingsPage() {
  const [settings, setSettings] = useState(getSettings());
  const { theme, setTheme } = useTheme();

  const handleCurrencyChange = (currency: string) => {
    const updated = saveSettings({ defaultCurrency: currency });
    setSettings(updated);
    toast.success("Default currency updated");
  };

  const handleReminderDaysChange = (days: string) => {
    const updated = saveSettings({ defaultReminderDays: parseInt(days) });
    setSettings(updated);
    toast.success("Default reminder days updated");
  };

  const handleTrialsToggle = (checked: boolean) => {
    const updated = saveSettings({ includeTrialsInTotal: checked });
    setSettings(updated);
    toast.success(checked ? "Trials included in monthly total" : "Trials excluded from monthly total");
  };

  const handleExport = () => {
    const csv = exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscription-squeeze-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  return (
    <PageContainer title="Settings" subtitle="Customize your experience">
      <div className="space-y-6 animate-fade-in">
        {/* Theme Toggle */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme" className="text-base font-medium text-foreground">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  id="theme"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => {
                    setTheme(checked ? 'dark' : 'light');
                    toast.success(checked ? 'Dark mode enabled' : 'Light mode enabled');
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Default Currency */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <Label htmlFor="currency" className="text-base font-medium text-foreground">
                Default Currency
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Used when adding new subscriptions
              </p>
              <Select value={settings.defaultCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Default Reminder */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <Label htmlFor="reminder" className="text-base font-medium text-foreground">
                Default Reminder
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Days before renewal to remind you
              </p>
              <Select value={settings.defaultReminderDays.toString()} onValueChange={handleReminderDaysChange}>
                <SelectTrigger id="reminder" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Same day</SelectItem>
                  <SelectItem value="1">1 day before</SelectItem>
                  <SelectItem value="3">3 days before</SelectItem>
                  <SelectItem value="7">7 days before</SelectItem>
                  <SelectItem value="14">14 days before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Budget & Alerts */}
        <BudgetSettings />

        {/* Include Trials */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="trials" className="text-base font-medium text-foreground">
                    Include Trials in Total
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Count trial subscriptions in monthly total
                  </p>
                </div>
                <Switch
                  id="trials"
                  checked={settings.includeTrialsInTotal}
                  onCheckedChange={handleTrialsToggle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <PaymentMethods />

        {/* Import CSV */}
        <ImportCSV />

        {/* Export */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <Label className="text-base font-medium text-foreground">
                Export Data
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Download all your subscriptions as a CSV file
              </p>
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export to CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Demo Data Section */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Database className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <Label className="text-base font-medium text-foreground">
                Demo Data
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Seed sample data to explore all features (2 years of history)
              </p>
              <div className="flex flex-wrap gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Database className="h-4 w-4" />
                      Load Demo Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Load Demo Data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will replace all existing data with 24 sample subscriptions, usage history, and events spanning 2 years. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        const result = seedDemoData();
                        toast.success(`Loaded ${result.subscriptions} subscriptions, ${result.events} events, ${result.usageChecks} usage checks`);
                        window.location.reload();
                      }}>
                        Load Demo Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Clear All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all subscriptions, events, and usage checks. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          clearAllData();
                          toast.success("All data cleared");
                          window.location.reload();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Clear All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p className="font-medium text-foreground mb-1">Subscription Squeeze</p>
          <p>Track subscriptions. Avoid surprises.</p>
          <p className="mt-2">Version 1.0.0</p>
        </div>
      </div>
    </PageContainer>
  );
}
