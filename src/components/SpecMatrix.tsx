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
      // Silent confirmation as per Apple philosophy (or subtle notification)
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
    if (components.length < 2) return 'text-ink';
    const numeric = parseFloat(val.replace(/[^0-9.]/g, ''));
    if (isNaN(numeric)) return 'text-ink';

    const allValues = components.map(c => {
       const v = (c.specs as any)[metric];
       return parseFloat(v.replace(/[^0-9.]/g, ''));
    }).filter(v => !isNaN(v));

    if (metric === 'rdsOn') {
      if (numeric === Math.min(...allValues)) return 'text-primary font-semibold';
    }
    if (metric === 'maxVoltage') {
      if (numeric === Math.max(...allValues)) return 'text-primary font-semibold';
    }
    return 'text-ink';
  };

  return (
    <div className="w-full">
      {/* Hero Tile */}
      <section className="apple-tile bg-canvas border-b border-gray-100 px-4">
        <div className="max-w-[980px] w-full">
          <h2 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-[1.07] mb-4">
            Compare components.
          </h2>
          <p className="text-[21px] md:text-[28px] text-ink/60 mb-10 max-w-2xl mx-auto">
            Input multiple part numbers to contrast key specifications side-by-side in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-lg mx-auto w-full">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={partInput}
                onChange={(e) => setPartInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchSpecs()}
                placeholder="Enter Part Number..."
                className="w-full px-6 py-3.5 bg-canvas-parchment rounded-full border border-transparent focus:border-primary outline-none text-[17px] transition-all"
              />
              {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={fetchSpecs}
                disabled={loading || !partInput.trim()}
                className="apple-button-primary flex-1 sm:flex-none whitespace-nowrap"
              >
                Add Part
              </button>
              {components.length > 0 && (
                <button
                  onClick={saveToHistory}
                  disabled={saveLoading}
                  className="apple-button-secondary flex-1 sm:flex-none whitespace-nowrap"
                >
                  {saveLoading ? 'Saving...' : 'Save Log'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Matrix Tile */}
      <section className="bg-canvas-parchment py-16 px-4">
        <div className="max-w-[1200px] mx-auto">
          <AnimatePresence>
            {components.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-x-auto rounded-[18px] bg-white border border-gray-200/50"
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-8 py-6 text-[14px] font-semibold text-ink/40 uppercase tracking-widest w-[250px]">Technical Specs</th>
                      {components.map((c) => (
                        <th key={c.partNumber} className="px-8 py-6">
                          <div className="flex justify-between items-center group">
                            <span className="text-[17px] font-semibold text-ink">{c.partNumber}</span>
                            <button 
                              onClick={() => removeComponent(c.partNumber)}
                              className="text-primary text-[12px] font-normal hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Remove
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { label: 'Max Voltage (Vds)', key: 'maxVoltage' },
                      { label: 'Rds(on) (Ω)', key: 'rdsOn' },
                      { label: 'Switching (Rise)', key: 'switchingTimeRise' },
                      { label: 'Switching (Fall)', key: 'switchingTimeFall' },
                      { label: 'Package', key: 'package' },
                      { label: 'Est. Price', key: 'price' },
                    ].map((row) => (
                      <tr key={row.key} className="hover:bg-canvas-parchment/30 transition-colors">
                        <td className="px-8 py-6 text-[17px] font-normal text-ink/60">{row.label}</td>
                        {components.map((c) => (
                          <td key={c.partNumber} className={`px-8 py-6 text-[17px] ${getMetricClass((c.specs as any)[row.key], row.key, components)}`}>
                            {(c.specs as any)[row.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="px-8 py-6 text-[17px] font-normal text-ink/60 italic">Verification Status</td>
                      {components.map((c) => (
                        <td key={c.partNumber} className="px-8 py-6">
                          {c.uncertainties && c.uncertainties.length > 0 ? (
                            <div className="flex items-center gap-2 text-[#b66d00] text-[12px] font-medium bg-[#fff8e6] px-3 py-1 rounded-full w-fit">
                              <Info className="w-3.5 h-3.5" />
                              Uncertain: Check datasheet
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-emerald-600 text-[12px] font-medium bg-emerald-50 px-3 py-1 rounded-full w-fit">
                              Verified
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </motion.div>
            ) : (
              <div className="text-center py-32">
                <Cpu className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                <p className="text-[21px] text-ink/40 font-medium tracking-tight">Your comparison gallery is empty.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
