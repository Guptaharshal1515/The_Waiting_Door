import { useEffect, useRef } from "react";
import { DRONE_FREQ_BASE, DRONE_FREQ_TENSION } from "../game/constants";

interface AmbientAudioProps {
  tension: number; // 0.0 to 1.0 (based on waiting progress)
  isPlaying: boolean;
}

export function AmbientAudio({ tension, isPlaying }: AmbientAudioProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const baseOscRef = useRef<OscillatorNode | null>(null);
  const tensionOscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (isPlaying && !audioContextRef.current) {
      // Init Audio Context on first play
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const mainGain = ctx.createGain();
      mainGain.gain.value = 0.1; // Keep it quiet
      mainGain.connect(ctx.destination);
      gainNodeRef.current = mainGain;

      // Base Drone (Deep hum)
      const baseOsc = ctx.createOscillator();
      baseOsc.type = "sine";
      baseOsc.frequency.setValueAtTime(DRONE_FREQ_BASE, ctx.currentTime);
      baseOsc.connect(mainGain);
      baseOsc.start();
      baseOscRef.current = baseOsc;

      // Tension Drone (Higher pitch, dissonant)
      const tensionOsc = ctx.createOscillator();
      tensionOsc.type = "triangle";
      tensionOsc.frequency.setValueAtTime(DRONE_FREQ_TENSION, ctx.currentTime);
      const tensionGain = ctx.createGain();
      tensionGain.gain.value = 0; // Start silent
      tensionGain.connect(mainGain);
      tensionOsc.connect(tensionGain);
      tensionOsc.start();
      tensionOscRef.current = tensionOsc;
      
      // Store the gain node for the tension osc directly on the ref for easy access if needed, 
      // but strictly we should probably store the gain node. 
      // For simplicity, let's attach the gain node to the oscillator object loosely typing
      (tensionOsc as any).gainNode = tensionGain;
    }

    return () => {
      if (audioContextRef.current && !isPlaying) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isPlaying]);

  // Update tension sound based on prop
  useEffect(() => {
    if (tensionOscRef.current) {
        const osc = tensionOscRef.current as any;
        const gainNode = osc.gainNode as GainNode;
        if (gainNode) {
            // Smooth transition
            const ctx = audioContextRef.current;
            if (ctx) {
                gainNode.gain.setTargetAtTime(tension * 0.15, ctx.currentTime, 0.5);
                // Mild frequency detuning for horror effect
                osc.frequency.setTargetAtTime(DRONE_FREQ_TENSION + (tension * 10), ctx.currentTime, 0.5);
            }
        }
    }
  }, [tension]);

  return null;
}
