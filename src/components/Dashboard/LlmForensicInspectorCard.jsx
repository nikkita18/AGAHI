import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  Cpu, 
  FileText,
  Zap,
  CornerDownRight
} from 'lucide-react';
import VideoConditionSimulator from './VideoConditionSimulator';

export default function LlmForensicInspectorCard({
  junction,
  selectedIncident,
  currentTime,
  onOpenCopilot,
  activeTab,
  onTabChange
}) {
  const [internalTab, setInternalTab] = useState('sumo'); // Default to SUMO Digital Twin
  const selectedTab = activeTab || internalTab;

  const handleTabClick = (tab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="p-6 rounded-2xl bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000000] space-y-5 font-sans">
      
      {/* Header with LLM Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0c6366] text-[#efddcc] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000000]">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-xl text-black">
                AI Vision Zero LLM Inspector
              </h3>
              <span className="text-[10px] font-mono font-bold uppercase bg-[#ff5f57] text-white px-2 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_0px_#000000]">
                ACTIVE MODEL
              </span>
            </div>
            <p className="text-xs font-bold text-black/70">
              Automated Forensic Causality Diagnostics & IRC:SP:99 Compliance Engine
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-2 px-4 py-2 bg-[#efddcc] hover:bg-black hover:text-[#efddcc] text-black font-heading font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-[#0c6366]" />
          <span>OPEN FULL LLM CHAT</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3 Interactive Mode Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => handleTabClick('causality')}
          className={`p-3 rounded-xl border-2 border-black font-heading font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            selectedTab === 'causality'
              ? 'bg-[#171e19] text-[#efddcc] shadow-[4px_4px_0px_0px_#000000]'
              : 'bg-[#fbf4ee] text-black hover:bg-[#efddcc]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>CAUSALITY VERDICT</span>
        </button>

        <button
          onClick={() => handleTabClick('irc')}
          className={`p-3 rounded-xl border-2 border-black font-heading font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            selectedTab === 'irc'
              ? 'bg-[#171e19] text-[#efddcc] shadow-[4px_4px_0px_0px_#000000]'
              : 'bg-[#fbf4ee] text-black hover:bg-[#efddcc]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>IRC:SP:99 COUNTERMEASURES</span>
        </button>

        <button
          onClick={() => handleTabClick('sumo')}
          className={`p-3 rounded-xl border-2 border-black font-heading font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            selectedTab === 'sumo'
              ? 'bg-[#171e19] text-[#efddcc] shadow-[4px_4px_0px_0px_#000000]'
              : 'bg-[#fbf4ee] text-black hover:bg-[#efddcc]'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>SUMO DIGITAL TWIN (VIDEO SIMULATOR)</span>
        </button>
      </div>

      {/* Tab Content Display */}
      {selectedTab === 'causality' && (
        <div className="p-4 rounded-xl bg-[#fbf4ee] border-2 border-black space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/15 pb-2">
            <span className="font-heading font-black text-sm text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              Forensic Causality Attribution: {junction?.name}
            </span>
            <span className="text-xs font-mono font-bold text-black/70">
              Confidence: <strong>88.4%</strong> · Telemetry Frame #{selectedIncident?.frame || 282}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
            <div className="p-3 bg-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              <div className="text-[11px] font-mono text-black/60 uppercase">Primary Root Cause</div>
              <div className="font-heading font-black text-base text-[#ff5f57] mt-0.5">
                🔴 Infrastructure Road Black Spot (78%)
              </div>
              <p className="mt-1.5 text-black/80 font-normal leading-relaxed">
                Conflict hotspot exhibits recurrent near-miss clusters (5 events logged) and an oblique 68° approach sightline, establishing systemic geometric roadway failure rather than isolated driver negligence.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              <div className="text-[11px] font-mono text-black/60 uppercase">Contributory Human Factor</div>
              <div className="font-heading font-black text-base text-[#f59e0b] mt-0.5">
                🟡 Approach Speed Variance (22%)
              </div>
              <p className="mt-1.5 text-black/80 font-normal leading-relaxed">
                Crossing vehicle entered intersection at 32 km/h, exceeding the recommended 25 km/h urban uncontrolled intersection threshold and shrinking available braking distance below 1.0 second.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'irc' && (
        <div className="p-4 rounded-xl bg-[#fbf4ee] border-2 border-black space-y-3">
          <div className="border-b border-black/15 pb-2">
            <span className="font-heading font-black text-sm text-black flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0c6366]" />
              IRC:SP:99 Physical Engineering Interventions
            </span>
          </div>

          <ul className="space-y-2 text-xs font-bold text-black">
            <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-black">
              <CornerDownRight className="w-4 h-4 text-[#0c6366] shrink-0 mt-0.5" />
              <span>
                <strong>100mm Raised Intersection Table (IRC:SP:99 Section 4.2)</strong>: Enforces physical approach deceleration below 25 km/h, increasing minimum TTC from 0.82s to 2.60s.
              </span>
            </li>
            <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-black">
              <CornerDownRight className="w-4 h-4 text-[#0c6366] shrink-0 mt-0.5" />
              <span>
                <strong>Stopping Sight Distance (SSD) Clearance</strong>: MoRTH guidelines dictate trimming of northern quadrant foliage to guarantee 45m visibility corridor.
              </span>
            </li>
            <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-black">
              <CornerDownRight className="w-4 h-4 text-[#0c6366] shrink-0 mt-0.5" />
              <span>
                <strong>High-Visibility Solar LED Blinker Bar (IRC:67)</strong>: Placed 25m in advance to warn cross-traffic of converging heavy passenger vehicles.
              </span>
            </li>
          </ul>
        </div>
      )}

      {selectedTab === 'sumo' && (
        <VideoConditionSimulator
          currentTime={currentTime}
          selectedIncident={selectedIncident}
          onOpenCopilot={onOpenCopilot}
        />
      )}

      {/* Quick Prompt Bar to Open Copilot */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold text-black/60">Quick Queries:</span>
          <button
            onClick={onOpenCopilot}
            className="px-2.5 py-1 bg-[#efddcc] hover:bg-black hover:text-[#efddcc] text-black font-bold rounded-lg border border-black transition-colors"
          >
            "How does speed table eliminate this near-miss?"
          </button>
          <button
            onClick={onOpenCopilot}
            className="px-2.5 py-1 bg-[#efddcc] hover:bg-black hover:text-[#efddcc] text-black font-bold rounded-lg border border-black transition-colors"
          >
            "Generate Municipal Notice for Smart City"
          </button>
        </div>

        <button
          onClick={onOpenCopilot}
          className="text-xs font-heading font-black text-[#0c6366] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Ask Custom Question</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
