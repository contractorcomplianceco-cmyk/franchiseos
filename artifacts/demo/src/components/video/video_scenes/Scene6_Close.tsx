import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import logoFull from '@assets/fios_logo_full.png';

const ease = [0.16, 1, 0.3, 1];

type Tier = 'ready' | 'watch' | 'hold';

const MARKETS: { code: string; score: number; tier: Tier }[] = [
  { code: 'TX', score: 94, tier: 'ready' },
  { code: 'FL', score: 91, tier: 'ready' },
  { code: 'GA', score: 88, tier: 'ready' },
  { code: 'NC', score: 86, tier: 'ready' },
  { code: 'AZ', score: 84, tier: 'ready' },
  { code: 'TN', score: 82, tier: 'ready' },
  { code: 'CO', score: 78, tier: 'watch' },
  { code: 'OH', score: 75, tier: 'watch' },
  { code: 'VA', score: 73, tier: 'watch' },
  { code: 'PA', score: 69, tier: 'watch' },
  { code: 'IL', score: 66, tier: 'watch' },
  { code: 'MI', score: 61, tier: 'watch' },
  { code: 'NY', score: 54, tier: 'hold' },
  { code: 'CA', score: 48, tier: 'hold' },
  { code: 'NJ', score: 43, tier: 'hold' },
  { code: 'WA', score: 39, tier: 'hold' },
];

const TIER_STYLE: Record<Tier, string> = {
  ready: 'bg-emerald-500/25 border-emerald-400/70 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.35)]',
  watch: 'bg-amber-500/20 border-amber-400/60 text-amber-100 shadow-[0_0_24px_rgba(245,158,11,0.28)]',
  hold: 'bg-rose-500/15 border-rose-400/50 text-rose-100',
};

export function Scene6_Close() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),   // Title + map appear
      setTimeout(() => setPhase(2), 2200),  // Tiles light up
      setTimeout(() => setPhase(3), 8500),  // Map recedes
      setTimeout(() => setPhase(4), 9200),  // Final lockup
      setTimeout(() => setPhase(5), 12200), // Exit
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const readyCount = MARKETS.filter((m) => m.tier === 'ready').length;

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center px-[4vw] py-[4vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease }}
    >
      {/* Expansion Readiness Map */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-[6vw]"
        initial={{ opacity: 0, y: 30 }}
        animate={
          phase >= 1 && phase < 3
            ? { opacity: 1, y: 0 }
            : phase >= 3
              ? { opacity: 0.12, y: -20, scale: 0.94 }
              : { opacity: 0, y: 30 }
        }
        transition={{ duration: 1.2, ease }}
      >
        <motion.div
          className="text-center mb-[3vh]"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.9, ease }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[1vw] font-mono tracking-widest uppercase mb-[2vh]">
            Expansion Readiness
          </div>
          <h2 className="text-[3vw] font-display font-light text-white/95">
            {readyCount} markets <span className="text-gradient font-medium">ready to scale</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-8 gap-[1vw] w-[80vw]">
          {MARKETS.map((m, i) => (
            <motion.div
              key={m.code}
              className={`aspect-square rounded-xl border flex flex-col items-center justify-center ${TIER_STYLE[m.tier]}`}
              initial={{ opacity: 0, scale: 0.4, y: 20 }}
              animate={
                phase >= 1
                  ? { opacity: 1, scale: 1, y: 0 }
                  : { opacity: 0, scale: 0.4, y: 20 }
              }
              transition={{ duration: 0.5, delay: 0.2 + i * 0.05, ease }}
            >
              <span className="text-[1.5vw] font-bold leading-none">{m.code}</span>
              <motion.span
                className="text-[0.9vw] font-mono mt-[0.4vw] opacity-80"
                initial={{ opacity: 0 }}
                animate={phase >= 2 ? { opacity: 0.8 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: i * 0.03 }}
              >
                {m.score}
              </motion.span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex items-center gap-[3vw] mt-[3vh] text-[1vw] text-white/70"
          initial={{ opacity: 0 }}
          animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400" /> Ready</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400" /> Watch</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-400" /> Hold</span>
        </motion.div>
      </motion.div>

      {/* Final Lockup */}
      <motion.div
        className="relative z-20 flex flex-col items-center"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={phase >= 4 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
        transition={{ duration: 1.4, ease }}
        style={{ pointerEvents: phase >= 4 ? 'auto' : 'none' }}
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
