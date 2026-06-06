"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WINNERS = [
  {
    logo: "/assets/ganador-awake-logo.png",
    image: "/assets/ganador-awake-imagen.png",
    text: "Conecta a viajeros con anfitriones en Colombia, protegiendo 80,000 hectáreas de ecosistemas clave mediante turismo de naturaleza y tecnología para regenerar biodiversidad.",
  },
  {
    logo: "/assets/ganador-savimbo-logo.png",
    image: "/assets/ganador-savimbo-imagen.png",
    text: "La propuesta adapta una metodología de créditos de biodiversidad, liderada por comunidades indígenas, a un sistema agroforestal de restauración, generando datos precisos para medir y verificar beneficios en biodiversidad, carbono y agua.",
  },
  {
    logo: "/assets/ganador-regen-logo.png",
    image: "/assets/ganador-regen-imagen.png",
    text: "Combina saberes ancestrales y tecnología con comunidades Asháninkas en la Amazonía peruana para restaurar el ecosistema y crear productos regenerativos.",
  },
  {
    logo: "/assets/ganador-seaflower-logo.png",
    image: "/assets/ganador-seaflower-imagen.png",
    text: "Esta solución impulsa la biodiversidad marina mediante créditos de conservación regenerativa, uniendo economía azul, biotecnología y participación comunitaria.",
  },
] as const;

export default function WinnerSection() {
  const sectionRef    = useRef<HTMLElement>(null);
  const stageRef      = useRef<HTMLDivElement>(null);
  const trackRef      = useRef<HTMLDivElement>(null);
  const introRef      = useRef<HTMLDivElement>(null);
  const winnersRef    = useRef<HTMLDivElement>(null);
  const progressRef   = useRef<HTMLSpanElement>(null);
  const itemRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const statText1Ref  = useRef<HTMLSpanElement>(null);
  const statText2Ref  = useRef<HTMLSpanElement>(null);
  const introLineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section  = sectionRef.current;
    const stage    = stageRef.current;
    const track    = trackRef.current;
    const intro    = introRef.current;
    const winners  = winnersRef.current;
    const progress = progressRef.current;
    if (!section || !stage || !track || !intro || !winners || !progress) return;

    const counters    = Array.from(stage.querySelectorAll<HTMLElement>(".winner-count"));
    const winnerItems = itemRefs.current.filter(Boolean) as HTMLDivElement[];
    const tiles       = Array.from(track.children) as HTMLElement[];
    const introLines  = introLineRefs.current.filter(Boolean) as HTMLDivElement[];
    const introInners = introLines
      .map(l => l.querySelector<HTMLElement>(".winner-intro-inner"))
      .filter(Boolean) as HTMLElement[];

    const vw     = window.innerWidth;
    const trackW = track.scrollWidth;
    const e6W    = tiles[0]?.offsetWidth ?? 400;

    // Train starts fully off-screen LEFT (xPercent=-100) and moves RIGHT with scroll.
    // e1 (tiles[5], rightmost) exits right viewport first → counters.
    // e6 (tiles[0], leftmost) is last: title appears as its right edge touches vw,
    // disappears when its left edge passes vw.
    const START_XPCT = -100;
    const END_XPCT   = Math.ceil((vw + e6W) / trackW * 100) + 5;

    const TRACK_T   = 0.5;
    const TRACK_DUR = 10.0;
    const xPctToT   = (x: number) =>
      TRACK_T + ((x - START_XPCT) / (END_XPCT - START_XPCT)) * TRACK_DUR;

    // e1 right edge = trackW; reaches vw when trackOffset = vw - trackW
    const xPctCounters = (vw - trackW) / trackW * 100;
    // e6 right edge = e6W; reaches vw when trackOffset = vw - e6W
    const xPctTitleIn  = (vw - e6W) / trackW * 100;
    // e6 left edge = 0; reaches vw when trackOffset = vw
    const xPctTitleOut = vw / trackW * 100;

    const tCounters = xPctToT(xPctCounters);
    const tTitleIn  = xPctToT(xPctTitleIn);
    const tTitleOut = xPctToT(xPctTitleOut);

    const setNum = (el: HTMLElement, v: number) => {
      el.textContent = String(Math.round(v));
    };

    // ── Initial states ────────────────────────────────────────────────────
    gsap.set(track,    { xPercent: START_XPCT });
    gsap.set(counters, { autoAlpha: 0 });
    gsap.set([statText1Ref.current, statText2Ref.current], { autoAlpha: 0, y: 10 });
    gsap.set(intro,    { autoAlpha: 0 });
    gsap.set(introInners, { yPercent: 110 }); // start below overflow:hidden wrapper
    gsap.set(winners,  { autoAlpha: 0, y: 80 });
    gsap.set(winnerItems, { autoAlpha: 0, y: 24 });
    if (winnerItems[0]) gsap.set(winnerItems[0], { autoAlpha: 1, y: 0 });
    gsap.set(progress, { scaleY: 0, transformOrigin: "50% 0%" });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end:   "+=840%",
          scrub: 1.15,
        },
      });

      // ── Track moves right (L→R) continuously with scroll ─────────────────
      tl.fromTo(track,
        { xPercent: START_XPCT },
        { xPercent: END_XPCT, duration: TRACK_DUR, ease: "none" },
        TRACK_T,
      );

      // ── Counters: when e1 exits right ─────────────────────────────────────
      const cv1 = { value: 0 };
      tl.to(counters[0], { autoAlpha: 1, duration: 0.01 }, tCounters);
      tl.fromTo(cv1, { value: 0 }, {
        value: 20, duration: 0.7, ease: "power2.out",
        onUpdate() { if (counters[0]) setNum(counters[0], cv1.value); },
      }, tCounters);
      tl.to(statText1Ref.current, { autoAlpha: 1, y: 0, duration: 0.35 }, tCounters + 0.6);

      const cv2 = { value: 0 };
      tl.to(counters[1], { autoAlpha: 1, duration: 0.01 }, tCounters + 0.55);
      tl.fromTo(cv2, { value: 0 }, {
        value: 10, duration: 0.7, ease: "power2.out",
        onUpdate() { if (counters[1]) setNum(counters[1], cv2.value); },
      }, tCounters + 0.55);
      tl.to(statText2Ref.current, { autoAlpha: 1, y: 0, duration: 0.35 }, tCounters + 1.15);

      // ── Title entrance: reveal wrapper instantly, each line slides up ────────
      tl.to(intro, { autoAlpha: 1, duration: 0.01 }, tTitleIn);
      introInners.forEach((inner, i) => {
        tl.to(inner, { yPercent: 0, duration: 0.45, ease: "power3.out" },
          tTitleIn + i * 0.1);
      });

      // ── Title exit: each line slides up (bottom line first) ───────────────
      const titleHold = 0.9; // extra time title stays before exiting
      [...introInners].reverse().forEach((inner, i) => {
        tl.to(inner, { yPercent: -115, duration: 0.32, ease: "power2.in" },
          tTitleOut + titleHold + i * 0.09);
      });
      tl.to(intro, { autoAlpha: 0, duration: 0.1 },
        tTitleOut + titleHold + introInners.length * 0.09 + 0.25);

      // ── Winners ────────────────────────────────────────────────────────────
      const tW     = tTitleOut + titleHold + 0.55;
      const wStart = tW + 0.95;
      const step   = 1.6;

      tl.to(winners, { autoAlpha: 1, y: 0, duration: 0.85, ease: "power3.out" }, tW);

      winnerItems.forEach((item, i) => {
        if (i === 0) return;
        tl.to(winnerItems[i - 1],
          { autoAlpha: 0, y: -18, duration: 0.4, ease: "power2.in" },
          wStart + i * step - 0.22);
        tl.fromTo(item,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
          wStart + i * step);
      });

      // Hold the last winner visible — give it the same settling time as others (1 step) + extra hold
      tl.to({}, { duration: 2.2 }, wStart + WINNERS.length * step);

      tl.to(progress, {
        scaleY: 1,
        duration: step * (WINNERS.length - 1) + 0.8,
        ease: "none",
      }, wStart);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="winner-section" ref={sectionRef}>
      <div className="winner-stage" ref={stageRef}>

        {/* Train: e6 (leftmost, last to exit) → e1 (rightmost, first to exit) */}
        <div className="winner-track" ref={trackRef} aria-hidden="true">
          <div className="winner-tile">
            <img src="/assets/ganador-element6.svg" alt="" draggable={false} />
          </div>
          <div className="winner-tile">
            <img src="/assets/ganador-element5.svg" alt="" draggable={false} />
          </div>
          <div className="winner-tile winner-stat">
            <img src="/assets/ganador-element4.svg" alt="" draggable={false} />
            <div className="winner-stat-content">
              <span className="winner-count">0</span>
              <span ref={statText1Ref}>Aplicaciones</span>
            </div>
          </div>
          <div className="winner-tile winner-stat">
            <img src="/assets/ganador-element3.svg" alt="" draggable={false} />
            <div className="winner-stat-content">
              <span className="winner-count">0</span>
              <span ref={statText2Ref}>Países de<br />América Latina</span>
            </div>
          </div>
          <div className="winner-tile">
            <img src="/assets/ganador-element2.svg" alt="" draggable={false} />
          </div>
          <div className="winner-tile winner-tile--arc">
            <img src="/assets/ganador-element1.svg" alt="" draggable={false} />
          </div>
        </div>

        {/* Title — z-index 1, behind track (z-index 2) */}
        <div className="winner-intro" ref={introRef}>
          <div className="winner-intro-line" ref={el => { introLineRefs.current[0] = el; }}>
            <div className="winner-intro-inner">
              <img className="winner-intro-mark" src="/assets/ganador-logo-titulo.png" alt="" draggable={false} />
            </div>
          </div>
          <div className="winner-intro-line" ref={el => { introLineRefs.current[1] = el; }}>
            <div className="winner-intro-inner">
              <p>Un premio que activa</p>
            </div>
          </div>
          <div className="winner-intro-line" ref={el => { introLineRefs.current[2] = el; }}>
            <div className="winner-intro-inner">
              <h2>GANADORES</h2>
            </div>
          </div>
          <div className="winner-intro-line" ref={el => { introLineRefs.current[3] = el; }}>
            <div className="winner-intro-inner">
              <h2>2024</h2>
            </div>
          </div>
        </div>

        {/* Winners showcase — z-index 5 */}
        <div className="winner-showcase" ref={winnersRef}>
          <div className="winner-scroll-indicator" aria-hidden="true">
            <span ref={progressRef} />
          </div>
          <h2 className="winner-mobile-title">Ganadores 2024</h2>
          <div className="winner-items">
            {WINNERS.map((w, i) => (
              <div
                className="winner-item"
                key={w.logo}
                ref={el => { itemRefs.current[i] = el; }}
              >
                <div className="winner-logo-wrap">
                  <img className="winner-logo" src={w.logo} alt="" draggable={false} />
                </div>
                <img className="winner-photo" src={w.image} alt="" draggable={false} />
                <p className="winner-copy">{w.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
