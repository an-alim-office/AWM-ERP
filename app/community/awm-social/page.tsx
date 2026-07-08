'use client';

import React, {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

type Visibility = 'everyone' | 'team' | 'leadership';
type FeedFilter = 'all' | 'announcement' | 'update' | 'recognition' | 'poll';
type SortOption = 'latest' | 'popular';
type ReactionType = 'like' | 'celebrate' | 'support' | 'insightful';

type ComposerAttachment = {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'video' | 'file';
};

type PollOption = {
  id: string;
  label: string;
  votes: number;
};

type Author = {
  name: string;
  role: string;
  department: string;
  avatar: string;
  verified?: boolean;
};

type FeedPost = {
  id: string;
  type: FeedFilter;
  author: Author;
  content: string;
  createdAt: string;
  audience: Visibility;
  pinned?: boolean;
  mediaCount?: number;
  attachments?: ComposerAttachment[];
  tags?: string[];
  reactions: Record<ReactionType, number>;
  comments: number;
  shares: number;
  views: number;
  voted?: string | null;
  poll?: {
    totalVotes: number;
    options: PollOption[];
  };
};

type StatCard = {
  id: string;
  label: string;
  value: string;
  delta: string;
  positive: boolean;
};

const visibilityOptions: Array<{ value: Visibility; label: string }> = [
  { value: 'everyone', label: 'সবার জন্য' },
  { value: 'team', label: 'শুধু টিম' },
  { value: 'leadership', label: 'ম্যানেজমেন্ট' },
];

const filterOptions: Array<{ value: FeedFilter; label: string }> = [
  { value: 'all', label: 'সব' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'update', label: 'Update' },
  { value: 'recognition', label: 'Recognition' },
  { value: 'poll', label: 'Poll' },
];

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: 'latest', label: 'সর্বশেষ' },
  { value: 'popular', label: 'জনপ্রিয়' },
];

const reactionMeta: Record<
  ReactionType,
  { label: string; icon: React.ReactNode; activeClass: string }
> = {
  like: {
    label: 'Like',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 11v9" strokeLinecap="round" />
        <path
          d="M14 5.5 10.7 11H6.5A1.5 1.5 0 0 0 5 12.5v6A1.5 1.5 0 0 0 6.5 20h8.3a2 2 0 0 0 1.92-1.44l1.7-5.95A1.9 1.9 0 0 0 16.6 10H14V5.5Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    activeClass:
      'bg-blue-500/10 text-blue-700 ring-1 ring-inset ring-blue-500/20 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/20',
  },
  celebrate: {
    label: 'Celebrate',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v6" strokeLinecap="round" />
        <path d="M6 9h12" strokeLinecap="round" />
        <path d="m7 21 5-7 5 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    activeClass:
      'bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
  },
  support: {
    label: 'Support',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path
          d="M12 20s-6.5-4.35-8.65-8.32A5.2 5.2 0 0 1 12 5.36a5.2 5.2 0 0 1 8.65 6.32C18.5 15.65 12 20 12 20Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    activeClass:
      'bg-rose-500/10 text-rose-700 ring-1 ring-inset ring-rose-500/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20',
  },
  insightful: {
    label: 'Insightful',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path
          d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.75c.74.5 1.27 1.31 1.45 2.2h5.1c.18-.89.71-1.7 1.45-2.2A7 7 0 0 0 12 2Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    activeClass:
      'bg-violet-500/10 text-violet-700 ring-1 ring-inset ring-violet-500/20 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/20',
  },
};

const initialStats: StatCard[] = [
  { id: 'reach', label: 'Weekly Reach', value: '12.8K', delta: '+18.4%', positive: true },
  { id: 'engagement', label: 'Engagement Rate', value: '84.2%', delta: '+6.1%', positive: true },
  { id: 'posts', label: 'Published Today', value: '26', delta: '+4', positive: true },
  { id: 'response', label: 'Avg. Response Time', value: '12m', delta: '-3m', positive: true },
];

const initialPosts: FeedPost[] = [
  {
    id: 'post-1',
    type: 'announcement',
    author: {
      name: 'Nadia Rahman',
      role: 'Chief Operations Officer',
      department: 'Operations',
      avatar: 'NR',
      verified: true,
    },
    content:
      'Q3 execution room এখন লাইভ। সব department lead-দের daily blocker update 4:00 PM এর আগে শেয়ার করতে অনুরোধ করা হচ্ছে। New cross-functional escalation matrix dashboard-এ publish করা হয়েছে।',
    createdAt: '12 মিনিট আগে',
    audience: 'everyone',
    pinned: true,
    mediaCount: 2,
    tags: ['Q3', 'Operations', 'Leadership'],
    reactions: {
      like: 124,
      celebrate: 38,
      support: 16,
      insightful: 44,
    },
    comments: 28,
    shares: 12,
    views: 1480,
    attachments: [
      { id: 'att-1', name: 'Q3-escalation-matrix.pdf', size: '2.4 MB', type: 'file' },
      { id: 'att-2', name: 'war-room-brief.png', size: '860 KB', type: 'image' },
    ],
  },
  {
    id: 'post-2',
    type: 'recognition',
    author: {
      name: 'Arafat Hossain',
      role: 'HR Business Partner',
      department: 'People & Culture',
      avatar: 'AH',
    },
    content:
      'Customer success ও payroll automation squad-কে appreciation। তারা enterprise onboarding cycle 31% reduce করেছে এবং first-response SLA significantly improve করেছে।',
    createdAt: '38 মিনিট আগে',
    audience: 'team',
    tags: ['Recognition', 'Automation', 'HR'],
    reactions: {
      like: 92,
      celebrate: 61,
      support: 20,
      insightful: 11,
    },
    comments: 19,
    shares: 7,
    views: 942,
  },
  {
    id: 'post-3',
    type: 'poll',
    author: {
      name: 'Samira Khan',
      role: 'Product Strategy Lead',
      department: 'Product',
      avatar: 'SK',
      verified: true,
    },
    content:
      'Next enterprise social upgrade-এর জন্য কোন feature team-first impact সবচেয়ে বেশি দেবে?',
    createdAt: '1 ঘন্টা আগে',
    audience: 'everyone',
    tags: ['Product', 'Polling', 'Roadmap'],
    reactions: {
      like: 48,
      celebrate: 7,
      support: 18,
      insightful: 74,
    },
    comments: 34,
    shares: 9,
    views: 1322,
    voted: null,
    poll: {
      totalVotes: 278,
      options: [
        { id: 'poll-1', label: 'AI digest & smart summary', votes: 122 },
        { id: 'poll-2', label: 'Department-wise signal dashboard', votes: 91 },
        { id: 'poll-3', label: 'Voice / multilingual posting', votes: 65 },
      ],
    },
  },
  {
    id: 'post-4',
    type: 'update',
    author: {
      name: 'Mahin Islam',
      role: 'Finance Controller',
      department: 'Finance',
      avatar: 'MI',
    },
    content:
      'Vendor approval workflow phase-2 এখন production-এ। Approval latency drop monitor করার জন্য live KPI widget rollout করা হয়েছে।',
    createdAt: '2 ঘন্টা আগে',
    audience: 'leadership',
    mediaCount: 1,
    tags: ['Finance', 'Workflow', 'KPI'],
    reactions: {
      like: 66,
      celebrate: 18,
      support: 10,
      insightful: 29,
    },
    comments: 12,
    shares: 5,
    views: 812,
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

const Shell = memo(function Shell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,1),rgba(248,250,252,1))] text-slate-950 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_24%),linear-gradient(to_bottom,rgba(2,6,23,1),rgba(15,23,42,1))] dark:text-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-8">{children}</div>
    </div>
  );
});

const ThemeToggle = memo(function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const stored = window.localStorage.getItem('awm-social-theme');
    const initialDark =
      stored === 'dark' ||
      (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', initialDark);
    setIsDark(initialDark);
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const nextDark = !isDark;
    root.classList.toggle('dark', nextDark);
    window.localStorage.setItem('awm-social-theme', nextDark ? 'dark' : 'light');
    setIsDark(nextDark);
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/85 px-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700/70 dark:bg-slate-900/75 dark:text-slate-200 dark:hover:border-slate-600"
    >
      <span
        className={cn(
          'inline-flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300',
          mounted && isDark
            ? 'bg-slate-800 text-cyan-300'
            : 'bg-amber-100 text-amber-600'
        )}
      >
        {mounted && isDark ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M21 12.79A9 9 0 0 1 11.21 3c0 .07-.01.14-.01.21A9 9 0 1 0 20.79 13c.07 0 .14-.01.21-.01Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M12 18a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm0-16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm9 9a1 1 0 0 1 0 2h-2a1 1 0 1 1 0-2h2ZM5 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1Zm11.95 5.536 1.414 1.414a1 1 0 0 1-1.414 1.414l-1.414-1.414a1 1 0 0 1 1.414-1.414ZM7.05 7.05 8.464 8.464A1 1 0 0 1 7.05 9.878L5.636 8.464A1 1 0 0 1 7.05 7.05Zm9.9-1.414A1 1 0 0 1 18.364 7.05L16.95 8.464a1 1 0 1 1-1.414-1.414l1.414-1.414a1 1 0 0 1 1.414 0ZM7.05 14.122a1 1 0 0 1 1.414 1.414L7.05 16.95a1 1 0 1 1-1.414-1.414l1.414-1.414ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
          </svg>
        )}
      </span>
      <span>{mounted && isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
});

const Header = memo(function Header() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/50 bg-white/70 p-5 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.55)] sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right_top,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_left_bottom,rgba(168,85,247,0.10),transparent_24%)] dark:bg-[radial-gradient(circle_at_right_top,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_left_bottom,rgba(168,85,247,0.12),transparent_22%)]" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/90 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            Enterprise Social Workspace
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            AWM Enterprise Social
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            Connected announcements, team momentum, recognitions, and operational signals - all in one enterprise-grade social command center.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Quick Space
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
});

const StatGrid = memo(function StatGrid({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.id}
          className="group relative overflow-hidden rounded-[24px] border border-white/60 bg-white/80 p-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(37,99,235,0.35)] dark:border-slate-800/70 dark:bg-slate-900/75"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 opacity-80" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </p>
            </div>
            <div
              className={cn(
                'inline-flex rounded-full px-3 py-1 text-xs font-bold',
                stat.positive
                  ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
              )}
            >
              {stat.delta}
            </div>
          </div>
          <div className="mt-5 flex items-end gap-1">
            {[48, 66, 58, 75, 62, 83, 90].map((value, i) => (
              <div
                key={`${stat.id}-${i}`}
                className="h-16 flex-1 rounded-full bg-gradient-to-t from-blue-500/75 to-cyan-300/60 transition-transform duration-300 group-hover:scale-y-105 dark:from-cyan-500/60 dark:to-violet-400/60"
                style={{ height: `${Math.max(20, value)}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

const SearchInput = memo(function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();

  return (
    <div className="relative flex-1 min-w-[220px]">
      <label htmlFor={inputId} className="sr-only">
        Search posts
      </label>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
        <circle cx="11" cy="11" r="6.5" />
      </svg>
      <input
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="পোস্ট, ট্যাগ, বিভাগ বা লেখক সার্চ করুন..."
        className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 pl-12 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
      />
    </div>
  );
});

const FilterToolbar = memo(function FilterToolbar({
  filter,
  setFilter,
  sortBy,
  setSortBy,
  search,
  setSearch,
}: {
  filter: FeedFilter;
  setFilter: (value: FeedFilter) => void;
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  const filterId = useId();
  const sortId = useId();

  return (
    <div className="rounded-[24px] border border-white/60 bg-white/80 p-4 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.20)] backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/75">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
          <SearchInput value={search} onChange={setSearch} />

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="min-w-[160px]">
              <label htmlFor={filterId} className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Feed Filter
              </label>
              <select
                id={filterId}
                value={filter}
                onChange={(e) => setFilter(e.target.value as FeedFilter)}
                className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm font-semibold text-slate-900 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[160px]">
              <label htmlFor={sortId} className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Sort By
              </label>
              <select
                id={sortId}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm font-semibold text-slate-900 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={cn(
                'inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30',
                filter === option.value
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

const Composer = memo(function Composer({
  onCreatePost,
}: {
  onCreatePost: (post: {
    content: string;
    audience: Visibility;
    attachments: ComposerAttachment[];
    type: FeedFilter;
    poll?: { options: string[] };
  }) => void;
}) {
  const textareaId = useId();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('everyone');
  const [category, setCategory] = useState<FeedFilter>('update');
  const [isPosting, setIsPosting] = useState(false);
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const [pollMode, setPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [content]);

  const remaining = Math.max(0, 500 - content.length);

  const addMockAttachment = useCallback(() => {
    const nextIndex = attachments.length + 1;
    const fileTypes: ComposerAttachment['type'][] = ['image', 'file', 'video'];
    const nextType = fileTypes[nextIndex % fileTypes.length];
    const nextAttachment: ComposerAttachment = {
      id: `draft-attachment-${Date.now()}-${nextIndex}`,
      name:
        nextType === 'image'
          ? `campaign-preview-${nextIndex}.png`
          : nextType === 'video'
            ? `team-update-${nextIndex}.mp4`
            : `enterprise-brief-${nextIndex}.pdf`,
      size: nextType === 'video' ? '14.2 MB' : nextType === 'image' ? '1.8 MB' : '620 KB',
      type: nextType,
    };
    setAttachments((prev) => [...prev, nextAttachment]);
  }, [attachments.length]);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const submitPost = useCallback(() => {
    if (!content.trim()) return;
    setIsPosting(true);

    window.setTimeout(() => {
      onCreatePost({
        content: content.trim(),
        audience: visibility,
        attachments,
        type: pollMode ? 'poll' : category,
        poll: pollMode
          ? {
              options: pollOptions.map((option) => option.trim()).filter(Boolean),
            }
          : undefined,
      });

      setContent('');
      setAttachments([]);
      setVisibility('everyone');
      setCategory('update');
      setPollMode(false);
      setPollOptions(['', '']);
      setIsPosting(false);
    }, 800);
  }, [attachments, category, content, onCreatePost, pollMode, pollOptions, visibility]);

  return (
    <div className="rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)] backdrop-blur transition-colors duration-300 dark:border-slate-800/70 dark:bg-slate-900/75 sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">নতুন পোস্ট</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              আপডেট, announcement, recognition অথবা poll publish করুন।
            </p>
          </div>

          <div className="inline-flex items-center rounded-2xl border border-emerald-200/70 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            AI-ready composer
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-200/80 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
              <label htmlFor={textareaId} className="sr-only">
                Create post
              </label>
              <textarea
                id={textareaId}
                ref={textareaRef}
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 500))}
                placeholder="আজকের আপডেট, টিম announcement, recognition বা strategic message শেয়ার করুন..."
                className="min-h-[160px] w-full resize-none border-0 bg-transparent p-3 text-sm leading-7 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-white dark:placeholder:text-slate-500"
              />
              <div className="flex flex-col gap-3 border-t border-slate-200/80 px-2 pt-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={addMockAttachment}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                    মিডিয়া যুক্ত করুন
                  </button>

                  <button
                    type="button"
                    onClick={() => setPollMode((prev) => !prev)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30',
                      pollMode
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                    )}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M5 19V9M12 19V5M19 19v-7" strokeLinecap="round" />
                    </svg>
                    Poll
                  </button>
                </div>

                <div className="text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">
                  {remaining} characters left
                </div>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Attached files</p>
                  <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {attachments.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {attachments.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/90 p-3 dark:border-slate-800 dark:bg-slate-900/80"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.size} • {item.type}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pollMode && (
              <div className="rounded-[24px] border border-violet-200/70 bg-violet-50/70 p-4 dark:border-violet-500/20 dark:bg-violet-500/5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Poll Options</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      অন্তত 2টি option দিন
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPollOptions((prev) => [...prev, ''])}
                    className="rounded-2xl bg-violet-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-violet-700"
                  >
                    Add option
                  </button>
                </div>
                <div className="space-y-3">
                  {pollOptions.map((option, index) => (
                    <div key={`poll-option-${index}`} className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-xs font-black text-violet-700 shadow-sm dark:bg-slate-900 dark:text-violet-300">
                        {index + 1}
                      </span>
                      <input
                        value={option}
                        onChange={(e) =>
                          setPollOptions((prev) => {
                            const copy = [...prev];
                            copy[index] = e.target.value;
                            return copy;
                          })
                        }
                        placeholder={`Option ${index + 1}`}
                        className="h-11 w-full rounded-2xl border border-violet-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-violet-500/20 dark:bg-slate-950 dark:text-white"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            setPollOptions((prev) => prev.filter((_, i) => i !== index))
                          }
                          className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-rose-600 dark:hover:bg-slate-900"
                          aria-label={`Remove option ${index + 1}`}
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Publishing controls
              </h3>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-500 dark:text-slate-400">
                    Audience
                  </label>
                  <div className="space-y-2">
                    {visibilityOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setVisibility(option.value)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-200',
                          visibility === option.value
                            ? 'border-blue-500 bg-blue-500/5 text-blue-700 dark:border-cyan-400 dark:bg-cyan-400/10 dark:text-cyan-300'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                        )}
                      >
                        <span className="text-sm font-semibold">{option.label}</span>
                        <span
                          className={cn(
                            'h-2.5 w-2.5 rounded-full',
                            visibility === option.value
                              ? 'bg-current'
                              : 'bg-slate-300 dark:bg-slate-600'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-500 dark:text-slate-400">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeedFilter)}
                    disabled={pollMode}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    {filterOptions
                      .filter((item) => item.value !== 'all')
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Smart publish tips</p>
                  <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    <li>- Short updates perform better during core office hours</li>
                    <li>- Recognition posts gain higher engagement with media</li>
                    <li>- Polls work best with 3-4 concise options</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={submitPost}
                  disabled={!content.trim() || isPosting || (pollMode && pollOptions.filter((p) => p.trim()).length < 2)}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPosting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M5 12 3 21l18-9L3 3l2 9h7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      পোস্ট করুন
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const ActivityChart = memo(function ActivityChart() {
  const values = [28, 42, 36, 58, 54, 72, 65, 79, 74, 88, 82, 96];
  const max = Math.max(...values);

  return (
    <div className="rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)] backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/75">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Engagement Momentum</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Post interaction trend across the current cycle
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          +24.8%
        </div>
      </div>

      <div className="flex h-56 items-end gap-2">
        {values.map((value, index) => (
          <div key={index} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-full w-full items-end justify-center">
              <div
                className="w-full rounded-t-[18px] bg-gradient-to-t from-blue-600 via-cyan-500 to-violet-400 shadow-[0_10px_24px_-12px_rgba(59,130,246,0.5)] transition-all duration-300 group-hover:opacity-90"
                style={{ height: `${(value / max) * 100}%` }}
              />
              <div className="absolute -top-8 rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 dark:bg-white dark:text-slate-900">
                {value}%
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              W{index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

const InsightsPanel = memo(function InsightsPanel() {
  const items = [
    {
      title: 'Best performing content',
      value: 'Recognition + image',
      detail: '2.3x more engagement than text-only updates',
      color: 'emerald',
    },
    {
      title: 'Peak interaction window',
      value: '11:00 AM - 1:00 PM',
      detail: 'Highest reply density during midday collaboration',
      color: 'blue',
    },
    {
      title: 'Emerging signal',
      value: 'AI & workflow posts rising',
      detail: 'Strategic updates are driving stronger executive visibility',
      color: 'violet',
    },
  ] as const;

  return (
    <div className="rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)] backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/75">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">AI Insights</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Lightweight strategic signals from social activity
          </p>
        </div>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">
          Live
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/70"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              {item.title}
            </p>
            <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{item.value}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

const SkeletonFeed = memo(function SkeletonFeed() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/75"
        >
          <div className="animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-56 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-11/12 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-8/12 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="mt-5 h-28 rounded-[20px] bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
});

const PollBlock = memo(function PollBlock({
  post,
  onVote,
}: {
  post: FeedPost;
  onVote: (postId: string, optionId: string) => void;
}) {
  if (!post.poll) return null;

  return (
    <div className="mt-5 rounded-[22px] border border-violet-200/70 bg-violet-50/70 p-4 dark:border-violet-500/20 dark:bg-violet-500/5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-black text-slate-900 dark:text-white">Team Poll</p>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {formatCompactNumber(post.poll.totalVotes)} votes
        </span>
      </div>

      <div className="space-y-3">
        {post.poll.options.map((option) => {
          const percentage = post.poll && post.poll.totalVotes > 0 ? (option.votes / post.poll.totalVotes) * 100 : 0;
          const selected = post.voted === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onVote(post.id, option.id)}
              className={cn(
                'group relative block w-full overflow-hidden rounded-2xl border px-4 py-3 text-left transition-all duration-200',
                selected
                  ? 'border-violet-500 bg-white shadow-sm dark:border-violet-400 dark:bg-slate-900'
                  : 'border-violet-200/70 bg-white/80 hover:border-violet-300 dark:border-violet-500/20 dark:bg-slate-950/60'
              )}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-r-2xl bg-gradient-to-r from-violet-500/18 to-fuchsia-500/6 transition-all duration-500"
                style={{ width: `${Math.max(percentage, selected ? 12 : 0)}%` }}
              />
              <div className="relative flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{option.label}</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {formatPercent(percentage)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

const FeedTable = memo(function FeedTable({
  posts,
}: {
  posts: FeedPost[];
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)] backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/75">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Feed Snapshot</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Searchable enterprise overview of current activity
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {posts.length} rows
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-950/60">
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Post
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Audience
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Type
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Engagement
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Views
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const totalReactions = Object.values(post.reactions).reduce((sum, value) => sum + value, 0);
              return (
                <tr
                  key={post.id}
                  className="border-t border-slate-200/80 transition-colors hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-950/40"
                >
                  <td className="px-5 py-4 align-top">
                    <div className="min-w-[240px]">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{post.author.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {post.content}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {post.audience}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold capitalize text-blue-700 dark:text-blue-300">
                      {post.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {formatCompactNumber(totalReactions + post.comments + post.shares)}
                  </td>
                  <td className="px-5 py-4 align-top text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {formatCompactNumber(post.views)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

const FeedCard = memo(function FeedCard({
  post,
  onReact,
  onVote,
}: {
  post: FeedPost;
  onReact: (postId: string, type: ReactionType) => void;
  onVote: (postId: string, optionId: string) => void;
}) {
  const totalReactions = Object.values(post.reactions).reduce((sum, value) => sum + value, 0);

  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.24)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_-24px_rgba(59,130,246,0.35)] dark:border-slate-800/70 dark:bg-slate-900/75 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-violet-600 text-sm font-black text-white shadow-lg shadow-blue-500/20">
            {post.author.avatar}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-black text-slate-900 dark:text-white">
                {post.author.name}
              </h3>
              {post.author.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M12 2l2.2 2.4 3.2-.2.9 3.1 3 1.2-1.3 2.9 1.3 2.9-3 1.2-.9 3.1-3.2-.2L12 22l-2.2-2.4-3.2.2-.9-3.1-3-1.2 1.3-2.9-1.3-2.9 3-1.2.9-3.1 3.2.2L12 2Zm-1 13 6-6-1.4-1.4L11 12.2 8.4 9.6 7 11l4 4Z" />
                  </svg>
                  Verified
                </span>
              )}
              {post.pinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  Pinned
                </span>
              )}
            </div>

            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              {post.author.role} • {post.author.department} • {post.createdAt}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {post.type}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {post.audience}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{post.content}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {post.attachments && post.attachments.length > 0 && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {post.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/10 to-violet-500/10 text-blue-700 dark:text-cyan-300">
                    {attachment.type === 'image' ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <circle cx="9" cy="10" r="1.4" />
                        <path d="m21 15-4.2-4.2a1 1 0 0 0-1.4 0L9 17" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : attachment.type === 'video' ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="5" width="14" height="14" rx="2" />
                        <path d="m17 10 4-2v8l-4-2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                      {attachment.name}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {attachment.size} • {attachment.type}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {post.type === 'poll' && <PollBlock post={post} onVote={onVote} />}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(reactionMeta) as ReactionType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onReact(post.id, type)}
              className={cn(
                'inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:text-slate-300 dark:hover:bg-slate-800',
                reactionMeta[type].activeClass
              )}
            >
              {reactionMeta[type].icon}
              {reactionMeta[type].label}
              <span>{formatCompactNumber(post.reactions[type])}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>{formatCompactNumber(totalReactions)} reactions</span>
          <span>{formatCompactNumber(post.comments)} comments</span>
          <span>{formatCompactNumber(post.shares)} shares</span>
          <span>{formatCompactNumber(post.views)} views</span>
        </div>
      </div>
    </article>
  );
});

export default function AWM_Enterprise_Social() {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [stats, setStats] = useState<StatCard[]>(initialStats);
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [search, setSearch] = useState('');
  const [isFeedLoading, setIsFeedLoading] = useState(true);

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsFeedLoading(false);
    }, 900);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredPosts = useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase();

    let nextPosts = posts.filter((post) => {
      const matchesFilter = filter === 'all' ? true : post.type === filter;

      if (!matchesFilter) return false;
      if (!keyword) return true;

      const haystack = [
        post.author.name,
        post.author.role,
        post.author.department,
        post.content,
        post.audience,
        post.type,
        ...(post.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(keyword);
    });

    nextPosts = [...nextPosts].sort((a, b) => {
      if (sortBy === 'popular') {
        const scoreA =
          Object.values(a.reactions).reduce((sum, value) => sum + value, 0) +
          a.comments +
          a.shares +
          a.views / 10;
        const scoreB =
          Object.values(b.reactions).reduce((sum, value) => sum + value, 0) +
          b.comments +
          b.shares +
          b.views / 10;
        return scoreB - scoreA;
      }

      return b.id.localeCompare(a.id);
    });

    return nextPosts;
  }, [deferredSearch, filter, posts, sortBy]);

  const handleCreatePost = useCallback(
    (payload: {
      content: string;
      audience: Visibility;
      attachments: ComposerAttachment[];
      type: FeedFilter;
      poll?: { options: string[] };
    }) => {
      const normalizedPollOptions =
        payload.type === 'poll' && payload.poll?.options?.length
          ? payload.poll.options.map((option, index) => ({
              id: `dynamic-poll-${Date.now()}-${index + 1}`,
              label: option,
              votes: 0,
            }))
          : undefined;

      const newPost: FeedPost = {
        id: `post-${Date.now()}`,
        type: payload.type,
        author: {
          name: 'You',
          role: 'Enterprise User',
          department: 'Social Workspace',
          avatar: 'YU',
        },
        content: payload.content,
        createdAt: 'এখনই',
        audience: payload.audience,
        attachments: payload.attachments,
        tags: ['New'],
        mediaCount: payload.attachments.length,
        reactions: {
          like: 0,
          celebrate: 0,
          support: 0,
          insightful: 0,
        },
        comments: 0,
        shares: 0,
        views: 1,
        voted: null,
        poll:
          payload.type === 'poll'
            ? {
                totalVotes: 0,
                options:
                  normalizedPollOptions && normalizedPollOptions.length > 1
                    ? normalizedPollOptions
                    : [
                        { id: `dynamic-poll-${Date.now()}-1`, label: 'Option 1', votes: 0 },
                        { id: `dynamic-poll-${Date.now()}-2`, label: 'Option 2', votes: 0 },
                      ],
              }
            : undefined,
      };

      setPosts((prev) => [newPost, ...prev]);
      setStats((prev) =>
        prev.map((stat) =>
          stat.id === 'posts'
            ? {
                ...stat,
                value: `${Number.parseInt(stat.value, 10) + 1}`,
                delta: '+1',
              }
            : stat
        )
      );
    },
    []
  );

  const handleReact = useCallback((postId: string, type: ReactionType) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              reactions: {
                ...post.reactions,
                [type]: post.reactions[type] + 1,
              },
            }
          : post
      )
    );
  }, []);

  const handleVote = useCallback((postId: string, optionId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId || !post.poll || post.voted) return post;

        return {
          ...post,
          voted: optionId,
          poll: {
            totalVotes: post.poll.totalVotes + 1,
            options: post.poll.options.map((option) =>
              option.id === optionId ? { ...option, votes: option.votes + 1 } : option
            ),
          },
        };
      })
    );
  }, []);

  return (
    <Shell>
      <div className="space-y-6">
        <Header />
        <StatGrid stats={stats} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          <Composer onCreatePost={handleCreatePost} />

          <div className="space-y-6">
            <ActivityChart />
            <InsightsPanel />
          </div>
        </div>

        <FilterToolbar
          filter={filter}
          setFilter={setFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          search={search}
          setSearch={setSearch}
        />

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <div className="space-y-4">
            {isFeedLoading ? (
              <SkeletonFeed />
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <FeedCard key={post.id} post={post} onReact={handleReact} onVote={handleVote} />
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/65">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
                  কোন matching feed পাওয়া যায়নি
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Search, filter অথবা sort change করে আবার দেখুন।
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <FeedTable posts={filteredPosts} />

            <div className="rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)] backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/75">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Governance Pulse</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Enterprise-grade communication quality indicators
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Healthy
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Policy-safe posts', value: '98.7%' },
                  { label: 'Cross-team reach', value: '76.2%' },
                  { label: 'Leadership visibility', value: '91.4%' },
                  { label: 'Actionable updates', value: '88.1%' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500"
                        style={{ width: item.value }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
