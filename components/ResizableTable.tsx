"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ColumnAlign = "left" | "center" | "right";

export type ResizableColumn<T> = {
  key: string;
  label: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  align?: ColumnAlign;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T, rowIndex: number) => React.ReactNode;
};

type HeaderStyleState = {
  fontSize: number; // px
  color: string; // hex
};

type ResizeState = {
  key: string;
  startX: number;
  startWidth: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getDefaultWidth<T>(col: ResizableColumn<T>) {
  const minWidth = col.minWidth ?? 80;
  const maxWidth = col.maxWidth ?? 600;
  const width = col.width ?? 180;
  return clamp(width, minWidth, maxWidth);
}

function useResizableColumns<T>(columns: ResizableColumn<T>[]) {
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const columnsRef = useRef(columns);
  const resizeRef = useRef<ResizeState | null>(null);

  useEffect(() => {
    columnsRef.current = columns;

    setWidths((prev) => {
      const next: Record<string, number> = {};
      for (const col of columns) {
        const minWidth = col.minWidth ?? 80;
        const maxWidth = col.maxWidth ?? 600;
        const current = prev[col.key] ?? getDefaultWidth(col);
        next[col.key] = clamp(current, minWidth, maxWidth);
      }
      return next;
    });
  }, [columns]);

  const resetWidths = useCallback(() => {
    const next: Record<string, number> = {};
    for (const col of columnsRef.current) {
      next[col.key] = getDefaultWidth(col);
    }
    setWidths(next);
  }, []);

  const startResize = useCallback(
    (key: string, e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const th = e.currentTarget.parentElement as HTMLElement | null;
      const currentWidth =
        th?.getBoundingClientRect().width ??
        columnsRef.current.find((c) => c.key === key)?.width ??
        180;

      resizeRef.current = {
        key,
        startX: e.clientX,
        startWidth: currentWidth,
      };

      setActiveKey(key);
      document.body.classList.add("awm-resizing");
    },
    []
  );

  useEffect(() => {
    if (!activeKey) return;

    const onPointerMove = (e: PointerEvent) => {
      const state = resizeRef.current;
      if (!state) return;

      const col = columnsRef.current.find((c) => c.key === state.key);
      if (!col) return;

      const minWidth = col.minWidth ?? 80;
      const maxWidth = col.maxWidth ?? 600;
      const delta = e.clientX - state.startX;
      const nextWidth = clamp(state.startWidth + delta, minWidth, maxWidth);

      setWidths((prev) => ({
        ...prev,
        [state.key]: nextWidth,
      }));
    };

    const onPointerUp = () => {
      resizeRef.current = null;
      setActiveKey(null);
      document.body.classList.remove("awm-resizing");
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      document.body.classList.remove("awm-resizing");
    };
  }, [activeKey]);

  return {
    widths,
    startResize,
    resetWidths,
    activeKey,
  };
}

function TableHeaderControls({
  headerStyle,
  setHeaderStyle,
  onResetWidths,
}: {
  headerStyle: HeaderStyleState;
  setHeaderStyle: React.Dispatch<React.SetStateAction<HeaderStyleState>>;
  onResetWidths: () => void;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end md:justify-between">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Header Font Size
          </label>
          <input
            type="range"
            min={10}
            max={20}
            value={headerStyle.fontSize}
            onChange={(e) =>
              setHeaderStyle((prev) => ({
                ...prev,
                fontSize: Number(e.target.value),
              }))
            }
            className="w-full"
          />
          <div className="mt-1 text-xs font-semibold text-slate-500">
            {headerStyle.fontSize}px
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Header Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={headerStyle.color}
              onChange={(e) =>
                setHeaderStyle((prev) => ({
                  ...prev,
                  color: e.target.value,
                }))
              }
              className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
              aria-label="Table header color"
            />
            <input
              type="text"
              value={headerStyle.color}
              onChange={(e) =>
                setHeaderStyle((prev) => ({
                  ...prev,
                  color: e.target.value,
                }))
              }
              className="erp-input w-40"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onResetWidths}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white hover:bg-slate-800"
      >
        Reset Column Widths
      </button>
    </div>
  );
}

export function ResizableTable<T>({
  columns,
  data,
  getRowKey,
  showHeaderControls = true,
  className = "",
  tableClassName = "awm-resizable-table awm-sticky-head awm-table-vip awm-table-zebra",
}: {
  columns: ResizableColumn<T>[];
  data: T[];
  getRowKey: (row: T, index: number) => string | number;
  showHeaderControls?: boolean;
  className?: string;
  tableClassName?: string;
}) {
  const { widths, startResize, resetWidths, activeKey } = useResizableColumns(columns);

  const [headerStyle, setHeaderStyle] = useState<HeaderStyleState>({
    fontSize: 11,
    color: "#ffffff",
  });

  const tableVars = useMemo<React.CSSProperties>(
    () =>
      ({
        ["--table-header-font-size" as any]: `${headerStyle.fontSize}px`,
        ["--table-header-text" as any]: headerStyle.color,
      }) as React.CSSProperties,
    [headerStyle]
  );

  const headerFontPreset =
    headerStyle.fontSize <= 10
      ? "xs"
      : headerStyle.fontSize <= 11
      ? "sm"
      : headerStyle.fontSize <= 13
      ? "md"
      : headerStyle.fontSize <= 15
      ? "lg"
      : "xl";

  return (
    <div
      className={className}
      style={tableVars}
      data-table-header-font={headerFontPreset}
      data-table-header-color="white"
    >
      {showHeaderControls && (
        <TableHeaderControls
          headerStyle={headerStyle}
          setHeaderStyle={setHeaderStyle}
          onResetWidths={resetWidths}
        />
      )}

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className={tableClassName}>
          <colgroup>
            {columns.map((col) => (
              <col
                key={col.key}
                style={{
                  width: `${widths[col.key] ?? getDefaultWidth(col)}px`,
                }}
              />
            ))}
          </colgroup>

          <thead>
            <tr>
              {columns.map((col) => {
                const align = col.align ?? "left";
                const isResizing = activeKey === col.key;

                return (
                  <th
                    key={col.key}
                    className={[
                      "relative whitespace-nowrap",
                      col.headerClassName ?? "",
                      isResizing ? "is-resizing" : "",
                    ].join(" ")}
                    style={{ textAlign: align }}
                  >
                    <span className="awm-header-label">{col.label}</span>

                    <div
                      className="awm-resize-handle"
                      onPointerDown={(e) => startResize(col.key, e)}
                      title="Drag to resize column"
                      aria-hidden="true"
                    />
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  No data found.
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={getRowKey(row, rowIndex)}>
                  {columns.map((col) => {
                    const value =
                      col.render?.(row, rowIndex) ??
                      String((row as Record<string, unknown>)[col.key] ?? "");

                    const align = col.align ?? "left";

                    return (
                      <td
                        key={col.key}
                        className={col.cellClassName ?? ""}
                        style={{ textAlign: align }}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}