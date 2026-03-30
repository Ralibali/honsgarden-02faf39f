import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EggSuccessAnimationProps {
  show: boolean;
  count: number;
  onDone: () => void;
}

const emojis = ['🥚', '🐔', '✨', '🎉', '💚', '🌟'];

export function EggSuccessAnimation({ show, count, onDone }: EggSuccessAnimationProps) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onDone, 1800);
      return () => clearTimeout(t);
    }
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Confetti particles */}
          {emojis.map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl"
              initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [0, -80 - Math.random() * 60, -120 - Math.random() * 40, -180],
                x: [(i - 2.5) * 20, (i - 2.5) * 50 + (Math.random() - 0.5) * 40],
                scale: [0.5, 1.2, 1, 0.6],
                rotate: [0, (i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 20)],
              }}
              transition={{ duration: 1.5, delay: i * 0.08, ease: 'easeOut' }}
            >
              {emoji}
            </motion.span>
          ))}

          {/* Center count badge */}
          <motion.div
            className="bg-primary text-primary-foreground rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-2xl"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: [0, 1.2, 1], rotate: [0, 5, 0] }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <span className="text-2xl font-bold tabular-nums">{count}</span>
            <span className="text-[9px] uppercase tracking-widest opacity-80">ägg</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
