import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface EndScreenProps {
  onRestart: () => void;
  duration: number;
}

export function EndScreen({ onRestart, duration }: EndScreenProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full space-y-12 text-center z-50 relative"
    >
      <div className="max-w-2xl space-y-8">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-3xl md:text-4xl font-display leading-relaxed text-zinc-100"
        >
          The door opened not because you pushed,<br/>
          but because you stopped pushing.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="w-16 h-[1px] bg-zinc-700 mx-auto"
        />

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="text-zinc-500 font-mono"
        >
          Time spent in the dark: {duration} seconds
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4 }}
      >
        <Button 
          onClick={onRestart}
          variant="outline"
          className="h-12 px-8 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors font-mono uppercase tracking-widest"
        >
          Return to the Void
        </Button>
      </motion.div>
    </motion.div>
  );
}
