import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import logoFull from '@assets/fios_logo_full.png';

const ease = [0.16, 1, 0.3, 1];

export function Scene6_Close() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Map grid appears
      setTimeout(() => setPhase(2), 2000),  // States highlight
      setTimeout(() => setPhase(3), 5000),  // Zoom out / fade to center
      setTimeout(() => setPhase(4), 6500),  // Logo final
      setTimeout(() => setPhase(5), 11000), // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // Simple grid of states
  const states = Array.from({ length: 40 });
  const activeIndices = [12, 14, 15, 22, 23, 24, 25, 33];

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center p-[5vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease }}
    >
      {/* Background Expansion Map */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={
          phase >= 1 && phase < 3 ? { scale: 1, opacity: 1 } :
          phase >= 3 ? { scale: 0.8, opacity: 0, filter: 'blur(20px)' } :
          { scale: 1.2, opacity: 0 }
        }
        transition={{ duration: 2, ease }}
      >
         <div className="w-[80vw] h-[60vh] grid grid-cols-8 gap-4 opacity-40">
           {states.map((_, i) => (
             <motion.div
               key={i}
               className={`rounded-lg border ${activeIndices.includes(i) ? 'bg-primary/40 border-primary shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-white/5 border-white/10'} relative overflow-hidden`}
               initial={{ opacity: 0, scale: 0 }}
               animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
               transition={{ duration: 0.5, delay: i * 0.02 }}
             >
               {activeIndices.includes(i) && (
                 <motion.div 
                   className="absolute inset-0 bg-primary/20"
                   initial={{ opacity: 0 }}
                   animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
                   transition={{ duration: 1, delay: 0.5 + (Math.random() * 1) }}
                 />
               )}
             </motion.div>
           ))}
         </div>
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_80%)]" />
      </motion.div>

      {/* Final Lockup */}
      <motion.div
        className="relative z-20 flex flex-col items-center"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={phase >= 4 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <img src={logoFull} alt="FranchiseIntelligenceOS" className="w-[40vw] max-w-2xl mb-12" />
        
        <div className="flex items-center gap-6 font-display text-[1.5vw] tracking-wider text-white/80">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={phase >= 4 ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}>Intelligence.</motion.span>
          <span className="w-1 h-1 rounded-full bg-primary" />
          <motion.span initial={{ opacity: 0, y: 10 }} animate={phase >= 4 ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}>Compliance.</motion.span>
          <span className="w-1 h-1 rounded-full bg-accent" />
          <motion.span initial={{ opacity: 0, y: 10 }} animate={phase >= 4 ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 }}>Growth.</motion.span>
        </div>
        
        <motion.div 
          className="mt-8 px-6 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white/60 font-mono text-sm tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 1.2 }}
        >
          One Platform
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
