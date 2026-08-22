"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type BioMode = "fingerprint" | "face" | null;
type BioStatus = "idle" | "running" | "success" | "failed";
type ThemeMode = "dark" | "light";

type SidebarItem = {
  label: string;
  href: string;
  icon: string;
  badge?: string;
};

type SidebarSection = {
  key: string;
  title: string;
  icon: string;
  items: SidebarItem[];
};

type CommandItem = SidebarItem & {
  sectionKey: string;
  sectionTitle: string;
};

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    key: "admin-panel",
    title: "Admin Panel",
    icon: "🛡️",
    items: [
      {
        label: "Admin Dashboard",
        href: "/dashboard/admin",
        icon: "👤"
      }
    ]
  },
  {
    key: "ai-control-center",
    title: "AI Control Center",
    icon: "🧠",
    items: [
      { label: "AI Assistant", href: "/ai/assistant", icon: "🤖", badge: "AI" },
      { label: "Smart ChatGPT", href: "/ai/chat", icon: "💬" },
      { label: "AI Analytics", href: "/ai/analytics", icon: "📊" },
      { label: "Attendance AI", href: "/ai/attendance", icon: "🧠" },
      { label: "Payroll AI", href: "/ai/payroll", icon: "💰" },
      { label: "AI Revenue Orchestrator", href: "/ai/revenue-orchestrator", icon: "💎" },
      { label: "Prediction AI", href: "/ai/prediction", icon: "📈" },
      { label: "AI Search", href: "/ai/search", icon: "🔍" },
      { label: "Voice Command", href: "/ai/voice-command", icon: "🗣" },
      { label: "Multi-language AI", href: "/ai/multi-language", icon: "🌐" },
      { label: "AI Report Generator", href: "/ai/report-generator", icon: "📄" },
    ],
  },
  {
    key: "industry-solutions",
    title: "Industry Solutions",
    icon: "🏥",
    items: [
      { label: "Smart Pharmacy", href: "/ai/pharmacy/smart-hub", icon: "💊" },
      { label: "Smart Restaurant AI", href: "/ai/restaurant", icon: "🍽️" },
      { label: "AI e-Prescription", href: "/ai/ePrescription", icon: "📋" },
      {
        label: "AI-Driven Medical Imaging Intelligence",
        href: "/ai/driven-medical-imaging-intelligence",
        icon: "🧠",
      },
    ],
  },
  {
    key: "dashboard-system",
    title: "Dashboard System",
    icon: "📊",
    items: [
      { label: "Main Dashboard", href: "/dashboard", icon: "📊" },
      { label: "Live KPI", href: "/dashboard/live-kpi", icon: "📈", badge: "Live" },
      { label: "Notifications", href: "/dashboard/notifications", icon: "🔔" },
      { label: "Smart Calendar", href: "/dashboard/calendar", icon: "📅" },
      { label: "Activity Timeline", href: "/dashboard/activity-timeline", icon: "⚡" },
      {
        label: "Real-time Monitoring",
        href: "/dashboard/real-time-monitoring",
        icon: "📡",
      },
      { label: "Branch Overview", href: "/dashboard/branch-overview", icon: "🌍" },
    ],
  },
  {
    key: "hr-employee-management",
    title: "HR & Employee Management",
    icon: "👥",
    items: [
      { label: "Employees", href: "/hr/employees", icon: "👨" },
      { label: "Employee Profile", href: "/hr/employee-profile", icon: "🆔" },
      { label: "ID Card Generator", href: "/hr/id-card-generator", icon: "🪪" },
      { label: "Attendance", href: "/hr/attendance", icon: "🕒" },
      { label: "Face/Fingerprint", href: "/face/fingerprint", icon: "🧬" },
      { label: "Leave Management", href: "/hr/leave-management", icon: "🏖" },
      { label: "staff-advance-sheet", href: "/staff-advance-sheet", icon: "📄" },
      { label: "Contracts", href: "/hr/contracts", icon: "📑" },
      { label: "Performance Tracking", href: "/hr/performance", icon: "🎯" },
      { label: "Promotions", href: "/hr/promotions", icon: "🏆" },
      { label: "Disciplinary Actions", href: "/hr/disciplinary-actions", icon: "⚠", },
      { "label": "Universal Scanner", "href": "/hr/scanner", "icon": "🖨️" },
      {
        label: "Staff Advancement Count",
        href: "/staff-advancement/count",
        icon: "📌",
      },
      {
        label: "Staff Advancement Logs",
        href: "/staff-advancement/logs",
        icon: "🧾",
      },
      { label: "Face Attendance", href: "/face-attendance", icon: "🧑‍💻" },
    ],
  },
  {
    key: "recruitment-onboarding",
    title: "Recruitment & Onboarding",
    icon: "🧑‍🤝‍🧑",
    items: [
      { label: "Job Postings", href: "/recruitment/job-postings", icon: "📢" },
      { label: "Applicant Tracking", href: "/recruitment/applicant-tracking", icon: "📋", badge: "ATS" },
      { label: "Interview Scheduling", href: "/recruitment/interview-scheduling", icon: "🗓️" },
      { label: "Offer Letters", href: "/recruitment/offer-letters", icon: "📄" },
      { label: "Onboarding Checklist", href: "/recruitment/onboarding-checklist", icon: "✅" },
      { label: "Candidate Pool", href: "/recruitment/candidate-pool", icon: "🗂️" },
    ],
  },
  {
    key: "diversity-equity-inclusion",
    title: "Diversity, Equity & Inclusion",
    icon: "🤲",
    items: [
      { label: "DEI Dashboard", href: "/dei/dashboard", icon: "📊" },
      { label: "Workforce Diversity Metrics", href: "/dei/diversity-metrics", icon: "📈" },
      { label: "Inclusion Programs", href: "/dei/inclusion-programs", icon: "🌈" },
      { label: "DEI Training", href: "/dei/training", icon: "📘" },
    ],
  },
  {
    key: "employee-self-service",
    title: "Employee Self-Service",
    icon: "🙋",
    items: [
      { label: "My Profile", href: "/self-service/profile", icon: "👤" },
      { label: "My Payslips", href: "/self-service/payslips", icon: "🧾" },
      { label: "Leave Requests", href: "/self-service/leave-requests", icon: "🏖" },
      { label: "My Documents", href: "/self-service/documents", icon: "📁" },
      { label: "My Benefits", href: "/self-service/benefits", icon: "🎁" },
    ],
  },
  {
    key: "benefits-insurance",
    title: "Benefits & Insurance Administration",
    icon: "🩺",
    items: [
      { label: "Health Insurance Plans", href: "/benefits/health-insurance", icon: "🏥" },
      { label: "Retirement & Pension Plans", href: "/benefits/retirement-plans", icon: "🏦" },
      { label: "Benefits Enrollment", href: "/benefits/enrollment", icon: "📝" },
      { label: "Insurance Claims", href: "/benefits/insurance-claims", icon: "📋" },
      { label: "Group Insurance Policies", href: "/benefits/group-policies", icon: "🛡️" },
    ],
  },
  {
    key: "employee-wellness",
    title: "Employee Wellness Program",
    icon: "🧘",
    items: [
      { label: "Mental Health Support", href: "/wellness/mental-health-support", icon: "💚" },
      { label: "Fitness Programs", href: "/wellness/fitness-programs", icon: "🏃" },
      { label: "Wellness Challenges", href: "/wellness/challenges", icon: "🏆" },
      { label: "Employee Assistance Program", href: "/wellness/employee-assistance", icon: "🤝" },
    ],
  },
  {
    key: "payroll-finance",
    title: "Payroll & Finance",
    icon: "💰",
    items: [
      { label: "Payroll", href: "/payroll", icon: "💵" },
      { label: "Time Sheet", href: "/payroll/time-sheet", icon: "🕒" },
      { label: "Banking", href: "/payroll/banking", icon: "🏦" },
      { label: "Expenses", href: "/payroll/expenses", icon: "💳" },
      { label: "Tax Management", href: "/payroll/tax-management", icon: "📉" },
      { label: "Revenue", href: "/payroll/revenue", icon: "📈" },
      { label: "Profit / Loss", href: "/payroll/profit-loss", icon: "💲" },
      { label: "Financial Reports", href: "/payroll/financial-reports", icon: "📊" },
      { label: "Zakat Management", href: "/zakat-management", icon: "🕌", badge: "New" },
      { label: "Salary-Sheet", href: "/salary-sheet", icon: "$" },
      { label: "Manpower Payroll", href: "/salary-sheet/manpower-payroll", icon: "👷" },
      { label: "Construction Payroll", href: "/salary-sheet/construction-payroll", icon: "🏗️" },
      { label: "Multi Currency", href: "/payroll/multi-currency", icon: "💱" },
      { label: "Driver Attendance", href: "/payroll/driver-attendance", icon: "🚛", },
      { label: "AI Salary Prediction", href: "/payroll/ai-salary-prediction", icon: "🧠", },
      { label: "Cost Management", href: "/ai/cost-management", icon: "💰" },
    ],
  },
  {
    key: "accounting-ledger",
    title: "Accounting & General Ledger",
    icon: "📒",
    items: [
      { label: "Chart of Accounts", href: "/accounting/chart-of-accounts", icon: "📚" },
      { label: "Journal Entries", href: "/accounting/journal-entries", icon: "📝" },
      { label: "Accounts Payable", href: "/accounting/accounts-payable", icon: "💸" },
      { label: "Accounts Receivable", href: "/accounting/accounts-receivable", icon: "💰" },
      { label: "Bank Reconciliation", href: "/accounting/bank-reconciliation", icon: "🏦" },
      { label: "Fixed Assets Accounting", href: "/accounting/fixed-assets", icon: "🏢" },
      { label: "General Ledger Report", href: "/accounting/general-ledger", icon: "📊" },
      { label: "Trial Balance", href: "/accounting/trial-balance", icon: "⚖️" },
    ],
  },
  {
    key: "production-factory",
    title: "Production / Factory",
    icon: "🏭",
    items: [
      { label: "Production Planning", href: "/production/planning", icon: "🏗" },
      { label: "Line Management", href: "/production/line-management", icon: "🧵" },
      {
        label: "Machine Monitoring",
        href: "/production/machine-monitoring",
        icon: "⚙",
      },
      { label: "Raw Materials", href: "/production/raw-materials", icon: "📦" },
      { label: "Waste Analysis", href: "/production/waste-analysis", icon: "📉" },
      { label: "Production KPI", href: "/production/kpi", icon: "📊" },
      { label: "Maintenance", href: "/production/maintenance", icon: "🔧" },
      { label: "Equipment Status", href: "/production/equipment-status", icon: "🛠" },
      { label: "Quality Control", href: "/settings/quality-control", icon: "🧪" },
    ],
  },
  {
    key: "manufacturing-bom-mrp",
    title: "Manufacturing BOM & MRP",
    icon: "🧱",
    items: [
      { label: "Bill of Materials", href: "/manufacturing/bom", icon: "📐" },
      { label: "Material Requirement Planning", href: "/manufacturing/mrp", icon: "🧮" },
      { label: "Work Orders", href: "/manufacturing/work-orders", icon: "🗂️" },
      { label: "Routing & Operations", href: "/manufacturing/routing", icon: "🔀" },
      { label: "Capacity Planning", href: "/manufacturing/capacity-planning", icon: "📊" },
    ],
  },
  {
    key: "fleet-management",
    title: "Fleet Management",
    icon: "🚗",
    items: [
      { label: "Vehicle Registry", href: "/fleet/vehicle-registry", icon: "🚙" },
      { label: "Fuel & Mileage Tracking", href: "/fleet/fuel-mileage", icon: "⛽" },
      { label: "Vehicle Maintenance", href: "/fleet/maintenance", icon: "🔧" },
      { label: "Driver Assignment", href: "/fleet/driver-assignment", icon: "🧑‍✈️" },
      { label: "GPS Live Tracking", href: "/fleet/gps-tracking", icon: "📍" },
    ],
  },
  {
    key: "health-safety-environment",
    title: "Health, Safety & Environment",
    icon: "🦺",
    items: [
      { label: "Incident Reporting", href: "/hse/incident-reporting", icon: "🚨" },
      { label: "Safety Inspections", href: "/hse/safety-inspections", icon: "🔍" },
      { label: "Risk Assessment", href: "/hse/risk-assessment", icon: "⚠️" },
      { label: "PPE Management", href: "/hse/ppe-management", icon: "🧤" },
      { label: "Environmental Compliance", href: "/hse/environmental-compliance", icon: "🌱" },
    ],
  },
  {
    key: "esg-sustainability",
    title: "ESG & Sustainability Reporting",
    icon: "🌎",
    items: [
      { label: "Carbon Footprint Tracking", href: "/esg/carbon-footprint", icon: "🌫️" },
      { label: "Energy Consumption", href: "/esg/energy-consumption", icon: "⚡" },
      { label: "Sustainability Reports", href: "/esg/sustainability-reports", icon: "📗" },
      { label: "Governance Metrics", href: "/esg/governance-metrics", icon: "📐" },
    ],
  },
  {
    key: "field-service-management",
    title: "Field Service Management",
    icon: "🧰",
    items: [
      { label: "Service Requests", href: "/field-service/requests", icon: "📥" },
      { label: "Technician Dispatch", href: "/field-service/dispatch", icon: "🚐" },
      { label: "Job Scheduling", href: "/field-service/scheduling", icon: "🗓️" },
      { label: "Service History", href: "/field-service/history", icon: "🧾" },
    ],
  },
  {
    key: "warranty-after-sales",
    title: "Warranty & After-Sales Service",
    icon: "🔁",
    items: [
      { label: "Warranty Registration", href: "/after-sales/warranty-registration", icon: "📝" },
      { label: "Warranty Claims", href: "/after-sales/warranty-claims", icon: "📋" },
      { label: "Returns & Exchange (RMA)", href: "/after-sales/rma", icon: "🔄" },
      { label: "Repair Tracking", href: "/after-sales/repair-tracking", icon: "🛠️" },
    ],
  },
  {
    key: "inventory-supply-chain",
    title: "Inventory & Supply Chain",
    icon: "📦",
    items: [
      { label: "Inventory", href: "/inventory", icon: "📦" },
      { label: "Logistics", href: "/inventory/logistics", icon: "🚚" },
      { label: "Warehouse", href: "/inventory/warehouse", icon: "🏬" },
      {
        label: "Live Stock Tracking",
        href: "/inventory/live-stock-tracking",
        icon: "📍",
      },
      { label: "Delivery Tracking", href: "/inventory/delivery-tracking", icon: "📤" },
      {
        label: "QR / Barcode Scanner",
        href: "/inventory/qr-barcode-scanner",
        icon: "🔳",
      },
    ],
  },
  {
    key: "vendor-procurement",
    title: "Vendor & Procurement Management",
    icon: "🤝",
    items: [
      { label: "Purchase Orders", href: "/inventory/purchase-orders", icon: "🔄" },
      { label: "Supplier Management", href: "/inventory/suppliers", icon: "📥" },
      { label: "Vendor Evaluation", href: "/procurement/vendor-evaluation", icon: "⭐" },
      { label: "RFQ Management", href: "/procurement/rfq-management", icon: "📨" },
    ],
  },
  {
    key: "vendor-self-service",
    title: "Vendor Self-Service Portal",
    icon: "🧑‍💼",
    items: [
      { label: "Vendor Login Portal", href: "/vendor-portal/login", icon: "🔑" },
      { label: "Vendor Invoice Submission", href: "/vendor-portal/invoice-submission", icon: "🧾" },
      { label: "Vendor Order Status", href: "/vendor-portal/order-status", icon: "📦" },
      { label: "Vendor Document Upload", href: "/vendor-portal/document-upload", icon: "📤" },
    ],
  },
  {
    key: "tender-grant-management",
    title: "Tender & Grant Management",
    icon: "📢",
    items: [
      { label: "Tender Opportunities", href: "/tenders/opportunities", icon: "📋" },
      { label: "Bid Preparation", href: "/tenders/bid-preparation", icon: "📝" },
      { label: "Grant Applications", href: "/tenders/grant-applications", icon: "💰" },
      { label: "Submission Tracking", href: "/tenders/submission-tracking", icon: "📤" },
    ],
  },
  {
    key: "sales-crm",
    title: "Sales & CRM",
    icon: "🛒",
    items: [
      { label: "Customers", href: "/sales/customers", icon: "👥" },
      { label: "CRM", href: "/sales/crm", icon: "📞" },
      { label: "Marketing", href: "/sales/marketing", icon: "📧" },
      { label: "Invoices", href: "/sales/invoices", icon: "🧾" },
      { label: "Client Chat", href: "/sales/client-chat", icon: "💬" },
      { label: "Sales Analytics", href: "/sales/analytics", icon: "📈" },
      { label: "Lead Management", href: "/sales/leads", icon: "🎯" },
      { label: "AI Sales Assistant", href: "/sales/ai-assistant", icon: "🤖" },
      { label: "E-Commerce", href: "/E-Commerce", icon: "🛒" },
    ],
  },
  {
    key: "pos-retail",
    title: "Point of Sale (POS) / Retail",
    icon: "🏪",
    items: [
      { label: "POS Terminal", href: "/pos/terminal", icon: "🖥️" },
      { label: "Store Management", href: "/pos/store-management", icon: "🏬" },
      { label: "Retail Promotions", href: "/pos/promotions", icon: "🏷️" },
      { label: "Cash Register Reports", href: "/pos/cash-register-reports", icon: "🧾" },
      { label: "Loyalty Program", href: "/pos/loyalty-program", icon: "🎟️" },
    ],
  },
  {
    key: "subscription-billing",
    title: "Subscription & Recurring Billing",
    icon: "🔁",
    items: [
      { label: "Subscription Plans", href: "/billing/subscription-plans", icon: "📦" },
      { label: "Recurring Invoices", href: "/billing/recurring-invoices", icon: "🧾" },
      { label: "Membership Management", href: "/billing/membership-management", icon: "🪪" },
      { label: "Dunning & Renewals", href: "/billing/dunning-renewals", icon: "🔔" },
    ],
  },
  {
    key: "communication-collaboration",
    title: "Communication & Collaboration",
    icon: "💬",
    items: [
      { label: "Client Chat", href: "/sales/client-chat", icon: "💬" },
      { label: "AWM SMS", href: "/communication/awm-sms", icon: "💬" },
      { label: "AWM Enterprise Social", href: "/community/awm-social", icon: "🌐" },
    ],
  },
  {
    key: "project-management",
    title: "Project Management",
    icon: "🗂️",
    items: [
      { label: "Project Planning", href: "/project/planning", icon: "📝" },
      { label: "Task Board", href: "/project/task-board", icon: "🗒️" },
      { label: "Gantt Chart", href: "/project/gantt-chart", icon: "📅" },
      { label: "Milestones", href: "/project/milestones", icon: "🚩" },
      { label: "Team Workload", href: "/project/team-workload", icon: "👥" },
      { label: "Project Timeline", href: "/project/timeline", icon: "⏱️" },
    ],
  },
  {
    key: "asset-management",
    title: "Asset Management",
    icon: "🏷️",
    items: [
      { label: "Asset Register", href: "/assets/register", icon: "📋" },
      { label: "Asset Tracking", href: "/assets/tracking", icon: "📍" },
      { label: "Depreciation", href: "/assets/depreciation", icon: "📉" },
      { label: "Asset Maintenance", href: "/assets/maintenance", icon: "🔧" },
      { label: "Asset Allocation", href: "/assets/allocation", icon: "📦" },
    ],
  },
  {
    key: "facilities-real-estate",
    title: "Facilities & Real Estate Management",
    icon: "🏢",
    items: [
      { label: "Property Register", href: "/facilities/property-register", icon: "🏘️" },
      { label: "Lease Management", href: "/facilities/lease-management", icon: "📄" },
      { label: "Space Planning", href: "/facilities/space-planning", icon: "📐" },
      { label: "Facility Maintenance", href: "/facilities/maintenance", icon: "🔧" },
      { label: "Utility Management", href: "/facilities/utility-management", icon: "💡" },
    ],
  },
  {
    key: "reporting-center",
    title: "Reporting Center",
    icon: "📊",
    items: [
      { label: "Smart Reports", href: "/reports/smart-reports", icon: "📑" },
      { label: "Export PDF / Excel", href: "/reports/export", icon: "📤" },
      { label: "Data Visualization", href: "/reports/data-visualization", icon: "📈" },
      { label: "Charts", href: "/reports/charts", icon: "📊" },
      { label: "AI Insights", href: "/reports/ai-insights", icon: "🧠" },
      { label: "Forecasting", href: "/reports/forecasting", icon: "📉" },
      { label: "Print Center", href: "/reports/print-center", icon: "🖨" },
      { label: "Excel", href: "/reports/excel", icon: "📗" },
    ],
  },
  {
    key: "business-intelligence",
    title: "Business Intelligence & Data Warehouse",
    icon: "🧮",
    items: [
      { label: "Data Warehouse", href: "/bi/data-warehouse", icon: "🗄️" },
      { label: "BI Dashboards", href: "/bi/dashboards", icon: "📊" },
      { label: "ETL Pipelines", href: "/bi/etl-pipelines", icon: "🔄" },
      { label: "Custom Query Builder", href: "/bi/query-builder", icon: "🧩" },
    ],
  },
  {
    key: "security-center",
    title: "Security Center",
    icon: "🔐",
    items: [
      { label: "Access Control", href: "/security/access-control", icon: "🔒" },
      { label: "User Roles", href: "/security/user-roles", icon: "👁" },
      { label: "Biometric Security", href: "/security/biometric", icon: "🧬" },
      { label: "Audit Logs", href: "/security/audit-logs", icon: "📜" },
      { label: "Threat Detection", href: "/security/threat-detection", icon: "🛡" },
      { label: "API Keys", href: "/security/api-keys", icon: "🔑" },
      { label: "Security Alerts", href: "/security/alerts", icon: "🔔" },
      { label: "IP Restrictions", href: "/security/ip-restrictions", icon: "🌐" },
    ],
  },
  {
    key: "business-continuity",
    title: "Business Continuity & Disaster Recovery",
    icon: "🧯",
    items: [
      { label: "BCP Planning", href: "/continuity/bcp-planning", icon: "📋" },
      { label: "Disaster Recovery Drills", href: "/continuity/dr-drills", icon: "🧪" },
      { label: "System Failover Status", href: "/continuity/failover-status", icon: "🔄" },
      { label: "Incident Response Plan", href: "/continuity/incident-response", icon: "🚨" },
    ],
  },
  {
    key: "global-settings",
    title: "Global Settings",
    icon: "🌍",
    items: [
      { label: "Settings", href: "/settings", icon: "⚙" },
      { label: "Language", href: "/settings/language", icon: "🌐" },
      { label: "Theme", href: "/settings/theme", icon: "🎨" },
      { label: "Dark Mode", href: "/settings/dark-mode", icon: "🌙" },
      { label: "Mobile Sync", href: "/settings/mobile-sync", icon: "📱" },
      { label: "Cloud Backup", href: "/settings/cloud-backup", icon: "☁" },
      { label: "API Integration", href: "/settings/api-integration", icon: "🔗" },
      { label: "ERP Connectors", href: "/settings/erp-connectors", icon: "📡" },
    ],
  },
  {
    key: "localization-currency",
    title: "Localization & Currency Exchange",
    icon: "🌐",
    items: [
      { label: "Currency Exchange Rates", href: "/localization/currency-rates", icon: "💱" },
      { label: "Regional Tax Rules", href: "/localization/regional-tax", icon: "📐" },
      { label: "Date/Time Format", href: "/localization/date-time-format", icon: "🕰️" },
      { label: "Multi-Company Consolidation", href: "/localization/multi-company", icon: "🏢" },
    ],
  },
  {
    key: "integration-marketplace",
    title: "Integration Marketplace",
    icon: "🧩",
    items: [
      { label: "App Marketplace", href: "/integrations/marketplace", icon: "🛍️" },
      { label: "Webhook Manager", href: "/integrations/webhooks", icon: "🔗" },
      { label: "Third-Party Connectors", href: "/integrations/connectors", icon: "🔌" },
      { label: "Integration Logs", href: "/integrations/logs", icon: "📜" },
    ],
  },
  {
    key: "compliance-legal",
    title: "Compliance & Legal",
    icon: "⚖️",
    items: [
      { label: "Regulatory Compliance", href: "/compliance/regulatory", icon: "📜" },
      { label: "Legal Document Vault", href: "/compliance/legal-vault", icon: "🗄️" },
      { label: "e-Signature", href: "/compliance/e-signature", icon: "✍️" },
      { label: "GDPR & Data Privacy", href: "/compliance/gdpr-data-privacy", icon: "🔏" },
    ],
  },
  {
    key: "document-management",
    title: "Document Management System",
    icon: "🗃️",
    items: [
      { label: "Document Library", href: "/dms/library", icon: "📁" },
      { label: "Version Control", href: "/dms/version-control", icon: "🔀" },
      { label: "Approval Workflows", href: "/dms/approval-workflows", icon: "✅" },
      { label: "Document Sharing", href: "/dms/sharing", icon: "🔗" },
    ],
  },
  {
    key: "help-desk-support",
    title: "Help Desk & Support",
    icon: "🎧",
    items: [
      { label: "Support Tickets", href: "/support/tickets", icon: "🎫" },
      { label: "Knowledge Base", href: "/support/knowledge-base", icon: "📚" },
      { label: "SLA Tracking", href: "/support/sla-tracking", icon: "⏳" },
      { label: "Customer Support Portal", href: "/support/customer-portal", icon: "🧑‍💼" },
    ],
  },
  {
    key: "learning-development",
    title: "Learning & Development",
    icon: "🎓",
    items: [
      { label: "Training Programs", href: "/lms/training-programs", icon: "📘" },
      { label: "Course Library", href: "/lms/course-library", icon: "🎬" },
      { label: "Certifications", href: "/lms/certifications", icon: "🏅" },
      { label: "Employee Skill Matrix", href: "/lms/skill-matrix", icon: "🧩" },
    ],
  },
  {
    key: "research-development",
    title: "Research & Development",
    icon: "🔬",
    items: [
      { label: "Innovation Pipeline", href: "/rnd/innovation-pipeline", icon: "💡" },
      { label: "Patent & IP Tracking", href: "/rnd/patent-ip-tracking", icon: "📜" },
      { label: "R&D Project Management", href: "/rnd/project-management", icon: "🧪" },
      { label: "Prototype Testing", href: "/rnd/prototype-testing", icon: "⚗️" },
    ],
  },
  {
    key: "travel-expense",
    title: "Travel & Expense Management",
    icon: "✈️",
    items: [
      { label: "Travel Requests", href: "/travel/requests", icon: "🧳" },
      { label: "Trip Itinerary", href: "/travel/itinerary", icon: "🗺️" },
      { label: "Expense Claims", href: "/travel/expense-claims", icon: "🧾" },
      { label: "Travel Policy", href: "/travel/policy", icon: "📃" },
    ],
  },
  {
    key: "import-export-customs",
    title: "Import / Export & Customs",
    icon: "🚢",
    items: [
      { label: "Customs Documentation", href: "/trade/customs-documentation", icon: "📄" },
      { label: "Import / Export Licenses", href: "/trade/licenses", icon: "🪪" },
      { label: "Tariff & Duty Calculator", href: "/trade/tariff-calculator", icon: "🧮" },
      { label: "International Shipping Compliance", href: "/trade/shipping-compliance", icon: "🌐" },
    ],
  },
  {
    key: "trade-finance",
    title: "Trade Finance",
    icon: "💹",
    items: [
      { label: "Letters of Credit", href: "/trade-finance/letters-of-credit", icon: "📜" },
      { label: "Bank Guarantees", href: "/trade-finance/bank-guarantees", icon: "🏦" },
      { label: "Trade Documentation", href: "/trade-finance/documentation", icon: "📄" },
      { label: "Export Credit Insurance", href: "/trade-finance/export-credit-insurance", icon: "🛡️" },
    ],
  },
  {
    key: "next-gen-2026",
    title: "Next-Gen 2026 Features",
    icon: "🤖",
    items: [
      { label: "AI Voice ERP", href: "/next-gen/ai-voice-erp", icon: "🗣", badge: "New" },
      {
        label: "Autonomous AI Agent",
        href: "/next-gen/autonomous-ai-agent",
        icon: "🧠",
      },
      { label: "Live IoT Devices", href: "/next-gen/live-iot-devices", icon: "📡" },
      { label: "AR / VR Dashboard", href: "/next-gen/ar-vr-dashboard", icon: "🥽" },
      {
        label: "AI Workflow Automation",
        href: "/next-gen/ai-workflow-automation",
        icon: "🤖",
      },
      {
        label: "Remote Factory Control",
        href: "/next-gen/remote-factory-control",
        icon: "🛰",
      },
      {
        label: "Predictive Analytics",
        href: "/next-gen/predictive-analytics",
        icon: "🔮",
      },
      {
        label: "Auto Decision Engine",
        href: "/next-gen/auto-decision-engine",
        icon: "⚡",
      },
      {
        label: "AI Document Understanding",
        href: "/next-gen/ai-document-understanding",
        icon: "🧾",
      },
    ],
  },
  {
    key: "global-mobility-expatriate",
    title: "Global Mobility & Expatriate Management",
    icon: "🌍",
    items: [
      { label: "Expatriate Employee Register", href: "/global-mobility/expat-register", icon: "🧑‍✈️" },
      { label: "Work Permit Tracking", href: "/global-mobility/work-permits", icon: "📄" },
      { label: "Visa Sponsorship Management", href: "/global-mobility/visa-sponsorship", icon: "🛂" },
      { label: "Relocation Services", href: "/global-mobility/relocation", icon: "📦" },
      { label: "Assignment Letters", href: "/global-mobility/assignment-letters", icon: "📝" },
      { label: "Home & Host Country Payroll", href: "/global-mobility/home-host-payroll", icon: "💱" },
      { label: "Tax Equalization", href: "/global-mobility/tax-equalization", icon: "⚖️" },
      { label: "Repatriation Planning", href: "/global-mobility/repatriation", icon: "🔄" },
      { label: "Global Mobility Policy", href: "/global-mobility/policy", icon: "📃" },
      { label: "Family & Dependents Records", href: "/global-mobility/dependents", icon: "👨‍👩‍👧" },
      { label: "Cost of Living Adjustment", href: "/global-mobility/cola", icon: "📊" },
      { label: "Global Mobility Analytics", href: "/global-mobility/analytics", icon: "📈" },
    ],
  },
  {
    key: "international-payment-treasury",
    title: "International Payment Gateway & Treasury",
    icon: "💳",
    items: [
      { label: "Cross-Border Payments", href: "/treasury/cross-border-payments", icon: "🌐" },
      { label: "International Wire Transfers", href: "/treasury/wire-transfers", icon: "🏦" },
      { label: "Payment Gateway Integrations", href: "/treasury/payment-gateways", icon: "🔌" },
      { label: "FX Risk & Hedging", href: "/treasury/fx-hedging", icon: "📉" },
      { label: "Multi-Currency Wallets", href: "/treasury/multi-currency-wallets", icon: "👛" },
      { label: "Cash Pooling", href: "/treasury/cash-pooling", icon: "🏊" },
      { label: "Correspondent Banking", href: "/treasury/correspondent-banking", icon: "🏛️" },
      { label: "SWIFT Message Management", href: "/treasury/swift-messages", icon: "📡" },
      { label: "Treasury Risk Dashboard", href: "/treasury/risk-dashboard", icon: "📊" },
      { label: "Global Liquidity Management", href: "/treasury/liquidity-management", icon: "💧" },
      { label: "Payment Reconciliation", href: "/treasury/payment-reconciliation", icon: "🧾" },
      { label: "Digital Wallet Settlement", href: "/treasury/digital-wallet-settlement", icon: "📱" },
    ],
  },
  {
    key: "ksa-compliance-hub",
    title: "Saudi Arabia (KSA) Compliance Hub",
    icon: "🇸🇦",
    items: [
      { label: "ZATCA E-Invoicing (Fatoora)", href: "/ksa/zatca-e-invoicing", icon: "🧾", badge: "New" },
      { label: "GOSI Integration", href: "/ksa/gosi-integration", icon: "🏛️" },
      { label: "Qiwa Platform Sync", href: "/ksa/qiwa-sync", icon: "🔗" },
      { label: "Mudad Payroll Compliance", href: "/ksa/mudad-payroll", icon: "💵" },
      { label: "Nitaqat (Saudization) Tracking", href: "/ksa/nitaqat-tracking", icon: "📊" },
      { label: "Wathq Business Verification", href: "/ksa/wathq-verification", icon: "✅" },
      { label: "Absher Government Services", href: "/ksa/absher-services", icon: "🪪" },
      { label: "Muqeem Residency Management", href: "/ksa/muqeem-residency", icon: "🛂" },
      { label: "Baladiya Municipal Licensing", href: "/ksa/baladiya-licensing", icon: "🏢" },
      { label: "SASO Product Certification", href: "/ksa/saso-certification", icon: "📋" },
      { label: "Saudi VAT Filing", href: "/ksa/vat-filing", icon: "📉" },
      { label: "Elm Digital Services", href: "/ksa/elm-services", icon: "💻" },
      { label: "Saudi Central Bank (SAMA) Reporting", href: "/ksa/sama-reporting", icon: "🏦" },
      { label: "Vision 2030 KPI Tracker", href: "/ksa/vision-2030-kpi", icon: "🎯" },
    ],
  },
  {
    key: "gcc-regional-compliance",
    title: "GCC Regional Compliance",
    icon: "🌐",
    items: [
      { label: "UAE VAT & Corporate Tax", href: "/gcc/uae-tax", icon: "🇦🇪" },
      { label: "Qatar Free Zone Compliance", href: "/gcc/qatar-free-zone", icon: "🇶🇦" },
      { label: "Kuwait Labor Law Tracking", href: "/gcc/kuwait-labor-law", icon: "🇰🇼" },
      { label: "Bahrain Commercial Registration", href: "/gcc/bahrain-cr", icon: "🇧🇭" },
      { label: "Oman Tax & Customs", href: "/gcc/oman-tax-customs", icon: "🇴🇲" },
      { label: "GCC VAT Harmonization", href: "/gcc/vat-harmonization", icon: "📐" },
      { label: "GCC Customs Union Filing", href: "/gcc/customs-union", icon: "🚢" },
      { label: "GCC Cross-Border Trade Permits", href: "/gcc/cross-border-permits", icon: "📄" },
      { label: "Regional Free Zone Directory", href: "/gcc/free-zone-directory", icon: "🗺️" },
      { label: "GCC Standardization (GSO) Compliance", href: "/gcc/gso-compliance", icon: "📜" },
      { label: "GCC Interconnection Reporting", href: "/gcc/interconnection-reporting", icon: "🔗" },
      { label: "Regional Workforce Nationalization", href: "/gcc/workforce-nationalization", icon: "👥" },
    ],
  },
  {
    key: "international-recruitment-visa",
    title: "International Recruitment & Visa Management",
    icon: "🛂",
    items: [
      { label: "Global Job Boards Sync", href: "/intl-recruitment/job-boards-sync", icon: "📢" },
      { label: "Overseas Candidate Sourcing", href: "/intl-recruitment/overseas-sourcing", icon: "🌍" },
      { label: "Work Visa Application Tracking", href: "/intl-recruitment/visa-applications", icon: "📄" },
      { label: "Recruitment Agency Management", href: "/intl-recruitment/agency-management", icon: "🤝" },
      { label: "Medical Fitness & Screening", href: "/intl-recruitment/medical-screening", icon: "🩺" },
      { label: "Overseas Contract Attestation", href: "/intl-recruitment/contract-attestation", icon: "✍️" },
      { label: "Flight & Travel Booking", href: "/intl-recruitment/travel-booking", icon: "✈️" },
      { label: "Pre-Departure Orientation", href: "/intl-recruitment/pre-departure-orientation", icon: "📘" },
      { label: "Cross-Border Background Checks", href: "/intl-recruitment/background-checks", icon: "🔍" },
      { label: "Manpower Supply Contracts", href: "/intl-recruitment/manpower-contracts", icon: "📑" },
      { label: "Recruitment Quota Management", href: "/intl-recruitment/quota-management", icon: "📊" },
      { label: "International Onboarding Portal", href: "/intl-recruitment/onboarding-portal", icon: "🧑‍💻" },
    ],
  },
  {
    key: "cross-border-ecommerce",
    title: "Cross-Border E-Commerce",
    icon: "🛍️",
    items: [
      { label: "Global Storefront Management", href: "/cb-ecommerce/global-storefront", icon: "🏬" },
      { label: "Multi-Region Product Catalog", href: "/cb-ecommerce/product-catalog", icon: "📦" },
      { label: "International Shipping Rates", href: "/cb-ecommerce/shipping-rates", icon: "🚚" },
      { label: "Landed Cost Calculator", href: "/cb-ecommerce/landed-cost", icon: "🧮" },
      { label: "Cross-Border Returns", href: "/cb-ecommerce/returns", icon: "🔄" },
      { label: "Marketplace Integrations", href: "/cb-ecommerce/marketplace-integrations", icon: "🔌" },
      { label: "International Payment Methods", href: "/cb-ecommerce/payment-methods", icon: "💳" },
      { label: "Multi-Currency Checkout", href: "/cb-ecommerce/multi-currency-checkout", icon: "💱" },
      { label: "Cross-Border Tax Calculation", href: "/cb-ecommerce/tax-calculation", icon: "📉" },
      { label: "Global Customer Reviews", href: "/cb-ecommerce/customer-reviews", icon: "⭐" },
      { label: "Localization of Storefronts", href: "/cb-ecommerce/storefront-localization", icon: "🌐" },
      { label: "Export Order Fulfillment", href: "/cb-ecommerce/export-fulfillment", icon: "📤" },
    ],
  },
  {
    key: "international-certification-standards",
    title: "International Certification & Standards",
    icon: "🏅",
    items: [
      { label: "ISO 9001 Quality Management", href: "/intl-standards/iso-9001", icon: "📋" },
      { label: "ISO 27001 Information Security", href: "/intl-standards/iso-27001", icon: "🔐" },
      { label: "ISO 14001 Environmental Management", href: "/intl-standards/iso-14001", icon: "🌱" },
      { label: "ISO 45001 Health & Safety", href: "/intl-standards/iso-45001", icon: "🦺" },
      { label: "SOC 2 Compliance Tracking", href: "/intl-standards/soc-2", icon: "🛡️" },
      { label: "CE Marking & Conformity", href: "/intl-standards/ce-marking", icon: "✅" },
      { label: "Halal Certification Tracking", href: "/intl-standards/halal-certification", icon: "🕌" },
      { label: "International Accreditation Directory", href: "/intl-standards/accreditation-directory", icon: "🗂️" },
      { label: "Certificate Renewal Alerts", href: "/intl-standards/renewal-alerts", icon: "🔔" },
      { label: "Audit Readiness Tracker", href: "/intl-standards/audit-readiness", icon: "🧪" },
      { label: "Standards Document Repository", href: "/intl-standards/document-repository", icon: "📚" },
      { label: "Global Testing Lab Directory", href: "/intl-standards/testing-lab-directory", icon: "🔬" },
    ],
  },
  {
    key: "franchise-multi-brand",
    title: "Franchise & Multi-Brand Management",
    icon: "🏷️",
    items: [
      { label: "Franchise Directory", href: "/franchise/directory", icon: "🗺️" },
      { label: "Franchise Agreements", href: "/franchise/agreements", icon: "📑" },
      { label: "Royalty & Fee Management", href: "/franchise/royalty-fees", icon: "💰" },
      { label: "Brand Standards Compliance", href: "/franchise/brand-standards", icon: "🎨" },
      { label: "Franchisee Onboarding", href: "/franchise/onboarding", icon: "✅" },
      { label: "Territory Management", href: "/franchise/territory-management", icon: "📍" },
      { label: "Multi-Brand Inventory Sync", href: "/franchise/multi-brand-inventory", icon: "📦" },
      { label: "Franchise Performance Dashboard", href: "/franchise/performance-dashboard", icon: "📊" },
      { label: "Franchise Marketing Fund", href: "/franchise/marketing-fund", icon: "📢" },
      { label: "Franchise Training Portal", href: "/franchise/training-portal", icon: "🎓" },
      { label: "Franchise Renewal Tracking", href: "/franchise/renewal-tracking", icon: "🔁" },
      { label: "Franchise Audit & Inspection", href: "/franchise/audit-inspection", icon: "🔍" },
    ],
  },
  {
    key: "global-data-privacy",
    title: "Global Data Privacy & Cross-Border Data Transfer",
    icon: "🔏",
    items: [
      { label: "GDPR Compliance (EU)", href: "/data-privacy/gdpr", icon: "🇪🇺" },
      { label: "CCPA Compliance (US)", href: "/data-privacy/ccpa", icon: "🇺🇸" },
      { label: "PDPL Compliance (Saudi Arabia)", href: "/data-privacy/pdpl-ksa", icon: "🇸🇦" },
      { label: "PDPA Compliance (Asia-Pacific)", href: "/data-privacy/pdpa", icon: "🌏" },
      { label: "LGPD Compliance (Brazil)", href: "/data-privacy/lgpd", icon: "🇧🇷" },
      { label: "Cross-Border Data Transfer Agreements", href: "/data-privacy/transfer-agreements", icon: "📄" },
      { label: "Data Residency Mapping", href: "/data-privacy/data-residency", icon: "🗺️" },
      { label: "Consent Management Platform", href: "/data-privacy/consent-management", icon: "✅" },
      { label: "Data Subject Request Handling", href: "/data-privacy/subject-requests", icon: "📥" },
      { label: "Privacy Impact Assessments", href: "/data-privacy/impact-assessments", icon: "🧪" },
      { label: "Data Breach Notification", href: "/data-privacy/breach-notification", icon: "🚨" },
      { label: "Privacy Policy Version Control", href: "/data-privacy/policy-version-control", icon: "🔀" },
    ],
  },
  {
    key: "international-insurance",
    title: "International Insurance Management",
    icon: "🛡️",
    items: [
      { label: "Global Corporate Insurance", href: "/intl-insurance/corporate-insurance", icon: "🏢" },
      { label: "Marine Cargo Insurance", href: "/intl-insurance/marine-cargo", icon: "🚢" },
      { label: "International Health Coverage", href: "/intl-insurance/health-coverage", icon: "🩺" },
      { label: "Political Risk Insurance", href: "/intl-insurance/political-risk", icon: "🌐" },
      { label: "Product Liability Insurance", href: "/intl-insurance/product-liability", icon: "📦" },
      { label: "Trade Credit Insurance", href: "/intl-insurance/trade-credit", icon: "💳" },
      { label: "Reinsurance Tracking", href: "/intl-insurance/reinsurance", icon: "🔄" },
      { label: "Claims Management (Global)", href: "/intl-insurance/claims-management", icon: "📋" },
      { label: "Policy Renewal Calendar", href: "/intl-insurance/renewal-calendar", icon: "📅" },
      { label: "Broker & Underwriter Directory", href: "/intl-insurance/broker-directory", icon: "🤝" },
      { label: "International Risk Pooling", href: "/intl-insurance/risk-pooling", icon: "🏊" },
    ],
  },
  {
    key: "multi-entity-global-consolidation",
    title: "Multi-Entity Global Consolidation",
    icon: "🏢",
    items: [
      { label: "Global Chart of Accounts Mapping", href: "/global-consolidation/coa-mapping", icon: "📚" },
      { label: "Multi-Entity Financial Consolidation", href: "/global-consolidation/financial-consolidation", icon: "📊" },
      { label: "Intercompany Reconciliation", href: "/global-consolidation/intercompany-reconciliation", icon: "🔄" },
      { label: "Currency Translation Adjustments", href: "/global-consolidation/currency-translation", icon: "💱" },
      { label: "Group Reporting Structure", href: "/global-consolidation/group-structure", icon: "🗂️" },
      { label: "Subsidiary Performance Comparison", href: "/global-consolidation/subsidiary-comparison", icon: "📈" },
      { label: "Consolidated Balance Sheet", href: "/global-consolidation/balance-sheet", icon: "📒" },
      { label: "Elimination Entries Management", href: "/global-consolidation/elimination-entries", icon: "✂️" },
      { label: "Global Entity Registry", href: "/global-consolidation/entity-registry", icon: "📋" },
      { label: "Minority Interest Calculation", href: "/global-consolidation/minority-interest", icon: "🧮" },
      { label: "Consolidated Cash Flow Statement", href: "/global-consolidation/cash-flow-statement", icon: "💵" },
      { label: "Regulatory Group Filings", href: "/global-consolidation/regulatory-filings", icon: "📜" },
    ],
  },
  {
    key: "trade-sanctions-screening",
    title: "Trade Sanctions & Denied-Party Screening",
    icon: "🚫",
    items: [
      { label: "OFAC Sanctions Screening", href: "/sanctions/ofac-screening", icon: "🇺🇸" },
      { label: "UN Sanctions List Screening", href: "/sanctions/un-screening", icon: "🇺🇳" },
      { label: "EU Restrictive Measures Screening", href: "/sanctions/eu-screening", icon: "🇪🇺" },
      { label: "Denied-Party Screening", href: "/sanctions/denied-party", icon: "🔍" },
      { label: "Export Control Classification", href: "/sanctions/export-classification", icon: "📦" },
      { label: "Anti-Money Laundering (AML) Checks", href: "/sanctions/aml-checks", icon: "🕵️" },
      { label: "Know Your Customer (KYC) Screening", href: "/sanctions/kyc-screening", icon: "🪪" },
      { label: "Sanctions Watchlist Monitoring", href: "/sanctions/watchlist-monitoring", icon: "🔔" },
      { label: "Embargo Country Tracking", href: "/sanctions/embargo-tracking", icon: "🌐" },
      { label: "Compliance Case Investigation", href: "/sanctions/case-investigation", icon: "🗂️" },
      { label: "Screening Audit Trail", href: "/sanctions/audit-trail", icon: "📜" },
    ],
  },
  {
    key: "global-partner-reseller",
    title: "Global Partner & Reseller Management",
    icon: "🤝",
    items: [
      { label: "Partner Onboarding", href: "/global-partners/onboarding", icon: "✅" },
      { label: "Reseller Agreement Tracking", href: "/global-partners/agreement-tracking", icon: "📑" },
      { label: "Partner Tier & Incentives", href: "/global-partners/tier-incentives", icon: "🏆" },
      { label: "Channel Sales Analytics", href: "/global-partners/channel-analytics", icon: "📊" },
      { label: "Deal Registration Portal", href: "/global-partners/deal-registration", icon: "📝" },
      { label: "Partner Training & Certification", href: "/global-partners/training-certification", icon: "🎓" },
      { label: "Co-Marketing Fund Management", href: "/global-partners/co-marketing-fund", icon: "📢" },
      { label: "Partner Performance Scorecards", href: "/global-partners/performance-scorecards", icon: "📈" },
      { label: "Regional Distributor Directory", href: "/global-partners/distributor-directory", icon: "🗺️" },
      { label: "Partner Portal Access", href: "/global-partners/portal-access", icon: "🔑" },
      { label: "Partner Commission Settlement", href: "/global-partners/commission-settlement", icon: "💰" },
    ],
  },
  {
    key: "religious-halal-compliance",
    title: "Religious & Halal Compliance",
    icon: "🕌",
    items: [
      { label: "Halal Supply Chain Certification", href: "/halal-compliance/supply-chain-certification", icon: "📦" },
      { label: "Halal Product Registry", href: "/halal-compliance/product-registry", icon: "📋" },
      { label: "Halal Audit Scheduling", href: "/halal-compliance/audit-scheduling", icon: "🗓️" },
      { label: "Zakat Calculation Engine", href: "/halal-compliance/zakat-calculation", icon: "🧮" },
      { label: "Islamic Finance Contracts (Murabaha/Ijara)", href: "/halal-compliance/islamic-finance-contracts", icon: "📜" },
      { label: "Sharia Advisory Board Records", href: "/halal-compliance/sharia-board-records", icon: "🕌" },
      { label: "Prayer Time & Facility Management", href: "/halal-compliance/prayer-facility-management", icon: "🕋" },
      { label: "Religious Holiday Calendar", href: "/halal-compliance/religious-holiday-calendar", icon: "📅" },
      { label: "Waqf & Endowment Tracking", href: "/halal-compliance/waqf-endowment-tracking", icon: "🏛️" },
      { label: "Halal Logistics Segregation", href: "/halal-compliance/logistics-segregation", icon: "🚚" },
    ],
  },
  {
    key: "intl-real-estate-facilities",
    title: "International Real Estate & Global Facilities",
    icon: "🏙️",
    items: [
      { label: "Global Property Portfolio", href: "/intl-real-estate/property-portfolio", icon: "🏘️" },
      { label: "Cross-Border Lease Agreements", href: "/intl-real-estate/lease-agreements", icon: "📄" },
      { label: "Foreign Ownership Registration", href: "/intl-real-estate/foreign-ownership", icon: "🪪" },
      { label: "International Property Valuation", href: "/intl-real-estate/property-valuation", icon: "📊" },
      { label: "Global Facility Compliance", href: "/intl-real-estate/facility-compliance", icon: "✅" },
      { label: "Multi-Country Site Selection", href: "/intl-real-estate/site-selection", icon: "📍" },
      { label: "Real Estate Tax by Jurisdiction", href: "/intl-real-estate/tax-by-jurisdiction", icon: "📉" },
      { label: "Cross-Border Facility Maintenance", href: "/intl-real-estate/facility-maintenance", icon: "🔧" },
      { label: "Global Workspace Utilization", href: "/intl-real-estate/workspace-utilization", icon: "📐" },
      { label: "Property Insurance (Global)", href: "/intl-real-estate/property-insurance", icon: "🛡️" },
      { label: "International Zoning Compliance", href: "/intl-real-estate/zoning-compliance", icon: "🗺️" },
    ],
  },
  {
    key: "cybersecurity-intl-standards",
    title: "Cybersecurity & International Standards",
    icon: "🛡️",
    items: [
      { label: "Global Vulnerability Management", href: "/cybersecurity/vulnerability-management", icon: "🐛" },
      { label: "Cross-Border Incident Response", href: "/cybersecurity/incident-response", icon: "🚨" },
      { label: "SOC Operations Center", href: "/cybersecurity/soc-operations", icon: "🖥️" },
      { label: "Penetration Testing Schedule", href: "/cybersecurity/pentest-schedule", icon: "🧪" },
      { label: "Security Awareness Training", href: "/cybersecurity/awareness-training", icon: "📘" },
      { label: "Zero Trust Access Management", href: "/cybersecurity/zero-trust", icon: "🔐" },
      { label: "Data Encryption Key Management", href: "/cybersecurity/key-management", icon: "🔑" },
      { label: "Cloud Security Posture Management", href: "/cybersecurity/cloud-security-posture", icon: "☁" },
      { label: "Endpoint Protection Dashboard", href: "/cybersecurity/endpoint-protection", icon: "💻" },
      { label: "International Cyber Law Compliance", href: "/cybersecurity/cyber-law-compliance", icon: "⚖️" },
      { label: "Third-Party Risk Assessment", href: "/cybersecurity/third-party-risk", icon: "🧾" },
      { label: "Global Security Certifications", href: "/cybersecurity/security-certifications", icon: "🏅" },
    ],
  },
  {
    key: "global-time-multi-timezone",
    title: "Global Time, Attendance & Multi-Timezone Ops",
    icon: "🕰️",
    items: [
      { label: "Multi-Timezone Shift Planner", href: "/global-time/shift-planner", icon: "🗓️" },
      { label: "Follow-the-Sun Support Scheduling", href: "/global-time/follow-the-sun", icon: "🌞" },
      { label: "Global Public Holiday Calendar", href: "/global-time/holiday-calendar", icon: "📅" },
      { label: "Cross-Region Meeting Scheduler", href: "/global-time/meeting-scheduler", icon: "🗓️" },
      { label: "Regional Working Hours Policy", href: "/global-time/working-hours-policy", icon: "⏰" },
      { label: "Time Zone Payroll Cutoffs", href: "/global-time/payroll-cutoffs", icon: "💵" },
      { label: "Global Overtime Rules Engine", href: "/global-time/overtime-rules", icon: "⚙" },
      { label: "Remote Team Presence Map", href: "/global-time/presence-map", icon: "🗺️" },
      { label: "Global Attendance Consolidation", href: "/global-time/attendance-consolidation", icon: "🧾" },
      { label: "Cross-Border Shift Compliance", href: "/global-time/shift-compliance", icon: "✅" },
      { label: "Daylight Saving Adjustment Log", href: "/global-time/dst-adjustment-log", icon: "🌗" },
    ],
  },
  {
    key: "intl-education-accreditation",
    title: "International Education & Accreditation",
    icon: "🎓",
    items: [
      { label: "Global Certification Body Directory", href: "/intl-education/certification-directory", icon: "🏅" },
      { label: "Cross-Border Credential Verification", href: "/intl-education/credential-verification", icon: "✅" },
      { label: "International Training Partnerships", href: "/intl-education/training-partnerships", icon: "🤝" },
      { label: "Overseas Scholarship Tracking", href: "/intl-education/scholarship-tracking", icon: "🎓" },
      { label: "Multi-Language Course Catalog", href: "/intl-education/course-catalog", icon: "📚" },
      { label: "Global Accreditation Renewal", href: "/intl-education/accreditation-renewal", icon: "🔁" },
      { label: "Study Abroad Program Management", href: "/intl-education/study-abroad", icon: "✈️" },
      { label: "International Exam Scheduling", href: "/intl-education/exam-scheduling", icon: "🗓️" },
      { label: "Cross-Border Faculty Exchange", href: "/intl-education/faculty-exchange", icon: "🧑‍🏫" },
      { label: "Global Skill Benchmarking", href: "/intl-education/skill-benchmarking", icon: "📊" },
    ],
  },
  {
    key: "government-diplomatic-relations",
    title: "Government & Diplomatic Relations",
    icon: "🏛️",
    items: [
      { label: "Embassy & Consulate Directory", href: "/gov-relations/embassy-directory", icon: "🏛️" },
      { label: "Government Liaison Tracking", href: "/gov-relations/liaison-tracking", icon: "🤝" },
      { label: "Diplomatic Protocol Management", href: "/gov-relations/protocol-management", icon: "📜" },
      { label: "Government Tender Portal Sync", href: "/gov-relations/tender-portal-sync", icon: "📢" },
      { label: "Public Sector Contract Register", href: "/gov-relations/public-sector-contracts", icon: "📄" },
      { label: "Regulatory Filing Calendar", href: "/gov-relations/regulatory-filing-calendar", icon: "📅" },
      { label: "Government Relations Correspondence", href: "/gov-relations/correspondence", icon: "✉️" },
      { label: "Policy Advocacy Tracker", href: "/gov-relations/policy-advocacy", icon: "📣" },
      { label: "International Trade Agreement Tracker", href: "/gov-relations/trade-agreement-tracker", icon: "🌐" },
      { label: "Diplomatic Visa Facilitation", href: "/gov-relations/diplomatic-visa-facilitation", icon: "🛂" },
    ],
  },
  {
    key: "global-supply-chain-risk",
    title: "Global Supply Chain Risk & Resilience",
    icon: "🧭",
    items: [
      { label: "Supplier Risk Scoring", href: "/supply-chain-risk/supplier-risk-scoring", icon: "⚠️" },
      { label: "Geopolitical Risk Monitoring", href: "/supply-chain-risk/geopolitical-monitoring", icon: "🌍" },
      { label: "Multi-Sourcing Strategy Planner", href: "/supply-chain-risk/multi-sourcing-planner", icon: "🧩" },
      { label: "Supply Chain Disruption Alerts", href: "/supply-chain-risk/disruption-alerts", icon: "🚨" },
      { label: "Alternate Route Planning", href: "/supply-chain-risk/alternate-route-planning", icon: "🗺️" },
      { label: "Force Majeure Event Tracking", href: "/supply-chain-risk/force-majeure-tracking", icon: "⚡" },
      { label: "Supplier Financial Health Monitoring", href: "/supply-chain-risk/supplier-financial-health", icon: "📉" },
      { label: "Climate & Weather Risk Impact", href: "/supply-chain-risk/climate-risk-impact", icon: "🌦️" },
      { label: "Buffer Stock Optimization", href: "/supply-chain-risk/buffer-stock-optimization", icon: "📦" },
      { label: "Supply Chain Resilience Scorecard", href: "/supply-chain-risk/resilience-scorecard", icon: "📊" },
      { label: "Critical Supplier Contingency Plans", href: "/supply-chain-risk/contingency-plans", icon: "🧯" },
    ],
  },
  {
    key: "intl-diaspora-remote-workforce",
    title: "International Diaspora & Remote Workforce",
    icon: "🌐",
    items: [
      { label: "Global Remote Employee Directory", href: "/diaspora-workforce/remote-directory", icon: "👥" },
      { label: "International Contractor Management", href: "/diaspora-workforce/contractor-management", icon: "🧑‍💻" },
      { label: "Cross-Border Employer of Record (EOR)", href: "/diaspora-workforce/eor-management", icon: "🏢" },
      { label: "Global Payroll Aggregation", href: "/diaspora-workforce/payroll-aggregation", icon: "💵" },
      { label: "Diaspora Talent Pool", href: "/diaspora-workforce/talent-pool", icon: "🗂️" },
      { label: "Remote Work Compliance by Country", href: "/diaspora-workforce/remote-compliance", icon: "✅" },
      { label: "International Independent Contractor Agreements", href: "/diaspora-workforce/contractor-agreements", icon: "📑" },
      { label: "Cross-Border Benefits Harmonization", href: "/diaspora-workforce/benefits-harmonization", icon: "🎁" },
      { label: "Global Mobility Self-Service Portal", href: "/diaspora-workforce/self-service-portal", icon: "🙋" },
      { label: "Remote Workforce Analytics", href: "/diaspora-workforce/workforce-analytics", icon: "📈" },
      { label: "Diaspora Community Engagement", href: "/diaspora-workforce/community-engagement", icon: "🤝" },
      { label: "Cross-Timezone Collaboration Tools", href: "/diaspora-workforce/collaboration-tools", icon: "💬" },
      { label: "International Equity & Stock Plans", href: "/diaspora-workforce/equity-stock-plans", icon: "📈" },
    ],
  },
  {
    key: "mfs-agent-banking",
    title: "MFS / এজেন্ট ব্যাংকিং",
    icon: "📲",
    items: [
      { label: "Cellfin Integration", href: "/mfs", icon: "🔷", badge: "New" },
      { label: "bKash Integration", href: "/mfs/bkash", icon: "💗", badge: "New" },
      { label: "Nagad Integration", href: "/mfs/nagad", icon: "🟠" },
      { label: "Rocket Integration", href: "/mfs/rocket", icon: "🚀" },
      { label: "SureCash Integration", href: "/mfs/surecash", icon: "🔵" },
      { label: "Upay Integration", href: "/mfs/upay", icon: "🟣" },
      { label: "Agent Banking Dashboard", href: "/mfs/agent-dashboard", icon: "🏦" },
      { label: "Agent Onboarding & KYC", href: "/mfs/agent-onboarding", icon: "🪪" },
      { label: "Cash In / Cash Out", href: "/mfs/cash-in-out", icon: "💵" },
      { label: "Merchant Payment (P2M)", href: "/mfs/merchant-payment", icon: "🛒" },
      { label: "Send Money (P2P)", href: "/mfs/send-money", icon: "📤" },
      { label: "Commission & Incentive", href: "/mfs/commission", icon: "🎯" },
      { label: "Daily Settlement", href: "/mfs/settlement", icon: "🧾" },
      { label: "Transaction Reconciliation", href: "/mfs/reconciliation", icon: "🔄" },
      { label: "Agent Float / e-Money Balance", href: "/mfs/float-balance", icon: "💰" },
      { label: "Transaction Limit Rules", href: "/mfs/transaction-limits", icon: "⚙" },
      { label: "MFS Transaction Reports", href: "/mfs/transaction-reports", icon: "📊" },
      { label: "Fraud & AML Monitoring", href: "/mfs/fraud-aml-monitoring", icon: "🕵️" },
      { label: "Bangladesh Bank Compliance", href: "/mfs/bb-compliance", icon: "🇧🇩" },
    ],
  },
  {
    key: "event-planning-decoration",
    title: "Event Planning & Decoration",
    icon: "🎉",
    items: [
      { label: "Event Booking Calendar", href: "/events/booking-calendar", icon: "📅", badge: "New" },
      { label: "Client Enquiry & Quotation", href: "/events/enquiry-quotation", icon: "📝" },
      { label: "Event Package Management", href: "/events/package-management", icon: "🎁" },
      { label: "Venue Management", href: "/events/venue-management", icon: "🏛️" },
      { label: "Decoration Design Gallery", href: "/events/design-gallery", icon: "🖼️" },
      { label: "Theme & Concept Planning", href: "/events/theme-planning", icon: "🎨" },
      { label: "Stage & Backdrop Setup", href: "/events/stage-backdrop", icon: "🎭" },
      { label: "Flower & Balloon Inventory", href: "/events/flower-balloon-inventory", icon: "🎈" },
      { label: "Lighting & Sound Equipment", href: "/events/lighting-sound", icon: "💡" },
      { label: "Catering Coordination", href: "/events/catering-coordination", icon: "🍽️" },
      { label: "Vendor & Supplier Booking", href: "/events/vendor-booking", icon: "🤝" },
      { label: "Event Staff Scheduling", href: "/events/staff-scheduling", icon: "🧑‍💼" },
      { label: "Setup & Teardown Checklist", href: "/events/setup-teardown-checklist", icon: "✅" },
      { label: "Photography & Videography", href: "/events/photography-videography", icon: "📸" },
      { label: "Guest List & RSVP", href: "/events/guest-list-rsvp", icon: "👥" },
      { label: "Invitation & Card Design", href: "/events/invitation-design", icon: "💌" },
      { label: "Event Budget & Costing", href: "/events/budget-costing", icon: "💰" },
      { label: "Advance & Payment Tracking", href: "/events/advance-payment-tracking", icon: "💳" },
      { label: "Transport & Logistics", href: "/events/transport-logistics", icon: "🚚" },
      { label: "Event Timeline / Run of Show", href: "/events/run-of-show", icon: "⏱️" },
      { label: "Client Feedback & Rating", href: "/events/feedback-rating", icon: "⭐" },
      { label: "Event Gallery / Portfolio", href: "/events/gallery-portfolio", icon: "🖼️" },
    ],
  },
  {
    key: "fish-raw-material-supply-chain",
    title: "Fish & Raw Material Supply Chain",
    icon: "🐟",
    items: [
      { label: "Fish Procurement & Sourcing", href: "/fish-supply/procurement", icon: "🎣", badge: "New" },
      { label: "Raw Material Intake Register", href: "/fish-supply/intake-register", icon: "📥" },
      { label: "Depot / Ghat Collection Points", href: "/fish-supply/collection-points", icon: "🚤" },
      { label: "Weighing & Grading", href: "/fish-supply/weighing-grading", icon: "⚖️" },
      { label: "Cold Storage Management", href: "/fish-supply/cold-storage", icon: "🧊" },
      { label: "Ice Factory & Ice Stock", href: "/fish-supply/ice-stock", icon: "❄️" },
      { label: "Species & Batch Tracking", href: "/fish-supply/species-batch-tracking", icon: "🐠" },
      { label: "Quality & Freshness Inspection", href: "/fish-supply/quality-inspection", icon: "🧪" },
      { label: "Processing & Packaging", href: "/fish-supply/processing-packaging", icon: "📦" },
      { label: "Cold Chain Logistics", href: "/fish-supply/cold-chain-logistics", icon: "🚛" },
      { label: "Farmer / Fisherman Ledger", href: "/fish-supply/farmer-ledger", icon: "🧾" },
      { label: "Auction / Bidding Management", href: "/fish-supply/auction-bidding", icon: "📢" },
      { label: "Raw Material Wastage Tracking", href: "/fish-supply/wastage-tracking", icon: "📉" },
      { label: "Traceability (Farm to Market)", href: "/fish-supply/traceability", icon: "🔍" },
      { label: "Export Compliance & Certification", href: "/fish-supply/export-compliance", icon: "📜" },
      { label: "Seasonal Supply Planning", href: "/fish-supply/seasonal-planning", icon: "📅" },
      { label: "Vendor & Distributor Network", href: "/fish-supply/vendor-network", icon: "🤝" },
      { label: "Fish Market Price Tracking", href: "/fish-supply/market-price-tracking", icon: "📈" },
    ],
  },
  {
    key: "tech-connect-erp",
    title: "Tech Connect ERP",
    icon: "💻",
    items: [
      { label: "Electronics Product Catalog", href: "/tech-connect/product-catalog", icon: "📱", badge: "New" },
      { label: "IMEI / Serial Number Tracking", href: "/tech-connect/imei-tracking", icon: "🔢" },
      { label: "Brand & Model Management", href: "/tech-connect/brand-model", icon: "🏷️" },
      { label: "Warranty & AMC Management", href: "/tech-connect/warranty-amc", icon: "🛡️" },
      { label: "Repair & Service Center", href: "/tech-connect/repair-service-center", icon: "🔧" },
      { label: "Spare Parts Inventory", href: "/tech-connect/spare-parts-inventory", icon: "🔩" },
      { label: "EMI & Installment Sales", href: "/tech-connect/emi-installment", icon: "💳" },
      { label: "Trade-In / Exchange Offer", href: "/tech-connect/trade-in-exchange", icon: "🔄" },
      { label: "Supplier & Import Purchase", href: "/tech-connect/supplier-import", icon: "🚢" },
      { label: "Price Comparison Engine", href: "/tech-connect/price-comparison", icon: "📊" },
      { label: "Showroom & Branch Stock", href: "/tech-connect/showroom-stock", icon: "🏬" },
      { label: "Online Order & Delivery", href: "/tech-connect/online-order-delivery", icon: "🚚" },
      { label: "Customer Complaint Tracking", href: "/tech-connect/complaint-tracking", icon: "📋" },
      { label: "Electronics Sales Analytics", href: "/tech-connect/sales-analytics", icon: "📈" },
    ],
  },
  {
    key: "retailflow-solutions",
    title: "RetailFlow Solutions",
    icon: "🛒",
    items: [
      { label: "Grocery Product Catalog", href: "/retailflow/product-catalog", icon: "🛒", badge: "New" },
      { label: "Daily Price List (Kancha Bazar)", href: "/retailflow/daily-price-list", icon: "📋" },
      { label: "Weight & Unit-Based Sales", href: "/retailflow/weight-unit-sales", icon: "⚖️" },
      { label: "Expiry Date Tracking", href: "/retailflow/expiry-tracking", icon: "⏳" },
      { label: "Wholesale & Retail Pricing", href: "/retailflow/wholesale-retail-pricing", icon: "💰" },
      { label: "Supplier / Dokan Ledger", href: "/retailflow/supplier-ledger", icon: "🧾" },
      { label: "Rack & Shelf Management", href: "/retailflow/rack-shelf-management", icon: "🗄️" },
      { label: "Grocery POS Billing", href: "/retailflow/pos-billing", icon: "🧮" },
      { label: "Home Delivery Management", href: "/retailflow/home-delivery", icon: "🛵" },
      { label: "Customer Credit / Baki Khata", href: "/retailflow/credit-baki-khata", icon: "📒" },
      { label: "Low Stock Alerts", href: "/retailflow/low-stock-alerts", icon: "🔔" },
      { label: "Seasonal Demand Forecasting", href: "/retailflow/seasonal-demand-forecasting", icon: "📈" },
      { label: "Grocery Chain Multi-Branch Sync", href: "/retailflow/multi-branch-sync", icon: "🌐" },
    ],
  },
];

const STORAGE_KEYS = {
  collapsed: "awm-sidebar-collapsed-v2",
  sections: "awm-sidebar-open-sections-v2",
  theme: "awm-sidebar-theme-v2",
  recent: "awm-sidebar-recent-v2",
} as const;

const SKELETON_ITEMS = [1, 2, 3, 4, 5, 6];
const RECENT_LIMIT = 6;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

function useDebouncedValue<T>(value: T, delay = 180) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = globalThis.setTimeout(() => setDebounced(value), delay);
    return () => globalThis.clearTimeout(timeout);
  }, [delay, value]);

  return debounced;
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function getInitialOpenSections(
  _pathname: string | null,
  _sections: SidebarSection[],
): Record<string, boolean> {
  // All groups start collapsed — a module list only opens when the user
  // explicitly clicks its group name, never automatically on load or navigation.
  return {};
}

/** Gold-gradient border wrapper — simulates a real 24k gold foil edge using a
 * gradient background behind a 1px inset content layer. */
function GoldFrame({
  children,
  className,
  rounded = "rounded-3xl",
  thickness = "p-[1.5px]",
}: {
  children: React.ReactNode;
  className?: string;
  rounded?: string;
  thickness?: string;
}) {
  return (
    <div
      className={cn(
        rounded,
        thickness,
        "bg-gradient-to-br from-[#F9E79F] via-[#B8860B] to-[#8A6200] shadow-[0_0_18px_rgba(212,175,55,0.25)]",
        className,
      )}
    >
      <div className={cn(rounded, "h-full w-full bg-[#0A1830]")}>{children}</div>
    </div>
  );
}

/** Decorative gold filigree scrollwork used at both ends of the jeweled
 * section-header pills (mirror it for the right-hand side). */
function FiligreeEnd({ mirror = false }: { mirror?: boolean }) {
  return (
    <svg
      viewBox="0 0 40 64"
      className={cn("h-[52px] w-9 shrink-0", mirror && "-scale-x-100")}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="filigreeGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FCEABB" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8A6200" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="40" height="64" fill="#081533" />
      <path
        d="M37 4C22 4 11 16 11 32C11 48 22 60 37 60"
        fill="none"
        stroke="url(#filigreeGold)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M33 12C23 12 17 20 17 32C17 44 23 52 33 52"
        fill="none"
        stroke="url(#filigreeGold)"
        strokeWidth="1.1"
        opacity="0.8"
        strokeLinecap="round"
      />
      <path
        d="M11 32C15 32 17 29 17 25"
        fill="none"
        stroke="url(#filigreeGold)"
        strokeWidth="1"
        opacity="0.7"
        strokeLinecap="round"
      />
      <path
        d="M11 32C15 32 17 35 17 39"
        fill="none"
        stroke="url(#filigreeGold)"
        strokeWidth="1"
        opacity="0.7"
        strokeLinecap="round"
      />
      <circle cx="19" cy="16" r="2.3" fill="url(#filigreeGold)" />
      <circle cx="14" cy="32" r="2.1" fill="url(#filigreeGold)" />
      <circle cx="19" cy="48" r="2.3" fill="url(#filigreeGold)" />
    </svg>
  );
}

function SidebarSkeleton({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="space-y-3 px-3 py-4" aria-hidden="true">
      {SKELETON_ITEMS.map((item) => (
        <GoldFrame key={item} className="animate-pulse" thickness="p-[1px]">
          <div
            className={cn(
              "flex items-center gap-3 rounded-3xl bg-[#0A1830]/90 px-3 py-3",
              isCollapsed ? "justify-center" : "justify-between",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-300/10" />
              {!isCollapsed && (
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded-full bg-amber-300/10" />
                  <div className="h-2.5 w-16 rounded-full bg-amber-300/5" />
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="h-6 w-10 rounded-full bg-amber-300/10" />
            )}
          </div>
        </GoldFrame>
      ))}
    </div>
  );
}

function MiniTrendBars() {
  const bars = [54, 72, 61, 88, 67, 94, 81];

  return (
    <div className="flex h-10 items-end gap-1">
      {bars.map((bar, index) => (
        <div
          key={`${bar}-${index}`}
          className="w-2 rounded-full bg-gradient-to-t from-[#8A6200] via-[#D4AF37] to-[#FFF3C4] opacity-95 shadow-[0_0_6px_rgba(212,175,55,0.6)] transition-transform duration-300 hover:scale-y-110"
          style={{ height: `${bar}%` }}
        />
      ))}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const mounted = useMounted();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    getInitialOpenSections(pathname, SIDEBAR_SECTIONS),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  const [bioMode, setBioMode] = useState<BioMode>(null);
  const [bioStatus, setBioStatus] = useState<BioStatus>("idle");
  const [bioError, setBioError] = useState<string | null>(null);

  const [idCardGenerating, setIdCardGenerating] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandIndex, setCommandIndex] = useState(0);

  const allCommands = useMemo<CommandItem[]>(() => {
    return SIDEBAR_SECTIONS.flatMap((section) =>
      section.items.map((item) => ({
        ...item,
        sectionKey: section.key,
        sectionTitle: section.title,
      })),
    );
  }, []);

  const isActive = useCallback(
    (href: string) => {
      if (!pathname) return false;
      if (href === "/") return pathname === "/";
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname],
  );

  useEffect(() => {
    if (!mounted || typeof globalThis.localStorage === "undefined") return;

    try {
      const storedCollapsed = globalThis.localStorage.getItem(STORAGE_KEYS.collapsed);
      const storedSections = globalThis.localStorage.getItem(STORAGE_KEYS.sections);
      const storedTheme = globalThis.localStorage.getItem(STORAGE_KEYS.theme);
      const storedRecent = globalThis.localStorage.getItem(STORAGE_KEYS.recent);

      if (storedCollapsed !== null) {
        setIsCollapsed(storedCollapsed === "true");
      }

      if (storedSections) {
        const parsed = JSON.parse(storedSections) as Record<string, boolean>;
        setOpenSections((prev) => ({ ...prev, ...parsed }));
      }

      if (storedTheme === "light" || storedTheme === "dark") {
        setThemeMode(storedTheme);
      } else if (typeof globalThis.matchMedia === "function") {
        const prefersDark = globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
        setThemeMode(prefersDark ? "dark" : "light");
      }

      if (storedRecent) {
        const parsed = JSON.parse(storedRecent) as string[];
        if (Array.isArray(parsed)) {
          setRecentItems(parsed.slice(0, RECENT_LIMIT));
        }
      }
    } catch {
      setThemeMode("dark");
    } finally {
      setIsHydrated(true);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !isHydrated || typeof globalThis.localStorage === "undefined") return;
    globalThis.localStorage.setItem(STORAGE_KEYS.collapsed, String(isCollapsed));
  }, [isCollapsed, isHydrated, mounted]);

  useEffect(() => {
    if (!mounted || !isHydrated || typeof globalThis.localStorage === "undefined") return;
    globalThis.localStorage.setItem(STORAGE_KEYS.sections, JSON.stringify(openSections));
  }, [openSections, isHydrated, mounted]);

  useEffect(() => {
    if (!mounted || !isHydrated || typeof globalThis.localStorage === "undefined") return;
    globalThis.localStorage.setItem(STORAGE_KEYS.theme, themeMode);
  }, [themeMode, isHydrated, mounted]);

  useEffect(() => {
    if (!mounted || !isHydrated || typeof globalThis.localStorage === "undefined") return;
    globalThis.localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(recentItems));
  }, [recentItems, isHydrated, mounted]);

  useEffect(() => {
    if (!pathname) return;

    // Note: we deliberately do NOT auto-open the group containing the active
    // route here — groups stay collapsed until the user clicks the group name.

    const activeItem = allCommands.find((item) => isActive(item.href));
    if (activeItem) {
      setRecentItems((prev) => {
        const next = [activeItem.href, ...prev.filter((href) => href !== activeItem.href)];
        return next.slice(0, RECENT_LIMIT);
      });
    }
  }, [allCommands, isActive, pathname]);

  useEffect(() => {
    if (!mounted || typeof globalThis.addEventListener !== "function") return;

    const onKeyDown = (event: KeyboardEvent) => {
      const isMetaK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isMetaK) {
        event.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }

      if (event.key === "Escape") {
        setIsCommandOpen(false);
      }
    };

    globalThis.addEventListener("keydown", onKeyDown);
    return () => globalThis.removeEventListener("keydown", onKeyDown);
  }, [mounted]);

  const filteredSections = useMemo(() => {
    const query = normalizeSearch(debouncedSearchQuery);

    if (!query) return SIDEBAR_SECTIONS;

    return SIDEBAR_SECTIONS.map((section) => {
      const titleMatched = section.title.toLowerCase().includes(query);

      const items = titleMatched
        ? section.items
        : section.items.filter((item) => {
          const label = item.label.toLowerCase();
          const href = item.href.toLowerCase();
          const badge = item.badge?.toLowerCase() ?? "";
          return (
            label.includes(query) ||
            href.includes(query) ||
            badge.includes(query) ||
            section.key.toLowerCase().includes(query)
          );
        });

      return {
        ...section,
        items,
      };
    }).filter((section) => section.items.length > 0);
  }, [debouncedSearchQuery]);

  const commandResults = useMemo(() => {
    const query = normalizeSearch(searchQuery);

    if (!query) {
      const recent = recentItems
        .map((href) => allCommands.find((item) => item.href === href))
        .filter(Boolean) as CommandItem[];

      const fallback = allCommands.filter((item) => !recentItems.includes(item.href)).slice(0, 10);
      return [...recent, ...fallback].slice(0, 12);
    }

    return allCommands
      .filter((item) => {
        const haystack = `${item.label} ${item.href} ${item.sectionTitle} ${item.badge ?? ""}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 12);
  }, [allCommands, recentItems, searchQuery]);

  useEffect(() => {
    setCommandIndex(0);
  }, [searchQuery, isCommandOpen]);

  const totalModules = useMemo(() => {
    return SIDEBAR_SECTIONS.reduce((total, section) => total + section.items.length, 0);
  }, []);

  const totalSections = SIDEBAR_SECTIONS.length;

  const aiModules = useMemo(() => {
    return SIDEBAR_SECTIONS.find((section) => section.key === "ai-control-center")?.items.length ?? 0;
  }, []);

  const activeSectionCount = useMemo(() => {
    return Object.values(openSections).filter(Boolean).length;
  }, [openSections]);

  const matchedModulesCount = useMemo(() => {
    return filteredSections.reduce((total, section) => total + section.items.length, 0);
  }, [filteredSections]);

  const baseItemClass =
    "group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3 py-2.5 text-[13px] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60";

  const activeItemClass =
    "border-[#D4AF37]/70 bg-gradient-to-r from-[#D4AF37]/25 via-[#F9E79F]/10 to-transparent text-[#FCEABB] shadow-[0_0_20px_-2px_rgba(212,175,55,0.55)]";

  const inactiveItemClass =
    "border-[#D4AF37]/10 text-slate-300 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/[0.07] hover:text-[#F5D888]";

  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const startBio = useCallback(
    async (mode: Exclude<BioMode, null>) => {
      if (bioStatus === "running") return;

      setBioMode(mode);
      setBioStatus("running");
      setBioError(null);

      try {
        await new Promise((resolve) => globalThis.setTimeout(resolve, 1200));
        setBioStatus("success");
      } catch {
        setBioStatus("failed");
        setBioError("Biometric verification failed. Please try again.");
      }
    },
    [bioStatus],
  );

  const generateIdCard = useCallback(async () => {
    if (idCardGenerating) return;

    setIdCardGenerating(true);

    try {
      await new Promise((resolve) => globalThis.setTimeout(resolve, 1200));
    } finally {
      setIdCardGenerating(false);
    }
  }, [idCardGenerating]);

  const getBioStatusText = useCallback(() => {
    if (bioStatus === "idle") return "System ready";
    if (bioStatus === "running") {
      return bioMode === "fingerprint" ? "Scanning fingerprint..." : "Scanning face...";
    }
    if (bioStatus === "success") return "Verified successfully";
    return bioError || "Verification failed";
  }, [bioError, bioMode, bioStatus]);

  const handleCommandItemOpen = useCallback((href: string, sectionKey: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionKey]: true }));
    setRecentItems((prev) => {
      const next = [href, ...prev.filter((item) => item !== href)];
      return next.slice(0, RECENT_LIMIT);
    });
    setIsCommandOpen(false);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const currentThemeIsDark = themeMode === "dark";

  return (
    <>
      <div className={cn("relative", currentThemeIsDark ? "dark" : "")}>
        <aside
          aria-label="Enterprise sidebar"
          className={cn(
            "fixed inset-y-0 left-0 z-40 h-screen overflow-hidden border-r-2 shadow-2xl transition-[width,background,border-color] duration-300 ease-out",
            "border-[#D4AF37]/50 bg-[#0A1830] text-slate-100",
            isCollapsed ? "w-20" : "w-80 2xl:w-[22rem]",
          )}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(30,58,138,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(29,78,216,0.16),transparent_26%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(212,175,55,0.06),transparent_18%,transparent_82%,rgba(212,175,55,0.06))]" />
            <div className="absolute -left-24 top-0 h-56 w-56 rounded-full bg-[#D4AF37]/20 blur-3xl" />
            <div className="absolute -right-24 top-28 h-56 w-56 rounded-full bg-blue-800/25 blur-3xl" />
            <div className="absolute bottom-0 left-10 h-40 w-40 rounded-full bg-blue-700/15 blur-3xl" />
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-transparent" />
          </div>

          <div className="relative flex h-full flex-col">
            <div className="sticky top-0 z-10 border-b-2 border-[#D4AF37]/30 bg-[#0A1830]/90 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <GoldFrame rounded="rounded-2xl" thickness="p-[2px]" className="h-12 w-12 shrink-0">
                    <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#12294f] via-[#0A1830] to-[#1a3a6b]">
                      <Image src="/logo/logo.png" alt="AWM ERP" width={60} height={60} />
                      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0A1830] bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]" />
                    </div>
                  </GoldFrame>

                  {!isCollapsed && (
                    <div className="min-w-0">
                      <div className="truncate bg-gradient-to-r from-[#F9E79F] via-[#D4AF37] to-[#F9E79F] bg-clip-text text-lg font-black tracking-wide text-transparent drop-shadow-[0_0_12px_rgba(212,175,55,0.45)]">
                        AWM ERP
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>Enterprise AI Suite</span>
                        <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                          ONLINE
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isCollapsed && (
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/[0.08] text-sm text-[#F5D888] transition-all duration-200 hover:border-[#F9E79F]/70 hover:bg-[#D4AF37]/20 hover:shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                      aria-label={currentThemeIsDark ? "Switch to light mode" : "Switch to dark mode"}
                      title={currentThemeIsDark ? "Light mode" : "Dark mode"}
                    >
                      {currentThemeIsDark ? "☀" : "🌙"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/[0.08] text-sm text-[#F5D888] transition-all duration-200 hover:border-[#F9E79F]/70 hover:bg-[#D4AF37]/20 hover:shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  >
                    {isCollapsed ? "☰" : "⇤"}
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <GoldFrame rounded="rounded-2xl" thickness="p-[1px]">
                    <div className="rounded-2xl bg-[#0F2242]/95 p-2">
                      <div className="text-[10px] text-slate-400">Modules</div>
                      <div className="text-sm font-bold text-[#F5D888]">{totalModules}</div>
                    </div>
                  </GoldFrame>
                  <GoldFrame rounded="rounded-2xl" thickness="p-[1px]">
                    <div className="rounded-2xl bg-[#0F2242]/95 p-2">
                      <div className="text-[10px] text-slate-400">AI Core</div>
                      <div className="text-sm font-bold text-[#F9E79F]">{aiModules}</div>
                    </div>
                  </GoldFrame>
                  <GoldFrame rounded="rounded-2xl" thickness="p-[1px]">
                    <div className="rounded-2xl bg-[#0F2242]/95 p-2">
                      <div className="text-[10px] text-slate-400">Live</div>
                      <div className="text-sm font-bold text-emerald-300">Safe</div>
                    </div>
                  </GoldFrame>
                </div>
              )}

              {!isCollapsed && (
                <>
                  <div className="mt-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsCommandOpen(true)}
                      className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-[#0F2242]/90 px-3 py-2.5 text-left text-sm text-slate-300 transition-all duration-200 hover:border-[#F9E79F]/60 hover:bg-[#13284f]"
                    >
                      <span className="text-sm text-[#D4AF37]">⌘</span>
                      <span className="flex-1 truncate">Search modules, pages, commands...</span>
                      <span className="rounded-lg border border-[#D4AF37]/30 bg-[#0A1830] px-2 py-1 text-[10px] font-semibold text-[#F5D888]">
                        Ctrl K
                      </span>
                    </button>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#D4AF37]">
                        🔍
                      </span>
                      <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search modules..."
                        aria-label="Search modules"
                        className="w-full rounded-2xl border border-[#D4AF37]/30 bg-[#0F2242]/90 py-2.5 pl-9 pr-12 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-[#F9E79F]/70 focus:bg-[#13284f] focus:shadow-[0_0_14px_rgba(212,175,55,0.3)]"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-sm text-slate-400 transition hover:bg-[#D4AF37]/15 hover:text-[#F5D888]"
                          aria-label="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <GoldFrame rounded="rounded-2xl" thickness="p-[1px]">
                      <div className="rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 via-[#0F2242] to-transparent p-3">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]">
                          Matched
                        </div>
                        <div className="mt-1 text-lg font-black text-[#F9E79F]">{matchedModulesCount}</div>
                        <div className="mt-1 text-[11px] text-slate-400">Search-ready modules</div>
                      </div>
                    </GoldFrame>

                    <GoldFrame rounded="rounded-2xl" thickness="p-[1px]">
                      <div className="rounded-2xl bg-gradient-to-br from-blue-700/25 via-[#0F2242] to-transparent p-3">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-blue-300">
                          Expanded
                        </div>
                        <div className="mt-1 text-lg font-black text-blue-100">{activeSectionCount}</div>
                        <div className="mt-1 text-[11px] text-slate-400">Active groups</div>
                      </div>
                    </GoldFrame>
                  </div>
                </>
              )}
            </div>

            {!isHydrated ? (
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <SidebarSkeleton isCollapsed={isCollapsed} />
              </div>
            ) : (
              <nav className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-4" aria-label="Sidebar navigation">
                {!isCollapsed && (
                  <GoldFrame className="mb-3">
                    <div className="rounded-3xl bg-[#0F2242]/90 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#F9E79F]">
                            System Pulse
                          </div>
                          <div className="mt-1 text-[11px] text-slate-400">Navigation intelligence</div>
                        </div>
                        <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                          Stable
                        </span>
                      </div>

                      <div className="mt-3 flex items-end justify-between gap-3">
                        <MiniTrendBars />
                        <div className="text-right">
                          <div className="text-base font-black text-[#F5D888]">{totalSections}</div>
                          <div className="text-[11px] text-slate-400">Business domains</div>
                        </div>
                      </div>
                    </div>
                  </GoldFrame>
                )}

                {filteredSections.length === 0 && !isCollapsed && (
                  <GoldFrame>
                    <div className="rounded-3xl bg-[#0F2242]/90 px-4 py-8 text-center">
                      <div className="text-3xl">🔎</div>
                      <div className="mt-3 text-sm font-semibold text-[#F5D888]">No module found</div>
                      <div className="mt-1 text-xs text-slate-400">Try another search keyword.</div>
                    </div>
                  </GoldFrame>
                )}

                {filteredSections.map((section) => {
                  const sectionActive = section.items.some((item) => isActive(item.href));
                  // sectionActive still highlights the group visually (gold glow),
                  // but no longer forces the module list open — only an explicit
                  // click (openSections) or an active search does that.
                  const sectionOpen =
                    !isCollapsed &&
                    (normalizeSearch(debouncedSearchQuery).length > 0 ||
                      openSections[section.key] === true);

                  return (
                    <div key={section.key} className="space-y-1">
                      {/* Jeweled section-header pill — icon + title + module count,
                          gold filigree scrollwork on both ends, click to expand/collapse. */}
                      <button
                        type="button"
                        onClick={() => toggleSection(section.key)}
                        className={cn(
                          "group relative flex w-full items-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60",
                          isCollapsed
                            ? "justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#0A1830] px-3 py-3 text-slate-300 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/[0.08]"
                            : "justify-start overflow-hidden rounded-full",
                        )}
                        title={section.title}
                        aria-expanded={sectionOpen}
                        aria-controls={`section-panel-${section.key}`}
                      >
                        {isCollapsed ? (
                          <span className="text-lg">{section.icon}</span>
                        ) : (
                          <>
                            <FiligreeEnd />
                            <span
                              className={cn(
                                "relative flex flex-1 items-center gap-3 border-y-2 border-[#D4AF37]/70 bg-gradient-to-b from-[#1c3d7a] via-[#0c2050] to-[#081533] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-8px_12px_rgba(0,0,0,0.35)] transition-all duration-300",
                                sectionActive
                                  ? "shadow-[0_0_22px_rgba(212,175,55,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]"
                                  : "group-hover:shadow-[0_0_14px_rgba(212,175,55,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]",
                              )}
                            >
                              <span className="pointer-events-none absolute inset-x-4 top-1 h-1/3 rounded-full bg-white/10 blur-[3px]" />

                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#D4AF37]/60 bg-gradient-to-br from-[#12294f] to-[#0A1830] text-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)]">
                                {section.icon}
                              </span>

                              <span className="min-w-0 flex-1 text-left">
                                <span className="block truncate bg-gradient-to-b from-[#FCEABB] via-[#D4AF37] to-[#9a7419] bg-clip-text text-[15px] font-black uppercase tracking-wide text-transparent drop-shadow-[0_1px_0_rgba(0,0,0,0.5)]">
                                  {section.title}
                                </span>
                                <span className="mt-0.5 block text-[11px] font-medium text-slate-300">
                                  {section.items.length} Modules
                                </span>
                              </span>

                              <span
                                className={cn(
                                  "shrink-0 text-xs text-[#D4AF37] transition-transform duration-300",
                                  sectionOpen ? "rotate-90" : "",
                                )}
                              >
                                ▶
                              </span>
                            </span>
                            <FiligreeEnd mirror />
                          </>
                        )}
                      </button>

                      <div
                        id={`section-panel-${section.key}`}
                        className={cn(
                          "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out",
                          sectionOpen ? "mt-1 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="overflow-hidden">
                          <div className="ml-5 space-y-1 border-l border-[#D4AF37]/25 pb-2 pl-3 pt-2">
                            {section.items.map((item) => {
                              const active = isActive(item.href);

                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className={cn(
                                    baseItemClass,
                                    active ? activeItemClass : inactiveItemClass,
                                  )}
                                  title={item.label}
                                  onClick={() => handleCommandItemOpen(item.href, section.key)}
                                >
                                  {active && (
                                    <span className="absolute -left-[13px] top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-[#F9E79F] to-[#D4AF37] shadow-[0_0_14px_rgba(212,175,55,0.9)]" />
                                  )}

                                  <span
                                    className={cn(
                                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm transition-all duration-300",
                                      active
                                        ? "bg-[#D4AF37]/25"
                                        : "bg-white/[0.04] group-hover:bg-[#D4AF37]/10",
                                    )}
                                  >
                                    {item.icon || "•"}
                                  </span>

                                  <span className="min-w-0 flex-1 truncate">{item.label}</span>

                                  {item.badge && (
                                    <span
                                      className={cn(
                                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                                        active
                                          ? "bg-[#D4AF37]/30 text-[#F9E79F]"
                                          : "bg-blue-700/20 text-blue-200",
                                      )}
                                    >
                                      {item.badge}
                                    </span>
                                  )}

                                  <span
                                    className={cn(
                                      "translate-x-1 text-xs opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100",
                                      active ? "text-[#F9E79F]" : "text-slate-500",
                                    )}
                                  >
                                    ↗
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </nav>
            )}

            <div className="sticky bottom-0 z-10 border-t-2 border-[#D4AF37]/30 bg-[#0A1830]/95 p-3 backdrop-blur-xl">
              {!isCollapsed && (
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
                      Quick Actions
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">Biometric & ID utilities</div>
                  </div>

                  <span className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-2 py-1 text-[10px] font-bold text-[#F5D888]">
                    Smart
                  </span>
                </div>
              )}

              {/* Quick action pills — gem-style buttons matching the 24k gold + ruby/sapphire look */}
              <div className={cn("grid gap-2", isCollapsed ? "grid-cols-1" : "grid-cols-3")}>
                <button
                  type="button"
                  onClick={() => startBio("fingerprint")}
                  disabled={bioStatus === "running"}
                  className={cn(
                    "relative rounded-full border-2 border-[#D4AF37]/70 px-2 py-2.5 text-xs font-semibold text-[#FCEABB] shadow-[0_0_14px_rgba(212,175,55,0.35)] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                    "bg-gradient-to-b from-[#7a1530] via-[#4a0d1e] to-[#2b0712] hover:shadow-[0_0_18px_rgba(212,175,55,0.55)]",
                  )}
                  title="Fingerprint"
                >
                  <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#F9E79F]" />
                  🧬 {!isCollapsed && <span className="ml-1">Finger</span>}
                </button>

                <button
                  type="button"
                  onClick={() => startBio("face")}
                  disabled={bioStatus === "running"}
                  className={cn(
                    "relative rounded-full border-2 border-[#D4AF37]/70 px-2 py-2.5 text-xs font-semibold text-[#FCEABB] shadow-[0_0_14px_rgba(212,175,55,0.35)] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                    "bg-gradient-to-b from-[#0d2a5c] via-[#0a1e42] to-[#061128] hover:shadow-[0_0_18px_rgba(212,175,55,0.55)]",
                  )}
                  title="Face"
                >
                  <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#F9E79F]" />
                  🙂 {!isCollapsed && <span className="ml-1">Face</span>}
                </button>

                <button
                  type="button"
                  onClick={generateIdCard}
                  disabled={idCardGenerating}
                  className={cn(
                    "relative rounded-full border-2 border-[#D4AF37]/70 px-2 py-2.5 text-xs font-semibold text-[#FCEABB] shadow-[0_0_14px_rgba(212,175,55,0.35)] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                    "bg-gradient-to-b from-[#7a1530] via-[#4a0d1e] to-[#2b0712] hover:shadow-[0_0_18px_rgba(212,175,55,0.55)]",
                  )}
                  title="ID Card"
                >
                  <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#F9E79F]" />
                  🪪 {!isCollapsed && <span className="ml-1">ID</span>}
                </button>
              </div>

              {!isCollapsed && (
                <div
                  className={cn(
                    "mt-3 rounded-2xl border px-3 py-2.5 text-xs transition-all duration-300",
                    bioStatus === "success"
                      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                      : bioStatus === "failed"
                        ? "border-red-400/40 bg-red-500/10 text-red-200"
                        : bioStatus === "running"
                          ? "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#F5D888]"
                          : "border-[#D4AF37]/20 bg-[#0F2242]/80 text-slate-400",
                  )}
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {bioStatus === "success"
                        ? "✅"
                        : bioStatus === "failed"
                          ? "❌"
                          : bioStatus === "running"
                            ? "⏳"
                            : "🛡"}
                    </span>
                    <span className="truncate">
                      {idCardGenerating ? "Generating ID card..." : getBioStatusText()}
                    </span>
                  </div>
                </div>
              )}

              {!isCollapsed && (
                <GoldFrame className="mt-3" rounded="rounded-3xl" thickness="p-[1.5px]">
                  <div className="rounded-3xl bg-gradient-to-r from-[#D4AF37]/[0.12] to-blue-800/[0.10] p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37]/35 to-blue-700/35">
                        👤
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-[#F5D888]">ERP Admin</div>
                        <div className="truncate text-[11px] text-slate-500">Super Administrator</div>
                      </div>
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                    </div>
                  </div>
                </GoldFrame>
              )}
            </div>
          </div>
        </aside>

        {/* Spacer to reserve layout space now that the sidebar is position:fixed and out of normal flow */}
        <div
          aria-hidden="true"
          className={cn(
            "hidden shrink-0 transition-[width] duration-300 ease-out md:block",
            isCollapsed ? "w-20" : "w-80 2xl:w-[22rem]",
          )}
        />
      </div>

      {isCommandOpen && !isCollapsed && (
        <div className="fixed inset-0 z-[90]">
          <button
            type="button"
            aria-label="Close command palette"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsCommandOpen(false)}
          />
          <div className="absolute left-1/2 top-20 w-[min(44rem,calc(100vw-1.5rem))] -translate-x-1/2">
            <GoldFrame rounded="rounded-[28px]" thickness="p-[2px]">
              <div className="overflow-hidden rounded-[28px] bg-[#0A1830]/98 text-slate-100 shadow-2xl">
                <div className="border-b border-[#D4AF37]/30 p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#D4AF37]">🔍</span>
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          setCommandIndex((prev) =>
                            Math.min(prev + 1, Math.max(commandResults.length - 1, 0)),
                          );
                        }
                        if (event.key === "ArrowUp") {
                          event.preventDefault();
                          setCommandIndex((prev) => Math.max(prev - 1, 0));
                        }
                        if (event.key === "Enter" && commandResults[commandIndex]) {
                          handleCommandItemOpen(
                            commandResults[commandIndex].href,
                            commandResults[commandIndex].sectionKey,
                          );
                        }
                      }}
                      placeholder="Search any module or route..."
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                    <span className="rounded-lg border border-[#D4AF37]/30 bg-[#0F2242] px-2 py-1 text-[10px] font-semibold text-[#F5D888]">
                      ESC
                    </span>
                  </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                  {commandResults.length === 0 ? (
                    <div className="rounded-2xl px-4 py-8 text-center text-sm text-slate-400">
                      No results found.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {commandResults.map((item, index) => (
                        <Link
                          key={`${item.sectionKey}-${item.href}`}
                          href={item.href}
                          onClick={() => handleCommandItemOpen(item.href, item.sectionKey)}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all duration-200",
                            index === commandIndex
                              ? "border-[#D4AF37]/50 bg-[#D4AF37]/15"
                              : "border-transparent hover:border-[#D4AF37]/25 hover:bg-[#D4AF37]/[0.08]",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                              index === commandIndex ? "bg-[#D4AF37]/20" : "bg-white/[0.05]",
                            )}
                          >
                            {item.icon}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-[#F5D888]">{item.label}</div>
                            <div className="truncate text-[11px] text-slate-400">
                              {item.sectionTitle} · {item.href}
                            </div>
                          </div>

                          {item.badge ? (
                            <span className="rounded-full bg-blue-700/20 px-2 py-1 text-[10px] font-bold text-blue-200">
                              {item.badge}
                            </span>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </GoldFrame>
          </div>
        </div>
      )}
    </>
  );
}
