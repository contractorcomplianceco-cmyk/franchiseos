// Video player hook - handles recording lifecycle, scene advancement, and looping

import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    startRecording?: () => Promise<void>;
    stopRecording?: () => void;
  }
}

export interface SceneDurations {
  [key: string]: number;
}

export interface UseVideoPlayerOptions {
  durations: SceneDurations;
  onVideoEnd?: () => void;
  loop?: boolean;
  paused?: boolean;
}

export interface UseVideoPlayerReturn {
  currentScene: number;
  totalScenes: number;
  currentSceneKey: string;
  hasEnded: boolean;
}

export function useVideoPlayer(options: UseVideoPlayerOptions): UseVideoPlayerReturn {
  const { durations, onVideoEnd, loop = true, paused = false } = options;

  // Captured once on mount -- durations must be a static object
  const sceneKeys = useRef(Object.keys(durations)).current;
  const totalScenes = sceneKeys.length;
  const durationsArray = useRef(Object.values(durations)).current;

  const [currentScene, setCurrentScene] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);

  // Pause/resume bookkeeping: track remaining time in the current scene so a
  // resume continues where it left off (keeps visuals in sync with audio).
  const sceneStartRef = useRef(0);
  const remainingRef = useRef(0);
  const remainingSceneRef = useRef(-1);

  // Start recording on mount
  useEffect(() => {
    window.startRecording?.();
  }, []);

  // Scene advancement -- loops independently of recording
  useEffect(() => {
    if (hasEnded && !loop) return;

    // Entering a new scene resets the remaining-time budget to its full duration.
    if (remainingSceneRef.current !== currentScene) {
      remainingSceneRef.current = currentScene;
      remainingRef.current = durationsArray[currentScene];
    }

    // While paused, hold the current remaining time and run no timer.
    if (paused) return;

    sceneStartRef.current = Date.now();
    const timer = setTimeout(() => {
      // Last scene just finished playing
      if (currentScene >= totalScenes - 1) {
        if (!hasEnded) {
          window.stopRecording?.();
          setHasEnded(true);
          onVideoEnd?.();
        }
        if (loop) {
          setCurrentScene(0);
        }
      } else {
        setCurrentScene(prev => prev + 1);
      }
    }, remainingRef.current);

    // On cleanup (pause toggle or scene change) subtract elapsed so a resume
    // continues from where it left off instead of restarting the scene.
    return () => {
      clearTimeout(timer);
      const elapsed = Date.now() - sceneStartRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    };
  }, [currentScene, totalScenes, durationsArray, hasEnded, loop, paused, onVideoEnd]);

  return {
    currentScene,
    totalScenes,
    currentSceneKey: sceneKeys[currentScene],
    hasEnded,
  };
}

export function useSceneTimer(events: Array<{ time: number; callback: () => void }>) {
  const firedRef = useRef<Set<number>>(new Set());
  const callbacksRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    callbacksRef.current = events.map(e => e.callback);
  }, [events]);

  const scheduleKey = events.map((event, i) => `${i}:${event.time}`).join('|');

  useEffect(() => {
    firedRef.current = new Set();

    const timers = events.map(({ time }, index) => {
      return setTimeout(() => {
        if (!firedRef.current.has(index)) {
          firedRef.current.add(index);
          callbacksRef.current[index]?.();
        }
      }, time);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [scheduleKey]);
}
