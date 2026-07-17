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
    <div className="min-h-screen bg-canvas font-sans text-ink">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {activeTab === 'specs' && <SpecMatrix />}
            {activeTab === 'bom' && <BOMAnalyzer />}
            {activeTab === 'history' && <HistoryLogs />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-canvas-parchment pt-16 pb-24 border-t border-gray-200">
        <div className="max-w-[980px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-200">
            <div>
              <h4 className="text-[12px] font-semibold mb-3">Resources</h4>
              <ul className="space-y-2">
                {['Documentation', 'API Reference', 'Component Library', 'Design Guidelines'].map(link => (
                  <li key={link} className="text-[12px] text-ink/60 hover:underline cursor-pointer">{link}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold mb-3">Security</h4>
              <ul className="space-y-2">
                {['Local Storage', 'Encryption', 'Access Control', 'Restricted Network'].map(link => (
                  <li key={link} className="text-[12px] text-ink/60 hover:underline cursor-pointer">{link}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold mb-3">Team</h4>
              <ul className="space-y-2">
                {['Firepower Sys 3', 'Operations', 'Maintenance', 'Contact'].map(link => (
                  <li key={link} className="text-[12px] text-ink/60 hover:underline cursor-pointer">{link}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold mb-3">Account</h4>
              <ul className="space-y-2">
                {['Manage Profile', 'Settings', 'Archive Access'].map(link => (
                  <li key={link} className="text-[12px] text-ink/60 hover:underline cursor-pointer">{link}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 space-y-4">
            <p className="text-[12px] text-ink/40 leading-relaxed">
              * Smart BOM Analyzer is an internal engineering tool. All data is stored locally within the project container to comply with secure network protocols. Components are identified by their unique reference designators and manufacturer part numbers.
            </p>
            <div className="flex flex-col md:flex-row justify-between gap-4 pt-4 border-t border-gray-200/50">
              <p className="text-[12px] text-ink/40">Copyright © 2026 Firepower Systems Team 3. All rights reserved.</p>
              <div className="flex gap-4 text-[12px] text-ink/60">
                <span className="hover:underline cursor-pointer">Privacy Policy</span>
                <span className="hover:underline cursor-pointer">Terms of Use</span>
                <span className="hover:underline cursor-pointer">Site Map</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
