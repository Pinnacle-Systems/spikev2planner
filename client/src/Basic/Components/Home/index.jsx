import React from "react";
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import {
  Box,
  Calendar,
  CalendarDays,
  BarChart3,
  Clock,
  Layers,
  Building2,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";

// Dashboard cards designed in the exact style of the reference image
const DASHBOARD_CARDS = [

  {
    id: "capacity-planner",
    title: "Capacity Planner",
    subtitle: "Balance lines & factory allocation",
    tabName: "CAPASITY PLANNER",
    icon: Calendar,
    gradient: "from-[#6366f1] to-[#4338ca]",
    shadow: "shadow-[0_8px_20px_rgba(99,102,241,0.38)]",
    dotColor1: "bg-indigo-200/60",
    dotColor2: "bg-indigo-300/40",
  },
  {
    id: "planned-orders",
    title: "Planned Orders",
    subtitle: "Production progress & output reports",
    tabName: "PLANNED ORDERS",
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
    icon: Clock,
    gradient: "from-[#f59e0b] to-[#d97706]",
    shadow: "shadow-[0_8px_20px_rgba(245,158,11,0.38)]",
    dotColor1: "bg-amber-200/60",
    dotColor2: "bg-amber-300/40",
  },
  {
    id: "holiday-calendar",
    title: "Holiday Calendar",
    subtitle: "Factory shifts & non-working days",
    tabName: "HOLIDAYS",
    icon: CalendarDays,
    gradient: "from-[#ec4899] to-[#be185d]",
    shadow: "shadow-[0_8px_20px_rgba(236,72,153,0.38)]",
    dotColor1: "bg-pink-200/60",
    dotColor2: "bg-pink-300/40",
  },
  {
    id: "unit-master",
    title: "Unit Master",
    subtitle: "Configure plant units & line setups",
    tabName: "UNIT MASTER",
    icon: Layers,
    gradient: "from-[#8b5cf6] to-[#6d28d9]",
    shadow: "shadow-[0_8px_20px_rgba(139,92,246,0.38)]",
    dotColor1: "bg-purple-200/60",
    dotColor2: "bg-purple-300/40",
  },

];

export default function HomeDashboard() {
  const dispatch = useDispatch();

  const handleCardClick = (tabName) => {
    if (tabName) {
      dispatch(push({ name: tabName }));
    }
  };

  return (
    <div className="w-full h-[calc(100vh-85px)] overflow-y-auto bg-[#f8fafc] p-6 md:p-8">
      {/* Grid of Home Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {DASHBOARD_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.tabName)}
              className="relative overflow-hidden bg-white rounded-[22px] px-5 py-4 border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.09)] transition-all duration-200 cursor-pointer flex items-center gap-4 group select-none hover:-translate-y-0.5"
            >
              {/* Decorative subtle floating dots matching reference image */}
              <span
                className={`absolute top-4 right-14 w-2 h-2 rounded-full ${card.dotColor1} pointer-events-none`}
              ></span>
              <span
                className={`absolute bottom-3.5 right-24 w-1.5 h-1.5 rounded-full ${card.dotColor2} pointer-events-none`}
              ></span>

              {/* Left Squircle Icon Container */}
              <div
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b ${card.gradient} flex items-center justify-center shrink-0 ${card.shadow} group-hover:scale-105 transition-transform duration-200`}
              >
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.2]" />
              </div>

              {/* Right Content */}
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-[15px] font-bold text-slate-800 tracking-tight leading-tight group-hover:text-blue-600 transition-colors truncate">
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
}
