"use client";

import { Search } from "lucide-react";
import { useDashboardSearch } from "../context/DashboardSearchContext";

type Props = { hideSearch?: boolean };

export default function Header({ hideSearch = false }: Props) {
  const { searchQuery, setSearchQuery } = useDashboardSearch();

  return (
    <header
      className="h-16 px-6 flex items-center justify-between shrink-0 sticky top-0 z-10"
      style={{
        background: "rgba(239,234,219,0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.6)",
      }}
    >
      <div className="flex items-center gap-4">
        {!hideSearch && (
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-2xl"
            style={{
              background: "#efeadb",
              boxShadow: `
      3px 3px 6px rgba(0,0,0,0.10),
      -3px -3px 6px rgba(255,255,255,0.6),

      /* INNER (pressed - илүү тод) */
      inset 2px 2px 4px rgba(0,0,0,0.12),
      inset -2px -2px 4px rgba(255,255,255,0.8)
    `,
              minWidth: 220,
            }}
          >
            <Search size={16} className="text-gray-500" />

            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Хайх..."
              className="bg-transparent outline-none text-sm w-62 placeholder-gray-400"
              style={{ color: "#000201" }}
              autoComplete="off"
            />
          </div>
        )}
      </div>
    </header>
  );
}
