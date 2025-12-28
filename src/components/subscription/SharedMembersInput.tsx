import { useState } from 'react';
import { Plus, X, Users } from 'lucide-react';
import { SharedMember } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';

interface SharedMembersInputProps {
  members: SharedMember[];
  onChange: (members: SharedMember[]) => void;
  totalAmount: number;
  currency: string;
}

export function SharedMembersInput({ members, onChange, totalAmount, currency }: SharedMembersInputProps) {
  const [newMemberName, setNewMemberName] = useState('');
  
  const addMember = () => {
    if (!newMemberName.trim()) return;
    
    const newMember: SharedMember = {
      id: uuidv4(),
      name: newMemberName.trim(),
    };
    
    onChange([...members, newMember]);
    setNewMemberName('');
  };
  
  const removeMember = (id: string) => {
    onChange(members.filter(m => m.id !== id));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMember();
    }
  };
  
  // Calculate cost per person
  const totalPeople = members.length + 1; // Including user
  const costPerPerson = totalAmount / totalPeople;
  
  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <Label className="cursor-default">Shared With</Label>
      </div>
      
      {/* Member List */}
      {members.length > 0 && (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-2 bg-background rounded-md px-3 py-2"
            >
              <span className="text-sm text-foreground">{member.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeMember(member.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Add Member */}
      <div className="flex gap-2">
        <Input
          placeholder="Add person's name..."
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addMember}
          disabled={!newMemberName.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Cost Summary */}
      {members.length > 0 && totalAmount > 0 && (
        <div className="pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Split {totalPeople} ways: <span className="font-medium text-foreground">
              {new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(costPerPerson)}
            </span> each
          </p>
        </div>
      )}
    </div>
  );
}
