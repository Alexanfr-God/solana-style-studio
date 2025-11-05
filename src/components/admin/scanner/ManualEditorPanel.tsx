import React, { useState } from 'react';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Save, X, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export const ManualEditorPanel = () => {
  const { currentElement, updateElement } = useAiScannerStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedPath, setEditedPath] = useState('');
  const [copied, setCopied] = useState(false);
  
  React.useEffect(() => {
    const jsonPath = (currentElement?.style as any)?.jsonPath;
    if (jsonPath) {
      setEditedPath(jsonPath);
    }
  }, [currentElement]);
  
  if (!currentElement) {
    return (
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold mb-2">Manual Editor</h4>
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Select an element to edit its JSON path
          </p>
        </div>
      </div>
    );
  }
  
  const currentPath = (currentElement?.style as any)?.jsonPath as string | undefined;
  
  const handleSave = () => {
    if (!editedPath.trim()) {
      toast.error('JSON path cannot be empty');
      return;
    }
    
    updateElement(currentElement.id, {
      style: {
        ...currentElement.style,
        jsonPath: editedPath
      } as any
    });
    
    setIsEditing(false);
    toast.success('JSON path updated successfully');
  };
  
  const handleCancel = () => {
    setEditedPath(currentPath || '');
    setIsEditing(false);
  };
  
  const handleCopy = () => {
    if (currentPath) {
      navigator.clipboard.writeText(currentPath);
      setCopied(true);
      toast.success('Path copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Manual Editor</h4>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-7 gap-1"
          >
            <Edit className="h-3 w-3" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="h-7 gap-1 text-green-600 hover:text-green-700"
            >
              <Save className="h-3 w-3" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-7 gap-1"
            >
              <X className="h-3 w-3" />
              Cancel
            </Button>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Element Info */}
        <div className="p-3 bg-muted/30 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Element ID</span>
            <Badge variant="outline" className="font-mono text-xs">
              {currentElement.id}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Type</span>
            <Badge variant="secondary" className="text-xs">
              {currentElement.type}
            </Badge>
          </div>
        </div>
        
        <Separator />
        
        {/* JSON Path Editor */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">JSON Theme Path</Label>
          {!isEditing ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 bg-muted/50 rounded border font-mono text-xs break-all">
                {currentPath || (
                  <span className="text-muted-foreground">No path mapped</span>
                )}
              </div>
              {currentPath && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          ) : (
            <Input
              value={editedPath}
              onChange={(e) => setEditedPath(e.target.value)}
              placeholder="/homeLayer/buttons/sendButton/backgroundColor"
              className="font-mono text-xs"
            />
          )}
          
          {isEditing && (
            <p className="text-xs text-muted-foreground">
              Example: /homeLayer/buttons/sendButton/backgroundColor
            </p>
          )}
        </div>
        
        {/* Quick Actions */}
        {!isEditing && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Quick Actions</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditedPath(`/${currentElement.id.replace(/-/g, '/')}`);
                    setIsEditing(true);
                  }}
                  className="text-xs"
                >
                  Auto-generate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditedPath('');
                    setIsEditing(true);
                  }}
                  className="text-xs"
                >
                  Clear path
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
