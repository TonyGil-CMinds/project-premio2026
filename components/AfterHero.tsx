"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CONFIGS = [
  { src: "/assets/premio-afterhero-element1.svg", rot: 10 },
  { src: "/assets/premio-afterhero-element2.svg", rot: 12 },
  { src: "/assets/premio-afterhero-element3.svg", rot: -13 },
  { src: "/assets/premio-afterhero-element4.svg", rot: -17 },
] as const;

// ── Physics constants ──────────────────────────────────────────────────────
const GRAVITY     = 0.18;   // px / frame²
const DAMP        = 0.965;  // air resistance per frame
const RESTITUTION = 0.42;   // bounce coefficient (walls + elem-elem)
const FRICTION    = 0.82;   // tangential damping on floor contact
const MOUSE_R     = 300;    // mouse influence radius (px)
const MOUSE_F     = 48;     // mouse force magnitude

interface Body {
  el: HTMLDivElement;
  x: number; y: number;
  vx: number; vy: number;
  rot: number; rotV: number;
  homeX: number; homeY: number;
  r: number;
}

export default function AfterHero() {
  const sectionRef    = useRef<HTMLElement>(null);
  const stageRef      = useRef<HTMLDivElement>(null);
  const subjectRef    = useRef<HTMLImageElement>(null);
  const hintRef       = useRef<HTMLDivElement>(null);
  const hintScrollRef = useRef<HTMLSpanElement>(null);
  const hintCtaRef    = useRef<HTMLSpanElement>(null);
  const hintSubRef    = useRef<HTMLSpanElement>(null);
  const elemRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const scrollProg    = useRef(0);

  // ── Scroll-driven entrance — scrubbed, reversible ──────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Start hidden
    gsap.set(subjectRef.current, { yPercent: 60, autoAlpha: 0 });
    CONFIGS.forEach((cfg, i) => {
      const el = elemRefs.current[i];
      if (!el) return;
      gsap.set(el, { yPercent: -130, autoAlpha: 0, rotation: cfg.rot });
    });

    const ctx = gsap.context(() => {
      // Timeline scrubbed by scroll — reverses when scrolling up
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=130%",   // entrance spans 130% of viewport height into the sticky window
          scrub: 1.6,
          onUpdate(self) { scrollProg.current = self.progress; },
        },
      });

      // Subject rises from below
      tl.to(subjectRef.current, { yPercent: 0, autoAlpha: 1, duration: 0.38, ease: "power2.out" }, 0);

      // Elements fall in from above, staggered by scroll position
      CONFIGS.forEach((_, i) => {
        tl.to(
          elemRefs.current[i],
          { yPercent: 0, autoAlpha: 1, duration: 0.32, ease: "power3.out" },
          0.18 + i * 0.22,
        );
      });

      // Hint: scroll guidance appears early, transitions to interaction CTA when elements land
      gsap.set(hintRef.current,       { autoAlpha: 1 });
      gsap.set(hintScrollRef.current, { autoAlpha: 0, y: 6 });
      gsap.set(hintCtaRef.current,    { autoAlpha: 0, y: 8 });
      gsap.set(hintSubRef.current,    { autoAlpha: 0, y: 8 });

      // "Sigue bajando" appears right away
      tl.to(hintScrollRef.current, { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.05);
      // Cross-fade: scroll hint out, CTA in — triggered when last element lands (~0.84)
      tl.to(hintScrollRef.current, { autoAlpha: 0, y: -6, duration: 0.22, ease: "power2.in" }, 0.82);
      tl.to(hintCtaRef.current,    { autoAlpha: 1, y: 0,  duration: 0.3,  ease: "power2.out" }, 0.92);
      tl.to(hintSubRef.current,    { autoAlpha: 1, y: 0,  duration: 0.28, ease: "power2.out" }, 1.0);
    });

    return () => ctx.revert();
  }, []);

  // ── Physics loop — gravity, collisions, mouse repulsion ────────────────────
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const els = elemRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!els.length) return;

    const bodies: Body[] = els.map((el, i) => ({
      el,
      homeX: el.offsetLeft + el.offsetWidth  / 2,
      homeY: el.offsetTop  + el.offsetHeight / 2,
      x:     el.offsetLeft + el.offsetWidth  / 2,
      y:     el.offsetTop  + el.offsetHeight / 2,
      vx: 0, vy: 0,
      rot: CONFIGS[i].rot, rotV: 0,
      r: Math.min(el.offsetWidth, el.offsetHeight) * 0.44,
    }));

    const ro = new ResizeObserver(() => {
      bodies.forEach((b, i) => {
        const el = els[i];
        b.homeX = el.offsetLeft + el.offsetWidth  / 2;
        b.homeY = el.offsetTop  + el.offsetHeight / 2;
        b.x = b.homeX; b.y = b.homeY;
        b.vx = 0; b.vy = 0; b.rotV = 0;
        b.r = Math.min(el.offsetWidth, el.offsetHeight) * 0.44;
        gsap.set(el, { x: 0, y: 0, rotation: CONFIGS[i].rot });
      });
    });
    ro.observe(stage);

    let mouseX = -9999, mouseY = -9999;

    const onMove = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    };
    const onLeave = () => { mouseX = -9999; mouseY = -9999; };

    const onTouch = (e: TouchEvent) => {
      const r = stage.getBoundingClientRect();
      const t = e.touches[0];
      if (!t) return;
      mouseX = t.clientX - r.left;
      mouseY = t.clientY - r.top;
      // Hide hint on first touch
      if (hintRef.current) gsap.to(hintRef.current, { autoAlpha: 0, y: -6, duration: 0.2 });
    };
    const onTouchEnd = () => { mouseX = -9999; mouseY = -9999; };

    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseleave", onLeave);
    stage.addEventListener("touchmove",  onTouch,    { passive: true });
    stage.addEventListener("touchend",   onTouchEnd, { passive: true });

    let rafId: number;

    function tick() {
      const W = stage!.clientWidth;
      const H = stage!.clientHeight;
      // Scale gravity by scroll progress — no gravity during entrance
      const gravScale = Math.min(1, Math.max(0, scrollProg.current * 3 - 0.5));

      // ── Element-element elastic collisions ──────────────────────────────
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i], b = bodies[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d  = Math.hypot(dx, dy);
          const minD = a.r + b.r;
          if (d < minD && d > 0.1) {
            const nx = dx / d, ny = dy / d;
            const overlap = (minD - d) * 0.5;
            // Push apart
            a.x += nx * overlap; a.y += ny * overlap;
            b.x -= nx * overlap; b.y -= ny * overlap;
            // Impulse response (equal mass)
            const dvx = a.vx - b.vx, dvy = a.vy - b.vy;
            const dot = dvx * nx + dvy * ny;
            if (dot < 0) {
              const imp = -(1 + RESTITUTION) * dot * 0.5;
              a.vx += imp * nx; a.vy += imp * ny;
              b.vx -= imp * nx; b.vy -= imp * ny;
              // Transfer some rotation on collision
              a.rotV += imp * 0.8; b.rotV -= imp * 0.8;
            }
          }
        }
      }

      // ── Per-body integration ────────────────────────────────────────────
      bodies.forEach((b) => {
        // Gravity
        b.vy += GRAVITY * gravScale;

        // Mouse repulsion
        const mdx = b.x - mouseX, mdy = b.y - mouseY;
        const md  = Math.hypot(mdx, mdy);
        if (md < MOUSE_R && md > 1) {
          const f = Math.pow((MOUSE_R - md) / MOUSE_R, 1.4) * MOUSE_F;
          b.vx += (mdx / md) * f;
          b.vy += (mdy / md) * f;
        }

        // Air resistance
        b.vx *= DAMP; b.vy *= DAMP;

        // Rotational momentum from horizontal velocity
        b.rotV += b.vx * 0.045;
        b.rotV *= 0.92;
        b.rot  += b.rotV * gravScale;  // rotation only when gravity active

        // Integrate
        b.x += b.vx; b.y += b.vy;

        // ── Stage boundaries ──────────────────────────────────────────────
        if (b.y + b.r > H) {
          b.y = H - b.r;
          b.vy = -Math.abs(b.vy) * RESTITUTION;
          b.vx *= FRICTION;
          b.rotV *= 0.6;
        }
        if (b.y - b.r < 0) {
          b.y = b.r;
          b.vy = Math.abs(b.vy) * RESTITUTION;
        }
        if (b.x - b.r < 0) {
          b.x = b.r;
          b.vx = Math.abs(b.vx) * RESTITUTION;
          b.rotV *= -0.5;
        }
        if (b.x + b.r > W) {
          b.x = W - b.r;
          b.vx = -Math.abs(b.vx) * RESTITUTION;
          b.rotV *= -0.5;
        }

        // Apply: x/y offset from CSS home + rotation
        gsap.set(b.el, {
          x:        b.x - b.homeX,
          y:        b.y - b.homeY,
          rotation: b.rot,
        });
      });

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      stage.removeEventListener("mousemove",  onMove);
      stage.removeEventListener("mouseleave", onLeave);
      stage.removeEventListener("touchmove",  onTouch);
      stage.removeEventListener("touchend",   onTouchEnd);
    };
  }, []);

  return (
    <section className="after-hero" ref={sectionRef}>
      <div className="ah-stage" ref={stageRef}>
        {CONFIGS.map((_, i) => (
          <div
            key={i}
            className={`ah-elem ah-elem-${i + 1}`}
            ref={(el) => { elemRefs.current[i] = el; }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CONFIGS[i].src} alt="" draggable={false} />
          </div>
        ))}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="ah-subject"
          src="/assets/premio-afterhero-subject.png"
          alt="Ganadores Premio Natura500"
          ref={subjectRef}
          draggable={false}
        />

        <div className="ah-hint" ref={hintRef} aria-hidden="true">
          <span className="ah-hint-scroll" ref={hintScrollRef}>↓ Sigue bajando</span>
          <span className="ah-hint-cta"    ref={hintCtaRef}>Toca la imagen</span>
          <span className="ah-hint-sub"    ref={hintSubRef}>Los elementos reaccionan</span>
        </div>
      </div>
    </section>
  );
}
