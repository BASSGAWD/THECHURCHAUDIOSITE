import { Lock } from "lucide-react";
import { motion } from "framer-motion";

interface LockedOverlayProps {
  onUnlock: () => void;
}

export function LockedOverlay({ onUnlock }: LockedOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-10 bg-black/70 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer rounded-lg"
      onClick={onUnlock}
      data-testid="locked-overlay"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full border border-white/20 bg-white/5 flex items-center justify-center">
          <Lock size={24} className="text-white/50" />
        </div>
        <p className="text-white/50 text-xs uppercase tracking-[0.2em] font-bold">Sign in to access</p>
      </div>
    </motion.div>
  );
}
