"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import {
  BadgeCheck,
  BellRing,
  BarChart3,
  CalendarRange,
  Calculator,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Copy,
  CreditCard,
  DollarSign,
  Filter,
  MapPin,
  Minus,
  Plus,
  Printer,
  Search,
  Send,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  UtensilsCrossed,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TableStatus = "Available" | "Reserved" | "Occupied" | "Cleaning";
type Sentiment = "Positive" | "Neutral" | "Negative";

interface DiningTable {
  id: number;
  label: string;
  capacity: number;
  status: TableStatus;
  guest: string;
  party: number;
  remaining: number;
}

interface MenuItem {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  prepTime: string;
  stock: number;
  rating: number;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  category: string;
}

interface ReviewItem {
  id: number;
  name: string;
  rating: number;
  comment: string;
  sentiment: Sentiment;
  weekday: string;
  source: string;
}

interface EventItem {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  guests: number;
}

interface RoomServiceOrder {
  id: number;
  items: CartItem[];
  total: number;
  placedAt: string;
  status: "Queued" | "Preparing" | "Delivered";
}

interface SectionCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}

interface PillProps {
  children: ReactNode;
  className?: string;
}

interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TABLE_STATUS_STYLES: Record<TableStatus, string> = {
  Available: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  Reserved: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  Occupied: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  Cleaning: "border-sky-400/20 bg-sky-400/10 text-sky-200",
};

const SENTIMENT_STYLES: Record<Sentiment, string> = {
  Positive: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  Neutral: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  Negative: "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

const EVENT_TYPE_STYLES: Record<string, string> = {
  Banquet: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  Wedding: "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200",
  Corporate: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  Private: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  Celebration: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  Conference: "border-violet-400/20 bg-violet-400/10 text-violet-200",
};

const POS_BUTTONS = [
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", ".", "⌫", "+"],
] as const;

function formatMoney(value: number) {
  return currency.format(Number.isFinite(value) ? value : 0);
}

function formatDuration(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function fromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatReadableDate(dateKey: string) {
  const date = fromDateKey(dateKey);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

function weekdayShort(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
}

function getSentimentFromRating(rating: number): Sentiment {
  if (rating >= 4) return "Positive";
  if (rating === 3) return "Neutral";
  return "Negative";
}

function safeEvaluate(expression: string): number | null {
  const normalized = expression.replace(/\s+/g, "");
  if (!normalized) return null;
  if (!/^[0-9+\-*/().]+$/.test(normalized)) return null;

  try {
    const result = Function(`"use strict"; return (${normalized});`)();
    return Number.isFinite(result) ? Number(result) : null;
  } catch {
    return null;
  }
}

function getInitialTables(): DiningTable[] {
  return [
    { id: 1, label: "T01", capacity: 2, status: "Available", guest: "", party: 0, remaining: 0 },
    { id: 2, label: "T02", capacity: 4, status: "Reserved", guest: "Ava Sinclair", party: 4, remaining: 14 * 60 },
    { id: 3, label: "T03", capacity: 2, status: "Occupied", guest: "Executive Suite 1208", party: 2, remaining: 52 * 60 },
    { id: 4, label: "T04", capacity: 6, status: "Cleaning", guest: "", party: 0, remaining: 4 * 60 },
    { id: 5, label: "T05", capacity: 2, status: "Available", guest: "", party: 0, remaining: 0 },
    { id: 6, label: "T06", capacity: 4, status: "Reserved", guest: "Maya Patel", party: 3, remaining: 8 * 60 },
    { id: 7, label: "T07", capacity: 8, status: "Occupied", guest: "Hamilton Group", party: 7, remaining: 35 * 60 },
    { id: 8, label: "T08", capacity: 2, status: "Available", guest: "", party: 0, remaining: 0 },
    { id: 9, label: "T09", capacity: 4, status: "Available", guest: "", party: 0, remaining: 0 },
    { id: 10, label: "T10", capacity: 6, status: "Cleaning", guest: "", party: 0, remaining: 7 * 60 },
    { id: 11, label: "T11", capacity: 4, status: "Available", guest: "", party: 0, remaining: 0 },
    { id: 12, label: "T12", capacity: 6, status: "Occupied", guest: "Private Dining", party: 5, remaining: 66 * 60 },
  ];
}

function getInitialMenuItems(): MenuItem[] {
  return [
    {
      id: 1,
      name: "Lobster Bisque",
      category: "Starters",
      description: "Silky bisque finished with chive oil and brioche croutons.",
      price: 24,
      prepTime: "10 min",
      stock: 8,
      rating: 4.8,
    },
    {
      id: 2,
      name: "Burrata & Heirloom Tomatoes",
      category: "Starters",
      description: "Garden tomatoes, basil emulsion, olive crumb.",
      price: 18,
      prepTime: "8 min",
      stock: 10,
      rating: 4.6,
    },
    {
      id: 3,
      name: "Truffle Risotto",
      category: "Mains",
      description: "Aged parmesan, black truffle, and forest mushroom jus.",
      price: 32,
      prepTime: "18 min",
      stock: 6,
      rating: 4.9,
    },
    {
      id: 4,
      name: "Wagyu Tenderloin",
      category: "Mains",
      description: "200g tenderloin with charred baby carrots and red wine glaze.",
      price: 58,
      prepTime: "25 min",
      stock: 4,
      rating: 5.0,
    },
    {
      id: 5,
      name: "Herb Roasted Sea Bass",
      category: "Mains",
      description: "Citrus beurre blanc, fennel salad, and pommes purée.",
      price: 42,
      prepTime: "20 min",
      stock: 5,
      rating: 4.7,
    },
    {
      id: 6,
      name: "Citrus Pavlova",
      category: "Desserts",
      description: "Meringue shell, passion fruit curd, and whipped mascarpone.",
      price: 16,
      prepTime: "9 min",
      stock: 12,
      rating: 4.8,
    },
    {
      id: 7,
      name: "Signature Chocolate Sphere",
      category: "Desserts",
      description: "Warm chocolate pour-over with vanilla bean ice cream.",
      price: 18,
      prepTime: "10 min",
      stock: 9,
      rating: 4.9,
    },
    {
      id: 8,
      name: "Champagne Selection",
      category: "Beverages",
      description: "Curated premium coupe service by the glass.",
      price: 26,
      prepTime: "3 min",
      stock: 18,
      rating: 4.7,
    },
    {
      id: 9,
      name: "Cold-Pressed Wellness Juice",
      category: "Beverages",
      description: "Green apple, cucumber, mint, and lime.",
      price: 14,
      prepTime: "4 min",
      stock: 15,
      rating: 4.5,
    },
    {
      id: 10,
      name: "Late-Night Club Sandwich",
      category: "Room Service",
      description: "Triple decker with turkey, smoked bacon, and truffle fries.",
      price: 22,
      prepTime: "12 min",
      stock: 7,
      rating: 4.6,
    },
  ];
}

function getInitialReviews(): ReviewItem[] {
  return [
    {
      id: 1,
      name: "Olivia Hart",
      rating: 5,
      comment: "Exquisite service, flawless pacing, and a remarkable tasting menu.",
      sentiment: "Positive",
      weekday: "Mon",
      source: "Dining",
    },
    {
      id: 2,
      name: "Daniel Reyes",
      rating: 4,
      comment: "Room service was prompt and the presentation was premium.",
      sentiment: "Positive",
      weekday: "Tue",
      source: "Room Service",
    },
    {
      id: 3,
      name: "Sophia Lee",
      rating: 5,
      comment: "The banquet team handled our gala with absolute precision.",
      sentiment: "Positive",
      weekday: "Wed",
      source: "Banquet",
    },
    {
      id: 4,
      name: "Ethan Park",
      rating: 3,
      comment: "Very good overall, though dessert delivery took a little longer.",
      sentiment: "Neutral",
      weekday: "Thu",
      source: "Dining",
    },
    {
      id: 5,
      name: "Maya Patel",
      rating: 2,
      comment: "Ordering was smooth, but one item arrived cooler than expected.",
      sentiment: "Negative",
      weekday: "Fri",
      source: "Room Service",
    },
    {
      id: 6,
      name: "Amelia Stone",
      rating: 5,
      comment: "The attention to detail made dinner feel truly luxurious.",
      sentiment: "Positive",
      weekday: "Sat",
      source: "Dining",
    },
    {
      id: 7,
      name: "Lucas King",
      rating: 4,
      comment: "Staff were attentive and the wine pairing was outstanding.",
      sentiment: "Positive",
      weekday: "Sun",
      source: "Dining",
    },
    {
      id: 8,
      name: "Nora Ali",
      rating: 3,
      comment: "Elegant ambiance and very solid service throughout.",
      sentiment: "Neutral",
      weekday: "Mon",
      source: "Banquet",
    },
  ];
}

function getInitialEvents(): EventItem[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const days = [4, 7, 11, 15, 20, 24];

  return [
    {
      id: 1,
      title: "Royal Banquet Gala",
      date: toDateKey(new Date(year, month, days[0])),
      time: "19:00",
      location: "Grand Ballroom",
      type: "Banquet",
      guests: 180,
    },
    {
      id: 2,
      title: "Executive Board Dinner",
      date: toDateKey(new Date(year, month, days[1])),
      time: "20:30",
      location: "Sky Lounge",
      type: "Corporate",
      guests: 28,
    },
    {
      id: 3,
      title: "Atelier Wedding Preview",
      date: toDateKey(new Date(year, month, days[2])),
      time: "18:00",
      location: "Terrace Suite",
      type: "Wedding",
      guests: 64,
    },
    {
      id: 4,
      title: "Chef's Table Private Experience",
      date: toDateKey(new Date(year, month, days[3])),
      time: "21:00",
      location: "Chef’s Table",
      type: "Private",
      guests: 12,
    },
    {
      id: 5,
      title: "Charity Appreciation Dinner",
      date: toDateKey(new Date(year, month, days[4])),
      time: "19:30",
      location: "Riviera Room",
      type: "Celebration",
      guests: 96,
    },
    {
      id: 6,
      title: "Luxury Brand Conference Lunch",
      date: toDateKey(new Date(year, month, days[5])),
      time: "12:30",
      location: "Orchid Hall",
      type: "Conference",
      guests: 140,
    },
  ];
}

function advanceTableOnTick(table: DiningTable): DiningTable {
  if (table.status === "Available") return table;

  if (table.remaining > 1) {
    return { ...table, remaining: table.remaining - 1 };
  }

  if (table.status === "Reserved") {
    return { ...table, status: "Occupied", remaining: 45 * 60 };
  }

  if (table.status === "Occupied") {
    return { ...table, status: "Cleaning", remaining: 5 * 60 };
  }

  return { ...table, status: "Available", guest: "", party: 0, remaining: 0 };
}

function buildMonthGrid(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{
    dateKey: string;
    dayNumber: number;
    inMonth: boolean;
    isToday: boolean;
  }> = [];

  for (let index = 0; index < 42; index += 1) {
    const dayNumber = index - offset + 1;
    const cellDate = new Date(year, month, dayNumber);
    cells.push({
      dateKey: toDateKey(cellDate),
      dayNumber: cellDate.getDate(),
      inMonth: cellDate.getMonth() === month && cellDate.getDate() >= 1 && cellDate.getDate() <= daysInMonth,
      isToday: toDateKey(cellDate) === toDateKey(new Date()),
    });
  }

  return cells;
}

function Pill({ children, className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function BaseButton({
  variant = "secondary",
  className = "",
  type = "button",
  ...props
}: BaseButtonProps) {
  const styles: Record<NonNullable<BaseButtonProps["variant"]>, string> = {
    primary:
      "border border-amber-300/20 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110",
    secondary:
      "border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:border-white/20",
    ghost: "border border-transparent bg-transparent text-slate-300 hover:bg-white/5",
    danger:
      "border border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 hover:border-rose-400/30",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/30 disabled:pointer-events-none disabled:opacity-40 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  action,
  className = "",
  children,
}: SectionCardProps) {
  return (
    <section
      className={`overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          <p className="mt-1 text-sm text-slate-400">{detail}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [clock, setClock] = useState(new Date());

  const [tables, setTables] = useState<DiningTable[]>(getInitialTables);
  const [reservationForm, setReservationForm] = useState({
    guest: "",
    tableId: 1,
    party: 2,
  });
  const [selectedTableId, setSelectedTableId] = useState(1);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(getInitialMenuItems);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [roomServiceOrders, setRoomServiceOrders] = useState<RoomServiceOrder[]>([]);

  const [calculatorExpression, setCalculatorExpression] = useState("128+42");
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState(true);
  const [serviceChargeRate, setServiceChargeRate] = useState(12);
  const [taxRate, setTaxRate] = useState(8);
  const [discountPct, setDiscountPct] = useState(5);
  const [tipPct, setTipPct] = useState(10);
  const [manualAdjustment, setManualAdjustment] = useState(0);
  const [splitCount, setSplitCount] = useState(2);

  const [reviews, setReviews] = useState<ReviewItem[]>(getInitialReviews);
  const [reviewFilter, setReviewFilter] = useState<"All" | Sentiment>("All");
  const [selectedReviewId, setSelectedReviewId] = useState<number>(1);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    source: "Dining",
    comment: "",
  });

  const [events, setEvents] = useState<EventItem[]>(getInitialEvents);
  const [displayMonth, setDisplayMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(new Date()));
  const [eventForm, setEventForm] = useState({
    title: "",
    date: toDateKey(new Date()),
    time: "19:00",
    location: "",
    type: "Banquet",
    guests: 20,
  });

  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date());
      setTables((prev) => prev.map(advanceTableOnTick));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  const pushNotice = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3200);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const matchesSearch = (value: unknown) =>
    !normalizedSearch || String(value).toLowerCase().includes(normalizedSearch);

  const filteredTables = useMemo(() => {
    return tables.filter((table) =>
      [table.label, table.guest, table.status, table.capacity, table.party].some(matchesSearch)
    );
  }, [tables, normalizedSearch]);

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(menuItems.map((item) => item.category)))];
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const categoryPass = selectedCategory === "All" || item.category === selectedCategory;
      const searchPass =
        matchesSearch(item.name) || matchesSearch(item.category) || matchesSearch(item.description);
      return categoryPass && searchPass;
    });
  }, [menuItems, selectedCategory, normalizedSearch]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const sentimentPass = reviewFilter === "All" || review.sentiment === reviewFilter;
      const searchPass =
        matchesSearch(review.name) ||
        matchesSearch(review.comment) ||
        matchesSearch(review.source) ||
        matchesSearch(review.rating) ||
        matchesSearch(review.weekday);
      return sentimentPass && searchPass;
    });
  }, [reviews, reviewFilter, normalizedSearch]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      return (
        matchesSearch(event.title) ||
        matchesSearch(event.location) ||
        matchesSearch(event.type) ||
        matchesSearch(event.time) ||
        matchesSearch(event.date)
      );
    });
  }, [events, normalizedSearch]);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? tables[0],
    [tables, selectedTableId]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const serviceCharge = serviceChargeEnabled ? (cartSubtotal * serviceChargeRate) / 100 : 0;
  const discountAmount = (cartSubtotal * discountPct) / 100;
  const taxableBase = Math.max(0, cartSubtotal + serviceCharge + manualAdjustment - discountAmount);
  const taxAmount = (taxableBase * taxRate) / 100;
  const tipAmount = (cartSubtotal * tipPct) / 100;
  const totalAmount = Math.max(0, taxableBase + taxAmount + tipAmount);
  const splitAmount = splitCount > 0 ? totalAmount / splitCount : totalAmount;

  const activeTables = tables.filter((table) => table.status !== "Available").length;
  const occupiedTables = tables.filter((table) => table.status === "Occupied").length;
  const reservedTables = tables.filter((table) => table.status === "Reserved").length;
  const availableTables = tables.filter((table) => table.status === "Available").length;
  const cleaningTables = tables.filter((table) => table.status === "Cleaning").length;

  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const positiveReviews = reviews.filter((review) => review.sentiment === "Positive").length;
  const positiveRate = reviews.length ? Math.round((positiveReviews / reviews.length) * 100) : 0;

  const upcomingEventsCount = events.filter((event) => event.date >= toDateKey(new Date())).length;

  const globalMatches =
    filteredTables.length + filteredMenuItems.length + filteredReviews.length + filteredEvents.length;

  const selectedDateEvents = useMemo(() => {
    return events
      .filter((event) => event.date === selectedDateKey)
      .filter((event) => {
        return (
          matchesSearch(event.title) ||
          matchesSearch(event.location) ||
          matchesSearch(event.type) ||
          matchesSearch(event.time)
        );
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [events, selectedDateKey, normalizedSearch]);

  const calendarCells = useMemo(() => buildMonthGrid(displayMonth), [displayMonth]);

  const ratingsChartData = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((rating) => ({
        rating: `${rating}★`,
        value: reviews.filter((review) => review.rating === rating).length,
      })),
    [reviews]
  );

  const weekdayChartData = useMemo(() => {
    return weekdays.map((day) => {
      const dayReviews = reviews.filter((review) => review.weekday === day);
      const average =
        dayReviews.length > 0
          ? Number((dayReviews.reduce((sum, review) => sum + review.rating, 0) / dayReviews.length).toFixed(1))
          : 0;
      return {
        day,
        average,
        reviews: dayReviews.length,
      };
    });
  }, [reviews]);

  const addToCart = (itemId: number) => {
    const item = menuItems.find((entry) => entry.id === itemId);
    if (!item || item.stock <= 0) {
      pushNotice("This menu item is out of stock.");
      return;
    }

    setMenuItems((prev) =>
      prev.map((entry) => (entry.id === itemId ? { ...entry, stock: entry.stock - 1 } : entry))
    );

    setCart((prev) => {
      const existing = prev.find((entry) => entry.id === itemId);
      if (existing) {
        return prev.map((entry) =>
          entry.id === itemId ? { ...entry, qty: entry.qty + 1 } : entry
        );
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1, category: item.category }];
    });

    pushNotice(`${item.name} added to room service cart.`);
  };

  const removeOneFromCart = (itemId: number) => {
    const current = cart.find((entry) => entry.id === itemId);
    if (!current) return;

    setMenuItems((prev) =>
      prev.map((entry) => (entry.id === itemId ? { ...entry, stock: entry.stock + 1 } : entry))
    );

    setCart((prev) =>
      prev
        .map((entry) => (entry.id === itemId ? { ...entry, qty: entry.qty - 1 } : entry))
        .filter((entry) => entry.qty > 0)
    );
  };

  const removeItemFromCart = (itemId: number) => {
    const current = cart.find((entry) => entry.id === itemId);
    if (!current) return;

    setMenuItems((prev) =>
      prev.map((entry) =>
        entry.id === itemId ? { ...entry, stock: entry.stock + current.qty } : entry
      )
    );

    setCart((prev) => prev.filter((entry) => entry.id !== itemId));
  };

  const clearCart = (restoreStock = true) => {
    if (restoreStock && cart.length) {
      setMenuItems((prev) =>
        prev.map((entry) => {
          const cartItem = cart.find((item) => item.id === entry.id);
          return cartItem ? { ...entry, stock: entry.stock + cartItem.qty } : entry;
        })
      );
    }
    setCart([]);
  };

  const submitRoomServiceOrder = () => {
    if (!cart.length) {
      pushNotice("The room service cart is empty.");
      return;
    }

    const order: RoomServiceOrder = {
      id: Date.now(),
      items: cart,
      total: totalAmount,
      placedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Queued",
    };

    setRoomServiceOrders((prev) => [order, ...prev].slice(0, 6));
    setCart([]);
    pushNotice("Room service order sent to the kitchen.");
  };

  const updateTable = (
    tableId: number,
    updater: (table: DiningTable) => DiningTable,
    message?: string
  ) => {
    setTables((prev) => prev.map((table) => (table.id === tableId ? updater(table) : table)));
    if (message) pushNotice(message);
  };

  const quickTableAction = (table: DiningTable) => {
    if (table.status === "Available") {
      updateTable(
        table.id,
        () => ({
          ...table,
          status: "Reserved",
          guest: "Walk-in VIP",
          party: 2,
          remaining: 15 * 60,
        }),
        `${table.label} reserved for Walk-in VIP.`
      );
      setSelectedTableId(table.id);
      return;
    }

    if (table.status === "Reserved") {
      updateTable(
        table.id,
        (current) => ({ ...current, status: "Occupied", remaining: 45 * 60 }),
        `${table.label} marked as occupied.`
      );
      setSelectedTableId(table.id);
      return;
    }

    if (table.status === "Occupied") {
      updateTable(
        table.id,
        (current) => ({ ...current, status: "Cleaning", remaining: 5 * 60 }),
        `${table.label} moved to cleaning.`
      );
      setSelectedTableId(table.id);
      return;
    }

    updateTable(
      table.id,
      (current) => ({ ...current, status: "Available", guest: "", party: 0, remaining: 0 }),
      `${table.label} is now available.`
    );
    setSelectedTableId(table.id);
  };

  const submitReservation = () => {
    const table = tables.find((entry) => entry.id === Number(reservationForm.tableId));
    if (!table) return;

    if (table.status !== "Available") {
      pushNotice(`${table.label} is not available right now.`);
      return;
    }

    if (reservationForm.party > table.capacity) {
      pushNotice(`${table.label} seats up to ${table.capacity} guests.`);
      return;
    }

    updateTable(
      table.id,
      () => ({
        ...table,
        status: "Reserved",
        guest: reservationForm.guest.trim() || "VIP Guest",
        party: reservationForm.party,
        remaining: 15 * 60,
      }),
      `${table.label} reserved successfully.`
    );

    setSelectedTableId(table.id);
    setReservationForm({
      guest: "",
      tableId: table.id,
      party: 2,
    });
  };

  const handleCalculatorKey = (key: string) => {
    if (key === "⌫") {
      setCalculatorExpression((prev) => prev.slice(0, -1));
      return;
    }

    if (key === "C") {
      setCalculatorExpression("");
      return;
    }

    if (key === "=") {
      const result = safeEvaluate(calculatorExpression);
      if (result === null) {
        pushNotice("Calculator expression is invalid.");
        return;
      }
      setCalculatorExpression(String(result));
      return;
    }

    setCalculatorExpression((prev) => prev + key);
  };

  const calculatorPreview = useMemo(
    () => safeEvaluate(calculatorExpression),
    [calculatorExpression]
  );

  const applyCalculatorToAdjustment = () => {
    if (calculatorPreview === null) {
      pushNotice("Calculator result is invalid.");
      return;
    }

    setManualAdjustment(calculatorPreview);
    pushNotice("Calculator result applied to the bill as an adjustment.");
  };

  const copyReceipt = async () => {
    const receiptLines = [
      "Smart Restaurant AI | Luxury Hotel",
      "----------------------------------",
      ...cart.map(
        (item) => `${item.qty}x ${item.name}  ${formatMoney(item.price * item.qty)}`
      ),
      "----------------------------------",
      `Subtotal: ${formatMoney(cartSubtotal)}`,
      `Service Charge: ${formatMoney(serviceCharge)}`,
      `Discount: -${formatMoney(discountAmount)}`,
      `Adjustment: ${formatMoney(manualAdjustment)}`,
      `Tax: ${formatMoney(taxAmount)}`,
      `Tip: ${formatMoney(tipAmount)}`,
      `Total: ${formatMoney(totalAmount)}`,
      `Split: ${splitCount} x ${formatMoney(splitAmount)}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(receiptLines);
      pushNotice("Receipt summary copied to clipboard.");
    } catch {
      pushNotice("Clipboard access was not available.");
    }
  };

  const printReceipt = () => {
    if (typeof window === "undefined") return;
    window.print();
    pushNotice("Print dialog opened.");
  };

  const submitReview = () => {
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      pushNotice("Please add a guest name and review comment.");
      return;
    }

    const newReview: ReviewItem = {
      id: Date.now(),
      name: reviewForm.name.trim(),
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
      sentiment: getSentimentFromRating(reviewForm.rating),
      weekday: weekdayShort(new Date()),
      source: reviewForm.source,
    };

    setReviews((prev) => [newReview, ...prev]);
    setSelectedReviewId(newReview.id);
    setReviewForm({
      name: "",
      rating: 5,
      source: "Dining",
      comment: "",
    });
    pushNotice("Guest feedback successfully recorded.");
  };

  const deleteReview = (reviewId: number) => {
    setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    if (selectedReviewId === reviewId) {
      const next = reviews.find((review) => review.id !== reviewId);
      setSelectedReviewId(next?.id ?? 0);
    }
    pushNotice("Review removed.");
  };

  const selectedReview = reviews.find((review) => review.id === selectedReviewId) ?? reviews[0];

  const shiftMonth = (delta: number) => {
    const next = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + delta, 1);
    setDisplayMonth(next);
    const nextKey = toDateKey(next);
    setSelectedDateKey(nextKey);
    setEventForm((prev) => ({ ...prev, date: nextKey }));
  };

  const goToToday = () => {
    const today = new Date();
    const next = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextKey = toDateKey(today);
    setDisplayMonth(next);
    setSelectedDateKey(nextKey);
    setEventForm((prev) => ({ ...prev, date: nextKey }));
  };

  const submitEvent = () => {
    if (!eventForm.title.trim() || !eventForm.location.trim()) {
      pushNotice("Please provide an event title and location.");
      return;
    }

    const newEvent: EventItem = {
      id: Date.now(),
      title: eventForm.title.trim(),
      date: eventForm.date,
      time: eventForm.time,
      location: eventForm.location.trim(),
      type: eventForm.type,
      guests: Math.max(1, Number(eventForm.guests) || 1),
    };

    setEvents((prev) => [newEvent, ...prev].sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date))));
    setSelectedDateKey(eventForm.date);
    setDisplayMonth(new Date(fromDateKey(eventForm.date).getFullYear(), fromDateKey(eventForm.date).getMonth(), 1));
    setEventForm((prev) => ({
      ...prev,
      title: "",
      location: "",
      guests: 20,
    }));
    pushNotice("Banquet event added to the calendar.");
  };

  const deleteEvent = (eventId: number) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
    pushNotice("Event removed.");
  };

  const clearSearch = () => setSearchTerm("");

  const receiptActionPill = (
    <div className="flex flex-wrap items-center gap-2">
      <Pill className="border-white/10 bg-white/5 text-slate-200">
        <CreditCard className="h-3.5 w-3.5" />
        POS Live
      </Pill>
      <Pill className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
        <CircleDot className="h-3.5 w-3.5" />
        {cart.length} items
      </Pill>
    </div>
  );

  const feedbackPill = (
    <div className="flex flex-wrap items-center gap-2">
      <Pill className="border-sky-400/20 bg-sky-400/10 text-sky-200">
        <TrendingUp className="h-3.5 w-3.5" />
        {averageRating.toFixed(1)} / 5.0
      </Pill>
      <Pill className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
        <Star className="h-3.5 w-3.5" />
        {positiveRate}% positive
      </Pill>
    </div>
  );

  const eventPill = (
    <div className="flex flex-wrap items-center gap-2">
      <Pill className="border-violet-400/20 bg-violet-400/10 text-violet-200">
        <CalendarRange className="h-3.5 w-3.5" />
        {formatMonthLabel(displayMonth)}
      </Pill>
      <Pill className="border-amber-400/20 bg-amber-400/10 text-amber-200">
        <BellRing className="h-3.5 w-3.5" />
        {upcomingEventsCount} upcoming
      </Pill>
    </div>
  );

  const chartTooltipStyle = {
    backgroundColor: "rgba(2, 6, 23, 0.96)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    color: "#fff",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.08),transparent_35%)]" />
      <main className="relative mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <header className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200">
                <BadgeCheck className="h-3.5 w-3.5" />
                Luxury Hotel Operations AI
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Smart Restaurant AI
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                A professional, all-in-one dashboard for restaurant reservations, digital menus,
                room service, billing, guest sentiment intelligence, and banquet coordination.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Pill className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                <CircleDot className="h-3.5 w-3.5" />
                Live sync
              </Pill>
              <Pill className="border-sky-400/20 bg-sky-400/10 text-sky-200">
                <Clock3 className="h-3.5 w-3.5" />
                {clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </Pill>
              <Pill className="border-amber-400/20 bg-amber-400/10 text-amber-200">
                <Sparkles className="h-3.5 w-3.5" />
                {globalMatches} matches
              </Pill>
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tables, menu items, reviews, or events..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <BaseButton variant="secondary" onClick={clearSearch} className="min-w-36">
              Reset dashboard
            </BaseButton>
          </div>

          {notice ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              <BellRing className="h-4 w-4 shrink-0" />
              <span>{notice}</span>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Active tables"
              value={`${activeTables}/${tables.length}`}
              detail={`${availableTables} open • ${reservedTables} reserved • ${occupiedTables} occupied`}
              icon={Users}
            />
            <StatCard
              label="Room service cart"
              value={formatMoney(cartSubtotal)}
              detail={`${cart.length} cart items across ${roomServiceOrders.length} recent orders`}
              icon={DollarSign}
            />
            <StatCard
              label="Guest rating"
              value={`${averageRating.toFixed(1)}/5.0`}
              detail={`${positiveRate}% positive feedback from ${reviews.length} reviews`}
              icon={Star}
            />
            <StatCard
              label="Upcoming events"
              value={String(upcomingEventsCount)}
              detail={`${events.length} banquet and private dining events on the calendar`}
              icon={BellRing}
            />
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-12">
          <SectionCard
            title="Table Reservation System"
            subtitle="Real-time status, table flow, and VIP booking control."
            icon={Users}
            className="xl:col-span-7"
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Pill className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  {availableTables} open
                </Pill>
                <Pill className="border-amber-400/20 bg-amber-400/10 text-amber-200">
                  {reservedTables} reserved
                </Pill>
                <Pill className="border-rose-400/20 bg-rose-400/10 text-rose-200">
                  {occupiedTables} occupied
                </Pill>
              </div>
            }
          >
            <div className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
              <div className="space-y-4">
                <form
                  className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 md:grid-cols-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitReservation();
                  }}
                >
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      Guest name
                    </label>
                    <input
                      value={reservationForm.guest}
                      onChange={(e) =>
                        setReservationForm((prev) => ({ ...prev, guest: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                      placeholder="Guest or suite name"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      Table
                    </label>
                    <select
                      value={reservationForm.tableId}
                      onChange={(e) =>
                        setReservationForm((prev) => ({ ...prev, tableId: Number(e.target.value) }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                    >
                      {tables.map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.label} • {table.capacity} seats • {table.status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      Party size
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={reservationForm.party}
                      onChange={(e) =>
                        setReservationForm((prev) => ({ ...prev, party: Number(e.target.value) }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                    />
                  </div>
                  <div className="md:col-span-4 flex justify-end">
                    <BaseButton variant="primary" type="submit" className="w-full md:w-auto">
                      <Plus className="h-4 w-4" />
                      Reserve table
                    </BaseButton>
                  </div>
                </form>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredTables.length ? (
                    filteredTables.map((table) => (
                      <div
                        key={table.id}
                        className={`rounded-2xl border p-4 transition ${
                          selectedTableId === table.id
                            ? "border-amber-400/30 bg-amber-400/10"
                            : "border-white/10 bg-slate-950/45 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{table.label}</p>
                            <p className="mt-1 text-xs text-slate-400">{table.capacity} seats</p>
                          </div>
                          <Pill className={TABLE_STATUS_STYLES[table.status]}>{table.status}</Pill>
                        </div>

                        <div className="mt-3 space-y-2 text-sm text-slate-300">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500">Guest</span>
                            <span className="truncate">{table.guest || "—"}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500">Party</span>
                            <span>{table.party || "—"}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500">Countdown</span>
                            <span>{table.status === "Available" ? "Ready" : formatDuration(table.remaining)}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <BaseButton
                            onClick={() => setSelectedTableId(table.id)}
                            className="flex-1"
                          >
                            View
                          </BaseButton>
                          <BaseButton
                            variant="primary"
                            onClick={() => quickTableAction(table)}
                            className="flex-1"
                          >
                            {table.status === "Available"
                              ? "Reserve"
                              : table.status === "Reserved"
                              ? "Seat now"
                              : table.status === "Occupied"
                              ? "Clean"
                              : "Open"}
                          </BaseButton>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm text-slate-400">
                      No tables match your search.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                {selectedTable ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                          Selected table
                        </p>
                        <h3 className="mt-1 text-xl font-semibold text-white">
                          {selectedTable.label} • {selectedTable.capacity} seats
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                          Status updates in real time with automatic transitions.
                        </p>
                      </div>
                      <Pill className={TABLE_STATUS_STYLES[selectedTable.status]}>
                        {selectedTable.status}
                      </Pill>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs text-slate-500">Guest</p>
                        <p className="mt-1 font-medium text-white">{selectedTable.guest || "None assigned"}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs text-slate-500">Party size</p>
                        <p className="mt-1 font-medium text-white">{selectedTable.party || "—"}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs text-slate-500">Remaining</p>
                        <p className="mt-1 font-medium text-white">
                          {selectedTable.status === "Available"
                            ? "Ready for allocation"
                            : formatDuration(selectedTable.remaining)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs text-slate-500">Capacity</p>
                        <p className="mt-1 font-medium text-white">
                          {selectedTable.capacity} guests
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <BaseButton
                        variant="primary"
                        onClick={() => quickTableAction(selectedTable)}
                        className="w-full"
                      >
                        {selectedTable.status === "Available"
                          ? "Reserve now"
                          : selectedTable.status === "Reserved"
                          ? "Seat immediately"
                          : selectedTable.status === "Occupied"
                          ? "Start cleaning"
                          : "Mark available"}
                      </BaseButton>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <BaseButton
                          onClick={() =>
                            updateTable(
                              selectedTable.id,
                              (current) => ({
                                ...current,
                                status: "Available",
                                guest: "",
                                party: 0,
                                remaining: 0,
                              }),
                              `${selectedTable.label} reset to available.`
                            )
                          }
                        >
                          Reset table
                        </BaseButton>
                        <BaseButton
                          variant="ghost"
                          onClick={() => setReservationForm((prev) => ({ ...prev, tableId: selectedTable.id }))}
                        >
                          Load into form
                        </BaseButton>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Digital Menu & Room Service"
            subtitle="Stock-aware category filtering with a fully interactive room service cart."
            icon={UtensilsCrossed}
            className="xl:col-span-5"
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Pill className="border-amber-400/20 bg-amber-400/10 text-amber-200">
                  {formatMoney(cartSubtotal)}
                </Pill>
                <Pill className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  {cart.length} items
                </Pill>
              </div>
            }
          >
            <div className="grid gap-5 lg:grid-cols-[1.15fr,0.95fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <BaseButton
                      key={category}
                      variant={selectedCategory === category ? "primary" : "secondary"}
                      onClick={() => setSelectedCategory(category)}
                      className="px-3 py-2 text-xs"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      {category}
                    </BaseButton>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {filteredMenuItems.length ? (
                    filteredMenuItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 transition hover:border-white/20 hover:bg-white/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                          </div>
                          <Pill
                            className={
                              item.stock > 3
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                                : "border-rose-400/20 bg-rose-400/10 text-rose-200"
                            }
                          >
                            Stock {item.stock}
                          </Pill>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                          <Pill className="border-white/10 bg-white/5 text-slate-200">{item.category}</Pill>
                          <Pill className="border-white/10 bg-white/5 text-slate-200">{item.prepTime}</Pill>
                          <Pill className="border-white/10 bg-white/5 text-slate-200">
                            <Star className="h-3.5 w-3.5 text-amber-300" />
                            {item.rating.toFixed(1)}
                          </Pill>
                          <Pill className="border-amber-400/20 bg-amber-400/10 text-amber-200">
                            {formatMoney(item.price)}
                          </Pill>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="text-sm text-slate-400">Room service ready</div>
                          <BaseButton
                            variant="primary"
                            disabled={item.stock <= 0}
                            onClick={() => addToCart(item.id)}
                          >
                            <Plus className="h-4 w-4" />
                            Add
                          </BaseButton>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm text-slate-400">
                      No menu items match your filters.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      Room service cart
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-white">
                      {formatMoney(totalAmount)}
                    </h3>
                  </div>
                  <BaseButton
                    variant="primary"
                    onClick={submitRoomServiceOrder}
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                    Send order
                  </BaseButton>
                </div>

                <div className="space-y-2">
                  {cart.length ? (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white">{item.name}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              {item.category} • {formatMoney(item.price)} each
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-white">{formatMoney(item.price * item.qty)}</p>
                            <p className="mt-1 text-xs text-slate-400">Qty {item.qty}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <BaseButton
                              onClick={() => removeOneFromCart(item.id)}
                              className="h-9 w-9 px-0"
                            >
                              <Minus className="h-4 w-4" />
                            </BaseButton>
                            <BaseButton
                              onClick={() => addToCart(item.id)}
                              className="h-9 w-9 px-0"
                            >
                              <Plus className="h-4 w-4" />
                            </BaseButton>
                          </div>
                          <BaseButton
                            variant="danger"
                            onClick={() => removeItemFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </BaseButton>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm text-slate-400">
                      Your cart is empty. Add items from the menu to start a room service request.
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <BaseButton
                    onClick={() => clearCart(true)}
                    disabled={!cart.length}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Cancel cart
                  </BaseButton>
                  <BaseButton
                    variant="secondary"
                    onClick={() => pushNotice(`${roomServiceOrders.length} historical room service orders available.`)}
                    className="flex-1"
                  >
                    View history
                  </BaseButton>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">Recent room service orders</p>
                    <Pill className="border-white/10 bg-white/5 text-slate-200">
                      {roomServiceOrders.length}
                    </Pill>
                  </div>

                  <div className="space-y-2">
                    {roomServiceOrders.length ? (
                      roomServiceOrders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-slate-300">
                              {order.items.length} items • {order.placedAt}
                            </div>
                            <Pill
                              className="border-amber-400/20 bg-amber-400/10 text-amber-200"
                            >
                              {order.status}
                            </Pill>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-slate-400">Total</span>
                            <span className="font-semibold text-white">{formatMoney(order.total)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
                        No submitted orders yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="POS & Billing System"
            subtitle="Interactive calculator, editable billing rules, and a live hotel summary."
            icon={Calculator}
            className="xl:col-span-4"
            action={receiptActionPill}
          >
            <div className="grid gap-5 lg:grid-cols-[0.95fr,1.05fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    Calculator
                  </p>

                  <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-xs text-slate-500">Expression</p>
                    <p className="mt-1 break-words text-lg font-semibold text-white">
                      {calculatorExpression || "0"}
                    </p>
                    <p className="mt-3 text-xs text-slate-500">Preview</p>
                    <p className="mt-1 text-3xl font-semibold text-amber-300">
                      {calculatorPreview === null ? "—" : formatMoney(calculatorPreview)}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {POS_BUTTONS.flat().map((key) => (
                      <BaseButton
                        key={key}
                        onClick={() => handleCalculatorKey(key)}
                        className={`h-12 px-0 text-base ${
                          key === "⌫" ? "text-rose-200" : ""
                        }`}
                        variant={(key as any) === "C" ? "danger" : "secondary"}
                      >
                        {key}
                      </BaseButton>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <BaseButton variant="primary" onClick={() => handleCalculatorKey("=")}>
                      =
                    </BaseButton>
                    <BaseButton onClick={applyCalculatorToAdjustment}>Use result</BaseButton>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      Billing controls
                    </p>
                    <Pill className="border-sky-400/20 bg-sky-400/10 text-sky-200">
                      {splitCount} split
                    </Pill>
                  </div>

                  <div className="mt-3 grid gap-3">
                    <label className="grid gap-2">
                      <span className="text-xs text-slate-400">Service charge %</span>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={serviceChargeRate}
                        onChange={(e) => setServiceChargeRate(Number(e.target.value))}
                        className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs text-slate-400">Tax %</span>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs text-slate-400">Discount %</span>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={discountPct}
                        onChange={(e) => setDiscountPct(Number(e.target.value))}
                        className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs text-slate-400">Tip %</span>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={tipPct}
                        onChange={(e) => setTipPct(Number(e.target.value))}
                        className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs text-slate-400">Manual adjustment</span>
                      <input
                        type="number"
                        step={0.01}
                        value={manualAdjustment}
                        onChange={(e) => setManualAdjustment(Number(e.target.value))}
                        className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                      />
                    </label>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">Service charge enabled</p>
                        <p className="text-xs text-slate-400">Toggle hotel service fee on or off.</p>
                      </div>
                      <BaseButton
                        variant={serviceChargeEnabled ? "primary" : "secondary"}
                        onClick={() => setServiceChargeEnabled((prev) => !prev)}
                      >
                        {serviceChargeEnabled ? "On" : "Off"}
                      </BaseButton>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">Split bill</p>
                        <p className="text-xs text-slate-400">Divide the final total equally.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <BaseButton
                          className="h-9 w-9 px-0"
                          onClick={() => setSplitCount((prev) => Math.max(1, prev - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </BaseButton>
                        <span className="min-w-8 text-center text-sm font-semibold text-white">
                          {splitCount}
                        </span>
                        <BaseButton
                          className="h-9 w-9 px-0"
                          onClick={() => setSplitCount((prev) => Math.min(12, prev + 1))}
                        >
                          <Plus className="h-4 w-4" />
                        </BaseButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      Summary
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-white">{formatMoney(totalAmount)}</h3>
                  </div>
                  <Pill className="border-amber-400/20 bg-amber-400/10 text-amber-200">
                    {formatMoney(splitAmount)} / guest
                  </Pill>
                </div>

                <div className="space-y-2 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-medium text-white">{formatMoney(cartSubtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Service charge</span>
                    <span className="font-medium text-white">{formatMoney(serviceCharge)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Discount</span>
                    <span className="font-medium text-white">- {formatMoney(discountAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Manual adjustment</span>
                    <span className="font-medium text-white">{formatMoney(manualAdjustment)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tax</span>
                    <span className="font-medium text-white">{formatMoney(taxAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tip</span>
                    <span className="font-medium text-white">{formatMoney(tipAmount)}</span>
                  </div>
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <div className="flex items-center justify-between text-base font-semibold">
                      <span className="text-white">Total</span>
                      <span className="text-amber-300">{formatMoney(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Receipt preview</p>
                  <div className="mt-3 space-y-2 text-sm">
                    {cart.length ? (
                      cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3">
                          <span className="truncate text-slate-300">
                            {item.qty}x {item.name}
                          </span>
                          <span className="font-medium text-white">
                            {formatMoney(item.price * item.qty)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">No items added yet.</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <BaseButton variant="primary" onClick={copyReceipt}>
                    <Copy className="h-4 w-4" />
                    Copy receipt
                  </BaseButton>
                  <BaseButton onClick={printReceipt}>
                    <Printer className="h-4 w-4" />
                    Print
                  </BaseButton>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Feedback & Review Management"
            subtitle="Guest sentiment charts, moderation, and feedback capture."
            icon={BarChart3}
            className="xl:col-span-8"
            action={feedbackPill}
          >
            <div className="grid gap-5 xl:grid-cols-[1.2fr,0.8fr]">
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">Star distribution</p>
                      <Pill className="border-white/10 bg-white/5 text-slate-200">Bar chart</Pill>
                    </div>
                    <div className="h-64">
                      {chartsReady ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={ratingsChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                            <XAxis dataKey="rating" stroke="#94a3b8" tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip
                              contentStyle={chartTooltipStyle}
                              cursor={{ fill: "rgba(255,255,255,0.04)" }}
                            />
                            <Bar dataKey="value" fill="#f59e0b" radius={[10, 10, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full rounded-2xl border border-dashed border-white/10 bg-slate-950/30 animate-pulse" />
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">Weekday trend</p>
                      <Pill className="border-white/10 bg-white/5 text-slate-200">Line chart</Pill>
                    </div>
                    <div className="h-64">
                      {chartsReady ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={weekdayChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                            <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[0, 5]} />
                            <Tooltip contentStyle={chartTooltipStyle} />
                            <Line
                              type="monotone"
                              dataKey="average"
                              stroke="#38bdf8"
                              strokeWidth={3}
                              dot={{ r: 4, fill: "#38bdf8" }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full rounded-2xl border border-dashed border-white/10 bg-slate-950/30 animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Guest reviews</p>
                    <Pill className="border-slate-400/20 bg-white/5 text-slate-200">
                      {filteredReviews.length} visible
                    </Pill>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(["All", "Positive", "Neutral", "Negative"] as const).map((item) => (
                      <BaseButton
                        key={item}
                        variant={reviewFilter === item ? "primary" : "secondary"}
                        onClick={() => setReviewFilter(item)}
                        className="px-3 py-2 text-xs"
                      >
                        <Filter className="h-3.5 w-3.5" />
                        {item}
                      </BaseButton>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3">
                    {filteredReviews.length ? (
                      filteredReviews.map((review) => (
                        <button
                          key={review.id}
                          type="button"
                          onClick={() => setSelectedReviewId(review.id)}
                          className={`rounded-2xl border p-4 text-left transition ${
                            selectedReviewId === review.id
                              ? "border-amber-400/30 bg-amber-400/10"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-white">{review.name}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Pill className={SENTIMENT_STYLES[review.sentiment]}>
                                  {review.sentiment}
                                </Pill>
                                <Pill className="border-white/10 bg-white/5 text-slate-200">
                                  {review.source}
                                </Pill>
                                <Pill className="border-white/10 bg-white/5 text-slate-200">
                                  {review.weekday}
                                </Pill>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-amber-300">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                  key={index}
                                  className={`h-4 w-4 ${index < review.rating ? "fill-current" : "text-slate-600"}`}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="mt-3 line-clamp-2 text-sm text-slate-300">
                            {review.comment}
                          </p>

                          <div className="mt-4 flex items-center justify-end">
                            <BaseButton
                              variant="danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteReview(review.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </BaseButton>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm text-slate-400">
                        No reviews match the current filter.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    Selected review
                  </p>
                  {selectedReview ? (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{selectedReview.name}</h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {selectedReview.source} • {selectedReview.weekday}
                          </p>
                        </div>
                        <Pill className={SENTIMENT_STYLES[selectedReview.sentiment]}>
                          {selectedReview.sentiment}
                        </Pill>
                      </div>

                      <div className="flex items-center gap-1 text-amber-300">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${index < selectedReview.rating ? "fill-current" : "text-slate-600"}`}
                          />
                        ))}
                      </div>

                      <p className="text-sm leading-6 text-slate-300">{selectedReview.comment}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">No review selected.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    Add guest feedback
                  </p>

                  <div className="mt-3 grid gap-3">
                    <input
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Guest name"
                      className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-xs text-slate-400">Rating</span>
                        <select
                          value={reviewForm.rating}
                          onChange={(e) =>
                            setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))
                          }
                          className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                        >
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <option key={rating} value={rating}>
                              {rating} star{rating > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-2">
                        <span className="text-xs text-slate-400">Source</span>
                        <select
                          value={reviewForm.source}
                          onChange={(e) =>
                            setReviewForm((prev) => ({ ...prev, source: e.target.value }))
                          }
                          className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                        >
                          {["Dining", "Room Service", "Banquet"].map((source) => (
                            <option key={source} value={source}>
                              {source}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <textarea
                      rows={5}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                      placeholder="Write a professional guest review..."
                      className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                    />
                    <BaseButton variant="primary" onClick={submitReview}>
                      <Sparkles className="h-4 w-4" />
                      Save feedback
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Event & Banquet Management"
            subtitle="Interactive calendar view for weddings, conferences, banquets, and private dining."
            icon={CalendarRange}
            className="xl:col-span-12"
            action={eventPill}
          >
            <div className="grid gap-5 xl:grid-cols-[1.4fr,0.9fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {formatMonthLabel(displayMonth)}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Click a day to inspect or schedule banquet activity.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <BaseButton onClick={() => shiftMonth(-1)} className="h-10 w-10 px-0">
                      <ChevronLeft className="h-4 w-4" />
                    </BaseButton>
                    <BaseButton onClick={goToToday}>Today</BaseButton>
                    <BaseButton onClick={() => shiftMonth(1)} className="h-10 w-10 px-0">
                      <ChevronRight className="h-4 w-4" />
                    </BaseButton>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-400">
                  {weekdays.map((day) => (
                    <div key={day} className="py-1">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarCells.map((cell) => {
                    const dayEvents = events
                      .filter((event) => event.date === cell.dateKey)
                      .filter((event) => matchesSearch(event.title) || matchesSearch(event.location) || matchesSearch(event.type))
                      .sort((a, b) => a.time.localeCompare(b.time));

                    return (
                      <button
                        key={cell.dateKey}
                        type="button"
                        onClick={() => {
                          setSelectedDateKey(cell.dateKey);
                          setEventForm((prev) => ({ ...prev, date: cell.dateKey }));
                        }}
                        className={`min-h-28 rounded-2xl border p-2 text-left transition ${
                          cell.inMonth
                            ? "border-white/10 bg-slate-950/45 hover:border-white/20 hover:bg-white/5"
                            : "border-white/5 bg-slate-950/20 text-slate-600"
                        } ${
                          cell.isToday ? "ring-1 ring-amber-400/40" : ""
                        } ${
                          selectedDateKey === cell.dateKey ? "border-amber-400/30 bg-amber-400/10" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-sm font-semibold ${cell.inMonth ? "text-white" : "text-slate-600"}`}>
                            {cell.dayNumber}
                          </span>
                          {dayEvents.length ? (
                            <Pill className="border-white/10 bg-white/5 text-slate-200">
                              {dayEvents.length}
                            </Pill>
                          ) : null}
                        </div>

                        <div className="mt-2 space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`rounded-lg border px-2 py-1 text-[11px] ${EVENT_TYPE_STYLES[event.type] ?? "border-white/10 bg-white/5 text-slate-200"}`}
                            >
                              <div className="truncate font-medium">{event.title}</div>
                              <div className="truncate text-[10px] opacity-80">
                                {event.time} • {event.location}
                              </div>
                            </div>
                          ))}
                          {dayEvents.length > 2 ? (
                            <div className="text-[11px] text-slate-400">+{dayEvents.length - 2} more</div>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    Selected date
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    {formatReadableDate(selectedDateKey)}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {selectedDateEvents.length} event{selectedDateEvents.length === 1 ? "" : "s"} scheduled
                  </p>
                </div>

                <div className="space-y-2">
                  {selectedDateEvents.length ? (
                    selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-white">{event.title}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Pill className={EVENT_TYPE_STYLES[event.type] ?? "border-white/10 bg-white/5 text-slate-200"}>
                                {event.type}
                              </Pill>
                              <Pill className="border-white/10 bg-white/5 text-slate-200">
                                {event.time}
                              </Pill>
                            </div>
                          </div>

                          <BaseButton variant="danger" onClick={() => deleteEvent(event.id)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </BaseButton>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>{event.location}</span>
                        </div>
                        <div className="mt-2 text-sm text-slate-400">
                          {event.guests} guests expected
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm text-slate-400">
                      No events scheduled for this day.
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    Add banquet event
                  </p>
                  <div className="mt-3 grid gap-3">
                    <input
                      value={eventForm.title}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Event title"
                      className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-xs text-slate-400">Date</span>
                        <input
                          type="date"
                          value={eventForm.date}
                          onChange={(e) =>
                            setEventForm((prev) => ({ ...prev, date: e.target.value }))
                          }
                          className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-xs text-slate-400">Time</span>
                        <input
                          type="time"
                          value={eventForm.time}
                          onChange={(e) => setEventForm((prev) => ({ ...prev, time: e.target.value }))}
                          className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-xs text-slate-400">Location</span>
                        <input
                          value={eventForm.location}
                          onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))}
                          placeholder="Ballroom, terrace, lounge..."
                          className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-xs text-slate-400">Guests</span>
                        <input
                          type="number"
                          min={1}
                          value={eventForm.guests}
                          onChange={(e) =>
                            setEventForm((prev) => ({ ...prev, guests: Number(e.target.value) }))
                          }
                          className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                        />
                      </label>
                    </div>

                    <label className="grid gap-2">
                      <span className="text-xs text-slate-400">Event type</span>
                      <select
                        value={eventForm.type}
                        onChange={(e) => setEventForm((prev) => ({ ...prev, type: e.target.value }))}
                        className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/40"
                      >
                        {["Banquet", "Wedding", "Corporate", "Private", "Celebration", "Conference"].map(
                          (type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <BaseButton variant="primary" onClick={submitEvent}>
                      <Plus className="h-4 w-4" />
                      Add event
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}