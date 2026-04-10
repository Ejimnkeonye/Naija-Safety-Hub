import React from 'react';
import { useAccessibility } from '../lib/AccessibilityContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Accessibility, Type, Contrast, Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export const AccessibilitySettings = () => {
  const { 
    fontSize, setFontSize, 
    highContrast, setHighContrast, 
    screenReaderOptimized, setScreenReaderOptimized 
  } = useAccessibility();

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" />}>
        <Accessibility size={20} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Accessibility Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
              <Type size={16} />
              Font Size
            </div>
            <RadioGroup value={fontSize} onValueChange={(val: any) => setFontSize(val)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="f-small" />
                <Label htmlFor="f-small">Small</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="f-medium" />
                <Label htmlFor="f-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="f-large" />
                <Label htmlFor="f-large">Large</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Contrast size={16} className="text-slate-500" />
                High Contrast
              </Label>
              <p className="text-xs text-slate-500">Increase visibility for text and UI elements.</p>
            </div>
            <Switch checked={highContrast} onCheckedChange={setHighContrast} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Eye size={16} className="text-slate-500" />
                Screen Reader Optimization
              </Label>
              <p className="text-xs text-slate-500">Enhance ARIA labels and focus management.</p>
            </div>
            <Switch checked={screenReaderOptimized} onCheckedChange={setScreenReaderOptimized} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
