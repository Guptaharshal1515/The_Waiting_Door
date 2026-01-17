import { useState } from "react";
import { GameCanvas } from "@/components/GameCanvas";
import { StartScreen } from "@/components/StartScreen";
import { EndScreen } from "@/components/EndScreen";
import { AmbientAudio } from "@/components/AmbientAudio";
import { useCreateSession } from "@/hooks/use-sessions";
import { AnimatePresence, motion } from "framer-motion";

type GamePhase = 'START' | 'PLAYING' | 'ENDING';

export default function GamePage() {
  const [phase, setPhase] = useState<GamePhase>('START');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [tension, setTension] = useState(0);
  const [startLevel, setStartLevel] = useState(0);

  const createSessionMutation = useCreateSession();

  const handleStart = () => {
    setStartLevel(0);
    setPhase('PLAYING');
  };

  const handleStartLevel = (level: number) => {
    setStartLevel(level);
    setPhase('PLAYING');
  };

  const handleComplete = (duration: number, waited: boolean) => {
    setSessionDuration(duration);
    setPhase('ENDING');

    // Persist session
    createSessionMutation.mutate({
      durationSeconds: duration,
      completed: true,
      waitedForDoor: waited
    });
  };

  const handleRestart = () => {
    setPhase('START');
    setTension(0);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">
      <AmbientAudio
        isPlaying={phase === 'PLAYING'}
        tension={tension}
      />

      {/* Main Content Area */}
      <div className="w-full max-w-5xl aspect-video relative z-10">
        <AnimatePresence mode="wait">
          {phase === 'START' && (
            <motion.div
              key="start"
              exit={{ opacity: 0, transition: { duration: 1 } }}
              className="absolute inset-0"
            >
              <StartScreen onStart={handleStart} onStartLevel={handleStartLevel} />
            </motion.div>
          )}

          {phase === 'PLAYING' && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 2 } }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <GameCanvas
                onGameComplete={handleComplete}
                onTensionChange={setTension}
                initialLevel={startLevel}
              />

              {/* Optional in-game hint that fades in only if user is completely stuck? 
                  Nah, minimalist is better. */}
            </motion.div>
          )}

          {phase === 'ENDING' && (
            <motion.div
              key="end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }} // Slow fade in for realization
              className="absolute inset-0"
            >
              <EndScreen onRestart={handleRestart} duration={sessionDuration} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Atmospheric Background Effects */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150"></div>
      </div>
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />
      <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent pointer-events-none z-20" />
    </div>
  );
}
