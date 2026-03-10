'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  download?: boolean;
  strength?: number;
}

export function MagneticButton({
  children,
  className,
  onClick,
  href,
  download,
  strength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, {
      x: x * strength,
      y: y * strength,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  };

  const baseClasses = cn(
    'inline-flex items-center justify-center border border-white',
    'text-xs uppercase font-[family-name:var(--font-dm-sans)] tracking-[0.08em] text-white',
    'transition-colors duration-300',
    'hover:bg-white hover:!text-black',
    className
  );

  const pillStyle = { padding: '0.4em 1em' };

  const inner = href ? (
    <a href={href} className={baseClasses} style={pillStyle} target="_blank" rel="noopener noreferrer" download={download}>
      {children}
    </a>
  ) : (
    <button onClick={onClick} className={baseClasses} style={pillStyle}>
      {children}
    </button>
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }}
    >
      {inner}
    </div>
  );
}
