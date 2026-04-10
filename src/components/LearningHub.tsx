import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, CheckCircle, ChevronRight, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/lib/AuthContext';
import { useGlobalState } from '@/src/lib/StateContext';
import { db } from '@/src/lib/firebase';
import { collection, query, where, onSnapshot, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ContentModule, Lesson } from '../types';
import { toast } from 'sonner';

export const LearningHub = ({ onBack }: { onBack: () => void }) => {
  const { profile } = useAuth();
  const { selectedState, language } = useGlobalState();
  const [modules, setModules] = useState<ContentModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<ContentModule | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'contentModules'),
      where('state', 'in', [selectedState, 'GLOBAL']),
      where('language', '==', language)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContentModule));
      setModules(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedState]);

  const fetchLessons = async (moduleId: string) => {
    setLoading(true);
    const q = query(collection(db, 'lessons'), where('module_id', '==', moduleId));
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson));
    setLessons(docs.sort((a, b) => a.order_index - b.order_index));
    setLoading(false);
  };

  const handleModuleClick = (mod: ContentModule) => {
    setSelectedModule(mod);
    fetchLessons(mod.id);
  };

  const markCompleted = async () => {
    if (!profile || !selectedLesson) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'userLessonProgress'), {
        user_id: profile.uid,
        lesson_id: selectedLesson.id,
        completed: true,
        completed_at: serverTimestamp()
      });
      toast.success("Lesson completed!");
      setSelectedLesson(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="p-4 bg-white border-b flex items-center gap-4 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={selectedLesson ? () => setSelectedLesson(null) : selectedModule ? () => setSelectedModule(null) : onBack}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">
          {selectedLesson ? 'Lesson' : selectedModule ? selectedModule.title : 'Learning Hub'}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {!selectedModule ? (
            <motion.div 
              key="modules"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {loading ? (
                <div className="text-center py-10 text-slate-500">Loading modules...</div>
              ) : modules.map(module => (
                <Card key={module.id} className="cursor-pointer hover:bg-white active:scale-[0.98] transition-all" onClick={() => handleModuleClick(module)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{module.title}</h3>
                        <p className="text-xs text-slate-500">{module.category} • {module.language}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300" />
                  </CardContent>
                </Card>
              ))}
              {!loading && modules.length === 0 && (
                <div className="text-center py-10 text-slate-500">No {language} modules found for {selectedState}.</div>
              )}
            </motion.div>
          ) : !selectedLesson ? (
            <motion.div 
              key="lessons"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="mb-6">
                <p className="text-slate-600">{selectedModule.summary}</p>
              </div>
              <div className="space-y-2">
                {loading ? (
                  <div className="text-center py-10 text-slate-500">Loading lessons...</div>
                ) : lessons.map((lesson: any, idx: number) => (
                  <Button
                    key={lesson.id}
                    variant="ghost"
                    className="w-full justify-between h-16 bg-white border border-slate-100 rounded-xl px-4"
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-700">{lesson.title}</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </Button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="lesson-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl">{selectedLesson.title}</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate">
                  <p className="text-lg leading-relaxed text-slate-700">
                    {selectedLesson.body}
                  </p>
                </CardContent>
              </Card>
              <Button 
                onClick={markCompleted}
                disabled={loading}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2"
              >
                <CheckCircle size={20} />
                {loading ? "Saving..." : "Mark as Completed"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
