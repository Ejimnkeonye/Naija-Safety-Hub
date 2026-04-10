import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Flame, Waves, HeartPulse, ShieldAlert, Car, HelpCircle, MapPin, Phone, CheckCircle2, Zap, Wind, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/src/lib/AuthContext';
import { useGlobalState } from '@/src/lib/StateContext';
import { toast } from 'sonner';
import { queueIncident } from '@/src/lib/offlineSync';

const EMERGENCY_TYPES = [
  { id: 'Fire', icon: <Flame />, color: 'bg-orange-100 text-orange-600', tip: 'Stay low, cover your nose, and exit immediately.' },
  { id: 'Flood', icon: <Waves />, color: 'bg-blue-100 text-blue-600', tip: 'Move to higher ground. Avoid walking or driving through floodwaters.' },
  { id: 'Medical', icon: <HeartPulse />, color: 'bg-red-100 text-red-600', tip: 'Keep the person calm. Do not move them unless they are in immediate danger.' },
  { id: 'Security', icon: <ShieldAlert />, color: 'bg-slate-100 text-slate-600', tip: 'Find a safe place to hide. Silence your phone.' },
  { id: 'Road Crash', icon: <Car />, color: 'bg-amber-100 text-amber-600', tip: 'Do not move injured persons. Warn oncoming traffic if safe.' },
  { id: 'Power Outage', icon: <Zap />, color: 'bg-yellow-100 text-yellow-600', tip: 'Unplug sensitive electronics. Keep refrigerator doors closed.' },
  { id: 'Wind Storm', icon: <Wind />, color: 'bg-indigo-100 text-indigo-600', tip: 'Stay indoors away from windows. Watch for falling debris.' },
  { id: 'Building Collapse', icon: <AlertTriangle />, color: 'bg-stone-100 text-stone-600', tip: 'If trapped, tap on a pipe or wall so rescuers can find you.' },
  { id: 'Other', icon: <HelpCircle />, color: 'bg-purple-100 text-purple-600', tip: 'Stay calm and wait for instructions from emergency operators.' },
];

export const EmergencyFlow = ({ onBack }: { onBack: () => void }) => {
  const { profile } = useAuth();
  const { selectedState } = useGlobalState();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setIsLocating(false);
        toast.success("Location captured!");
      },
      (error) => {
        console.error(error);
        setIsLocating(false);
        toast.error("Failed to get location. Please ensure GPS is on.");
      }
    );
  };

  const handleReport = async () => {
    if (!auth.currentUser || !type) return;
    setLoading(true);
    
    const incidentData = {
      reporter_id: auth.currentUser.uid,
      incident_type: type.id,
      description: `Emergency ${type.id} reported via quick help button.`,
      state: selectedState,
      lga: profile?.lga || '',
      status: 'New',
      location: location,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    try {
      if (navigator.onLine) {
        await addDoc(collection(db, 'incidents'), incidentData);
        toast.success("Incident reported! Help is on the way.");
      } else {
        await queueIncident(incidentData);
      }
      setStep(3);
    } catch (error) {
      console.error(error);
      // Fallback to offline queue if network fails during submission
      try {
        await queueIncident(incidentData);
        setStep(3);
      } catch (queueError) {
        toast.error("Failed to submit report even offline.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="p-4 border-bottom flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">Emergency Help</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-slate-900">What kind of emergency?</h2>
              <div className="grid grid-cols-2 gap-4">
                {EMERGENCY_TYPES.map((t) => (
                  <Button
                    key={t.id}
                    onClick={() => { setType(t); setStep(2); }}
                    className={`h-32 flex flex-col gap-2 rounded-2xl border-none shadow-sm ${t.color} hover:opacity-90`}
                  >
                    <div className="scale-150 mb-2">{t.icon}</div>
                    <span className="font-bold">{t.id}</span>
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-2xl ${type.color} flex flex-col items-center text-center gap-2`}>
                <div className="scale-150 mb-2">{type.icon}</div>
                <h2 className="text-2xl font-bold">{type.id} Emergency</h2>
                <p className="font-medium opacity-90">{type.tip}</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-emerald-600" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-emerald-900">Incident Location</p>
                      <p className="text-xs text-emerald-700">
                        {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : "Not captured yet"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white border-emerald-200 text-emerald-700"
                    onClick={captureLocation}
                    disabled={isLocating}
                  >
                    {isLocating ? "Locating..." : location ? "Update" : "Capture"}
                  </Button>
                </div>

                <h3 className="font-bold text-slate-900">Emergency Contacts ({selectedState})</h3>
                <div className="space-y-2">
                  <ContactItem label="Police" number="112" />
                  <ContactItem label="Fire Service" number="0803 000 0000" />
                  <ContactItem label="Ambulance" number="997" />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button 
                  onClick={handleReport}
                  disabled={loading}
                  className="w-full h-14 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-xl"
                >
                  {loading ? "Reporting..." : "Report Incident Now"}
                </Button>
                <p className="text-center text-xs text-slate-500">
                  Reporting will share your location with responders.
                </p>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-6"
            >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={64} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Report Submitted</h2>
                <p className="text-slate-600">Responders in {selectedState} have been notified. Stay where you are if it's safe.</p>
              </div>
              <Button onClick={onBack} variant="outline" className="w-full">
                Back to Home
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ContactItem = ({ label, number }: { label: string, number: string }) => (
  <a href={`tel:${number}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 active:bg-slate-100">
    <div>
      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{label}</p>
      <p className="text-lg font-bold text-slate-900">{number}</p>
    </div>
    <div className="p-2 bg-emerald-500 text-white rounded-full">
      <Phone size={18} />
    </div>
  </a>
);
