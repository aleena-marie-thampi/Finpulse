import { useState, useEffect, useRef } from 'react';

export function useCounter(target, duration = 1200, start = 0) {
  const [value, setValue] = useState(start);
  const frameRef = useRef(null);

  useEffect(() => {
    if (target === undefined || target === null) return;
    const startTime = Date.now();
    const startVal = start;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
}
