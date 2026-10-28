// ─────────────────────────────────────────────────────────────────────────────
//  productionReportUtils.js
//  Utilities, column configs, and group builder for Planned & Unplanned Reports
// ─────────────────────────────────────────────────────────────────────────────
import moment from "moment";

export const PLANNED_COLUMNS = [
  { key: "date", label: "Date", w: "120px", align: "center" },
  { key: "month", label: "Month", w: "110px", align: "left" },
  { key: "year", label: "Year", w: "90px", align: "center" },
  { key: "line", label: "Line", w: "140px", align: "center" },
  { key: "orderNo", label: "Order No", w: "150px", align: "left" },
  { key: "style", label: "Style No", w: "150px", align: "left" },
  { key: "deliveryDate", label: "Delivery Date", w: "130px", align: "center" },
  { key: "pcs", label: "Pcs", w: "120px", align: "right" },
];

export const UNPLANNED_COLUMNS = [
  { key: "orderNo", label: "Order No", w: "150px", align: "left" },
  { key: "buyer", label: "Buyer", w: "160px", align: "left" },
  { key: "dDate", label: "Delivery Date", w: "130px", align: "center" },
  { key: "style", label: "Style", w: "150px", align: "left" },
  { key: "quantity", label: "Quantity", w: "130px", align: "right" },
  { key: "sam", label: "SAM", w: "100px", align: "right" },
];

// Default export for backward compatibility
export const COLUMNS = PLANNED_COLUMNS;

export function fmtPcs(val) {
  const n = typeof val === "number" ? val : parseFloat(val) || 0;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function fmtDate(d) {
  if (!d) return "—";
  const m = moment(d);
  return m.isValid() ? m.format("DD-MM-YYYY") : String(d);
}

// Build nested groups for the grouping bar feature
export function buildGroups(data, keys, dirs, sumKey = "pcs", depth = 0) {
  if (!keys.length) return data;
  const [k, ...rest] = keys;
  const map = new Map();

  data.forEach((r) => {
    const v = String(r[k] ?? "");
    if (!map.has(v)) map.set(v, []);
    map.get(v).push(r);
  });

  return [...map.entries()]
    .sort((a, b) => {
      const dir = dirs[k] || 1;
      const numA = Number(a[0]);
      const numB = Number(b[0]);
      if (!isNaN(numA) && !isNaN(numB) && a[0] !== "" && b[0] !== "") {
        return (numA - numB) * dir;
      }
      return a[0].localeCompare(b[0]) * dir;
    })
    .map(([val, rows]) => {
      const totalQty = rows.reduce((sum, r) => sum + (parseFloat(r[sumKey]) || 0), 0);
      return {
        _group: true,
        _key: k,
        _val: val,
        _depth: depth,
        _count: rows.length,
        _totalQty: totalQty,
        _sumKey: sumKey,
        _children: buildGroups(rows, rest, dirs, sumKey, depth + 1),
      };
    });
}
