import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sparkles, Bot, User } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1];

const TypewriterText = ({ text, delay = 0, onComplete = () => {} }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        onComplete();
      }
    }, 30);
    
    return () => clearInterval(interval);
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

export function Scene3_Assistant() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Title
      setTimeout(() => setPhase(2), 1500),  // Chat UI appears
      setTimeout(() => setPhase(3), 2500),  // User message
      setTimeout(() => setPhase(4), 5000),  // AI thinking
      setTimeout(() => setPhase(5), 6500),  // AI response
      setTimeout(() => setPhase(6), 12000), // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col p-[5vw]"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 1.2, ease }}
    >
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1, ease }}
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4 text-primary font-mono text-sm uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          Franchise Brain
        </div>
        <h2 className="text-[4vw] font-display font-light text-white leading-none">
          Ask questions.<br />
          <span className="font-bold text-gradient">Get answers instantly.</span>
        </h2>
      </motion.div>

      <motion.div
        className="flex-1 glass-panel-heavy rounded-3xl overflow-hidden flex flex-col max-w-4xl mx-auto w-full mt-4"
        initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
        animate={phase >= 2 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 50, filter: 'blur(10px)' }}
        transition={{ duration: 1.2, ease }}
      >
        <div className="h-16 border-b border-white/5 flex items-center px-6 gap-4 bg-white/[0.02]">
          <Bot className="w-6 h-6 text-primary" />
          <span className="font-display font-medium text-white/80">FiOS Assistant</span>
        </div>
        
        <div className="flex-1 p-8 flex flex-col gap-6">
          {/* User Message */}
          <motion.div
            className="self-end max-w-[80%] flex items-start gap-4 flex-row-reverse"
            initial={{ opacity: 0, x: 20 }}
            animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-white/60" />
            </div>
            <div className="bg-primary/20 border border-primary/30 rounded-2xl rounded-tr-none p-4 text-white text-lg">
              {phase >= 3 && "Which locations are at compliance risk?"}
            </div>
          </motion.div>

          {/* AI Thinking */}
          {phase >= 4 && phase < 5 && (
            <motion.div
              className="self-start flex items-center gap-3 text-white/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Bot className="w-8 h-8" />
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}

          {/* AI Response */}
          {phase >= 5 && (
            <motion.div
              className="self-start max-w-[90%] flex items-start gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/50">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-5 text-white/90 text-lg leading-relaxed shadow-xl">
                <TypewriterText text="I found 3 locations currently at risk:" />
                <br /><br />
                <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 1.5 }}
                >
                  1. <span className="inline-block bg-error/20 border border-error/50 text-error px-2 py-0.5 rounded text-sm mx-1">Location #3</span> - Kitchen safety audit 45 days overdue.<br />
                  2. <span className="inline-block bg-warning/20 border border-warning/50 text-warning px-2 py-0.5 rounded text-sm mx-1">Location #12</span> - Missing 2 employee food handler cards.<br />
                  3. <span className="inline-block bg-warning/20 border border-warning/50 text-warning px-2 py-0.5 rounded text-sm mx-1">Location #42</span> - General liability insurance expires in 4 days.<br />
                  <br />
                  Would you like me to automatically draft notification emails to these general managers?
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
