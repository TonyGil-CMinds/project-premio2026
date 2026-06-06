"use client";

import { memo, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SNAKE_ELEMENTS = Array.from({ length: 9 }, (_, index) => ({
  src: `/assets/serpent-element-${index + 1}.svg`,
  className: `snake-piece snake-piece--${index + 1}`,
}));

const LEVELS = [
  {
    level: "Nivel 1",
    icon: `/assets/snakeSectionElements/snake-element-level1.svg`,
    amount: "5,000 USD",
    name: "Semilla Natura500",
    description: "Para soluciones en etapa temprana con prototipo funcional, piloto activo o solución en desarrollo.",
    tone: "blue",
  },
  {
    level: "Nivel 2",
    icon: `/assets/snakeSectionElements/snake-element-level2.svg`,
    amount: "25,000 USD",
    name: "Creciente Natura500",
    description: "Para soluciones que muestran primeras ventas o tracción de ingresos. El modelo funciona y está siendo probado en el mercado.",
    tone: "gold",
  },
  {
    level: "Nivel 3",
    icon: `/assets/snakeSectionElements/snake-element-level3.svg`,
    amount: "100,000 USD",
    name: "Líder Natura500",
    description: "Para soluciones con modelo demostrado, ancladas en ecosistemas y cadenas de valor reales, y potencial de impacto regional en LAC.",
    tone: "green",
  },
] as const;

function SnakeSectionInner() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const ctx = gsap.context(() => {
      const pieces = gsap.utils.toArray<HTMLElement>(".snake-piece");
      const cards = gsap.utils.toArray<HTMLElement>(".snake-level-card");
      const expanded = gsap.utils.toArray<HTMLElement>(".snake-level-expanded");
      const ctas = gsap.utils.toArray<HTMLElement>(".snake-level-cta");
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isMobile = window.matchMedia("(max-width: 720px)").matches;
      const tile = pieces[0]?.getBoundingClientRect().width ?? 240;

      gsap.set(pieces, { autoAlpha: 0, x: 0, y: tile * 4, scale: 1 });
      gsap.set(".snake-track", { clearProps: "transform" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=520%",
          scrub: prefersReducedMotion ? 0.2 : 1.08,
        },
      });

      // ── Snake path (shared) ────────────────────────────────────────────────
      const path = [
        { x: 0, y: 3.22 },
        { x: 0, y: 2.22 },
        { x: 0, y: 1.22 },
        { x: 0, y: 0.22 },
        { x: 1, y: 0.22 },
        { x: 2, y: 0.22 },
        { x: 3, y: 0.22 },
        { x: 4, y: 0.22 },
        { x: 5, y: 0.22 },
        { x: 6, y: 0.22 },
        { x: 7, y: 0.22 },
      ];

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const samplePath = (position: number) => {
        if (position < -0.92) return { x: 0, y: 4.22, visible: false };
        if (position < 0) {
          const t = position + 1;
          return { x: 0, y: lerp(4.22, path[0].y, t), visible: true };
        }
        if (position >= path.length - 1) {
          const last = path[path.length - 1];
          return {
            x: last.x + Math.min(1.4, position - (path.length - 1)),
            y: last.y,
            visible: position < path.length + 0.2,
          };
        }
        const from = path[Math.floor(position)];
        const to = path[Math.ceil(position)];
        const t = position % 1;
        return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t), visible: true };
      };

      const snakeState = { progress: 0 };
      const renderSnake = () => {
        pieces.forEach((piece, index) => {
          const point = samplePath(snakeState.progress - index);
          gsap.set(piece, { x: point.x * tile, y: point.y * tile, autoAlpha: point.visible ? 1 : 0 });
        });
      };

      renderSnake();
      tl.to(snakeState, {
        progress: path.length + pieces.length * 0.35,
        duration: 4.4,
        ease: "none",
        onUpdate: renderSnake,
      }, 0);

      // ── Cards ──────────────────────────────────────────────────────────────
      if (isMobile) {
        // Mobile: accordion — height-only, cards stack tight, push cards below on open
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const cardW = Math.min(296, vw - 18);
        const compactH = 96;
        const openH = 244;
        const gap = 10;
        const delta = openH - compactH; // how much to push cards below

        // Place stack starting at ~18% of viewport height
        const stackTop = Math.round(vh * 0.18);
        const baseY = [
          stackTop,
          stackTop + compactH + gap,
          stackTop + 2 * (compactH + gap),
        ];

        // Initial state: all compact, stacked, z-index layered
        cards.forEach((card, i) => {
          gsap.set(card, {
            top: 0, left: `calc(50% - ${Math.round(cardW / 2)}px)`,
            right: "auto", bottom: "auto",
            width: cardW, height: compactH,
            y: baseY[i], x: 0,
            autoAlpha: 1, pointerEvents: "auto",
            zIndex: 10 + i,
          });
        });
        gsap.set(expanded, { height: 0, autoAlpha: 0 });
        gsap.set(ctas, { autoAlpha: 0, y: 12 });

        const openM = (idx: number, at: number) => {
          tl.set(cards[idx], { zIndex: 20 }, at);
          tl.to(cards[idx], { height: openH, duration: 0.52, ease: "power2.out" }, at);
          tl.to(expanded[idx], { height: "auto", autoAlpha: 1, duration: 0.4, ease: "power2.out" }, at + 0.14);
          tl.to(ctas[idx], { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, at + 0.3);
          // push cards below down
          for (let j = idx + 1; j < cards.length; j++) {
            tl.to(cards[j], { y: baseY[j] + delta, duration: 0.52, ease: "power2.out" }, at);
          }
        };

        const closeM = (idx: number, at: number) => {
          tl.to(ctas[idx], { autoAlpha: 0, y: 10, duration: 0.18, ease: "power2.in" }, at);
          tl.to(expanded[idx], { height: 0, autoAlpha: 0, duration: 0.26, ease: "power2.in" }, at);
          tl.to(cards[idx], { height: compactH, duration: 0.44, ease: "power2.inOut" }, at + 0.06);
          tl.set(cards[idx], { zIndex: 10 + idx }, at + 0.52);
          // pull cards below back up
          for (let j = idx + 1; j < cards.length; j++) {
            tl.to(cards[j], { y: baseY[j], duration: 0.44, ease: "power2.inOut" }, at + 0.06);
          }
        };

        openM(0, 0.36);
        closeM(0, 1.22);
        openM(1, 1.42);
        closeM(1, 2.1);
        openM(2, 2.34);
        closeM(2, 3.04);

        // Final scatter
        tl.to(cards[0], { x: -10, y: baseY[0] - 14, duration: 0.45, ease: "power2.inOut" }, 3.08);
        tl.to(cards[1], { x: 20,  y: baseY[1] - 10, duration: 0.45, ease: "power2.inOut" }, 3.08);
        tl.to(cards[2], { x: -28, y: baseY[2] + 6,  duration: 0.45, ease: "power2.inOut" }, 3.08);

      } else {
        // Desktop: original width+height animation with staggered entry positions
        const compact = { width: "min(440px, 27vw)", height: "min(138px, 10vw)" };
        const open    = { width: "min(480px, 28vw)", height: "min(324px, 36vh)" };

        gsap.set(cards, { ...compact, autoAlpha: 1, pointerEvents: "auto" });
        gsap.set(expanded, { height: 0, autoAlpha: 0 });
        gsap.set(ctas, { autoAlpha: 0, y: 12 });
        gsap.set(cards[0], { x: 0,   y: 0   });
        gsap.set(cards[1], { x: 96,  y: 170 });
        gsap.set(cards[2], { x: -86, y: 210 });

        const openCard = (index: number, at: number) => {
          const card = cards[index];
          if (!card) return;
          gsap.set(card, { zIndex: 20 + index });
          tl.set(card, { pointerEvents: "auto" }, at);
          tl.to(card, { ...open, duration: 0.56, ease: "power2.out" }, at);
          tl.to(expanded[index], { height: "auto", autoAlpha: 1, duration: 0.42, ease: "power2.out" }, at + 0.16);
          tl.to(ctas[index], { autoAlpha: 1, y: 0, duration: 0.32, ease: "power2.out" }, at + 0.34);
        };

        const closeCard = (index: number, at: number) => {
          const card = cards[index];
          if (!card) return;
          tl.to(ctas[index], { autoAlpha: 0, y: 10, duration: 0.2, ease: "power2.in" }, at);
          tl.to(expanded[index], { height: 0, autoAlpha: 0, duration: 0.28, ease: "power2.in" }, at);
          tl.to(card, { ...compact, duration: 0.48, ease: "power2.inOut" }, at + 0.08);
        };

        openCard(0, 0.36);

        tl.to(cards[1], { x: 0, y: 0, duration: 0.58, ease: "power2.inOut" }, 1.04);
        closeCard(0, 1.22);
        openCard(1, 1.42);

        tl.to(cards[2], { x: 0, y: 0, duration: 0.58, ease: "power2.inOut" }, 1.92);
        closeCard(1, 2.1);
        openCard(2, 2.34);

        closeCard(2, 3.04);
        tl.to(cards[0], { x: -10, y: -14, duration: 0.45, ease: "power2.inOut" }, 3.08);
        tl.to(cards[1], { x: 20,  y: -10, duration: 0.45, ease: "power2.inOut" }, 3.08);
        tl.to(cards[2], { x: -28, y: 6,   duration: 0.45, ease: "power2.inOut" }, 3.08);
      }
    }, stage);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="snake-section" aria-label="Niveles del Premio Natura500">
      <div ref={stageRef} className="snake-stage">
        <div className="snake-track" aria-hidden="true">
          {SNAKE_ELEMENTS.map((element) => (
            <img
              key={element.src}
              className={element.className}
              src={element.src}
              alt=""
              draggable={false}
            />
          ))}
        </div>

        <div className="snake-levels">
          {LEVELS.map((level, index) => (
            <article
              key={level.level}
              className={`snake-level-card snake-level-card--${index + 1} snake-level-card--${level.tone}`}
            >
              <div className="snake-level-content">
                <div className="snake-level-meta">
                  <img src={level.icon} alt="" draggable={false} />
                  <span>{level.level}</span>
                </div>
                <strong>{level.amount}</strong>
                <div className="snake-level-expanded">
                  <h2>{level.name}</h2>
                  <p>{level.description}</p>
                  <button className="snake-level-cta" type="button">
                    <img src="/assets/registro-icon.svg" alt="" draggable={false} />
                    Regístrate ahora
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(SnakeSectionInner);
