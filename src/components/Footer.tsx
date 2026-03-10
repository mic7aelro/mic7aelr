export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#1a1a1a]" style={{ paddingBlock: 'clamp(3rem, 8vh, 6rem)' }}>
      <div className="container flex flex-col gap-8 sm:flex-row sm:justify-between sm:items-end">
        <div>
          <p className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-white mb-1">
            Michael Rodriguez
          </p>
          <p className="text-xs text-[#555] uppercase tracking-widest font-[family-name:var(--font-dm-sans)]">
            Software Engineer
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex gap-6">
            {[
              { label: 'GitHub', href: 'https://github.com/mic7aelro' },
              { label: 'LinkedIn', href: 'https://www.linkedin.com/in/michael-rodriguez-0aaa93242/' },
              { label: 'Email', href: 'mailto:mic7aelro@gmail.com' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="underline-anim text-xs uppercase tracking-widest text-[#555] hover:text-white transition-colors duration-300 font-[family-name:var(--font-dm-sans)]"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-[#333] font-[family-name:var(--font-dm-sans)]">
            © {year} — All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
