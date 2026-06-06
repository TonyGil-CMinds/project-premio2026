"use client";

import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HEADING =
  "QUEREMOS TRANSITAR HACIA NUEVAS ECONOMÍAS DESDE Y PARA LA BIODIVERSIDAD";
const BODY =
  "Natura500 busca demostrar que la regeneración de ecosistemas, la innovación y la prosperidad local pueden crecer juntas, impulsando empresas verdes y azules con potencial de impacto regional.";

// Fraction (0–1) of heading completion when each deco pops in
const DECO_AT = [0.22, 0.52, 0.80] as const;

const DECO_SRCS = [
  "/assets/transicion-ement1.svg",
  "/assets/transition-element2.svg",
  "/assets/transicion-ement3.svg",
];

// Each word is an inline-block so the browser wraps between words naturally.
// Letter chars are .ts-char (hidden by CSS, revealed by GSAP).
// Spaces are plain text nodes between inline-blocks — always layout-visible,
// which keeps the line-break opportunities intact without needing animation.
function Chars({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className="ts-word">
            {word.split("").map((ch, ci) => (
              <span key={ci} className="ts-char">{ch}</span>
            ))}
          </span>
          {wi < words.length - 1 && " "}
        </Fragment>
      ))}
    </>
  );
}

export default function TransitionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef   = useRef<HTMLDivElement>(null);
  const headRef    = useRef<HTMLHeadingElement>(null);
  const bodyRef    = useRef<HTMLParagraphElement>(null);
  const decoRefs   = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage   = stageRef.current;
    const heading = headRef.current;
    const body    = bodyRef.current;
    if (!section || !stage || !heading || !body) return;

    const hChars = Array.from(heading.querySelectorAll<HTMLElement>(".ts-char"));
    const bChars = Array.from(body.querySelectorAll<HTMLElement>(".ts-char"));
    const decos  = decoRefs.current.filter(Boolean) as HTMLImageElement[];

    gsap.set(decos, { scale: 0, autoAlpha: 0 });

    const H_END  = 7;
    const TL_END = 11;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=300%",
          scrub: 1,
        },
      });

      // Background colour: white → light lime driven by scroll
      tl.to(stage, {
        backgroundColor: "#dff7a0",
        duration: TL_END,
        ease: "power1.in",
      }, 0);

      // Heading chars typed by scroll, each a tiny scrub-reversible tween
      hChars.forEach((ch, i) => {
        tl.fromTo(
          ch,
          { opacity: 0 },
          { opacity: 1, duration: 0.02, ease: "none" },
          (i / hChars.length) * H_END,
        );
      });

      // Deco elements: GSAP growth-curve pop-in at heading progress thresholds
      decos.forEach((el, i) => {
        const t = DECO_AT[i] * H_END;
        tl.fromTo(
          el,
          { scale: 0, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.55, ease: "back.out(1.7)" },
          t,
        );
      });

      // Body chars typed after heading completes
      bChars.forEach((ch, i) => {
        tl.fromTo(
          ch,
          { opacity: 0 },
          { opacity: 1, duration: 0.02, ease: "none" },
          H_END + (i / bChars.length) * (TL_END - H_END),
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="ts-section" ref={sectionRef}>
      <div className="ts-stage" ref={stageRef}>
        <div className="ts-content">

          <div className="ts-heading-wrap">
            <h2 className="ts-heading" ref={headRef}>
              <span className="sr-only">{HEADING}</span>
              <span aria-hidden="true">
                <Chars text={HEADING} />
              </span>
            </h2>

            {DECO_SRCS.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                className={`ts-deco ts-deco-${i + 1}`}
                src={src}
                alt=""
                ref={(el) => { decoRefs.current[i] = el; }}
                draggable={false}
              />
            ))}
          </div>

          <p className="ts-body" ref={bodyRef}>
            <span className="sr-only">{BODY}</span>
            <span aria-hidden="true">
              <Chars text={BODY} />
            </span>
          </p>

        </div>
      </div>
    </section>
  );
}
