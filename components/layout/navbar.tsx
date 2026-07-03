'use client';

export default function Navbar({ logoSrc }: { logoSrc?: string }) {
  return (
    <nav className="flex items-center justify-between w-full h-16 px-6">
      {/* বাম পাশ */}
      <div className="flex items-center gap-4">
        <span className="text-white/60 text-sm hidden md:block">
          Welcome, Admin
        </span>
      </div>

      {/* ডান পাশ */}
      <div className="flex items-center gap-6">
        {/* Admin Button */}
        <button
          type="button"
          className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-6 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg flex items-center gap-2"
          onClick={() => console.log('Admin Panel Clicked')}
        >
          <span>Admin Panel</span>
        </button>

        {/* Notification Button */}
        <button
          type="button"
          aria-label="Notifications"
          className="text-white/80 hover:text-white transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        {/* Logo Section */}

      </div>
    </nav>
  );
}