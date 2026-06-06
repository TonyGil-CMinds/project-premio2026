"use client";

import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const BODY =
  "Está dirigido a emprendimientos y empresas que entienden que la innovación no solo debe generar valor económico, sino también impacto social, ambiental y territorial.";

const CARDS = [
  {
    src: "/assets/aplica-empredimientosverdes.png",
    title: "EMPRENDIMIENTOS VERDES",
    icon: "/assets/aplicar-element2.svg",
    className: "apply-card--green",
  },
  {
    src: "/assets/aplica-emprendimientosazules.png",
    title: "EMPRENDIMIENTOS AZULES",
    icon: "/assets/serpent-element-7.svg",
    className: "apply-card--blue",
  },
  {
    src: "/assets/aplica-iniciativaparalainnovacion.png",
    title: "INICIATIVAS PARA LA INNOVACIÓN",
    icon: "/assets/serpent-element-9.svg",
    className: "apply-card--innovation",
  },
  {
    src: "/assets/aplica-iniciativaparalabiodiversidad.png",
    title: "INICIATIVAS PARA LA BIODIVERSIDAD",
    icon: "/assets/aplicar-element3.svg",
    className: "apply-card--biodiversity",
  },
] as const;

function Chars({ text }: { text: string }) {
  const words = text.split(" ");

  return (
    <>
      {words.map((word, wordIndex) => (
        <Fragment key={`${word}-${wordIndex}`}>
          <span className="apply-word">
            {word.split("").map((char, charIndex) => (
              <span className="apply-char" key={`${char}-${charIndex}`}>
                {char}
              </span>
            ))}
          </span>
          {wordIndex < words.length - 1 && " "}
        </Fragment>
      ))}
    </>
  );
}

export default function ApplySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const iconPairRef = useRef<HTMLSpanElement>(null);
  const iconRefs = useRef<(HTMLImageElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const heading = headingRef.current;
    const body = bodyRef.current;
    const iconPair = iconPairRef.current;
    if (!section || !stage || !heading || !body || !iconPair) return;

    const headingChars = Array.from(heading.querySelectorAll<HTMLElement>(".apply-char"));
    const bodyChars = Array.from(body.querySelectorAll<HTMLElement>(".apply-char"));
    const icons = iconRefs.current.filter(Boolean) as HTMLImageElement[];
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

    gsap.set([...headingChars, ...bodyChars], { opacity: 0 });
    gsap.set(iconPair, { width: 0, marginLeft: "0.18em", marginRight: 0 });
    gsap.set(icons, { autoAlpha: 0, scale: 0, rotate: -8 });
    gsap.set(cards, { autoAlpha: 0, scale: 0.46, y: 90, rotate: 0 });

    const ctx = gsap.context(() => {
      const hoverCleanups = cards.map((card) => {
        const onEnter = () => {
          gsap.to(card, {
            y: "-=14",
            rotate: "+=2.4",
            scale: 1.035,
            duration: 0.48,
            ease: "elastic.out(1, 0.45)",
          });
        };
        const onLeave = () => {
          gsap.to(card, {
            y: 0,
            rotate: Number(card.dataset.rotate || 0),
            scale: 1,
            duration: 0.55,
            ease: "elastic.out(1, 0.5)",
          });
        };

        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);
        return () => {
          card.removeEventListener("mouseenter", onEnter);
          card.removeEventListener("mouseleave", onLeave);
        };
      });

      const headingEnd = 3.4;
      const bodyEnd = 6.8;
      const iconAt = 6.9;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=360%",
          scrub: 1.1,
        },
      });

      tl.to(stage, { backgroundColor: "#9ddd2e", duration: 1.1, ease: "power1.inOut" }, 0);
      tl.to(stage, { backgroundColor: "#f3fbdc", duration: 2.2, ease: "power1.inOut" }, 7.2);

      headingChars.forEach((char, index) => {
        tl.fromTo(
          char,
          { opacity: 0 },
          { opacity: 1, duration: 0.02, ease: "none" },
          (index / headingChars.length) * headingEnd,
        );
      });

      bodyChars.forEach((char, index) => {
        tl.fromTo(
          char,
          { opacity: 0 },
          { opacity: 1, duration: 0.02, ease: "none" },
          headingEnd + (index / bodyChars.length) * (bodyEnd - headingEnd),
        );
      });

      tl.to(iconPair, {
        width: "var(--apply-icon-pair-width)",
        marginLeft: "var(--apply-icon-pair-margin)",
        marginRight: "var(--apply-icon-pair-margin)",
        duration: 0.58,
        ease: "power3.out",
      }, iconAt);

      tl.to(icons, {
        autoAlpha: 1,
        scale: 1,
        rotate: 0,
        duration: 0.56,
        stagger: 0.12,
        ease: "back.out(1.85)",
      }, iconAt + 0.08);

      cards.forEach((card, index) => {
        const rotate = Number(card.dataset.rotate || 0);
        tl.to(card, {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          rotate,
          duration: 0.78,
          ease: "elastic.out(1, 0.62)",
        }, iconAt + 0.85 + index * 0.32);
      });

      return () => hoverCleanups.forEach((cleanup) => cleanup());
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="apply-section" ref={sectionRef}>
      <div className="apply-stage" ref={stageRef}>
        <div className="apply-copy">
          <h2 className="apply-heading" ref={headingRef}>
            <span className="sr-only">¿QUIÉN PUEDE APLICAR?</span>
            <span className="apply-heading-line" aria-hidden="true">
              <Chars text="¿QUIÉN" />
              <span className="apply-icon-pair" ref={iconPairRef}>
                <img
                  ref={(el) => { iconRefs.current[0] = el; }}
                  src="/assets/aplicar-element1.svg"
                  alt=""
                  draggable={false}
                />
                <img
                  ref={(el) => { iconRefs.current[1] = el; }}
                  src="/assets/aplicar-element2.svg"
                  alt=""
                  draggable={false}
                />
              </span>
              {" "}
              <Chars text="PUEDE" />
            </span>
            <span className="apply-heading-line" aria-hidden="true">
              <Chars text="APLICAR?" />
            </span>
          </h2>

          <p className="apply-body" ref={bodyRef}>
            <span className="sr-only">{BODY}</span>
            <span aria-hidden="true">
              <Chars text={BODY} />
            </span>
          </p>
        </div>

        <div className="apply-card-layer" aria-hidden="true">
          {CARDS.map((card, index) => (
            <div
              key={card.src}
              ref={(el) => { cardRefs.current[index] = el; }}
              className={`apply-card ${card.className}`}
              data-rotate={["3", "-4", "8", "-7"][index]}
            >
              <img className="apply-card-photo" src={card.src} alt="" draggable={false} />
              <span className="apply-card-title">{card.title}</span>
              <span className="apply-card-icon">
                <img src={card.icon} alt="" draggable={false} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
