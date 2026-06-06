"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CountdownGlass from "./CountdownGlass";
import PremioLogo from "./PremioLogo";

gsap.registerPlugin(ScrollTrigger);

const FLOAT_SIZE   = 56;   // circle diameter in px
const FLOAT_MARGIN = 28;   // distance from viewport edges

interface Props {
  autoPlay?: boolean;
}

export default function PremioHero({ autoPlay = false }: Props) {
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    gsap.set([".nav-shell", ".countdown-hover-field", ".copy-line-wrap", ".hero-cta", ".premio-logo-svg"], {
      autoAlpha: 0,
    });
  }, []);

  useEffect(() => {
    if (!autoPlay) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(".nav-shell",
        { y: -60, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7 },
      );

      tl.fromTo(".countdown-hover-field",
        { scale: 0.55, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(1.5)" },
        "-=0.25",
      );

      tl.fromTo(".copy-line",
        { yPercent: 105 },
        { yPercent: 0, duration: 0.62, stagger: 0.1, ease: "power3.out" },
        "-=0.3",
      );
      tl.set(".copy-line-wrap", { autoAlpha: 1 }, "<");

      tl.fromTo(".hero-cta",
        { y: 16, autoAlpha: 0, scale: 0.96 },
        { y: 0, autoAlpha: 1, scale: 1, duration: 0.52 },
        "-=0.32",
      );
    }, heroRef);

    return () => ctx.revert();
  }, [autoPlay]);

  // Floating CTA behaviour
  useEffect(() => {
    const btn   = document.querySelector<HTMLAnchorElement>(".hero-cta");
    const label = document.querySelector<HTMLSpanElement>(".cta-label");
    if (!btn || !label) return;

    let isFloating  = false;
    let savedDocTop = 0;   // absolute document-y of the button
    let savedLeft   = 0;   // viewport-x  (constant — hero doesn't scroll horizontally)
    let savedWidth  = 0;

    // ── Phase 2: fly the already-circular button to the fixed corner ────────
    const flyToCorner = () => {
      const rect = btn.getBoundingClientRect();

      gsap.set(btn, {
        position: "fixed",
        left:  rect.left,
        top:   rect.top,
        margin: 0,
        zIndex: 500,
      });

      gsap.to(btn, {
        left: window.innerWidth  - FLOAT_MARGIN - FLOAT_SIZE,
        top:  window.innerHeight - FLOAT_MARGIN - FLOAT_SIZE,
        duration: 0.45,
        ease: "power3.inOut",
      });
    };

    // ── Phase 1 → 2: collapse text then fly ────────────────────────────────
    const floatOut = () => {
      if (isFloating) return;
      isFloating = true;

      // Snapshot in-flow position BEFORE any transforms
      const rect  = btn.getBoundingClientRect();
      savedDocTop = rect.top + window.scrollY;
      savedLeft   = rect.left;
      savedWidth  = rect.width;

      // Ensure visible (entrance may have been skipped in headless)
      gsap.set(btn, {
        autoAlpha: 1, scale: 1, y: 0,
        overflow: "hidden",
      });

      const tl = gsap.timeline({ onComplete: flyToCorner });

      // Text slides left + fades — button clips it via overflow:hidden
      tl.to(label, {
        x: -(savedWidth - FLOAT_SIZE + 10),
        opacity: 0,
        duration: 0.30,
        ease: "power2.in",
      });

      // Button collapses to circle concurrently
      tl.to(btn, {
        width:        FLOAT_SIZE,
        height:       FLOAT_SIZE,
        minWidth:     0,
        paddingLeft:  0,
        paddingRight: 0,
        borderRadius: `${FLOAT_SIZE / 2}px`,
        duration: 0.34,
        ease: "power2.inOut",
      }, "<");

      // Remove label from flow once invisible (cleans up gap + centering)
      tl.set(label, { display: "none" });
      tl.set(btn, { gap: 0 });
    };

    // ── Return: fly back to hero then restore ───────────────────────────────
    const floatBack = () => {
      if (!isFloating) return;
      isFloating = false;
      gsap.killTweensOf([btn, label]);

      // Put label back in layout (invisible) so gap restores naturally
      gsap.set(label, { display: "", x: -(savedWidth - FLOAT_SIZE + 10), opacity: 0 });
      gsap.set(btn, { gap: "10px" });

      const targetTop = savedDocTop - window.scrollY;

      const tl = gsap.timeline({
        onComplete() {
          // Re-sync top to current scrollY before releasing fixed positioning —
          // avoids the visual jump caused by scrollY changing during the 0.5s tween.
          requestAnimationFrame(() => {
            gsap.set(btn, { top: savedDocTop - window.scrollY });
            gsap.set(btn, {
              clearProps: "position,left,top,width,height,minWidth,paddingLeft,paddingRight,borderRadius,margin,zIndex,overflow,gap",
            });
            gsap.set(label, { clearProps: "all" });
          });
        },
      });

      // Fly from corner to hero position (circular pill)
      tl.to(btn, {
        left:         savedLeft,
        top:          targetTop,
        width:        savedWidth,
        minWidth:     savedWidth,
        paddingLeft:  "32px",
        paddingRight: "32px",
        borderRadius: "999px",
        duration:     0.5,
        ease:         "power3.inOut",
      });

      // Slide label back in near the end
      tl.to(label, {
        x:        0,
        opacity:  1,
        duration: 0.28,
        ease:     "power2.out",
      }, "-=0.18");
    };

    // ── Hover: expand to pill while floating ────────────────────────────────
    const onMouseEnter = () => {
      if (!isFloating) return;
      gsap.killTweensOf([btn, label]);

      gsap.set(label, { display: "", x: -(savedWidth - FLOAT_SIZE + 10), opacity: 0, immediateRender: false });

      gsap.to(btn, {
        left:         window.innerWidth - FLOAT_MARGIN - savedWidth,
        width:        savedWidth,
        minWidth:     savedWidth,
        paddingLeft:  "32px",
        paddingRight: "32px",
        borderRadius: "999px",
        gap:          "10px",
        duration:     0.38,
        ease:         "back.out(1.4)",
      });

      gsap.to(label, {
        x:        0,
        opacity:  1,
        duration: 0.22,
        delay:    0.12,
      });
    };

    const onMouseLeave = () => {
      if (!isFloating) return;
      gsap.killTweensOf([btn, label]);

      gsap.to(btn, {
        left:         window.innerWidth - FLOAT_MARGIN - FLOAT_SIZE,
        width:        FLOAT_SIZE,
        minWidth:     0,
        paddingLeft:  0,
        paddingRight: 0,
        borderRadius: `${FLOAT_SIZE / 2}px`,
        gap:          0,
        duration:     0.28,
        ease:         "power2.inOut",
      });

      gsap.to(label, {
        x:        -(savedWidth - FLOAT_SIZE + 10),
        opacity:  0,
        duration: 0.18,
        onComplete: () => gsap.set(label, { display: "none" }),
      });
    };

    btn.addEventListener("mouseenter", onMouseEnter);
    btn.addEventListener("mouseleave", onMouseLeave);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger:     ".premio-hero",
        start:       "10% top",   // 10% of hero has scrolled past viewport top
        onEnter:     floatOut,
        onLeaveBack: floatBack,
      });
    });

    return () => {
      ctx.revert();
      btn.removeEventListener("mouseenter", onMouseEnter);
      btn.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <main className="premio-page" ref={heroRef}>
      <section className="premio-hero" aria-labelledby="premio-title">

        <nav className="nav-shell" aria-label="Navegación principal">
          <a className="nav-mark" href="#" aria-label="Natura500">
            <img src="/assets/navbar-logo.svg" alt="" />
          </a>
          <div className="nav-links">
            <a href="#">Explorar</a>
            <a href="#">Oportunidades</a>
            <a className="active" href="#">
              <img src="/assets/nav-premio-icon.svg" alt="" />
              Premio
            </a>
            <a href="#">Regístrate</a>
          </div>
        </nav>

        <div className="hero-center">
          <h1 id="premio-title" className="sr-only">Premio Natura500</h1>

          <div className="logo-stage">
            <PremioLogo immediate />
            <CountdownGlass />
          </div>

          <p className="hero-copy" aria-label="Las soluciones registradas en Natura500 antes del 25 de Julio podrán acceder a oportunidades de financiamiento (hasta 100,000 USD) y reconocimiento diseñadas para acelerar innovación regenerativa en América Latina y el Caribe.">
            <span className="copy-line-wrap">
              <span className="copy-line">
                Las soluciones registradas en Natura500 antes del 25 de Julio
              </span>
            </span>
            <span className="copy-line-wrap">
              <span className="copy-line">
                podrán acceder a oportunidades de financiamiento (<strong>hasta 100,000 USD</strong>)
              </span>
            </span>
            <span className="copy-line-wrap">
              <span className="copy-line">
                y reconocimiento diseñadas para acelerar innovación regenerativa en América Latina y el Caribe.
              </span>
            </span>
          </p>

          <a className="hero-cta" href="#">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/registro-icon.svg" alt="" />
            <span className="cta-label">Regístrate ahora</span>
          </a>
        </div>
      </section>
    </main>
  );
}
