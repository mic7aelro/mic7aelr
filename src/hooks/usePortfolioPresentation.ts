'use client';

import { useEffect, type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_BREAKPOINT = 901;

export function usePortfolioEnvironment() {
  useEffect(() => {
    document.body.classList.add('portfolio-preserve');
    document.documentElement.classList.add('portfolio-presentation');

    return () => {
      document.body.classList.remove('portfolio-preserve');
      document.documentElement.classList.remove('portfolio-presentation');
    };
  }, []);
}

export function usePortfolioNavigation(
  root: RefObject<HTMLElement | null>,
  deck: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (window.innerWidth < DESKTOP_BREAKPOINT || !root.current || !deck.current) return;

    const element = root.current;
    const deckElement = deck.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = (standard: number) => reduceMotion ? 0.01 : standard;
    const getScenes = () => Array.from(deckElement.querySelectorAll<HTMLElement>('[data-scene]'));
    const getContactContent = () => element.querySelectorAll<HTMLElement>('[data-contact-content]');
    const getArtReveal = () => element.querySelector<HTMLElement>('[data-art-reveal]');
    const getArtColor = () => element.querySelector<HTMLElement>('[data-art-color]');
    const getArtCaption = () => element.querySelector<HTMLElement>('[data-art-caption]');

    window.scrollTo(0, 0);
    let active = 0;
    let accumulatedDelta = 0;
    let animating = false;
    let artActive = false;
    let resetDelta: number | undefined;
    let activeTimeline: gsap.core.Timeline | null = null;

    const showArt = () => {
      const artReveal = getArtReveal();
      const artColor = getArtColor();
      const artCaption = getArtCaption();
      if (animating || artActive || !artReveal || !artColor || !artCaption) return;

      animating = true;
      artActive = true;
      activeTimeline?.kill();
      activeTimeline = gsap.timeline({ onComplete: () => { animating = false; } })
        .set(artReveal, { visibility: 'visible', pointerEvents: 'auto' })
        .set(artCaption, { y: 0, x: 0, opacity: 0 })
        .fromTo(artReveal, { opacity: 0 }, { opacity: 1, duration: duration(0.55), ease: 'power2.out' }, 0)
        .to(getContactContent(), { opacity: 0, y: reduceMotion ? 0 : -24, duration: duration(0.48), stagger: reduceMotion ? 0 : 0.045, ease: 'power2.in' }, 0)
        .fromTo(artColor, { opacity: 0, scale: reduceMotion ? 1 : 1.025 }, { opacity: 1, scale: 1, duration: duration(1.55), ease: 'power2.out' }, reduceMotion ? 0 : 0.3)
        .to(artCaption, { opacity: 1, duration: duration(0.82), ease: 'none' }, reduceMotion ? 0 : 0.72);
    };

    const hideArt = () => {
      const artReveal = getArtReveal();
      const artColor = getArtColor();
      const artCaption = getArtCaption();
      if (animating || !artActive || !artReveal || !artColor || !artCaption) return;

      animating = true;
      artActive = false;
      activeTimeline?.kill();
      activeTimeline = gsap.timeline({ onComplete: () => { animating = false; } })
        .set(artCaption, { y: 0, x: 0 })
        .to(artCaption, { opacity: 0, duration: duration(0.36), ease: 'power2.in' }, 0)
        .to(artColor, { opacity: 0, scale: reduceMotion ? 1 : 1.025, duration: duration(0.68), ease: 'power2.inOut' }, 0)
        .to(artReveal, {
          opacity: 0,
          duration: duration(0.48),
          ease: 'power2.in',
          onComplete: () => { gsap.set(artReveal, { visibility: 'hidden', pointerEvents: 'none' }); },
        }, reduceMotion ? 0 : 0.32)
        .to(getContactContent(), {
          opacity: 1,
          y: 0,
          duration: duration(0.62),
          stagger: reduceMotion ? 0 : 0.045,
          ease: 'power3.out',
        }, reduceMotion ? 0 : 0.34);
    };

    const goTo = (next: number) => {
      const scenes = getScenes();
      const destination = Math.max(0, Math.min(scenes.length - 1, next));
      if (animating) return;

      if (artActive) {
        const artReveal = getArtReveal();
        artActive = false;
        if (artReveal) gsap.set(artReveal, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
        gsap.set(getContactContent(), { opacity: 1, y: 0 });
      }
      if (destination === active) return;

      animating = true;
      active = destination;
      gsap.to(deckElement, {
        y: -destination * window.innerHeight,
        duration: duration(1.2),
        ease: 'power3.inOut',
        overwrite: true,
        onComplete: () => { animating = false; },
      });

      if (reduceMotion) return;
      const reveals = scenes[destination]?.querySelectorAll('[data-reveal]');
      if (reveals?.length) {
        gsap.fromTo(reveals, { opacity: 0, y: 28 }, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.07,
          delay: 0.32,
          ease: 'power3.out',
        });
      }
    };

    const navigate = (direction: number) => {
      if (artActive) {
        if (direction < 0) hideArt();
        return;
      }
      if (active === getScenes().length - 1 && direction > 0) {
        showArt();
        return;
      }
      goTo(active + direction);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (animating) return;

      accumulatedDelta += event.deltaY;
      window.clearTimeout(resetDelta);
      resetDelta = window.setTimeout(() => { accumulatedDelta = 0; }, 140);
      if (Math.abs(accumulatedDelta) < 8) return;

      const direction = Math.sign(accumulatedDelta);
      accumulatedDelta = 0;
      navigate(direction);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select')) return;

      const direction = ['ArrowDown', 'PageDown', ' '].includes(event.key)
        ? 1
        : ['ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
      if (!direction) return;

      event.preventDefault();
      navigate(direction);
    };

    const onLinkClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;

      const target = element.querySelector<HTMLElement>(link.hash);
      if (!target) return;

      event.preventDefault();
      const scenes = getScenes();
      const scene = target.closest<HTMLElement>('[data-scene]');
      goTo(scene ? scenes.indexOf(scene) : 0);
    };

    const onResize = () => gsap.set(deckElement, { y: -active * window.innerHeight });

    document.documentElement.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    element.addEventListener('click', onLinkClick);

    return () => {
      window.clearTimeout(resetDelta);
      document.documentElement.removeEventListener('wheel', onWheel, true);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      element.removeEventListener('click', onLinkClick);
      activeTimeline?.kill();
      gsap.killTweensOf(deckElement);
    };
  }, [root, deck]);
}

export function usePortfolioIntro(root: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
    intro
      .from('[data-nav]', { opacity: 0, y: -14, duration: 0.55 })
      .from('[data-hero-line]', { opacity: 0, yPercent: 110, duration: 1, stagger: 0.1 }, '-=0.2')
      .from('[data-hero-copy]', { opacity: 0, y: 22, duration: 0.65, stagger: 0.08 }, '-=0.55')
      .from('[data-hero-image]', { opacity: 0, scale: 1.04, duration: 1.1 }, '-=0.8');

    if (window.innerWidth >= DESKTOP_BREAKPOINT) return;
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
      gsap.from(element, {
        opacity: 0,
        y: 36,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 82%', once: true },
      });
    });
  }, { scope: root });
}
