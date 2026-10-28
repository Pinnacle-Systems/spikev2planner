import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import {
  Calendar,
  CalendarDays,
  BarChart3,
  Clock,
  Layers,
  FileSpreadsheet,
  FileText,
  Search,
  LayoutGrid,
} from "lucide-react";

// Categorized Dashboard Cards
const DASHBOARD_CARDS = [
  // ── Forms & Operations ───────────────────────────────────────────────────
  {
    id: "order-form",
    title: "Order Details Form",
    subtitle: "Order entry, style & buyer details",
    tabName: "ORDER DETAILS FORM",
    category: "forms",
    icon: FileSpreadsheet,
    gradient: "from-[#f97316] to-[#c2410c]",
    shadow: "shadow-[0_8px_20px_rgba(249,115,22,0.38)]",
    dotColor1: "bg-orange-200/60",
    dotColor2: "bg-orange-300/40",
  },
  {
    id: "capacity-planner",
    title: "Capacity Planner",
    subtitle: "Balance lines & factory allocation",
    tabName: "CAPASITY PLANNER",
    category: "forms",
    icon: Calendar,
    gradient: "from-[#6366f1] to-[#4338ca]",
    shadow: "shadow-[0_8px_20px_rgba(99,102,241,0.38)]",
    dotColor1: "bg-indigo-200/60",
    dotColor2: "bg-indigo-300/40",
  },

  {
    id: "unit-master",
    title: "Unit Master",
    subtitle: "Configure plant units & line setups",
    tabName: "UNIT MASTER",
    category: "forms",
    icon: Layers,
    gradient: "from-[#8b5cf6] to-[#6d28d9]",
    shadow: "shadow-[0_8px_20px_rgba(139,92,246,0.38)]",
    dotColor1: "bg-purple-200/60",
    dotColor2: "bg-purple-300/40",
  },

  // ── Reports & Analytics ──────────────────────────────────────────────────
  {
    id: "planned-orders",
    title: "Planned Orders",
    subtitle: "Production progress & output reports",
    tabName: "PLANNED ORDERS",
    category: "reports",
    icon: BarChart3,
    gradient: "from-[#10b981] to-[#047857]",
    shadow: "shadow-[0_8px_20px_rgba(16,185,129,0.38)]",
    dotColor1: "bg-emerald-200/60",
    dotColor2: "bg-emerald-300/40",
  },
  {
    id: "unplanned-orders",
    title: "Unplanned Orders",
    subtitle: "Pending queues & scheduling backlog",
    tabName: "UNPLANNED ORDERS",
    category: "reports",
    icon: Clock,
    gradient: "from-[#0ea5e9] to-[#0284c7]",
    shadow: "shadow-[0_8px_20px_rgba(14,165,233,0.38)]",
    dotColor1: "bg-sky-200/60",
    dotColor2: "bg-sky-300/40",
  },
];

const SECTIONS = [
  {
    key: "forms",
    title: "Forms & Operations",
    subtitle: "Production allocation, scheduling backlog, and exports",
    badgeColor: "bg-orange-50 text-[#E0562C] border-orange-200",
    accentColor: "bg-[#E0562C]",
    icon: FileText,
  },
  {
    key: "reports",
    title: "Reports & Analytics",
    subtitle: "",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    accentColor: "bg-emerald-600",
    icon: BarChart3,
  },
];

export default function HomeDashboard() {
  const dispatch = useDispatch();
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "forms" | "reports"
  const [searchQuery, setSearchQuery] = useState("");

  const handleCardClick = (tabName) => {
    if (tabName) {
      dispatch(push({ name: tabName }));
    }
  };

  // Filter cards based on tab and search
  const filteredCards = useMemo(() => {
    return DASHBOARD_CARDS.filter((card) => {
      const matchesCategory =
        activeFilter === "all" || card.category === activeFilter;
      const matchesSearch =
        searchQuery === "" ||
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  // Counts for pills
  const counts = useMemo(() => {
    return {
      all: DASHBOARD_CARDS.length,
      forms: DASHBOARD_CARDS.filter((c) => c.category === "forms").length,
      reports: DASHBOARD_CARDS.filter((c) => c.category === "reports").length,
    };
  }, []);

  return (
    <div className="w-full h-[calc(100vh-85px)] overflow-y-auto bg-[#f8fafc] p-5 md:p-8 space-y-6">
      {/* ── Top Filter Bar & Search ────────────────────────────────────────── */}


      {/* ── Categorized Sections ───────────────────────────────────────────── */}
      {SECTIONS.map((section) => {
        // Filter cards belonging to this section
        const sectionCards = filteredCards.filter(
          (c) => c.category === section.key
        );

        // If filtering by another category or no search matches in this section, hide section
        if (
          (activeFilter !== "all" && activeFilter !== section.key) ||
          sectionCards.length === 0
        ) {
          return null;
        }

        const SectionIcon = section.icon;

        return (
          <div key={section.key} className="space-y-3.5">
            {/* Section Header */}
            <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                {/* <span
                  aria-hidden="true"
                  className={`h-5 w-1 shrink-0 rounded-full ${section.accentColor}`}
                /> */}
                <h2 className="truncate text-[12px] font-bold tracking-tight text-slate-800">
                  {section.title}
                </h2>
              </div>

              {section.subtitle && (
                <p className="hidden min-w-0 truncate text-xs text-slate-500 sm:block">
                  {section.subtitle}
                </p>
              )}
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
              {sectionCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.tabName)}
                    className="relative overflow-hidden bg-white rounded-[20px] px-5 py-4 border border-slate-200/70 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.09)] transition-all duration-200 cursor-pointer flex items-center gap-4 group select-none hover:-translate-y-0.5"
                  >
                    {/* Decorative subtle floating dots */}
                    <span
                      className={`absolute top-4 right-14 w-2 h-2 rounded-full ${card.dotColor1} pointer-events-none`}
                    />
                    <span
                      className={`absolute bottom-3.5 right-24 w-1.5 h-1.5 rounded-full ${card.dotColor2} pointer-events-none`}
                    />

                    {/* Squircle Icon Container */}
                    <div
                      className={`w-13 h-13 sm:w-13.5 sm:h-13.5 rounded-2xl bg-gradient-to-b ${card.gradient} flex items-center justify-center shrink-0 ${card.shadow} group-hover:scale-105 transition-transform duration-200`}
                    >
                      <Icon className="w-6 h-6 text-white stroke-[2.2]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-[14px] font-bold text-slate-800 tracking-tight leading-tight group-hover:text-[#E0562C] transition-colors truncate">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-snug line-clamp-1">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Empty State when search has no matches */}
      {filteredCards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 gap-2">
          <Search className="w-8 h-8 text-slate-300 stroke-1" />
          <p className="text-sm font-medium text-slate-600">
            No matching modules or reports found
          </p>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or switching category filters.
          </p>
        </div>
      )}
    </div>
  );
}
