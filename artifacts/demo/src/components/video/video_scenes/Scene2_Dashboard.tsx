import { motion, useAnimation, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LayoutDashboard, AlertTriangle, TrendingUp, Users, ArrowRight, type LucideIcon } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const StatCard = ({ title, target, icon: Icon, delay = 0, suffix = '' }: { title: string; target: number; icon: LucideIcon; delay?: number; suffix?: string }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      animate(count, target, { duration: 2, ease: 'easeOut' });
    }, delay);
    return () => clearTimeout(timeout);
  }, [count, target, delay]);

  useEffect(() => {
    return rounded.onChange((v) => setDisplayCount(v));
  }, [rounded]);

  return (
    <motion.div
      className="glass-panel p-6 rounded-2xl flex flex-col justify-between"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease, delay: delay / 1000 }}
    >
      <div className="flex items-center gap-4 text-white/60 mb-4">
        <Icon className="w-6 h-6 text-primary" />
        <span className="font-display font-medium text-lg tracking-wide">{title}</span>
      </div>
      <div className="text-5xl font-display font-bold text-white flex items-baseline gap-1">
        {displayCount}{suffix}
      </div>
    </motion.div>
  );
};

const AlertRow = ({ severity, title, time, delay }: { severity: 'critical' | 'warning' | 'info'; title: string; time: string; delay: number }) => {
  const colors = {
    critical: 'bg-error',
    warning: 'bg-warning',
    info: 'bg-primary'
  };

  return (
    <motion.div
      className="flex items-center justify-between p-4 border-b border-white/5 last:border-0"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease, delay: delay / 1000 }}
    >
      <div className="flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${colors[severity]} shadow-[0_0_10px_var(--color-${severity === 'critical' ? 'error' : severity === 'warning' ? 'warning' : 'primary'})]`} />
        <span className="text-white/80 font-body">{title}</span>
      </div>
      <span className="text-white/40 text-sm">{time}</span>
    </motion.div>
  );
};

export function Scene2_Dashboard() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Title
      setTimeout(() => setPhase(2), 1500),  // Stats
      setTimeout(() => setPhase(3), 3500),  // Alerts container
      setTimeout(() => setPhase(4), 4500),  // Alert items
      setTimeout(() => setPhase(5), 12500), // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col p-[5vw]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
      transition={{ duration: 1.2, ease }}
    >
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1, ease }}
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4 text-accent font-mono text-sm uppercase tracking-widest">
          <LayoutDashboard className="w-4 h-4" />
          Mission Control
        </div>
        <h2 className="text-[4vw] font-display font-light text-white leading-none">
          Everything, everywhere. <br />
          <span className="font-bold text-gradient">All at once.</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-12 gap-8 flex-1">
        <div className="col-span-8 flex flex-col gap-8">
          <div className="grid grid-cols-3 gap-6 h-40">
            {phase >= 2 && (
              <>
                <StatCard title="Total Locations" target={128} icon={Users} delay={0} />
                <StatCard title="Avg Compliance" target={87} icon={TrendingUp} delay={200} suffix="%" />
                <StatCard title="Open Tasks" target={24} icon={AlertTriangle} delay={400} />
              </>
            )}
          </div>
          <motion.div
             className="glass-panel-heavy rounded-3xl flex-1 relative overflow-hidden"
             initial={{ opacity: 0, y: 30 }}
             animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
             transition={{ duration: 1, ease, delay: 0.6 }}
          >
             {/* Chart placeholder */}
             <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent flex items-end p-8">
               <svg viewBox="0 0 1000 300" className="w-full h-[60%] overflow-visible" preserveAspectRatio="none">
                 <motion.path
                    d="M0 300 Q 100 250 200 280 T 400 150 T 600 200 T 800 100 T 1000 50 L 1000 300 Z"
                    fill="url(#area-gradient)"
                    initial={{ opacity: 0 }}
                    animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 2, delay: 1 }}
                 />
                 <motion.path
                    d="M0 300 Q 100 250 200 280 T 400 150 T 600 200 T 800 100 T 1000 50"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="4"
                    initial={{ pathLength: 0 }}
                    animate={phase >= 2 ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 2, ease: "easeInOut", delay: 1 }}
                 />
                 <defs>
                   <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.4" />
                     <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                   </linearGradient>
                 </defs>
               </svg>
             </div>
          </motion.div>
        </div>

        <motion.div 
          className="col-span-4 glass-panel rounded-3xl p-6 flex flex-col"
          initial={{ opacity: 0, x: 40 }}
          animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
          transition={{ duration: 1, ease }}
        >
          <h3 className="font-display font-medium text-white/80 text-xl mb-6 flex items-center justify-between">
            Live Risk Alerts
            <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
          </h3>
          <div className="flex flex-col gap-2 flex-1 justify-start">
            {phase >= 4 && (
              <>
                <AlertRow severity="critical" title="Location #42 - Fire Safety expired" time="Just now" delay={0} />
                <AlertRow severity="warning" title="Location #18 - Low inventory" time="2m ago" delay={300} />
                <AlertRow severity="critical" title="Location #07 - Manager uncertified" time="15m ago" delay={600} />
                <AlertRow severity="info" title="Location #99 - Audit scheduled" time="1h ago" delay={900} />
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
