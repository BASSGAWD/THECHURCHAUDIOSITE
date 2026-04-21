import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Play, Disc } from "lucide-react";
import bassgawdLogo from "@assets/bassgawd_transparent_1772772440526.png";

export default function ArtistBassgawd() {
  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white flex flex-col font-sans overflow-x-hidden p-6 sm:p-12 relative selection:bg-red-500 selection:text-white">
      {/* Texture overlay */}
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full flex flex-col items-center mb-16"
        >
          <div className="relative mb-12 rgb-hover w-64 sm:w-96">
            <img src={bassgawdLogo} alt="Bassgawd" className="w-full drop-shadow-[0_0_15px_rgba(255,0,0,0.5)] effect-target" />
          </div>
          
          <div className="max-w-2xl text-center space-y-6 text-white/70 font-light leading-relaxed">
            <p className="text-lg sm:text-xl font-display uppercase tracking-widest text-white">The Heavy Low-End.</p>
            <p>
              Bassgawd represents the visceral, aggressive side of the spectrum. Fusing elements of distorted 808s, metal-influenced arrangements, and experimental sound design, this moniker is reserved for tracks that hit with undeniable force.
            </p>
          </div>
        </motion.div>

        {/* Discography / Releases Preview */}
        <div className="w-full mt-12">
          <h3 className="text-sm font-display uppercase tracking-[0.3em] text-white/40 mb-8 border-b border-white/10 pb-4">Latest Transmissions</h3>
          
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex items-center justify-between p-4 border border-white/5 bg-white/5 hover:bg-white/10 hover:border-red-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-12 h-12 bg-black flex items-center justify-center border border-white/10 group-hover:border-red-500/50">
                    <Disc size={20} className="text-white/50 group-hover:text-red-400 group-hover:animate-spin-slow" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display uppercase tracking-widest text-sm text-white/90 group-hover:text-white group-hover:text-shadow-sm">System Override 0{item}</span>
                    <span className="text-[10px] text-white/40 tracking-wider">Single • 2026</span>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-red-500 group-hover:border-red-500 group-hover:text-white transition-all text-white/50">
                  <Play size={14} className="ml-1" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
