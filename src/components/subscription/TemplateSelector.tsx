import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SUBSCRIPTION_TEMPLATES, SubscriptionTemplate, getTemplatesByCategory } from '@/lib/subscriptionTemplates';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  onSelect: (template: SubscriptionTemplate) => void;
  onSkip: () => void;
}

export function TemplateSelector({ onSelect, onSkip }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = getTemplatesByCategory();
  const categoryLabels: Record<string, string> = {
    streaming: 'Streaming',
    software: 'Software',
    utilities: 'Utilities',
    fitness: 'Fitness',
  };
  
  const filteredTemplates = searchQuery
    ? SUBSCRIPTION_TEMPLATES.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : selectedCategory
    ? categories[selectedCategory]
    : [];
  
  const showResults = searchQuery || selectedCategory;
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Quick Add</h2>
        <p className="text-sm text-muted-foreground">
          Choose a popular service or start from scratch
        </p>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedCategory(null);
          }}
          className="pl-10"
        />
      </div>
      
      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
      
      {/* Template Grid */}
      {showResults && (
        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border border-border bg-card",
                "hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
              )}
            >
              <span className="text-2xl">{template.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-sm truncate">{template.name}</p>
                <p className="text-xs text-muted-foreground">
                  {template.defaultCurrency} {template.defaultAmount.toFixed(2)}/{template.cadence === 'yearly' ? 'yr' : 'mo'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {showResults && filteredTemplates.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No services found
        </p>
      )}
      
      {/* Skip Button */}
      <Button
        variant="ghost"
        className="w-full"
        onClick={onSkip}
      >
        Start from scratch
      </Button>
    </div>
  );
}
