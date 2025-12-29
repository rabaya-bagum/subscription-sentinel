import { useState } from "react";
import { Wallet } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSettings, saveSettings } from "@/lib/storage";
import { toast } from "sonner";

export function BudgetSettings() {
  const [settings, setSettings] = useState(getSettings());
  const [budgetInput, setBudgetInput] = useState(
    settings.monthlyBudgetLimit?.toString() || ""
  );

  const handleSaveBudget = () => {
    const limit = budgetInput ? parseFloat(budgetInput) : undefined;
    const updated = saveSettings({ monthlyBudgetLimit: limit });
    setSettings(updated);
    toast.success(limit ? "Budget limit saved" : "Budget limit removed");
  };

  const handleThresholdChange = (value: string) => {
    const updated = saveSettings({ budgetAlertThreshold: parseInt(value) });
    setSettings(updated);
    toast.success("Alert threshold updated");
  };

  const handleTrialDaysChange = (value: string) => {
    const updated = saveSettings({ trialExpirationDays: parseInt(value) });
    setSettings(updated);
    toast.success("Trial expiration warning updated");
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <Label className="text-base font-medium text-foreground">
            Budget & Alerts
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Set spending limits and alert preferences
          </p>

          {/* Monthly Budget Limit */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="budget" className="text-sm">
              Monthly Budget Limit ({settings.defaultCurrency})
            </Label>
            <div className="flex gap-2">
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 100"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSaveBudget} variant="outline">
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to disable budget alerts
            </p>
          </div>

          {/* Alert Threshold */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="threshold" className="text-sm">
              Budget Warning Threshold
            </Label>
            <Select 
              value={settings.budgetAlertThreshold.toString()} 
              onValueChange={handleThresholdChange}
            >
              <SelectTrigger id="threshold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">Warn at 50%</SelectItem>
                <SelectItem value="70">Warn at 70%</SelectItem>
                <SelectItem value="80">Warn at 80%</SelectItem>
                <SelectItem value="90">Warn at 90%</SelectItem>
                <SelectItem value="100">Only when exceeded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trial Expiration Warning */}
          <div className="space-y-2">
            <Label htmlFor="trialDays" className="text-sm">
              Trial Expiration Warning
            </Label>
            <Select 
              value={settings.trialExpirationDays.toString()} 
              onValueChange={handleTrialDaysChange}
            >
              <SelectTrigger id="trialDays">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days before</SelectItem>
                <SelectItem value="5">5 days before</SelectItem>
                <SelectItem value="7">7 days before</SelectItem>
                <SelectItem value="14">14 days before</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Get warned when trials are about to end
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}