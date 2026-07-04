import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1];

export function Scene4_Compliance() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Title
      setTimeout(() => setPhase(2), 1500),  // Grid/Cards container
      setTimeout(() => setPhase(3), 2500),  // Gauge fill
      setTimeout(() => setPhase(4), 3500),  // Heatmap fill
      setTimeout(() => setPhase(5), 12000), // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const heatmapData = [
    ['green', 'green', 'yellow', 'green', 'red'],
    ['green', 'green', 'green', 'green', 'green'],
    ['yellow', 'green', 'yellow', 'green', 'green'],
    ['green', 'green', 'green', 'green', 'green'],
    ['red', 'yellow', 'green', 'red', 'yellow'],
    ['green', 'green', 'green', 'green', 'green'],
  ];

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col p-[5vw]"
      initial={{ opacity: 0, x: '10vw' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-10vw', filter: 'blur(10px)' }}
      transition={{ duration: 1.2, ease }}
    >
      <motion.div
        className="mb-12 flex justify-between items-end"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1, ease }}
      >
        <div>
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4 text-success font-mono text-sm uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            Compliance Engine
          </div>
          <h2 className="text-[4vw] font-display font-light text-white leading-none">
            Scored in <span className="font-bold text-gradient">real time.</span>
          </h2>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-12 gap-8">
        {/* Network Score Gauge */}
        <motion.div
          className="col-span-4 glass-panel-heavy rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 1, ease }}
        >
          <div className="relative w-64 h-64">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                strokeDasharray="251.2"
              />
              <motion.circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke="var(--color-success)"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 251.2 }}
                animate={phase >= 3 ? { strokeDashoffset: 251.2 - (251.2 * 0.92) } : { strokeDashoffset: 251.2 }}
                transition={{ duration: 2.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                className="text-6xl font-display font-bold text-white"
                initial={{ opacity: 0 }}
                animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.5 }}
              >
                92<span className="text-2xl text-white/50">%</span>
              </motion.span>
              <span className="text-white/50 text-sm uppercase tracking-wider mt-1">Network Score</span>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-success/20 to-transparent blur-xl pointer-events-none" />
        </motion.div>

        {/* Heatmap */}
        <motion.div
          className="col-span-8 glass-panel rounded-3xl p-8 flex flex-col"
          initial={{ opacity: 0, x: 50 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 1, ease, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-display text-white/80 text-xl">Risk Heatmap</h3>
             <div className="flex gap-4 text-xs font-mono text-white/40">
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success"></div> Safe</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-warning"></div> Warning</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-error"></div> Risk</div>
             </div>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            {heatmapData.map((row, i) => (
              <div key={i} className="flex-1 flex gap-2">
                <div className="w-16 flex items-center text-white/30 text-xs font-mono">LOC#{i+1}</div>
                {row.map((status, j) => {
                  const colors = {
                    green: 'bg-success/20 border-success/30 text-success',
                    yellow: 'bg-warning/20 border-warning/30 text-warning',
                    red: 'bg-error/20 border-error/30 text-error shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  };
                  return (
                    <motion.div
                      key={j}
                      className={`flex-1 rounded-lg border ${colors[status]} flex items-center justify-center relative overflow-hidden`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={phase >= 4 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      transition={{ duration: 0.4, delay: (i * 0.1) + (j * 0.05), type: "spring", stiffness: 200 }}
                    >
                       {status === 'red' && <div className="absolute inset-0 bg-error/20 animate-pulse" />}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
