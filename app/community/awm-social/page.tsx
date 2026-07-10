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
type SortOption = 'latest' | 'popular' | 'engaging';
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
  id: string;
  name: string;
  handle: string;
  role: string;
  department: string;
  avatar: string;
  avatarImageSrc?: string | null;
  verified?: boolean;
  followers?: number;
  following?: number;
};
type CommentItem = {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  avatarImageSrc?: string | null;
  role: string;
  text: string;
  createdAt: string;
  liked?: boolean;
};
type FeedPost = {
  id: string;
  type: Exclude<FeedFilter, 'all'>;
  author: Author;
  content: string;
  createdAt: string;
  audience: Visibility;
  pinned?: boolean;
  featured?: boolean;
  mediaCount?: number;
  attachments?: ComposerAttachment[];
  tags?: string[];
  reactions: Record<ReactionType, number>;
  comments: number;
  shares: number;
  views: number;
  voted?: string | null;
  likedReaction?: ReactionType | null;
  saved?: boolean;
  followedAuthor?: boolean;
  commentThread?: CommentItem[];
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
type TrendingTopic = {
  id: string;
  title: string;
  posts: number;
  trend: string;
};
type SuggestedProfile = {
  id: string;
  name: string;
  handle: string;
  role: string;
  department: string;
  avatar: string;
  mutual: number;
  following: boolean;
};
type ComposerPayload = {
  content: string;
  type: Exclude<FeedFilter, 'all'>;
  audience: Visibility;
  attachments: ComposerAttachment[];
  tags: string[];
  pollOptions?: string[];
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
  { value: 'popular', label: 'জনপ্রিয়' },
  { value: 'engaging', label: 'High Signal' },
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
    activeClass: 'bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-400/30',
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
    activeClass: 'bg-[#d4af37]/15 text-[#f4d160] ring-1 ring-inset ring-[#d4af37]/40',
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
    activeClass: 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-400/30',
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
    activeClass: 'bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-400/30',
  },
};
const initialStats: StatCard[] = [
  { id: 'reach', label: 'Weekly Reach', value: '18.4K', delta: '+22.4%', positive: true },
  { id: 'engagement', label: 'Engagement Rate', value: '91.2%', delta: '+9.7%', positive: true },
  { id: 'posts', label: 'Published Today', value: '34', delta: '+7', positive: true },
  { id: 'response', label: 'Avg. Response Time', value: '8m', delta: '-4m', positive: true },
];
const initialTrending: TrendingTopic[] = [
  { id: 't1', title: '#Q3ExecutionRoom', posts: 84, trend: '+18%' },
  { id: 't2', title: '#PayrollAutomation', posts: 31, trend: '+11%' },
  { id: 't3', title: '#LeadershipSignal', posts: 19, trend: '+9%' },
  { id: 't4', title: '#OpsWarRoom', posts: 27, trend: '+23%' },
];
const initialSuggestions: SuggestedProfile[] = [
  {
    id: 's1',
    name: 'Farzana Kabir',
    handle: '@farzana.ops',
    role: 'Operations Excellence Lead',
    department: 'Operations',
    avatar: 'FK',
    mutual: 14,
    following: false,
  },
  {
    id: 's2',
    name: 'Imran Sadiq',
    handle: '@imran.finance',
    role: 'Finance Controller',
    department: 'Finance',
    avatar: 'IS',
    mutual: 8,
    following: false,
  },
  {
    id: 's3',
    name: 'Shafiq Noor',
    handle: '@shafiq.cx',
    role: 'Customer Success Manager',
    department: 'CX',
    avatar: 'SN',
    mutual: 21,
    following: true,
  },
];
const viewerProfile: Author = {
  id: 'viewer-1',
  name: 'You',
  handle: '@awm.admin',
  role: 'Enterprise Social Admin',
  department: 'Social Workspace',
  avatar: 'YU',
  verified: true,
  followers: 284,
  following: 119,
};
const initialPosts: FeedPost[] = [
  {
    id: 'post-1',
    type: 'announcement',
    author: {
      id: 'u1',
      name: 'Nadia Rahman',
      handle: '@nadia.ops',
      role: 'Chief Operations Officer',
      department: 'Operations',
      avatar: 'NR',
      verified: true,
      followers: 4800,
      following: 218,
    },
    content:
      'Q3 execution room এখন লাইভ। সব department lead-দের daily blocker update 4:00 PM এর আগে শেয়ার করতে অনুরোধ করা হচ্ছে। New cross-functional escalation matrix dashboard enterprise control center-এ publish করা হয়েছে।',
    createdAt: '12 মিনিট আগে',
    audience: 'everyone',
    pinned: true,
    featured: true,
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
    followedAuthor: true,
    likedReaction: null,
    saved: false,
    commentThread: [
      {
        id: 'c1',
        author: 'Faisal Mahmud',
        handle: '@faisal.data',
        avatar: 'FM',
        role: 'Data Lead',
        text: 'Signal dashboard sync হয়ে গেছে। 4 PM আগে final snapshot পোস্ট করব।',
        createdAt: '9 মিনিট আগে',
      },
      {
        id: 'c2',
        author: 'Tanvir Hasan',
        handle: '@tanvir.ops',
        avatar: 'TH',
        role: 'Regional Ops Manager',
        text: 'Escalation matrix খুব clear হয়েছে। team adoption সহজ হবে।',
        createdAt: '6 মিনিট আগে',
      },
    ],
    attachments: [
      { id: 'att-1', name: 'Q3-escalation-matrix.pdf', size: '2.4 MB', type: 'file' },
      { id: 'att-2', name: 'war-room-brief.png', size: '860 KB', type: 'image' },
    ],
  },
  {
    id: 'post-2',
    type: 'recognition',
    author: {
      id: 'u2',
      name: 'Arafat Hossain',
      handle: '@arafat.hr',
      role: 'HR Business Partner',
      department: 'People & Culture',
      avatar: 'AH',
      followers: 1200,
      following: 98,
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
    followedAuthor: false,
    likedReaction: 'celebrate',
    saved: true,
    commentThread: [
      {
        id: 'c3',
        author: 'Raihan Karim',
        handle: '@raihan.cs',
        avatar: 'RK',
        role: 'Customer Success Lead',
        text: 'ধন্যবাদ। next sprint-এ আরো automation আনছি।',
        createdAt: '17 মিনিট আগে',
      },
    ],
  },
  {
    id: 'post-3',
    type: 'poll',
    author: {
      id: 'u3',
      name: 'Samira Khan',
      handle: '@samira.product',
      role: 'Product Strategy Lead',
      department: 'Product',
      avatar: 'SK',
      verified: true,
      followers: 2500,
      following: 174,
    },
    content:
      'Next enterprise social upgrade-এর জন্য কোন feature team-first impact সবচেয়ে বেশি দেবে?',
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
    followedAuthor: true,
    likedReaction: null,
    saved: false,
    voted: null,
    commentThread: [
      {
        id: 'c4',
        author: 'Mahin Islam',
        handle: '@mahin.finance',
        avatar: 'MI',
        role: 'Finance Process Owner',
        text: 'Department-wise signal dashboard হলে leadership visibility বাড়বে।',
        createdAt: '28 মিনিট আগে',
      },
    ],
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
      id: 'u4',
      name: 'Mahin Islam',
      handle: '@mahin.finance',
      role: 'Finance Process Owner',
      department: 'Finance',
      avatar: 'MI',
      followers: 980,
      following: 84,
    },
    content:
      'Finance approval queue-এর premium review panel update হয়েছে। New smart batching logic high-value invoice approvals 19% দ্রুত process করছে।',
    createdAt: '2 ঘন্টা আগে',
    audience: 'leadership',
    tags: ['Finance', 'Approval', 'Automation'],
    reactions: {
      like: 66,
      celebrate: 18,
      support: 14,
      insightful: 23,
    },
    comments: 12,
    shares: 5,
    views: 812,
    followedAuthor: false,
    likedReaction: 'insightful',
    saved: false,
    commentThread: [],
    attachments: [{ id: 'att-3', name: 'approval-queue-report.xlsx', size: '1.1 MB', type: 'file' }],
  },
];
const pageLink = '/enterprise-social';
const smsPageLink = '/sms-advanced';
 
const topWorkspaceTabs = [
  {
    id: 'social',
    label: 'AWM Enterprise Social',
    shortLabel: 'Social',
    href: pageLink,
    active: true,
    tone: 'from-[#1a1c26] via-[#111319] to-[#0b0c11] text-[#f4d160] ring-1 ring-inset ring-[#d4af37]/30 shadow-lg shadow-black/40',
    dot: 'bg-[#f4d160]',
  },
  {
    id: 'sms',
    label: 'AWM SMS Advanced',
    shortLabel: 'SMS',
    href: smsPageLink,
    active: false,
    tone: 'from-[#0b0c11] via-[#111319] to-[#1a1c26] text-slate-300 ring-1 ring-inset ring-white/10 shadow-lg shadow-black/40',
    dot: 'bg-slate-500',
  },
] as const;
 
function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}
function formatCompactNumber(value: number) {
  return Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
function calculateEngagement(post: FeedPost) {
  const totalReactions = Object.values(post.reactions).reduce((sum, value) => sum + value, 0);
  return totalReactions + post.comments + post.shares + Math.round(post.views / 10);
}
function randomId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
function relativeNowLabel() {
  return 'এইমাত্র';
}
function getAudienceTone(audience: Visibility) {
  if (audience === 'team') return 'টিম ভিজিবিলিটি';
  if (audience === 'leadership') return 'Leadership only';
  return 'Org wide';
}
function getAttachmentBadge(type: ComposerAttachment['type']) {
  if (type === 'image') return 'Image';
  if (type === 'video') return 'Video';
  return 'File';
}
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '');
  return initials.join('') || 'U';
}
const PillButton = memo(function PillButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-2 text-sm font-bold transition-all duration-200',
        active
          ? 'bg-gradient-to-r from-[#f4d160] via-[#d4af37] to-[#b8860b] text-slate-950 shadow-lg shadow-black/40'
          : 'bg-white/[0.03] text-slate-400 ring-1 ring-inset ring-white/10 hover:bg-white/[0.06] hover:text-slate-100',
      )}
    >
      {children}
    </button>
  );
});
const AvatarBadge = memo(function AvatarBadge({
  value,
  imageSrc,
  size = 'md',
  ringed,
}: {
  value: string;
  imageSrc?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ringed?: boolean;
}) {
  const classes =
    size === 'sm'
      ? 'h-9 w-9 text-xs rounded-xl'
      : size === 'lg'
      ? 'h-14 w-14 text-base rounded-2xl'
      : size === 'xl'
      ? 'h-24 w-24 text-2xl rounded-[26px]'
      : 'h-12 w-12 text-sm rounded-2xl';
  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-[#1c1f2b] to-[#0a0b10] font-black text-[#f4d160] shadow-lg shadow-black/40',
        ringed && 'ring-2 ring-[#d4af37]/50 ring-offset-2 ring-offset-[#08090d]',
        classes,
      )}
    >
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageSrc} alt={value} className="h-full w-full object-cover" />
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
});
const WorkspaceTopTabs = memo(function WorkspaceTopTabs() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 sm:mb-5">
      {topWorkspaceTabs.map((tab) => (
        <a
          key={tab.id}
          href={tab.href}
          className={cn(
            'group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r px-4 py-3 text-sm font-black tracking-tight transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50',
            tab.tone,
          )}
        >
          <span className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-white/5" />
          <span
            className={cn(
              'relative inline-flex h-2.5 w-2.5 rounded-full shadow-[0_0_16px_rgba(212,175,55,0.5)]',
              tab.dot,
            )}
          />
          <span className="relative flex items-center gap-2">
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </span>
 
          {tab.id === 'sms' && (
            <span className="relative rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 ring-1 ring-inset ring-white/10">
              Messenger View
            </span>
          )}
 
          {tab.active && (
            <span className="relative rounded-full bg-[#d4af37]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f4d160] ring-1 ring-inset ring-[#d4af37]/30">
              Active
            </span>
          )}
        </a>
      ))}
    </div>
  );
});
 
function EnterpriseSocialPage() {
  const pageId = useId();
  const commentInputRef = useRef<HTMLInputElement | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [stats] = useState<StatCard[]>(initialStats);
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [trending] = useState<TrendingTopic[]>(initialTrending);
  const [suggestions, setSuggestions] = useState<SuggestedProfile[]>(initialSuggestions);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  const [activeSort, setActiveSort] = useState<SortOption>('latest');
  const [search, setSearch] = useState('');
  const [composerText, setComposerText] = useState('');
  const [composerType, setComposerType] = useState<Exclude<FeedFilter, 'all'>>('update');
  const [composerAudience, setComposerAudience] = useState<Visibility>('everyone');
  const [composerTags, setComposerTags] = useState('Enterprise, Update');
  const [composerPollEnabled, setComposerPollEnabled] = useState(false);
  const [composerPollA, setComposerPollA] = useState('Option A');
  const [composerPollB, setComposerPollB] = useState('Option B');
  const [composerPollC, setComposerPollC] = useState('');
  const [draftSavedAt, setDraftSavedAt] = useState('Just now');
  const [followedProfiles, setFollowedProfiles] = useState<Record<string, boolean>>({
    s1: false,
    s2: false,
    s3: true,
  });
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([
    { id: 'new-1', name: 'team-update-brief.pdf', size: '1.8 MB', type: 'file' },
  ]);
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [bannerExpanded, setBannerExpanded] = useState(false);
 
  // ---- VIP profile identity state (name + photo are fully editable) ----
  const [viewerName, setViewerName] = useState(viewerProfile.name);
  const [viewerAvatarSrc, setViewerAvatarSrc] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(viewerProfile.name);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarUploadedAt, setAvatarUploadedAt] = useState<string | null>(null);
 
  const deferredSearch = useDeferredValue(search);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDraftSavedAt('Auto-saved 3s ago');
    }, 900);
    return () => window.clearTimeout(timer);
  }, [composerText, composerAudience, composerType, composerTags, composerPollA, composerPollB, composerPollC]);
  useEffect(() => {
    if (openCommentPostId && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [openCommentPostId]);
  useEffect(() => {
    if (!shareCopied) return;
    const timer = window.setTimeout(() => setShareCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [shareCopied]);
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);
  const totalNetworkFollowers = useMemo(() => {
    return posts.reduce((sum, post) => sum + (post.author.followers ?? 0), 0);
  }, [posts]);
  const publishedToday = useMemo(() => {
    return posts.filter((post) => post.createdAt.includes('আগে') || post.createdAt === 'এইমাত্র').length;
  }, [posts]);
  const filteredPosts = useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase();
    let result = posts.filter((post) => {
      const filterMatched = activeFilter === 'all' ? true : post.type === activeFilter;
      const haystack = [
        post.author.name,
        post.author.handle,
        post.author.role,
        post.author.department,
        post.content,
        ...(post.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();
      const searchMatched = keyword ? haystack.includes(keyword) : true;
      return filterMatched && searchMatched;
    });
    result = [...result].sort((a, b) => {
      if (activeSort === 'latest') {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.id.localeCompare(a.id);
      }
      if (activeSort === 'engaging') {
        return calculateEngagement(b) - calculateEngagement(a);
      }
      const aScore = Object.values(a.reactions).reduce((sum, value) => sum + value, 0) + a.comments + a.shares + a.views / 10;
      const bScore = Object.values(b.reactions).reduce((sum, value) => sum + value, 0) + b.comments + b.shares + b.views / 10;
      return bScore - aScore;
    });
    return result;
  }, [activeFilter, activeSort, deferredSearch, posts]);
  const highlightedPost = filteredPosts[0] ?? null;
  const feedMetrics = useMemo(() => {
    const reactionTotal = posts.reduce(
      (sum, post) => sum + Object.values(post.reactions).reduce((inner, value) => inner + value, 0),
      0,
    );
    const commentTotal = posts.reduce((sum, post) => sum + post.comments, 0);
    const shareTotal = posts.reduce((sum, post) => sum + post.shares, 0);
    const viewTotal = posts.reduce((sum, post) => sum + post.views, 0);
    return {
      reactionTotal,
      commentTotal,
      shareTotal,
      viewTotal,
      savedCount: posts.filter((post) => post.saved).length,
    };
  }, [posts]);
 
  // ---- Profile picture upload with live preview ----
  const handleAvatarButtonClick = useCallback(() => {
    avatarFileInputRef.current?.click();
  }, []);
  const handleAvatarFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('শুধু image file আপলোড করা যাবে (PNG, JPG, WEBP)।');
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setAvatarError('Image size 6MB এর মধ্যে হতে হবে।');
      return;
    }
    setAvatarError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setViewerAvatarSrc(reader.result);
        setAvatarUploadedAt('Just now');
      }
    };
    reader.onerror = () => setAvatarError('Image load করা যায়নি, আবার চেষ্টা করুন।');
    reader.readAsDataURL(file);
  }, []);
  const handleRemoveAvatar = useCallback(() => {
    setViewerAvatarSrc(null);
    setAvatarUploadedAt(null);
    setAvatarError(null);
  }, []);
 
  // ---- Name editing ----
  const startEditingName = useCallback(() => {
    setNameDraft(viewerName);
    setIsEditingName(true);
  }, [viewerName]);
  const cancelEditingName = useCallback(() => {
    setNameDraft(viewerName);
    setIsEditingName(false);
  }, [viewerName]);
  const commitNameChange = useCallback(() => {
    const trimmed = nameDraft.trim();
    if (trimmed) {
      setViewerName(trimmed);
    }
    setIsEditingName(false);
  }, [nameDraft]);
 
  const createPost = useCallback(
    (payload: ComposerPayload) => {
      const tagList = payload.tags
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => (tag.startsWith('#') ? tag.slice(1) : tag));
      const nextPost: FeedPost = {
        id: randomId('post'),
        type: payload.type,
        author: {
          ...viewerProfile,
          name: viewerName,
          avatar: getInitials(viewerName),
          avatarImageSrc: viewerAvatarSrc,
        },
        content: payload.content.trim(),
        createdAt: relativeNowLabel(),
        audience: payload.audience,
        featured: payload.type === 'announcement',
        pinned: false,
        mediaCount: payload.attachments.length,
        attachments: payload.attachments,
        tags: tagList,
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
        likedReaction: null,
        followedAuthor: true,
        saved: false,
        commentThread: [],
        poll:
          payload.type === 'poll' && payload.pollOptions && payload.pollOptions.length >= 2
            ? {
                totalVotes: 0,
                options: payload.pollOptions.map((label) => ({
                  id: randomId('poll'),
                  label,
                  votes: 0,
                })),
              }
            : undefined,
      };
      setPosts((current) => [nextPost, ...current]);
    },
    [viewerAvatarSrc, viewerName],
  );
  const handlePublish = useCallback(() => {
    const content = composerText.trim();
    if (!content) return;
    const tags = composerTags.split(',').map((item) => item.trim());
    createPost({
      content,
      type: composerPollEnabled ? 'poll' : composerType,
      audience: composerAudience,
      attachments,
      tags,
      pollOptions: composerPollEnabled
        ? [composerPollA, composerPollB, composerPollC].map((item) => item.trim()).filter(Boolean)
        : undefined,
    });
    setComposerText('');
    setComposerType('update');
    setComposerAudience('everyone');
    setComposerTags('Enterprise, Update');
    setComposerPollEnabled(false);
    setComposerPollA('Option A');
    setComposerPollB('Option B');
    setComposerPollC('');
    setAttachments([]);
    setDraftSavedAt('Just now');
  }, [
    attachments,
    composerAudience,
    composerPollA,
    composerPollB,
    composerPollC,
    composerPollEnabled,
    composerTags,
    composerText,
    composerType,
    createPost,
  ]);
  const handleReaction = useCallback((postId: string, reaction: ReactionType) => {
    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) return post;
        const previous = post.likedReaction;
        if (previous === reaction) {
          return {
            ...post,
            likedReaction: null,
            reactions: {
              ...post.reactions,
              [reaction]: Math.max(0, post.reactions[reaction] - 1),
            },
          };
        }
        const nextReactions = { ...post.reactions };
        if (previous) {
          nextReactions[previous] = Math.max(0, nextReactions[previous] - 1);
        }
        nextReactions[reaction] = nextReactions[reaction] + 1;
        return {
          ...post,
          likedReaction: reaction,
          reactions: nextReactions,
        };
      }),
    );
  }, []);
  const handleVote = useCallback((postId: string, optionId: string) => {
    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId || !post.poll) return post;
        if (post.voted) return post;
        return {
          ...post,
          voted: optionId,
          poll: {
            ...post.poll,
            totalVotes: post.poll.totalVotes + 1,
            options: post.poll.options.map((option) =>
              option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
            ),
          },
        };
      }),
    );
  }, []);
  const handleToggleSave = useCallback((postId: string) => {
    setPosts((current) =>
      current.map((post) => (post.id === postId ? { ...post, saved: !post.saved } : post)),
    );
  }, []);
  const handleFollowAuthor = useCallback((authorId: string) => {
    setPosts((current) =>
      current.map((post) =>
        post.author.id === authorId
          ? {
              ...post,
              followedAuthor: !post.followedAuthor,
              author: {
                ...post.author,
                followers: Math.max(0, (post.author.followers ?? 0) + (post.followedAuthor ? -1 : 1)),
              },
            }
          : post,
      ),
    );
  }, []);
  const handleAddComment = useCallback(
    (postId: string) => {
      const value = (commentDrafts[postId] ?? '').trim();
      if (!value) return;
      setPosts((current) =>
        current.map((post) => {
          if (post.id !== postId) return post;
          const nextComment: CommentItem = {
            id: randomId('comment'),
            author: viewerName,
            handle: viewerProfile.handle,
            avatar: getInitials(viewerName),
            avatarImageSrc: viewerAvatarSrc,
            role: viewerProfile.role,
            text: value,
            createdAt: 'এইমাত্র',
          };
          return {
            ...post,
            comments: post.comments + 1,
            commentThread: [nextComment, ...(post.commentThread ?? [])],
          };
        }),
      );
      setCommentDrafts((current) => ({ ...current, [postId]: '' }));
    },
    [commentDrafts, viewerAvatarSrc, viewerName],
  );
  const handleSuggestedFollow = useCallback((profileId: string) => {
    setFollowedProfiles((current) => ({
      ...current,
      [profileId]: !current[profileId],
    }));
    setSuggestions((current) =>
      current.map((profile) =>
        profile.id === profileId ? { ...profile, following: !profile.following } : profile,
      ),
    );
  }, []);
  const handleShare = useCallback((postId: string) => {
    setPosts((current) =>
      current.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post)),
    );
    setSharePostId(postId);
  }, []);
  const handleCopyShareLink = useCallback(async () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${pageLink}` : pageLink;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
    } catch {
      setShareCopied(false);
    }
  }, []);
  const addDemoAttachment = useCallback((type: ComposerAttachment['type']) => {
    const next: ComposerAttachment = {
      id: randomId('att'),
      name:
        type === 'image'
          ? 'enterprise-banner-preview.png'
          : type === 'video'
          ? 'leadership-message.mp4'
          : 'social-guideline-v2.pdf',
      size: type === 'image' ? '920 KB' : type === 'video' ? '14.2 MB' : '1.3 MB',
      type,
    };
    setAttachments((current) => [next, ...current]);
  }, []);
  return (
    <div className="min-h-screen bg-[#07070b] text-slate-100 [color-scheme:dark]">
      <div
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 8%, rgba(212,175,55,0.10), transparent 32%), radial-gradient(circle at 88% 0%, rgba(212,175,55,0.06), transparent 28%), radial-gradient(circle at 50% 100%, rgba(212,175,55,0.05), transparent 40%)',
        }}
      />
      <div className="relative mx-auto max-w-[1680px] px-4 py-6 sm:px-6 xl:px-8">
        <WorkspaceTopTabs />
        <header className="overflow-hidden rounded-[32px] border border-white/[0.06] bg-[#0b0c11]/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div
            className={cn(
              'relative overflow-hidden border-b border-white/[0.06] transition-all duration-500',
              bannerExpanded ? 'h-[320px]' : 'h-[230px]',
            )}
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#05050a_0%,#111319_38%,#1a1c26_68%,#05050a_100%)]" />
            <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_18%_20%,rgba(212,175,55,0.16)_0,transparent_24%),radial-gradient(circle_at_82%_12%,rgba(212,175,55,0.10)_0,transparent_20%),radial-gradient(circle_at_65%_85%,rgba(212,175,55,0.08)_0,transparent_20%)]" />
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(115deg, rgba(212,175,55,0.6) 0px, rgba(212,175,55,0.6) 1px, transparent 1px, transparent 64px)',
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07070b] to-transparent" />
            <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2 text-xs font-bold tracking-[0.24em] text-[#f4d160] ring-1 ring-inset ring-[#d4af37]/30 backdrop-blur-md">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#f4d160] shadow-[0_0_20px_rgba(244,209,96,0.9)]" />
                  AWM ENTERPRISE SOCIAL &middot; VIP
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBannerExpanded((current) => !current)}
                    className="rounded-full bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200 ring-1 ring-inset ring-white/10 backdrop-blur transition hover:bg-white/[0.08]"
                  >
                    {bannerExpanded ? 'Minimize Banner' : 'Expand Banner'}
                  </button>
                  <div className="rounded-full bg-black/30 px-4 py-2 text-sm font-semibold text-slate-300 ring-1 ring-inset ring-white/10 backdrop-blur">
                    Link: <span className="font-black text-[#f4d160]">{pageLink}</span>
                  </div>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
                <div>
                  <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white sm:text-4xl xl:text-5xl">
                    Premium enterprise social workspace for leadership signals, team momentum, and high-trust internal collaboration.
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300/90 sm:text-base">
                    Unified feed, advanced engagement, executive communication, recognitions, polls, smart visibility, and premium community experience in one modern social command center.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricGlass label="Network Reach" value={formatCompactNumber(totalNetworkFollowers)} />
                  <MetricGlass label="Published Today" value={String(publishedToday)} />
                  <MetricGlass label="Saved Posts" value={String(feedMetrics.savedCount)} />
                </div>
              </div>
            </div>
          </div>
          <div className="relative px-6 pb-6 sm:px-8">
            <div className="-mt-12 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <section className="rounded-[30px] border border-white/[0.06] bg-[#0d0e14]/95 p-5 shadow-xl shadow-black/40 backdrop-blur sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-start gap-4">
                    {/* --- Profile picture: upload trigger + live preview --- */}
                    <div className="relative">
                      <AvatarBadge
                        value={getInitials(viewerName)}
                        imageSrc={viewerAvatarSrc}
                        size="xl"
                        ringed
                      />
                      <button
                        type="button"
                        onClick={handleAvatarButtonClick}
                        aria-label="প্রোফাইল ছবি আপলোড করুন"
                        className="group absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f4d160] via-[#d4af37] to-[#b8860b] text-slate-950 shadow-lg shadow-black/50 ring-4 ring-[#0d0e14] transition hover:scale-105"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <path
                            d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.4l.9-1.5A1.5 1.5 0 0 1 10.09 4.7h3.82a1.5 1.5 0 0 1 1.29.75L16.1 7h2.4A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="13" r="3.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <input
                        ref={avatarFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="pt-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {isEditingName ? (
                          <div className="flex items-center gap-2">
                            <input
                              ref={nameInputRef}
                              value={nameDraft}
                              onChange={(event) => setNameDraft(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  commitNameChange();
                                }
                                if (event.key === 'Escape') {
                                  event.preventDefault();
                                  cancelEditingName();
                                }
                              }}
                              maxLength={48}
                              placeholder="আপনার নাম লিখুন"
                              aria-label="Profile name"
                              className="w-56 rounded-xl border-0 bg-white/[0.05] px-3 py-2 text-xl font-black tracking-tight text-white outline-none ring-1 ring-inset ring-[#d4af37]/40 placeholder:text-slate-500 focus:ring-2 focus:ring-[#d4af37] sm:w-72"
                            />
                            <button
                              type="button"
                              onClick={commitNameChange}
                              aria-label="Save name"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f4d160] via-[#d4af37] to-[#b8860b] text-slate-950 shadow-md transition hover:-translate-y-0.5"
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditingName}
                              aria-label="Cancel"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-slate-300 ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.08]"
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <>
                            <h2 className="text-2xl font-black tracking-tight text-white">{viewerName}</h2>
                            <button
                              type="button"
                              onClick={startEditingName}
                              aria-label="Edit profile name"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400 ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.08] hover:text-[#f4d160]"
                            >
                              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                <path
                                  d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                        <span className="rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-bold text-[#f4d160] ring-1 ring-inset ring-[#d4af37]/30">
                          Verified
                        </span>
                        <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-bold text-slate-400 ring-1 ring-inset ring-white/10">
                          {viewerProfile.handle}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-400">
                        {viewerProfile.role} &middot; {viewerProfile.department}
                      </p>
                      {(avatarError || avatarUploadedAt) && (
                        <p className={cn('mt-1 text-xs font-semibold', avatarError ? 'text-rose-400' : 'text-emerald-400')}>
                          {avatarError ?? `Profile ছবি আপডেট হয়েছে &middot; ${avatarUploadedAt}`}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                        <QuickStat label="Followers" value={String(viewerProfile.followers ?? 0)} />
                        <QuickStat label="Following" value={String(viewerProfile.following ?? 0)} />
                        <QuickStat label="Engagement Tier" value="Elite" />
                        <QuickStat label="Profile ID" value="AWM-ES-001" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {viewerAvatarSrc && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="rounded-2xl bg-white/[0.04] px-5 py-3 text-sm font-black text-slate-300 ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.08]"
                      >
                        Remove Photo
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAvatarButtonClick}
                      className="rounded-2xl bg-white/[0.04] px-5 py-3 text-sm font-black text-slate-100 ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.08]"
                    >
                      Upload Photo
                    </button>
                    <button
                      type="button"
                      onClick={isEditingName ? commitNameChange : startEditingName}
                      className="rounded-2xl bg-gradient-to-r from-[#f4d160] via-[#d4af37] to-[#b8860b] px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-black/40 transition hover:-translate-y-0.5"
                    >
                      {isEditingName ? 'Save Name' : 'Edit Name'}
                    </button>
                  </div>
                </div>
              </section>
              <section className="rounded-[30px] border border-white/[0.06] bg-[#0d0e14]/95 p-5 shadow-xl shadow-black/40 backdrop-blur sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Workspace Route</p>
                    <h3 className="mt-2 text-lg font-black text-white">{pageLink}</h3>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                    Ready UI
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <InfoChip label="Stack" value="Next.js + TS" />
                  <InfoChip label="UI Status" value="VIP Premium" />
                  <InfoChip label="Theme" value="Elite Dark & Gold" />
                  <InfoChip label="Feed Mode" value="Interactive" />
                </div>
              </section>
            </div>
          </div>
        </header>
        <section className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          <aside className="space-y-6">
            <CardShell>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Signal Metrics</p>
                  <h3 className="mt-2 text-lg font-black text-white">Performance Overview</h3>
                </div>
                <PulseDot />
              </div>
              <div className="mt-5 grid gap-3">
                {stats.map((stat) => (
                  <div
                    key={stat.id}
                    className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-inset ring-white/[0.06]"
                  >
                    <p className="text-sm font-semibold text-slate-400">{stat.label}</p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <p className="text-2xl font-black tracking-tight text-white">{stat.value}</p>
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-black ring-1 ring-inset',
                          stat.positive
                            ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/30'
                            : 'bg-rose-500/10 text-rose-300 ring-rose-400/30',
                        )}
                      >
                        {stat.delta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardShell>
            <CardShell>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Trending</p>
              <h3 className="mt-2 text-lg font-black text-white">Live Momentum</h3>
              <div className="mt-4 space-y-3">
                {trending.map((topic) => (
                  <div
                    key={topic.id}
                    className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-inset ring-white/[0.06] transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-white">{topic.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{topic.posts} posts active</p>
                      </div>
                      <span className="rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-black text-[#f4d160] ring-1 ring-inset ring-[#d4af37]/30">
                        {topic.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardShell>
          </aside>
          <main className="space-y-6">
            <CardShell>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Create Signal</p>
                  <h2 className="mt-2 text-xl font-black text-white">Compose premium enterprise post</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Draft status: <span className="font-bold text-slate-200">{draftSavedAt}</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addDemoAttachment('image')}
                    className="rounded-2xl bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-200 ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.08]"
                  >
                    Add Image
                  </button>
                  <button
                    type="button"
                    onClick={() => addDemoAttachment('video')}
                    className="rounded-2xl bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-200 ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.08]"
                  >
                    Add Video
                  </button>
                  <button
                    type="button"
                    onClick={() => addDemoAttachment('file')}
                    className="rounded-2xl bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-200 ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.08]"
                  >
                    Add File
                  </button>
                </div>
              </div>
              <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_340px]">
                <div className="space-y-4">
                  <textarea
                    value={composerText}
                    onChange={(event) => setComposerText(event.target.value)}
                    rows={6}
                    placeholder="আপনার enterprise update, recognition, leadership note, বা team signal লিখুন..."
                    className="w-full rounded-[24px] border-0 bg-white/[0.03] px-5 py-4 text-sm leading-7 text-slate-100 outline-none ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-[#d4af37]"
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                        Post Type
                      </label>
                      <select
                        value={composerPollEnabled ? 'poll' : composerType}
                        onChange={(event) => {
                          const next = event.target.value as FeedFilter;
                          if (next === 'poll') {
                            setComposerPollEnabled(true);
                          } else {
                            setComposerPollEnabled(false);
                            setComposerType(next as Exclude<FeedFilter, 'all'>);
                          }
                        }}
                        className="w-full rounded-2xl border-0 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-100 outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-[#d4af37]"
                      >
                        <option className="bg-[#0d0e14]" value="update">Update</option>
                        <option className="bg-[#0d0e14]" value="announcement">Announcement</option>
                        <option className="bg-[#0d0e14]" value="recognition">Recognition</option>
                        <option className="bg-[#0d0e14]" value="poll">Poll</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                        Visibility
                      </label>
                      <select
                        value={composerAudience}
                        onChange={(event) => setComposerAudience(event.target.value as Visibility)}
                        className="w-full rounded-2xl border-0 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-100 outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-[#d4af37]"
                      >
                        {visibilityOptions.map((option) => (
                          <option className="bg-[#0d0e14]" key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                      Tags
                    </label>
                    <input
                      value={composerTags}
                      onChange={(event) => setComposerTags(event.target.value)}
                      placeholder="Enterprise, Leadership, Update"
                      className="w-full rounded-2xl border-0 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-100 outline-none ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-[#d4af37]"
                    />
                  </div>
                  {composerPollEnabled && (
                    <div className="rounded-[24px] bg-white/[0.03] p-4 ring-1 ring-inset ring-white/10">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-black text-white">Poll options</p>
                        <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-300 ring-1 ring-inset ring-violet-400/30">
                          Interactive
                        </span>
                      </div>
                      <div className="grid gap-3">
                        <input
                          value={composerPollA}
                          onChange={(event) => setComposerPollA(event.target.value)}
                          className="w-full rounded-2xl border-0 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-100 outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-[#d4af37]"
                        />
                        <input
                          value={composerPollB}
                          onChange={(event) => setComposerPollB(event.target.value)}
                          className="w-full rounded-2xl border-0 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-100 outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-[#d4af37]"
                        />
                        <input
                          value={composerPollC}
                          onChange={(event) => setComposerPollC(event.target.value)}
                          placeholder="Optional third option"
                          className="w-full rounded-2xl border-0 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-100 outline-none ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-[#d4af37]"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handlePublish}
                      className="rounded-2xl bg-gradient-to-r from-[#f4d160] via-[#d4af37] to-[#b8860b] px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-black/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={!composerText.trim()}
                    >
                      Publish Post
                    </button>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
                      {getAudienceTone(composerAudience)}
                    </span>
                  </div>
                </div>
                <div className="rounded-[28px] bg-white/[0.02] p-5 ring-1 ring-inset ring-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-white">Attached assets</p>
                    <span className="text-xs font-bold text-slate-500">{attachments.length} items</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {attachments.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-500">
                        No attachments added yet.
                      </div>
                    ) : (
                      attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-inset ring-white/10"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-white">{attachment.name}</p>
                              <p className="mt-1 text-sm text-slate-400">
                                {attachment.size} &middot; {getAttachmentBadge(attachment.type)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setAttachments((current) => current.filter((item) => item.id !== attachment.id))
                              }
                              className="rounded-full bg-white/[0.05] px-3 py-1 text-xs font-black text-slate-300 transition hover:bg-white/[0.1]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardShell>
            <CardShell>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Feed Controls</p>
                  <h2 className="mt-2 text-xl font-black text-white">Smart discovery and sorting</h2>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-3 xl:max-w-2xl xl:flex-row xl:items-center xl:justify-end">
                  <div className="relative w-full xl:max-w-sm">
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search post, people, tag, department..."
                      className="w-full rounded-2xl border-0 bg-white/[0.03] px-4 py-3 pl-11 text-sm font-medium text-slate-100 outline-none ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-[#d4af37]"
                    />
                    <svg
                      viewBox="0 0 24 24"
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => (
                      <PillButton
                        key={option.value}
                        active={activeFilter === option.value}
                        onClick={() => setActiveFilter(option.value)}
                      >
                        {option.label}
                      </PillButton>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sortOptions.map((option) => (
                      <PillButton
                        key={option.value}
                        active={activeSort === option.value}
                        onClick={() => setActiveSort(option.value)}
                      >
                        {option.label}
                      </PillButton>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <FeedMetricCard label="Reactions" value={formatCompactNumber(feedMetrics.reactionTotal)} />
                <FeedMetricCard label="Comments" value={formatCompactNumber(feedMetrics.commentTotal)} />
                <FeedMetricCard label="Shares" value={formatCompactNumber(feedMetrics.shareTotal)} />
                <FeedMetricCard label="Views" value={formatCompactNumber(feedMetrics.viewTotal)} />
                <FeedMetricCard label="Visible Results" value={String(filteredPosts.length)} />
              </div>
            </CardShell>
            {highlightedPost && (
              <section className="overflow-hidden rounded-[32px] border border-[#d4af37]/20 bg-[linear-gradient(135deg,#0b0c11_0%,#15161d_45%,#0b0c11_100%)] p-6 text-white shadow-2xl shadow-black/50">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#d4af37]/10 px-4 py-2 text-xs font-black tracking-[0.22em] text-[#f4d160] ring-1 ring-inset ring-[#d4af37]/30">
                      FEATURED SIGNAL
                    </div>
                    <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                      {highlightedPost.author.name} &middot; {highlightedPost.type}
                    </h2>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{highlightedPost.content}</p>
                    <div className="mt-5 flex flex-wrap gap-3 text-sm">
                      <GlassBadge value={highlightedPost.author.handle} />
                      <GlassBadge value={highlightedPost.author.department} />
                      <GlassBadge value={getAudienceTone(highlightedPost.audience)} />
                      <GlassBadge value={`${formatCompactNumber(calculateEngagement(highlightedPost))} engagement`} />
                    </div>
                  </div>
                  <div className="grid min-w-[260px] gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <MetricGlass label="Views" value={formatCompactNumber(highlightedPost.views)} />
                    <MetricGlass
                      label="Reactions"
                      value={formatCompactNumber(
                        Object.values(highlightedPost.reactions).reduce((sum, value) => sum + value, 0),
                      )}
                    />
                    <MetricGlass label="Comments" value={formatCompactNumber(highlightedPost.comments)} />
                    <MetricGlass label="Shares" value={formatCompactNumber(highlightedPost.shares)} />
                  </div>
                </div>
              </section>
            )}
            <div className="space-y-5">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  pageId={pageId}
                  post={post}
                  viewerAvatarSrc={viewerAvatarSrc}
                  isCommentsOpen={openCommentPostId === post.id}
                  commentDraft={commentDrafts[post.id] ?? ''}
                  commentInputRef={openCommentPostId === post.id ? commentInputRef : undefined}
                  onReaction={handleReaction}
                  onVote={handleVote}
                  onToggleSave={handleToggleSave}
                  onToggleComments={() =>
                    setOpenCommentPostId((current) => (current === post.id ? null : post.id))
                  }
                  onCommentDraftChange={(value) =>
                    setCommentDrafts((current) => ({ ...current, [post.id]: value }))
                  }
                  onAddComment={() => handleAddComment(post.id)}
                  onShare={() => handleShare(post.id)}
                  onFollowAuthor={() => handleFollowAuthor(post.author.id)}
                />
              ))}
            </div>
          </main>
          <aside className="space-y-6">
            <CardShell>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">For You</p>
              <h3 className="mt-2 text-lg font-black text-white">People suggestions</h3>
              <div className="mt-4 space-y-4">
                {suggestions.map((profile) => (
                  <div
                    key={profile.id}
                    className="rounded-[24px] bg-white/[0.03] p-4 ring-1 ring-inset ring-white/[0.06]"
                  >
                    <div className="flex items-start gap-3">
                      <AvatarBadge value={profile.avatar} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-black text-white">{profile.name}</p>
                        <p className="truncate text-sm text-slate-400">{profile.handle}</p>
                        <p className="mt-1 text-sm text-slate-300">{profile.role}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {profile.department} &middot; {profile.mutual} mutual connections
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSuggestedFollow(profile.id)}
                      className={cn(
                        'mt-4 w-full rounded-2xl px-4 py-3 text-sm font-black transition',
                        followedProfiles[profile.id]
                          ? 'bg-gradient-to-r from-[#f4d160] via-[#d4af37] to-[#b8860b] text-slate-950'
                          : 'bg-white/[0.03] text-slate-200 ring-1 ring-inset ring-white/10 hover:bg-white/[0.07]',
                      )}
                    >
                      {followedProfiles[profile.id] ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </CardShell>
            <CardShell>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Workspace Health</p>
              <h3 className="mt-2 text-lg font-black text-white">Operational signals</h3>
              <div className="mt-4 space-y-3">
                <HealthRow label="Moderation latency" value="Low" positive />
                <HealthRow label="Executive visibility" value="High" positive />
                <HealthRow label="Draft collision risk" value="Stable" positive />
                <HealthRow label="Engagement quality" value="Premium" positive />
              </div>
            </CardShell>
            <CardShell>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Share Access</p>
              <h3 className="mt-2 text-lg font-black text-white">Page route</h3>
              <div className="mt-4 rounded-[24px] bg-white/[0.03] p-4 ring-1 ring-inset ring-white/10">
                <p className="text-sm font-bold text-slate-400">Route</p>
                <p className="mt-2 break-all text-base font-black text-white">{pageLink}</p>
                <p className="mt-3 text-sm text-slate-400">
                  App router page path: <span className="font-bold">app/enterprise-social/page.tsx</span>
                </p>
              </div>
            </CardShell>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <a
                href={smsPageLink}
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-100 ring-1 ring-inset ring-white/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-[#f4d160] shadow-[0_0_16px_rgba(244,209,96,0.9)]" />
                AWM SMS
              </a>
 
              <button
                type="button"
                onClick={() => setBannerExpanded((current) => !current)}
                className="rounded-full bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-100 ring-1 ring-inset ring-white/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
              >
                {bannerExpanded ? 'Minimize Banner' : 'Expand Banner'}
              </button>
 
              <div className="rounded-full bg-black/30 px-4 py-2 text-sm font-semibold text-slate-300 ring-1 ring-inset ring-white/10 backdrop-blur">
                Social: <span className="font-black text-[#f4d160]">{pageLink}</span>
              </div>
            </div>
          </aside>
        </section>
      </div>
      {sharePostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-[#0d0e14] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Share Post</p>
                <h3 className="mt-2 text-xl font-black text-white">Copy page link</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Social page route for testing and internal navigation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSharePostId(null)}
                className="rounded-full bg-white/[0.05] px-3 py-2 text-sm font-black text-slate-300 transition hover:bg-white/[0.1]"
              >
                Close
              </button>
            </div>
            <div className="mt-5 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-inset ring-white/10">
              <p className="text-sm font-bold text-slate-400">Route</p>
              <p className="mt-2 break-all text-base font-black text-white">{pageLink}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="rounded-2xl bg-gradient-to-r from-[#f4d160] via-[#d4af37] to-[#b8860b] px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-black/40 transition hover:-translate-y-0.5"
              >
                {shareCopied ? 'Copied' : 'Copy Link'}
              </button>
              <button
                type="button"
                onClick={() => setSharePostId(null)}
                className="rounded-2xl bg-white/[0.05] px-5 py-3 text-sm font-black text-slate-200 ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.1]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
const PostCard = memo(function PostCard({
  pageId,
  post,
  viewerAvatarSrc,
  isCommentsOpen,
  commentDraft,
  commentInputRef,
  onReaction,
  onVote,
  onToggleSave,
  onToggleComments,
  onCommentDraftChange,
  onAddComment,
  onShare,
  onFollowAuthor,
}: {
  pageId: string;
  post: FeedPost;
  viewerAvatarSrc: string | null;
  isCommentsOpen: boolean;
  commentDraft: string;
  commentInputRef?: React.RefObject<HTMLInputElement | null>;
  onReaction: (postId: string, reaction: ReactionType) => void;
  onVote: (postId: string, optionId: string) => void;
  onToggleSave: (postId: string) => void;
  onToggleComments: () => void;
  onCommentDraftChange: (value: string) => void;
  onAddComment: () => void;
  onShare: () => void;
  onFollowAuthor: () => void;
}) {
  const totalReactions = Object.values(post.reactions).reduce((sum, value) => sum + value, 0);
  return (
    <article className="overflow-hidden rounded-[32px] border border-white/[0.06] bg-[#0d0e14]/90 shadow-xl shadow-black/40 backdrop-blur">
      <div className="border-b border-white/[0.06] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <AvatarBadge value={post.author.avatar} imageSrc={post.author.avatarImageSrc} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-black text-white">{post.author.name}</h3>
                {post.author.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#d4af37]/10 px-2.5 py-1 text-[11px] font-bold text-[#f4d160]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#f4d160]" />
                    Verified
                  </span>
                )}
                <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold text-slate-400">
                  {post.author.handle}
                </span>
                {post.pinned && (
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300">
                    Pinned
                  </span>
                )}
                {post.featured && (
                  <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-bold text-violet-300">
                    Featured
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-slate-400">
                {post.author.role} &middot; {post.author.department} &middot; {post.createdAt}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-white/[0.04] px-3 py-1.5 font-bold text-slate-300">
                  {getAudienceTone(post.audience)}
                </span>
                <span className="rounded-full bg-white/[0.04] px-3 py-1.5 font-bold text-slate-300">
                  {formatCompactNumber(post.author.followers ?? 0)} followers
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onFollowAuthor}
              className={cn(
                'rounded-2xl px-4 py-2.5 text-sm font-black transition',
                post.followedAuthor
                  ? 'bg-gradient-to-r from-[#f4d160] via-[#d4af37] to-[#b8860b] text-slate-950'
                  : 'bg-white/[0.04] text-slate-200 ring-1 ring-inset ring-white/10 hover:bg-white/[0.08]',
              )}
            >
              {post.followedAuthor ? 'Following' : 'Follow'}
            </button>
            <button
              type="button"
              onClick={() => onToggleSave(post.id)}
              className={cn(
                'rounded-2xl px-4 py-2.5 text-sm font-black transition',
                post.saved
                  ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/30'
                  : 'bg-white/[0.04] text-slate-200 ring-1 ring-inset ring-white/10',
              )}
            >
              {post.saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
        <div className="mt-5">
          <p className="text-sm leading-7 text-slate-200">{post.content}</p>
          {post.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#d4af37]/10 px-3 py-1.5 text-xs font-black text-[#f4d160] ring-1 ring-inset ring-[#d4af37]/25"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          {post.attachments?.length ? (
            <div className="mt-5 grid gap-3">
              {post.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="rounded-[24px] bg-white/[0.03] p-4 ring-1 ring-inset ring-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{attachment.name}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {attachment.size} &middot; {getAttachmentBadge(attachment.type)}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/[0.05] px-3 py-1.5 text-xs font-black text-slate-300 ring-1 ring-inset ring-white/10">
                      Attached
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {post.poll ? (
            <div className="mt-5 rounded-[28px] bg-white/[0.03] p-4 ring-1 ring-inset ring-white/10 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-black text-white">Live poll</p>
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-300 ring-1 ring-inset ring-violet-400/30">
                  {post.poll.totalVotes} votes
                </span>
              </div>
              <div className="space-y-3">
                {post.poll.options.map((option) => {
                  const percentage =
                    post.poll && post.poll.totalVotes > 0 ? Math.round((option.votes / post.poll.totalVotes) * 100) : 0;
                  const selected = post.voted === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onVote(post.id, option.id)}
                      disabled={Boolean(post.voted)}
                      className={cn(
                        'block w-full overflow-hidden rounded-[22px] text-left transition',
                        post.voted ? 'cursor-default' : 'hover:-translate-y-0.5',
                      )}
                    >
                      <div
                        className={cn(
                          'relative rounded-[22px] bg-white/[0.03] p-4 ring-1 ring-inset ring-white/10',
                          selected && 'ring-[#d4af37]/50',
                        )}
                      >
                        <div
                          className="absolute inset-y-0 left-0 rounded-[22px] bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5"
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="relative flex items-center justify-between gap-4">
                          <span className="font-bold text-white">{option.label}</span>
                          <span className="text-sm font-black text-slate-400">{percentage}%</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="px-5 pb-4 pt-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span>{formatCompactNumber(totalReactions)} reactions</span>
            <span>{formatCompactNumber(post.comments)} comments</span>
            <span>{formatCompactNumber(post.shares)} shares</span>
            <span>{formatCompactNumber(post.views)} views</span>
          </div>
          <span className="rounded-full bg-white/[0.04] px-3 py-1.5 text-xs font-black text-slate-300">
            Engagement {formatCompactNumber(calculateEngagement(post))}
          </span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {(Object.keys(reactionMeta) as ReactionType[]).map((reaction) => {
            const meta = reactionMeta[reaction];
            const active = post.likedReaction === reaction;
            return (
              <button
                key={`${post.id}-${reaction}`}
                type="button"
                onClick={() => onReaction(post.id, reaction)}
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition',
                  active
                    ? meta.activeClass
                    : 'bg-white/[0.03] text-slate-300 ring-1 ring-inset ring-white/10 hover:bg-white/[0.07] hover:text-white',
                )}
              >
                {meta.icon}
                {meta.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={onToggleComments}
            className="rounded-2xl bg-white/[0.04] px-4 py-3 text-sm font-black text-slate-200 ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.08]"
          >
            {isCommentsOpen ? 'Hide Comments' : 'Comment'}
          </button>
          <button
            type="button"
            onClick={onShare}
            className="rounded-2xl bg-white/[0.04] px-4 py-3 text-sm font-black text-slate-200 ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.08]"
          >
            Share
          </button>
          <button
            type="button"
            onClick={() => onToggleSave(post.id)}
            className="rounded-2xl bg-white/[0.04] px-4 py-3 text-sm font-black text-slate-200 ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.08]"
          >
            {post.saved ? 'Unsave' : 'Save Post'}
          </button>
        </div>
        {isCommentsOpen && (
          <div className="mt-5 rounded-[28px] bg-white/[0.03] p-4 ring-1 ring-inset ring-white/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-white">Discussion thread</p>
              <span className="text-xs font-bold text-slate-500">{post.commentThread?.length ?? 0} visible comments</span>
            </div>
            <div className="mt-4 flex gap-3">
              <AvatarBadge value={getInitials(viewerProfile.name)} imageSrc={viewerAvatarSrc} size="sm" />
              <div className="flex-1">
                <div className="flex gap-2">
                  <input
                    ref={commentInputRef}
                    value={commentDraft}
                    onChange={(event) => onCommentDraftChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        onAddComment();
                      }
                    }}
                    placeholder="Write a meaningful response..."
                    aria-label={`Comment input for ${post.author.name}-${pageId}`}
                    className="w-full rounded-2xl border-0 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-100 outline-none ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-[#d4af37]"
                  />
                  <button
                    type="button"
                    onClick={onAddComment}
                    className="rounded-2xl bg-gradient-to-r from-[#f4d160] via-[#d4af37] to-[#b8860b] px-4 py-3 text-sm font-black text-slate-950"
                  >
                    Post
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {(post.commentThread ?? []).length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-500">
                      No comments yet. Be the first to add signal.
                    </div>
                  ) : (
                    (post.commentThread ?? []).map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-[22px] bg-white/[0.03] p-4 ring-1 ring-inset ring-white/10"
                      >
                        <div className="flex items-start gap-3">
                          <AvatarBadge value={comment.avatar} imageSrc={comment.avatarImageSrc} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-black text-white">{comment.author}</p>
                              <span className="text-xs font-bold text-slate-500">{comment.handle}</span>
                              <span className="text-xs font-bold text-slate-500">&middot;</span>
                              <span className="text-xs font-bold text-slate-500">{comment.createdAt}</span>
                            </div>
                            <p className="mt-1 text-xs font-semibold text-slate-500">{comment.role}</p>
                            <p className="mt-3 text-sm leading-6 text-slate-200">{comment.text}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
});
const CardShell = memo(function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[32px] border border-white/[0.06] bg-[#0d0e14]/90 p-5 shadow-xl shadow-black/40 backdrop-blur sm:p-6">
      {children}
    </section>
  );
});
const QuickStat = memo(function QuickStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] px-4 py-3 ring-1 ring-inset ring-white/10">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
});
const InfoChip = memo(function InfoChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-inset ring-white/10">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-black text-white">{value}</p>
    </div>
  );
});
const FeedMetricCard = memo(function FeedMetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] bg-white/[0.03] p-4 ring-1 ring-inset ring-white/[0.06]">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-black tracking-tight text-white">{value}</p>
    </div>
  );
});
const GlassBadge = memo(function GlassBadge({ value }: { value: string }) {
  return (
    <span className="rounded-full bg-white/[0.05] px-4 py-2 text-xs font-black text-slate-200 ring-1 ring-inset ring-white/10">
      {value}
    </span>
  );
});
const MetricGlass = memo(function MetricGlass({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] bg-white/[0.04] p-4 ring-1 ring-inset ring-white/10 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d4af37]/80">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-white">{value}</p>
    </div>
  );
});
const PulseDot = memo(function PulseDot() {
  return (
    <div className="relative flex h-3 w-3 items-center justify-center">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f4d160] opacity-75" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-[#d4af37]" />
    </div>
  );
});
const HealthRow = memo(function HealthRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3 ring-1 ring-inset ring-white/[0.06]">
      <span className="text-sm font-semibold text-slate-300">{label}</span>
      <span
        className={cn(
          'rounded-full px-3 py-1 text-xs font-black ring-1 ring-inset',
          positive
            ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/30'
            : 'bg-amber-500/10 text-amber-300 ring-amber-400/30',
        )}
      >
        {value}
      </span>
    </div>
  );
});
export default EnterpriseSocialPage;