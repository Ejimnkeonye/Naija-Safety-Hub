import React from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

export const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
    <motion.div
      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="mb-4"
    >
      <Shield size={64} className="text-emerald-500" />
    </motion.div>
    <h1 className="text-2xl font-bold tracking-tight">Naija Safety Hub</h1>
    <p className="text-slate-400 mt-2">Securing our communities...</p>
  </div>
);
