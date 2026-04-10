import React, { useState } from 'react';
import { useAuth } from '@/src/lib/AuthContext';
import { useGlobalState } from '@/src/lib/StateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, BookOpen, Building2, ClipboardList, LogOut, MapPin, Phone } from 'lucide-react';
import { auth } from '@/src/lib/firebase';
import { motion } from 'motion/react';
import { EmergencyFlow } from '@/src/components/EmergencyFlow';
import { MyReports } from '@/src/components/MyReports';
import { LearningHub } from '@/src/components/LearningHub';
import { AgencyDirectory } from '@/src/components/AgencyDirectory';

export const CitizenHome = () => {
  const { profile } = useAuth();
  const { selectedState } = useGlobalState();
  const [activeView, setActiveView] = useState<'home' | 'emergency' | 'learn' | 'agencies' | 'reports'>('home');

  const renderView = () => {
    switch (activeView) {
      case 'emergency': return <EmergencyFlow onBack={() => setActiveView('home')} />;
      case 'reports': return <MyReports onBack={() => setActiveView('home')} />;
      case 'learn': return <LearningHub onBack={() => setActiveView('home')} />;
      case 'agencies': return <AgencyDirectory onBack={() => setActiveView('home')} />;
      default: return (
        <div className="p-4 space-y-6">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Hello, {profile?.full_name?.split(' ')[0]}</h1>
              <div className="flex items-center text-slate-500 text-sm mt-1">
                <MapPin size={14} className="mr-1" />
                {selectedState}, Nigeria
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => auth.signOut()}>
              <LogOut size={20} className="text-slate-500" />
            </Button>
          </header>

          <section>
            <Button 
              onClick={() => setActiveView('emergency')}
              className="w-full h-32 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-red-200"
            >
              <AlertCircle size={40} />
              <span className="text-xl font-bold uppercase tracking-wider">I Need Help Now</span>
            </Button>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <MenuCard 
              icon={<BookOpen className="text-emerald-600" />} 
              title="Learn" 
              description="Safety tips & lessons"
              onClick={() => setActiveView('learn')}
            />
            <MenuCard 
              icon={<Building2 className="text-blue-600" />} 
              title="Agencies" 
              description="Know your responders"
              onClick={() => setActiveView('agencies')}
            />
            <MenuCard 
              icon={<ClipboardList className="text-amber-600" />} 
              title="My Reports" 
              description="Track your incidents"
              onClick={() => setActiveView('reports')}
            />
          </div>

          <section className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <h3 className="font-bold text-emerald-900 mb-1">Safety Tip of the Day</h3>
            <p className="text-sm text-emerald-800">
              In case of a fire, stay low to the ground where the air is cleaner. Use the back of your hand to feel doors for heat before opening.
            </p>
          </section>
        </div>
      );
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl">
      {renderView()}
    </div>
  );
};

const MenuCard = ({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick: () => void }) => (
  <motion.div whileTap={{ scale: 0.95 }} onClick={onClick}>
    <Card className="cursor-pointer hover:bg-slate-50 transition-colors border-slate-100">
      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
        <div className="p-3 rounded-xl bg-slate-50">
          {icon}
        </div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 leading-tight">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);
