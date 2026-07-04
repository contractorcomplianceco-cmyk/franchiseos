import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, Pause, Play, Repeat, Volume2, VolumeX } from 'lucide-react';
import VideoTemplate, { SCENE_DURATIONS } from './VideoTemplate';
import { useSceneControls } from './useSceneControls';

const PROGRESS_TICK_MS = 60;
const AUTO_HIDE_MS = 2000;

interface ControlBarProps {
  visible: boolean;
  locked: boolean;
  muted: boolean;
  paused: boolean;
  sceneKeys: string[];
  activeIndex: number;
  activeDuration: number;
  tick: number;
  onTogglePlay: () => void;
  onToggleLock: () => void;
  onToggleMute: () => void;
  onJumpTo: (index: number) => void;
  onHide: () => void;
}

function ProgressSegments({
  sceneKeys, activeIndex, activeDuration, tick, paused, onJumpTo,
}: {
  sceneKeys: string[];
  activeIndex: number;
  activeDuration: number;
  tick: number;
  paused: boolean;
  onJumpTo: (index: number) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);

  // Reset the elapsed clock whenever the scene changes / is jumped to.
  useEffect(() => {
    elapsedRef.current = 0;
    setElapsed(0);
  }, [tick]);

  // Advance only while playing; freeze (and resume from) accumulated elapsed.
  useEffect(() => {
    if (paused) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      elapsedRef.current += now - last;
      last = now;
      setElapsed(elapsedRef.current);
    }, PROGRESS_TICK_MS);
    return () => window.clearInterval(id);
  }, [tick, paused]);

  const progress = activeDuration > 0 ? Math.min(1, elapsed / activeDuration) : 0;

  return (
    <div className="flex-1 flex items-center gap-1 sm:gap-1.5">
      {sceneKeys.map((key, i) => {
        const isActive = i === activeIndex;
        const fill = isActive ? progress * 100 : i < activeIndex ? 100 : 0;
        return (
          <button
            key={key}
            onClick={() => onJumpTo(i)}
            className="flex-1 h-2 sm:h-3 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:bg-white/25 transition-all relative min-h-[8px] sm:min-h-[12px]"
            aria-label={`Jump to scene ${i + 1}`}
            aria-current={isActive ? 'true' : undefined}
          >
            <div
              className="absolute inset-y-0 left-0 bg-white/90 rounded-full transition-[width] duration-100"
              style={{ width: `${fill}%` }}
            />
          </button>
        );
      })}
    </div>
  );
}

function ControlBar({
  visible, locked, muted, paused, sceneKeys, activeIndex, activeDuration, tick,
  onTogglePlay, onToggleLock, onToggleMute, onJumpTo, onHide,
}: ControlBarProps) {
  const btn =
    'flex items-center justify-center transition-colors rounded-lg shrink-0 w-10 h-10 sm:w-14 sm:h-14';
  const icon = 'w-5 h-5 sm:w-8 sm:h-8';
  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 bg-black/50 backdrop-blur-sm px-3 py-3 sm:px-5 sm:py-4 transition-all duration-200 ease-out ${
        visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
      aria-hidden={!visible}
    >
      <button
        onClick={onTogglePlay}
        className={`${btn} text-white bg-white/15 hover:bg-white/25`}
        title={paused ? 'Play' : 'Pause'}
        aria-label={paused ? 'Play' : 'Pause'}
        aria-pressed={!paused}
      >
        {paused ? <Play className={icon} /> : <Pause className={icon} />}
      </button>

      <button
        onClick={onToggleLock}
        className={`${btn} hidden sm:flex ${
          locked
            ? 'text-white bg-white/15 hover:bg-white/25'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
        title={locked ? 'Loop current scene: on' : 'Loop current scene: off'}
        aria-label={locked ? 'Loop current scene: on' : 'Loop current scene: off'}
        aria-pressed={locked}
      >
        <Repeat className={icon} />
      </button>

      <button
        onClick={onToggleMute}
        className={`${btn} ${
          muted
            ? 'text-white/60 hover:text-white hover:bg-white/10'
            : 'text-white bg-white/15 hover:bg-white/25'
        }`}
        title={muted ? 'Unmute' : 'Mute'}
        aria-label={muted ? 'Unmute' : 'Mute'}
        aria-pressed={!muted}
      >
        {muted ? <VolumeX className={icon} /> : <Volume2 className={icon} />}
      </button>

      <div className="w-px self-stretch bg-white/15" aria-hidden="true" />

      <ProgressSegments
        sceneKeys={sceneKeys}
        activeIndex={activeIndex}
        activeDuration={activeDuration}
        tick={tick}
        paused={paused}
        onJumpTo={onJumpTo}
      />

      <div className="text-sm sm:text-xl text-white/60 font-mono tabular-nums shrink-0">
        {activeIndex + 1}/{sceneKeys.length}
      </div>

      <button
        onClick={onHide}
        className={`${btn} text-white/60 hover:text-white hover:bg-white/10`}
        title="Hide controls"
        aria-label="Hide controls"
      >
        <ChevronDown className="w-6 h-6 sm:w-10 sm:h-10" />
      </button>
    </div>
  );
}

export default function VideoWithControls() {
  const isIframed = typeof window !== 'undefined' && window.self !== window.top;

  const {
    sceneKeys, activeIndex, locked, mountKey, tick,
    durations, activeDuration, onSceneChange, jumpTo, toggleLock,
  } = useSceneControls(SCENE_DURATIONS);

  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const hideTimer = useRef<number | null>(null);

  const clearHide = useCallback(() => {
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  // Reveal the bar and (unless paused) start the 2s auto-hide countdown.
  const showControls = useCallback(() => {
    setVisible(true);
    clearHide();
    if (!paused) {
      hideTimer.current = window.setTimeout(() => setVisible(false), AUTO_HIDE_MS);
    }
  }, [paused, clearHide]);

  // Keep the bar up while paused; resume the countdown when playing.
  useEffect(() => {
    setVisible(true);
    clearHide();
    if (!paused) {
      hideTimer.current = window.setTimeout(() => setVisible(false), AUTO_HIDE_MS);
    }
    return clearHide;
  }, [paused, clearHide]);

  // Export path: no props, preserves recording markers and unmuted audio.
  if (!isIframed) return <VideoTemplate />;

  return (
    <div
      className="relative w-full h-screen"
      onPointerMove={showControls}
      onPointerDown={showControls}
    >
      <VideoTemplate
        key={mountKey}
        durations={durations}
        loop
        muted={muted}
        paused={paused}
        onSceneChange={onSceneChange}
      />
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <ControlBar
          visible={visible}
          locked={locked}
          muted={muted}
          paused={paused}
          sceneKeys={sceneKeys}
          activeIndex={activeIndex}
          activeDuration={activeDuration}
          tick={tick}
          onTogglePlay={() => setPaused(p => !p)}
          onToggleLock={toggleLock}
          onToggleMute={() => setMuted(m => !m)}
          onJumpTo={jumpTo}
          onHide={() => { clearHide(); setVisible(false); }}
        />
      </div>
    </div>
  );
}
