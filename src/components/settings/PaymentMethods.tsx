import { useState } from 'react';
import { CreditCard, Plus, Trash2, Edit, Building, Wallet } from 'lucide-react';
import { PaymentMethod, PAYMENT_METHOD_TYPES, PaymentMethodType } from '@/types/subscription';
import { getPaymentMethods, savePaymentMethod, updatePaymentMethod, deletePaymentMethod } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const COLORS = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Violet' },
];

export function PaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>(getPaymentMethods());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<PaymentMethodType>('credit_card');
  const [lastFour, setLastFour] = useState('');
  const [color, setColor] = useState(COLORS[0].value);
  
  const resetForm = () => {
    setName('');
    setType('credit_card');
    setLastFour('');
    setColor(COLORS[0].value);
    setEditingMethod(null);
  };
  
  const openEditDialog = (method: PaymentMethod) => {
    setEditingMethod(method);
    setName(method.name);
    setType(method.type);
    setLastFour(method.lastFour || '');
    setColor(method.color || COLORS[0].value);
    setDialogOpen(true);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (editingMethod) {
      updatePaymentMethod(editingMethod.id, {
        name: name.trim(),
        type,
        lastFour: lastFour.trim() || undefined,
        color,
      });
      toast.success('Payment method updated');
    } else {
      savePaymentMethod({
        name: name.trim(),
        type,
        lastFour: lastFour.trim() || undefined,
        color,
      });
      toast.success('Payment method added');
    }
    
    setMethods(getPaymentMethods());
    setDialogOpen(false);
    resetForm();
  };
  
  const handleDelete = (id: string) => {
    deletePaymentMethod(id);
    setMethods(getPaymentMethods());
    toast.success('Payment method deleted');
  };
  
  const getIcon = (methodType: PaymentMethodType) => {
    switch (methodType) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_account':
        return <Building className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <CreditCard className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <Label className="text-base font-medium text-foreground">
            Payment Methods
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            Track which card or account is billed for each subscription
          </p>
          
          {/* List of payment methods */}
          {methods.length > 0 && (
            <div className="space-y-2 mb-3">
              {methods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: method.color || COLORS[0].value }}
                  >
                    {getIcon(method.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{method.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {PAYMENT_METHOD_TYPES.find(t => t.value === method.type)?.label}
                      {method.lastFour && ` •••• ${method.lastFour}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(method)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete payment method?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove "{method.name}" from all subscriptions that use it.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(method.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
          
          {/* Add button with dialog */}
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pm-name">Name</Label>
                  <Input
                    id="pm-name"
                    placeholder="e.g., Chase Visa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pm-type">Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as PaymentMethodType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHOD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {(type === 'credit_card' || type === 'debit_card') && (
                  <div className="space-y-2">
                    <Label htmlFor="pm-last4">Last 4 digits (optional)</Label>
                    <Input
                      id="pm-last4"
                      placeholder="1234"
                      maxLength={4}
                      value={lastFour}
                      onChange={(e) => setLastFour(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        className={`w-8 h-8 rounded-full transition-all ${
                          color === c.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                        style={{ backgroundColor: c.value }}
                        onClick={() => setColor(c.value)}
                      />
                    ))}
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  {editingMethod ? 'Save Changes' : 'Add Payment Method'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
