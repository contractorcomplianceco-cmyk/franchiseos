import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1_Intro } from './video_scenes/Scene1_Intro';
import { Scene2_Dashboard } from './video_scenes/Scene2_Dashboard';
import { Scene3_Assistant } from './video_scenes/Scene3_Assistant';
import { Scene4_Compliance } from './video_scenes/Scene4_Compliance';
import { Scene5_Tasks } from './video_scenes/Scene5_Tasks';
import { Scene6_Close } from './video_scenes/Scene6_Close';

export const SCENE_DURATIONS = {
  intro: 13500,
  dashboard: 14500,
  assistant: 14000,
  compliance: 14000,
  tasks: 12000,
  close: 13000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  intro: Scene1_Intro,
  dashboard: Scene2_Dashboard,
  assistant: Scene3_Assistant,
  compliance: Scene4_Compliance,
  tasks: Scene5_Tasks,
  close: Scene6_Close,
};

const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let cumulativeMs = 0;
  for (const [key, ms] of Object.entries(SCENE_DURATIONS)) {
    out[key] = cumulativeMs / 1000;
    cumulativeMs += ms;
  }
  return out;
})();

const AUDIO_SEEK_EPSILON_SEC = 0.18;

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 1.0;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) {
      audio.currentTime = targetTime;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted]);

  return (
    <div className="w-full h-screen overflow-hidden relative bg-[#020617]">
      {/* Persistent Background Layer */}
      <div className="absolute inset-0 z-0">
        {/* Animated Grid */}
        <motion.div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
          animate={{
            y: [0, -40],
            x: [0, -40]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Ambient Blobs */}
        <motion.div
          className="absolute w-[80vw] h-[80vw] rounded-full mix-blend-screen filter blur-[100px] opacity-30"
          style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }}
          animate={{
            x: sceneIndex % 2 === 0 ? '-10vw' : '30vw',
            y: sceneIndex % 2 === 0 ? '-20vh' : '10vh',
            scale: sceneIndex % 2 === 0 ? 1 : 1.2
          }}
          transition={{ duration: 10, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }}
          animate={{
            x: sceneIndex % 2 === 0 ? '40vw' : '-10vw',
            y: sceneIndex % 2 === 0 ? '40vh' : '60vh',
            scale: sceneIndex % 2 === 0 ? 1.2 : 1
          }}
          transition={{ duration: 12, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>

      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/composite_audio.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
      />
    </div>
  );
}
