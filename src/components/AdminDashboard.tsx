import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/lib/AuthContext';
import { useGlobalState } from '@/src/lib/StateContext';
import { db, auth } from '@/src/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Incident, UserProfile, Agency } from '../types';
import { seedDatabase } from '../lib/seedData';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Users, Building2, BookOpen, Settings, LogOut, Download, Map as MapIcon, AlertTriangle, Globe, Menu, X } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapComponent } from './MapComponent';
import { motion, AnimatePresence } from 'motion/react';

export const AdminDashboard = () => {
  const { profile } = useAuth();
  const { selectedState } = useGlobalState();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const qIncidents = query(collection(db, 'incidents'), where('state', '==', selectedState));
    const unsubIncidents = onSnapshot(qIncidents, (snap) => {
      setIncidents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Incident)));
    });
    
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as any as UserProfile)));
    });

    const qAgencies = query(collection(db, 'agencies'), where('state', '==', selectedState));
    const unsubAgencies = onSnapshot(qAgencies, (snap) => {
      setAgencies(snap.docs.map(d => ({ id: d.id, ...d.data() } as Agency)));
      setLoading(false);
    });

    return () => {
      unsubIncidents();
      unsubUsers();
      unsubAgencies();
    };
  }, [selectedState]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDatabase();
      toast.success("Database seeded successfully!");
    } catch (error) {
      toast.error("Failed to seed database.");
    } finally {
      setSeeding(false);
    }
  };

  const statsData = [
    { name: 'Fire', value: incidents.filter(i => i.incident_type === 'Fire').length },
    { name: 'Flood', value: incidents.filter(i => i.incident_type === 'Flood').length },
    { name: 'Medical', value: incidents.filter(i => i.incident_type === 'Medical').length },
    { name: 'Security', value: incidents.filter(i => i.incident_type === 'Security').length },
    { name: 'Road Crash', value: incidents.filter(i => i.incident_type === 'Road Crash').length },
  ];

  const COLORS = ['#ef4444', '#3b82f6', '#f97316', '#6366f1', '#f59e0b'];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden relative">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-emerald-500">Naija Safety Admin</h1>
          <Button variant="ghost" size="icon" className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </Button>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
          />
          <SidebarItem 
            icon={<MapIcon size={20} />} 
            label="Map View" 
            active={activeTab === 'map'} 
            onClick={() => { setActiveTab('map'); setIsMobileMenuOpen(false); }}
          />
          <SidebarItem 
            icon={<AlertTriangle size={20} />} 
            label="Incidents" 
            active={activeTab === 'incidents'} 
            onClick={() => { setActiveTab('incidents'); setIsMobileMenuOpen(false); }}
          />
          <SidebarItem 
            icon={<Users size={20} />} 
            label="Users" 
            active={activeTab === 'users'} 
            onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }}
          />
          <SidebarItem 
            icon={<Building2 size={20} />} 
            label="Agencies" 
            active={activeTab === 'agencies'} 
            onClick={() => { setActiveTab('agencies'); setIsMobileMenuOpen(false); }}
          />
          <SidebarItem 
            icon={<BookOpen size={20} />} 
            label="Content" 
            active={activeTab === 'content'} 
            onClick={() => { setActiveTab('content'); setIsMobileMenuOpen(false); }}
          />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white" onClick={() => auth.signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </Button>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Admin Dashboard</h2>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding} className="flex-1 sm:flex-none">
              {seeding ? 'Seeding...' : 'Seed Demo Data'}
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 flex-1 sm:flex-none">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2 bg-transparent h-auto p-0 md:hidden">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white shadow-sm border">
              Overview
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-white shadow-sm border">
              Map
            </TabsTrigger>
            <TabsTrigger value="incidents" className="data-[state=active]:bg-white shadow-sm border">
              Incidents
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white shadow-sm border">
              Users
            </TabsTrigger>
            <TabsTrigger value="agencies" className="data-[state=active]:bg-white shadow-sm border">
              Agencies
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-white shadow-sm border">
              Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total Incidents" value={incidents.length} sub="Across all states" />
              <StatCard title="Active Responders" value={users.filter(u => u.role === 'Responder').length} sub="Verified personnel" />
              <StatCard title="Agencies" value={agencies.length} sub="Registered units" />
              <StatCard title="Citizens" value={users.filter(u => u.role === 'Citizen').length} sub="Registered users" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Incidents by Type</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Incident Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statsData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Live Incident Map</CardTitle>
              </CardHeader>
              <CardContent>
                <MapComponent 
                  markers={incidents.filter(inc => inc.location).map(inc => ({
                    id: inc.id,
                    position: [inc.location.latitude, inc.location.longitude],
                    title: inc.incident_type,
                    description: inc.description,
                    status: inc.status
                  }))}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents">
            <Card>
              <CardHeader>
                <CardTitle>All Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell className="font-medium">{incident.incident_type}</TableCell>
                        <TableCell>{incident.state}</TableCell>
                        <TableCell>
                          <Badge variant={incident.status === 'New' ? 'destructive' : 'default'}>
                            {incident.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{incident.created_at?.toDate ? format(incident.created_at.toDate(), 'MMM d, yyyy') : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.uid}>
                        <TableCell className="font-medium">{u.full_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.role}</Badge>
                        </TableCell>
                        <TableCell>{u.state}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agencies">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Agencies</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agencies.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell>{a.type}</TableCell>
                        <TableCell>{a.primary_phone}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Learning Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500 text-sm">Manage educational modules and safety lessons here.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <BookOpen />
                    <span>Manage Modules</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <Globe />
                    <span>Translations</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </div>
);

const StatCard = ({ title, value, sub }: { title: string, value: number, sub: string }) => (
  <Card>
    <CardContent className="p-6">
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </CardContent>
  </Card>
);
