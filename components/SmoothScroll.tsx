"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const ticker = gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    // Expose for capture scripts / dev tools
    (window as any).__lenis = lenis;
    return () => {
      (window as any).__lenis = null;
      lenis.destroy();
      gsap.ticker.remove(ticker);
    };
  }, []);

  return <>{children}</>;
}
