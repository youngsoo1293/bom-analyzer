import React, { useState } from 'react';
import { Header } from './components/Header';
import { SpecMatrix } from './components/SpecMatrix';
import { BOMAnalyzer } from './components/BOMAnalyzer';
import { HistoryLogs } from './components/HistoryLogs';
import { History, Layout, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('specs');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'specs' && <SpecMatrix />}
            {activeTab === 'bom' && <BOMAnalyzer />}
            {activeTab === 'history' && <HistoryLogs />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-slate-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-400 font-medium tracking-widest uppercase">
            Built for Smart Engineering Operations
          </p>
          <div className="flex justify-center gap-6 mt-4">
             <span className="text-[10px] text-slate-300 font-bold uppercase">v1.0.0 Stable</span>
             <span className="text-[10px] text-slate-300 font-bold uppercase">Security Tier: Restricted</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
