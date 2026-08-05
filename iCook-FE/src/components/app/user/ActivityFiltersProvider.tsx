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
import {
  DEFAULT_ACTIVITY_FILTERS,
  MY_ACTIVITY_KEYS,
  OTHERS_ACTIVITY_KEYS,
  readActivityFilters,
  writeActivityFilters,
  type ActivityFilterPrefs,
} from "./activityFilters";

type ActivityFiltersContextValue = {
  prefs: ActivityFilterPrefs;
  setPref: (key: keyof ActivityFilterPrefs, value: boolean) => void;
  setGroup: (
    keys: readonly (keyof ActivityFilterPrefs)[],
    value: boolean,
  ) => void;
  reset: () => void;
};

const ActivityFiltersContext =
  createContext<ActivityFiltersContextValue | null>(null);

export function ActivityFiltersProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<ActivityFilterPrefs>(
    DEFAULT_ACTIVITY_FILTERS,
  );

  useEffect(() => {
    setPrefs(readActivityFilters());
  }, []);

  const persist = useCallback((next: ActivityFilterPrefs) => {
    setPrefs(next);
    writeActivityFilters(next);
  }, []);

  const setPref = useCallback((key: keyof ActivityFilterPrefs, value: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      writeActivityFilters(next);
      return next;
    });
  }, []);

  const setGroup = useCallback(
    (keys: readonly (keyof ActivityFilterPrefs)[], value: boolean) => {
      setPrefs((prev) => {
        const next = { ...prev };
        for (const key of keys) next[key] = value;
        writeActivityFilters(next);
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    persist({ ...DEFAULT_ACTIVITY_FILTERS });
  }, [persist]);

  const value = useMemo(
    () => ({ prefs, setPref, setGroup, reset }),
    [prefs, setPref, setGroup, reset],
  );

  return (
    <ActivityFiltersContext.Provider value={value}>
      {children}
    </ActivityFiltersContext.Provider>
  );
}

export function useActivityFilters() {
  const ctx = useContext(ActivityFiltersContext);
  if (!ctx) {
    throw new Error(
      "useActivityFilters must be used within ActivityFiltersProvider",
    );
  }
  return ctx;
}

export { MY_ACTIVITY_KEYS, OTHERS_ACTIVITY_KEYS };
