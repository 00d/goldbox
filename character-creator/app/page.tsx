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

          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-8 opacity-50 cursor-not-allowed">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-600 rounded-lg mb-4 mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              More Tools
            </h2>
            <p className="text-gray-400">
              Additional features coming soon
            </p>
          </div>
        </div>

        <footer className="mt-16 text-sm text-gray-500">
          <p>Based on the D&D 3.5 System Reference Document</p>
        </footer>
      </div>
    </div>
  );
}