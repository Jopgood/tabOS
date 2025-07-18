// packages/tabs/src/index.ts
export { TabManager } from "./tab-manager";

// Helper types for the package
export interface TabOrderOperation {
  type: "create" | "delete" | "reorder" | "insert";
  tabId?: string;
  position?: number;
  fromPosition?: number;
  toPosition?: number;
}

export interface TabManagerOptions {
  userId: string;
  autoRepair?: boolean; // Auto-repair ordering on conflicts
}
