import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import cartierAudio from "@assets/cartier_1772895545421.mp3";

// You can add more songs to this array later
const PLAYLIST = [
  { id: 1, title: "Cartier", artist: "Bassgawd", src: cartierAudio },
];

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const currentTrack = PLAYLIST[currentTrackIndex];
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(e => console.log("Audio playback failed (no source yet)", e));
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    (window as any).startMusicPlayback = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log(e));
      }
    };
    (window as any).stopMusicPlayback = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    return () => {
      delete (window as any).startMusicPlayback;
      delete (window as any).stopMusicPlayback;
    };
  }, [isPlaying]);

  // Attempt auto-play on mount, but let the global method handle it if triggered manually

  // Real progress tracking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, []);

  // Format time
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    audioRef.current.currentTime = percent * audioRef.current.duration;
    setProgress(percent * 100);
  };

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/10 text-white z-50 px-4 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <audio ref={audioRef} src={currentTrack.src} onEnded={() => setIsPlaying(false)} />
      
      {/* Track Info */}
      <div className="flex items-center gap-4 w-full sm:w-1/3">
        <div className="w-10 h-10 bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden relative group">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-50" />
          {isPlaying && (
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-full h-full border border-white/30 rounded-full border-t-transparent"
            />
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-display uppercase tracking-widest text-xs font-bold">{currentTrack.title}</span>
          <span className="text-[9px] uppercase tracking-widest text-white/50">{currentTrack.artist}</span>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center gap-2 w-full sm:w-1/3">
        <div className="flex items-center gap-6">
          <button className="text-white/50 hover:text-white transition-colors">
            <SkipBack size={16} />
          </button>
          <button 
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={14} className="ml-[1px]" /> : <Play size={14} className="ml-[2px]" />}
          </button>
          <button className="text-white/50 hover:text-white transition-colors">
            <SkipForward size={16} />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full max-w-md flex items-center gap-3 hidden sm:flex">
          <span className="text-[8px] font-mono text-white/50 w-8 text-right">
            {audioRef.current ? formatTime(audioRef.current.currentTime) : "0:00"}
          </span>
          <div 
            className="h-1 flex-grow bg-white/10 rounded-full overflow-hidden relative cursor-pointer group"
            onClick={handleSeek}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-white group-hover:bg-blue-400 transition-colors"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[8px] font-mono text-white/50 w-8">
            {audioRef.current?.duration ? formatTime(audioRef.current.duration) : "0:00"}
          </span>
        </div>
      </div>

      {/* Extra Controls */}
      <div className="w-full sm:w-1/3 flex items-center justify-end hidden sm:flex gap-4">
        <button onClick={toggleMute} className="text-white/50 hover:text-white transition-colors">
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white/50 w-2/3" />
        </div>
      </div>
    </motion.div>
  );
}
