import { motion } from 'framer-motion';
import { useEffect, useState, type SVGProps } from 'react';
import { CheckCircle2, Clock, FileText, ArrowRight } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const TaskCard = ({ title, location, priority, delay = 0 }: { title: string; location: string; priority: string; delay?: number }) => {
  return (
    <motion.div
      className="bg-white/5 border border-white/10 rounded-xl p-4 mb-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease, delay: delay / 1000 }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-white/90 font-medium">{title}</span>
        <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-mono ${
          priority === 'High' ? 'bg-error/20 text-error' : 
          priority === 'Medium' ? 'bg-warning/20 text-warning' : 
          'bg-white/10 text-white/60'
        }`}>
          {priority}
        </span>
      </div>
      <div className="text-white/40 text-sm">{location}</div>
    </motion.div>
  );
};

export function Scene5_Tasks() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Title
      setTimeout(() => setPhase(2), 1500),  // Columns appear
      setTimeout(() => setPhase(3), 2500),  // Card 1 drops in
      setTimeout(() => setPhase(4), 3500),  // Card 2 drops in
      setTimeout(() => setPhase(5), 5000),  // Morph action
      setTimeout(() => setPhase(6), 10000), // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col p-[5vw]"
      initial={{ opacity: 0, y: '10vh' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 1.2, ease }}
    >
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1, ease }}
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4 text-warning font-mono text-sm uppercase tracking-widest">
          <CheckCircle2 className="w-4 h-4" />
          Task Resolution
        </div>
        <h2 className="text-[4vw] font-display font-light text-white leading-none">
          Identify issues.<br />
          <span className="font-bold text-gradient">Resolve them faster.</span>
        </h2>
      </motion.div>

      <div className="flex-1 grid grid-cols-3 gap-6">
        {['To Do', 'In Progress', 'Done'].map((col, index) => (
          <motion.div
            key={col}
            className="glass-panel-heavy rounded-3xl p-6 flex flex-col relative"
            initial={{ opacity: 0, y: 40 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, ease, delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              {index === 0 && <AlertCircle className="w-5 h-5 text-error" />}
              {index === 1 && <Clock className="w-5 h-5 text-warning" />}
              {index === 2 && <CheckCircle2 className="w-5 h-5 text-success" />}
              <span className="font-display text-white/80">{col}</span>
              <span className="ml-auto bg-white/10 rounded-full w-6 h-6 flex items-center justify-center text-xs text-white/60 font-mono">
                {index === 0 ? 3 : index === 1 ? 2 : 5}
              </span>
            </div>

            <div className="flex-1 relative">
              {index === 0 && (
                <>
                  {phase >= 3 && <TaskCard title="Renew License" location="Location #42" priority="High" delay={0} />}
                  {phase >= 4 && <TaskCard title="Fix Kitchen Exhaust" location="Location #18" priority="High" delay={0} />}
                  
                  {/* Morphed Card from Failed Check */}
                  <motion.div
                    className="absolute inset-x-0 bottom-0 bg-error/20 border border-error/50 rounded-xl p-4 shadow-[0_0_30px_rgba(239,68,68,0.2)] backdrop-blur-xl"
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={
                       phase >= 5 ? 
                       { opacity: 1, scale: 1, y: -20, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', boxShadow: '0 0 0px rgba(0,0,0,0)' } : 
                       { opacity: 0, scale: 0.8, y: 50 }
                    }
                    transition={{ duration: 1.2, type: "spring", stiffness: 100 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white/90 font-medium tracking-wide">Manager Certification</span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded font-mono bg-error/20 text-error">Critical</span>
                    </div>
                    <div className="text-white/60 text-sm">Location #07</div>
                  </motion.div>
                </>
              )}
              {index === 1 && (
                <>
                  <TaskCard title="Quarterly Audit" location="Location #99" priority="Medium" delay={200} />
                  <TaskCard title="Restock uniform" location="Location #12" priority="Low" delay={300} />
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Temporary icon to avoid import issues
const AlertCircle = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
