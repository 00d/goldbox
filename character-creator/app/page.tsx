import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-[var(--primary)] mb-6">
          D&D 3.5e Tools
        </h1>
        <p className="text-xl text-gray-400 mb-12">
          Your complete toolkit for D&D 3.5 Edition adventures
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link
            href="/character-creator"
            className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-8 hover:border-[var(--primary)] transition-all hover:shadow-lg hover:shadow-[var(--primary)]/20"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-[var(--primary)] rounded-lg mb-4 mx-auto group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">
              Character Creator
            </h2>
            <p className="text-gray-400">
              Create and manage your D&D 3.5e characters with ease
            </p>
          </Link>

          <Link
            href="/battle-map"
            className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-8 hover:border-[var(--primary)] transition-all hover:shadow-lg hover:shadow-[var(--primary)]/20"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-[var(--primary)] rounded-lg mb-4 mx-auto group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">
              Battle Map
            </h2>
            <p className="text-gray-400">
              Simulate tactical combat with movement and positioning
            </p>
          </Link>
        </div>

        <footer className="mt-16 text-sm text-gray-500">
          <p>Based on the D&D 3.5 System Reference Document</p>
        </footer>
      </div>
    </div>
  );
}