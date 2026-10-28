// ─────────────────────────────────────────────────────────────────────────────
//  PurchaseReport.jsx — Shared Unified Report Component
//  Powers both:
//    1. Planned Orders Production Report (reportType="planned")
//    2. Unplanned Orders Report          (reportType="unplanned")
// ─────────────────────────────────────────────────────────────────────────────
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import XLSXStyle from "xlsx-js-style";
import { BASE_URL, LINES_API, ORDERS_API } from "../../../Constants/Api";
import ColumnFilterMenu from "./components/ColumnFilterMenu";
import {
  PLANNED_COLUMNS,
  UNPLANNED_COLUMNS,
  buildGroups,
  fmtDate,
  fmtPcs,
} from "./productionReportUtils";

const PAGE_SIZE_OPTIONS = [20, 40, 100, 200];

export default function PurchaseReport({
  data: propData,
  reportType = "planned", // "planned" | "unplanned"
  type, // fallback if prop is passed as type="..."
}) {
  const activeType = type || reportType;
  const isUnplanned = activeType === "unplanned";

  const columnsDef = useMemo(
    () => (isUnplanned ? UNPLANNED_COLUMNS : PLANNED_COLUMNS),
    [isUnplanned]
  );
  const sumKey = isUnplanned ? "quantity" : "pcs";

  const [apiData, setApiData] = useState([]);
  const [isLoading, setIsLoading] = useState(!propData);
  const [isError, setIsError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(40);
  const [page, setPage] = useState(1);

  // Column order & Grouping state
  const [colOrder, setColOrder] = useState(() => columnsDef.map((c) => c.key));
  const [groupKeys, setGroupKeys] = useState([]);
  const [groupDirs, setGroupDirs] = useState({});
  const [collapsed, setCollapsed] = useState({});

  // Reset colOrder if report type switches
  useEffect(() => {
    setColOrder(columnsDef.map((c) => c.key));
    setGroupKeys([]);
    setGroupDirs({});
    setColFilters({});
    setPage(1);
  }, [columnsDef]);

  // Filtering & Sorting state
  const [colFilters, setColFilters] = useState({});
  const [openMenuCol, setOpenMenuCol] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(1);

  const dragColRef = useRef(null);
  const [isDragGbOver, setIsDragGbOver] = useState(false);

  // ── Dynamic Viewport Height Calculation ───────────────────────────────────
  const containerRef = useRef(null);
  const [availableHeight, setAvailableHeight] = useState(null);

  const syncAvailableHeight = useCallback(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const { top } = containerRef.current.getBoundingClientRect();
    const nextHeight = Math.max(window.innerHeight - Math.max(top, 0) - 10, 360);
    setAvailableHeight((curr) => (curr === nextHeight ? curr : nextHeight));
  }, []);

  useLayoutEffect(() => {
    syncAvailableHeight();
    const handleResize = () => syncAvailableHeight();
    window.addEventListener("resize", handleResize);

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(handleResize);
      if (containerRef.current?.parentElement) {
        resizeObserver.observe(containerRef.current.parentElement);
      }
      resizeObserver.observe(document.body);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [syncAvailableHeight]);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (propData && propData.length > 0) {
      setApiData(propData);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setIsError(false);
    try {
      const url = isUnplanned ? BASE_URL + ORDERS_API : BASE_URL + LINES_API;
      const params = isUnplanned ? { lines: false } : { type: "planned" };

      const response = await axios.get(url, { params });
      setApiData(response?.data?.data || []);
    } catch (err) {
      console.error(`Failed to load ${activeType} orders report:`, err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [propData, isUnplanned, activeType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Data Normalization ─────────────────────────────────────────────────────
  const allData = useMemo(() => {
    const raw = propData && propData.length > 0 ? propData : apiData;

    if (isUnplanned) {
      return raw.map((item, idx) => ({
        id: item.id || `unplanned_${idx}`,
        orderNo: item.orderNo || "—",
        buyer: item.buyer || "—",
        dDate: fmtDate(item.dDate),
        style: item.style || "—",
        quantity: Number(item.quantity) || 0,
        sam: item.sam !== undefined && item.sam !== null ? Number(item.sam) : "—",
      }));
    }

    return raw.map((item, idx) => ({
      id: item.id || `planned_${idx}`,
      date: item.date || "—",
      month: item.month || "—",
      year: item.year ? String(item.year) : "—",
      line: item.line || "—",
      orderNo: item.orderNo || "—",
      style: item.style || "—",
      deliveryDate: item.deliveryDate || "—",
      pcs: Number(item.pcs) || 0,
    }));
  }, [propData, apiData, isUnplanned]);

  // ── Unique values per column for filter menu ───────────────────────────────
  const uniqueVals = useMemo(() => {
    const map = {};
    columnsDef.forEach(({ key }) => {
      const set = new Set();
      allData.forEach((r) => {
        const val = r[key] !== undefined && r[key] !== null ? String(r[key]) : "";
        set.add(val);
      });
      map[key] = [...set].sort((a, b) => {
        const numA = Number(a);
        const numB = Number(b);
        if (!isNaN(numA) && !isNaN(numB) && a !== "" && b !== "") {
          return numA - numB;
        }
        return a.localeCompare(b);
      });
    });
    return map;
  }, [allData, columnsDef]);

  // ── Filtering & Searching ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    return allData.filter((r) => {
      // Global search
      if (s) {
        const match = columnsDef.some((col) => {
          const val = String(r[col.key] ?? "").toLowerCase();
          return val.includes(s);
        });
        if (!match) return false;
      }

      // Column filters
      for (const [k, allowed] of Object.entries(colFilters)) {
        if (!allowed) continue;
        const v = String(r[k] ?? "");
        if (!allowed.has(v)) return false;
      }

      return true;
    });
  }, [allData, searchTerm, colFilters, columnsDef]);

  // ── Sorting ────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * sortDir;
      }
      return String(av ?? "").localeCompare(String(bv ?? "")) * sortDir;
    });
  }, [filtered, sortKey, sortDir]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    return sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [sorted, safePage, pageSize]);

  // ── Tree Grouping ──────────────────────────────────────────────────────────
  const tree = useMemo(() => {
    if (groupKeys.length === 0) return paginated;
    return buildGroups(paginated, groupKeys, groupDirs, sumKey);
  }, [paginated, groupKeys, groupDirs, sumKey]);

  // ── Metrics ────────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    if (isUnplanned) {
      const totalQty = filtered.reduce((sum, r) => sum + (r.quantity || 0), 0);
      const uniqueBuyers = new Set(filtered.map((r) => r.buyer)).size;
      const uniqueOrders = new Set(filtered.map((r) => r.orderNo)).size;
      const uniqueStyles = new Set(filtered.map((r) => r.style)).size;
      const validSams = filtered
        .map((r) => Number(r.sam))
        .filter((n) => !isNaN(n) && n > 0);
      const avgSam =
        validSams.length > 0
          ? (validSams.reduce((a, b) => a + b, 0) / validSams.length).toFixed(2)
          : "—";

      return {
        totalPrimaryQty: totalQty,
        totalRecords: filtered.length,
        col3Label: "Unique Buyers",
        col3Val: uniqueBuyers,
        col4Label: "Unique Orders",
        col4Val: uniqueOrders,
        col5Label: "Unique Styles",
        col5Val: uniqueStyles,
        col6Label: "Avg SAM",
        col6Val: avgSam,
      };
    }

    const totalPcs = filtered.reduce((sum, r) => sum + (r.pcs || 0), 0);
    const uniqueLines = new Set(filtered.map((r) => r.line)).size;
    const uniqueOrders = new Set(filtered.map((r) => r.orderNo)).size;
    const uniqueStyles = new Set(filtered.map((r) => r.style)).size;

    return {
      totalPrimaryQty: totalPcs,
      totalRecords: filtered.length,
      col3Label: "Active Lines",
      col3Val: uniqueLines,
      col4Label: "Unique Orders",
      col4Val: uniqueOrders,
      col5Label: "Unique Styles",
      col5Val: uniqueStyles,
    };
  }, [filtered, isUnplanned]);

  // ── Visible Columns ────────────────────────────────────────────────────────
  const visibleCols = useMemo(() => {
    return colOrder
      .filter((k) => !groupKeys.includes(k))
      .map((k) => columnsDef.find((c) => c.key === k))
      .filter(Boolean);
  }, [colOrder, groupKeys, columnsDef]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleSort(key, dir) {
    setSortKey(key);
    setSortDir(dir);
    setPage(1);
  }

  function handleFilterApply(key, allowedSet) {
    setColFilters((prev) => {
      const next = { ...prev };
      if (!allowedSet) delete next[key];
      else next[key] = allowedSet;
      return next;
    });
    setOpenMenuCol(null);
    setPage(1);
  }

  function removeFilterChip(key) {
    setColFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setPage(1);
  }

  function clearAllFilters() {
    setColFilters({});
    setSearchTerm("");
    setPage(1);
  }

  function toggleGroup(gid) {
    setCollapsed((prev) => ({ ...prev, [gid]: !prev[gid] }));
  }

  function removeGroupKey(key) {
    setGroupKeys((prev) => prev.filter((k) => k !== key));
    setGroupDirs((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function toggleGroupDir(key) {
    setGroupDirs((prev) => ({ ...prev, [key]: (prev[key] || 1) * -1 }));
  }

  function onColDragStart(e, key) {
    dragColRef.current = key;
    e.dataTransfer.setData("col", key);
    e.dataTransfer.effectAllowed = "move";
  }

  function onGbDragOver(e) {
    e.preventDefault();
    setIsDragGbOver(true);
  }

  function onGbDrop(e) {
    e.preventDefault();
    setIsDragGbOver(false);
    const key = e.dataTransfer.getData("col") || dragColRef.current;
    if (!key || groupKeys.includes(key)) return;
    setGroupKeys((prev) => [...prev, key]);
    setGroupDirs((prev) => ({ ...prev, [key]: 1 }));
  }

  function onColDrop(e, tgtKey) {
    e.preventDefault();
    const srcKey = e.dataTransfer.getData("col") || dragColRef.current;
    if (!srcKey || srcKey === tgtKey) return;
    setColOrder((prev) => {
      const list = [...prev];
      const si = list.indexOf(srcKey);
      const ti = list.indexOf(tgtKey);
      if (si < 0 || ti < 0) return list;
      list.splice(si, 1);
      list.splice(ti, 0, srcKey);
      return list;
    });
  }

  // ── Cell Value Renderer ────────────────────────────────────────────────────
  function renderCellValue(row, key) {
    switch (key) {
      case "date":
      case "deliveryDate":
      case "dDate":
        return <span className="text-xs text-gray-700">{row[key]}</span>;

      case "month":
        return <span className="text-xs font-medium text-gray-800">{row.month}</span>;

      case "year":
        return <span className="text-xs text-gray-600">{row.year}</span>;

      case "line":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            {row.line}
          </span>
        );

      case "orderNo":
        return <span className="text-xs font-semibold text-gray-900">{row.orderNo}</span>;

      case "buyer":
        return <span className="text-xs font-medium text-gray-800">{row.buyer}</span>;

      case "style":
        return <span className="text-xs text-gray-700">{row.style}</span>;

      case "sam":
        return (
          <span className="text-xs text-gray-700 font-mono">
            {typeof row.sam === "number" ? row.sam.toFixed(2) : row.sam}
          </span>
        );

      case "quantity":
      case "pcs":
        return (
          <span className="text-xs font-bold text-indigo-700">
            {fmtPcs(row[key])}
          </span>
        );

      default:
        return <span className="text-xs text-gray-600">{row[key] ?? "—"}</span>;
    }
  }

  // ── Tree Node Renderer ─────────────────────────────────────────────────────
  let rowIndex = 0;
  const globalSnoStart = (safePage - 1) * pageSize;

  function renderNode(node, vc, localIdx) {
    if (node._group) {
      const gid = `${node._key}:${node._val}:${node._depth}`;
      const col = columnsDef.find((c) => c.key === node._key);
      const isCollapsed = collapsed[gid];
      const sumLabel = isUnplanned ? "Group Total Qty:" : "Group Total Pcs:";

      return (
        <React.Fragment key={gid}>
          <tr className="bg-indigo-50/70 hover:bg-indigo-100/70 transition-colors">
            {/* S.No blank cell for group */}
            <td className="px-2 py-2 border-r border-b border-indigo-100 w-12 text-center text-xs text-gray-400 select-none">
              •
            </td>
            {/* Spanning content */}
            <td
              colSpan={vc.length}
              className="px-3 py-2 text-xs font-medium text-indigo-900 border-b border-indigo-100"
              style={{ paddingLeft: `${node._depth * 20 + 12}px` }}
            >
              <div className="flex items-center flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleGroup(gid)}
                  className="w-5 h-5 flex items-center justify-center rounded text-indigo-600 hover:bg-indigo-200/60 font-bold"
                  title={isCollapsed ? "Expand Group" : "Collapse Group"}
                >
                  {isCollapsed ? "▶" : "▼"}
                </button>
                <span>
                  <span className="text-indigo-600 font-normal">{col?.label || node._key}:</span>{" "}
                  <strong className="text-indigo-900">{node._val || "(blank)"}</strong>
                </span>
                <span className="text-indigo-400 text-xs font-normal">
                  ({node._count} {node._count === 1 ? "record" : "records"})
                </span>
                <span className="ml-auto mr-4 inline-flex items-center gap-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-full px-3 py-0.5 text-xs font-semibold shadow-xs">
                  <span>{sumLabel}</span>
                  <span className="text-indigo-900 font-bold">{fmtPcs(node._totalQty)}</span>
                </span>
              </div>
            </td>
          </tr>
          {!isCollapsed &&
            node._children.map((child, ci) => renderNode(child, vc, ci))}
        </React.Fragment>
      );
    }

    const r = node;
    const stripe = rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50/60";
    const sno = globalSnoStart + rowIndex + 1;
    rowIndex++;

    return (
      <tr
        key={r.id || sno}
        className={`${stripe} hover:bg-indigo-50/40 transition-colors`}
      >
        {/* S.No */}
        <td className="px-2 py-2 w-12 text-center border-r border-b border-gray-100 text-xs text-gray-400 select-none">
          {sno}
        </td>
        {vc.map((col) => (
          <td
            key={col.key}
            className={`px-3 py-2 whitespace-nowrap border-r border-b border-gray-100 last:border-r-0 ${col.align === "right"
              ? "text-right"
              : col.align === "center"
                ? "text-center"
                : "text-left"
              }`}
          >
            {renderCellValue(r, col.key)}
          </td>
        ))}
      </tr>
    );
  }

  // ── Excel Export ───────────────────────────────────────────────────────────
  function exportExcel() {
    const keys = colOrder;
    const labels = keys.map(
      (k) => columnsDef.find((c) => c.key === k)?.label || k
    );

    const reportTitle = isUnplanned
      ? "Unplanned Orders Report"
      : "Planned Orders Production Report";
    const filePrefix = isUnplanned ? "Unplanned_Orders_Report" : "Planned_Orders_Report";
    const sumColLabel = isUnplanned ? "Total Qty" : "Total Pcs";

    const BORDER = {
      top: { style: "thin", color: { rgb: "D1D5DB" } },
      bottom: { style: "thin", color: { rgb: "D1D5DB" } },
      left: { style: "thin", color: { rgb: "D1D5DB" } },
      right: { style: "thin", color: { rgb: "D1D5DB" } },
    };

    function makeCell(value, opts = {}) {
      const {
        bold = false,
        fontColor = "1F2937",
        fgColor = null,
        align = "left",
        fontSize = 10,
        numFmt = null,
      } = opts;

      const fill = fgColor
        ? { fgColor: { rgb: fgColor }, patternType: "solid" }
        : { patternType: "none" };

      const c = {
        v: value ?? "",
        t: typeof value === "number" ? "n" : "s",
        s: {
          font: { bold, color: { rgb: fontColor }, sz: fontSize, name: "Calibri" },
          fill,
          alignment: { horizontal: align, vertical: "center", wrapText: false },
          border: BORDER,
        },
      };
      if (numFmt) c.z = numFmt;
      return c;
    }

    const allKeys = ["sno", ...keys];
    const allLabels = ["S.No", ...labels];
    const allSheetRows = [];
    let count = 0;

    function flattenNode(node, depth) {
      if (node._group) {
        const col = columnsDef.find((c) => c.key === node._key);
        const groupLabel = `${col?.label || node._key}: ${node._val || "(blank)"} — ${node._count} records | ${sumColLabel}: ${fmtPcs(node._totalQty)}`;
        const groupBg = depth === 0 ? "E0E7FF" : "EEF2FF";

        const groupRow = allKeys.map((_, ci) => {
          return makeCell(ci === depth + 1 ? groupLabel : "", {
            bold: true,
            fontColor: "312E81",
            fgColor: groupBg,
            align: "left",
            fontSize: depth === 0 ? 10 : 9,
          });
        });

        allSheetRows.push({ cells: groupRow, isGroup: true, depth: depth + 1 });
        node._children.forEach((child) => flattenNode(child, depth + 1));
      } else {
        const r = node;
        count++;
        const isOdd = count % 2 === 1;
        const bg = isOdd ? "FFFFFF" : "F9FAFB";

        const row = allKeys.map((k) => {
          if (k === "sno") {
            return makeCell(count, { fontColor: "6B7280", align: "center", fgColor: bg });
          }
          if (k === "pcs" || k === "quantity") {
            return makeCell(Number(r[k]) || 0, {
              bold: true,
              fontColor: "1E1B4B",
              align: "right",
              numFmt: "#,##0",
              fgColor: bg,
            });
          }
          if (k === "sam") {
            return makeCell(typeof r[k] === "number" ? r[k] : String(r[k] ?? ""), {
              align: "right",
              fgColor: bg,
            });
          }
          const colItem = columnsDef.find((c) => c.key === k);
          return makeCell(String(r[k] ?? ""), {
            align: colItem?.align || "left",
            fgColor: bg,
          });
        });

        allSheetRows.push({ cells: row, isGroup: false });
      }
    }

    if (groupKeys.length > 0) {
      buildGroups(sorted, groupKeys, groupDirs, sumKey).forEach((n) => flattenNode(n, 0));
    } else {
      sorted.forEach((r) => flattenNode(r, 0));
    }

    // Header Row
    const headerRow = allLabels.map((lbl, i) => {
      const k = allKeys[i];
      const colItem = columnsDef.find((c) => c.key === k);
      return makeCell(lbl, {
        bold: true,
        fgColor: "F3F4F6",
        fontColor: "111827",
        align: k === "sno" ? "center" : colItem?.align || "left",
        fontSize: 10,
      });
    });

    const wsData = [headerRow, ...allSheetRows.map((r) => r.cells)];
    const ws = XLSXStyle.utils.aoa_to_sheet(wsData.map((row) => row.map((c) => c.v)));

    // Reapply cell styles
    wsData.forEach((row, ri) => {
      row.forEach((c, ci) => {
        const addr = XLSXStyle.utils.encode_cell({ r: ri, c: ci });
        ws[addr] = { ...(ws[addr] || {}), ...c };
        if (c.z) ws[addr].z = c.z;
      });
    });

    // Merge group cells
    const merges = [];
    allSheetRows.forEach((row, i) => {
      if (row.isGroup) {
        const ri = i + 1;
        merges.push({
          s: { r: ri, c: row.depth },
          e: { r: ri, c: allKeys.length - 1 },
        });
      }
    });
    if (merges.length > 0) ws["!merges"] = merges;

    // Column widths
    const COL_WIDTHS = {
      sno: 8,
      date: 14,
      month: 14,
      year: 10,
      line: 18,
      orderNo: 20,
      style: 20,
      deliveryDate: 15,
      dDate: 15,
      buyer: 22,
      quantity: 14,
      sam: 12,
      pcs: 14,
    };
    ws["!cols"] = allKeys.map((k) => ({ wch: COL_WIDTHS[k] || 15 }));
    ws["!rows"] = [{ hpt: 26 }, ...allSheetRows.map((r) => ({ hpt: r.isGroup ? 22 : 20 }))];
    ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft" };

    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, ws, reportTitle);
    const today = new Date().toISOString().split("T")[0];
    XLSXStyle.writeFile(wb, `${filePrefix}_${today}.xlsx`);
  }

  // ── Render Loading & Error States ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-gray-500 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-sm font-medium">
          Loading {isUnplanned ? "Unplanned" : "Planned"} Orders Report...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-red-600 gap-3">
        <span className="text-base font-medium">
          Failed to load {isUnplanned ? "Unplanned" : "Planned"} Orders Report.
        </span>
        <button
          type="button"
          onClick={fetchData}
          className="px-4 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={availableHeight ? { height: `${availableHeight}px` } : { height: "calc(100vh - 90px)" }}
      className="p-2.5 flex flex-col min-h-0 gap-2 bg-gray-50/50 w-full overflow-hidden"
    >
      {/* ── Top Header Bar ─────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between flex-wrap gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200/80 shadow-xs">
        <div className="flex min-w-0 items-stretch gap-2.5">
          <span
            aria-hidden="true"
            className="w-1 shrink-0 rounded-full bg-[#E0562C]"
          />
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold leading-tight text-gray-900">
              <p className="text-base font-bold leading-tight text-slate-900">
                {isUnplanned ? "Unplanned Orders Report" : "Planned Orders Production Report"}
              </p>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search in all columns..."
              className="w-52 h-8 py-1.5 pl-8 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1.5 focus:ring-indigo-400 bg-gray-50/50 focus:bg-white transition-all"
            />
            <svg
              className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchData}
            title="Refresh Data"
            className="h-8 px-2.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 font-medium transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>

          {/* Download Excel Button */}
          <button
            type="button"
            onClick={exportExcel}
            className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 font-medium shadow-xs transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download Excel
          </button>
        </div>
      </div>

      {/* ── KPI Metric Cards ───────────────────────────────────────────────── */}
      <div className="shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {[
          {
            label: isUnplanned ? "Total Unplanned Qty" : "Total Planned Pcs",
            val: fmtPcs(metrics.totalPrimaryQty),
            bg: "bg-indigo-50",
            color: "text-indigo-700",
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            ),
          },
          {
            label: isUnplanned ? "Total Orders" : "Total Allocations",
            val: metrics.totalRecords.toLocaleString("en-IN"),
            bg: "bg-blue-50",
            color: "text-blue-700",
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            ),
          },
          {
            label: metrics.col3Label,
            val: metrics.col3Val,
            bg: "bg-amber-50",
            color: "text-amber-700",
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ),
          },
          {
            label: metrics.col4Label,
            val: metrics.col4Val,
            bg: "bg-emerald-50",
            color: "text-emerald-700",
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            ),
          },
          {
            label: metrics.col5Label,
            val: metrics.col5Val,
            bg: "bg-purple-50",
            color: "text-purple-700",
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            ),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-200/80 rounded-lg px-2.5 py-1.5 flex items-center gap-2.5 shadow-xs"
          >
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${card.bg} ${card.color}`}
            >
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-gray-500 truncate leading-tight">{card.label}</p>
              <p className={`text-sm font-bold leading-tight mt-0.5 ${card.color}`}>
                {card.val}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Active Filter Chips ────────────────────────────────────────────── */}
      {(Object.keys(colFilters).length > 0 || searchTerm) && (
        <div className="shrink-0 flex items-center gap-2 flex-wrap bg-white px-2.5 py-1 rounded-lg border border-gray-200/80">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-[10px]">
            Active Filters:
          </span>

          {searchTerm && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-full px-2 py-0.5 text-[11px] font-medium">
              Search: "{searchTerm}"
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-gray-400 hover:text-gray-700 text-xs cursor-pointer"
              >
                ×
              </button>
            </span>
          )}

          {Object.entries(colFilters).map(([k, allowedSet]) => {
            const col = columnsDef.find((c) => c.key === k);
            const totalOptions = uniqueVals[k]?.length || 0;
            const summary =
              allowedSet.size === 1
                ? [...allowedSet][0]
                : `${allowedSet.size} of ${totalOptions} selected`;

            return (
              <span
                key={k}
                className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-2 py-0.5 text-[11px] font-medium"
              >
                <span>{col?.label}:</span>
                <strong className="text-indigo-900">{summary}</strong>
                <button
                  type="button"
                  onClick={() => removeFilterChip(k)}
                  className="text-indigo-400 hover:text-indigo-800 text-xs font-bold cursor-pointer"
                >
                  ×
                </button>
              </span>
            );
          })}

          <button
            type="button"
            onClick={clearAllFilters}
            className="text-[11px] text-red-600 hover:text-red-700 hover:underline font-medium ml-1 cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* ── Group-By Drop Bar ──────────────────────────────────────────────── */}
      <div
        className={`shrink-0 min-h-[36px] border-2 border-dashed rounded-lg flex items-center px-3 py-1 gap-1.5 flex-wrap transition-colors ${isDragGbOver
          ? "bg-indigo-100 border-indigo-500"
          : "bg-indigo-50/50 border-indigo-200/90"
          }`}
        onDragOver={onGbDragOver}
        onDrop={onGbDrop}
        onDragLeave={() => setIsDragGbOver(false)}
      >
        <span className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider shrink-0">
          Group By:
        </span>

        {groupKeys.length === 0 ? (
          <span className="text-xs text-indigo-500/80 italic select-none">
            {isUnplanned
              ? "Drag any column header here to group (e.g. Buyer, Style, Delivery Date)"
              : "Drag any column header here to group (e.g. Line, Month, Order No, Style No)"}
          </span>
        ) : (
          groupKeys.map((k) => {
            const col = columnsDef.find((c) => c.key === k);
            return (
              <span
                key={k}
                className="flex items-center gap-1.5 bg-indigo-600 text-white rounded-full px-2.5 py-0.5 text-xs font-medium shadow-xs"
              >
                <span>{col?.label}</span>
                <button
                  type="button"
                  onClick={() => toggleGroupDir(k)}
                  className="opacity-80 hover:opacity-100 font-bold px-0.5 cursor-pointer"
                  title="Toggle Direction (Ascending/Descending)"
                >
                  {groupDirs[k] === 1 ? "↑" : "↓"}
                </button>
                <button
                  type="button"
                  onClick={() => removeGroupKey(k)}
                  className="opacity-70 hover:opacity-100 font-bold ml-0.5 text-xs leading-none cursor-pointer"
                  title="Remove Grouping"
                >
                  ×
                </button>
              </span>
            );
          })
        )}
      </div>

      {/* ── Table Container ────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-100/95 sticky top-0 z-20 backdrop-blur-xs select-none">
              <tr>
                {/* S.No Header */}
                <th className="px-2 py-2.5 text-center text-xs font-semibold text-gray-700 border-r border-b border-gray-200 w-12">
                  S.No
                </th>

                {/* Dynamic Visible Columns */}
                {visibleCols.map((col) => (
                  <th
                    key={col.key}
                    draggable
                    onDragStart={(e) => onColDragStart(e, col.key)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onColDrop(e, col.key)}
                    style={{ width: col.w, minWidth: col.w }}
                    className={`px-3 py-2.5 text-xs font-semibold text-gray-700 border-r border-b border-gray-200 last:border-r-0 cursor-grab active:cursor-grabbing relative ${col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left"
                      }`}
                  >
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="truncate">
                        {col.label}
                        {sortKey === col.key && (
                          <span className="text-indigo-600 font-bold ml-1">
                            {sortDir === 1 ? "↑" : "↓"}
                          </span>
                        )}
                        {colFilters[col.key] && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 ml-1.5 align-middle" />
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuCol(openMenuCol === col.key ? null : col.key);
                        }}
                        className={`p-1 rounded hover:bg-gray-200/70 transition cursor-pointer ${colFilters[col.key] ? "text-indigo-600 font-bold" : "text-gray-400"
                          }`}
                        title="Filter / Sort Column"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
                    </div>

                    {/* Column Filter Dropdown */}
                    {openMenuCol === col.key && (
                      <ColumnFilterMenu
                        colKey={col.key}
                        allValues={uniqueVals[col.key] || []}
                        activeFilter={colFilters[col.key]}
                        onApply={handleFilterApply}
                        onSort={handleSort}
                        onClose={() => setOpenMenuCol(null)}
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {tree.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleCols.length + 1}
                    className="text-center py-12 text-sm text-gray-400"
                  >
                    No matching {isUnplanned ? "unplanned" : "planned"} orders found
                  </td>
                </tr>
              ) : (
                (() => {
                  rowIndex = 0;
                  return tree.map((node) => renderNode(node, visibleCols));
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination & Summary Footer ──────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between flex-wrap gap-2 px-3 py-1.5 bg-gray-50/90 border-t border-gray-200 text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <span>
              Showing{" "}
              <strong>{sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1}</strong>
              –
              <strong>{Math.min(safePage * pageSize, sorted.length)}</strong> of{" "}
              <strong>{sorted.length.toLocaleString("en-IN")}</strong> records
              {filtered.length < allData.length && (
                <span className="text-gray-400 ml-1">
                  (filtered from {allData.length.toLocaleString("en-IN")})
                </span>
              )}
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 ml-2 border-l border-gray-200 pl-3">
              <span className="text-gray-500">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-7 px-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={safePage === 1}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-100 text-gray-600 text-xs cursor-pointer"
                title="First Page"
              >
                «
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-100 text-gray-600 text-xs cursor-pointer"
                title="Previous Page"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 || p === totalPages || Math.abs(p - safePage) <= 1
                )
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`ellip_${i}`} className="px-1 text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`h-7 min-w-[28px] px-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${p === safePage
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-100 text-gray-600 text-xs cursor-pointer"
                title="Next Page"
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={safePage === totalPages}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-100 text-gray-600 text-xs cursor-pointer"
                title="Last Page"
              >
                »
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
