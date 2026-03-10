'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { SectionHeading } from './SectionHeading';
import { SKILLS } from '@/lib/constants';

gsap.registerPlugin(ScrollTrigger);

export function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const categories = gridRef.current?.querySelectorAll('.skill-category') ?? [];

      gsap.fromTo(
        categories,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      );

      const pills = gridRef.current?.querySelectorAll('.skill-pill') ?? [];
      gsap.fromTo(
        pills,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.04,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 70%',
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id="skills">
      <div className="container">
        <SectionHeading label="02 — Skills" heading="Tools of the trade." />

        <div ref={gridRef} className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-4" style={{ marginTop: '0.5rem' }}>
          {SKILLS.map((category) => (
            <div key={category.label} className="skill-category">
              <h3 className="text-xs uppercase tracking-widest text-[#555] mb-5 font-[family-name:var(--font-dm-sans)]">
                {category.label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.items.map((skill) => (
                  <span key={skill} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Scrolling marquee strip */}
        <div className="overflow-hidden border-y border-[#1a1a1a] py-4" style={{ marginTop: '0.5rem', maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
          <div className="flex whitespace-nowrap" style={{ animation: 'marquee 30s linear infinite' }}>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex shrink-0 gap-0" aria-hidden={i > 0}>
                {SKILLS.flatMap((cat) => cat.items).map((skill, j) => (
                  <span key={j} className="text-[#444] text-xs uppercase tracking-widest font-[family-name:var(--font-dm-sans)] px-12 shrink-0">
                    {skill}
                    <span className="ml-12 text-[#222]">/</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
