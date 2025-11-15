"use client";

import { FC, ReactNode } from "react";
import { motion, MotionProps } from "framer-motion";

type TransitionProviderProps = {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  delay?: number;
  easing?: "easeIn" | "easeOut" | "easeInOut";
};

const directionVariants = {
  up: { y: 20, opacity: 0 },
  down: { y: -20, opacity: 0 },
  left: { x: 20, opacity: 0 },
  right: { x: -20, opacity: 0 },
};

const TransitionProvider: FC<TransitionProviderProps> = ({
  children,
  direction = "up",
  duration = 0.5,
  delay = 0,
  easing = "easeOut",
}) => {
  const initial = directionVariants[direction];

  const transition: MotionProps["transition"] = {
    duration,
    delay,
    ease: easing,
  };

  return (
    <motion.div initial={initial} animate={{ opacity: 1, x: 0, y: 0 }} transition={transition}>
      {children}
    </motion.div>
  );
};

export default TransitionProvider;
