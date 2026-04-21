import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Play } from "lucide-react";
import hallwaysLogo from "@assets/hallways_logo_transparent_1772772717102.png";

export default function ArtistHallways() {
  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col font-sans overflow-x-hidden p-6 sm:p-12 relative selection:bg-blue-500 selection:text-white">
      {/* Void aesthetic - smooth subtle gradient */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>

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
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-full flex flex-col items-center mb-16"
        >
          <div className="relative mb-16 w-64 sm:w-96 flex justify-center glitch-wrapper">
            <img src={hallwaysLogo} alt="Hallways" className="w-full opacity-80" />
            <img src={hallwaysLogo} alt="Hallways" className="w-full absolute inset-0 glitch-layer mix-blend-screen text-blue-500" />
            <img src={hallwaysLogo} alt="Hallways" className="w-full absolute inset-0 glitch-layer mix-blend-screen text-red-500" />
          </div>
          
          <div className="max-w-2xl text-center space-y-6 text-white/60 font-light leading-relaxed">
            <p className="text-lg sm:text-xl font-display uppercase tracking-widest text-white/90">The Void.</p>
            <p>
              Hallways is the ambient, the atmospheric, the liminal space between the heavy hits. Exploring spatial audio, drone, and minimalistic textures, this alias focuses on the environments sound creates rather than just the beat.
            </p>
          </div>
        </motion.div>

        {/* Ambient Tracks / Soundscapes Preview */}
        <div className="w-full mt-12">
          <div className="grid grid-cols-1 gap-4">
            {[
              { title: "Ethereal Drift", length: "7:24" },
              { title: "Neon Isolation", length: "5:12" },
              { title: "Liminal Space", length: "8:45" },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group flex items-center justify-between py-6 px-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-mono text-white/30 w-4">0{i+1}</span>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 group-hover:text-white group-hover:scale-110 transition-all">
                    <Play size={16} className="ml-1" />
                  </button>
                  <span className="font-display uppercase tracking-widest text-sm sm:text-base text-white/70 group-hover:text-white transition-colors">{item.title}</span>
                </div>
                <div className="flex items-center gap-6">
                  {/* Subtle audio visualizer simulation on hover */}
                  <div className="hidden sm:flex gap-1 h-4 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {[1,2,3,4,5].map(bar => (
                      <motion.div 
                        key={bar}
                        animate={{ height: ["4px", "16px", "4px"] }}
                        transition={{ repeat: Infinity, duration: 0.5 + (bar*0.1), ease: "easeInOut" }}
                        className="w-1 bg-white/40 rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-white/40 tracking-widest">{item.length}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
