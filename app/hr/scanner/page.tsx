'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const TARGET_ERP_MODULES = [
  { label: 'Dashboard - Main Console', code: 'SYS-DB', path: '/dashboard', note: 'Executive overview and live KPIs' },
  { label: 'Dashboard - Admin', code: 'SYS-ADM', path: '/dashboard/admin', note: 'Administrative dashboard' },
  { label: 'HRM - Employee Profile', code: 'HRM-EMP', path: '/hr/employee-profile', note: 'Employee profile routing' },
  { label: 'HRM - Employees', code: 'HRM-LIST', path: '/hr/employees', note: 'Employee records and listing' },
  { label: 'HRM - Attendance', code: 'HRM-ATT', path: '/hr/attendance', note: 'HR attendance records' },
  { label: 'HRM - Contracts', code: 'HRM-CTR', path: '/hr/contracts', note: 'Contract management' },
  { label: 'HRM - Leave Management', code: 'HRM-LVE', path: '/hr/leave-management', note: 'Leave workflow routing' },
  { label: 'HRM - Performance', code: 'HRM-PER', path: '/hr/performance', note: 'Performance analysis' },
  { label: 'HRM - Promotions', code: 'HRM-PRO', path: '/hr/promotions', note: 'Promotion workflow' },
  { label: 'HRM - Disciplinary Actions', code: 'HRM-DIS', path: '/hr/disciplinary-actions', note: 'Disciplinary actions' },
  { label: 'HRM - ID Card Generator', code: 'HRM-IDC', path: '/hr/id-card-generator', note: 'ID card output' },
  { label: 'Attendance - Main', code: 'ATT-MAIN', path: '/attendance', note: 'Attendance module' },
  { label: 'Attendance - Face', code: 'ATT-FACE', path: '/attendance/face', note: 'Face attendance' },
  { label: 'Attendance - Fingerprint', code: 'ATT-FPR', path: '/attendance/fingerprint', note: 'Fingerprint attendance' },
  { label: 'Attendance - GPS', code: 'ATT-GPS', path: '/attendance/gps', note: 'GPS check-in' },
  { label: 'Attendance - QR', code: 'ATT-QR', path: '/attendance/qr', note: 'QR attendance' },
  { label: 'Inventory - Main', code: 'INV-MAIN', path: '/inventory', note: 'Inventory module home' },
  { label: 'Inventory - QR Barcode Scanner', code: 'INV-SCAN', path: '/inventory/qr-barcode-scanner', note: 'Barcode / QR scanner' },
  { label: 'Inventory - Live Stock Tracking', code: 'INV-LST', path: '/inventory/live-stock-tracking', note: 'Stock tracking' },
  { label: 'Inventory - Warehouse', code: 'INV-WHS', path: '/inventory/warehouse', note: 'Warehouse operations' },
  { label: 'Inventory - Suppliers', code: 'INV-SUP', path: '/inventory/suppliers', note: 'Supplier management' },
  { label: 'Sales - CRM', code: 'SAL-CRM', path: '/sales/crm', note: 'CRM routing' },
  { label: 'Sales - Customers', code: 'SAL-CUS', path: '/sales/customers', note: 'Customer records' },
  { label: 'Sales - Leads', code: 'SAL-LED', path: '/sales/leads', note: 'Lead management' },
  { label: 'Sales - Invoices', code: 'ACC-INV', path: '/sales/invoices', note: 'Invoice and bills' },
  { label: 'Reports - Main', code: 'RPT-MAIN', path: '/reports', note: 'Reports home' },
  { label: 'Reports - Export', code: 'RPT-EXP', path: '/reports/export', note: 'Export center' },
  { label: 'Reports - PDF', code: 'RPT-PDF', path: '/reports/pdf', note: 'PDF reports' },
  { label: 'Reports - Excel', code: 'RPT-XLS', path: '/reports/excel', note: 'Excel reports' },
  { label: 'Security - Access Control', code: 'SEC-LOG', path: '/security/access-control', note: 'Access control log' },
  { label: 'Security - Audit Logs', code: 'SEC-AUD', path: '/security/audit-logs', note: 'Audit log center' },
  { label: 'Security - Biometric', code: 'SEC-BIO', path: '/security/biometric', note: 'Biometric security' },
  { label: 'Security - API Keys', code: 'SEC-KEY', path: '/security/api-keys', note: 'API key management' },
  { label: 'Settings - Main', code: 'SET-MAIN', path: '/settings', note: 'Settings home' },
  { label: 'Settings - ERP Connectors', code: 'SET-CONN', path: '/settings/erp-connectors', note: 'Connector configuration' },
  { label: 'Settings - API Integration', code: 'SET-API', path: '/settings/api-integration', note: 'API integration' },
  { label: 'Production - Main', code: 'PRD-MAIN', path: '/production', note: 'Production home' },
  { label: 'Production - KPI', code: 'PRD-KPI', path: '/production/kpi', note: 'Production KPI' },
  { label: 'Production - Planning', code: 'PRD-PLN', path: '/production/planning', note: 'Production planning' },
  { label: 'AI - Analytics', code: 'AI-ANL', path: '/ai/analytics', note: 'AI analytics' },
  { label: 'AI - Assistant', code: 'AI-ASS', path: '/ai/assistant', note: 'AI assistant' },
  { label: 'AI - Attendance', code: 'AI-ATT', path: '/ai/attendance', note: 'AI attendance' },
  { label: 'AI - Chat', code: 'AI-CHT', path: '/ai/chat', note: 'AI chat' },
  { label: 'AI - Report Generator', code: 'AI-RPG', path: '/ai/report-generator', note: 'Report generator' },
  { label: 'AI - Voice Command', code: 'AI-VCM', path: '/ai/voice-command', note: 'Voice commands' },
] as const;

type TargetErpModuleCode = (typeof TARGET_ERP_MODULES)[number]['code'];
type TargetErpModule = (typeof TARGET_ERP_MODULES)[number];

type HardwareCategory =
  | 'BARCODE_QR'
  | 'BIOMETRIC'
  | 'DOCUMENT'
  | 'IDENTITY'
  | 'CAMERA'
  | 'SECURITY'
  | 'INDUSTRIAL'
  | 'MEDICAL'
  | 'AI';

type ScannerType =
  | 'fingerprint'
  | 'multi-finger'
  | 'palm'
  | 'face'
  | 'face-auth'
  | 'face-detect'
  | 'iris'
  | 'retina'
  | 'voice-auth'
  | 'signature'
  | 'digital-signature'
  | 'hand-geometry'
  | 'id-card'
  | 'national-id'
  | 'smart-card'
  | 'passport'
  | 'visa'
  | 'driving-license'
  | 'employee-id'
  | 'student-id'
  | 'resident-card'
  | 'rfid'
  | 'nfc'
  | 'magnetic-card'
  | 'chip-card'
  | 'document'
  | 'a4-document'
  | 'pdf'
  | 'ocr'
  | 'text-recognition'
  | 'multi-page'
  | 'image'
  | 'receipt'
  | 'invoice'
  | 'cheque'
  | 'certificate'
  | 'contract'
  | 'qr-document'
  | 'barcode'
  | 'qr'
  | 'datamatrix'
  | 'pdf417'
  | 'aztec'
  | 'code39'
  | 'code128'
  | 'ean8'
  | 'ean13'
  | 'upc'
  | 'industrial'
  | 'warehouse'
  | 'inventory'
  | 'product'
  | 'asset'
  | 'logistics'
  | 'package'
  | 'medical-qr'
  | 'patient-id'
  | 'prescription'
  | 'lab-report'
  | 'ai'
  | 'ai-ocr'
  | 'ai-face'
  | 'ai-doc-classify'
  | 'ai-object'
  | 'ai-image'
  | 'ai-quality'
  | 'ai-auto-crop'
  | 'ai-auto-rotate'
  | 'ai-noise'
  | 'camera'
  | 'hd-camera'
  | 'multi-camera'
  | 'security'
  | 'liveness'
  | 'anti-spoof'
  | 'mask-detect'
  | 'face-match'
  | 'kyc'
  | 'doc-auth';

type ScannerStatus = 'idle' | 'scanning' | 'success' | 'error';
type VerificationStatus = 'SUCCESS' | 'VALIDATED';

type AuditOperation =
  | 'START_SCAN'
  | 'STOP_NODE'
  | 'RETRY_CALL'
  | 'RESET_UNIT'
  | 'VALIDATE'
  | 'COMPARE'
  | 'SAVE'
  | 'EXPORT'
  | 'PRINT'
  | 'SHARE_SYSTEM_STREAM_METADATA'
  | 'SYNC_DEVICES'
  | 'DOWNLOAD'
  | 'UPLOAD'
  | 'PREVIEW'
  | 'VERIFY'
  | 'DETECT'
  | 'CAPTURE'
  | 'HISTORY'
  | 'SETTINGS'
  | 'REFRESH';

interface ScannerError {
  code: string;
  message: string;
  details?: unknown;
}

interface ScannerResult {
  id: string;
  type: ScannerType;
  timestamp: string;
  raw: unknown;
  preview?: string;
  meta?: Record<string, unknown>;
}

interface AuditEntry {
  id: string;
  operation: AuditOperation;
  verificationStatus: VerificationStatus;
  capturedAt: string;
  targetModule: TargetErpModule;
  hardwareCategory: HardwareCategory;
  subModule: ScannerType;
  capturedSummary: string;
  payload: Record<string, unknown>;
  previewUrl?: string | null;
  routePath?: string;
}

interface SettingsState {
  autoRoute: boolean;
  autoSave: boolean;
  hpPrinterName: string;
  showThumbnails: boolean;
}

const HISTORY_STORAGE_KEY = 'awm-erp-universal-scanner-history-v5';
const SETTINGS_STORAGE_KEY = 'awm-erp-universal-scanner-settings-v5';
const LAST_RESULT_STORAGE_KEY = 'awm-erp-universal-scanner-last-result-v5';

const HARDWARE_OPTIONS: Record<HardwareCategory, ScannerType[]> = {
  BARCODE_QR: ['barcode', 'qr', 'datamatrix', 'pdf417', 'aztec', 'code39', 'code128', 'ean8', 'ean13', 'upc', 'qr-document'],
  BIOMETRIC: ['fingerprint', 'multi-finger', 'palm', 'face-auth', 'face-detect', 'iris', 'retina', 'voice-auth', 'hand-geometry'],
  DOCUMENT: ['document', 'a4-document', 'pdf', 'ocr', 'text-recognition', 'multi-page', 'image', 'receipt', 'invoice', 'cheque', 'certificate', 'contract', 'signature', 'digital-signature'],
  IDENTITY: ['id-card', 'national-id', 'smart-card', 'passport', 'visa', 'driving-license', 'employee-id', 'student-id', 'resident-card', 'rfid', 'nfc', 'magnetic-card', 'chip-card'],
  CAMERA: ['camera', 'hd-camera', 'multi-camera'],
  SECURITY: ['security', 'liveness', 'anti-spoof', 'mask-detect', 'face-match', 'kyc', 'doc-auth'],
  INDUSTRIAL: ['industrial', 'warehouse', 'inventory', 'product', 'asset', 'logistics', 'package'],
  MEDICAL: ['medical-qr', 'patient-id', 'prescription', 'lab-report'],
  AI: ['ai', 'ai-ocr', 'ai-face', 'ai-doc-classify', 'ai-object', 'ai-image', 'ai-quality', 'ai-auto-crop', 'ai-auto-rotate', 'ai-noise'],
};

const INITIAL_SETTINGS: SettingsState = {
  autoRoute: true,
  autoSave: true,
  hpPrinterName: 'HP Connected Printer',
  showThumbnails: true,
};

const scannerCategoryMap: Partial<Record<ScannerType, HardwareCategory>> = {
  barcode: 'BARCODE_QR',
  qr: 'BARCODE_QR',
  datamatrix: 'BARCODE_QR',
  pdf417: 'BARCODE_QR',
  aztec: 'BARCODE_QR',
  code39: 'BARCODE_QR',
  code128: 'BARCODE_QR',
  ean8: 'BARCODE_QR',
  ean13: 'BARCODE_QR',
  upc: 'BARCODE_QR',
  'qr-document': 'BARCODE_QR',

  fingerprint: 'BIOMETRIC',
  'multi-finger': 'BIOMETRIC',
  palm: 'BIOMETRIC',
  face: 'BIOMETRIC',
  'face-auth': 'BIOMETRIC',
  'face-detect': 'BIOMETRIC',
  iris: 'BIOMETRIC',
  retina: 'BIOMETRIC',
  'voice-auth': 'BIOMETRIC',
  'hand-geometry': 'BIOMETRIC',

  document: 'DOCUMENT',
  'a4-document': 'DOCUMENT',
  pdf: 'DOCUMENT',
  ocr: 'DOCUMENT',
  'text-recognition': 'DOCUMENT',
  'multi-page': 'DOCUMENT',
  image: 'DOCUMENT',
  receipt: 'DOCUMENT',
  invoice: 'DOCUMENT',
  cheque: 'DOCUMENT',
  certificate: 'DOCUMENT',
  contract: 'DOCUMENT',
  signature: 'DOCUMENT',
  'digital-signature': 'DOCUMENT',

  'id-card': 'IDENTITY',
  'national-id': 'IDENTITY',
  'smart-card': 'IDENTITY',
  passport: 'IDENTITY',
  visa: 'IDENTITY',
  'driving-license': 'IDENTITY',
  'employee-id': 'IDENTITY',
  'student-id': 'IDENTITY',
  'resident-card': 'IDENTITY',
  rfid: 'IDENTITY',
  nfc: 'IDENTITY',
  'magnetic-card': 'IDENTITY',
  'chip-card': 'IDENTITY',

  camera: 'CAMERA',
  'hd-camera': 'CAMERA',
  'multi-camera': 'CAMERA',

  security: 'SECURITY',
  liveness: 'SECURITY',
  'anti-spoof': 'SECURITY',
  'mask-detect': 'SECURITY',
  'face-match': 'SECURITY',
  kyc: 'SECURITY',
  'doc-auth': 'SECURITY',

  industrial: 'INDUSTRIAL',
  warehouse: 'INDUSTRIAL',
  inventory: 'INDUSTRIAL',
  product: 'INDUSTRIAL',
  asset: 'INDUSTRIAL',
  logistics: 'INDUSTRIAL',
  package: 'INDUSTRIAL',

  'medical-qr': 'MEDICAL',
  'patient-id': 'MEDICAL',
  prescription: 'MEDICAL',
  'lab-report': 'MEDICAL',

  ai: 'AI',
  'ai-ocr': 'AI',
  'ai-face': 'AI',
  'ai-doc-classify': 'AI',
  'ai-object': 'AI',
  'ai-image': 'AI',
  'ai-quality': 'AI',
  'ai-auto-crop': 'AI',
  'ai-auto-rotate': 'AI',
  'ai-noise': 'AI',
};

const safeId = (): string => {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `scan_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const formatTime = (value: string | Date): string =>
  new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(typeof value === 'string' ? new Date(value) : value);

const getTargetModule = (code: TargetErpModuleCode): TargetErpModule =>
  TARGET_ERP_MODULES.find((item) => item.code === code) ?? TARGET_ERP_MODULES[0];

const destinationFieldByCode = (code: TargetErpModuleCode): string => {
  switch (code) {
    case 'HRM-EMP':
      return 'employeeProfile';
    case 'HRM-LIST':
      return 'employeesIndex';
    case 'HRM-ATT':
      return 'hrAttendance';
    case 'HRM-CTR':
      return 'contracts';
    case 'HRM-LVE':
      return 'leaveManagement';
    case 'HRM-PER':
      return 'performance';
    case 'HRM-PRO':
      return 'promotions';
    case 'HRM-DIS':
      return 'disciplinaryActions';
    case 'HRM-IDC':
      return 'idCardGenerator';
    case 'INV-SCAN':
      return 'barcodeScanner';
    case 'ACC-INV':
      return 'invoiceAndBills';
    case 'SEC-LOG':
      return 'accessControlLog';
    case 'SET-CONN':
      return 'erpConnectors';
    case 'RPT-EXP':
      return 'reportExportCenter';
    default:
      return 'universalTarget';
  }
};

const getInitialSelection = (type: ScannerType) => {
  const category = scannerCategoryMap[type] ?? 'CAMERA';
  return {
    category,
    subModule: HARDWARE_OPTIONS[category].includes(type) ? type : HARDWARE_OPTIONS[category][0],
  };
};

const loadJSON = <T,>(key: string): T | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const createMockPreview = (params: {
  targetModule: TargetErpModule;
  category: HardwareCategory;
  subModule: ScannerType;
  summary: string;
  timestamp: string;
  note?: string;
}): string => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="52%" stop-color="#111827"/>
        <stop offset="100%" stop-color="#78350f"/>
      </linearGradient>
      <linearGradient id="amber" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#fbbf24"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#bg)"/>
    <rect x="44" y="44" width="1192" height="632" rx="28" fill="#0b1220" opacity="0.94" stroke="#f59e0b" stroke-width="2"/>
    <circle cx="1080" cy="122" r="66" fill="url(#amber)" opacity="0.22"/>
    <text x="82" y="124" fill="#fbbf24" font-size="34" font-family="Arial" font-weight="700">AWM ERP Universal Scanner</text>
    <text x="82" y="174" fill="#e5e7eb" font-size="22" font-family="Arial">Target: ${params.targetModule.label} (${params.targetModule.code})</text>
    <text x="82" y="218" fill="#d1d5db" font-size="20" font-family="Arial">Route: ${params.targetModule.path}</text>
    <text x="82" y="258" fill="#d1d5db" font-size="20" font-family="Arial">Hardware Category: ${params.category}</text>
    <text x="82" y="298" fill="#d1d5db" font-size="20" font-family="Arial">Sub Module: ${params.subModule}</text>
    <text x="82" y="348" fill="#f59e0b" font-size="22" font-family="Arial" font-weight="700">${params.summary}</text>
    <rect x="82" y="394" width="1116" height="188" rx="18" fill="#111827" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="110" y="446" fill="#9ca3af" font-size="18" font-family="Arial">Captured At</text>
    <text x="110" y="482" fill="#f8fafc" font-size="24" font-family="Arial" font-weight="700">${formatTime(params.timestamp)}</text>
    <text x="110" y="532" fill="#9ca3af" font-size="18" font-family="Arial">Status</text>
    <text x="110" y="568" fill="#86efac" font-size="22" font-family="Arial" font-weight="700">${params.note ?? 'SUCCESS / VALIDATED'}</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const createDocumentPreview = (title: string, subtitle: string, path: string): string => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="1280" height="720" fill="#020617"/>
    <rect x="64" y="64" width="1152" height="592" rx="32" fill="#111827" stroke="#f59e0b" stroke-width="2"/>
    <text x="96" y="134" fill="#fbbf24" font-size="36" font-family="Arial" font-weight="700">${title}</text>
    <text x="96" y="190" fill="#e2e8f0" font-size="22" font-family="Arial">${subtitle}</text>
    <rect x="96" y="248" width="1088" height="248" rx="20" fill="#020617" stroke="#f59e0b" stroke-width="1.2"/>
    <text x="128" y="312" fill="#94a3b8" font-size="18" font-family="Arial">Target route</text>
    <text x="128" y="360" fill="#f8fafc" font-size="28" font-family="Arial" font-weight="700">${path}</text>
    <text x="128" y="428" fill="#86efac" font-size="20" font-family="Arial" font-weight="700">READY FOR ROUTING</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

function SectionCard({
  title,
  subtitle,
  className = '',
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={[
        'rounded-3xl border border-amber-500/15 bg-slate-950/70 shadow-[0_0_0_1px_rgba(245,158,11,0.07),0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl',
        className,
      ].join(' ')}
    >
      <div className="border-b border-amber-500/10 px-5 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Button({
  label,
  onClick,
  variant = 'primary',
  className = '',
  title,
}: {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'amber';
  className?: string;
  title?: string;
}) {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-[0.99]';

  const styles = {
    primary: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
    amber: 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400',
    secondary: 'border border-slate-700 bg-slate-800/90 text-slate-100 hover:bg-slate-700',
    danger: 'border border-rose-500/30 bg-rose-500 text-white hover:bg-rose-400',
    ghost: 'border border-amber-500/20 bg-transparent text-amber-100 hover:bg-amber-500/10',
  } as const;

  return (
    <button type="button" title={title} onClick={onClick} className={[base, styles[variant], className].join(' ')}>
      {label}
    </button>
  );
}

function UniversalScanner({ scannerType = 'camera' }: { scannerType?: ScannerType }) {
  const router = useRouter();
  const pathname = usePathname();
  const initialSelection = getInitialSelection(scannerType);

  const [selectedCategory, setSelectedCategory] = useState<HardwareCategory>(initialSelection.category);
  const [selectedSubModule, setSelectedSubModule] = useState<ScannerType>(initialSelection.subModule);
  const [targetModuleCode, setTargetModuleCode] = useState<TargetErpModuleCode>('HRM-EMP');

  const [isScanning, setIsScanning] = useState(false);
  const [isDeviceSyncing, setIsDeviceSyncing] = useState(false);
  const [deviceOnline, setDeviceOnline] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<ScannerError | null>(null);
  const [consoleMessage, setConsoleMessage] = useState('System ready for universal capture.');
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>('idle');
  const [historyLogs, setHistoryLogs] = useState<AuditEntry[]>([]);
  const [latestResult, setLatestResult] = useState<ScannerResult | null>(null);
  const [showPreviewPanel, setShowPreviewPanel] = useState(true);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showHistoryDetails, setShowHistoryDetails] = useState(true);
  const [settings, setSettings] = useState<SettingsState>(INITIAL_SETTINGS);
  const [isUploading, setIsUploading] = useState(false);

  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyRef = useRef<HTMLDivElement | null>(null);

  const targetModule = useMemo(() => getTargetModule(targetModuleCode), [targetModuleCode]);
  const currentPath = pathname ?? '/';

  useEffect(() => {
    const savedHistory = loadJSON<AuditEntry[]>(HISTORY_STORAGE_KEY);
    if (savedHistory?.length) setHistoryLogs(savedHistory);

    const savedSettings = loadJSON<Partial<SettingsState>>(SETTINGS_STORAGE_KEY);
    if (savedSettings) setSettings((prev) => ({ ...prev, ...savedSettings }));

    const savedLast = loadJSON<ScannerResult>(LAST_RESULT_STORAGE_KEY);
    if (savedLast) {
      setLatestResult(savedLast);
      if (savedLast.preview) setPreviewUrl(savedLast.preview);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyLogs.slice(0, 150)));
    } catch {}
  }, [historyLogs]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      if (latestResult) {
        window.localStorage.setItem(LAST_RESULT_STORAGE_KEY, JSON.stringify(latestResult));
      } else {
        window.localStorage.removeItem(LAST_RESULT_STORAGE_KEY);
      }
    } catch {}
  }, [latestResult]);

  useEffect(() => {
    const nextSelection = getInitialSelection(scannerType);
    setSelectedCategory(nextSelection.category);
    setSelectedSubModule(nextSelection.subModule);
  }, [scannerType]);

  useEffect(() => {
    const options = HARDWARE_OPTIONS[selectedCategory];
    if (!options.includes(selectedSubModule)) setSelectedSubModule(options[0]);
  }, [selectedCategory, selectedSubModule]);

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  const appendLog = (entry: AuditEntry) => {
    setHistoryLogs((prev) => [entry, ...prev].slice(0, 150));
  };

  const buildPayload = (
    operation: AuditOperation,
    verificationStatus: VerificationStatus,
    extra?: Record<string, unknown>
  ): AuditEntry => {
    const capturedAt = new Date().toISOString();

    const payload: Record<string, unknown> = {
      sessionId: extra?.sessionId ?? safeId(),
      operation,
      verificationStatus,
      capturedAt,
      sourcePath: currentPath,
      targetErpModule: {
        label: targetModule.label,
        code: targetModule.code,
        path: targetModule.path,
      },
      targetErpModuleCode: targetModule.code,
      destinationField: destinationFieldByCode(targetModule.code),
      hardwareCategory: selectedCategory,
      subModule: selectedSubModule,
      scannerType: selectedSubModule,
      deviceOnline,
      isScanning,
      consoleMessage,
      printerTarget: settings.hpPrinterName,
      ...extra,
    };

    return {
      id: safeId(),
      operation,
      verificationStatus,
      capturedAt,
      targetModule,
      hardwareCategory: selectedCategory,
      subModule: selectedSubModule,
      capturedSummary: String(extra?.capturedSummary ?? `${operation}:${selectedSubModule}`),
      payload,
      previewUrl: typeof extra?.previewUrl === 'string' ? extra.previewUrl : null,
      routePath: targetModule.path,
    };
  };

  const commitResult = (entry: AuditEntry, raw: unknown, preview?: string | null, shouldAppend = true) => {
    if (shouldAppend) appendLog(entry);

    const result: ScannerResult = {
      id: entry.id,
      type: entry.subModule,
      timestamp: entry.capturedAt,
      raw,
      preview: preview ?? undefined,
      meta: {
        operation: entry.operation,
        verificationStatus: entry.verificationStatus,
        targetErpModule: entry.targetModule.code,
        targetRoutePath: entry.targetModule.path,
        hardwareCategory: entry.hardwareCategory,
      },
    };

    setLatestResult(result);
    if (preview) setPreviewUrl(preview);
    setScannerStatus(entry.verificationStatus === 'SUCCESS' ? 'success' : 'idle');
  };

  const createSessionSnapshot = (entry: AuditEntry, raw: unknown) => {
    try {
      const snapshot = {
        id: entry.id,
        capturedAt: entry.capturedAt,
        targetModule: entry.targetModule,
        targetRoutePath: entry.targetModule.path,
        targetErpModuleCode: entry.targetModule.code,
        hardwareCategory: entry.hardwareCategory,
        subModule: entry.subModule,
        payload: raw,
        previewUrl: entry.previewUrl ?? null,
        sourcePath: currentPath,
      };

      window.sessionStorage.setItem(`AWM_SCANNER:${entry.id}`, JSON.stringify(snapshot));
      window.sessionStorage.setItem('AWM_SCANNER:last', JSON.stringify(snapshot));
    } catch {}
  };

  const routeCapturedData = (entry: AuditEntry, raw: unknown) => {
    createSessionSnapshot(entry, raw);

    if (settings.autoRoute) {
      router.push(`${entry.targetModule.path}?scanId=${encodeURIComponent(entry.id)}&module=${encodeURIComponent(entry.targetModule.code)}`);
    } else {
      setConsoleMessage(`Routing stored for ${entry.targetModule.path}. Auto-route is disabled.`);
    }
  };

  const clearTimers = () => {
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
  };

  const autoSaveEntry = (entry: AuditEntry, raw: unknown, preview?: string | null) => {
    if (!settings.autoSave) return;

    const saveEntry = buildPayload('SAVE', 'SUCCESS', {
      capturedSummary: `AUTO_SAVED:${entry.subModule}`,
      autoSaved: true,
      sourceOperation: entry.operation,
      previewUrl: preview ?? entry.previewUrl ?? null,
    });

    appendLog(saveEntry);
    setLatestResult({
      id: entry.id,
      type: entry.subModule,
      timestamp: entry.capturedAt,
      raw,
      preview: preview ?? undefined,
      meta: {
        operation: entry.operation,
        verificationStatus: entry.verificationStatus,
        targetErpModule: entry.targetModule.code,
        targetRoutePath: entry.targetModule.path,
        hardwareCategory: entry.hardwareCategory,
      },
    });
  };

  const syncDevices = () => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

    setIsDeviceSyncing(true);
    setDeviceOnline(false);
    setError(null);
    setConsoleMessage('Pinging hardware driver / SDK layer...');

    syncTimerRef.current = setTimeout(() => {
      setIsDeviceSyncing(false);
      setDeviceOnline(true);
      setConsoleMessage('Devices synchronized successfully.');

      appendLog(
        buildPayload('SYNC_DEVICES', 'SUCCESS', {
          capturedSummary: 'DEVICE_DRIVER_PING_OK',
          deviceDriver: 'AWM Universal SDK Driver',
          sdkHandshake: 'OK',
        })
      );

      syncTimerRef.current = null;
    }, 700);
  };

  const startScanInternal = (mode: 'delay' | 'instant') => {
    clearTimers();
    setError(null);
    setScannerStatus('scanning');
    setIsScanning(true);
    setConsoleMessage(`Scanning ${selectedSubModule} for ${targetModule.code}...`);

    const execute = () => {
      const capturedAt = new Date().toISOString();
      const capturedSummary = `SIMULATED_CAPTURE::${selectedSubModule}`;

      const preview = createMockPreview({
        targetModule,
        category: selectedCategory,
        subModule: selectedSubModule,
        summary: capturedSummary,
        timestamp: capturedAt,
        note: `Mapped to ${targetModule.path}`,
      });

      const raw = {
        source: 'AWM ERP UniversalScanner SDK Simulator',
        rawCapture: capturedSummary,
        destinationField: destinationFieldByCode(targetModule.code),
        mappedTo: targetModule.code,
        mappedPath: targetModule.path,
        mappedModuleName: targetModule.label,
        category: selectedCategory,
        subModule: selectedSubModule,
        confidence: 98.74,
        printerTarget: settings.hpPrinterName,
        deviceOnline: true,
        sdkResponse: {
          device: 'AWM-UniversalScanner Virtual SDK',
          status: 'OK',
          latencyMs: mode === 'delay' ? 1200 : 0,
        },
      };

      const entry: AuditEntry = {
        id: safeId(),
        operation: mode === 'instant' ? 'CAPTURE' : 'START_SCAN',
        verificationStatus: 'SUCCESS',
        capturedAt,
        targetModule,
        hardwareCategory: selectedCategory,
        subModule: selectedSubModule,
        capturedSummary,
        payload: {
          ...raw,
          targetErpModule: {
            label: targetModule.label,
            code: targetModule.code,
            path: targetModule.path,
          },
          previewUrl: preview,
          currentPath,
        },
        previewUrl: preview,
        routePath: targetModule.path,
      };

      commitResult(entry, raw, preview);
      setIsScanning(false);
      setDeviceOnline(true);
      setConsoleMessage(`Capture pushed securely to ${targetModule.code}.`);
      routeCapturedData(entry, raw);
      autoSaveEntry(entry, raw, preview);
      scanTimerRef.current = null;
    };

    if (mode === 'instant') {
      execute();
      return;
    }

    scanTimerRef.current = setTimeout(execute, 1200);
  };

  const startScan = () => {
    if (!deviceOnline) {
      syncDevices();
      setTimeout(() => startScanInternal('delay'), 850);
      return;
    }

    startScanInternal('delay');
  };

  const captureNow = () => {
    if (!deviceOnline) {
      syncDevices();
      setTimeout(() => startScanInternal('instant'), 850);
      return;
    }

    startScanInternal('instant');
  };

  const stopNode = () => {
    clearTimers();
    setIsScanning(false);
    setScannerStatus('idle');
    setConsoleMessage('Node stopped safely.');

    const entry = buildPayload('STOP_NODE', 'SUCCESS', { capturedSummary: 'NODE_STOPPED' });
    commitResult(entry, entry.payload, previewUrl);
  };

  const retryCall = () => {
    clearTimers();
    setIsScanning(false);
    setScannerStatus('idle');
    setConsoleMessage('Retry sequence initiated.');

    appendLog(buildPayload('RETRY_CALL', 'SUCCESS', { capturedSummary: 'RETRY_SEQUENCE_STARTED' }));
    setTimeout(() => startScan(), 220);
  };

  const resetUnit = () => {
    clearTimers();
    setIsScanning(false);
    setPreviewUrl(null);
    setError(null);
    setScannerStatus('idle');
    setConsoleMessage('Unit reset and cleared.');

    const entry = buildPayload('RESET_UNIT', 'SUCCESS', { capturedSummary: 'UNIT_RESET_COMPLETE' });
    commitResult(entry, entry.payload, null);
  };

  const validateCurrent = () => {
    const entry = buildPayload('VALIDATE', 'VALIDATED', {
      capturedSummary: latestResult ? `VALIDATED:${latestResult.type}` : `VALIDATED:${selectedSubModule}`,
      verifiedAgainst: targetModule.code,
      verificationEngine: 'AWM-Validation-Engine',
      previewUrl,
    });

    commitResult(entry, latestResult?.raw ?? entry.payload, previewUrl);
    setConsoleMessage(`Validated against ${targetModule.code}.`);
  };

  const compareCurrent = () => {
    const previousTargetCode = historyLogs[0]?.targetModule.code ?? targetModule.code;

    const entry = buildPayload('COMPARE', 'VALIDATED', {
      capturedSummary: `COMPARE:${previousTargetCode}::${targetModule.code}`,
      previousTargetCode,
      currentTargetCode: targetModule.code,
      matched: previousTargetCode === targetModule.code,
      previewUrl,
    });

    commitResult(entry, entry.payload, previewUrl);
    setConsoleMessage(`Comparison completed for ${targetModule.code}.`);
  };

  const saveCurrent = () => {
    const entry = buildPayload('SAVE', 'SUCCESS', {
      capturedSummary: latestResult ? `SAVED:${latestResult.type}` : `SAVED:${selectedSubModule}`,
      savedCount: historyLogs.length + 1,
      previewUrl,
    });

    commitResult(entry, entry.payload, previewUrl);
    setScannerStatus('success');
    setConsoleMessage(`Saved into audit buffer for ${targetModule.code}.`);
  };

  const exportPayload = () => {
    const snapshot = {
      app: 'AWM ERP UniversalScanner',
      exportedAt: new Date().toISOString(),
      currentSelection: {
        category: selectedCategory,
        subModule: selectedSubModule,
        targetModule,
        currentPath,
      },
      latestResult,
      previewUrl,
      error,
      historyLogs,
      settings,
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `awm-erp-universal-scanner-${targetModule.code}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 2500);

    appendLog(
      buildPayload('EXPORT', 'SUCCESS', {
        capturedSummary: `EXPORTED:${targetModule.code}`,
        exportFile: `awm-erp-universal-scanner-${targetModule.code}.json`,
      })
    );

    setConsoleMessage(`Exported payload for ${targetModule.code}.`);
  };

  const downloadPayload = () => {
    if (previewUrl) {
      const ext = previewUrl.startsWith('data:image/svg+xml') ? 'svg' : 'png';
      const link = document.createElement('a');

      link.href = previewUrl;
      link.download = `awm-erp-preview-${targetModule.code}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      const blob = new Blob(
        [
          JSON.stringify(
            {
              downloadedAt: new Date().toISOString(),
              targetModule,
              selection: {
                category: selectedCategory,
                subModule: selectedSubModule,
              },
              latestResult,
              currentPath,
            },
            null,
            2
          ),
        ],
        { type: 'application/json' }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `awm-erp-download-${targetModule.code}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 2500);
    }

    appendLog(
      buildPayload('DOWNLOAD', 'SUCCESS', {
        capturedSummary: `DOWNLOADED:${targetModule.code}`,
        fileType: previewUrl ? 'image' : 'json',
      })
    );

    setConsoleMessage(`Downloaded payload for ${targetModule.code}.`);
  };

  const printPayload = () => {
    appendLog(
      buildPayload('PRINT', 'SUCCESS', {
        capturedSummary: `PRINTED:${targetModule.code}`,
        printerTarget: settings.hpPrinterName,
      })
    );

    setConsoleMessage(`Print job sent to ${settings.hpPrinterName}.`);
    window.print();
  };

  const shareSystemStreamMetadata = async () => {
    const metadata = {
      app: 'AWM ERP UniversalScanner',
      selectedCategory,
      selectedSubModule,
      targetErpModule: targetModule,
      deviceOnline,
      isScanning,
      previewAvailable: Boolean(previewUrl),
      printerTarget: settings.hpPrinterName,
      currentPath,
      lastUpdated: new Date().toISOString(),
    };

    const text = JSON.stringify(metadata, null, 2);

    try {
      if (navigator.share) {
        await navigator.share({ title: 'AWM ERP System Stream Metadata', text });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }

      setConsoleMessage('System stream metadata shared.');
    } catch (err) {
      setError({
        code: 'UNKNOWN_ERROR',
        message: 'Unable to share system stream metadata.',
        details: err,
      });
      setScannerStatus('error');
    }

    appendLog(
      buildPayload('SHARE_SYSTEM_STREAM_METADATA', 'SUCCESS', {
        capturedSummary: `SHARED:${targetModule.code}`,
        metadata,
      })
    );
  };

  const uploadClick = () => uploadInputRef.current?.click();

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      let raw: unknown = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      };

      let preview: string | null = null;

      if (file.type.startsWith('image/')) {
        preview = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error ?? new Error('Image upload failed'));
          reader.readAsDataURL(file);
        });

        raw = {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAs: 'image',
        };
      } else if (file.type === 'application/json' || file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.txt')) {
        const text = await file.text();

        try {
          raw = JSON.parse(text);
        } catch {
          raw = text;
        }
      } else {
        raw = {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAs: 'binary-or-document',
        };
      }

      const capturedAt = new Date().toISOString();
      const uploadPreview = preview ?? createDocumentPreview('Uploaded File', file.name, targetModule.path);

      const entry: AuditEntry = {
        id: safeId(),
        operation: 'UPLOAD',
        verificationStatus: 'SUCCESS',
        capturedAt,
        targetModule,
        hardwareCategory: selectedCategory,
        subModule: selectedSubModule,
        capturedSummary: `UPLOADED:${file.name}`,
        payload: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedPreview: Boolean(preview),
          currentPath,
          targetErpModuleCode: targetModule.code,
          routePath: targetModule.path,
          raw,
        },
        previewUrl: uploadPreview,
        routePath: targetModule.path,
      };

      commitResult(entry, raw, uploadPreview);
      setPreviewUrl(uploadPreview);
      setConsoleMessage(`Uploaded ${file.name} and mapped to ${targetModule.code}.`);
      routeCapturedData(entry, raw);
      autoSaveEntry(entry, raw, uploadPreview);
    } catch (err) {
      setError({
        code: 'SCAN_FAILED',
        message: 'Upload processing failed.',
        details: err,
      });
      setScannerStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const previewAction = () => {
    const next = !showPreviewPanel;
    setShowPreviewPanel(next);

    appendLog(
      buildPayload('PREVIEW', 'SUCCESS', {
        capturedSummary: `PREVIEW_${next ? 'VISIBLE' : 'HIDDEN'}`,
        previewEnabled: next,
      })
    );

    setConsoleMessage(next ? 'Preview panel visible.' : 'Preview panel hidden.');
  };

  const verifyAction = () => {
    const entry = buildPayload('VERIFY', 'VALIDATED', {
      capturedSummary: `VERIFIED:${selectedSubModule}`,
      verifiedRoute: targetModule.path,
      verifiedModuleCode: targetModule.code,
      hpPrinterName: settings.hpPrinterName,
      previewUrl,
    });

    commitResult(entry, entry.payload, previewUrl);
    setConsoleMessage(`Verification completed for ${targetModule.code}.`);
  };

  const detectAction = () => {
    const detectedPreview = createMockPreview({
      targetModule,
      category: selectedCategory,
      subModule: selectedSubModule,
      summary: `DETECTED::${selectedSubModule}`,
      timestamp: new Date().toISOString(),
      note: `Device: ${settings.hpPrinterName}`,
    });

    const entry = buildPayload('DETECT', 'SUCCESS', {
      capturedSummary: `DETECTED:${selectedSubModule}`,
      detectedDevice: settings.hpPrinterName,
      sdkLayer: 'AWM Hardware Driver Layer',
      routePath: targetModule.path,
      previewUrl: detectedPreview,
    });

    setPreviewUrl(detectedPreview);
    commitResult(entry, entry.payload, detectedPreview);
    setConsoleMessage(`Detection completed for ${selectedSubModule}.`);
  };

  const historyAction = () => {
    const next = !showHistoryDetails;
    setShowHistoryDetails(next);
    historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    appendLog(
      buildPayload('HISTORY', 'SUCCESS', {
        capturedSummary: `HISTORY:${next ? 'EXPANDED' : 'COLLAPSED'}`,
        historyExpanded: next,
      })
    );
  };

  const settingsAction = () => {
    const next = !showSettingsPanel;
    setShowSettingsPanel(next);

    appendLog(
      buildPayload('SETTINGS', 'SUCCESS', {
        capturedSummary: `SETTINGS:${next ? 'OPENED' : 'CLOSED'}`,
        settingsPanel: next,
      })
    );
  };

  const refreshAction = () => {
    syncDevices();

    appendLog(
      buildPayload('REFRESH', 'SUCCESS', {
        capturedSummary: 'REFRESH_TRIGGERED',
        refreshReason: 'Hardware and SDK refresh requested',
      })
    );

    setConsoleMessage('Refresh triggered for device and SDK layer.');
  };

  const handleCategorySelect = (category: HardwareCategory) => {
    setSelectedCategory(category);
    setSelectedSubModule(HARDWARE_OPTIONS[category][0]);
    setConsoleMessage(`Category set to ${category}.`);
  };

  const handleSubModuleChange = (sub: ScannerType) => {
    setSelectedSubModule(sub);
    setConsoleMessage(`Sub-module set to ${sub}.`);
  };

  const selectTargetModule = (code: TargetErpModuleCode) => {
    const option = getTargetModule(code);

    setTargetModuleCode(code);
    setConsoleMessage(`Target routing set to ${option.path}.`);
  };

  const currentStatusLabel = error
    ? 'FAULT'
    : isScanning
      ? 'SCANNING'
      : isDeviceSyncing
        ? 'SYNCING'
        : deviceOnline
          ? 'READY'
          : 'OFFLINE';

  const statusTone =
    currentStatusLabel === 'READY'
      ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/20'
      : currentStatusLabel === 'SCANNING'
        ? 'bg-amber-500/15 text-amber-200 ring-amber-500/20'
        : currentStatusLabel === 'SYNCING'
          ? 'bg-sky-500/15 text-sky-200 ring-sky-500/20'
          : currentStatusLabel === 'OFFLINE'
            ? 'bg-slate-700/50 text-slate-200 ring-slate-600/30'
            : 'bg-rose-500/15 text-rose-200 ring-rose-500/20';

  const latestJson = latestResult
    ? JSON.stringify(
        {
          id: latestResult.id,
          type: latestResult.type,
          timestamp: latestResult.timestamp,
          raw: latestResult.raw,
          preview: latestResult.preview ?? null,
          meta: latestResult.meta ?? null,
          scannerStatus,
          targetErpModuleCode: targetModule.code,
          targetRoutePath: targetModule.path,
          currentPath,
        },
        null,
        2
      )
    : JSON.stringify(
        {
          targetErpModuleCode: targetModule.code,
          targetErpModuleLabel: targetModule.label,
          targetRoutePath: targetModule.path,
          category: selectedCategory,
          subModule: selectedSubModule,
          status: currentStatusLabel,
          scannerStatus,
          previewAvailable: Boolean(previewUrl),
          currentPath,
        },
        null,
        2
      );

  return (
    <div tabIndex={0} className="min-h-screen bg-[#060816] text-slate-100 outline-none">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_34%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.14),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1760px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 overflow-hidden rounded-[2rem] border border-amber-500/20 bg-[linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.94),rgba(120,53,15,0.3))] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.42)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-300/80">AWM ERP UniversalScanner</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">VIP Processing Console</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
                Smart routing, hardware simulation, upload, print, share workflows and real-time audit logging for ERP integration.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">VIP Theme</span>
                <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">Direct Routing</span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">HP Printer Ready</span>
                <span className="rounded-full border border-slate-700/60 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-200">Current: {currentPath}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.28em] text-amber-200/70">Console Status</p>
                <p className="mt-1 text-sm font-semibold text-amber-100">{currentStatusLabel}</p>
              </div>

              <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Target</p>
                <p className="mt-1 text-sm font-semibold text-white">{targetModule.label}</p>
                <p className="text-xs text-amber-300">{targetModule.code}</p>
              </div>

              <Button label={isDeviceSyncing ? 'Refreshing...' : 'Refresh'} onClick={refreshAction} variant="secondary" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-6 lg:col-span-4">
            <SectionCard title="Target ERP Processing Module" subtitle="Select the ERP page that will receive scanned data.">
              <div className="space-y-3">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-200/80">Routing Dropdown</label>

                <select
                  value={targetModuleCode}
                  onChange={(e) => selectTargetModule(e.target.value as TargetErpModuleCode)}
                  className="w-full rounded-2xl border border-amber-500/20 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                >
                  {TARGET_ERP_MODULES.map((module) => (
                    <option key={module.code} value={module.code}>
                      {module.label} ({module.code}) — {module.path}
                    </option>
                  ))}
                </select>

                <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">Selected Target</p>
                  <p className="mt-1 text-sm font-semibold text-white">{targetModule.label}</p>
                  <p className="text-xs text-amber-300">{targetModule.code}</p>
                  <p className="mt-1 text-xs text-slate-400">{targetModule.path}</p>
                  <p className="mt-1 text-xs text-slate-400">{targetModule.note}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={targetModule.path}
                    className="inline-flex items-center justify-center rounded-2xl border border-amber-500/20 bg-transparent px-4 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/10"
                  >
                    Open Target Page
                  </a>
                  <Button label="Capture" onClick={captureNow} variant="amber" />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Hardware Category Selection" subtitle="Physical hardware layers with synced sub-module selection.">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {(Object.keys(HARDWARE_OPTIONS) as HardwareCategory[]).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className={[
                      'rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all',
                      selectedCategory === category
                        ? 'border-amber-400/50 bg-amber-400/15 text-amber-100'
                        : 'border-slate-700/70 bg-slate-900/60 text-slate-200 hover:border-amber-500/30 hover:bg-amber-500/10',
                    ].join(' ')}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-200/80">Synced Sub-Module</label>
                <select
                  value={selectedSubModule}
                  onChange={(e) => handleSubModuleChange(e.target.value as ScannerType)}
                  className="w-full rounded-2xl border border-amber-500/20 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                >
                  {HARDWARE_OPTIONS[selectedCategory].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </SectionCard>

            <SectionCard title="Quick Actions" subtitle="All buttons are active and connected.">
              <div className="grid grid-cols-2 gap-3">
                <Button label="Save" onClick={saveCurrent} />
                <Button label="Download" onClick={downloadPayload} variant="secondary" />
                <Button label="Upload" onClick={uploadClick} variant="secondary" />
                <Button label="Preview" onClick={previewAction} variant="ghost" />
                <Button label="Verify" onClick={verifyAction} variant="ghost" />
                <Button label="Detect" onClick={detectAction} variant="ghost" />
                <Button label="Capture" onClick={captureNow} variant="amber" />
                <Button label="History" onClick={historyAction} variant="secondary" />
                <Button label="Settings" onClick={settingsAction} variant="secondary" />
                <Button label="Refresh" onClick={refreshAction} variant="secondary" />
              </div>

              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*,application/json,text/plain,.json,.txt,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  void handleFileUpload(file);
                  e.currentTarget.value = '';
                }}
              />

              {isUploading ? <p className="mt-3 text-xs text-amber-300">Uploading and processing file...</p> : null}
            </SectionCard>
          </div>

          <div className="col-span-12 space-y-6 lg:col-span-8">
            <SectionCard title="Console Status Bar" subtitle="Live state, route and secure processing summary.">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className={`rounded-2xl border px-4 py-3 ring-1 ${statusTone}`}>
                  <p className="text-[11px] uppercase tracking-[0.22em] opacity-80">System</p>
                  <p className="mt-1 text-sm font-semibold">{currentStatusLabel}</p>
                </div>

                <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Category</p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">{selectedCategory}</p>
                </div>

                <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Sub-Module</p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">{selectedSubModule}</p>
                </div>

                <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Target Code</p>
                  <p className="mt-1 text-sm font-semibold text-amber-300">{targetModule.code}</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Live Hardware Viewport Screen" subtitle="Loading states, preview image and empty-state intelligence." className="overflow-hidden">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-amber-500/20 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.15),rgba(2,6,23,0.96)_50%)] p-4 sm:p-6">
                <div className="relative grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-3xl border border-slate-700/70 bg-slate-950/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-white">
                          {error ? 'Hardware Fault' : isScanning ? 'Live Capture In Progress' : previewUrl ? 'Mock Capture Preview' : 'Viewport Idle'}
                        </h4>

                        <p className="mt-1 text-sm text-slate-300">
                          {error
                            ? error.message
                            : isScanning
                              ? `Simulating SDK response for ${selectedSubModule} → ${targetModule.code}`
                              : previewUrl
                                ? `${selectedSubModule} securely mapped to ${targetModule.code}`
                                : 'Select a target ERP module and start a scan to generate a secure preview.'}
                        </p>
                      </div>

                      <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                        {targetModule.code}
                      </div>
                    </div>

                    <div className="mt-4 aspect-video overflow-hidden rounded-[1.5rem] border border-amber-500/15 bg-slate-900">
                      {error ? (
                        <div className="flex h-full items-center justify-center p-6 text-center">
                          <div>
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/15 text-2xl text-rose-200">!</div>
                            <p className="text-sm font-semibold text-rose-200">{error.message}</p>
                            <p className="mt-1 text-xs text-slate-400">{error.code}</p>
                          </div>
                        </div>
                      ) : isScanning ? (
                        <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                          <div className="h-14 w-14 animate-spin rounded-full border-4 border-amber-400/25 border-t-amber-300" />
                          <div>
                            <p className="text-sm font-semibold text-amber-200">Simulating SDK capture...</p>
                            <p className="mt-1 text-xs text-slate-400">
                              Device response will be mapped to {targetModule.code} and routed to {targetModule.path}.
                            </p>
                          </div>
                        </div>
                      ) : previewUrl && showPreviewPanel ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt="Mock capture preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center p-6 text-center">
                          <div>
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-xl text-amber-200">
                              ⌁
                            </div>
                            <p className="text-sm font-semibold text-slate-200">Empty viewport</p>
                            <p className="mt-1 text-xs text-slate-400">
                              No preview yet. Start scan, capture, detect or upload a file.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <Button label="Validate" onClick={validateCurrent} variant="ghost" />
                      <Button label="Compare" onClick={compareCurrent} variant="ghost" />
                      <Button label={isScanning ? 'Stop Node' : 'Start Scan'} onClick={isScanning ? stopNode : startScan} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-slate-700/70 bg-slate-950/80 p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Current Routing</p>

                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-400">ERP Module</span>
                          <span className="font-semibold text-amber-300">{targetModule.code}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-400">Route Path</span>
                          <span className="truncate font-semibold text-slate-100">{targetModule.path}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-400">Category</span>
                          <span className="font-semibold text-slate-100">{selectedCategory}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-400">Sub-Module</span>
                          <span className="font-semibold text-slate-100">{selectedSubModule}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-700/70 bg-slate-950/80 p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Console Message</p>
                      <p className="mt-3 text-sm text-slate-200">{consoleMessage}</p>
                      {error ? <p className="mt-2 text-sm text-rose-300">{error.message}</p> : null}
                    </div>

                    <div className="rounded-3xl border border-slate-700/70 bg-slate-950/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Viewport Snapshot</p>
                        <Button label={showPreviewPanel ? 'Hide Preview' : 'Show Preview'} onClick={previewAction} variant="secondary" />
                      </div>

                      <pre className="mt-3 max-h-56 overflow-auto rounded-2xl border border-amber-500/10 bg-black/30 p-3 text-xs leading-6 text-amber-100">
                        {latestJson}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Operational Controls" subtitle="Start, Stop, Retry, Reset, Export, Print, Share, Validate and Compare actions.">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Button label="Start" onClick={startScan} />
                <Button label="Stop" onClick={stopNode} variant="secondary" />
                <Button label="Retry" onClick={retryCall} variant="secondary" />
                <Button label="Reset" onClick={resetUnit} variant="danger" />
                <Button label="Export" onClick={exportPayload} variant="secondary" />
                <Button label="Print" onClick={printPayload} variant="secondary" />
                <Button label="Share" onClick={shareSystemStreamMetadata} variant="ghost" />
                <Button label="Validate" onClick={validateCurrent} variant="ghost" />
                <Button label="Compare" onClick={compareCurrent} variant="ghost" />
                <Button label="Save" onClick={saveCurrent} />
                <Button label="Download" onClick={downloadPayload} variant="secondary" />
                <Button label="Upload" onClick={uploadClick} variant="secondary" />
                <Button label="Preview" onClick={previewAction} variant="ghost" />
                <Button label="Verify" onClick={verifyAction} variant="ghost" />
                <Button label="Detect" onClick={detectAction} variant="ghost" />
                <Button label="Capture" onClick={captureNow} variant="amber" />
                <Button label="History" onClick={historyAction} variant="secondary" />
                <Button label="Settings" onClick={settingsAction} variant="secondary" />
                <Button label={isDeviceSyncing ? 'Refreshing...' : 'Refresh'} onClick={refreshAction} variant="secondary" />
              </div>
            </SectionCard>
          </div>
        </div>

        {showSettingsPanel ? (
          <div className="mt-6 grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <SectionCard title="Settings" subtitle="VIP theme and hardware integration controls.">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">Auto Route</p>
                        <p className="text-xs text-slate-400">Route captured data automatically to selected ERP page.</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSettings((prev) => ({ ...prev, autoRoute: !prev.autoRoute }))}
                        className={['relative h-8 w-14 rounded-full transition', settings.autoRoute ? 'bg-emerald-500' : 'bg-slate-700'].join(' ')}
                      >
                        <span className={['absolute top-1 h-6 w-6 rounded-full bg-white shadow transition', settings.autoRoute ? 'left-7' : 'left-1'].join(' ')} />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">Auto Save</p>
                        <p className="text-xs text-slate-400">Persist scan result and log snapshots immediately.</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSettings((prev) => ({ ...prev, autoSave: !prev.autoSave }))}
                        className={['relative h-8 w-14 rounded-full transition', settings.autoSave ? 'bg-amber-500' : 'bg-slate-700'].join(' ')}
                      >
                        <span className={['absolute top-1 h-6 w-6 rounded-full bg-white shadow transition', settings.autoSave ? 'left-7' : 'left-1'].join(' ')} />
                      </button>
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">HP Printer Name</span>
                    <input
                      value={settings.hpPrinterName}
                      onChange={(e) => setSettings((prev) => ({ ...prev, hpPrinterName: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-700/70 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                    />
                  </label>

                  <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">Preview Thumbnails</p>
                        <p className="text-xs text-slate-400">Show or hide preview thumbnails.</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSettings((prev) => ({ ...prev, showThumbnails: !prev.showThumbnails }))}
                        className={['relative h-8 w-14 rounded-full transition', settings.showThumbnails ? 'bg-sky-500' : 'bg-slate-700'].join(' ')}
                      >
                        <span className={['absolute top-1 h-6 w-6 rounded-full bg-white shadow transition', settings.showThumbnails ? 'left-7' : 'left-1'].join(' ')} />
                      </button>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <SectionCard title="Routing & Session Summary" subtitle="Stored context for ERP payload continuity.">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Auto Route</p>
                    <p className="mt-2 text-sm font-semibold text-white">{settings.autoRoute ? 'Enabled' : 'Disabled'}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Auto Save</p>
                    <p className="mt-2 text-sm font-semibold text-white">{settings.autoSave ? 'Enabled' : 'Disabled'}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Printer</p>
                    <p className="mt-2 text-sm font-semibold text-white">{settings.hpPrinterName}</p>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        ) : null}

        <div ref={historyRef} className="mt-6">
          <SectionCard title="Real-Time Audit Log Layer" subtitle="Scrollable log console with timestamps, status and routing information.">
            <div className="max-h-[460px] space-y-4 overflow-y-auto pr-1">
              {historyLogs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-amber-500/20 bg-slate-950/60 p-6 text-center text-sm text-slate-400">
                  No audit records yet. Start scan, upload, detect or trigger a control action.
                </div>
              ) : (
                historyLogs.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-amber-500/15 bg-slate-950/75 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-200">{entry.operation}</span>
                          <span
                            className={[
                              'rounded-full px-3 py-1 text-xs font-semibold',
                              entry.verificationStatus === 'SUCCESS' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-sky-500/15 text-sky-300',
                            ].join(' ')}
                          >
                            {entry.verificationStatus}
                          </span>
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">{entry.hardwareCategory}</span>
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">{entry.subModule}</span>
                        </div>

                        <div className="text-sm text-slate-200">
                          <span className="font-semibold text-white">{entry.capturedSummary}</span>
                        </div>

                        <div className="text-xs text-slate-400">
                          Captured at {formatTime(entry.capturedAt)} • Routed to{' '}
                          <span className="font-semibold text-amber-300">{entry.targetModule.code}</span> • {entry.targetModule.path}
                        </div>
                      </div>

                      <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 px-3 py-2 text-xs text-amber-100">
                        Secure target module code: <span className="font-bold">{entry.targetModule.code}</span>
                      </div>
                    </div>

                    {showHistoryDetails ? (
                      <pre className="mt-4 max-h-80 overflow-auto rounded-2xl border border-amber-500/10 bg-black/35 p-4 text-xs leading-6 text-amber-100">
                        {JSON.stringify(
                          {
                            id: entry.id,
                            operation: entry.operation,
                            verificationStatus: entry.verificationStatus,
                            capturedAt: entry.capturedAt,
                            targetErpModule: {
                              label: entry.targetModule.label,
                              code: entry.targetModule.code,
                              path: entry.targetModule.path,
                            },
                            hardwareCategory: entry.hardwareCategory,
                            subModule: entry.subModule,
                            capturedSummary: entry.capturedSummary,
                            payload: entry.payload,
                            previewUrl: entry.previewUrl ?? null,
                            routePath: entry.routePath,
                          },
                          null,
                          2
                        )}
                      </pre>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <UniversalScanner scannerType="camera" />;
}