import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { UnfoldingLetter } from "@/components/ui/origami";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Paintbrush, Layers, Music, Disc, Radio, Sliders, ChevronDown, Headphones, Shirt, Calendar, Instagram, Youtube, Mail, Video, User, LogOut } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import bassgawdLogo from "@assets/bassgawd_transparent_1772772440526.png";
import churchAudioCoverLogo from "@assets/IMG_1748_1772756436624.png";
import newReedLogo from "@assets/reed_transparent_1772772444436.png";
import hallwaysLogo from "@assets/hallways_logo_transparent_1772772717102.png";
import tornPaper from "@assets/876c6436e392a49d3fa779e16bc3d62b_1772761411867.jpg";
import tearSoundUrl from "@assets/Torn_Paper_1772761554583.mp3";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/AuthModal";

export default function Home() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const alreadyOpened = window.location.search.includes('opened=true') || sessionStorage.getItem('tearOpened') === '1';
  const [isUnfolded, setIsUnfolded] = useState(() => alreadyOpened);
  const [showContent, setShowContent] = useState(() => alreadyOpened);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Motion values for the tearing effect
  const initialDragY = alreadyOpened ? 800 : 0;
  const dragY = useMotionValue(initialDragY);
  const openness = useTransform(dragY, (y) => Math.abs(y) * 1.5);
  
  const topY = useTransform(openness, (v) => -v);
  const bottomY = useTransform(openness, (v) => v);
  const logoOpacity = useTransform(openness, [0, 40], [1, 0]);
  const logoScale = useTransform(openness, [0, 150], [1, 1.05]);
  const blockerOpacity = useTransform(openness, [0, 30], [1, 0]);
  const tearBlur = useTransform(openness, [0, 100, 800], ["blur(0px)", "blur(3px)", "blur(6px)"]);

  // Function to unlock audio on iOS
  const unlockAudio = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.volume = 0;
      audioRef.current.play().then(() => {
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.volume = 0.5;
      }).catch(e => console.log("Audio unlock failed:", e));
    }
  };

  useEffect(() => {
    if (isUnfolded) {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
    } else {
      document.body.style.overflow = 'hidden';
      // Fix for iOS Safari bounce
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
    };
  }, [isUnfolded]);

  const handleDragEnd = (e: any, info: any) => {
    if (isUnfolded) return;
    
    // If dragged enough, trigger the unfold
    if (Math.abs(info.offset.y) > 80) {
      setIsUnfolded(true);
      sessionStorage.setItem('tearOpened', '1');
      
      // Play tear sound via ref
      if (audioRef.current) {
        audioRef.current.volume = 0.5;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.log("Audio play failed:", e));
        }
      }

      // Animate drag to fully open
      animate(dragY, 800, { 
        duration: 1.4, 
        ease: [0.34, 1.56, 0.64, 1] 
      });
      setTimeout(() => setShowContent(true), 600);
    } else {
      animate(dragY, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  const handleRefold = () => {
    setShowContent(false);
    setIsUnfolded(false);
    animate(dragY, 0, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1]
    });
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#fcfcfc] flex flex-col items-center justify-start sm:justify-center p-4 sm:p-8 font-sans">
      <audio ref={audioRef} src={tearSoundUrl} preload="auto" />
      
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0">
        <div className="w-[800px] h-[800px] rounded-full border border-black/[0.03] absolute -translate-x-1/2 translate-y-1/4" />
        <div className="w-[1200px] h-[1200px] rounded-full border border-black/[0.03] absolute translate-x-1/4 -translate-y-1/4" />
      </div>

      {/* The Origami Content */}
      <div className="max-w-4xl w-full mx-auto relative z-10 my-16 sm:my-24">
        <UnfoldingLetter 
          isOpen={isUnfolded} 
          onComplete={() => {}}
          panels={[
            // Panel 1: Center (The base)
            <div key="panel-1" className="min-h-[350px] flex flex-col justify-center items-center text-center py-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showContent ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="px-4 w-full flex flex-col items-center"
              >
                <img src={churchAudioCoverLogo} alt="The Church Audio" className="w-32 sm:w-40 mb-4 opacity-80" />
                <h2 className="text-3xl font-display font-medium text-white mb-6 tracking-tight uppercase">WELCOME TO THE CHURCH</h2>
                
                {/* Social Media Links under Welcome */}
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : -5 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex justify-center gap-4 mb-8"
                >
                  <a href="#" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white hover:scale-110 transition-all">
                    <Instagram size={16} strokeWidth={1.5} />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white hover:scale-110 transition-all">
                    <Youtube size={16} strokeWidth={1.5} />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white hover:scale-110 transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                    </svg>
                  </a>
                  <a href="mailto:bassgawdlives@gmail.com" className="text-white/40 hover:text-white hover:scale-110 transition-all">
                    <Mail size={16} strokeWidth={1.5} />
                  </a>
                </motion.div>

                <div className="text-white/60 max-w-2xl mx-auto space-y-4 font-sans font-light text-sm tracking-wide text-left leading-relaxed">
                  <p>
                    The Bassgawd (aka reed.) is a Los Angeles–based producer and musician known for genre-blending records that move seamlessly between R&B, hip-hop, metal, and experimental sound design. Born in New Orleans, his sound carries deep musical roots while pushing aggressively forward—heavy low-end, emotional textures, and unpredictable arrangements.
                  </p>
                  <p>
                    He has worked with artists including Lil Wayne, Jelly Roll, Waka Flocka, OG Maco, Lil Xan, and others, while also handling songwriting, production, mixing, and mastering. Whether crafting intimate records or explosive anthems, The Bassgawd's work is defined by versatility, precision, and a signature "reed." sound that refuses to sit in one lane.
                  </p>
                </div>
                <div className="mt-10 grid grid-cols-5 gap-2 sm:gap-6 max-w-2xl mx-auto relative h-auto">
                  <div 
                    className="flex flex-col items-center cursor-pointer group"
                    onMouseEnter={() => setActiveCategory('music')}
                  >
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center mb-3 transition-colors ${activeCategory === 'music' ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/10 text-white/80 group-hover:bg-white/10'}`}>
                      <Headphones size={18} strokeWidth={1.5} />
                    </div>
                    <span className={`text-[8px] sm:text-[9px] uppercase tracking-widest font-bold text-center transition-colors ${activeCategory === 'music' ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`}>Music</span>
                  </div>
                  <div 
                    className="flex flex-col items-center cursor-pointer group"
                    onMouseEnter={() => setActiveCategory('videos')}
                  >
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center mb-3 transition-colors ${activeCategory === 'videos' ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/10 text-white/80 group-hover:bg-white/10'}`}>
                      <Video size={18} strokeWidth={1.5} />
                    </div>
                    <span className={`text-[8px] sm:text-[9px] uppercase tracking-widest font-bold text-center transition-colors ${activeCategory === 'videos' ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`}>Videos</span>
                  </div>
                  <div 
                    className="flex flex-col items-center cursor-pointer group"
                    onMouseEnter={() => setActiveCategory('audio')}
                  >
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center mb-3 transition-colors ${activeCategory === 'audio' ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/10 text-white/80 group-hover:bg-white/10'}`}>
                      <Sliders size={18} strokeWidth={1.5} />
                    </div>
                    <span className={`text-[8px] sm:text-[9px] uppercase tracking-widest font-bold text-center leading-tight transition-colors ${activeCategory === 'audio' ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`}>Audio Production</span>
                  </div>
                  <div 
                    className="flex flex-col items-center cursor-pointer group"
                    onMouseEnter={() => setActiveCategory('merch')}
                  >
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center mb-3 transition-colors ${activeCategory === 'merch' ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/10 text-white/80 group-hover:bg-white/10'}`}>
                      <Shirt size={18} strokeWidth={1.5} />
                    </div>
                    <span className={`text-[8px] sm:text-[9px] uppercase tracking-widest font-bold text-center transition-colors ${activeCategory === 'merch' ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`}>Merch</span>
                  </div>
                  <div 
                    className="flex flex-col items-center cursor-pointer group"
                    onMouseEnter={() => setActiveCategory('shows')}
                  >
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center mb-3 transition-colors ${activeCategory === 'shows' ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/10 text-white/80 group-hover:bg-white/10'}`}>
                      <Calendar size={18} strokeWidth={1.5} />
                    </div>
                    <span className={`text-[8px] sm:text-[9px] uppercase tracking-widest font-bold text-center transition-colors ${activeCategory === 'shows' ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`}>Shows</span>
                  </div>
                </div>

                {/* Hover Submenus */}
                <div className="h-8 sm:h-10 mt-6 sm:mt-8 relative w-full flex justify-center">
                  <AnimatePresence mode="wait">
                    {activeCategory === 'audio' && (
                      <motion.div
                        key="audio-menu"
                        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ duration: 0.2 }}
                        className="absolute flex gap-4 sm:gap-6 text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-white/60"
                      >
                        <Link href="/software"><span className="cursor-pointer hover:text-white transition-colors" style={{ fontFamily: "'Cinzel', serif" }}>Software</span></Link>
                        <span className="cursor-pointer hover:text-white transition-colors">Plugins</span>
                        <Link href="/sample-packs"><span className="cursor-pointer hover:text-white transition-colors">Sample Packs</span></Link>
                        <Link href="/tutorials"><span className="cursor-pointer hover:text-white transition-colors">Tutorials</span></Link>
                        <Link href="/blog"><span className="cursor-pointer hover:text-white transition-colors">Blog</span></Link>
                      </motion.div>
                    )}
                    {activeCategory === 'music' && (
                      <motion.div
                        key="music-menu"
                        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ duration: 0.2 }}
                        className="absolute flex gap-4 sm:gap-8 text-[12px] sm:text-[14px] uppercase tracking-[0.2em] font-bold text-white/60"
                      >
                        <Link href="/bassgawd">
                          <span className="cursor-pointer hover:text-white transition-colors rgb-hover group">
                            <span className="effect-target inline-block">Bassgawd</span>
                          </span>
                        </Link>
                        <Link href="/reed">
                          <span className="cursor-pointer hover:text-white transition-colors scratchy-hover group">
                            <span className="effect-target inline-block [clip-path:inset(0_0_22%_0)]">Reed</span>
                          </span>
                        </Link>
                        <Link href="/hallways">
                          <span className="cursor-pointer hover:text-white transition-colors glitch-wrapper group inline-block">
                            <span className="relative z-10">Hallways</span>
                            <span className="glitch-layer absolute inset-0 text-white flex items-center justify-center">Hallways</span>
                            <span className="glitch-layer absolute inset-0 text-white flex items-center justify-center">Hallways</span>
                          </span>
                        </Link>
                      </motion.div>
                    )}
                    {activeCategory === 'merch' && (
                      <motion.div
                        key="merch-menu"
                        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ duration: 0.2 }}
                        className="absolute flex gap-4 sm:gap-6 text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-white/60"
                      >
                        <Link href="/merch"><span className="cursor-pointer hover:text-white transition-colors">Shirts</span></Link>
                        <Link href="/merch"><span className="cursor-pointer hover:text-white transition-colors">Hoodies</span></Link>
                        <Link href="/merch"><span className="cursor-pointer hover:text-white transition-colors">Vinyl</span></Link>
                        <Link href="/merch"><span className="cursor-pointer hover:text-white transition-colors">Accessories</span></Link>
                      </motion.div>
                    )}
                    {activeCategory === 'shows' && (
                      <motion.div
                        key="shows-menu"
                        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ duration: 0.2 }}
                        className="absolute flex gap-4 sm:gap-6 text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-white/60"
                      >
                        <Link href="/tour" className="cursor-pointer hover:text-white transition-colors">Tour Dates</Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!user && (
                  <div className="mt-6 flex flex-col items-center gap-3">
                    <div className="w-12 h-[1px] bg-white/10" />
                    <Button
                      data-testid="button-signin-bottom"
                      variant="outline"
                      className="rounded-none border-white/20 hover:bg-white/5 text-white bg-transparent px-6 py-2 text-xs uppercase tracking-widest font-bold"
                      onClick={() => setShowAuthModal(true)}
                    >
                      <User size={12} className="mr-2" /> Sign In / Join
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>,
            
            // Panel 2: Top (Folds up)
            <div key="panel-2" className="h-[250px] flex flex-col justify-end pb-10">
               <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 10 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="px-4 flex flex-col items-center transform-gpu"
              >
                <img 
                  src={churchAudioCoverLogo} 
                  alt="The Church Audio" 
                  className="w-48 sm:w-64 mb-6" 
                  style={{ transform: "translateZ(1px)" }} 
                />
              </motion.div>
            </div>,

            // Panel 3: Bottom (Folds down)
            <div key="panel-3" className="h-[250px] flex flex-col justify-start pt-6 sm:pt-8">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : -10 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col items-center sm:items-start sm:flex-row justify-between w-full px-8"
              >
                <div className="mb-8 sm:mb-0 text-center sm:text-left">
                  {user ? (
                    <>
                      <h3 className="text-lg font-display font-medium text-white mb-3 tracking-wide uppercase text-[12px]">Welcome, {user.username}</h3>
                      <p className="text-white/50 mb-8 max-w-[240px] font-light leading-relaxed text-xs mx-auto sm:mx-0">
                        You have full access to sample packs, plugins, and more.
                      </p>
                      <Button
                        data-testid="button-logout-home"
                        variant="outline"
                        className="rounded-none border-white/20 hover:bg-white/5 text-white bg-transparent px-6 py-2 text-xs uppercase tracking-widest font-bold"
                        onClick={() => logout()}
                      >
                        <LogOut size={12} className="mr-2" /> Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-display font-medium text-white mb-3 tracking-wide uppercase text-[12px]">Join The Church</h3>
                      <p className="text-white/50 mb-8 max-w-[240px] font-light leading-relaxed text-xs mx-auto sm:mx-0">
                        Sign up for exclusive access to new sample packs, audio tutorials, plugins, underground releases, and more.
                      </p>
                      <Button
                        data-testid="button-join-church"
                        variant="outline"
                        className="rounded-none border-white/20 hover:bg-white/5 text-white bg-transparent px-6 py-2 text-xs uppercase tracking-widest font-bold"
                        onClick={() => setShowAuthModal(true)}
                      >
                        <User size={12} className="mr-2" /> Join
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="text-center sm:text-right text-[9px] text-white/30 font-bold uppercase tracking-[0.2em] relative -top-6 sm:-top-2">
                  <p>STREAMING EVERYWHERE</p>
                  <p className="mt-3">BASED IN THE VOID</p>
                  <p className="mt-3 text-white/10">© 2026 BASSGAWD</p>
                </div>
              </motion.div>
            </div>
          ]}
        />
        
        {isUnfolded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="mt-16 text-center pb-12 relative z-20"
          >
            <button 
              onClick={handleRefold}
              className="text-[10px] text-black/20 hover:text-black uppercase tracking-[0.4em] font-bold transition-all duration-300"
            >
              [ Refold ]
            </button>
          </motion.div>
        )}
      </div>

      {/* Solid Black Blocker (Fades out quickly as you tear to reveal light) */}
      <motion.div 
        className="fixed inset-0 bg-black pointer-events-none z-30"
        style={{ opacity: blockerOpacity }}
      />

      {/* Torn Paper Overlays (Moves apart to reveal content) */}
      <motion.div 
        className="fixed inset-0 z-40 pointer-events-none" 
        style={{ mixBlendMode: 'multiply', filter: tearBlur }}
      >
        {/* Top Half of Screen - Solid Black to start */}
        <motion.div 
          className="absolute left-0 w-full h-[51vh] bg-black"
          style={{ top: 0, y: topY }}
        >
          {/* Top Torn Edge hanging below the black half */}
          <img 
            src={tornPaper} 
            className="absolute top-[98%] left-1/2 -translate-x-1/2 w-[300vw] max-w-none h-[25vh] object-cover object-[center_25%]" 
            alt=""
          />
        </motion.div>
        
        {/* Bottom Half of Screen - Solid Black to start */}
        <motion.div 
          className="absolute left-0 w-full h-[51vh] bg-black"
          style={{ bottom: 0, y: bottomY }}
        >
          {/* Bottom Torn Edge hanging above the black half */}
          <img 
            src={tornPaper} 
            className="absolute bottom-[98%] left-1/2 -translate-x-1/2 w-[300vw] max-w-none h-[25vh] object-cover object-[center_75%]" 
            alt=""
          />
        </motion.div>
      </motion.div>

      {/* Draggable Interaction Layer (The visible Logo initially) */}
      <AnimatePresence>
        {!isUnfolded && (
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            onTouchStart={unlockAudio}
            onPointerDown={unlockAudio}
            style={{ y: dragY }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <motion.div style={{ opacity: logoOpacity, scale: logoScale }} className="flex flex-col items-center">
              <img 
                src={churchAudioCoverLogo} 
                alt="The Church Audio" 
                className="w-64 sm:w-[450px] h-auto pointer-events-none select-none"
                draggable="false"
              />
              {/* Social Media Links under Intro Logo */}
              <div 
                className="mt-8 mb-6 flex justify-center gap-6 relative z-50"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white hover:scale-110 transition-all cursor-pointer">
                  <Instagram size={20} strokeWidth={1.5} />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white hover:scale-110 transition-all cursor-pointer">
                  <Youtube size={20} strokeWidth={1.5} />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white hover:scale-110 transition-all cursor-pointer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                </a>
                <a href="mailto:bassgawdlives@gmail.com" className="text-white/40 hover:text-white hover:scale-110 transition-all cursor-pointer">
                  <Mail size={20} strokeWidth={1.5} />
                </a>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center relative">
                <p className="text-[12px] text-white/50 font-bold tracking-[0.4em] uppercase transition-colors relative z-10 select-none overflow-hidden pb-1">
                  <motion.span
                    className="inline-block"
                    animate={{ 
                      backgroundPosition: ["200% 0", "-200% 0"]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 3, 
                      ease: "linear"
                    }}
                    style={{
                      backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.2) 100%)",
                      backgroundSize: "200% 100%",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}
                  >
                    Tear to open
                  </motion.span>
                </p>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="mt-3 text-white/40"
                >
                  <ChevronDown size={20} strokeWidth={1.5} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}} />
    </div>
  );
}