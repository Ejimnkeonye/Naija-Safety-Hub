import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Building2, Phone, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/src/lib/AuthContext';
import { useGlobalState } from '@/src/lib/StateContext';
import { db } from '@/src/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Agency } from '../types';

export const AgencyDirectory = ({ onBack }: { onBack: () => void }) => {
  const { profile } = useAuth();
  const { selectedState } = useGlobalState();
  const [search, setSearch] = useState('');
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'agencies'),
      where('state', '==', selectedState)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agency));
      setAgencies(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedState]);

  const filteredAgencies = agencies.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="p-4 bg-white border-b flex items-center gap-4 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">Know My Agencies</h1>
      </header>

      <div className="p-4 bg-white border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search agencies..." 
            className="pl-10 bg-slate-50 border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading agencies...</div>
        ) : filteredAgencies.map(agency => (
          <Card key={agency.id} className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{agency.name}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{agency.type}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600">{agency.description}</p>
              <div className="pt-2">
                <a href={`tel:${agency.primary_phone}`} className="block">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2 h-12 text-lg">
                    <Phone size={18} />
                    Call {agency.primary_phone}
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && filteredAgencies.length === 0 && (
          <div className="text-center py-10 text-slate-500">No agencies found for {selectedState}.</div>
        )}
      </div>
    </div>
  );
};
