import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SubscriptionForm } from "@/components/subscription/SubscriptionForm";
import { TemplateSelector } from "@/components/subscription/TemplateSelector";
import { Button } from "@/components/ui/button";
import { SubscriptionTemplate } from "@/lib/subscriptionTemplates";

export default function AddSubscriptionPage() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<SubscriptionTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleTemplateSelect = (template: SubscriptionTemplate) => {
    setSelectedTemplate(template);
    setShowForm(true);
  };

  return (
    <PageContainer>
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => showForm && !selectedTemplate ? setShowForm(false) : navigate(-1)}
          className="gap-1 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
        {!showForm ? (
          <TemplateSelector 
            onSelect={handleTemplateSelect}
            onSkip={() => setShowForm(true)}
          />
        ) : (
          <SubscriptionForm template={selectedTemplate} />
        )}
      </div>
    </PageContainer>
  );
}
