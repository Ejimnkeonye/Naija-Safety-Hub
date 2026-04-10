import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/lib/AuthContext';
import { useGlobalState } from '@/src/lib/StateContext';
import { db } from '@/src/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Incident } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export const MyReports = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const { selectedState } = useGlobalState();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'incidents'),
      where('reporter_id', '==', user.uid),
      where('state', '==', selectedState),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident));
      setIncidents(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, selectedState]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Acknowledged': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'En route': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="p-4 bg-white border-b flex items-center gap-4 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">My Reports</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading reports...</div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="flex justify-center">
              <AlertTriangle size={48} className="text-slate-300" />
            </div>
            <p className="text-slate-500">You haven't reported any incidents yet.</p>
          </div>
        ) : (
          incidents.map((incident) => (
            <Card key={incident.id} className="overflow-hidden border-slate-200 shadow-sm">
              <CardHeader className="p-4 bg-white border-b flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-bold text-slate-900">
                  {incident.incident_type}
                </CardTitle>
                <Badge className={getStatusColor(incident.status)} variant="outline">
                  {incident.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3 bg-white">
                <p className="text-sm text-slate-600 line-clamp-2">
                  {incident.description}
                </p>
                <div className="flex flex-col gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{incident.lga}, {incident.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>
                      {incident.created_at?.toDate ? 
                        format(incident.created_at.toDate(), 'MMM d, yyyy • h:mm a') : 
                        'Just now'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
