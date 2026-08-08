"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Icons from "lucide-react";
import { useLayoutEffect } from 'react';
/* ============================================================================
 * AWM Excel Studio — Enterprise Spreadsheet Module
 * Frontend-only page. All cloud/database operations are performed through
 * secure Next.js API routes. No database connection logic is used here.
 * ========================================================================== */

type Align = "left" | "center" | "right" | "justify";
type VerticalAlign = "top" | "middle" | "bottom";
type TextDirection = "ltr" | "rtl";

type ChartType =
  | "column"
  | "bar"
  | "pie"
  | "ofpie"
  | "area"
  | "line"
  | "xyscatter"
  | "bubble"
  | "net"
  | "stock"
  | "columnline";

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: "column", label: "Column" },
  { value: "bar", label: "Bar" },
  { value: "pie", label: "Pie" },
  { value: "ofpie", label: "Of-Pie" },
  { value: "area", label: "Area" },
  { value: "line", label: "Line" },
  { value: "xyscatter", label: "XY (Scatter)" },
  { value: "bubble", label: "Bubble" },
  { value: "net", label: "Net" },
  { value: "stock", label: "Stock" },
  { value: "columnline", label: "Column and Line" },
];
type Aggregate = "SUM" | "COUNT" | "AVERAGE" | "MIN" | "MAX" | "COUNTA" | "PRODUCT" | "STDEV" | "STDEVP" | "VAR" | "VARP";
type NumberFormat = "general" | "currency" | "percentage" | "number" | "date" | "scientific" | "accounting" | "text" | "custom";

interface CellBorders {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
}

interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  bg?: string;
  align?: Align;
  verticalAlign?: VerticalAlign;
  textDirection?: TextDirection;

  fontFamily?: string;
  fontSize?: number;
  borders?: CellBorders;
  borderStyle?: "solid" | "dashed" | "dotted" | "double";
  borderColor?: string;
  borderWidth?: number;
  wrap?: boolean;
  numberFormat?: NumberFormat;
  customFormat?: string;
  decimals?: number;
  indent?: number;
  currencyCode?: string;
}

interface CellData {
  value: string;
  style?: CellStyle;
  rowSpan?: number;
  colSpan?: number;
  mergedInto?: string;
  comment?: string;
  hyperlink?: string;
  image?: string;
  validation?: string[];
  sparkline?: string;
}

type CellMap = Record<string, CellData>;

interface GroupRange {
  id: string;
  start: number;
  end: number;
  collapsed: boolean;
}

interface ChartSeries {
  id: string;
  name: string;
  range: string;
}

interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  range: string;
  subtitle?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  showLegend?: boolean;
  legendPosition?: "right" | "top" | "bottom" | "left" | "none";
  is3D?: boolean;
  realistic?: boolean;
  shape?: "cylinder" | "cone" | "pyramid";
  series?: ChartSeries[];
}

interface ConditionalRule {
  id: string;
  range: string;
  condition: "greater" | "less" | "equal" | "between" | "textContains";
  value: string;
  value2?: string;
  bg: string;
  color?: string;
}

interface WorkbookSheet {
  id: string;
  name: string;
  gridRows: number;
  gridCols: number;
  cells: CellMap;
  groups: GroupRange[];
  hiddenRows: number[];
  filters: Record<number, string>;
  colWidths: Record<number, number>;
  rowHeights: Record<number, number>;
  frozenRows: number;
  frozenCols: number;
  charts: ChartConfig[];
  conditionalRules: ConditionalRule[];
  namedRanges: Record<string, string>;
}

interface WorkbookSnapshot {
  id?: string;
  name: string;
  pageSize: "A4" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
  activeSheetIndex: number;
  sheets: WorkbookSheet[];
  updatedAt?: string;
}

type ClipboardMode = "copy" | "cut" | null;

interface ClipboardData {
  mode: ClipboardMode;
  origin: { row: number; col: number };
  cells: { row: number; col: number; data: CellData }[];
  rows: number;
  cols: number;
}

interface SelectionRange {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

type EvalResult = number | string | boolean;

type SidebarPanel = "properties" | "styles" | "gallery" | "navigator" | "functions" | "settings";
type ToolbarButtonKind = "button" | "toggle";

const RECENT_FILES_KEY = "awm_excel_recent_files";
const TEMPLATES_KEY = "awm_excel_templates";

interface RecentFileEntry {
  id: string;
  name: string;
  openedAt: string;
  snapshot: WorkbookSnapshot;
}

interface WorkbookTemplate {
  id: string;
  name: string;
  createdAt: string;
  snapshot: WorkbookSnapshot;
}

function loadRecentFilesFromStorage(): RecentFileEntry[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(RECENT_FILES_KEY);
    return raw ? (JSON.parse(raw) as RecentFileEntry[]) : [];
  } catch {
    return [];
  }
}

function saveRecentFilesToStorage(files: RecentFileEntry[]) {
  try {
    window.localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(files.slice(0, 8)));
  } catch {
    /* storage unavailable or full; recent files list will not persist across reloads */
  }
}

function loadTemplatesFromStorage(): WorkbookTemplate[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(TEMPLATES_KEY);
    return raw ? (JSON.parse(raw) as WorkbookTemplate[]) : [];
  } catch {
    return [];
  }
}

function saveTemplatesToStorage(items: WorkbookTemplate[]) {
  try {
    window.localStorage.setItem(TEMPLATES_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable or full; templates will not persist across reloads */
  }
}

/* ============================================================================
 * Enterprise Menu Navigation Types & Data
 * ========================================================================== */

export interface MenuItemDefinition {
  label: string;
  action: string;
  shortcut?: string;
  isDivider?: boolean;
}

export interface MenuCategory {
  title: string;
  items: MenuItemDefinition[];
}

const EXCEL_MENU_DATA: MenuCategory[] = [
  {
    title: "File",
    items: [
      { label: "New", shortcut: "Ctrl+N", action: "FILE_NEW" },
      { label: "Open...", shortcut: "Ctrl+O", action: "FILE_OPEN" },
      { label: "Open Remote...", action: "FILE_OPEN_REMOTE" },
      { label: "Recent Documents", action: "FILE_RECENT_DOCS" },
      { label: "Close", action: "FILE_CLOSE" },
      { label: "Wizards", action: "FILE_WIZARDS" },
      { label: "Templates", shortcut: "Ctrl+Shift+N", action: "FILE_TEMPLATES" },
      { label: "Reload", action: "FILE_RELOAD" },
      { label: "Reload", action: "FILE_RELOAD" },
      { label: "Versions...", action: "FILE_VERSIONS" },
      { label: "Save", shortcut: "Ctrl+S", action: "FILE_SAVE" },
      { label: "Save As...", shortcut: "Ctrl+Shift+S", action: "FILE_SAVE_AS" },
      { label: "Save Remote...", action: "FILE_SAVE_REMOTE" },
      { label: "Save a Copy...", action: "FILE_SAVE_COPY" },
      { label: "Save as Template...", shortcut: "Shift+F11", action: "FILE_SAVE_AS_TEMPLATE" },
      { label: "Save All", action: "FILE_SAVE_ALL" },
      { label: "Export...", action: "FILE_EXPORT" },
      { label: "Export as PDF...", action: "FILE_EXPORT_PDF" },
      { label: "Send", action: "FILE_SEND" },
      { label: "Preview in Web Browser", action: "FILE_PREVIEW_WEB" },
      { label: "Print Preview", shortcut: "Ctrl+Shift+O", action: "FILE_PRINT_PREVIEW" },
      { label: "Print...", shortcut: "Ctrl+P", action: "FILE_PRINT" },
      { label: "Printer Settings...", action: "FILE_PRINTER_SETTINGS" },
      { label: "Properties...", action: "FILE_PROPERTIES" },
      { label: "Digital Signatures", action: "FILE_DIGITAL_SIGN" },
      { label: "Exit AWM ERP", shortcut: "Ctrl+Q", action: "FILE_EXIT" }
    ]
  },
  {
    title: "Edit",
    items: [
      { label: "Undo: Delete", shortcut: "Ctrl+Z", action: "EDIT_UNDO" },
      { label: "Redo", shortcut: "Ctrl+Y", action: "EDIT_REDO" },
      { label: "Repeat: Delete", shortcut: "Ctrl+Shift+Y", action: "EDIT_REPEAT" },
      { label: "Cut", shortcut: "Ctrl+X", action: "EDIT_CUT" },
      { label: "Copy", shortcut: "Ctrl+C", action: "EDIT_COPY" },
      { label: "Paste", shortcut: "Ctrl+V", action: "EDIT_PASTE" },
      { label: "Paste Special", action: "EDIT_PASTE_SPECIAL" },
      { label: "Select All", shortcut: "Ctrl+Shift+Space", action: "EDIT_SELECT_ALL" },
      { label: "Select", action: "EDIT_SELECT" },
      { label: "Find...", shortcut: "Ctrl+F", action: "EDIT_FIND" },
      { label: "Find and Replace...", shortcut: "Ctrl+H", action: "EDIT_FIND_REPLACE" },
      { label: "Track Changes", action: "EDIT_TRACK_CHANGES" },
      { label: "Cell Edit Mode", shortcut: "F2", action: "EDIT_CELL_MODE" },
      { label: "Cell Protection", action: "EDIT_CELL_PROTECTION" },
      { label: "Links to External Files...", action: "EDIT_LINKS_EXTERNAL" },
      { label: "OLE Object", action: "EDIT_OLE_OBJECT" },
      { label: "Edit Mode", shortcut: "Ctrl+Shift+M", action: "EDIT_MODE" }
    ]
  },
  {
    title: "View",
    items: [
      { label: "Normal", action: "VIEW_NORMAL" },
      { label: "Page Break", action: "VIEW_PAGE_BREAK" },
      { label: "User Interface...", action: "VIEW_USER_INTERFACE" },
      { label: "Toolbars", action: "VIEW_TOOLBARS" },
      { label: "Formula Bar", action: "VIEW_FORMULA_BAR" },
      { label: "Status Bar", action: "VIEW_STATUS_BAR" },
      { label: "View Headers", action: "VIEW_HEADERS" },
      { label: "View Grid Lines", action: "VIEW_GRID_LINES" },
      { label: "Grid and Helplines", action: "VIEW_GRID_HELPLINES" },
      { label: "Value Highlighting", shortcut: "Ctrl+F8", action: "VIEW_VALUE_HIGHLIGHTING" },
      { label: "Column/Row Highlighting", action: "VIEW_COL_ROW_HIGHLIGHTING" },
      { label: "Hidden Row/Column Indicator", action: "VIEW_HIDDEN_INDICATOR" },
      { label: "Show Formulas", shortcut: "Ctrl+`", action: "VIEW_SHOW_FORMULAS" },
      { label: "Comments", action: "VIEW_COMMENTS" },
      { label: "Split Window", action: "VIEW_SPLIT_WINDOW" },
      { label: "Freeze Rows and Columns", action: "VIEW_FREEZE_ROWS_COLS" },
      { label: "Freeze Cells", action: "VIEW_FREEZE_CELLS" },
      { label: "Sidebar", shortcut: "Ctrl+F5", action: "VIEW_SIDEBAR" },
      { label: "Styles", shortcut: "F11", action: "VIEW_STYLES" },
      { label: "Gallery", action: "VIEW_GALLERY" },
      { label: "Navigator", shortcut: "F5", action: "VIEW_NAVIGATOR" },
      { label: "Function List", action: "VIEW_FUNCTION_LIST" },
      { label: "Data Sources", shortcut: "Ctrl+Shift+F4", action: "VIEW_DATA_SOURCES" },
      { label: "Full Screen", shortcut: "Ctrl+Shift+J", action: "VIEW_FULL_SCREEN" },
      { label: "Zoom", action: "VIEW_ZOOM" }
    ]
  },
  {
    title: "Insert",
    items: [
      { label: "Image...", action: "INSERT_IMAGE" },
      { label: "Chart...", action: "INSERT_CHART" },
      { label: "Sparkline...", action: "INSERT_SPARKLINE" },
      { label: "Pivot Table...", action: "INSERT_PIVOT_TABLE" },
      { label: "Media", action: "INSERT_MEDIA" },
      { label: "OLE Object", action: "INSERT_OLE_OBJECT" },
      { label: "Shape", action: "INSERT_SHAPE" },
      { label: "Function...", shortcut: "Ctrl+F2", action: "INSERT_FUNCTION" },
      { label: "Named Range or Expression...", action: "INSERT_NAMED_RANGE" },
      { label: "Text Box", action: "INSERT_TEXT_BOX" },
      { label: "Comment", shortcut: "Ctrl+Alt+C", action: "INSERT_COMMENT" },
      { label: "Fontwork...", action: "INSERT_FONTWORK" },
      { label: "Hyperlink...", shortcut: "Ctrl+K", action: "INSERT_HYPERLINK" },
      { label: "Special Character...", action: "INSERT_SPECIAL_CHAR" },
      { label: "Formatting Mark", action: "INSERT_FORMATTING_MARK" },
      { label: "Date", shortcut: "Ctrl+;", action: "INSERT_DATE" },
      { label: "Time", shortcut: "Ctrl+Shift+;", action: "INSERT_TIME" },
      { label: "Field", action: "INSERT_FIELD" },
      { label: "Headers and Footers...", action: "INSERT_HEADERS_FOOTERS" },
      { label: "Form Control", action: "INSERT_FORM_CONTROL" },
      { label: "Signature Line...", action: "INSERT_SIGNATURE_LINE" }
    ]
  },
  {
    title: "Format",
    items: [
      { label: "Text", action: "FORMAT_TEXT" },
      { label: "Align Text", action: "FORMAT_ALIGN_TEXT" },
      { label: "Number Format", action: "FORMAT_NUMBER" },
      { label: "Clone Formatting", action: "FORMAT_CLONE" },
      { label: "Clear Direct Formatting", shortcut: "Ctrl+M", action: "FORMAT_CLEAR_DIRECT" },
      { label: "Cells...", shortcut: "Ctrl+1", action: "FORMAT_CELLS" },
      { label: "Rows", action: "FORMAT_ROWS" },
      { label: "Columns", action: "FORMAT_COLUMNS" },
      { label: "Page Style...", action: "FORMAT_PAGE_STYLE" },
      { label: "Print Ranges", action: "FORMAT_PRINT_RANGES" },
      { label: "Conditional", action: "FORMAT_CONDITIONAL" },
      { label: "Spreadsheet Theme", action: "FORMAT_SPREADSHEET_THEME" },
      { label: "Theme...", action: "FORMAT_THEME" },
      { label: "Sparklines", action: "FORMAT_SPARKLINES" }
    ]
  },
  {
    title: "Styles",
    items: [
      { label: "Default", action: "STYLE_DEFAULT" },
      { label: "Accent 1", action: "STYLE_ACCENT_1" },
      { label: "Accent 2", action: "STYLE_ACCENT_2" },
      { label: "Accent 3", action: "STYLE_ACCENT_3" },
      { label: "Heading 1", action: "STYLE_HEADING_1" },
      { label: "Heading 2", action: "STYLE_HEADING_2" },
      { label: "Good", action: "STYLE_GOOD" },
      { label: "Bad", action: "STYLE_BAD" },
      { label: "Neutral", action: "STYLE_NEUTRAL" },
      { label: "Error", action: "STYLE_ERROR" },
      { label: "Warning", action: "STYLE_WARNING" },
      { label: "Footnote", action: "STYLE_FOOTNOTE" },
      { label: "Note", action: "STYLE_NOTE" },
      { label: "Update Selected Style", action: "STYLE_UPDATE_SELECTED" },
      { label: "New Style from Selection", action: "STYLE_NEW_FROM_SELECTION" },
      { label: "Manage Styles", shortcut: "F11", action: "STYLE_MANAGE" }
    ]
  },
  {
    title: "Sheet",
    items: [
      { label: "Insert Cells...", shortcut: "Ctrl++", action: "SHEET_INSERT_CELLS" },
      { label: "Insert Rows", action: "SHEET_INSERT_ROWS" },
      { label: "Insert Columns", action: "SHEET_INSERT_COLUMNS" },
      { label: "Insert Page Break", action: "SHEET_INSERT_PAGE_BREAK" },
      { label: "Delete Cells...", shortcut: "Ctrl+-", action: "SHEET_DELETE_CELLS" },
      { label: "Delete Rows", action: "SHEET_DELETE_ROWS" },
      { label: "Delete Columns", action: "SHEET_DELETE_COLUMNS" },
      { label: "Insert Sheet...", action: "SHEET_INSERT_SHEET" },
      { label: "Insert Sheet at End...", action: "SHEET_INSERT_SHEET_END" },
      { label: "Insert Sheet from File...", action: "SHEET_INSERT_SHEET_FILE" },
      { label: "External Links...", action: "SHEET_EXTERNAL_LINKS" },
      { label: "Clear Cells...", shortcut: "Backspace", action: "SHEET_CLEAR_CELLS" },
      { label: "Cycle Cell Reference Types", shortcut: "F4", action: "SHEET_CYCLE_REF" },
      { label: "Fill Cells", action: "SHEET_FILL_CELLS" },
      { label: "Named Ranges and Expressions", action: "SHEET_NAMED_RANGES" },
      { label: "Rename Sheet...", action: "SHEET_RENAME" },
      { label: "Move or Copy Sheet...", action: "SHEET_MOVE_COPY" },
      { label: "Duplicate Sheet", action: "SHEET_DUPLICATE" },
      { label: "Navigate", action: "SHEET_NAVIGATE" },
      { label: "Sheet Tab Color...", action: "SHEET_TAB_COLOR" },
      { label: "Sheet Events...", action: "SHEET_EVENTS" },
      { label: "Right-To-Left", action: "SHEET_RTL" }
    ]
  },
  {
    title: "Data",
    items: [
      { label: "Sort...", action: "DATA_SORT" },
      { label: "Sort Ascending", action: "DATA_SORT_ASC" },
      { label: "Sort Descending", action: "DATA_SORT_DESC" },
      { label: "AutoFilter", shortcut: "Ctrl+Shift+L", action: "DATA_AUTOFILTER" },
      { label: "More Filters", action: "DATA_MORE_FILTERS" },
      { label: "Duplicates...", action: "DATA_DUPLICATES" },
      { label: "Define Range...", action: "DATA_DEFINE_RANGE" },
      { label: "Select Range...", action: "DATA_SELECT_RANGE" },
      { label: "Pivot Table", action: "DATA_PIVOT_TABLE" },
      { label: "Calculate", action: "DATA_CALCULATE" },
      { label: "Validity...", action: "DATA_VALIDITY" },
      { label: "Subtotals...", action: "DATA_SUBTOTALS" },
      { label: "Form...", action: "DATA_FORM" },
      { label: "XML Source...", action: "DATA_XML_SOURCE" },
      { label: "Data Provider...", action: "DATA_DATA_PROVIDER" },
      { label: "Consolidate...", action: "DATA_CONSOLIDATE" },
      { label: "Group and Outline", action: "DATA_GROUP_OUTLINE" },
      { label: "Statistics", action: "DATA_STATISTICS" }
    ]
  },
  {
    title: "Tools",
    items: [
      { label: "Spelling...", shortcut: "F7", action: "TOOLS_SPELLING" },
      { label: "Automatic Spell Checking", shortcut: "Shift+F7", action: "TOOLS_AUTO_SPELL" },
      { label: "Language", action: "TOOLS_LANGUAGE" },
      { label: "AutoCorrect Options...", action: "TOOLS_AUTOCORRECT" },
      { label: "AutoInput", action: "TOOLS_AUTOINPUT" },
      { label: "Redact", action: "TOOLS_REDACT" },
      { label: "Auto-Redact", action: "TOOLS_AUTO_REDACT" },
      { label: "Goal Seek...", action: "TOOLS_GOAL_SEEK" },
      { label: "Solver...", action: "TOOLS_SOLVER" },
      { label: "Detective", action: "TOOLS_DETECTIVE" },
      { label: "Forms", action: "TOOLS_FORMS" },
      { label: "Share Spreadsheet...", action: "TOOLS_SHARE_SPREADSHEET" },
      { label: "Protect Sheet...", action: "TOOLS_PROTECT_SHEET" },
      { label: "Protect Spreadsheet Structure...", action: "TOOLS_PROTECT_STRUCTURE" },
      { label: "Macros", action: "TOOLS_MACROS" },
      { label: "Development Tools", action: "TOOLS_DEV_TOOLS" },
      { label: "XML Filter Settings...", action: "TOOLS_XML_FILTER" },
      { label: "Extensions...", shortcut: "Ctrl+Alt+E", action: "TOOLS_EXTENSIONS" },
      { label: "Customize...", action: "TOOLS_CUSTOMIZE" },
      { label: "Options...", shortcut: "Alt+F12", action: "TOOLS_OPTIONS" }

    ]
  },
  {
    title: "Window",
    items: [
      { label: "New Window", action: "WINDOW_NEW" },
      { label: "Close Window", shortcut: "Ctrl+W", action: "WINDOW_CLOSE" }
    ]
  },

  {
    title: "Help",
    items: [
      { label: "info@awmerp.com", action: "HELP_CONTACT_INFO" }
    ]
  }
];

const DEFAULT_ROWS = 3000;
const DEFAULT_COLS = 200;
const MAX_ROWS = 100000;
const MAX_COLS = 2000;
const DEFAULT_COL_WIDTH = 120;
const DEFAULT_ROW_HEIGHT = 36;
const ROW_HEADER_WIDTH = 52;
const HEADER_HEIGHT = 30;

// Sticky-layer z-index registry — freeze panes ও normal cell-এর স্তরবিন্যাস
// একই জায়গায় কেন্দ্রীভূত রাখা হলো যাতে ভবিষ্যতে নতুন sticky element যোগ করার সময়
// z-index সংঘর্ষ (conflict) না হয়।
const Z_LAYER = {
  cell: 1,
  colHeader: 25,
  colHeaderFrozenCol: 35,   // frozen data-column-এর উপরের header
  rowHeader: 20,
  rowHeaderFrozenRow: 32,   // frozen data-row-এর পাশের row header
  frozenCol: 22,
  frozenRow: 21,
  frozenCorner: 31,         // frozen row + frozen col intersection
  corner: 40,               // top-left corner (সর্বোচ্চ, সবসময় সবার উপরে)
} as const;

const FONT_FAMILIES = [
  "Inter",
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Tahoma",
  "Verdana",
  "Helvetica",
  "Calibri",
];
type AppLocale = "en" | "bn" | "ar" | "hi" | "es";

const DEFAULT_APP_LOCALE: AppLocale = "en";

const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  bn: "বাংলা",
  ar: "العربية",
  hi: "हिन्दी",
  es: "Español",
};

const TRANSLATIONS: Record<AppLocale, Record<string, string>> = {
  en: {
    file: "File",
    edit: "Edit",
    view: "View",
    insert: "Insert",
    format: "Format",
    styles: "Styles",
    sheet: "Sheet",
    data: "Data",
    tools: "Tools",
    window: "Window",
    help: "Help",
    save: "Save",
    open: "Open",
    close: "Close",
    language: "Language",
    locale: "Locale",
    collapse: "Collapse",
    undock: "Undock",
    dock: "Dock",
    customize: "Customize",
    sidebarCollapsed: "Sidebar collapsed.",
    sidebarUndockToggled: "Sidebar undock toggled.",
    sidebarCustomized: "Sidebar customized.",
    sidebarDescription: "The sidebar can be customized, docked, and collapsed.",
  },
  bn: {
    file: "ফাইল",
    edit: "এডিট",
    view: "ভিউ",
    insert: "ইনসার্ট",
    format: "ফরম্যাট",
    styles: "স্টাইলস",
    sheet: "শীট",
    data: "ডাটা",
    tools: "টুলস",
    window: "উইন্ডো",
    help: "হেল্প",
    save: "সেভ",
    open: "ওপেন",
    close: "বন্ধ",
    language: "ভাষা",
    locale: "লোকেল",
    collapse: "সংকুচিত করুন",
    undock: "আলাদা করুন",
    dock: "ডক করুন",
    customize: "কাস্টমাইজ",
    sidebarCollapsed: "সাইডবার সংকুচিত করা হয়েছে।",
    sidebarUndockToggled: "সাইডবার ডক অবস্থা পরিবর্তন করা হয়েছে।",
    sidebarCustomized: "সাইডবার কাস্টমাইজ করা হয়েছে।",
    sidebarDescription: "সাইডবারটি কাস্টমাইজ, ডক, এবং সংকুচিত করা যায়।",
  },
  ar: {
    file: "ملف",
    edit: "تحرير",
    view: "عرض",
    insert: "إدراج",
    format: "تنسيق",
    styles: "أنماط",
    sheet: "ورقة",
    data: "بيانات",
    tools: "أدوات",
    window: "نافذة",
    help: "مساعدة",
    save: "حفظ",
    open: "فتح",
    close: "إغلاق",
    language: "اللغة",
    locale: "الإعدادات المحلية",
    collapse: "طي",
    undock: "فصل",
    dock: "إرساء",
    customize: "تخصيص",
    sidebarCollapsed: "تم طي الشريط الجانبي.",
    sidebarUndockToggled: "تم تبديل حالة فصل الشريط الجانبي.",
    sidebarCustomized: "تم تخصيص الشريط الجانبي.",
    sidebarDescription: "يمكن تخصيص الشريط الجانبي وفصله وطيه.",
  },
  hi: {
    file: "फ़ाइल",
    edit: "संपादित करें",
    view: "देखें",
    insert: "सम्मिलित करें",
    format: "फ़ॉर्मेट",
    styles: "शैलियाँ",
    sheet: "शीट",
    data: "डेटा",
    tools: "टूल्स",
    window: "विंडो",
    help: "सहायता",
    save: "सेव",
    open: "खोलें",
    close: "बंद करें",
    language: "भाषा",
    locale: "लोकेल",
    collapse: "संक्षिप्त करें",
    undock: "अनडॉक करें",
    dock: "डॉक करें",
    customize: "कस्टमाइज़ करें",
    sidebarCollapsed: "साइडबार संक्षिप्त कर दिया गया है।",
    sidebarUndockToggled: "साइडबार अनडॉक स्थिति बदली गई।",
    sidebarCustomized: "साइडबार कस्टमाइज़ किया गया।",
    sidebarDescription: "साइडबार को कस्टमाइज़, डॉक और संक्षिप्त किया जा सकता है।",
  },
  es: {
    file: "Archivo",
    edit: "Editar",
    view: "Ver",
    insert: "Insertar",
    format: "Formato",
    styles: "Estilos",
    sheet: "Hoja",
    data: "Datos",
    tools: "Herramientas",
    window: "Ventana",
    help: "Ayuda",
    save: "Guardar",
    open: "Abrir",
    close: "Cerrar",
    language: "Idioma",
    locale: "Configuración regional",
    collapse: "Contraer",
    undock: "Separar",
    dock: "Anclar",
    customize: "Personalizar",
    sidebarCollapsed: "Barra lateral contraída.",
    sidebarUndockToggled: "Estado de anclaje de la barra lateral cambiado.",
    sidebarCustomized: "Barra lateral personalizada.",
    sidebarDescription: "La barra lateral se puede personalizar, anclar y contraer.",
  },
};

function t(locale: AppLocale, key: string): string {
  return TRANSLATIONS[locale]?.[key] || TRANSLATIONS.en[key] || key;
}
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

const PAGE_SIZES: Record<"A4" | "Letter" | "Legal", { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  Letter: { w: 216, h: 279 },
  Legal: { w: 216, h: 356 },
};

const FUNCTION_LIST: { name: string; usage: string; desc: string }[] = [
  { name: "SUM", usage: "SUM(A1:A10)", desc: "Adds numbers in a range." },
  { name: "AVERAGE", usage: "AVERAGE(A1:A10)", desc: "Returns the arithmetic mean." },
  { name: "MIN", usage: "MIN(A1:A10)", desc: "Returns the smallest value." },
  { name: "MAX", usage: "MAX(A1:A10)", desc: "Returns the largest value." },
  { name: "COUNT", usage: "COUNT(A1:A10)", desc: "Counts numeric cells." },
  { name: "IF", usage: "IF(A1>100,\"Pass\",\"Fail\")", desc: "Returns a value based on a condition." },
  { name: "ROUND", usage: "ROUND(A1,2)", desc: "Rounds a number." },
  { name: "ABS", usage: "ABS(A1)", desc: "Returns the absolute value." },
  { name: "CONCAT", usage: "CONCAT(A1,\" \",B1)", desc: "Joins values together." },
  { name: "AND", usage: "AND(A1>0,B1>0)", desc: "TRUE if all conditions are true." },
  { name: "OR", usage: "OR(A1>0,B1>0)", desc: "TRUE if any condition is true." },
  { name: "TODAY", usage: "TODAY()", desc: "Returns today's date." },
  { name: "NOW", usage: "NOW()", desc: "Returns current date and time." },
  { name: "UPPER", usage: "UPPER(A1)", desc: "Converts text to uppercase." },
  { name: "LOWER", usage: "LOWER(A1)", desc: "Converts text to lowercase." },
  { name: "LEN", usage: "LEN(A1)", desc: "Returns text length." },
];

const FUNCTION_CATEGORIES: Record<string, string> = {
  SUM: "Math", ROUND: "Math", ABS: "Math",
  AVERAGE: "Statistical", MIN: "Statistical", MAX: "Statistical", COUNT: "Statistical",
  IF: "Logical", AND: "Logical", OR: "Logical",
  CONCAT: "Text", UPPER: "Text", LOWER: "Text", LEN: "Text",
  TODAY: "Date", NOW: "Date",
};

const GALLERY_STAMPS = ["✔", "✖", "★", "⚠", "📌", "🏢", "💰", "📈", "📉", "🕒", "✍", "📎"];

const SPECIAL_CHARACTERS = ["Ω", "≈", "≠", "≤", "≥", "÷", "×", "±", "©", "®", "™", "€", "£", "¥", "₹", "✓", "★", "→", "←", "↑", "↓"];

const BORDER_STYLE_OPTIONS: CellStyle["borderStyle"][] = ["solid", "dashed", "dotted", "double"];

/* ============================================================================
 * World Currency List (ISO 4217 active codes) — used by the Currency toolbar dropdown.
 * Each entry: { code, name, symbol, locale } — the locale field drives Intl.NumberFormat so
 * every currency formats with its native symbol, decimal places and grouping.
 * ========================================================================== */
interface WorldCurrency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

const WORLD_CURRENCIES: WorldCurrency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US" },
  { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE" },
  { code: "GBP", name: "British Pound Sterling", symbol: "£", locale: "en-GB" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP" },
  { code: "CNY", name: "Chinese Yuan Renminbi", symbol: "¥", locale: "zh-CN" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", locale: "en-IN" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", locale: "en-CA" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", locale: "de-CH" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", locale: "en-HK" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", locale: "en-SG" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", locale: "en-NZ" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", locale: "sv-SE" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", locale: "nb-NO" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", locale: "da-DK" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", locale: "ar-AE" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", locale: "ar-SA" },
  { code: "QAR", name: "Qatari Riyal", symbol: "﷼", locale: "ar-QA" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", locale: "ar-KW" },
  { code: "BHD", name: "Bahraini Dinar", symbol: "د.ب", locale: "ar-BH" },
  { code: "OMR", name: "Omani Rial", symbol: "﷼", locale: "ar-OM" },
  { code: "JOD", name: "Jordanian Dinar", symbol: "د.ا", locale: "ar-JO" },
  { code: "LBP", name: "Lebanese Pound", symbol: "ل.ل", locale: "ar-LB" },
  { code: "EGP", name: "Egyptian Pound", symbol: "£E", locale: "ar-EG" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", locale: "tr-TR" },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼", locale: "fa-IR" },
  { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د", locale: "ar-IQ" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", locale: "ur-PK" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", locale: "bn-BD" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", locale: "si-LK" },
  { code: "NPR", name: "Nepalese Rupee", symbol: "रु", locale: "ne-NP" },
  { code: "AFN", name: "Afghan Afghani", symbol: "؋", locale: "fa-AF" },
  { code: "MVR", name: "Maldivian Rufiyaa", symbol: "Rf", locale: "dv-MV" },
  { code: "THB", name: "Thai Baht", symbol: "฿", locale: "th-TH" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", locale: "id-ID" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", locale: "ms-MY" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", locale: "en-PH" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", locale: "vi-VN" },
  { code: "KHR", name: "Cambodian Riel", symbol: "៛", locale: "km-KH" },
  { code: "LAK", name: "Lao Kip", symbol: "₭", locale: "lo-LA" },
  { code: "MMK", name: "Burmese Kyat", symbol: "Ks", locale: "my-MM" },
  { code: "BND", name: "Brunei Dollar", symbol: "B$", locale: "ms-BN" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", locale: "ko-KR" },
  { code: "TWD", name: "Taiwan New Dollar", symbol: "NT$", locale: "zh-TW" },
  { code: "MNT", name: "Mongolian Tugrik", symbol: "₮", locale: "mn-MN" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", locale: "ru-RU" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴", locale: "uk-UA" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", locale: "pl-PL" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", locale: "cs-CZ" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", locale: "hu-HU" },
  { code: "RON", name: "Romanian Leu", symbol: "lei", locale: "ro-RO" },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв", locale: "bg-BG" },
  { code: "HRK", name: "Croatian Kuna", symbol: "kn", locale: "hr-HR" },
  { code: "RSD", name: "Serbian Dinar", symbol: "дин", locale: "sr-RS" },
  { code: "ISK", name: "Icelandic Krona", symbol: "kr", locale: "is-IS" },
  { code: "MDL", name: "Moldovan Leu", symbol: "L", locale: "ro-MD" },
  { code: "MKD", name: "Macedonian Denar", symbol: "ден", locale: "mk-MK" },
  { code: "ALL", name: "Albanian Lek", symbol: "L", locale: "sq-AL" },
  { code: "BAM", name: "Bosnia Mark", symbol: "KM", locale: "bs-BA" },
  { code: "ZAR", name: "South African Rand", symbol: "R", locale: "en-ZA" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", locale: "en-NG" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", locale: "en-GH" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", locale: "sw-KE" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh", locale: "sw-UG" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", locale: "sw-TZ" },
  { code: "RWF", name: "Rwandan Franc", symbol: "FRw", locale: "rw-RW" },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br", locale: "am-ET" },
  { code: "SOS", name: "Somali Shilling", symbol: "Sh", locale: "so-SO" },
  { code: "SDG", name: "Sudanese Pound", symbol: "£S", locale: "ar-SD" },
  { code: "LYD", name: "Libyan Dinar", symbol: "ل.د", locale: "ar-LY" },
  { code: "TND", name: "Tunisian Dinar", symbol: "د.ت", locale: "ar-TN" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "د.م.", locale: "ar-MA" },
  { code: "DZD", name: "Algerian Dinar", symbol: "دج", locale: "ar-DZ" },
  { code: "AOA", name: "Angolan Kwanza", symbol: "Kz", locale: "pt-AO" },
  { code: "ZMW", name: "Zambian Kwacha", symbol: "ZK", locale: "en-ZM" },
  { code: "BWP", name: "Botswana Pula", symbol: "P", locale: "en-BW" },
  { code: "NAD", name: "Namibian Dollar", symbol: "N$", locale: "en-NA" },
  { code: "MUR", name: "Mauritian Rupee", symbol: "₨", locale: "en-MU" },
  { code: "MZN", name: "Mozambique Metical", symbol: "MT", locale: "pt-MZ" },
  { code: "GMD", name: "Gambian Dalasi", symbol: "D", locale: "en-GM" },
  { code: "XOF", name: "West African CFA Franc", symbol: "CFA", locale: "fr-SN" },
  { code: "XAF", name: "Central African CFA Franc", symbol: "FCFA", locale: "fr-CM" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", locale: "es-MX" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", locale: "pt-BR" },
  { code: "ARS", name: "Argentine Peso", symbol: "$", locale: "es-AR" },
  { code: "CLP", name: "Chilean Peso", symbol: "$", locale: "es-CL" },
  { code: "COP", name: "Colombian Peso", symbol: "$", locale: "es-CO" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/", locale: "es-PE" },
  { code: "UYU", name: "Uruguayan Peso", symbol: "$U", locale: "es-UY" },
  { code: "PYG", name: "Paraguayan Guarani", symbol: "₲", locale: "es-PY" },
  { code: "BOB", name: "Bolivian Boliviano", symbol: "Bs", locale: "es-BO" },
  { code: "VES", name: "Venezuelan Bolivar", symbol: "Bs", locale: "es-VE" },
  { code: "GTQ", name: "Guatemalan Quetzal", symbol: "Q", locale: "es-GT" },
  { code: "HNL", name: "Honduran Lempira", symbol: "L", locale: "es-HN" },
  { code: "NIO", name: "Nicaraguan Cordoba", symbol: "C$", locale: "es-NI" },
  { code: "CRC", name: "Costa Rican Colon", symbol: "₡", locale: "es-CR" },
  { code: "PAB", name: "Panamanian Balboa", symbol: "B/.", locale: "es-PA" },
  { code: "DOP", name: "Dominican Peso", symbol: "RD$", locale: "es-DO" },
  { code: "CUP", name: "Cuban Peso", symbol: "$MN", locale: "es-CU" },
  { code: "JMD", name: "Jamaican Dollar", symbol: "J$", locale: "en-JM" },
  { code: "TTD", name: "Trinidad Dollar", symbol: "TT$", locale: "en-TT" },
  { code: "BBD", name: "Barbadian Dollar", symbol: "Bds$", locale: "en-BB" },
  { code: "BSD", name: "Bahamian Dollar", symbol: "B$", locale: "en-BS" },
  { code: "BZD", name: "Belize Dollar", symbol: "BZ$", locale: "en-BZ" },
  { code: "XCD", name: "East Caribbean Dollar", symbol: "EC$", locale: "en-GD" },
  { code: "AWG", name: "Aruban Florin", symbol: "ƒ", locale: "nl-AW" },
  { code: "ANG", name: "Netherlands Antillean Guilder", symbol: "ƒ", locale: "nl-SX" },
  { code: "SRD", name: "Surinamese Dollar", symbol: "Sr$", locale: "nl-SR" },
  { code: "GYD", name: "Guyanese Dollar", symbol: "G$", locale: "en-GY" },
  { code: "FJD", name: "Fijian Dollar", symbol: "FJ$", locale: "en-FJ" },
  { code: "PGK", name: "Papua New Guinea Kina", symbol: "K", locale: "en-PG" },
  { code: "SBD", name: "Solomon Islands Dollar", symbol: "SI$", locale: "en-SB" },
  { code: "VUV", name: "Vanuatu Vatu", symbol: "Vt", locale: "en-VU" },
  { code: "WST", name: "Samoan Tala", symbol: "WS$", locale: "en-WS" },
  { code: "TOP", name: "Tongan Pa'anga", symbol: "T$", locale: "en-TO" },
  { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸", locale: "kk-KZ" },
  { code: "UZS", name: "Uzbekistani Som", symbol: "сўм", locale: "uz-UZ" },
  { code: "AZN", name: "Azerbaijani Manat", symbol: "₼", locale: "az-AZ" },
  { code: "GEL", name: "Georgian Lari", symbol: "₾", locale: "ka-GE" },
  { code: "AMD", name: "Armenian Dram", symbol: "֏", locale: "hy-AM" },
  { code: "BYN", name: "Belarusian Ruble", symbol: "Br", locale: "be-BY" },
  { code: "KGS", name: "Kyrgyzstani Som", symbol: "с", locale: "ky-KG" },
  { code: "TJS", name: "Tajikistani Somoni", symbol: "ЅМ", locale: "tg-TJ" },
  { code: "TMT", name: "Turkmenistani Manat", symbol: "m", locale: "tk-TM" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪", locale: "he-IL" },
  { code: "JEP", name: "Jersey Pound", symbol: "£", locale: "en-JE" },
  { code: "GGP", name: "Guernsey Pound", symbol: "£", locale: "en-GG" },
  { code: "IMP", name: "Isle of Man Pound", symbol: "£", locale: "en-IM" },
  { code: "FOK", name: "Faroese Krone", symbol: "kr", locale: "fo-FO" },
  { code: "GIP", name: "Gibraltar Pound", symbol: "£", locale: "en-GI" },
  { code: "FKP", name: "Falkland Islands Pound", symbol: "£", locale: "en-FK" },
  { code: "SHP", name: "Saint Helena Pound", symbol: "£", locale: "en-SH" },
  { code: "KYD", name: "Cayman Islands Dollar", symbol: "KY$", locale: "en-KY" },
  { code: "BMD", name: "Bermudian Dollar", symbol: "BD$", locale: "en-BM" },
];

function findCurrency(code?: string): WorldCurrency {
  if (!code) return WORLD_CURRENCIES[0];
  return WORLD_CURRENCIES.find((c) => c.code === code) || WORLD_CURRENCIES[0];
}

function matchesCurrency(c: WorldCurrency, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    c.code.toLowerCase().includes(q) ||
    c.name.toLowerCase().includes(q) ||
    c.symbol.toLowerCase().includes(q) ||
    c.locale.toLowerCase().includes(q)
  );
}

function formatCurrencyValue(numeric: number, currencyCode: string, decimals: number): string {
  const currency = findCurrency(currencyCode);
  try {
    return numeric.toLocaleString(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  } catch {
    try {
      return numeric.toLocaleString("en-US", {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    } catch {
      return currency.symbol + numeric.toFixed(decimals);
    }
  }
}


const COMMON_WORDS = new Set(
  `
a able about above accept according account across act action active activity add address administration after again against age ago agree agreement ahead air all allow almost alone along already also although always am among amount an analysis and annual another answer any anyone anything appear application apply are area around as ask asset at available average away back balance bank base based be because become been before begin behavior behind being believe below benefit best better between big bill billion bit board body book both break bring budget business but buy by call can capital car care case cash cause cell center central certain change chart check child city claim class clear close cloud code column come company compare complete condition consider control cost could country create current customer cut data date day deal decide decision default delete department design detail develop development did different direct display do document does done down download drive during each early economic edit education effect employee end enough enter entry equal error especially estimate even every example exchange expense export fact factor fail family far feature field file filter final finance find first fixed follow following font for force form formula free freeze from full function future general get give global go goal good government graph great group grow half hand happen hard has have he head help here high history home hour how however human idea if image import in include income increase index industry information input insert interest international into investment invoice is issue it item its job join just keep key kind large last later law layout lead learn least left legal level line link list load local long look loss low made main make management many map market match may me mean measure member menu merge method might million mind minimum minute mode model month more move much multiple must name native navigation need net new next no normal not note now number object of off offer office old on once one online only open operation option or order organization other out output over own page panel paper part particular pass paste payment people percent performance period person place plan point policy position possible power present price print process product production program project property provide purchase put quality question range rate rather raw read real receive record red reduce reference replace report request required result return revenue review right rise risk role row rule run sale same save say screen search second section secure see select selection sell send server service set sheet should show simple since size small so software source specific spell spreadsheet staff standard start state statement status step still storage strategy strong style subject success such sum support system table target tax team technology term text than that the their them then there these they thing think this those through time title to today together tool top total toward transaction true turn type under unit update upload use user value version very view want way we week well were what when where whether which while who whole why width will with within without word work workflow world would write year yes you
`.split(/\s+/).filter(Boolean)
);

function createSheet(name = "Sheet 1"): WorkbookSheet {
  return {
    id: `sheet_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name,
    gridRows: DEFAULT_ROWS,
    gridCols: DEFAULT_COLS,
    cells: {},
    groups: [],
    hiddenRows: [],
    filters: {},
    colWidths: {},
    rowHeights: {},
    frozenRows: 0,
    frozenCols: 0,
    charts: [],
    conditionalRules: [],
    namedRanges: {},
  };
}

function colToLetter(col: number): string {
  let n = col + 1;
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function letterToCol(letters: string): number {
  let n = 0;
  for (let i = 0; i < letters.length; i++) n = n * 26 + (letters.charCodeAt(i) - 64);
  return n - 1;
}

function cellKey(row: number, col: number): string {
  return `${colToLetter(col)}${row + 1}`;
}

function parseKey(key: string): { row: number; col: number } | null {
  const m = /^([A-Za-z]+)(\d+)$/.exec(key.trim());
  if (!m) return null;
  return { row: parseInt(m[2], 10) - 1, col: letterToCol(m[1].toUpperCase()) };
}

function normalizeRange(range: string): { r1: number; c1: number; r2: number; c2: number } | null {
  const [a, b] = range.split(":").map((x) => x.trim().toUpperCase());
  const pa = parseKey(a);
  const pb = parseKey(b || a);
  if (!pa || !pb) return null;
  return {
    r1: Math.min(pa.row, pb.row),
    c1: Math.min(pa.col, pb.col),
    r2: Math.max(pa.row, pb.row),
    c2: Math.max(pa.col, pb.col),
  };
}

/* ============================================================================
 * Formula engine
 * ========================================================================== */

type TokenType = "num" | "str" | "ref" | "range" | "ident" | "op" | "lparen" | "rparen" | "comma" | "end";
interface Token {
  type: TokenType;
  value: string;
}

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '"') {
      let j = i + 1;
      let out = "";
      while (j < src.length && src[j] !== '"') out += src[j++];
      tokens.push({ type: "str", value: out });
      i = j + 1;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      let out = "";
      while (j < src.length && /[0-9.]/.test(src[j])) out += src[j++];
      tokens.push({ type: "num", value: out });
      i = j;
      continue;
    }
    if (/[A-Za-z]/.test(ch)) {
      let j = i;
      let out = "";
      while (j < src.length && /[A-Za-z0-9]/.test(src[j])) out += src[j++];
      if (src[j] === ":" && /^[A-Za-z]+\d+$/.test(out)) {
        let k = j + 1;
        let out2 = "";
        while (k < src.length && /[A-Za-z0-9]/.test(src[k])) out2 += src[k++];
        if (/^[A-Za-z]+\d+$/.test(out2)) {
          tokens.push({ type: "range", value: `${out.toUpperCase()}:${out2.toUpperCase()}` });
          i = k;
          continue;
        }
      }
      tokens.push(/^[A-Za-z]+\d+$/.test(out) ? { type: "ref", value: out.toUpperCase() } : { type: "ident", value: out.toUpperCase() });
      i = j;
      continue;
    }
    if (ch === "(") tokens.push({ type: "lparen", value: ch });
    else if (ch === ")") tokens.push({ type: "rparen", value: ch });
    else if (ch === ",") tokens.push({ type: "comma", value: ch });
    else if ("+-*/^&".includes(ch)) tokens.push({ type: "op", value: ch });
    else if (ch === "<" || ch === ">" || ch === "=") {
      let op = ch;
      if (src[i + 1] === "=" && (ch === "<" || ch === ">")) {
        op += "=";
        i++;
      } else if (ch === "<" && src[i + 1] === ">") {
        op = "<>";
        i++;
      }
      tokens.push({ type: "op", value: op });
    }
    i++;
  }
  tokens.push({ type: "end", value: "" });
  return tokens;
}

type Node =
  | { kind: "num"; value: number }
  | { kind: "str"; value: string }
  | { kind: "ref"; value: string }
  | { kind: "range"; value: string }
  | { kind: "call"; name: string; args: Node[] }
  | { kind: "bin"; op: string; left: Node; right: Node }
  | { kind: "neg"; node: Node };

class FormulaParser {
  tokens: Token[];
  pos = 0;
  constructor(src: string) {
    this.tokens = tokenize(src);
  }
  peek() {
    return this.tokens[this.pos];
  }
  next() {
    return this.tokens[this.pos++];
  }
  parse(): Node {
    return this.parseCompare();
  }
  parseCompare(): Node {
    let left = this.parseConcat();
    while (this.peek().type === "op" && ["<", ">", "<=", ">=", "=", "<>"].includes(this.peek().value)) {
      const op = this.next().value;
      left = { kind: "bin", op, left, right: this.parseConcat() };
    }
    return left;
  }
  parseConcat(): Node {
    let left = this.parseAdd();
    while (this.peek().type === "op" && this.peek().value === "&") {
      this.next();
      left = { kind: "bin", op: "&", left, right: this.parseAdd() };
    }
    return left;
  }
  parseAdd(): Node {
    let left = this.parseMul();
    while (this.peek().type === "op" && ["+", "-"].includes(this.peek().value)) {
      const op = this.next().value;
      left = { kind: "bin", op, left, right: this.parseMul() };
    }
    return left;
  }
  parseMul(): Node {
    let left = this.parsePow();
    while (this.peek().type === "op" && ["*", "/"].includes(this.peek().value)) {
      const op = this.next().value;
      left = { kind: "bin", op, left, right: this.parsePow() };
    }
    return left;
  }
  parsePow(): Node {
    let left = this.parseUnary();
    while (this.peek().type === "op" && this.peek().value === "^") {
      this.next();
      left = { kind: "bin", op: "^", left, right: this.parseUnary() };
    }
    return left;
  }
  parseUnary(): Node {
    if (this.peek().type === "op" && this.peek().value === "-") {
      this.next();
      return { kind: "neg", node: this.parseUnary() };
    }
    return this.parsePrimary();
  }
  parsePrimary(): Node {
    const t = this.peek();
    if (t.type === "num") {
      this.next();
      return { kind: "num", value: parseFloat(t.value) };
    }
    if (t.type === "str") {
      this.next();
      return { kind: "str", value: t.value };
    }
    if (t.type === "range") {
      this.next();
      return { kind: "range", value: t.value };
    }
    if (t.type === "ref") {
      this.next();
      return { kind: "ref", value: t.value };
    }
    if (t.type === "ident") {
      this.next();
      const name = t.value;
      const args: Node[] = [];
      if (this.peek().type === "lparen") {
        this.next();
        if (this.peek().type !== "rparen") {
          args.push(this.parseCompare());
          while (this.peek().type === "comma") {
            this.next();
            args.push(this.parseCompare());
          }
        }
        if (this.peek().type === "rparen") this.next();
      }
      return { kind: "call", name, args };
    }
    if (t.type === "lparen") {
      this.next();
      const inner = this.parseCompare();
      if (this.peek().type === "rparen") this.next();
      return inner;
    }
    this.next();
    return { kind: "num", value: 0 };
  }
}

function toNumber(v: EvalResult): number {
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  const n = parseFloat(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function evalNode(node: Node, getCell: (key: string) => EvalResult, expandRange: (range: string) => EvalResult[]): EvalResult {
  switch (node.kind) {
    case "num":
      return node.value;
    case "str":
      return node.value;
    case "ref":
      return getCell(node.value);
    case "range": {
      const vals = expandRange(node.value);
      return vals.length ? vals[0] : 0;
    }
    case "neg":
      return -toNumber(evalNode(node.node, getCell, expandRange));
    case "bin": {
      const l = evalNode(node.left, getCell, expandRange);
      const r = evalNode(node.right, getCell, expandRange);
      if (node.op === "&") return `${l}${r}`;
      if (["<", ">", "<=", ">=", "=", "<>"].includes(node.op)) {
        const ln = toNumber(l);
        const rn = toNumber(r);
        if (node.op === "<") return ln < rn;
        if (node.op === ">") return ln > rn;
        if (node.op === "<=") return ln <= rn;
        if (node.op === ">=") return ln >= rn;
        if (node.op === "=") return ln === rn || String(l) === String(r);
        return !(ln === rn || String(l) === String(r));
      }
      const ln = toNumber(l);
      const rn = toNumber(r);
      if (node.op === "+") return ln + rn;
      if (node.op === "-") return ln - rn;
      if (node.op === "*") return ln * rn;
      if (node.op === "/") return rn === 0 ? "#DIV/0!" : ln / rn;
      if (node.op === "^") return Math.pow(ln, rn);
      return 0;
    }
    case "call": {
      const collect = () => {
        const out: EvalResult[] = [];
        node.args.forEach((a) => (a.kind === "range" ? out.push(...expandRange(a.value)) : out.push(evalNode(a, getCell, expandRange))));
        return out;
      };
      switch (node.name) {
        case "SUM":
          return collect().map(toNumber).reduce((a, b) => a + b, 0);
        case "AVERAGE": {
          const vals = collect().map(toNumber);
          return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        }
        case "MIN": {
          const vals = collect().map(toNumber);
          return vals.length ? Math.min(...vals) : 0;
        }
        case "MAX": {
          const vals = collect().map(toNumber);
          return vals.length ? Math.max(...vals) : 0;
        }
        case "COUNT":
          return collect().filter((v) => v !== "" && !Number.isNaN(toNumber(v))).length;
        case "IF": {
          const cond = evalNode(node.args[0], getCell, expandRange);
          const ok = typeof cond === "boolean" ? cond : toNumber(cond) !== 0;
          return ok ? (node.args[1] ? evalNode(node.args[1], getCell, expandRange) : "") : node.args[2] ? evalNode(node.args[2], getCell, expandRange) : "";
        }
        case "ROUND": {
          const val = toNumber(evalNode(node.args[0], getCell, expandRange));
          const digits = node.args[1] ? toNumber(evalNode(node.args[1], getCell, expandRange)) : 0;
          const factor = Math.pow(10, digits);
          return Math.round(val * factor) / factor;
        }
        case "ABS":
          return Math.abs(toNumber(evalNode(node.args[0], getCell, expandRange)));
        case "CONCAT":
          return collect().map(String).join("");
        case "AND":
          return collect().every((v) => (typeof v === "boolean" ? v : toNumber(v) !== 0));
        case "OR":
          return collect().some((v) => (typeof v === "boolean" ? v : toNumber(v) !== 0));
        case "TODAY":
          return new Date().toISOString().split("T")[0];
        case "NOW":
          return new Date().toLocaleString();
        case "UPPER":
          return String(evalNode(node.args[0], getCell, expandRange)).toUpperCase();
        case "LOWER":
          return String(evalNode(node.args[0], getCell, expandRange)).toLowerCase();
        case "LEN":
          return String(evalNode(node.args[0], getCell, expandRange)).length;
        case "COUNTA":
          return collect().filter((v) => v !== "").length;
        case "PRODUCT": {
          const vals = collect().map(toNumber);
          return vals.length ? vals.reduce((a, b) => a * b, 1) : 0;
        }
        case "STDEV": {
          const vals = collect().map(toNumber);
          if (vals.length < 2) return 0;
          const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
          const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (vals.length - 1);
          return Math.sqrt(variance);
        }
        case "STDEVP": {
          const vals = collect().map(toNumber);
          if (!vals.length) return 0;
          const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
          const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
          return Math.sqrt(variance);
        }
        case "VAR": {
          const vals = collect().map(toNumber);
          if (vals.length < 2) return 0;
          const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
          return vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (vals.length - 1);
        }
        case "VARP": {
          const vals = collect().map(toNumber);
          if (!vals.length) return 0;
          const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
          return vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
        }
        default:
          return "#NAME?";
      }
    }
    default:
      return 0;
  }
}

function evaluateFormula(formula: string, getCell: (key: string) => EvalResult, expandRange: (range: string) => EvalResult[]): EvalResult {
  try {
    return evalNode(new FormulaParser(formula).parse(), getCell, expandRange);
  } catch {
    return "#ERROR!";
  }
}

function createRefreshTick(): number {
  return Date.now();
}

function safeRefreshWorkbookState(snapshot: {
  workbookName: string;
  workbookId: string | null;
  activeSheetIndex: number;
  activeCell: string;
  selection: SelectionRange;
  pageSize: "A4" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
  rightSidebarOpen: boolean;
  rightSidebarUndocked: boolean;
  activeSidebarPanel: SidebarPanel;
  showGridLines: boolean;
  printPreview: boolean;
  splitWindow: boolean;
  showDrawFunctions: boolean;
  formulaExpanded: boolean;
  showStatusBar: boolean;
  showPredictiveAnalytics: boolean;
  predictivePeriods: number;
  showFindReplace: boolean;
  showFunctionWizard: boolean;
  showChartDialog: boolean;
  showPivotDialog: boolean;
  showSpellCheck: boolean;
  showValidity: boolean;
  showDataSource: boolean;
  showExportDialog: boolean;
  showConditionalFormatting: boolean;
  showNamedRanges: boolean;
  showConsolidate: boolean;
  showGallery: boolean;
  showGoalSeek: boolean;
  showTemplatesDialog: "apply" | "manage" | null;
}): typeof snapshot {
  return {
    ...snapshot,
  };
}

/* ============================================================================
 * Main component
 * ========================================================================== */

function shiftFormulaRefs(formula: string, dr: number, dc: number): string {
  const tokens = tokenize(formula);
  const shiftRef = (ref: string) => {
    const pos = parseKey(ref);
    if (!pos) return ref;
    const newRow = pos.row + dr;
    const newCol = pos.col + dc;
    if (newRow < 0 || newCol < 0) return ref;
    return cellKey(newRow, newCol);
  };
  let out = "";
  for (const t of tokens) {
    if (t.type === "end") continue;
    if (t.type === "ref") out += shiftRef(t.value);
    else if (t.type === "range") {
      const [a, b] = t.value.split(":");
      out += `${shiftRef(a)}:${shiftRef(b)}`;
    } else if (t.type === "str") out += `"${t.value}"`;
    else out += t.value;
  }
  return out;
}

function parseFillDate(v: string): Date | null {
  if (!v || !/[\/\-]/.test(v)) return null;
  const t = Date.parse(v);
  if (!Number.isFinite(t)) return null;
  return new Date(t);
}

type DigitScript = "latin" | "bengali" | "arabic" | "persian";

function detectDigitScript(value: string): DigitScript {
  if (/[০-৯]/.test(value)) return "bengali";
  if (/[٠-٩]/.test(value)) return "arabic";
  if (/[۰-۹]/.test(value)) return "persian";
  return "latin";
}

function normalizeLocalizedDigits(value: string): string {
  const bengali = "০১২৩৪৫৬৭৮৯";
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  const persian = "۰۱۲۳۴۵۶۷۸۹";

  return value.replace(/[0-9\-\u09E6-\u09EF]+/g, (ch) => {
    const b = bengali.indexOf(ch);
    if (b >= 0) return String(b);

    const a = arabic.indexOf(ch);
    if (a >= 0) return String(a);

    const p = persian.indexOf(ch);
    if (p >= 0) return String(p);

    return ch;
  });
}

function localizeDigits(value: string, script: DigitScript): string {
  const maps: Record<DigitScript, string> = {
    latin: "0123456789",
    bengali: "০১২৩৪৫৬৭৮۹".replace("۹", "৯"),
    arabic: "٠١٢٣٤٥٦٧٨٩",
    persian: "۰۱۲۳۴۵۶۷۸۹",
  };

  if (script === "latin") return value;

  const target = maps[script];

  return value.replace(/\d/g, (digit) => target[parseInt(digit, 10)]);
}

function parseSeriesNumber(value: string): number | null {
  const normalized = normalizeLocalizedDigits(value.trim()).replace(/,/g, "");

  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;

  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatSeriesNumber(value: number, sample: string): string {
  const script = detectDigitScript(sample);
  const normalizedSample = normalizeLocalizedDigits(sample.trim()).replace(/,/g, "");

  const decimalMatch = normalizedSample.match(/\.(\d+)$/);
  const decimals = decimalMatch ? decimalMatch[1].length : 0;

  let output =
    decimals > 0
      ? value.toFixed(decimals)
      : Number.isInteger(value)
        ? String(value)
        : String(Math.round(value * 1e10) / 1e10);

  /*
   * Preserve leading zero pattern:
   * 001 -> 002 -> 003
   */
  if (decimals === 0) {
    const sampleMatch = normalizedSample.match(/^(-?)(0+)(\d+)$/);
    if (sampleMatch) {
      const sign = output.startsWith("-") ? "-" : "";
      const absOutput = output.replace("-", "");
      const targetWidth = sampleMatch[2].length + sampleMatch[3].length;
      output = sign + absOutput.padStart(targetWidth, "0");
    }
  }

  return localizeDigits(output, script);
}

function extractTrailingNumber(
  value: string
): { prefix: string; num: number; digits: number; script: DigitScript } | null {
  const match = value.match(/(^.*?)(([0-9\-\u09E6-\u09EF]+))+$/);
  if (!match) return null;

  const script = detectDigitScript(match[2]);
  const normalizedNumber = normalizeLocalizedDigits(match[2]);
  const parsed = parseInt(normalizedNumber, 10);

  if (!Number.isFinite(parsed)) return null;

  return {
    prefix: match[1],
    num: parsed,
    digits: match[2].length,
    script,
  };
}

function formatTrailingNumber(
  prefix: string,
  num: number,
  digits: number,
  script: DigitScript
): string {
  const safeNum = Math.round(num);
  const output = String(safeNum).padStart(digits, "0");
  return `${prefix}${localizeDigits(output, script)}`;
}

function applyCustomNumberFormat(numeric: number, pattern: string): string {
  const hasPercent = pattern.includes("%");
  const hasGrouping = pattern.includes(",");
  const decimalMatch = pattern.match(/\.(0+)/);
  const decimals = decimalMatch ? decimalMatch[1].length : 0;
  const prefixMatch = pattern.match(/^([^\d#0]*)/);
  const prefix = prefixMatch ? prefixMatch[1] : "";
  const value = hasPercent ? numeric * 100 : numeric;
  const formatted = hasGrouping
    ? value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : value.toFixed(decimals);
  return `${prefix}${formatted}${hasPercent ? "%" : ""}`;
}

function evaluateConditionalRule(rule: ConditionalRule, rawValue: EvalResult): boolean {
  const numeric = typeof rawValue === "number" ? rawValue : parseFloat(String(rawValue));
  const target = parseFloat(rule.value);
  switch (rule.condition) {
    case "greater":
      return Number.isFinite(numeric) && Number.isFinite(target) && numeric > target;
    case "less":
      return Number.isFinite(numeric) && Number.isFinite(target) && numeric < target;
    case "equal":
      return Number.isFinite(numeric) && Number.isFinite(target) && numeric === target;
    case "between": {
      const t2 = parseFloat(rule.value2 || "");
      return Number.isFinite(numeric) && Number.isFinite(target) && Number.isFinite(t2) && numeric >= Math.min(target, t2) && numeric <= Math.max(target, t2);
    }
    case "textContains":
      return String(rawValue).toLowerCase().includes(rule.value.toLowerCase());
    default:
      return false;
  }
}

/* ============================================================================
 * LibreOffice/Calc Style AutoFilter Engine
 * ========================================================================== */

type AutoFilterCondition =
  | "none"
  | "empty"
  | "notEmpty"
  | "top10"
  | "bottom10"
  | "standard";

type AutoFilterStandardOperator =
  | "contains"
  | "notContains"
  | "equals"
  | "notEquals"
  | "startsWith"
  | "endsWith"
  | "greaterThan"
  | "lessThan"
  | "greaterOrEqual"
  | "lessOrEqual";

interface AutoFilterState {
  version: 1;
  selectedValues: string[] | null;
  condition: AutoFilterCondition;
  standard: {
    operator: AutoFilterStandardOperator;
    value: string;
  };
  bgColor: string | null;
  fontColor: string | null;
}

interface AutoFilterOption {
  value: string;
  label: string;
  count: number;
}

interface AutoFilterColorOption {
  color: string;
  label: string;
  count: number;
}

const AUTO_FILTER_PREFIX = "__AWM_AUTOFILTER_V1__:";

function createEmptyAutoFilterState(): AutoFilterState {
  return {
    version: 1,
    selectedValues: null,
    condition: "none",
    standard: {
      operator: "contains",
      value: "",
    },
    bgColor: null,
    fontColor: null,
  };
}

function serializeAutoFilterState(state: AutoFilterState): string {
  return `${AUTO_FILTER_PREFIX}${JSON.stringify(state)}`;
}

function parseAutoFilterState(raw?: string): AutoFilterState {
  const empty = createEmptyAutoFilterState();
  if (!raw) return empty;

  if (raw.startsWith(AUTO_FILTER_PREFIX)) {
    try {
      const parsed = JSON.parse(raw.slice(AUTO_FILTER_PREFIX.length)) as Partial<AutoFilterState>;

      return {
        ...empty,
        ...parsed,
        version: 1,
        standard: {
          ...empty.standard,
          ...(parsed.standard || {}),
        },
      };
    } catch {
      return empty;
    }
  }

  /*
   * Backward compatibility:
   * পুরোনো prompt-based filter text থাকলে সেটিকে Standard Filter -> contains হিসেবে ধরা হবে।
   */
  return {
    ...empty,
    condition: "standard",
    standard: {
      operator: "contains",
      value: raw,
    },
  };
}

function normalizeFilterColor(color?: string | null): string {
  return (color || "").trim().toUpperCase();
}

function isAutoFilterActive(state: AutoFilterState): boolean {
  return (
    state.selectedValues !== null ||
    state.condition !== "none" ||
    !!state.bgColor ||
    !!state.fontColor
  );
}

function matchStandardAutoFilter(
  operator: AutoFilterStandardOperator,
  rawValue: EvalResult,
  displayValue: string,
  target: string
): boolean {
  const display = displayValue.toLowerCase();
  const needle = target.toLowerCase();

  const numeric =
    typeof rawValue === "number"
      ? rawValue
      : parseFloat(String(rawValue).replace(/,/g, ""));

  const targetNumeric = parseFloat(target.replace(/,/g, ""));

  switch (operator) {
    case "contains":
      return display.includes(needle);

    case "notContains":
      return !display.includes(needle);

    case "equals":
      return displayValue === target;

    case "notEquals":
      return displayValue !== target;

    case "startsWith":
      return display.startsWith(needle);

    case "endsWith":
      return display.endsWith(needle);

    case "greaterThan":
      return Number.isFinite(numeric) && Number.isFinite(targetNumeric) && numeric > targetNumeric;

    case "lessThan":
      return Number.isFinite(numeric) && Number.isFinite(targetNumeric) && numeric < targetNumeric;

    case "greaterOrEqual":
      return Number.isFinite(numeric) && Number.isFinite(targetNumeric) && numeric >= targetNumeric;

    case "lessOrEqual":
      return Number.isFinite(numeric) && Number.isFinite(targetNumeric) && numeric <= targetNumeric;

    default:
      return true;
  }
}

function computeSeriesValue(values: string[], overallIndex: number): string {
  const n = values.length;
  const trimmed = values.map((v) => v.trim());

  /*
   * 1) Date series
   * Example:
   * 2024-01-01 -> 2024-01-02 -> 2024-01-03
   */
  const asDates = trimmed.map((v) => parseFillDate(v));

  if (asDates.every((d) => d !== null)) {
    const dates = asDates as Date[];
    const dayMs = 24 * 60 * 60 * 1000;
    const step =
      n >= 2
        ? (dates[n - 1].getTime() - dates[0].getTime()) / dayMs / (n - 1)
        : 1;

    const value = new Date(dates[0].getTime() + step * overallIndex * dayMs);
    return value.toLocaleDateString("en-US");
  }

  /*
   * 2) Pure number series
   *
   * Single source:
   * 1 -> 2 -> 3
   * ১ -> ২ -> ৩
   * 001 -> 002 -> 003
   *
   * Multiple source:
   * 1, 3 -> 5, 7, 9
   * 10, 20 -> 30, 40
   */
  const asNums = trimmed.map((v) => parseSeriesNumber(v));

  if (asNums.every((v) => v !== null)) {
    const nums = asNums as number[];

    if (n === 1) {
      return formatSeriesNumber(nums[0] + overallIndex, trimmed[0]);
    }

    const step = (nums[n - 1] - nums[0]) / (n - 1);
    const nextValue = nums[0] + step * overallIndex;

    /*
     * Last selected item is used as formatting sample.
     * Example: 1.0, 1.5 -> 2.0
     */
    return formatSeriesNumber(nextValue, trimmed[n - 1]);
  }

  /*
   * 3) Text with trailing number
   *
   * Single:
   * Item 1 -> Item 2
   * INV-001 -> INV-002
   * আইটেম ১ -> আইটেম ২
   *
   * Multiple:
   * Item 1, Item 3 -> Item 5
   */
  const trailingNumbers = trimmed.map((v) => extractTrailingNumber(v));

  if (trailingNumbers.every((item) => item !== null)) {
    const items = trailingNumbers as NonNullable<ReturnType<typeof extractTrailingNumber>>[];

    const samePrefix = items.every((item) => item.prefix === items[0].prefix);

    if (samePrefix) {
      if (n === 1) {
        return formatTrailingNumber(
          items[0].prefix,
          items[0].num + overallIndex,
          items[0].digits,
          items[0].script
        );
      }

      const step = (items[n - 1].num - items[0].num) / (n - 1);
      const nextValue = items[0].num + step * overallIndex;

      return formatTrailingNumber(
        items[0].prefix,
        nextValue,
        items[n - 1].digits,
        items[n - 1].script
      );
    }
  }

  /*
   * 4) Fallback pattern repeat
   *
   * A, B -> A, B, A, B...
   */
  return values[((overallIndex % n) + n) % n];
}

/* ============================================================================
 * Predictive Analytics Engine — Frontend-only statistical forecasting
 * ========================================================================== */

interface PredictiveDataPoint {
  key: string;
  index: number;
  value: number;
}

interface PredictiveForecastPoint {
  period: number;
  value: number;
  low: number;
  high: number;
}

interface PredictiveAnomaly {
  key: string;
  value: number;
  zScore: number;
}

interface PredictiveAnalyticsResult {
  range: string;
  points: PredictiveDataPoint[];
  count: number;
  min: number;
  max: number;
  sum: number;
  average: number;
  slope: number;
  intercept: number;
  r2: number;
  trend: "up" | "down" | "flat";
  movingAverage: number;
  anomalies: PredictiveAnomaly[];
  forecast: PredictiveForecastPoint[];
  insight: string;
}

function roundPredictive(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function calculatePredictiveAnalytics(
  points: PredictiveDataPoint[],
  range: string,
  forecastPeriods: number
): PredictiveAnalyticsResult {
  const values = points.map((p) => p.value);
  const count = values.length;

  const sum = values.reduce((a, b) => a + b, 0);
  const average = sum / count;
  const min = Math.min(...values);
  const max = Math.max(...values);

  const xValues = values.map((_, i) => i + 1);
  const xMean = xValues.reduce((a, b) => a + b, 0) / count;
  const yMean = average;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < count; i++) {
    numerator += (xValues[i] - xMean) * (values[i] - yMean);
    denominator += Math.pow(xValues[i] - xMean, 2);
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;

  const predictedExisting = xValues.map((x) => intercept + slope * x);

  const ssTot = values.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
  const ssRes = values.reduce((acc, y, i) => acc + Math.pow(y - predictedExisting[i], 2), 0);
  const r2 = ssTot === 0 ? 1 : Math.max(0, Math.min(1, 1 - ssRes / ssTot));

  const residuals = values.map((y, i) => y - predictedExisting[i]);
  const residualMean = residuals.reduce((a, b) => a + b, 0) / count;
  const residualStd =
    count > 1
      ? Math.sqrt(
        residuals.reduce((acc, r) => acc + Math.pow(r - residualMean, 2), 0) /
        (count - 1)
      )
      : 0;

  const valueStd =
    count > 1
      ? Math.sqrt(
        values.reduce((acc, v) => acc + Math.pow(v - average, 2), 0) /
        (count - 1)
      )
      : 0;

  const anomalies: PredictiveAnomaly[] =
    valueStd === 0
      ? []
      : points
        .map((p) => ({
          key: p.key,
          value: p.value,
          zScore: (p.value - average) / valueStd,
        }))
        .filter((a) => Math.abs(a.zScore) >= 2)
        .map((a) => ({
          ...a,
          value: roundPredictive(a.value),
          zScore: roundPredictive(a.zScore),
        }));

  const movingWindow = Math.min(3, count);
  const movingAverage =
    values.slice(count - movingWindow).reduce((a, b) => a + b, 0) / movingWindow;

  const safePeriods = Math.max(1, Math.min(24, Math.floor(forecastPeriods || 5)));

  const confidencePadding =
    residualStd > 0
      ? residualStd * 1.96
      : Math.max(0.01, Math.abs(average) * 0.05);

  const forecast: PredictiveForecastPoint[] = Array.from(
    { length: safePeriods },
    (_, i) => {
      const x = count + i + 1;
      const value = intercept + slope * x;

      return {
        period: i + 1,
        value: roundPredictive(value),
        low: roundPredictive(value - confidencePadding),
        high: roundPredictive(value + confidencePadding),
      };
    }
  );

  const trend: PredictiveAnalyticsResult["trend"] =
    Math.abs(slope) < 0.000001 ? "flat" : slope > 0 ? "up" : "down";

  const insight =
    trend === "up"
      ? `The selected data shows an upward trend. Forecast confidence is ${(r2 * 100).toFixed(1)}%.`
      : trend === "down"
        ? `The selected data shows a downward trend. Forecast confidence is ${(r2 * 100).toFixed(1)}%.`
        : `The selected data is mostly stable. Forecast confidence is ${(r2 * 100).toFixed(1)}%.`;

  return {
    range,
    points,
    count,
    min: roundPredictive(min),
    max: roundPredictive(max),
    sum: roundPredictive(sum),
    average: roundPredictive(average),
    slope: roundPredictive(slope, 6),
    intercept: roundPredictive(intercept, 6),
    r2: roundPredictive(r2, 4),
    trend,
    movingAverage: roundPredictive(movingAverage),
    anomalies,
    forecast,
    insight,
  };
}


function PrintStyles({ pageSize, orientation }: { pageSize: "A4" | "Letter" | "Legal"; orientation: "portrait" | "landscape" }) {
  const dims = PAGE_SIZES[pageSize];
  const w = orientation === "landscape" ? dims.h : dims.w;
  const h = orientation === "landscape" ? dims.w : dims.h;
  return (
    <style>{`
      @media print {
        @page { size: ${w}mm ${h}mm; margin: 0; }
        html, body { height: auto !important; overflow: visible !important; }
        .no-print { display: none !important; }
        #awm-print-area {
          position: static !important;
          overflow: visible !important;
          width: 100% !important;
          height: auto !important;
        }
      }
    `}</style>
  );
}


export default function ExcelStudioPage() {
  const [appLocale, setAppLocale] = useState<AppLocale>("en");
  const [rtlEnabled, setRtlEnabled] = useState(false);
  const [showChartWizard, setShowChartWizard] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [workbookName, setWorkbookName] = useState("Untitled Workbook");
  const [workbookId, setWorkbookId] = useState<string | null>(null);
  const [sheets, setSheetsRaw] = useState<WorkbookSheet[]>([createSheet("Sheet 1")]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [pageSize, setPageSize] = useState<"A4" | "Letter" | "Legal">("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");

  const [activeCell, setActiveCell] = useState("A1");
  const [selection, setSelection] = useState<SelectionRange>({ r1: 0, c1: 0, r2: 0, c2: 0 });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [formulaBar, setFormulaBar] = useState("");
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  const [formatPainter, setFormatPainter] = useState<CellStyle | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [toast, setToast] = useState<string | null>(null);

  const [showFunctionWizard, setShowFunctionWizard] = useState(false);
  const [showGoalSeek, setShowGoalSeek] = useState(false);
  const [showConsolidate, setShowConsolidate] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showDataSource, setShowDataSource] = useState(false);
  const [showValidity, setShowValidity] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showChartDialog, setShowChartDialog] = useState(false);
  const [showPivotDialog, setShowPivotDialog] = useState(false);
  const [showSpellCheck, setShowSpellCheck] = useState(false);

  const [savedWorkbooks, setSavedWorkbooks] = useState<{ id: string; name: string; updatedAt: string }[]>([]);
  const [openToolbarMenu, setOpenToolbarMenu] = useState<"new" | "open" | "save" | null>(null);
  const [recentFiles, setRecentFiles] = useState<RecentFileEntry[]>([]);
  const [recentFilesModuleOnly, setRecentFilesModuleOnly] = useState(true);
  const [templates, setTemplates] = useState<WorkbookTemplate[]>([]);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState<"apply" | "manage" | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [validityInput, setValidityInput] = useState("");
  const [goalTargetCell, setGoalTargetCell] = useState("");
  const [goalValue, setGoalValue] = useState("");
  const [goalChangingCell, setGoalChangingCell] = useState("");
  const [consolidateRanges, setConsolidateRanges] = useState("");
  const [consolidateTarget, setConsolidateTarget] = useState("");
  const [dataSourceText, setDataSourceText] = useState("");

  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCase, setMatchCase] = useState(false);

  const [chartTitle, setChartTitle] = useState("Chart");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [chartRange, setChartRange] = useState("A1:B5");
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardType, setWizardType] = useState<ChartType>("column");
  const [wizardSubtitle, setWizardSubtitle] = useState("");
  const [wizardXAxisTitle, setWizardXAxisTitle] = useState("");
  const [wizardYAxisTitle, setWizardYAxisTitle] = useState("");
  const [wizardShowLegend, setWizardShowLegend] = useState(true);
  const [wizardLegendPosition, setWizardLegendPosition] = useState<"right" | "top" | "bottom" | "left" | "none">("right");
  const [wizard3D, setWizard3D] = useState(false);
  const [wizardRealistic, setWizardRealistic] = useState(false);
  const [wizardShape, setWizardShape] = useState<"cylinder" | "cone" | "pyramid">("cylinder");
  const [wizardSeries, setWizardSeries] = useState<ChartSeries[]>([
    { id: `s_${Date.now()}`, name: "Series 1", range: "" },
  ]);
  const [pivotRange, setPivotRange] = useState("A1:C10");
  const [pivotRowField, setPivotRowField] = useState("");
  const [pivotColumnField, setPivotColumnField] = useState("");
  const [pivotValueField, setPivotValueField] = useState("");
  const [pivotAggregate, setPivotAggregate] = useState<Aggregate>("SUM");
  const [pivotResult, setPivotResult] = useState<string[][]>([]);

  const [showGridLines, setShowGridLines] = useState(true);
  const [printPreview, setPrintPreview] = useState(false);
  const [showPageSetup, setShowPageSetup] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printMarginTop, setPrintMarginTop] = useState(20);
  const [printMarginBottom, setPrintMarginBottom] = useState(20);
  const [printMarginLeft, setPrintMarginLeft] = useState(15);
  const [printMarginRight, setPrintMarginRight] = useState(15);
  const [printScale, setPrintScale] = useState(100);
  const [printHeader, setPrintHeader] = useState("");
  const [printFooter, setPrintFooter] = useState("Page &P of &N");
  const [printArea, setPrintArea] = useState<string>("");
  const [showPageBreakPreview, setShowPageBreakPreview] = useState(false);
  const [splitWindow, setSplitWindow] = useState(false);
  const [showDrawFunctions, setShowDrawFunctions] = useState(false);
  const [formulaExpanded, setFormulaExpanded] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [rightSidebarUndocked, setRightSidebarUndocked] = useState(false);
  const [activeSidebarPanel, setActiveSidebarPanel] = useState<SidebarPanel>("properties");
  const [toolbarPulse, setToolbarPulse] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const isFilling = useRef(false);
  const fillBaseSelection = useRef<SelectionRange | null>(null);
  const [fillPreview, setFillPreview] = useState<SelectionRange | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: number; col: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<string, HTMLTableCellElement>>(new Map());
  const [showFormatCells, setShowFormatCells] = useState(false);
  const [wizardSelected, setWizardSelected] = useState<string | null>(null);
  const [showConditionalFormatting, setShowConditionalFormatting] = useState(false);
  const [cfRange, setCfRange] = useState("");
  const [cfCondition, setCfCondition] = useState<ConditionalRule["condition"]>("greater");
  const [cfValue, setCfValue] = useState("");
  const [cfValue2, setCfValue2] = useState("");
  const [cfColor, setCfColor] = useState("#FFEB9C");
  const [showNamedRanges, setShowNamedRanges] = useState(false);
  const [nrName, setNrName] = useState("");
  const [nrRange, setNrRange] = useState("");
  const [traceHighlight, setTraceHighlight] = useState<Set<string> | null>(null);
  const [viewport, setViewport] = useState({ scrollTop: 0, scrollLeft: 0, clientHeight: 800, clientWidth: 1200 });
  const scrollRafRef = useRef<number | null>(null);
  const [showAutoSumMenu, setShowAutoSumMenu] = useState(false);
  const autoSumMenuRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [darkMode, setDarkMode] = useState(false);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [showPredictiveAnalytics, setShowPredictiveAnalytics] = useState(false);
  const [predictivePeriods, setPredictivePeriods] = useState(5);
  const [predictiveResult, setPredictiveResult] = useState<PredictiveAnalyticsResult | null>(null);

  // Enterprise Menu State
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [focusedMenuItemIndex, setFocusedMenuItemIndex] = useState<number | null>(null);

  const sheet = sheets[activeSheetIndex] || sheets[0];

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const closeMenu = () => {
    setActiveMenuIndex(null);
    setFocusedMenuItemIndex(null);
  };

  // ---- Enterprise Undo / Redo History ----
  const undoStackRef = useRef<WorkbookSheet[][]>([]);
  const redoStackRef = useRef<WorkbookSheet[][]>([]);
  const HISTORY_LIMIT = 100;
  const [, setHistoryVersion] = useState(0);

  const setSheets = useCallback((updater: React.SetStateAction<WorkbookSheet[]>) => {
    setSheetsRaw((prev) => {
      const next =
        typeof updater === "function"
          ? (updater as (p: WorkbookSheet[]) => WorkbookSheet[])(prev)
          : updater;
      if (next !== prev) {
        undoStackRef.current.push(prev);
        if (undoStackRef.current.length > HISTORY_LIMIT) undoStackRef.current.shift();
        redoStackRef.current = [];
        setHistoryVersion((v) => v + 1);
      }
      return next;
    });
  }, []);

  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;

  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) {
      showToast("Nothing to undo.");
      return;
    }
    setSheetsRaw((current) => {
      const previous = undoStackRef.current.pop() as WorkbookSheet[];
      redoStackRef.current.push(current);
      return previous;
    });
    setHistoryVersion((v) => v + 1);
    showToast("Undo");
  }, [showToast]);

  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) {
      showToast("Nothing to redo.");
      return;
    }
    setSheetsRaw((current) => {
      const nextState = redoStackRef.current.pop() as WorkbookSheet[];
      undoStackRef.current.push(current);
      return nextState;
    });
    setHistoryVersion((v) => v + 1);
    showToast("Redo");
  }, [showToast]);

  const updateSheet = useCallback((patch: Partial<WorkbookSheet> | ((s: WorkbookSheet) => Partial<WorkbookSheet>)) => {
    setSheets((prev) =>
      prev.map((s, i) => {
        if (i !== activeSheetIndex) return s;
        const nextPatch = typeof patch === "function" ? patch(s) : patch;
        return { ...s, ...nextPatch };
      })
    );
  }, [activeSheetIndex]);

  const getRawValue = useCallback((key: string) => sheet.cells[key]?.value ?? "", [sheet.cells]);

  const getCellValue = useCallback(
    (key: string, visiting: Set<string> = new Set()): EvalResult => {
      const raw = sheet.cells[key]?.value ?? "";
      if (raw === "") return "";
      if (!raw.startsWith("=")) {
        const n = parseFloat(raw.replace(/,/g, ""));
        return Number.isFinite(n) ? n : raw;
      }
      if (visiting.has(key)) return "#CIRCULAR!";
      const nextVisiting = new Set(visiting);
      nextVisiting.add(key);
      const getCell = (ref: string) => getCellValue(ref, nextVisiting);
      const expandRange = (range: string) => {
        const nr = normalizeRange(range);
        if (!nr) return [];
        const out: EvalResult[] = [];
        for (let r = nr.r1; r <= nr.r2; r++) {
          for (let c = nr.c1; c <= nr.c2; c++) out.push(getCellValue(cellKey(r, c), nextVisiting));
        }
        return out;
      };
      return evaluateFormula(raw.slice(1), getCell, expandRange);
    },
    [sheet.cells]
  );

  const activePos = useMemo(() => parseKey(activeCell) || { row: 0, col: 0 }, [activeCell]);

  const selectionCells = useMemo(() => {
    const r1 = Math.min(selection.r1, selection.r2);
    const r2 = Math.max(selection.r1, selection.r2);
    const c1 = Math.min(selection.c1, selection.c2);
    const c2 = Math.max(selection.c1, selection.c2);
    const out: string[] = [];
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) out.push(cellKey(r, c));
    return out;
  }, [selection]);

  const hiddenRows = useMemo(() => new Set(sheet.hiddenRows), [sheet.hiddenRows]);
  const columns = useMemo(() => Array.from({ length: sheet.gridCols }, (_, i) => i), [sheet.gridCols]);


  const rowsArr = useMemo(() => Array.from({ length: sheet.gridRows }, (_, i) => i), [sheet.gridRows]);


  // ২০০ কলামের মধ্যে শুধু স্ক্রিনে দেখা যাচ্ছে এমন কলামগুলোই DOM-এ রেন্ডার হবে —
  // এটাই flicker/lag-এর মূল কারণ ঠিক করে (প্রতি রো-তে ২০০ সেলের বদলে ~৩০-৪০টা)
  const virtualizeCols = sheet.gridCols > 40;

  // প্রতিটা কলামের বাম-প্রান্তের cumulative (ক্রমযোজিত) পজিশন — colWidths/gridCols
  // বদলালে তবেই আবার হিসাব হবে, প্রতি স্ক্রলে না, তাই সস্তা
  const colOffsets = useMemo(() => {
    const offsets: number[] = new Array(sheet.gridCols + 1);
    offsets[0] = 0;
    for (let i = 0; i < sheet.gridCols; i++) {
      offsets[i + 1] = offsets[i] + (sheet.colWidths[i] || DEFAULT_COL_WIDTH);
    }
    return offsets;
  }, [sheet.gridCols, sheet.colWidths]);

  // scrollLeft অনুযায়ী কোন কলাম থেকে কোন কলাম পর্যন্ত ভিজিবল সেটা
  // বাইনারি সার্চ দিয়ে বের করা হচ্ছে (O(log n) — দ্রুত, স্ক্রলে lag করে না)
  const visibleColRange = useMemo(() => {
    if (!virtualizeCols) return { start: 0, end: sheet.gridCols - 1 };
    const BUFFER = 8; // স্ক্রলের সময় হালকা বাফার রাখা হলো যাতে ফাঁকা না দেখায়

    let lo = sheet.frozenCols, hi = sheet.gridCols - 1, startCol = sheet.frozenCols;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (colOffsets[mid] < viewport.scrollLeft) { startCol = mid; lo = mid + 1; }
      else hi = mid - 1;
    }

    const rightEdge = viewport.scrollLeft + viewport.clientWidth;
    lo = startCol; hi = sheet.gridCols - 1;
    let endCol = sheet.gridCols - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (colOffsets[mid] < rightEdge) { endCol = mid; lo = mid + 1; }
      else hi = mid - 1;
    }

    return {
      start: Math.max(sheet.frozenCols, startCol - BUFFER),
      end: Math.min(sheet.gridCols - 1, endCol + BUFFER),
    };
  }, [virtualizeCols, viewport.scrollLeft, viewport.clientWidth, colOffsets, sheet.gridCols, sheet.frozenCols]);
  const selectedRangeText = useMemo(() => {
    const r1 = Math.min(selection.r1, selection.r2);
    const r2 = Math.max(selection.r1, selection.r2);
    const c1 = Math.min(selection.c1, selection.c2);
    const c2 = Math.max(selection.c1, selection.c2);
    return `${cellKey(r1, c1)}:${cellKey(r2, c2)}`;
  }, [selection]);

  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [borderMenuOpen, setBorderMenuOpen] = useState(false);
  const borderMenuRef = useRef<HTMLDivElement>(null)

  const closeBorderMenu = () => setBorderMenuOpen(false);

  useEffect(() => {
    if (!borderMenuOpen) return;

    const onMouseDown = (e: MouseEvent) => {
      if (borderMenuRef.current && e.target instanceof Node && borderMenuRef.current.contains(e.target)) {
        return;
      }
      setBorderMenuOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [borderMenuOpen]);

  const [currencySearch, setCurrencySearch] = useState("");

  const [autoFilterEnabled, setAutoFilterEnabled] = useState(false);

  const [autoFilterMenu, setAutoFilterMenu] = useState<{
    col: number;
    x: number;
    y: number;
  } | null>(null);

  const [autoFilterDraft, setAutoFilterDraft] = useState<AutoFilterState | null>(null);
  const autoFilterMenuRef = useRef<HTMLDivElement>(null);

  const activeCellStyle = sheet.cells[activeCell]?.style || {};
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    if (!editingKey) return;
    const el = editorRef.current;
    if (!el) return;

    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }, [editingKey]);

  const isSelected = useCallback(
    (row: number, col: number) => {
      const r1 = Math.min(selection.r1, selection.r2);
      const r2 = Math.max(selection.r1, selection.r2);
      const c1 = Math.min(selection.c1, selection.c2);
      const c2 = Math.max(selection.c1, selection.c2);
      return row >= r1 && row <= r2 && col >= c1 && col <= c2;
    },
    [selection]
  );

  const formatDisplayValue = useCallback((rawValue: EvalResult, style?: CellStyle) => {
    if (rawValue === "") return "";
    if (typeof rawValue === "boolean") return rawValue ? "TRUE" : "FALSE";
    const numberFormat = style?.numberFormat || "general";
    const decimals = typeof style?.decimals === "number" ? style.decimals : 2;

    if (numberFormat === "text") return String(rawValue);

    if (numberFormat === "date") {
      const date = (rawValue as any) instanceof Date ? (rawValue as unknown as Date) : new Date(String(rawValue));
      if (!Number.isNaN(date.getTime())) return date.toLocaleDateString();
      return String(rawValue);
    }

    const numeric = typeof rawValue === "number" ? rawValue : parseFloat(String(rawValue).replace(/,/g, ""));
    if (Number.isFinite(numeric)) {
      if (numberFormat === "currency") {
        return formatCurrencyValue(numeric, style?.currencyCode || "USD", decimals);
      }
      if (numberFormat === "percentage") {
        return `${(numeric * 100).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
      }
      if (numberFormat === "number") {
        return numeric.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      }
      if (numberFormat === "scientific") {
        return numeric.toExponential(decimals);
      }
      if (numberFormat === "accounting") {
        const abs = Math.abs(numeric).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        return numeric === 0 ? "$ -" : numeric < 0 ? `(${abs})` : `${abs}`;
      }
      if (numberFormat === "custom" && style?.customFormat) {
        return applyCustomNumberFormat(numeric, style.customFormat);
      }
      return Number.isInteger(numeric) ? numeric.toLocaleString("en-US") : numeric.toFixed(Math.max(0, Math.min(decimals, 10)));
    }

    return String(rawValue);
  }, []);

  const getDisplayValue = useCallback(
    (key: string) => {
      const val = getCellValue(key);
      return formatDisplayValue(val, sheet.cells[key]?.style);
    },
    [getCellValue, formatDisplayValue, sheet.cells]
  );

  const setCellData = useCallback(
    (key: string, patch: Partial<CellData>) => {
      updateSheet((s) => ({
        cells: { ...s.cells, [key]: { ...(s.cells[key] || { value: "" }), ...patch } },
      }));
    },
    [updateSheet]
  );

  const setCellValue = useCallback(
    (key: string, value: string) => {
      updateSheet((s) => ({
        cells: { ...s.cells, [key]: { ...(s.cells[key] || { value: "" }), value } },
      }));
    },
    [updateSheet]
  );

  useEffect(() => {
    setFormulaBar(getRawValue(activeCell));
  }, [activeCell, getRawValue]);
  useEffect(() => {
    setFormulaBar(getRawValue(activeCell));
  }, [activeCell, getRawValue]);

  useEffect(() => {
    if (editingKey) return;
    const el = cellRefs.current.get(activeCell);
    if (el && document.activeElement !== el) {
      el.focus({ preventScroll: true });
    }
  }, [activeCell, editingKey]);
  useEffect(() => {
    if (!contextMenu) return;
    const handler = (e: MouseEvent) => {
      if (contextMenuRef.current && e.target instanceof Node && contextMenuRef.current.contains(e.target)) return;
      setContextMenu(null);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [contextMenu]);

  useEffect(() => {
    if (!showAutoSumMenu) return;
    const handler = (e: MouseEvent) => {
      if (autoSumMenuRef.current && e.target instanceof Node && autoSumMenuRef.current.contains(e.target)) return;
      setShowAutoSumMenu(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [showAutoSumMenu]);

  useEffect(() => {
    if (!autoFilterMenu) return;

    const handler = (e: MouseEvent) => {
      if (
        autoFilterMenuRef.current &&
        e.target instanceof Node &&
        autoFilterMenuRef.current.contains(e.target)
      ) {
        return;
      }

      setAutoFilterMenu(null);
      setAutoFilterDraft(null);
    };

    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [autoFilterMenu]);
  useEffect(() => {
    if (Object.keys(sheet.filters || {}).length > 0) {
      setAutoFilterEnabled(true);
    }
  }, [sheet.filters]);
const handleMouseDown = (row: number, col: number, e?: React.MouseEvent) => {
    // রাইট-ক্লিক (e.button === 2) হলে সিলেকশন পরিবর্তন করা যাবে না।
    // কারণ ব্রাউজারে রাইট-ক্লিকের সময় mousedown আগে ফায়ার হয়, তারপর
    // contextmenu ইভেন্ট। আগে থেকে একাধিক সেল সিলেক্ট করা থাকলে এই
    // চেক না থাকলে mousedown সেই সিলেকশনকে একটা মাত্র সেলে সংকুচিত করে
    // ফেলতো, ফলে রাইট-ক্লিক মেনুর "Copy" শুধু একটা সেল কপি করতো।
    // ইতিমধ্যে সিলেক্ট করা এলাকার বাইরে রাইট-ক্লিক করলে অবশ্য
    // onContextMenu হ্যান্ডলার ঠিকই নতুন সিলেকশন বসাবে।
    if (e?.button === 2) return;
    const key = cellKey(row, col);
    if (e?.shiftKey) {
      dragging.current = false;
      setSelection((prev) => ({ ...prev, r2: row, c2: col }));
      setActiveCell(key);
      setFormulaBar(getRawValue(key));
      return;
    }

    if (e?.shiftKey) {
      dragging.current = false;
      setSelection((prev) => ({ ...prev, r2: row, c2: col }));
      setActiveCell(key);
      setFormulaBar(getRawValue(key));
      return;
    }
    dragging.current = true;
    setActiveCell(key);
    setSelection({ r1: row, c1: col, r2: row, c2: col });
    setFormulaBar(getRawValue(key));
    if (formatPainter) {
      setCellData(key, { style: { ...formatPainter, wrap: true } });
      setFormatPainter(null);
      showToast("Formatting applied.");
    }
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isFilling.current) {
      dragFillTo(row, col);
      return;
    }
    if (dragging.current) setSelection((prev) => ({ ...prev, r2: row, c2: col }));
  };

  const selectEntireRow = useCallback((row: number) => {
    setActiveCell(cellKey(row, 0));
    setSelection({ r1: row, c1: 0, r2: row, c2: sheet.gridCols - 1 });
  }, [sheet.gridCols]);

  const selectEntireColumn = useCallback((col: number) => {
    setActiveCell(cellKey(0, col));
    setSelection({ r1: 0, c1: col, r2: sheet.gridRows - 1, c2: col });
  }, [sheet.gridRows]);

  const commitFill = useCallback((source: SelectionRange, target: SelectionRange) => {
    const sr1 = Math.min(source.r1, source.r2);
    const sr2 = Math.max(source.r1, source.r2);
    const sc1 = Math.min(source.c1, source.c2);
    const sc2 = Math.max(source.c1, source.c2);
    const tr2 = Math.max(target.r2, sr2);
    const tc2 = Math.max(target.c2, sc2);
    const fillingDown = tr2 > sr2;
    const fillingRight = !fillingDown && tc2 > sc2;
    if (!fillingDown && !fillingRight) return;

    updateSheet((s) => {
      const nextCells = { ...s.cells };
      if (fillingDown) {
        const rows: number[] = [];
        for (let r = sr1; r <= sr2; r++) rows.push(r);
        const n = rows.length;
        for (let c = sc1; c <= sc2; c++) {
          const values = rows.map((r) => s.cells[cellKey(r, c)]?.value ?? "");
          for (let r = sr2 + 1; r <= tr2; r++) {
            const offset = r - sr2;
            const srcIdx = (offset - 1) % n;
            const srcRow = rows[srcIdx];
            const srcVal = values[srcIdx];
            const srcStyle = s.cells[cellKey(srcRow, c)]?.style;
            const newVal = srcVal.startsWith("=")
              ? "=" + shiftFormulaRefs(srcVal.slice(1), r - srcRow, 0)
              : computeSeriesValue(values, n - 1 + offset);
            nextCells[cellKey(r, c)] = { ...(nextCells[cellKey(r, c)] || { value: "" }), value: newVal, style: srcStyle };
          }
        }
      } else {
        const cols: number[] = [];
        for (let c = sc1; c <= sc2; c++) cols.push(c);
        const n = cols.length;
        for (let r = sr1; r <= sr2; r++) {
          const values = cols.map((c) => s.cells[cellKey(r, c)]?.value ?? "");
          for (let c = sc2 + 1; c <= tc2; c++) {
            const offset = c - sc2;
            const srcIdx = (offset - 1) % n;
            const srcCol = cols[srcIdx];
            const srcVal = values[srcIdx];
            const srcStyle = s.cells[cellKey(r, srcCol)]?.style;
            const newVal = srcVal.startsWith("=")
              ? "=" + shiftFormulaRefs(srcVal.slice(1), 0, c - srcCol)
              : computeSeriesValue(values, n - 1 + offset);
            nextCells[cellKey(r, c)] = { ...(nextCells[cellKey(r, c)] || { value: "" }), value: newVal, style: srcStyle };
          }
        }
      }
      return { cells: nextCells };
    });
    showToast("Fill applied.");
  }, [updateSheet, showToast]);

  const startFillDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isFilling.current = true;
    fillBaseSelection.current = { ...selection };
    setFillPreview({ ...selection });
  }, [selection]);

  const dragFillTo = useCallback((row: number, col: number) => {
    if (!isFilling.current || !fillBaseSelection.current) return;
    const base = fillBaseSelection.current;
    const br1 = Math.min(base.r1, base.r2);
    const br2 = Math.max(base.r1, base.r2);
    const bc1 = Math.min(base.c1, base.c2);
    const bc2 = Math.max(base.c1, base.c2);
    const dr = row - br2;
    const dc = col - bc2;
    if (Math.abs(dr) >= Math.abs(dc)) {
      setFillPreview({ r1: br1, c1: bc1, r2: Math.max(br2, row), c2: bc2 });
    } else {
      setFillPreview({ r1: br1, c1: bc1, r2: br2, c2: Math.max(bc2, col) });
    }
  }, []);

  const endFillDrag = useCallback(() => {
    if (!isFilling.current) return;
    isFilling.current = false;
    const base = fillBaseSelection.current;
    fillBaseSelection.current = null;
    setFillPreview((currentPreview) => {
      if (base && currentPreview) commitFill(base, currentPreview);
      return null;
    });
  }, [commitFill]);

  useEffect(() => {
    const up = () => {
      dragging.current = false;
      endFillDrag();
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, [endFillDrag]);




  const commitEdit = useCallback(
    (moveDir: "down" | "right" | "up" | "left" | "none" = "down") => {
      if (editingKey) setCellValue(editingKey, editValue);
      setEditingKey(null);
      // এডিট শেষ করে (commit করে) নির্দিষ্ট দিকের পাশের সেলে চলে যাওয়া হচ্ছে —
      // Excel-এর মতো: লেখা শেষ করে Arrow key চাপলেই পাশের সেলে চলে যাবে
      if (moveDir === "down") {
        const pos = parseKey(activeCell)!;
        const nr = Math.min(pos.row + 1, sheet.gridRows - 1);
        setActiveCell(cellKey(nr, pos.col));
        setSelection({ r1: nr, c1: pos.col, r2: nr, c2: pos.col });
      } else if (moveDir === "up") {
        const pos = parseKey(activeCell)!;
        const nr = Math.max(pos.row - 1, 0);
        setActiveCell(cellKey(nr, pos.col));
        setSelection({ r1: nr, c1: pos.col, r2: nr, c2: pos.col });
      } else if (moveDir === "right") {
        const pos = parseKey(activeCell)!;
        const nc = Math.min(pos.col + 1, sheet.gridCols - 1);
        setActiveCell(cellKey(pos.row, nc));
        setSelection({ r1: pos.row, c1: nc, r2: pos.row, c2: nc });
      } else if (moveDir === "left") {
        const pos = parseKey(activeCell)!;
        const nc = Math.max(pos.col - 1, 0);
        setActiveCell(cellKey(pos.row, nc));
        setSelection({ r1: pos.row, c1: nc, r2: pos.row, c2: nc });
      }
    },
    [editingKey, editValue, activeCell, sheet.gridRows, sheet.gridCols, setCellValue]
  );

  const startEditing = (key: string, initial?: string) => {
    setEditingKey(key);
    setEditValue(initial !== undefined ? initial : getRawValue(key));
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    const key = cellKey(row, col);
    if (editingKey === key) {
      if (e.key === "Enter") {
        e.preventDefault();
        commitEdit("down");
      } else if (e.key === "Tab") {
        e.preventDefault();
        commitEdit("right");
      } else if (e.key === "Escape") {
        setEditingKey(null);
      } else if (e.key.startsWith("Arrow")) {
        // এডিট করার সময় Arrow key চাপলে লেখাটা সেভ (commit) হয়ে যাবে,
        // তারপর সেই দিকের পাশের সেলে চলে যাবে — ঠিক Excel-এর মতো আচরণ
        e.preventDefault();
        if (e.key === "ArrowRight") commitEdit("right");
        else if (e.key === "ArrowLeft") commitEdit("left");
        else if (e.key === "ArrowDown") commitEdit("down");
        else if (e.key === "ArrowUp") commitEdit("up");
      }
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
      e.preventDefault();
      setShowFindReplace(true);
      return;
    }
    if (e.key === "Enter" || e.key === "F2") {
      e.preventDefault();
      startEditing(key);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      updateSheet((s) => {
        const next = { ...s.cells };
        selectionCells.forEach((k) => {
          next[k] = { ...(next[k] || { value: "" }), value: "" };
        });
        return { cells: next };
      });
      showToast("Selection cleared.");
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
      e.preventDefault();
      doCopy("copy");
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "x") {
      e.preventDefault();
      doCopy("cut");
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
      e.preventDefault();
      doPaste();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      startEditing(key, e.key);
    } else if (e.key.startsWith("Arrow")) {
      e.preventDefault();
      const nr = e.key === "ArrowDown" ? Math.min(row + 1, sheet.gridRows - 1) : e.key === "ArrowUp" ? Math.max(row - 1, 0) : row;
      const nc = e.key === "ArrowRight" ? Math.min(col + 1, sheet.gridCols - 1) : e.key === "ArrowLeft" ? Math.max(col - 1, 0) : col;
      setActiveCell(cellKey(nr, nc));
      setSelection({ r1: nr, c1: nc, r2: nr, c2: nc });
    }
  };

  const applyStyleToSelection = (patch: Partial<CellStyle>) => {
    updateSheet((s) => {
      const next = { ...s.cells };
      selectionCells.forEach((k) => {
        next[k] = {
          ...(next[k] || { value: "" }),
          style: { ...(next[k]?.style || {}), wrap: true, ...patch },
        };
      });
      return { cells: next };
    });
  };

  const toggleStyle = (field: "bold" | "italic" | "underline") => {
    const current = sheet.cells[activeCell]?.style?.[field];
    applyStyleToSelection({ [field]: !current } as Partial<CellStyle>);
    showToast(`${field.charAt(0).toUpperCase() + field.slice(1)} ${current ? "off" : "on"}.`);
  };

  const toggleBorderAll = () => {
    const current = sheet.cells[activeCell]?.style?.borders;
    const on = !(current && current.top && current.right && current.bottom && current.left);
    applyStyleToSelection({ borders: { top: on, right: on, bottom: on, left: on } });
    showToast(on ? "Borders applied." : "Borders removed.");
  };
  const applyBorderPreset = (preset: BorderPreset) => {
    const r1 = Math.min(selection.r1, selection.r2);
    const r2 = Math.max(selection.r1, selection.r2);
    const c1 = Math.min(selection.c1, selection.c2);
    const c2 = Math.max(selection.c1, selection.c2);

    updateSheet((s) => {
      const next = { ...s.cells };
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          const key = cellKey(r, c);
          const existing = next[key] || { value: "" };
          const existingStyle = existing.style || {};
          let borders: CellBorders | undefined;

          switch (preset) {
            case "none":
              borders = undefined;
              break;
            case "left":
              borders = { left: true };
              break;
            case "right":
              borders = { right: true };
              break;
            case "top":
              borders = { top: true };
              break;
            case "bottom":
              borders = { bottom: true };
              break;
            case "all":
              borders = { top: true, right: true, bottom: true, left: true };
              break;
            case "outside":
              borders = {
                top: r === r1,
                bottom: r === r2,
                left: c === c1,
                right: c === c2,
              };
              break;
            case "inside":
              borders = {
                top: r > r1,
                bottom: r < r2,
                left: c > c1,
                right: c < c2,
              };
              break;
          }

          next[key] = {
            ...existing,
            style: { ...existingStyle, wrap: true, borders },
          };
        }
      }
      return { cells: next };
    });

    showToast(preset === "none" ? "Borders removed." : "Borders applied.");
  };
  const grabFormat = () => {
    setFormatPainter(sheet.cells[activeCell]?.style ? { ...sheet.cells[activeCell]!.style } : { wrap: true });
    showToast("Format painter is active.");
  };

  const doCopy = (mode: ClipboardMode) => {
    const r1 = Math.min(selection.r1, selection.r2);
    const r2 = Math.max(selection.r1, selection.r2);
    const c1 = Math.min(selection.c1, selection.c2);
    const c2 = Math.max(selection.c1, selection.c2);
    const collected: ClipboardData["cells"] = [];
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        const k = cellKey(r, c);
        if (sheet.cells[k]) collected.push({ row: r - r1, col: c - c1, data: { ...sheet.cells[k] } });
      }
    }
    setClipboard({ mode, origin: { row: r1, col: c1 }, cells: collected, rows: r2 - r1 + 1, cols: c2 - c1 + 1 });
    showToast(mode === "cut" ? "Cut completed." : "Copy completed.");
  };

  // ব্রাউজারের OS ক্লিপবোর্ড থেকে টেক্সট পড়ে তা সেলে বসানো হচ্ছে।
  // Excel/Google Sheets থেকে কপি করা ডেটা সাধারণত Tab দিয়ে কলাম আর
  // নতুন লাইন দিয়ে সারি আলাদা করা থাকে (TSV ফরম্যাট) — এখানে সেটাই পার্স করা হলো
  const pasteExternalText = (text: string) => {
    const cleaned = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = cleaned.split("\n");
    // শেষে একটা খালি লাইন থাকলে (কপি করার সময় প্রায়ই থাকে) সেটা বাদ দেওয়া হলো
    const rows = lines[lines.length - 1] === "" ? lines.slice(0, -1) : lines;
    if (rows.length === 0) return;

    updateSheet((s) => {
      const next = { ...s.cells };
      let maxRow = s.gridRows;
      let maxCol = s.gridCols;

      rows.forEach((rowText, r) => {
        const cols = rowText.split("\t");
        cols.forEach((val, c) => {
          const targetRow = activePos.row + r;
          const targetCol = activePos.col + c;
          if (targetRow >= MAX_ROWS || targetCol >= MAX_COLS) return;
          next[cellKey(targetRow, targetCol)] = {
            ...(next[cellKey(targetRow, targetCol)] || { value: "" }),
            value: val,
          };
          maxRow = Math.max(maxRow, Math.min(targetRow + 1, MAX_ROWS));
          maxCol = Math.max(maxCol, Math.min(targetCol + 1, MAX_COLS));
        });
      });

      return { cells: next, gridRows: maxRow, gridCols: maxCol };
    });

    showToast("Pasted from clipboard.");
  };

  const doPaste = async () => {
    if (!clipboard) {
      // অ্যাপের ভেতরে (Ctrl+C/Copy বাটন দিয়ে) কিছু কপি করা নেই — তাই এবার
      // সরাসরি ব্রাউজারের সিস্টেম ক্লিপবোর্ড থেকে পড়ার চেষ্টা করা হচ্ছে।
      // এভাবে বাইরে থেকে (Excel, ওয়েবসাইট, নোটপ্যাড) কপি করা ডেটাও
      // রাইট-ক্লিক মেনুর "Paste" দিয়ে বসানো যাবে
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim() !== "") {
          pasteExternalText(text);
          return;
        }
      } catch {
        showToast("Clipboard access was blocked by the browser. Try Ctrl+V instead.");
        return;
      }
      showToast("Clipboard is empty.");
      return;
    }
    updateSheet((s) => {
      const next = { ...s.cells };
      clipboard.cells.forEach(({ row, col, data }) => {
        const targetRow = activePos.row + row;
        const targetCol = activePos.col + col;
        if (targetRow < s.gridRows && targetCol < s.gridCols) {
          next[cellKey(targetRow, targetCol)] = { ...data };
        }
      });
      if (clipboard.mode === "cut") {
        for (let r = 0; r < clipboard.rows; r++) {
          for (let c = 0; c < clipboard.cols; c++) {
            const source = cellKey(clipboard.origin.row + r, clipboard.origin.col + c);
            const target = cellKey(activePos.row + r, activePos.col + c);
            if (source !== target) delete next[source];
          }
        }
      }
      return { cells: next };
    });
    if (clipboard.mode === "cut") setClipboard(null);
    showToast("Paste completed.");
  };

  const addRow = () => {
    updateSheet((s) => ({ gridRows: Math.min(s.gridRows + 1, MAX_ROWS) }));
    showToast("Row inserted.");
  };

  const addCol = () => {
    updateSheet((s) => ({ gridCols: Math.min(s.gridCols + 1, MAX_COLS) }));
    showToast("Column inserted.");
  };

  const removeRow = () => {
    if (sheet.gridRows <= 1) {
      showToast("At least one row is required.");
      return;
    }
    updateSheet((s) => {
      const next = { ...s.cells };
      for (let c = 0; c < s.gridCols; c++) delete next[cellKey(s.gridRows - 1, c)];
      return { cells: next, gridRows: s.gridRows - 1 };
    });
    showToast("Row deleted.");
  };

  const removeCol = () => {
    if (sheet.gridCols <= 1) {
      showToast("At least one column is required.");
      return;
    }
    updateSheet((s) => {
      const next = { ...s.cells };
      for (let r = 0; r < s.gridRows; r++) delete next[cellKey(r, s.gridCols - 1)];
      return { cells: next, gridCols: s.gridCols - 1 };
    });
    showToast("Column deleted.");
  };

  const mergeSelection = () => {
    const r1 = Math.min(selection.r1, selection.r2);
    const r2 = Math.max(selection.r1, selection.r2);
    const c1 = Math.min(selection.c1, selection.c2);
    const c2 = Math.max(selection.c1, selection.c2);
    if (r1 === r2 && c1 === c2) {
      showToast("Select multiple cells to merge.");
      return;
    }
    const anchor = cellKey(r1, c1);
    updateSheet((s) => {
      const next = { ...s.cells };
      next[anchor] = { ...(next[anchor] || { value: "" }), rowSpan: r2 - r1 + 1, colSpan: c2 - c1 + 1 };
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          const k = cellKey(r, c);
          if (k !== anchor) next[k] = { ...(next[k] || { value: "" }), mergedInto: anchor };
        }
      }
      return { cells: next };
    });
    showToast("Cells merged.");
  };

  const unmergeSelection = () => {
    updateSheet((s) => {
      const next = { ...s.cells };
      selectionCells.forEach((k) => {
        if (next[k]) {
          const { rowSpan, colSpan, mergedInto, ...rest } = next[k];
          next[k] = rest;
        }
      });
      return { cells: next };
    });
    showToast("Cells unmerged.");
  };

  const onImagePicked = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCellData(activeCell, { image: reader.result as string });
      showToast("Image inserted.");
    };
    reader.readAsDataURL(file);
  };

  const insertHyperlink = () => {
    const url = window.prompt("Enter URL:", sheet.cells[activeCell]?.hyperlink || "https://");
    if (url) {
      setCellData(activeCell, { hyperlink: url });
      showToast("Hyperlink inserted.");
    }
  };

  const insertComment = () => {
    const text = window.prompt("Enter comment:", sheet.cells[activeCell]?.comment || "");
    if (text !== null) {
      setCellData(activeCell, { comment: text });
      showToast("Comment saved.");
    }
  };

  const clearFormattingOnSelection = useCallback(() => {
    updateSheet((s) => {
      const next = { ...s.cells };
      selectionCells.forEach((k) => {
        if (next[k]) next[k] = { ...next[k], style: undefined };
      });
      return { cells: next };
    });
    showToast("Direct formatting cleared.");
  }, [updateSheet, selectionCells, showToast]);

  const doPasteSpecial = useCallback((mode: "values" | "formatting" | "formulas") => {
    if (!clipboard) {
      showToast("Clipboard is empty.");
      return;
    }
    updateSheet((s) => {
      const next = { ...s.cells };
      clipboard.cells.forEach(({ row, col, data }) => {
        const targetRow = activePos.row + row;
        const targetCol = activePos.col + col;
        if (targetRow >= s.gridRows || targetCol >= s.gridCols) return;
        const key = cellKey(targetRow, targetCol);
        const existing = next[key] || { value: "" };
        if (mode === "formatting") {
          next[key] = { ...existing, style: data.style };
        } else if (mode === "formulas") {
          next[key] = { ...existing, value: data.value };
        } else {
          const originalKey = cellKey(clipboard.origin.row + row, clipboard.origin.col + col);
          const evaluated = getCellValue(originalKey);
          next[key] = { ...existing, value: typeof evaluated === "number" ? String(evaluated) : String(evaluated ?? "") };
        }
      });
      return { cells: next };
    });
    showToast(`Paste special (${mode}) applied.`);
  }, [clipboard, activePos, updateSheet, getCellValue, showToast]);

  const insertSparkline = useCallback(() => {
    const range = window.prompt("Enter data range for sparkline (e.g. A1:A6):", selectedRangeText);
    if (!range) return;
    setCellData(activeCell, { sparkline: range });
    showToast("Sparkline inserted.");
  }, [selectedRangeText, activeCell, setCellData, showToast]);

  const clearAllFilters = useCallback(() => {
    updateSheet({ filters: {}, hiddenRows: [] });
    showToast("All filters cleared.");
  }, [updateSheet, showToast]);

  const addConditionalRule = useCallback(() => {
    if (!cfRange.trim()) {
      showToast("Enter a cell range first.");
      return;
    }
    const rule: ConditionalRule = {
      id: `cf_${Date.now()}`,
      range: cfRange.trim().toUpperCase(),
      condition: cfCondition,
      value: cfValue,
      value2: cfValue2,
      bg: cfColor,
    };
    updateSheet((s) => ({ conditionalRules: [...(s.conditionalRules || []), rule] }));
    showToast("Conditional formatting rule added.");
  }, [cfRange, cfCondition, cfValue, cfValue2, cfColor, updateSheet, showToast]);

  const removeConditionalRule = useCallback((id: string) => {
    updateSheet((s) => ({ conditionalRules: (s.conditionalRules || []).filter((r) => r.id !== id) }));
  }, [updateSheet]);

  const addNamedRange = useCallback(() => {
    if (!nrName.trim() || !nrRange.trim()) {
      showToast("Enter both a name and a range.");
      return;
    }
    const key = nrName.trim().toUpperCase().replace(/\s+/g, "_");
    updateSheet((s) => ({ namedRanges: { ...(s.namedRanges || {}), [key]: nrRange.trim().toUpperCase() } }));
    setNrName("");
    setNrRange("");
    showToast("Named range saved.");
  }, [nrName, nrRange, updateSheet, showToast]);

  const removeNamedRange = useCallback((key: string) => {
    updateSheet((s) => {
      const next = { ...(s.namedRanges || {}) };
      delete next[key];
      return { namedRanges: next };
    });
  }, [updateSheet]);

  const goToNamedRange = useCallback(
    (key: string) => {
      const range = sheet.namedRanges?.[key];
      if (!range) return false;
      const nr = normalizeRange(range);
      if (!nr) return false;
      setSelection({ r1: nr.r1, c1: nr.c1, r2: nr.r2, c2: nr.c2 });
      setActiveCell(cellKey(nr.r1, nr.c1));
      return true;
    },
    [sheet.namedRanges]
  );

  const tracePrecedents = useCallback(() => {
    const raw = getRawValue(activeCell);
    if (!raw.startsWith("=")) {
      showToast("Active cell has no formula.");
      return;
    }
    const tokens = tokenize(raw.slice(1));
    const keys = new Set<string>();
    tokens.forEach((t) => {
      if (t.type === "ref") keys.add(t.value);
      else if (t.type === "range") {
        const nr = normalizeRange(t.value);
        if (nr) for (let r = nr.r1; r <= nr.r2; r++) for (let c = nr.c1; c <= nr.c2; c++) keys.add(cellKey(r, c));
      }
    });
    if (keys.size === 0) {
      showToast("No precedent cells found.");
      return;
    }
    setTraceHighlight(keys);
    showToast(`${keys.size} precedent cell(s) highlighted.`);
  }, [activeCell, getRawValue, showToast]);

  const traceDependents = useCallback(() => {
    const keys = new Set<string>();
    Object.entries(sheet.cells).forEach(([key, cellData]) => {
      const raw = cellData?.value || "";
      if (!raw.startsWith("=")) return;
      const tokens = tokenize(raw.slice(1));
      const references = new Set<string>();
      tokens.forEach((t) => {
        if (t.type === "ref") references.add(t.value);
        else if (t.type === "range") {
          const nr = normalizeRange(t.value);
          if (nr) for (let r = nr.r1; r <= nr.r2; r++) for (let c = nr.c1; c <= nr.c2; c++) references.add(cellKey(r, c));
        }
      });
      if (references.has(activeCell)) keys.add(key);
    });
    if (keys.size === 0) {
      showToast("No dependent cells found.");
      return;
    }
    setTraceHighlight(keys);
    showToast(`${keys.size} dependent cell(s) highlighted.`);
  }, [sheet.cells, activeCell, showToast]);

  const clearTrace = useCallback(() => setTraceHighlight(null), []);

  const zoomIn = useCallback(() => setZoomLevel((z) => Math.min(200, z + 10)), []);
  const zoomOut = useCallback(() => setZoomLevel((z) => Math.max(50, z - 10)), []);
  const resetZoom = useCallback(() => setZoomLevel(100), []);
  const toggleDarkMode = useCallback(() => {
    setDarkMode((v) => !v);
    showToast(darkMode ? "Light mode enabled." : "Dark mode enabled.");
  }, [darkMode, showToast]);

  const selectionStats = useMemo(() => {
    const nums = selectionCells.map((k) => getCellValue(k)).filter((v): v is number => typeof v === "number");
    const sum = nums.reduce((a, b) => a + b, 0);
    const avg = nums.length ? sum / nums.length : 0;
    return { count: selectionCells.length, numericCount: nums.length, sum, avg };
  }, [selectionCells, getCellValue]);

  const hasRowMerges = useMemo(() => Object.values(sheet.cells).some((c) => (c.rowSpan || 1) > 1), [sheet.cells]);
  const virtualizeRows = !hasRowMerges && sheet.gridRows > 150;
  const visibleRowRange = useMemo(() => {
    if (!virtualizeRows) return { start: 0, end: sheet.gridRows - 1 };
    const rowH = DEFAULT_ROW_HEIGHT;
    // বাফার ১০ থেকে বাড়িয়ে ১৫ করা হলো — স্ক্রল করার সময় আশেপাশের রো আগে থেকেই
    // রেন্ডার হয়ে থাকে, ফলে দ্রুত স্ক্রলে ফাঁকা মুহূর্ত/flicker কম হয়
    const start = Math.max(sheet.frozenRows, Math.floor(viewport.scrollTop / rowH) - 15);
    const end = Math.min(sheet.gridRows - 1, Math.ceil((viewport.scrollTop + viewport.clientHeight) / rowH) + 15);
    return { start, end };
  }, [virtualizeRows, viewport, sheet.gridRows, sheet.frozenRows]);
  const topSpacerHeight = virtualizeRows ? Math.max(0, visibleRowRange.start - sheet.frozenRows) * DEFAULT_ROW_HEIGHT : 0;
  const bottomSpacerHeight = virtualizeRows ? Math.max(0, sheet.gridRows - 1 - visibleRowRange.end) * DEFAULT_ROW_HEIGHT : 0;

  const handleExportCsv = useCallback(() => {
    const rows: string[] = [];
    for (let r = 0; r < sheet.gridRows; r++) {
      const row: string[] = [];
      for (let c = 0; c < sheet.gridCols; c++) {
        const display = getDisplayValue(cellKey(r, c));
        const needsQuotes = /[",\n]/.test(display);
        row.push(needsQuotes ? `"${display.replace(/"/g, '""')}"` : display);
      }
      rows.push(row.join(","));
    }
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(sheet.name || "sheet").replace(/[^a-z0-9_-]/gi, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported.");
  }, [sheet, getDisplayValue, showToast]);

  const insertSpecialCharacter = () => {
    const value = window.prompt("Insert special character:", "Ω");
    if (value) {
      const raw = getRawValue(activeCell);
      setCellValue(activeCell, `${raw}${value}`);
      showToast("Special character inserted.");
    }
  };

  const insertDate = () => {
    setCellValue(activeCell, new Date().toISOString().split("T")[0]);
    showToast("Date inserted.");
  };

  const insertTime = () => {
    setCellValue(activeCell, new Date().toLocaleTimeString());
    showToast("Time inserted.");
  };

  const sortColumn = useCallback(
    (col: number, direction: "asc" | "desc") => {
      const rowsData = Array.from({ length: sheet.gridRows }, (_, row) => ({
        row,
        val: getCellValue(cellKey(row, col)),
      }));

      const sorted = [...rowsData].sort((a, b) => {
        const an =
          typeof a.val === "number"
            ? a.val
            : parseFloat(String(a.val).replace(/,/g, ""));

        const bn =
          typeof b.val === "number"
            ? b.val
            : parseFloat(String(b.val).replace(/,/g, ""));

        const cmp =
          Number.isFinite(an) && Number.isFinite(bn)
            ? an - bn
            : String(a.val).localeCompare(String(b.val), undefined, {
              numeric: true,
              sensitivity: "base",
            });

        return direction === "asc" ? cmp : -cmp;
      });

      updateSheet((s) => {
        const snapshot = sorted.map(({ row }) =>
          Array.from(
            { length: s.gridCols },
            (_, c) => s.cells[cellKey(row, c)] || { value: "" }
          )
        );

        const next = { ...s.cells };

        snapshot.forEach((rowCells, r) => {
          rowCells.forEach((data, c) => {
            next[cellKey(r, c)] = data;
          });
        });

        return { cells: next };
      });

      setSortDir(direction === "asc" ? "desc" : "asc");

      showToast(
        `Sorted ${direction === "asc" ? "ascending" : "descending"} by column ${colToLetter(col)}.`
      );
    },
    [sheet.gridRows, getCellValue, updateSheet, showToast]
  );

  const sortByActiveColumn = useCallback(
    (direction?: "asc" | "desc") => {
      sortColumn(activePos.col, direction || sortDir);
    },
    [activePos.col, sortDir, sortColumn]
  );

  const sortColumnByColor = useCallback(
    (col: number, kind: "bg" | "font", color: string) => {
      const normalizedTarget = normalizeFilterColor(color);

      const rowsData = Array.from({ length: sheet.gridRows }, (_, row) => {
        const style = sheet.cells[cellKey(row, col)]?.style;

        const currentColor =
          kind === "bg"
            ? normalizeFilterColor(style?.bg || "#FFFFFF")
            : normalizeFilterColor(style?.color || "#000000");

        return {
          row,
          matched: currentColor === normalizedTarget,
        };
      });

      const sorted = [...rowsData].sort((a, b) => {
        if (a.matched === b.matched) return a.row - b.row;
        return a.matched ? -1 : 1;
      });

      updateSheet((s) => {
        const snapshot = sorted.map(({ row }) =>
          Array.from(
            { length: s.gridCols },
            (_, c) => s.cells[cellKey(row, c)] || { value: "" }
          )
        );

        const next = { ...s.cells };

        snapshot.forEach((rowCells, r) => {
          rowCells.forEach((data, c) => {
            next[cellKey(r, c)] = data;
          });
        });

        return { cells: next };
      });

      showToast(
        `Sorted by ${kind === "bg" ? "background" : "font"} color in column ${colToLetter(col)}.`
      );
    },
    [sheet.gridRows, sheet.cells, updateSheet, showToast]
  );

  const getColumnUniqueValues = useCallback(
    (col: number): AutoFilterOption[] => {
      const map = new Map<string, number>();

      for (let r = 0; r < sheet.gridRows; r++) {
        const value = getDisplayValue(cellKey(r, col));
        map.set(value, (map.get(value) || 0) + 1);
      }

      return Array.from(map.entries())
        .map(([value, count]) => ({
          value,
          label: value === "" ? "(Empty)" : value,
          count,
        }))
        .sort((a, b) =>
          a.label.localeCompare(b.label, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );
    },
    [sheet.gridRows, getDisplayValue]
  );

  const getColumnColorOptions = useCallback(
    (col: number, kind: "bg" | "font"): AutoFilterColorOption[] => {
      const map = new Map<string, number>();

      for (let r = 0; r < sheet.gridRows; r++) {
        const style = sheet.cells[cellKey(r, col)]?.style;

        const color =
          kind === "bg"
            ? normalizeFilterColor(style?.bg || "#FFFFFF")
            : normalizeFilterColor(style?.color || "#000000");

        map.set(color, (map.get(color) || 0) + 1);
      }

      return Array.from(map.entries()).map(([color, count]) => ({
        color,
        label:
          color === "#FFFFFF"
            ? kind === "bg"
              ? "Default / No Fill"
              : "#FFFFFF"
            : color === "#000000"
              ? kind === "font"
                ? "Default Font"
                : "#000000"
              : color,
        count,
      }));
    },
    [sheet.gridRows, sheet.cells]
  );

  const buildHiddenRowsFromFilterRecords = useCallback(
    (filters: Record<number, string>): number[] => {
      const parsedFilters = Object.entries(filters)
        .map(([col, raw]) => ({
          col: parseInt(col, 10),
          state: parseAutoFilterState(raw),
        }))
        .filter(({ col, state }) => Number.isFinite(col) && isAutoFilterActive(state));

      if (parsedFilters.length === 0) return [];

      const topBottomSets = new Map<string, Set<number>>();

      parsedFilters.forEach(({ col, state }) => {
        if (state.condition !== "top10" && state.condition !== "bottom10") return;

        const numericRows: { row: number; value: number }[] = [];

        for (let r = 0; r < sheet.gridRows; r++) {
          const raw = getCellValue(cellKey(r, col));

          const numeric =
            typeof raw === "number"
              ? raw
              : parseFloat(String(raw).replace(/,/g, ""));

          if (Number.isFinite(numeric)) {
            numericRows.push({ row: r, value: numeric });
          }
        }

        numericRows.sort((a, b) =>
          state.condition === "top10" ? b.value - a.value : a.value - b.value
        );

        topBottomSets.set(
          `${col}:${state.condition}`,
          new Set(numericRows.slice(0, 10).map((item) => item.row))
        );
      });

      const hidden: number[] = [];

      for (let r = 0; r < sheet.gridRows; r++) {
        let visible = true;

        for (const { col, state } of parsedFilters) {
          const key = cellKey(r, col);
          const display = getDisplayValue(key);
          const raw = getCellValue(key);
          const style = sheet.cells[key]?.style;

          /*
           * Checkbox/value filter
           */
          if (state.selectedValues !== null) {
            const selected = new Set(state.selectedValues);

            if (!selected.has(display)) {
              visible = false;
              break;
            }
          }

          /*
           * Background color filter
           */
          if (state.bgColor) {
            const bg = normalizeFilterColor(style?.bg || "#FFFFFF");

            if (bg !== normalizeFilterColor(state.bgColor)) {
              visible = false;
              break;
            }
          }

          /*
           * Font color filter
           */
          if (state.fontColor) {
            const font = normalizeFilterColor(style?.color || "#000000");

            if (font !== normalizeFilterColor(state.fontColor)) {
              visible = false;
              break;
            }
          }

          /*
           * Empty / Not Empty
           */
          if (state.condition === "empty" && display.trim() !== "") {
            visible = false;
            break;
          }

          if (state.condition === "notEmpty" && display.trim() === "") {
            visible = false;
            break;
          }

          /*
           * Top 10 / Bottom 10
           */
          if (state.condition === "top10" || state.condition === "bottom10") {
            const set = topBottomSets.get(`${col}:${state.condition}`);

            if (!set?.has(r)) {
              visible = false;
              break;
            }
          }

          /*
           * Standard Filter
           */
          if (state.condition === "standard") {
            const standardValue = state.standard.value.trim();

            if (
              standardValue &&
              !matchStandardAutoFilter(
                state.standard.operator,
                raw,
                display,
                standardValue
              )
            ) {
              visible = false;
              break;
            }
          }
        }

        if (!visible) hidden.push(r);
      }

      return hidden;
    },
    [sheet.gridRows, sheet.cells, getDisplayValue, getCellValue]
  );

  const openAutoFilterMenu = useCallback(
    (col: number, e?: React.MouseEvent) => {
      if (!autoFilterEnabled && !sheet.filters[col]) {
        return;
      }

      const options = getColumnUniqueValues(col);
      const current = parseAutoFilterState(sheet.filters[col]);

      setAutoFilterDraft({
        ...current,
        selectedValues: current.selectedValues ?? options.map((item) => item.value),
      });

      setAutoFilterMenu({
        col,
        x: e ? Math.min(e.clientX, window.innerWidth - 360) : 220,
        y: e ? Math.min(e.clientY + 8, window.innerHeight - 560) : 160,
      });
    },
    [autoFilterEnabled, getColumnUniqueValues, sheet.filters]
  );

  const applyAutoFilterDraft = useCallback(() => {
    if (!autoFilterMenu || !autoFilterDraft) return;

    const col = autoFilterMenu.col;

    const allValues = getColumnUniqueValues(col).map((item) => item.value);
    const selectedValues = autoFilterDraft.selectedValues ?? allValues;
    const selectedAll = selectedValues.length === allValues.length;

    const normalizedState: AutoFilterState = {
      ...autoFilterDraft,
      selectedValues: selectedAll ? null : selectedValues,
      bgColor: autoFilterDraft.bgColor || null,
      fontColor: autoFilterDraft.fontColor || null,
      standard: {
        operator: autoFilterDraft.standard.operator,
        value: autoFilterDraft.standard.value || "",
      },
    };

    const nextFilters = { ...sheet.filters };

    if (isAutoFilterActive(normalizedState)) {
      nextFilters[col] = serializeAutoFilterState(normalizedState);
    } else {
      delete nextFilters[col];
    }

    const hiddenRows = buildHiddenRowsFromFilterRecords(nextFilters);

    updateSheet({
      filters: nextFilters,
      hiddenRows,
    });

    setAutoFilterMenu(null);
    setAutoFilterDraft(null);

    showToast("AutoFilter applied.");
  }, [
    autoFilterMenu,
    autoFilterDraft,
    getColumnUniqueValues,
    sheet.filters,
    buildHiddenRowsFromFilterRecords,
    updateSheet,
    showToast,
  ]);

  const clearAutoFilterColumn = useCallback(() => {
    if (!autoFilterMenu) return;

    const nextFilters = { ...sheet.filters };
    delete nextFilters[autoFilterMenu.col];

    const hiddenRows = buildHiddenRowsFromFilterRecords(nextFilters);

    updateSheet({
      filters: nextFilters,
      hiddenRows,
    });

    setAutoFilterMenu(null);
    setAutoFilterDraft(null);

    showToast(`Filter cleared for column ${colToLetter(autoFilterMenu.col)}.`);
  }, [
    autoFilterMenu,
    sheet.filters,
    buildHiddenRowsFromFilterRecords,
    updateSheet,
    showToast,
  ]);

  const toggleAutoFilter = useCallback(() => {
    const hasActiveFilters = Object.keys(sheet.filters || {}).length > 0;

    if (autoFilterEnabled || hasActiveFilters) {
      setAutoFilterEnabled(false);
      setAutoFilterMenu(null);
      setAutoFilterDraft(null);

      updateSheet({
        filters: {},
        hiddenRows: [],
      });

      showToast("AutoFilter turned off.");
      return;
    }

    setAutoFilterEnabled(true);
    showToast("AutoFilter turned on. Use the header dropdown arrows to filter.");
  }, [
    autoFilterEnabled,
    sheet.filters,
    updateSheet,
    showToast,
  ]);


  const groupSelection = () => {
    const r1 = Math.min(selection.r1, selection.r2);
    const r2 = Math.max(selection.r1, selection.r2);
    if (r1 === r2) {
      showToast("Select multiple rows to group.");
      return;
    }
    updateSheet((s) => ({ groups: [...s.groups, { id: `g_${Date.now()}`, start: r1, end: r2, collapsed: false }] }));
    showToast("Rows grouped.");
  };

  const ungroupSelection = () => {
    const r1 = Math.min(selection.r1, selection.r2);
    const r2 = Math.max(selection.r1, selection.r2);
    updateSheet((s) => ({ groups: s.groups.filter((g) => !(g.start === r1 && g.end === r2)) }));
    showToast("Rows ungrouped.");
  };

  const toggleGroupCollapse = (id: string) => {
    updateSheet((s) => {
      const groups = s.groups.map((g) => (g.id === id ? { ...g, collapsed: !g.collapsed } : g));
      const group = groups.find((g) => g.id === id);
      const hidden = new Set(s.hiddenRows);
      if (group) {
        for (let r = group.start + 1; r <= group.end; r++) group.collapsed ? hidden.add(r) : hidden.delete(r);
      }
      return { groups, hiddenRows: Array.from(hidden) };
    });
  };

  const applyValidity = () => {
    const options = validityInput.split(",").map((s) => s.trim()).filter(Boolean);
    updateSheet((s) => {
      const next = { ...s.cells };
      selectionCells.forEach((k) => (next[k] = { ...(next[k] || { value: "" }), validation: options.length ? options : undefined }));
      return { cells: next };
    });
    setShowValidity(false);
    showToast("Data validation applied.");
  };

  const applyAggregateFunction = useCallback(
    (fn: Aggregate) => {
      let r = activePos.row - 1;
      const startRow = r;
      while (r >= 0 && getRawValue(cellKey(r, activePos.col)) !== "") r--;
      const firstDataRow = r + 1;
      const range = startRow < firstDataRow ? selectedRangeText : `${cellKey(firstDataRow, activePos.col)}:${cellKey(startRow, activePos.col)}`;
      setCellValue(activeCell, `=${fn}(${range})`);
      setShowAutoSumMenu(false);
      showToast(`${fn} applied.`);
    },
    [activePos, getRawValue, activeCell, selectedRangeText, setCellValue, showToast]
  );

  const autoSum = () => {
    let r = activePos.row - 1;
    const startRow = r;
    while (r >= 0 && getRawValue(cellKey(r, activePos.col)) !== "") r--;
    const firstDataRow = r + 1;
    if (startRow < firstDataRow) {
      setCellValue(activeCell, `=SUM(${selectedRangeText})`);
      showToast("AutoSum inserted for selected range.");
      return;
    }
    setCellValue(activeCell, `=SUM(${cellKey(firstDataRow, activePos.col)}:${cellKey(startRow, activePos.col)})`);
    showToast("AutoSum applied.");
  };

  const insertFunctionFromToolbar = () => {
    startEditing(activeCell, "=");
    setShowFunctionWizard(true);
    showToast("Function wizard opened.");
  };

  const runGoalSeek = () => {
    const targetKey = goalTargetCell.toUpperCase().trim();
    const changeKey = goalChangingCell.toUpperCase().trim();
    const desired = parseFloat(goalValue);
    if (!parseKey(targetKey) || !parseKey(changeKey) || Number.isNaN(desired)) {
      showToast("Enter valid cell references and target value.");
      return;
    }
    let bestX = toNumber(getRawValue(changeKey)) || 0;
    let lo = -1e7;
    let hi = 1e7;

    const estimateValue = (x: number) => {
      const tempCells = { ...sheet.cells, [changeKey]: { ...(sheet.cells[changeKey] || { value: "" }), value: String(x) } };
      const getTempCellValue = (key: string, visiting = new Set<string>()): EvalResult => {
        const raw = tempCells[key]?.value ?? "";
        if (!raw.startsWith("=")) {
          const n = parseFloat(raw.replace(/,/g, ""));
          return Number.isFinite(n) ? n : raw;
        }
        if (visiting.has(key)) return "#CIRCULAR!";
        const nv = new Set(visiting);
        nv.add(key);
        return evaluateFormula(
          raw.slice(1),
          (ref) => getTempCellValue(ref, nv),
          (range) => {
            const nr = normalizeRange(range);
            if (!nr) return [];
            const out: EvalResult[] = [];
            for (let rr = nr.r1; rr <= nr.r2; rr++) for (let cc = nr.c1; cc <= nr.c2; cc++) out.push(getTempCellValue(cellKey(rr, cc), nv));
            return out;
          }
        );
      };
      return toNumber(getTempCellValue(targetKey));
    };

    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      const val = estimateValue(mid);
      const valLo = estimateValue(lo);
      bestX = mid;
      if (Math.abs(val - desired) < 0.0001) break;
      if ((val - desired > 0 && valLo - desired > 0) || (val - desired < 0 && valLo - desired < 0)) lo = mid;
      else hi = mid;
    }
    setCellValue(changeKey, String(Math.round(bestX * 100) / 100));
    setShowGoalSeek(false);
    showToast("Goal seek completed.");
  };

  const runConsolidate = () => {
    const targetKey = consolidateTarget.toUpperCase().trim();
    if (!parseKey(targetKey)) {
      showToast("Target cell is invalid.");
      return;
    }
    let total = 0;
    consolidateRanges.split(",").map((s) => s.trim()).filter(Boolean).forEach((range) => {
      const nr = normalizeRange(range.includes(":") ? range : `${range}:${range}`);
      if (!nr) return;
      for (let r = nr.r1; r <= nr.r2; r++) for (let c = nr.c1; c <= nr.c2; c++) total += toNumber(getCellValue(cellKey(r, c)));
    });
    setCellValue(targetKey, String(total));
    setShowConsolidate(false);
    showToast("Consolidation completed.");
  };



  const importCsvText = (text: string) => {
    const parseCsv = (input: string) => {
      const rows: string[][] = [];
      let row: string[] = [];
      let cell = "";
      let inQuotes = false;

      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        const next = input[i + 1];

        if (ch === '"') {
          if (inQuotes && next === '"') {
            cell += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
          continue;
        }

        if (ch === "," && !inQuotes) {
          row.push(cell);
          cell = "";
          continue;
        }

        if ((ch === "\n" || ch === "\r") && !inQuotes) {
          if (ch === "\r" && next === "\n") i++;
          row.push(cell);
          if (row.length > 1 || row[0] !== "") rows.push(row);
          row = [];
          cell = "";
          continue;
        }

        cell += ch;
      }

      row.push(cell);
      if (row.length > 1 || row[0] !== "") rows.push(row);

      return rows;
    };

    const parsedRows = parseCsv(text);
    const neededRows = parsedRows.length;
    const neededCols = Math.max(1, ...parsedRows.map((r) => r.length));

    updateSheet((s) => {
      const next = { ...s.cells };

      parsedRows.forEach((row, r) =>
        row.forEach((val, c) => {
          next[cellKey(r, c)] = {
            value: val.trim(),
            style: { wrap: true },
          };
        })
      );

      return {
        cells: next,
        gridRows: Math.max(s.gridRows, Math.min(neededRows, MAX_ROWS)),
        gridCols: Math.max(s.gridCols, Math.min(neededCols, MAX_COLS)),
      };
    });

    setShowDataSource(false);
    showToast("CSV data imported.");
  };


  const recordRecentFile = useCallback((name: string, snapshot: WorkbookSnapshot, id?: string) => {
    setRecentFiles((prev) => {
      const entry: RecentFileEntry = {
        id: id || `local-${Date.now()}`,
        name,
        openedAt: new Date().toISOString(),
        snapshot,
      };
      const next = [entry, ...prev.filter((f) => f.name !== name)].slice(0, 8);
      saveRecentFilesToStorage(next);
      return next;
    });
  }, []);


  const handleNewFile = () => {
    if (!window.confirm("Create a new workbook? Unsaved changes will be lost.")) return;
    setWorkbookName("Untitled Workbook");
    setWorkbookId(null);
    setSheets([createSheet("Sheet 1")]);
    setActiveSheetIndex(0);
    setActiveCell("A1");
    setSelection({ r1: 0, c1: 0, r2: 0, c2: 0 });
    showToast("New workbook created.");
  };


  const handleUnsupportedNewDocument = useCallback((docType: string) => {
    showToast(`${docType} is not available in this Spreadsheet module. Only spreadsheet workbooks can be created here.`);
  }, [showToast]);


  const handleOpenRecentFile = useCallback((file: RecentFileEntry) => {
    const nextSheets = file.snapshot.sheets.length ? file.snapshot.sheets : [createSheet("Sheet 1")];
    setSheets(nextSheets);
    setActiveSheetIndex(Math.min(file.snapshot.activeSheetIndex || 0, Math.max(nextSheets.length - 1, 0)));
    setWorkbookName(file.snapshot.name || file.name);
    setWorkbookId(file.snapshot.id || null);
    setPageSize(file.snapshot.pageSize);
    setOrientation(file.snapshot.orientation);
    setActiveCell("A1");
    setSelection({ r1: 0, c1: 0, r2: 0, c2: 0 });
    showToast(`Reopened "${file.name}".`);
  }, [showToast]);


  const handleClearRecentFiles = useCallback(() => {
    setRecentFiles([]);
    saveRecentFilesToStorage([]);
    showToast("Recent files list cleared.");
  }, [showToast]);


  const handleToggleCurrentModuleOnly = useCallback(() => {
    setRecentFilesModuleOnly((v) => {
      const next = !v;
      showToast(next ? "Showing spreadsheet workbooks only." : "Showing files from all modules.");
      return next;
    });
  }, [showToast]);


  const handleApplyTemplate = useCallback((tpl: WorkbookTemplate) => {
    const nextSheets = tpl.snapshot.sheets.length ? tpl.snapshot.sheets.map((s) => ({ ...s })) : [createSheet("Sheet 1")];
    setSheets(nextSheets);
    setActiveSheetIndex(0);
    setWorkbookName(tpl.name);
    setWorkbookId(null);
    setPageSize(tpl.snapshot.pageSize);
    setOrientation(tpl.snapshot.orientation);
    setActiveCell("A1");
    setSelection({ r1: 0, c1: 0, r2: 0, c2: 0 });
    setShowTemplatesDialog(null);
    showToast(`New workbook created from "${tpl.name}".`);
  }, [showToast]);


  const handleDeleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTemplatesToStorage(next);
      return next;
    });
  }, []);


  const onFileSelected = async (file: File) => {
    const isCsv = file.name.toLowerCase().endsWith(".csv");

    if (isCsv) {
      importCsvText(await file.text());
      return;
    }

    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });

      const importedSheets: WorkbookSheet[] = wb.SheetNames.map((name: string) => {
        const ws = wb.Sheets[name];
        const json: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, blankrows: false });
        const sh = createSheet(name);

        sh.gridRows = Math.max(DEFAULT_ROWS, Math.min(json.length || DEFAULT_ROWS, MAX_ROWS));
        sh.gridCols = Math.max(DEFAULT_COLS, Math.min(Math.max(1, ...json.map((r) => r.length)), MAX_COLS));

        json.forEach((row, r) =>
          row.forEach((val, c) => {
            if (val !== undefined && val !== null && val !== "") {
              sh.cells[cellKey(r, c)] = { value: String(val), style: { wrap: true } };
            }
          })
        );

        return sh;
      });

      const nextSheets = importedSheets.length ? importedSheets : [createSheet("Sheet 1")];
      setSheets(nextSheets);
      setActiveSheetIndex(0);
      setWorkbookName(file.name.replace(/\.[^/.]+$/, ""));
      setActiveCell("A1");
      setSelection({ r1: 0, c1: 0, r2: 0, c2: 0 });
      showToast("Workbook loaded.");

      recordRecentFile(file.name.replace(/\.[^/.]+$/, ""), {
        name: file.name.replace(/\.[^/.]+$/, ""),
        pageSize,
        orientation,
        activeSheetIndex: 0,
        sheets: nextSheets,
      });
    } catch {
      showToast("Unable to read file. Install the xlsx package if needed.");
    }
  };


  const buildWorkbookSnapshot = (): WorkbookSnapshot => ({
    id: workbookId || undefined,
    name: workbookName,
    pageSize,
    orientation,
    activeSheetIndex,
    sheets,
  });


  const handleSaveCloud = async () => {
    let nameToUse = workbookName;

    if (!workbookId && (!nameToUse.trim() || nameToUse.trim() === "Untitled Workbook")) {
      const entered = window.prompt("Enter a name for this workbook:", "");
      if (entered === null) {
        showToast("Save cancelled. Please give the workbook a name.");
        return;
      }
      nameToUse = entered.trim() || "Untitled Workbook";
      setWorkbookName(nameToUse);
    }

    setSaveState("saving");
    try {
      const res = await fetch("/api/excel/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildWorkbookSnapshot(), name: nameToUse }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      if (data.id) setWorkbookId(data.id);
      setSaveState("saved");
      showToast("Saved to cloud.");
      recordRecentFile(nameToUse || "workbook", { ...buildWorkbookSnapshot(), name: nameToUse }, data.id || workbookId || undefined);
      window.setTimeout(() => setSaveState("idle"), 1800);
    } catch {
      setSaveState("error");
      showToast("Cloud save failed.");
      window.setTimeout(() => setSaveState("idle"), 2200);
    }
  };


  const handleSaveLocal = async () => {
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      sheets.forEach((sh) => {
        const aoa: string[][] = [];
        for (let r = 0; r < sh.gridRows; r++) {
          const row: string[] = [];
          for (let c = 0; c < sh.gridCols; c++) {
            const raw = sh.cells[cellKey(r, c)]?.value || "";
            row.push(raw.startsWith("=") ? raw : String(sh.cells[cellKey(r, c)]?.value || ""));
          }
          aoa.push(row);
        }
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), sh.name.slice(0, 31) || "Sheet");
      });

      const suggestedName = `${workbookName || "workbook"}.xlsx`;

      if ("showSaveFilePicker" in window) {
        // Native OS file picker: lets the user choose Desktop, Documents, or any folder.
        const arrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
        const handle = await (
          window as unknown as {
            showSaveFilePicker: (options: unknown) => Promise<{
              createWritable: () => Promise<{ write: (data: BlobPart) => Promise<void>; close: () => Promise<void> }>;
            }>;
          }
        ).showSaveFilePicker({
          suggestedName,
          types: [
            {
              description: "Excel Workbook",
              accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(new Blob([arrayBuffer]));
        await writable.close();
        showToast("Workbook saved.");
      } else {
        // Fallback for browsers without the File System Access API (e.g. Firefox, Safari):
        // downloads to the browser's default Downloads folder instead.
        XLSX.writeFile(wb, suggestedName);
        showToast("Workbook downloaded (your browser doesn't support choosing a folder).");
      }

      recordRecentFile(workbookName || "workbook", buildWorkbookSnapshot());
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        showToast("Save cancelled.");
        return;
      }
      showToast("Local export requires the xlsx package.");
    }
  };


  const handleSaveNative = async () => {
    try {
      const snapshot = JSON.stringify(buildWorkbookSnapshot(), null, 2);
      if ("showSaveFilePicker" in window) {
        const handle = await (window as unknown as { showSaveFilePicker: (options: unknown) => Promise<{ createWritable: () => Promise<{ write: (data: string) => Promise<void>; close: () => Promise<void> }> }> }).showSaveFilePicker({
          suggestedName: `${workbookName || "workbook"}.awm-workbook.json`,
          types: [{ description: "AWM Workbook", accept: { "application/json": [".json"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(snapshot);
        await writable.close();
      } else {
        const blob = new Blob([snapshot], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${workbookName || "workbook"}.awm-workbook.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      showToast("Native local save completed.");
      recordRecentFile(workbookName || "workbook", buildWorkbookSnapshot());
    } catch {
      showToast("Native local save was cancelled or failed.");
    }
  };

  const handleOpenRemoteFile = useCallback(async () => {
    const url = window.prompt("Enter the URL of the remote file to open:");
    if (!url) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Remote file request failed");
      const text = await res.text();
      if (url.toLowerCase().endsWith(".csv")) {
        importCsvText(text);
      } else {
        try {
          const parsed = JSON.parse(text) as WorkbookSnapshot;
          setSheets(parsed.sheets && parsed.sheets.length ? parsed.sheets : [createSheet("Sheet 1")]);
          setActiveSheetIndex(0);
          setWorkbookName(parsed.name || "Remote Workbook");
          setWorkbookId(parsed.id || null);
        } catch {
          importCsvText(text);
        }
      }
      showToast("Remote file opened.");
    } catch {
      showToast("Unable to open the remote file. Check the URL and try again.");
    }
  }, [importCsvText, showToast]);

  const handleSaveRemoteFile = useCallback(async () => {
    const url = window.prompt("Enter the URL to save this workbook to:");
    if (!url) return;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildWorkbookSnapshot()),
      });
      if (!res.ok) throw new Error("Remote save failed");
      showToast("Workbook saved to the remote location.");
    } catch {
      showToast("Unable to save to the remote location. Check the URL and try again.");
    }
  }, [buildWorkbookSnapshot, showToast]);

  const handleSaveAsTemplate = useCallback(() => {
    const name = window.prompt("Template name:", workbookName || "Untitled Template");
    if (!name) return;
    const entry: WorkbookTemplate = { id: `tpl-${Date.now()}`, name, createdAt: new Date().toISOString(), snapshot: buildWorkbookSnapshot() };
    setTemplates((prev) => {
      const next = [entry, ...prev.filter((t) => t.name !== name)];
      saveTemplatesToStorage(next);
      return next;
    });
    showToast(`Template "${name}" saved.`);
  }, [workbookName, buildWorkbookSnapshot, showToast]);

  const openLoadDialog = async () => {
    setShowLoadDialog(true);
    try {
      const res = await fetch("/api/excel/sheets");
      const data = await res.json();
      setSavedWorkbooks(data.sheets || data.workbooks || []);
    } catch {
      showToast("Unable to load workbook list.");
    }
  };

  const loadWorkbookById = async (id: string) => {
    try {
      const res = await fetch(`/api/excel/sheets?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      const doc = data.sheet || data.workbook;
      if (doc) {
        setWorkbookId(doc._id || doc.id || id);
        setWorkbookName(doc.name || "Untitled Workbook");
        setPageSize(doc.pageSize || "A4");
        setOrientation(doc.orientation || "landscape");
        setActiveSheetIndex(doc.activeSheetIndex || 0);
        if (Array.isArray(doc.sheets)) setSheets(doc.sheets);
        else {
          const sh = createSheet(doc.name || "Sheet 1");
          sh.gridRows = doc.gridRows || DEFAULT_ROWS;
          sh.gridCols = doc.gridCols || DEFAULT_COLS;
          sh.cells = doc.cells || {};
          sh.groups = doc.groups || [];
          setSheets([sh]);
        }
        showToast("Workbook loaded from cloud.");
      }
    } catch {
      showToast("Workbook load failed.");
    }
    setShowLoadDialog(false);
  };
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    pageSize: "A4",
    orientation: "landscape",
    marginTop: 10,
    marginRight: 10,
    marginBottom: 10,
    marginLeft: 10,
    fitToWidth: 1,
    fitToHeight: 0,
    centerHorizontally: true,
    centerVertically: false,
    printGridLines: false,
    printHeadings: false,
    printSelectionOnly: true,
  });

  const getPrintableRange = useCallback(() => {
    const selectedOnly = printSettings.printSelectionOnly && selection;
    const sourceCells = Object.entries(sheet.cells);

    if (selectedOnly) {
      const r1 = Math.min(selection.r1, selection.r2);
      const r2 = Math.max(selection.r1, selection.r2);
      const c1 = Math.min(selection.c1, selection.c2);
      const c2 = Math.max(selection.c1, selection.c2);
      return { r1, r2, c1, c2 };
    }

    let minR = Infinity;
    let minC = Infinity;
    let maxR = -1;
    let maxC = -1;

    for (const [key, cell] of sourceCells) {
      const [r, c] = key.split(":").map(Number);
      const value = String(cell?.value ?? "").trim();
      if (!value) continue;
      minR = Math.min(minR, r);
      minC = Math.min(minC, c);
      maxR = Math.max(maxR, r);
      maxC = Math.max(maxC, c);
    }

    if (maxR === -1) {
      return { r1: 0, r2: 0, c1: 0, c2: 0 };
    }

    return { r1: minR, r2: maxR, c1: minC, c2: maxC };
  }, [printSettings.printSelectionOnly, selection, sheet.cells]);

  const openPrintPreview = useCallback(() => {
    setShowPrintPreview(true);
  }, []);

  const closePrintPreview = useCallback(() => {
    setShowPrintPreview(false);
  }, []);

  const doNativePrint = useCallback(() => {
    setTimeout(() => window.print(), 100);
  }, []);



  const handleExportPdf = () => {
    showToast("Preparing PDF export.");
    window.setTimeout(() => window.print(), 80);
  };

  const togglePrintPreview = () => {
    setPrintPreview((v) => !v);
    showToast(printPreview ? "Print preview closed." : "Print preview enabled.");
  };

  const findMatches = useCallback(() => {
    if (!findText) return [];
    const needle = matchCase ? findText : findText.toLowerCase();
    return Object.entries(sheet.cells)
      .filter(([, data]) => {
        const hay = matchCase ? data.value : data.value.toLowerCase();
        return hay.includes(needle);
      })
      .map(([key]) => key)
      .sort((a, b) => {
        const pa = parseKey(a)!;
        const pb = parseKey(b)!;
        return pa.row - pb.row || pa.col - pb.col;
      });
  }, [findText, matchCase, sheet.cells]);

  const findNext = () => {
    const matches = findMatches();
    if (!matches.length) {
      showToast("No matches found.");
      return;
    }
    const currentIndex = matches.indexOf(activeCell);
    const next = matches[(currentIndex + 1) % matches.length];
    const pos = parseKey(next)!;
    setActiveCell(next);
    setSelection({ r1: pos.row, c1: pos.col, r2: pos.row, c2: pos.col });
    showToast(`Found ${next}.`);
  };

  const replaceCurrent = () => {
    if (!findText) return;
    const raw = getRawValue(activeCell);
    const flags = matchCase ? "g" : "gi";
    setCellValue(activeCell, raw.replace(new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags), replaceText));
    showToast("Current match replaced.");
  };

  const replaceAll = () => {
    if (!findText) return;
    const re = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), matchCase ? "g" : "gi");
    updateSheet((s) => {
      const next = { ...s.cells };
      Object.keys(next).forEach((k) => {
        if (re.test(next[k].value)) next[k] = { ...next[k], value: next[k].value.replace(re, replaceText) };
      });
      return { cells: next };
    });
    showToast("All matches replaced.");
  };

  const getChartData = (range: string) => {
    const nr = normalizeRange(range);
    if (!nr) return [];
    const out: { label: string; value: number }[] = [];
    for (let r = nr.r1; r <= nr.r2; r++) {
      const label = getDisplayValue(cellKey(r, nr.c1)) || `Row ${r + 1}`;
      const value = toNumber(getCellValue(cellKey(r, Math.min(nr.c1 + 1, nr.c2))));
      out.push({ label, value });
    }
    return out;
  };

  const openChartWizard = () => {
    setChartTitle("Chart");
    setChartRange(selectedRangeText);
    setWizardStep(1);
    setWizardType("column");
    setWizardSubtitle("");
    setWizardXAxisTitle("");
    setWizardYAxisTitle("");
    setWizardShowLegend(true);
    setWizardLegendPosition("right");
    setWizard3D(false);
    setWizardRealistic(false);
    setWizardShape("cylinder");
    setWizardSeries([{ id: `s_${Date.now()}`, name: "Series 1", range: selectedRangeText }]);
    setShowChartWizard(true);
  };

  const finishChartWizard = () => {
    updateSheet((s) => ({
      charts: [
        ...s.charts,
        {
          id: `chart_${Date.now()}`,
          title: chartTitle,
          type: wizardType,
          range: chartRange,
          subtitle: wizardSubtitle,
          xAxisTitle: wizardXAxisTitle,
          yAxisTitle: wizardYAxisTitle,
          showLegend: wizardShowLegend,
          legendPosition: wizardLegendPosition,
          is3D: wizard3D,
          realistic: wizardRealistic,
          shape: wizardShape,
          series: wizardSeries,
        },
      ],
    }));
    setShowChartWizard(false);
    showToast("Chart created.");
  };

  const pivotHeaderOptions = useMemo(() => {
    const nr = normalizeRange(pivotRange);
    if (!nr) return [] as string[];
    const headers: string[] = [];
    for (let c = nr.c1; c <= nr.c2; c++) {
      const label = getDisplayValue(cellKey(nr.r1, c));
      if (label) headers.push(label);
    }
    return headers;
  }, [pivotRange, getDisplayValue]);

  const runPivot = () => {
    const nr = normalizeRange(pivotRange);
    if (!nr) {
      showToast("Pivot range is invalid.");
      return;
    }
    const headers: string[] = [];
    for (let c = nr.c1; c <= nr.c2; c++) headers.push(String(getDisplayValue(cellKey(nr.r1, c))));
    const rowIndex = headers.indexOf(pivotRowField);
    const colIndex = pivotColumnField ? headers.indexOf(pivotColumnField) : -1;
    const valIndex = headers.indexOf(pivotValueField);
    if (rowIndex < 0 || valIndex < 0 || (pivotColumnField && colIndex < 0)) {
      showToast("Pivot fields must match the header row.");
      return;
    }
    const map = new Map<string, Map<string, number[]>>();
    const colKeys = new Set<string>();
    for (let r = nr.r1 + 1; r <= nr.r2; r++) {
      const rowKey = getDisplayValue(cellKey(r, nr.c1 + rowIndex)) || "(blank)";
      const colKey = colIndex >= 0 ? (getDisplayValue(cellKey(r, nr.c1 + colIndex)) || "(blank)") : "Total";
      const val = toNumber(getCellValue(cellKey(r, nr.c1 + valIndex)));
      colKeys.add(colKey);
      if (!map.has(rowKey)) map.set(rowKey, new Map());
      if (!map.get(rowKey)!.has(colKey)) map.get(rowKey)!.set(colKey, []);
      map.get(rowKey)!.get(colKey)!.push(val);
    }
    const cols = Array.from(colKeys).sort();
    const aggregate = (vals: number[]) => {
      if (!vals.length) return "";
      if (pivotAggregate === "COUNT") return String(vals.length);
      if (pivotAggregate === "AVERAGE") return String(Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100);
      if (pivotAggregate === "MIN") return String(Math.min(...vals));
      if (pivotAggregate === "MAX") return String(Math.max(...vals));
      return String(vals.reduce((a, b) => a + b, 0));
    };
    const result = [[pivotRowField, ...cols]];
    Array.from(map.keys()).sort().forEach((rk) => {
      result.push([rk, ...cols.map((ck) => aggregate(map.get(rk)!.get(ck) || []))]);
    });
    setPivotResult(result);
  };

  const insertPivotToSheet = () => {
    if (!pivotResult.length) return;
    updateSheet((s) => {
      const next = { ...s.cells };
      pivotResult.forEach((row, r) => row.forEach((v, c) => (next[cellKey(activePos.row + r, activePos.col + c)] = { value: v, style: { wrap: true, bold: r === 0 } })));
      return { cells: next };
    });
    setShowPivotDialog(false);
    showToast("Pivot table inserted.");
  };

  const spellIssues = useMemo(() => {
    const issues: { key: string; word: string }[] = [];
    Object.entries(sheet.cells).forEach(([key, data]) => {
      if (!data.value || data.value.startsWith("=")) return;
      const words = data.value.match(/[A-Za-z]{3,}/g) || [];
      words.forEach((w) => {
        const lower = w.toLowerCase();
        if (!COMMON_WORDS.has(lower) && !/^[A-Z][a-z]+$/.test(w) && !/^[A-Z]+$/.test(w)) issues.push({ key, word: w });
      });
    });
    return issues;
  }, [sheet.cells]);

  const resizeColumn = (col: number, startX: number) => {
    const startWidth = sheet.colWidths[col] || DEFAULT_COL_WIDTH;
    const move = (e: MouseEvent) => {
      updateSheet((s) => ({ colWidths: { ...s.colWidths, [col]: Math.max(60, startWidth + e.clientX - startX) } }));
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const resizeRow = (row: number, startY: number) => {
    const startHeight = sheet.rowHeights[row] || DEFAULT_ROW_HEIGHT;
    const move = (e: MouseEvent) => {
      updateSheet((s) => ({ rowHeights: { ...s.rowHeights, [row]: Math.max(24, startHeight + e.clientY - startY) } }));
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const addSheet = () => {
    setSheets((prev) => [...prev, createSheet(`Sheet ${prev.length + 1}`)]);
    setActiveSheetIndex(sheets.length);
    showToast("Sheet inserted.");
  };

  const renameSheet = () => {
    const name = window.prompt("Sheet name:", sheet.name);
    if (!name) return;
    updateSheet({ name });
    showToast("Sheet renamed.");
  };

  const duplicateSheet = () => {
    const copy: WorkbookSheet = JSON.parse(JSON.stringify(sheet));
    copy.id = `sheet_${Date.now()}`;
    copy.name = `${sheet.name} Copy`;
    setSheets((prev) => [...prev, copy]);
    setActiveSheetIndex(sheets.length);
    showToast("Sheet duplicated.");
  };

  const deleteSheet = () => {
    if (sheets.length <= 1) {
      showToast("At least one sheet is required.");
      return;
    }
    if (!window.confirm(`Delete ${sheet.name}?`)) return;
    setSheets((prev) => prev.filter((_, i) => i !== activeSheetIndex));
    setActiveSheetIndex((i) => Math.max(0, i - 1));
    showToast("Sheet deleted.");
  };

  const clearSelection = () => {
    updateSheet((s) => {
      const next = { ...s.cells };
      selectionCells.forEach((k) => {
        next[k] = { ...(next[k] || { value: "" }), value: "" };
      });
      return { cells: next };
    });
    showToast("Selection cleared.");
  };

  const selectAllCells = () => {
    setSelection({ r1: 0, c1: 0, r2: sheet.gridRows - 1, c2: sheet.gridCols - 1 });
    setActiveCell("A1");
    showToast("All cells selected.");
  };

  const toggleFreezeRowsAndColumns = () => {
    const shouldFreeze = sheet.frozenRows === 0 && sheet.frozenCols === 0;
    updateSheet({ frozenRows: shouldFreeze ? Math.max(1, activePos.row + 1) : 0, frozenCols: shouldFreeze ? Math.max(1, activePos.col + 1) : 0 });
    showToast(shouldFreeze ? "Rows and columns frozen." : "Freeze removed.");
  };

  const toggleSplitWindow = () => {
    setSplitWindow((v) => !v);
    showToast(splitWindow ? "Split window disabled." : "Split window enabled.");
  };

  const insertRowsAtSelection = () => {
    addRow();
  };

  const insertColumnsAtSelection = () => {
    addCol();
  };

  const applyNumberFormat = (format: NumberFormat) => {
    applyStyleToSelection({ numberFormat: format });
    showToast(`${format.charAt(0).toUpperCase() + format.slice(1)} format applied.`);
  };

  const applyCurrencyFormat = (currencyCode: string) => {
    applyStyleToSelection({ numberFormat: "currency", currencyCode });
    const c = findCurrency(currencyCode);
    showToast(`${c.name} (${c.code}) currency format applied.`);
    setCurrencyMenuOpen(false);
    setCurrencySearch("");
  };

  const adjustDecimals = (delta: number) => {
    const current = activeCellStyle.decimals ?? 2;
    applyStyleToSelection({ decimals: Math.max(0, Math.min(10, current + delta)), numberFormat: activeCellStyle.numberFormat || "number" });
    showToast(delta > 0 ? "Decimal places increased." : "Decimal places decreased.");
  };

  const adjustIndent = (delta: number) => {
    const current = activeCellStyle.indent ?? 0;
    applyStyleToSelection({ indent: Math.max(0, Math.min(12, current + delta)) });
    showToast(delta > 0 ? "Indent increased." : "Indent decreased.");
  };

  const collectPredictivePointsFromSelection = useCallback((): PredictiveDataPoint[] => {
    const r1 = Math.min(selection.r1, selection.r2);
    const r2 = Math.max(selection.r1, selection.r2);
    const c1 = Math.min(selection.c1, selection.c2);
    const c2 = Math.max(selection.c1, selection.c2);

    const points: PredictiveDataPoint[] = [];
    let index = 1;

    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        const key = cellKey(r, c);
        const raw = getCellValue(key);

        let numeric: number | null = null;

        if (typeof raw === "number" && Number.isFinite(raw)) {
          numeric = raw;
        } else if (typeof raw === "string" && raw.trim() && !raw.startsWith("#")) {
          const parsed = parseFloat(raw.replace(/,/g, ""));
          if (Number.isFinite(parsed)) numeric = parsed;
        }

        if (numeric !== null) {
          points.push({
            key,
            index,
            value: numeric,
          });
          index++;
        }
      }
    }

    return points;
  }, [selection, getCellValue]);

  const runPredictiveAnalytics = useCallback(() => {
    const points = collectPredictivePointsFromSelection();

    if (points.length < 2) {
      showToast("Select at least 2 numeric cells for Predictive Analytics.");
      return;
    }

    const result = calculatePredictiveAnalytics(
      points,
      selectedRangeText,
      predictivePeriods
    );

    setPredictiveResult(result);
    setShowPredictiveAnalytics(true);

    showToast("Predictive Analytics generated.");
  }, [
    collectPredictivePointsFromSelection,
    selectedRangeText,
    predictivePeriods,
    showToast,
  ]);

  const refreshPredictiveAnalytics = useCallback(() => {
    const points = collectPredictivePointsFromSelection();

    if (points.length < 2) {
      showToast("Select at least 2 numeric cells for Predictive Analytics.");
      return;
    }

    setPredictiveResult(
      calculatePredictiveAnalytics(points, selectedRangeText, predictivePeriods)
    );

    showToast("Predictive Analytics refreshed.");
  }, [
    collectPredictivePointsFromSelection,
    selectedRangeText,
    predictivePeriods,
    showToast,
  ]);

  const insertPredictiveForecastToSheet = useCallback(() => {
    if (!predictiveResult) {
      showToast("No forecast result to insert.");
      return;
    }

    const r1 = Math.min(selection.r1, selection.r2);
    const r2 = Math.max(selection.r1, selection.r2);
    const c1 = Math.min(selection.c1, selection.c2);

    const startRow = Math.min(r2 + 2, MAX_ROWS - 1);
    const labelCol = c1;
    const valueCol = Math.min(c1 + 1, MAX_COLS - 1);
    const lowCol = Math.min(c1 + 2, MAX_COLS - 1);
    const highCol = Math.min(c1 + 3, MAX_COLS - 1);

    const neededRows = startRow + predictiveResult.forecast.length + 1;
    const neededCols = Math.max(labelCol, valueCol, lowCol, highCol) + 1;

    updateSheet((s) => {
      const next = { ...s.cells };

      next[cellKey(startRow, labelCol)] = {
        value: "Forecast Period",
        style: { bold: true, bg: "#E5F1FB", color: "#106EBE", wrap: true },
      };
      next[cellKey(startRow, valueCol)] = {
        value: "Predicted",
        style: { bold: true, bg: "#E5F1FB", color: "#106EBE", wrap: true },
      };
      next[cellKey(startRow, lowCol)] = {
        value: "Low",
        style: { bold: true, bg: "#E5F1FB", color: "#106EBE", wrap: true },
      };
      next[cellKey(startRow, highCol)] = {
        value: "High",
        style: { bold: true, bg: "#E5F1FB", color: "#106EBE", wrap: true },
      };

      predictiveResult.forecast.forEach((item, i) => {
        const row = startRow + i + 1;

        next[cellKey(row, labelCol)] = {
          value: `Period ${item.period}`,
          style: { wrap: true },
        };
        next[cellKey(row, valueCol)] = {
          value: String(item.value),
          style: { wrap: true, numberFormat: "number", decimals: 2 },
        };
        next[cellKey(row, lowCol)] = {
          value: String(item.low),
          style: { wrap: true, numberFormat: "number", decimals: 2 },
        };
        next[cellKey(row, highCol)] = {
          value: String(item.high),
          style: { wrap: true, numberFormat: "number", decimals: 2 },
        };
      });

      return {
        cells: next,
        gridRows: Math.max(s.gridRows, Math.min(neededRows, MAX_ROWS)),
        gridCols: Math.max(s.gridCols, Math.min(neededCols, MAX_COLS)),
      };
    });

    showToast("Forecast inserted into sheet.");
  }, [predictiveResult, selection, updateSheet, showToast]);

  const handleRefreshPage = useCallback(() => {
    const nextSnapshot = safeRefreshWorkbookState({
      workbookName,
      workbookId,
      activeSheetIndex,
      activeCell,
      selection,
      pageSize,
      orientation,
      rightSidebarOpen,
      rightSidebarUndocked,
      activeSidebarPanel,
      showGridLines,
      printPreview,
      splitWindow,
      showDrawFunctions,
      formulaExpanded,
      showStatusBar,
      showPredictiveAnalytics,
      predictivePeriods,
      showFindReplace,
      showFunctionWizard,
      showChartDialog,
      showPivotDialog,
      showSpellCheck,
      showValidity,
      showDataSource,
      showExportDialog,
      showConditionalFormatting,
      showNamedRanges,
      showConsolidate,
      showGallery,
      showGoalSeek,
      showTemplatesDialog,
    });

    setWorkbookName(nextSnapshot.workbookName);
    setWorkbookId(nextSnapshot.workbookId);
    setActiveSheetIndex(nextSnapshot.activeSheetIndex);
    setActiveCell(nextSnapshot.activeCell);
    setSelection(nextSnapshot.selection);
    setPageSize(nextSnapshot.pageSize);
    setOrientation(nextSnapshot.orientation);
    setRightSidebarOpen(nextSnapshot.rightSidebarOpen);
    setRightSidebarUndocked(nextSnapshot.rightSidebarUndocked);
    setActiveSidebarPanel(nextSnapshot.activeSidebarPanel);
    setShowGridLines(nextSnapshot.showGridLines);
    setPrintPreview(nextSnapshot.printPreview);
    setSplitWindow(nextSnapshot.splitWindow);
    setShowDrawFunctions(nextSnapshot.showDrawFunctions);
    setFormulaExpanded(nextSnapshot.formulaExpanded);
    setShowStatusBar(nextSnapshot.showStatusBar);
    setShowPredictiveAnalytics(nextSnapshot.showPredictiveAnalytics);
    setPredictivePeriods(nextSnapshot.predictivePeriods);
    setShowFindReplace(nextSnapshot.showFindReplace);
    setShowFunctionWizard(nextSnapshot.showFunctionWizard);
    setShowChartDialog(nextSnapshot.showChartDialog);
    setShowPivotDialog(nextSnapshot.showPivotDialog);
    setShowSpellCheck(nextSnapshot.showSpellCheck);
    setShowValidity(nextSnapshot.showValidity);
    setShowDataSource(nextSnapshot.showDataSource);
    setShowExportDialog(nextSnapshot.showExportDialog);
    setShowConditionalFormatting(nextSnapshot.showConditionalFormatting);
    setShowNamedRanges(nextSnapshot.showNamedRanges);
    setShowConsolidate(nextSnapshot.showConsolidate);
    setShowGallery(nextSnapshot.showGallery);
    setShowGoalSeek(nextSnapshot.showGoalSeek);
    setShowTemplatesDialog(nextSnapshot.showTemplatesDialog);

    setRefreshTick(createRefreshTick());
    showToast("Page refreshed.");
  }, [
    workbookName,
    workbookId,
    activeSheetIndex,
    activeCell,
    selection,
    pageSize,
    orientation,
    rightSidebarOpen,
    rightSidebarUndocked,
    activeSidebarPanel,
    showGridLines,
    printPreview,
    splitWindow,
    showDrawFunctions,
    formulaExpanded,
    showStatusBar,
    showPredictiveAnalytics,
    predictivePeriods,
    showFindReplace,
    showFunctionWizard,
    showChartDialog,
    showPivotDialog,
    showSpellCheck,
    showValidity,
    showDataSource,
    showExportDialog,
    showConditionalFormatting,
    showNamedRanges,
    showConsolidate,
    showGallery,
    showGoalSeek,
    showTemplatesDialog,
    showToast,
  ]);

  const toggleTextDirection = () => {
    const currentDirection = activeCellStyle.textDirection ?? "rtl";

    const nextDirection: TextDirection =
      currentDirection === "rtl" ? "ltr" : "rtl";

    applyStyleToSelection({
      textDirection: nextDirection,
    });


    showToast(`Text direction set to ${nextDirection.toUpperCase()}.`);
  };

  const applySidebarStylePreset = (preset: Partial<CellStyle>, label: string) => {
    applyStyleToSelection(preset);
    showToast(`${label} style applied.`);
  };

  const handleToolbarAction = (label: string, callback: () => void) => {
    setToolbarPulse((v) => v + 1);
    callback();
  };

  const dispatchMenuAction = useCallback((action: string) => {
    switch (action) {
      case "FILE_NEW":
        handleNewFile();
        break;
      case "FILE_OPEN":
        fileInputRef.current?.click();
        break;
      case "FILE_SAVE":
      case "FILE_SAVE_REMOTE":
      case "FILE_SAVE_ALL":
        handleSaveCloud();
        break;
      case "FILE_EXPORT":
      case "FILE_SAVE_AS":
        handleSaveLocal();
        break;
      case "FILE_RELOAD":
        handleRefreshPage();
        break;
      case "FILE_SAVE_COPY":
        handleSaveNative();
        break;
      case "FILE_SAVE_AS_TEMPLATE":
        handleSaveAsTemplate();
        break;
      case "FILE_EXPORT_PDF":
        handleExportPdf();
        break;
      case "FILE_PRINT":
        setShowPageSetup(false);
        setShowPrintDialog(true);
        break;

      case "FILE_PRINT_PREVIEW":
        setPrintPreview(true);
        break;
      case "FILE_PAGE_STYLE":
      case "FORMAT_PAGE_STYLE":
        setShowPageSetup(true);
        break;


      case "FILE_CLOSE":
        showToast("Workbook close requested.");
        break;
      case "FILE_TEMPLATES":
        setShowTemplatesDialog("apply");
        break;
      case "EDIT_UNDO":
        undo();
        break;
      case "EDIT_REDO":
        redo();
        break;
      case "EDIT_REPEAT":
        showToast("Repeat last action is not implemented yet.");
        break;
      case "EDIT_CUT":
        doCopy("cut");
        break;
      case "EDIT_COPY":
        doCopy("copy");
        break;
      case "EDIT_PASTE":
      case "EDIT_PASTE_SPECIAL":
        doPaste();
        break;
      case "EDIT_SELECT_ALL":
        selectAllCells();
        break;
      case "EDIT_FIND":
      case "EDIT_FIND_REPLACE":
        setShowFindReplace(true);
        break;
      case "INSERT_NAMED_RANGE":
      case "SHEET_NAMED_RANGES":
        setShowNamedRanges(true);
        break;
      case "VIEW_GRID_LINES":
        setShowGridLines((v) => !v);
        showToast("Grid lines toggled.");
        break;
      case "VIEW_SIDEBAR":
        setRightSidebarOpen((v) => !v);
        showToast("Sidebar toggled.");
        break;
      case "VIEW_ZOOM":
        resetZoom();
        showToast("Zoom reset to 100%.");
        break;
      case "VIEW_STATUS_BAR":
        setShowStatusBar((v) => !v);
        showToast("Status bar toggled.");
        break;
      case "FORMAT_THEME":
      case "FORMAT_SPREADSHEET_THEME":
        toggleDarkMode();
        break;
      case "VIEW_GALLERY":
        setActiveSidebarPanel("gallery");
        setRightSidebarOpen(true);
        break;
      case "VIEW_STYLES":
        setActiveSidebarPanel("styles");
        setRightSidebarOpen(true);
        break;
      case "VIEW_NAVIGATOR":
        setActiveSidebarPanel("navigator");
        setRightSidebarOpen(true);
        break;
      case "VIEW_SHOW_FORMULAS":
      case "VIEW_FUNCTION_LIST":
        setActiveSidebarPanel("functions");
        setRightSidebarOpen(true);
        setShowFunctionWizard(true);
        break;
      case "VIEW_DATA_SOURCES":
        setShowDataSource(true);
        break;
      case "VIEW_SPLIT_WINDOW":
        toggleSplitWindow();
        break;
      case "VIEW_FREEZE_ROWS_COLS":
      case "VIEW_FREEZE_CELLS":
        toggleFreezeRowsAndColumns();
        break;
      case "INSERT_IMAGE":
        imageInputRef.current?.click();
        break;
      case "INSERT_CHART":
        openChartWizard();
        break;
      case "INSERT_PIVOT_TABLE":
        setShowPivotDialog(true);
        break;
      case "INSERT_FUNCTION":
        setShowFunctionWizard(true);
        break;
      case "INSERT_COMMENT":
        insertComment();
        break;
      case "INSERT_HYPERLINK":
        insertHyperlink();
        break;
      case "INSERT_SPECIAL_CHAR":
        insertSpecialCharacter();
        break;
      case "INSERT_DATE":
        insertDate();
        break;
      case "INSERT_TIME":
        insertTime();
        break;
      case "FORMAT_CLEAR_DIRECT":
        applyStyleToSelection({ bold: false, italic: false, underline: false, color: "#000000", bg: "#FFFFFF", align: "left", verticalAlign: "top", numberFormat: "general", indent: 0 });
        showToast("Formatting cleared.");
        break;
      case "FORMAT_CLONE":
        grabFormat();
        break;
      case "DATA_SORT":
      case "DATA_SORT_ASC":
        sortByActiveColumn("asc");
        break;
      case "DATA_SORT_DESC":
        sortByActiveColumn("desc");
        break;
      case "DATA_AUTOFILTER":
        toggleAutoFilter();
        break;
      case "DATA_PIVOT_TABLE":
        setShowPivotDialog(true);
        break;
      case "DATA_VALIDITY":
        setShowValidity(true);
        break;
      case "DATA_CONSOLIDATE":
        setShowConsolidate(true);
        break;
      case "DATA_GROUP_OUTLINE":
        groupSelection();
        break;
      case "TOOLS_SPELLING":
      case "TOOLS_AUTO_SPELL":
        setShowSpellCheck(true);
        break;
      case "TOOLS_GOAL_SEEK":
        setShowGoalSeek(true);
        break;
      case "SHEET_INSERT_ROWS":
        addRow();
        break;
      case "SHEET_INSERT_COLUMNS":
        addCol();
        break;
      case "SHEET_DELETE_ROWS":
        removeRow();
        break;
      case "SHEET_DELETE_COLUMNS":
        removeCol();
        break;
      case "SHEET_INSERT_SHEET":
      case "SHEET_INSERT_SHEET_END":
        addSheet();
        break;
      case "SHEET_RENAME":
        renameSheet();
        break;
      case "SHEET_DUPLICATE":
        duplicateSheet();
        break;
      case "SHEET_CLEAR_CELLS":
        clearSelection();
        break;
      default:
        showToast(`Action Triggered: ${action}`);
        break;
    }
    closeMenu();
  }, [
    activePos.col,
    activeSidebarPanel,
    activeCellStyle.decimals,
    activeCellStyle.numberFormat,
    findText,
    matchCase,
    replaceText,
    selectedRangeText,
    selectionCells,
    sheet,
    sheets.length,
    sortDir,
    workbookName,
    workbookId,
    pageSize,
    orientation,
    activeSheetIndex,
    sheets,
    clipboard,
    activePos.row,
    activeCell,
    formulaBar,
    splitWindow,
    printPreview,
    showGridLines,
    getCellValue,
    getDisplayValue,
    getRawValue,
    showToast,
    setCellValue,
    updateSheet,
  ]);
  useEffect(() => {
    setRecentFiles(loadRecentFilesFromStorage());
    setTemplates(loadTemplatesFromStorage());
  }, []);
  useEffect(() => {
    if (refreshTick === 0) return;
    if (showPredictiveAnalytics && predictiveResult) {
      setPredictiveResult((prev) => prev ? { ...prev } : prev);
    }
  }, [refreshTick, showPredictiveAnalytics, predictiveResult]);
  useEffect(() => {

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // যদি এই মুহূর্তে কোনো input/textarea/select-এ (যেমন সেল এডিটিং বক্স,
      // ফর্মুলা বার, বা কোনো ডায়ালগের ইনপুট ফিল্ড) ফোকাস থাকে, তাহলে
      // গ্লোবাল শর্টকাট (যেমন Backspace -> "Clear Cells", Ctrl+P -> Print)
      // এখানে চালু করা যাবে না। নাহলে ব্যবহারকারী টাইপ করার সময় Backspace
      // চাপলে এক অক্ষর মোছার বদলে পুরো সিলেকশনের মান খালি হয়ে যায়।
      const targetEl = e.target as HTMLElement;
      const isTypingInField =
        targetEl &&
        (targetEl.tagName === "INPUT" ||
          targetEl.tagName === "TEXTAREA" ||
          targetEl.tagName === "SELECT" ||
          targetEl.isContentEditable);
      if (isTypingInField) return;

      if (e.key === "Alt") {
        e.preventDefault();

        setActiveMenuIndex(0);
        setFocusedMenuItemIndex(null);
      }

      if (e.key === "Escape") {
        closeMenu();
      }

      if (activeMenuIndex === null) {
        const keys: string[] = [];
        if (e.ctrlKey || e.metaKey) keys.push("Ctrl");
        if (e.shiftKey) keys.push("Shift");
        if (e.altKey) keys.push("Alt");
        keys.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);

        const shortcutString = keys.join("+");

        EXCEL_MENU_DATA.forEach((category) => {
          category.items.forEach((item) => {
            if (item.shortcut && item.shortcut.toUpperCase() === shortcutString.toUpperCase()) {
              e.preventDefault();
              dispatchMenuAction(item.action);
            }
          });
        });
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as globalThis.Node)) {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuIndex, dispatchMenuAction]);

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, categoryIndex: number) => {
    const itemsCount = EXCEL_MENU_DATA[categoryIndex].items.length;

    switch (e.key) {
      case "ArrowRight":
        setActiveMenuIndex((categoryIndex + 1) % EXCEL_MENU_DATA.length);
        setFocusedMenuItemIndex(0);
        break;
      case "ArrowLeft":
        setActiveMenuIndex((categoryIndex - 1 + EXCEL_MENU_DATA.length) % EXCEL_MENU_DATA.length);
        setFocusedMenuItemIndex(0);
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedMenuItemIndex(prev => (prev === null || prev === itemsCount - 1) ? 0 : prev + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedMenuItemIndex(prev => (prev === null || prev === 0) ? itemsCount - 1 : prev - 1);
        break;
      case "Enter":
      case " ":
        if (focusedMenuItemIndex !== null) {
          e.preventDefault();
          dispatchMenuAction(EXCEL_MENU_DATA[categoryIndex].items[focusedMenuItemIndex].action);
        } else {
          setActiveMenuIndex(activeMenuIndex === categoryIndex ? null : categoryIndex);
        }
        break;
      case "Tab":
        closeMenu();
        break;
      default:
        break;
    }
  };

  const pageDims = PAGE_SIZES[pageSize] || PAGE_SIZES["A4"] || { w: 210, h: 297 };
  const pageWmm = orientation === "portrait" ? pageDims.w : pageDims.h;

  const leftOffset = (col: number) => ROW_HEADER_WIDTH + Array.from({ length: col }, (_, i) => sheet.colWidths[i] || DEFAULT_COL_WIDTH).reduce((a, b) => a + b, 0);
  const headerRowShadow = viewport.scrollTop > 0
    ? { boxShadow: "0 2px 4px rgba(0,0,0,0.12)" }
    : undefined;

  const headerColShadow = viewport.scrollLeft > 0
    ? { boxShadow: "2px 0 4px rgba(0,0,0,0.12)" }
    : undefined;
  const topOffset = (row: number) => HEADER_HEIGHT + Array.from({ length: row }, (_, i) => sheet.rowHeights[i] || DEFAULT_ROW_HEIGHT).reduce((a, b) => a + b, 0);

  const standardToolbarButtons: SpreadsheetToolbarButton[] = [
    {
      label: "New Document",
      icon: Icons.FilePlus2,
      onClick: () => handleToolbarAction("New Document", handleNewFile),
      dropdownItems: [
        { label: "Text Document", onClick: () => handleUnsupportedNewDocument("Text Document") },
        { label: "Spreadsheet", shortcut: "Ctrl+N", onClick: () => handleToolbarAction("New Document", handleNewFile) },
        { label: "Presentation", onClick: () => handleUnsupportedNewDocument("Presentation") },
        { label: "Drawing", onClick: () => handleUnsupportedNewDocument("Drawing") },
        { label: "Formula", onClick: () => handleUnsupportedNewDocument("Formula") },
        { label: "Database", onClick: () => handleUnsupportedNewDocument("Database") },
        { label: "HTML Document", onClick: () => handleUnsupportedNewDocument("HTML Document") },
        { label: "XML Form Document", onClick: () => handleUnsupportedNewDocument("XML Form Document") },
        { label: "Labels", onClick: () => handleUnsupportedNewDocument("Labels") },
        { label: "Business Cards", onClick: () => handleUnsupportedNewDocument("Business Cards") },
        { label: "Master Document", onClick: () => handleUnsupportedNewDocument("Master Document") },
        { label: "", isDivider: true },
        { label: "Templates...", shortcut: "Ctrl+Shift+N", onClick: () => setShowTemplatesDialog("apply") },

      ],
    },
    {
      label: "Open",
      icon: Icons.FolderOpen,
      onClick: () => handleToolbarAction("Open", () => fileInputRef.current?.click()),
      dropdownExtra: () => (
        <div>
          <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-[#8A8886]">Recent Files</div>
          {recentFiles.length === 0 ? (
            <div className="px-3 pb-2 text-xs text-[#8A8886]">No recent files</div>
          ) : (
            recentFiles.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleOpenRecentFile(f)}
                className="flex w-full items-center gap-2 truncate px-3 py-1.5 text-left text-[13px] text-[#323130] hover:bg-[#E5F1FB] hover:text-[#106EBE]"
                title={f.name}
              >
                <Icons.FileText size={13} className="shrink-0 text-[#8A8886]" />
                <span className="truncate">{f.name}</span>
              </button>
            ))
          )}
          <div className="my-1 h-px bg-[#E1DFDD]" />
        </div>
      ),
      dropdownItems: [
        { label: "Clear List", disabled: recentFiles.length === 0, onClick: handleClearRecentFiles },
        { label: "Current Module Only", checked: recentFilesModuleOnly, onClick: handleToggleCurrentModuleOnly },
        { label: "", isDivider: true },
        { label: "Edit Template...", onClick: () => setShowTemplatesDialog("manage") },
        { label: "Open Remote File...", onClick: handleOpenRemoteFile },
      ],
    },
    {
      label: "Save",
      icon: Icons.Save,
      onClick: () => handleToolbarAction("Save", handleSaveCloud),
      dropdownItems: [
        { label: "Save As...", shortcut: "Ctrl+Shift+S", onClick: () => handleToolbarAction("Save As", handleSaveLocal) },
        { label: "Export...", onClick: () => setShowExportDialog(true) },
        { label: "Save a Copy...", onClick: () => handleToolbarAction("Save a Copy", handleSaveNative) },
        { label: "Save as Template...", shortcut: "Shift+F11", onClick: handleSaveAsTemplate },
        { label: "Save Remote File...", onClick: handleSaveRemoteFile },
      ],
    },
    { label: "Export Directly as PDF", icon: Icons.FileDown, onClick: () => handleToolbarAction("Export Directly as PDF", handleExportPdf) },
    { label: "Refresh", icon: Icons.RefreshCw, onClick: () => handleToolbarAction("Refresh", handleRefreshPage), },
    { label: "Export CSV", icon: Icons.FileSpreadsheet, onClick: () => handleToolbarAction("Export CSV", handleExportCsv) },
    { label: "Print", icon: Icons.Printer, onClick: () => handleToolbarAction("Print", () => setShowPrintDialog(true)) },
    { label: "Toggle Print Preview", icon: Icons.ScanSearch, active: printPreview, kind: "toggle", onClick: () => handleToolbarAction("Toggle Print Preview", togglePrintPreview) },
    { label: "Cut", icon: Icons.Scissors, onClick: () => handleToolbarAction("Cut", () => doCopy("cut")) },
    { label: "Copy", icon: Icons.Copy, onClick: () => handleToolbarAction("Copy", () => doCopy("copy")) },
    { label: "Paste", icon: Icons.ClipboardPaste, onClick: () => handleToolbarAction("Paste", doPaste) },
    { label: "Merge Cells", icon: Icons.Merge, onClick: mergeSelection, },
    { label: "Unmerge Cells", icon: Icons.SplitSquareHorizontal, onClick: unmergeSelection, },
    { label: "Clone Formatting", icon: Icons.Paintbrush, active: !!formatPainter, kind: "toggle", onClick: () => handleToolbarAction("Clone Formatting", grabFormat) },
    { label: "Undo", icon: Icons.Undo2, onClick: () => handleToolbarAction("Undo", undo) },
    { label: "Redo", icon: Icons.Redo2, onClick: () => handleToolbarAction("Redo", redo) },
    { label: "Find and Replace", icon: Icons.Search, onClick: () => handleToolbarAction("Find and Replace", () => setShowFindReplace(true)) },
    { label: "Spelling", icon: Icons.SpellCheck, onClick: () => handleToolbarAction("Spelling", () => setShowSpellCheck(true)) },
    { label: "Toggle Grid Lines", icon: Icons.Grid3X3, active: showGridLines, kind: "toggle", onClick: () => handleToolbarAction("Toggle Grid Lines", () => { setShowGridLines(v => !v); showToast("Grid lines toggled."); }) },
    { label: "Insert Rows", icon: Icons.Rows3, onClick: () => handleToolbarAction("Insert Rows", insertRowsAtSelection) },
    { label: "Insert Columns", icon: Icons.Columns3, onClick: () => handleToolbarAction("Insert Columns", insertColumnsAtSelection) },
    { label: "Delete Rows", icon: Icons.PanelTopClose, onClick: () => handleToolbarAction("Delete Rows", removeRow) },
    { label: "Delete Columns", icon: Icons.PanelRightClose, onClick: () => handleToolbarAction("Delete Columns", removeCol) },
    { label: "Sort Ascending", icon: Icons.ArrowUpAZ, onClick: () => handleToolbarAction("Sort Ascending", () => sortByActiveColumn("asc")) },
    { label: "Sort Descending", icon: Icons.ArrowDownZA, onClick: () => handleToolbarAction("Sort Descending", () => sortByActiveColumn("desc")) },
    { label: "AutoFilter", icon: Icons.Filter, active: autoFilterEnabled || Object.keys(sheet.filters || {}).length > 0, kind: "toggle", onClick: () => handleToolbarAction("AutoFilter", toggleAutoFilter), },
    { label: "Insert Image", icon: Icons.ImagePlus, onClick: () => handleToolbarAction("Insert Image", () => imageInputRef.current?.click()) },
    { label: "Insert Chart", icon: Icons.ChartColumnBig, onClick: () => handleToolbarAction("Insert Chart", openChartWizard) },
    { label: "Insert Pivot Table", icon: Icons.TableProperties, onClick: () => handleToolbarAction("Insert Pivot Table", () => setShowPivotDialog(true)) },
    { label: "Insert Special Character", icon: Icons.Omega, onClick: () => handleToolbarAction("Insert Special Character", insertSpecialCharacter) },
    { label: "Insert Hyperlink", icon: Icons.Link, onClick: () => handleToolbarAction("Insert Hyperlink", insertHyperlink) },
    { label: "Insert Comment", icon: Icons.MessageSquarePlus, onClick: () => handleToolbarAction("Insert Comment", insertComment) },
    { label: "Show Draw Functions", icon: Icons.PenTool, active: showDrawFunctions, kind: "toggle", onClick: () => handleToolbarAction("Show Draw Functions", () => { setShowDrawFunctions(v => !v); showToast("Draw functions toggled."); }) },
    { label: "Freeze Rows and Columns", icon: Icons.Snowflake, active: sheet.frozenRows > 0 || sheet.frozenCols > 0, kind: "toggle", onClick: () => handleToolbarAction("Freeze Rows and Columns", toggleFreezeRowsAndColumns) },
    { label: "Split Window", icon: Icons.SplitSquareHorizontal, active: splitWindow, kind: "toggle", onClick: () => handleToolbarAction("Split Window", toggleSplitWindow) },
  ];

  const sidebarPanels: { key: SidebarPanel; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { key: "properties", label: "Properties", icon: Icons.SlidersHorizontal },
    { key: "styles", label: "Styles", icon: Icons.Palette },
    { key: "gallery", label: "Gallery", icon: Icons.Images },
    { key: "navigator", label: "Navigator", icon: Icons.Navigation },
    { key: "functions", label: "Functions", icon: Icons.FunctionSquare },
    { key: "settings", label: "Sidebar Settings", icon: Icons.Settings },
  ];

  return (
    <div
      dir="ltr"
      className="h-screen bg-[#FFFFFF] text-[#000000] font-sans flex flex-col overflow-hidden"
      style={darkMode ? { filter: "invert(1) hue-rotate(180deg)" } : undefined}
    >
      <style>{`
+       html, body {
+         height: 100%;
+         margin: 0;
+         padding: 0;
+         overflow: hidden;
+         overscroll-behavior: none;
+       }
        @media print {
          body * { visibility: hidden; }
          #awm-print-area, #awm-print-area * { visibility: visible; }
          #awm-print-area { position: absolute; left: 0; top: 0; width: ${pageWmm}mm; max-height: none !important; overflow: visible !important; }
          .awm-print-hide { display: none !important; }
          @page { size: ${pageSize} ${orientation}; margin: 0mm; }
        }
        @keyframes awmFadeIn {
          from { opacity: 0; transform: translateY(-2px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes awmSoftPulse {
          0% { box-shadow: 0 0 0 0 rgba(16,110,190,0.18); }
          100% { box-shadow: 0 0 0 10px rgba(16,110,190,0); }
        }
        .awm-premium-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
        .awm-premium-scrollbar::-webkit-scrollbar-track { background: #F3F2F1; }
        .awm-premium-scrollbar::-webkit-scrollbar-thumb { background: #C8C6C4; border-radius: 999px; border: 2px solid #F3F2F1; }
        .awm-premium-scrollbar::-webkit-scrollbar-thumb:hover { background: #A19F9D; }
      `}</style>

      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelected(f); e.target.value = ""; }} />
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onImagePicked(f); e.target.value = ""; }} />

      {toast && <div className="fixed right-6 top-6 z-[9999] rounded-xl border border-[#106EBE]/30 bg-[#E5F1FB] px-5 py-3 text-sm font-bold text-[#106EBE] shadow-2xl backdrop-blur-md animate-[awmFadeIn_0.16s_ease-out]">{toast}</div>}

      {/* Enterprise Top Navigation Menu Bar */}
      <nav ref={menuBarRef} className="flex flex-wrap items-center bg-gradient-to-b from-[#FFFFFF] to-[#F7F7F7] border-b border-[#D2D0CE] text-[13px] select-none relative z-50 shadow-sm">
        <div className="flex items-center gap-2 px-4 font-black text-[#106EBE] mr-2 tracking-widest uppercase text-xs">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#106EBE] text-white shadow-sm">A</span>
          AWM ERP
        </div>
        {EXCEL_MENU_DATA.map((category, index) => {
          const isActive = activeMenuIndex === index;
          return (
            <div
              key={category.title}
              className="relative group"
              onMouseEnter={() => {
                if (activeMenuIndex !== null) setActiveMenuIndex(index);
              }}
            >
              <button
                className={`px-3 py-1.5 outline-none transition-colors ${isActive ? "bg-[#E1DFDD]" : "hover:bg-[#F3F2F1]"}`}
                onClick={() => setActiveMenuIndex(isActive ? null : index)}
                onKeyDown={(e) => handleMenuKeyDown(e, index)}
                aria-haspopup="true"
                aria-expanded={isActive}
                tabIndex={0}
              >
                {category.title}
              </button>

              {isActive && (
                <ul className="absolute top-full left-0 min-w-[280px] bg-[#FFFFFF] border border-[#D2D0CE] shadow-[0_14px_34px_rgba(0,0,0,0.18)] py-1 m-0 list-none z-[1000] rounded-b-xl overflow-hidden animate-[awmFadeIn_0.1s_ease-out]">
                  {category.items.map((item, itemIndex) => {
                    const isFocused = focusedMenuItemIndex === itemIndex;
                    return (
                      <li
                        key={`${item.label}-${itemIndex}`}
                        className={`flex justify-between items-center px-4 py-1.5 cursor-default text-[13px] text-[#000000] ${isFocused ? "bg-[#E5F1FB] text-[#106EBE]" : "hover:bg-[#F3F2F1]"}`}
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => dispatchMenuAction(item.action)}
                        onMouseEnter={() => setFocusedMenuItemIndex(itemIndex)}
                      >
                        <span className="whitespace-nowrap">{item.label}</span>
                        {item.shortcut && (
                          <span className="text-[#605E5C] text-[12px] ml-6 text-right">{item.shortcut}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* awmerp Style Enterprise Toolbar */}
      <div className="border-b border-[#C8C6C4] bg-gradient-to-b from-[#F9FAFB] via-[#F3F4F6] to-[#ECEFF3] shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3 border-b border-[#D2D0CE] px-3 py-1.5">
          <div className="flex items-center gap-2">
            <input
              value={workbookName}
              onChange={(e) => setWorkbookName(e.target.value)}
              className="h-7 w-64 rounded-md border border-[#C8C6C4] bg-white px-3 text-xs font-bold outline-none shadow-inner transition-all focus:border-[#106EBE] focus:ring-2 focus:ring-[#106EBE]/15"
              aria-label="Workbook name"
            />
            {saveState === "saving" && <span className="text-xs text-[#106EBE] font-bold">Saving...</span>}
            {saveState === "saved" && <span className="text-xs text-green-600 font-bold">Saved</span>}
            {saveState === "error" && <span className="text-xs text-red-600 font-bold">Save failed</span>}
          </div>
          <select
            value={activeCellStyle.borderWidth || 2}
            onChange={(e) => { applyStyleToSelection({ borderWidth: parseInt(e.target.value, 10) }); showToast("Border width applied."); }}
            className="rounded-md border border-[#D2D0CE] bg-white px-2 py-1 text-xs outline-none focus:border-[#106EBE]"
          >
            <option value={1}>Thin</option>
            <option value={2}>Medium</option>
            <option value={4}>Thick</option>
          </select>
          <SpreadsheetToolbarIconButton
            button={{
              label: activeCellStyle.textDirection === "rtl" ? "Text Direction: RTL" : "Text Direction: LTR",
              icon: Icons.ArrowLeftRight,
              active: activeCellStyle.textDirection === "rtl",
              kind: "toggle",
              onClick: toggleTextDirection,
            }}

          />
          <SpreadsheetToolbarIconButton
            button={{
              label: "Predictive Analytics",
              icon: Icons.TrendingUp,
              active: showPredictiveAnalytics,
              kind: "toggle",
              onClick: runPredictiveAnalytics,
            }}
          />

          <div className="ml-auto hidden items-center gap-2 rounded-lg border border-[#C8C6C4] bg-gradient-to-b from-white to-[#EDEBE9] px-3 py-1 text-xs font-black text-[#3B3A39] shadow-sm md:flex">
            <Icons.Crown size={16} className="text-amber-500" />
            VIP Premium Edition
          </div>
        </div>

        {/* Row 1: Standard Toolbar */}
        <div className="flex flex-wrap items-center gap-[3px] border-b border-[#D2D0CE] px-2 py-1">
          {standardToolbarButtons.map((button, index) => (
            <React.Fragment key={button.label}>
              {button.dropdownItems || button.dropdownExtra ? (
                <SpreadsheetToolbarSplitButton
                  button={button}
                  open={openToolbarMenu === (button.label === "New Document" ? "new" : button.label === "Open" ? "open" : "save")}
                  onToggle={() =>
                    setOpenToolbarMenu((v) => {
                      const key = button.label === "New Document" ? "new" : button.label === "Open" ? "open" : "save";
                      return v === key ? null : key;
                    })
                  }
                  onClose={() => setOpenToolbarMenu(null)}
                />
              ) : (
                <SpreadsheetToolbarIconButton button={button} />
              )}
              {[2, 5, 8, 10, 13, 14, 18, 21, 24, 27].includes(index) && <ToolbarSeparator />}
            </React.Fragment>
          ))}
          <ColorToolbarButton label="Border Color" icon={Icons.SquareDashedBottom} value={activeCellStyle.borderColor || "#000000"} onChange={(borderColor) => { applyStyleToSelection({ borderColor }); showToast("Border color applied."); }} />
        </div>

        {/* Row 2: Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-[3px] border-b border-[#D2D0CE] px-2 py-1">
          <select
            value={activeCellStyle.fontFamily || "Inter"}
            onChange={(e) => { applyStyleToSelection({ fontFamily: e.target.value }); showToast("Font changed."); }}
            className="h-8 min-w-[190px] rounded-md border border-[#C8C6C4] bg-white px-2 text-sm italic shadow-inner outline-none hover:border-[#106EBE] focus:border-[#106EBE]"
            title="Font Name"
            aria-label="Font Name"
          >
            {FONT_FAMILIES.map((font) => <option key={font} value={font}>{font}</option>)}
          </select>
          <select
            value={activeCellStyle.fontSize || 12}
            onChange={(e) => { applyStyleToSelection({ fontSize: parseInt(e.target.value, 10) }); showToast("Font size changed."); }}
            className="h-8 w-[72px] rounded-md border border-[#C8C6C4] bg-white px-2 text-sm shadow-inner outline-none hover:border-[#106EBE] focus:border-[#106EBE]"
            title="Font Size"
            aria-label="Font Size"
          >
            {FONT_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
          <ToolbarSeparator />
          <SpreadsheetToolbarIconButton button={{ label: "Bold", icon: Icons.Bold, active: !!activeCellStyle.bold, kind: "toggle", onClick: () => toggleStyle("bold") }} />
          <SpreadsheetToolbarIconButton button={{ label: "Italic", icon: Icons.Italic, active: !!activeCellStyle.italic, kind: "toggle", onClick: () => toggleStyle("italic") }} />
          <SpreadsheetToolbarIconButton button={{ label: "Underline", icon: Icons.Underline, active: !!activeCellStyle.underline, kind: "toggle", onClick: () => toggleStyle("underline") }} />
          <ColorToolbarButton label="Font Color" icon={Icons.CaseSensitive} value={activeCellStyle.color || "#000000"} onChange={(color) => { applyStyleToSelection({ color }); showToast("Font color applied."); }} />
          <ColorToolbarButton label="Background Color" icon={Icons.PaintBucket} value={activeCellStyle.bg || "#FFFFFF"} onChange={(bg) => { applyStyleToSelection({ bg }); showToast("Background color applied."); }} />
          <ToolbarSeparator />
          <SpreadsheetToolbarIconButton button={{ label: "Align Left", icon: Icons.AlignLeft, active: activeCellStyle.align === "left", kind: "toggle", onClick: () => { applyStyleToSelection({ align: "left" }); showToast("Aligned left."); } }} />
          <SpreadsheetToolbarIconButton button={{ label: "Align Center", icon: Icons.AlignCenter, active: activeCellStyle.align === "center", kind: "toggle", onClick: () => { applyStyleToSelection({ align: "center" }); showToast("Aligned center."); } }} />
          <SpreadsheetToolbarIconButton button={{ label: "Align Right", icon: Icons.AlignRight, active: activeCellStyle.align === "right", kind: "toggle", onClick: () => { applyStyleToSelection({ align: "right" }); showToast("Aligned right."); } }} />
          <SpreadsheetToolbarIconButton button={{ label: "Justified", icon: Icons.AlignJustify, active: activeCellStyle.align === "justify", kind: "toggle", onClick: () => { applyStyleToSelection({ align: "justify" }); showToast("Justified."); } }} />
          <SpreadsheetToolbarIconButton button={{ label: "Wrap Text", icon: Icons.WrapText, active: !!activeCellStyle.wrap, kind: "toggle", onClick: () => { applyStyleToSelection({ wrap: !activeCellStyle.wrap }); showToast("Wrap text toggled."); } }} />
          <ToolbarSeparator />
          <SpreadsheetToolbarIconButton button={{ label: "Align Top", icon: Icons.AlignVerticalJustifyStart, active: activeCellStyle.verticalAlign === "top", kind: "toggle", onClick: () => { applyStyleToSelection({ verticalAlign: "top" }); showToast("Aligned top."); } }} />
          <SpreadsheetToolbarIconButton button={{ label: "Align Center Vertically", icon: Icons.AlignVerticalJustifyCenter, active: activeCellStyle.verticalAlign === "middle", kind: "toggle", onClick: () => { applyStyleToSelection({ verticalAlign: "middle" }); showToast("Aligned middle."); } }} />
          <SpreadsheetToolbarIconButton button={{ label: "Align Bottom", icon: Icons.AlignVerticalJustifyEnd, active: activeCellStyle.verticalAlign === "bottom", kind: "toggle", onClick: () => { applyStyleToSelection({ verticalAlign: "bottom" }); showToast("Aligned bottom."); } }} />
          <ToolbarSeparator />
          {/* Currency split-button: main button applies the active currency, chevron opens the world-currency dropdown */}
          <div className="relative">
            <div className="flex items-stretch">
              <button
                type="button"
                title="Apply currency format"
                aria-label="Currency"
                onClick={() => applyStyleToSelection({ numberFormat: "currency", currencyCode: activeCellStyle.currencyCode || "USD" })}
                className={`inline-flex items-center gap-1 rounded-l-md border px-2 py-1 text-xs font-medium shadow-inner transition ${activeCellStyle.numberFormat === "currency" ? "border-[#106EBE] bg-[#E5F1FB] text-[#106EBE]" : "border-[#C8C6C4] bg-white text-[#444] hover:border-[#106EBE] hover:bg-[#F4F9FD]"}`}
              >
                <Icons.CircleDollarSign size={14} />
                <span className="hidden md:inline">{findCurrency(activeCellStyle.currencyCode).code}</span>
              </button>
              <button
                type="button"
                title="Choose currency"
                aria-label="Choose currency"
                aria-expanded={currencyMenuOpen}
                onClick={() => setCurrencyMenuOpen((v) => !v)}
                className={`inline-flex items-center rounded-r-md border border-l-0 px-1 py-1 shadow-inner transition ${currencyMenuOpen ? "border-[#106EBE] bg-[#E5F1FB] text-[#106EBE]" : "border-[#C8C6C4] bg-white text-[#444] hover:border-[#106EBE] hover:bg-[#F4F9FD]"}`}
              >
                {currencyMenuOpen ? <Icons.ChevronUp size={14} /> : <Icons.ChevronDown size={14} />}
              </button>
            </div>

            {currencyMenuOpen && (
              <>
                {/* Click-outside backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => { setCurrencyMenuOpen(false); setCurrencySearch(""); }}
                  aria-hidden="true"
                />
                <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-md border border-[#C8C6C4] bg-white shadow-lg">
                  <div className="border-b border-[#E1DFDD] p-2">
                    <div className="flex items-center gap-2 rounded-md border border-[#D2D0CE] px-2 py-1">
                      <Icons.Search size={12} className="text-[#605E5C]" />
                      <input
                        autoFocus
                        type="text"
                        value={currencySearch}
                        onChange={(e) => setCurrencySearch(e.target.value)}
                        placeholder="Search currency or country…"
                        className="w-full bg-transparent text-xs outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Escape") { setCurrencyMenuOpen(false); setCurrencySearch(""); }
                          if (e.key === "Enter") {
                            const list = WORLD_CURRENCIES.filter((c) => matchesCurrency(c, currencySearch));
                            if (list.length > 0) applyCurrencyFormat(list[0].code);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <ul className="max-h-72 overflow-y-auto py-1">
                    {WORLD_CURRENCIES.filter((c) => matchesCurrency(c, currencySearch)).map((c) => {
                      const active = activeCellStyle.numberFormat === "currency" && (activeCellStyle.currencyCode || "USD") === c.code;
                      return (
                        <li key={c.code}>
                          <button
                            type="button"
                            onClick={() => applyCurrencyFormat(c.code)}
                            className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-xs transition ${active ? "bg-[#E5F1FB] text-[#106EBE]" : "text-[#323130] hover:bg-[#F3F2F1]"}`}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="w-8 shrink-0 text-center font-semibold">{c.symbol}</span>
                              <span className="truncate">{c.name}</span>
                            </span>
                            <span className="shrink-0 font-mono text-[10px] text-[#605E5C]">{c.code}</span>
                          </button>
                        </li>
                      );
                    })}
                    {WORLD_CURRENCIES.filter((c) => matchesCurrency(c, currencySearch)).length === 0 && (
                      <li className="px-3 py-2 text-xs text-[#605E5C]">No currency matches "{currencySearch}".</li>
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
          <SpreadsheetToolbarIconButton button={{ label: "Percentage", icon: Icons.Percent, active: activeCellStyle.numberFormat === "percentage", kind: "toggle", onClick: () => applyNumberFormat("percentage") }} />
          <SpreadsheetToolbarIconButton button={{ label: "Number", icon: Icons.Binary, active: activeCellStyle.numberFormat === "number", kind: "toggle", onClick: () => applyNumberFormat("number") }} />
          <SpreadsheetToolbarIconButton button={{ label: "Date", icon: Icons.CalendarDays, active: activeCellStyle.numberFormat === "date", kind: "toggle", onClick: () => applyNumberFormat("date") }} />
          <SpreadsheetToolbarIconButton button={{ label: "Scientific", icon: Icons.Superscript, active: activeCellStyle.numberFormat === "scientific", kind: "toggle", onClick: () => applyNumberFormat("scientific") }} />
          <SpreadsheetToolbarIconButton button={{ label: "Accounting", icon: Icons.Receipt, active: activeCellStyle.numberFormat === "accounting", kind: "toggle", onClick: () => applyNumberFormat("accounting") }} />
          <SpreadsheetToolbarIconButton button={{ label: "Text Format", icon: Icons.Type, active: activeCellStyle.numberFormat === "text", kind: "toggle", onClick: () => applyNumberFormat("text") }} />
          <input
            type="text"
            placeholder="Custom e.g. $#,##0.00"
            defaultValue={activeCellStyle.customFormat || ""}
            onBlur={(e) => {
              if (e.target.value.trim()) {
                applyStyleToSelection({ numberFormat: "custom", customFormat: e.target.value.trim() });
                showToast("Custom format applied.");
              }
            }}
            className="w-36 rounded-md border border-[#D2D0CE] bg-white px-2 py-1 text-xs outline-none focus:border-[#106EBE]"
          />
          <SpreadsheetToolbarIconButton button={{ label: "Increase Decimal", icon: Icons.Plus, onClick: () => adjustDecimals(1) }} />
          <SpreadsheetToolbarIconButton button={{ label: "Decrease Decimal", icon: Icons.Minus, onClick: () => adjustDecimals(-1) }} />
          <ToolbarSeparator />
          <SpreadsheetToolbarIconButton button={{ label: "Increase Indent", icon: Icons.IndentIncrease, onClick: () => adjustIndent(1) }} />
          <SpreadsheetToolbarIconButton button={{ label: "Decrease Indent", icon: Icons.IndentDecrease, onClick: () => adjustIndent(-1) }} />


          <div className="relative" ref={borderMenuRef}>
            <div className="flex items-stretch">
              <button
                type="button"
                onClick={toggleBorderAll}
                className="inline-flex items-center gap-1 rounded-l-md border border-C8C6C4 bg-white px-2 py-1 text-xs shadow-inner hover:border-106EBE hover:bg-F4F9FD"
                title="Apply Border"
                aria-label="Apply Border"
              >
                <Icons.Square size={14} />
                Borders
              </button>

              <button
                type="button"
                onClick={() => setBorderMenuOpen(v => !v)}
                className="inline-flex items-center rounded-r-md border border-l-0 border-C8C6C4 bg-white px-1 py-1 text-xs shadow-inner hover:border-106EBE hover:bg-F4F9FD"
                title="Open border menu"
                aria-label="Open border menu"
                aria-expanded={borderMenuOpen}
              >
                <Icons.ChevronDown size={14} />
              </button>
            </div>

            {borderMenuOpen && (
              <div
                className="absolute left-0 top-full z-50 mt-1 w-72 rounded-md border border-C8C6C4 bg-white py-1 shadow-lg"
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={() => { applyBorderPreset("none"); closeBorderMenu(); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs hover:bg-E5F1FB"
                >
                  No Border
                </button>

                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={() => { applyBorderPreset("left"); closeBorderMenu(); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs hover:bg-E5F1FB"
                >
                  Left Border
                </button>

                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={() => { applyBorderPreset("right"); closeBorderMenu(); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs hover:bg-E5F1FB"
                >
                  Right Border
                </button>

                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={() => { applyBorderPreset("top"); closeBorderMenu(); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs hover:bg-E5F1FB"
                >
                  Top Border
                </button>

                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={() => { applyBorderPreset("bottom"); closeBorderMenu(); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs hover:bg-E5F1FB"
                >
                  Bottom Border
                </button>

                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={() => { applyBorderPreset("all"); closeBorderMenu(); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs hover:bg-E5F1FB"
                >
                  All Borders
                </button>

                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={() => { applyBorderPreset("outside"); closeBorderMenu(); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs hover:bg-E5F1FB"
                >
                  Outside Borders
                </button>

                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={() => { applyBorderPreset("inside"); closeBorderMenu(); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs hover:bg-E5F1FB"
                >
                  Inside Borders
                </button>
              </div>
            )}
          </div>



          <select
            value={activeCellStyle.borderStyle || "solid"}
            onChange={(e) => { applyStyleToSelection({ borderStyle: e.target.value as CellStyle["borderStyle"] }); showToast("Border style applied."); }}
            className="h-6 w-[16px] rounded-md border border-[#C8C6C4] bg-white px-1 text-10px shadow-inner outline-none hover:border-[#106EBE] focus:border-[#106EBE]"
            title="Border Style"
            aria-label="Border Style"
          >

            {BORDER_STYLE_OPTIONS.map((style) => <option key={style} value={style}>{style}</option>)}
          </select>

        </div>

        {/* Row 3: Formula Bar */}
        <div className={`flex items-start gap-2 px-2 py-1 bg-gradient-to-b from-[#FFFFFF] to-[#F7F7F7] transition-all ${formulaExpanded ? "min-h-[76px]" : "min-h-[40px]"}`}>
          <input
            value={activeCell}
            onChange={(e) => {
              const next = e.target.value.toUpperCase();
              const pos = parseKey(next);
              if (pos && pos.row >= 0 && pos.col >= 0 && pos.row < sheet.gridRows && pos.col < sheet.gridCols) {
                setActiveCell(next);
                setSelection({ r1: pos.row, c1: pos.col, r2: pos.row, c2: pos.col });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const raw = (e.currentTarget as HTMLInputElement).value.toUpperCase();
                if (goToNamedRange(raw.replace(/\s+/g, "_"))) return;
                const pos = parseKey(raw);
                if (pos) {
                  setActiveCell(cellKey(pos.row, pos.col));
                  setSelection({ r1: pos.row, c1: pos.col, r2: pos.row, c2: pos.col });
                }
              }
            }}
            className="h-8 w-[110px] rounded-md border border-[#C8C6C4] bg-white px-2 text-sm font-bold shadow-inner outline-none focus:border-[#106EBE]"
            title="Name Box"
            aria-label="Name Box"
          />
          <button onClick={() => setShowFunctionWizard(true)} className="h-8 rounded-md px-2 text-lg italic font-bold text-[#106EBE] hover:bg-[#E5F1FB] focus:outline-none focus:ring-2 focus:ring-[#106EBE]/30" title="Function Wizard" aria-label="Function Wizard">fx</button>
          <div className="relative flex items-center">
            <button onClick={autoSum} className="h-8 rounded-md px-2 text-xl font-bold text-[#3B3A39] hover:bg-[#E5F1FB] focus:outline-none focus:ring-2 focus:ring-[#106EBE]/30" title="Sum" aria-label="Sum">Σ</button>
            <button onClick={() => setShowAutoSumMenu((v) => !v)} className="flex h-8 w-5 items-center justify-center rounded-md text-[#3B3A39] hover:bg-[#E5F1FB] focus:outline-none focus:ring-2 focus:ring-[#106EBE]/30" title="AutoSum options" aria-label="AutoSum options">
              <Icons.ChevronDown size={12} />
            </button>
            {showAutoSumMenu && (
              <div ref={autoSumMenuRef} className="absolute left-0 top-full z-[500] mt-1 w-36 rounded-md border border-[#D2D0CE] bg-white py-1 text-sm shadow-2xl">
                {(["SUM", "AVERAGE", "MIN", "MAX", "COUNT", "COUNTA", "PRODUCT", "STDEV", "STDEVP", "VAR", "VARP"] as Aggregate[]).map((fn) => (
                  <button key={fn} onClick={() => applyAggregateFunction(fn)} className="block w-full px-3 py-1 text-left hover:bg-[#E5F1FB]">
                    {fn}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={insertFunctionFromToolbar} className="h-8 rounded-md px-2 text-lg hover:bg-[#E5F1FB] focus:outline-none focus:ring-2 focus:ring-[#106EBE]/30" title="Insert Function" aria-label="Insert Function">😊</button>
          <textarea
            spellCheck
            dir="ltr"
            value={editingKey === activeCell ? editValue : formulaBar}
            onChange={(e) => {
              if (editingKey === activeCell) setEditValue(e.target.value);
              else {
                setFormulaBar(e.target.value);
                startEditing(activeCell, e.target.value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commitEdit("down");
              }
            }}
            className={`${formulaExpanded ? "h-16" : "h-8"} flex-1 resize-none rounded-md border border-[#C8C6C4] bg-white px-3 py-1.5 text-sm outline-none shadow-inner transition-all focus:border-[#106EBE] focus:ring-2 focus:ring-[#106EBE]/15 text-[#000000]`}
            style={{ direction: "ltr", unicodeBidi: "plaintext" }}
            placeholder="Input line..."
            title="Formula Input"
            aria-label="Formula Input"
          />
          <button
            onClick={() => { setFormulaExpanded(v => !v); showToast("Formula bar size toggled."); }}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#C8C6C4] bg-white text-[#3B3A39] shadow-sm hover:border-[#106EBE] hover:bg-[#E5F1FB] focus:outline-none focus:ring-2 focus:ring-[#106EBE]/30"
            title="Expand / Collapse Formula Bar"
            aria-label="Expand / Collapse Formula Bar"
          >
            {formulaExpanded ? <Icons.ChevronUp size={16} /> : <Icons.ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${printPreview ? "bg-[#A19F9D] p-6" : ""}`}>
          {showDrawFunctions && (
            <div className="flex flex-wrap items-center gap-2 border-b border-[#D2D0CE] bg-[#FBFBFB] px-3 py-2 text-xs">
              <span className="font-bold text-[#605E5C]">Draw Functions</span>
              <button onClick={() => { setCellValue(activeCell, "□"); showToast("Rectangle symbol inserted."); }} className="rounded-md border border-[#D2D0CE] bg-white px-3 py-1 hover:border-[#106EBE]">Rectangle</button>
              <button onClick={() => { setCellValue(activeCell, "○"); showToast("Circle symbol inserted."); }} className="rounded-md border border-[#D2D0CE] bg-white px-3 py-1 hover:border-[#106EBE]">Circle</button>
              <button onClick={() => { setCellValue(activeCell, "→"); showToast("Arrow symbol inserted."); }} className="rounded-md border border-[#D2D0CE] bg-white px-3 py-1 hover:border-[#106EBE]">Arrow</button>
              <button onClick={() => { setCellValue(activeCell, "✎"); showToast("Freeform mark inserted."); }} className="rounded-md border border-[#D2D0CE] bg-white px-3 py-1 hover:border-[#106EBE]">Freeform</button>
            </div>
          )}

          {splitWindow && (
            <div className="border-b border-[#D2D0CE] bg-[#FFF4CE] px-3 py-1 text-xs font-bold text-[#8A6D00]">
              Split Window mode is active. The spreadsheet remains fully editable.
            </div>
          )}

          {/* Spreadsheet Grid Area */}
          <div

            id="awm-print-area"
            onScroll={(e) => {
              const el = e.currentTarget;
              if (scrollRafRef.current !== null) return;
              scrollRafRef.current = requestAnimationFrame(() => {
                setViewport({
                  scrollTop: el.scrollTop,
                  scrollLeft: el.scrollLeft,
                  clientHeight: el.clientHeight,
                  clientWidth: el.clientWidth,
                });
                scrollRafRef.current = null;
              });
            }}
            className={`flex-1 overflow-auto bg-[#F3F2F1] relative awm-premium-scrollbar ${printPreview ? "mx-auto w-full max-w-6xl rounded-xl bg-white shadow-2xl" : ""}`}
            style={{
              // স্ক্রল-কন্টেইনারকে GPU লেয়ারে প্রমোট করা হচ্ছে, যাতে স্ক্রলের
              // সময় sticky হেডার repaint-এ প্রভাবিত না হয় এবং ফ্লিকার না করে
              willChange: "scroll-position",
              contain: "layout style paint",
            }}
          >
            <table
              className="table-fixed text-sm bg-[#FFFFFF]"
              style={{
                borderCollapse: "separate",
                borderSpacing: 0,
                ...(zoomLevel !== 100 ? { zoom: zoomLevel / 100 } : {}),
              } as React.CSSProperties}
            >
              <thead>
                <tr>
                  <th
                    className={`awm-print-hide sticky left-0 top-0 z-40 border border-[#D2D0CE] bg-[#f1eaf0] px-2 py-1 text-xs text-[#FFFFFF] shadow-sm ${printPreview ? "hidden" : ""}`}
                    style={{
                      width: ROW_HEADER_WIDTH,
                      minWidth: ROW_HEADER_WIDTH,
                      height: HEADER_HEIGHT,
                      ...(viewport.scrollLeft > 0 ? headerColShadow : {}),
                      ...(viewport.scrollTop > 0 ? headerRowShadow : {}),
                      // কর্নার সেল সবসময় সবার উপরে থাকে — এটাও লেয়ার-প্রমোট করা হলো
                      willChange: "transform",
                    }}
                  ></th>



                  {columns
                    .filter((c) => {
                      if (!virtualizeCols) return true;
                      return c < sheet.frozenCols || (c >= visibleColRange.start && c <= visibleColRange.end);
                    })
                    .map((c) => {
                      const frozen = c < sheet.frozenCols;
                      const colMarked = c >= Math.min(selection.c1, selection.c2) && c <= Math.max(selection.c1, selection.c2);

                      return (
                        <th
                          key={c}
                          onClick={() => selectEntireColumn(c)}
                          className={`awm-print-hide relative cursor-pointer border border-[#D2D0CE] px-2 py-1 text-xs font-bold text-[#FFFFFF] shadow-sm ${printPreview ? "hidden" : ""}`}
                          style={{
                            width: sheet.colWidths[c] || DEFAULT_COL_WIDTH,
                            minWidth: sheet.colWidths[c] || DEFAULT_COL_WIDTH,
                            height: HEADER_HEIGHT,
                            position: "sticky",
                            top: 0,
                            left: frozen ? leftOffset(c) : undefined,
                            zIndex: frozen ? 35 : 25,
                            backgroundColor: colMarked ? "#107C10" : "#106EBE",
                            ...(viewport.scrollTop > 0 ? headerRowShadow : {}),
                            // হেডারকে নিজস্ব compositor layer-এ রাখা হচ্ছে — নিচের
                            // সেলগুলো রি-রেন্ডার হলেও হেডার আলাদা লেয়ার হওয়ায় ফ্লিকার করবে না
                            willChange: "transform",
                          }}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>{colToLetter(c)}</span>

                            {sheet.filters[c] && <Icons.Filter size={11} className="text-white" />}

                            {(autoFilterEnabled || !!sheet.filters[c]) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openAutoFilterMenu(c, e);
                                }}
                                className={`ml-1 flex h-5 w-5 items-center justify-center rounded border border-white/40 transition hover:bg-white/20 ${sheet.filters[c] ? "bg-white/25" : "bg-transparent"
                                  }`}
                                title={`AutoFilter ${colToLetter(c)}`}
                                aria-label={`AutoFilter ${colToLetter(c)}`}
                              >
                                <Icons.ChevronDown size={12} />
                              </button>
                            )}
                          </div>

                          <span
                            onMouseDown={(e) => {
                              e.preventDefault();
                              resizeColumn(c, e.clientX);
                            }}
                            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#FFFFFF]"
                          />
                          <span onMouseDown={(e) => { e.preventDefault(); resizeColumn(c, e.clientX); }} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#FFFFFF]" />
                          {sheet.frozenCols > 0 && c === sheet.frozenCols - 1 && (
                            <span className="pointer-events-none absolute right-0 top-0 z-40 h-full w-[3px] bg-[#107C10]" />
                          )}
                        </th>

                      );
                    })}



                </tr>
              </thead>
              <tbody>
                {virtualizeRows && topSpacerHeight > 0 && (
                  <tr style={{ height: topSpacerHeight }}>
                    <td colSpan={sheet.gridCols + 1} style={{ padding: 0, border: "none" }} />
                  </tr>
                )}
                {rowsArr.map((r) => {
                  if (hiddenRows.has(r)) return null;
                  if (virtualizeRows && r >= sheet.frozenRows && (r < visibleRowRange.start || r > visibleRowRange.end)) return null;
                  const isGroupHeader = sheet.groups.find((g) => g.start === r);
                  const rowFrozen = r < sheet.frozenRows;
                  const rowMarked = r >= Math.min(selection.r1, selection.r2) && r <= Math.max(selection.r1, selection.r2);
                  return (


                    <tr key={r} style={{ height: sheet.rowHeights[r] || DEFAULT_ROW_HEIGHT }}>
                      <td
                        onClick={() => selectEntireRow(r)}
                        className={`awm-print-hide relative cursor-pointer border border-[#D2D0CE] px-2 py-1 text-center text-xs text-[#FFFFFF] shadow-sm ${printPreview ? "hidden" : ""}`}
                        style={{
                          position: "sticky",
                          left: 0,
                          top: rowFrozen ? topOffset(r) : undefined,
                          zIndex: rowFrozen ? 32 : 20,
                          height: sheet.rowHeights[r] || DEFAULT_ROW_HEIGHT,
                          backgroundColor: rowMarked ? "#107C10" : "#106EBE",
                          ...(viewport.scrollLeft > 0 ? headerColShadow : {}),
                          // একই কারণে রো-হেডারকেও আলাদা লেয়ারে প্রমোট করা হলো
                          willChange: "transform",
                        }}
                      >

                        <div className="flex items-center justify-center gap-1">
                          {isGroupHeader && (
                            <button
                              onClick={() => toggleGroupCollapse(isGroupHeader.id)}
                              className="text-[#FFFFFF] font-bold"
                            >
                              {isGroupHeader.collapsed ? "▸" : "▾"}
                            </button>
                          )}
                          {r + 1}
                        </div>
                        <span
                          onMouseDown={(e) => {
                            e.preventDefault();
                            resizeRow(r, e.clientY);
                          }}
                          className="absolute bottom-0 left-0 h-1 w-full cursor-row-resize hover:bg-[#FFFFFF]"
                        />
                        <span
                          onMouseDown={(e) => {
                            e.preventDefault();
                            resizeRow(r, e.clientY);
                          }}
                          className="absolute bottom-0 left-0 h-1 w-full cursor-row-resize hover:bg-[#FFFFFF]"
                        />
                        {sheet.frozenRows > 0 && r === sheet.frozenRows - 1 && (
                          <span className="pointer-events-none absolute bottom-0 left-0 z-40 h-[3px] w-full bg-[#107C10]" />
                        )}
                      </td>

                      {columns
                        .filter((c) => {
                          if (!virtualizeCols) return true;
                          return c < sheet.frozenCols || (c >= visibleColRange.start && c <= visibleColRange.end);
                        })
                        .map((c) => {
                          const key = cellKey(r, c);
                          const data = sheet.cells[key];
                          if (data?.mergedInto) return null;

                          const style = data?.style;
                          const isEditing = editingKey === key;
                          const selected = isSelected(r, c);
                          const isActive = activeCell === key;
                          const colFrozen = c < sheet.frozenCols;
                          const isFillCorner =
                            r === Math.max(selection.r1, selection.r2) &&
                            c === Math.max(selection.c1, selection.c2);

                          const inFillPreview =
                            !!fillPreview &&
                            !selected &&
                            r >= Math.min(fillPreview.r1, fillPreview.r2) &&
                            r <= Math.max(fillPreview.r1, fillPreview.r2) &&
                            c >= Math.min(fillPreview.c1, fillPreview.c2) &&
                            c <= Math.max(fillPreview.c1, fillPreview.c2);

                          const cfMatch = (sheet.conditionalRules || []).find((rule) => {
                            const nr = normalizeRange(rule.range);
                            if (!nr) return false;
                            if (r < nr.r1 || r > nr.r2 || c < nr.c1 || c > nr.c2) return false;
                            return evaluateConditionalRule(rule, getCellValue(key));
                          });

                          const cellRawResult = getCellValue(key);
                          const isErrorValue = typeof cellRawResult === "string" && cellRawResult.startsWith("#");
                          const isTraced = !!traceHighlight?.has(key);

                          return (

                            <td
                              key={key}
                              ref={(el) => {
                                if (el) cellRefs.current.set(key, el);
                                else cellRefs.current.delete(key);
                              }}
                              rowSpan={data?.rowSpan}
                              colSpan={data?.colSpan}
                              onMouseDown={(e) => handleMouseDown(r, c, e)}

                              onMouseEnter={() => handleMouseEnter(r, c)}
                              onDoubleClick={() => startEditing(key)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                if (!isSelected(r, c)) {
                                  setActiveCell(key);
                                  setSelection({ r1: r, c1: c, r2: r, c2: c });
                                }
                                setContextMenu({ x: e.clientX, y: e.clientY, row: r, col: c });
                              }}
                              onKeyDown={(e) => handleKeyDown(e, r, c)}
                              tabIndex={0}
                              className={`relative px-2 py-1 outline-none transition-colors ${showGridLines ? "border" : "border border-transparent"
                                } ${isActive ? "border-[#8903f7] border-2 z-10 bg-[#DCEBFF]" : selected ? "bg-[#EAF2FF] border-[#9c06f9fa]" : "border-[#dfd9df]"} ${inFillPreview ? "outline-2 outline-dashed outline-[#15803D]" : ""
                                } ${isTraced ? "ring-2 ring-inset ring-[#f006ec]" : ""}`}
                              style={{
                                width: sheet.colWidths[c] || DEFAULT_COL_WIDTH,
                                minWidth: sheet.colWidths[c] || DEFAULT_COL_WIDTH,
                                maxWidth: sheet.colWidths[c] || DEFAULT_COL_WIDTH,
                                height: "auto",
                                minHeight: sheet.rowHeights[r] || DEFAULT_ROW_HEIGHT,
                                backgroundColor: isErrorValue
                                  ? "#FDE7E9"
                                  : cfMatch?.bg || style?.bg || (colFrozen || rowFrozen ? "#F3F2F1" : "#FFFFFF"),
                                color: isErrorValue ? "#A80000" : cfMatch?.color || style?.color || "#000000",
                                fontFamily: style?.fontFamily,
                                fontSize: style?.fontSize,
                                fontWeight: style?.bold ? 700 : 400,
                                fontStyle: style?.italic ? "italic" : "normal",
                                textDecoration: style?.underline ? "underline" : "none",
                                textAlign: style?.align || (style?.textDirection === "rtl" ? "right" : "left"),
                                verticalAlign: style?.verticalAlign || "top",
                                direction: style?.textDirection || "ltr",
                                unicodeBidi: "isolate",
                                paddingLeft: style?.indent ? 8 + style.indent * 12 : undefined,
                                borderTopWidth: style?.borders?.top ? style?.borderWidth ?? 2 : undefined,
                                borderRightWidth: style?.borders?.right ? style?.borderWidth ?? 2 : undefined,
                                borderBottomWidth: style?.borders?.bottom ? style?.borderWidth ?? 2 : undefined,
                                borderLeftWidth: style?.borders?.left ? style?.borderWidth ?? 2 : undefined,
                                borderStyle: style?.borderStyle,
                                borderColor: style?.borders ? style?.borderColor || "#000000" : undefined,
                                position: colFrozen || rowFrozen ? "sticky" : undefined,
                                left: colFrozen ? leftOffset(c) : undefined,
                                top: rowFrozen ? topOffset(r) : undefined,
                                zIndex: colFrozen && rowFrozen ? 31 : colFrozen ? 22 : rowFrozen ? 21 : undefined,
                              }}
                            >
                              {isFillCorner && (
                                <span
                                  onMouseDown={startFillDrag}
                                  className="absolute -bottom-[3px] -right-[3px] z-20 h-2 w-2 cursor-crosshair border border-white bg-[#107C10]"
                                />
                              )}

                              {sheet.frozenCols > 0 && c === sheet.frozenCols - 1 && (
                                <span
                                  className="pointer-events-none absolute right-0 top-0 z-30 h-full w-[3px] bg-[#107C10]"
                                />
                              )}
                              {sheet.frozenRows > 0 && r === sheet.frozenRows - 1 && (
                                <span
                                  className="pointer-events-none absolute bottom-0 left-0 z-30 h-[3px] w-full bg-[#107C10]"
                                />
                              )}

                              {data?.comment && (
                                <span
                                  title={data.comment}
                                  className="absolute right-0 top-0 h-2 w-2 rounded-full bg-amber-500"
                                />
                              )}

                              {data?.sparkline &&
                                (() => {
                                  const nr = normalizeRange(data.sparkline as string);
                                  if (!nr) return null;
                                  const vals: number[] = [];
                                  for (let rr = nr.r1; rr <= nr.r2; rr++) {
                                    for (let cc = nr.c1; cc <= nr.c2; cc++) {
                                      const v = getCellValue(cellKey(rr, cc));
                                      vals.push(typeof v === "number" ? v : parseFloat(String(v)) || 0);
                                    }
                                  }
                                  if (vals.length < 2) return null;
                                  const maxV = Math.max(...vals);
                                  const minV = Math.min(...vals);
                                  const span = maxV - minV || 1;
                                  const w = 60;
                                  const h = 16;
                                  const points = vals
                                    .map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - minV) / span) * h}`)
                                    .join(" ");
                                  return (
                                    <svg
                                      width={w}
                                      height={h}
                                      className="pointer-events-none absolute bottom-0 right-0 opacity-80"
                                      viewBox={`0 0 ${w} ${h}`}
                                    >
                                      <polyline fill="none" stroke="#107C10" strokeWidth="1.5" points={points} />
                                    </svg>
                                  );
                                })()}


                              {isEditing ? (
                                <textarea
                                  ref={editorRef}
                                  autoFocus
                                  spellCheck
                                  dir={style?.textDirection || "ltr"}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => commitEdit("none")}
                                  className="h-full w-full resize-none bg-transparent outline-none text-[#000000]"

                                  style={{
                                    direction: style?.textDirection || "ltr",
                                    unicodeBidi: "plaintext",
                                    textAlign: style?.align || (style?.textDirection === "rtl" ? "right" : "left"),
                                  }}
                                />
                              ) : data?.image ? (
                                <img src={data.image} alt="" className="max-h-full max-w-full object-contain" />
                              ) : data?.hyperlink ? (
                                <a
                                  href={data.hyperlink}
                                  target="_blank"
                                  rel="noreferrer"
                                  dir={style?.textDirection || "ltr"}
                                  className="text-[#106EBE] underline"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    direction: style?.textDirection || "ltr",
                                    unicodeBidi: "plaintext",
                                  }}
                                >
                                  {getDisplayValue(key) || data.hyperlink}
                                </a>
                              ) : data?.validation ? (
                                <select
                                  dir={style?.textDirection || "ltr"}
                                  value={data.value}
                                  onChange={(e) => setCellValue(key, e.target.value)}
                                  className="w-full bg-transparent outline-none text-[#000000]"
                                  style={{
                                    direction: style?.textDirection || "ltr",
                                    textAlign: style?.align || (style?.textDirection === "rtl" ? "right" : "left"),
                                  }}
                                >
                                  <option value="" />
                                  {data.validation.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span
                                  dir={style?.textDirection || "ltr"}
                                  className={`block h-full overflow-hidden break-words leading-snug ${style?.wrap === false ? "whitespace-nowrap" : "whitespace-pre-wrap"
                                    }`}
                                  style={{
                                    direction: style?.textDirection || "ltr",
                                    unicodeBidi: "plaintext",
                                    textAlign: style?.align || (style?.textDirection === "rtl" ? "right" : "left"),
                                  }}
                                >
                                  {getDisplayValue(key)}

                                </span>
                              )}
                            </td>
                          );
                        })}
                    </tr>
                  );
                })}
                {virtualizeRows && bottomSpacerHeight > 0 && (
                  <tr style={{ height: bottomSpacerHeight }}>
                    <td colSpan={sheet.gridCols + 1} style={{ padding: 0, border: "none" }} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {showStatusBar && (
            <div className="flex shrink-0 items-center justify-between border-t border-[#D2D0CE] bg-[#F3F2F1] px-3 py-1 text-xs text-[#3B3A39]">
              <div className="flex items-center gap-4">
                <span>Selected: {selectionStats.count}</span>
                {selectionStats.numericCount > 0 && (
                  <>
                    <span>Sum: {selectionStats.sum.toLocaleString("en-US")}</span>
                    <span>Average: {selectionStats.avg.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={toggleDarkMode} className="rounded-md border border-[#D2D0CE] bg-white px-2 py-0.5 hover:border-[#106EBE]" title="Toggle Dark Mode">
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
                <button onClick={zoomOut} className="rounded-md border border-[#D2D0CE] bg-white px-2 py-0.5 hover:border-[#106EBE]" title="Zoom Out">-</button>
                <button onClick={resetZoom} className="rounded-md border border-[#D2D0CE] bg-white px-2 py-0.5 hover:border-[#106EBE]" title="Reset Zoom">{zoomLevel}%</button>
                <button onClick={zoomIn} className="rounded-md border border-[#D2D0CE] bg-white px-2 py-0.5 hover:border-[#106EBE]" title="Zoom In">+</button>
              </div>
            </div>
          )}

          {/* Embedded Charts Area */}
          {sheet.charts.length > 0 && (
            <div className="bg-[#F3F2F1] p-4 grid gap-4 lg:grid-cols-2 border-t border-[#D2D0CE] shrink-0">
              {sheet.charts.map((chart) => (
                <div key={chart.id} className="rounded-xl border border-[#D2D0CE] bg-[#FFFFFF] p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-[#000000]">{chart.title}</h3>
                    <button onClick={() => updateSheet((s) => ({ charts: s.charts.filter((c) => c.id !== chart.id) }))} className="rounded-md border border-[#D2D0CE] px-2 py-1 text-xs hover:bg-[#F3F2F1]">Remove</button>
                  </div>
                  <ChartView type={chart.type} data={getChartData(chart.range)} />
                </div>
              ))}
            </div>
          )}

          {/* Sheet Tabs */}
          <div
            className="flex items-center gap-1 border-t border-[#D2D0CE] bg-[#F3F2F1] px-2 py-1 shrink-0 overflow-x-auto">
            <button onClick={addSheet} className="rounded-md border border-[#D2D0CE] bg-[#FFFFFF] px-3 py-1.5 text-xs font-bold hover:bg-[#E1DFDD] shadow-sm">+</button>
            {sheets.map((s, i) => (
              <button key={s.id} onClick={() => { setActiveSheetIndex(i); setActiveCell("A1"); setSelection({ r1: 0, c1: 0, r2: 0, c2: 0 }); }} className={`rounded-t-lg border px-4 py-1.5 text-xs font-bold shadow-sm min-w-[80px] ${i === activeSheetIndex ? "border-[#106EBE] bg-[#FFFFFF] text-[#106EBE] border-b-2" : "border-[#D2D0CE] bg-[#E1DFDD] text-[#000000] hover:bg-[#FFFFFF]"}`}>
                {s.name}
              </button>
            ))}
            <button onClick={renameSheet} className="rounded-md border border-[#D2D0CE] bg-white px-2 py-1.5 text-xs font-bold hover:border-[#106EBE]">Rename</button>
            <button onClick={duplicateSheet} className="rounded-md border border-[#D2D0CE] bg-white px-2 py-1.5 text-xs font-bold hover:border-[#106EBE]">Duplicate</button>
            <button onClick={deleteSheet} className="rounded-md border border-[#D2D0CE] bg-white px-2 py-1.5 text-xs font-bold hover:border-red-500 hover:text-red-600">Delete</button>
          </div>
        </div>

        {/* LibreOffice Calc Style Right Sidebar */}
        {rightSidebarOpen && (
          <aside className={`${rightSidebarUndocked ? "fixed right-5 top-28 z-[9000] h-[72vh] rounded-2xl shadow-2xl" : "relative"} flex w-[310px] shrink-0 border-l border-[#C8C6C4] bg-gradient-to-b from-[#F8F9FA] to-[#ECEFF3]`}>
            <div className="flex w-12 flex-col items-center gap-1 border-r border-[#D2D0CE] bg-[#F3F2F1] py-2">
              {sidebarPanels.map((panel) => {
                const Icon = panel.icon;
                const active = activeSidebarPanel === panel.key;
                return (
                  <button
                    key={panel.key}
                    onClick={() => setActiveSidebarPanel(panel.key)}
                    title={panel.label}
                    aria-label={panel.label}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#106EBE]/30 ${active ? "border-[#106EBE] bg-[#E5F1FB] text-[#106EBE] shadow-sm" : "border-transparent text-[#605E5C] hover:border-[#C8C6C4] hover:bg-white hover:text-[#106EBE]"}`}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>

            <div
              className="flex min-w-0 flex-1 flex-col"
              dir={rtlEnabled ? "rtl" : "ltr"}
              lang={appLocale}
            >
              <div className="flex items-center justify-between border-b border-[#D2D0CE] px-3 py-2">
                <h2 className="text-sm font-black text-[#106EBE]">
                  {sidebarPanels.find((p) => p.key === activeSidebarPanel)?.label}
                </h2>
                <button onClick={() => setRightSidebarOpen(false)} className="rounded-md p-1 text-[#605E5C] hover:bg-[#E1DFDD]" title="Collapse Sidebar" aria-label="Collapse Sidebar">
                  <Icons.ChevronRight size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-3 awm-premium-scrollbar">
                {activeSidebarPanel === "properties" && (
                  <div className="space-y-4">
                    <SidebarSection title="Cell">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <InfoPill label="Active" value={activeCell} />
                        <InfoPill label="Range" value={selectedRangeText} />
                        <InfoPill label="Rows" value={String(sheet.gridRows)} />
                        <InfoPill label="Cols" value={String(sheet.gridCols)} />
                      </div>
                    </SidebarSection>

                    <SidebarSection title="Text Properties">
                      <div className="space-y-2">
                        <select value={activeCellStyle.fontFamily || "Inter"} onChange={(e) => applyStyleToSelection({ fontFamily: e.target.value })} className="w-full rounded-md border border-[#D2D0CE] bg-white px-2 py-2 text-xs outline-none focus:border-[#106EBE]">
                          {FONT_FAMILIES.map((font) => <option key={font} value={font}>{font}</option>)}
                        </select>
                        <select value={activeCellStyle.fontSize || 12} onChange={(e) => applyStyleToSelection({ fontSize: parseInt(e.target.value, 10) })} className="w-full rounded-md border border-[#D2D0CE] bg-white px-2 py-2 text-xs outline-none focus:border-[#106EBE]">
                          {FONT_SIZES.map((size) => <option key={size} value={size}>{size}px</option>)}
                        </select>
                        <div className="grid grid-cols-3 gap-2">
                          <ToolBtn onClick={() => toggleStyle("bold")} active={!!activeCellStyle.bold}>Bold</ToolBtn>
                          <ToolBtn onClick={() => toggleStyle("italic")} active={!!activeCellStyle.italic}>Italic</ToolBtn>
                          <ToolBtn onClick={() => toggleStyle("underline")} active={!!activeCellStyle.underline}>Under</ToolBtn>
                        </div>
                      </div>
                    </SidebarSection>

                    <SidebarSection title="Page">
                      <div className="space-y-2">
                        <select value={pageSize} onChange={(e) => setPageSize(e.target.value as "A4" | "Letter" | "Legal")} className="w-full rounded-md border border-[#D2D0CE] bg-white px-2 py-2 text-xs outline-none focus:border-[#106EBE]">
                          <option value="A4">A4</option>
                          <option value="Letter">Letter</option>
                          <option value="Legal">Legal</option>
                        </select>
                        <select value={orientation} onChange={(e) => setOrientation(e.target.value as "portrait" | "landscape")} className="w-full rounded-md border border-[#D2D0CE] bg-white px-2 py-2 text-xs outline-none focus:border-[#106EBE]">
                          <option value="portrait">Portrait</option>
                          <option value="landscape">Landscape</option>
                        </select>
                      </div>
                    </SidebarSection>
                  </div>
                )}

                {activeSidebarPanel === "styles" && (
                  <div className="space-y-3">
                    <SidebarStyleButton label="Default" onClick={() => applySidebarStylePreset({ bold: false, italic: false, underline: false, color: "#000000", bg: "#FFFFFF", align: "left" }, "Default")} />
                    <SidebarStyleButton label="Heading 1" className="bg-[#106EBE] text-white" onClick={() => applySidebarStylePreset({ bold: true, fontSize: 20, color: "#FFFFFF", bg: "#106EBE" }, "Heading 1")} />
                    <SidebarStyleButton label="Heading 2" className="bg-[#E5F1FB] text-[#106EBE]" onClick={() => applySidebarStylePreset({ bold: true, fontSize: 16, color: "#106EBE", bg: "#E5F1FB" }, "Heading 2")} />
                    <SidebarStyleButton label="Good" className="bg-green-50 text-green-700" onClick={() => applySidebarStylePreset({ bold: true, color: "#107C10", bg: "#DFF6DD" }, "Good")} />
                    <SidebarStyleButton label="Bad" className="bg-red-50 text-red-700" onClick={() => applySidebarStylePreset({ bold: true, color: "#A4262C", bg: "#FDE7E9" }, "Bad")} />
                    <SidebarStyleButton label="Neutral" className="bg-gray-100 text-gray-700" onClick={() => applySidebarStylePreset({ color: "#323130", bg: "#F3F2F1" }, "Neutral")} />
                    <SidebarStyleButton label="Warning" className="bg-amber-50 text-amber-700" onClick={() => applySidebarStylePreset({ bold: true, color: "#8A6D00", bg: "#FFF4CE" }, "Warning")} />
                  </div>
                )}

                {activeSidebarPanel === "gallery" && (
                  <div className="grid grid-cols-4 gap-2">
                    {GALLERY_STAMPS.map((stamp) => (
                      <button key={stamp} onClick={() => { setCellValue(activeCell, stamp); showToast("Gallery item inserted."); }} className="flex h-14 items-center justify-center rounded-xl border border-[#D2D0CE] bg-white text-2xl shadow-sm transition-all hover:border-[#106EBE] hover:shadow-md">
                        {stamp}
                      </button>
                    ))}
                    {SPECIAL_CHARACTERS.map((ch) => (
                      <button key={ch} onClick={() => { setCellValue(activeCell, `${getRawValue(activeCell)}${ch}`); showToast("Special character inserted."); }} className="flex h-12 items-center justify-center rounded-xl border border-[#D2D0CE] bg-white text-lg shadow-sm transition-all hover:border-[#106EBE] hover:shadow-md">
                        {ch}
                      </button>
                    ))}
                  </div>
                )}

                {activeSidebarPanel === "navigator" && (
                  <div className="space-y-3">
                    <SidebarSection title="Sheets">
                      <div className="space-y-1">
                        {sheets.map((s, i) => (
                          <button key={s.id} onClick={() => { setActiveSheetIndex(i); setActiveCell("A1"); setSelection({ r1: 0, c1: 0, r2: 0, c2: 0 }); }} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-bold ${i === activeSheetIndex ? "border-[#106EBE] bg-[#E5F1FB] text-[#106EBE]" : "border-[#D2D0CE] bg-white hover:border-[#106EBE]"}`}>
                            <span>{s.name}</span>
                            <span>{s.gridRows}×{s.gridCols}</span>
                          </button>
                        ))}
                      </div>
                    </SidebarSection>
                    <SidebarSection title="Objects">
                      <button onClick={openChartWizard} className="w-full rounded-lg border border-[#D2D0CE] bg-white px-3 py-2 text-left text-xs hover:border-[#106EBE]">Charts: {sheet.charts.length}</button>
                      <button onClick={groupSelection} className="mt-2 w-full rounded-lg border border-[#D2D0CE] bg-white px-3 py-2 text-left text-xs hover:border-[#106EBE]">Group selected rows</button>
                      <button onClick={ungroupSelection} className="mt-2 w-full rounded-lg border border-[#D2D0CE] bg-white px-3 py-2 text-left text-xs hover:border-[#106EBE]">Ungroup selected rows</button>
                    </SidebarSection>
                  </div>
                )}

                {activeSidebarPanel === "functions" && (
                  <div className="space-y-2">
                    {FUNCTION_LIST.map((fn) => (
                      <button key={fn.name} onClick={() => { startEditing(activeCell, `=${fn.usage}`); showToast(`${fn.name} inserted.`); }} className="w-full rounded-xl border border-[#D2D0CE] bg-white p-3 text-left shadow-sm transition-all hover:border-[#106EBE] hover:shadow-md">
                        <p className="text-sm font-black text-[#106EBE]">{fn.name}</p>
                        <p className="mt-1 font-mono text-[11px] text-[#605E5C]">{fn.usage}</p>
                        <p className="mt-1 text-[11px] text-[#323130]">{fn.desc}</p>
                      </button>
                    ))}
                  </div>
                )}



                {activeSidebarPanel === "settings" && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium mb-2">
                      {t(appLocale, "language")}
                    </label>

                    <select
                      value={appLocale}
                      onChange={(e) => {
                        const next = e.target.value as AppLocale;
                        setAppLocale(next);
                        setRtlEnabled(isRTL(next));
                      }}
                      className="w-full rounded border px-3 py-2"
                    >
                      {Object.entries(LOCALE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>

                    <button onClick={() => { setRightSidebarOpen(false); showToast(t(appLocale, "sidebarCollapsed")); }} className="flex w-full items-center gap-2 rounded-xl border border-[#D2D0CE] bg-white px-3 py-3 text-sm font-bold hover:border-[#106EBE]">
                      <Icons.PanelRightClose size={16} /> {t(appLocale, "collapse")}
                    </button>
                    <button onClick={() => { setRightSidebarUndocked(v => !v); showToast(t(appLocale, "sidebarUndockToggled")); }} className="flex w-full items-center gap-2 rounded-xl border border-[#D2D0CE] bg-white px-3 py-3 text-sm font-bold hover:border-[#106EBE]">
                      <Icons.PanelRightOpen size={16} /> {rightSidebarUndocked ? t(appLocale, "dock") : t(appLocale, "undock")}
                    </button>
                    <button onClick={() => { setActiveSidebarPanel("properties"); showToast(t(appLocale, "sidebarCustomized")); }} className="flex w-full items-center gap-2 rounded-xl border border-[#D2D0CE] bg-white px-3 py-3 text-sm font-bold hover:border-[#106EBE]">
                      <Icons.Settings2 size={16} /> {t(appLocale, "customize")}
                    </button>

                    <div className="rounded-xl border border-[#D2D0CE] bg-white p-3 text-xs text-[#605E5C]">
                      The sidebar follows LibreOffice Calc panel order and remains fully functional with collapsible, dockable, and customizable behavior.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}


        {!rightSidebarOpen && (
          <button onClick={() => setRightSidebarOpen(true)} className="flex w-9 shrink-0 items-center justify-center border-l border-[#D2D0CE] bg-[#F3F2F1] text-[#106EBE] hover:bg-[#E5F1FB]" title="Open Sidebar" aria-label="Open Sidebar">
            <Icons.ChevronLeft size={18} />
          </button>
        )}
      </div>
      {autoFilterMenu && autoFilterDraft && (
        <AutoFilterDropdown
          refObject={autoFilterMenuRef}
          x={autoFilterMenu.x}
          y={autoFilterMenu.y}
          columnLabel={colToLetter(autoFilterMenu.col)}
          draft={autoFilterDraft}
          setDraft={setAutoFilterDraft}
          options={getColumnUniqueValues(autoFilterMenu.col)}
          bgColors={getColumnColorOptions(autoFilterMenu.col, "bg")}
          fontColors={getColumnColorOptions(autoFilterMenu.col, "font")}
          onSortAsc={() => {
            sortColumn(autoFilterMenu.col, "asc");
            setAutoFilterMenu(null);
            setAutoFilterDraft(null);
          }}
          onSortDesc={() => {
            sortColumn(autoFilterMenu.col, "desc");
            setAutoFilterMenu(null);
            setAutoFilterDraft(null);
          }}
          onSortByBg={(color) => {
            sortColumnByColor(autoFilterMenu.col, "bg", color);
            setAutoFilterMenu(null);
            setAutoFilterDraft(null);
          }}
          onSortByFont={(color) => {
            sortColumnByColor(autoFilterMenu.col, "font", color);
            setAutoFilterMenu(null);
            setAutoFilterDraft(null);
          }}
          onApply={applyAutoFilterDraft}
          onClear={clearAutoFilterColumn}
          onClose={() => {
            setAutoFilterMenu(null);
            setAutoFilterDraft(null);
          }}
        />
      )}

      {showPredictiveAnalytics && predictiveResult && (
        <Modal
          title="Predictive Analytics"
          onClose={() => setShowPredictiveAnalytics(false)}
        >
          <div className="space-y-4 text-sm text-[#201F1E]">
            <div className="rounded-xl border border-[#D2D0CE] bg-[#F8F9FA] p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#605E5C]">
                    Source Range
                  </p>
                  <p className="font-mono text-sm font-bold text-[#106EBE]">
                    {predictiveResult.range}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[#605E5C]">
                    Forecast Periods
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={predictivePeriods}
                    onChange={(e) =>
                      setPredictivePeriods(
                        Math.max(1, Math.min(24, parseInt(e.target.value || "5", 10)))
                      )
                    }
                    className="w-20 rounded-md border border-[#C8C6C4] px-2 py-1 text-xs outline-none focus:border-[#106EBE]"
                  />
                  <button
                    type="button"
                    onClick={refreshPredictiveAnalytics}
                    className="rounded-md bg-[#106EBE] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#005A9E]"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <p className="mt-3 rounded-lg bg-white p-3 text-sm font-semibold text-[#323130]">
                {predictiveResult.insight}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <InfoPill label="Count" value={String(predictiveResult.count)} />
              <InfoPill label="Average" value={String(predictiveResult.average)} />
              <InfoPill label="Min" value={String(predictiveResult.min)} />
              <InfoPill label="Max" value={String(predictiveResult.max)} />
              <InfoPill label="Trend" value={predictiveResult.trend.toUpperCase()} />
              <InfoPill label="Slope" value={String(predictiveResult.slope)} />
              <InfoPill label="R²" value={`${(predictiveResult.r2 * 100).toFixed(1)}%`} />
              <InfoPill label="Moving Avg" value={String(predictiveResult.movingAverage)} />
            </div>

            <div className="rounded-xl border border-[#D2D0CE] bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-black text-[#106EBE]">Forecast</h4>
                <button
                  type="button"
                  onClick={insertPredictiveForecastToSheet}
                  className="rounded-md border border-[#106EBE] px-3 py-1.5 text-xs font-bold text-[#106EBE] hover:bg-[#E5F1FB]"
                >
                  Insert Forecast to Sheet
                </button>
              </div>

              <div className="max-h-56 overflow-auto rounded-lg border border-[#E1DFDD] awm-premium-scrollbar">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F3F2F1]">
                      <th className="border border-[#D2D0CE] px-2 py-1 text-left">Period</th>
                      <th className="border border-[#D2D0CE] px-2 py-1 text-right">Predicted</th>
                      <th className="border border-[#D2D0CE] px-2 py-1 text-right">Low</th>
                      <th className="border border-[#D2D0CE] px-2 py-1 text-right">High</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictiveResult.forecast.map((item) => (
                      <tr key={item.period}>
                        <td className="border border-[#D2D0CE] px-2 py-1">
                          Period {item.period}
                        </td>
                        <td className="border border-[#D2D0CE] px-2 py-1 text-right font-bold text-[#107C10]">
                          {item.value}
                        </td>
                        <td className="border border-[#D2D0CE] px-2 py-1 text-right">
                          {item.low}
                        </td>
                        <td className="border border-[#D2D0CE] px-2 py-1 text-right">
                          {item.high}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-[#D2D0CE] bg-white p-3">
              <h4 className="mb-2 font-black text-[#106EBE]">Trend Visualization</h4>

              <svg viewBox="0 0 620 220" className="h-56 w-full rounded-lg bg-[#FAFAFA]">
                {(() => {
                  const actual = predictiveResult.points.map((p) => p.value);
                  const forecast = predictiveResult.forecast.map((p) => p.value);
                  const combined = [...actual, ...forecast];

                  const minV = Math.min(...combined);
                  const maxV = Math.max(...combined);
                  const span = maxV - minV || 1;

                  const toX = (i: number) =>
                    30 + (i * 560) / Math.max(1, combined.length - 1);

                  const toY = (v: number) =>
                    185 - ((v - minV) / span) * 150;

                  const actualPoints = actual
                    .map((v, i) => `${toX(i)},${toY(v)}`)
                    .join(" ");

                  const forecastPoints = forecast
                    .map((v, i) => `${toX(actual.length + i)},${toY(v)}`)
                    .join(" ");

                  return (
                    <>
                      <line x1="30" y1="20" x2="30" y2="185" stroke="#D2D0CE" />
                      <line x1="30" y1="185" x2="590" y2="185" stroke="#D2D0CE" />

                      <polyline
                        fill="none"
                        stroke="#106EBE"
                        strokeWidth="3"
                        points={actualPoints}
                      />

                      <polyline
                        fill="none"
                        stroke="#107C10"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                        points={forecastPoints}
                      />

                      {actual.map((v, i) => (
                        <circle
                          key={`a-${i}`}
                          cx={toX(i)}
                          cy={toY(v)}
                          r="4"
                          fill="#106EBE"
                        />
                      ))}

                      {forecast.map((v, i) => (
                        <circle
                          key={`f-${i}`}
                          cx={toX(actual.length + i)}
                          cy={toY(v)}
                          r="4"
                          fill="#107C10"
                        />
                      ))}

                      <text x="35" y="16" fontSize="11" fill="#605E5C">
                        Actual: blue | Forecast: green dashed
                      </text>
                    </>
                  );
                })()}
              </svg>
            </div>

            <div className="rounded-xl border border-[#D2D0CE] bg-white p-3">
              <h4 className="mb-2 font-black text-[#106EBE]">Anomaly Detection</h4>

              {predictiveResult.anomalies.length === 0 ? (
                <p className="rounded-lg bg-green-50 p-3 text-sm font-bold text-green-700">
                  No major anomalies detected.
                </p>
              ) : (
                <div className="max-h-40 overflow-auto rounded-lg border border-[#E1DFDD] awm-premium-scrollbar">
                  {predictiveResult.anomalies.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between border-b border-[#E1DFDD] px-3 py-2 text-xs"
                    >
                      <span className="font-bold text-[#A80000]">{item.key}</span>
                      <span>Value: {item.value}</span>
                      <span>Z-score: {item.zScore}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modals */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{ position: "fixed", top: contextMenu.y, left: contextMenu.x, zIndex: 9999 }}
          className="w-60 rounded-lg border border-[#D2D0CE] bg-white py-1 text-sm shadow-2xl"
        >
          {[
            { label: "Cut", onClick: () => doCopy("cut") },
            { label: "Copy", onClick: () => doCopy("copy") },
            { label: "Paste", onClick: doPaste },
            { label: "Paste Special: Values", onClick: () => doPasteSpecial("values") },
            { label: "Paste Special: Formatting", onClick: () => doPasteSpecial("formatting") },
            { label: "Insert Row", onClick: insertRowsAtSelection },
            { label: "Insert Column", onClick: insertColumnsAtSelection },
            { label: "Delete Row", onClick: removeRow },
            { label: "Delete Column", onClick: removeCol },
            { label: "Clear Contents", onClick: clearSelection },
            { label: "Clone Formatting", onClick: grabFormat },
            { label: "Clear Direct Formatting", onClick: clearFormattingOnSelection },
            { label: "Styles", onClick: () => { setActiveSidebarPanel("styles"); setRightSidebarOpen(true); } },
            { label: "Insert Comment", onClick: insertComment },
            { label: "Sparklines", onClick: insertSparkline },
            { label: "Format Cells", onClick: () => setShowFormatCells(true) },
            { label: "Merge Cells", onClick: mergeSelection },
            { label: "Unmerge Cells", onClick: unmergeSelection },
            { label: "Clear All Filters", onClick: clearAllFilters },
            { label: "Conditional Formatting", onClick: () => setShowConditionalFormatting(true) },
            { label: "Trace Precedents", onClick: tracePrecedents },
            { label: "Trace Dependents", onClick: traceDependents },
            { label: "Clear Trace Highlights", onClick: clearTrace },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => { item.onClick(); setContextMenu(null); }}
              className="block w-full px-3 py-1.5 text-left hover:bg-[#E5F1FB]"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {showFormatCells && (
        <Modal title="Format Cells" onClose={() => setShowFormatCells(false)}>
          <div className="space-y-4 text-sm">
            <div>
              <p className="mb-1 font-bold text-[#106EBE]">Number</p>
              <div className="flex flex-wrap gap-2">
                {(["general", "number", "currency", "percentage", "accounting", "scientific", "date", "text"] as NumberFormat[]).map((fmt) => (
                  <button key={fmt} onClick={() => applyStyleToSelection({ numberFormat: fmt })} className={`rounded-md border px-2 py-1 text-xs capitalize ${activeCellStyle.numberFormat === fmt ? "border-[#106EBE] bg-[#E5F1FB]" : "border-[#D2D0CE]"}`}>{fmt}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 font-bold text-[#106EBE]">Alignment</p>
              <div className="flex flex-wrap gap-2">
                {(["left", "center", "right", "justify"] as Align[]).map((a) => (
                  <button key={a} onClick={() => applyStyleToSelection({ align: a })} className={`rounded-md border px-2 py-1 text-xs capitalize ${activeCellStyle.align === a ? "border-[#106EBE] bg-[#E5F1FB]" : "border-[#D2D0CE]"}`}>{a}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 font-bold text-[#106EBE]">Font</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => applyStyleToSelection({ bold: !activeCellStyle.bold })} className={`rounded-md border px-2 py-1 text-xs ${activeCellStyle.bold ? "border-[#106EBE] bg-[#E5F1FB]" : "border-[#D2D0CE]"}`}>Bold</button>
                <button onClick={() => applyStyleToSelection({ italic: !activeCellStyle.italic })} className={`rounded-md border px-2 py-1 text-xs ${activeCellStyle.italic ? "border-[#106EBE] bg-[#E5F1FB]" : "border-[#D2D0CE]"}`}>Italic</button>
                <button onClick={() => applyStyleToSelection({ underline: !activeCellStyle.underline })} className={`rounded-md border px-2 py-1 text-xs ${activeCellStyle.underline ? "border-[#106EBE] bg-[#E5F1FB]" : "border-[#D2D0CE]"}`}>Underline</button>
              </div>
            </div>
            <div>
              <p className="mb-1 font-bold text-[#106EBE]">Border</p>
              <button onClick={toggleBorderAll} className="rounded-md border border-[#D2D0CE] px-2 py-1 text-xs">Toggle All Borders</button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowFormatCells(false)} className="rounded-md bg-[#106EBE] px-4 py-2 text-xs font-bold text-white">Done</button>
            </div>
          </div>
        </Modal>
      )}

      {showConditionalFormatting && (
        <Modal title="Conditional Formatting" onClose={() => setShowConditionalFormatting(false)}>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Range e.g. A1:A10" value={cfRange} onChange={(e) => setCfRange(e.target.value)} className="rounded-md border border-[#D2D0CE] px-2 py-1 text-xs" />
              <select value={cfCondition} onChange={(e) => setCfCondition(e.target.value as ConditionalRule["condition"])} className="rounded-md border border-[#D2D0CE] px-2 py-1 text-xs">
                <option value="greater">Greater than</option>
                <option value="less">Less than</option>
                <option value="equal">Equal to</option>
                <option value="between">Between</option>
                <option value="textContains">Text contains</option>
              </select>
              <input type="text" placeholder="Value" value={cfValue} onChange={(e) => setCfValue(e.target.value)} className="rounded-md border border-[#D2D0CE] px-2 py-1 text-xs" />
              {cfCondition === "between" && (
                <input type="text" placeholder="Second value" value={cfValue2} onChange={(e) => setCfValue2(e.target.value)} className="rounded-md border border-[#D2D0CE] px-2 py-1 text-xs" />
              )}
              <input type="color" value={cfColor} onChange={(e) => setCfColor(e.target.value)} className="h-8 w-full rounded-md border border-[#D2D0CE]" />
              <button onClick={addConditionalRule} className="rounded-md bg-[#106EBE] px-3 py-1 text-xs font-bold text-white">Add Rule</button>
            </div>
            <div className="max-h-[30vh] space-y-1 overflow-auto">
              {(sheet.conditionalRules || []).map((rule) => (
                <div key={rule.id} className="flex items-center justify-between rounded-md border border-[#D2D0CE] px-2 py-1 text-xs">
                  <span>{rule.range}: {rule.condition} {rule.value}{rule.condition === "between" ? ` - ${rule.value2}` : ""}</span>
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded" style={{ backgroundColor: rule.bg }} />
                    <button onClick={() => removeConditionalRule(rule.id)} className="text-[#A80000]">Remove</button>
                  </span>
                </div>
              ))}
              {(!sheet.conditionalRules || sheet.conditionalRules.length === 0) && <p className="text-xs text-[#605E5C]">No rules yet.</p>}
            </div>
          </div>
        </Modal>
      )}

      {showNamedRanges && (
        <Modal title="Named Ranges" onClose={() => setShowNamedRanges(false)}>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <input type="text" placeholder="Name e.g. SalesData" value={nrName} onChange={(e) => setNrName(e.target.value)} className="rounded-md border border-[#D2D0CE] px-2 py-1 text-xs" />
              <input type="text" placeholder="Range e.g. A1:B10" value={nrRange} onChange={(e) => setNrRange(e.target.value)} className="rounded-md border border-[#D2D0CE] px-2 py-1 text-xs" />
              <button onClick={addNamedRange} className="rounded-md bg-[#106EBE] px-3 py-1 text-xs font-bold text-white">Add</button>
            </div>
            <div className="max-h-[30vh] space-y-1 overflow-auto">
              {Object.entries(sheet.namedRanges || {}).map(([key, range]) => (
                <div key={key} className="flex items-center justify-between rounded-md border border-[#D2D0CE] px-2 py-1 text-xs">
                  <button onClick={() => { goToNamedRange(key); setShowNamedRanges(false); }} className="font-bold text-[#106EBE] hover:underline">{key}</button>
                  <span className="font-mono text-[#605E5C]">{range}</span>
                  <button onClick={() => removeNamedRange(key)} className="text-[#A80000]">Remove</button>
                </div>
              ))}
              {Object.keys(sheet.namedRanges || {}).length === 0 && <p className="text-xs text-[#605E5C]">No named ranges yet. Type a name into the Name Box (top-left) after adding one to jump straight to it.</p>}
            </div>
          </div>
        </Modal>
      )}

      {showFunctionWizard && (
        <Modal title="Function Wizard" onClose={() => setShowFunctionWizard(false)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="awm-premium-scrollbar max-h-[55vh] space-y-3 overflow-auto pr-2">
              {Array.from(new Set(FUNCTION_LIST.map((f) => FUNCTION_CATEGORIES[f.name] || "Other"))).map((cat) => (
                <div key={cat}>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#605E5C]">{cat}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {FUNCTION_LIST.filter((f) => (FUNCTION_CATEGORIES[f.name] || "Other") === cat).map((f) => (
                      <button
                        key={f.name}
                        onClick={() => setWizardSelected(f.name)}
                        className={`rounded-lg border p-2 text-left text-xs hover:border-[#106EBE] ${wizardSelected === f.name ? "border-[#106EBE] bg-[#E5F1FB]" : "border-[#D2D0CE] bg-[#FFFFFF]"}`}
                      >
                        <p className="font-bold text-[#106EBE]">{f.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[#D2D0CE] bg-[#F8F9FA] p-3">
              {(() => {
                const f = FUNCTION_LIST.find((x) => x.name === wizardSelected) || FUNCTION_LIST[0];
                const rangePattern = /[A-Z]+\d+:[A-Z]+\d+/;
                const refPattern = /[A-Z]+\d+/;
                let formula = f.usage;
                if (rangePattern.test(formula)) formula = formula.replace(rangePattern, selectedRangeText);
                else if (refPattern.test(formula)) formula = formula.replace(refPattern, activeCell);
                let preview: string;
                try {
                  const result = evaluateFormula(
                    formula,
                    (ref: string) => getCellValue(ref),
                    (range: string) => {
                      const nr = normalizeRange(range);
                      if (!nr) return [];
                      const out: EvalResult[] = [];
                      for (let rr = nr.r1; rr <= nr.r2; rr++) for (let cc = nr.c1; cc <= nr.c2; cc++) out.push(getCellValue(cellKey(rr, cc)));
                      return out;
                    }
                  );
                  preview = String(result);
                } catch {
                  preview = "—";
                }
                return (
                  <>
                    <p className="font-bold text-[#106EBE]">{f.name}</p>
                    <p className="mt-1 text-xs text-[#000000]">{f.desc}</p>
                    <p className="mt-2 font-mono text-xs text-[#605E5C]">Syntax: {f.usage}</p>
                    <p className="mt-2 font-mono text-xs text-[#107C10]">Live Preview: ={formula} &rarr; {preview}</p>
                    <button
                      onClick={() => { startEditing(activeCell, `=${formula}`); setShowFunctionWizard(false); }}
                      className="mt-3 w-full rounded-md bg-[#106EBE] px-3 py-2 text-xs font-bold text-white"
                    >
                      Insert Formula
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </Modal>
      )}

      {showFindReplace && (
        <Modal title="Find and Replace" onClose={() => setShowFindReplace(false)}>
          <div className="space-y-4">
            <LabeledInput label="Find" value={findText} onChange={setFindText} />
            <LabeledInput label="Replace with" value={replaceText} onChange={setReplaceText} />
            <label className="flex items-center gap-2 text-sm text-[#000000]"><input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} /> Match case</label>
            <div className="flex flex-wrap gap-2 pt-2">
              <ToolBtn onClick={findNext}>Find Next</ToolBtn>
              <ToolBtn onClick={replaceCurrent}>Replace Current</ToolBtn>
              <ToolBtn onClick={replaceAll}>Replace All</ToolBtn>
            </div>
          </div>
        </Modal>
      )}

      {showGoalSeek && (
        <Modal title="Goal Seek" onClose={() => setShowGoalSeek(false)}>
          <div className="space-y-4">
            <LabeledInput label="Target cell" value={goalTargetCell} onChange={setGoalTargetCell} placeholder="Example: C10" />
            <LabeledInput label="Target value" value={goalValue} onChange={setGoalValue} placeholder="Example: 50000" />
            <LabeledInput label="Changing cell" value={goalChangingCell} onChange={setGoalChangingCell} placeholder="Example: B4" />
            <button onClick={runGoalSeek} className="w-full rounded-xl bg-[#106EBE] text-[#FFFFFF] font-bold py-2 shadow-sm hover:bg-[#005A9E]">Solve</button>
          </div>
        </Modal>
      )}

      {showConsolidate && (
        <Modal title="Consolidate" onClose={() => setShowConsolidate(false)}>
          <div className="space-y-4">
            <LabeledInput label="Source ranges" value={consolidateRanges} onChange={setConsolidateRanges} placeholder="Example: A1:A10, C1:C10" />
            <LabeledInput label="Target cell" value={consolidateTarget} onChange={setConsolidateTarget} placeholder="Example: E1" />
            <button onClick={runConsolidate} className="w-full rounded-xl bg-[#106EBE] text-[#FFFFFF] font-bold py-2 shadow-sm hover:bg-[#005A9E]">Consolidate</button>
          </div>
        </Modal>
      )}

      {showGallery && (
        <Modal title="Gallery" onClose={() => setShowGallery(false)}>
          <div className="grid grid-cols-6 gap-3">
            {GALLERY_STAMPS.map((s) => (
              <button key={s} onClick={() => { setCellValue(activeCell, s); setShowGallery(false); }} className="flex h-14 items-center justify-center rounded-xl border border-[#D2D0CE] bg-[#FFFFFF] text-2xl hover:border-[#106EBE] text-[#000000]">{s}</button>
            ))}
          </div>
        </Modal>
      )}

      {showDataSource && (
        <Modal title="Import CSV Data Source" onClose={() => setShowDataSource(false)}>
          <div className="space-y-4">
            <p className="text-sm text-[#605E5C]">Paste CSV text. Each line is a row and commas separate columns.</p>
            <textarea value={dataSourceText} onChange={(e) => setDataSourceText(e.target.value)} rows={8} className="w-full rounded-xl border border-[#D2D0CE] bg-[#FFFFFF] p-3 font-mono text-xs outline-none focus:border-[#106EBE] text-[#000000]" placeholder={"Name,Salary,Department\nJohn,45000,Finance"} />
            <button onClick={() => importCsvText(dataSourceText)} className="w-full rounded-xl bg-[#106EBE] text-[#FFFFFF] font-bold py-2 shadow-sm hover:bg-[#005A9E]">Import</button>
          </div>
        </Modal>
      )}

      {showValidity && (
        <Modal title="Data Validation" onClose={() => setShowValidity(false)}>
          <div className="space-y-4">
            <p className="text-sm text-[#605E5C]">Enter dropdown options separated by commas.</p>
            <LabeledInput label="Options" value={validityInput} onChange={setValidityInput} placeholder="Approved, Pending, Rejected" />
            <button onClick={applyValidity} className="w-full rounded-xl bg-[#106EBE] text-[#FFFFFF] font-bold py-2 shadow-sm hover:bg-[#005A9E]">Apply</button>
          </div>
        </Modal>
      )}

      {showPrintDialog && (
        <PrintDialogModal
          onClose={() => setShowPrintDialog(false)}
          onConfirmPrint={() => {
            setShowPrintDialog(false);
            setPrintPreview(true);
            window.setTimeout(() => window.print(), 150);
          }}
          workbookName={workbookName}
          sheet={sheet}
          sheets={sheets}
          getDisplayValue={getDisplayValue}
          pageSize={pageSize}
          setPageSize={setPageSize}
          orientation={orientation}
          setOrientation={setOrientation}
        />
      )}


      {showPageSetup && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-md flex-col rounded-2xl border border-[#D2D0CE] bg-white shadow-2xl">
            <div className="border-b border-[#D2D0CE] px-6 py-4">
              <h3 className="text-lg font-black text-[#106EBE]">Page Setup</h3>
            </div>
            <div className="space-y-4 px-6 py-5 max-h-[60vh] overflow-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-[#605E5C]">Page Size</label>
                  <select value={pageSize} onChange={(e) => setPageSize(e.target.value as "A4" | "Letter" | "Legal")} className="w-full rounded-xl border border-[#D2D0CE] px-3 py-2 text-sm outline-none focus:border-[#106EBE]">
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-[#605E5C]">Orientation</label>
                  <select value={orientation} onChange={(e) => setOrientation(e.target.value as "portrait" | "landscape")} className="w-full rounded-xl border border-[#D2D0CE] px-3 py-2 text-sm outline-none focus:border-[#106EBE]">
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-[#605E5C]">Scale (%)</label>
                <input type="number" min={10} max={400} value={printScale} onChange={(e) => setPrintScale(Number(e.target.value) || 100)} className="w-full rounded-xl border border-[#D2D0CE] px-3 py-2 text-sm outline-none focus:border-[#106EBE]" />
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase text-[#605E5C]">Margins (mm)</p>
                <div className="grid grid-cols-4 gap-2">
                  <LabeledInput label="Top" value={String(printMarginTop)} onChange={(v) => setPrintMarginTop(Number(v) || 0)} />
                  <LabeledInput label="Bottom" value={String(printMarginBottom)} onChange={(v) => setPrintMarginBottom(Number(v) || 0)} />
                  <LabeledInput label="Left" value={String(printMarginLeft)} onChange={(v) => setPrintMarginLeft(Number(v) || 0)} />
                  <LabeledInput label="Right" value={String(printMarginRight)} onChange={(v) => setPrintMarginRight(Number(v) || 0)} />
                </div>
              </div>

              <LabeledInput label="Header text" value={printHeader} onChange={setPrintHeader} placeholder="e.g. AWM ERP Timesheet" />
              <LabeledInput label="Footer text" value={printFooter} onChange={setPrintFooter} placeholder="&P = page no, &N = total pages" />
              <LabeledInput label="Print area (optional, e.g. A1:F30)" value={printArea} onChange={setPrintArea} placeholder="Leave blank to print all" />
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[#D2D0CE] px-6 py-4">
              <button onClick={() => setShowPageSetup(false)} className="rounded-md border border-[#D2D0CE] px-4 py-2 text-xs font-bold hover:bg-[#F3F2F1]">Cancel</button>
              <button
                onClick={() => { setShowPageSetup(false); setPrintPreview(true); showToast("Page setup applied."); }}
                className="rounded-md bg-[#106EBE] px-4 py-2 text-xs font-bold text-white hover:bg-[#005A9E]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}


      {showChartWizard && (
        <ChartWizardModal
          step={wizardStep}
          setStep={setWizardStep}
          chartTitle={chartTitle}
          setChartTitle={setChartTitle}
          chartRange={chartRange}
          setChartRange={setChartRange}
          wizardType={wizardType}
          setWizardType={setWizardType}
          subtitle={wizardSubtitle}
          setSubtitle={setWizardSubtitle}
          xAxisTitle={wizardXAxisTitle}
          setXAxisTitle={setWizardXAxisTitle}
          yAxisTitle={wizardYAxisTitle}
          setYAxisTitle={setWizardYAxisTitle}
          showLegend={wizardShowLegend}
          setShowLegend={setWizardShowLegend}
          legendPosition={wizardLegendPosition}
          setLegendPosition={setWizardLegendPosition}
          is3D={wizard3D}
          setIs3D={setWizard3D}
          realistic={wizardRealistic}
          setRealistic={setWizardRealistic}
          shape={wizardShape}
          setShape={setWizardShape}
          series={wizardSeries}
          setSeries={setWizardSeries}
          onFinish={finishChartWizard}
          onCancel={() => setShowChartWizard(false)}
          onHelp={() => showToast("Chart Wizard: pick a type, set your data range, define series, then customize chart elements.")}
        />
      )}

      {showPivotDialog && (
        <Modal title="Pivot Table" onClose={() => setShowPivotDialog(false)}>
          <div className="space-y-4">
            <LabeledInput label="Source range with header row" value={pivotRange} onChange={setPivotRange} placeholder="A1:C10" />
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#605E5C]">Row field</label>
              <select value={pivotRowField} onChange={(e) => setPivotRowField(e.target.value)} className="w-full rounded-xl border border-[#D2D0CE] bg-[#FFFFFF] px-3 py-2 text-sm outline-none focus:border-[#106EBE] text-[#000000]">
                <option value="">-- select column --</option>
                {pivotHeaderOptions.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#605E5C]">Column field (optional)</label>
              <select value={pivotColumnField} onChange={(e) => setPivotColumnField(e.target.value)} className="w-full rounded-xl border border-[#D2D0CE] bg-[#FFFFFF] px-3 py-2 text-sm outline-none focus:border-[#106EBE] text-[#000000]">
                <option value="">(none — single total column)</option>
                {pivotHeaderOptions.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#605E5C]">Value field</label>
              <select value={pivotValueField} onChange={(e) => setPivotValueField(e.target.value)} className="w-full rounded-xl border border-[#D2D0CE] bg-[#FFFFFF] px-3 py-2 text-sm outline-none focus:border-[#106EBE] text-[#000000]">
                <option value="">-- select column --</option>
                {pivotHeaderOptions.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#605E5C]">Aggregate Function</label>
              <select value={pivotAggregate} onChange={(e) => setPivotAggregate(e.target.value as Aggregate)} className="w-full rounded-xl border border-[#D2D0CE] bg-[#FFFFFF] px-3 py-2 text-sm outline-none focus:border-[#106EBE] text-[#000000]">
                <option value="SUM">SUM</option>
                <option value="COUNT">COUNT</option>
                <option value="AVERAGE">AVERAGE</option>
                <option value="MIN">MIN</option>
                <option value="MAX">MAX</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={runPivot} className="flex-1 rounded-xl bg-[#106EBE] text-[#FFFFFF] font-bold py-2 shadow-sm hover:bg-[#005A9E]">Generate</button>
              <button onClick={insertPivotToSheet} disabled={!pivotResult.length} className="flex-1 rounded-xl border border-[#D2D0CE] bg-[#F3F2F1] text-[#000000] font-bold py-2 hover:bg-[#E1DFDD] disabled:opacity-40">Insert to Sheet</button>
            </div>
            {pivotResult.length > 0 && (
              <div className="max-h-60 overflow-auto rounded-xl border border-[#D2D0CE] bg-[#FFFFFF] awm-premium-scrollbar">
                <table className="w-full border-collapse text-xs text-[#000000]">
                  <tbody>
                    {pivotResult.map((row, r) => (
                      <tr key={r}>{row.map((v, c) => <td key={c} className={`border border-[#D2D0CE] px-2 py-1 ${r === 0 ? "font-bold bg-[#F3F2F1]" : ""}`}>{v}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showSpellCheck && (
        <Modal title="Spell Check" onClose={() => setShowSpellCheck(false)}>
          <div className="space-y-4">
            <p className="text-sm text-[#605E5C]">Browser spell checking is enabled while editing. The list below highlights uncommon English words found in text cells.</p>
            <div className="max-h-80 overflow-auto rounded-xl border border-[#D2D0CE] bg-[#FFFFFF] awm-premium-scrollbar">
              {spellIssues.length === 0 ? (
                <p className="p-3 text-sm text-green-600 font-bold">No spelling issues detected.</p>
              ) : (
                spellIssues.map((item, i) => (
                  <button key={`${item.key}_${item.word}_${i}`} onClick={() => { const pos = parseKey(item.key)!; setActiveCell(item.key); setSelection({ r1: pos.row, c1: pos.col, r2: pos.row, c2: pos.col }); setShowSpellCheck(false); }} className="flex w-full justify-between border-b border-[#D2D0CE] px-3 py-2 text-left text-sm hover:bg-[#F3F2F1] text-[#000000]">
                    <span className="font-bold">{item.word}</span>
                    <span className="text-[#605E5C]">{item.key}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}

      {showTemplatesDialog && (
        <Modal title={showTemplatesDialog === "apply" ? "New From Template" : "Edit Template"} onClose={() => setShowTemplatesDialog(null)}>
          <div className="max-h-[60vh] space-y-2 overflow-auto awm-premium-scrollbar">
            {templates.length === 0 ? (
              <p className="px-1 py-4 text-sm text-[#605E5C]">
                No templates saved yet. Use Save, then Save as Template to create one.
              </p>
            ) : (
              templates.map((tpl) => (
                <div key={tpl.id} className="flex items-center justify-between gap-2 rounded-lg border border-[#D2D0CE] bg-white px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#201F1E]">{tpl.name}</p>
                    <p className="text-xs text-[#8A8886]">{new Date(tpl.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button type="button" onClick={() => handleApplyTemplate(tpl)} className="rounded-md border border-[#106EBE] px-2 py-1 text-xs font-bold text-[#106EBE] hover:bg-[#E5F1FB]">
                      Use
                    </button>
                    <button type="button" onClick={() => handleDeleteTemplate(tpl.id)} className="rounded-md border border-[#D2D0CE] px-2 py-1 text-xs font-bold text-[#605E5C] hover:border-red-400 hover:text-red-600">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}

      {showExportDialog && (
        <Modal title="Export" onClose={() => setShowExportDialog(false)}>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => { setShowExportDialog(false); handleExportPdf(); }}
              className="flex w-full items-center gap-3 rounded-lg border border-[#D2D0CE] bg-white px-3 py-3 text-sm font-bold text-[#323130] hover:border-[#106EBE] hover:bg-[#F4F9FD]"
            >
              <Icons.FileDown size={16} /> Export as PDF
            </button>
            <button
              type="button"
              onClick={() => { setShowExportDialog(false); handleExportCsv(); }}
              className="flex w-full items-center gap-3 rounded-lg border border-[#D2D0CE] bg-white px-3 py-3 text-sm font-bold text-[#323130] hover:border-[#106EBE] hover:bg-[#F4F9FD]"
            >
              <Icons.FileSpreadsheet size={16} /> Export as CSV
            </button>
            <button
              type="button"
              onClick={() => { setShowExportDialog(false); handleSaveLocal(); }}
              className="flex w-full items-center gap-3 rounded-lg border border-[#D2D0CE] bg-white px-3 py-3 text-sm font-bold text-[#323130] hover:border-[#106EBE] hover:bg-[#F4F9FD]"
            >
              <Icons.FileSpreadsheet size={16} /> Export as XLSX
            </button>
          </div>
        </Modal>
      )}

      {showLoadDialog && (
        <Modal title="Saved Workbooks" onClose={() => setShowLoadDialog(false)}>
          <div className="max-h-[60vh] space-y-2 overflow-auto awm-premium-scrollbar">
            {savedWorkbooks.length === 0 && <p className="text-sm text-[#605E5C]">No saved workbooks found.</p>}
            {savedWorkbooks.map((s) => (
              <button key={s.id} onClick={() => loadWorkbookById(s.id)} className="flex w-full items-center justify-between rounded-xl border border-[#D2D0CE] bg-[#FFFFFF] p-3 text-left hover:border-[#106EBE] text-[#000000]">
                <span className="font-bold">{s.name}</span>
                <span className="text-xs text-[#605E5C]">{s.updatedAt ? new Date(s.updatedAt).toLocaleString() : ""}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

type BorderPreset = "none" | "left" | "right" | "top" | "bottom" | "all" | "outside" | "inside";


/* ============================================================================
 * UI primitives
 * ========================================================================== */

interface ToolbarDropdownItem {
  label: string;
  shortcut?: string;
  isDivider?: boolean;
  checked?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

interface SpreadsheetToolbarButton {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
  active?: boolean;
  kind?: ToolbarButtonKind;
  dropdownItems?: ToolbarDropdownItem[];
  dropdownExtra?: () => React.ReactNode;
}

function AutoFilterDropdown({
  refObject,
  x,
  y,
  columnLabel,
  draft,
  setDraft,
  options,
  bgColors,
  fontColors,
  onSortAsc,
  onSortDesc,
  onSortByBg,
  onSortByFont,
  onApply,
  onClear,
  onClose,
}: {
  refObject: React.RefObject<HTMLDivElement | null>;
  x: number;
  y: number;
  columnLabel: string;
  draft: AutoFilterState;
  setDraft: React.Dispatch<React.SetStateAction<AutoFilterState | null>>;
  options: AutoFilterOption[];
  bgColors: AutoFilterColorOption[];
  fontColors: AutoFilterColorOption[];
  onSortAsc: () => void;
  onSortDesc: () => void;
  onSortByBg: (color: string) => void;
  onSortByFont: (color: string) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const selectedSet = useMemo(
    () => new Set(draft.selectedValues ?? options.map((item) => item.value)),
    [draft.selectedValues, options]
  );

  const visibleOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;

    return options.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q)
    );
  }, [search, options]);

  const allVisibleSelected =
    visibleOptions.length > 0 &&
    visibleOptions.every((item) => selectedSet.has(item.value));

  const selectedCount = selectedSet.size;

  const updateSelectedValues = (next: string[]) => {
    setDraft((prev) => (prev ? { ...prev, selectedValues: next } : prev));
  };

  const toggleValue = (value: string) => {
    const next = new Set(selectedSet);

    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }

    updateSelectedValues(Array.from(next));
  };

  const toggleAllVisible = () => {
    const next = new Set(selectedSet);

    if (allVisibleSelected) {
      visibleOptions.forEach((item) => next.delete(item.value));
    } else {
      visibleOptions.forEach((item) => next.add(item.value));
    }

    updateSelectedValues(Array.from(next));
  };

  return (
    <div
      ref={refObject}
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 99999,
      }}
      className="w-[340px] overflow-hidden rounded-xl border border-[#C8C6C4] bg-white text-[#201F1E] shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-[#E1DFDD] bg-gradient-to-b from-[#FFFFFF] to-[#F3F2F1] px-3 py-2">
        <div className="flex items-center gap-2">
          <Icons.Filter size={16} className="text-[#106EBE]" />
          <span className="text-sm font-black text-[#106EBE]">
            AutoFilter: {columnLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-[#605E5C] hover:bg-[#E1DFDD]"
          aria-label="Close AutoFilter"
          title="Close"
        >
          <Icons.X size={16} />
        </button>
      </div>

      <div className="max-h-[74vh] overflow-auto p-3 awm-premium-scrollbar">
        {/* Sorting */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={onSortAsc}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[#E5F1FB]"
          >
            <Icons.ArrowUpAZ size={15} />
            Sort Ascending
          </button>

          <button
            type="button"
            onClick={onSortDesc}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[#E5F1FB]"
          >
            <Icons.ArrowDownZA size={15} />
            Sort Descending
          </button>
        </div>

        <div className="my-3 h-px bg-[#E1DFDD]" />

        {/* Sort by Background Color */}
        <details className="group rounded-lg border border-[#E1DFDD] bg-[#FAFAFA]">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-bold text-[#323130]">
            <span className="flex items-center gap-2">
              <Icons.PaintBucket size={15} />
              Sort by Background Color
            </span>
            <Icons.ChevronDown size={14} className="transition group-open:rotate-180" />
          </summary>

          <div className="border-t border-[#E1DFDD] bg-white py-1">
            {bgColors.map((item) => (
              <button
                type="button"
                key={`sort-bg-${item.color}`}
                onClick={() => onSortByBg(item.color)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-xs hover:bg-[#E5F1FB]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-4 w-4 shrink-0 rounded border border-[#C8C6C4]"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                <span className="shrink-0 text-[#8A8886]">{item.count}</span>
              </button>
            ))}
          </div>
        </details>

        {/* Sort by Font Color */}
        <details className="group mt-2 rounded-lg border border-[#E1DFDD] bg-[#FAFAFA]">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-bold text-[#323130]">
            <span className="flex items-center gap-2">
              <Icons.CaseSensitive size={15} />
              Sort by Font Color
            </span>
            <Icons.ChevronDown size={14} className="transition group-open:rotate-180" />
          </summary>

          <div className="border-t border-[#E1DFDD] bg-white py-1">
            {fontColors.map((item) => (
              <button
                type="button"
                key={`sort-font-${item.color}`}
                onClick={() => onSortByFont(item.color)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-xs hover:bg-[#E5F1FB]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-4 w-4 shrink-0 rounded border border-[#C8C6C4]"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                <span className="shrink-0 text-[#8A8886]">{item.count}</span>
              </button>
            ))}
          </div>
        </details>

        <div className="my-3 h-px bg-[#E1DFDD]" />

        {/* Filter by Condition */}
        <details className="group rounded-lg border border-[#E1DFDD] bg-[#FAFAFA]" open>
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-bold text-[#323130]">
            <span className="flex items-center gap-2">
              <Icons.Filter size={15} />
              Filter by Condition
            </span>
            <Icons.ChevronDown size={14} className="transition group-open:rotate-180" />
          </summary>

          <div className="space-y-2 border-t border-[#E1DFDD] bg-white p-3">
            <select
              value={draft.condition}
              onChange={(e) =>
                setDraft((prev) =>
                  prev
                    ? {
                      ...prev,
                      condition: e.target.value as AutoFilterCondition,
                    }
                    : prev
                )
              }
              className="w-full rounded-md border border-[#C8C6C4] bg-white px-2 py-1.5 text-sm outline-none focus:border-[#106EBE]"
            >
              <option value="none">None</option>
              <option value="empty">Empty</option>
              <option value="notEmpty">Not Empty</option>
              <option value="top10">Top 10</option>
              <option value="bottom10">Bottom 10</option>
              <option value="standard">Standard Filter</option>
            </select>

            {draft.condition === "standard" && (
              <div className="grid grid-cols-1 gap-2">
                <select
                  value={draft.standard.operator}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev
                        ? {
                          ...prev,
                          standard: {
                            ...prev.standard,
                            operator: e.target.value as AutoFilterStandardOperator,
                          },
                        }
                        : prev
                    )
                  }
                  className="w-full rounded-md border border-[#C8C6C4] bg-white px-2 py-1.5 text-sm outline-none focus:border-[#106EBE]"
                >
                  <option value="contains">Contains</option>
                  <option value="notContains">Does not contain</option>
                  <option value="equals">Equals</option>
                  <option value="notEquals">Not equals</option>
                  <option value="startsWith">Starts with</option>
                  <option value="endsWith">Ends with</option>
                  <option value="greaterThan">Greater than</option>
                  <option value="lessThan">Less than</option>
                  <option value="greaterOrEqual">Greater or equal</option>
                  <option value="lessOrEqual">Less or equal</option>
                </select>

                <input
                  type="text"
                  value={draft.standard.value}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev
                        ? {
                          ...prev,
                          standard: {
                            ...prev.standard,
                            value: e.target.value,
                          },
                        }
                        : prev
                    )
                  }
                  placeholder="Value..."
                  className="w-full rounded-md border border-[#C8C6C4] px-2 py-1.5 text-sm outline-none focus:border-[#106EBE]"
                />
              </div>
            )}
          </div>
        </details>

        {/* Filter by Background Color */}
        <details className="group mt-2 rounded-lg border border-[#E1DFDD] bg-[#FAFAFA]">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-bold text-[#323130]">
            <span className="flex items-center gap-2">
              <Icons.PaintBucket size={15} />
              Filter by Background Color
            </span>
            <Icons.ChevronDown size={14} className="transition group-open:rotate-180" />
          </summary>

          <div className="border-t border-[#E1DFDD] bg-white py-1">
            <button
              type="button"
              onClick={() =>
                setDraft((prev) => (prev ? { ...prev, bgColor: null } : prev))
              }
              className={`flex w-full items-center px-3 py-1.5 text-xs hover:bg-[#E5F1FB] ${!draft.bgColor ? "font-bold text-[#106EBE]" : ""
                }`}
            >
              No background color filter
            </button>

            {bgColors.map((item) => (
              <button
                type="button"
                key={`filter-bg-${item.color}`}
                onClick={() =>
                  setDraft((prev) =>
                    prev ? { ...prev, bgColor: item.color } : prev
                  )
                }
                className={`flex w-full items-center justify-between px-3 py-1.5 text-xs hover:bg-[#E5F1FB] ${normalizeFilterColor(draft.bgColor) === normalizeFilterColor(item.color)
                  ? "font-bold text-[#106EBE]"
                  : ""
                  }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-4 w-4 shrink-0 rounded border border-[#C8C6C4]"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                <span className="shrink-0 text-[#8A8886]">{item.count}</span>
              </button>
            ))}
          </div>
        </details>

        {/* Filter by Font Color */}
        <details className="group mt-2 rounded-lg border border-[#E1DFDD] bg-[#FAFAFA]">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-bold text-[#323130]">
            <span className="flex items-center gap-2">
              <Icons.CaseSensitive size={15} />
              Filter by Font Color
            </span>
            <Icons.ChevronDown size={14} className="transition group-open:rotate-180" />
          </summary>

          <div className="border-t border-[#E1DFDD] bg-white py-1">
            <button
              type="button"
              onClick={() =>
                setDraft((prev) => (prev ? { ...prev, fontColor: null } : prev))
              }
              className={`flex w-full items-center px-3 py-1.5 text-xs hover:bg-[#E5F1FB] ${!draft.fontColor ? "font-bold text-[#106EBE]" : ""
                }`}
            >
              No font color filter
            </button>

            {fontColors.map((item) => (
              <button
                type="button"
                key={`filter-font-${item.color}`}
                onClick={() =>
                  setDraft((prev) =>
                    prev ? { ...prev, fontColor: item.color } : prev
                  )
                }
                className={`flex w-full items-center justify-between px-3 py-1.5 text-xs hover:bg-[#E5F1FB] ${normalizeFilterColor(draft.fontColor) === normalizeFilterColor(item.color)
                  ? "font-bold text-[#106EBE]"
                  : ""
                  }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-4 w-4 shrink-0 rounded border border-[#C8C6C4]"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                <span className="shrink-0 text-[#8A8886]">{item.count}</span>
              </button>
            ))}
          </div>
        </details>

        <div className="my-3 h-px bg-[#E1DFDD]" />

        {/* Search + Checkbox Values */}
        <div className="rounded-lg border border-[#E1DFDD] bg-white">
          <div className="border-b border-[#E1DFDD] p-2">
            <div className="flex items-center gap-2 rounded-md border border-[#C8C6C4] px-2 py-1.5">
              <Icons.Search size={14} className="text-[#605E5C]" />
              <input
                autoFocus
                dir="ltr"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search values..."
                className="w-full bg-transparent text-sm outline-none"
                style={{ direction: "ltr", unicodeBidi: "plaintext" }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    onClose();
                  }

                  if (e.key === "Enter") {
                    onApply();
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-[#E1DFDD] px-3 py-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleAllVisible}
              />
              Select All
            </label>

            <span className="text-xs text-[#605E5C]">
              {selectedCount}/{options.length}
            </span>
          </div>

          <div className="max-h-56 overflow-auto py-1 awm-premium-scrollbar">
            {visibleOptions.length === 0 ? (
              <div className="px-3 py-3 text-xs text-[#605E5C]">
                No matching values.
              </div>
            ) : (
              visibleOptions.map((item) => (
                <label
                  key={`filter-value-${item.value}`}
                  className="flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-sm hover:bg-[#F3F2F1]"
                  title={item.label}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(item.value)}
                      onChange={() => toggleValue(item.value)}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>

                  <span className="shrink-0 text-xs text-[#8A8886]">
                    {item.count}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex items-center justify-between border-t border-[#E1DFDD] bg-[#F8F8F8] px-3 py-2">
        <button
          type="button"
          onClick={onClear}
          className="rounded-md border border-[#C8C6C4] bg-white px-3 py-1.5 text-xs font-bold text-[#605E5C] hover:border-red-400 hover:text-red-600"
        >
          Clear
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#C8C6C4] bg-white px-3 py-1.5 text-xs font-bold hover:bg-[#F3F2F1]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onApply}
            className="rounded-md bg-[#106EBE] px-4 py-1.5 text-xs font-black text-white hover:bg-[#005A9E]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function SpreadsheetToolbarIconButton({ button }: { button: SpreadsheetToolbarButton }) {
  const Icon = button.icon;
  return (
    <button
      type="button"
      onClick={button.onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          button.onClick();
        }
      }}
      title={button.label}
      aria-label={button.label}
      aria-pressed={button.kind === "toggle" ? !!button.active : undefined}
      className={`group relative flex h-8 w-8 items-center justify-center rounded-md border text-[#323130] shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#106EBE]/30 ${button.active
        ? "border-[#106EBE] bg-[#E5F1FB] text-[#106EBE] shadow-[inset_0_0_0_1px_rgba(16,110,190,0.12)]"
        : "border-transparent bg-transparent hover:border-[#C8C6C4] hover:bg-white hover:text-[#106EBE] hover:shadow-md"
        }`}
    >
      <Icon size={17} className="transition-transform duration-150 group-hover:scale-110" />
      <span className="pointer-events-none absolute left-1/2 top-full z-[9999] mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#201F1E] px-2 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:block">
        {button.label}
      </span>
    </button>
  );
}

function SpreadsheetToolbarSplitButton({
  button,
  open,
  onToggle,
  onClose,
}: {
  button: SpreadsheetToolbarButton;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const Icon = button.icon;
  const items = button.dropdownItems || [];
  return (
    <div className="relative flex items-stretch">
      <button
        type="button"
        onClick={button.onClick}
        title={button.label}
        aria-label={button.label}
        className="group relative flex h-8 w-8 items-center justify-center rounded-l-md border border-r-0 border-transparent bg-transparent text-[#323130] shadow-sm transition-all duration-150 hover:border-[#C8C6C4] hover:bg-white hover:text-[#106EBE] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#106EBE]/30"
      >
        <Icon size={17} className="transition-transform duration-150 group-hover:scale-110" />
        <span className="pointer-events-none absolute left-1/2 top-full z-[9999] mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#201F1E] px-2 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:block">
          {button.label}
        </span>
      </button>
      <button
        type="button"
        onClick={onToggle}
        title={`${button.label} options`}
        aria-label={`${button.label} options`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-8 w-4 items-center justify-center rounded-r-md border text-[#605E5C] shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#106EBE]/30 ${open
          ? "border-[#106EBE] bg-[#E5F1FB] text-[#106EBE]"
          : "border-transparent bg-transparent hover:border-[#C8C6C4] hover:bg-white hover:text-[#106EBE] hover:shadow-md"
          }`}
      >
        <Icons.ChevronDown size={11} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[9990]" aria-hidden="true" onClick={onClose} />
          <div
            role="menu"
            className="absolute left-0 top-full z-[9991] mt-1 w-64 overflow-hidden rounded-md border border-[#D2D0CE] bg-white py-1 shadow-2xl"
          >
            {button.dropdownExtra ? button.dropdownExtra() : null}
            {items.map((item, idx) =>
              item.isDivider ? (
                <div key={`div-${idx}`} className="my-1 h-px bg-[#E1DFDD]" />
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    onClose();
                    item.onClick?.();
                  }}
                  className="flex w-full items-center justify-between gap-4 px-3 py-1.5 text-left text-[13px] text-[#323130] hover:bg-[#E5F1FB] hover:text-[#106EBE] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex items-center gap-2">
                    {item.checked && <Icons.Check size={13} className="text-[#106EBE]" />}
                    <span className={item.checked ? "" : "pl-[21px]"}>{item.label}</span>
                  </span>
                  {item.shortcut && <span className="text-[11px] text-[#8A8886]">{item.shortcut}</span>}
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ColorToolbarButton({ label, icon: Icon, value, onChange }: { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; value: string; onChange: (value: string) => void }) {
  return (
    <label className="group relative flex h-8 w-9 cursor-pointer items-center justify-center rounded-md border border-transparent text-[#323130] transition-all hover:border-[#C8C6C4] hover:bg-white hover:text-[#106EBE] hover:shadow-md" title={label} aria-label={label}>
      <Icon size={17} />
      <span className="absolute bottom-1 h-[3px] w-5 rounded-full" style={{ backgroundColor: value }} />
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={label} />
      <span className="pointer-events-none absolute left-1/2 top-full z-[9999] mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#201F1E] px-2 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:block">
        {label}
      </span>
    </label>
  );
}

function ToolbarSeparator() {
  return <span className="mx-[2px] h-6 w-px bg-[#C8C6C4]" aria-hidden="true" />;
}

function ToolGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-[#D2D0CE] bg-[#F3F2F1] px-2 py-1 shadow-sm">
      <span className="mr-1 hidden text-[10px] font-bold uppercase tracking-wide text-[#605E5C] lg:inline">{label}</span>
      {children}
    </div>
  );
}

function ToolBtn({ children, onClick, active }: { children: React.ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={`h-8 rounded-lg border px-3 text-xs font-bold transition-all shadow-sm ${active ? "border-[#106EBE] bg-[#E5F1FB] text-[#106EBE]" : "border-[#D2D0CE] bg-[#FFFFFF] text-[#000000] hover:bg-[#F3F2F1] hover:border-[#106EBE]"}`}>
      {children}
    </button>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[#D2D0CE] bg-white p-3 shadow-sm">
      <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-[#605E5C]">{title}</h3>
      {children}
    </section>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#E1DFDD] bg-[#FAFAFA] p-2">
      <p className="text-[10px] font-bold uppercase text-[#605E5C]">{label}</p>
      <p className="mt-1 truncate font-mono text-xs text-[#106EBE]">{value}</p>
    </div>
  );
}

function SidebarStyleButton({ label, onClick, className = "" }: { label: string; onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`w-full rounded-xl border border-[#D2D0CE] bg-white px-4 py-3 text-left text-sm font-black shadow-sm transition-all hover:border-[#106EBE] hover:shadow-md ${className}`}>
      {label}
    </button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-[#D2D0CE] bg-[#FFFFFF] p-6 text-[#000000] shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-[#D2D0CE] pb-3">
          <h3 className="text-lg font-black text-[#106EBE]">{title}</h3>
          <button onClick={onClose} className="rounded-lg border border-[#D2D0CE] bg-[#F3F2F1] px-3 py-1 text-sm font-bold hover:bg-[#E1DFDD] text-[#000000]">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase text-[#605E5C]">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-[#D2D0CE] bg-[#FFFFFF] px-3 py-2 text-sm outline-none focus:border-[#106EBE] text-[#000000]" />
    </div>
  );
}

function ChartWizardModal({
  step, setStep,
  chartTitle, setChartTitle,
  chartRange, setChartRange,
  wizardType, setWizardType,
  subtitle, setSubtitle,
  xAxisTitle, setXAxisTitle,
  yAxisTitle, setYAxisTitle,
  showLegend, setShowLegend,
  legendPosition, setLegendPosition,
  is3D, setIs3D,
  realistic, setRealistic,
  shape, setShape,
  series, setSeries,
  onFinish, onCancel, onHelp,
}: {
  step: number; setStep: (n: number) => void;
  chartTitle: string; setChartTitle: (v: string) => void;
  chartRange: string; setChartRange: (v: string) => void;
  wizardType: ChartType; setWizardType: (v: ChartType) => void;
  subtitle: string; setSubtitle: (v: string) => void;
  xAxisTitle: string; setXAxisTitle: (v: string) => void;
  yAxisTitle: string; setYAxisTitle: (v: string) => void;
  showLegend: boolean; setShowLegend: (v: boolean) => void;
  legendPosition: "right" | "top" | "bottom" | "left" | "none"; setLegendPosition: (v: "right" | "top" | "bottom" | "left" | "none") => void;
  is3D: boolean; setIs3D: (v: boolean) => void;
  realistic: boolean; setRealistic: (v: boolean) => void;
  shape: "cylinder" | "cone" | "pyramid"; setShape: (v: "cylinder" | "cone" | "pyramid") => void;
  series: ChartSeries[]; setSeries: React.Dispatch<React.SetStateAction<ChartSeries[]>>;
  onFinish: () => void; onCancel: () => void; onHelp: () => void;
}) {
  const STEPS = ["Chart Type", "Data Range", "Data Series", "Chart Elements"];

  const addSeriesRow = () => {
    setSeries((prev) => [...prev, { id: `s_${Date.now()}`, name: `Series ${prev.length + 1}`, range: "" }]);
  };
  const removeSeriesRow = (id: string) => {
    setSeries((prev) => prev.filter((s) => s.id !== id));
  };
  const updateSeriesRow = (id: string, patch: Partial<ChartSeries>) => {
    setSeries((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-3xl flex-col rounded-2xl border border-[#D2D0CE] bg-white text-[#000000] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#D2D0CE] px-6 py-4">
          <h3 className="text-lg font-black text-[#106EBE]">Chart Wizard</h3>
          <span className="text-xs font-bold text-[#605E5C]">Step {step} of 4: {STEPS[step - 1]}</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 border-b border-[#D2D0CE] px-6 py-3">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <div key={label} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(n)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${active ? "bg-[#106EBE] text-white" : done ? "bg-[#DFF6DD] text-[#107C10]" : "bg-[#F3F2F1] text-[#605E5C]"}`}
                >
                  {n}. {label}
                </button>
                {n < STEPS.length && <span className="text-[#D2D0CE]">—</span>}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="max-h-[55vh] overflow-auto px-6 py-5">
          {step === 1 && (
            <div>
              <p className="mb-3 text-sm font-bold text-[#323130]">Choose a Chart Type</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {CHART_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setWizardType(opt.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-bold ${wizardType === opt.value ? "border-[#106EBE] bg-[#E5F1FB] text-[#106EBE]" : "border-[#D2D0CE] bg-white text-[#323130] hover:border-[#106EBE]"}`}
                  >
                    <Icons.ChartColumnBig size={22} />
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-[#D2D0CE] bg-[#F8F9FA] p-4">
                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 text-sm font-bold">
                    <input type="checkbox" checked={is3D} onChange={(e) => setIs3D(e.target.checked)} />
                    3D Look
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bold">
                    <input type="checkbox" checked={realistic} onChange={(e) => setRealistic(e.target.checked)} />
                    Realistic
                  </label>
                </div>

                {is3D && (
                  <div className="mt-3 flex flex-wrap gap-4 border-t border-[#E1DFDD] pt-3">
                    <p className="w-full text-xs font-bold uppercase text-[#605E5C]">Shape</p>
                    {(["cylinder", "cone", "pyramid"] as const).map((s) => (
                      <label key={s} className="flex items-center gap-2 text-sm capitalize">
                        <input type="radio" name="wizard-shape" checked={shape === s} onChange={() => setShape(s)} />
                        {s}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <LabeledInput label="Chart title" value={chartTitle} onChange={setChartTitle} />
              <LabeledInput label="Data range" value={chartRange} onChange={setChartRange} placeholder="A1:B5" />
              <p className="text-xs text-[#605E5C]">Include the header row in your range so labels can be read from the first column.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-[#323130]">Data Series</p>
              {series.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <input
                    value={s.name}
                    onChange={(e) => updateSeriesRow(s.id, { name: e.target.value })}
                    placeholder="Series name"
                    className="w-40 rounded-md border border-[#D2D0CE] px-2 py-1.5 text-xs outline-none focus:border-[#106EBE]"
                  />
                  <input
                    value={s.range}
                    onChange={(e) => updateSeriesRow(s.id, { range: e.target.value })}
                    placeholder="Series range e.g. B2:B10"
                    className="flex-1 rounded-md border border-[#D2D0CE] px-2 py-1.5 text-xs outline-none focus:border-[#106EBE]"
                  />
                  <button type="button" onClick={() => removeSeriesRow(s.id)} className="rounded-md border border-[#D2D0CE] px-2 py-1.5 text-xs text-red-600 hover:border-red-400">Remove</button>
                </div>
              ))}
              <button type="button" onClick={addSeriesRow} className="rounded-md border border-[#106EBE] px-3 py-1.5 text-xs font-bold text-[#106EBE] hover:bg-[#E5F1FB]">
                + Add Series
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <LabeledInput label="Subtitle" value={subtitle} onChange={setSubtitle} />
              <LabeledInput label="X axis title" value={xAxisTitle} onChange={setXAxisTitle} />
              <LabeledInput label="Y axis title" value={yAxisTitle} onChange={setYAxisTitle} />
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={showLegend} onChange={(e) => setShowLegend(e.target.checked)} />
                Show Legend
              </label>
              {showLegend && (
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-[#605E5C]">Legend Position</label>
                  <select
                    value={legendPosition}
                    onChange={(e) => setLegendPosition(e.target.value as typeof legendPosition)}
                    className="w-full rounded-xl border border-[#D2D0CE] bg-white px-3 py-2 text-sm outline-none focus:border-[#106EBE]"
                  >
                    <option value="right">Right</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="none">None</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between border-t border-[#D2D0CE] px-6 py-4">
          <button type="button" onClick={onHelp} className="rounded-md border border-[#D2D0CE] px-4 py-2 text-xs font-bold hover:bg-[#F3F2F1]">
            Help
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onCancel} className="rounded-md border border-[#D2D0CE] px-4 py-2 text-xs font-bold hover:bg-[#F3F2F1]">
              Cancel
            </button>
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep(Math.max(1, step - 1))}
              className="rounded-md border border-[#D2D0CE] px-4 py-2 text-xs font-bold hover:bg-[#F3F2F1] disabled:opacity-40"
            >
              &lt; Back
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(Math.min(4, step + 1))}
                className="rounded-md bg-[#106EBE] px-4 py-2 text-xs font-bold text-white hover:bg-[#005A9E]"
              >
                Next &gt;
              </button>
            ) : (
              <button
                type="button"
                onClick={onFinish}
                className="rounded-md bg-[#107C10] px-4 py-2 text-xs font-bold text-white hover:bg-[#0E6E0E]"
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



function ChartView({ type, data }: { type: ChartType; data: { label: string; value: number }[] }) {
  const width = 640;
  const height = 260;
  const max = Math.max(1, ...data.map((d) => Math.abs(d.value)));
  const min = Math.min(0, ...data.map((d) => d.value));
  const colors = ["#106EBE", "#0078D4", "#00B294", "#FFB900", "#D83B01", "#E3008C", "#8764B8", "#00CC6A"];

  if (!data.length) return <div className="text-sm text-[#605E5C]">No chart data available.</div>;

  const plotLeft = 40;
  const plotRight = width - 20;
  const plotBottom = height - 35;
  const plotTop = 15;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  const xAt = (i: number) => plotLeft + (i * plotW) / Math.max(1, data.length - 1);
  const yAt = (v: number) => plotBottom - ((Math.abs(v)) / max) * plotH;

  const axes = (
    <>
      <line x1={plotLeft} y1={plotTop} x2={plotLeft} y2={plotBottom} stroke="#D2D0CE" />
      <line x1={plotLeft} y1={plotBottom} x2={plotRight} y2={plotBottom} stroke="#D2D0CE" />
    </>
  );

  const xLabels = data.map((d, i) => (
    <text key={i} x={xAt(i)} y={height - 12} fill="#605E5C" fontSize="10" textAnchor="middle">
      {d.label.slice(0, 8)}
    </text>
  ));

  /* ---------------------------------------------------------- PIE ---------------------------------------------------------- */
  if (type === "pie" || type === "ofpie") {
    const total = data.reduce((a, b) => a + Math.abs(b.value), 0) || 1;
    let acc = 0;
    const cx = type === "ofpie" ? 130 : 160;
    const cy = 125;
    const r = 90;

    const slices = data.map((d, i) => {
      const value = Math.abs(d.value);
      const start = (acc / total) * Math.PI * 2;
      acc += value;
      const end = (acc / total) * Math.PI * 2;
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      const large = end - start > Math.PI ? 1 : 0;
      return { d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, i };
    });

    // Of-Pie: break the smallest slice out into a secondary mini pie beside the main one
    let breakout: { d: { label: string; value: number }; path: string; i: number }[] = [];
    if (type === "ofpie" && data.length > 1) {
      const smallest = [...data].sort((a, b) => Math.abs(a.value) - Math.abs(b.value))[0];
      const bTotal = Math.abs(smallest.value) || 1;
      const bcx = 420;
      const bcy = 125;
      const br = 55;
      // simulate a breakdown into 2 illustrative parts of the smallest slice
      const parts = [
        { label: `${smallest.label} (a)`, value: bTotal * 0.6 },
        { label: `${smallest.label} (b)`, value: bTotal * 0.4 },
      ];
      let bacc = 0;
      breakout = parts.map((p, i) => {
        const start = (bacc / bTotal) * Math.PI * 2;
        bacc += p.value;
        const end = (bacc / bTotal) * Math.PI * 2;
        const x1 = bcx + br * Math.cos(start);
        const y1 = bcy + br * Math.sin(start);
        const x2 = bcx + br * Math.cos(end);
        const y2 = bcy + br * Math.sin(end);
        const large = end - start > Math.PI ? 1 : 0;
        return { d: p, path: `M ${bcx} ${bcy} L ${x1} ${y1} A ${br} ${br} 0 ${large} 1 ${x2} ${y2} Z`, i };
      });
    }

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        {slices.map((s) => (
          <path key={s.i} d={s.path} fill={colors[s.i % colors.length]} stroke="#FFFFFF" strokeWidth="1" />
        ))}
        {breakout.map((s, idx) => (
          <path key={`b-${idx}`} d={s.path} fill={colors[(s.i + 4) % colors.length]} stroke="#FFFFFF" strokeWidth="1" />
        ))}
        {type === "ofpie" && breakout.length > 0 && (
          <line x1={cx + r} y1={cy} x2={420 - 55} y2={125} stroke="#8A8886" strokeDasharray="3 3" />
        )}
        {data.map((d, i) => (
          <text key={i} x={type === "ofpie" ? 250 : 330} y={20 + i * 18} fill="#000000" fontSize="11">
            <tspan fill={colors[i % colors.length]}>■</tspan> {d.label}: {d.value}
          </text>
        ))}
      </svg>
    );
  }

  /* ---------------------------------------------------------- LINE / AREA ---------------------------------------------------------- */
  if (type === "line" || type === "area") {
    const points = data.map((d, i) => `${xAt(i)},${yAt(d.value)}`).join(" ");
    const areaPath = `M ${xAt(0)},${plotBottom} L ${points.split(" ").join(" L ")} L ${xAt(data.length - 1)},${plotBottom} Z`;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        {axes}
        {type === "area" && <path d={areaPath} fill="#106EBE" fillOpacity="0.18" stroke="none" />}
        <polyline fill="none" stroke="#106EBE" strokeWidth="3" points={points} />
        {data.map((d, i) => (
          <circle key={i} cx={xAt(i)} cy={yAt(d.value)} r="4" fill="#0078D4" />
        ))}
        {xLabels}
      </svg>
    );
  }

  /* ---------------------------------------------------------- XY SCATTER ---------------------------------------------------------- */
  if (type === "xyscatter") {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        {axes}
        {data.map((d, i) => (
          <circle key={i} cx={xAt(i)} cy={yAt(d.value)} r="5" fill={colors[i % colors.length]} stroke="#FFFFFF" strokeWidth="1" />
        ))}
        {xLabels}
      </svg>
    );
  }

  /* ---------------------------------------------------------- BUBBLE ---------------------------------------------------------- */
  if (type === "bubble") {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        {axes}
        {data.map((d, i) => {
          const radius = 4 + (Math.abs(d.value) / max) * 22;
          return (
            <circle
              key={i}
              cx={xAt(i)}
              cy={yAt(d.value)}
              r={radius}
              fill={colors[i % colors.length]}
              fillOpacity="0.55"
              stroke={colors[i % colors.length]}
              strokeWidth="1.5"
            />
          );
        })}
        {xLabels}
      </svg>
    );
  }

  /* ---------------------------------------------------------- NET (RADAR) ---------------------------------------------------------- */
  if (type === "net") {
    const cx = width / 2;
    const cy = 130;
    const radius = 95;
    const n = data.length;
    const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

    const rings = [0.25, 0.5, 0.75, 1].map((f, ri) => {
      const ringPoints = data
        .map((_, i) => {
          const a = angleFor(i);
          return `${cx + radius * f * Math.cos(a)},${cy + radius * f * Math.sin(a)}`;
        })
        .join(" ");
      return <polygon key={ri} points={ringPoints} fill="none" stroke="#E1DFDD" strokeWidth="1" />;
    });

    const spokes = data.map((_, i) => {
      const a = angleFor(i);
      return (
        <line key={i} x1={cx} y1={cy} x2={cx + radius * Math.cos(a)} y2={cy + radius * Math.sin(a)} stroke="#E1DFDD" strokeWidth="1" />
      );
    });

    const dataPoints = data
      .map((d, i) => {
        const a = angleFor(i);
        const f = Math.abs(d.value) / max;
        return `${cx + radius * f * Math.cos(a)},${cy + radius * f * Math.sin(a)}`;
      })
      .join(" ");

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        {rings}
        {spokes}
        <polygon points={dataPoints} fill="#106EBE" fillOpacity="0.25" stroke="#106EBE" strokeWidth="2" />
        {data.map((d, i) => {
          const a = angleFor(i);
          const f = Math.abs(d.value) / max;
          return <circle key={i} cx={cx + radius * f * Math.cos(a)} cy={cy + radius * f * Math.sin(a)} r="4" fill="#106EBE" />;
        })}
        {data.map((d, i) => {
          const a = angleFor(i);
          const lx = cx + (radius + 16) * Math.cos(a);
          const ly = cy + (radius + 16) * Math.sin(a);
          return (
            <text key={i} x={lx} y={ly} fill="#605E5C" fontSize="10" textAnchor="middle">
              {d.label.slice(0, 8)}
            </text>
          );
        })}
      </svg>
    );
  }

  /* ---------------------------------------------------------- STOCK (HIGH-LOW-CLOSE style) ---------------------------------------------------------- */
  if (type === "stock") {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        {axes}
        {data.map((d, i) => {
          const x = xAt(i);
          const closeY = yAt(d.value);
          const highY = yAt(d.value * 1.08);
          const lowY = yAt(d.value * 0.9);
          const up = d.value >= 0;
          return (
            <g key={i}>
              <line x1={x} y1={highY} x2={x} y2={lowY} stroke={up ? "#107C10" : "#A80000"} strokeWidth="1.5" />
              <line x1={x - 6} y1={yAt(d.value * 0.97)} x2={x} y2={yAt(d.value * 0.97)} stroke={up ? "#107C10" : "#A80000"} strokeWidth="2" />
              <line x1={x} y1={closeY} x2={x + 6} y2={closeY} stroke={up ? "#107C10" : "#A80000"} strokeWidth="2" />
            </g>
          );
        })}
        {xLabels}
      </svg>
    );
  }

  /* ---------------------------------------------------------- COLUMN AND LINE (combo) ---------------------------------------------------------- */
  if (type === "columnline") {
    const barWidth = Math.max(14, plotW / data.length - 10);
    const linePoints = data.map((d, i) => `${xAt(i)},${yAt(d.value)}`).join(" ");
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        {axes}
        {data.map((d, i) => {
          const barHeight = (Math.abs(d.value) / max) * plotH;
          const x = xAt(i) - barWidth / 2;
          const y = plotBottom - barHeight;
          return <rect key={i} x={x} y={y} width={barWidth} height={barHeight} rx="3" fill="#B4D6EE" />;
        })}
        <polyline fill="none" stroke="#D83B01" strokeWidth="3" points={linePoints} />
        {data.map((d, i) => (
          <circle key={i} cx={xAt(i)} cy={yAt(d.value)} r="4" fill="#D83B01" />
        ))}
        {xLabels}
      </svg>
    );
  }

  /* ---------------------------------------------------------- BAR (horizontal) ---------------------------------------------------------- */
  if (type === "bar") {
    const rowH = Math.max(14, (height - 30) / data.length - 8);
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        <line x1={plotLeft} y1={plotTop} x2={plotLeft} y2={height - 15} stroke="#D2D0CE" />
        {data.map((d, i) => {
          const barWidth = (Math.abs(d.value) / max) * (width - plotLeft - 30);
          const y = 20 + i * (rowH + 8);
          return (
            <g key={i}>
              <rect x={plotLeft} y={y} width={barWidth} height={rowH} rx="3" fill={colors[i % colors.length]} />
              <text x={plotLeft - 6} y={y + rowH / 2 + 4} fill="#605E5C" fontSize="10" textAnchor="end">
                {d.label.slice(0, 10)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  /* ---------------------------------------------------------- COLUMN (default, vertical bars) ---------------------------------------------------------- */
  const barWidth = Math.max(16, plotW / data.length - 8);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
      {axes}
      {data.map((d, i) => {
        const barHeight = (Math.abs(d.value) / max) * plotH;
        const x = xAt(i) - barWidth / 2;
        const y = plotBottom - barHeight;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill={colors[i % colors.length]} />
          </g>
        );
      })}
      {xLabels}
    </svg>
  );
}



function formatLocaleNumber(value: number, locale: AppLocale): string {
  const localeMap: Record<AppLocale, string> = {
    en: "en-US",
    bn: "bn-BD",
    ar: "ar-SA",
    hi: "hi-IN",
    es: "es-ES",
  };

  try {
    return new Intl.NumberFormat(localeMap[locale], {
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return String(value);
  }
}

function formatLocaleDate(value: Date, locale: AppLocale): string {
  const localeMap: Record<AppLocale, string> = {
    en: "en-US",
    bn: "bn-BD",
    ar: "ar-SA",
    hi: "hi-IN",
    es: "es-ES",
  };

  try {
    return new Intl.DateTimeFormat(localeMap[locale], {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(value);
  } catch {
    return value.toISOString().slice(0, 10);
  }
}

const PRINT_PAPER_SIZES: Record<string, { w: number; h: number; label: string }> = {
  Letter: { w: 216, h: 279, label: "Letter (8.50in x 11.00in)" },
  Legal: { w: 216, h: 356, label: "Legal (8.50in x 14.00in)" },
  A4: { w: 210, h: 297, label: "A4 (8.27in x 11.69in)" },
  A5: { w: 148, h: 210, label: "A5 (5.83in x 8.27in)" },
  Executive: { w: 184, h: 267, label: "Executive (7.25in x 10.50in)" },
};

function PrintDialogModal({
  onClose,
  onConfirmPrint,
  workbookName,
  sheet,
  sheets,
  getDisplayValue,
  pageSize,
  setPageSize,
  orientation,
  setOrientation,
}: {
  onClose: () => void;
  onConfirmPrint: () => void;
  workbookName: string;
  sheet: WorkbookSheet;
  sheets: WorkbookSheet[];
  getDisplayValue: (key: string) => string;
  pageSize: "A4" | "Letter" | "Legal";
  setPageSize: (v: "A4" | "Letter" | "Legal") => void;
  orientation: "portrait" | "landscape";
  setOrientation: (v: "portrait" | "landscape") => void;
}) {
  const [activeTab, setActiveTab] = useState<"general" | "advanced">("general");
  const [printerName, setPrinterName] = useState("Print to File (PDF)");
  const [pageSelection, setPageSelection] = useState<"all" | "pages" | "selection">("all");
  const [pagesInput, setPagesInput] = useState("1-1");
  const [copies, setCopies] = useState(1);
  const [collate, setCollate] = useState(true);
  const [duplex, setDuplex] = useState<"one" | "both-long" | "both-short">("one");
  const [dialogOrientation, setDialogOrientation] = useState<"automatic" | "portrait" | "landscape">(orientation);
  const [pagesPerSheet, setPagesPerSheet] = useState<"1" | "2" | "4" | "6" | "9" | "16" | "custom">("1");
  const [pageOrder, setPageOrder] = useState("Left to right, then down");
  const [drawBorder, setDrawBorder] = useState(false);
  const [suppressEmptyPages, setSuppressEmptyPages] = useState(true);
  const [printOnlySelectedSheets, setPrintOnlySelectedSheets] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [zoom, setZoom] = useState(80);
  const [pageIndex, setPageIndex] = useState(1);

  const dims = PRINT_PAPER_SIZES[pageSize] || PRINT_PAPER_SIZES.A4;
  const effectiveOrientation = dialogOrientation === "automatic" ? orientation : dialogOrientation;
  const pageW = effectiveOrientation === "landscape" ? dims.h : dims.w;
  const pageH = effectiveOrientation === "landscape" ? dims.w : dims.h;

  const previewRows = Math.min(sheet.gridRows, 18);
  const previewCols = Math.min(sheet.gridCols, 9);

  const handlePrinterOrientationChange = (v: "automatic" | "portrait" | "landscape") => {
    setDialogOrientation(v);
    if (v !== "automatic") setOrientation(v);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#D2D0CE] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#D2D0CE] bg-gradient-to-b from-[#F9FAFB] to-[#ECEFF3] px-6 py-3">
          <h3 className="text-lg font-black text-[#106EBE]">Print</h3>
          <span className="text-xs text-[#605E5C]">{workbookName}</span>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Left: Live Preview */}
          <div className="flex min-h-0 w-[55%] flex-col border-r border-[#D2D0CE] bg-[#3B3A39]">
            <div className="flex items-center justify-between gap-2 border-b border-black/30 bg-[#2B2A29] px-3 py-2">
              <label className="flex items-center gap-2 text-xs font-bold text-white">
                <input type="checkbox" checked={previewEnabled} onChange={(e) => setPreviewEnabled(e.target.checked)} />
                Preview
              </label>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setPageIndex((p) => Math.max(1, p - 1))} className="rounded border border-white/20 px-2 py-1 text-xs text-white hover:bg-white/10" disabled={pageIndex <= 1}>‹</button>
                <span className="text-xs text-white">Page {pageIndex} of 1</span>
                <button type="button" onClick={() => setPageIndex((p) => Math.min(1, p + 1))} className="rounded border border-white/20 px-2 py-1 text-xs text-white hover:bg-white/10" disabled>›</button>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setZoom((z) => Math.max(30, z - 10))} className="rounded border border-white/20 px-2 py-1 text-xs text-white hover:bg-white/10">-</button>
                <span className="w-10 text-center text-xs text-white">{zoom}%</span>
                <button type="button" onClick={() => setZoom((z) => Math.min(200, z + 10))} className="rounded border border-white/20 px-2 py-1 text-xs text-white hover:bg-white/10">+</button>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center overflow-auto p-6">
              {!previewEnabled ? (
                <p className="text-sm text-white/60">Preview disabled.</p>
              ) : (
                <div
                  className="overflow-hidden bg-white shadow-2xl"
                  style={{
                    width: pageW * (zoom / 100) * 3.78,
                    height: pageH * (zoom / 100) * 3.78,
                    padding: 12 * (zoom / 100),
                    border: drawBorder ? "1px solid #999" : "none",
                  }}
                >
                  <table className="w-full border-collapse text-[10px]" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}>
                    <tbody>
                      {Array.from({ length: previewRows }, (_, r) => (
                        <tr key={r}>
                          {Array.from({ length: previewCols }, (_, c) => (
                            <td key={c} className="border border-[#D2D0CE] px-1 py-0.5 text-[#000000]">
                              {getDisplayValue(cellKey(r, c))}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right: Settings Panel */}
          <div className="flex min-h-0 w-[45%] flex-col">
            <div className="flex border-b border-[#D2D0CE]">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`flex-1 px-4 py-2 text-sm font-bold ${activeTab === "general" ? "border-b-2 border-[#106EBE] text-[#106EBE]" : "text-[#605E5C] hover:bg-[#F3F2F1]"}`}
              >
                General
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("advanced")}
                className={`flex-1 px-4 py-2 text-sm font-bold ${activeTab === "advanced" ? "border-b-2 border-[#106EBE] text-[#106EBE]" : "text-[#605E5C] hover:bg-[#F3F2F1]"}`}
              >
                awmerp / Advanced
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4 text-sm awm-premium-scrollbar">
              {activeTab === "general" && (
                <>
                  <div className="rounded-lg border border-[#D2D0CE] p-3">
                    <p className="mb-2 text-xs font-black uppercase text-[#605E5C]">Printer</p>
                    <select value={printerName} onChange={(e) => setPrinterName(e.target.value)} className="w-full rounded-md border border-[#D2D0CE] px-2 py-1.5 text-sm outline-none focus:border-[#106EBE]">
                      <option>Print to File (PDF)</option>
                      <option>Default Printer</option>
                      <option>HP Smart Tank 580-590 series</option>
                      <option>Microsoft Print to PDF</option>
                    </select>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-[#605E5C]">Status: Default printer</span>
                      <button type="button" className="rounded-md border border-[#D2D0CE] px-3 py-1 text-xs font-bold hover:bg-[#F3F2F1]">Properties</button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#D2D0CE] p-3">
                    <p className="mb-2 text-xs font-black uppercase text-[#605E5C]">Range and Copies</p>
                    <div className="space-y-1">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="pageSelection" checked={pageSelection === "all"} onChange={() => setPageSelection("all")} />
                        All Pages
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="pageSelection" checked={pageSelection === "pages"} onChange={() => setPageSelection("pages")} />
                        Pages
                        <input
                          type="text"
                          value={pagesInput}
                          onChange={(e) => setPagesInput(e.target.value)}
                          disabled={pageSelection !== "pages"}
                          placeholder="1-28"
                          className="ml-1 w-24 rounded-md border border-[#D2D0CE] px-2 py-1 text-xs outline-none focus:border-[#106EBE] disabled:opacity-40"
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="pageSelection" checked={pageSelection === "selection"} onChange={() => setPageSelection("selection")} />
                        Selection / Active Sheet
                      </label>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <label className="text-xs font-bold text-[#605E5C]">Number of copies</label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={copies}
                        onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value || "1", 10)))}
                        className="w-16 rounded-md border border-[#D2D0CE] px-2 py-1 text-xs outline-none focus:border-[#106EBE]"
                      />
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={collate} onChange={(e) => setCollate(e.target.checked)} disabled={copies <= 1} />
                      Collate
                    </label>
                    <div className="mt-2">
                      <label className="mb-1 block text-xs font-bold text-[#605E5C]">Paper Sides</label>
                      <select value={duplex} onChange={(e) => setDuplex(e.target.value as typeof duplex)} className="w-full rounded-md border border-[#D2D0CE] px-2 py-1.5 text-sm outline-none focus:border-[#106EBE]">
                        <option value="one">Print One Side</option>
                        <option value="both-long">Print on Both Sides (Long Edge)</option>
                        <option value="both-short">Print on Both Sides (Short Edge)</option>
                      </select>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#D2D0CE] p-3">
                    <p className="mb-2 text-xs font-black uppercase text-[#605E5C]">Page Layout</p>
                    <div className="space-y-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-[#605E5C]">Paper size</label>
                        <select value={pageSize} onChange={(e) => setPageSize(e.target.value as "A4" | "Letter" | "Legal")} className="w-full rounded-md border border-[#D2D0CE] px-2 py-1.5 text-sm outline-none focus:border-[#106EBE]">
                          {Object.entries(PRINT_PAPER_SIZES).map(([key, v]) => (
                            <option key={key} value={key}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-[#605E5C]">Orientation</label>
                        <select value={dialogOrientation} onChange={(e) => handlePrinterOrientationChange(e.target.value as typeof dialogOrientation)} className="w-full rounded-md border border-[#D2D0CE] px-2 py-1.5 text-sm outline-none focus:border-[#106EBE]">
                          <option value="automatic">Automatic</option>
                          <option value="portrait">Portrait</option>
                          <option value="landscape">Landscape</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-[#605E5C]">Pages per sheet</label>
                        <select value={pagesPerSheet} onChange={(e) => setPagesPerSheet(e.target.value as typeof pagesPerSheet)} className="w-full rounded-md border border-[#D2D0CE] px-2 py-1.5 text-sm outline-none focus:border-[#106EBE]">
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="4">4</option>
                          <option value="6">6</option>
                          <option value="9">9</option>
                          <option value="16">16</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      {pagesPerSheet !== "1" && (
                        <div>
                          <label className="mb-1 block text-xs font-bold text-[#605E5C]">Order</label>
                          <select value={pageOrder} onChange={(e) => setPageOrder(e.target.value)} className="w-full rounded-md border border-[#D2D0CE] px-2 py-1.5 text-sm outline-none focus:border-[#106EBE]">
                            <option>Left to right, then down</option>
                            <option>Top to bottom, then right</option>
                            <option>Top to bottom, then left</option>
                            <option>Right to left, then down</option>
                          </select>
                        </div>
                      )}
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={drawBorder} onChange={(e) => setDrawBorder(e.target.checked)} />
                        Draw a border around each page
                      </label>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "advanced" && (
                <div className="rounded-lg border border-[#D2D0CE] p-3 space-y-2">
                  <p className="mb-1 text-xs font-black uppercase text-[#605E5C]">awmerp Options</p>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={suppressEmptyPages} onChange={(e) => setSuppressEmptyPages(e.target.checked)} />
                    Suppress output of empty pages
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={printOnlySelectedSheets} onChange={(e) => setPrintOnlySelectedSheets(e.target.checked)} />
                    Print Only Selected Sheets ({sheets.length} sheet{sheets.length > 1 ? "s" : ""} in workbook)
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#D2D0CE] bg-[#F9FAFB] px-6 py-4">
          <button type="button" className="rounded-md border border-[#D2D0CE] px-4 py-2 text-xs font-bold hover:bg-[#F3F2F1]">Help</button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="rounded-md border border-[#D2D0CE] px-4 py-2 text-xs font-bold hover:bg-[#F3F2F1]">Cancel</button>
            <button type="button" onClick={onConfirmPrint} className="rounded-md bg-[#106EBE] px-6 py-2 text-xs font-bold text-white hover:bg-[#005A9E]">Print</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function isRTL(locale: AppLocale): boolean {
  return locale === "ar";
}
