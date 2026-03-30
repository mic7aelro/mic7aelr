'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin();

const FIRST = 'Michael';
const LAST = 'Rodriguez';

function splitChars(word: string) {
  return word.split('').map((char, i) => (
    <span
      key={i}
      className="char inline-block"
      style={{ display: 'inline-block' }}
    >
      {char}
    </span>
  ));
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const firstRef = useRef<HTMLSpanElement>(null);
  const lastRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const firstChars = firstRef.current?.querySelectorAll('.char') ?? [];
      const lastChars = lastRef.current?.querySelectorAll('.char') ?? [];

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.set([firstChars, lastChars, taglineRef.current, scrollHintRef.current, statusRef.current], {
        opacity: 0,
        y: 80,
      })
        .to(firstChars, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.04,
        })
        .to(
          lastChars,
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.04,
          },
          '-=0.9'
        )
        .to(
          taglineRef.current,
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.4'
        )
        .to(
          statusRef.current,
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.3'
        )
        .to(
          scrollHintRef.current,
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.2'
        );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative flex flex-col justify-between min-h-screen"
      style={{ paddingTop: 'clamp(32px, 5vh, 60px)', paddingBottom: 'clamp(80px, 15vh, 140px)' }}
    >
      {/* Top nav row */}
      <div className="container flex justify-between items-center">
        <span className="text-xs uppercase tracking-widest text-[#888] font-[family-name:var(--font-dm-sans)]">
          Portfolio
        </span>
        <nav className="flex gap-8">
          {['About', 'Skills', 'Projects'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="underline-anim text-xs uppercase tracking-widest text-[#888] hover:text-white transition-colors duration-300 font-[family-name:var(--font-dm-sans)]"
            >
              {item}
            </a>
          ))}
        </nav>
      </div>

      {/* Main headline */}
      <div className="container flex-1 flex flex-col justify-center py-20">
        <h1
          className="font-[family-name:var(--font-cormorant)] font-light leading-none select-none"
          style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)', letterSpacing: '-0.03em' }}
        >
          <span ref={firstRef} className="block overflow-hidden">
            <span className="inline-block">{splitChars(FIRST)}</span>
          </span>
          <span ref={lastRef} className="block overflow-hidden italic text-[#aaa]">
            <span className="inline-block">{splitChars(LAST)}</span>
          </span>
        </h1>

        <p
          ref={taglineRef}
          className="mt-10 text-[#888] max-w-md font-[family-name:var(--font-dm-sans)] text-sm leading-relaxed"
        >
          Software engineer — full-stack, systems, and the space between.
          <br />
          Engineering things quickly that work forever.
        </p>
      </div>

      {/* Bottom row */}
      <div className="container flex justify-between items-end">
        <div
          ref={statusRef}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#888] font-[family-name:var(--font-dm-sans)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" />
          Available for contracted work
        </div>

        <div
          ref={scrollHintRef}
          className="flex flex-col items-end gap-2 text-xs uppercase tracking-widest text-[#555] font-[family-name:var(--font-dm-sans)]"
        >
          <span>Scroll</span>
          <div className="w-px h-12 bg-[#333] ml-auto" />
        </div>
      </div>
    </section>
  );
}
