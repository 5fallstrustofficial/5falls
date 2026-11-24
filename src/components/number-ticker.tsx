"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

const DIGIT_H = 40; // px height of one digit cell

function ReelDigit({
  targetDigit,
  digitIndex,
  progress,
}: {
  targetDigit: number;
  digitIndex: number;
  progress: MotionValue<number>;
}) {
  // Calibrated reel: scrolls a controlled number of rotations so digits are clearly visible
  // and decelerate gracefully rather than spinning at hyper-speed.
  const extraRotations = 1 + Math.min(digitIndex * 0.3, 1.2);
  const totalSteps = Math.round(extraRotations * 10) + targetDigit;
  const reel = Array.from({ length: totalSteps + 1 }, (_, n) => n % 10);

  const y = useTransform(progress, (p) => -p * totalSteps * DIGIT_H);

  return (
    <span className="relative h-10 w-[0.62em] overflow-hidden inline-block align-middle">
      <motion.span style={{ y }} className="absolute inset-x-0 top-0 flex flex-col items-center">
        {reel.map((num, idx) => (
          <span key={idx} className="grid h-10 place-items-center font-bold">
            {num}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/**
 * Quarry UI NumberTicker:
 * A rolling odometer with calibrated, smooth scroll speed.
 * Digits roll gracefully and decelerate smoothly when entering the viewport.
 */
export function NumberTicker({
  value = 20000,
  prefix = "",
  suffix = "",
  className,
}: {
  value?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });
  const progress = useMotionValue(0);

  useEffect(() => {
    if (inView) {
      // 2.2s duration with cubic-bezier easeOut curve provides a gentle, premium odometer scroll speed
      const controls = animate(progress, 1, {
        duration: 2.2,
        ease: [0.16, 1, 0.3, 1],
      });
      return () => controls.stop();
    }
  }, [inView, progress]);

  // Format value into string with standard thousand separators
  const safeValue = Math.max(0, Math.round(value));
  const formattedStr = safeValue.toLocaleString("en-US");

  let digitCounter = 0;

  return (
    <div ref={ref} className={cn("inline-flex items-center", className)}>
      <div
        aria-label={`${prefix}${safeValue.toLocaleString()}${suffix}`}
        className="flex items-center font-bold tabular-nums tracking-tight text-foreground"
      >
        {prefix && <span className="mr-0.5 text-muted-foreground">{prefix}</span>}
        {formattedStr.split("").map((char, index) => {
          if (char === "," || char === ".") {
            return (
              <span key={`sep-${index}`} className="px-0.5 text-muted-foreground">
                {char}
              </span>
            );
          }
          const target = parseInt(char, 10);
          const currentDigitIdx = digitCounter++;
          return (
            <span key={`digit-${index}`} className="flex items-center">
              <ReelDigit
                targetDigit={isNaN(target) ? 0 : target}
                digitIndex={currentDigitIdx}
                progress={progress}
              />
            </span>
          );
        })}
        {suffix && <span className="ml-0.5 text-primary">{suffix}</span>}
      </div>
    </div>
  );
}
