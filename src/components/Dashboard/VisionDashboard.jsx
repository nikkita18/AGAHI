import React, { useState, useEffect } from 'react';
import TopNavbar from './TopNavbar';
import VideoPreviewPlayer from './VideoPreviewPlayer';
import SafetyKpiCards from './SafetyKpiCards';
import TtcRiskChart from './TtcRiskChart';
import JunctionSpatialMap from './JunctionSpatialMap';
import VehicleModalBreakdown from './VehicleModalBreakdown';
import IncidentAuditLog from './IncidentAuditLog';
import InfrastructureInsights from './InfrastructureInsights';
import SafetyReportModal from './SafetyReportModal';
import VisionZeroLlmCopilot from './VisionZeroLlmCopilot';
import LlmForensicInspectorCard from './LlmForensicInspectorCard';
import { JUNCTIONS } from '../../data/mockTrafficData';
import { REAL_NEAR_MISS_INCIDENTS, VIDEO_DURATION } from '../../data/realTrafficData';
import { Star, Shield, ArrowUpRight, Bot, Sparkles } from 'lucide-react';

export default function VisionDashboard({ user, onLogout }) {
  // Junction & Camera states
  const [selectedJunction, setSelectedJunction] = useState(() => {
    return JUNCTIONS.find(j => j.id === user.junction) || JUNCTIONS[0];
  });
  const [selectedCamera, setSelectedCamera] = useState(selectedJunction.cameras[0]);

  // Video playback states - synchronized to real video
  const [currentTime, setCurrentTime] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(REAL_NEAR_MISS_INCIDENTS[0]);
  const [inspectorTab, setInspectorTab] = useState('sumo'); // 'causality' | 'irc' | 'sumo'

  // Modal report state
  const [isReportOpen, setIsReportOpen] = useState(false);

  // LLM Copilot state
  const [isLlmOpen, setIsLlmOpen] = useState(false);

  // Video playback timer loop synchronized to actual 11.18s video duration
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= VIDEO_DURATION) return 0;
          return parseFloat((prev + 0.1).toFixed(2));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // When junction changes, update camera
  const handleSelectJunction = (j) => {
    setSelectedJunction(j);
    setSelectedCamera(j.cameras[0]);
  };

  // Seeking in video
  const handleSeek = (time) => {
    setCurrentTime(time);
  };

  // Inspect incident
  const handleSelectIncident = (inc) => {
    setSelectedIncident(inc);
    setCurrentTime(Math.max(0, inc.timeSeconds - 0.5));
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-[#0c6366] text-black flex flex-col font-sans selection:bg-black selection:text-[#efddcc]">
      
      {/* Top sticky Navigation with LLM Copilot trigger */}
      <TopNavbar
        user={user}
        onLogout={onLogout}
        selectedJunction={selectedJunction}
        onSelectJunction={handleSelectJunction}
        selectedCamera={selectedCamera}
        onSelectCamera={setSelectedCamera}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenCopilot={() => setIsLlmOpen(true)}
      />

      {/* Continuous Marquee Banner */}
      <section className="bg-[#171e19] border-b-2 border-black py-2.5 overflow-hidden select-none">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee font-heading font-black text-xs tracking-wider uppercase text-[#efddcc]/90">
          <span>LIVE CORRIDOR STREAM</span>
          <span>✦</span>
          <span>LOCATION: {selectedJunction.name.toUpperCase()}</span>
          <span>✦</span>
          <span>CAMERA: {selectedCamera.name.toUpperCase()}</span>
          <span>✦</span>
          <span>EDGE INFERENCE: YOLOv8 + BYTETRACK (32 MS)</span>
          <span>✦</span>
          <span>VIDEO FEED: SAMPLE_TRAFFIC.MP4 (30 FPS)</span>
          <span>✦</span>
          <span>SURROGATE SAFETY MEASURES ACTIVE (TTC &lt; 1.5S ALERTS)</span>
          <span>✦</span>
          <span>AGAHI LLM FORENSIC COPILOT ONLINE</span>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 pb-20 space-y-6 flex-1">
        
        {/* Top Hero Section: KPI Metrics (Left) + Top-Right Video Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Corridor Header & 4 KPI Cards (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Corridor Status Card in Neo-Brutalist White */}
            <div className="p-4 sm:p-5 rounded-xl bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-black animate-ping" />
                  <span className="text-xs font-mono font-black text-black uppercase tracking-widest bg-[#efddcc] px-2 py-0.5 rounded border border-black">
                    ACTIVE MONITORING CORRIDOR
                  </span>
                </div>
                <h2 className="font-heading font-black text-2xl text-black mt-1">{selectedJunction.name}</h2>
                <p className="text-xs font-bold text-black/70">
                  {selectedJunction.city} · Live Edge Detection from {selectedCamera.name}
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[11px] font-mono font-black uppercase px-2.5 py-1 rounded bg-[#ff5f57] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                  HIGH CONFLICT ZONE
                </span>
                <div className="text-xs font-mono font-bold text-black mt-2">
                  Feed Resolution: <strong>960x540 @ 30 FPS</strong>
                </div>
              </div>
            </div>

            {/* 4 Safety KPI Cards */}
            <SafetyKpiCards currentTime={currentTime} currentRiskScore={selectedJunction.riskScore} />
          </div>

          {/* Right Column: Real Video Preview Player in the Top Right (5 cols on desktop) */}
          <div className="lg:col-span-5">
            <VideoPreviewPlayer
              currentTime={currentTime}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onSeek={handleSeek}
              selectedIncident={selectedIncident}
              activeCamera={selectedCamera}
              onCameraChange={setSelectedCamera}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(!isExpanded)}
              onOpenCopilot={() => setIsLlmOpen(true)}
            />
          </div>

        </div>

        {/* Section 2: Dedicated AI Vision Zero LLM Forensic Inspector & Video Simulator */}
        <section id="forensic-inspector-card">
          <LlmForensicInspectorCard
            junction={selectedJunction}
            selectedIncident={selectedIncident}
            currentTime={currentTime}
            activeTab={inspectorTab}
            onTabChange={setInspectorTab}
            onOpenCopilot={() => setIsLlmOpen(true)}
          />
        </section>

        {/* Section 3: Time-to-Collision (TTC) & Surrogate Safety Timeline */}
        <section>
          <TtcRiskChart
            currentTime={currentTime}
            onSeek={handleSeek}
            onSelectIncident={handleSelectIncident}
          />
        </section>

        {/* Section 4: 2D Spatial Intersection Map & Modal Split Bento */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JunctionSpatialMap
            currentTime={currentTime}
            onSelectIncident={handleSelectIncident}
          />
          <VehicleModalBreakdown />
        </section>

        {/* Section 5: Chronological Near-Miss Incident Audit Log */}
        <section>
          <IncidentAuditLog
            currentTime={currentTime}
            onSeek={handleSeek}
            onSelectIncident={handleSelectIncident}
            onSimulateIncident={(inc) => {
              setInspectorTab('sumo');
              handleSelectIncident(inc);
              document.getElementById('forensic-inspector-card')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenCopilot={() => setIsLlmOpen(true)}
          />
        </section>

        {/* Section 6: AI Infrastructure Recommendations (Bento) */}
        <section>
          <InfrastructureInsights />
        </section>

        {/* Section 7: Auditor Testimonial Block in Light Orange #efddcc */}
        <section className="p-6 rounded-2xl bg-[#efddcc] border-2 border-black shadow-[8px_8px_0px_0px_#000000]">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-xl bg-black text-[#efddcc] flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_#000000] shrink-0 font-heading font-black text-2xl">
              VZ
            </div>
            <div className="space-y-1 text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-black text-black" />
                ))}
              </div>
              <p className="font-heading font-black text-lg text-black leading-snug">
                "Proactive near-miss detection reduces the time needed to evaluate an intersection from 3 years of crash history down to 10 days of continuous CCTV surveillance."
              </p>
              <div className="text-xs font-bold text-black/80 font-mono">
                Er. S. R. Mohanty · Chief Transport Planner, Bhubaneswar Smart City Limited
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Floating Action Button for LLM Copilot */}
      <button
        onClick={() => setIsLlmOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 bg-[#efddcc] hover:bg-white text-black border-3 border-black rounded-2xl font-heading font-black text-sm shadow-[6px_6px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-xl bg-[#0c6366] text-white flex items-center justify-center border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000000] group-hover:rotate-6 transition-transform">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-heading font-black tracking-tight">AI COPILOT</span>
            <span className="text-[10px] bg-[#ff5f57] text-white px-1.5 py-0.2 rounded border border-black font-mono">LLM</span>
          </div>
          <span className="text-[10px] font-mono text-black/70 font-bold block mt-0.5">Click to ask LLM</span>
        </div>
      </button>

      {/* Full-Featured LLM Copilot Drawer / Modal */}
      <VisionZeroLlmCopilot
        isOpen={isLlmOpen}
        onClose={() => setIsLlmOpen(false)}
        junction={selectedJunction}
        camera={selectedCamera}
        incident={selectedIncident}
        currentTime={currentTime}
      />

      {/* Printable / Exportable Safety Audit Report Modal */}
      <SafetyReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        junction={selectedJunction}
        user={user}
      />

      {/* Footer */}
      <footer className="bg-[#171e19] text-[#efddcc] border-t-2 border-black px-6 py-6 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#efddcc] text-black font-heading font-black text-xs rounded border border-black flex items-center justify-center">
              AG
            </div>
            <span>Odisha State Road Safety Society · Bhubaneswar Smart City ICCC Integration</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono font-bold text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#28c840]" />
              <span>AES-256 CCTV Stream</span>
            </span>
            <span>·</span>
            <span>RF-DETR Model v2.4 + Vision Zero LLM Copilot</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
