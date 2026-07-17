import React, { useEffect, useState } from 'react';
import { History, Clock, FileText, ChevronRight, Tag, X, CheckCircle2, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HistoryEntry, ComponentData, BOMDiff } from '../types';

export function HistoryLogs() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history');
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const renderDetail = (entry: HistoryEntry) => {
    if (entry.type === 'comparison') {
      const components = entry.data as ComponentData[];
      return (
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-canvas-parchment">
                <th className="p-4 text-[12px] font-semibold text-ink/40 uppercase tracking-widest">Parameter</th>
                {components.map(c => (
                  <th key={c.partNumber} className="p-4 text-[14px] font-semibold text-ink">{c.partNumber}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {['maxVoltage', 'rdsOn', 'switchingTimeRise', 'switchingTimeFall', 'package'].map(key => (
                <tr key={key}>
                  <td className="p-4 text-[14px] text-ink/60 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                  {components.map(c => (
                    <td key={c.partNumber} className="p-4 text-[14px] text-ink">{(c.specs as any)[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      const diffs = entry.data as BOMDiff[];
      return (
        <div className="grid grid-cols-1 gap-3">
          {diffs.map((diff, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-canvas-parchment/50 rounded-[18px] border border-gray-100">
              <div className="flex items-center gap-4">
                <span className="text-[14px] font-semibold text-ink w-16">{diff.refDes}</span>
                <span className="text-[14px] text-ink/60">
                  {diff.status === 'changed' ? (
                    <span className="flex items-center gap-2">
                      <span className="line-through text-ink/20">{diff.oldPart}</span>
                      <ArrowRight className="w-3 h-3 opacity-20" />
                      <span className="text-primary font-medium">{diff.newPart}</span>
                    </span>
                  ) : diff.partNumber}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                diff.status === 'added' ? 'bg-emerald-50 text-emerald-600' : 
                diff.status === 'deleted' ? 'bg-rose-50 text-rose-600' : 'bg-primary/5 text-primary'
              }`}>
                {diff.status}
              </span>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="w-full">
      <section className="apple-tile bg-canvas px-4">
        <div className="max-w-[980px] w-full">
          <h2 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-[1.07] mb-4">
            Archive of Insight.
          </h2>
          <p className="text-[21px] md:text-[28px] text-ink/60 mb-12 max-w-2xl mx-auto">
            Review previous spec matrices and BOM evolution logs stored securely in your project's local vault.
          </p>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : history.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto w-full">
              {history.map((entry) => (
                <motion.div
                  key={entry.id}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedEntry(entry)}
                  className="bg-canvas-parchment rounded-[24px] p-8 border border-transparent hover:border-gray-200 transition-all cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center ${entry.type === 'bom' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    {entry.type === 'bom' ? <FileText className="w-6 h-6" /> : <Tag className="w-6 h-6" />}
                  </div>
                  <h3 className="text-[21px] font-semibold mb-2 group-hover:text-primary transition-colors">{entry.title}</h3>
                  <div className="flex items-center gap-3 text-ink/40">
                    <div className="flex items-center gap-1 text-[12px] font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                    <div className="w-1 h-1 bg-ink/10 rounded-full" />
                    <span className="text-[12px] font-bold uppercase tracking-widest">
                      {entry.type === 'bom' ? 'BOM Tracker' : 'Spec Matrix'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 opacity-20">
              <History className="w-20 h-20 mx-auto mb-6" />
              <p className="text-[21px] font-medium">Archive is empty.</p>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md" 
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-canvas-parchment">
                <div>
                  <h3 className="text-[21px] font-semibold">{selectedEntry.title}</h3>
                  <p className="text-[12px] text-ink/40 font-medium tracking-tight">Record from {new Date(selectedEntry.timestamp).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-ink/40" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto">
                {renderDetail(selectedEntry)}
              </div>
              <div className="px-8 py-6 border-t border-gray-100 flex justify-end bg-canvas-parchment">
                <button onClick={() => setSelectedEntry(null)} className="apple-button-primary">Done</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
