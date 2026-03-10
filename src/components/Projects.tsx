'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { SectionHeading } from './SectionHeading';
import { PROJECTS } from '@/lib/constants';

gsap.registerPlugin(ScrollTrigger);

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = listRef.current?.querySelectorAll('.project-card') ?? [];

      gsap.fromTo(
        cards,
        { opacity: 0, y: 50, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id="projects">
      <div className="container">
        <SectionHeading label="03 — Projects" heading="Selected work." />

        <div ref={listRef} className="flex flex-col gap-0">
          {PROJECTS.map((project, i) => (
            <article key={project.id} className="project-card group">
              {/* Index */}
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs text-[#555] font-[family-name:var(--font-dm-sans)] uppercase tracking-widest">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-xs text-[#555] font-[family-name:var(--font-dm-sans)]">
                  {project.year}
                </span>
              </div>

              {/* Title + links */}
              <div className="project-links-gap flex flex-col gap-5 sm:mb-4 sm:flex-row sm:justify-between sm:items-start sm:gap-0">
                <h3 className="font-[family-name:var(--font-cormorant)] font-light leading-none"
                  style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                  {project.title}
                </h3>
                <div className="flex gap-4 sm:shrink-0 sm:ml-6 sm:mt-1">
                  {project.github && (
                    <a
                      href={project.github}
                      className="text-xs uppercase tracking-widest underline-anim text-[#888] hover:text-current transition-colors font-[family-name:var(--font-dm-sans)]"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      GitHub
                    </a>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      className="text-xs uppercase tracking-widest underline-anim text-[#888] hover:text-current transition-colors font-[family-name:var(--font-dm-sans)]"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Live ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="project-desc-gap text-sm leading-relaxed text-[#888] group-hover:text-[#555] transition-colors duration-300 max-w-2xl sm:mb-6 font-[family-name:var(--font-dm-sans)]">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs uppercase tracking-widest text-[#555] group-hover:text-[#333] transition-colors font-[family-name:var(--font-dm-sans)]"
                  >
                    {tag}
                    {project.tags[project.tags.length - 1] !== tag && (
                      <span className="ml-2 opacity-40">/</span>
                    )}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
