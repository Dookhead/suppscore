import '../styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SuppScore | Advanced Supplement Analysis',
  description: 'Automatically analyzes, weights, and scores pre-workout and protein powder supplements based on ingredient efficacy, cost-efficiency, and nutritional profiles.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-panel)' }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            <a href="/">SuppScore</a>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/" style={{ color: 'var(--text-main)', fontWeight: 500 }}>New Analysis</a>
            <a href="/leaderboard" style={{ color: 'var(--text-main)', fontWeight: 500 }}>Leaderboard</a>
          </div>
        </nav>
        <main style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
