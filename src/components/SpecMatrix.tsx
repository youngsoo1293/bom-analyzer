import React, { useState } from 'react';
import { Search, Plus, Trash2, AlertCircle, Info, Cpu, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ComponentData } from '../types';

export function SpecMatrix() {
  const [partInput, setPartInput] = useState('');
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const saveToHistory = async () => {
    if (components.length === 0) return;
    setSaveLoading(true);
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'comparison',
          title: `[Spec Matrix] ${components.map(c => c.partNumber).join(', ')}`,
          data: components
        }),
      });
      alert('Comparison saved to history logs.');
    } catch (error) {
      console.error(error);
    } finally {
      setSaveLoading(false);
    }
  };

  const fetchSpecs = async () => {
    if (!partInput.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/component/specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partNumbers: [partInput] }),
      });
      const data = await response.json();
      if (data && data.length > 0) {
        setComponents([...components, ...data]);
        setPartInput('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeComponent = (pn: string) => {
    setComponents(components.filter(c => c.partNumber !== pn));
  };

  const getMetricClass = (val: string, metric: string, components: ComponentData[]) => {
    if (components.length < 2) return '';
    // Basic heuristic: smaller Rds(on) is better, higher Voltage is better
    // This is simplified for demonstration
    const numeric = parseFloat(val.replace(/[^0-9.]/g, ''));
    if (isNaN(numeric)) return '';

    const allValues = components.map(c => {
       const v = (c.specs as any)[metric];
       return parseFloat(v.replace(/[^0-9.]/g, ''));
    }).filter(v => !isNaN(v));

    if (metric === 'rdsOn') {
      if (numeric === Math.min(...allValues)) return 'text-emerald-600 font-bold';
      if (numeric === Math.max(...allValues)) return 'text-rose-600';
    }
    if (metric === 'maxVoltage') {
      if (numeric === Math.max(...allValues)) return 'text-emerald-600 font-bold';
      if (numeric === Math.min(...allValues)) return 'text-rose-600';
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-slate-400" />
          Component Spec Comparison
        </h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={partInput}
              onChange={(e) => setPartInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchSpecs()}
              placeholder="Enter Part Number (e.g., IRF540N, 2N7002...)"
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
              </div>
            )}
          </div>
          <button
            onClick={fetchSpecs}
            disabled={loading || !partInput.trim()}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Part
          </button>
          {components.length > 0 && (
            <button
              onClick={saveToHistory}
              disabled={saveLoading}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-100"
            >
              <Save className="w-4 h-4" />
              {saveLoading ? 'Saving...' : 'Save Comparison'}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {components.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Parameter</th>
                  {components.map((c) => (
                    <th key={c.partNumber} className="px-6 py-4 min-w-[200px]">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{c.partNumber}</span>
                        <button 
                          onClick={() => removeComponent(c.partNumber)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { label: 'Max Voltage (Vds)', key: 'maxVoltage' },
                  { label: 'Rds(on) (Ω)', key: 'rdsOn' },
                  { label: 'Switching (Rise)', key: 'switchingTimeRise' },
                  { label: 'Switching (Fall)', key: 'switchingTimeFall' },
                  { label: 'Package', key: 'package' },
                  { label: 'Est. Price', key: 'price' },
                ].map((row) => (
                  <tr key={row.key} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 group-hover:text-slate-900">{row.label}</td>
                    {components.map((c) => (
                      <td key={c.partNumber} className={`px-6 py-4 text-sm ${getMetricClass((c.specs as any)[row.key], row.key, components)}`}>
                        {(c.specs as any)[row.key]}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 italic">Confidence Flags</td>
                  {components.map((c) => (
                    <td key={c.partNumber} className="px-6 py-4">
                      {c.uncertainties && c.uncertainties.length > 0 ? (
                        <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 p-2 rounded-lg border border-amber-100">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>Check: {c.uncertainties[0]}</span>
                          <div className="group relative">
                             <Info className="w-3 h-3 text-amber-400 cursor-help" />
                             <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[10px]">
                               Raw data tooltip for verification as per PRD requirement.
                             </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-emerald-600 text-[10px] font-bold tracking-widest uppercase">Verified</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
      
      {components.length === 0 && (
        <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Add components to start comparing specifications</p>
        </div>
      )}
    </div>
  );
}
