import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import logoFull from '@assets/fios_logo_full.png';
import logoIcon from '@assets/fios_logo_icon_v2.png';

export function Scene1_Intro() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000), // Logo icon appears
      setTimeout(() => setPhase(2), 2500), // Logo expands to full
      setTimeout(() => setPhase(3), 4500), // Tagline appears
      setTimeout(() => setPhase(4), 8000), // Ambient shift
      setTimeout(() => setPhase(5), 11500), // Start exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-10"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative flex flex-col items-center">
        {/* Core Icon */}
        <motion.div
          className="relative w-32 h-32 mb-8"
          initial={{ opacity: 0, y: 40, rotateX: 45 }}
          animate={
            phase === 0 ? { opacity: 0, y: 40, rotateX: 45 } :
            phase >= 1 && phase < 2 ? { opacity: 1, y: 0, rotateX: 0 } :
            phase >= 2 ? { opacity: 0, y: -20, scale: 0.8 } : {}
          }
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src={logoIcon} alt="Icon" className="w-full h-full object-contain" />
        </motion.div>

        {/* Full Wordmark */}
        <motion.div
          className="absolute top-0 w-[40vw] h-32"
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          animate={
            phase >= 2 && phase < 5 ? { opacity: 1, scale: 1, filter: 'blur(0px)' } :
            phase >= 5 ? { opacity: 0, y: -40, filter: 'blur(20px)' } :
            { opacity: 0, scale: 0.9, filter: 'blur(10px)' }
          }
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src={logoFull} alt="FranchiseIntelligenceOS" className="w-full h-full object-contain" />
        </motion.div>

        {/* Tagline */}
        <motion.h1
          className="text-[3vw] font-display font-light tracking-wide text-white/90 mt-32 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={
            phase >= 3 && phase < 5 ? { opacity: 1, y: 0 } :
            phase >= 5 ? { opacity: 0, y: -20 } :
            { opacity: 0, y: 20 }
          }
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          The operating system for <span className="text-gradient font-medium">franchise growth.</span>
        </motion.h1>
      </div>
    </motion.div>
  );
}
