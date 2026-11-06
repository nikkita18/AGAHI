import React, { useState } from 'react';
import { AlertTriangle, Play, ShieldAlert, Filter, Clock, Eye, CheckCircle2, Bot, ArrowRight, Cpu } from 'lucide-react';
import { REAL_NEAR_MISS_INCIDENTS } from '../../data/realTrafficData';

export default function IncidentAuditLog({ currentTime, onSeek, onSelectIncident, onOpenCopilot, onSimulateIncident }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'CRITICAL'

  const filteredIncidents = REAL_NEAR_MISS_INCIDENTS.filter(inc => {
    if (filter === 'CRITICAL') return inc.severity === 'CRITICAL';
    return true;
  });

  return (
    <div className="rounded-xl bg-white border-2 border-black p-5 shadow-[8px_8px_0px_0px_#000000] font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-black" />
            <h3 className="font-heading font-black text-xl text-black uppercase">
              NEAR-MISS CONFLICT AUDIT LOG (AI DETECTED)
            </h3>
          </div>
          <p className="text-xs font-medium text-black/70 mt-0.5">
            Real kinetic friction events extracted by computer vision models from the CCTV video stream. Click "Inspect in Video" to rewind playback to the exact collision frame.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#efddcc] border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded text-xs font-heading font-bold border-2 transition ${
              filter === 'ALL' ? 'bg-black text-[#efddcc] border-black shadow-[2px_2px_0px_0px_#000000]' : 'border-transparent text-black hover:border-black'
            }`}
          >
            All Conflicts ({REAL_NEAR_MISS_INCIDENTS.length})
          </button>
          <button
            onClick={() => setFilter('CRITICAL')}
            className={`px-3 py-1 rounded text-xs font-heading font-bold border-2 transition ${
              filter === 'CRITICAL' ? 'bg-black text-[#efddcc] border-black shadow-[2px_2px_0px_0px_#000000]' : 'border-transparent text-black hover:border-black'
            }`}
          >
            Critical TTC &lt; 1.0s
          </button>
        </div>
      </div>

      {/* Incident List Table */}
      <div className="overflow-x-auto rounded-lg border-2 border-black">
        <table className="w-full text-left text-xs bg-white">
          <thead className="bg-[#171e19] text-white font-mono text-[11px] uppercase border-b-2 border-black">
            <tr>
              <th className="py-2.5 px-3 font-bold">Time / Frame</th>
              <th className="py-2.5 px-3 font-bold">Interacting Vehicles</th>
              <th className="py-2.5 px-3 font-bold">Speeds & Distance</th>
              <th className="py-2.5 px-3 font-bold">Minimum TTC</th>
              <th className="py-2.5 px-3 font-bold">AI Causality Diagnosis</th>
              <th className="py-2.5 px-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {filteredIncidents.map(inc => {
              const isCurrentlyPlaying = Math.abs(currentTime - inc.timeSeconds) < 1.2;

              return (
                <tr 
                  key={inc.id}
                  className={`transition-colors font-medium ${
                    isCurrentlyPlaying ? 'bg-[#efddcc]' : 'hover:bg-[#fafafa]'
                  }`}
                >
                  {/* Timestamp & Frame */}
                  <td className="py-3 px-3 font-mono">
                    <span className="text-black font-black text-sm block">{inc.timeFormatted}</span>
                    <span className="text-[10px] text-black/60 font-bold">Frame #{inc.frame}</span>
                  </td>

                  {/* Interacting Vehicles */}
                  <td className="py-3 px-3">
                    <div className="font-heading font-black text-xs text-black">
                      Vehicle {inc.actor1?.id || '#1'} ↔ Vehicle {inc.actor2?.id || '#2'}
                    </div>
                    <div className="text-[10px] text-black/70 font-mono">
                      Converging Conflict Angle: 88°
                    </div>
                  </td>

                  {/* Speeds & Distance */}
                  <td className="py-3 px-3 font-mono">
                    <div className="text-xs font-bold text-black">
                      {inc.actor1?.speed || '35 km/h'} vs {inc.actor2?.speed || '30 km/h'}
                    </div>
                    <div className="text-[10px] text-black/70">
                      Separation: <strong>{inc.distance}m</strong>
                    </div>
                  </td>

                  {/* TTC */}
                  <td className="py-3 px-3">
                    <span className="font-heading font-black text-sm text-[#ff5f57] bg-black text-[#ff5f57] px-2 py-0.5 rounded border border-black inline-block font-mono">
                      {inc.ttc}s
                    </span>
                  </td>

                  {/* AI Causality Verdict */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading font-black text-xs text-black">
                        {inc.verdict}
                      </span>
                    </div>
                    <div className="text-[10px] text-black/80 font-bold">
                      Black Spot: <strong>{inc.blackSpotPct}%</strong> · Driver Error: <strong>{inc.driverErrorPct}%</strong>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          onSeek(inc.timeSeconds);
                          onSelectIncident(inc);
                        }}
                        className="px-2.5 py-1 bg-[#efddcc] hover:bg-black hover:text-white text-black font-heading font-black text-[11px] rounded-md border-2 border-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition cursor-pointer flex items-center gap-1"
                        title="Jump video playback to this conflict timestamp"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>VIDEO</span>
                      </button>

                      {onSimulateIncident && (
                        <button
                          onClick={() => {
                            onSelectIncident(inc);
                            onSimulateIncident(inc);
                          }}
                          className="px-2.5 py-1 bg-black hover:bg-[#0c6366] text-[#efddcc] font-heading font-black text-[11px] rounded-md border-2 border-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition cursor-pointer flex items-center gap-1"
                          title="Simulate this conflict condition in SUMO digital twin"
                        >
                          <Cpu className="w-3 h-3 text-[#efddcc]" />
                          <span>SIMULATE</span>
                        </button>
                      )}

                      {onOpenCopilot && (
                        <button
                          onClick={() => {
                            onSelectIncident(inc);
                            onOpenCopilot();
                          }}
                          className="px-2 py-1 bg-[#0c6366] hover:bg-black text-white font-heading font-black text-[11px] rounded-md border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition cursor-pointer flex items-center gap-1"
                          title="Ask LLM about this incident"
                        >
                          <Bot className="w-3 h-3" />
                          <span>LLM</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
