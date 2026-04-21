import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { HolyTablet } from "@/components/ui/HolyTablet";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/AuthModal";
import { useQuery } from "@tanstack/react-query";
import type { SavedSong } from "@shared/schema";
import tabletBg from "@assets/0BC0EC31-EF14-4D49-984B-92619DBCC236_1773402086433.png";
import { Plus, FolderOpen, ArrowLeft } from "lucide-react";

const cinzel = { fontFamily: "'Cinzel', 'Palatino Linotype', 'Book Antiqua', Palatino, serif" };

export default function HolyTabletPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mode, setMode] = useState<'browser' | 'tablet'>('browser');
  const [loadedSong, setLoadedSong] = useState<SavedSong | null>(null);

  const { data: savedSongs = [] } = useQuery<SavedSong[]>({
    queryKey: ['/api/saved-songs'],
    enabled: !!user,
  });

  useEffect(() => {
    if ((window as any).stopMusicPlayback) {
      (window as any).stopMusicPlayback();
    }
  }, []);

  const handleNewSong = () => {
    setLoadedSong(null);
    setMode('tablet');
  };

  const handleLoadSong = (song: SavedSong) => {
    setLoadedSong(song);
    setMode('tablet');
  };

  const handleBackToBrowser = () => {
    setMode('browser');
    setLoadedSong(null);
  };

  if (mode === 'tablet') {
    return (
      <div className="min-h-screen" style={{ background: '#0a0806' }}>
        <HolyTablet
          onClose={() => navigate("/software")}
          initialSong={loadedSong}
          onBackToBrowser={handleBackToBrowser}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at center, #2a1f14 0%, #0d0906 70%, #000 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: `url(${tabletBg})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(30px) saturate(0.3)' }}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg z-10"
      >
        <button onClick={() => navigate("/software")}
          className="mb-6 text-[10px] tracking-[0.2em] uppercase flex items-center gap-2 hover:brightness-150 transition-all"
          style={{ ...cinzel, color: '#5a4d3a' }}
        >
          <ArrowLeft size={14} /> Back to Software
        </button>

        <div className="rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #8B7355 0%, #A0896C 15%, #9C8868 30%, #8B7355 50%, #7A6548 70%, #6B5A3E 85%, #5C4E35 100%)',
            boxShadow: 'inset 0 2px 4px rgba(190,170,140,0.4), inset 0 -3px 6px rgba(40,30,15,0.5), 0 20px 60px rgba(0,0,0,0.8)',
            border: '2px solid rgba(110,90,60,0.6)',
          }}
        >
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] opacity-20" style={{ color: '#3d2f1c' }}>𓂀</span>
              <h2 className="text-lg tracking-[0.25em] uppercase font-bold"
                style={{ ...cinzel, color: '#3d2f1c', textShadow: '0 1px 0 rgba(190,170,140,0.4)' }}>
                BASSGAWD's HOLYTABLET
              </h2>
            </div>
            <p className="text-[8px] tracking-[0.2em] uppercase ml-5" style={{ ...cinzel, color: '#5a4d3a' }}>
              Sacred Beat Machine
            </p>
          </div>

          <div className="mx-4 mb-4 rounded-lg p-4"
            style={{
              background: 'linear-gradient(180deg, #1a1510 0%, #0f0c08 50%, #1a1510 100%)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8), 0 1px 0 rgba(190,170,140,0.15)',
              border: '1px solid #2a2218',
            }}
          >
            <button
              data-testid="button-new-song"
              onClick={handleNewSong}
              className="w-full mb-3 py-3 rounded-md flex items-center justify-center gap-2 transition-all hover:brightness-110"
              style={{
                ...cinzel,
                background: 'linear-gradient(180deg, #c4956a, #8b6540)',
                color: '#1a1510',
                boxShadow: '0 2px 8px rgba(196,149,106,0.3), inset 0 1px 1px rgba(255,220,180,0.2)',
                border: '1px solid rgba(196,149,106,0.4)',
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase' as const,
                fontWeight: 'bold',
              }}
            >
              <Plus size={14} /> New Beat
            </button>

            <div className="mt-1">
              <div className="flex items-center gap-2 mb-2">
                <FolderOpen size={12} style={{ color: '#5a4d3a' }} />
                <span className="text-[8px] tracking-[0.2em] uppercase" style={{ ...cinzel, color: '#5a4d3a' }}>
                  {user ? 'Your Saved Beats' : 'Sign in to load saved beats'}
                </span>
              </div>

              {user ? (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {savedSongs.length === 0 ? (
                    <p className="text-[9px] tracking-[0.15em] uppercase text-center py-4" style={{ ...cinzel, color: '#3d2f1c' }}>
                      𓏏 No saved beats yet 𓏏
                    </p>
                  ) : (
                    savedSongs.map(song => (
                      <button
                        key={song.id}
                        data-testid={`button-load-recent-${song.id}`}
                        onClick={() => handleLoadSong(song)}
                        className="w-full text-left px-3 py-2 rounded transition-all hover:brightness-125"
                        style={{
                          background: 'rgba(40,30,15,0.3)',
                          border: '1px solid rgba(40,30,15,0.3)',
                        }}
                      >
                        <span className="text-[10px] tracking-wider" style={{ ...cinzel, color: '#c4956a' }}>
                          𓊃 {song.title}
                        </span>
                        <span className="text-[8px] ml-2" style={{ color: '#5a4d3a' }}>
                          {song.bpm} BPM
                        </span>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[8px] tracking-[0.12em] uppercase mb-2" style={{ ...cinzel, color: '#3d2f1c' }}>
                    You can still make beats without an account
                  </p>
                  <button onClick={() => setShowAuthModal(true)}
                    className="text-[9px] tracking-[0.15em] uppercase px-4 py-1.5 rounded transition-all hover:brightness-110"
                    style={{ ...cinzel, background: 'rgba(196,149,106,0.15)', color: '#c4956a', border: '1px solid rgba(196,149,106,0.3)' }}
                  >
                    Sign In to Save & Load
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
