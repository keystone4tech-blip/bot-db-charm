import type { Transition, Variants } from "framer-motion";

export const transitions = {
  smooth: { type: "spring", stiffness: 220, damping: 22, mass: 0.9 } satisfies Transition,
  snappy: { type: "spring", stiffness: 380, damping: 26, mass: 0.7 } satisfies Transition,
  fade: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } satisfies Transition,
};

export const variants = {
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  } satisfies Variants,

  fadeInUp: {
    hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
  } satisfies Variants,

  scaleIn: {
    hidden: { opacity: 0, scale: 0.98, y: 8 },
    show: { opacity: 1, scale: 1, y: 0 },
  } satisfies Variants,

  stagger: {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
  } satisfies Variants,
};

export function withDelay(transition: Transition, delay = 0): Transition {
  return { ...transition, delay };
}

export const springConfigs = {
  counter: { tension: 220, friction: 24, mass: 0.9 },
  gentle: { tension: 170, friction: 26, mass: 1 },
};
