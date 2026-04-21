import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Ticket } from "lucide-react";
import churchAudioCoverLogo from "@assets/IMG_1748_1772756436624.png";

const MOCK_TOUR_DATES = [
  { id: 1, date: "OCT 14", city: "LOS ANGELES, CA", venue: "THE ECHO", status: "SOLD OUT" },
  { id: 2, date: "OCT 18", city: "NEW YORK, NY", venue: "BOWERY BALLROOM", status: "AVAILABLE" },
  { id: 3, date: "OCT 22", city: "CHICAGO, IL", venue: "BABY'S ALL RIGHT", status: "AVAILABLE" },
  { id: 4, date: "OCT 25", city: "ATLANTA, GA", venue: "SUBTERRANEAN", status: "AVAILABLE" },
  { id: 5, date: "OCT 31", city: "NEW ORLEANS, LA", venue: "REPUBLIC", status: "AVAILABLE" },
];

export default function Tour() {
  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-white flex flex-col font-sans overflow-x-hidden p-6 sm:p-12 relative selection:bg-white selection:text-black">
      {/* Texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

      <nav className="relative z-10 flex items-center justify-between mb-16 sm:mb-24 max-w-5xl mx-auto w-full">
        <Link href="/?opened=true">
          <div className="cursor-pointer group flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-300">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Back</span>
          </div>
        </Link>
        <img src={churchAudioCoverLogo} alt="The Church Audio" className="w-16 sm:w-20 opacity-80" />
      </nav>

      <main className="flex-grow flex flex-col items-center max-w-4xl mx-auto w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <h1 className="text-4xl sm:text-6xl font-display font-medium mb-16 tracking-tight uppercase text-center">
            Upcoming Shows
          </h1>

          <div className="flex flex-col gap-4 w-full">
            {MOCK_TOUR_DATES.map((show, i) => (
              <motion.div 
                key={show.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all duration-300 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 cursor-pointer relative overflow-hidden"
              >
                {/* Glitch hover background effect */}
                <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 w-full sm:w-auto">
                  <div className="w-24 shrink-0">
                    <span className="text-lg sm:text-xl font-display text-white/90 tracking-widest uppercase">{show.date}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-bold tracking-[0.2em] uppercase mb-1">{show.city}</span>
                    <span className="text-xs text-white/50 tracking-wider uppercase">{show.venue}</span>
                  </div>
                </div>

                <div className="w-full sm:w-auto mt-4 sm:mt-0 flex justify-end">
                  <button 
                    disabled={show.status === "SOLD OUT"}
                    className={`flex items-center gap-2 px-6 py-3 border text-xs uppercase tracking-[0.2em] font-bold transition-all ${
                      show.status === "SOLD OUT" 
                        ? 'border-white/10 text-white/30 cursor-not-allowed' 
                        : 'border-white/30 text-white hover:bg-white hover:text-black hover:border-white'
                    }`}
                  >
                    {show.status === "SOLD OUT" ? (
                      'Sold Out'
                    ) : (
                      <>
                        <Ticket size={14} />
                        Tickets
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
