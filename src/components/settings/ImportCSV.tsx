import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { importFromCSV } from '@/lib/storage';
import { toast } from 'sonner';

export function ImportCSV() {
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const importResult = importFromCSV(content);
      setResult(importResult);
      
      if (importResult.imported > 0) {
        toast.success(`Imported ${importResult.imported} subscription${importResult.imported > 1 ? 's' : ''}`);
        // Reload to show new data
        setTimeout(() => window.location.reload(), 1500);
      } else if (importResult.skipped > 0) {
        toast.info(`${importResult.skipped} subscription${importResult.skipped > 1 ? 's' : ''} skipped (duplicates)`);
      } else {
        toast.error('No subscriptions imported');
      }
    };
    reader.readAsText(file);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };
  
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Upload className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <Label className="text-base font-medium text-foreground">
            Import Data
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            Import subscriptions from a CSV file (matches export format)
          </p>
          
          {/* Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
              ${isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }
            `}
          >
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {isDragging ? 'Drop file here' : 'Click or drag CSV file to import'}
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {/* Result */}
          {result && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2">
              {result.imported > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  {result.imported} imported
                </div>
              )}
              {result.skipped > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  {result.skipped} skipped (duplicates or errors)
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="text-xs text-destructive">
                  {result.errors.slice(0, 3).join(', ')}
                  {result.errors.length > 3 && ` +${result.errors.length - 3} more`}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
