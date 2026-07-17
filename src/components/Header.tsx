import React from 'react';
import { Apple, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const [showContact, setShowContact] = React.useState(false);
  const tabs = [
    { id: 'specs', label: 'Spec Matrix' },
    { id: 'bom', label: 'BOM Tracker' },
    { id: 'history', label: 'History Logs' },
  ];

  return (
    <div className="flex flex-col w-full sticky top-0 z-[100]">
      {/* Global Nav */}
      <nav className="bg-black/90 backdrop-blur-md h-11 flex items-center justify-center px-4 w-full">
        <div className="max-w-[980px] w-full flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Apple className="w-4 h-4 text-white/80 hover:text-white cursor-pointer transition-colors" />
          </div>
          <div className="flex items-center gap-6">
            <Search className="w-4 h-4 text-white/70" />
          </div>
        </div>
      </nav>

      {/* Sub Nav */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 h-14 flex items-center justify-center px-4 w-full">
        <div className="max-w-[980px] w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-[21px] font-semibold tracking-tight text-ink">Smart BOM Analyzer</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-[12px] transition-colors relative py-1 ${
                    activeTab === tab.id 
                      ? 'text-ink font-medium' 
                      : 'text-ink/60 hover:text-primary'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="subnav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-[1px] bg-ink"
                    />
                  )}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowContact(true)}
              className="bg-primary text-white text-[12px] font-normal px-3 py-1 rounded-full hover:bg-primary-focus transition-all active:scale-95"
            >
              System Support
            </button>
          </div>
        </div>
      </nav>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContact && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContact(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[24px] shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Apple className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-[21px] font-semibold mb-1">System Support</h3>
              <p className="text-[14px] text-ink/60 mb-8">Firepower Systems Team 3 Admin</p>
              
              <div className="space-y-4 text-left bg-canvas-parchment p-6 rounded-2xl mb-8">
                <div>
                  <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest mb-1">Administrator</p>
                  <p className="text-[17px] font-semibold text-ink">김한화 (Hanwha Kim)</p>
                </div>
                <div className="pt-4 border-t border-gray-200/50">
                  <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest mb-1">Phone</p>
                  <a href="tel:010-1234-5678" className="text-[17px] font-medium text-primary hover:underline">010-1234-5678</a>
                </div>
                <div className="pt-4 border-t border-gray-200/50">
                  <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest mb-1">Email</p>
                  <a href="mailto:hanwha.kim@hanwha.com" className="text-[17px] font-medium text-primary hover:underline">hanwha.kim@hanwha.com</a>
                </div>
              </div>

              <button 
                onClick={() => setShowContact(false)}
                className="apple-button-primary w-full"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
