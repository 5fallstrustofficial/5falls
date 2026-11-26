"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard") ?? false;

  useEffect(() => {
    if (isDashboard) return;

    // Initialize smooth scrolling with reduced, calmer scroll speed
    const lenis = new Lenis({
      duration: 1.4, // Smoother glide duration
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Gentle exponential ease-out
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.85, // Calibrated down by 15% to reduce scroll speed
      touchMultiplier: 1.5,
      prevent: (node) =>
        Boolean(
          node instanceof Element &&
            node.closest("[data-lenis-prevent], [role='dialog'], .fixed.inset-0")
        ),
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
  }, [isDashboard]);

  return null;
}
