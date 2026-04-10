import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/src/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useGlobalState } from '@/src/lib/StateContext';

export const Login = ({ isNewUser = false }: { isNewUser?: boolean }) => {
  const { selectedState } = useGlobalState();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(isNewUser ? 'profile' : 'login');
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    state: selectedState,
    role: 'Citizen' as const,
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, state: selectedState }));
  }, [selectedState]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        setStep('profile');
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        state: formData.state,
        role: formData.role,
        lga: '',
        language: 'English',
      });
      toast.success("Profile created successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  if (step === 'login') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
        <Card className="w-full max-w-md border-slate-800 bg-slate-950 text-white">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-emerald-500/10">
                <Shield className="w-12 h-12 text-emerald-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Naija Safety Hub</CardTitle>
            <CardDescription className="text-slate-400">
              Your safety, our priority. Sign in to access emergency services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleGoogleLogin} 
              disabled={loading}
              className="w-full h-12 text-lg font-medium bg-white text-slate-950 hover:bg-slate-100"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-950 text-white">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription className="text-slate-400">
            We need a few more details to provide better emergency assistance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                required
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="bg-slate-900 border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input 
                required
                placeholder="+234..."
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="bg-slate-900 border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Select 
                value={formData.state} 
                onValueChange={(val) => setFormData({ ...formData, state: val })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800">
                  <SelectValue placeholder="Select State" />
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
            <div className="space-y-2">
              <label className="text-sm font-medium">I am a...</label>
              <Select 
                value={formData.role} 
                onValueChange={(val: any) => setFormData({ ...formData, role: val })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Citizen">Citizen</SelectItem>
                  <SelectItem value="Responder">Responder</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Finish Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
