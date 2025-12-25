import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SubscriptionForm } from "@/components/subscription/SubscriptionForm";
import { Button } from "@/components/ui/button";

export default function AddSubscriptionPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="gap-1 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
        <SubscriptionForm />
      </div>
    </PageContainer>
  );
}
