import { createContext, useContext } from "react";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  isExpiringSoon,
  isExpired,
  STATUS_LABELS,
  STATUS_COLORS,
  AUDIT_ACTION_LABELS,
} from "../utils/helpers";

const DataContext = createContext(null);

const helpers = {
  formatCurrency,
  formatDate,
  formatDateTime,
  isExpiringSoon,
  isExpired,
  STATUS_LABELS,
  STATUS_COLORS,
  AUDIT_ACTION_LABELS,
};

export function DataProvider({ children }) {
  return <DataContext.Provider value={helpers}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}