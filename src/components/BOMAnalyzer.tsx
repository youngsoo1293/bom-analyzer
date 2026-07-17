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
    setTimeout(async () => {
      const mockResults: BOMDiff[] = [
        { status: 'changed', refDes: 'Q101', oldPart: 'IRF540N', newPart: 'IRF540NPBF', description: 'Upgraded to Pb-free' },
        { status: 'added', refDes: 'C205', partNumber: 'GRM188R71H104KA93D', description: 'Bypass cap added for noise' },
        { status: 'deleted', refDes: 'R302', partNumber: 'ERJ-3EKF1002V', description: 'Redundant pull-up' },
        { status: 'changed', refDes: 'U1', oldPart: 'TPS54331', newPart: 'TPS54332', description: 'Increased current headroom' },
      ];
      setResults(mockResults);
      setIsComparing(false);

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
        icon: <PlusCircle className="w-4 h-4" />, 
        label: 'ADDED', 
        color: 'text-emerald-600 bg-emerald-50' 
      };
      case 'deleted': return { 
        icon: <MinusCircle className="w-4 h-4" />, 
        label: 'DELETED', 
        color: 'text-rose-600 bg-rose-50' 
      };
      case 'changed': return { 
        icon: <RefreshCcw className="w-4 h-4" />, 
        label: 'CHANGED', 
        color: 'text-primary bg-primary/5' 
      };
      default: return { icon: null, label: '', color: '' };
    }
  };

  return (
    <div className="w-full">
      {/* Hero Tile */}
      <section className="apple-tile bg-canvas px-4">
        <div className="max-w-[980px] w-full">
          <h2 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-[1.07] mb-4">
            BOM Evolution.<br />Simplified.
          </h2>
          <p className="text-[21px] md:text-[28px] text-ink/60 mb-12 max-w-2xl mx-auto">
            Upload two versions of your bill of materials to automatically detect additions, deletions, and part updates.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto w-full">
            <div className="flex flex-col items-center">
              <input type="file" id="old-bom" className="hidden" onChange={(e) => setOldFile(e.target.files?.[0]?.name || null)} />
              <label htmlFor="old-bom" className="apple-button-secondary w-full text-center cursor-pointer flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                {oldFile || 'Baseline BOM'}
              </label>
              <p className="text-[12px] text-ink/40 mt-2 font-medium">Select original version</p>
            </div>
            <div className="flex flex-col items-center">
              <input type="file" id="new-bom" className="hidden" onChange={(e) => setNewFile(e.target.files?.[0]?.name || null)} />
              <label htmlFor="new-bom" className="apple-button-secondary w-full text-center cursor-pointer flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                {newFile || 'Updated BOM'}
              </label>
              <p className="text-[12px] text-ink/40 mt-2 font-medium">Select current version</p>
            </div>
          </div>

          <button
            onClick={simulateComparison}
            disabled={!oldFile || !newFile || isComparing}
            className="apple-button-primary mt-12 px-10 py-4 shadow-2xl shadow-primary/20"
          >
            {isComparing ? 'Analyzing Changes...' : 'Compare BOMs'}
          </button>
        </div>
      </section>

      {/* Results Tile */}
      <AnimatePresence>
        {results && (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-canvas-parchment py-16 px-4"
          >
            <div className="max-w-[980px] mx-auto">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <span className="text-[14px] font-semibold text-primary uppercase tracking-widest block mb-2">Analysis Results</span>
                  <h3 className="text-[34px] font-semibold tracking-tight">Modification Log</h3>
                </div>
                <button className="text-primary text-[14px] font-medium hover:underline flex items-center gap-1 mb-1">
                  Export Report <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-4">
                {results.map((diff, idx) => {
                  const info = getStatusInfo(diff.status);
                  return (
                    <motion.div 
                      key={`${diff.refDes}-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-[18px] p-6 border border-gray-200/50 flex flex-col md:flex-row md:items-center gap-6"
                    >
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${info.color}`}>
                        {info.icon}
                        <span className="text-[10px] font-bold tracking-wider">{info.label}</span>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-[12px] text-ink/40 font-semibold uppercase tracking-widest mb-1">Component ID</p>
                          <p className="text-[17px] font-semibold text-ink">{diff.refDes}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[12px] text-ink/40 font-semibold uppercase tracking-widest mb-1">Update Details</p>
                          <div className="flex items-center gap-3">
                            {diff.status === 'changed' ? (
                              <div className="flex items-center gap-2 text-[17px]">
                                <span className="text-ink/30 line-through">{diff.oldPart}</span>
                                <ArrowRight className="w-3 h-3 text-ink/20" />
                                <span className="text-primary font-semibold">{diff.newPart}</span>
                              </div>
                            ) : (
                              <span className="text-[17px] font-medium text-ink">{diff.partNumber}</span>
                            )}
                          </div>
                          <p className="text-[12px] text-ink/50 mt-1">{diff.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end md:block">
                        <button className="text-primary/20 hover:text-primary transition-colors">
                           <CheckCircle2 className="w-6 h-6" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
