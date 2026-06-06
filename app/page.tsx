"use client";

import { useCallback, useState } from "react";
import Loader from "@/components/Loader";
import PremioHero from "@/components/PremioHero";
import AfterHero from "@/components/AfterHero";
import TransitionSection from "@/components/TransitionSection";
import SnakeSection from "@/components/SnakeSection";
import ApplySection from "@/components/ApplySection";
import WinnerSection from "@/components/WinnerSection";
import FAQSection from "@/components/FAQSection";

export default function Home() {
  const [heroReady, setHeroReady] = useState(false);
  const onLoaderDone = useCallback(() => setHeroReady(true), []);

  return (
    <>
      <Loader onComplete={onLoaderDone} />
      <PremioHero autoPlay={heroReady} />
      <AfterHero />
      <TransitionSection />
      <SnakeSection />
      <ApplySection />
      <WinnerSection />
      <FAQSection />
    </>
  );
}
