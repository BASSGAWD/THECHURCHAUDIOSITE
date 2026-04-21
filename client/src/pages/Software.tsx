import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Tablet, Puzzle, Package } from "lucide-react";
import tabletBg from "@assets/0BC0EC31-EF14-4D49-984B-92619DBCC236_1773402086433.png";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/AuthModal";
import { useState } from "react";
import { Lock } from "lucide-react";

const cinzel = { fontFamily: "'Cinzel', serif" };

export default function Software() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0806 0%, #1a1510 30%, #0d0b08 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/?opened=true">
            <button className="text-[10px] tracking-[0.2em] uppercase flex items-center gap-2 hover:brightness-150 transition-all"
              style={{ ...cinzel, color: '#5a4d3a' }}>
              <ArrowLeft size={14} /> Back
            </button>
          </Link>
          <h1 className="text-2xl sm:text-3xl tracking-[0.3em] uppercase" style={{ ...cinzel, color: '#c4956a' }}>
            Software
          </h1>
        </div>

        <p className="text-[11px] tracking-[0.2em] uppercase max-w-lg mb-12" style={{ ...cinzel, color: '#5a4d3a' }}>
          Audio production tools, instruments, and creative software by The Church Audio
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/holytablet">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer rounded-lg overflow-hidden group"
              style={{
                background: 'linear-gradient(145deg, #2a2218 0%, #1a1510 50%, #0d0b08 100%)',
                border: '1px solid rgba(90,77,58,0.25)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              <div className="relative h-48 overflow-hidden">
                <img src={tabletBg} alt="BASSGAWD's HolyTablet" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b08] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Tablet size={14} style={{ color: '#c4956a' }} />
                    <span className="text-lg tracking-[0.25em] uppercase" style={{ ...cinzel, color: '#c4956a' }}>
                      HolyTablet
                    </span>
                  </div>
                  <p className="text-[8px] tracking-[0.15em] uppercase" style={{ ...cinzel, color: '#7a6d58' }}>
                    BASSGAWD's Sacred Beat Machine
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[9px] tracking-[0.12em] leading-relaxed" style={{ ...cinzel, color: '#5a4d3a' }}>
                  16-pad MPC-style beat maker with synthesized sounds, 16-step sequencer, MIDI/gamepad support, save & WAV export.
                </p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {['Beat Maker', 'Sequencer', 'MIDI', 'Export'].map(tag => (
                    <span key={tag} className="text-[7px] px-2 py-0.5 rounded-full tracking-[0.15em] uppercase"
                      style={{ ...cinzel, background: 'rgba(196,149,106,0.1)', color: '#8b7355', border: '1px solid rgba(90,77,58,0.2)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </Link>

          <div className="rounded-lg overflow-hidden opacity-40 cursor-not-allowed"
            style={{
              background: 'linear-gradient(145deg, #2a2218 0%, #1a1510 50%, #0d0b08 100%)',
              border: '1px solid rgba(90,77,58,0.15)',
            }}
          >
            <div className="h-48 flex items-center justify-center" style={{ background: 'rgba(26,21,16,0.4)' }}>
              <Puzzle size={32} style={{ color: '#3d2f1c' }} />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={12} style={{ color: '#3d2f1c' }} />
                <span className="text-sm tracking-[0.2em] uppercase" style={{ ...cinzel, color: '#3d2f1c' }}>Plugins</span>
              </div>
              <p className="text-[9px] tracking-[0.12em]" style={{ ...cinzel, color: '#2a2218' }}>Coming Soon</p>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden opacity-40 cursor-not-allowed"
            style={{
              background: 'linear-gradient(145deg, #2a2218 0%, #1a1510 50%, #0d0b08 100%)',
              border: '1px solid rgba(90,77,58,0.15)',
            }}
          >
            <div className="h-48 flex items-center justify-center" style={{ background: 'rgba(26,21,16,0.4)' }}>
              <Package size={32} style={{ color: '#3d2f1c' }} />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={12} style={{ color: '#3d2f1c' }} />
                <span className="text-sm tracking-[0.2em] uppercase" style={{ ...cinzel, color: '#3d2f1c' }}>Presets</span>
              </div>
              <p className="text-[9px] tracking-[0.12em]" style={{ ...cinzel, color: '#2a2218' }}>Coming Soon</p>
            </div>
          </div>
        </div>
      </div>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
