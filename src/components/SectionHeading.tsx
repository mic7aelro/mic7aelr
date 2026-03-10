'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface SectionHeadingProps {
  label: string;
  heading: string;
  className?: string;
}

export function SectionHeading({ label, heading, className }: SectionHeadingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          once: true,
        },
      });

      tl.fromTo(
        labelRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      )
        .fromTo(
          headingRef.current,
          { opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' },
          {
            opacity: 1,
            y: 0,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.9,
            ease: 'power4.out',
          },
          '-=0.3'
        )
        .fromTo(
          dividerRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, ease: 'power3.inOut' },
          '-=0.4'
        );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={cn('mb-16', className)}>
      <span
        ref={labelRef}
        className="block text-xs uppercase tracking-widest text-[#888] mb-4 font-[family-name:var(--font-dm-sans)]"
      >
        {label}
      </span>
      <h2
        ref={headingRef}
        className="text-[clamp(2rem,5vw,4rem)] font-[family-name:var(--font-cormorant)] font-light leading-none mb-6"
      >
        {heading}
      </h2>
      <div ref={dividerRef} className="divider" />
    </div>
  );
}
