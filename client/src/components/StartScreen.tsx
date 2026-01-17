import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface StartScreenProps {
  onStart: () => void;
  onStartLevel: (level: number) => void;
}

export function StartScreen({ onStart, onStartLevel }: StartScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full p-8 gap-12"
    >
      {/* Main Start Section */}
      <div className="flex flex-col items-center justify-center space-y-12 text-center">
        <div className="space-y-4">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-6xl md:text-8xl font-display tracking-[0.2em] text-white/90 drop-shadow-lg"
          >
            THE WAITING DOOR
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="text-xl md:text-2xl text-zinc-500 font-mono"
          >
            A psychological experience
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="space-y-6"
        >
          <div className="text-zinc-400 font-mono text-sm space-y-2 border-l-2 border-zinc-800 pl-4 text-left max-w-md">
            <p>Controls: WASD or Arrow Keys to move.</p>
            <p>Goal: Find the exit.</p>
            <p className="text-zinc-600 italic">Patience is a virtue, action is a distraction.</p>
          </div>

          <Button
            onClick={onStart}
            className="w-full h-14 text-lg bg-white text-black hover:bg-zinc-200 hover:scale-105 transition-all duration-300 font-display tracking-widest"
          >
            BEGIN
          </Button>
        </motion.div>
      </div>

      {/* Level Selection */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 3, duration: 1 }}
        className="space-y-4"
      >
        <h3 className="text-zinc-400 font-mono text-sm tracking-wider">SELECT LEVEL</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <Button
              key={level}
              onClick={() => onStartLevel(level - 1)}
              className="w-20 h-20 text-2xl bg-zinc-800 text-white hover:bg-purple-600 hover:scale-110 transition-all duration-300 font-display"
            >
              {level}
            </Button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
