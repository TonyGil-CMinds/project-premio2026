"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PATH_DS, LEAF_DS } from "@/lib/logo-paths";

// Gradient fills per path — same visual order as PATH_DS
const PATH_FILLS = [
  "#A4D73A",
  "url(#paint5_linear_7_55)",
  "url(#paint0_linear_7_55)",
  "#A4D73A",
  "#A4D73A",
  "url(#paint1_linear_7_55)",
  "#A4D73A",
  "url(#paint2_linear_7_55)",
  "#A4D73A",
] as const;

const LEAF_FILLS = [
  "url(#paint3_linear_7_55)",
  "url(#paint4_linear_7_55)",
] as const;

interface Props {
  // When true: skip the draw animation and show the final logo immediately.
  // Used inside the hero so the loader's animation isn't repeated.
  immediate?: boolean;
}

export default function PremioLogo({ immediate = false }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const strokes = Array.from(svg.querySelectorAll<SVGPathElement>(".ls"));
    const fills   = Array.from(svg.querySelectorAll<SVGPathElement>(".lf"));
    const leaves  = Array.from(svg.querySelectorAll<SVGPathElement>(".ll"));

    if (immediate) {
      // Snap to final state — loader already showed the draw animation
      gsap.set(strokes, { autoAlpha: 0 });
      gsap.set(fills,   { autoAlpha: 1 });
      gsap.set(leaves,  { autoAlpha: 1, scale: 1, rotate: 0, transformOrigin: "50% 100%" });
      return;
    }

    // Full stroke-draw → fill → leaves animation (standalone use)
    strokes.forEach((s) => {
      const len = s.getTotalLength();
      gsap.set(s, { attr: { "stroke-dasharray": len, "stroke-dashoffset": len }, autoAlpha: 1 });
    });
    gsap.set(fills,  { autoAlpha: 0 });
    gsap.set(leaves, { autoAlpha: 0, scale: 0.68, rotate: -18, transformOrigin: "50% 100%" });

    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    tl.to(strokes, { attr: { "stroke-dashoffset": 0 }, duration: 0.9, stagger: 0.055 });
    tl.to(fills,   { autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: "power2.in" },   0.55);
    tl.to(strokes, { autoAlpha: 0, duration: 0.3, stagger: 0.04, ease: "power1.in" },   1.1);
    tl.to(leaves,  { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.82, stagger: 0.1, ease: "expo.out" }, 0.7);

    return () => { tl.kill(); };
  }, [immediate]);

  return (
    <svg
      ref={svgRef}
      className="premio-logo-svg"
      viewBox="0 0 1466 573"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Premio"
    >
      {/* Stroke layer */}
      {PATH_DS.map((d, i) => (
        <path key={`s${i}`} className="ls" d={d}
          fill="none" stroke="#a4d73a" strokeWidth={9}
          strokeLinejoin="round" strokeLinecap="round" />
      ))}

      {/* Fill layer */}
      {PATH_DS.map((d, i) => (
        <path key={`f${i}`} className="lf" d={d} fill={PATH_FILLS[i]} />
      ))}

      {/* Leaves */}
      {LEAF_DS.map((d, i) => (
        <path key={`l${i}`} className="ll" d={d} fill={LEAF_FILLS[i]} />
      ))}

      <defs>
        <linearGradient id="paint0_linear_7_55" x1="365.137" y1="313.247" x2="653.836" y2="588.364" gradientUnits="userSpaceOnUse">
          <stop stopColor="#148548" /><stop offset="0.04" stopColor="#2D9345" /><stop offset="0.1" stopColor="#4DA542" />
          <stop offset="0.16" stopColor="#68B53F" /><stop offset="0.24" stopColor="#7EC13D" /><stop offset="0.32" stopColor="#8FCB3B" />
          <stop offset="0.43" stopColor="#9BD23A" /><stop offset="0.58" stopColor="#A2D53A" /><stop offset="1" stopColor="#A4D73A" />
        </linearGradient>
        <linearGradient id="paint1_linear_7_55" x1="550.527" y1="326.414" x2="675.676" y2="326.414" gradientUnits="userSpaceOnUse">
          <stop stopColor="#148548" /><stop offset="0.04" stopColor="#299145" /><stop offset="0.1" stopColor="#4AA342" />
          <stop offset="0.17" stopColor="#66B33F" /><stop offset="0.26" stopColor="#7DC03D" /><stop offset="0.35" stopColor="#8ECA3C" />
          <stop offset="0.46" stopColor="#9AD13A" /><stop offset="0.62" stopColor="#A2D53A" /><stop offset="1" stopColor="#A4D73A" />
        </linearGradient>
        <linearGradient id="paint2_linear_7_55" x1="1123.63" y1="491.723" x2="1123.63" y2="238.446" gradientUnits="userSpaceOnUse">
          <stop stopColor="#148548" /><stop offset="0.04" stopColor="#299145" /><stop offset="0.1" stopColor="#4AA342" />
          <stop offset="0.17" stopColor="#66B33F" /><stop offset="0.26" stopColor="#7DC03D" /><stop offset="0.35" stopColor="#8ECA3C" />
          <stop offset="0.46" stopColor="#9AD13A" /><stop offset="0.62" stopColor="#A2D53A" /><stop offset="1" stopColor="#A4D73A" />
        </linearGradient>
        <linearGradient id="paint3_linear_7_55" x1="1073.95" y1="0" x2="1073.95" y2="169.611" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A4D73A" /><stop offset="1" stopColor="#148548" />
        </linearGradient>
        <linearGradient id="paint4_linear_7_55" x1="1164.99" y1="61.0034" x2="1164.99" y2="174.959" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A4D73A" /><stop offset="1" stopColor="#057F4E" />
        </linearGradient>
        <linearGradient id="paint5_linear_7_55" x1="68.3762" y1="349.328" x2="133.088" y2="349.328" gradientUnits="userSpaceOnUse">
          <stop stopColor="#148548" /><stop offset="0.04" stopColor="#2D9345" /><stop offset="0.1" stopColor="#4DA542" />
          <stop offset="0.16" stopColor="#68B53F" /><stop offset="0.24" stopColor="#7EC13D" /><stop offset="0.32" stopColor="#8FCB3B" />
          <stop offset="0.43" stopColor="#9BD23A" /><stop offset="0.58" stopColor="#A2D53A" /><stop offset="1" stopColor="#A4D73A" />
        </linearGradient>
      </defs>
    </svg>
  );
}
