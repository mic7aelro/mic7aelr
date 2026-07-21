'use client';

import { useRef, type CSSProperties } from 'react';
import {
  AboutScene,
  ContactScene,
  HeroScene,
  PortfolioNavigation,
  SkillsScene,
  WorkScene,
} from '@/components/PortfolioScenes';
import { useDailyPainting } from '@/hooks/useDailyPainting';
import {
  usePortfolioEnvironment,
  usePortfolioIntro,
  usePortfolioNavigation,
} from '@/hooks/usePortfolioPresentation';
import styles from './PortfolioPresentation.module.css';

export function PortfolioPresentation() {
  const root = useRef<HTMLElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const {
    painting,
    paintingIndex,
    paintingCount,
    debugEnabled,
    previousPainting,
    nextPainting,
  } = useDailyPainting();
  const siteStyle = {
    '--painting-background': `url("${painting.blurred}")`,
  } as CSSProperties;

  usePortfolioEnvironment();
  usePortfolioNavigation(root, deck);
  usePortfolioIntro(root);

  return (
    <main ref={root} className={styles.site} style={siteStyle}>
      <PortfolioNavigation />
      <div ref={deck} className={styles.deck}>
        <HeroScene />
        <AboutScene />
        <WorkScene />
        <SkillsScene />
        <ContactScene
          painting={painting}
          paintingIndex={paintingIndex}
          paintingCount={paintingCount}
          debugEnabled={debugEnabled}
          onPrevious={previousPainting}
          onNext={nextPainting}
        />
      </div>
    </main>
  );
}
