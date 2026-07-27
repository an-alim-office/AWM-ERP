"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Icons from "lucide-react";

/* ============================================================================
 * AWM Excel Studio — Enterprise Spreadsheet Module
 * Frontend-only page. All cloud/database operations are performed through
 * secure Next.js API routes. No database connection logic is used here.
 * ========================================================================== */

type Align = "left" | "center" | "right" | "justify";
type VerticalAlign = "top" | "middle" | "bottom";
type ChartType = "bar" | "line" | "pie";
type Aggregate = "SUM" | "COUNT" | "AVERAGE" | "MIN" | "MAX";
type NumberFormat = "general" | "currency" | "percentage" | "number" | "date";

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
  fontFamily?: string;
  fontSize?: number;
  borders?: CellBorders;
  borderStyle?: "solid" | "dashed" | "dotted" | "double";
  borderColor?: string;
  wrap?: boolean;
  numberFormat?: NumberFormat;
  decimals?: number;
  indent?: number;
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
}

type CellMap = Record<string, CellData>;

interface GroupRange {
  id: string;
  start: number;
  end: number;
  collapsed: boolean;
}

interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  range: string;
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
      { label: "New", action: "FILE_NEW" },
      { label: "Open...", shortcut: "Ctrl+O", action: "FILE_OPEN" },
      { label: "Open Remote...", action: "FILE_OPEN_REMOTE" },
      { label: "Recent Documents", action: "FILE_RECENT_DOCS" },
      { label: "Close", action: "FILE_CLOSE" },
      { label: "Wizards", action: "FILE_WIZARDS" },
      { label: "Templates", action: "FILE_TEMPLATES" },
      { label: "Reload", action: "FILE_RELOAD" },
      { label: "Versions...", action: "FILE_VERSIONS" },
      { label: "Save", shortcut: "Ctrl+S", action: "FILE_SAVE" },
      { label: "Save As...", shortcut: "Ctrl+Shift+S", action: "FILE_SAVE_AS" },
      { label: "Save Remote...", action: "FILE_SAVE_REMOTE" },
      { label: "Save a Copy...", action: "FILE_SAVE_COPY" },
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

const DEFAULT_ROWS = 30;
const DEFAULT_COLS = 12;
const MAX_ROWS = 500;
const MAX_COLS = 52;
const DEFAULT_COL_WIDTH = 120;
const DEFAULT_ROW_HEIGHT = 36;
const ROW_HEADER_WIDTH = 52;
const HEADER_HEIGHT = 30;

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

const GALLERY_STAMPS = ["✔", "✖", "★", "⚠", "📌", "🏢", "💰", "📈", "📉", "🕒", "✍", "📎"];

const SPECIAL_CHARACTERS = ["Ω", "≈", "≠", "≤", "≥", "÷", "×", "±", "©", "®", "™", "€", "£", "¥", "₹", "✓", "★", "→", "←", "↑", "↓"];

const BORDER_STYLE_OPTIONS: CellStyle["borderStyle"][] = ["solid", "dashed", "dotted", "double"];

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

/* ============================================================================
 * Main component
 * ========================================================================== */

export default function ExcelStudioPage() {
  const [workbookName, setWorkbookName] = useState("Untitled Workbook");
  const [workbookId, setWorkbookId] = useState<string | null>(null);
  const [sheets, setSheets] = useState<WorkbookSheet[]>([createSheet("Sheet 1")]);
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

  const [pivotRange, setPivotRange] = useState("A1:C10");
  const [pivotRowField, setPivotRowField] = useState("");
  const [pivotColumnField, setPivotColumnField] = useState("");
  const [pivotValueField, setPivotValueField] = useState("");
  const [pivotAggregate, setPivotAggregate] = useState<Aggregate>("SUM");
  const [pivotResult, setPivotResult] = useState<string[][]>([]);

  const [showGridLines, setShowGridLines] = useState(true);
  const [printPreview, setPrintPreview] = useState(false);
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

  const selectedRangeText = useMemo(() => {
    const r1 = Math.min(selection.r1, selection.r2);
    const r2 = Math.max(selection.r1, selection.r2);
    const c1 = Math.min(selection.c1, selection.c2);
    const c2 = Math.max(selection.c1, selection.c2);
    return `${cellKey(r1, c1)}:${cellKey(r2, c2)}`;
  }, [selection]);

  const activeCellStyle = sheet.cells[activeCell]?.style || {};
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

    if (numberFormat === "date") {
   const date = (rawValue as any) instanceof Date ? (rawValue as unknown as Date) : new Date(String(rawValue));
      if (!Number.isNaN(date.getTime())) return date.toLocaleDateString();
      return String(rawValue);
    }

    const numeric = typeof rawValue === "number" ? rawValue : parseFloat(String(rawValue).replace(/,/g, ""));
    if (Number.isFinite(numeric)) {
      if (numberFormat === "currency") {
        return numeric.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      }
      if (numberFormat === "percentage") {
        return `${(numeric * 100).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
      }
      if (numberFormat === "number") {
        return numeric.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
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
    const up = () => (dragging.current = false);
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  useEffect(() => {
    setFormulaBar(getRawValue(activeCell));
  }, [activeCell, getRawValue]);

  const handleMouseDown = (row: number, col: number) => {
    const key = cellKey(row, col);
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
    if (dragging.current) setSelection((prev) => ({ ...prev, r2: row, c2: col }));
  };

  const commitEdit = useCallback(
    (moveDir: "down" | "right" | "none" = "down") => {
      if (editingKey) setCellValue(editingKey, editValue);
      setEditingKey(null);
      if (moveDir === "down") {
        const pos = parseKey(activeCell)!;
        const nr = Math.min(pos.row + 1, sheet.gridRows - 1);
        setActiveCell(cellKey(nr, pos.col));
        setSelection({ r1: nr, c1: pos.col, r2: nr, c2: pos.col });
      } else if (moveDir === "right") {
        const pos = parseKey(activeCell)!;
        const nc = Math.min(pos.col + 1, sheet.gridCols - 1);
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

  const doPaste = () => {
    if (!clipboard) {
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

  const sortByActiveColumn = (direction?: "asc" | "desc") => {
    const col = activePos.col;
    const currentDirection = direction || sortDir;
    const rowsData = Array.from({ length: sheet.gridRows }, (_, row) => ({ row, val: getCellValue(cellKey(row, col)) }));
    const sorted = [...rowsData].sort((a, b) => {
      const an = typeof a.val === "number" ? a.val : parseFloat(String(a.val));
      const bn = typeof b.val === "number" ? b.val : parseFloat(String(b.val));
      const cmp = !Number.isNaN(an) && !Number.isNaN(bn) ? an - bn : String(a.val).localeCompare(String(b.val));
      return currentDirection === "asc" ? cmp : -cmp;
    });
    updateSheet((s) => {
      const snapshot = sorted.map(({ row }) => Array.from({ length: s.gridCols }, (_, c) => s.cells[cellKey(row, c)] || { value: "" }));
      const next = { ...s.cells };
      snapshot.forEach((rowCells, r) => rowCells.forEach((data, c) => (next[cellKey(r, c)] = data)));
      return { cells: next };
    });
    setSortDir(currentDirection === "asc" ? "desc" : "asc");
    showToast(`Sorted ${currentDirection === "asc" ? "ascending" : "descending"} by column ${colToLetter(col)}.`);
  };

  const applyFilterToColumn = (col: number, text: string) => {
    const newFilters = { ...sheet.filters, [col]: text };
    const hidden: number[] = [];
    for (let r = 0; r < sheet.gridRows; r++) {
      let visible = true;
      Object.entries(newFilters).forEach(([c, t]) => {
        if (!t) return;
        const val = getDisplayValue(cellKey(r, parseInt(c, 10))).toLowerCase();
        if (!val.includes(String(t).toLowerCase())) visible = false;
      });
      if (!visible) hidden.push(r);
    }
    updateSheet({ filters: newFilters, hiddenRows: hidden });
  };

  const toggleAutoFilter = () => {
    const col = activePos.col;
    const existing = sheet.filters[col] || "";
    const text = window.prompt(`Filter column ${colToLetter(col)} contains:`, existing);
    if (text === null) return;
    applyFilterToColumn(col, text);
    showToast(text ? "AutoFilter applied." : "AutoFilter cleared.");
  };

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
    const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
    const parsedRows = lines.map((line) => line.split(","));
    const neededRows = parsedRows.length;
    const neededCols = Math.max(1, ...parsedRows.map((r) => r.length));
    updateSheet((s) => {
      const next = { ...s.cells };
      parsedRows.forEach((row, r) => row.forEach((val, c) => (next[cellKey(r, c)] = { value: val.trim(), style: { wrap: true } })));
      return { cells: next, gridRows: Math.max(s.gridRows, Math.min(neededRows, MAX_ROWS)), gridCols: Math.max(s.gridCols, Math.min(neededCols, MAX_COLS)) };
    });
    setShowDataSource(false);
    showToast("CSV data imported.");
  };

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

  const onFileSelected = async (file: File) => {
    if (file.name.endsWith(".csv")) {
      importCsvText(await file.text());
      return;
    }
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const importedSheets: WorkbookSheet[] = wb.SheetNames.map((name: string) => {
        const ws = wb.Sheets[name];
        const json: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
        const sh = createSheet(name);
        sh.gridRows = Math.max(DEFAULT_ROWS, Math.min(json.length || DEFAULT_ROWS, MAX_ROWS));
        sh.gridCols = Math.max(DEFAULT_COLS, Math.min(Math.max(1, ...json.map((r) => r.length)), MAX_COLS));
        json.forEach((row, r) => row.forEach((val, c) => {
          if (val !== undefined && val !== null && val !== "") sh.cells[cellKey(r, c)] = { value: String(val), style: { wrap: true } };
        }));
        return sh;
      });
      setSheets(importedSheets.length ? importedSheets : [createSheet("Sheet 1")]);
      setActiveSheetIndex(0);
      setWorkbookName(file.name.replace(/\.[^/.]+$/, ""));
      showToast("Workbook loaded.");
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
    setSaveState("saving");
    try {
      const res = await fetch("/api/excel/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildWorkbookSnapshot()),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      if (data.id) setWorkbookId(data.id);
      setSaveState("saved");
      showToast("Saved to cloud.");
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
      XLSX.writeFile(wb, `${workbookName || "workbook"}.xlsx`);
      showToast("Workbook downloaded.");
    } catch {
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
    } catch {
      showToast("Native local save was cancelled or failed.");
    }
  };

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

  const addChart = () => {
    updateSheet((s) => ({
      charts: [...s.charts, { id: `chart_${Date.now()}`, title: chartTitle, type: chartType, range: chartRange }],
    }));
    setShowChartDialog(false);
    showToast("Chart created.");
  };

  const runPivot = () => {
    const nr = normalizeRange(pivotRange);
    if (!nr) {
      showToast("Pivot range is invalid.");
      return;
    }
    const headers: string[] = [];
    for (let c = nr.c1; c <= nr.c2; c++) headers.push(String(getDisplayValue(cellKey(nr.r1, c))));
    const rowIndex = headers.indexOf(pivotRowField);
    const colIndex = headers.indexOf(pivotColumnField);
    const valIndex = headers.indexOf(pivotValueField);
    if (rowIndex < 0 || colIndex < 0 || valIndex < 0) {
      showToast("Pivot fields must match the header row.");
      return;
    }
    const map = new Map<string, Map<string, number[]>>();
    const colKeys = new Set<string>();
    for (let r = nr.r1 + 1; r <= nr.r2; r++) {
      const rowKey = getDisplayValue(cellKey(r, nr.c1 + rowIndex)) || "(blank)";
      const colKey = getDisplayValue(cellKey(r, nr.c1 + colIndex)) || "(blank)";
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
      case "FILE_SAVE_COPY":
        handleSaveNative();
        break;
      case "FILE_EXPORT_PDF":
        handleExportPdf();
        break;
      case "FILE_PRINT":
        window.print();
        break;
      case "FILE_PRINT_PREVIEW":
        togglePrintPreview();
        break;
      case "FILE_OPEN_REMOTE":
      case "FILE_RECENT_DOCS":
        openLoadDialog();
        break;
      case "FILE_CLOSE":
        showToast("Workbook close requested.");
        break;
      case "EDIT_UNDO":
      case "EDIT_REDO":
      case "EDIT_REPEAT":
        showToast("Action mapped. History state not fully implemented in current scope.");
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
      case "VIEW_GRID_LINES":
        setShowGridLines((v) => !v);
        showToast("Grid lines toggled.");
        break;
      case "VIEW_SIDEBAR":
        setRightSidebarOpen((v) => !v);
        showToast("Sidebar toggled.");
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
        setChartRange(selectedRangeText);
        setShowChartDialog(true);
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
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
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

  const pageDims = PAGE_SIZES[pageSize];
  const pageWmm = orientation === "portrait" ? pageDims.w : pageDims.h;

  const leftOffset = (col: number) => ROW_HEADER_WIDTH + Array.from({ length: col }, (_, i) => sheet.colWidths[i] || DEFAULT_COL_WIDTH).reduce((a, b) => a + b, 0);
  const topOffset = (row: number) => HEADER_HEIGHT + Array.from({ length: row }, (_, i) => sheet.rowHeights[i] || DEFAULT_ROW_HEIGHT).reduce((a, b) => a + b, 0);

  const standardToolbarButtons: SpreadsheetToolbarButton[] = [
    { label: "New Document", icon: Icons.FilePlus2, onClick: () => handleToolbarAction("New Document", handleNewFile) },
    { label: "Open", icon: Icons.FolderOpen, onClick: () => handleToolbarAction("Open", () => fileInputRef.current?.click()) },
    { label: "Save", icon: Icons.Save, onClick: () => handleToolbarAction("Save", handleSaveCloud) },
    { label: "Export Directly as PDF", icon: Icons.FileDown, onClick: () => handleToolbarAction("Export Directly as PDF", handleExportPdf) },
    { label: "Print", icon: Icons.Printer, onClick: () => handleToolbarAction("Print", () => window.print()) },
    { label: "Toggle Print Preview", icon: Icons.ScanSearch, active: printPreview, kind: "toggle", onClick: () => handleToolbarAction("Toggle Print Preview", togglePrintPreview) },
    { label: "Cut", icon: Icons.Scissors, onClick: () => handleToolbarAction("Cut", () => doCopy("cut")) },
    { label: "Copy", icon: Icons.Copy, onClick: () => handleToolbarAction("Copy", () => doCopy("copy")) },
    { label: "Paste", icon: Icons.ClipboardPaste, onClick: () => handleToolbarAction("Paste", doPaste) },
    { label: "Clone Formatting", icon: Icons.Paintbrush, active: !!formatPainter, kind: "toggle", onClick: () => handleToolbarAction("Clone Formatting", grabFormat) },
    { label: "Undo", icon: Icons.Undo2, onClick: () => handleToolbarAction("Undo", () => showToast("Undo action requested.")) },
    { label: "Redo", icon: Icons.Redo2, onClick: () => handleToolbarAction("Redo", () => showToast("Redo action requested.")) },
    { label: "Find and Replace", icon: Icons.Search, onClick: () => handleToolbarAction("Find and Replace", () => setShowFindReplace(true)) },
    { label: "Spelling", icon: Icons.SpellCheck, onClick: () => handleToolbarAction("Spelling", () => setShowSpellCheck(true)) },
    { label: "Toggle Grid Lines", icon: Icons.Grid3X3, active: showGridLines, kind: "toggle", onClick: () => handleToolbarAction("Toggle Grid Lines", () => { setShowGridLines(v => !v); showToast("Grid lines toggled."); }) },
    { label: "Insert Rows", icon: Icons.Rows3, onClick: () => handleToolbarAction("Insert Rows", insertRowsAtSelection) },
    { label: "Insert Columns", icon: Icons.Columns3, onClick: () => handleToolbarAction("Insert Columns", insertColumnsAtSelection) },
    { label: "Delete Rows", icon: Icons.PanelTopClose, onClick: () => handleToolbarAction("Delete Rows", removeRow) },
    { label: "Delete Columns", icon: Icons.PanelRightClose, onClick: () => handleToolbarAction("Delete Columns", removeCol) },
    { label: "Sort Ascending", icon: Icons.ArrowUpAZ, onClick: () => handleToolbarAction("Sort Ascending", () => sortByActiveColumn("asc")) },
    { label: "Sort Descending", icon: Icons.ArrowDownZA, onClick: () => handleToolbarAction("Sort Descending", () => sortByActiveColumn("desc")) },
    { label: "AutoFilter", icon: Icons.Filter, onClick: () => handleToolbarAction("AutoFilter", toggleAutoFilter) },
    { label: "Insert Image", icon: Icons.ImagePlus, onClick: () => handleToolbarAction("Insert Image", () => imageInputRef.current?.click()) },
    { label: "Insert Chart", icon: Icons.ChartColumnBig, onClick: () => handleToolbarAction("Insert Chart", () => { setChartRange(selectedRangeText); setShowChartDialog(true); }) },
    { label: "Insert Pivot Table", icon: Icons.TableProperties, onClick: () => handleToolbarAction("Insert Pivot Table", () => setShowPivotDialog(true)) },
    { label: "Insert Special Character", icon: Icons.Omega, onClick: () => handleToolbarAction("Insert Special Character", insertSpecialCharacter) },
    { label: "Insert Hyperlink", icon: Icons.Link, onClick: () => handleToolbarAction("Insert Hyperlink", insertHyperlink) },
    { label: "Insert Comment", icon: Icons.MessageSquarePlus, onClick: () => handleToolbarAction("Insert Comment", insertComment) },
    { label: "Show Draw Functions", icon: Icons.PenTool, active: showDrawFunctions, kind: "toggle", onClick: () => handleToolbarAction("Show Draw Functions", () => { setShowDrawFunctions(v => !v); showToast("Draw functions toggled."); }) },
    { label: "Split Window", icon: Icons.SplitSquareHorizontal, active: splitWindow, kind: "toggle", onClick: () => handleToolbarAction("Split Window", toggleSplitWindow) },
   { label: "Freeze Rows and Columns", icon: Icons.Snowflake, active: sheet.frozenRows > 0 || sheet.frozenCols > 0, kind: "toggle", onClick: () => handleToolbarAction("Freeze Rows and Columns", toggleFreezeRowsAndColumns) },
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
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] font-sans flex flex-col overflow-hidden">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #awm-print-area, #awm-print-area * { visibility: visible; }
          #awm-print-area { position: absolute; left: 0; top: 0; width: ${pageWmm}mm; max-height: none !important; overflow: visible !important; }
          @page { size: ${pageSize} ${orientation}; margin: 10mm; }
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
                        key={item.label}
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

      {/* LibreOffice Calc Style Enterprise Toolbar */}
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
          <div className="ml-auto hidden items-center gap-2 rounded-lg border border-[#C8C6C4] bg-gradient-to-b from-white to-[#EDEBE9] px-3 py-1 text-xs font-black text-[#3B3A39] shadow-sm md:flex">
            <Icons.Crown size={16} className="text-amber-500" />
            VIP Premium Edition
          </div>
        </div>

        {/* Row 1: Standard Toolbar */}
        <div className="flex flex-wrap items-center gap-[3px] border-b border-[#D2D0CE] px-2 py-1">
          {standardToolbarButtons.map((button, index) => (
            <React.Fragment key={button.label}>
              <SpreadsheetToolbarIconButton button={button} />
              {[2, 5, 8, 10, 13, 14, 18, 21, 24, 27].includes(index) && <ToolbarSeparator />}
            </React.Fragment>
          ))}
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
          <SpreadsheetToolbarIconButton button={{ label: "Currency", icon: Icons.CircleDollarSign, active: activeCellStyle.numberFormat === "currency", kind: "toggle", onClick: () => applyNumberFormat("currency") }} />
          <SpreadsheetToolbarIconButton button={{ label: "Percentage", icon: Icons.Percent, active: activeCellStyle.numberFormat === "percentage", kind: "toggle", onClick: () => applyNumberFormat("percentage") }} />
          <SpreadsheetToolbarIconButton button={{ label: "Number", icon: Icons.Binary, active: activeCellStyle.numberFormat === "number", kind: "toggle", onClick: () => applyNumberFormat("number") }} />
          <SpreadsheetToolbarIconButton button={{ label: "Date", icon: Icons.CalendarDays, active: activeCellStyle.numberFormat === "date", kind: "toggle", onClick: () => applyNumberFormat("date") }} />
          <SpreadsheetToolbarIconButton button={{ label: "Increase Decimal", icon: Icons.Plus, onClick: () => adjustDecimals(1) }} />
          <SpreadsheetToolbarIconButton button={{ label: "Decrease Decimal", icon: Icons.Minus, onClick: () => adjustDecimals(-1) }} />
          <ToolbarSeparator />
          <SpreadsheetToolbarIconButton button={{ label: "Increase Indent", icon: Icons.IndentIncrease, onClick: () => adjustIndent(1) }} />
          <SpreadsheetToolbarIconButton button={{ label: "Decrease Indent", icon: Icons.IndentDecrease, onClick: () => adjustIndent(-1) }} />
          <SpreadsheetToolbarIconButton button={{ label: "Borders", icon: Icons.Square, active: !!activeCellStyle.borders, kind: "toggle", onClick: toggleBorderAll }} />
          <select
            value={activeCellStyle.borderStyle || "solid"}
            onChange={(e) => { applyStyleToSelection({ borderStyle: e.target.value as CellStyle["borderStyle"] }); showToast("Border style applied."); }}
            className="h-8 w-[98px] rounded-md border border-[#C8C6C4] bg-white px-2 text-xs shadow-inner outline-none hover:border-[#106EBE] focus:border-[#106EBE]"
            title="Border Style"
            aria-label="Border Style"
          >
            {BORDER_STYLE_OPTIONS.map((style) => <option key={style} value={style}>{style}</option>)}
          </select>
          <ColorToolbarButton label="Border Color" icon={Icons.SquareDashedBottom} value={activeCellStyle.borderColor || "#000000"} onChange={(borderColor) => { applyStyleToSelection({ borderColor }); showToast("Border color applied."); }} />
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
                const pos = parseKey((e.currentTarget as HTMLInputElement).value.toUpperCase());
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
          <button onClick={autoSum} className="h-8 rounded-md px-2 text-xl font-bold text-[#3B3A39] hover:bg-[#E5F1FB] focus:outline-none focus:ring-2 focus:ring-[#106EBE]/30" title="Sum" aria-label="Sum">Σ</button>
          <button onClick={insertFunctionFromToolbar} className="h-8 rounded-md px-2 text-lg hover:bg-[#E5F1FB] focus:outline-none focus:ring-2 focus:ring-[#106EBE]/30" title="Insert Function" aria-label="Insert Function">😊</button>
          <textarea
            spellCheck
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
        <div className={`flex min-w-0 flex-1 flex-col ${printPreview ? "bg-[#A19F9D] p-6" : ""}`}>
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
          <div id="awm-print-area" className={`flex-1 overflow-auto bg-[#F3F2F1] relative awm-premium-scrollbar ${printPreview ? "mx-auto w-full max-w-6xl rounded-xl bg-white shadow-2xl" : ""}`}>
            <table className="border-collapse table-fixed text-sm bg-[#FFFFFF]">
              <thead>
                <tr>
                  <th className="sticky left-0 top-0 z-40 border border-[#D2D0CE] bg-[#106EBE] px-2 py-1 text-xs text-[#FFFFFF] shadow-sm" style={{ width: ROW_HEADER_WIDTH, minWidth: ROW_HEADER_WIDTH, height: HEADER_HEIGHT }}>
                    #
                  </th>
                  {columns.map((c) => {
                    const frozen = c < sheet.frozenCols;
                    return (
                      <th key={c} className="relative border border-[#D2D0CE] bg-[#106EBE] px-2 py-1 text-xs font-bold text-[#FFFFFF] shadow-sm" style={{ width: sheet.colWidths[c] || DEFAULT_COL_WIDTH, minWidth: sheet.colWidths[c] || DEFAULT_COL_WIDTH, height: HEADER_HEIGHT, position: frozen ? "sticky" : "sticky", top: 0, left: frozen ? leftOffset(c) : undefined, zIndex: frozen ? 35 : 25 }}>
                        <div className="flex items-center justify-center gap-1">
                          <span>{colToLetter(c)}</span>
                          {sheet.filters[c] && <Icons.Filter size={11} className="text-white" />}
                        </div>
                        <span onMouseDown={(e) => { e.preventDefault(); resizeColumn(c, e.clientX); }} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#FFFFFF]" />
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rowsArr.map((r) => {
                  if (hiddenRows.has(r)) return null;
                  const isGroupHeader = sheet.groups.find((g) => g.start === r);
                  const rowFrozen = r < sheet.frozenRows;
                  return (
                    <tr key={r} style={{ height: sheet.rowHeights[r] || DEFAULT_ROW_HEIGHT }}>
                      <td className="relative border border-[#D2D0CE] bg-[#106EBE] px-2 py-1 text-center text-xs text-[#FFFFFF] shadow-sm" style={{ position: "sticky", left: 0, top: rowFrozen ? topOffset(r) : undefined, zIndex: rowFrozen ? 32 : 20, height: sheet.rowHeights[r] || DEFAULT_ROW_HEIGHT }}>
                        <div className="flex items-center justify-center gap-1">
                          {isGroupHeader && <button onClick={() => toggleGroupCollapse(isGroupHeader.id)} className="text-[#FFFFFF] font-bold">{isGroupHeader.collapsed ? "▸" : "▾"}</button>}
                          {r + 1}
                        </div>
                        <span onMouseDown={(e) => { e.preventDefault(); resizeRow(r, e.clientY); }} className="absolute bottom-0 left-0 h-1 w-full cursor-row-resize hover:bg-[#FFFFFF]" />
                      </td>
                      {columns.map((c) => {
                        const key = cellKey(r, c);
                        const data = sheet.cells[key];
                        if (data?.mergedInto) return null;
                        const style = data?.style;
                        const isEditing = editingKey === key;
                        const selected = isSelected(r, c);
                        const isActive = activeCell === key;
                        const colFrozen = c < sheet.frozenCols;
                        return (
                          <td
                            key={key}
                            rowSpan={data?.rowSpan}
                            colSpan={data?.colSpan}
                            onMouseDown={() => handleMouseDown(r, c)}
                            onMouseEnter={() => handleMouseEnter(r, c)}
                            onDoubleClick={() => startEditing(key)}
                            onKeyDown={(e) => handleKeyDown(e, r, c)}
                            tabIndex={0}
                            className={`relative px-2 py-1 outline-none transition-colors ${showGridLines ? "border" : "border border-transparent"} ${isActive ? "border-[#106EBE] border-2 z-10" : selected ? "bg-[#E5F1FB] border-[#106EBE] border-opacity-30" : "border-[#D2D0CE]"}`}
                            style={{
                              width: sheet.colWidths[c] || DEFAULT_COL_WIDTH,
                              minWidth: sheet.colWidths[c] || DEFAULT_COL_WIDTH,
                              maxWidth: sheet.colWidths[c] || DEFAULT_COL_WIDTH,
                              height: sheet.rowHeights[r] || DEFAULT_ROW_HEIGHT,
                              maxHeight: sheet.rowHeights[r] || DEFAULT_ROW_HEIGHT,
                              overflow: "hidden",
                              backgroundColor: style?.bg || (colFrozen || rowFrozen ? "#F3F2F1" : "#FFFFFF"),
                              color: style?.color || "#000000",
                              fontFamily: style?.fontFamily,
                              fontSize: style?.fontSize,
                              fontWeight: style?.bold ? 700 : 400,
                              fontStyle: style?.italic ? "italic" : "normal",
                              textDecoration: style?.underline ? "underline" : "none",
                              textAlign: style?.align || "left",
                              verticalAlign: style?.verticalAlign || "top",
                              paddingLeft: style?.indent ? `${8 + style.indent * 12}px` : undefined,
                              borderTopWidth: style?.borders?.top ? 2 : undefined,
                              borderRightWidth: style?.borders?.right ? 2 : undefined,
                              borderBottomWidth: style?.borders?.bottom ? 2 : undefined,
                              borderLeftWidth: style?.borders?.left ? 2 : undefined,
                              borderStyle: style?.borderStyle || undefined,
                              borderColor: style?.borders ? (style?.borderColor || "#000000") : undefined,
                              position: colFrozen || rowFrozen ? "sticky" : undefined,
                              left: colFrozen ? leftOffset(c) : undefined,
                              top: rowFrozen ? topOffset(r) : undefined,
                              zIndex: colFrozen && rowFrozen ? 31 : colFrozen ? 22 : rowFrozen ? 21 : undefined,
                            }}
                          >
                            {data?.comment && <span title={data.comment} className="absolute right-0 top-0 h-2 w-2 rounded-full bg-amber-500" />}
                            {isEditing ? (
                              <textarea autoFocus spellCheck value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => commitEdit("none")} className="h-full w-full resize-none bg-transparent outline-none text-[#000000]" />
                            ) : data?.image ? (
                              <img src={data.image} alt="" className="max-h-full max-w-full object-contain" />
                            ) : data?.hyperlink ? (
                              <a href={data.hyperlink} target="_blank" rel="noreferrer" className="text-[#106EBE] underline" onClick={(e) => e.stopPropagation()}>{getDisplayValue(key) || data.hyperlink}</a>
                            ) : data?.validation ? (
                              <select value={data.value} onChange={(e) => setCellValue(key, e.target.value)} className="w-full bg-transparent outline-none text-[#000000]">
                                <option value="" />
                                {data.validation.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <span className={`block h-full overflow-hidden break-words leading-snug ${style?.wrap === false ? "whitespace-nowrap" : "whitespace-pre-wrap"}`}>{getDisplayValue(key)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
          <div className="flex items-center gap-1 border-t border-[#D2D0CE] bg-[#F3F2F1] px-2 py-1 shrink-0 overflow-x-auto">
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

            <div className="flex min-w-0 flex-1 flex-col">
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
                      <button onClick={() => setShowChartDialog(true)} className="w-full rounded-lg border border-[#D2D0CE] bg-white px-3 py-2 text-left text-xs hover:border-[#106EBE]">Charts: {sheet.charts.length}</button>
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
                    <button onClick={() => { setRightSidebarOpen(false); showToast("Sidebar collapsed."); }} className="flex w-full items-center gap-2 rounded-xl border border-[#D2D0CE] bg-white px-3 py-3 text-sm font-bold hover:border-[#106EBE]">
                      <Icons.PanelRightClose size={16} /> Collapse
                    </button>
                    <button onClick={() => { setRightSidebarUndocked(v => !v); showToast("Sidebar undock toggled."); }} className="flex w-full items-center gap-2 rounded-xl border border-[#D2D0CE] bg-white px-3 py-3 text-sm font-bold hover:border-[#106EBE]">
                      <Icons.PanelRightOpen size={16} /> {rightSidebarUndocked ? "Dock" : "Undock"}
                    </button>
                    <button onClick={() => { setActiveSidebarPanel("properties"); showToast("Sidebar customized."); }} className="flex w-full items-center gap-2 rounded-xl border border-[#D2D0CE] bg-white px-3 py-3 text-sm font-bold hover:border-[#106EBE]">
                      <Icons.Settings2 size={16} /> Customize
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

      {/* Modals */}
      {showFunctionWizard && (
        <Modal title="Function Wizard" onClose={() => setShowFunctionWizard(false)}>
          <div className="grid max-h-[60vh] grid-cols-1 gap-2 overflow-auto md:grid-cols-2 awm-premium-scrollbar">
            {FUNCTION_LIST.map((f) => (
              <button key={f.name} onClick={() => { startEditing(activeCell, `=${f.usage}`); setShowFunctionWizard(false); }} className="rounded-xl border border-[#D2D0CE] bg-[#FFFFFF] p-3 text-left hover:border-[#106EBE] hover:shadow-md">
                <p className="font-bold text-[#106EBE]">{f.name}</p>
                <p className="mt-1 font-mono text-xs text-[#605E5C]">{f.usage}</p>
                <p className="mt-1 text-xs text-[#000000]">{f.desc}</p>
              </button>
            ))}
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

      {showChartDialog && (
        <Modal title="Create Chart" onClose={() => setShowChartDialog(false)}>
          <div className="space-y-4">
            <LabeledInput label="Chart title" value={chartTitle} onChange={setChartTitle} />
            <LabeledInput label="Data range" value={chartRange} onChange={setChartRange} placeholder="A1:B5" />
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-[#605E5C]">Chart type</label>
              <select value={chartType} onChange={(e) => setChartType(e.target.value as ChartType)} className="w-full rounded-xl border border-[#D2D0CE] bg-[#FFFFFF] px-3 py-2 text-sm outline-none focus:border-[#106EBE] text-[#000000]">
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>
            <button onClick={addChart} className="w-full rounded-xl bg-[#106EBE] text-[#FFFFFF] font-bold py-2 shadow-sm hover:bg-[#005A9E]">Create Chart</button>
          </div>
        </Modal>
      )}

      {showPivotDialog && (
        <Modal title="Pivot Table" onClose={() => setShowPivotDialog(false)}>
          <div className="space-y-4">
            <LabeledInput label="Source range with header row" value={pivotRange} onChange={setPivotRange} placeholder="A1:C10" />
            <LabeledInput label="Row field" value={pivotRowField} onChange={setPivotRowField} placeholder="Example: Department" />
            <LabeledInput label="Column field" value={pivotColumnField} onChange={setPivotColumnField} placeholder="Example: Month" />
            <LabeledInput label="Value field" value={pivotValueField} onChange={setPivotValueField} placeholder="Example: Amount" />
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

/* ============================================================================
 * UI primitives
 * ========================================================================== */

interface SpreadsheetToolbarButton {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
  active?: boolean;
  kind?: ToolbarButtonKind;
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
      className={`group relative flex h-8 w-8 items-center justify-center rounded-md border text-[#323130] shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#106EBE]/30 ${
        button.active
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

function ChartView({ type, data }: { type: ChartType; data: { label: string; value: number }[] }) {
  const width = 640;
  const height = 260;
  const max = Math.max(1, ...data.map((d) => Math.abs(d.value)));
  const colors = ["#106EBE", "#0078D4", "#00B294", "#FFB900", "#D83B01", "#E3008C"];

  if (!data.length) return <div className="text-sm text-[#605E5C]">No chart data available.</div>;

  if (type === "pie") {
    const total = data.reduce((a, b) => a + Math.abs(b.value), 0) || 1;
    let acc = 0;
    const cx = 160;
    const cy = 125;
    const r = 90;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        {data.map((d, i) => {
          const value = Math.abs(d.value);
          const start = (acc / total) * Math.PI * 2;
          acc += value;
          const end = (acc / total) * Math.PI * 2;
          const x1 = cx + r * Math.cos(start);
          const y1 = cy + r * Math.sin(start);
          const x2 = cx + r * Math.cos(end);
          const y2 = cy + r * Math.sin(end);
          const large = end - start > Math.PI ? 1 : 0;
          return <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill={colors[i % colors.length]} stroke="#FFFFFF" strokeWidth="1" />;
        })}
        {data.map((d, i) => <text key={i} x={330} y={35 + i * 22} fill="#000000" fontSize="12"><tspan fill={colors[i % colors.length]}>■</tspan> {d.label}: {d.value}</text>)}
      </svg>
    );
  }

  if (type === "line") {
    const points = data.map((d, i) => {
      const x = 40 + (i * (width - 80)) / Math.max(1, data.length - 1);
      const y = height - 35 - (Math.abs(d.value) / max) * (height - 70);
      return `${x},${y}`;
    }).join(" ");
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        <line x1="40" y1="15" x2="40" y2={height - 35} stroke="#D2D0CE" />
        <line x1="40" y1={height - 35} x2={width - 20} y2={height - 35} stroke="#D2D0CE" />
        <polyline fill="none" stroke="#106EBE" strokeWidth="3" points={points} />
        {data.map((d, i) => {
          const x = 40 + (i * (width - 80)) / Math.max(1, data.length - 1);
          const y = height - 35 - (Math.abs(d.value) / max) * (height - 70);
          return <g key={i}><circle cx={x} cy={y} r="4" fill="#0078D4" /><text x={x - 12} y={height - 12} fill="#605E5C" fontSize="10">{d.label.slice(0, 8)}</text></g>;
        })}
      </svg>
    );
  }

  const barWidth = Math.max(16, (width - 80) / data.length - 8);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
      <line x1="40" y1="15" x2="40" y2={height - 35} stroke="#D2D0CE" />
      <line x1="40" y1={height - 35} x2={width - 20} y2={height - 35} stroke="#D2D0CE" />
      {data.map((d, i) => {
        const barHeight = (Math.abs(d.value) / max) * (height - 70);
        const x = 48 + i * ((width - 80) / data.length);
        const y = height - 35 - barHeight;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill={colors[i % colors.length]} />
            <text x={x} y={height - 12} fill="#605E5C" fontSize="10">{d.label.slice(0, 8)}</text>
          </g>
        );
      })}
    </svg>
  );
}