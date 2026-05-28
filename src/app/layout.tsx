import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Hour Track',
  description: 'Local work hour tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="max-w-lg mx-auto px-4 pb-8">
          <header className="pt-6 pb-4 flex items-center justify-between">
            <span className="text-lg font-semibold tracking-tight">Hour Track</span>
            <Nav />
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
