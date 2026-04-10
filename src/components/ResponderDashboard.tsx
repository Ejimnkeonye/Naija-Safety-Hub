import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/lib/AuthContext';
import { useGlobalState } from '@/src/lib/StateContext';
import { db } from '@/src/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Incident } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Clock, Phone, CheckCircle, Navigation, LogOut, Map as MapIcon } from 'lucide-react';
import { auth } from '@/src/lib/firebase';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { MapComponent } from './MapComponent';

export const ResponderDashboard = () => {
  const { profile } = useAuth();
  const { selectedState } = useGlobalState();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.agency_id && profile?.role !== 'Responder') return;

    // In a real app, we'd filter by agency_id
    // For this demo, we'll show all incidents in the selected state
    const q = query(
      collection(db, 'incidents'),
      where('state', '==', selectedState),
      where('status', 'in', ['New', 'Acknowledged', 'En route'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident));
      setIncidents(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile, selectedState]);

  const updateStatus = async (incidentId: string, newStatus: Incident['status']) => {
    try {
      await updateDoc(doc(db, 'incidents', incidentId), {
        status: newStatus,
        updated_at: serverTimestamp()
      });
      
      await addDoc(collection(db, 'incidentUpdates'), {
        incident_id: incidentId,
        user_id: profile?.uid,
        status: newStatus,
        note: `Status updated to ${newStatus} by responder.`,
        created_at: serverTimestamp()
      });

      toast.success(`Status updated to ${newStatus}`);
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident({ ...selectedIncident, status: newStatus });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Acknowledged': return 'bg-amber-100 text-amber-700';
      case 'En route': return 'bg-purple-100 text-purple-700';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (selectedIncident) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 max-w-md mx-auto shadow-xl">
        <header className="p-4 bg-white border-b flex items-center justify-between sticky top-0 z-10">
          <Button variant="ghost" onClick={() => setSelectedIncident(null)}>Back</Button>
          <h1 className="font-bold">Incident Detail</h1>
          <div />
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{selectedIncident.incident_type}</CardTitle>
              <Badge className={getStatusColor(selectedIncident.status)}>{selectedIncident.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">{selectedIncident.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin size={16} />
                  <span>{selectedIncident.lga}, {selectedIncident.state}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={16} />
                  <span>{selectedIncident.created_at?.toDate ? format(selectedIncident.created_at.toDate(), 'PPpp') : 'Just now'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-16 flex flex-col gap-1 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
              onClick={() => updateStatus(selectedIncident.id, 'Acknowledged')}
              disabled={selectedIncident.status === 'Acknowledged'}
            >
              <CheckCircle size={20} />
              <span>Acknowledge</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex flex-col gap-1 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
              onClick={() => updateStatus(selectedIncident.id, 'En route')}
              disabled={selectedIncident.status === 'En route'}
            >
              <Navigation size={20} />
              <span>En Route</span>
            </Button>
            <Button 
              className="h-16 flex flex-col gap-1 bg-emerald-600 hover:bg-emerald-700 text-white col-span-2"
              onClick={() => updateStatus(selectedIncident.id, 'Resolved')}
            >
              <CheckCircle size={20} />
              <span>Mark Resolved</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-md mx-auto shadow-xl">
      <header className="p-4 bg-slate-900 text-white flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold">Responder Panel</h1>
          <p className="text-xs text-slate-400">Agency: {profile?.agency_id || 'State Command'}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => auth.signOut()}>
          <LogOut size={20} />
        </Button>
      </header>

      <Tabs defaultValue="active" className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none bg-white border-b h-12">
          <TabsTrigger value="active" className="flex-1">Active ({incidents.length})</TabsTrigger>
          <TabsTrigger value="map" className="flex-1">Map View</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
          {loading ? (
            <div className="text-center py-10">Loading incidents...</div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-20 text-slate-500">No active incidents in your area.</div>
          ) : (
            incidents.map(incident => (
              <Card key={incident.id} className="cursor-pointer hover:border-slate-400 transition-colors" onClick={() => setSelectedIncident(incident)}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{incident.incident_type}</h3>
                    <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-1">{incident.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{incident.lga}</span>
                    </div>
                    <span>{incident.created_at?.toDate ? format(incident.created_at.toDate(), 'h:mm a') : 'Now'}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="map" className="flex-1 m-0">
          <MapComponent 
            markers={incidents.filter(inc => inc.location).map(inc => ({
              id: inc.id,
              position: [inc.location.latitude, inc.location.longitude],
              title: inc.incident_type,
              description: inc.description,
              status: inc.status
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
