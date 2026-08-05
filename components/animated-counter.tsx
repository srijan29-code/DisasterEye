'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

type Props = {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
};

export function AnimatedCounter({ value, duration = 2000, suffix = '', prefix = '', className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let startTime: number | null = null;
    let frame: number;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
      else setCount(value);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  return (
    <motion.span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  );
}
