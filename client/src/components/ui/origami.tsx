import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface OrigamiFoldProps {
  children: React.ReactNode;
  isOpen: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  delay?: number;
  duration?: number;
  onAnimationComplete?: () => void;
}

export function OrigamiFold({
  children,
  isOpen,
  direction = 'up',
  className,
  delay = 0,
  duration = 0.8,
  onAnimationComplete
}: OrigamiFoldProps) {
  // Determine rotation axis and origin based on fold direction
  let rotateProp = 'rotateX';
  let closedRotation = -90; // Default fold up (hinge at bottom)
  let originClass = 'origin-bottom';

  switch (direction) {
    case 'up':
      rotateProp = 'rotateX';
      closedRotation = 90;
      originClass = 'origin-top';
      break;
    case 'down':
      rotateProp = 'rotateX';
      closedRotation = -90;
      originClass = 'origin-bottom';
      break;
    case 'left':
      rotateProp = 'rotateY';
      closedRotation = -90;
      originClass = 'origin-left';
      break;
    case 'right':
      rotateProp = 'rotateY';
      closedRotation = 90;
      originClass = 'origin-right';
      break;
  }

  // To make it look like paper folding, we need a front and a back.
  // We'll simplify here and just animate the element itself swinging into view.
  // For a true origami effect, it needs to be hidden until it un-hinges.

  return (
    <div className={cn("perspective-2000 preserve-3d", className)}>
      <motion.div
        className={cn("preserve-3d", originClass)}
        initial={{ [rotateProp]: closedRotation, opacity: 0 }}
        animate={{ 
          [rotateProp]: isOpen ? 0 : closedRotation, 
          opacity: isOpen ? 1 : 0 
        }}
        transition={{
          duration: duration,
          delay: delay,
          ease: [0.34, 1.56, 0.64, 1], // Spring-like easing for realistic snap
          opacity: { duration: duration * 0.5, delay: isOpen ? delay : delay + duration * 0.5 }
        }}
        onAnimationComplete={onAnimationComplete}
        style={{
          boxShadow: isOpen 
            ? '0 10px 30px -10px rgba(0,0,0,0.1)' 
            : '0 0px 0px 0px rgba(0,0,0,0)',
        }}
      >
        <div className="relative bg-[#0a0a0a] text-white paper-shadow border border-white/10">
          <div className="absolute inset-0 crease-gradient pointer-events-none z-10 opacity-30" />
          <div className="relative z-0">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// A more complex pre-built structure: A letter that unfolds in sections
export function UnfoldingLetter({ 
  panels, 
  isOpen,
  onComplete
}: { 
  panels: React.ReactNode[]; 
  isOpen: boolean;
  onComplete?: () => void;
}) {
  const [stage, setStage] = React.useState(0);

  React.useEffect(() => {
    if (isOpen) {
      setStage(1);
    } else {
      setStage(0);
    }
  }, [isOpen]);

  if (!panels || panels.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center relative perspective-2000 w-full max-w-xl mx-auto">
      {/* Base Panel (Middle) - This one is just revealed */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.95 }}
        transition={{ duration: 0.5 }}
        className="w-full relative z-10"
      >
        <div className="bg-[#0a0a0a] p-8 shadow-sm border border-white/10 relative">
          <div className="absolute inset-0 crease-gradient pointer-events-none opacity-20" />
          {panels[0]}
        </div>

        {/* Top Panel - Folds Up */}
        {panels.length > 1 && (
          <div className="absolute bottom-full left-0 right-0 perspective-2000 preserve-3d z-20">
            <motion.div
              className="origin-bottom preserve-3d"
              initial={{ rotateX: 175 }}
              animate={{ rotateX: isOpen ? 0 : 175 }}
              transition={{ duration: 0.9, delay: isOpen ? 0.3 : 0, type: 'spring', bounce: 0.15 }}
            >
              <div className="bg-[#0a0a0a] p-8 shadow-2xl border-t border-l border-r border-white/10 relative preserve-3d">
                <motion.div 
                  className="absolute inset-0 bg-black pointer-events-none z-30"
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: isOpen ? 0 : 0.9 }}
                  transition={{ duration: 0.9, delay: isOpen ? 0.3 : 0 }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10 z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none opacity-10 z-10" />
                <div className="relative z-20">
                  {panels[1]}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bottom Panel - Folds Down */}
        {panels.length > 2 && (
          <div className="absolute top-full left-0 right-0 perspective-2000 preserve-3d z-20">
            <motion.div
              className="origin-top preserve-3d"
              initial={{ rotateX: -175 }}
              animate={{ rotateX: isOpen ? 0 : -175 }}
              transition={{ duration: 0.9, delay: isOpen ? 0.5 : 0, type: 'spring', bounce: 0.15 }}
              onAnimationComplete={() => {
                if (isOpen && onComplete) onComplete();
              }}
            >
              <div className="bg-[#0a0a0a] p-8 shadow-2xl border-b border-l border-r border-white/10 relative preserve-3d">
                <motion.div 
                  className="absolute inset-0 bg-black pointer-events-none z-30"
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: isOpen ? 0 : 0.9 }}
                  transition={{ duration: 0.9, delay: isOpen ? 0.5 : 0 }}
                />
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/10 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none opacity-10 z-10" />
                <div className="relative z-20">
                  {panels[2]}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}