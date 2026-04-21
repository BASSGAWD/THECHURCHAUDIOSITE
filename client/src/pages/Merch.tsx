import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import churchAudioCoverLogo from "@assets/IMG_1748_1772756436624.png";

// Import merch placeholder textures
import texture1 from "@assets/01_1772784315701.jpg";
import texture2 from "@assets/02_1772784315701.jpg";
import texture3 from "@assets/03_1772784315701.jpg";
import texture4 from "@assets/04_1772784315701.jpg";
import texture5 from "@assets/05_1772784315701.jpg";
import texture6 from "@assets/06_1772784315701.jpg";

// Import chain decorative assets
import chain1 from "@assets/07_1772784387303.png";
import chain2 from "@assets/08_1772784410361.png";
import chain3 from "@assets/02_1772784442001.png";
import chain4 from "@assets/05_1772784494451.png";
import chain5 from "@assets/20_1772784514561.png";

const MOCK_MERCH = [
  { id: 1, name: "BASSGAWD TEE", price: "$35", category: "Shirts", image: texture1, status: "IN STOCK" },
  { id: 2, name: "CHURCH AUDIO HOODIE", price: "$65", category: "Hoodies", image: texture2, status: "IN STOCK" },
  { id: 3, name: "REED LP (LIMITED EDITION)", price: "$40", category: "Vinyl", image: texture3, status: "LOW STOCK" },
  { id: 4, name: "HALLWAYS LONG SLEEVE", price: "$45", category: "Shirts", image: texture4, status: "OUT OF STOCK" },
  { id: 5, name: "GLITCH LOGO CAP", price: "$25", category: "Accessories", image: texture5, status: "IN STOCK" },
  { id: 6, name: "TOUR POSTER", price: "$20", category: "Accessories", image: texture6, status: "IN STOCK" },
];

export default function Merch() {
  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-white flex flex-col font-sans overflow-hidden p-6 sm:p-12 relative selection:bg-white selection:text-black">
      {/* Texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

      {/* Decorative chains */}
      <motion.img 
        initial={{ opacity: 0, x: -50, rotate: -15 }}
        animate={{ opacity: 0.3, x: 0, rotate: -10 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        src={chain1} 
        className="fixed -left-20 top-20 w-64 md:w-96 pointer-events-none z-0 mix-blend-screen" 
        alt="" 
      />
      <motion.img 
        initial={{ opacity: 0, x: 50, rotate: 15 }}
        animate={{ opacity: 0.2, x: 0, rotate: 5 }}
        transition={{ duration: 1.5, delay: 0.4 }}
        src={chain4} 
        className="fixed -right-32 bottom-0 w-80 md:w-[30rem] pointer-events-none z-0 mix-blend-screen" 
        alt="" 
      />

      <nav className="relative z-20 flex items-center justify-between mb-16 sm:mb-24 max-w-7xl mx-auto w-full">
        <Link href="/?opened=true">
          <div className="cursor-pointer group flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-300">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Back</span>
          </div>
        </Link>
        <img src={churchAudioCoverLogo} alt="The Church Audio" className="w-16 sm:w-20 opacity-80" />
      </nav>

      <main className="flex-grow flex flex-col items-center max-w-7xl mx-auto w-full relative z-10 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full flex flex-col items-center mb-16 relative"
        >
          {/* Subtle background chain behind title */}
          <motion.img 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.15, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            src={chain3} 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl pointer-events-none z-[-1] mix-blend-screen" 
            alt="" 
          />
          
          <h1 className="text-5xl sm:text-7xl font-display font-medium mb-6 tracking-tight uppercase text-center glitch-wrapper relative inline-block">
            <span className="effect-target text-transparent" style={{ WebkitTextStroke: '1px white' }}>Merch</span>
            <span className="glitch-layer absolute inset-0 flex items-center justify-center text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}>Merch</span>
            <span className="glitch-layer absolute inset-0 flex items-center justify-center text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}>Merch</span>
          </h1>
          <p className="text-white/40 uppercase tracking-[0.2em] text-xs">Official Merchandise</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 w-full">
          {MOCK_MERCH.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group flex flex-col gap-5 cursor-pointer relative"
            >
              {/* Product Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#050505] border border-white/5 group-hover:border-white/20 transition-all duration-500 flex items-center justify-center">
                {/* Background crumpled paper texture */}
                <div 
                  className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500 bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.image})`, mixBlendMode: 'screen' }}
                />
                
                {/* Decorative item chain */}
                <img 
                  src={i % 2 === 0 ? chain2 : chain5} 
                  className="absolute w-[120%] h-auto opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700 ease-out mix-blend-screen"
                  style={{ transform: `rotate(${i % 2 === 0 ? 45 : -25}deg)` }}
                  alt=""
                />

                {/* Simulated product placeholder (Typography-based) */}
                <div className="relative z-10 text-center px-6">
                  <h4 className="font-display text-4xl uppercase tracking-tighter text-white/80 group-hover:text-white transition-colors mix-blend-difference opacity-80" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>
                    {item.name.split(' ')[0]}
                  </h4>
                </div>
                
                {/* Overlay Status UI */}
                <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                  <div className={`px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase ${
                    item.status === 'OUT OF STOCK' 
                      ? 'border border-red-500/50 text-red-500 bg-red-500/10' 
                      : item.status === 'LOW STOCK'
                      ? 'border border-yellow-500/50 text-yellow-500 bg-yellow-500/10'
                      : 'bg-white text-black'
                  }`}>
                    {item.status}
                  </div>
                </div>

                {/* Quick Add Button overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                  <button 
                    disabled={item.status === "OUT OF STOCK"}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors"
                  >
                    <ShoppingCart size={14} />
                    {item.status === "OUT OF STOCK" ? "Sold Out" : "Add to Cart"}
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-display uppercase tracking-widest text-lg group-hover:text-white transition-colors text-white/70">{item.name}</h3>
                  <span className="font-mono text-white/90">{item.price}</span>
                </div>
                <div className="w-full h-[1px] bg-white/10 my-1 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full bg-white/40 w-0 group-hover:w-full transition-all duration-500 ease-out" />
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-widest">{item.category}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
