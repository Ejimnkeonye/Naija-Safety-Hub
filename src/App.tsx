import React from 'react';
import { useAuth } from '@/src/lib/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/src/lib/AuthContext';
import { StateProvider } from '@/src/lib/StateContext';
import { AccessibilityProvider } from '@/src/lib/AccessibilityContext';

// Components
import { Login } from '@/src/components/Login';
import { CitizenHome } from '@/src/components/CitizenHome';
import { ResponderDashboard } from '@/src/components/ResponderDashboard';
import { AdminDashboard } from '@/src/components/AdminDashboard';
import { LoadingScreen } from '@/src/components/LoadingScreen';
import { Navbar } from '@/src/components/Navbar';

function AppContent() {
  const { user, profile, loading, isAuthReady } = useAuth();

  if (!isAuthReady || loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Login />;
  }

  if (!profile) {
    // This handles the case where user is logged in but profile isn't created yet
    // Usually we'd redirect to a "Finish Profile" page
    return <Login isNewUser />;
  }

  switch (profile.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Responder':
      return <ResponderDashboard />;
    case 'Citizen':
    default:
      return <CitizenHome />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <StateProvider>
        <AccessibilityProvider>
          <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />
            <AppContent />
            <Toaster position="top-center" />
          </div>
        </AccessibilityProvider>
      </StateProvider>
    </AuthProvider>
  );
}
