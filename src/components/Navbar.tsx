import React from 'react';
import { useGlobalState } from '../lib/StateContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Languages } from 'lucide-react';
import { AccessibilitySettings } from './AccessibilitySettings';

export const Navbar = () => {
  const { selectedState, setSelectedState, language, setLanguage } = useGlobalState();

  return (
    <nav className="bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-2">
        <Shield className="text-emerald-500 w-6 h-6" />
        <span className="font-bold tracking-tight hidden sm:inline">Naija Safety</span>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <Languages className="text-slate-400 w-4 h-4 hidden xs:inline" />
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[100px] h-9 bg-slate-800 border-slate-700 text-white text-xs">
              <SelectValue placeholder="Lang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Igbo">Igbo</SelectItem>
              <SelectItem value="Hausa">Hausa</SelectItem>
              <SelectItem value="Yoruba">Yoruba</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="Mandarin">Mandarin</SelectItem>
              <SelectItem value="German">German</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="Italian">Italian</SelectItem>
              <SelectItem value="Arabic">Arabic</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-widest hidden lg:inline">State:</span>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-[120px] h-9 bg-slate-800 border-slate-700 text-white text-xs">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Anambra">Anambra</SelectItem>
              <SelectItem value="Lagos">Lagos</SelectItem>
              <SelectItem value="Abuja">Abuja</SelectItem>
              <SelectItem value="Kano">Kano</SelectItem>
              <SelectItem value="Rivers">Rivers</SelectItem>
              <SelectItem value="Delta">Delta</SelectItem>
              <SelectItem value="Enugu">Enugu</SelectItem>
              <SelectItem value="Kaduna">Kaduna</SelectItem>
              <SelectItem value="Oyo">Oyo</SelectItem>
              <SelectItem value="Borno">Borno</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <AccessibilitySettings />
      </div>
    </nav>
  );
};
