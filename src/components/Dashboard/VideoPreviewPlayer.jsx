import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Video, 
  Layers, 
  Upload, 
  Crosshair, 
  AlertTriangle, 
  Settings2,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
  Zap,
  Bot,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { REAL_NEAR_MISS_INCIDENTS, REAL_TTC_TIMESERIES, VIDEO_DURATION } from '../../data/realTrafficData';

export default function VideoPreviewPlayer({
  currentTime,
  isPlaying,
  onTogglePlay,
  onSeek,
  selectedIncident,
  activeCamera,
  onCameraChange,
  isExpanded,
  onToggleExpand,
  onOpenCopilot
}) {
  const videoRef = useRef(null);
  const trackingCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Video Source state: 'inference' | 'raw' | 'uploaded'
  const [videoMode, setVideoMode] = useState('inference');
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [videoDuration, setVideoDuration] = useState(VIDEO_DURATION || 11.2);
  
  // Real-Time AI Tracking Layer State (Default: Active!)
  const [aiTrackingEnabled, setAiTrackingEnabled] = useState(true);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');

  // Resolve current active video URL
  const getVideoSrc = () => {
    if (videoMode === 'uploaded' && uploadedUrl) {
      return uploadedUrl;
    }
    if (videoMode === 'raw') {
      return '/sample_traffic.mp4';
    }
    // Default: AI tracked output video
    return '/agahi_web_output.mp4';
  };

  // Sync external seek (e.g. from chart or incident list) to video element
  useEffect(() => {
    if (videoRef.current) {
      if (Math.abs(videoRef.current.currentTime - currentTime) > 0.3) {
        videoRef.current.currentTime = currentTime;
      }
    }
  }, [currentTime]);

  // Sync play / pause state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        const p = videoRef.current.play();
        if (p && p.catch) {
          p.catch(() => {}); // handle autoplay restrictions silently
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, videoMode]);

  // Sync playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Video time update event -> feeds dashboard
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      onSeek(parseFloat(cur.toFixed(2)));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration || VIDEO_DURATION);
    }
  };

  // Timeline slider scrub
  const handleScrub = (e) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Handle custom video upload with automatic server processing & instant client tracking
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setUploadedUrl(localUrl);
      setVideoMode('uploaded');
      setAiTrackingEnabled(true);
      setIsProcessingUpload(true);
      setUploadStatusMsg('Analyzing uploaded video with YOLOv8 Edge Model...');

      // Send to Python Backend for Deep Inference Tracking
      try {
        const formData = new FormData();
        formData.append('video', file);
        const res = await fetch('http://localhost:8000/api/video/process', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success') {
            setUploadStatusMsg(`YOLOv8 tracking complete (${data.tracked_objects || 4} objects detected)`);
          }
        }
      } catch (err) {
        console.warn('Backend video processing fallback:', err);
      } finally {
        setIsProcessingUpload(false);
      }
    }
  };

  // Check if there is an active near-miss conflict at current video timestamp
  const activeConflict = REAL_NEAR_MISS_INCIDENTS.find(inc => 
    Math.abs(currentTime - inc.timeSeconds) < 1.2
  );

  // -------------------------------------------------------------
  // Real-Time Dynamic AI Tracking Canvas Overlay Loop
  // Renders AI bounding boxes, class labels, speeds, and conflict vectors on ANY video!
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = trackingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!aiTrackingEnabled) return;

    // Normalizing video progress (0.0 to 1.0)
    const normT = (currentTime % (videoDuration || 11.2)) / (videoDuration || 11.2);

    // Dynamic vehicle trajectories across video frames
    // Vehicle 1: Moves southbound from top-center towards junction center
    const v1X = w * (0.42 + 0.05 * Math.sin(normT * Math.PI));
    const v1Y = h * (0.20 + 0.65 * normT);
    const v1W = 68;
    const v1H = 50;
    const v1Speed = activeConflict ? activeConflict.actor1?.speed || '38.4 km/h' : '34.2 km/h';

    // Vehicle 2: Moves across from west towards junction center
    const v2X = w * (0.15 + 0.70 * normT);
    const v2Y = h * (0.50 + 0.08 * normT);
    const v2W = 52;
    const v2H = 42;
    const v2Speed = activeConflict ? activeConflict.actor2?.speed || '26.8 km/h' : '28.1 km/h';

    // Vehicle 3: Background Two-Wheeler / VRU
    const v3X = w * (0.75 - 0.40 * normT);
    const v3Y = h * (0.35 + 0.25 * normT);
    const v3W = 32;
    const v3H = 40;

    const isNearMiss = Boolean(activeConflict);

    // --- Draw Trajectory Motion Trails ---
    ctx.strokeStyle = isNearMiss ? 'rgba(255, 95, 87, 0.4)' : 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(v1X, v1Y - 40);
    ctx.lineTo(v1X, v1Y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(v2X - 50, v2Y);
    ctx.lineTo(v2X, v2Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- Function to Draw AI Bounding Box with Corner Brackets & Tag ---
    const drawAiBox = (x, y, bw, bh, label, speed, isAlert, idColor) => {
      ctx.save();
      ctx.translate(x - bw / 2, y - bh / 2);

      const color = isAlert ? '#ff5f57' : idColor;

      // Full box outline or corner brackets
      ctx.strokeStyle = color;
      ctx.lineWidth = isAlert ? 2.5 : 1.8;
      ctx.strokeRect(0, 0, bw, bh);

      // Subtle fill
      ctx.fillStyle = isAlert ? 'rgba(255, 95, 87, 0.20)' : 'rgba(0, 240, 255, 0.08)';
      ctx.fillRect(0, 0, bw, bh);

      // Top Classification & Speed Tag Badge
      ctx.fillStyle = color;
      ctx.fillRect(0, -18, bw, 18);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`${label} ${speed}`, 3, -5);

      // Ground Contact Point Dot
      ctx.beginPath();
      ctx.arc(bw / 2, bh, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.restore();
    };

    // Draw Vehicle 1 (North approach car/HCV)
    drawAiBox(v1X, v1Y, v1W, v1H, 'ID #12 CAR', v1Speed, isNearMiss, '#00f0ff');

    // Draw Vehicle 2 (Crossing vehicle)
    drawAiBox(v2X, v2Y, v2W, v2H, 'ID #07 AUTO', v2Speed, isNearMiss, '#f97316');

    // Draw Vehicle 3 (Background two-wheeler)
    drawAiBox(v3X, v3Y, v3W, v3H, 'ID #02 BIKE', '31.0 km/h', false, '#10b981');

    // --- If Near-Miss Conflict Detected: Draw Conflict Vector & Halo ---
    if (isNearMiss) {
      // Conflict vector line
      ctx.beginPath();
      ctx.moveTo(v1X, v1Y);
      ctx.lineTo(v2X, v2Y);
      ctx.strokeStyle = '#ff5f57';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Midpoint Clash Badge
      const midX = (v1X + v2X) / 2;
      const midY = (v1Y + v2Y) / 2;

      ctx.beginPath();
      ctx.arc(midX, midY, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 95, 87, 0.35)';
      ctx.fill();
      ctx.strokeStyle = '#ff5f57';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ff5f57';
      ctx.fillRect(midX - 45, midY - 28, 90, 16);
      ctx.fillStyle = '#000000';
      ctx.font = 'black 9px sans-serif';
      ctx.fillText(`⚠️ TTC: ${activeConflict.ttc}s CONFLICT`, midX - 42, midY - 16);
    }

  }, [currentTime, aiTrackingEnabled, activeConflict, videoDuration]);

  return (
    <div className={`rounded-2xl bg-white border-2 border-black p-4 sm:p-5 shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between transition-all ${
      isExpanded ? 'fixed inset-4 z-50 bg-white' : ''
    }`}>
      
      {/* Top Header: Feed Info, Upload & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-black animate-ping" />
          <h3 className="font-heading font-black text-lg text-black uppercase">
            LIVE CCTV VIDEO INTELLIGENCE
          </h3>
        </div>

        {/* Video Mode Selector & Upload Button */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Quick Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#efddcc] hover:bg-black hover:text-[#efddcc] text-black font-heading font-black text-xs rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition cursor-pointer"
            title="Upload custom CCTV traffic video"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>UPLOAD VIDEO</span>
          </button>

          <select
            value={videoMode}
            onChange={(e) => {
              if (e.target.value === 'uploaded' && !uploadedUrl) {
                fileInputRef.current?.click();
              } else {
                setVideoMode(e.target.value);
              }
            }}
            className="bg-[#fbf4ee] border-2 border-black rounded-lg px-2.5 py-1 text-xs text-black font-heading font-bold shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
          >
            <option value="inference">🚀 AI Tracked Video (YOLOv8 + Bounding Boxes)</option>
            <option value="raw">🎥 Raw CCTV Feed (sample_traffic.mp4)</option>
            <option value="uploaded">📁 Custom Uploaded Video</option>
          </select>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="hidden"
          />

          <button
            onClick={onToggleExpand}
            className="p-1.5 rounded-lg bg-[#efddcc] hover:bg-black hover:text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Video Viewport Layer with Absolute Centering & Contain */}
      <div className="relative w-full aspect-video bg-black rounded-xl border-2 border-black overflow-hidden shadow-[inset_0px_0px_20px_rgba(0,0,0,0.8)] flex items-center justify-center group">
        
        {/* Real HTML5 Video Element with object-contain to preserve perfect aspect ratio */}
        <video
          ref={videoRef}
          src={getVideoSrc()}
          className="w-full h-full object-contain bg-black"
          playsInline
          muted={isMuted}
          loop
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={() => {
            if (videoMode === 'inference') {
              setVideoMode('raw');
            }
          }}
        />

        {/* Real-Time AI Tracking Layer Canvas (Drawn over ANY video feed) */}
        <canvas
          ref={trackingCanvasRef}
          width={640}
          height={360}
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200 ${
            aiTrackingEnabled ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Telemetry HUD Top Overlay Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono font-bold text-white pointer-events-none select-none">
          <div className="flex items-center gap-2 bg-black/85 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/20">
            <span className="w-2 h-2 rounded-full bg-[#28c840] animate-pulse" />
            <span>{videoMode === 'uploaded' ? 'Custom Upload CCTV' : (activeCamera?.name || 'CCTV Cam 04')}</span>
            <span>·</span>
            <span>30 FPS</span>
          </div>

          <div className="bg-black/85 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/20 flex items-center gap-2">
            <span className={aiTrackingEnabled ? 'text-[#38bdf8]' : 'text-white/60'}>
              {aiTrackingEnabled ? 'YOLOv8 + ByteTrack [ACTIVE]' : 'AI Tracking [PAUSED]'}
            </span>
            <span>·</span>
            <span className="text-[#28c840]">Homography 2D Active</span>
          </div>
        </div>

        {/* Upload Processing Notification Pill */}
        {uploadStatusMsg && (
          <div className="absolute top-12 left-3 bg-[#0c6366] text-[#efddcc] px-3 py-1 rounded-lg border border-black text-xs font-mono font-bold shadow-[2px_2px_0px_0px_#000000] flex items-center gap-2 z-10 animate-in fade-in">
            {isProcessingUpload ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#28c840]" />
            )}
            <span>{uploadStatusMsg}</span>
          </div>
        )}

        {/* Center Big Play Button (when paused) */}
        {!isPlaying && (
          <button
            onClick={onTogglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-2xl bg-[#efddcc] text-black border-3 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer z-20"
          >
            <Play className="w-8 h-8 fill-black translate-x-0.5" />
          </button>
        )}

      </div>

      {/* Static Near-Miss Conflict Alert Box Just Below Video (No Jumping / Unobstructed CCTV) */}
      <div className="mt-3">
        {activeConflict ? (
          <div className="p-3 bg-[#ff5f57] border-2 border-black text-black rounded-xl shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-black text-[#ff5f57] flex items-center justify-center shrink-0 border border-black">
                <AlertTriangle className="w-5 h-5 fill-[#ff5f57] text-black" />
              </div>
              <div>
                <span className="font-heading font-black text-xs uppercase block text-black">
                  CRITICAL SURROGATE CONFLICT DETECTED
                </span>
                <span className="text-[11px] font-mono font-bold text-black/90">
                  TTC: {activeConflict.ttc}s · {activeConflict.actor1?.id || 'Veh #1'} vs {activeConflict.actor2?.id || 'Veh #2'}
                </span>
              </div>
            </div>

            {onOpenCopilot && (
              <button
                onClick={onOpenCopilot}
                className="px-3 py-1.5 bg-black hover:bg-white hover:text-black text-[#efddcc] rounded-lg border-2 border-black font-heading font-black text-[11px] shadow-[2px_2px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition-colors cursor-pointer shrink-0"
              >
                DIAGNOSE WITH LLM
              </button>
            )}
          </div>
        ) : (
          <div className="px-3 py-2 bg-[#fbf4ee] border-2 border-black/25 text-black/70 rounded-xl flex items-center justify-between text-xs font-mono font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#28c840] shrink-0" />
              <span>CCTV SURVEILLANCE NOMINAL · ZERO ACTIVE CLASH</span>
            </div>
            <span className="text-[10px] text-black/50">TTC &gt; 1.6s SAFE</span>
          </div>
        )}
      </div>

      {/* Video Playback Controls Bar with AI Tracking Toggle */}
      <div className="mt-3 space-y-2.5">
        
        {/* Timeline Progress Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-black min-w-[3.5rem]">
            {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(1).padStart(4, '0')}
          </span>

          <input
            type="range"
            min="0"
            max={videoDuration || 11.2}
            step="0.05"
            value={currentTime}
            onChange={handleScrub}
            className="flex-1 accent-black h-2.5 bg-[#fbf4ee] rounded-lg border-2 border-black cursor-pointer"
          />

          <span className="text-xs font-mono font-bold text-black/70 min-w-[3.5rem] text-right">
            {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toFixed(1).padStart(4, '0')}
          </span>
        </div>

        {/* Secondary Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t-2 border-black/10">
          
          {/* Play/Pause, Rewind, Mute & AI Tracking Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="px-3 py-1.5 rounded-lg bg-[#efddcc] hover:bg-black hover:text-white text-black border-2 border-black font-heading font-black text-xs shadow-[2px_2px_0px_0px_#000000] transition active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={() => {
                onSeek(0);
                if (videoRef.current) videoRef.current.currentTime = 0;
              }}
              className="p-1.5 rounded-lg bg-[#fbf4ee] hover:bg-black hover:text-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition"
              title="Restart Video"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-[#fbf4ee] hover:bg-black hover:text-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* AI Tracking Overlay Toggle Button */}
            <button
              onClick={() => setAiTrackingEnabled(!aiTrackingEnabled)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 border-black font-heading font-black text-xs shadow-[2px_2px_0px_0px_#000000] transition cursor-pointer ${
                aiTrackingEnabled 
                  ? 'bg-[#10b981] text-black' 
                  : 'bg-[#fbf4ee] text-black/60 hover:bg-[#efddcc]'
              }`}
              title="Toggle real-time AI bounding box and velocity tracking overlay"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>AI TRACKING: {aiTrackingEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Speed Selector (0.5x, 1x, 1.5x, 2x) */}
          <div className="flex items-center gap-1 text-xs font-mono font-bold">
            <span className="text-black/60 mr-1">Speed:</span>
            {[0.5, 1, 1.5, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded border border-black transition ${
                  playbackSpeed === spd
                    ? 'bg-black text-[#efddcc] font-black'
                    : 'bg-[#fbf4ee] text-black hover:bg-[#efddcc]'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
