"use client";

import React, { useMemo, useState } from "react";

type EInvoicingSettings = {
  autoGenerateInvoice: boolean;
  enableInternationalRules: boolean;
  defaultComplianceRegion: string;
  challanPrefix: string;
};

type CustomsSettings = {
  autoDutyCalculation: boolean;
  enableCrossBorderTax: boolean;
  customsProvider: string;
  defaultDutyRate: number;
};

type QCSettings = {
  enableQCWorkflow: boolean;
  qualityStandard: string;
  complianceThreshold: number;
  autoGenerateReports: boolean;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEFAULT_INVOICE_SETTINGS: EInvoicingSettings = {
  autoGenerateInvoice: true,
  enableInternationalRules: true,
  defaultComplianceRegion: "EU",
  challanPrefix: "AWM-INV",
};

const DEFAULT_CUSTOMS_SETTINGS: CustomsSettings = {
  autoDutyCalculation: true,
  enableCrossBorderTax: true,
  customsProvider: "Global Customs API",
  defaultDutyRate: 12,
};

const DEFAULT_QC_SETTINGS: QCSettings = {
  enableQCWorkflow: true,
  qualityStandard: "ISO 9001",
  complianceThreshold: 95,
  autoGenerateReports: true,
};

const complianceRegions = ["EU", "USA", "UK", "UAE", "Asia Pacific"];
const qualityStandards = ["ISO 9001", "ISO 14001", "FDA", "GMP"];

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function SectionCard({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-amber-200/70 bg-white/95 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              {description}
            </p>
          </div>

          {badge ? (
            <span className="w-fit rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
              {badge}
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function ToggleCard({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md">
      <div>
        <h3 className="font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition focus:outline-none focus:ring-4 focus:ring-amber-200 ${
          checked
            ? "bg-gradient-to-r from-amber-500 to-yellow-400"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function FieldLabel({
  label,
  hint,
}: {
  label: string;
  hint?: string;
}) {
  return (
    <div className="mb-2">
      <label className="block text-sm font-semibold text-slate-800">
        {label}
      </label>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function VipInput({
  value,
  onChange,
  type = "text",
  min,
  max,
  step,
  placeholder,
}: {
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
    />
  );
}

function VipSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default function QualityControlSettingsPage() {
  const [invoiceSettings, setInvoiceSettings] =
    useState<EInvoicingSettings>(DEFAULT_INVOICE_SETTINGS);

  const [customsSettings, setCustomsSettings] =
    useState<CustomsSettings>(DEFAULT_CUSTOMS_SETTINGS);

  const [qcSettings, setQcSettings] = useState<QCSettings>(DEFAULT_QC_SETTINGS);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string>("");

  const payload = useMemo(
    () => ({
      invoiceSettings,
      customsSettings,
      qcSettings,
    }),
    [invoiceSettings, customsSettings, qcSettings]
  );

  const validationMessages = useMemo(() => {
    const messages: string[] = [];

    if (!invoiceSettings.challanPrefix.trim()) {
      messages.push("Challan Prefix is required.");
    }

    if (!customsSettings.customsProvider.trim()) {
      messages.push("Customs Provider is required.");
    }

    if (
      customsSettings.defaultDutyRate < 0 ||
      customsSettings.defaultDutyRate > 100
    ) {
      messages.push("Default Duty Rate must be between 0 and 100.");
    }

    if (
      qcSettings.complianceThreshold < 0 ||
      qcSettings.complianceThreshold > 100
    ) {
      messages.push("Compliance Threshold must be between 0 and 100.");
    }

    return messages;
  }, [invoiceSettings, customsSettings, qcSettings]);

  const activeAutomationCount = useMemo(() => {
    return [
      invoiceSettings.autoGenerateInvoice,
      invoiceSettings.enableInternationalRules,
      customsSettings.autoDutyCalculation,
      customsSettings.enableCrossBorderTax,
      qcSettings.enableQCWorkflow,
      qcSettings.autoGenerateReports,
    ].filter(Boolean).length;
  }, [invoiceSettings, customsSettings, qcSettings]);

  const handleSave = async () => {
    if (validationMessages.length > 0) {
      setSaveStatus("error");
      alert(validationMessages.join("\n"));
      return;
    }

    try {
      setSaveStatus("saving");

      console.log("Saving Settings:", payload);

      /**
       * ============================================
       * CONNECT YOUR BACKEND API HERE
       * ============================================
       *
       * Example:
       *
       * await fetch("/api/settings/quality-control", {
       *   method: "POST",
       *   headers: {
       *     "Content-Type": "application/json",
       *   },
       *   body: JSON.stringify(payload),
       * });
       *
       */

      setLastSavedAt(new Date().toLocaleString());
      setSaveStatus("saved");
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus("error");
      alert("Failed to save settings. Please try again.");
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all settings to default?"
    );

    if (!confirmed) return;

    setInvoiceSettings(DEFAULT_INVOICE_SETTINGS);
    setCustomsSettings(DEFAULT_CUSTOMS_SETTINGS);
    setQcSettings(DEFAULT_QC_SETTINGS);
    setSaveStatus("idle");
    setLastSavedAt("");
  };

  const handleExportJson = () => {
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "quality-control-settings.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fde68a_0,#f8fafc_28%,#eef2ff_58%,#f8fafc_100%)] p-4 text-slate-950 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="overflow-hidden rounded-[2rem] border border-amber-200/80 bg-slate-950 shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
          <div className="relative p-6 sm:p-8">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-200">
                  VIP Enterprise Theme
                </div>

                <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white sm:text-4xl">
                  International Compliance & Quality Control
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  Configure global e-invoicing, customs automation, and
                  enterprise quality control standards with secure, structured,
                  and audit-ready controls.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-slate-300">Automations</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {activeAutomationCount}/6
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-slate-300">QC Threshold</p>
                  <p className="mt-1 text-2xl font-black text-amber-200">
                    {qcSettings.complianceThreshold}%
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur sm:col-span-1">
                  <p className="text-xs text-slate-300">Region</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {invoiceSettings.defaultComplianceRegion}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Status Panel */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm lg:col-span-2">
            <h2 className="font-bold text-slate-950">Configuration Health</h2>

            {validationMessages.length === 0 ? (
              <p className="mt-2 text-sm leading-6 text-emerald-700">
                All required settings are valid and ready to save.
              </p>
            ) : (
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-600">
                {validationMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
            <h2 className="font-bold text-slate-950">Save Status</h2>
            <p className="mt-2 text-sm capitalize text-slate-600">
              {saveStatus === "idle" && "No changes saved in this session."}
              {saveStatus === "saving" && "Saving configuration..."}
              {saveStatus === "saved" && "Configuration saved successfully."}
              {saveStatus === "error" && "Please fix the highlighted issues."}
            </p>

            {lastSavedAt ? (
              <p className="mt-2 text-xs text-slate-500">
                Last saved: {lastSavedAt}
              </p>
            ) : null}
          </div>
        </div>

        {/* Global E-Challan & E-Invoicing */}
        <SectionCard
          title="Global E-Challan & E-Invoicing"
          description="Automated rule configurations for local and international compliance."
          badge="Finance Compliance"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ToggleCard
              title="Auto Generate Invoices"
              description="Automatically generate invoices after order confirmation."
              checked={invoiceSettings.autoGenerateInvoice}
              onChange={(checked) =>
                setInvoiceSettings((previous) => ({
                  ...previous,
                  autoGenerateInvoice: checked,
                }))
              }
            />

            <ToggleCard
              title="International Compliance Rules"
              description="Enable VAT/GST and regional tax compliance automation."
              checked={invoiceSettings.enableInternationalRules}
              onChange={(checked) =>
                setInvoiceSettings((previous) => ({
                  ...previous,
                  enableInternationalRules: checked,
                }))
              }
            />

            <div>
              <FieldLabel
                label="Default Compliance Region"
                hint="Select the default region for tax and invoice rules."
              />
              <VipSelect
                value={invoiceSettings.defaultComplianceRegion}
                options={complianceRegions}
                onChange={(value) =>
                  setInvoiceSettings((previous) => ({
                    ...previous,
                    defaultComplianceRegion: value,
                  }))
                }
              />
            </div>

            <div>
              <FieldLabel
                label="Challan Prefix"
                hint="Used as the prefix for generated challan and invoice IDs."
              />
              <VipInput
                value={invoiceSettings.challanPrefix}
                placeholder="AWM-INV"
                onChange={(value) =>
                  setInvoiceSettings((previous) => ({
                    ...previous,
                    challanPrefix: value.toUpperCase(),
                  }))
                }
              />
            </div>
          </div>
        </SectionCard>

        {/* Customs & Duty Automation */}
        <SectionCard
          title="Customs & Duty Automation"
          description="Configure customs, tax, and duty automation for international operations."
          badge="Trade Automation"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ToggleCard
              title="Automated Duty Calculation"
              description="Automatically calculate customs duties and tariffs."
              checked={customsSettings.autoDutyCalculation}
              onChange={(checked) =>
                setCustomsSettings((previous) => ({
                  ...previous,
                  autoDutyCalculation: checked,
                }))
              }
            />

            <ToggleCard
              title="Cross-Border Tax Engine"
              description="Enable automated tax compliance for imports & exports."
              checked={customsSettings.enableCrossBorderTax}
              onChange={(checked) =>
                setCustomsSettings((previous) => ({
                  ...previous,
                  enableCrossBorderTax: checked,
                }))
              }
            />

            <div>
              <FieldLabel
                label="Customs Provider"
                hint="Name of your customs or compliance API provider."
              />
              <VipInput
                value={customsSettings.customsProvider}
                placeholder="Global Customs API"
                onChange={(value) =>
                  setCustomsSettings((previous) => ({
                    ...previous,
                    customsProvider: value,
                  }))
                }
              />
            </div>

            <div>
              <FieldLabel
                label="Default Duty Rate (%)"
                hint="Allowed range: 0% to 100%."
              />
              <VipInput
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={customsSettings.defaultDutyRate}
                onChange={(value) =>
                  setCustomsSettings((previous) => ({
                    ...previous,
                    defaultDutyRate: clampNumber(Number(value), 0, 100),
                  }))
                }
              />
            </div>
          </div>
        </SectionCard>

        {/* Quality Control */}
        <SectionCard
          title="Quality Control (QC)"
          description="Define enterprise quality standards, compliance metrics, and reporting automation."
          badge="Quality Assurance"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ToggleCard
              title="Enable QC Workflow"
              description="Activate automated quality control checks."
              checked={qcSettings.enableQCWorkflow}
              onChange={(checked) =>
                setQcSettings((previous) => ({
                  ...previous,
                  enableQCWorkflow: checked,
                }))
              }
            />

            <ToggleCard
              title="Automated Reporting"
              description="Generate scheduled QC compliance reports automatically."
              checked={qcSettings.autoGenerateReports}
              onChange={(checked) =>
                setQcSettings((previous) => ({
                  ...previous,
                  autoGenerateReports: checked,
                }))
              }
            />

            <div>
              <FieldLabel
                label="Quality Standard"
                hint="Choose the default compliance framework."
              />
              <VipSelect
                value={qcSettings.qualityStandard}
                options={qualityStandards}
                onChange={(value) =>
                  setQcSettings((previous) => ({
                    ...previous,
                    qualityStandard: value,
                  }))
                }
              />
            </div>

            <div>
              <FieldLabel
                label="Compliance Threshold (%)"
                hint="Minimum required compliance score for passing QC."
              />
              <VipInput
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={qcSettings.complianceThreshold}
                onChange={(value) =>
                  setQcSettings((previous) => ({
                    ...previous,
                    complianceThreshold: clampNumber(Number(value), 0, 100),
                  }))
                }
              />
            </div>
          </div>
        </SectionCard>

        {/* Actions */}
        <div className="sticky bottom-4 z-10 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.14)] backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-slate-950">
                Ready to apply configuration?
              </p>
              <p className="text-sm text-slate-500">
                Review your settings, export backup if needed, then save.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                Reset Defaults
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-800 transition hover:bg-amber-100"
              >
                Export JSON
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-900 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/20 transition hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveStatus === "saving"
                  ? "Saving..."
                  : "Save Configuration"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}