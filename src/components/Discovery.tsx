'use client';

import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Types ───────────────────────────────────────────────────────────────────

type Track = 'ml' | 'astro';

type Phase = {
  id: number;
  name: string;
  subtitle: string;
  duration: string;
  track: Track;
  description: string;
  resources: string[];
  topics: string[];
  goal: string;
};

// ─── Track colours ───────────────────────────────────────────────────────────

const TC: Record<Track, { primary: string; glow: string; text: string }> = {
  ml:    { primary: '#4dd0e1', glow: 'rgba(77,208,225,0.55)',  text: 'ML Pathway'   },
  astro: { primary: '#ce93d8', glow: 'rgba(206,147,216,0.55)', text: 'Astrophysics' },
};

// ─── Phase data ──────────────────────────────────────────────────────────────

const PHASES: Phase[] = [
  {
    id: 1, name: 'Foundation', subtitle: 'Rebuild the Core',
    duration: '4–6 weeks', track: 'ml',
    description: "Shake off the rust. Don't grind this — make it feel good. You've seen most of this before so it'll click faster than you think.",
    resources: ['Khan Academy — Calculus AB', 'Khan Academy — Precalculus'],
    topics: ['Derivatives & limits', 'Geometric intuition of limits', 'Functions, trig, logarithms'],
    goal: "Derivatives feel natural. You understand what a limit actually means geometrically, not just symbolically.",
  },
  {
    id: 2, name: 'Linear Algebra', subtitle: 'Neural Networks Are This',
    duration: '6–8 weeks', track: 'ml',
    description: "The most satisfying math you'll learn relative to ML payoff. Neural networks are linear algebra at their core.",
    resources: ['3Blue1Brown — Essence of Linear Algebra (YouTube)', 'Gilbert Strang — Introduction to Linear Algebra (MIT OCW)'],
    topics: ['Vectors & vector spaces', 'Matrix transformations', 'Dot products & projections', 'Eigenvalues & eigenvectors', 'SVD'],
    goal: "Matrices, transformations, dot products, and eigenvalues all feel geometric and intuitive — not symbolic manipulation.",
  },
  {
    id: 3, name: 'Calculus', subtitle: 'Where ML Connects to Reality',
    duration: '8–10 weeks', track: 'ml',
    description: "Now you go deeper since you want the full picture. This is where ML math really starts to make physical sense.",
    resources: ['Professor Leonard — Calculus 1, 2 & 3 (YouTube)'],
    topics: ['Calc 1 — limits, derivatives, integration', 'Calc 2 — sequences, series, techniques', 'Calc 3 — multivariable, partial derivatives, gradients'],
    goal: "You can look at a gradient and know exactly what it's describing physically. Backpropagation makes complete geometric sense.",
  },
  {
    id: 4, name: 'Probability & Stats', subtitle: 'The Most Underrated Pillar',
    duration: '6–8 weeks', track: 'ml',
    description: "The most underrated pillar of ML math. Deeply satisfying once it clicks — and it shows up everywhere.",
    resources: ['Statistics 110 — Harvard with Joe Blitzstein (YouTube)', 'Think Stats by Allen Downey (free online)'],
    topics: ['Conditional probability & counting', "Bayes' theorem", 'Distributions & random variables', 'Expectation & variance', 'CLT & MLE'],
    goal: "Bayes' theorem feels obvious. You actually understand what a p-value means — and why people misuse it.",
  },
  {
    id: 5, name: 'ML Mathematics', subtitle: 'The Bridge',
    duration: 'Ongoing', track: 'ml',
    description: "Now you bring it all together. This phase never really ends — it deepens as you build more things.",
    resources: ['Mathematics for Machine Learning (mml-book.github.io)', 'Deep Learning — Goodfellow, Bengio & Courville'],
    topics: ['Loss functions & optimization', 'Backpropagation from scratch', 'Regularization', 'Attention mechanisms', 'Reading ML papers'],
    goal: "You can read an ML paper and follow the math. Loss functions, backprop, attention — all grounded in first principles.",
  },
  {
    id: 6, name: 'Differential Equations', subtitle: 'The Language of Physics',
    duration: '8–10 weeks', track: 'astro',
    description: "The single biggest gap between the ML pathway and physics. Diff EQ is the language physics is written in.",
    resources: ['Professor Leonard — Differential Equations (YouTube)', '3Blue1Brown — Differential Equations series'],
    topics: ['First & second order ODEs', 'Separable equations', 'Linear equations & integrating factors', 'Systems of differential equations', 'Introduction to PDEs'],
    goal: "You can look at a differential equation describing planetary motion and understand what it's telling you physically.",
  },
  {
    id: 7, name: 'Vector Calculus', subtitle: 'Fields in Space',
    duration: '4–6 weeks', track: 'astro',
    description: "You touched this in Calc 3 but physics needs you to go deeper. Electromagnetism and fluid dynamics live here entirely.",
    resources: ['Khan Academy — Multivariable Calculus (advanced)', 'Div, Grad, Curl and All That — H.M. Schey'],
    topics: ['Gradient, divergence, curl', 'Line & surface integrals', "Green's, Stokes' & Divergence theorems", 'Electric, magnetic & gravitational fields'],
    goal: "Maxwell's equations stop looking like abstract symbols and start describing real things happening in space.",
  },
  {
    id: 8, name: 'Classical Physics', subtitle: 'The Foundation of Everything',
    duration: '10–14 weeks', track: 'astro',
    description: "Now you actually start doing physics. Classical mechanics is the foundation — everything else is built on top of it.",
    resources: ['University Physics — Young & Freedman', 'Leonard Susskind — Classical Mechanics (The Theoretical Minimum)'],
    topics: ['Newtonian mechanics — forces, momentum, orbits', 'Lagrangian mechanics', 'Hamiltonian mechanics', 'Waves & oscillations', "Electromagnetism & Maxwell's equations"],
    goal: "You can derive orbital mechanics from first principles. You understand why planets move the way they do, not just that they do.",
  },
  {
    id: 9, name: 'Modern Physics', subtitle: 'Where Things Get Mind-Bending',
    duration: '8–12 weeks', track: 'astro',
    description: "Special relativity and introductory quantum mechanics — both essential for astrophysics.",
    resources: ['Leonard Susskind — Special Relativity & Quantum Mechanics (YouTube)', 'Six Not-So-Easy Pieces — Richard Feynman'],
    topics: ['Special relativity — spacetime, time dilation, E=mc²', 'Basics of general relativity', 'Wave-particle duality', 'Schrödinger equation', 'Quantum states & measurement'],
    goal: "Black holes stop being magic and start being physics. You understand why GPS satellites need relativistic corrections.",
  },
  {
    id: 10, name: 'Astrophysics', subtitle: 'The Final Frontier',
    duration: 'Ongoing', track: 'astro',
    description: "The capstone. With everything above in place you can now read astrophysics at a serious level.",
    resources: ['An Introduction to Modern Astrophysics — Carroll & Ostlie', 'Cosmos — Carl Sagan', 'Feynman Lectures on Physics (feynmanlectures.caltech.edu)'],
    topics: ['Stellar structure & evolution', 'White dwarfs, neutron stars, black holes', 'Galactic structure & dynamics', 'Cosmology — Big Bang, dark matter, dark energy', 'Gravitational waves', 'Exoplanets & planetary formation'],
    goal: "You can read an astrophysics paper on arXiv and follow the argument. The universe becomes a set of physical systems you actually understand.",
  },
];

// ─── SVG network layout (viewBox 0 0 1060 620) ──────────────────────────────

const NODES = [
  { idx: 0, x: 80,  y: 310 },
  { idx: 1, x: 255, y: 155 },
  { idx: 2, x: 255, y: 465 },
  { idx: 3, x: 415, y: 310 },
  { idx: 4, x: 530, y: 310 },
  { idx: 5, x: 670, y: 155 },
  { idx: 6, x: 670, y: 465 },
  { idx: 7, x: 835, y: 155 },
  { idx: 8, x: 835, y: 465 },
  { idx: 9, x: 980, y: 310 },
];

// Two-line labels for cramped names
const LABEL_LINES: string[][] = [
  ['Foundation'],
  ['Linear', 'Algebra'],
  ['Calculus'],
  ['Probability', '& Stats'],
  ['ML', 'Mathematics'],
  ['Differential', 'Equations'],
  ['Vector', 'Calculus'],
  ['Classical', 'Physics'],
  ['Modern', 'Physics'],
  ['Astrophysics'],
];

const EDGES: [number, number][] = [
  [0, 1], [0, 2],
  [1, 3], [2, 3],
  [3, 4],
  [4, 5], [4, 6],
  [5, 7], [5, 8], [6, 7], [6, 8],
  [7, 9], [8, 9],
];

function edgePath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = (b.x - a.x) * 0.45;
  return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
}

// ─── Trees ───────────────────────────────────────────────────────────────────

type TreeId = 'ml' | 'astro' | 'aws';

type TreeNode = { idx: number; x: number; y: number; isLock?: boolean };

type TreeDef = {
  id: TreeId;
  label: string;
  description: string;
  tracks: Track[];
  nodes: TreeNode[];
  edges: [number, number][];
  phases: Phase[];
  labelLines: string[][];
  prerequisites?: Phase[];
};

const TREES: TreeDef[] = [
  {
    id: 'ml',
    label: 'Machine Learning',
    description: 'A self-study pathway from mathematical foundations through machine learning — learned from first principles, one node at a time.',
    tracks: ['ml'],
    nodes: [
      { idx: 0, x: 100, y: 280 },
      { idx: 1, x: 320, y: 145 },
      { idx: 2, x: 320, y: 415 },
      { idx: 3, x: 580, y: 280 },
      { idx: 4, x: 900, y: 280 },
    ],
    edges: [[0,1],[0,2],[1,3],[2,3],[3,4]],
    phases: PHASES.slice(0, 5),
    labelLines: [
      ['Foundation'],
      ['Linear', 'Algebra'],
      ['Calculus'],
      ['Probability', '& Stats'],
      ['ML', 'Mathematics'],
    ],
  },
  {
    id: 'astro',
    label: 'Astrophysics',
    description: 'The physics pathway — from differential equations through modern physics to astrophysics. Requires the Machine Learning math foundations.',
    tracks: ['astro'],
    // nodes[0] is the lock gateway; nodes[1..5] are the real phases (idx 0–4 into phases)
    nodes: [
      { idx: -1, x: 80,  y: 280, isLock: true },
      { idx: 0,  x: 260, y: 280 },
      { idx: 1,  x: 450, y: 145 },
      { idx: 2,  x: 450, y: 415 },
      { idx: 3,  x: 660, y: 280 },
      { idx: 4,  x: 950, y: 280 },
    ],
    // edge pairs are array-position indices into nodes[]
    edges: [[0,1],[1,2],[1,3],[2,4],[3,4],[4,5]],
    phases: PHASES.slice(5, 10),
    labelLines: [
      ['Differential', 'Equations'],
      ['Vector', 'Calculus'],
      ['Classical', 'Physics'],
      ['Modern', 'Physics'],
      ['Astrophysics'],
    ],
    prerequisites: PHASES.slice(0, 5),
  },
  {
    id: 'aws',
    label: 'AWS',
    description: 'Cloud architecture and infrastructure — coming soon.',
    tracks: [],
    nodes: [],
    edges: [],
    phases: [],
    labelLines: [],
  },
];

// ─── Seeded RNG ──────────────────────────────────────────────────────────────

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(1664525, s) + 1013904223 >>> 0;
    return s / 0x100000000;
  };
}

// ─── Deep field canvas painter ───────────────────────────────────────────────

function paintDeepField(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const rng = makeRng(7919);

  // 1. Void
  ctx.fillStyle = '#000005';
  ctx.fillRect(0, 0, w, h);

  // 2. Nebula gas clouds — subtle coloured radial gradients
  const nebulae = [
    { cx: 0.12, cy: 0.28, r: 0.42, rgb: [12, 4, 55],  a: 0.55 },
    { cx: 0.78, cy: 0.68, r: 0.38, rgb: [45, 18, 0],   a: 0.50 },
    { cx: 0.48, cy: 0.52, r: 0.58, rgb: [0, 6, 28],    a: 0.35 },
    { cx: 0.88, cy: 0.18, r: 0.28, rgb: [35, 5, 38],   a: 0.45 },
    { cx: 0.28, cy: 0.82, r: 0.32, rgb: [0, 22, 42],   a: 0.40 },
    { cx: 0.55, cy: 0.15, r: 0.25, rgb: [5, 30, 60],   a: 0.30 },
  ];
  for (const n of nebulae) {
    const [r, g, b] = n.rgb;
    const rad = n.r * Math.max(w, h);
    const gr = ctx.createRadialGradient(n.cx * w, n.cy * h, 0, n.cx * w, n.cy * h, rad);
    gr.addColorStop(0,   `rgba(${r},${g},${b},${n.a})`);
    gr.addColorStop(0.4, `rgba(${r},${g},${b},${n.a * 0.3})`);
    gr.addColorStop(1,   `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
  }

  // 3. Galaxies — small distant ones (background layer)
  // Real galaxy colours: warm whites, creams, amber, pale dusty blue — no neon
  const galPalettes = [
    [255, 240, 210],  // cream-white elliptical
    [255, 225, 180],  // warm amber elliptical
    [240, 230, 215],  // off-white elliptical
    [210, 225, 245],  // dusty pale blue spiral
    [255, 210, 155],  // orange-amber
    [230, 220, 205],  // warm grey-white
    [255, 195, 130],  // deep amber
    [220, 235, 250],  // cool pale blue spiral
  ];
  for (let i = 0; i < 120; i++) {
    const x     = rng() * w;
    const y     = rng() * h;
    const size  = rng() * 10 + 2;
    const ratio = rng() * 0.5 + 0.15;
    const angle = rng() * Math.PI;
    const [r, g, b] = galPalettes[Math.floor(rng() * galPalettes.length)];
    const alpha = rng() * 0.4 + 0.18;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(1, ratio);
    const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gr.addColorStop(0,    `rgba(${r},${g},${b},${alpha})`);
    gr.addColorStop(0.45, `rgba(${r},${g},${b},${alpha * 0.3})`);
    gr.addColorStop(1,    `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 4. Micro-stars — faint coloured points (kept subtle so galaxies read)
  const starPal = [
    [195, 220, 255],
    [255, 255, 255],
    [255, 245, 210],
    [255, 200, 110],
    [170, 205, 255],
  ];
  for (let i = 0; i < 1800; i++) {
    const x    = rng() * w;
    const y    = rng() * h;
    const size = rng() * 0.9 + 0.1;
    const op   = rng() * 0.5 + 0.08;
    const [r, g, b] = starPal[Math.floor(rng() * starPal.length)];
    ctx.fillStyle = `rgba(${r},${g},${b},${op})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Larger "foreground" galaxies — more prominent, realistic colours
  const fgPalettes = [
    [255, 200, 130],  // amber elliptical
    [220, 235, 255],  // pale blue spiral
    [255, 245, 225],  // near-white elliptical
    [255, 215, 160],  // warm orange-white
    [200, 218, 240],  // cool dusty blue
  ];
  function drawFgGalaxy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, ratio: number, angle: number, r: number, g: number, b: number, alpha: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(1, ratio);
    const nucleus = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.25);
    nucleus.addColorStop(0, `rgba(${r},${g},${b},${alpha * 1.8})`);
    nucleus.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = nucleus;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    const disk = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    disk.addColorStop(0,    `rgba(${r},${g},${b},${alpha})`);
    disk.addColorStop(0.35, `rgba(${r},${g},${b},${alpha * 0.4})`);
    disk.addColorStop(1,    `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = disk;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (let i = 0; i < 18; i++) {
    const x     = rng() * w;
    const y     = rng() * h;
    const size  = rng() * 22 + 10;
    const ratio = rng() * 0.45 + 0.12;
    const angle = rng() * Math.PI;
    const [r, g, b] = fgPalettes[Math.floor(rng() * fgPalettes.length)];
    const alpha = rng() * 0.35 + 0.2;

    // Skip the yellowish galaxy that falls between the Astrophysics and Modern Physics nodes
    if (x / w > 0.74 && x / w < 1.0 && y / h > 0.30 && y / h < 0.68) continue;

    drawFgGalaxy(ctx, x, y, size, ratio, angle, r, g, b, alpha);
  }

  // Manually place a blue-toned spiral galaxy in the bottom-right corner
  drawFgGalaxy(ctx, w * 0.91, h * 0.87, 20, 0.28, Math.PI * 0.22, 140, 185, 255, 0.36);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Discovery() {
  const sectionRef  = useRef<HTMLElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const headingRef  = useRef<HTMLDivElement>(null);
  const networkRef  = useRef<SVGSVGElement>(null);
  const panelRef    = useRef<HTMLDivElement>(null);

  const [selected,     setSelected]     = useState<number | null>(null);
  const [hovered,      setHovered]      = useState<number | null>(null);
  const [activeTreeId, setActiveTreeId] = useState<TreeId>('ml');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [prereqOpen,   setPrereqOpen]   = useState(false);

  const activeTree = TREES.find(t => t.id === activeTreeId)!;

  function switchTree(id: TreeId) {
    setActiveTreeId(id);
    setDropdownOpen(false);
    setSelected(null);
    setPrereqOpen(false);
  }

  // Paint the deep-field canvas and keep it sized to the section
  useEffect(() => {
    const section = sectionRef.current;
    const canvas  = canvasRef.current;
    if (!section || !canvas) return;

    function paint() {
      if (!canvas || !section) return;
      canvas.width  = section.offsetWidth;
      canvas.height = section.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) paintDeepField(ctx, canvas.width, canvas.height);
    }

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(section);
    return () => ro.disconnect();
  }, []);

  // Heading — fires on mount (no scroll on this page)
  useGSAP(
    () => {
      const els = headingRef.current?.querySelectorAll('.disc-reveal') ?? [];
      gsap.fromTo(els, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out', delay: 0.15,
      });
    },
    { scope: sectionRef }
  );

  // Network — fires on mount
  useGSAP(
    () => {
      if (!networkRef.current) return;
      const edges = networkRef.current.querySelectorAll('.disc-edge');
      const nodes = networkRef.current.querySelectorAll('.disc-node-g');
      gsap.fromTo(edges,
        { strokeDashoffset: 1, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 1.2, stagger: 0.06, ease: 'power2.inOut', delay: 0.45 }
      );
      gsap.fromTo(nodes,
        { opacity: 0, scale: 0, transformOrigin: 'center center' },
        { opacity: 1, scale: 1, duration: 0.55, stagger: 0.07, ease: 'back.out(1.6)', delay: 0.7 }
      );
    },
    { scope: sectionRef }
  );

  const selectedPhase = selected !== null ? activeTree.phases[selected] : null;
  const sidebarOpen   = selected !== null || prereqOpen;
  const NODE_R = 30;

  const SIDEBAR_W = 'clamp(300px, 32vw, 420px)';

  return (
    <section
      id="discovery"
      ref={sectionRef}
      style={{ height: '100dvh', display: 'flex', background: '#000005', overflow: 'hidden', position: 'relative' }}
    >
      {/* ── Deep-field canvas ── */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* ── Left column: heading + network ── */}
      <div
        className="relative z-10 flex flex-col"
        style={{ flex: 1, minWidth: 0, paddingTop: 'clamp(8px, 1.2vh, 18px)' }}
      >
        {/* Heading */}
        <div
          ref={headingRef}
          className="container disc-reveal"
          style={{ flexShrink: 0, marginBottom: 'clamp(4px, 0.6vh, 8px)' }}
        >
          {/* Discovery label */}
          <p
            className="text-xs uppercase tracking-widest font-[family-name:var(--font-dm-sans)]"
            style={{ color: '#4dd0e1', marginBottom: 4 }}
          >
            Discovery
          </p>

          {/* Title row + legend */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px 20px' }}>

            {/* "The Path Through [label ▾]" */}
            <h2
              className="font-[family-name:var(--font-cormorant)] font-light"
              style={{ fontSize: 'clamp(1.2rem, 2.2vw, 2.2rem)', letterSpacing: '-0.02em', color: '#c8d4f0', lineHeight: 1.05 }}
            >
              The Path Through{' '}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  onClick={() => setDropdownOpen(d => !d)}
                  data-cursor-grow
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    color: '#c8d4f0', fontFamily: 'inherit', fontSize: 'inherit',
                    fontWeight: 'inherit', letterSpacing: 'inherit', lineHeight: 'inherit',
                    fontStyle: 'italic', opacity: 0.7,
                    display: 'inline-flex', alignItems: 'baseline', gap: 5,
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
                >
                  {activeTree.label}
                  <span style={{ fontSize: '0.55em', opacity: 0.6, fontStyle: 'normal' }}>
                    {dropdownOpen ? '▴' : '▾'}
                  </span>
                </button>

                {/* Dropdown — anchored under the button */}
                {dropdownOpen && (
                  <>
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 98 }}
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div
                      style={{
                        position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 99,
                        background: 'rgba(0,5,22,0.62)', backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid #1a2535',
                        minWidth: 180, padding: '4px 0',
                        fontSize: '1rem',
                      }}
                    >
                      {TREES.map(tree => (
                        <button
                          key={tree.id}
                          onClick={() => switchTree(tree.id)}
                          data-cursor-grow
                          style={{
                            display: 'block', width: '100%', background: 'none', border: 'none',
                            cursor: tree.id === 'aws' ? 'default' : 'pointer',
                            padding: '8px 16px', textAlign: 'left',
                            opacity: tree.id === 'aws' ? 0.3 : activeTreeId === tree.id ? 1 : 0.55,
                            transition: 'opacity 0.2s ease',
                          }}
                          onMouseEnter={e => { if (tree.id !== 'aws') e.currentTarget.style.opacity = '1'; }}
                          onMouseLeave={e => {
                            e.currentTarget.style.opacity = tree.id === 'aws' ? '0.3' : activeTreeId === tree.id ? '1' : '0.55';
                          }}
                        >
                          <span
                            className="text-xs uppercase tracking-widest font-[family-name:var(--font-dm-sans)]"
                            style={{ color: activeTreeId === tree.id ? '#c8d4f0' : '#5a6a80', fontStyle: 'normal' }}
                          >
                            {tree.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </span>
            </h2>

          </div>

          {/* Paragraph */}
          <p
            className="max-w-lg text-xs leading-relaxed font-[family-name:var(--font-dm-sans)]"
            style={{ color: '#4a5870', marginTop: 'clamp(3px, 0.5vh, 6px)' }}
          >
            {activeTree.description}
          </p>

          {/* Quote */}
          <p
            className="text-xs italic font-[family-name:var(--font-dm-sans)]"
            style={{ color: '#252f40', marginTop: 'clamp(2px, 0.3vh, 4px)' }}
          >
            "We used to look up at the sky and wonder at our place in the stars."
          </p>
        </div>

        {/* Network */}
        <div style={{ flex: 1, position: 'relative', paddingInline: 'clamp(1rem, 3vw, 3rem)', minHeight: 0 }}>
          <svg
            ref={networkRef}
            viewBox="0 80 1060 470"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            style={{ display: 'block', overflow: 'visible' }}
          >
            <defs>
              {(['ml', 'astro'] as Track[]).map((t) => (
                <filter key={t} id={`glow-${t}`} x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              ))}
              <filter id="glow-lock" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-ring" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="9" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Edges */}
            {activeTree.edges.map(([ai, bi], ei) => {
              const a = activeTree.nodes[ai];
              const b = activeTree.nodes[bi];
              const aLock = a.isLock ?? false;
              const bLock = b.isLock ?? false;
              const color = aLock || bLock
                ? '#ce93d8'
                : TC[activeTree.phases[a.idx].track].primary;
              const isRelated = aLock || bLock
                ? prereqOpen
                : selected !== null && (a.idx === selected || b.idx === selected);
              const isHov = !aLock && !bLock && hovered !== null && (a.idx === hovered || b.idx === hovered);
              const opacity = isRelated ? 1 : isHov ? 0.55 : 0.18;
              const pathD = edgePath(a, b);
              return (
                <g key={ei}>
                  <path
                    className="disc-edge"
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth={isRelated ? 1.6 : 1}
                    strokeOpacity={opacity}
                    strokeDasharray="1"
                    strokeDashoffset="0"
                    pathLength="1"
                    style={{
                      filter: isRelated ? `drop-shadow(0 0 4px ${color})` : undefined,
                      transition: 'stroke-opacity 0.3s ease, stroke-width 0.25s ease',
                    }}
                  />
                  {(isRelated || isHov) && (
                    <circle r="3" fill={color} opacity="0.9">
                      <animateMotion dur={`${2.2 + (ei % 4) * 0.35}s`} repeatCount="indefinite" path={pathD} />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {activeTree.nodes.map((n) => {
              // ── Lock gateway node ──
              if (n.isLock) {
                const LOCK_COLOR = '#ce93d8';
                const LOCK_GLOW  = 'rgba(206,147,216,0.55)';
                const isActive   = prereqOpen;
                return (
                  <g
                    key="lock"
                    className="disc-node-g"
                    style={{ cursor: 'pointer' }}
                    onClick={() => { setPrereqOpen(p => !p); setSelected(null); }}
                    onMouseEnter={() => setHovered(-1)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {isActive && (
                      <circle cx={n.x} cy={n.y} r={NODE_R + 12} fill="none"
                        stroke={LOCK_COLOR} strokeWidth="1" strokeOpacity="0.5" filter="url(#glow-ring)" />
                    )}
                    <circle cx={n.x} cy={n.y} r={NODE_R + 7} fill={LOCK_GLOW}
                      opacity={isActive ? 0.45 : hovered === -1 ? 0.28 : 0.1}
                      style={{ transition: 'opacity 0.3s ease' }} />
                    <circle cx={n.x} cy={n.y} r={NODE_R}
                      fill={isActive ? LOCK_COLOR : '#000010'}
                      stroke={LOCK_COLOR}
                      strokeWidth={isActive ? 0 : hovered === -1 ? 1.8 : 1.2}
                      filter="url(#glow-lock)"
                      style={{ transition: 'fill 0.22s ease, stroke-width 0.22s ease' }} />
                    <text x={n.x} y={n.y + 7} textAnchor="middle"
                      fontSize="18"
                      style={{ pointerEvents: 'none' }}>
                      🔒
                    </text>
                    <text x={n.x} y={n.y + NODE_R + 17} textAnchor="middle" fontSize="9"
                      fontFamily="var(--font-dm-sans), sans-serif" letterSpacing="0.07em"
                      fill={isActive ? LOCK_COLOR : '#2e3a52'}
                      style={{ pointerEvents: 'none', textTransform: 'uppercase', transition: 'fill 0.22s ease' }}>
                      ML Prereqs
                    </text>
                  </g>
                );
              }

              // ── Regular phase node ──
              const phase      = activeTree.phases[n.idx];
              const isSelected = selected === n.idx;
              const isHovered  = hovered === n.idx;
              const color      = TC[phase.track].primary;
              const glow       = TC[phase.track].glow;
              const lines      = activeTree.labelLines[n.idx];
              const labelY0    = n.y + NODE_R + 17;
              const localNum   = String(n.idx + 1).padStart(2, '0');
              return (
                <g
                  key={n.idx}
                  className="disc-node-g"
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setSelected(selected === n.idx ? null : n.idx); setPrereqOpen(false); }}
                  onMouseEnter={() => setHovered(n.idx)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {isSelected && (
                    <circle cx={n.x} cy={n.y} r={NODE_R + 12} fill="none"
                      stroke={color} strokeWidth="1" strokeOpacity="0.5" filter="url(#glow-ring)" />
                  )}
                  <circle cx={n.x} cy={n.y} r={NODE_R + 7} fill={glow}
                    opacity={isSelected ? 0.45 : isHovered ? 0.28 : 0.1}
                    style={{ transition: 'opacity 0.3s ease' }} />
                  <circle cx={n.x} cy={n.y} r={NODE_R}
                    fill={isSelected ? color : '#000010'}
                    stroke={color}
                    strokeWidth={isSelected ? 0 : isHovered ? 1.8 : 1.2}
                    filter={`url(#glow-${phase.track})`}
                    style={{ transition: 'fill 0.22s ease, stroke-width 0.22s ease' }} />
                  <text x={n.x} y={n.y + 6} textAnchor="middle"
                    fontSize="14" fontFamily="var(--font-dm-sans), sans-serif" fontWeight="500"
                    fill={isSelected ? '#000010' : color}
                    style={{ pointerEvents: 'none', transition: 'fill 0.22s ease' }}>
                    {localNum}
                  </text>
                  {lines.map((line, li) => (
                    <text key={li} x={n.x} y={labelY0 + li * 12}
                      textAnchor="middle" fontSize="10"
                      fontFamily="var(--font-dm-sans), sans-serif"
                      letterSpacing="0.055em"
                      fill={isSelected ? color : '#3a4a60'}
                      style={{ pointerEvents: 'none', transition: 'fill 0.22s ease', textTransform: 'uppercase' }}>
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ── Right sidebar — slides in, pushes network left ── */}
      <div
        style={{
          width: sidebarOpen ? SIDEBAR_W : '0',
          minWidth: sidebarOpen ? SIDEBAR_W : '0',
          transition: 'width 0.45s cubic-bezier(0.76,0,0.24,1), min-width 0.45s cubic-bezier(0.76,0,0.24,1)',
          flexShrink: 0,
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 20,
          background: 'rgba(0,2,16,0.94)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          borderLeft: sidebarOpen ? '1px solid rgba(206,147,216,0.18)' : 'none',
        }}
      >

        {/* ── Prerequisites panel ── */}
        {prereqOpen && activeTree.prerequisites && (
          <div
            className="prereq-panel"
            style={{
              width: SIDEBAR_W,
              height: '100%',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              background: 'transparent',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3"
              style={{ padding: 'clamp(1rem, 2vw, 1.6rem)', paddingBottom: 12 }}>
              <div>
                <p className="text-xs uppercase tracking-widest font-[family-name:var(--font-dm-sans)]"
                  style={{ color: '#ce93d8', marginBottom: 3 }}>
                  🔒 Prerequisites
                </p>
                <h3 className="font-[family-name:var(--font-cormorant)] font-light"
                  style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.7rem)', color: '#e8eeff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  Machine Learning
                </h3>
                <p className="text-xs font-[family-name:var(--font-dm-sans)]" style={{ color: '#3a4a60', marginTop: 2 }}>
                  Complete before tackling Astrophysics.
                </p>
              </div>
              <button
                onClick={() => setPrereqOpen(false)}
                className="text-sm font-[family-name:var(--font-dm-sans)] shrink-0"
                style={{ color: '#2e3a52', background: 'none', border: 'none', cursor: 'pointer' }}
                data-cursor-grow
              >
                ✕
              </button>
            </div>

            <div style={{ height: 1, background: '#0d1824' }} />

            {/* Prereq phases — stretch to fill remaining height, original card style */}
            <div style={{
              display: 'flex', flexDirection: 'column', flex: 1,
              padding: '10px clamp(1rem, 2vw, 1.6rem)',
              gap: 10,
            }}>
              {activeTree.prerequisites.map((phase, pi) => (
                <div
                  key={phase.id}
                  style={{
                    flex: 1,
                    padding: '0 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderBottom: pi < (activeTree.prerequisites?.length ?? 0) - 1 ? '1px solid #0d1824' : 'none',
                  }}
                >
                  <span
                    className="font-[family-name:var(--font-dm-sans)] shrink-0"
                    style={{
                      fontSize: '0.7rem',
                      color: TC[phase.track].primary,
                      background: TC[phase.track].primary + '14',
                      border: `1px solid ${TC[phase.track].primary}30`,
                      padding: '2px 7px',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {String(pi + 1).padStart(2, '0')}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p className="text-xs uppercase tracking-widest font-[family-name:var(--font-dm-sans)]"
                      style={{ color: '#8a9ab0', marginBottom: 2 }}>
                      {phase.name}
                    </p>
                    <p className="text-xs italic font-[family-name:var(--font-dm-sans)]" style={{ color: '#2e3a52' }}>
                      {phase.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Node detail panel ── */}
        {!prereqOpen && selectedPhase && (
          <div
            ref={panelRef}
            className="discovery-panel"
            style={{
              width: SIDEBAR_W,
              height: '100%',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              background: 'rgba(0,2,16,0.94)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              borderLeft: `1px solid ${TC[selectedPhase.track].primary}30`,
              padding: 'clamp(1.5rem, 2.5vw, 2.2rem)',
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest mb-2 font-[family-name:var(--font-dm-sans)]"
                  style={{ color: TC[selectedPhase.track].primary }}>
                  Phase {String((selected ?? 0) + 1).padStart(2, '0')} — {TC[selectedPhase.track].text}
                </p>
                <h3 className="font-[family-name:var(--font-cormorant)] font-light"
                  style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)', color: '#e8eeff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {selectedPhase.name}
                </h3>
                <p className="mt-1 text-xs italic font-[family-name:var(--font-dm-sans)]" style={{ color: '#3a4a60' }}>
                  {selectedPhase.subtitle}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-sm font-[family-name:var(--font-dm-sans)] shrink-0 mt-0.5"
                style={{ color: '#2e3a52', background: 'none', border: 'none', cursor: 'pointer' }}
                data-cursor-grow
              >
                ✕
              </button>
            </div>

            {/* Duration */}
            <span
              className="text-xs uppercase tracking-widest font-[family-name:var(--font-dm-sans)] border px-3 py-1.5 self-start"
              style={{ color: TC[selectedPhase.track].primary, borderColor: TC[selectedPhase.track].primary + '38' }}
            >
              {selectedPhase.duration}
            </span>

            {/* Description */}
            <p className="text-sm leading-relaxed font-[family-name:var(--font-dm-sans)]" style={{ color: '#6a7a90' }}>
              {selectedPhase.description}
            </p>

            <div style={{ height: 1, background: '#0d1824' }} />

            {/* Topics */}
            <div>
              <p className="text-xs uppercase tracking-widest mb-3 font-[family-name:var(--font-dm-sans)]"
                style={{ color: TC[selectedPhase.track].primary + 'bb' }}>Topics</p>
              <ul className="space-y-1">
                {selectedPhase.topics.map((t, i) => (
                  <li key={i} className="text-xs font-[family-name:var(--font-dm-sans)] flex gap-2 leading-snug" style={{ color: '#5a6a80' }}>
                    <span style={{ color: TC[selectedPhase.track].primary + '70', flexShrink: 0 }}>—</span>{t}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ height: 1, background: '#0d1824' }} />

            {/* Resources */}
            <div>
              <p className="text-xs uppercase tracking-widest mb-3 font-[family-name:var(--font-dm-sans)]"
                style={{ color: TC[selectedPhase.track].primary + 'bb' }}>Resources</p>
              <ul className="space-y-1">
                {selectedPhase.resources.map((r, i) => (
                  <li key={i} className="text-xs font-[family-name:var(--font-dm-sans)] flex gap-2 leading-snug" style={{ color: '#5a6a80' }}>
                    <span style={{ color: TC[selectedPhase.track].primary + '70', flexShrink: 0 }}>—</span>{r}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ height: 1, background: '#0d1824' }} />

            {/* Goal */}
            <div>
              <p className="text-xs uppercase tracking-widest mb-3 font-[family-name:var(--font-dm-sans)]"
                style={{ color: TC[selectedPhase.track].primary + 'bb' }}>Goal</p>
              <p className="text-xs leading-relaxed italic font-[family-name:var(--font-dm-sans)]" style={{ color: '#5a6a80' }}>
                {selectedPhase.goal}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
