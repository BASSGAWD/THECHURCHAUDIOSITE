import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Square, Trophy, Crown } from 'lucide-react';
import song1 from '@assets/cartier_(1)_1772764014511.mp3';
import song2 from '@assets/POS2_1772764020173.mp3';
import song3 from '@assets/csextremelyrough_1772764024004.wav';
import song4 from '@assets/lavander_town_1772764032729.mp3';
import choirImage from '@assets/unnamed_(10)_1772764892862.jpg';

const SONGS = [
  { id: 1, title: 'Cartier', src: song1, bpm: 150 },
  { id: 2, title: 'POS2', src: song2, bpm: 150 },
  { id: 3, title: 'CS Rough', src: song3, bpm: 150 },
  { id: 4, title: 'Lavander', src: song4, bpm: 150 },
];

interface RhythmGameProps {
  onClose: () => void;
}

export function RhythmGame({ onClose }: RhythmGameProps) {
  const [activeSongIndex, setActiveSongIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<'medium' | 'hard'>('medium');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [feedback, setFeedback] = useState<'PERFECT' | 'GOOD' | 'MISS' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [failCounter, setFailCounter] = useState(0); // Max 5 before song fails
  const MAX_FAILS = 5;
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestRef = useRef<number>();
  const [barPosition, setBarPosition] = useState(0); // 0 to 100 for Lane J
  const [barPositionK, setBarPositionK] = useState(0); // 0 to 100 for Lane K
  const [barPositionI, setBarPositionI] = useState(0); // 0 to 100 for Lane I

  const barPositionRef = useRef<number>(0); 
  const barPositionKRef = useRef<number>(0);
  const barPositionIRef = useRef<number>(0);

  
  // Game state refs for animation loop
  const isPlayingRef = useRef(false);
  const songBpmRef = useRef(SONGS[0].bpm);

  useEffect(() => {
    songBpmRef.current = SONGS[activeSongIndex].bpm;
  }, [activeSongIndex]);

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setComboMultiplier(1);
    setFailCounter(0);
    setFeedback(null);
    setShowResult(false);
    barPositionRef.current = 0;
    barPositionKRef.current = 0;
    barPositionIRef.current = 0;
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.7;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        isPlayingRef.current = true;
        gameLoop();
      }).catch(e => console.log("Audio play failed:", e));
    }
  };

  const stopGame = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = 1.0;
      if ('preservesPitch' in audioRef.current) {
        (audioRef.current as any).preservesPitch = true;
      }
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    setShowResult(true);
  }, []);

  const triggerFailEffect = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    
    if (audioRef.current) {
      audioRef.current.playbackRate = 0.6;
      if ('preservesPitch' in audioRef.current) {
        (audioRef.current as any).preservesPitch = false;
      }
      
      // Chopped effect - stutter the audio
      let chops = 0;
      const chopInterval = setInterval(() => {
        if (audioRef.current && chops < 6) {
          audioRef.current.currentTime -= 0.2; // Skip back slightly
          chops++;
        } else {
          clearInterval(chopInterval);
        }
      }, 400);

      setTimeout(() => {
        clearInterval(chopInterval);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.playbackRate = 1.0;
          if ('preservesPitch' in audioRef.current) {
            (audioRef.current as any).preservesPitch = true;
          }
        }
        setShowResult(true);
      }, 3500);
    } else {
      setShowResult(true);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', stopGame);
      return () => audio.removeEventListener('ended', stopGame);
    }
  }, [stopGame, activeSongIndex]);

  const gameLoop = () => {
    if (!isPlayingRef.current || !audioRef.current) return;

    const currentTime = audioRef.current.currentTime;
    // For a 150 BPM song, there are 2.5 beats per second
    const beatsPerSecond = songBpmRef.current / 60;
    
    // We want the bar to travel across the screen in exactly 1 beat.
    // currentBeat is a continuously increasing number (0.0 -> 1.0 -> 2.0 ...)
    const currentBeat = currentTime * beatsPerSecond;
    
    // beatProgress goes from 0 to 1 repeatedly.
    const beatProgress = currentBeat % 1;
    
    const hitZonePercentage = 0.90;
    
    // We want the position to be 0 at the start of the beat, and hitZonePercentage when the beat hits.
    // However, if we do a direct modulo, the bar jumps abruptly.
    // Let's use a simpler mapping: 
    // We want the bar to be at `hitZonePercentage * 100` when `beatProgress == 0` or `1`.
    // Actually, the easiest way to visualize this:
    // If the hit zone is at 90%, the bar should start at 0% when the beat is at 0.1 (of the previous beat).
    // Let's just offset the progress by 0.1 (which is 1 - 0.9).
    
    const offset = 1 - hitZonePercentage; // 0.10
    
    // J Lane (Kick) - On the beat. We subtract offset so when beatProgress is 0 (or 1), fraction is 0.9.
    let beatFraction = (beatProgress - offset);
    if (beatFraction < 0) beatFraction += 1;
    barPositionRef.current = beatFraction * 100;
    
    // K Lane (Snare) - On the offbeat (+0.5 beats)
    let beatFractionK = (beatProgress + 0.5 - offset);
    if (beatFractionK < 0) beatFractionK += 1;
    if (beatFractionK >= 1) beatFractionK -= 1;
    barPositionKRef.current = beatFractionK * 100;
    
    // I Lane (High Hats) - Twice as fast. We multiply beat by 2.
    const currentHalfBeat = currentBeat * 2;
    const halfBeatProgress = currentHalfBeat % 1;
    let beatFractionI = (halfBeatProgress - offset);
    if (beatFractionI < 0) beatFractionI += 1;
    barPositionIRef.current = beatFractionI * 100;

    // Force re-render for the bar
    const barEl = document.getElementById('moving-bar-j');
    if (barEl) {
      barEl.style.left = `${barPositionRef.current}%`;
    }
    
    const barElK = document.getElementById('moving-bar-k');
    if (barElK) {
      barElK.style.left = `${barPositionKRef.current}%`;
    }
    
    const barElI = document.getElementById('moving-bar-i');
    if (barElI) {
      barElI.style.left = `${barPositionIRef.current}%`;
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const handleHit = useCallback((lane: 'J' | 'K' | 'I') => {
    if (!isPlayingRef.current) return;
    
    let pos = 0;
    if (lane === 'J') pos = barPositionRef.current;
    if (lane === 'K') pos = barPositionKRef.current;
    if (lane === 'I') pos = barPositionIRef.current;
    // The "Bass Zone" is between 85% and 95%
    const targetMin = 85;
    const targetMax = 95;
    const perfectMin = 88;
    const perfectMax = 92;

    if (pos >= perfectMin && pos <= perfectMax) {
      setFeedback('PERFECT');
      
      setCombo(c => {
        const newCombo = c + 1;
        setMaxCombo(prev => Math.max(prev, newCombo));
        
        // Update multiplier based on Guitar Hero style thresholds
        if (newCombo >= 30) setComboMultiplier(4);
        else if (newCombo >= 20) setComboMultiplier(3);
        else if (newCombo >= 10) setComboMultiplier(2);
        else setComboMultiplier(1);
        
        return newCombo;
      });
      
      setScore(s => s + (100 * comboMultiplier));
    } else if (pos >= targetMin && pos <= targetMax) {
      setFeedback('GOOD');
      
      setCombo(c => {
        const newCombo = c + 1;
        setMaxCombo(prev => Math.max(prev, newCombo));
        
        if (newCombo >= 30) setComboMultiplier(4);
        else if (newCombo >= 20) setComboMultiplier(3);
        else if (newCombo >= 10) setComboMultiplier(2);
        else setComboMultiplier(1);
        
        return newCombo;
      });
      
      setScore(s => s + (50 * comboMultiplier));
    } else {
      setFeedback('MISS');
      setCombo(0);
      setComboMultiplier(1);
      setFailCounter(prev => {
        const newFail = prev + 1;
        if (newFail >= MAX_FAILS) {
          triggerFailEffect();
        }
        return newFail;
      });
    }

    // Clear feedback after a short delay
    setTimeout(() => setFeedback(null), 500);
  }, [triggerFailEffect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyJ' || e.code === 'KeyK' || e.code === 'KeyI' || e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        if (isPlaying) {
          if (e.code === 'KeyJ') handleHit('J');
          if (e.code === 'KeyK') handleHit('K');
          if (e.code === 'KeyI') handleHit('I');
          if (e.code === 'Space') {
             // In case they just press space, default to J for backwards compatibility
             handleHit('J');
          }
        } else {
          startGame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleHit]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm"
    >
      {/* Gothic Church Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black"></div>
      
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden font-sans flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-800/50 bg-black/50 z-10 relative">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white uppercase tracking-widest flex items-center gap-3">
              <Crown className="text-purple-500 w-5 h-5 sm:w-6 sm:h-6" />
              Bassgawd Rhythm Test
            </h2>
            <p className="text-xs text-zinc-500 font-serif italic mt-1">"You are blessed by the 808."</p>
          </div>
          <button 
            onClick={() => { stopGame(); onClose(); }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center relative">
          
          {/* Background Choir Image */}
          <div 
            className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen"
            style={{
              backgroundImage: `url(${choirImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: `grayscale(${failCounter > 0 ? (failCounter / MAX_FAILS) * 100 : 0}%) blur(${failCounter}px)`,
              opacity: isPlaying ? Math.max(0.1, 0.4 - (failCounter * 0.08)) : 0.2,
              transition: 'all 0.5s ease-out'
            }}
          />

          {isPlaying && (
            <motion.div
              className="absolute inset-0 z-0 pointer-events-none"
              animate={
                combo > 5 ? {
                  scale: [1, 1.02, 1],
                  opacity: [0.3, 0.5, 0.3],
                } : {}
              }
              transition={{
                duration: (60 / songBpmRef.current),
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                backgroundImage: `url(${choirImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                mixBlendMode: 'screen',
                clipPath: combo > 10 ? 'circle(100% at 50% 50%)' : `circle(${Math.max(0, 100 - (failCounter * 25))}% at 50% 50%)`
              }}
            />
          )}

          {/* Audio Element */}
          <audio 
            ref={audioRef} 
            src={SONGS[activeSongIndex].src} 
            preload="auto" 
          />

          {/* Song Selector & Difficulty */}
          {!isPlaying && !showResult && (
            <div className="w-full mb-8 z-10 relative">
              <h3 className="text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Select Track</h3>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {SONGS.map((song, idx) => (
                  <button
                    key={song.id}
                    onClick={() => setActiveSongIndex(idx)}
                    className={`px-4 py-2 rounded border text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                      activeSongIndex === idx 
                        ? 'border-purple-500 text-purple-400 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    {song.title}
                  </button>
                ))}
              </div>
              
              <h3 className="text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center mt-8">Difficulty</h3>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setDifficulty('medium')}
                  className={`px-6 py-2 rounded border text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                    difficulty === 'medium' 
                      ? 'border-blue-500 text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  Medium (Kick & Snare)
                </button>
                <button
                  onClick={() => setDifficulty('hard')}
                  className={`px-6 py-2 rounded border text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                    difficulty === 'hard' 
                      ? 'border-red-500 text-red-400 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  Hard (Add High Hats)
                </button>
              </div>
            </div>
          )}

          {/* Game Area */}
          <div className="w-full relative py-12 flex-1 flex flex-col justify-center z-10">
            
            {/* Score & Combo HUD */}
            <div className="absolute top-0 left-0 right-0 flex justify-between px-4">
              <div className="text-left">
                <span className="block text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Score</span>
                <span className="text-2xl font-display text-white">{score}</span>
              </div>
              
              {/* Combo Multiplier Meter */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center">
                 <div className="flex gap-1 mb-1">
                   {[2, 3, 4].map(mult => (
                     <div 
                       key={mult} 
                       className={`w-6 h-2 rounded-sm ${comboMultiplier >= mult ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-zinc-800'}`}
                     />
                   ))}
                 </div>
                 <AnimatePresence mode="wait">
                   <motion.span 
                     key={comboMultiplier}
                     initial={{ scale: 1.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className={`text-xl font-black font-display tracking-widest italic ${
                       comboMultiplier === 4 ? 'text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]' :
                       comboMultiplier === 3 ? 'text-blue-400' :
                       comboMultiplier === 2 ? 'text-green-400' : 'text-zinc-600'
                     }`}
                   >
                     {comboMultiplier}x
                   </motion.span>
                 </AnimatePresence>
                 {comboMultiplier === 4 && (
                   <motion.div 
                     animate={{ opacity: [0.5, 1, 0.5] }}
                     transition={{ repeat: Infinity, duration: 1 }}
                     className="text-[8px] text-purple-400 font-bold tracking-[0.3em] uppercase mt-1"
                   >
                     HOLY STREAK
                   </motion.div>
                 )}
              </div>

              <div className="text-right">
                <span className="block text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Combo</span>
                <AnimatePresence mode="popLayout">
                  <motion.span 
                    key={combo}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className={`text-2xl font-display block ${
                      comboMultiplier === 4 ? 'text-purple-400 font-black drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]' :
                      combo > 5 ? 'text-white font-bold' : 'text-zinc-500'
                    }`}
                  >
                    {combo}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* Main Track - Lane J (Kick) */}
            <div className="relative w-full h-16 sm:h-20 bg-black/80 rounded-lg border border-zinc-800 overflow-hidden shadow-inner mt-8">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex" style={{ backgroundSize: '25% 100%', backgroundImage: 'linear-gradient(to right, transparent 95%, rgba(255,255,255,0.05) 100%)' }}></div>
              
              {/* Target Bass Zone */}
              <div className="absolute top-0 bottom-0 w-[10%] left-[85%] bg-gradient-to-r from-purple-900/20 to-purple-500/40 border-l-2 border-r-2 border-purple-500/50 flex flex-col justify-center items-center">
                <span className="text-[10px] text-purple-200/80 font-bold tracking-widest uppercase">J</span>
              </div>

              {/* The Moving Bar */}
              <div 
                id="moving-bar-j"
                className="absolute top-0 bottom-0 w-2 sm:w-3 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10"
                style={{ left: '0%' }}
              />
            </div>
            
            {/* Main Track - Lane K (Snare) */}
            <div className="relative w-full h-16 sm:h-20 bg-black/80 rounded-lg border border-zinc-800 overflow-hidden shadow-inner mt-4">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex" style={{ backgroundSize: '25% 100%', backgroundImage: 'linear-gradient(to right, transparent 95%, rgba(255,255,255,0.05) 100%)' }}></div>
              
              {/* Target Bass Zone */}
              <div className="absolute top-0 bottom-0 w-[10%] left-[85%] bg-gradient-to-r from-blue-900/20 to-blue-500/40 border-l-2 border-r-2 border-blue-500/50 flex flex-col justify-center items-center">
                <span className="text-[10px] text-blue-200/80 font-bold tracking-widest uppercase">K</span>
              </div>

              {/* The Moving Bar */}
              <div 
                id="moving-bar-k"
                className="absolute top-0 bottom-0 w-2 sm:w-3 bg-blue-300 rounded-full shadow-[0_0_20px_rgba(147,197,253,0.8)] z-10"
                style={{ left: '0%' }}
              />
            </div>
            
            {/* Main Track - Lane I (High Hats - Hard Mode Only) */}
            {difficulty === 'hard' && (
              <div className="relative w-full h-16 sm:h-20 bg-black/80 rounded-lg border border-zinc-800 overflow-hidden shadow-inner mt-4">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex" style={{ backgroundSize: '12.5% 100%', backgroundImage: 'linear-gradient(to right, transparent 95%, rgba(255,255,255,0.05) 100%)' }}></div>
                
                {/* Target Bass Zone */}
                <div className="absolute top-0 bottom-0 w-[10%] left-[85%] bg-gradient-to-r from-red-900/20 to-red-500/40 border-l-2 border-r-2 border-red-500/50 flex flex-col justify-center items-center">
                  <span className="text-[10px] text-red-200/80 font-bold tracking-widest uppercase">I</span>
                </div>

                {/* The Moving Bar */}
                <div 
                  id="moving-bar-i"
                  className="absolute top-0 bottom-0 w-2 sm:w-3 bg-red-300 rounded-full shadow-[0_0_20px_rgba(248,113,113,0.8)] z-10"
                  style={{ left: '0%' }}
                />
              </div>
            )}

            {/* Interaction Instructions */}
            {!isPlaying && !showResult && (
              <div className="mt-12 text-center animate-pulse">
                <p className="text-zinc-400 font-bold tracking-[0.2em] uppercase text-sm">
                  Press <span className="text-white bg-zinc-800 px-3 py-1 rounded mx-2">J</span> 
                  or <span className="text-white bg-zinc-800 px-3 py-1 rounded mx-2">K</span> 
                  {difficulty === 'hard' && <span>or <span className="text-white bg-zinc-800 px-3 py-1 rounded mx-2">I</span></span>} 
                  to Start
                </p>
              </div>
            )}
            {isPlaying && (
              <div className="mt-12 text-center">
                 <p className="text-zinc-500 text-xs tracking-widest uppercase mb-4">
                   Tap J (Kick), K (Snare){difficulty === 'hard' && ', and I (Hats)'} on the beat
                 </p>
                 <div className="sm:hidden flex gap-4 w-full">
                   <button 
                    onClick={() => handleHit('J')}
                    className="flex-1 py-4 bg-zinc-800 active:bg-purple-900 text-white rounded font-bold uppercase tracking-widest"
                   >
                     J
                   </button>
                   <button 
                    onClick={() => handleHit('K')}
                    className="flex-1 py-4 bg-zinc-800 active:bg-blue-900 text-white rounded font-bold uppercase tracking-widest"
                   >
                     K
                   </button>
                   {difficulty === 'hard' && (
                     <button 
                      onClick={() => handleHit('I')}
                      className="flex-1 py-4 bg-zinc-800 active:bg-red-900 text-white rounded font-bold uppercase tracking-widest"
                     >
                       I
                     </button>
                   )}
                 </div>
              </div>
            )}

            {/* Feedback Sprite Animation */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: -20, scale: 1.2 }}
                  exit={{ opacity: 0, scale: 1.5, filter: "blur(4px)" }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                >
                  {feedback === 'PERFECT' && (
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-display font-black text-purple-400 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] italic">HOLY BASS</span>
                    </div>
                  )}
                  {feedback === 'GOOD' && <span className="text-2xl font-black text-white uppercase tracking-widest italic">GOOD</span>}
                  {feedback === 'MISS' && <span className="text-xl font-bold text-red-500 uppercase tracking-widest">MISS</span>}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
          
          {/* Results Screen */}
          {showResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 bg-zinc-950/95 backdrop-blur z-20 flex flex-col items-center justify-center p-8 text-center"
            >
              <Trophy className="w-16 h-16 text-purple-500 mb-6" />
              {failCounter >= MAX_FAILS ? (
                <>
                  <h3 className="text-3xl font-display font-bold text-red-500 uppercase tracking-widest mb-2">The Choir Has Left</h3>
                  <p className="text-zinc-400 font-serif italic text-lg mb-8">"You missed too many beats and lost the congregation."</p>
                </>
              ) : (
                <>
                  <h3 className="text-3xl font-display font-bold text-white uppercase tracking-widest mb-2">Ceremony Complete</h3>
                  {score > 1000 ? (
                    <p className="text-purple-400 font-serif italic text-xl mb-8">"You are blessed by the 808."</p>
                  ) : (
                    <p className="text-zinc-400 font-serif italic text-lg mb-8">"Your frequencies need tuning. Try again."</p>
                  )}
                </>
              )}
              
              <div className="flex gap-12 mb-12 text-left">
                <div>
                  <span className="block text-xs text-zinc-500 uppercase tracking-widest">Final Score</span>
                  <span className="text-4xl font-display text-white">{score}</span>
                </div>
                <div>
                  <span className="block text-xs text-zinc-500 uppercase tracking-widest">Max Combo</span>
                  <span className="text-4xl font-display text-white">{combo}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowResult(false)}
                  className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold uppercase tracking-widest transition-colors text-xs"
                >
                  Play Again
                </button>
                <button 
                  onClick={onClose}
                  className="px-8 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded font-bold uppercase tracking-widest transition-colors text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </motion.div>
  );
}
