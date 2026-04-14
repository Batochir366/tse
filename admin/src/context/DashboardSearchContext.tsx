"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type DashboardSearchContextValue = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
};

const DashboardSearchContext = createContext<DashboardSearchContextValue | null>(
  null
);

export function DashboardSearchProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQueryState] = useState("");

  useEffect(() => {
    setSearchQueryState("");
  }, [pathname]);

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryState(q);
  }, []);

  const value = useMemo(
    () => ({ searchQuery, setSearchQuery }),
    [searchQuery, setSearchQuery]
  );

  return (
    <DashboardSearchContext.Provider value={value}>
      {children}
    </DashboardSearchContext.Provider>
  );
}

export function useDashboardSearch(): DashboardSearchContextValue {
  const ctx = useContext(DashboardSearchContext);
  if (!ctx) {
    throw new Error("useDashboardSearch must be used within DashboardSearchProvider");
  }
  return ctx;
}
