"use client";
import { memo, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FAQS = [
  {
    q: "¿QUÉ ES NATURA500?",
    a: "Natura 500 es la infraestructura de NaturaTech LAC para expandir los mercados verdes y azules regenerativos en Latinoamérica y el Caribe. Conecta a emprendimientos con capital, asociaciones de valor y redes que aceleran su crecimiento e impacto. Su misión es contribuir a que existan más de 500 empresas verdes y azules en LAC con alto impacto y crecimiento económico.",
  },
  {
    q: "¿QUIÉN PUEDE APLICAR AL PREMIO?",
    a: "Empresas regenerativas y sistemas asociativos de valor — desde startups de bioinnovación hasta cooperativas indígenas — que estén innovando en economía verde o azul, con base u operación principal en América Latina y el Caribe.",
  },
  {
    q: "¿CUÁLES SON LOS NIVELES DEL PREMIO?",
    a: "Semilla Natura 500 (USD 5,000) para soluciones en etapa temprana con prototipo o piloto. Creciente Natura 500 (USD 25,000) para soluciones con primeras ventas o tracción de ingresos. Líder Natura 500 (USD 100,000) para soluciones con modelo demostrado y potencial de impacto regional en LAC.",
  },
  {
    q: "¿CUÁNDO CIERRA LA CONVOCATORIA 2026?",
    a: "La ventana cierra el 25 de julio de 2026. Después de esa fecha sigues pudiendo unirte a la Red Natura 500, pero no serás considerado para el Premio ni la Lista en esta edición.",
  },
  {
    q: "¿QUÉ CRITERIOS SE EVALÚAN?",
    a: "Cuatro criterios iniciales: (1) que la naturaleza sea el activo central del modelo de negocio; (2) que generes impacto positivo neto en ecosistemas y biodiversidad — demostrable con evidencia propia, métricas o narrativa técnica sólida, no se requiere certificación externa al registrarte; (3) que operes en LAC; (4) que tengas una solución real y un equipo activo: prototipo, piloto, modelo en operación o cadena de valor articulada.",
  },
  {
    q: "¿CUÁNDO Y DÓNDE SE ANUNCIAN LOS GANADORES?",
    a: "En el GET Forum del Grupo BID en octubre de 2026 (5 – 8 de octubre), ante inversionistas, gobiernos y actores del ecosistema de innovación de LAC y el mundo. La notificación a las soluciones seleccionadas ocurre el 1 de septiembre de 2026.",
  },
  {
    q: "ADEMÁS DEL PREMIO, ¿QUÉ OBTENGO AL SER PARTE DE LA RED?",
    a: "Acceso permanente a la Infraestructura Digital (Radar, inteligencia de mercado co-construida, herramientas de IA, conexiones con capital), al Soporte Catalítico — incluyendo la posibilidad de aparecer en la Lista Natura 500 de los 50 emprendimientos más prometedores — y a Natura 500 x ECOS (masterclasses en mercados globales, capital, bioeconomía de frontera, IA aplicada y más).",
  },
];

interface ItemProps {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem = memo(function FAQItem({ q, a, isOpen, onToggle }: ItemProps) {
  const rowRef      = useRef<HTMLDivElement>(null);
  const boxRef      = useRef<HTMLDivElement>(null);
  const answerRef   = useRef<HTMLDivElement>(null);
  const btnRef      = useRef<HTMLButtonElement>(null);
  const hoveredRef  = useRef(false);
  const readyRef    = useRef(false);

  useEffect(() => {
    requestAnimationFrame(() => { readyRef.current = true; });
  }, []);

  const targetW = () => {
    const row = rowRef.current;
    if (!row) return 0;
    const style = getComputedStyle(row);
    return row.offsetWidth - parseFloat(style.paddingRight);
  };

  // Animate box back to its CSS-natural width (whatever display:inline-block gives)
  const collapseW = (box: HTMLElement) => {
    const currentW = box.offsetWidth;
    box.style.removeProperty("width");
    const naturalW = box.offsetWidth;
    box.style.width = currentW + "px";
    gsap.killTweensOf(box, "width");
    gsap.to(box, {
      width: naturalW, duration: 0.3, ease: "power2.inOut",
      onComplete: () => box.style.removeProperty("width"),
    });
  };

  useEffect(() => {
    if (!readyRef.current) return;
    const box    = boxRef.current;
    const answer = answerRef.current;
    if (!box || !answer) return;

    if (isOpen) {
      gsap.killTweensOf(box, "width");
      gsap.to(box, { width: targetW(), duration: 0.4, ease: "power2.out" });
      gsap.set(answer, { clearProps: "maxWidth" });
      gsap.fromTo(answer,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.4, ease: "power2.out" },
      );
    } else {
      gsap.to(answer, {
        height: 0, opacity: 0, duration: 0.28, ease: "power2.in",
        onComplete() {
          gsap.set(answer, { maxWidth: 0 });
          if (!hoveredRef.current) collapseW(box);
        },
      });
    }
  }, [isOpen]);

  const onEnter = () => {
    hoveredRef.current = true;
    if (isOpen || !readyRef.current) return;
    const box = boxRef.current;
    if (!box) return;
    gsap.killTweensOf(box, "width");
    gsap.to(box, { width: targetW(), duration: 0.35, ease: "power2.out" });
  };

  const onLeave = () => {
    hoveredRef.current = false;
    if (isOpen || !readyRef.current) return;
    const box = boxRef.current;
    if (!box) return;
    collapseW(box);
  };

  return (
    <div ref={rowRef} className="faq-row" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div
        ref={boxRef}
        className={`faq-box${isOpen ? " faq-box--open" : ""}`}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === "Enter" && onToggle()}
        aria-expanded={isOpen}
      >
        <p className="faq-q">{q}</p>
        <div ref={answerRef} className="faq-ans" style={{ height: 0, overflow: "hidden", opacity: 0, maxWidth: 0 }}>
          <p className="faq-ans-p">{a}</p>
        </div>
      </div>
      <button
        ref={btnRef}
        className={`faq-btn${isOpen ? " faq-btn--open" : ""}`}
        onClick={onToggle}
        aria-label={isOpen ? "Cerrar pregunta" : "Abrir pregunta"}
      >
        <span className="faq-btn-icon">{isOpen ? "−" : "+"}</span>
      </button>
    </div>
  );
});

// Split a string into word spans for the slide-up entrance animation
function WordSplit({ text, className }: { text: string; className: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="faq-sw-wrap">
          <span className={className}>{w}</span>
        </span>
      ))}
    </>
  );
}

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let removeWinnerScroll: (() => void) | undefined;

    const ctx = gsap.context(() => {
      const winnerSurfaces = Array.from(
        document.querySelectorAll<HTMLElement>(".winner-section, .winner-showcase"),
      );
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const syncWinnerColor = (color: string) => {
        gsap.to(winnerSurfaces, {
          backgroundColor: color,
          duration: prefersReducedMotion ? 0 : 0.45,
          ease: "power1.out",
          overwrite: "auto",
        });
      };

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 105%",
        onEnter: () => syncWinnerColor("#a4d73a"),
        onEnterBack: () => syncWinnerColor("#a4d73a"),
        onLeaveBack: () => syncWinnerColor("#f3fbdc"),
      });

      let faqColorActive = false;
      const updateWinnerColor = () => {
        const section = sectionRef.current;
        if (!section) return;
        const shouldBeActive = section.getBoundingClientRect().top <= window.innerHeight * 1.05;
        if (shouldBeActive === faqColorActive) return;
        faqColorActive = shouldBeActive;
        syncWinnerColor(shouldBeActive ? "#a4d73a" : "#f3fbdc");
      };

      window.addEventListener("scroll", updateWinnerColor, { passive: true });
      requestAnimationFrame(updateWinnerColor);
      removeWinnerScroll = () => window.removeEventListener("scroll", updateWinnerColor);

      // ── Rows: one-time entrance ──────────────────────────────────────────
      gsap.set(".faq-row", { y: 20, autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 78%",
        once: true,
        onEnter() {
          gsap.to(".faq-row", { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.07, ease: "power2.out" });
        },
      });

      // ── Header: enters on section entry, reverses on section exit ────────
      const headerTl = gsap.timeline({ paused: true });
      headerTl
        .from(".faq-eyebrow", { y: 18, autoAlpha: 0, duration: 0.5,  ease: "power2.out" })
        .from(".faq-tw",  { yPercent: 110, duration: 0.75, ease: "power3.out" }, "-=0.25")
        .from(".faq-sw",  { yPercent: 110, duration: 0.55, stagger: 0.022, ease: "power2.out" }, "-=0.4");

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        end:   "bottom top",
        toggleActions: "play reverse play reverse",
        animation: headerTl,
      });
    }, sectionRef);
    return () => {
      removeWinnerScroll?.();
      ctx.revert();
    };
  }, []);

  const toggle = (i: number) => setOpen(prev => (prev === i ? null : i));

  return (
    <section ref={sectionRef} className="faq-section">
      <div className="faq-inner">
        <div className="faq-header">
          <span className="faq-eyebrow">PREGUNTAS FRECUENTES</span>
          <h2 className="faq-title" aria-label="FAQ">
            <span className="faq-tw-wrap"><span className="faq-tw">FAQ</span></span>
          </h2>
          <p className="faq-sub" aria-label="Lo que necesitas saber sobre el Premio NaturaTech LAC: convocatoria, criterios y la red que se construye alrededor.">
            <WordSplit text="Lo que necesitas saber sobre el Premio NaturaTech LAC: convocatoria, criterios y la red que se construye alrededor." className="faq-sw" />
          </p>
        </div>

        <div className="faq-list">
          {FAQS.map((item, i) => (
            <FAQItem
              key={i}
              q={item.q}
              a={item.a}
              isOpen={open === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
