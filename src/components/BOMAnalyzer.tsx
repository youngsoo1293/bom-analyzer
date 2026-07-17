import React, { useState } from 'react';
import { Upload, ArrowRight, CheckCircle2, AlertTriangle, MinusCircle, PlusCircle, RefreshCcw, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BOMDiff } from '../types';

export function BOMAnalyzer() {
  const [oldFile, setOldFile] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [results, setResults] = useState<BOMDiff[] | null>(null);

  const simulateComparison = () => {
    setIsComparing(true);
    // Simulate API delay
    setTimeout(async () => {
      const mockResults: BOMDiff[] = [
        { status: 'changed', refDes: 'Q101', oldPart: 'IRF540N', newPart: 'IRF540NPBF', description: 'Upgraded to Pb-free' },
        { status: 'added', refDes: 'C205', partNumber: 'GRM188R71H104KA93D', description: 'Bypass cap added for noise' },
        { status: 'deleted', refDes: 'R302', partNumber: 'ERJ-3EKF1002V', description: 'Redundant pull-up' },
        { status: 'changed', refDes: 'U1', oldPart: 'TPS54331', newPart: 'TPS54332', description: 'Increased current headroom' },
      ];
      setResults(mockResults);
      setIsComparing(false);

      // Automatically save to history
      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'bom',
            title: `[BOM Tracker] Analysis: ${newFile}`,
            data: mockResults
          }),
        });
      } catch (e) {
        console.error("Failed to auto-save history");
      }
    }, 1200);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'added': return { 
        icon: <PlusCircle className="w-4 h-4 text-emerald-500" />, 
        label: 'ADDED (추가)', 
        color: 'text-emerald-700 bg-emerald-50 border-emerald-100' 
      };
      case 'deleted': return { 
        icon: <MinusCircle className="w-4 h-4 text-rose-500" />, 
        label: 'DELETED (삭제)', 
        color: 'text-rose-700 bg-rose-50 border-rose-100' 
      };
      case 'changed': return { 
        icon: <RefreshCcw className="w-4 h-4 text-blue-500" />, 
        label: 'CHANGED (수정)', 
        color: 'text-blue-700 bg-blue-50 border-blue-100' 
      };
      default: return { icon: null, label: '', color: '' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Old BOM Upload */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Upload className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Old Version (Base)</h3>
          <p className="text-xs text-slate-500 mb-4">Upload baseline Excel/CSV</p>
          <input 
            type="file" 
            id="old-bom" 
            className="hidden" 
            onChange={(e) => setOldFile(e.target.files?.[0]?.name || null)} 
          />
          <label 
            htmlFor="old-bom"
            className="inline-block px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            {oldFile || 'Select File'}
          </label>
        </div>

        {/* New BOM Upload */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Upload className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">New Version (Current)</h3>
          <p className="text-xs text-slate-500 mb-4">Upload updated Excel/CSV</p>
          <input 
            type="file" 
            id="new-bom" 
            className="hidden" 
            onChange={(e) => setNewFile(e.target.files?.[0]?.name || null)} 
          />
          <label 
            htmlFor="new-bom"
            className="inline-block px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            {newFile || 'Select File'}
          </label>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={simulateComparison}
          disabled={!oldFile || !newFile || isComparing}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg shadow-slate-200 active:scale-95"
        >
          {isComparing ? (
            <>
              <RefreshCcw className="w-5 h-5 animate-spin" />
              Analyzing Changes...
            </>
          ) : (
            <>
              Compare BOMs
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Change Log</h2>
                <p className="text-sm text-slate-500">Detected {results.length} structural modifications</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                <Save className="w-4 h-4" />
                Export Report
              </button>
            </div>
            
            <div className="divide-y divide-slate-50">
              {results.map((diff, idx) => {
                const info = getStatusInfo(diff.status);
                return (
                  <div key={`${diff.refDes}-${idx}`} className="p-4 flex items-start gap-4 transition-colors hover:bg-slate-50">
                    <div className={`mt-1 p-2 rounded-lg border flex items-center gap-2 min-w-[120px] ${info.color}`}>
                      {info.icon}
                      <span className="text-[10px] font-bold uppercase tracking-wider">{info.label}</span>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 pl-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Component ID (부품 위치)</span>
                        <span className="text-sm font-bold text-slate-900">{diff.refDes}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Modification Details</span>
                        <div className="flex items-center gap-3">
                          {diff.status === 'changed' ? (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-slate-400 line-through">{diff.oldPart}</span>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className="text-blue-600 font-bold">{diff.newPart}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-slate-900">{diff.partNumber}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{diff.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
