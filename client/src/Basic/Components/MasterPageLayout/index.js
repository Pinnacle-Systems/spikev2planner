import React, { useCallback, useLayoutEffect, useRef, useState } from "react";

const MIN_HEIGHT = 320;

const PlusIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-4 w-4"
  >
    <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1Z" />
  </svg>
);

const MasterPageLayout = ({
  title,
  subtitle = null,
  addButtonLabel,
  onAdd,
  onKeyDown,
  children,
  className = "",
  titleClassName = "text-lg font-semibold leading-tight text-slate-900",
  headerActions = null,
}) => {
  const pageContainerRef = useRef(null);
  const frameRef = useRef(null);
  const [availableViewportHeight, setAvailableViewportHeight] = useState(null);

  const syncAvailableViewportHeight = useCallback(() => {
    if (typeof window === "undefined" || !pageContainerRef.current) return;

    const { top } = pageContainerRef.current.getBoundingClientRect();
    const nextHeight = Math.max(window.innerHeight - Math.max(top, 0), MIN_HEIGHT);

    setAvailableViewportHeight((current) =>
      current === nextHeight ? current : nextHeight
    );
  }, []);

  useLayoutEffect(() => {
    syncAvailableViewportHeight();

    if (typeof window === "undefined") return undefined;

    const scheduleSync = () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = window.requestAnimationFrame(syncAvailableViewportHeight);
    };

    window.addEventListener("resize", scheduleSync);

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleSync);
      if (pageContainerRef.current?.parentElement) {
        resizeObserver.observe(pageContainerRef.current.parentElement);
      }
      resizeObserver.observe(document.body);
    }

    return () => {
      window.removeEventListener("resize", scheduleSync);
      resizeObserver?.disconnect();
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [syncAvailableViewportHeight]);

  return (
    <div
      ref={pageContainerRef}
      onKeyDown={onKeyDown}
      className={`flex min-h-0 flex-col gap-3 bg-slate-50 pt-3 pb-4 ${className}`}
      style={
        availableViewportHeight
          ? { height: `${availableViewportHeight}px` }
          : undefined
      }
    >
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-1 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="h-8 w-1 shrink-0 rounded-full bg-[#E0562C]"
          />
          <div className="min-w-0">
            <h2 className={`truncate ${titleClassName}`}>{title}</h2>
            {subtitle && (
              <p className="truncate text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>

        {headerActions ? (
          <div className="flex flex-wrap items-center gap-3">{headerActions}</div>
        ) : (
          onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-2 rounded-md bg-[#E0562C] hover:bg-[#e0562cf2] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0562C] focus-visible:ring-offset-2 active:bg-indigo-800"
            >
              <PlusIcon />
              {addButtonLabel}
            </button>
          )
        )}
      </header>

      {/* Content panel */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {children}
      </main>
    </div>
  );
};

export default MasterPageLayout;