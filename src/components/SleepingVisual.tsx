"use client";

import { motion } from "framer-motion";

export function SleepingVisual() {
  return (
    <div className="relative flex min-h-52 items-center justify-center overflow-hidden rounded-[2rem]">
      <motion.div
        animate={{
          opacity: [0.35, 0.6, 0.35],
          scale: [0.96, 1.04, 0.96],
        }}
        className="absolute h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(99,255,212,0.25)_0%,_rgba(99,255,212,0)_70%)] blur-md"
        transition={{ duration: 4.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        animate={{
          scale: [0.98, 1.04, 0.98],
          y: [0, -4, 0],
          rotate: [0, 2, 0, -2, 0],
        }}
        className="relative h-28 w-28 rounded-full border border-white/14 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.62),rgba(255,255,255,0)_24%),radial-gradient(circle_at_50%_55%,rgba(151,255,218,0.88),rgba(92,219,197,0.58)_42%,rgba(40,121,153,0.22)_72%,rgba(5,12,24,0)_88%)] shadow-[0_0_40px_rgba(115,255,214,0.16),0_18px_40px_rgba(0,0,0,0.35)]"
        transition={{ duration: 4.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <div className="absolute inset-x-6 top-8 h-3 rounded-full bg-white/15 blur-sm" />
        <div className="absolute bottom-5 left-1/2 h-5 w-12 -translate-x-1/2 rounded-full border-b border-white/20" />
      </motion.div>
    </div>
  );
}
