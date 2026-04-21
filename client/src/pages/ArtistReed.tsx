import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Play, Disc } from "lucide-react";
import newReedLogo from "@assets/reed_transparent_1772772444436.png";

export default function ArtistReed() {
  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-white flex flex-col font-sans overflow-x-hidden p-6 sm:p-12 relative selection:bg-white selection:text-black">
      {/* Heavy noise overlay for Reed's gritty aesthetic */}
      <div className="fixed inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.5\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

      <nav className="relative z-20 flex items-center justify-between mb-16 sm:mb-24 max-w-7xl mx-auto w-full">
        <Link href="/?opened=true">
          <div className="cursor-pointer group flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-300">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Back to Church</span>
          </div>
        </Link>
      </nav>

      <main className="flex-grow flex flex-col items-center max-w-5xl mx-auto w-full relative z-10 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full flex flex-col items-center mb-16"
        >
          <div className="relative mb-16 scratchy-hover w-64 sm:w-96 flex justify-center [clip-path:inset(0_0_22%_0)] pb-4">
            <img src={newReedLogo} alt="Reed" className="w-full opacity-90 effect-target drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
          </div>
          
          <div className="max-w-2xl text-center space-y-6 text-white/70 font-light leading-relaxed">
            <p className="text-lg sm:text-xl font-display uppercase tracking-widest text-white">The Core.</p>
            <p>
              reed. is the foundation. Emotional, textured, and deeply rooted in songwriting and instrumentation. It’s where raw vulnerability meets precise production, bridging the gap between organic instrumentation and electronic landscapes.
            </p>
          </div>
        </motion.div>

        {/* Discography / Releases Preview */}
        <div className="w-full mt-12">
          <h3 className="text-sm font-display uppercase tracking-[0.3em] text-white/40 mb-8 border-b border-white/10 pb-4">Essential Cuts</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group flex flex-col p-6 border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-white/40 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <div className="relative z-10 flex items-start justify-between mb-8">
                  <div className="w-16 h-16 bg-black border border-white/20 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
                  </div>
                  <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors text-white/50">
                    <Play size={14} className="ml-1" />
                  </button>
                </div>
                <div className="relative z-10 flex flex-col gap-1 mt-auto">
                  <span className="font-display uppercase tracking-widest text-lg text-white/90 group-hover:text-white">Fragments {item}</span>
                  <span className="text-xs text-white/40 tracking-widest uppercase">EP • 2025</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
