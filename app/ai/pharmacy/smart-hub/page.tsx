"use client";
 
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useTransition,
} from "react";
 
/* ============================================================
   TYPES
   ============================================================ */
type Theme = "dark" | "light";
type AlertLevel = "critical" | "warning" | "info" | "success";
type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "expiring_soon";
type ComplianceStatus = "compliant" | "pending" | "flagged";
type SupplierTier = "excellent" | "good" | "average" | "poor";
type WastageReason = "expired" | "damaged" | "recall" | "temperature" | "other";
type TabId =
  | "overview" | "inventory" | "patients" | "forecasting"
  | "zatca" | "suppliers" | "wastage";
 
interface PharmacyProduct {
  id: string; name: string; nameAr: string; sku: string; category: string;
  stockLevel: number; minThreshold: number; maxThreshold: number;
  unitCost: number; sellingPrice: number; vatRate: number;
  batchNumber: string; expiryDate: string; manufacturer: string;
  supplierId: string; status: StockStatus; zatcaCompliance: ComplianceStatus;
  turnoverRate: number; profitMargin: number;
  lastReorderDate: string; aiReorderSuggestion: number;
}
interface PatientRecord {
  id: string; name: string; nationalId: string; phone: string;
  medications: string[]; nextRefillDate: string; insuranceProvider: string;
  adherenceScore: number; lastVisit: string; alertStatus: AlertLevel;
}
interface AIForecast {
  productId: string; predictedDemand: number; confidence: number;
  suggestedReorder: number; priceOptimization: number;
  daysUntilStockout: number; trend: "up" | "down" | "stable";
}
interface ZATCAInvoice {
  invoiceNumber: string; qrCode: string; vatNumber: string;
  timestamp: string; totalAmount: number; vatAmount: number;
  status: "generated" | "submitted" | "cleared";
}
interface DashboardStats {
  totalInventoryValue: number; totalItems: number; lowStockCount: number;
  expiringSoonCount: number; todaySales: number; todayVAT: number;
  aiAlertsActive: number; complianceScore: number; pendingRefills: number;
  suppliersActive: number;
}
interface AICalculationResult {
  stockTurnover: number; profitMargin: number; optimalReorderPoint: number;
  suggestedPrice: number;
  vatBreakdown: { base: number; vat: number; total: number };
  forecastAccuracy: number; recommendation: string;
}
interface SearchResult {
  type: "product" | "patient" | "batch" | "invoice" | "supplier";
  id: string; title: string; subtitle: string; status: string; icon: string;
}
interface Supplier {
  id: string; name: string; nameAr: string;
  contactPerson: string; phone: string; email: string; vatNumber: string;
  totalOrders: number; onTimeDelivery: number; qualityScore: number;
  costEfficiency: number; paymentTerms: string; avgResponseHours: number;
  returnRate: number; totalValue: number; activeContracts: number;
  categories: string[]; overallScore: number; trend: "up" | "down" | "stable";
  status: SupplierTier; lastOrderDate: string;
}
interface WastageRecord {
  id: string; productId: string; productName: string; batchNumber: string;
  quantity: number; reason: WastageReason; wastageValue: number;
  wastageDate: string; recordedBy: string; category: string;
  disposalMethod: string;
}
 
/* ============================================================
   MOCK DATA
   ============================================================ */
const MOCK_STATS: DashboardStats = {
  totalInventoryValue: 2847650, totalItems: 831, lowStockCount: 12,
  expiringSoonCount: 5, todaySales: 48320, todayVAT: 7248,
  aiAlertsActive: 8, complianceScore: 97.4, pendingRefills: 23, suppliersActive: 14,
};
 
const MOCK_PRODUCTS: PharmacyProduct[] = [
  { id: "P001", name: "Amoxicillin 500mg", nameAr: "أموكسيسيلين", sku: "AMX-500-CAP", category: "Antibiotics", stockLevel: 45, minThreshold: 100, maxThreshold: 500, unitCost: 12.5, sellingPrice: 18.75, vatRate: 15, batchNumber: "B2024-0891", expiryDate: "2025-03-15", manufacturer: "Pfizer SA", supplierId: "SUP-001", status: "expiring_soon", zatcaCompliance: "compliant", turnoverRate: 4.2, profitMargin: 33.3, lastReorderDate: "2024-11-01", aiReorderSuggestion: 300 },
  { id: "P002", name: "Metformin 850mg", nameAr: "ميتفورمين", sku: "MET-850-TAB", category: "Diabetes", stockLevel: 23, minThreshold: 150, maxThreshold: 600, unitCost: 8, sellingPrice: 14.5, vatRate: 15, batchNumber: "B2024-1122", expiryDate: "2026-08-20", manufacturer: "Novartis KSA", supplierId: "SUP-002", status: "low_stock", zatcaCompliance: "compliant", turnoverRate: 6.8, profitMargin: 44.8, lastReorderDate: "2024-10-15", aiReorderSuggestion: 450 },
  { id: "P003", name: "Atorvastatin 20mg", nameAr: "أتورفاستاتين", sku: "ATV-020-TAB", category: "Cardiovascular", stockLevel: 312, minThreshold: 100, maxThreshold: 500, unitCost: 22, sellingPrice: 35, vatRate: 15, batchNumber: "B2025-0045", expiryDate: "2027-01-10", manufacturer: "AstraZeneca", supplierId: "SUP-003", status: "in_stock", zatcaCompliance: "compliant", turnoverRate: 3.1, profitMargin: 37.1, lastReorderDate: "2024-12-01", aiReorderSuggestion: 0 },
  { id: "P004", name: "Omeprazole 20mg", nameAr: "أوميبرازول", sku: "OMP-020-CAP", category: "Gastroenterology", stockLevel: 0, minThreshold: 200, maxThreshold: 800, unitCost: 5.5, sellingPrice: 10, vatRate: 15, batchNumber: "B2024-0750", expiryDate: "2026-05-30", manufacturer: "Roche KSA", supplierId: "SUP-001", status: "out_of_stock", zatcaCompliance: "pending", turnoverRate: 8.5, profitMargin: 45, lastReorderDate: "2024-09-20", aiReorderSuggestion: 600 },
];
 
const MOCK_PATIENTS: PatientRecord[] = [
  { id: "PT001", name: "Mohammed Al-Rashidi", nationalId: "1023456789", phone: "+966501234567", medications: ["Metformin 850mg", "Atorvastatin 20mg"], nextRefillDate: "2025-01-15", insuranceProvider: "Bupa Arabia", adherenceScore: 92, lastVisit: "2024-12-28", alertStatus: "warning" },
  { id: "PT002", name: "Fatima Al-Zahrani", nationalId: "2034567890", phone: "+966502345678", medications: ["Omeprazole 20mg"], nextRefillDate: "2025-01-08", insuranceProvider: "Tawuniya", adherenceScore: 78, lastVisit: "2024-12-20", alertStatus: "critical" },
];
 
const MOCK_FORECASTS: AIForecast[] = [
  { productId: "P001", predictedDemand: 280, confidence: 94.2, suggestedReorder: 300, priceOptimization: 19.5, daysUntilStockout: 3, trend: "up" },
  { productId: "P002", predictedDemand: 410, confidence: 88.7, suggestedReorder: 450, priceOptimization: 15.25, daysUntilStockout: 1, trend: "up" },
  { productId: "P003", predictedDemand: 95, confidence: 91.3, suggestedReorder: 0, priceOptimization: 35, daysUntilStockout: 98, trend: "stable" },
  { productId: "P004", predictedDemand: 520, confidence: 96.1, suggestedReorder: 600, priceOptimization: 11, daysUntilStockout: 0, trend: "up" },
];
 
const MOCK_SUPPLIERS: Supplier[] = [
  { id: "SUP-001", name: "Pfizer Saudi Arabia", nameAr: "فايزر السعودية", contactPerson: "Ahmed Al-Saif", phone: "+966112345678", email: "orders@pfizer-sa.com", vatNumber: "300123456700003", totalOrders: 148, onTimeDelivery: 96.5, qualityScore: 98.2, costEfficiency: 88.5, paymentTerms: "Net 30", avgResponseHours: 4.2, returnRate: 0.8, totalValue: 1245800, activeContracts: 12, categories: ["Antibiotics", "Gastroenterology"], overallScore: 94.3, trend: "up", status: "excellent", lastOrderDate: "2024-12-28" },
  { id: "SUP-002", name: "Novartis KSA", nameAr: "نوفارتس السعودية", contactPerson: "Sarah Al-Mutairi", phone: "+966113456789", email: "supply@novartis-ksa.com", vatNumber: "300234567800003", totalOrders: 92, onTimeDelivery: 91.2, qualityScore: 95.4, costEfficiency: 92.1, paymentTerms: "Net 45", avgResponseHours: 6.8, returnRate: 1.2, totalValue: 872400, activeContracts: 8, categories: ["Diabetes", "Cardiovascular"], overallScore: 91.7, trend: "stable", status: "excellent", lastOrderDate: "2024-12-22" },
  { id: "SUP-003", name: "AstraZeneca ME", nameAr: "أسترازينيكا الشرق الأوسط", contactPerson: "Khalid Al-Otaibi", phone: "+966114567890", email: "b2b@astrazeneca-me.com", vatNumber: "300345678900003", totalOrders: 76, onTimeDelivery: 88.5, qualityScore: 96.8, costEfficiency: 85.3, paymentTerms: "Net 60", avgResponseHours: 8.4, returnRate: 1.5, totalValue: 638900, activeContracts: 6, categories: ["Cardiovascular", "Oncology"], overallScore: 89.1, trend: "up", status: "good", lastOrderDate: "2024-12-15" },
  { id: "SUP-004", name: "GSK Middle East", nameAr: "جي إس كي الشرق الأوسط", contactPerson: "Reem Al-Harbi", phone: "+966115678901", email: "orders@gsk-me.com", vatNumber: "300456789000003", totalOrders: 54, onTimeDelivery: 82.3, qualityScore: 90.1, costEfficiency: 78.5, paymentTerms: "Net 30", avgResponseHours: 12.5, returnRate: 3.2, totalValue: 412500, activeContracts: 4, categories: ["Respiratory", "Vaccines"], overallScore: 78.6, trend: "down", status: "average", lastOrderDate: "2024-12-01" },
  { id: "SUP-005", name: "Local Pharma Distributors", nameAr: "الموزعون الصيدلانيون المحليون", contactPerson: "Omar Al-Ghamdi", phone: "+966116789012", email: "sales@localpharma.sa", vatNumber: "300567890100003", totalOrders: 34, onTimeDelivery: 71.5, qualityScore: 82.4, costEfficiency: 95.2, paymentTerms: "Net 15", avgResponseHours: 24, returnRate: 5.8, totalValue: 187300, activeContracts: 3, categories: ["OTC", "Generic"], overallScore: 68.2, trend: "down", status: "poor", lastOrderDate: "2024-11-30" },
];
 
const MOCK_WASTAGE: WastageRecord[] = [
  { id: "W001", productId: "P001", productName: "Amoxicillin 500mg", batchNumber: "B2023-0445", quantity: 32, reason: "expired", wastageValue: 400, wastageDate: "2025-01-05", recordedBy: "Ahmed Al-Saif", category: "Antibiotics", disposalMethod: "MOH Certified Incineration" },
  { id: "W002", productId: "P004", productName: "Omeprazole 20mg", batchNumber: "B2023-1128", quantity: 85, reason: "expired", wastageValue: 467.5, wastageDate: "2025-01-04", recordedBy: "Sarah Al-Mutairi", category: "Gastroenterology", disposalMethod: "MOH Certified Incineration" },
  { id: "W003", productId: "P002", productName: "Metformin 850mg", batchNumber: "B2024-0512", quantity: 12, reason: "damaged", wastageValue: 96, wastageDate: "2025-01-03", recordedBy: "Khalid Al-Otaibi", category: "Diabetes", disposalMethod: "Damaged Return" },
  { id: "W004", productId: "P003", productName: "Atorvastatin 20mg", batchNumber: "B2024-0089", quantity: 8, reason: "temperature", wastageValue: 176, wastageDate: "2025-01-02", recordedBy: "Reem Al-Harbi", category: "Cardiovascular", disposalMethod: "Cold Chain Report" },
  { id: "W005", productId: "P001", productName: "Amoxicillin 500mg", batchNumber: "B2023-0891", quantity: 6, reason: "recall", wastageValue: 75, wastageDate: "2024-12-30", recordedBy: "Ahmed Al-Saif", category: "Antibiotics", disposalMethod: "Manufacturer Return" },
];
 
/* ============================================================
   UTILITIES
   ============================================================ */
const formatSAR = (v: number) =>
  new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR", minimumFractionDigits: 2 }).format(v);
const formatNumber = (v: number) => new Intl.NumberFormat("en-US").format(v);
const getDaysUntilExpiry = (d: string) =>
  Math.ceil((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
const calculateZATCAVAT = (base: number, rate: number) => {
  const vat = base * (rate / 100);
  return { base, vat, total: base + vat };
};
const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");
 
/* ============================================================
   SUB-COMPONENTS
   ============================================================ */
const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl p-5 bg-white/5 border border-white/10">
    <div className="h-3 w-24 bg-white/10 rounded mb-3" />
    <div className="h-8 w-32 bg-white/10 rounded mb-2" />
    <div className="h-3 w-16 bg-white/10 rounded" />
  </div>
);
 
const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { label: string; cls: string }> = {
    in_stock: { label: "In Stock", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    low_stock: { label: "Low Stock", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    out_of_stock: { label: "Out of Stock", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
    expiring_soon: { label: "Expiring Soon", cls: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
    compliant: { label: "ZATCA ✓", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    pending: { label: "Pending", cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
    flagged: { label: "Flagged", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
    critical: { label: "Critical", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
    warning: { label: "Warning", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    info: { label: "Info", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    success: { label: "Good", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    excellent: { label: "Excellent", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    good: { label: "Good", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    average: { label: "Average", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    poor: { label: "Poor", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
    expired: { label: "Expired", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
    damaged: { label: "Damaged", cls: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
    recall: { label: "Recall", cls: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
    temperature: { label: "Cold Chain", cls: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
    other: { label: "Other", cls: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
  };
  const cfg = configs[status] ?? { label: status, cls: "bg-slate-500/15 text-slate-400 border-slate-500/30" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.cls}`}>{cfg.label}</span>;
};
 
const TrendIndicator = ({ trend, value }: { trend: "up" | "down" | "stable"; value?: number }) => {
  const icons = { up: "↑", down: "↓", stable: "→" };
  const colors = { up: "text-emerald-400", down: "text-red-400", stable: "text-slate-400" };
  return <span className={`text-xs font-bold ${colors[trend]}`}>{icons[trend]} {value !== undefined && `${value}%`}</span>;
};
 
const ProgressRing = ({ value, size = 56, stroke = 4, color = "#6366f1" }: { value: number; size?: number; stroke?: number; color?: string }) => {
  const radius = (size - stroke) / 2;
  const c = radius * 2 * Math.PI;
  const offset = c - (value / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-white/10" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
};
 
const Sparkline = ({ data, color = "#6366f1" }: { data: number[]; color?: string }) => {
  if (!data || data.length < 2) return <div className="h-8" />;
  const max = Math.max(...data), min = Math.min(...data);
  const w = 80, h = 32;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / (max - min || 1)) * h} r="3" fill={color} />
    </svg>
  );
};
 
/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function SmartPharmacyHub() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<PharmacyProduct[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [forecasts, setForecasts] = useState<AIForecast[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [wastageRecords, setWastageRecords] = useState<WastageRecord[]>([]);
  const [aiCalcInput, setAiCalcInput] = useState({ costPrice: "", sellingPrice: "", quantity: "" });
  const [aiCalcResult, setAiCalcResult] = useState<AICalculationResult | null>(null);
  const [aiCalcLoading, setAiCalcLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PharmacyProduct | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [wastageFilter, setWastageFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof PharmacyProduct>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [notifications, setNotifications] = useState<{ id: string; msg: string; level: AlertLevel }[]>([]);
  const [, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);
  const [replenishTriggered, setReplenishTriggered] = useState<string[]>([]);
  const [invoiceModal, setInvoiceModal] = useState<ZATCAInvoice | null>(null);
  const [pulse, setPulse] = useState(false);
  const [contactModal, setContactModal] = useState<Supplier | null>(null);
  const [wastageModal, setWastageModal] = useState<WastageRecord | null>(null);
  const [currentDate, setCurrentDate] = useState<string>("");
 
  /* ---------------- boot ---------------- */
  useEffect(() => {
    const boot = async () => {
      await new Promise((r) => setTimeout(r, 800));
      setStats(MOCK_STATS);
      setProducts(MOCK_PRODUCTS);
      setPatients(MOCK_PATIENTS);
      setForecasts(MOCK_FORECASTS);
      setSuppliers(MOCK_SUPPLIERS);
      setWastageRecords(MOCK_WASTAGE);
      setNotifications([
        { id: "n1", msg: "Amoxicillin 500mg expires in 3 days — Batch B2024-0891", level: "critical" },
        { id: "n2", msg: "Metformin 850mg below reorder threshold — AI suggests 450 units", level: "warning" },
        { id: "n3", msg: "Patient Fatima Al-Zahrani refill overdue by 2 days", level: "critical" },
        { id: "n4", msg: "ZATCA E-Invoice #INV-2025-00891 successfully cleared", level: "success" },
      ]);
      setLoading(false);
    };
    boot();
  }, []);
 
  /* ---------------- pulse ---------------- */
  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 2000);
    return () => clearInterval(t);
  }, []);
 
  /* ---------------- current date (client only, avoids hydration mismatch) ---------------- */
  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    );
  }, []);
 
  /* ---------------- search ---------------- */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results: SearchResult[] = [
      ...products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.batchNumber.toLowerCase().includes(q)
        )
        .map((p) => ({
          type: "product" as const,
          id: p.id,
          title: p.name,
          subtitle: `SKU: ${p.sku} • Batch: ${p.batchNumber}`,
          status: p.status,
          icon: "💊",
        })),
      ...patients
        .filter((pt) => pt.name.toLowerCase().includes(q) || pt.nationalId.includes(q))
        .map((pt) => ({
          type: "patient" as const,
          id: pt.id,
          title: pt.name,
          subtitle: `ID: ${pt.nationalId} • Refill: ${pt.nextRefillDate}`,
          status: pt.alertStatus,
          icon: "👤",
        })),
      ...suppliers
        .filter((s) => s.name.toLowerCase().includes(q))
        .map((s) => ({
          type: "supplier" as const,
          id: s.id,
          title: s.name,
          subtitle: `${s.totalOrders} orders • Score ${s.overallScore}%`,
          status: s.status,
          icon: "🚚",
        })),
    ];
    setSearchResults(results.slice(0, 6));
  }, [searchQuery, products, patients, suppliers]);
 
  /* ---------------- AI calc ---------------- */
  const runAICalculation = useCallback(async () => {
    const cost = parseFloat(aiCalcInput.costPrice);
    const sell = parseFloat(aiCalcInput.sellingPrice);
    const qty = parseFloat(aiCalcInput.quantity);
    if (!cost || !sell || !qty) return;
    setAiCalcLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const margin = ((sell - cost) / sell) * 100;
    const vatBreakdown = calculateZATCAVAT(sell, 15);
    const turnover = (qty * sell) / ((cost * qty) / 2);
    const optimalReorder = Math.round(qty * 0.25);
    const suggestedPrice = sell * (1 + (margin < 30 ? 0.08 : 0.03));
    setAiCalcResult({
      stockTurnover: parseFloat(turnover.toFixed(2)),
      profitMargin: parseFloat(margin.toFixed(2)),
      optimalReorderPoint: optimalReorder,
      suggestedPrice: parseFloat(suggestedPrice.toFixed(2)),
      vatBreakdown,
      forecastAccuracy: 91.4 + Math.random() * 7,
      recommendation:
        margin < 25
          ? "⚠️ Margin below target. AI recommends 8% price increase to meet 30% threshold."
          : margin > 50
          ? "✅ Strong margin. Consider volume discount to boost turnover rate."
          : "✅ Optimal pricing. Maintain current strategy with quarterly review.",
    });
    setAiCalcLoading(false);
  }, [aiCalcInput]);
 
  const triggerReplenishment = useCallback(
    (productId: string) => {
      setReplenishTriggered((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
      const prod = products.find((p) => p.id === productId);
      setNotifications((prev) => [
        {
          id: `rep-${productId}-${Date.now()}`,
          msg: `Auto-replenishment PO generated for ${prod?.name ?? productId}`,
          level: "success",
        },
        ...prev,
      ]);
    },
    [products]
  );
 
  const generateZATCAInvoice = useCallback(() => {
    setInvoiceModal({
      invoiceNumber: `INV-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`,
      qrCode: "AQdTYW1sZSBCdXNpbmVzcwIPMTUwMDAwMDAwMDAwMDAz",
      vatNumber: "310089474500003",
      timestamp: new Date().toISOString(),
      totalAmount: 2345.75,
      vatAmount: 351.86,
      status: "generated",
    });
  }, []);
 
  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (filterStatus !== "all") list = list.filter((p) => p.status === filterStatus);
    if (searchQuery && activeTab === "inventory") {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [products, filterStatus, searchQuery, activeTab, sortField, sortDir]);
 
  const filteredSuppliers = useMemo(() => {
    if (supplierFilter === "all") return [...suppliers].sort((a, b) => b.overallScore - a.overallScore);
    return suppliers.filter((s) => s.status === supplierFilter).sort((a, b) => b.overallScore - a.overallScore);
  }, [suppliers, supplierFilter]);
 
  const filteredWastage = useMemo(() => {
    if (wastageFilter === "all") return wastageRecords;
    return wastageRecords.filter((w) => w.reason === wastageFilter);
  }, [wastageRecords, wastageFilter]);
 
  const wastageSummary = useMemo(() => {
    const total = wastageRecords.reduce((s, w) => s + w.wastageValue, 0);
    const totalUnits = wastageRecords.reduce((s, w) => s + w.quantity, 0);
    const byReason: Record<string, number> = {};
    wastageRecords.forEach((w) => {
      byReason[w.reason] = (byReason[w.reason] ?? 0) + w.wastageValue;
    });
    return { totalValue: total, totalUnits, byReason, records: wastageRecords.length };
  }, [wastageRecords]);
 
  const expiryBuckets = useMemo(() => {
    const buckets = {
      critical: [] as PharmacyProduct[],
      warning: [] as PharmacyProduct[],
      watch: [] as PharmacyProduct[],
    };
    products.forEach((p) => {
      const d = getDaysUntilExpiry(p.expiryDate);
      if (d < 30) buckets.critical.push(p);
      else if (d < 90) buckets.warning.push(p);
      else if (d < 180) buckets.watch.push(p);
    });
    return buckets;
  }, [products]);
 
  const toggleSort = (field: keyof PharmacyProduct) => {
    startTransition(() => {
      if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSortField(field);
        setSortDir("asc");
      }
    });
  };
 
  /* ---------------- theme classes ---------------- */
  const isDark = theme === "dark";
  const bg = isDark ? "bg-[#0a0f1e]" : "bg-slate-50";
  const border = isDark ? "border-white/8" : "border-slate-200";
  const text = isDark ? "text-slate-100" : "text-slate-900";
  const subtext = isDark ? "text-slate-400" : "text-slate-500";
  const cardBg = isDark ? "bg-gradient-to-br from-white/5 to-white/2" : "bg-white";
  const inputBg = isDark
    ? "bg-white/5 border-white/10 text-white placeholder-white/30"
    : "bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400";
  const hoverBg = isDark ? "hover:bg-white/5" : "hover:bg-slate-50";
  const hoverBg2 = isDark ? "hover:bg-white/10" : "hover:bg-slate-100";
  const softBg = isDark ? "bg-white/6" : "bg-slate-100";
 
  const statCards = stats
    ? [
        { label: "Inventory Value", value: formatSAR(stats.totalInventoryValue), sub: "+8.3% vs last month", color: "#6366f1", data: [320, 380, 350, 420, 390, 460, 510, 480, 530, 560, 590, 620] },
        { label: "Total Items", value: formatNumber(stats.totalItems), sub: "12 categories", color: "#0ea5e9", data: [790, 800, 810, 805, 820, 815, 825, 830, 828, 831] },
        { label: "Low Stock Alerts", value: String(stats.lowStockCount), sub: "Immediate action", color: "#f59e0b", data: [5, 8, 6, 10, 9, 11, 12, 12] },
        { label: "Expiring Soon", value: String(stats.expiringSoonCount), sub: "Within 30 days", color: "#ef4444", data: [2, 3, 2, 4, 3, 5, 5] },
        { label: "Today's Sales", value: formatSAR(stats.todaySales), sub: `VAT: ${formatSAR(stats.todayVAT)}`, color: "#10b981", data: [32000, 35000, 38000, 41000, 39000, 43000, 48320] },
        { label: "AI Alerts Active", value: String(stats.aiAlertsActive), sub: "Real-time monitoring", color: "#8b5cf6", data: [3, 5, 4, 6, 7, 8, 8] },
        { label: "ZATCA Compliance", value: `${stats.complianceScore}%`, sub: "Fully compliant", color: "#06b6d4", data: [94, 95, 96, 95.5, 97, 96.8, 97.4] },
        { label: "Pending Refills", value: String(stats.pendingRefills), sub: `${stats.suppliersActive} suppliers`, color: "#f43f5e", data: [15, 18, 20, 22, 23, 23] },
      ]
    : [];
 
  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "inventory", label: "Inventory", icon: "📦" },
    { id: "patients", label: "Patients", icon: "👥" },
    { id: "forecasting", label: "AI Forecast", icon: "🤖" },
    { id: "zatca", label: "ZATCA", icon: "🧾" },
    { id: "suppliers", label: "Suppliers", icon: "🚚" },
    { id: "wastage", label: "Wastage & Expiry", icon: "🗑️" },
  ];
 
  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div
      className={cn("min-h-screen font-sans antialiased transition-colors duration-300", bg, text)}
      style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
    >
      {isDark && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 60%), linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "auto, 40px 40px, 40px 40px",
          }}
        />
      )}
 
      {/* ============ ZATCA MODAL ============ */}
      {invoiceModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setInvoiceModal(null)}
        >
          <div
            className={cn("rounded-3xl p-8 max-w-md w-full border shadow-2xl", isDark ? "bg-[#111827]" : "bg-white", border)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg">🧾</div>
              <div>
                <h3 className="font-bold text-base">ZATCA E-Invoice Generated</h3>
                <p className={cn("text-xs", subtext)}>{invoiceModal.invoiceNumber}</p>
              </div>
              <span className="ml-auto">
                <StatusBadge status="compliant" />
              </span>
            </div>
            <div className={cn("space-y-3 text-sm", subtext)}>
              {[
                ["VAT Number", invoiceModal.vatNumber],
                ["Invoice No.", invoiceModal.invoiceNumber],
                ["Timestamp", new Date(invoiceModal.timestamp).toLocaleString("en-SA")],
                ["Base", formatSAR(invoiceModal.totalAmount)],
                ["VAT (15%)", formatSAR(invoiceModal.vatAmount)],
                ["Total", formatSAR(invoiceModal.totalAmount + invoiceModal.vatAmount)],
              ].map(([k, v]) => (
                <div key={k} className={cn("flex justify-between py-2 border-b", border)}>
                  <span>{k}</span>
                  <span className={cn("font-semibold", text)}>{v}</span>
                </div>
              ))}
            </div>
            <div className={cn("mt-4 p-3 rounded-xl text-center", isDark ? "bg-white/5" : "bg-slate-50")}>
              <p className={cn("text-[10px] mb-1", subtext)}>ZATCA QR Code</p>
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-lg">
                <div
                  className="w-20 h-20 bg-slate-900 rounded"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Crect width='4' height='4' fill='black'/%3E%3Crect x='6' width='4' height='4' fill='black'/%3E%3Crect y='6' width='4' height='4' fill='black'/%3E%3Crect x='1' y='1' width='2' height='2' fill='white'/%3E%3Crect x='7' y='1' width='2' height='2' fill='white'/%3E%3Crect x='1' y='7' width='2' height='2' fill='white'/%3E%3Crect x='6' y='5' width='1' height='1' fill='black'/%3E%3C/svg%3E")`,
                    backgroundSize: "cover",
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setInvoiceModal(null);
                  setNotifications((prev) => [
                    { id: `zx-${Date.now()}`, msg: `Invoice submitted to ZATCA portal`, level: "success" },
                    ...prev,
                  ]);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
              >
                Submit to ZATCA
              </button>
              <button
                onClick={() => setInvoiceModal(null)}
                className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors", softBg, hoverBg2)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* ============ SUPPLIER CONTACT MODAL ============ */}
      {contactModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setContactModal(null)}
        >
          <div
            className={cn("rounded-3xl p-6 max-w-md w-full border shadow-2xl", isDark ? "bg-[#111827]" : "bg-white", border)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold">
                🚚
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{contactModal.name}</h3>
                <p className={cn("text-[11px]", subtext)}>{contactModal.nameAr}</p>
              </div>
              <StatusBadge status={contactModal.status} />
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["Contact Person", contactModal.contactPerson],
                ["Phone", contactModal.phone],
                ["Email", contactModal.email],
                ["VAT No.", contactModal.vatNumber],
                ["Payment Terms", contactModal.paymentTerms],
                ["Total Value", formatSAR(contactModal.totalValue)],
                ["Overall Score", `${contactModal.overallScore}%`],
              ].map(([k, v]) => (
                <div key={k} className={cn("flex justify-between py-2 border-b", border)}>
                  <span className={subtext}>{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => {
                  setNotifications((prev) => [
                    { id: `email-${Date.now()}`, msg: `Email sent to ${contactModal.contactPerson}`, level: "success" },
                    ...prev,
                  ]);
                  setContactModal(null);
                }}
                className="flex-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold"
              >
                📧 Send Email
              </button>
              <button
                onClick={() => {
                  setNotifications((prev) => [
                    { id: `po-${Date.now()}`, msg: `PO drafted for ${contactModal.name}`, level: "info" },
                    ...prev,
                  ]);
                  setContactModal(null);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold"
              >
                📝 Create PO
              </button>
              <button
                onClick={() => setContactModal(null)}
                className={cn("py-2 px-3 rounded-xl text-xs font-semibold", softBg, hoverBg2)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* ============ WASTAGE DETAIL MODAL ============ */}
      {wastageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setWastageModal(null)}
        >
          <div
            className={cn("rounded-3xl p-6 max-w-md w-full border shadow-2xl", isDark ? "bg-[#111827]" : "bg-white", border)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-2xl">🗑️</div>
              <div className="flex-1">
                <h3 className="font-bold">Wastage Detail</h3>
                <p className={cn("text-[11px]", subtext)}>{wastageModal.id}</p>
              </div>
              <StatusBadge status={wastageModal.reason} />
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["Product", wastageModal.productName],
                ["Batch", wastageModal.batchNumber],
                ["Quantity", `${wastageModal.quantity} units`],
                ["Value Loss", formatSAR(wastageModal.wastageValue)],
                ["Category", wastageModal.category],
                ["Recorded By", wastageModal.recordedBy],
                ["Date", wastageModal.wastageDate],
                ["Disposal", wastageModal.disposalMethod],
              ].map(([k, v]) => (
                <div key={k} className={cn("flex justify-between py-2 border-b", border)}>
                  <span className={subtext}>{k}</span>
                  <span className="font-semibold text-right">{v}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setWastageModal(null)}
              className={cn("w-full mt-5 py-2 rounded-xl text-xs font-semibold", softBg, hoverBg2)}
            >
              Close
            </button>
          </div>
        </div>
      )}
 
      {/* ============ HEADER ============ */}
      <header className={cn("sticky top-0 z-40 backdrop-blur-xl border-b", isDark ? "bg-[#0a0f1e]/90" : "bg-white/90", border)}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <span className="text-white text-sm">⚕</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold leading-none">Smart Pharmacy</p>
                <p className={cn("text-[10px] leading-none mt-0.5", subtext)}>Hub</p>
              </div>
            </div>
 
            <div className="flex-1 max-w-2xl mx-auto relative">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-200",
                  searchFocused ? "border-indigo-500/60 ring-2 ring-indigo-500/15" : border,
                  isDark ? "bg-white/5" : "bg-slate-50"
                )}
              >
                <span className="text-indigo-400 text-sm">🔍</span>
                <span
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0",
                    isDark ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                  )}
                >
                  AI
                </span>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  placeholder="Search medications, patients, suppliers, batches..."
                  className={cn(
                    "flex-1 bg-transparent text-sm outline-none",
                    isDark ? "text-white placeholder-white/30" : "text-slate-900 placeholder-slate-400"
                  )}
                  aria-label="AI search"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={cn(subtext, "hover:text-red-400 transition-colors")}
                  >
                    ✕
                  </button>
                )}
                <kbd className={cn("hidden sm:inline text-[10px] px-1.5 py-0.5 rounded border", border, subtext)}>⌘K</kbd>
              </div>
 
              {searchFocused && searchResults.length > 0 && (
                <div
                  className={cn(
                    "absolute top-full mt-2 left-0 right-0 rounded-2xl border shadow-2xl shadow-black/30 overflow-hidden z-50",
                    border,
                    isDark ? "bg-[#111827]" : "bg-white"
                  )}
                >
                  <div className={cn("px-3 py-2 border-b flex items-center gap-2", border)}>
                    <span className="text-[10px] font-semibold text-indigo-400">AI RESULTS</span>
                    <span className={cn("text-[10px]", subtext)}>{searchResults.length} matches</span>
                  </div>
                  {searchResults.map((r) => (
                    <button
                      key={r.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        if (r.type === "product") {
                          const p = products.find((x) => x.id === r.id);
                          if (p) {
                            setActiveTab("inventory");
                            setSelectedProduct(p);
                          }
                        }
                        if (r.type === "supplier") {
                          const s = suppliers.find((x) => x.id === r.id);
                          if (s) {
                            setActiveTab("suppliers");
                            setSelectedSupplier(s);
                          }
                        }
                        if (r.type === "patient") setActiveTab("patients");
                        setSearchQuery("");
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b last:border-0",
                        border,
                        hoverBg
                      )}
                    >
                      <span className="text-xl">{r.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.title}</p>
                        <p className={cn("text-[11px] truncate", subtext)}>{r.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={r.status} />
                        <span className={cn("text-[10px] capitalize", subtext)}>{r.type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
 
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className={cn("w-1.5 h-1.5 rounded-full bg-emerald-400 transition-opacity", pulse ? "opacity-100" : "opacity-40")} />
                <span className="text-[10px] font-semibold text-emerald-400">LIVE</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="text-[10px] font-semibold text-blue-400">ZATCA ✓</span>
              </div>
              <button className={cn("relative p-2 rounded-xl transition-colors", hoverBg2)} aria-label="Notifications">
                <span className="text-base">🔔</span>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                className={cn("p-2 rounded-xl transition-colors", hoverBg2)}
                aria-label="Toggle theme"
              >
                <span className="text-base">{isDark ? "☀️" : "🌙"}</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">PH</span>
              </div>
            </div>
          </div>
        </div>
      </header>
 
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.slice(0, 2).map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm",
                  n.level === "critical"
                    ? "bg-red-500/8 border-red-500/25 text-red-300"
                    : n.level === "warning"
                    ? "bg-amber-500/8 border-amber-500/25 text-amber-300"
                    : "bg-emerald-500/8 border-emerald-500/25 text-emerald-300"
                )}
              >
                <span>{n.level === "critical" ? "🚨" : n.level === "warning" ? "⚠️" : "✅"}</span>
                <span className="flex-1">{n.msg}</span>
                <button
                  onClick={() => setNotifications((prev) => prev.filter((x) => x.id !== n.id))}
                  className="opacity-60 hover:opacity-100 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
 
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Smart Pharmacy Hub</h1>
            <p className={cn("text-sm mt-0.5", subtext)}>
              AI-Powered • Real-Time • ZATCA Compliant {currentDate ? `• ${currentDate}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={generateZATCAInvoice}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/25"
            >
              <span>🧾</span> Generate E-Invoice
            </button>
            <button
              onClick={() => {
                setNotifications((prev) => [
                  { id: `add-${Date.now()}`, msg: "Add Product dialog would open", level: "info" },
                  ...prev,
                ]);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/25"
            >
              <span>＋</span> Add Product
            </button>
          </div>
        </div>
 
        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : statCards.map((card) => (
                <div
                  key={card.label}
                  className={cn(
                    "group relative rounded-2xl p-4 border backdrop-blur-sm transition-all duration-200 overflow-hidden",
                    border,
                    cardBg
                  )}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${card.color}08, transparent 70%)` }}
                  />
                  <p className={cn("text-[10px] font-semibold uppercase tracking-widest mb-2", subtext)}>{card.label}</p>
                  <p className="text-lg font-bold leading-none mb-1" style={{ color: card.color }}>
                    {card.value}
                  </p>
                  <p className={cn("text-[10px] leading-tight mb-3", subtext)}>{card.sub}</p>
                  <Sparkline data={card.data} color={card.color} />
                </div>
              ))}
        </div>
 
        {/* TABS */}
        <div className={cn("flex items-center gap-1 p-1 rounded-2xl border overflow-x-auto", border, isDark ? "bg-white/3" : "bg-slate-100")}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200",
                activeTab === tab.id
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  : cn(subtext, isDark ? "hover:text-white hover:bg-white/5" : "hover:text-slate-700 hover:bg-white/70")
              )}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
 
        {/* ============ OVERVIEW ============ */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={cn("lg:col-span-1 rounded-2xl border p-5 backdrop-blur-sm", border, cardBg)}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-xs">🚨</span>
                  AI Alert Center
                </h2>
                <span className={cn("text-xs", subtext)}>{notifications.length} active</span>
              </div>
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "p-3 rounded-xl border text-xs",
                      n.level === "critical"
                        ? "bg-red-500/8 border-red-500/20"
                        : n.level === "warning"
                        ? "bg-amber-500/8 border-amber-500/20"
                        : "bg-emerald-500/8 border-emerald-500/20"
                    )}
                  >
                    <p className={n.level === "critical" ? "text-red-300" : n.level === "warning" ? "text-amber-300" : "text-emerald-300"}>
                      {n.msg}
                    </p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center py-8">
                    <span className="text-3xl">✅</span>
                    <p className={cn("text-sm mt-2", subtext)}>All systems normal</p>
                  </div>
                )}
              </div>
            </div>
 
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={cn("rounded-2xl border p-5 backdrop-blur-sm", border, cardBg)}>
                <h2 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-xs">🛡️</span>
                  ZATCA Compliance
                </h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <ProgressRing value={stats?.complianceScore ?? 0} size={80} stroke={6} color="#06b6d4" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">{stats?.complianceScore}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      ["E-Invoices", "Cleared", "text-emerald-400"],
                      ["VAT Reports", "Filed", "text-emerald-400"],
                      ["Batch Records", "1 Pending", "text-amber-400"],
                    ].map(([l, v, c]) => (
                      <div key={l} className="flex items-center gap-2 text-xs">
                        <span className={subtext}>{l}:</span>
                        <span className={cn("font-semibold", c)}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
 
              <div className={cn("rounded-2xl border p-5 backdrop-blur-sm", border, cardBg)}>
                <h2 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-xs">🔄</span>
                  Auto-Replenishment
                </h2>
                <div className="space-y-2">
                  {products
                    .filter((p) => p.stockLevel <= p.minThreshold)
                    .slice(0, 3)
                    .map((p) => (
                      <div key={p.id} className={cn("flex items-center gap-2 p-2 rounded-lg", isDark ? "bg-white/4" : "bg-slate-50")}>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{p.name}</p>
                          <p className={cn("text-[10px]", subtext)}>
                            {p.stockLevel} / {p.minThreshold} units
                          </p>
                        </div>
                        <button
                          onClick={() => triggerReplenishment(p.id)}
                          disabled={replenishTriggered.includes(p.id)}
                          className={cn(
                            "shrink-0 px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors",
                            replenishTriggered.includes(p.id)
                              ? "bg-emerald-500/20 text-emerald-400 cursor-not-allowed"
                              : "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
                          )}
                        >
                          {replenishTriggered.includes(p.id) ? "✓ Sent" : "Order"}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
 
              <div className={cn("sm:col-span-2 rounded-2xl border p-5 backdrop-blur-sm", border, cardBg)}>
                <h2 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs">📈</span>
                  Today's Performance
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {[
                    { label: "Revenue", value: formatSAR(stats?.todaySales ?? 0), color: "#10b981" },
                    { label: "VAT", value: formatSAR(stats?.todayVAT ?? 0), color: "#06b6d4" },
                    { label: "Transactions", value: "142", color: "#6366f1" },
                    { label: "Avg Basket", value: "SAR 340", color: "#8b5cf6" },
                    { label: "Refills", value: "38", color: "#f59e0b" },
                    { label: "New Patients", value: "7", color: "#f43f5e" },
                  ].map((m) => (
                    <div key={m.label} className="text-center">
                      <p className="text-sm font-bold" style={{ color: m.color }}>
                        {m.value}
                      </p>
                      <p className={cn("text-[10px] mt-0.5", subtext)}>{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
 
        {/* ============ INVENTORY ============ */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {["all", "in_stock", "low_stock", "out_of_stock", "expiring_soon"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                      filterStatus === f ? "bg-indigo-500 text-white" : cn(softBg, hoverBg2, subtext)
                    )}
                  >
                    {f === "all" ? "All Items" : f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    {f === "low_stock" && ` (${stats?.lowStockCount})`}
                    {f === "expiring_soon" && ` (${stats?.expiringSoonCount})`}
                  </button>
                ))}
              </div>
              <div className="sm:ml-auto flex items-center gap-2">
                <span className={cn("text-xs", subtext)}>{filteredProducts.length} items</span>
              </div>
            </div>
 
            <div className={cn("rounded-2xl border overflow-hidden backdrop-blur-sm", border)}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={cn("border-b", border, isDark ? "bg-white/3" : "bg-slate-50")}>
                      {[
                        { key: "name", label: "Product" },
                        { key: "sku", label: "SKU / Batch" },
                        { key: "stockLevel", label: "Stock" },
                        { key: "expiryDate", label: "Expiry" },
                        { key: "sellingPrice", label: "Price" },
                        { key: "profitMargin", label: "Margin" },
                        { key: "status", label: "Status" },
                        { key: "zatcaCompliance", label: "ZATCA" },
                      ].map((col) => (
                        <th
                          key={col.key}
                          onClick={() => toggleSort(col.key as keyof PharmacyProduct)}
                          className={cn(
                            "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:text-indigo-400 transition-colors select-none whitespace-nowrap",
                            subtext
                          )}
                        >
                          {col.label} {sortField === col.key && <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>}
                        </th>
                      ))}
                      <th className={cn("px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest", subtext)}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${border}`}>
                    {loading
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            {Array.from({ length: 9 }).map((__, j) => (
                              <td key={j} className="px-4 py-4">
                                <div className={cn("h-3 rounded", isDark ? "bg-white/8" : "bg-slate-200")} />
                              </td>
                            ))}
                          </tr>
                        ))
                      : filteredProducts.map((product) => {
                          const daysLeft = getDaysUntilExpiry(product.expiryDate);
                          const forecast = forecasts.find((f) => f.productId === product.id);
                          return (
                            <tr
                              key={product.id}
                              onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
                              className={cn(
                                "cursor-pointer transition-colors",
                                selectedProduct?.id === product.id ? (isDark ? "bg-indigo-500/8" : "bg-indigo-50") : hoverBg
                              )}
                            >
                              <td className="px-4 py-3">
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className={cn("text-[10px]", subtext)}>{product.nameAr}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-xs font-mono">{product.sku}</p>
                                <p className={cn("text-[10px] font-mono", subtext)}>{product.batchNumber}</p>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 rounded-full bg-white/10 w-16">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${Math.min((product.stockLevel / product.maxThreshold) * 100, 100)}%`,
                                        background:
                                          product.stockLevel === 0
                                            ? "#ef4444"
                                            : product.stockLevel < product.minThreshold
                                            ? "#f59e0b"
                                            : "#10b981",
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold">{formatNumber(product.stockLevel)}</span>
                                </div>
                                {forecast && (
                                  <p className={cn("text-[10px] mt-0.5", subtext)}>AI: {forecast.daysUntilStockout}d left</p>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-xs">{product.expiryDate}</p>
                                <p
                                  className={cn(
                                    "text-[10px] font-semibold",
                                    daysLeft < 30 ? "text-red-400" : daysLeft < 90 ? "text-amber-400" : subtext
                                  )}
                                >
                                  {daysLeft < 0 ? "EXPIRED" : `${daysLeft}d left`}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-xs font-semibold">{product.sellingPrice.toFixed(2)}</p>
                                {forecast && forecast.priceOptimization !== product.sellingPrice && (
                                  <p className="text-[10px] text-indigo-400">AI: {forecast.priceOptimization.toFixed(2)}</p>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <p
                                  className={cn(
                                    "text-xs font-bold",
                                    product.profitMargin > 40
                                      ? "text-emerald-400"
                                      : product.profitMargin > 25
                                      ? "text-amber-400"
                                      : "text-red-400"
                                  )}
                                >
                                  {product.profitMargin.toFixed(1)}%
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge status={product.status} />
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge status={product.zatcaCompliance} />
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerReplenishment(product.id);
                                  }}
                                  disabled={product.stockLevel > product.minThreshold || replenishTriggered.includes(product.id)}
                                  className={cn(
                                    "px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors",
                                    replenishTriggered.includes(product.id)
                                      ? "bg-emerald-500/15 text-emerald-400 cursor-not-allowed"
                                      : product.stockLevel <= product.minThreshold
                                      ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
                                      : cn(softBg, subtext, "cursor-not-allowed opacity-50")
                                  )}
                                >
                                  {replenishTriggered.includes(product.id) ? "✓ Ordered" : "Reorder"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
            </div>
 
            {selectedProduct && (
              <div className={cn("rounded-2xl border border-indigo-500/30 p-5", isDark ? "bg-indigo-500/5" : "bg-indigo-50")}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">{selectedProduct.name} — Detail View</h3>
                  <button onClick={() => setSelectedProduct(null)} className={cn("text-sm hover:text-red-400", subtext)}>
                    ✕ Close
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  {[
                    ["Manufacturer", selectedProduct.manufacturer],
                    ["Category", selectedProduct.category],
                    ["Unit Cost", `SAR ${selectedProduct.unitCost.toFixed(2)}`],
                    ["Selling Price", `SAR ${selectedProduct.sellingPrice.toFixed(2)}`],
                    ["VAT Rate", `${selectedProduct.vatRate}%`],
                    ["Turnover Rate", `${selectedProduct.turnoverRate}x`],
                    ["Min Threshold", formatNumber(selectedProduct.minThreshold)],
                    ["Max Threshold", formatNumber(selectedProduct.maxThreshold)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className={cn("text-[10px] uppercase tracking-wider mb-1", subtext)}>{k}</p>
                      <p className="font-semibold">{v}</p>
                    </div>
                  ))}
                </div>
                {(() => {
                  const fc = forecasts.find((f) => f.productId === selectedProduct.id);
                  if (!fc) return null;
                  return (
                    <div className={cn("mt-4 p-3 rounded-xl border", isDark ? "bg-white/5" : "bg-white", border)}>
                      <p className="text-xs font-bold text-indigo-400 mb-2">🤖 AI Forecast</p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                        <div>
                          <p className={subtext}>Predicted Demand</p>
                          <p className="font-bold">{fc.predictedDemand} units</p>
                        </div>
                        <div>
                          <p className={subtext}>Confidence</p>
                          <p className="font-bold text-emerald-400">{fc.confidence}%</p>
                        </div>
                        <div>
                          <p className={subtext}>Suggested Reorder</p>
                          <p className="font-bold">{fc.suggestedReorder} units</p>
                        </div>
                        <div>
                          <p className={subtext}>Optimal Price</p>
                          <p className="font-bold">SAR {fc.priceOptimization}</p>
                        </div>
                        <div>
                          <p className={subtext}>Trend</p>
                          <TrendIndicator trend={fc.trend} />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
 
        {/* ============ PATIENTS ============ */}
        {activeTab === "patients" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Patient Medication & Refill CRM</h2>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs", subtext)}>{patients.length} active</span>
                <button
                  onClick={() =>
                    setNotifications((prev) => [
                      { id: `pt-${Date.now()}`, msg: "Add Patient dialog would open", level: "info" },
                      ...prev,
                    ])
                  }
                  className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold"
                >
                  + Add Patient
                </button>
              </div>
            </div>
 
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {patients.map((patient) => {
                const daysUntilRefill = getDaysUntilExpiry(patient.nextRefillDate);
                return (
                  <div key={patient.id} className={cn("rounded-2xl border p-5 backdrop-blur-sm", border, cardBg)}>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm truncate">{patient.name}</h3>
                          <StatusBadge status={patient.alertStatus} />
                        </div>
                        <p className={cn("text-[10px]", subtext)}>
                          ID: {patient.nationalId} • {patient.insuranceProvider}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn("text-[10px]", subtext)}>Adherence</p>
                        <p
                          className={cn(
                            "text-sm font-bold",
                            patient.adherenceScore >= 90
                              ? "text-emerald-400"
                              : patient.adherenceScore >= 70
                              ? "text-amber-400"
                              : "text-red-400"
                          )}
                        >
                          {patient.adherenceScore}%
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className={cn("text-[10px] font-semibold uppercase tracking-wider", subtext)}>Current Medications</p>
                      <div className="flex flex-wrap gap-1.5">
                        {patient.medications.map((med) => (
                          <span
                            key={med}
                            className={cn(
                              "px-2 py-0.5 rounded-lg text-[10px] font-medium border border-indigo-500/20",
                              isDark ? "bg-indigo-500/15 text-indigo-300" : "bg-indigo-50 text-indigo-700"
                            )}
                          >
                            {med}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div>
                        <p className={cn("text-[10px]", subtext)}>Next Refill</p>
                        <p
                          className={cn(
                            "text-xs font-bold",
                            daysUntilRefill < 0 ? "text-red-400" : daysUntilRefill < 3 ? "text-amber-400" : "text-emerald-400"
                          )}
                        >
                          {daysUntilRefill < 0 ? `${Math.abs(daysUntilRefill)}d overdue` : `in ${daysUntilRefill}d`}
                        </p>
                        <p className={cn("text-[10px]", subtext)}>{patient.nextRefillDate}</p>
                      </div>
                      <div>
                        <p className={cn("text-[10px]", subtext)}>Last Visit</p>
                        <p className="text-xs font-bold">{patient.lastVisit}</p>
                      </div>
                      <div>
                        <p className={cn("text-[10px]", subtext)}>Phone</p>
                        <p className="text-xs font-bold">{patient.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setNotifications((prev) => [
                            { id: `sms-${patient.id}-${Date.now()}`, msg: `SMS refill alert sent to ${patient.name}`, level: "success" },
                            ...prev,
                          ])
                        }
                        className={cn(
                          "flex-1 py-2 rounded-xl text-[11px] font-semibold transition-colors",
                          daysUntilRefill <= 3 ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" : cn(softBg, hoverBg2, subtext)
                        )}
                      >
                        📲 Send Refill Alert
                      </button>
                      <button className={cn("flex-1 py-2 rounded-xl text-[11px] font-semibold transition-colors", softBg, hoverBg2, subtext)}>
                        📋 View History
                      </button>
                      <button
                        onClick={() =>
                          setNotifications((prev) => [
                            { id: `dsp-${patient.id}-${Date.now()}`, msg: `Dispensed medication to ${patient.name}`, level: "success" },
                            ...prev,
                          ])
                        }
                        className="flex-1 py-2 rounded-xl text-[11px] font-semibold bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                      >
                        🧾 Dispense
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
 
        {/* ============ AI FORECASTING ============ */}
        {activeTab === "forecasting" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className={cn("lg:col-span-2 rounded-2xl border p-6 backdrop-blur-sm", border, cardBg)}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm">
                  🧮
                </div>
                <div>
                  <h2 className="text-sm font-bold">AI Calculation Engine</h2>
                  <p className={cn("text-[10px]", subtext)}>ZATCA-aware pricing optimizer</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                {[
                  { key: "costPrice", label: "Cost Price (SAR)", ph: "e.g. 12.50" },
                  { key: "sellingPrice", label: "Selling Price (SAR)", ph: "e.g. 18.75" },
                  { key: "quantity", label: "Quantity", ph: "e.g. 300" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className={cn("block text-[10px] font-semibold uppercase tracking-wider mb-1", subtext)}>{f.label}</label>
                    <input
                      type="number"
                      value={aiCalcInput[f.key as keyof typeof aiCalcInput]}
                      onChange={(e) => setAiCalcInput((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.ph}
                      className={cn(
                        "w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all",
                        inputBg
                      )}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={runAICalculation}
                disabled={aiCalcLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-bold hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {aiCalcLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    AI Processing…
                  </span>
                ) : (
                  "🧮 Run AI Analysis"
                )}
              </button>
 
              {aiCalcResult && (
                <div className={cn("mt-4 rounded-xl border p-4 space-y-3", border, isDark ? "bg-white/4" : "bg-slate-50")}>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { l: "Stock Turnover", v: `${aiCalcResult.stockTurnover}x`, c: "text-indigo-400" },
                      {
                        l: "Profit Margin",
                        v: `${aiCalcResult.profitMargin.toFixed(1)}%`,
                        c: aiCalcResult.profitMargin > 30 ? "text-emerald-400" : "text-amber-400",
                      },
                      { l: "Reorder Point", v: `${aiCalcResult.optimalReorderPoint} units`, c: "text-blue-400" },
                      { l: "AI Price", v: `SAR ${aiCalcResult.suggestedPrice.toFixed(2)}`, c: "text-violet-400" },
                    ].map((m) => (
                      <div key={m.l} className="text-xs">
                        <p className={cn("text-[10px] mb-0.5", subtext)}>{m.l}</p>
                        <p className={cn("font-bold", m.c)}>{m.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className={cn("rounded-lg p-2.5 border", isDark ? "border-white/8 bg-white/3" : "border-slate-200 bg-white")}>
                    <p className={cn("text-[10px] font-semibold mb-1", subtext)}>ZATCA VAT (15%)</p>
                    <div className="flex justify-between text-xs">
                      <span className={subtext}>
                        Base: <span className={text}>SAR {aiCalcResult.vatBreakdown.base.toFixed(2)}</span>
                      </span>
                      <span className={subtext}>
                        VAT: <span className="text-amber-400">SAR {aiCalcResult.vatBreakdown.vat.toFixed(2)}</span>
                      </span>
                      <span className={subtext}>
                        Total: <span className="text-emerald-400 font-bold">SAR {aiCalcResult.vatBreakdown.total.toFixed(2)}</span>
                      </span>
                    </div>
                  </div>
                  <div className={cn("rounded-lg p-2.5", isDark ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-200")}>
                    <p className="text-[11px] font-medium text-indigo-300">{aiCalcResult.recommendation}</p>
                  </div>
                  <p className={cn("text-[10px] text-right", subtext)}>Forecast accuracy: {aiCalcResult.forecastAccuracy.toFixed(1)}%</p>
                </div>
              )}
            </div>
 
            <div className={cn("lg:col-span-3 rounded-2xl border p-6 backdrop-blur-sm", border, cardBg)}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center text-sm">🤖</div>
                  <div>
                    <h2 className="text-sm font-bold">AI Demand Forecasts</h2>
                    <p className={cn("text-[10px]", subtext)}>Next 30-day predictions</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 font-semibold border border-indigo-500/20">
                  Model: Prophet + LSTM
                </span>
              </div>
              <div className="space-y-3">
                {forecasts.map((fc) => {
                  const product = products.find((p) => p.id === fc.productId);
                  if (!product) return null;
                  return (
                    <div key={fc.productId} className={cn("rounded-xl border p-4 transition-colors", border, hoverBg)}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-sm font-semibold">{product.name}</h3>
                          <p className={cn("text-[10px]", subtext)}>{product.sku}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <TrendIndicator trend={fc.trend} />
                          <span
                            className={cn(
                              "text-[10px] font-semibold",
                              fc.daysUntilStockout <= 3
                                ? "text-red-400"
                                : fc.daysUntilStockout <= 14
                                ? "text-amber-400"
                                : "text-emerald-400"
                            )}
                          >
                            {fc.daysUntilStockout === 0 ? "STOCKOUT" : `${fc.daysUntilStockout}d left`}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        {[
                          ["Predicted Demand", `${fc.predictedDemand} units`],
                          ["AI Confidence", `${fc.confidence}%`],
                          ["Suggested Reorder", `${fc.suggestedReorder} units`],
                          ["Optimal Price", `SAR ${fc.priceOptimization}`],
                        ].map(([l, v]) => (
                          <div key={l} className="text-xs">
                            <p className={cn("text-[10px] mb-0.5", subtext)}>{l}</p>
                            <p className="font-bold">{v}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("flex-1 h-1.5 rounded-full", isDark ? "bg-white/8" : "bg-slate-200")}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${fc.confidence}%`,
                              background: fc.confidence > 90 ? "#10b981" : fc.confidence > 75 ? "#f59e0b" : "#ef4444",
                            }}
                          />
                        </div>
                        <span className={cn("text-[10px]", subtext)}>{fc.confidence.toFixed(1)}% confident</span>
                        {fc.suggestedReorder > 0 && (
                          <button
                            onClick={() => triggerReplenishment(fc.productId)}
                            disabled={replenishTriggered.includes(fc.productId)}
                            className={cn(
                              "ml-2 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors",
                              replenishTriggered.includes(fc.productId)
                                ? "bg-emerald-500/15 text-emerald-400 cursor-not-allowed"
                                : "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
                            )}
                          >
                            {replenishTriggered.includes(fc.productId) ? "✓ PO Sent" : "Auto-Order"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
 
        {/* ============ ZATCA ============ */}
        {activeTab === "zatca" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { l: "E-Invoices Today", v: "142", s: "All cleared", c: "#10b981", i: "🧾" },
                { l: "VAT Collected (Month)", v: formatSAR(187420), s: "15% standard", c: "#06b6d4", i: "💰" },
                { l: "Compliance Score", v: `${stats?.complianceScore ?? 0}%`, s: "Target: 98%", c: "#6366f1", i: "🛡️" },
              ].map((card) => (
                <div key={card.l} className={cn("rounded-2xl border p-5 flex items-center gap-4", border, cardBg)}>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: `${card.c}20` }}
                  >
                    {card.i}
                  </div>
                  <div>
                    <p className={cn("text-[10px] uppercase font-semibold tracking-wider", subtext)}>{card.l}</p>
                    <p className="text-xl font-bold" style={{ color: card.c }}>
                      {card.v}
                    </p>
                    <p className={cn("text-[10px]", subtext)}>{card.s}</p>
                  </div>
                </div>
              ))}
            </div>
 
            <div className={cn("rounded-2xl border p-6 backdrop-blur-sm", border, cardBg)}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">🧾</span>
                  Recent ZATCA Transactions
                </h2>
                <button
                  onClick={generateZATCAInvoice}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
                >
                  + Generate E-Invoice
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className={cn("border-b", border)}>
                      {["Invoice No.", "Date & Time", "Base", "VAT (15%)", "Total", "Status", "QR"].map((h) => (
                        <th key={h} className={cn("px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest", subtext)}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${border}`}>
                    {[
                      { no: "INV-2026-00891", date: "2026-07-04 14:23", base: 2345.75, status: "cleared" },
                      { no: "INV-2026-00890", date: "2026-07-04 13:45", base: 1820, status: "cleared" },
                      { no: "INV-2026-00889", date: "2026-07-04 12:10", base: 550.5, status: "submitted" },
                      { no: "INV-2026-00888", date: "2026-07-04 11:32", base: 3200, status: "cleared" },
                      { no: "INV-2026-00887", date: "2026-07-04 09:55", base: 789.25, status: "generated" },
                    ].map((inv) => {
                      const vat = inv.base * 0.15;
                      return (
                        <tr key={inv.no} className={cn("transition-colors", hoverBg)}>
                          <td className="px-4 py-3 font-mono">{inv.no}</td>
                          <td className={cn("px-4 py-3", subtext)}>{inv.date}</td>
                          <td className="px-4 py-3">SAR {inv.base.toFixed(2)}</td>
                          <td className="px-4 py-3 text-amber-400">SAR {vat.toFixed(2)}</td>
                          <td className="px-4 py-3 font-bold text-emerald-400">SAR {(inv.base + vat).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                inv.status === "cleared"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                  : inv.status === "submitted"
                                  ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                  : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              )}
                            >
                              {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={generateZATCAInvoice} className="text-indigo-400 hover:text-indigo-300 text-[10px] font-semibold">
                              View QR
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
 
            <div className={cn("rounded-2xl border p-5", border, cardBg)}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-xs">⚙️</span>
                ZATCA Compliance Rules Active
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  ["Standard VAT Rate", "15%"],
                  ["E-Invoice", "Phase 2 Fatoorah"],
                  ["QR Code", "TLV Encoded"],
                  ["Real-time API", "Connected"],
                  ["Crypto Stamp", "ECDSA P-256"],
                  ["Arabic Tax Desc.", "Required"],
                  ["VAT Number", "310089474500003"],
                  ["Clearance", "≥ SAR 1,000"],
                ].map(([r, v]) => (
                  <div key={r} className={cn("p-3 rounded-xl border", border, isDark ? "bg-white/3" : "bg-slate-50")}>
                    <p className={cn("text-[10px] mb-1", subtext)}>{r}</p>
                    <p className="text-xs font-bold">{v}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                      ✓ Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
 
        {/* ============ SUPPLIERS ============ */}
        {activeTab === "suppliers" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { l: "Total Suppliers", v: suppliers.length, c: "#6366f1", i: "🚚" },
                { l: "Excellent Tier", v: suppliers.filter((s) => s.status === "excellent").length, c: "#10b981", i: "🏆" },
                { l: "Total Value (YTD)", v: formatSAR(suppliers.reduce((s, x) => s + x.totalValue, 0)), c: "#f59e0b", i: "💰" },
                {
                  l: "Avg On-Time %",
                  v: `${(suppliers.reduce((s, x) => s + x.onTimeDelivery, 0) / (suppliers.length || 1)).toFixed(1)}%`,
                  c: "#06b6d4",
                  i: "⏱️",
                },
              ].map((c) => (
                <div key={c.l} className={cn("rounded-2xl border p-4 flex items-center gap-3", border, cardBg)}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${c.c}20` }}>
                    {c.i}
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-[10px] uppercase font-semibold tracking-wider", subtext)}>{c.l}</p>
                    <p className="text-lg font-bold truncate" style={{ color: c.c }}>
                      {c.v}
                    </p>
                  </div>
                </div>
              ))}
            </div>
 
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {["all", "excellent", "good", "average", "poor"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setSupplierFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                      supplierFilter === f ? "bg-indigo-500 text-white" : cn(softBg, hoverBg2, subtext)
                    )}
                  >
                    {f === "all" ? "All Tiers" : f.charAt(0).toUpperCase() + f.slice(1)}
                    {f !== "all" && ` (${suppliers.filter((s) => s.status === f).length})`}
                  </button>
                ))}
              </div>
              <div className="sm:ml-auto text-xs flex items-center gap-2">
                <span className={subtext}>{filteredSuppliers.length} suppliers ranked</span>
              </div>
            </div>
 
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredSuppliers.map((s, idx) => (
                <div
                  key={s.id}
                  className={cn(
                    "rounded-2xl border p-5 backdrop-blur-sm transition-all",
                    selectedSupplier?.id === s.id ? "border-indigo-500/50 ring-2 ring-indigo-500/15" : border,
                    cardBg
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                          🚚
                        </div>
                        <div
                          className={cn(
                            "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white",
                            idx === 0 ? "bg-yellow-500" : idx === 1 ? "bg-slate-400" : idx === 2 ? "bg-amber-600" : "bg-slate-600"
                          )}
                        >
                          #{idx + 1}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm truncate">{s.name}</h3>
                          <StatusBadge status={s.status} />
                          <TrendIndicator trend={s.trend} />
                        </div>
                        <p className={cn("text-[10px] mt-0.5", subtext)}>{s.nameAr}</p>
                        <p className={cn("text-[10px]", subtext)}>{s.categories.join(" • ")}</p>
                      </div>
                    </div>
                    <div className="relative shrink-0">
                      <ProgressRing
                        value={s.overallScore}
                        size={54}
                        stroke={5}
                        color={s.overallScore >= 90 ? "#10b981" : s.overallScore >= 80 ? "#06b6d4" : s.overallScore >= 70 ? "#f59e0b" : "#ef4444"}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[11px] font-black">{s.overallScore}%</span>
                      </div>
                    </div>
                  </div>
 
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      {
                        l: "On-Time Delivery",
                        v: `${s.onTimeDelivery}%`,
                        c: s.onTimeDelivery > 90 ? "#10b981" : s.onTimeDelivery > 80 ? "#f59e0b" : "#ef4444",
                      },
                      { l: "Quality Score", v: `${s.qualityScore}%`, c: "#6366f1" },
                      { l: "Cost Efficiency", v: `${s.costEfficiency}%`, c: "#8b5cf6" },
                      { l: "Return Rate", v: `${s.returnRate}%`, c: s.returnRate < 2 ? "#10b981" : s.returnRate < 4 ? "#f59e0b" : "#ef4444" },
                    ].map((m) => (
                      <div key={m.l} className={cn("rounded-lg p-2 border", border, isDark ? "bg-white/3" : "bg-slate-50")}>
                        <p className={cn("text-[10px]", subtext)}>{m.l}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={cn("flex-1 h-1 rounded-full", isDark ? "bg-white/8" : "bg-slate-200")}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(parseFloat(String(m.v).replace("%", "")) * (m.l === "Return Rate" ? 10 : 1), 100)}%`,
                                background: m.c,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold" style={{ color: m.c }}>
                            {m.v}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
 
                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                    <div>
                      <p className={cn("text-[10px]", subtext)}>Orders</p>
                      <p className="font-bold">{s.totalOrders}</p>
                    </div>
                    <div>
                      <p className={cn("text-[10px]", subtext)}>Value</p>
                      <p className="font-bold">{formatSAR(s.totalValue).replace("SAR", "")}</p>
                    </div>
                    <div>
                      <p className={cn("text-[10px]", subtext)}>Response</p>
                      <p className="font-bold">{s.avgResponseHours}h</p>
                    </div>
                  </div>
 
                  <div className="flex gap-2">
                    <button
                      onClick={() => setContactModal(s)}
                      className={cn("flex-1 py-2 rounded-xl text-[11px] font-semibold transition-colors", softBg, hoverBg2)}
                    >
                      📞 Contact
                    </button>
                    <button
                      onClick={() => setSelectedSupplier(selectedSupplier?.id === s.id ? null : s)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-[11px] font-semibold transition-colors",
                        selectedSupplier?.id === s.id ? "bg-indigo-500 text-white" : "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
                      )}
                    >
                      {selectedSupplier?.id === s.id ? "✓ Selected" : "📊 Details"}
                    </button>
                    <button
                      onClick={() => {
                        setNotifications((prev) => [
                          { id: `po-${s.id}-${Date.now()}`, msg: `New PO drafted for ${s.name}`, level: "success" },
                          ...prev,
                        ]);
                      }}
                      className="flex-1 py-2 rounded-xl text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                    >
                      📝 New PO
                    </button>
                  </div>
                </div>
              ))}
            </div>
 
            {selectedSupplier && (
              <div className={cn("rounded-2xl border border-indigo-500/30 p-5", isDark ? "bg-indigo-500/5" : "bg-indigo-50")}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base">{selectedSupplier.name} — Deep Analytics</h3>
                    <p className={cn("text-[11px]", subtext)}>
                      {selectedSupplier.email} • Last order: {selectedSupplier.lastOrderDate}
                    </p>
                  </div>
                  <button onClick={() => setSelectedSupplier(null)} className={cn("text-sm hover:text-red-400", subtext)}>
                    ✕ Close
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    ["Total Value (YTD)", formatSAR(selectedSupplier.totalValue)],
                    ["Total Orders", String(selectedSupplier.totalOrders)],
                    ["Payment Terms", selectedSupplier.paymentTerms],
                    ["Contracts Active", String(selectedSupplier.activeContracts)],
                    ["VAT Number", selectedSupplier.vatNumber],
                    ["Contact Person", selectedSupplier.contactPerson],
                    ["Response Time", `${selectedSupplier.avgResponseHours} hours`],
                    ["Category Focus", selectedSupplier.categories[0]],
                  ].map(([k, v]) => (
                    <div key={k} className={cn("p-3 rounded-xl", isDark ? "bg-white/5" : "bg-white")}>
                      <p className={cn("text-[10px] uppercase tracking-wider mb-1", subtext)}>{k}</p>
                      <p className="text-xs font-semibold break-all">{v}</p>
                    </div>
                  ))}
                </div>
                <div className={cn("mt-4 p-3 rounded-xl border", border, isDark ? "bg-white/3" : "bg-white")}>
                  <p className="text-xs font-bold text-indigo-400 mb-2">🎯 AI Recommendation</p>
                  <p className={cn("text-xs", subtext)}>
                    {selectedSupplier.overallScore >= 90
                      ? "✅ Preferred supplier. Consider extending contract terms and negotiating volume discounts."
                      : selectedSupplier.overallScore >= 80
                      ? "🔵 Reliable supplier. Monitor delivery consistency and explore additional categories."
                      : selectedSupplier.overallScore >= 70
                      ? "⚠️ Average performer. Schedule quarterly business review and set improvement KPIs."
                      : "🚨 Critical performance. Recommend supplier diversification and audit of recent orders."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
 
        {/* ============ WASTAGE ============ */}
        {activeTab === "wastage" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { l: "Total Wastage (MTD)", v: formatSAR(wastageSummary.totalValue), s: `${wastageSummary.totalUnits} units lost`, c: "#ef4444", i: "🗑️" },
                { l: "Wastage Records", v: String(wastageSummary.records), s: "This month", c: "#f59e0b", i: "📋" },
                { l: "Critical Expiry", v: String(expiryBuckets.critical.length), s: "< 30 days", c: "#ef4444", i: "⏰" },
                { l: "Watch List", v: String(expiryBuckets.watch.length + expiryBuckets.warning.length), s: "30-180 days", c: "#06b6d4", i: "👁️" },
              ].map((c) => (
                <div key={c.l} className={cn("rounded-2xl border p-4 flex items-center gap-3", border, cardBg)}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${c.c}20` }}>
                    {c.i}
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-[10px] uppercase font-semibold tracking-wider", subtext)}>{c.l}</p>
                    <p className="text-lg font-bold truncate" style={{ color: c.c }}>
                      {c.v}
                    </p>
                    <p className={cn("text-[10px]", subtext)}>{c.s}</p>
                  </div>
                </div>
              ))}
            </div>
 
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className={cn("lg:col-span-2 rounded-2xl border p-5", border, cardBg)}>
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-xs">📅</span>
                  Expiry Pipeline (Next 6 Months)
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "⏰ Critical (< 30 days)", items: expiryBuckets.critical, color: "#ef4444" },
                    { label: "⚠️ Warning (30-90 days)", items: expiryBuckets.warning, color: "#f59e0b" },
                    { label: "👁️ Watch (90-180 days)", items: expiryBuckets.watch, color: "#06b6d4" },
                  ].map((bucket) => (
                    <div key={bucket.label}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold" style={{ color: bucket.color }}>
                          {bucket.label}
                        </p>
                        <span className={cn("text-[10px]", subtext)}>{bucket.items.length} items</span>
                      </div>
                      {bucket.items.length === 0 ? (
                        <div className={cn("text-center py-3 rounded-lg text-[11px]", subtext, isDark ? "bg-white/3" : "bg-slate-50")}>
                          None in this range ✓
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {bucket.items.slice(0, 4).map((p) => {
                            const days = getDaysUntilExpiry(p.expiryDate);
                            return (
                              <div key={p.id} className={cn("flex items-center gap-2 p-2 rounded-lg", isDark ? "bg-white/3" : "bg-slate-50")}>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{p.name}</p>
                                  <p className={cn("text-[10px] truncate", subtext)}>
                                    {p.batchNumber} • Stock: {p.stockLevel}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs font-bold" style={{ color: bucket.color }}>
                                    {days}d
                                  </p>
                                  <p className={cn("text-[10px]", subtext)}>{p.expiryDate}</p>
                                </div>
                                <button
                                  onClick={() =>
                                    setNotifications((prev) => [
                                      { id: `mark-${p.id}-${Date.now()}`, msg: `${p.name} marked for review`, level: "info" },
                                      ...prev,
                                    ])
                                  }
                                  className={cn("shrink-0 px-2 py-1 rounded-lg text-[10px] font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors")}
                                >
                                  Review
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
 
              <div className={cn("rounded-2xl border p-5", border, cardBg)}>
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-xs">📊</span>
                  Wastage by Reason
                </h3>
                <div className="space-y-3">
                  {Object.entries(wastageSummary.byReason).map(([reason, value]: [string, number]) => {
                    const pct = wastageSummary.totalValue > 0 ? (value / wastageSummary.totalValue) * 100 : 0;
                    const colors: Record<string, string> = {
                      expired: "#ef4444",
                      damaged: "#f59e0b",
                      recall: "#8b5cf6",
                      temperature: "#06b6d4",
                      other: "#64748b",
                    };
                    return (
                      <div key={reason}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold capitalize">{reason}</span>
                          <span className={cn("text-[10px] font-mono", subtext)}>{formatSAR(value)}</span>
                        </div>
                        <div className={cn("h-2 rounded-full overflow-hidden", isDark ? "bg-white/8" : "bg-slate-200")}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: colors[reason] || "#64748b" }} />
                        </div>
                        <p className={cn("text-[10px] mt-0.5", subtext)}>{pct.toFixed(1)}%</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-white/8">
                  <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-2", subtext)}>💡 AI Insights</p>
                  <div className="space-y-2 text-[11px]">
                    <p className={subtext}>• Reduce expired wastage by 40% with FIFO enforcement</p>
                    <p className={subtext}>• Temperature control alerts save SAR ~2,100/mo</p>
                    <p className={subtext}>• Best-before scanner recommended for Antibiotics</p>
                  </div>
                </div>
              </div>
            </div>
 
            <div className={cn("rounded-2xl border p-5", border, cardBg)}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-xs">📋</span>
                  Wastage Log & Disposal Ledger
                </h3>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {["all", "expired", "damaged", "recall", "temperature"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setWastageFilter(f)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors",
                        wastageFilter === f ? "bg-indigo-500 text-white" : cn(softBg, hoverBg2, subtext)
                      )}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
 
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className={cn("border-b", border)}>
                      {["Date", "Product", "Batch", "Qty", "Value", "Reason", "Disposal", "Actions"].map((h) => (
                        <th key={h} className={cn("px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest", subtext)}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${border}`}>
                    {filteredWastage.map((w) => (
                      <tr key={w.id} className={cn("transition-colors", hoverBg)}>
                        <td className="px-4 py-3">{w.wastageDate}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{w.productName}</p>
                          <p className={cn("text-[10px]", subtext)}>{w.category}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px]">{w.batchNumber}</td>
                        <td className="px-4 py-3 font-bold">{w.quantity}</td>
                        <td className="px-4 py-3 font-bold text-red-400">{formatSAR(w.wastageValue)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={w.reason} />
                        </td>
                        <td className={cn("px-4 py-3 text-[10px]", subtext)}>{w.disposalMethod}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setWastageModal(w)} className="text-indigo-400 hover:text-indigo-300 text-[10px] font-semibold">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredWastage.length === 0 && (
                      <tr>
                        <td colSpan={8} className={cn("px-4 py-8 text-center", subtext)}>
                          No wastage records in this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
 
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/8">
                <p className={cn("text-[11px]", subtext)}>
                  Total loss this cycle:{" "}
                  <span className="text-red-400 font-bold">{formatSAR(filteredWastage.reduce((s, w) => s + w.wastageValue, 0))}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setNotifications((prev) => [
                        { id: `wxp-${Date.now()}`, msg: "Wastage report exported to CSV", level: "success" },
                        ...prev,
                      ])
                    }
                    className={cn("px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors", softBg, hoverBg2)}
                  >
                    📊 Export CSV
                  </button>
                  <button
                    onClick={() =>
                      setNotifications((prev) => [
                        { id: `wrp-${Date.now()}`, msg: "New wastage entry dialog would open", level: "info" },
                        ...prev,
                      ])
                    }
                    className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    + Log Wastage
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
 
        <footer className={cn("border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px]", border, subtext)}>
          <p>Smart Pharmacy Hub v3.4 • ERP Suite 2026 • ZATCA Phase 2 compliant</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className={cn("w-1.5 h-1.5 rounded-full bg-emerald-400 transition-opacity", pulse ? "opacity-100" : "opacity-40")} />
              Real-time sync
            </span>
            <span>VAT Reg: 310089474500003</span>
            <span>© 2026 PharmaCorp KSA</span>
          </div>
        </footer>
      </div>
    </div>
  );
}