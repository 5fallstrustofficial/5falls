"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    // Initialize smooth scrolling with reduced, calmer scroll speed
    const lenis = new Lenis({
      duration: 1.4, // Smoother glide duration
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Gentle exponential ease-out
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.85, // Calibrated down by 15% to reduce scroll speed
      touchMultiplier: 1.5,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const animId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animId);
      lenis.destroy();
    };
  }, []);

  return null;
}
