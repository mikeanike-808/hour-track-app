'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Today' },
  { href: '/week', label: 'Week' },
  { href: '/history', label: 'History' },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1">
      {links.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="px-3 py-1 rounded-full text-sm font-medium transition-colors"
            style={{
              background: active ? 'var(--surface-2)' : 'transparent',
              color: active ? 'var(--text)' : 'var(--text-muted)',
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
