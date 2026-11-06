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
  Bot
} from 'lucide-react';
import { REAL_NEAR_MISS_INCIDENTS, VIDEO_DURATION } from '../../data/realTrafficData';

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
  const fileInputRef = useRef(null);

  // Video Source state
  // Choices: 'inference' (YOLO bounding boxes), 'raw' (sample_traffic.mp4), 'uploaded'
  const [videoMode, setVideoMode] = useState('inference');
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [videoDuration, setVideoDuration] = useState(VIDEO_DURATION || 11.2);

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

  // Handle custom video upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedUrl(url);
      setVideoMode('uploaded');
    }
  };

  // Check if there is an active near-miss conflict at current video timestamp
  const activeConflict = REAL_NEAR_MISS_INCIDENTS.find(inc => 
    Math.abs(currentTime - inc.timeSeconds) < 1.2
  );

  return (
    <div className={`rounded-2xl bg-white border-2 border-black p-4 sm:p-5 shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between transition-all ${
      isExpanded ? 'fixed inset-4 z-50 bg-white' : ''
    }`}>
      
      {/* Top Header: Feed Info & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-black animate-ping" />
          <h3 className="font-heading font-black text-lg text-black uppercase">
            LIVE CCTV VIDEO INTELLIGENCE
          </h3>
        </div>

        {/* Video Mode Selector */}
        <div className="flex items-center gap-2">
          <select
            value={videoMode}
            onChange={(e) => {
              if (e.target.value === 'uploaded' && !uploadedUrl) {
                fileInputRef.current?.click();
              } else {
                setVideoMode(e.target.value);
              }
            }}
            className="bg-[#efddcc] border-2 border-black rounded-lg px-2.5 py-1 text-xs text-black font-heading font-bold shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
          >
            <option value="inference">🚀 AI Tracked Video (YOLOv8 + Bounding Boxes)</option>
            <option value="raw">🎥 Raw CCTV Feed (sample_traffic.mp4)</option>
            <option value="uploaded">📁 Upload Custom Video</option>
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

      {/* Main Video Viewport Layer */}
      <div className="relative w-full aspect-video bg-black rounded-xl border-2 border-black overflow-hidden shadow-[inset_0px_0px_20px_rgba(0,0,0,0.8)] flex items-center justify-center group">
        
        {/* Real HTML5 Video Element */}
        <video
          ref={videoRef}
          src={getVideoSrc()}
          className="w-full h-full object-cover"
          playsInline
          muted={isMuted}
          loop
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={(e) => {
            // Fallback to sample_traffic.mp4 if tracked video is missing
            if (videoMode === 'inference') {
              setVideoMode('raw');
            }
          }}
        />

        {/* Telemetry HUD Top Overlay Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono font-bold text-white pointer-events-none select-none">
          <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/20">
            <span className="w-2 h-2 rounded-full bg-[#28c840] animate-pulse" />
            <span>{activeCamera?.name || 'CCTV Cam 04'}</span>
            <span>·</span>
            <span>30 FPS</span>
          </div>

          <div className="bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/20 flex items-center gap-2">
            <span className="text-[#38bdf8]">YOLOv8 + ByteTrack</span>
            <span>·</span>
            <span className="text-[#28c840]">Homography 2D Active</span>
          </div>
        </div>

        {/* Center Big Play Button (when paused) */}
        {!isPlaying && (
          <button
            onClick={onTogglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-2xl bg-[#efddcc] text-black border-3 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
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

      {/* Video Playback Controls Bar */}
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
          
          {/* Play/Pause & Rewind */}
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
          </div>

          {/* Speed Selector (0.5x, 1x, 2x) */}
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
