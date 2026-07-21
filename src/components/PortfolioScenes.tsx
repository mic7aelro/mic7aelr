'use client';

import Image from 'next/image';
import { useState, type FormEvent } from 'react';
import { ABOUT_TEXT, PROJECTS, SKILLS } from '@/lib/constants';
import type { Painting } from '@/hooks/useDailyPainting';
import styles from './PortfolioPresentation.module.css';

type FormState = 'idle' | 'sending' | 'sent' | 'error';

type ArtworkSceneProps = {
  painting: Painting;
  debugEnabled: boolean;
  paintingIndex: number;
  paintingCount: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function PortfolioNavigation() {
  return (
    <nav className={styles.nav} data-nav aria-label="Primary navigation">
      <a className={styles.brand} href="#top" aria-label="mic7aelr, home">mic7aelr</a>
      <div className={styles.navLinks}>
        <a href="#about">About</a>
        <a href="#work">Work</a>
        <a href="#contact">Contact</a>
      </div>
      <div className={styles.navActions}>
        <a className={`${styles.socialLink} ${styles.resume}`} href="/resume.pdf" download aria-label="Download resume" title="Download resume">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 3.5h6.5L18 8v12.5H7V3.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M13.5 3.5V8H18M9.5 12h6M9.5 15h6M9.5 18h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <a className={styles.socialLink} href="https://github.com/mic7aelro" target="_blank" rel="noreferrer" aria-label="GitHub profile">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.24c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.04 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.74-1.55-2.57-.29-5.27-1.28-5.27-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.19-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.71 5.38-5.29 5.67.42.36.79 1.06.79 2.14v3.26c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z" />
          </svg>
        </a>
        <a className={styles.socialLink} href="https://www.linkedin.com/in/michael-rodriguez-0aaa93242/" target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V8.98h3.42v1.57h.05a3.75 3.75 0 0 1 3.37-1.85c3.61 0 4.27 2.37 4.27 5.46v6.29ZM5.32 7.41a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.04H3.54V8.98H7.1v11.47Z" />
          </svg>
        </a>
      </div>
    </nav>
  );
}

export function HeroScene() {
  return (
    <div className={styles.scene} data-scene>
      <section className={styles.hero} id="top">
        <div className={styles.heroMain}>
          <p className={styles.eyebrow} data-hero-copy>Software engineer</p>
          <h1 aria-label="Michael Rodriguez">
            <span className={styles.lineMask}><span data-hero-line>Michael</span></span>
            <span className={`${styles.lineMask} ${styles.lastName}`}><span data-hero-line>Rodriguez</span></span>
          </h1>
          <p className={styles.heroCopy} data-hero-copy>Full-stack, systems, and the space between. Building things quickly that work for the long haul.</p>
          <div className={styles.heroActions} data-hero-copy>
            <a href="#work">View selected work</a>
            <a href="mailto:mic7aelro@gmail.com">Email me</a>
          </div>
        </div>
        <figure className={styles.heroFigure} data-hero-image>
          <Image
            src="/images/hero-instagram.jpg"
            alt="Michael Rodriguez wearing sunglasses in patterned window light"
            fill
            priority
            sizes="(max-width: 767px) calc(100vw - 32px), 44vw"
          />
        </figure>
      </section>
    </div>
  );
}

export function AboutScene() {
  return (
    <section className={`${styles.about} ${styles.scene}`} id="about" data-scene>
      <div className={styles.sectionTitle} data-reveal><h2>Precision in every layer.</h2></div>
      <div className={styles.aboutStory} data-reveal>
        <p className={styles.lead}>{ABOUT_TEXT[0]}</p>
        <div className={styles.aboutColumns}><p>{ABOUT_TEXT[1]}</p><p>{ABOUT_TEXT[2]}</p></div>
        <p className={styles.aboutAside}>{ABOUT_TEXT[3]}</p>
      </div>
    </section>
  );
}

export function WorkScene() {
  const project = PROJECTS[0];

  return (
    <section className={`${styles.work} ${styles.scene}`} id="work" data-scene>
      <div className={styles.workHeading} data-reveal><p>Selected work</p></div>
      <article className={styles.project} data-reveal>
        <a className={styles.projectVisual} href={project.url} target="_blank" rel="noreferrer">
          <Image
            src="/images/projects/obsidian-marla.jpg"
            alt="Marla McLeod in a black hood and sunglasses"
            fill
            sizes="(max-width: 767px) calc(100vw - 32px), 390px"
          />
        </a>
        <div className={styles.projectContent}>
          <div className={styles.projectName}><h3>{project.title}</h3><span>{project.year}</span></div>
          <p>{project.description}</p>
          <ul aria-label="Project technologies">
            {project.tags.slice(0, 5).map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
          <div className={styles.projectLinks}>
            <a href={project.url} target="_blank" rel="noreferrer">Live site</a>
            <a href={project.github} target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </article>
    </section>
  );
}

function SkillsMarquee({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className={`${styles.skillsMarquee} ${reverse ? styles.skillsMarqueeTop : ''}`} aria-hidden="true">
      <div className={styles.marqueeTrack}>
        {[0, 1].map((marqueeGroup) => (
          <div className={styles.marqueeGroup} key={marqueeGroup}>
            {SKILLS.flatMap((category) => category.items).map((skill, index) => (
              <span key={`${marqueeGroup}-${skill}-${index}`}>{skill}<i>/</i></span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkillsScene() {
  return (
    <section className={`${styles.skills} ${styles.scene}`} data-scene>
      <div className={styles.skillsHeading} data-reveal>
        <h2>Agentic engineering. Full-stack execution.</h2>
        <p className={styles.skillsStatement}>
          I use AI to move faster, not to replace engineering judgment. I review every generated change and test its behavior and performance before I ship it.
        </p>
      </div>
      <div className={styles.skillGroups} data-reveal>
        <SkillsMarquee reverse />
        {SKILLS.map((group) => (
          <article key={group.label}>
            <h3>{group.label}</h3>
            <p className={styles.skillSummary}>{group.summary}</p>
            <p className={styles.skillItems}>{group.items.join(' / ')}</p>
          </article>
        ))}
        <SkillsMarquee />
      </div>
    </section>
  );
}

function ContactForm() {
  const [formState, setFormState] = useState<FormState>('idle');

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setFormState('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!response.ok) throw new Error('Unable to send');
      form.reset();
      setFormState('sent');
    } catch {
      setFormState('error');
    }
  };

  return (
    <form className={styles.form} onSubmit={submitContact} data-reveal data-contact-content>
      <div className={styles.formPair}>
        <label>Name<input name="name" type="text" autoComplete="name" required /></label>
        <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      </div>
      <label>
        Inquiry type
        <select name="inquiry_type" defaultValue="Freelance Project" required>
          <option>Freelance Project</option>
          <option>Full-Time Opportunity</option>
          <option>Contract / Consulting</option>
          <option>Collaboration</option>
          <option>Other</option>
        </select>
      </label>
      <label>Message<textarea name="message" rows={5} required /></label>
      <div className={styles.submitRow}>
        <button type="submit" disabled={formState === 'sending' || formState === 'sent'}>
          {formState === 'sending' ? 'Sending...' : formState === 'sent' ? 'Message sent' : 'Send message'}
        </button>
        <p className={formState === 'error' ? styles.error : undefined} aria-live="polite">
          {formState === 'sent' && 'Received. I will be in touch soon.'}
          {formState === 'error' && 'Something went wrong. Please email me directly.'}
        </p>
      </div>
    </form>
  );
}

export function ContactScene(props: ArtworkSceneProps) {
  return (
    <div className={`${styles.finalScene} ${styles.scene}`} data-scene>
      <section className={styles.contact} id="contact">
        <div className={styles.contactIntro} data-reveal data-contact-content>
          <h2>Have something you want to build?</h2>
          <p>Tell me what you are imagining and I&apos;ll help make it a reality.</p>
          <a href="mailto:mic7aelro@gmail.com">mic7aelro@gmail.com</a>
        </div>
        <ContactForm />
      </section>
      <footer className={styles.footer} data-reveal data-contact-content>
        <p>Michael Rodriguez</p>
        <p>{new Date().getFullYear()}</p>
      </footer>
      <ArtworkScene {...props} />
    </div>
  );
}

function ArtworkScene({
  painting,
  debugEnabled,
  paintingIndex,
  paintingCount,
  onPrevious,
  onNext,
}: ArtworkSceneProps) {
  return (
    <section className={styles.artScene} data-art-reveal>
      <Image className={`${styles.artImage} ${styles.artBase}`} src={painting.blurred} alt="" fill sizes="100vw" aria-hidden="true" />
      <Image
        className={`${styles.artImage} ${styles.artColor}`}
        data-art-color
        src={painting.color}
        alt={`${painting.title}, a painting by ${painting.artist}`}
        fill
        sizes="100vw"
      />
      <div className={styles.artShade} aria-hidden="true" />
      <div className={styles.artCaption} data-art-caption>
        <p className={styles.artLabel}>Painting of the day</p>
        <h2>{painting.title}</h2>
        <div className={styles.artMeta}>
          <p>{painting.artist}</p>
          <p>{painting.year}</p>
          <a href={painting.source} target="_blank" rel="noreferrer">View source</a>
        </div>
        {debugEnabled && (
          <div className={styles.artDebug} aria-label="Painting debug controls">
            <button type="button" onClick={onPrevious}>Previous</button>
            <span>{paintingIndex + 1} / {paintingCount}</span>
            <button type="button" onClick={onNext}>Next</button>
          </div>
        )}
      </div>
    </section>
  );
}
