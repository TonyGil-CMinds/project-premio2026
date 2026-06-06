"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PATH_DS, LEAF_DS } from "@/lib/logo-paths";

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef       = useRef<SVGSVGElement>(null);
  const cbRef        = useRef(onComplete);

  useEffect(() => { cbRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const container = containerRef.current;
    const svg       = svgRef.current;
    if (!container || !svg) return;

    const strokes = Array.from(svg.querySelectorAll<SVGPathElement>(".ld-s"));
    const fills   = Array.from(svg.querySelectorAll<SVGPathElement>(".ld-f"));
    const leaves  = Array.from(svg.querySelectorAll<SVGPathElement>(".ld-l"));

    strokes.forEach((s) => {
      const len = s.getTotalLength();
      gsap.set(s, { attr: { "stroke-dasharray": len, "stroke-dashoffset": len }, autoAlpha: 1 });
    });
    gsap.set(fills,  { autoAlpha: 0 });
    gsap.set(leaves, { autoAlpha: 0, scale: 0.7, rotate: -18, transformOrigin: "50% 100%" });

    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

    // 1 — draw strokes L→R
    tl.to(strokes, { attr: { "stroke-dashoffset": 0 }, duration: 0.9, stagger: 0.055 });

    // 2 — fills fade in mid-draw
    tl.to(fills, { autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: "power2.in" }, 0.55);

    // 3 — strokes fade out as fills solidify
    tl.to(strokes, { autoAlpha: 0, duration: 0.3, stagger: 0.04, ease: "power1.in" }, 1.1);

    // 4 — leaves spring in
    tl.to(leaves, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.82, stagger: 0.1, ease: "expo.out" }, 0.7);

    // After draw completes: FLIP the loader logo to match the hero logo's position,
    // then fade out — creating a continuous transition rather than a cut.
    tl.add(() => {
      const heroSvg  = document.querySelector<SVGSVGElement>(".premio-logo-svg");
      const loaderWrap = containerRef.current?.querySelector<HTMLDivElement>(".loader-logo-wrap") ?? null;

      if (!heroSvg || !loaderWrap) {
        gsap.to(container, { autoAlpha: 0, duration: 0.5 });
        cbRef.current();
        return;
      }

      const h = heroSvg.getBoundingClientRect();
      const l = loaderWrap.getBoundingClientRect();
      const scale = h.width / l.width;
      const dx = (h.left + h.width  / 2) - (l.left + l.width  / 2);
      const dy = (h.top  + h.height / 2) - (l.top  + l.height / 2);

      gsap.to(loaderWrap, {
        x: dx,
        y: dy,
        scale,
        duration: 0.65,
        ease: "power3.inOut",
        transformOrigin: "50% 50%",
        onComplete() {
          // Snap hero logo visible (it's already in final state) then fade loader
          gsap.set(".premio-logo-svg", { autoAlpha: 1 });
          gsap.to(container, { autoAlpha: 0, duration: 0.25 });
          cbRef.current();   // hero entrance: nav, countdown, paragraph, CTA
        },
      });
    }, "+=0.08");

    return () => { tl.kill(); };
  }, []);

  return (
    <div className="loader-overlay" ref={containerRef}>
      <div className="loader-logo-wrap">
        <svg
          ref={svgRef}
          className="loader-svg"
          viewBox="0 0 1466 573"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Stroke layer */}
          {PATH_DS.map((d, i) => (
            <path key={`s${i}`} className="ld-s" d={d}
              fill="none" stroke="#a4d73a" strokeWidth={9}
              strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {/* Fill layer — solid green, no gradient IDs needed */}
          {PATH_DS.map((d, i) => (
            <path key={`f${i}`} className="ld-f" d={d} fill="#a4d73a" />
          ))}
          {/* Leaves */}
          {LEAF_DS.map((d, i) => (
            <path key={`l${i}`} className="ld-l" d={d} fill="#a4d73a" />
          ))}
        </svg>
      </div>
    </div>
  );
}
