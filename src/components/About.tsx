'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { SectionHeading } from './SectionHeading';
import { MagneticButton } from './MagneticButton';
import { ABOUT_TEXT } from '@/lib/constants';

gsap.registerPlugin(ScrollTrigger);

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const parasRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useGSAP(
    () => {
      const paras = parasRef.current?.querySelectorAll('p') ?? [];

      gsap.fromTo(
        paras,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: parasRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      );

      gsap.fromTo(
        metaRef.current,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: metaRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );

      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  const toggleForm = () => {
    const el = formRef.current;
    if (!el) return;

    if (!formOpen) {
      gsap.set(el, { display: 'block', height: 0, opacity: 0 });
      gsap.to(el, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.out' });
      setFormOpen(true);
    } else {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.in',
        onComplete: () => { gsap.set(el, { display: 'none' }); },
      });
      setFormOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus('sent');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section ref={sectionRef} id="about">
      <div className="container">
        <SectionHeading label="01 — About" heading="Precision in every layer." />

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_2fr]">
          {/* Meta column */}
          <div ref={metaRef} className="flex flex-col gap-8" style={{ paddingTop: '0.5rem' }}>
            <div>
              <span className="block text-xs uppercase tracking-widest text-[#555] mb-1 font-[family-name:var(--font-dm-sans)]">
                Based in
              </span>
              <span className="text-sm font-[family-name:var(--font-dm-sans)] text-[#aaa]">
                South Florida
              </span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-widest text-[#555] mb-1 font-[family-name:var(--font-dm-sans)]">
                Experience
              </span>
              <span className="text-sm font-[family-name:var(--font-dm-sans)] text-[#aaa]">
                1+ Year
              </span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-widest text-[#555] mb-1 font-[family-name:var(--font-dm-sans)]">
                Focus
              </span>
              <span className="text-sm font-[family-name:var(--font-dm-sans)] text-[#aaa]">
                Full-stack / Back-end
              </span>
            </div>
          </div>

          {/* Body column */}
          <div className="flex flex-col gap-8" style={{ paddingTop: '0.5rem' }}>
            <div ref={parasRef} className="flex flex-col gap-6">
              {ABOUT_TEXT.map((text, i) => (
                <p
                  key={i}
                  className="text-[1.05rem] leading-[1.75] text-[#ccc] font-[family-name:var(--font-dm-sans)]"
                >
                  {text}
                </p>
              ))}
            </div>

            <div ref={ctaRef} className="flex flex-col gap-6 pt-4">
              <div className="flex gap-4 flex-wrap">
                <MagneticButton onClick={toggleForm}>
                  {formOpen ? 'Never mind' : 'Get in touch'}
                </MagneticButton>
                <MagneticButton href="/resume.pdf" download>Download Resume</MagneticButton>
              </div>

              {/* Collapsible contact form */}
              <div ref={formRef} style={{ display: 'none', overflow: 'hidden' }}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs uppercase tracking-widest text-[#555] font-[family-name:var(--font-dm-sans)]">
                        Name
                      </label>
                      <input
                        name="name"
                        required
                        type="text"
                        className="bg-transparent border border-[#333] px-4 py-3 text-sm text-white font-[family-name:var(--font-dm-sans)] outline-none focus:border-white transition-colors duration-300"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs uppercase tracking-widest text-[#555] font-[family-name:var(--font-dm-sans)]">
                        Email
                      </label>
                      <input
                        name="email"
                        required
                        type="email"
                        className="bg-transparent border border-[#333] px-4 py-3 text-sm text-white font-[family-name:var(--font-dm-sans)] outline-none focus:border-white transition-colors duration-300"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-widest text-[#555] font-[family-name:var(--font-dm-sans)]">
                      Inquiry Type
                    </label>
                    <select
                      name="inquiry_type"
                      required
                      defaultValue=""
                      className="bg-[#000] border border-[#333] px-4 py-3 text-sm text-white font-[family-name:var(--font-dm-sans)] outline-none focus:border-white transition-colors duration-300 appearance-none"
                    >
                      <option value="" disabled className="text-[#555]">SELECT ONE</option>
                      <option value="Freelance Project">Freelance Project</option>
                      <option value="Full-Time Opportunity">Full-Time Opportunity</option>
                      <option value="Contract / Consulting">Contract / Consulting</option>
                      <option value="Collaboration">Collaboration</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-widest text-[#555] font-[family-name:var(--font-dm-sans)]">
                      Message
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      className="bg-transparent border border-[#333] px-4 py-3 text-sm text-white font-[family-name:var(--font-dm-sans)] outline-none focus:border-white transition-colors duration-300 resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-6">
                    <button
                      type="submit"
                      disabled={status === 'sending' || status === 'sent'}
                      className="inline-flex items-center justify-center border border-white text-xs uppercase tracking-[0.08em] font-[family-name:var(--font-dm-sans)] transition-colors duration-300 hover:bg-white hover:text-black disabled:opacity-40"
                      style={{ padding: '0.4em 1em' }}
                    >
                      {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent' : 'Send'}
                    </button>
                    {status === 'sent' && (
                      <span className="text-xs uppercase tracking-widest text-[#555] font-[family-name:var(--font-dm-sans)]">
                        Message received — I&apos;ll be in touch.
                      </span>
                    )}
                    {status === 'error' && (
                      <span className="text-xs uppercase tracking-widest text-red-500 font-[family-name:var(--font-dm-sans)]">
                        Something went wrong. Try again.
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
