'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const TARGET_ERP_MODULES = [
  { label: 'Dashboard - Main Console', code: 'SYS-DB', path: '/dashboard', note: 'Executive overview and live KPIs' },
  { label: 'Dashboard - Admin', code: 'SYS-ADM', path: '/dashboard/admin', note: 'Administrative dashboard' },
  { label: 'Dashboard - Real-Time Monitoring', code: 'SYS-RTM', path: '/dashboard/real-time-monitoring', note: 'Live monitoring console' },
  { label: 'Dashboard - Live Attendance', code: 'SYS-LAT', path: '/dashboard/live-attendance', note: 'Attendance summary view' },
  { label: 'Dashboard - Live KPI', code: 'SYS-KPI', path: '/dashboard/live-kpi', note: 'KPI management view' },
  { label: 'Dashboard - Notifications', code: 'SYS-NOT', path: '/dashboard/notifications', note: 'Alerts and notifications' },

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
  { label: 'Attendance - History', code: 'ATT-HIS', path: '/attendance/history', note: 'Attendance history' },
  { label: 'Attendance - QR', code: 'ATT-QR', path: '/attendance/qr', note: 'QR attendance' },
  { label: 'Attendance - Shifts', code: 'ATT-SHF', path: '/attendance/shifts', note: 'Shift management' },

  { label: 'Inventory - Main', code: 'INV-MAIN', path: '/inventory', note: 'Inventory module home' },
  { label: 'Inventory - Product Entry', code: 'INV-PROD', path: '/inventory', note: 'Product entry routing' },
  { label: 'Inventory - QR Barcode Scanner', code: 'INV-SCAN', path: '/inventory/qr-barcode-scanner', note: 'Barcode / QR scanner' },
  { label: 'Inventory - Live Stock Tracking', code: 'INV-LST', path: '/inventory/live-stock-tracking', note: 'Stock tracking' },
  { label: 'Inventory - Delivery Tracking', code: 'INV-DEL', path: '/inventory/delivery-tracking', note: 'Delivery tracking' },
  { label: 'Inventory - Warehouse', code: 'INV-WHS', path: '/inventory/warehouse', note: 'Warehouse operations' },
  { label: 'Inventory - Suppliers', code: 'INV-SUP', path: '/inventory/suppliers', note: 'Supplier management' },
  { label: 'Inventory - Logistics', code: 'INV-LOG', path: '/inventory/logistics', note: 'Logistics module' },
  { label: 'Inventory - Purchase Orders', code: 'INV-PO', path: '/inventory/purchase-orders', note: 'Purchase orders' },

  { label: 'Sales - CRM', code: 'SAL-CRM', path: '/sales/crm', note: 'CRM routing' },
  { label: 'Sales - Customers', code: 'SAL-CUS', path: '/sales/customers', note: 'Customer records' },
  { label: 'Sales - Leads', code: 'SAL-LED', path: '/sales/leads', note: 'Lead management' },
  { label: 'Sales - Invoices', code: 'ACC-INV', path: '/sales/invoices', note: 'Invoice and bills' },
  { label: 'Sales - Analytics', code: 'SAL-ANA', path: '/sales/analytics', note: 'Sales analytics' },
  { label: 'Sales - Marketing', code: 'SAL-MKT', path: '/sales/marketing', note: 'Marketing workflows' },
  { label: 'Sales - Client Chat', code: 'SAL-CHT', path: '/sales/client-chat', note: 'Client chat' },
  { label: 'Sales - AI Assistant', code: 'SAL-AI', path: '/sales/ai-assistant', note: 'Sales AI assistant' },

  { label: 'Reports - Main', code: 'RPT-MAIN', path: '/reports', note: 'Reports home' },
  { label: 'Reports - Export', code: 'RPT-EXP', path: '/reports/export', note: 'Export center' },
  { label: 'Reports - Print Center', code: 'RPT-PRN', path: '/reports/print-center', note: 'Print center' },
  { label: 'Reports - PDF', code: 'RPT-PDF', path: '/reports/pdf', note: 'PDF reports' },
  { label: 'Reports - Excel', code: 'RPT-XLS', path: '/reports/excel', note: 'Excel reports' },
  { label: 'Reports - Attendance', code: 'RPT-ATT', path: '/reports/attendance', note: 'Attendance reporting' },
  { label: 'Reports - Employees', code: 'RPT-EMP', path: '/reports/employees', note: 'Employee reporting' },
  { label: 'Reports - Smart Reports', code: 'RPT-SMT', path: '/reports/smart-reports', note: 'Smart reports' },

  { label: 'Security - Access Control', code: 'SEC-LOG', path: '/security/access-control', note: 'Access control log' },
  { label: 'Security - Audit Logs', code: 'SEC-AUD', path: '/security/audit-logs', note: 'Audit log center' },
  { label: 'Security - Biometric', code: 'SEC-BIO', path: '/security/biometric', note: 'Biometric security' },
  { label: 'Security - Alerts', code: 'SEC-ALR', path: '/security/alerts', note: 'Security alerts' },
  { label: 'Security - API Keys', code: 'SEC-KEY', path: '/security/api-keys', note: 'API key management' },
  { label: 'Security - IP Restrictions', code: 'SEC-IPR', path: '/security/ip-restrictions', note: 'IP restrictions' },
  { label: 'Security - Threat Detection', code: 'SEC-THR', path: '/security/threat-detection', note: 'Threat detection' },
  { label: 'Security - User Roles', code: 'SEC-ROL', path: '/security/user-roles', note: 'Role-based access' },

  { label: 'Settings - Main', code: 'SET-MAIN', path: '/settings', note: 'Settings home' },
  { label: 'Settings - ERP Connectors', code: 'SET-CONN', path: '/settings/erp-connectors', note: 'Connector configuration' },
  { label: 'Settings - API Integration', code: 'SET-API', path: '/settings/api-integration', note: 'API integration' },
  { label: 'Settings - Mobile Sync', code: 'SET-SYNC', path: '/settings/mobile-sync', note: 'Mobile sync' },
  { label: 'Settings - Quality Control', code: 'SET-QC', path: '/settings/quality-control', note: 'Quality control' },
  { label: 'Settings - Company', code: 'SET-COMP', path: '/settings/company', note: 'Company settings' },
  { label: 'Settings - Theme', code: 'SET-THEME', path: '/settings/theme', note: 'Theme settings' },
  { label: 'Settings - Dark Mode', code: 'SET-DARK', path: '/settings/dark-mode', note: 'Dark mode' },

  { label: 'Production - Main', code: 'PRD-MAIN', path: '/production', note: 'Production home' },
  { label: 'Production - Equipment Status', code: 'PRD-EQP', path: '/production/equipment-status', note: 'Equipment status' },
  { label: 'Production - KPI', code: 'PRD-KPI', path: '/production/kpi', note: 'Production KPI' },
  { label: 'Production - Line Management', code: 'PRD-LNE', path: '/production/line-management', note: 'Line management' },
  { label: 'Production - Machine Monitoring', code: 'PRD-MCH', path: '/production/machine-monitoring', note: 'Machine monitoring' },
  { label: 'Production - Maintenance', code: 'PRD-MNT', path: '/production/maintenance', note: 'Maintenance workflow' },
  { label: 'Production - Planning', code: 'PRD-PLN', path: '/production/planning', note: 'Production planning' },
  { label: 'Production - Raw Materials', code: 'PRD-RAW', path: '/production/raw-materials', note: 'Raw materials' },
  { label: 'Production - Waste Analysis', code: 'PRD-WST', path: '/production/waste-analysis', note: 'Waste analysis' },

  { label: 'Next-Gen - AI Voice ERP', code: 'AI-ERP', path: '/next-gen/ai-voice-erp', note: 'AI voice routing' },
  { label: 'Next-Gen - AI Document Understanding', code: 'AI-DOC', path: '/next-gen/ai-document-understanding', note: 'Document AI' },
  { label: 'Next-Gen - Autonomous AI Agent', code: 'AI-AGT', path: '/next-gen/autonomous-ai-agent', note: 'Autonomous agent' },
  { label: 'Next-Gen - Auto Decision Engine', code: 'AI-DEC', path: '/next-gen/auto-decision-engine', note: 'Decision engine' },
  { label: 'Next-Gen - Predictive Analytics', code: 'AI-PRD', path: '/next-gen/predictive-analytics', note: 'Predictive analytics' },
  { label: 'Next-Gen - Live IoT Devices', code: 'AI-IOT', path: '/next-gen/live-iot-devices', note: 'IoT monitoring' },
  { label: 'Next-Gen - AR VR Dashboard', code: 'AI-ARV', path: '/next-gen/ar-vr-dashboard', note: 'AR/VR dashboard' },
  { label: 'Next-Gen - Remote Factory Control', code: 'AI-RFC', path: '/next-gen/remote-factory-control', note: 'Remote factory control' },

  { label: 'AI - Analytics', code: 'AI-ANL', path: '/ai/analytics', note: 'AI analytics' },
  { label: 'AI - Assistant', code: 'AI-ASS', path: '/ai/assistant', note: 'AI assistant' },
  { label: 'AI - Attendance', code: 'AI-ATT', path: '/ai/attendance', note: 'AI attendance' },
  { label: 'AI - Chat', code: 'AI-CHT', path: '/ai/chat', note: 'AI chat' },
  { label: 'AI - Cost Management', code: 'AI-CST', path: '/ai/cost-management', note: 'Cost management AI' },
  { label: 'AI - Driven Medical Imaging Intelligence', code: 'AI-MED', path: '/ai/driven-medical-imaging-intelligence', note: 'Medical imaging AI' },
  { label: 'AI - ePrescription', code: 'AI-RX', path: '/ai/ePrescription', note: 'ePrescription AI' },
  { label: 'AI - Multi Language', code: 'AI-MTL', path: '/ai/multi-language', note: 'Multi-language AI' },
  { label: 'AI - Payroll', code: 'AI-PRL', path: '/ai/payroll', note: 'AI payroll' },
  { label: 'AI - Pharmacy Smart Hub', code: 'AI-PHM', path: '/ai/pharmacy/smart-hub', note: 'Pharmacy smart hub' },
  { label: 'AI - Prediction', code: 'AI-PRT', path: '/ai/prediction', note: 'Prediction engine' },
  { label: 'AI - Report Generator', code: 'AI-RPG', path: '/ai/report-generator', note: 'Report generator' },
  { label: 'AI - Restaurant', code: 'AI-RES', path: '/ai/restaurant', note: 'Restaurant AI' },
  { label: 'AI - Revenue Orchestrator', code: 'AI-RVN', path: '/ai/revenue-orchestrator', note: 'Revenue orchestration' },
  { label: 'AI - Search', code: 'AI-SRH', path: '/ai/search', note: 'AI search' },
  { label: 'AI - Voice Command', code: 'AI-VCM', path: '/ai/voice-command', note: 'Voice commands' },
] as const;

type TargetErpModuleCode = (typeof TARGET_ERP_MODULES)[number]['code'];
type RouteOption = (typeof TARGET_ERP_MODULES)[number];
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
  | 'voice'
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

type ScannerErrorCode =
  | 'DEVICE_NOT_CONNECTED'
  | 'CAMERA_PERMISSION_DENIED'
  | 'MIC_PERMISSION_DENIED'
  | 'SDK_NOT_INSTALLED'
  | 'DRIVER_MISSING'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'INVALID_DOCUMENT'
  | 'SCAN_FAILED'
  | 'AUTH_FAILED'
  | 'UNSUPPORTED_BROWSER'
  | 'UNSUPPORTED_DEVICE'
  | 'DUPLICATE_SCAN'
  | 'UNKNOWN_ERROR';

interface ScannerError {
  code: ScannerErrorCode;
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

interface TargetErpModule {
  label: string;
  code: TargetErpModuleCode;
  path: string;
  note: string;
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

interface ModuleSelection {
  category: HardwareCategory;
  subModule: ScannerType;
}

interface SettingsState {
  autoRoute: boolean;
  autoSave: boolean;
  hpPrinterName: string;
  showThumbnails: boolean;
}

const HISTORY_STORAGE_KEY = 'awm-erp-universal-scanner-history-v4';
const SETTINGS_STORAGE_KEY = 'awm-erp-universal-scanner-settings-v4';
const LAST_RESULT_STORAGE_KEY = 'awm-erp-universal-scanner-last-result-v4';

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

const SCANNER_TO_CATEGORY: Record<string, HardwareCategory> = {
  fingerprint: 'BIOMETRIC',
  'multi-finger': 'BIOMETRIC',
  palm: 'BIOMETRIC',
  face: 'BIOMETRIC',
  'face-auth': 'BIOMETRIC',
  'face-detect': 'BIOMETRIC',
  iris: 'BIOMETRIC',
  retina: 'BIOMETRIC',
  voice: 'BIOMETRIC',
  'voice-auth': 'BIOMETRIC',
  signature: 'DOCUMENT',
  'digital-signature': 'DOCUMENT',
  'hand-geometry': 'BIOMETRIC',
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
  'qr-document': 'BARCODE_QR',
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
};

const INITIAL_SELECTION_BY_TYPE = (type: ScannerType): ModuleSelection => {
  const category = SCANNER_TO_CATEGORY[type] ?? 'CAMERA';
  const fallback = HARDWARE_OPTIONS[category][0] ?? 'camera';
  return { category, subModule: type in SCANNER_TO_CATEGORY ? type : fallback };
};

const INITIAL_SETTINGS: SettingsState = {
  autoRoute: true,
  autoSave: true,
  hpPrinterName: 'HP Connected Printer',
  showThumbnails: true,
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

const safeId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `scan_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const getTargetModule = (code: TargetErpModuleCode): RouteOption =>
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
    case 'INV-PROD':
      return 'productEntry';
    case 'INV-SCAN':
      return 'barcodeScanner';
    case 'ACC-INV':
      return 'invoiceAndBills';
    case 'PRC-CTR'as any:
      return 'digitalContracts';
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
        <stop offset="50%" stop-color="#111827"/>
        <stop offset="100%" stop-color="#78350f"/>
      </linearGradient>
      <linearGradient id="amber" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#fbbf24"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#bg)"/>
    <rect x="44" y="44" width="1192" height="632" rx="28" fill="#0b1220" opacity="0.92" stroke="#f59e0b" stroke-width="2"/>
    <circle cx="1080" cy="122" r="66" fill="url(#amber)" opacity="0.2"/>
    <text x="82" y="124" fill="#fbbf24" font-size="34" font-family="Arial, Helvetica, sans-serif" font-weight="700">AWM ERP UniversalScanner</text>
    <text x="82" y="174" fill="#e5e7eb" font-size="22" font-family="Arial, Helvetica, sans-serif">Target ERP Module: ${params.targetModule.label} (${params.targetModule.code})</text>
    <text x="82" y="218" fill="#d1d5db" font-size="20" font-family="Arial, Helvetica, sans-serif">Route: ${params.targetModule.path}</text>
    <text x="82" y="258" fill="#d1d5db" font-size="20" font-family="Arial, Helvetica, sans-serif">Hardware Category: ${params.category}</text>
    <text x="82" y="298" fill="#d1d5db" font-size="20" font-family="Arial, Helvetica, sans-serif">Sub-Module: ${params.subModule}</text>
    <text x="82" y="348" fill="#f59e0b" font-size="22" font-family="Arial, Helvetica, sans-serif" font-weight="700">${params.summary}</text>
    <rect x="82" y="394" width="1116" height="188" rx="18" fill="#111827" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="110" y="446" fill="#9ca3af" font-size="18" font-family="Arial, Helvetica, sans-serif">Captured At</text>
    <text x="110" y="482" fill="#f8fafc" font-size="24" font-family="Arial, Helvetica, sans-serif" font-weight="700">${formatTime(params.timestamp)}</text>
    <text x="110" y="532" fill="#9ca3af" font-size="18" font-family="Arial, Helvetica, sans-serif">Status</text>
    <text x="110" y="568" fill="#86efac" font-size="22" font-family="Arial, Helvetica, sans-serif" font-weight="700">${params.note ?? 'SUCCESS / VALIDATED'}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const createDocumentPreview = (title: string, subtitle: string, path: string): string => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1d4ed8"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#bg2)"/>
    <rect x="64" y="64" width="1152" height="592" rx="32" fill="#020617" opacity="0.82" stroke="#f59e0b" stroke-width="2"/>
    <text x="96" y="134" fill="#fbbf24" font-size="36" font-family="Arial, Helvetica, sans-serif" font-weight="700">${title}</text>
    <text x="96" y="190" fill="#e2e8f0" font-size="22" font-family="Arial, Helvetica, sans-serif">${subtitle}</text>
    <rect x="96" y="248" width="1088" height="248" rx="20" fill="#111827" stroke="#f59e0b" stroke-width="1.2"/>
    <text x="128" y="312" fill="#94a3b8" font-size="18" font-family="Arial, Helvetica, sans-serif">Target route</text>
    <text x="128" y="360" fill="#f8fafc" font-size="28" font-family="Arial, Helvetica, sans-serif" font-weight="700">${path}</text>
    <text x="128" y="428" fill="#86efac" font-size="20" font-family="Arial, Helvetica, sans-serif" font-weight="700">READY FOR ROUTING</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const SectionCard: React.FC<{ title: string; subtitle?: string; className?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  className = '',
  children,
}) => (
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

const Button: React.FC<{
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'amber';
  className?: string;
  title?: string;
}> = ({ label, onClick, variant = 'primary', className = '', title }) => {
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
};

const loadJSON = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export default function UniversalScanner({ scannerType = 'camera' }: { scannerType?: ScannerType }) {
  const router = useRouter();
  const pathname = usePathname();
  const initialSelection = INITIAL_SELECTION_BY_TYPE(scannerType);

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
  const [themeMode] = useState<'vip'>('vip');

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
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyLogs.slice(0, 150)));
    } catch {}
  }, [historyLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      if (latestResult) localStorage.setItem(LAST_RESULT_STORAGE_KEY, JSON.stringify(latestResult));
      else localStorage.removeItem(LAST_RESULT_STORAGE_KEY);
    } catch {}
  }, [latestResult]);

  useEffect(() => {
    const nextSelection = INITIAL_SELECTION_BY_TYPE(scannerType);
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

  const buildPayload = (operation: AuditOperation, verificationStatus: VerificationStatus, extra?: Record<string, unknown>): AuditEntry => {
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
      capturedSummary:
        (extra?.capturedSummary as string | undefined) ??
        (operation === 'START_SCAN'
          ? `SIMULATED_CAPTURE::${selectedSubModule}`
          : operation === 'CAPTURE'
            ? `CAPTURED::${selectedSubModule}`
            : operation === 'UPLOAD'
              ? 'UPLOAD_COMPLETED'
              : operation === 'DOWNLOAD'
                ? 'DOWNLOAD_READY'
                : operation === 'VALIDATE'
                  ? 'VALIDATION_PASSED'
                  : operation === 'VERIFY'
                    ? 'VERIFICATION_PASSED'
                    : operation === 'COMPARE'
                      ? 'COMPARE_CHECK_COMPLETED'
                      : operation === 'SYNC_DEVICES' || operation === 'REFRESH'
                        ? 'DEVICE_DRIVER_PING_OK'
                        : operation === 'SAVE'
                          ? 'DATA_SAVED_TO_AUDIT_BUFFER'
                          : operation === 'PRINT'
                            ? 'PRINT_JOB_TRIGGERED'
                            : operation === 'EXPORT'
                              ? 'EXPORT_PAYLOAD_GENERATED'
                              : operation === 'SHARE_SYSTEM_STREAM_METADATA'
                                ? 'SYSTEM_STREAM_SHARED'
                                : operation === 'RESET_UNIT'
                                  ? 'UNIT_RESET_COMPLETE'
                                  : operation === 'STOP_NODE'
                                    ? 'NODE_STOPPED'
                                    : operation === 'RETRY_CALL'
                                      ? 'RETRY_SEQUENCE_STARTED'
                                      : operation === 'HISTORY'
                                        ? 'HISTORY_PANEL_TOGGLED'
                                        : operation === 'SETTINGS'
                                          ? 'SETTINGS_PANEL_TOGGLED'
                                          : 'OPERATION_COMPLETED'),
      payload,
      previewUrl: (extra?.previewUrl as string | null | undefined) ?? null,
      routePath: targetModule.path,
    };
  };

  const commitResult = (entry: AuditEntry, raw: unknown, preview?: string | null) => {
    appendLog(entry);
    const result: ScannerResult = {
      id: entry.id,
      type: selectedSubModule,
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
    try {
      sessionStorage.setItem(`AWM_SCANNER:${entry.id}`, JSON.stringify(snapshot));
      sessionStorage.setItem('AWM_SCANNER:last', JSON.stringify(snapshot));
    } catch {}
  };

  const routeCapturedData = (entry: AuditEntry, raw: unknown) => {
    createSessionSnapshot(entry, raw);
    if (settings.autoRoute) {
      router.push(`${targetModule.path}?scanId=${encodeURIComponent(entry.id)}&module=${encodeURIComponent(targetModule.code)}`);
    } else {
      setConsoleMessage(`Routing stored for ${targetModule.path}. Auto-route is disabled.`);
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
      const entry = buildPayload('SYNC_DEVICES', 'SUCCESS', {
        capturedSummary: 'DEVICE_DRIVER_PING_OK',
        deviceDriver: 'AWM Universal SDK Driver',
        sdkHandshake: 'OK',
        printerTarget: settings.hpPrinterName,
      });
      appendLog(entry);
      syncTimerRef.current = null;
    }, 900);
  };

  const ensureDeviceReady = (callback: () => void) => {
    if (deviceOnline) {
      callback();
      return;
    }
    syncDevices();
    syncTimerRef.current = setTimeout(callback, 980);
  };

  const autoSaveEntry = (entry: AuditEntry, raw: unknown, preview?: string | null) => {
    if (!settings.autoSave) return;
    const saveEntry = buildPayload('SAVE', 'SUCCESS', {
      capturedSummary: `SAVED:${entry.subModule}`,
      autoSaved: true,
      sourceOperation: entry.operation,
      previewUrl: preview ?? entry.previewUrl ?? null,
    });
    appendLog(saveEntry);
    setLatestResult({
      id: entry.id,
      type: selectedSubModule,
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
          latencyMs: mode === 'delay' ? 1500 : 0,
        },
      };

      const entry: AuditEntry = {
        id: safeId(),
        operation: 'START_SCAN',
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

    scanTimerRef.current = setTimeout(execute, 1500);
  };

  const startScan = () => {
    if (!deviceOnline) {
      ensureDeviceReady(() => startScanInternal('delay'));
      return;
    }
    startScanInternal('delay');
  };

  const captureNow = () => {
    if (!deviceOnline) {
      ensureDeviceReady(() => startScanInternal('instant'));
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
    appendLog(entry);
    setLatestResult({
      id: entry.id,
      type: selectedSubModule,
      timestamp: entry.capturedAt,
      raw: entry.payload,
      preview: previewUrl ?? undefined,
      meta: {
        operation: entry.operation,
        verificationStatus: entry.verificationStatus,
        targetErpModule: entry.targetModule.code,
        targetRoutePath: entry.routePath,
        hardwareCategory: entry.hardwareCategory,
      },
    });
  };

  const retryCall = () => {
    clearTimers();
    setIsScanning(false);
    setScannerStatus('idle');
    setConsoleMessage('Retry sequence initiated.');
    const entry = buildPayload('RETRY_CALL', 'SUCCESS', { capturedSummary: 'RETRY_SEQUENCE_STARTED' });
    appendLog(entry);
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
    appendLog(entry);
    setLatestResult({
      id: entry.id,
      type: selectedSubModule,
      timestamp: entry.capturedAt,
      raw: entry.payload,
      preview: undefined,
      meta: {
        operation: entry.operation,
        verificationStatus: entry.verificationStatus,
        targetErpModule: entry.targetModule.code,
        targetRoutePath: entry.routePath,
        hardwareCategory: entry.hardwareCategory,
      },
    });
  };

  const validateCurrent = () => {
    const entry = buildPayload('VALIDATE', 'VALIDATED', {
      capturedSummary: latestResult ? `VALIDATED:${latestResult.type}` : `VALIDATED:${selectedSubModule}`,
      verifiedAgainst: targetModule.code,
      verificationEngine: 'AWM-Validation-Engine',
      previewUrl,
    });
    commitResult(entry, latestResult?.raw ?? entry.payload, previewUrl);
    appendLog(entry);
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
    appendLog(entry);
    setLatestResult({
      id: entry.id,
      type: selectedSubModule,
      timestamp: entry.capturedAt,
      raw: entry.payload,
      preview: previewUrl ?? undefined,
      meta: {
        operation: entry.operation,
        verificationStatus: entry.verificationStatus,
        targetErpModule: entry.targetModule.code,
        targetRoutePath: entry.routePath,
        hardwareCategory: entry.hardwareCategory,
      },
    });
    setConsoleMessage(`Comparison completed for ${targetModule.code}.`);
  };

  const saveCurrent = () => {
    const entry = buildPayload('SAVE', 'SUCCESS', {
      capturedSummary: latestResult ? `SAVED:${latestResult.type}` : `SAVED:${selectedSubModule}`,
      savedCount: historyLogs.length + 1,
      previewUrl,
    });
    appendLog(entry);
    setLatestResult({
      id: entry.id,
      type: selectedSubModule,
      timestamp: entry.capturedAt,
      raw: entry.payload,
      preview: previewUrl ?? undefined,
      meta: {
        operation: entry.operation,
        verificationStatus: entry.verificationStatus,
        targetErpModule: entry.targetModule.code,
        targetRoutePath: entry.routePath,
        hardwareCategory: entry.hardwareCategory,
      },
    });
    setScannerStatus('success');
    setConsoleMessage(`Saved into audit buffer for ${targetModule.code}.`);
    if (typeof window !== 'undefined') window.alert(`Save completed successfully for ${targetModule.code}.`);
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

    const entry = buildPayload('EXPORT', 'SUCCESS', {
      capturedSummary: `EXPORTED:${targetModule.code}`,
      exportFile: `awm-erp-universal-scanner-${targetModule.code}.json`,
    });
    appendLog(entry);
    setConsoleMessage(`Exported payload for ${targetModule.code}.`);
  };

  const downloadPayload = () => {
    if (previewUrl) {
      const mime = previewUrl.startsWith('data:image/png')
        ? 'image/png'
        : previewUrl.startsWith('data:image/jpeg')
          ? 'image/jpeg'
          : previewUrl.startsWith('data:image/svg+xml')
            ? 'image/svg+xml'
            : 'application/octet-stream';
      const ext = mime === 'image/png' ? 'png' : mime === 'image/jpeg' ? 'jpg' : mime === 'image/svg+xml' ? 'svg' : 'bin';
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

    const entry = buildPayload('DOWNLOAD', 'SUCCESS', {
      capturedSummary: `DOWNLOADED:${targetModule.code}`,
      fileType: previewUrl ? 'image' : 'json',
    });
    appendLog(entry);
    setConsoleMessage(`Downloaded payload for ${targetModule.code}.`);
  };

  const printPayload = () => {
    const entry = buildPayload('PRINT', 'SUCCESS', {
      capturedSummary: `PRINTED:${targetModule.code}`,
      printerTarget: settings.hpPrinterName,
    });
    appendLog(entry);
    setConsoleMessage(`Print job sent to ${settings.hpPrinterName}.`);
    if (typeof window !== 'undefined') window.print();
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
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'AWM ERP System Stream Metadata', text });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setConsoleMessage('System stream metadata shared.');
    } catch {
      setError({
        code: 'UNKNOWN_ERROR',
        message: 'Unable to share system stream metadata.',
      });
    }

    const entry = buildPayload('SHARE_SYSTEM_STREAM_METADATA', 'SUCCESS', {
      capturedSummary: `SHARED:${targetModule.code}`,
      metadata,
    });
    appendLog(entry);
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
        raw = await file.text();
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
      appendLog(entry);
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
    setShowPreviewPanel((prev) => !prev);
    const entry = buildPayload('PREVIEW', 'SUCCESS', {
      capturedSummary: `PREVIEW_${showPreviewPanel ? 'HIDDEN' : 'VISIBLE'}`,
      previewEnabled: !showPreviewPanel,
    });
    appendLog(entry);
    setConsoleMessage(showPreviewPanel ? 'Preview panel hidden.' : 'Preview panel visible.');
  };

  const verifyAction = () => {
    const entry = buildPayload('VERIFY', 'VALIDATED', {
      capturedSummary: `VERIFIED:${selectedSubModule}`,
      verifiedRoute: targetModule.path,
      verifiedModuleCode: targetModule.code,
      hpPrinterName: settings.hpPrinterName,
    });
    appendLog(entry);
    setLatestResult({
      id: entry.id,
      type: selectedSubModule,
      timestamp: entry.capturedAt,
      raw: entry.payload,
      preview: previewUrl ?? undefined,
      meta: {
        operation: entry.operation,
        verificationStatus: entry.verificationStatus,
        targetErpModule: entry.targetModule.code,
        targetRoutePath: entry.routePath,
        hardwareCategory: entry.hardwareCategory,
      },
    });
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
    appendLog(entry);
    setConsoleMessage(`Detection completed for ${selectedSubModule}.`);
  };

  const historyAction = () => {
    setShowHistoryDetails((prev) => !prev);
    historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const entry = buildPayload('HISTORY', 'SUCCESS', {
      capturedSummary: `HISTORY:${showHistoryDetails ? 'COLLAPSED' : 'EXPANDED'}`,
      historyExpanded: !showHistoryDetails,
    });
    appendLog(entry);
  };

  const settingsAction = () => {
    setShowSettingsPanel((prev) => !prev);
    const entry = buildPayload('SETTINGS', 'SUCCESS', {
      capturedSummary: `SETTINGS:${showSettingsPanel ? 'CLOSED' : 'OPENED'}`,
      settingsPanel: !showSettingsPanel,
    });
    appendLog(entry);
  };

  const refreshAction = () => {
    syncDevices();
    const entry = buildPayload('REFRESH', 'SUCCESS', {
      capturedSummary: 'REFRESH_TRIGGERED',
      refreshReason: 'Hardware and SDK refresh requested',
    });
    appendLog(entry);
    setConsoleMessage('Refresh triggered for device and SDK layer.');
  };

  const handleCategorySelect = (category: HardwareCategory) => {
    setSelectedCategory(category);
    const firstSub = HARDWARE_OPTIONS[category][0];
    setSelectedSubModule(firstSub);
    setConsoleMessage(`Category set to ${category}.`);
  };

  const handleSubModuleChange = (sub: ScannerType) => {
    setSelectedSubModule(sub);
    setConsoleMessage(`Sub-module set to ${sub}.`);
  };

  const selectTargetModule = (code: TargetErpModuleCode) => {
    setTargetModuleCode(code);
    const option = getTargetModule(code);
    setConsoleMessage(`Target routing set to ${option.path}.`);
  };

  const currentStatusLabel: string = error
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
          previewAvailable: Boolean(previewUrl),
          currentPath,
        },
        null,
        2
      );

  return (
    <div tabIndex={0} className={`min-h-screen ${themeMode === 'vip' ? 'bg-[#060816]' : 'bg-slate-950'} text-slate-100 outline-none`}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_34%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.14),transparent_30%)]" />
      <div className="relative mx-auto max-w-[1760px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 overflow-hidden rounded-[2rem] border border-amber-500/20 bg-[linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.94),rgba(120,53,15,0.3))] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.42)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-300/80">AWM ERP UniversalScanner</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">VIP Processing Console</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
                Smart routing, hardware simulation, upload/print/share workflows, and real-time audit logging designed for seamless ERP integration.
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
              <Button label={isDeviceSyncing ? '🔄 Refreshing...' : '🔄 Refresh'} onClick={refreshAction} variant="secondary" title="Refresh devices and SDK layer" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <SectionCard title="Target ERP Processing Module" subtitle="Select the ERP page that will receive the scanned data or QR workflow.">
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

                <div className="flex gap-3">
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
                {(['BARCODE_QR', 'BIOMETRIC', 'DOCUMENT', 'IDENTITY', 'CAMERA', 'SECURITY', 'INDUSTRIAL', 'MEDICAL', 'AI'] as HardwareCategory[]).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className={[
                      'rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all',
                      selectedCategory === category
                        ? 'border-amber-400/50 bg-amber-400/15 text-amber-100 shadow-[0_0_0_1px_rgba(245,158,11,0.12)]'
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

            <SectionCard title="Quick Actions" subtitle="Active operational buttons and utility workflows.">
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

          <div className="col-span-12 lg:col-span-8 space-y-6">
            <SectionCard title="Console Status Bar" subtitle="Live state, route, and secure processing summary.">
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

            <SectionCard title="Live Hardware Viewport Screen" subtitle="Loading states, preview image, and empty-state intelligence." className="overflow-hidden">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-amber-500/20 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.15),rgba(2,6,23,0.96)_50%)] p-4 sm:p-6">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(245,158,11,0.06),transparent_35%,rgba(248,113,113,0.05)_70%,transparent)]" />
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
                        <img src={previewUrl} alt="Mock capture preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center p-6 text-center">
                          <div>
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-xl text-amber-200">
                              ⌁
                            </div>
                            <p className="text-sm font-semibold text-slate-200">Empty viewport</p>
                            <p className="mt-1 text-xs text-slate-400">
                              No preview yet. Start a scan, capture, detect, or upload a file to populate this screen.
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

            <SectionCard title="Operational Controls" subtitle="Start, Stop, Retry, Reset, Export, Print, Share, Validate, Compare and service actions.">
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
                        <p className="text-xs text-slate-400">Route captured data automatically to the selected ERP page.</p>
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
                        <p className="text-xs text-slate-400">Show or hide preview thumbnails within the console.</p>
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

                  <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4 text-sm text-slate-200">
                    <p className="font-semibold text-amber-200">VIP Theme Active</p>
                    <p className="mt-1 text-xs text-slate-400">Premium amber-and-midnight theme enabled for a smart, executive-level dashboard feel.</p>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <SectionCard title="Routing & Session Summary" subtitle="Stored context for direct module navigation and ERP payload continuity.">
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
          <SectionCard title="Real-Time Audit Log Layer" subtitle="Scrollable log console with timestamps, status, and exact ERP routing information.">
            <div className="max-h-[460px] space-y-4 overflow-y-auto pr-1">
              {historyLogs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-amber-500/20 bg-slate-950/60 p-6 text-center text-sm text-slate-400">
                  No audit records yet. Start a scan, upload a file, detect a device, or trigger a control action to populate the log console.
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
                          Captured at {formatTime(entry.capturedAt)} • Routed to <span className="font-semibold text-amber-300">{entry.targetModule.code}</span> • {entry.targetModule.path}
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
    targetErpModuleCode: entry.targetModule.code,
    targetRoutePath: entry.targetModule.path,
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