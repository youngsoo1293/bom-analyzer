import React, { useEffect, useState } from 'react';
import { History, Clock, FileText, ChevronRight, Tag, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-3 text-xs font-bold text-slate-500 uppercase">Parameter</th>
                {components.map(c => (
                  <th key={c.partNumber} className="p-3 text-sm font-bold text-slate-900">{c.partNumber}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {['maxVoltage', 'rdsOn', 'switchingTimeRise', 'switchingTimeFall', 'package'].map(key => (
                <tr key={key}>
                  <td className="p-3 text-xs font-medium text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                  {components.map(c => (
                    <td key={c.partNumber} className="p-3 text-sm text-slate-700">{(c.specs as any)[key]}</td>
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
        <div className="space-y-3">
          {diffs.map((diff, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-900 w-12">{diff.refDes}</span>
                <span className="text-xs text-slate-500">
                  {diff.status === 'changed' ? `${diff.oldPart} → ${diff.newPart}` : diff.partNumber}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                diff.status === 'added' ? 'bg-emerald-100 text-emerald-700' : 
                diff.status === 'deleted' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {diff.status}
              </span>
            </div>
          ))}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Historical Archive</h2>
          <p className="text-slate-500">Secure record of engineering decisions and BOM evolutions</p>
        </div>
        <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold tracking-widest uppercase">
          Firepower System 3
        </div>
      </div>

      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedEntry(entry)}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl ${entry.type === 'bom' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {entry.type === 'bom' ? <FileText className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{entry.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold uppercase tracking-tighter">
                        {entry.type === 'bom' ? 'BOM Tracker' : 'Spec Matrix'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {entry.type === 'bom' ? `${entry.data.length} changes detected` : `${entry.data.length} parts compared`}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-slate-900 font-bold">No history logs yet</h3>
          <p className="text-slate-400 text-sm mt-1">Compare components or BOMs to start generating records</p>
        </div>
      )}

      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedEntry.title}</h3>
                  <p className="text-xs text-slate-500">{new Date(selectedEntry.timestamp).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                {renderDetail(selectedEntry)}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <button 
                  onClick={() => setSelectedEntry(null)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold"
                >
                  Close Archive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-6 bg-slate-900/5 border border-slate-900/10 rounded-2xl">
         <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
           Internal Security Note
         </h4>
         <p className="text-xs text-slate-500 leading-relaxed">
           This log is persistent within the project's local JSON database. For formal reporting, please use the 'Export Report' feature in the BOM Tracker tab to generate a PDF for the internal approval system.
         </p>
      </div>
    </div>
  );
}
