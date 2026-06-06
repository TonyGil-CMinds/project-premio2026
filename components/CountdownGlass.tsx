"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import gsap from "gsap";

type CountdownTime = { days: number; hours: number; minutes: number };

const TARGET = new Date("2026-07-25T06:00:00-06:00").getTime();

function getCountdown(): CountdownTime {
  const rem  = Math.max(TARGET - Date.now(), 0);
  const mins = Math.floor(rem / 60000);
  return {
    days:    Math.floor(mins / 1440),
    hours:   Math.floor((mins % 1440) / 60),
    minutes: mins % 60,
  };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function CountdownGlass() {
  const [time, setTime] = useState<CountdownTime>(() => getCountdown());
  const wrapRef  = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setTime(getCountdown()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Parallax on pointer
  const movers = useMemo<{ x: (v: number) => void; y: (v: number) => void }>(
    () => ({ x: () => undefined, y: () => undefined }),
    [],
  );

  useEffect(() => {
    if (!shellRef.current) return;
    movers.x = gsap.quickTo(shellRef.current, "x", { duration: 0.42, ease: "power3.out" });
    movers.y = gsap.quickTo(shellRef.current, "y", { duration: 0.42, ease: "power3.out" });
  }, [movers]);

  function handleMove(e: PointerEvent<HTMLDivElement>) {
    const b = wrapRef.current?.getBoundingClientRect();
    if (!b) return;
    movers.x(gsap.utils.clamp(-10, 10, ((e.clientX - b.left) / b.width  - 0.5) * 18));
    movers.y(gsap.utils.clamp(-10, 10, ((e.clientY - b.top)  / b.height - 0.5) * 18));
  }
  function handleLeave() { movers.x(0); movers.y(0); }

  return (
    <div
      className="countdown-hover-field"
      ref={wrapRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <div className="countdown-glass-shell" ref={shellRef}>
        <div
          className="countdown-content"
          aria-label="Cuenta regresiva al 25 de julio de 2026"
        >
          <div className="countdown-value">
            <span>{pad(time.days)}</span>
            <small>Días</small>
          </div>
          <span className="countdown-separator">:</span>
          <div className="countdown-value">
            <span>{pad(time.hours)}</span>
            <small>Horas</small>
          </div>
          <span className="countdown-separator">:</span>
          <div className="countdown-value">
            <span>{pad(time.minutes)}</span>
            <small>Minutos</small>
          </div>
        </div>
      </div>
    </div>
  );
}
